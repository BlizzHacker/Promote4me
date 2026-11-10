import { Router } from 'express';
import { row, all } from '../db.js';
import { getCurrentUser } from '../auth.js';
import { tenantId, isDemoAccount, hydrateJob, updateTenantActivity } from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { roleRank, roleCatalog, fieldRoleCatalog, deliveryServices, publicPlans, mapProviders, paymentProviders } from '../constants.js';

const router = Router();

// GET /api/training
router.get('/training', requireAuth, (req, res) => res.json({
  role: req.user.role,
  demo: isDemoAccount(req.user),
  modules: [
    { id: 'quickstart', title: 'Quick Start', steps: ['Create a client/location', 'Create or sync a job', 'Assign a team member', 'Upload proof', 'Approve or reject evidence'] },
    { id: 'proof', title: 'Proof Review', steps: ['Check GPS confidence', 'Review browser GPS and uploaded photo', 'Look for warnings', 'Approve only when proof matches location'] },
    { id: 'integrations', title: 'Integrations', steps: ['Open Add-ons', 'Run demo sync', 'Add live API credentials when ready', 'Confirm connected status'] },
    { id: 'roles', title: 'Roles and Access', steps: ['Super admin sees all product hierarchy', 'Admins see their company only', 'Managers run operations', 'Members upload proof', 'Clients view history'] }
  ]
}));

// GET /api/bootstrap
router.get('/bootstrap', requireAuth, (req, res) => {
  const tid = tenantId(req);
  updateTenantActivity(tid);
  res.json({
    tenant: row('SELECT * FROM tenants WHERE id = ?', [tid]),
    roles: Object.keys(roleRank),
    roleCatalog,
    fieldRoleCatalog,
    deliveryServices,
    plans: publicPlans,
    mapProviders,
    paymentProviders,
    users: all('SELECT id, username, email, role, full_name, phone, photo_url, status, email_verified_at, last_login_at FROM users WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    teams: all('SELECT * FROM teams WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    teamMembers: all('SELECT * FROM team_members WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    clients: all('SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    jobs: all('SELECT * FROM jobs WHERE tenant_id = ? ORDER BY created_at DESC', [tid]).map(hydrateJob),
    integrations: all('SELECT * FROM integrations WHERE tenant_id = ? ORDER BY created_at DESC', [tid]),
    audit: all('SELECT * FROM audit_events WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 100', [tid])
  });
});

export default router;
