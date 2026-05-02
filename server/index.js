import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { migrate, db, row, all, run, now, UPLOAD_DIR } from './db.js';
import { verifyPassword, signUser, requireAuth, requireAdmin, getCurrentUser, publicId } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);

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

function tenantId(req) { return req.user?.tenant_id || 'tenant-moveweight'; }
function publicJob(idOrOrder) { return row('SELECT * FROM jobs WHERE id = ? OR order_number = ?', [idOrOrder, idOrOrder]); }
function distanceFeet(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = (v) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 3.28084);
}
function scoreEvidence({ job, lat, lng, accuracyRadiusFeet }) {
  if (lat == null || lng == null || job.lat == null || job.lng == null) return { distance: null, score: 30, verdict: 'GPS missing', warnings: ['GPS was missing or unavailable. Evidence is saved, but reward/client approval should be manual.'] };
  const distance = distanceFeet(Number(lat), Number(lng), Number(job.lat), Number(job.lng));
  if (distance <= accuracyRadiusFeet) return { distance, score: Math.max(90, 100 - Math.round(distance / 25)), verdict: 'High confidence', warnings: [] };
  if (distance <= accuracyRadiusFeet * 3) return { distance, score: 65, verdict: 'Medium confidence', warnings: [`GPS was ${distance} ft from the expected location.`] };
  return { distance, score: 35, verdict: 'Low confidence', warnings: [`GPS was ${distance} ft from the expected location. Review before paying or approving.`] };
}
function hydrateJob(job) {
  if (!job) return null;
  return {
    ...job,
    evidence: all('SELECT * FROM evidence WHERE job_id = ? ORDER BY created_at DESC', [job.id]).map((e) => ({ ...e, warnings: JSON.parse(e.warnings || '[]') })),
    history: all('SELECT * FROM job_history WHERE job_id = ? ORDER BY created_at DESC', [job.id]),
  };
}

app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.2.0' }));

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = row('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
  if (!user || !(await verifyPassword(password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid login' });
  if (user.status !== 'active') return res.status(403).json({ error: 'Account disabled' });
  res.json({ token: signUser(user), user: getCurrentUser(user.id) });
});

app.get('/api/me', requireAuth, (req, res) => res.json({ user: getCurrentUser(req.user.id) }));

app.get('/api/bootstrap', requireAuth, (req, res) => {
  const tid = tenantId(req);
  res.json({
    tenant: row('SELECT * FROM tenants WHERE id = ?', [tid]),
    users: all('SELECT id, username, email, role, full_name, phone, photo_url, status FROM users WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    teams: all('SELECT * FROM teams WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    teamMembers: all('SELECT * FROM team_members WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    clients: all('SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    jobs: all('SELECT * FROM jobs WHERE tenant_id = ? ORDER BY created_at DESC', [tid]).map(hydrateJob),
    integrations: all('SELECT * FROM integrations WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
  });
});

app.get('/api/public/jobs/:id', (req, res) => {
  const job = publicJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job: hydrateJob(job) });
});

app.post('/api/teams', requireAuth, requireAdmin, (req, res) => {
  const id = publicId('team');
  const { name, description = '' } = req.body;
  run('INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, tenantId(req), name, description, req.user.id, now()]);
  res.json({ team: row('SELECT * FROM teams WHERE id = ?', [id]) });
});

app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
  const { username, email, password = 'ChangeMe123!', role = 'manager', full_name, phone = '' } = req.body;
  const { hashPassword } = await import('./auth.js');
  const id = publicId('user');
  run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), username, email, await hashPassword(password), role, full_name, phone, now()]);
  res.json({ user: getCurrentUser(id), tempPassword: password });
});

app.post('/api/team-members', requireAuth, requireAdmin, upload.single('photo'), (req, res) => {
  const id = publicId('member');
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || '';
  const b = req.body;
  run(`INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, pay_rate, territory, photo_url, emergency_contact, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, tenantId(req), b.team_id, b.full_name, b.email || '', b.phone || '', b.role || 'Member', b.pay_rate || '', b.territory || '', photoUrl, b.emergency_contact || '', b.notes || '', b.status || 'active', now()]);
  res.json({ member: row('SELECT * FROM team_members WHERE id = ?', [id]) });
});

app.post('/api/clients', requireAuth, requireAdmin, (req, res) => {
  const id = publicId('client'); const b = req.body;
  run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), b.name, b.email || '', b.phone || '', b.address || '', b.lat || null, b.lng || null, b.notes || '', now()]);
  res.json({ client: row('SELECT * FROM clients WHERE id = ?', [id]) });
});

app.post('/api/jobs', requireAuth, requireAdmin, (req, res) => {
  const id = req.body.id || `P4-${Date.now().toString().slice(-6)}`; const b = req.body;
  run(`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, tenantId(req), b.team_id || null, b.client_id || null, b.assigned_to || null, b.type, b.title, b.order_number || '', b.source || 'Manual', b.customer_name || '', b.customer_email || '', b.customer_phone || '', b.address, b.lat || null, b.lng || null, b.status || 'Assigned', b.eta || '', Number(b.reward_cents || 0), b.instructions || '', now(), now()]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tenantId(req), id, req.user.id, 'Job created', now()]);
  res.json({ job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [id])) });
});

app.patch('/api/jobs/:id', requireAuth, requireAdmin, (req, res) => {
  const b = req.body; const job = row('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId(req)]);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const next = { ...job, ...b, updated_at: now() };
  run(`UPDATE jobs SET team_id=?, client_id=?, assigned_to=?, type=?, title=?, order_number=?, source=?, customer_name=?, customer_email=?, customer_phone=?, address=?, lat=?, lng=?, status=?, eta=?, reward_cents=?, instructions=?, updated_at=? WHERE id=?`, [next.team_id, next.client_id, next.assigned_to, next.type, next.title, next.order_number, next.source, next.customer_name, next.customer_email, next.customer_phone, next.address, next.lat, next.lng, next.status, next.eta, next.reward_cents, next.instructions, next.updated_at, job.id]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tenantId(req), job.id, req.user.id, `Job updated: ${b.status || 'details changed'}`, now()]);
  res.json({ job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [job.id])) });
});

app.post('/api/jobs/:id/evidence', requireAuth, upload.single('photo'), (req, res) => {
  const job = row('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId(req)]);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const tenant = row('SELECT * FROM tenants WHERE id = ?', [tenantId(req)]);
  const chosenLat = req.body.browser_lat || req.body.image_lat || null;
  const chosenLng = req.body.browser_lng || req.body.image_lng || null;
  const scored = scoreEvidence({ job, lat: chosenLat, lng: chosenLng, accuracyRadiusFeet: tenant.accuracy_radius_feet });
  const id = publicId('ev');
  run(`INSERT INTO evidence (id, tenant_id, job_id, user_id, file_url, file_name, note, browser_lat, browser_lng, browser_accuracy_meters, image_lat, image_lng, chosen_lat, chosen_lng, distance_feet, score, verdict, warnings, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, tenantId(req), job.id, req.user.id, req.file ? `/uploads/${req.file.filename}` : '', req.file?.originalname || '', req.body.note || '', req.body.browser_lat || null, req.body.browser_lng || null, req.body.browser_accuracy_meters || null, req.body.image_lat || null, req.body.image_lng || null, chosenLat, chosenLng, scored.distance, scored.score, scored.verdict, JSON.stringify(scored.warnings), now()]);
  run('UPDATE jobs SET status=?, updated_at=? WHERE id=?', ['Submitted', now(), job.id]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tenantId(req), job.id, req.user.id, `Evidence submitted: ${scored.verdict}`, now()]);
  res.json({ evidence: row('SELECT * FROM evidence WHERE id = ?', [id]), job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [job.id])) });
});

app.post('/api/webhooks/shopify/order', express.raw({ type: '*/*' }), (req, res) => res.json({ ok: true, note: 'Configure Shopify app proxy/webhook secret in integrations. Endpoint reserved for Shopify order creation.' }));
app.post('/api/webhooks/woocommerce/order', (req, res) => res.json({ ok: true, note: 'WooCommerce plugin can POST orders here after API key setup.' }));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`Promote4.me API running on ${PORT}`));
