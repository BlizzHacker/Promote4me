import { Router } from 'express';
import { row, all, run, now } from '../db.js';
import { publicId } from '../auth.js';
import {
  tenantId,
  enforceJobLimit,
  audit,
  hydrateJob,
  scoreEvidence,
} from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import { upload } from '../upload.js';

const router = Router();

// POST /api/jobs
router.post('/', requireAuth, requireRole('manager'), (req, res) => {
  if (!enforceJobLimit(req, res)) return;
  const id = req.body.id || `P4-${Date.now().toString().slice(-6)}`;
  const b = req.body;
  run(`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id, tenantId(req), b.team_id || null, b.client_id || null, b.assigned_to || null,
    b.type, b.title, b.order_number || '', b.source || 'Manual',
    b.customer_name || '', b.customer_email || '', b.customer_phone || '',
    b.address, b.lat || null, b.lng || null, b.status || 'Assigned', b.eta || '',
    Number(b.reward_cents || 0), b.instructions || '', now(), now()
  ]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    publicId('hist'), tenantId(req), id, req.user.id, 'Job created', now()
  ]);
  res.json({ job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [id])) });
});

// PATCH /api/jobs/:id
router.patch('/:id', requireAuth, requireRole('manager'), (req, res) => {
  const b = req.body;
  const job = row('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId(req)]);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const next = { ...job, ...b, updated_at: now() };
  run(`UPDATE jobs SET team_id=?, client_id=?, assigned_to=?, type=?, title=?, order_number=?, source=?, customer_name=?, customer_email=?, customer_phone=?, address=?, lat=?, lng=?, status=?, eta=?, reward_cents=?, instructions=?, updated_at=? WHERE id=?`, [
    next.team_id, next.client_id, next.assigned_to, next.type, next.title,
    next.order_number, next.source, next.customer_name, next.customer_email,
    next.customer_phone, next.address, next.lat, next.lng, next.status,
    next.eta, next.reward_cents, next.instructions, next.updated_at, job.id
  ]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    publicId('hist'), tenantId(req), job.id, req.user.id,
    `Job updated: ${b.status || 'details changed'}`, now()
  ]);
  res.json({ job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [job.id])) });
});

// POST /api/jobs/:id/evidence
router.post('/:id/evidence', requireAuth, upload.single('photo'), (req, res) => {
  const job = row('SELECT * FROM jobs WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId(req)]);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const tenant = row('SELECT * FROM tenants WHERE id = ?', [tenantId(req)]);
  const chosenLat = req.body.browser_lat || req.body.image_lat || null;
  const chosenLng = req.body.browser_lng || req.body.image_lng || null;
  const scored = scoreEvidence({
    job,
    lat: chosenLat,
    lng: chosenLng,
    accuracyRadiusFeet: tenant.accuracy_radius_feet
  });
  const id = publicId('ev');
  run(`INSERT INTO evidence (id, tenant_id, job_id, user_id, file_url, file_name, note, browser_lat, browser_lng, browser_accuracy_meters, image_lat, image_lng, chosen_lat, chosen_lng, distance_feet, score, verdict, warnings, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id, tenantId(req), job.id, req.user.id,
    req.file ? `/uploads/${req.file.filename}` : '',
    req.file?.originalname || '', req.body.note || '',
    req.body.browser_lat || null, req.body.browser_lng || null,
    req.body.browser_accuracy_meters || null,
    req.body.image_lat || null, req.body.image_lng || null,
    chosenLat, chosenLng, scored.distance, scored.score, scored.verdict,
    JSON.stringify(scored.warnings), now()
  ]);
  run('UPDATE jobs SET status=?, updated_at=? WHERE id=?', ['Submitted', now(), job.id]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    publicId('hist'), tenantId(req), job.id, req.user.id,
    `Evidence submitted: ${scored.verdict}`, now()
  ]);
  res.json({
    evidence: row('SELECT * FROM evidence WHERE id = ?', [id]),
    job: hydrateJob(row('SELECT * FROM jobs WHERE id = ?', [job.id]))
  });
});

export default router;
