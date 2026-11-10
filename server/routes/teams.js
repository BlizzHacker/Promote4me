import { Router } from 'express';
import { row, all, run, now } from '../db.js';
import { hashPassword, getCurrentUser, publicId } from '../auth.js';
import {
  tenantId,
  isOwnerSuperAdmin,
  isDemoAccount,
  csvEscape,
  parseCsv,
  audit,
} from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import { requireNotDemo } from '../middleware/auth.js';
import { roleRank, fieldRoleCatalog, roleCatalog, deliveryServices } from '../constants.js';
import { upload } from '../upload.js';

const router = Router();

// GET /api/crm/catalog
router.get('/crm/catalog', requireAuth, (req, res) => {
  res.json({ roleCatalog, fieldRoleCatalog, deliveryServices });
});

// POST /api/teams
router.post('/teams', requireAuth, requireRole('manager'), (req, res) => {
  const id = publicId('team');
  const { name, description = '' } = req.body;
  run('INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), name, description, req.user.id, now()
  ]);
  audit(req, 'team_created', { team_id: id });
  res.json({ team: row('SELECT * FROM teams WHERE id = ?', [id]) });
});

// POST /api/users
router.post('/users', requireAuth, requireRole('admin'), requireNotDemo(), async (req, res) => {
  const { username, email, password = 'ChangeMe123!', role = 'manager', full_name, phone = '' } = req.body;
  let requestedRole = roleRank[role] ? role : 'manager';
  if (requestedRole === 'super_admin' && !isOwnerSuperAdmin(req.user)) {
    return res.status(403).json({ error: 'Only Wade / Promote4.me owner can create super admins.' });
  }
  if (requestedRole === 'admin' && req.user.role !== 'super_admin') requestedRole = 'manager';
  const id = publicId('user');
  run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), username, email, await hashPassword(password), requestedRole, full_name, phone, now()
  ]);
  audit(req, 'user_created', { target_user_id: id, role: requestedRole });
  res.json({ user: getCurrentUser(id), tempPassword: password });
});

// PATCH /api/users/:id/role
router.patch('/users/:id/role', requireAuth, requireRole('admin'), requireNotDemo(), (req, res) => {
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

// PATCH /api/users/:id
router.patch('/users/:id', requireAuth, requireRole('admin'), requireNotDemo(), async (req, res) => {
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
  if (req.body.password) {
    run('UPDATE users SET password_hash=? WHERE id=? AND tenant_id=?', [
      await hashPassword(req.body.password), req.params.id, tenantId(req)
    ]);
  }
  audit(req, 'user_updated', { target_user_id: req.params.id });
  res.json({ user: getCurrentUser(req.params.id) });
});

// DELETE /api/users/:id
router.delete('/users/:id', requireAuth, requireRole('admin'), requireNotDemo(), (req, res) => {
  const target = row('SELECT * FROM users WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'super_admin' || target.id === req.user.id) {
    return res.status(403).json({ error: 'Cannot delete this account.' });
  }
  run('UPDATE users SET status=? WHERE id=? AND tenant_id=?', ['deleted', req.params.id, tenantId(req)]);
  audit(req, 'user_deleted', { target_user_id: req.params.id });
  res.json({ ok: true });
});

// POST /api/team-members
router.post('/team-members', requireAuth, requireRole('manager'), upload.single('photo'), (req, res) => {
  const id = publicId('member');
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || '';
  const b = req.body;
  run(`INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, pay_rate, territory, photo_url, emergency_contact, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id, tenantId(req), b.team_id, b.full_name, b.email || '', b.phone || '',
    b.role || 'Member', b.pay_rate || '', b.territory || '', photoUrl,
    b.emergency_contact || '', b.notes || '', b.status || 'active', now()
  ]);
  res.json({ member: row('SELECT * FROM team_members WHERE id = ?', [id]) });
});

// GET /api/team-members/export.csv
router.get('/team-members/export.csv', requireAuth, requireRole('manager'), (req, res) => {
  const rows = all(
    'SELECT full_name,email,phone,role,pay_rate,territory,emergency_contact,notes,status,created_at FROM team_members WHERE tenant_id=? ORDER BY full_name',
    [tenantId(req)]
  );
  const headers = ['full_name','email','phone','role','pay_rate','territory','emergency_contact','notes','status','created_at'];
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n');
  audit(req, 'team_members_exported', { count: rows.length });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="promote4me-team-members.csv"');
  res.send(csv);
});

// POST /api/team-members/import
router.post('/team-members/import', requireAuth, requireRole('manager'), (req, res) => {
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
      id, tenantId(req), teamId, fullName.trim(), r.email || '', r.phone || '',
      r.role || 'Field Member', r.pay_rate || '', r.territory || '',
      r.emergency_contact || '', r.notes || '', r.status || 'active', now()
    ]);
    imported++;
  }
  audit(req, 'team_members_imported', { imported, skipped });
  res.json({ imported, skipped });
});

// PATCH /api/team-members/:id
router.patch('/team-members/:id', requireAuth, requireRole('manager'), upload.single('photo'), (req, res) => {
  const existing = row('SELECT * FROM team_members WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'Team member not found.' });
  const b = { ...existing, ...req.body };
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : b.photo_url || existing.photo_url || '';
  run(`UPDATE team_members SET team_id=?, full_name=?, email=?, phone=?, role=?, pay_rate=?, territory=?, photo_url=?, emergency_contact=?, notes=?, status=? WHERE id=? AND tenant_id=?`, [
    b.team_id || existing.team_id, b.full_name, b.email || '', b.phone || '',
    b.role || 'Field Member', b.pay_rate || '', b.territory || '', photoUrl,
    b.emergency_contact || '', b.notes || '', b.status || 'active',
    req.params.id, tenantId(req)
  ]);
  audit(req, 'team_member_updated', { member_id: req.params.id });
  res.json({ member: row('SELECT * FROM team_members WHERE id=?', [req.params.id]) });
});

// DELETE /api/team-members/:id
router.delete('/team-members/:id', requireAuth, requireRole('manager'), (req, res) => {
  const existing = row('SELECT * FROM team_members WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'Team member not found.' });
  run('UPDATE team_members SET status=? WHERE id=? AND tenant_id=?', ['deleted', req.params.id, tenantId(req)]);
  audit(req, 'team_member_deleted', { member_id: req.params.id });
  res.json({ ok: true });
});

export default router;
