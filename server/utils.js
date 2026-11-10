import crypto from 'crypto';
import { db, now, row, all, run } from './db.js';
import { publicId } from './auth.js';
import { config } from './config.js';
import { ownerSuperAdminIds, ownerSuperAdminEmails, roleRank } from './constants.js';

/** Hash a token for storage */
export function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Check if user/tenant is a demo/test account */
export function isDemoAccount(input) {
  const user = input?.user || input || {};
  return user.tenant_id === 'tenant-test-demo' || ['Test','TestManager','TestMember','TestClient'].includes(user.username);
}

/** Check if user is the platform owner super admin */
export function isOwnerSuperAdmin(user) {
  return user?.role === 'super_admin' && 
    (ownerSuperAdminIds.has(user.id) || ownerSuperAdminEmails.has(user.email));
}

/** Get the tenant ID from the request */
export function tenantId(req) {
  return req.user?.tenant_id || 'tenant-moveweight';
}

/** Require minimum role level (middleware factory) */
export function requireRole(role) {
  return (req, res, next) => {
    if ((roleRank[req.user?.role] || 0) < (roleRank[role] || 0)) {
      return res.status(403).json({ error: `${role} access required` });
    }
    next();
  };
}

/** Block demo accounts (middleware factory) */
export function requireNotDemo(message = 'Demo accounts cannot change users, passwords, billing, owner settings, or API secrets.') {
  return (req, res, next) => {
    if (isDemoAccount(req)) return res.status(403).json({ error: message });
    next();
  };
}

/** Check plan limits for job creation */
export function enforceJobLimit(req, res) {
  if (isOwnerSuperAdmin(req.user)) return true;
  const tenant = row('SELECT * FROM tenants WHERE id=?', [tenantId(req)]);
  const plan = config.plans.find(p => p.id === (tenant?.plan || 'free'));
  const limit = plan?.jobs || 0;
  if (!limit) return true;
  const count = row('SELECT COUNT(*) AS n FROM jobs WHERE tenant_id=?', [tenantId(req)])?.n || 0;
  if (count >= limit) {
    res.status(402).json({ error: `Plan limit reached: ${limit} jobs for ${tenant?.plan || 'free'} plan. Upgrade to continue.` });
    return false;
  }
  return true;
}

/** Record an audit event */
export function audit(req, event, metadata = {}) {
  try {
    run('INSERT INTO audit_events (id, tenant_id, user_id, event, ip, user_agent, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      publicId('audit'),
      req.user?.tenant_id || metadata.tenant_id || null,
      req.user?.id || metadata.user_id || null,
      event,
      req.ip || '',
      req.headers?.['user-agent'] || '',
      JSON.stringify(metadata),
      now()
    ]);
  } catch {}
}

/** Update tenant last_active_at */
export function updateTenantActivity(tid) {
  run('UPDATE tenants SET last_active_at=? WHERE id=?', [now(), tid]);
}

/** Get a job by ID or order number */
export function publicJob(idOrOrder) {
  return row('SELECT * FROM jobs WHERE id = ? OR order_number = ?', [idOrOrder, idOrOrder]);
}

/** Calculate distance in feet between two GPS coordinates */
export function distanceFeet(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = (v) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 3.28084);
}

/** Score GPS evidence against a job location */
export function scoreEvidence({ job, lat, lng, accuracyRadiusFeet = 350 }) {
  if (lat == null || lng == null || job.lat == null || job.lng == null) {
    return { distance: null, score: 30, verdict: 'GPS missing', warnings: ['GPS was missing or unavailable. Evidence is saved, but reward/client approval should be manual.'] };
  }
  const distance = distanceFeet(Number(lat), Number(lng), Number(job.lat), Number(job.lng));
  if (distance <= accuracyRadiusFeet) {
    return { distance, score: Math.max(90, 100 - Math.round(distance / 25)), verdict: 'High confidence', warnings: [] };
  }
  if (distance <= accuracyRadiusFeet * 3) {
    return { distance, score: 65, verdict: 'Medium confidence', warnings: [`GPS was ${distance} ft from the expected location.`] };
  }
  return { distance, score: 35, verdict: 'Low confidence', warnings: [`GPS was ${distance} ft from the expected location. Review before paying or approving.`] };
}

/** Hydrate a job object with evidence and history */
export function hydrateJob(job) {
  if (!job) return null;
  return {
    ...job,
    evidence: all('SELECT * FROM evidence WHERE job_id = ? ORDER BY created_at DESC', [job.id]).map((e) => ({
      ...e,
      warnings: JSON.parse(e.warnings || '[]')
    })),
    history: all('SELECT * FROM job_history WHERE job_id = ? ORDER BY created_at DESC', [job.id])
  };
}

/** Seed demo data for a new tenant */
export function seedDemoForTenant(tid, userId, companyName) {
  const teamId = publicId('team');
  run('INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    teamId, tid, `${companyName} Demo Team`, 'Erase or edit this demo team when ready.', userId, now()
  ]);
  const memberId = publicId('member');
  run('INSERT INTO team_members (id, tenant_id, team_id, user_id, full_name, email, phone, role, territory, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    memberId, tid, teamId, userId, 'Demo Field Member', '', '', 'Promoter / Driver', 'Downtown demo area', 'This demo member can be erased.', now()
  ]);
  const clientId = publicId('client');
  run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    clientId, tid, 'Demo Coffee Shop', '', '', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Demo client. Erase when done testing.', now()
  ]);
  const jobId = `P4-DEMO-${Date.now().toString().slice(-5)}`;
  run(`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    jobId, tid, teamId, clientId, memberId, 'Team Promo', 'Demo flyer proof job', 'DEMO-ORDER', 'Demo', 'Demo Coffee Shop',
    '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Assigned', 'Today', 1200,
    'Upload a proof photo and let Promote4.me score GPS accuracy.', now(), now()
  ]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    publicId('hist'), tid, jobId, userId, 'Demo job created for new account', now()
  ]);
}

/** CSV helpers */
export function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

export function parseCsv(text) {
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
