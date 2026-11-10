import { Router } from 'express';
import { nanoid } from 'nanoid';
import { row, all, run, now } from '../db.js';
import { hashPassword, verifyPassword, signUser, getCurrentUser, publicId } from '../auth.js';
import {
  tenantId,
  isDemoAccount,
  tokenHash,
  audit,
  seedDemoForTenant,
  updateTenantActivity,
} from '../utils.js';
import { roleRank } from '../constants.js';
import { APP_URL, AUTHENTIK_URL, AUTHENTIK_CLIENT_ID } from '../constants.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── Authentik OIDC SSO ──────────────────────────────────────────────
const AUTHENTIK_REDIRECT = `${APP_URL}/api/auth/authentik/callback`;
import crypto from 'crypto';

function pkceChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// GET /api/auth/authentik/login — redirect to Authentik
router.get('/auth/authentik/login', (req, res) => {
  const state = nanoid(32);
  const codeVerifier = nanoid(64);
  const codeChallenge = pkceChallenge(codeVerifier);
  // Store code_verifier in a short-lived cookie
  res.cookie('pkce_verifier', codeVerifier, { httpOnly: true, maxAge: 5 * 60 * 1000, sameSite: 'lax' });
  const url = `${AUTHENTIK_URL}/application/o/authorize/?` +
    `client_id=${encodeURIComponent(AUTHENTIK_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(AUTHENTIK_REDIRECT)}` +
    `&response_type=code&scope=openid+profile+email&state=${state}` +
    `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  res.json({ url, state });
});

// GET /api/auth/authentik/callback — handle OIDC callback
router.get('/auth/authentik/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code.' });
  const codeVerifier = req.cookies?.pkce_verifier || '';
  
  try {
    // Exchange code for token
    const params = new URLSearchParams({
      client_id: AUTHENTIK_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: AUTHENTIK_REDIRECT,
    });
    if (codeVerifier) params.append('code_verifier', codeVerifier);
    
    const tokenRes = await fetch(`${AUTHENTIK_URL}/application/o/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token: ' + JSON.stringify(tokenData).slice(0,200));
    
    // Decode id_token JWT to get user claims (skip userinfo — returns empty)
    let oidcUser = {};
    if (tokenData.id_token) {
      const payload = tokenData.id_token.split('.')[1];
      oidcUser = JSON.parse(Buffer.from(payload, 'base64url').toString());
    }
    // Fallback: try userinfo
    if (!oidcUser.sub) {
      try {
        const userRes = await fetch(`${AUTHENTIK_URL}/application/o/userinfo/`, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        oidcUser = await userRes.json();
      } catch {}
    }
    console.log('Authentik userinfo:', JSON.stringify(oidcUser).slice(0,300));
    const email = oidcUser.email || oidcUser.preferred_username || '';
    const name = oidcUser.name || oidcUser.preferred_username || email;
    const sub = oidcUser.sub || email;
    if (!email && !sub) throw new Error('No email or sub from userinfo: ' + JSON.stringify(oidcUser).slice(0,100));
    
    // Find or create user
    let user = row('SELECT * FROM users WHERE email = ? OR external_subject = ?', [email, sub]);
    if (!user) {
      const tid = publicId('tenant');
      const uid = publicId('user');
      const username = (email || sub).split('@')[0] || 'user';
      run('INSERT INTO tenants (id, name, plan, billing_email, status, last_active_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [tid, name || 'User', 'pro', email, 'active', now(), now()]);
      run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, status, auth_provider, external_subject, last_login_at, last_active_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uid, tid, username, email, '', 'admin', name || username, 'active', 'authentik', sub, now(), now(), now()]);
      seedDemoForTenant(tid, uid, name || username);
      user = row('SELECT * FROM users WHERE id = ?', [uid]);
    } else {
      run('UPDATE users SET last_login_at=?, last_active_at=?, auth_provider=?, external_subject=? WHERE id=?',
        [now(), now(), 'authentik', sub, user.id]);
      updateTenantActivity(user.tenant_id);
    }
    
    const token = signUser(user);
    res.redirect(`${APP_URL}/?token=${token}&user=${encodeURIComponent(JSON.stringify(getCurrentUser(user.id)))}`);
  } catch (err) {
    res.status(500).json({ error: 'Authentik SSO failed: ' + err.message });
  }
});

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  const { companyName, fullName, email, username, password, plan = 'free', role = 'admin' } = req.body || {};
  if (!companyName || !fullName || !email || !username || !password) {
    return res.status(400).json({ error: 'Company, name, email, username, and password are required.' });
  }
  if (row('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])) {
    return res.status(409).json({ error: 'Username or email already exists.' });
  }
  const tid = publicId('tenant');
  const uid = publicId('user');
  const deleteAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  run('INSERT INTO tenants (id, name, plan, billing_email, status, last_active_at, delete_after_inactive_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tid, companyName, plan, email, 'active', now(), deleteAt, now()]);
  run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, status, email_verified_at, created_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uid, tid, username, email, await hashPassword(password), roleRank[role] ? role : 'admin', fullName, 'active', null, now(), now()]);
  seedDemoForTenant(tid, uid, companyName);
  const verifyToken = nanoid(32);
  run('INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
    [publicId('emailtok'), uid, tokenHash(verifyToken), new Date(Date.now() + 48 * 3600 * 1000).toISOString(), now()]);
  const user = row('SELECT * FROM users WHERE id = ?', [uid]);
  audit({ headers: {}, ip: '' }, 'account_registered', { tenant_id: tid, user_id: uid, plan });
  res.json({
    token: signUser(user),
    user: getCurrentUser(uid),
    verifyUrl: `${APP_URL}/api/auth/verify-email?token=${verifyToken}`,
    message: 'Account created. Demo workspace is ready. Email verification URL returned for local email setup.'
  });
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = row('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
  if (!user || !(await verifyPassword(password || '', user.password_hash))) {
    return res.status(401).json({ error: 'Invalid login' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account disabled' });
  }
  run('UPDATE users SET last_login_at=?, last_active_at=? WHERE id=?', [now(), now(), user.id]);
  updateTenantActivity(user.tenant_id);
  audit({ ...req, user }, 'login_success');
  res.json({ token: signUser(user), user: getCurrentUser(user.id) });
});

// POST /api/auth/request-reset
router.post('/auth/request-reset', async (req, res) => {
  const user = row('SELECT * FROM users WHERE email = ? OR username = ?', [req.body?.email || '', req.body?.email || '']);
  if (user) {
    const token = nanoid(40);
    run('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [publicId('resettok'), user.id, tokenHash(token), new Date(Date.now() + 3600 * 1000).toISOString(), now()]);
    return res.json({
      ok: true,
      resetUrl: `${APP_URL}/reset-password?token=${token}`,
      message: 'Reset link generated. Configure SMTP to send this automatically.'
    });
  }
  res.json({ ok: true, message: 'If the account exists, a reset link was generated.' });
});

// POST /api/auth/reset-password
router.post('/auth/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  const found = all('SELECT * FROM password_reset_tokens WHERE used_at IS NULL').find(
    (t) => t.token_hash === tokenHash(token || '') && new Date(t.expires_at) > new Date()
  );
  if (!found) return res.status(400).json({ error: 'Invalid or expired reset token.' });
  const target = row('SELECT * FROM users WHERE id=?', [found.user_id]);
  if (isDemoAccount(target)) return res.status(403).json({ error: 'Demo accounts cannot reset passwords.' });
  run('UPDATE users SET password_hash=?, status=? WHERE id=?', [await hashPassword(password), 'active', found.user_id]);
  run('UPDATE password_reset_tokens SET used_at=? WHERE id=?', [now(), found.id]);
  res.json({ ok: true });
});

// GET /api/auth/verify-email
router.get('/auth/verify-email', (req, res) => {
  const found = all('SELECT * FROM email_verification_tokens WHERE used_at IS NULL').find(
    (t) => t.token_hash === tokenHash(req.query.token || '') && new Date(t.expires_at) > new Date()
  );
  if (!found) return res.status(400).send('Invalid or expired verification token.');
  run('UPDATE users SET email_verified_at=? WHERE id=?', [now(), found.user_id]);
  run('UPDATE email_verification_tokens SET used_at=? WHERE id=?', [now(), found.id]);
  res.send('Email verified. You can return to Promote4.me.');
});

// GET /api/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: getCurrentUser(req.user.id) });
});

// GET /api/auth/authentik/url
router.get('/auth/authentik/url', (req, res) => {
  const redirectUri = `${APP_URL}/api/auth/authentik/callback`;
  const url = `${AUTHENTIK_URL}/application/o/authorize/?client_id=${encodeURIComponent(AUTHENTIK_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
  res.json({ url });
});

// GET /api/auth/authentik/callback
router.get('/auth/authentik/callback', (req, res) => {
  res.redirect(`/?authentik=configure&code=${encodeURIComponent(req.query.code || '')}`);
});

// POST /api/auth/magic-link — passwordless email login
router.post('/auth/magic-link', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required.' });
  const user = row('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.json({ ok: true, message: 'If the account exists, a login code was generated.' });
  const code = nanoid(8);
  const codeHash = tokenHash(code);
  run('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
    [publicId('mlink'), user.id, codeHash, new Date(Date.now() + 15*60*1000).toISOString(), now()]);
  res.json({ ok: true, code, message: 'Login code generated. Use GET /api/auth/magic-link/verify?code=CODE to exchange for token.', 
    verifyUrl: `${APP_URL}/api/auth/magic-link/verify?code=${code}` });
});

// GET /api/auth/magic-link/verify — verify code and return auth token
router.get('/auth/magic-link/verify', (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code required.' });
  const found = all('SELECT * FROM password_reset_tokens WHERE used_at IS NULL').find(
    (t) => t.token_hash === tokenHash(code) && new Date(t.expires_at) > new Date()
  );
  if (!found) return res.status(400).json({ error: 'Invalid or expired code.' });
  run('UPDATE password_reset_tokens SET used_at=? WHERE id=?', [now(), found.id]);
  const user = row('SELECT * FROM users WHERE id=?', [found.user_id]);
  run('UPDATE users SET last_login_at=?, last_active_at=? WHERE id=?', [now(), now(), user.id]);
  updateTenantActivity(user.tenant_id);
  res.json({ token: signUser(user), user: getCurrentUser(user.id), message: 'Logged in via magic link.' });
});

export default router;
