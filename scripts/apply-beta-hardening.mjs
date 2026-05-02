import fs from 'fs';

function replaceOnce(haystack, needle, replacement, label) {
  if (!haystack.includes(needle)) {
    console.log(`skip ${label}: pattern not found`);
    return haystack;
  }
  return haystack.replace(needle, replacement);
}

// -------------------------
// Server hardening
// -------------------------
const serverPath = 'server/index.js';
let server = fs.readFileSync(serverPath, 'utf8');

if (!server.includes('function isDemoAccount')) {
  server = replaceOnce(server,
`function tenantId(req) { return req.user?.tenant_id || 'tenant-moveweight'; }`,
`function tenantId(req) { return req.user?.tenant_id || 'tenant-moveweight'; }
function isDemoAccount(input) {
  const user = input?.user || input || {};
  return user.tenant_id === 'tenant-test-demo' || ['Test','TestManager','TestMember','TestClient'].includes(user.username);
}
function requireNotDemo(message = 'Demo accounts cannot change users, passwords, billing, owner settings, or API secrets.') {
  return (req, res, next) => {
    if (isDemoAccount(req)) return res.status(403).json({ error: message });
    next();
  };
}
function getPlanLimit(planId, field) {
  return (publicPlans.find((p) => p.id === planId)?.[field]) ?? 0;
}
function enforceJobLimit(req, res) {
  if (isOwnerSuperAdmin(req.user)) return true;
  const tenant = row('SELECT * FROM tenants WHERE id=?', [tenantId(req)]);
  const limit = getPlanLimit(tenant?.plan || 'free', 'jobs');
  if (!limit) return true;
  const count = row('SELECT COUNT(*) AS n FROM jobs WHERE tenant_id=?', [tenantId(req)])?.n || 0;
  if (count >= limit) {
    res.status(402).json({ error: \`Plan limit reached: \${limit} jobs for \${tenant?.plan || 'free'} plan. Upgrade to continue.\` });
    return false;
  }
  return true;
}`,
'insert demo/plan helpers');
}

// Demo accounts cannot mutate user accounts, roles, passwords, or settings.
server = server.replace("app.post('/api/users', requireAuth, requireRole('admin'),", "app.post('/api/users', requireAuth, requireRole('admin'), requireNotDemo(),");
server = server.replace("app.patch('/api/users/:id/role', requireAuth, requireRole('admin'),", "app.patch('/api/users/:id/role', requireAuth, requireRole('admin'), requireNotDemo(),");
server = server.replace("app.patch('/api/users/:id', requireAuth, requireRole('admin'),", "app.patch('/api/users/:id', requireAuth, requireRole('admin'), requireNotDemo(),");
server = server.replace("app.delete('/api/users/:id', requireAuth, requireRole('admin'),", "app.delete('/api/users/:id', requireAuth, requireRole('admin'), requireNotDemo(),");
server = server.replace("app.patch('/api/settings', requireAuth, requireRole('admin'),", "app.patch('/api/settings', requireAuth, requireRole('admin'), requireNotDemo(),");

// Block password resets for demo accounts.
if (!server.includes("Demo accounts cannot reset passwords")) {
  server = server.replace(
"app.post('/api/auth/reset-password', async (req, res) => { const { token, password } = req.body || {}; const found = all('SELECT * FROM password_reset_tokens WHERE used_at IS NULL').find((t) => t.token_hash === tokenHash(token || '') && new Date(t.expires_at) > new Date()); if (!found) return res.status(400).json({ error: 'Invalid or expired reset token.' }); run('UPDATE users SET password_hash=?, status=? WHERE id=?', [await hashPassword(password), 'active', found.user_id]); run('UPDATE password_reset_tokens SET used_at=? WHERE id=?', [now(), found.id]); res.json({ ok: true }); });",
"app.post('/api/auth/reset-password', async (req, res) => { const { token, password } = req.body || {}; const found = all('SELECT * FROM password_reset_tokens WHERE used_at IS NULL').find((t) => t.token_hash === tokenHash(token || '') && new Date(t.expires_at) > new Date()); if (!found) return res.status(400).json({ error: 'Invalid or expired reset token.' }); const target = row('SELECT * FROM users WHERE id=?', [found.user_id]); if (isDemoAccount(target)) return res.status(403).json({ error: 'Demo accounts cannot reset passwords.' }); run('UPDATE users SET password_hash=?, status=? WHERE id=?', [await hashPassword(password), 'active', found.user_id]); run('UPDATE password_reset_tokens SET used_at=? WHERE id=?', [now(), found.id]); res.json({ ok: true }); });"
  );
}

// Add client edit/delete if absent.
if (!server.includes("app.patch('/api/clients/:id'")) {
  server = server.replace(
"app.post('/api/clients', requireAuth, requireRole('manager'), (req, res) => { const id = publicId('client'); const b = req.body; run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), b.name, b.email || '', b.phone || '', b.address || '', b.lat || null, b.lng || null, b.notes || '', now()]); res.json({ client: row('SELECT * FROM clients WHERE id = ?', [id]) }); });",
`app.post('/api/clients', requireAuth, requireRole('manager'), (req, res) => { const id = publicId('client'); const b = req.body; run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenantId(req), b.name, b.email || '', b.phone || '', b.address || '', b.lat || null, b.lng || null, b.notes || '', now()]); res.json({ client: row('SELECT * FROM clients WHERE id = ?', [id]) }); });
app.patch('/api/clients/:id', requireAuth, requireRole('manager'), (req, res) => { const existing = row('SELECT * FROM clients WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]); if (!existing) return res.status(404).json({ error: 'Client not found.' }); const b = { ...existing, ...req.body }; run('UPDATE clients SET name=?, email=?, phone=?, address=?, lat=?, lng=?, notes=?, status=? WHERE id=? AND tenant_id=?', [b.name, b.email || '', b.phone || '', b.address || '', b.lat || null, b.lng || null, b.notes || '', b.status || 'active', req.params.id, tenantId(req)]); audit(req, 'client_updated', { client_id: req.params.id }); res.json({ client: row('SELECT * FROM clients WHERE id=?', [req.params.id]) }); });
app.delete('/api/clients/:id', requireAuth, requireRole('manager'), (req, res) => { const existing = row('SELECT * FROM clients WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]); if (!existing) return res.status(404).json({ error: 'Client not found.' }); run('UPDATE clients SET status=? WHERE id=? AND tenant_id=?', ['deleted', req.params.id, tenantId(req)]); audit(req, 'client_deleted', { client_id: req.params.id }); res.json({ ok: true }); });`
  );
}

// Add demo integration sync endpoint if absent.
if (!server.includes("app.post('/api/integrations/simulate/:provider'")) {
  server = server.replace(
"app.post('/api/jobs', requireAuth, requireRole('manager'),",
`app.post('/api/integrations/simulate/:provider', requireAuth, requireRole('manager'), (req, res) => {
  const provider = String(req.params.provider || 'Promote4.me Direct').replaceAll('-', ' ');
  const tid = tenantId(req);
  if (!enforceJobLimit(req, res)) return;
  const team = row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1', [tid]);
  const member = row('SELECT id FROM team_members WHERE tenant_id=? AND status != ? ORDER BY created_at DESC LIMIT 1', [tid, 'deleted']);
  const client = row('SELECT * FROM clients WHERE tenant_id=? AND COALESCE(status, ?) != ? ORDER BY created_at DESC LIMIT 1', [tid, 'active', 'deleted']);
  const id = \`P4-SYNC-\${Date.now().toString().slice(-6)}\`;
  const orderNumber = \`${provider.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-\${Date.now().toString().slice(-5)}\`;
  run(\`INSERT INTO jobs (id, tenant_id, team_id, client_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, [id, tid, team?.id || null, client?.id || null, member?.id || null, provider.match(/uber|door|grub/i) ? 'Food Delivery' : 'Package Delivery', \`${provider} synced demo order\`, orderNumber, provider, client?.name || 'Demo Customer', client?.email || 'demo-customer@promote4.me', client?.phone || '(555) 600-0000', client?.address || '302 E 4th St, Joplin, MO', client?.lat || 37.0878, client?.lng || -94.5107, 'Assigned', 'Synced just now', 1000, \`Simulated ${provider} API sync. Add live credentials in Integrations to turn this into production sync.\`, now(), now()]);
  run('INSERT INTO job_history (id, tenant_id, job_id, user_id, event, created_at) VALUES (?, ?, ?, ?, ?, ?)', [publicId('hist'), tid, id, req.user.id, \`${provider} demo sync created job\`, now()]);
  audit(req, 'integration_demo_sync', { provider, job_id: id });
  res.json({ ok: true, provider, job: hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id])) });
});
app.post('/api/jobs', requireAuth, requireRole('manager'),`
  );
}

// Enforce plan job limits on manual jobs.
server = server.replace(
"app.post('/api/jobs', requireAuth, requireRole('manager'), (req, res) => { const id = req.body.id || `P4-${Date.now().toString().slice(-6)}`;",
"app.post('/api/jobs', requireAuth, requireRole('manager'), (req, res) => { if (!enforceJobLimit(req, res)) return; const id = req.body.id || `P4-${Date.now().toString().slice(-6)}`;"
);

// Training endpoint.
if (!server.includes("app.get('/api/training'")) {
  server = server.replace(
"app.get('/api/me', requireAuth, (req, res) => res.json({ user: getCurrentUser(req.user.id) }));",
`app.get('/api/me', requireAuth, (req, res) => res.json({ user: getCurrentUser(req.user.id) }));
app.get('/api/training', requireAuth, (req, res) => res.json({
  role: req.user.role,
  demo: isDemoAccount(req.user),
  modules: [
    { id: 'quickstart', title: 'Quick Start', steps: ['Create a client/location', 'Create or sync a job', 'Assign a team member', 'Upload proof', 'Approve or reject evidence'] },
    { id: 'proof', title: 'Proof Review', steps: ['Check GPS confidence', 'Review browser GPS and uploaded photo', 'Look for warnings', 'Approve only when proof matches location'] },
    { id: 'integrations', title: 'Integrations', steps: ['Open Add-ons', 'Run demo sync', 'Add live API credentials when ready', 'Confirm connected status'] },
    { id: 'roles', title: 'Roles and Access', steps: ['Super admin sees all product hierarchy', 'Admins see their company only', 'Managers run operations', 'Members upload proof', 'Clients view history'] }
  ]
}));`
  );
}

fs.writeFileSync(serverPath, server);

// -------------------------
// Frontend hardening
// -------------------------
const appPath = 'src/ProductApp.jsx';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('const demoUsernames')) {
  app = app.replace(
"const fieldRoles = [\"Lead Tech\", \"Dispatcher\", \"Route Manager\", \"Technician\", \"Plumber\", \"Electrician\", \"Delivery Driver\", \"Flyer Team Member\", \"Promoter\", \"Contractor\", \"Customer Service\", \"Client Viewer\"];",
`const fieldRoles = ["Lead Tech", "Dispatcher", "Route Manager", "Technician", "Plumber", "Electrician", "Delivery Driver", "Flyer Team Member", "Promoter", "Contractor", "Customer Service", "Client Viewer"];
const demoUsernames = ["Test", "TestManager", "TestMember", "TestClient"];
function isDemoUser(user) { return user?.tenant_id === "tenant-test-demo" || demoUsernames.includes(user?.username); }
function canSeeTab(user, tab) {
  const role = user?.role;
  if (role === "super_admin") return true;
  if (role === "admin") return !["super_admin"].includes(tab);
  if (role === "manager") return ["dashboard", "jobs", "review", "map", "team", "clients", "training"].includes(tab);
  if (role === "member") return ["dashboard", "jobs", "review", "map", "training"].includes(tab);
  return ["dashboard", "jobs", "map", "training"].includes(tab);
}`
  );
}

app = app.replace(
"    [\"addons\", \"Add-ons\", Store],\n    [\"settings\", \"Settings\", Settings],",
"    [\"addons\", \"Add-ons\", Store],\n    [\"training\", \"Training\", ShieldCheck],\n    [\"settings\", \"Settings\", Settings],"
);

app = app.replace(
"          {menu.map(([id, label, Icon]) => (",
"          {menu.filter(([id]) => canSeeTab(session.user, id)).map(([id, label, Icon]) => ("
);

app = app.replace(
"        {active === \"settings\" && <SettingsPanel {...props} />}",
"        {active === \"training\" && <TrainingPanel user={session.user} />}\n        {active === \"settings\" && <SettingsPanel {...props} />}"
);

if (!app.includes('function TrainingPanel')) {
  app = app.replace(
"function SettingsPanel({ boot, reload, setNotice }) {",
`function TrainingPanel({ user }) {
  const modules = [
    ["1", "Create a client/location", "Add a customer, store, restaurant, campus board, residence, or job site."],
    ["2", "Create or sync work", "Create a job manually or use Add-ons to simulate DoorDash, Uber Eats, Shopify, WooCommerce, Roadie, Spark, Flex, Shipt, or Instacart."],
    ["3", "Assign the team", "Assign a driver, flyer promoter, technician, route manager, or contractor."],
    ["4", "Upload proof", "Field members upload a photo from mobile. Promote4.me scores GPS confidence and flags missing GPS."],
    ["5", "Review and approve", "Managers/admins approve, reject, or request better evidence before payment or client sign-off."],
  ];
  return <div className="content-grid"><section className="panel wide"><h3>Interactive Training</h3><p className="hint">Role: {user?.role}. Demo accounts can explore without changing passwords, roles, billing, or API secrets.</p><div className="training-grid">{modules.map(([n,t,d]) => <article key={n}><strong>{n}. {t}</strong><p>{d}</p><label className="check-line"><input type="checkbox"/> Mark complete</label></article>)}</div></section><section className="panel"><h3>Beta checklist</h3><ul className="clean-list"><li>Run one provider demo sync.</li><li>Create a client/location.</li><li>Create one job.</li><li>Upload mobile proof.</li><li>Review GPS confidence.</li></ul></section></div>;
}

function SettingsPanel({ boot, reload, setNotice }) {`
  );
}

// Demo UI guardrails.
app = app.replace(
"function SettingsPanel({ boot, reload, setNotice }) {",
"function SettingsPanel({ boot, reload, setNotice }) {"
);

// Add warning to Settings panel body.
app = app.replace(
"<h3><Settings /> Company settings</h3>",
"<h3><Settings /> Company settings</h3>{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}"
);

const cssPath = 'src/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('BETA HARDENING PATCH')) {
  css += `

/* BETA HARDENING PATCH */
.training-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:16px}.training-grid article{border:1px solid rgba(125,211,252,.18);background:rgba(255,255,255,.05);border-radius:18px;padding:16px}.warning{border:1px solid rgba(251,191,36,.35);background:rgba(251,191,36,.12);color:#fde68a;border-radius:14px;padding:12px;margin:10px 0}.sidebar nav button[disabled]{opacity:.45;cursor:not-allowed}
`;
}
fs.writeFileSync(cssPath, css);
fs.writeFileSync(appPath, app);
console.log('Applied beta hardening: tenant isolation UI, role menus, demo protections, training page, plan job limits.');
