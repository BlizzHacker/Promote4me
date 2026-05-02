import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { migrate, row, all, run, now, UPLOAD_DIR } from './db.js';
import { hashPassword, verifyPassword, signUser, requireAuth, requireAdmin, getCurrentUser, publicId } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const APP_URL = process.env.APP_URL || 'https://promote4.me';
const AUTHENTIK_URL = process.env.AUTHENTIK_URL || 'https://authentik.moveweight.com';
const AUTHENTIK_CLIENT_ID = process.env.AUTHENTIK_CLIENT_ID || 'promote4me';

migrate();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '..', 'dist')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${nanoid(8)}${path.extname(file.originalname || '.jpg')}`),
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

const roleRank = { user: 1, member: 2, manager: 3, admin: 4, super_admin: 5 };
const ownerSuperAdminIds = new Set(['user-super-moveweight']);
const ownerSuperAdminEmails = new Set(['me@moveweight.com', 'wadeivy11@gmail.com']);
const roleCatalog = [
  { id: 'super_admin', label: 'Product Super Admin', description: 'Promote4.me owner only. Controls platform-wide settings and other tenants.' },
  { id: 'admin', label: 'Customer Admin', description: 'Paying customer / company owner. Controls their workspace, teams, jobs, billing, and integrations.' },
  { id: 'manager', label: 'Manager / Lead Tech / Dispatcher', description: 'Can manage jobs, clients, team members, proof review, and daily operations.' },
  { id: 'member', label: 'Field Member', description: 'Technician, driver, flyer team member, contractor, or promoter who submits proof.' },
  { id: 'user', label: 'Client / Customer Viewer', description: 'Can view assigned jobs, customer proof, and order tracking.' },
];
const fieldRoleCatalog = [
  'Lead Tech',
  'Dispatcher',
  'Route Manager',
  'Technician',
  'Plumber',
  'Electrician',
  'Delivery Driver',
  'Flyer Team Member',
  'Promoter',
  'Contractor',
  'Customer Service',
  'Client Viewer'
];
const deliveryServices = [
  'Promote4.me Direct',
  'Uber Eats',
  'DoorDash',
  'Instacart',
  'Grubhub',
  'Postmates',
  'Walmart Spark',
  'Amazon Flex',
  'Roadie',
  'Shipt',
  'Custom Courier'
];
function isOwnerSuperAdmin(user) {
  return user?.role === 'super_admin' && (ownerSuperAdminIds.has(user.id) || ownerSuperAdminEmails.has(user.email));
}
function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (quote && c === '"' && n === '"') { cell += '"'; i++; continue; }
    if (c === '"') { quote = !quote; continue; }
    if (!quote && c === ',') { row.push(cell); cell = ''; continue; }
    if (!quote && (c === '\n' || c === '\r')) {
      if (c === '\r' && n === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(x => x.trim())) rows.push(row);
      row = [];
      continue;
    }
    cell += c;
  }
  row.push(cell);
  if (row.some(x => x.trim())) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift().map(h => h.trim().toLowerCase().replaceAll(' ', '_'));
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}
const publicPlans = [
  { id: 'free', name: 'Free Launch', price: '$0', jobs: 25, users: 3, proof: 'Basic GPS/photo proof', cta: 'Start free' },
  { id: 'starter', name: 'Starter', price: '$19/mo', jobs: 250, users: 10, proof: 'GPS scoring, uploads, teams', cta: 'Upgrade' },
  { id: 'pro', name: 'Pro', price: '$49/mo', jobs: 1500, users: 50, proof: 'Shopify, WooCommerce, reports', cta: 'Go Pro' },
  { id: 'agency', name: 'Agency', price: '$149/mo', jobs: 10000, users: 250, proof: 'Multi-team, priority support', cta: 'Scale' },
];
const paymentProviders = ['stripe', 'paypal', 'square', 'venmo', 'cashapp'];
const mapProviders = [
  { id: 'openstreetmap', name: 'OpenStreetMap', apiKeyRequired: false },
  { id: 'google', name: 'Google Maps', apiKeyRequired: true },
  { id: 'mapbox', name: 'Mapbox', apiKeyRequired: true },
  { id: 'here', name: 'HERE Maps', apiKeyRequired: true },
  { id: 'bing', name: 'Bing Maps', apiKeyRequired: true },
];

function tenantId(req) { return req.user?.tenant_id || 'tenant-moveweight'; }
function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function audit(req, event, metadata = {}) { try { run('INSERT INTO audit_events (id, tenant_id, user_id, event, ip, user_agent, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [publicId('audit'), req.user?.tenant_id || metadata.tenant_id || null, req.user?.id || metadata.user_id || null, event, req.ip || '', req.headers['user-agent'] || '', JSON.stringify(metadata), now()]); } catch {} }
function requireRole(role) { return (req, res, next) => { if ((roleRank[req.user?.role] || 0) < (roleRank[role] || 0)) return res.status(403).json({ error: `${role} access required` }); next(); }; }
function publicJob(idOrOrder) { return row('SELECT * FROM jobs WHERE id = ? OR order_number = ?', [idOrOrder, idOrOrder]); }
function distanceFeet(lat1, lon1, lat2, lon2) { const R = 6371000, toRad = (v) => v * Math.PI / 180; const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1); const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2; return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 3.28084); }
function scoreEvidence({ job, lat, lng, accuracyRadiusFeet }) { if (lat == null || lng == null || job.lat == null || job.lng == null) return { distance: null, score: 30, verdict: 'GPS missing', warnings: ['GPS was missing or unavailable. Evidence is saved, but reward/client approval should be manual.'] }; const distance = distanceFeet(Number(lat), Number(lng), Number(job.lat), Number(job.lng)); if (distance <= accuracyRadiusFeet) return { distance, score: Math.max(90, 100 - Math.round(distance / 25)), verdict: 'High confidence', warnings: [] }; if (distance <= accuracyRadiusFeet * 3) return { distance, score: 65, verdict: 'Medium confidence', warnings: [`GPS was ${distance} ft from the expected location.`] }; return { distance, score: 35, verdict: 'Low confidence', warnings: [`GPS was ${distance} ft from the expected location. Review before paying or approving.`] }; }
function hydrateJob(job) { if (!job) return null; return { ...job, evidence: all('SELECT * FROM evidence WHERE job_id = ? ORDER BY created_at DESC', [job.id]).map((e) => ({ ...e, warnings: JSON.parse(e.warnings || '[]') })), history: all('SELECT * FROM job_history WHERE job_id = ? ORDER BY created_at DESC', [job.id]) }; }
function updateTenantActivity(tid) { run('UPDATE tenants SET last_active_at=? WHERE id=?', [now(), tid]); }
function seedDemoForTenant(tid, userId, companyName) {
  const teamId = publicId('team');
  run('INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [teamId, tid, `${companyName} Demo Team`, 'Erase or edit this demo team when ready.', userId, now()]);
  const memberId = publicId('member');
  run('INSERT INTO team_members (id, tenant_id, team_id, user_id, full_name, email, phone, role, territory, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [memberId, tid, teamId, userId, 'Demo Field Member', '', '', 'Promoter / Driver', 'Downtown demo area', 'This demo member can be erased.', now()]);
  const clientId = publicId('client');
  run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [clientId, tid, 'Demo Coffee Shop', '', '', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Demo client. Erase when done testing.', now()]);
  const jobId = `P4-DEMO-${Date.now().toString().slice(-5)}`;
  run(`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [jobId, tid, teamId, clientId, memberId, 'Team Promo', 'Demo flyer proof job', 'DEMO-ORDER', 'Demo', 'Demo Coffee Shop', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Assigned', 'Today', 1200, 'Upload a proof photo and let Promote4.me score GPS accuracy.', now(), now()]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tid, jobId, userId, 'Demo job created for new account', now()]);
}

app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.3.0' }));
app.get('/api/public/plans', (req, res) => res.json({ plans: publicPlans, providers: paymentProviders, mapProviders, authentikUrl: AUTHENTIK_URL }));
app.get('/api/auth/authentik/url', (req, res) => { const redirectUri = `${APP_URL}/api/auth/authentik/callback`; const url = `${AUTHENTIK_URL}/application/o/authorize/?client_id=${encodeURIComponent(AUTHENTIK_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`; res.json({ url }); });
app.get('/api/auth/authentik/callback', (req, res) => res.redirect(`/?authentik=configure&code=${encodeURIComponent(req.query.code || '')}`));

app.post('/api/auth/register', async (req, res) => {
  const { companyName, fullName, email, username, password, plan = 'free', role = 'admin' } = req.body || {};
  if (!companyName || !fullName || !email || !username || !password) return res.status(400).json({ error: 'Company, name, email, username, and password are required.' });
  if (row('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])) return res.status(409).json({ error: 'Username or email already exists.' });
  const tid = publicId('tenant'); const uid = publicId('user');
  const deleteAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  run('INSERT INTO tenants (id, name, plan, billing_email, status, last_active_at, delete_after_inactive_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [tid, companyName, plan, email, 'active', now(), deleteAt, now()]);
  run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, status, email_verified_at, created_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [uid, tid, username, email, await hashPassword(password), roleRank[role] ? role : 'admin', fullName, 'active', null, now(), now()]);
  seedDemoForTenant(tid, uid, companyName);
  const verifyToken = nanoid(32);
  run('INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)', [publicId('emailtok'), uid, tokenHash(verifyToken), new Date(Date.now() + 48*3600*1000).toISOString(), now()]);
  const user = row('SELECT * FROM users WHERE id = ?', [uid]);
  audit({ headers: {}, ip: '' }, 'account_registered', { tenant_id: tid, user_id: uid, plan });
  res.json({ token: signUser(user), user: getCurrentUser(uid), verifyUrl: `${APP_URL}/api/auth/verify-email?token=${verifyToken}`, message: 'Account created. Demo workspace is ready. Email verification URL returned for local email setup.' });
});

app.post('/api/auth/login', async (req, res) => { const { username, password } = req.body || {}; const user = row('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]); if (!user || !(await verifyPassword(password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid login' }); if (user.status !== 'active') return res.status(403).json({ error: 'Account disabled' }); run('UPDATE users SET last_login_at=?, last_active_at=? WHERE id=?', [now(), now(), user.id]); updateTenantActivity(user.tenant_id); audit({ ...req, user }, 'login_success'); res.json({ token: signUser(user), user: getCurrentUser(user.id) }); });
app.post('/api/auth/request-reset', async (req, res) => { const user = row('SELECT * FROM users WHERE email = ? OR username = ?', [req.body?.email || '', req.body?.email || '']); if (user) { const token = nanoid(40); run('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)', [publicId('resettok'), user.id, tokenHash(token), new Date(Date.now()+3600*1000).toISOString(), now()]); return res.json({ ok: true, resetUrl: `${APP_URL}/reset-password?token=${token}`, message: 'Reset link generated. Configure SMTP to send this automatically.' }); } res.json({ ok: true, message: 'If the account exists, a reset link was generated.' }); });
app.post('/api/auth/reset-password', async (req, res) => { const { token, password } = req.body || {}; const found = all('SELECT * FROM password_reset_tokens WHERE used_at IS NULL').find((t) => t.token_hash === tokenHash(token || '') && new Date(t.expires_at) > new Date()); if (!found) return res.status(400).json({ error: 'Invalid or expired reset token.' }); run('UPDATE users SET password_hash=?, status=? WHERE id=?', [await hashPassword(password), 'active', found.user_id]); run('UPDATE password_reset_tokens SET used_at=? WHERE id=?', [now(), found.id]); res.json({ ok: true }); });
app.get('/api/auth/verify-email', (req, res) => { const found = all('SELECT * FROM email_verification_tokens WHERE used_at IS NULL').find((t) => t.token_hash === tokenHash(req.query.token || '') && new Date(t.expires_at) > new Date()); if (!found) return res.status(400).send('Invalid or expired verification token.'); run('UPDATE users SET email_verified_at=? WHERE id=?', [now(), found.user_id]); run('UPDATE email_verification_tokens SET used_at=? WHERE id=?', [now(), found.id]); res.send('Email verified. You can return to Promote4.me.'); });
app.get('/api/me', requireAuth, (req, res) => res.json({ user: getCurrentUser(req.user.id) }));

app.get('/api/bootstrap', requireAuth, (req, res) => { const tid = tenantId(req); updateTenantActivity(tid); res.json({ tenant: row('SELECT * FROM tenants WHERE id = ?', [tid]), roles: Object.keys(roleRank), roleCatalog, fieldRoleCatalog, deliveryServices, plans: publicPlans, mapProviders, paymentProviders, users: all('SELECT id, username, email, role, full_name, phone, photo_url, status, email_verified_at, last_login_at FROM users WHERE tenant_id = ? ORDER BY created_at DESC', [tid]), teams: all('SELECT * FROM teams WHERE tenant_id = ? ORDER BY created_at DESC', [tid]), teamMembers: all('SELECT * FROM team_members WHERE tenant_id = ? ORDER BY created_at DESC', [tid]), clients: all('SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC', [tid]), jobs: all('SELECT * FROM jobs WHERE tenant_id = ? ORDER BY created_at DESC', [tid]).map(hydrateJob), integrations: all('SELECT * FROM integrations WHERE tenant_id = ? ORDER BY created_at DESC', [tid]), audit: all('SELECT * FROM audit_events WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 100', [tid]) }); });
app.get('/api/public/jobs/:id', (req, res) => { const job = publicJob(req.params.id); if (!job) return res.status(404).json({ error: 'Job not found' }); res.json({ job: hydrateJob(job) }); });

app.post('/api/teams', requireAuth, requireRole('manager'), (req, res) => { const id = publicId('team'); const { name, description = '' } = req.body; run('INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, tenantId(req), name, description, req.user.id, now()]); audit(req, 'team_created', { team_id: id }); res.json({ team: row('SELECT * FROM teams WHERE id = ?', [id]) }); });
app.post('/api/users', requireAuth, requireRole('admin'), async (req, res) => {
  const { username, email, password = 'ChangeMe123!', role = 'manager', full_name, phone = '' } = req.body;
  let requestedRole = roleRank[role] ? role : 'manager';
  if (requestedRole === 'super_admin' && !isOwnerSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Only Wade / Promote4.me owner can create super admins.' });
  }
  if (requestedRole === 'admin' && req.user.role !== 'super_admin') requestedRole = 'manager';
  const id = publicId('user');
  run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), username, email, await hashPassword(password), requestedRole, full_name, phone, now()]);
  audit(req, 'user_created', { target_user_id: id, role: requestedRole });
  res.json({ user: getCurrentUser(id), tempPassword: password });
});
app.patch('/api/users/:id/role', requireAuth, requireRole('admin'), (req, res) => {
  const { role } = req.body;
  if (!roleRank[role]) return res.status(400).json({ error: 'Invalid role.' });
  const target = row('SELECT * FROM users WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if ((role === 'super_admin' || target.role === 'super_admin') && !isOwnerSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Only Wade / Promote4.me owner can manage super admins.' });
  }
  run('UPDATE users SET role=? WHERE id=? AND tenant_id=?', [role, req.params.id, tenantId(req)]);
  audit(req, 'user_role_changed', { target_user_id: req.params.id, role });
  res.json({ user: getCurrentUser(req.params.id) });
});
app.post('/api/team-members', requireAuth, requireRole('manager'), upload.single('photo'), (req, res) => { const id = publicId('member'); const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || ''; const b = req.body; run(`INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, pay_rate, territory, photo_url, emergency_contact, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, tenantId(req), b.team_id, b.full_name, b.email || '', b.phone || '', b.role || 'Member', b.pay_rate || '', b.territory || '', photoUrl, b.emergency_contact || '', b.notes || '', b.status || 'active', now()]); res.json({ member: row('SELECT * FROM team_members WHERE id = ?', [id]) }); });

app.get('/api/crm/catalog', requireAuth, (req, res) => {
  res.json({ roleCatalog, fieldRoleCatalog, deliveryServices });
});

app.get('/api/team-members/export.csv', requireAuth, requireRole('manager'), (req, res) => {
  const rows = all('SELECT full_name,email,phone,role,pay_rate,territory,emergency_contact,notes,status,created_at FROM team_members WHERE tenant_id=? ORDER BY full_name', [tenantId(req)]);
  const headers = ['full_name','email','phone','role','pay_rate','territory','emergency_contact','notes','status','created_at'];
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n');
  audit(req, 'team_members_exported', { count: rows.length });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="promote4me-team-members.csv"');
  res.send(csv);
});

app.post('/api/team-members/import', requireAuth, requireRole('manager'), (req, res) => {
  const { csv, team_id } = req.body || {};
  if (!csv) return res.status(400).json({ error: 'CSV text is required.' });
  const teamId = team_id || row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at LIMIT 1', [tenantId(req)])?.id;
  if (!teamId) return res.status(400).json({ error: 'Create a team before importing members.' });
  const rows = parseCsv(csv);
  let imported = 0, skipped = 0;
  for (const r of rows) {
    const fullName = r.full_name || r.name || r.member || '';
    if (!fullName.trim()) { skipped++; continue; }
    const id = publicId('member');
    run(`INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, pay_rate, territory, emergency_contact, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      id, tenantId(req), teamId, fullName.trim(), r.email || '', r.phone || '', r.role || 'Field Member',
      r.pay_rate || '', r.territory || '', r.emergency_contact || '', r.notes || '', r.status || 'active', now()
    ]);
    imported++;
  }
  audit(req, 'team_members_imported', { imported, skipped });
  res.json({ imported, skipped });
});

app.patch('/api/team-members/:id', requireAuth, requireRole('manager'), upload.single('photo'), (req, res) => {
  const existing = row('SELECT * FROM team_members WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'Team member not found.' });
  const b = { ...existing, ...req.body };
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : b.photo_url || existing.photo_url || '';
  run(`UPDATE team_members SET team_id=?, full_name=?, email=?, phone=?, role=?, pay_rate=?, territory=?, photo_url=?, emergency_contact=?, notes=?, status=? WHERE id=? AND tenant_id=?`, [
    b.team_id || existing.team_id, b.full_name, b.email || '', b.phone || '', b.role || 'Field Member',
    b.pay_rate || '', b.territory || '', photoUrl, b.emergency_contact || '', b.notes || '', b.status || 'active',
    req.params.id, tenantId(req)
  ]);
  audit(req, 'team_member_updated', { member_id: req.params.id });
  res.json({ member: row('SELECT * FROM team_members WHERE id=?', [req.params.id]) });
});

app.delete('/api/team-members/:id', requireAuth, requireRole('manager'), (req, res) => {
  const existing = row('SELECT * FROM team_members WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'Team member not found.' });
  run('UPDATE team_members SET status=? WHERE id=? AND tenant_id=?', ['deleted', req.params.id, tenantId(req)]);
  audit(req, 'team_member_deleted', { member_id: req.params.id });
  res.json({ ok: true });
});

app.patch('/api/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const target = row('SELECT * FROM users WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'super_admin' && !isOwnerSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Only Wade / Promote4.me owner can edit super admins.' });
  }
  const b = { ...target, ...req.body };
  let nextRole = roleRank[b.role] ? b.role : target.role;
  if ((nextRole === 'super_admin' || target.role === 'super_admin') && !isOwnerSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Only Wade / Promote4.me owner can manage super admins.' });
  }
  run('UPDATE users SET username=?, email=?, role=?, full_name=?, phone=?, status=? WHERE id=? AND tenant_id=?', [
    b.username, b.email, nextRole, b.full_name, b.phone || '', b.status || 'active', req.params.id, tenantId(req)
  ]);
  if (req.body.password) run('UPDATE users SET password_hash=? WHERE id=? AND tenant_id=?', [await hashPassword(req.body.password), req.params.id, tenantId(req)]);
  audit(req, 'user_updated', { target_user_id: req.params.id });
  res.json({ user: getCurrentUser(req.params.id) });
});

app.delete('/api/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  const target = row('SELECT * FROM users WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'super_admin' || target.id === req.user.id) return res.status(403).json({ error: 'Cannot delete this account.' });
  run('UPDATE users SET status=? WHERE id=? AND tenant_id=?', ['deleted', req.params.id, tenantId(req)]);
  audit(req, 'user_deleted', { target_user_id: req.params.id });
  res.json({ ok: true });
});


app.post('/api/clients', requireAuth, requireRole('manager'), (req, res) => { const id = publicId('client'); const b = req.body; run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), b.name, b.email || '', b.phone || '', b.address || '', b.lat || null, b.lng || null, b.notes || '', now()]); res.json({ client: row('SELECT * FROM clients WHERE id = ?', [id]) }); });
app.post('/api/jobs', requireAuth, requireRole('manager'), (req, res) => { const id = req.body.id || `P4-${Date.now().toString().slice(-6)}`; const b = req.body; run(`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, tenantId(req), b.team_id || null, b.client_id || null, b.assigned_to || null, b.type, b.title, b.order_number || '', b.source || 'Manual', b.customer_name || '', b.customer_email || '', b.customer_phone || '', b.address, b.lat || null, b.lng || null, b.status || 'Assigned', b.eta || '', Number(b.reward_cents || 0), b.instructions || '', now(), now()]); run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tenantId(req), id, req.user.id, 'Job created', now()]); res.json({ job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [id])) }); });
app.patch('/api/jobs/:id', requireAuth, requireRole('manager'), (req, res) => { const b = req.body; const job = row('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId(req)]); if (!job) return res.status(404).json({ error: 'Job not found' }); const next = { ...job, ...b, updated_at: now() }; run(`UPDATE jobs SET team_id=?, client_id=?, assigned_to=?, type=?, title=?, order_number=?, source=?, customer_name=?, customer_email=?, customer_phone=?, address=?, lat=?, lng=?, status=?, eta=?, reward_cents=?, instructions=?, updated_at=? WHERE id=?`, [next.team_id, next.client_id, next.assigned_to, next.type, next.title, next.order_number, next.source, next.customer_name, next.customer_email, next.customer_phone, next.address, next.lat, next.lng, next.status, next.eta, next.reward_cents, next.instructions, next.updated_at, job.id]); run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tenantId(req), job.id, req.user.id, `Job updated: ${b.status || 'details changed'}`, now()]); res.json({ job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [job.id])) }); });
app.post('/api/jobs/:id/evidence', requireAuth, upload.single('photo'), (req, res) => { const job = row('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId(req)]); if (!job) return res.status(404).json({ error: 'Job not found' }); const tenant = row('SELECT * FROM tenants WHERE id = ?', [tenantId(req)]); const chosenLat = req.body.browser_lat || req.body.image_lat || null; const chosenLng = req.body.browser_lng || req.body.image_lng || null; const scored = scoreEvidence({ job, lat: chosenLat, lng: chosenLng, accuracyRadiusFeet: tenant.accuracy_radius_feet }); const id = publicId('ev'); run(`INSERT INTO evidence (id, tenant_id, job_id, user_id, file_url, file_name, note, browser_lat, browser_lng, browser_accuracy_meters, image_lat, image_lng, chosen_lat, chosen_lng, distance_feet, score, verdict, warnings, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, tenantId(req), job.id, req.user.id, req.file ? `/uploads/${req.file.filename}` : '', req.file?.originalname || '', req.body.note || '', req.body.browser_lat || null, req.body.browser_lng || null, req.body.browser_accuracy_meters || null, req.body.image_lat || null, req.body.image_lng || null, chosenLat, chosenLng, scored.distance, scored.score, scored.verdict, JSON.stringify(scored.warnings), now()]); run('UPDATE jobs SET status=?, updated_at=? WHERE id=?', ['Submitted', now(), job.id]); run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tenantId(req), job.id, req.user.id, `Evidence submitted: ${scored.verdict}`, now()]); res.json({ evidence: row('SELECT * FROM evidence WHERE id = ?', [id]), job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [job.id])) }); });

app.patch('/api/settings', requireAuth, requireRole('admin'), (req, res) => { const b = req.body; run('UPDATE tenants SET name=?, plan=?, google_maps_api_key=?, accuracy_radius_feet=?, require_gps_for_rewards=?, map_provider=?, billing_email=? WHERE id=?', [b.name, b.plan, b.google_maps_api_key || '', Number(b.accuracy_radius_feet || 350), b.require_gps_for_rewards ? 1 : 0, b.map_provider || 'openstreetmap', b.billing_email || '', tenantId(req)]); res.json({ tenant: row('SELECT * FROM tenants WHERE id=?', [tenantId(req)]) }); });
app.post('/api/billing/checkout', requireAuth, requireRole('admin'), (req, res) => { const { provider = 'stripe', plan = 'pro' } = req.body || {}; if (!paymentProviders.includes(provider)) return res.status(400).json({ error: 'Unsupported provider.' }); const planObj = publicPlans.find((p) => p.id === plan) || publicPlans[0]; const id = publicId('bill'); const checkoutUrl = `${APP_URL}/billing/${provider}?plan=${encodeURIComponent(plan)}&checkout=${id}`; run('INSERT INTO billing_events (id, tenant_id, provider, plan, amount_cents, status, checkout_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), provider, plan, plan === 'starter' ? 1900 : plan === 'pro' ? 4900 : plan === 'agency' ? 14900 : 0, 'created', checkoutUrl, now()]); res.json({ checkoutUrl, provider, plan: planObj, message: 'Provider checkout placeholder created. Add live API keys to take real payments.' }); });
app.post('/api/admin/cleanup-inactive', requireAuth, requireRole('super_admin'), (req, res) => { const cutoff = new Date(Date.now() - 365*24*60*60*1000).toISOString(); const stale = all("SELECT id FROM tenants WHERE status='active' AND COALESCE(last_active_at, created_at) < ? AND plan='free'", [cutoff]); for (const t of stale) run("UPDATE tenants SET status='inactive_pending_delete', delete_after_inactive_at=? WHERE id=?", [new Date(Date.now()+30*24*60*60*1000).toISOString(), t.id]); res.json({ marked: stale.length, message: 'Free inactive tenants marked for deletion grace period.' }); });
app.post('/api/webhooks/shopify/order', (req, res) => res.json({ ok: true, note: 'Shopify webhook accepted placeholder. Configure secret verification before live merchant launch.' }));
app.post('/api/webhooks/woocommerce/order', (req, res) => res.json({ ok: true, note: 'WooCommerce plugin can POST orders here after API key setup.' }));
app.use((req, res, next) => { if (req.path.startsWith('/api/')) return next(); res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')); });
app.listen(PORT, '0.0.0.0', () => console.log(`Promote4.me API running on ${PORT}`));
