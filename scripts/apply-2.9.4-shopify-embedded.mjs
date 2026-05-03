import fs from 'fs';

const has = (s, x) => s.includes(x);
console.log('Applying Promote4.me 2.9.4 Shopify embedded app and integrations redesign...');

// ---------- package/version ----------
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '2.9.4';
if (!pkg.scripts.prebuild.includes('apply-2.9.4-shopify-embedded.mjs')) {
  pkg.scripts.prebuild += ' && node scripts/apply-2.9.4-shopify-embedded.mjs';
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

// ---------- backend ----------
let server = fs.readFileSync('server/index.js', 'utf8');
server = server.replace(/app\.get\('\/api\/health', \(req, res\) => res\.json\(\{ ok: true, product: 'Promote4\.me', version: '[^']+' \}\)\);/, "app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.9.4' }));");

if (!has(server, 'function p4me294ShopifySchema')) {
  server = server.replace('migrate();', `migrate();
function p4me294ShopifySchema() {
  const add = (table, column, definition) => { try { run('ALTER TABLE ' + table + ' ADD COLUMN ' + column + ' ' + definition); } catch {} };
  add('jobs', 'work_mode', "TEXT NOT NULL DEFAULT 'in_person'");
  add('jobs', 'visibility', "TEXT NOT NULL DEFAULT 'private'");
  add('jobs', 'is_public', 'INTEGER NOT NULL DEFAULT 0');
  add('jobs', 'trade', "TEXT NOT NULL DEFAULT ''");
  add('jobs', 'budget_cents', 'INTEGER NOT NULL DEFAULT 0');
  add('jobs', 'external_payload_json', "TEXT NOT NULL DEFAULT '{}'");
  add('jobs', 'line_items_json', "TEXT NOT NULL DEFAULT '[]'");
  add('jobs', 'proof_checklist_json', "TEXT NOT NULL DEFAULT '[]'");
  add('jobs', 'staffer_packet_json', "TEXT NOT NULL DEFAULT '{}'");
  add('jobs', 'admin_url', "TEXT NOT NULL DEFAULT ''");
  add('jobs', 'payment_method', "TEXT NOT NULL DEFAULT ''");
  add('jobs', 'order_total_cents', 'INTEGER NOT NULL DEFAULT 0');
  add('jobs', 'order_items_summary', "TEXT NOT NULL DEFAULT ''");
  run("CREATE TABLE IF NOT EXISTS shopify_connections (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, shop TEXT NOT NULL, access_token TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'beta', scopes TEXT NOT NULL DEFAULT '', created_at TEXT, updated_at TEXT, last_sync_at TEXT)");
  run("CREATE TABLE IF NOT EXISTS integration_logs (id TEXT PRIMARY KEY, tenant_id TEXT, provider TEXT NOT NULL, level TEXT NOT NULL, message TEXT NOT NULL, payload_json TEXT NOT NULL DEFAULT '{}', created_at TEXT)");
}
p4me294ShopifySchema();`);
}

if (!has(server, "app.get('/api/shopify/status'")) {
  const shopifyEndpoints = `
function p4meDefaultTenantId() { const t = row("SELECT id FROM tenants WHERE id='tenant-moveweight'") || row('SELECT id FROM tenants ORDER BY created_at LIMIT 1'); return t?.id || 'tenant-moveweight'; }
function p4meLog(provider, level, message, payload = {}, tenant = p4meDefaultTenantId()) { try { run('INSERT INTO integration_logs (id,tenant_id,provider,level,message,payload_json,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [publicId('log'), tenant, provider, level, message, JSON.stringify(payload), now()]); } catch {} }
function p4meCreateShopifyJob(payload = {}) {
  const tenant = p4meDefaultTenantId();
  const team = row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1', [tenant]);
  const member = row('SELECT id FROM team_members WHERE tenant_id=? AND COALESCE(status,?) != ? ORDER BY created_at DESC LIMIT 1', [tenant, 'active', 'deleted']);
  const orderNumber = payload.order_number || payload.name || ('SHOPIFY-' + Date.now().toString().slice(-6));
  const id = 'SHOPIFY-' + Date.now().toString().slice(-6);
  const items = Array.isArray(payload.line_items) ? payload.line_items.map((i) => ({ name: i.title || i.name || 'Item', quantity: i.quantity || 1, sku: i.sku || '', product_id: i.product_id || '', total_cents: Math.round(Number(i.price || 0) * 100) })) : [{ name: 'Shopify demo product', quantity: 1, sku: 'P4ME-SHOPIFY', total_cents: 2400 }];
  const checklist = [{ id: 'arrive', label: 'Arrive at customer/site location', required: true }, { id: 'items', label: 'Confirm Shopify line items', required: true }, { id: 'photo', label: 'Upload GPS/photo proof', required: true }, { id: 'notes', label: 'Submit completion notes', required: false }];
  const customer = payload.customer || {};
  const shipping = payload.shipping_address || {};
  const address = payload.address || [shipping.address1, shipping.address2, shipping.city, shipping.province, shipping.zip].filter(Boolean).join(', ') || '302 E 4th St, Joplin, MO';
  const packet = { source: 'Shopify', order_number: orderNumber, customer: { name: payload.customer_name || [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Shopify Customer', email: payload.email || customer.email || '', phone: payload.phone || shipping.phone || '' }, address, line_items: items, checklist, payment: { method: payload.payment_gateway_names?.join(', ') || 'Shopify', total_cents: Math.round(Number(payload.total_price || 24) * 100) }, admin_url: payload.admin_url || '', staffer_instructions: 'Verify Shopify order items, complete the delivery/service, upload GPS/photo proof, then submit for approval.' };
  run('INSERT INTO jobs (id,tenant_id,team_id,assigned_to,type,title,order_number,source,customer_name,customer_email,customer_phone,address,lat,lng,status,eta,reward_cents,instructions,work_mode,visibility,is_public,trade,budget_cents,created_at,updated_at,external_payload_json,line_items_json,proof_checklist_json,staffer_packet_json,admin_url,payment_method,order_total_cents,order_items_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, tenant, team?.id || null, member?.id || null, 'Package Delivery', 'Shopify Order ' + orderNumber, orderNumber, 'Shopify', packet.customer.name, packet.customer.email, packet.customer.phone, address, payload.lat || null, payload.lng || null, 'Assigned', payload.eta || '', Number(payload.reward_cents || 0), packet.staffer_instructions, payload.work_mode || 'in_person', payload.visibility || 'private', payload.is_public ? 1 : 0, payload.trade || 'Shopify Fulfillment', Number(payload.budget_cents || 0), now(), now(), JSON.stringify(payload), JSON.stringify(items), JSON.stringify(checklist), JSON.stringify(packet), packet.admin_url, packet.payment.method, packet.payment.total_cents, items.map((i) => (i.quantity || 1) + ' × ' + i.name).join(', ')]);
  p4meLog('shopify', 'success', 'Created Shopify work packet ' + id, { id, orderNumber }, tenant);
  return hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id]));
}
app.get('/api/shopify/status', (req, res) => {
  const tenant = p4meDefaultTenantId();
  const jobs = all("SELECT * FROM jobs WHERE source='Shopify' ORDER BY created_at DESC LIMIT 20");
  const logs = all("SELECT * FROM integration_logs WHERE provider='shopify' ORDER BY created_at DESC LIMIT 20");
  const conn = row("SELECT * FROM shopify_connections WHERE tenant_id=? ORDER BY updated_at DESC LIMIT 1", [tenant]);
  res.json({ ok: true, version: '2.9.4', embedded: true, connection: conn || { shop: 'Promote4Me Beta', status: 'not_connected', scopes: 'read_orders,read_products,read_customers,read_locations,read_fulfillments,write_fulfillments' }, counts: { imported: jobs.length, pending: jobs.filter((j) => j.status === 'Assigned').length, submitted: jobs.filter((j) => j.status === 'Submitted').length }, jobs, logs });
});
app.get('/api/shopify/orders', (req, res) => { res.json({ orders: all("SELECT * FROM jobs WHERE source='Shopify' ORDER BY created_at DESC LIMIT 100") }); });
app.post('/api/shopify/test-order', (req, res) => { const job = p4meCreateShopifyJob(req.body || {}); res.json({ ok: true, job }); });
app.post('/api/shopify/webhooks/orders-create', (req, res) => { const job = p4meCreateShopifyJob(req.body || {}); res.json({ ok: true, job_id: job.id }); });
app.post('/api/shopify/webhooks/orders-paid', (req, res) => { const job = p4meCreateShopifyJob({ ...(req.body || {}), status: 'Assigned' }); res.json({ ok: true, job_id: job.id }); });
app.post('/api/shopify/webhooks/orders-fulfilled', (req, res) => { p4meLog('shopify', 'info', 'Fulfillment webhook received', req.body || {}); res.json({ ok: true }); });
`;
  server = server.replace("app.post('/api/auth/register'", shopifyEndpoints + "\napp.post('/api/auth/register'");
}

fs.writeFileSync('server/index.js', server);

// ---------- frontend ----------
let app = fs.readFileSync('src/ProductApp.jsx', 'utf8');

if (!has(app, 'function ShopifyEmbedded294')) {
  const components = `
function ShopifyEmbedded294() {
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState('');
  async function load(){ try{ setStatus(await fetch('/api/shopify/status').then(r=>r.json())); } catch(e){ setNotice(e.message); } }
  useEffect(()=>{ load(); }, []);
  async function testOrder(){ const data = await fetch('/api/shopify/test-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'#P4ME-TEST',email:'shopify-test@example.com',customer:{first_name:'Shopify',last_name:'Buyer'},shipping_address:{address1:'302 E 4th St',city:'Joplin',province:'MO',zip:'64801'},line_items:[{title:'Demo delivery item',quantity:2,sku:'SHOP-DEMO',price:'12.00'}],total_price:'24.00'})}).then(r=>r.json()); setNotice(data.ok?'Created Shopify work packet '+data.job.id:(data.error||'Test failed')); load(); }
  const jobs = status?.jobs || [];
  return <main className="shopify-shell"><section className="shopify-hero"><div><span className="eyebrow">Promote4.me for Shopify</span><h1>Proof-ready fulfillment inside Shopify Admin</h1><p>Convert Shopify orders into delivery/service work packets with item checklists, GPS/photo proof, and approval tracking.</p></div><div className="shopify-actions"><button className="primary" onClick={testOrder}>Send Shopify test order</button><a className="secondary" href="/" target="_blank">Open full Promote4.me</a></div></section>{notice&&<div className="toast"><span>{notice}</span><button onClick={()=>setNotice('')}>×</button></div>}<section className="shopify-stats"><Stat icon={ShoppingBag} label="Imported" value={status?.counts?.imported||0}/><Stat icon={ClipboardList} label="Pending" value={status?.counts?.pending||0}/><Stat icon={ShieldCheck} label="Submitted" value={status?.counts?.submitted||0}/><Stat icon={KeyRound} label="Status" value={status?.connection?.status||'beta'}/></section><section className="shopify-grid"><article className="panel wide"><h3>Shopify work packets</h3>{jobs.map(j=><div className="packet-row" key={j.id}><div><strong>{j.title}</strong><span>{j.customer_name} · {j.address}</span></div><Status status={j.status}/></div>)}{!jobs.length&&<p className="hint">No Shopify orders yet. Send a test order or connect webhooks.</p>}</article><article className="panel"><h3>Webhook endpoints</h3><p className="hint">Use these in Shopify webhooks or app setup.</p><code>/api/shopify/webhooks/orders-create</code><code>/api/shopify/webhooks/orders-paid</code><code>/api/shopify/webhooks/orders-fulfilled</code></article></section></main>;
}
function IntegrationsHub294({ boot, plans, setNotice }) {
  return <div className="content-grid integrations-clean"><section className="panel wide"><h3><KeyRound /> API Credential Center</h3><p className="hint">Create secure keys for WordPress, Shopify, delivery services, and custom apps.</p><ApiCredentialCenter291 setNotice={setNotice}/></section><section className="panel wide"><h3>Installable apps</h3><div className="integration-cards"><a className="integration-card featured" href="/downloads/promote4me-woocommerce.zip" download><Download/><strong>WordPress / WooCommerce Pro</strong><span>Current ZIP plugin: dashboard, logs, order sync, work packets.</span></a><a className="integration-card featured" href="/shopify" target="_blank"><Store/><strong>Shopify Embedded App</strong><span>Open the Shopify-style dashboard and test order workflow.</span></a><a className="integration-card" href="/downloads/README-addons.html" target="_blank"><ClipboardList/><strong>Setup Guide</strong><span>HTML guide for API keys, webhooks, and test packets.</span></a></div></section><section className="panel wide"><h3>Delivery and proof templates</h3><p className="hint">These are order sources and proof templates. Add provider keys in Settings when real API credentials are ready.</p><div className="service-cloud">{deliveryServices.map(s=><span key={s}>{s}</span>)}</div></section><section className="panel"><h3>Connection checklist</h3><ol className="clean-list"><li>Create API key</li><li>Install WordPress ZIP or open Shopify app</li><li>Send test order</li><li>Review work packet</li><li>Upload proof and approve</li></ol></section></div>;
}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', components + '\nfunction PublicSite({ plans, onAuthed }) {');
}

if (!has(app, 'location.pathname.startsWith("/shopify")')) {
  app = app.replace('export default function ProductApp() {', 'export default function ProductApp() {\n  if (location.pathname.startsWith("/shopify")) return <ShopifyEmbedded294 />;');
}

app = app.replace('{active === "addons" && <><ApiCredentialCenter291 setNotice={setNotice} /><AddOns {...props} /></>}', '{active === "addons" && <IntegrationsHub294 {...props} />}');
app = app.replaceAll('promote4me-woocommerce.php', 'promote4me-woocommerce.zip');
app = app.replaceAll('Interactive Interactive Interactive Interactive Interactive Interactive Setup Guide', 'Setup Guide');
app = app.replaceAll('Payment checkout tests', 'Billing integrations');

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css', 'utf8');
if (!has(css, 'P4ME 2.9.4 INTEGRATIONS REDESIGN')) {
  css += `
/* P4ME 2.9.4 INTEGRATIONS REDESIGN */
.integrations-clean{grid-template-columns:minmax(0,1fr)!important}.integrations-clean .panel{max-width:1180px}.integration-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.integration-card{display:grid;gap:10px;text-decoration:none;color:#eaf3ff;border:1px solid rgba(125,211,252,.2);background:rgba(255,255,255,.045);border-radius:20px;padding:18px}.integration-card.featured{background:linear-gradient(135deg,rgba(14,165,233,.18),rgba(124,58,237,.12));border-color:rgba(125,211,252,.38)}.integration-card svg{color:#7dd3fc}.integration-card span{color:#bdd4ea}.service-cloud{display:flex;flex-wrap:wrap;gap:10px}.service-cloud span{background:rgba(14,165,233,.16);border:1px solid rgba(125,211,252,.26);border-radius:999px;padding:8px 12px;color:#dff7ff}.clean-list{display:grid;gap:10px;color:#cfe4f7}.shopify-shell{min-height:100vh;padding:28px;background:linear-gradient(135deg,#07111f,#111827 55%,#172554);color:#eaf3ff}.shopify-hero{display:flex;justify-content:space-between;gap:20px;align-items:center;border:1px solid rgba(125,211,252,.18);background:rgba(255,255,255,.045);border-radius:28px;padding:24px;margin-bottom:18px}.shopify-hero h1{font-size:clamp(28px,4vw,48px);margin:6px 0;color:#fff}.shopify-actions{display:flex;gap:10px;flex-wrap:wrap}.shopify-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:18px}.shopify-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.6fr);gap:16px}.packet-row{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.045);border-radius:16px;padding:14px;margin:10px 0}.packet-row span{display:block;color:#bdd4ea}.shopify-shell code{display:block;word-break:break-all;margin:8px 0;padding:10px;border-radius:10px;background:#07111f;color:#7dd3fc}@media(max-width:900px){.shopify-hero,.shopify-grid{display:grid;grid-template-columns:1fr}}
`;
}
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 2.9.4 Shopify embedded app and integrations redesign applied.');
