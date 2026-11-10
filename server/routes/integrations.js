import { Router } from 'express';
import { row, all, run, now } from '../db.js';
import { publicId } from '../auth.js';
import {
  tenantId,
  enforceJobLimit,
  tokenHash,
  audit,
  hydrateJob,
} from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/integrations/simulate/:provider
router.post('/integrations/simulate/:provider', requireAuth, requireRole('manager'), (req, res) => {
  const provider = String(req.params.provider || 'Promote4.me Direct').replaceAll('-', ' ');
  const tid = tenantId(req);
  if (!enforceJobLimit(req, res)) return;
  const team = row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1', [tid]);
  const member = row('SELECT id FROM team_members WHERE tenant_id=? AND status != ? ORDER BY created_at DESC LIMIT 1', [tid, 'deleted']);
  const client = row('SELECT * FROM clients WHERE tenant_id=? AND COALESCE(status, ?) != ? ORDER BY created_at DESC LIMIT 1', [tid, 'active', 'deleted']);
  const id = `P4-SYNC-${Date.now().toString().slice(-6)}`;
  const orderNumber = `${provider.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${Date.now().toString().slice(-5)}`;
  run(`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id, tid, team?.id || null, client?.id || null, member?.id || null,
    provider.match(/uber|door|grub/i) ? 'Food Delivery' : 'Package Delivery',
    `${provider} synced demo order`, orderNumber, provider,
    client?.name || 'Demo Customer', client?.email || 'demo-customer@promote4.me',
    client?.phone || '(555) 600-0000', client?.address || '302 E 4th St, Joplin, MO',
    client?.lat || 37.0878, client?.lng || -94.5107, 'Assigned', 'Synced just now', 1000,
    `Simulated ${provider} API sync. Add live credentials in Integrations to turn this into production sync.`,
    now(), now()
  ]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    publicId('hist'), tid, id, req.user.id, `${provider} demo sync created job`, now()
  ]);
  audit(req, 'integration_demo_sync', { provider, job_id: id });
  res.json({ ok: true, provider, job: hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id])) });
});

// POST /api/external/orders
router.post('/external/orders', (req, res) => {
  const raw = req.headers['x-p4me-key'] || req.headers['x-promote4me-key'] || '';
  if (!raw) return res.status(401).json({ error: 'Invalid or missing Promote4.me External API Key.' });
  const key = row('SELECT * FROM external_api_keys WHERE key_hash=? AND status=?', [tokenHash(String(raw)), 'active']);
  if (!key) return res.status(401).json({ error: 'Invalid or missing Promote4.me External API Key.' });

  const b = req.body || {};
  const id = b.id || ('P4-EXT-' + Date.now().toString().slice(-6));
  const team = row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1', [key.tenant_id]);
  const member = row('SELECT id FROM team_members WHERE tenant_id=? AND COALESCE(status,?) != ? ORDER BY created_at DESC LIMIT 1', [key.tenant_id, 'active', 'deleted']);

  run('UPDATE external_api_keys SET last_used_at=? WHERE id=?', [now(), key.id]);

  run('INSERT INTO jobs (id,tenant_id,team_id,assigned_to,type,title,order_number,source,customer_name,customer_email,customer_phone,address,lat,lng,status,eta,reward_cents,instructions,work_mode,visibility,is_public,trade,budget_cents,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id,
    key.tenant_id,
    team?.id || null,
    member?.id || null,
    b.type || 'Package Delivery',
    b.title || 'External Order',
    b.order_number || '',
    b.source || key.label || 'External API',
    b.customer_name || '',
    b.customer_email || '',
    b.customer_phone || '',
    b.address || '',
    b.lat || null,
    b.lng || null,
    b.status || 'Assigned',
    b.eta || '',
    Number(b.reward_cents || 0),
    b.instructions || 'Imported from external API. Upload GPS/photo proof before completion.',
    b.work_mode || 'in_person',
    b.visibility || 'private',
    b.is_public ? 1 : 0,
    b.trade || b.type || '',
    Number(b.budget_cents || b.reward_cents || 0),
    now(),
    now()
  ]);

  run('INSERT INTO job_history (id,tenant_id,job_id,user_id,event,created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    publicId('hist'), key.tenant_id, id, null,
    'External API order imported from ' + (b.source || key.label || 'External API'), now()
  ]);

  res.json({ ok: true, job: hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id])) });
});

// POST /api/webhooks/shopify/order
router.post('/webhooks/shopify/order', (req, res) => {
  res.json({ ok: true, note: 'Shopify webhook accepted placeholder. Configure secret verification before live merchant launch.' });
});

// POST /api/webhooks/woocommerce/order
router.post('/webhooks/woocommerce/order', (req, res) => {
  res.json({ ok: true, note: 'WooCommerce plugin can POST orders here after API key setup.' });
});

export default router;
