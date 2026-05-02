import { db, migrate, row, run, now } from './db.js';
import { hashPassword, publicId } from './auth.js';

migrate();

try {
  db.exec("ALTER TABLE clients ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
} catch {}

const tenantId = 'tenant-test-demo';
const teamId = 'team-test-demo';
const passHash = await hashPassword('TestUser123!');

function upsertTenant() {
  if (!row('SELECT id FROM tenants WHERE id=?', [tenantId])) {
    run('INSERT INTO tenants (id,name,plan,billing_email,status,last_active_at,created_at) VALUES (?,?,?,?,?,?,?)', [
      tenantId, 'Test Demo Workspace', 'agency', 'demo@promote4.me', 'active', now(), now()
    ]);
  } else {
    run('UPDATE tenants SET name=?, plan=?, billing_email=?, status=?, last_active_at=? WHERE id=?', [
      'Test Demo Workspace', 'agency', 'demo@promote4.me', 'active', now(), tenantId
    ]);
  }
}

function upsertUser(id, username, email, fullName, role) {
  const existing = row('SELECT id FROM users WHERE id=? OR username=? OR email=?', [id, username, email]);
  if (existing) {
    run('UPDATE users SET tenant_id=?, username=?, email=?, password_hash=?, role=?, full_name=?, status=? WHERE id=?', [
      tenantId, username, email, passHash, role, fullName, 'active', existing.id
    ]);
  } else {
    run('INSERT INTO users (id,tenant_id,username,email,password_hash,role,full_name,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)', [
      id, tenantId, username, email, passHash, role, fullName, 'active', now()
    ]);
  }
}

function upsertTeam() {
  if (!row('SELECT id FROM teams WHERE id=?', [teamId])) {
    run('INSERT INTO teams (id,tenant_id,name,description,created_by,status,created_at) VALUES (?,?,?,?,?,?,?)', [
      teamId, tenantId, 'Test Demo Team', 'Admin, manager, driver, technician, flyer, and client demo workspace.', 'user-test-admin', 'active', now()
    ]);
  } else {
    run('UPDATE teams SET tenant_id=?, name=?, description=?, status=? WHERE id=?', [
      tenantId, 'Test Demo Team', 'Admin, manager, driver, technician, flyer, and client demo workspace.', 'active', teamId
    ]);
  }
}

function upsertMember(id, userId, name, email, phone, role, notes) {
  if (!row('SELECT id FROM team_members WHERE id=?', [id])) {
    run('INSERT INTO team_members (id,tenant_id,team_id,user_id,full_name,email,phone,role,territory,notes,photo_url,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [
      id, tenantId, teamId, userId || null, name, email, phone, role, 'Test Demo Territory', notes, '/uploads/default-member.svg', 'active', now()
    ]);
  } else {
    run('UPDATE team_members SET tenant_id=?, team_id=?, user_id=?, full_name=?, email=?, phone=?, role=?, territory=?, notes=?, status=? WHERE id=?', [
      tenantId, teamId, userId || null, name, email, phone, role, 'Test Demo Territory', notes, 'active', id
    ]);
  }
}

function upsertClient(id, name, email, phone, address, lat, lng, notes) {
  if (!row('SELECT id FROM clients WHERE id=?', [id])) {
    run('INSERT INTO clients (id,tenant_id,name,email,phone,address,lat,lng,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [
      id, tenantId, name, email, phone, address, lat, lng, notes, 'active', now()
    ]);
  } else {
    run('UPDATE clients SET tenant_id=?, name=?, email=?, phone=?, address=?, lat=?, lng=?, notes=?, status=? WHERE id=?', [
      tenantId, name, email, phone, address, lat, lng, notes, 'active', id
    ]);
  }
}

function upsertJob(id, order, type, title, clientId, memberId, source, customer, address, lat, lng, status, instructions) {
  if (!row('SELECT id FROM jobs WHERE id=?', [id])) {
    run(`INSERT INTO jobs (id,tenant_id,team_id,order_number,type,title,client_id,assigned_to,customer_name,customer_email,customer_phone,address,lat,lng,source,status,eta,reward_cents,instructions,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      id, tenantId, teamId, order, type, title, clientId, memberId, customer, 'test-customer@promote4.me', '(555) 900-0000',
      address, lat, lng, source, status, 'Demo ETA', 1000, instructions, now(), now()
    ]);
    run('INSERT INTO job_history (id,tenant_id,job_id,event,created_at) VALUES (?,?,?,?,?)', [
      publicId('hist'), tenantId, id, `Seeded ${source} Test Demo job`, now()
    ]);
  } else {
    run('UPDATE jobs SET tenant_id=?, team_id=?, order_number=?, type=?, title=?, client_id=?, assigned_to=?, customer_name=?, address=?, lat=?, lng=?, source=?, status=?, instructions=?, updated_at=? WHERE id=?', [
      tenantId, teamId, order, type, title, clientId, memberId, customer, address, lat, lng, source, status, instructions, now(), id
    ]);
  }
}

upsertTenant();

upsertUser('user-test-admin', 'Test', 'test-admin@promote4.me', 'Test Demo Admin', 'admin');
upsertUser('user-test-manager', 'TestManager', 'test-manager@promote4.me', 'Test Demo Manager', 'manager');
upsertUser('user-test-member', 'TestMember', 'test-member@promote4.me', 'Test Demo Field Member', 'member');
upsertUser('user-test-client', 'TestClient', 'test-client@promote4.me', 'Test Demo Client', 'user');

upsertTeam();

[
  ['member-test-manager', 'user-test-manager', 'Test Demo Manager', 'manager@promote4.me', '(555) 700-1000', 'Route Manager', 'Dispatch, CRM, and evidence review.'],
  ['member-test-driver', 'user-test-member', 'Test Demo Delivery Driver', 'driver@promote4.me', '(555) 700-1001', 'Delivery Driver', 'Uber Eats, DoorDash, and Grubhub proof.'],
  ['member-test-grocery', null, 'Test Demo Grocery Runner', 'grocery@promote4.me', '(555) 700-1002', 'Delivery Driver', 'Instacart, Shipt, and Walmart Spark proof.'],
  ['member-test-flex', null, 'Test Demo Package Courier', 'flex@promote4.me', '(555) 700-1003', 'Delivery Driver', 'Amazon Flex and Roadie proof.'],
  ['member-test-tech', null, 'Test Demo Lead Tech', 'tech@promote4.me', '(555) 700-1004', 'Lead Tech', 'Technician and contractor proof.'],
  ['member-test-flyer', null, 'Test Demo Flyer Promoter', 'flyer@promote4.me', '(555) 700-1005', 'Flyer Team Member', 'Campus and local board flyer proof.']
].forEach((m) => upsertMember(...m));

[
  ['client-test-restaurant', 'Test Client - Restaurant', 'restaurant@testclient.example', '(555) 800-1001', '220 S Main St, Joplin, MO', 37.0884, -94.5131, 'Food delivery demo client.'],
  ['client-test-grocery', 'Test Client - Grocery Store', 'grocery@testclient.example', '(555) 800-1002', '1501 S Range Line Rd, Joplin, MO', 37.0719, -94.4777, 'Grocery delivery demo client.'],
  ['client-test-shopify', 'Test Client - Shopify Store', 'shopify@testclient.example', '(555) 800-1003', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Shopify/WooCommerce demo client.'],
  ['client-test-residence', 'Test Client - Residence', 'residence@testclient.example', '(555) 800-1004', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102, 'Package and tech proof demo client.'],
  ['client-test-campus', 'Test Client - Campus Flyer Board', 'campus@testclient.example', '(555) 800-1005', '3950 Newman Rd, Joplin, MO', 37.0951, -94.4627, 'Street team flyer proof demo client.']
].forEach((c) => upsertClient(...c));

[
  ['TEST-UBER-001', 'UE-TEST-001', 'Food Delivery', 'Test Uber Eats delivery', 'client-test-restaurant', 'member-test-driver', 'Uber Eats', 'Test Client - Restaurant', '220 S Main St, Joplin, MO', 37.0884, -94.5131, 'Assigned', 'Upload delivery proof for Uber Eats style flow.'],
  ['TEST-DOORDASH-001', 'DD-TEST-001', 'Food Delivery', 'Test DoorDash delivery', 'client-test-restaurant', 'member-test-driver', 'DoorDash', 'Test Client - Restaurant', '220 S Main St, Joplin, MO', 37.0884, -94.5131, 'In Progress', 'Upload door/hand-off proof for DoorDash style flow.'],
  ['TEST-GRUBHUB-001', 'GH-TEST-001', 'Food Delivery', 'Test Grubhub delivery', 'client-test-restaurant', 'member-test-driver', 'Grubhub', 'Test Client - Restaurant', '220 S Main St, Joplin, MO', 37.0884, -94.5131, 'Assigned', 'Upload food handoff proof.'],
  ['TEST-INSTACART-001', 'IC-TEST-001', 'Package Delivery', 'Test Instacart grocery drop', 'client-test-grocery', 'member-test-grocery', 'Instacart', 'Test Client - Grocery Store', '1501 S Range Line Rd, Joplin, MO', 37.0719, -94.4777, 'Assigned', 'Upload grocery delivery proof.'],
  ['TEST-SHIFT-001', 'SHIPT-TEST-001', 'Package Delivery', 'Test Shipt grocery drop', 'client-test-grocery', 'member-test-grocery', 'Shipt', 'Test Client - Grocery Store', '1501 S Range Line Rd, Joplin, MO', 37.0719, -94.4777, 'Assigned', 'Upload Shipt-style proof.'],
  ['TEST-SPARK-001', 'SPARK-TEST-001', 'Package Delivery', 'Test Walmart Spark drop', 'client-test-grocery', 'member-test-grocery', 'Walmart Spark', 'Test Client - Grocery Store', '1501 S Range Line Rd, Joplin, MO', 37.0719, -94.4777, 'Assigned', 'Upload Spark-style proof.'],
  ['TEST-FLEX-001', 'FLEX-TEST-001', 'Package Delivery', 'Test Amazon Flex package', 'client-test-residence', 'member-test-flex', 'Amazon Flex', 'Test Client - Residence', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102, 'Assigned', 'Upload package proof.'],
  ['TEST-ROADIE-001', 'ROADIE-TEST-001', 'Package Delivery', 'Test Roadie courier run', 'client-test-residence', 'member-test-flex', 'Roadie', 'Test Client - Residence', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102, 'Assigned', 'Upload Roadie proof.'],
  ['TEST-SHOPIFY-001', 'SHOP-TEST-001', 'Package Delivery', 'Test Shopify local delivery', 'client-test-shopify', 'member-test-flex', 'Shopify', 'Test Client - Shopify Store', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Out for Delivery', 'Simulated Shopify order import.'],
  ['TEST-WOO-001', 'WC-TEST-001', 'Package Delivery', 'Test WooCommerce local delivery', 'client-test-shopify', 'member-test-flex', 'WooCommerce', 'Test Client - Shopify Store', '302 E 4th St, Joplin, MO', 37.0878, -94.5107, 'Assigned', 'Simulated WooCommerce order import.'],
  ['TEST-FLYER-001', 'FLYER-TEST-001', 'Team Promo', 'Test campus flyer placement', 'client-test-campus', 'member-test-flyer', 'Promote4.me Direct', 'Test Client - Campus Flyer Board', '3950 Newman Rd, Joplin, MO', 37.0951, -94.4627, 'Assigned', 'Post flyer and upload clear proof photo.'],
  ['TEST-TECH-001', 'TECH-TEST-001', 'Technician On-Site', 'Test technician service proof', 'client-test-residence', 'member-test-tech', 'Promote4.me Direct', 'Test Client - Residence', '1202 S Wall Ave, Joplin, MO', 37.0764, -94.5102, 'Assigned', 'Upload completed service proof with GPS.']
].forEach((j) => upsertJob(...j));

console.log('Test Demo Workspace seeded.');
