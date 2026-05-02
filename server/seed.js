import { migrate, row, run, now } from './db.js';
import { hashPassword, publicId } from './auth.js';

migrate();

const tenantId = 'tenant-moveweight';
const existingTenant = row('SELECT id FROM tenants WHERE id = ?', [tenantId]);
if (!existingTenant) {
  run('INSERT INTO tenants (id, name, plan, created_at) VALUES (?, ?, ?, ?)', [tenantId, 'MoveWeight / Promote4.me', 'super', now()]);
}

const passwordHash = await hashPassword(process.env.P4ME_SUPER_ADMIN_PASSWORD || '123Pass!');
const superUsers = [
  { id: 'user-super-moveweight', username: 'moveweight', email: 'me@moveweight.com', full_name: 'Wade Ivy' },
  { id: 'user-super-wadegmail', username: 'wadeivy11', email: 'wadeivy11@gmail.com', full_name: 'Wade Ivy' },
];
for (const user of superUsers) {
  const exists = row('SELECT id FROM users WHERE email = ?', [user.email]);
  if (!exists) {
    run('INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      user.id, tenantId, user.username, user.email, passwordHash, 'super_admin', user.full_name, now(),
    ]);
  }
}

const teamId = 'team-default';
if (!row('SELECT id FROM teams WHERE id = ?', [teamId])) {
  run('INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [teamId, tenantId, 'Default Team', 'Promoters, drivers, technicians, and contractors.', 'user-super-moveweight', now()]);
}

const members = [
  ['member-alex', 'Alex Street', 'alex@promote4.me', '(555) 201-2001', 'Promoter', 'Flyer placement and street team work', '/uploads/default-member.svg'],
  ['member-morgan', 'Morgan Courier', 'morgan@promote4.me', '(555) 201-2002', 'Driver', 'Food and package delivery', '/uploads/default-member.svg'],
  ['member-taylor', 'Taylor Tech', 'taylor@promote4.me', '(555) 201-2003', 'Technician', 'On-site proof and service calls', '/uploads/default-member.svg'],
];
for (const m of members) {
  if (!row('SELECT id FROM team_members WHERE id = ?', [m[0]])) {
    run('INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, territory, photo_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [m[0], tenantId, teamId, m[1], m[2], m[3], m[4], m[5], m[6], now()]);
  }
}

const clients = [
  ['client-coffee', 'Joplin Coffee Co.', 'owner@coffee.example', '(555) 991-1000', '302 E 4th St, Joplin, MO', 37.0878, -94.5107],
  ['client-residence', 'Walker Residence', 'jamie@example.com', '(555) 991-3000', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102],
  ['client-restaurant', 'Central Plaza Restaurant', 'orders@restaurant.example', '(555) 991-2000', '201 S Main St, Joplin, MO', 37.0842, -94.5133],
];
for (const c of clients) {
  if (!row('SELECT id FROM clients WHERE id = ?', [c[0]])) {
    run('INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [c[0], tenantId, c[1], c[2], c[3], c[4], c[5], c[6], now()]);
  }
}

const jobs = [
  ['P4-1001', 'SHOP-1042', 'Package Delivery', 'Shopify package delivery', 'client-residence', 'member-morgan', 'Jamie Walker', 'jamie@example.com', '(555) 991-3000', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102, 'Shopify', 'Out for Delivery', 'Today 3:30 PM', 800, 'Deliver package and upload front-door proof photo.'],
  ['P4-1002', 'TEAM-221', 'Team Promo', 'Coffee shop flyer placement', 'client-coffee', 'member-alex', 'Joplin Coffee Co.', 'owner@coffee.example', '(555) 991-1000', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Manual', 'Assigned', 'Today 5:15 PM', 1200, 'Place flyers on approved community board. Upload clear photo showing flyer and surrounding location.'],
  ['P4-1003', 'WC-7781', 'Food Delivery', 'WooCommerce catering delivery', 'client-restaurant', 'member-morgan', 'Central Plaza Restaurant', 'orders@restaurant.example', '(555) 991-2000', '201 S Main St, Joplin, MO', 37.0842, -94.5133, 'WooCommerce', 'Assigned', 'Tomorrow 10:00 AM', 600, 'Deliver catering order and collect photo confirmation if requested.'],
  ['P4-1004', 'TECH-501', 'Technician On-Site', 'Service call proof', 'client-residence', 'member-taylor', 'Walker Residence', 'jamie@example.com', '(555) 991-3000', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102, 'Manual', 'Assigned', 'Friday 1:00 PM', 2500, 'Photograph installed part or completed repair. GPS must match client location for reward approval.'],
];
for (const j of jobs) {
  if (!row('SELECT id FROM jobs WHERE id = ?', [j[0]])) {
    run(`INSERT INTO jobs (id, tenant_id, team_id, order_number, type, title, client_id, assigned_to, customer_name, customer_email, customer_phone, address, lat, lng, source, status, eta, reward_cents, instructions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [j[0], tenantId, teamId, j[1], j[2], j[3], j[4], j[5], j[6], j[7], j[8], j[9], j[10], j[11], j[12], j[13], j[14], j[15], j[16], now(), now()]);
    run('INSERT INTO job_history (id, tenant_id, job_id, event, created_at) VALUES (?, ?, ?, ?, ?)', [publicId('hist'), tenantId, j[0], `Seeded ${j[2]} job`, now()]);
  }
}

console.log('Promote4.me database seeded.');
