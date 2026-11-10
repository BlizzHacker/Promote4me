/**
 * Promote4.me Social Media Commander - Express REST & MCP Routes
 * Mounts REST endpoints for web/ChatGPT and HTTP/SSE JSON-RPC endpoints for MCP agents.
 */
import { Router } from 'express';
import {
  listAccounts, saveAccount, deleteAccount,
  publishPostNow, schedulePost, getCalendar, cancelPost,
  getComments, replyComment,
  getMessages, sendMessage,
  listRules, saveRule, deleteRule,
  listCampaigns, createCampaign, toggleCampaign,
  getActivityLog, getTenantDefault
} from '../services/social-commander.js';
import { handleRpcRequest, TOOLS, MCP_SERVER_INFO, RESOURCES, PROMPTS } from '../mcp/commander-mcp.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../auth.js';

const router = Router();

// Middleware: Extract tenant and user if available, fallback gracefully
function resolveTenant(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const apiKey = req.headers['x-api-key'] || '';

  // 1. Bearer JWT
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      req.tenantId = req.user.tenant_id;
      return next();
    } catch {}
  }

  // 2. Custom header or query
  if (apiKey) {
    req.tenantId = apiKey.startsWith('tenant-') ? apiKey : getTenantDefault();
    return next();
  }

  // 3. Fallback to primary tenant in self-hosted setup
  req.tenantId = getTenantDefault(req.query.tenant_id || req.body?.tenant_id);
  next();
}

router.use(resolveTenant);

// ─── Model Context Protocol (MCP) Endpoints ───────────────────────────
// POST /api/commander/mcp - JSON-RPC 2.0 handler
router.post('/mcp', async (req, res) => {
  const body = req.body;
  if (!body) return res.status(400).json({ jsonrpc: '2.0', error: { code: -32600, message: 'Missing body' } });
  
  // Handle batch or single RPC
  if (Array.isArray(body)) {
    const responses = await Promise.all(body.map(r => handleRpcRequest(r, req.tenantId)));
    return res.json(responses.filter(r => r !== null));
  }

  const response = await handleRpcRequest(body, req.tenantId);
  if (response === null) return res.status(204).end();
  res.json(response);
});

// GET /api/commander/mcp - Discovery info
router.get('/mcp', (req, res) => {
  res.json({
    ok: true,
    server: MCP_SERVER_INFO,
    protocol: '2024-11-05',
    transport: ['http-jsonrpc', 'sse', 'stdio'],
    endpoint: '/api/commander/mcp',
    sse_endpoint: '/api/commander/mcp/sse',
    tools_count: TOOLS.length,
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    resources: RESOURCES,
    prompts: PROMPTS,
  });
});

// GET /api/commander/mcp/sse - Server-Sent Events stream for streaming MCP clients
router.get('/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send endpoint announcement
  const initEvent = {
    event: 'endpoint',
    data: '/api/commander/mcp',
  };
  res.write(`event: ${initEvent.event}\ndata: ${initEvent.data}\n\n`);

  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// ─── REST Endpoints ───────────────────────────────────────────────────
// System Status
router.get('/status', (req, res) => {
  const accounts = listAccounts(req.tenantId);
  const calendar = getCalendar(req.tenantId, { limit: 10 });
  const activity = getActivityLog(req.tenantId, { limit: 5 });
  res.json({
    ok: true,
    product: 'Promote4.me Social Media Commander',
    version: '4.0.0',
    tenant_id: req.tenantId,
    connected_accounts: accounts.length,
    accounts: accounts.map(a => ({ platform: a.platform, username: a.username, status: a.status, followers: a.follower_count })),
    scheduled_posts: calendar.filter(p => p.status === 'scheduled').length,
    recent_activity_count: activity.length,
  });
});

// Accounts
router.get('/accounts', (req, res) => {
  res.json({ ok: true, accounts: listAccounts(req.tenantId) });
});

router.post('/accounts', (req, res) => {
  try {
    const acc = saveAccount({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, account: acc });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.delete('/accounts/:id', (req, res) => {
  res.json(deleteAccount(req.params.id, req.tenantId));
});

// Posts & Scheduling
router.post('/post/now', async (req, res) => {
  try {
    const result = await publishPostNow({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.post('/post/schedule', (req, res) => {
  try {
    const result = schedulePost({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.get('/calendar', (req, res) => {
  const posts = getCalendar(req.tenantId, req.query);
  res.json({ ok: true, count: posts.length, posts });
});

router.delete('/post/:id', (req, res) => {
  res.json(cancelPost(req.params.id, req.tenantId));
});

// Comments & Replies
router.get('/comments', (req, res) => {
  res.json({ ok: true, comments: getComments(req.tenantId, req.query) });
});

router.post('/comments/reply', async (req, res) => {
  try {
    const result = await replyComment({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// Direct Messages
router.get('/messages', (req, res) => {
  res.json({ ok: true, messages: getMessages(req.tenantId, req.query) });
});

router.post('/messages/send', (req, res) => {
  try {
    const result = sendMessage({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// Automated Rules
router.get('/rules', (req, res) => {
  res.json({ ok: true, rules: listRules(req.tenantId, req.query) });
});

router.post('/rules', (req, res) => {
  try {
    const rule = saveRule({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, rule });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.delete('/rules/:id', (req, res) => {
  res.json(deleteRule(req.params.id, req.tenantId));
});

// Campaigns
router.get('/campaigns', (req, res) => {
  res.json({ ok: true, campaigns: listCampaigns(req.tenantId, req.query) });
});

router.post('/campaigns', (req, res) => {
  try {
    const campaign = createCampaign({ tenantId: req.tenantId, ...req.body });
    res.json({ ok: true, campaign });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.post('/campaigns/:id/toggle', (req, res) => {
  const { status = 'active' } = req.body || {};
  res.json(toggleCampaign(req.params.id, req.tenantId, status));
});

// Activity Audit Log
router.get('/activity', (req, res) => {
  res.json({ ok: true, activity: getActivityLog(req.tenantId, req.query) });
});

// Limits & Quotas
router.get('/limits', (req, res) => {
  const accounts = listAccounts(req.tenantId);
  res.json({
    ok: true,
    safe_mode: true,
    jitter_enabled: true,
    accounts: accounts.map(a => ({
      id: a.id,
      platform: a.platform,
      username: a.username,
      status: a.status,
      usage: {
        posts: `${a.today_posts}/${a.daily_post_limit}`,
        comments: `${a.today_comments}/${a.daily_comment_limit}`,
        dms: `${a.today_dms}/${a.daily_dm_limit}`,
        likes: `${a.today_likes}/${a.daily_like_limit}`,
        follows: `${a.today_follows}/${a.daily_follow_limit}`,
      },
    })),
  });
});

export default router;
