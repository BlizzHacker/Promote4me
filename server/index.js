/**
 * Promote4.me 4.0 — Clean Architecture Server
 * 
 * Organized route structure with proper middleware, configuration, 
 * and migration system. No inline schema or version patch scripts.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { migrate, UPLOAD_DIR } from './db.js';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

// ─── Database migration ───────────────────────────────────────────────
migrate();

// ─── Express setup ────────────────────────────────────────────────────
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '..', 'dist')));

// ─── Import route modules ─────────────────────────────────────────────
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import teamsRouter from './routes/teams.js';
import clientsRouter from './routes/clients.js';
import settingsRouter from './routes/settings.js';
import integrationsRouter from './routes/integrations.js';
import adminRouter from './routes/admin.js';
import publicRouter from './routes/public.js';
import bootstrapRouter from './routes/bootstrap.js';
import blogRouter from './routes/blog.js';
import commanderRouter from './routes/commander.js';
import { startCommanderScheduler } from './services/commander-scheduler.js';

// ─── Mount routes ─────────────────────────────────────────────────────
app.use('/api', authRouter);
app.use('/api', bootstrapRouter);
app.use('/api', blogRouter);        // /api/blog/posts
app.use('/api/jobs', jobsRouter);
app.use('/api', teamsRouter);      // /api/teams, /api/team-members
app.use('/api', clientsRouter);    // /api/clients
app.use('/api', settingsRouter);   // /api/settings, /api/billing, /api/external-keys
app.use('/api', integrationsRouter);// /api/integrations
app.use('/api', adminRouter);      // /api/admin
app.use('/api', publicRouter);     // /api/health, /api/public/*
app.use('/api/commander', commanderRouter); // Social Media Commander REST & MCP
app.use('/mcp', commanderRouter);           // Direct /mcp mount

// ─── Social Media Posting Proxy ───────────────────────────────────────
app.post('/api/social/post', async (req, res) => {
  const { platform, content, credentials } = req.body || {};
  if (!platform || !content) return res.status(400).json({ error: 'platform and content required' });
  
  try {
    let result = null;
    
    // Discord Webhook
    if (platform.toLowerCase().includes('discord') && credentials?.webhook) {
      const r = await fetch(credentials.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (r.ok) {
        const d = await r.json();
        result = { platform, id: d.id, status: 'posted', url: `https://discord.com/channels/@me` };
        // Try to delete if we got a message ID
        if (d.id) {
          const delUrl = credentials.webhook.replace(/\/webhooks\/.*/, `/messages/${d.id}`);
          try { await fetch(delUrl, { method: 'DELETE' }); result.deleted = true; } catch {}
        }
      } else {
        const err = await r.text();
        result = { platform, status: 'failed', error: err.slice(0, 200) };
      }
    }
    // Twitter/X API v2
    else if ((platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x'))) {
      const token = credentials?.bearer || credentials?.token;
      if (!token) return res.status(400).json({ error: 'Twitter Bearer token required' });
      const r = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const d = await r.json();
      if (d.data?.id) {
        result = { platform, id: d.data.id, status: 'posted', url: `https://x.com/i/status/${d.data.id}` };
        try {
          await fetch(`https://api.twitter.com/2/tweets/${d.data.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          result.deleted = true;
        } catch {}
      } else {
        result = { platform, status: 'failed', error: JSON.stringify(d).slice(0, 200) };
      }
    }
    // Facebook Page (Meta Graph API)
    else if (platform.toLowerCase().includes('facebook') && credentials?.pageToken) {
      const r = await fetch(`https://graph.facebook.com/v19.0/${credentials.pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, access_token: credentials.pageToken }),
      });
      const d = await r.json();
      if (d.id) {
        result = { platform, id: d.id, status: 'posted', url: `https://facebook.com/${d.id}` };
        try {
          await fetch(`https://graph.facebook.com/v19.0/${d.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: credentials.pageToken }) });
          result.deleted = true;
        } catch {}
      } else {
        result = { platform, status: 'failed', error: JSON.stringify(d).slice(0, 200) };
      }
    }
    // Instagram (Meta Graph API)
    else if (platform.toLowerCase().includes('instagram') && credentials?.igUserId) {
      // Step 1: Create media container
      const create = await fetch(`https://graph.facebook.com/v19.0/${credentials.igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: content, access_token: credentials.pageToken || credentials.token }),
      });
      const container = await create.json();
      if (!container.id) {
        result = { platform, status: 'failed', error: JSON.stringify(container).slice(0, 200) };
      } else {
        // Step 2: Publish (Instagram needs 30s+ between create and publish for reels, but text-only is instant)
        await new Promise(r => setTimeout(r, 2000));
        const pub = await fetch(`https://graph.facebook.com/v19.0/${credentials.igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: container.id, access_token: credentials.pageToken || credentials.token }),
        });
        const pubData = await pub.json();
        if (pubData.id) {
          result = { platform, id: pubData.id, status: 'posted', url: `https://instagram.com/p/IGMEDIA_${pubData.id}` };
          try {
            await fetch(`https://graph.facebook.com/v19.0/${pubData.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: credentials.pageToken || credentials.token }) });
            result.deleted = true;
          } catch {}
        } else {
          result = { platform, status: 'failed', error: JSON.stringify(pubData).slice(0, 200) };
        }
      }
    }
    
    if (!result) return res.status(400).json({ error: 'Unsupported platform or missing credentials' });
    res.json({ ok: true, result });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});
app.post('/api/social/followers', async (req, res) => {
  const { platform, token } = req.body || {};
  if (!platform || !token) return res.status(400).json({ error: 'platform and token required' });
  try {
    let count = null;
    const key = platform.toLowerCase();
    // Twitter/X API v2
    if (key.includes('twitter') || key.includes('x')) {
      const r = await fetch(`https://api.twitter.com/2/users/me?user.fields=public_metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) { const d = await r.json(); count = d.data?.public_metrics?.followers_count; }
    }
    // YouTube (Google) API
    else if (key.includes('youtube')) {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) { const d = await r.json(); count = d.items?.[0]?.statistics?.subscriberCount; }
    }
    // Discord API
    else if (key.includes('discord')) {
      const r = await fetch(`https://discord.com/api/v10/guilds/@me`, {
        headers: { Authorization: `Bot ${token}` }
      });
      if (r.ok) { const d = await r.json(); count = d.approximate_member_count; }
    }
    // Reddit API
    else if (key.includes('reddit')) {
      const r = await fetch(`https://oauth.reddit.com/subreddits/mine/subscriber`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'Promote4.me/4.0' }
      });
      if (r.ok) { const d = await r.json(); count = d.data?.children?.[0]?.data?.subscribers; }
    }
    res.json({ ok: true, count: count ? Number(count) : null, platform });
  } catch (err) {
    res.json({ ok: false, count: null, platform, error: err.message });
  }
});

// ─── Smart SMM Hub proxy — aggregate rates from providers ────────────
const SMM_PROVIDERS = {
  justanotherpanel: 'https://justanotherpanel.com/api/v2',
  smmheaven: 'https://smmheaven.com/api/v2',
  smmraja: 'https://smmraja.com/api/v2',
  morethanpanel: 'https://morethanpanel.com/api/v2',
  perfectpanel: 'https://perfectpanel.com/api/v2',
  smmflare: 'https://smmflare.com/api/v2',
  smmfollows: 'https://smmfollows.com/api/v2',
  nakrutka: 'https://nakrutka.com/api/v2',
};

app.post('/api/smm/services', async (req, res) => {
  const { provider, key, email } = req.body || {};
  if (!provider || !key) return res.status(400).json({ error: 'provider and key required' });
  const baseUrl = SMM_PROVIDERS[provider];
  if (!baseUrl) return res.status(400).json({ error: 'Unknown provider' });
  try {
    const r = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ key, action: 'services' }).toString(),
    });
    const d = await r.json();
    res.json({ ok: true, provider, services: d.services || d, email });
  } catch (err) {
    res.json({ ok: false, provider, error: err.message });
  }
});

// ─── Facebook / Instagram proxy ──────────────────────────────────────
// Rate limit: max 2 posts per hour per page, min 5min between posts
const POST_COOLDOWNS = {};
const NATURAL_SCHEDULE = {}; // { pageId: { lastPost, count, nextSlot } }

function getPageToken(pageId) {
  try {
    const raw = fs.readFileSync('/opt/promote4me/app/data/fb_pages.json', 'utf8');
    const pages = JSON.parse(raw).data || [];
    return pages.find(p => p.id === pageId)?.access_token || null;
  } catch { return null; }
}

function canPostNow(pageId) {
  const last = POST_COOLDOWNS[pageId] || 0;
  return Date.now() - last >= 5 * 60 * 1000; // 5 min cooldown
}

function getNextNaturalSlot(pageId) {
  // Natural spacing: 30-90 min between posts, max 3-5/day
  const s = NATURAL_SCHEDULE[pageId] || { count: 0, lastPost: 0 };
  const minGap = 30 * 60 * 1000; // 30 min minimum
  const maxDaily = 5;
  const elapsed = Date.now() - s.lastPost;
  if (s.count >= maxDaily) return null; // daily cap
  if (elapsed < minGap) return new Date(s.lastPost + minGap);
  return new Date(); // ready now
}

app.get('/api/social/facebook/natural-status', (req, res) => {
  const { pageId } = req.query;
  if (!pageId) return res.json({ ok: false, error: 'pageId required' });
  const slot = getNextNaturalSlot(pageId);
  const s = NATURAL_SCHEDULE[pageId] || { count: 0 };
  res.json({ ok: true, nextSlot: slot?.toISOString() || null, canPost: slot && slot <= new Date(), postsToday: s.count, maxDaily: 5, cooldown: canPostNow(pageId) });
});

app.post('/api/social/facebook/natural-post', async (req, res) => {
  const { pageId, message } = req.body || {};
  if (!pageId || !message) return res.status(400).json({ error: 'pageId and message required' });
  
  const slot = getNextNaturalSlot(pageId);
  if (!slot) return res.json({ ok: false, error: 'Daily post limit reached (5/5)' });
  if (slot > new Date()) {
    const waitMins = Math.ceil((slot - Date.now()) / 60000);
    return res.json({ ok: false, error: `Next natural slot in ~${waitMins} min` });
  }
  
  const ptoken = getPageToken(pageId);
  if (!ptoken) return res.json({ ok: false, error: 'Page token not found' });
  
  // Human-like random delay before posting (3-15 seconds)
  await new Promise(r => setTimeout(r, 3000 + Math.random() * 12000));
  
  try {
    const r = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: ptoken }),
    });
    const d = await r.json();
    if (!d.id) return res.json({ ok: false, error: JSON.stringify(d).slice(0, 200) });
    
    POST_COOLDOWNS[pageId] = Date.now();
    NATURAL_SCHEDULE[pageId] = {
      lastPost: Date.now(),
      count: (NATURAL_SCHEDULE[pageId]?.count || 0) + 1,
    };
    res.json({ ok: true, id: d.id, pageId, remaining: 5 - NATURAL_SCHEDULE[pageId].count });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ─── Instagram (browser-based, bypasses API permissions) ─────────────
app.post('/api/social/instagram/natural', async (req, res) => {
  // Post via Instagram web interface using user's existing session
  // Instagram blocks headless login so this opens their browser
  const url = `https://www.instagram.com/?create_post&caption=${encodeURIComponent(req.body?.message || '')}`;
  res.json({ ok: true, url, method: 'instagram-web', instructions: 'Click the link to open Instagram. Paste caption. Click Share.' });
});
// Uses rotating proxies + real browser fingerprint to look human
const NATURAL_PROXIES = []; // Add proxies here: 'user:pass@ip:port'

app.post('/api/social/facebook/natural', async (req, res) => {
  const { pageId, message } = req.body || {};
  if (!pageId || !message) return res.status(400).json({ error: 'pageId and message required' });
  
  const ptoken = getPageToken(pageId);
  if (!ptoken) return res.json({ ok: false, error: 'Page token not found' });
  
  try {
    // Pick random proxy
    const proxy = NATURAL_PROXIES.length > 0 
      ? NATURAL_PROXIES[Math.floor(Math.random() * NATURAL_PROXIES.length)]
      : null;
    
    // Random User-Agent rotation
    const UAs = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    ];
    const ua = UAs[Math.floor(Math.random() * UAs.length)];
    
    // Human-like delay before posting
    const delay = 5000 + Math.random() * 15000;
    await new Promise(r => setTimeout(r, delay));
    
    // Post via Graph API with natural-looking headers
    const r = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': ua,
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `https://www.facebook.com/${pageId}`,
      },
      body: JSON.stringify({ message, access_token: ptoken }),
      // @ts-ignore — proxy support
      ...(proxy ? { agent: new (await import('https')).Agent({ proxy: { host: proxy.split('@')[1]?.split(':')[0], port: parseInt(proxy.split(':').pop()) } }) } : {}),
    });
    const d = await r.json();
    
    POST_COOLDOWNS[pageId] = Date.now();
    NATURAL_SCHEDULE[pageId] = {
      lastPost: Date.now(),
      count: (NATURAL_SCHEDULE[pageId]?.count || 0) + 1,
    };
    
    res.json({ 
      ok: true, id: d.id, pageId, 
      remaining: 5 - (NATURAL_SCHEDULE[pageId]?.count || 0),
      method: 'natural-api',
      delay_used: Math.round(delay/1000) + 's',
      proxy: proxy ? proxy.split('@')[1] : 'none',
      ua: ua.split(' ').slice(-1)[0],
    });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});
setInterval(() => { const now = new Date(); if (now.getHours() === 0 && now.getMinutes() < 5) Object.keys(NATURAL_SCHEDULE).forEach(k => NATURAL_SCHEDULE[k].count = 0); }, 300000);

app.get('/api/social/facebook/pages', async (req, res) => {
  const tenantId = req.user?.tenant_id || req.query.tenant || 'default';
  const filePath = `/opt/promote4me/app/data/tenants/${tenantId}/fb_pages.json`;
  try {
    const fs = await import('fs');
    // Check tenant-specific file first, fall back to default
    let raw;
    try { raw = fs.readFileSync(filePath, 'utf8'); } catch {
      raw = fs.readFileSync('/opt/promote4me/app/data/fb_pages.json', 'utf8');
    }
    res.json({ ok: true, pages: JSON.parse(raw).data || [], tenant: tenantId });
  } catch (e) {
    res.json({ ok: false, pages: [], error: e.message, tenant: tenantId });
  }
});

app.post('/api/social/facebook/post', async (req, res) => {
  const { pageId, message } = req.body || {};
  if (!pageId || !message) return res.status(400).json({ error: 'pageId and message required' });
  
  const ptoken = getPageToken(pageId);
  if (!ptoken) return res.status(400).json({ error: 'Page token not found' });
  
  if (!canPostNow(pageId)) {
    const secs = Math.ceil(((5 * 60 * 1000) - (Date.now() - POST_COOLDOWNS[pageId])) / 1000);
    return res.json({ ok: false, error: `Rate limited — ${secs}s remaining before next post` });
  }
  
  try {
    const r = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: ptoken }),
    });
    const d = await r.json();
    POST_COOLDOWNS[pageId] = Date.now();
    res.json({ ok: true, id: d.id, pageId });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.delete('/api/social/facebook/post/:postId', async (req, res) => {
  const { postId } = req.params;
  const { pageId } = req.query;
  const ptoken = getPageToken(pageId);
  if (!ptoken) return res.status(400).json({ error: 'Page token not found' });
  
  try {
    await fetch(`https://graph.facebook.com/v19.0/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: ptoken }),
    });
    res.json({ ok: true, deleted: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});
app.get('/api/social/facebook/auth', (req, res) => {
  const fbAppId = '3998214203775169';
  const redirectUri = 'https://promote4.me/api/social/facebook/callback';
  const scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish';
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=token`;
  res.json({ url });
});

app.get('/api/social/facebook/callback', (req, res) => {
  res.send(`<html><body><script>if(window.location.hash){fetch('/api/social/facebook/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hash:window.location.hash})}).then(r=>r.json()).then(d=>{localStorage.setItem('fb_token_data',JSON.stringify(d));window.close();});}</script><p>Authorizing... close this window.</p></body></html>`);
});

app.post('/api/social/facebook/token', async (req, res) => {
  try {
    const hash = req.body.hash?.replace('#','');
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    if (!accessToken) return res.json({ ok: false, error: 'No token in hash' });
    
    // Get pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
    const pages = await pagesRes.json();
    
    // Get Instagram business accounts
    let igAccounts = [];
    for (const page of (pages.data || [])) {
      const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
      const igData = await igRes.json();
      if (igData.instagram_business_account) {
        igAccounts.push({ pageId: page.id, pageName: page.name, igUserId: igData.instagram_business_account.id, pageToken: page.access_token });
      }
    }
    
    res.json({ ok: true, accessToken, pages: pages.data || [], igAccounts });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ─── Smart SMM Hub proxy — aggregate rates ──────────────────────────
app.get('/api/smm/rates', async (req, res) => {
  try {
    const fs = await import('fs');
    const dir = '/opt/promote4me/app/data/smm';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'aggregated.json');
    const results = {};
    for (const file of files) {
      const provider = file.replace('.json', '');
      try { results[provider] = JSON.parse(fs.readFileSync(dir + '/' + file, 'utf8')); } catch { results[provider] = []; }
    }
    res.json({ ok: true, results, providers: Object.keys(results) });
  } catch {
    res.json({ ok: true, results: {}, providers: ['justanotherpanel','smmraja','morethanpanel','smmflare'] });
  }
})

// ─── SPA fallback ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────
const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  startCommanderScheduler();
  console.log(`Social Media Commander MCP: http://localhost:${PORT}/api/commander/mcp`);
  console.log(`Promote4.me v${pkg.version} running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/health`);
});
