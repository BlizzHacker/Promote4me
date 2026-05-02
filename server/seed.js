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

// === Public buyer demo users and delivery marketplace seed ===
const demoPasswordHash = await hashPassword("TestUser123!");

function upsertDemoUser({ id, username, email, full_name, role }) {
  const existing = row("SELECT id FROM users WHERE id = ? OR username = ? OR email = ?", [id, username, email]);
  if (existing) {
    run("UPDATE users SET username=?, email=?, password_hash=?, role=?, full_name=?, status=? WHERE id=?", [
      username, email, demoPasswordHash, role, full_name, "active", existing.id
    ]);
  } else {
    run("INSERT INTO users (id, tenant_id, username, email, password_hash, role, full_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, tenantId, username, email, demoPasswordHash, role, full_name, "active", now()
    ]);
  }
}

const demoUsers = [
  { id: "user-demo-admin", username: "Test", email: "demo-admin@promote4.me", full_name: "Demo Admin", role: "admin" },
  { id: "user-demo-manager", username: "TestManager", email: "demo-manager@promote4.me", full_name: "Demo Manager", role: "manager" },
  { id: "user-demo-member", username: "TestMember", email: "demo-member@promote4.me", full_name: "Demo Field Member", role: "member" },
  { id: "user-demo-client", username: "TestClient", email: "demo-client@promote4.me", full_name: "Demo Client Viewer", role: "user" }
];

for (const u of demoUsers) upsertDemoUser(u);

const demoTeamId = "team-public-demo";
if (!row("SELECT id FROM teams WHERE id = ?", [demoTeamId])) {
  run("INSERT INTO teams (id, tenant_id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
    demoTeamId,
    tenantId,
    "Public Demo Team",
    "Buyer demo team with delivery drivers, technicians, flyer promoters, and managers.",
    "user-demo-admin",
    now()
  ]);
}

const demoMembers = [
  ["demo-driver-uber", "Uma Uber Demo", "uma@promote4.me", "(555) 400-1001", "Delivery Driver", "Uber Eats / DoorDash food routes", "/uploads/default-member.svg"],
  ["demo-driver-grocery", "Ivan Instacart Demo", "ivan@promote4.me", "(555) 400-1002", "Delivery Driver", "Instacart / Shipt grocery routes", "/uploads/default-member.svg"],
  ["demo-driver-flex", "Ari Flex Demo", "ari@promote4.me", "(555) 400-1003", "Delivery Driver", "Amazon Flex / Roadie package routes", "/uploads/default-member.svg"],
  ["demo-tech-lead", "Tina Tech Lead", "tina@promote4.me", "(555) 400-1004", "Lead Tech", "Contractor and service proof jobs", "/uploads/default-member.svg"],
  ["demo-flyer-lead", "Frank Flyer Lead", "frank@promote4.me", "(555) 400-1005", "Flyer Team Member", "Street team flyer proof jobs", "/uploads/default-member.svg"]
];

for (const m of demoMembers) {
  if (!row("SELECT id FROM team_members WHERE id = ?", [m[0]])) {
    run("INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, territory, photo_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      m[0], tenantId, demoTeamId, m[1], m[2], m[3], m[4], m[5], m[6], "active", now()
    ]);
  }
}

const demoClients = [
  ["demo-client-burger", "Demo Burger House", "orders@demoburger.example", "(555) 500-1001", "220 S Main St, Joplin, MO", 37.0884, -94.5131],
  ["demo-client-grocery", "Demo Grocery Market", "ops@demogrocery.example", "(555) 500-1002", "1501 S Range Line Rd, Joplin, MO", 37.0719, -94.4777],
  ["demo-client-campus", "Demo Campus Board", "campus@example.com", "(555) 500-1003", "3950 Newman Rd, Joplin, MO", 37.0951, -94.4627],
  ["demo-client-residence", "Demo Residence", "client@example.com", "(555) 500-1004", "1202 S Wall Ave, Joplin, MO", 37.0764, -94.5102],
  ["demo-client-shopify", "Demo Shopify Store", "shopify@example.com", "(555) 500-1005", "302 E 4th St, Joplin, MO", 37.0878, -94.5107]
];

for (const c of demoClients) {
  if (!row("SELECT id FROM clients WHERE id = ?", [c[0]])) {
    run("INSERT INTO clients (id, tenant_id, name, email, phone, address, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      c[0], tenantId, c[1], c[2], c[3], c[4], c[5], c[6], "Seeded public demo client. Safe to edit/delete during demos.", now()
    ]);
  }
}

const demoDeliveryJobs = [
  ["DEMO-UBER-001", "UE-10001", "Food Delivery", "Uber Eats demo delivery", "demo-client-burger", "demo-driver-uber", "Uber Eats", "Demo Burger House", "220 S Main St, Joplin, MO", 37.0884, -94.5131, "Assigned", "Deliver hot food and upload door/hand-off proof."],
  ["DEMO-DOORDASH-001", "DD-10002", "Food Delivery", "DoorDash demo delivery", "demo-client-burger", "demo-driver-uber", "DoorDash", "Demo Burger House", "220 S Main St, Joplin, MO", 37.0884, -94.5131, "In Progress", "Simulated DoorDash order. Upload delivery proof."],
  ["DEMO-INSTACART-001", "IC-10003", "Package Delivery", "Instacart grocery drop", "demo-client-grocery", "demo-driver-grocery", "Instacart", "Demo Grocery Market", "1501 S Range Line Rd, Joplin, MO", 37.0719, -94.4777, "Assigned", "Upload grocery drop-off proof."],
  ["DEMO-GRUBHUB-001", "GH-10004", "Food Delivery", "Grubhub demo delivery", "demo-client-burger", "demo-driver-uber", "Grubhub", "Demo Burger House", "220 S Main St, Joplin, MO", 37.0884, -94.5131, "Assigned", "Upload customer handoff proof."],
  ["DEMO-SHOPIFY-001", "SHOP-10005", "Package Delivery", "Shopify local delivery", "demo-client-shopify", "demo-driver-flex", "Shopify", "Demo Shopify Store", "302 E 4th St, Joplin, MO", 37.0878, -94.5107, "Out for Delivery", "Simulated Shopify order import."],
  ["DEMO-WOO-001", "WC-10006", "Package Delivery", "WooCommerce order delivery", "demo-client-shopify", "demo-driver-flex", "WooCommerce", "Demo Shopify Store", "302 E 4th St, Joplin, MO", 37.0878, -94.5107, "Assigned", "Simulated WooCommerce order import."],
  ["DEMO-SPARK-001", "SPARK-10007", "Package Delivery", "Walmart Spark drop-off", "demo-client-grocery", "demo-driver-grocery", "Walmart Spark", "Demo Grocery Market", "1501 S Range Line Rd, Joplin, MO", 37.0719, -94.4777, "Assigned", "Upload porch proof photo."],
  ["DEMO-FLEX-001", "FLEX-10008", "Package Delivery", "Amazon Flex package proof", "demo-client-residence", "demo-driver-flex", "Amazon Flex", "Demo Residence", "1202 S Wall Ave, Joplin, MO", 37.0764, -94.5102, "Assigned", "Upload delivery proof at address."],
  ["DEMO-ROADIE-001", "ROADIE-10009", "Package Delivery", "Roadie courier job", "demo-client-residence", "demo-driver-flex", "Roadie", "Demo Residence", "1202 S Wall Ave, Joplin, MO", 37.0764, -94.5102, "Assigned", "Upload courier completion proof."],
  ["DEMO-SHIFT-001", "SHIPT-10010", "Package Delivery", "Shipt grocery proof", "demo-client-grocery", "demo-driver-grocery", "Shipt", "Demo Grocery Market", "1501 S Range Line Rd, Joplin, MO", 37.0719, -94.4777, "Assigned", "Upload grocery handoff proof."],
  ["DEMO-FLYER-001", "FLYER-10011", "Team Promo", "Campus flyer board proof", "demo-client-campus", "demo-flyer-lead", "Promote4.me Direct", "Demo Campus Board", "3950 Newman Rd, Joplin, MO", 37.0951, -94.4627, "Assigned", "Post flyer on approved board and upload wide-angle proof."],
  ["DEMO-TECH-001", "TECH-10012", "Technician On-Site", "Lead tech service proof", "demo-client-residence", "demo-tech-lead", "Promote4.me Direct", "Demo Residence", "1202 S Wall Ave, Joplin, MO", 37.0764, -94.5102, "Assigned", "Upload completed repair proof with GPS."],
];

for (const j of demoDeliveryJobs) {
  if (!row("SELECT id FROM jobs WHERE id = ?", [j[0]])) {
    run(`INSERT INTO jobs (id, tenant_id, team_id, order_number, type, title, client_id, assigned_to, customer_name, customer_email, customer_phone, address, lat, lng, source, status, eta, reward_cents, instructions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      j[0], tenantId, demoTeamId, j[1], j[2], j[3], j[4], j[5], j[7], "demo-customer@promote4.me", "(555) 600-0000", j[8], j[9], j[10], j[6], j[11], "Demo ETA", 1000, j[12], now(), now()
    ]);
    run("INSERT INTO job_history (id, tenant_id, job_id, event, created_at) VALUES (?, ?, ?, ?, ?)", [
      publicId("hist"), tenantId, j[0], `Seeded ${j[6]} demo job`, now()
    ]);
  }
}

console.log("Promote4.me public demo users/jobs seeded.");
