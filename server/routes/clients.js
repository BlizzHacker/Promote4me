import { Router } from 'express';
import { row, run, now } from '../db.js';
import { publicId } from '../auth.js';
import { tenantId, audit } from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/clients
router.post('/', requireAuth, requireRole('manager'), (req, res) => {
  const id = publicId('client');
  const b = req.body;
  run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), b.name, b.email || '', b.phone || '', b.address || '',
    b.lat || null, b.lng || null, b.notes || '', now()
  ]);
  res.json({ client: row('SELECT * FROM clients WHERE id = ?', [id]) });
});

// PATCH /api/clients/:id
router.patch('/:id', requireAuth, requireRole('manager'), (req, res) => {
  const existing = row('SELECT * FROM clients WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'Client not found.' });
  const b = { ...existing, ...req.body };
  run('UPDATE clients SET name=?, email=?, phone=?, address=?, lat=?, lng=?, notes=?, status=? WHERE id=? AND tenant_id=?', [
    b.name, b.email || '', b.phone || '', b.address || '',
    b.lat || null, b.lng || null, b.notes || '', b.status || 'active',
    req.params.id, tenantId(req)
  ]);
  audit(req, 'client_updated', { client_id: req.params.id });
  res.json({ client: row('SELECT * FROM clients WHERE id=?', [req.params.id]) });
});

// DELETE /api/clients/:id
router.delete('/:id', requireAuth, requireRole('manager'), (req, res) => {
  const existing = row('SELECT * FROM clients WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'Client not found.' });
  run('UPDATE clients SET status=? WHERE id=? AND tenant_id=?', ['deleted', req.params.id, tenantId(req)]);
  audit(req, 'client_deleted', { client_id: req.params.id });
  res.json({ ok: true });
});

export default router;
