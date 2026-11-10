import { Router } from 'express';
import { nanoid } from 'nanoid';
import { row, all, run, now } from '../db.js';
import { publicId } from '../auth.js';
import { tenantId, tokenHash, audit } from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import { requireNotDemo } from '../middleware/auth.js';
import { publicPlans, paymentProviders } from '../constants.js';
import { APP_URL } from '../constants.js';

const router = Router();

// PATCH /api/settings
router.patch('/settings', requireAuth, requireRole('admin'), requireNotDemo(), (req, res) => {
  const b = req.body;
  run('UPDATE tenants SET name=?, plan=?, google_maps_api_key=?, accuracy_radius_feet=?, require_gps_for_rewards=?, map_provider=?, billing_email=? WHERE id=?', [
    b.name, b.plan, b.google_maps_api_key || '',
    Number(b.accuracy_radius_feet || 350), b.require_gps_for_rewards ? 1 : 0,
    b.map_provider || 'openstreetmap', b.billing_email || '',
    tenantId(req)
  ]);
  res.json({ tenant: row('SELECT * FROM tenants WHERE id=?', [tenantId(req)]) });
});

// POST /api/billing/checkout
router.post('/billing/checkout', requireAuth, requireRole('admin'), (req, res) => {
  const { provider = 'stripe', plan = 'pro' } = req.body || {};
  if (!paymentProviders.includes(provider)) return res.status(400).json({ error: 'Unsupported provider.' });
  const planObj = publicPlans.find((p) => p.id === plan) || publicPlans[0];
  const id = publicId('bill');
  const checkoutUrl = `${APP_URL}/billing/${provider}?plan=${encodeURIComponent(plan)}&checkout=${id}`;
  run('INSERT INTO billing_events (id, tenant_id, provider, plan, amount_cents, status, checkout_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), provider, plan,
    plan === 'starter' ? 1900 : plan === 'pro' ? 4900 : plan === 'agency' ? 14900 : 0,
    'created', checkoutUrl, now()
  ]);
  res.json({
    checkoutUrl, provider, plan: planObj,
    message: 'Provider checkout placeholder created. Add live API keys to take real payments.'
  });
});

// GET /api/external-keys
router.get('/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  const keys = all(
    'SELECT id,label,status,created_by,created_at,last_used_at FROM external_api_keys WHERE tenant_id=? ORDER BY created_at DESC',
    [tenantId(req)]
  );
  res.json({ keys });
});

// POST /api/external-keys
router.post('/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  const label = req.body?.label || 'WooCommerce Store';
  const raw = 'p4me_' + nanoid(40);
  const id = publicId('apikey');
  run('INSERT INTO external_api_keys (id,tenant_id,label,key_hash,status,created_by,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), label, tokenHash(raw), 'active', req.user.id, now()
  ]);
  audit(req, 'external_api_key_created', { key_id: id, label });
  res.json({ id, label, apiKey: raw, note: 'Copy this key now. Promote4.me will not show it again.' });
});

// DELETE /api/external-keys/:id
router.delete('/external-keys/:id', requireAuth, requireRole('admin'), (req, res) => {
  const existing = row('SELECT * FROM external_api_keys WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'API key not found.' });
  run('UPDATE external_api_keys SET status=? WHERE id=? AND tenant_id=?', ['revoked', req.params.id, tenantId(req)]);
  audit(req, 'external_api_key_revoked', { key_id: req.params.id });
  res.json({ ok: true });
});

export default router;
