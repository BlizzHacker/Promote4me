import fs from 'fs';
import path from 'path';

function addBefore(src, marker, block, key) {
  if (src.includes(key)) return src;
  if (!src.includes(marker)) throw new Error('Missing marker ' + marker);
  return src.replace(marker, block + '\n' + marker);
}
function addAfter(src, marker, block, key) {
  if (src.includes(key)) return src;
  if (!src.includes(marker)) throw new Error('Missing marker ' + marker);
  return src.replace(marker, marker + '\n' + block);
}
function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

writeFile('public/downloads/promote4me-woocommerce.php', `<?php
/**
 * Plugin Name: Promote4.me WooCommerce Proof of Work
 * Description: Sends WooCommerce orders to Promote4.me proof-of-work tracking. Beta 2.5.0 connector.
 * Version: 2.5.0
 */
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function(){
  add_options_page('Promote4.me', 'Promote4.me', 'manage_options', 'promote4me', 'p4me_settings_page');
});

add_action('admin_init', function(){
  register_setting('p4me_settings','p4me_api_url');
  register_setting('p4me_settings','p4me_api_key');
});

function p4me_settings_page(){ ?>
<div class="wrap">
  <h1>Promote4.me WooCommerce</h1>
  <p>Connect WooCommerce orders to Promote4.me proof tracking.</p>

  <form method="post" action="options.php">
    <?php settings_fields('p4me_settings'); ?>
    <table class="form-table">
      <tr>
        <th>API URL</th>
        <td><input name="p4me_api_url" value="<?php echo esc_attr(get_option('p4me_api_url','https://promote4.me')); ?>" class="regular-text" /></td>
      </tr>
      <tr>
        <th>External API Key</th>
        <td><input name="p4me_api_key" value="<?php echo esc_attr(get_option('p4me_api_key','')); ?>" class="regular-text" /></td>
      </tr>
    </table>
    <?php submit_button(); ?>
  </form>

  <form method="post">
    <input type="hidden" name="p4me_test_order" value="1" />
    <?php submit_button('Send Test Order'); ?>
  </form>
</div>
<?php
  if (!empty($_POST['p4me_test_order'])) {
    p4me_send_order_to_promote4me(null, true);
    echo '<div class="notice notice-success"><p>Test order sent.</p></div>';
  }
}

add_action('woocommerce_order_status_processing', function($order_id){
  p4me_send_order_to_promote4me($order_id, false);
});

function p4me_send_order_to_promote4me($order_id, $test=false) {
  $api = rtrim(get_option('p4me_api_url','https://promote4.me'),'/');
  $key = get_option('p4me_api_key','');
  if (!$key) return;

  $order = $order_id && function_exists('wc_get_order') ? wc_get_order($order_id) : null;

  $payload = array(
    'source' => 'WooCommerce',
    'type' => 'Package Delivery',
    'title' => $test ? 'WooCommerce Test Order' : 'WooCommerce Order #'.$order_id,
    'order_number' => $test ? 'WC-TEST-'.time() : 'WC-'.$order_id,
    'customer_name' => $order ? trim($order->get_billing_first_name().' '.$order->get_billing_last_name()) : 'WooCommerce Test Customer',
    'customer_email' => $order ? $order->get_billing_email() : 'test@example.com',
    'customer_phone' => $order ? $order->get_billing_phone() : '',
    'address' => $order ? trim($order->get_shipping_address_1().' '.$order->get_shipping_city().' '.$order->get_shipping_state().' '.$order->get_shipping_postcode()) : 'Test delivery address',
    'status' => 'Assigned',
    'instructions' => 'Imported from WooCommerce. Upload proof before completion.'
  );

  wp_remote_post($api.'/api/external/orders', array(
    'headers' => array('Content-Type'=>'application/json','X-P4ME-Key'=>$key),
    'body' => wp_json_encode($payload),
    'timeout' => 15
  ));
}
?>`);

writeFile('public/downloads/promote4me-shopify-addon.html', `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Promote4.me Shopify Beta Add-on</title>
  <style>
    body{font-family:Inter,Arial;padding:30px;max-width:760px;margin:auto}
    input,button{width:100%;padding:12px;margin:8px 0}
    button{background:#111827;color:white;border:0;border-radius:10px}
  </style>
</head>
<body>
  <h1>Promote4.me Shopify Beta Add-on</h1>
  <p>Test Shopify-style order ingestion. Replace this with OAuth/webhooks after Shopify API credentials are provided.</p>
  <input id="url" value="https://promote4.me">
  <input id="key" placeholder="Promote4.me External API Key">
  <input id="order" value="SHOPIFY-TEST-001">
  <input id="name" value="Shopify Test Customer">
  <input id="address" value="302 E 4th St, Joplin, MO">
  <button onclick="send()">Send Shopify Test Order</button>
  <pre id="out"></pre>
  <script>
    async function send(){
      const base=document.getElementById('url').value.replace(/\\/$/,'');
      const key=document.getElementById('key').value;
      const body={
        source:'Shopify',
        type:'Package Delivery',
        title:'Shopify Test Local Delivery',
        order_number:document.getElementById('order').value,
        customer_name:document.getElementById('name').value,
        address:document.getElementById('address').value,
        status:'Assigned',
        instructions:'Imported from Shopify beta add-on. Upload delivery proof.'
      };
      const r=await fetch(base+'/api/external/orders',{
        method:'POST',
        headers:{'Content-Type':'application/json','X-P4ME-Key':key},
        body:JSON.stringify(body)
      });
      document.getElementById('out').textContent=await r.text();
    }
  </script>
</body>
</html>`);

writeFile('public/downloads/README-addons.txt', `Promote4.me 2.5.0 Add-ons

WooCommerce:
1. Download promote4me-woocommerce.php.
2. Place it in wp-content/plugins/promote4me-woocommerce/promote4me-woocommerce.php.
3. Activate it in WordPress.
4. Add API URL and External API Key.
5. Send Test Order.

Shopify Beta:
1. Download promote4me-shopify-addon.html.
2. Add Promote4.me URL and External API Key.
3. Send Shopify Test Order.
4. Full Shopify OAuth/webhooks will use the same /api/external/orders endpoint once credentials are provided.
`);

let server = fs.readFileSync('server/index.js', 'utf8');

server = addAfter(server, 'migrate();', `
// === 2.5.0 workforce / marketplace / external API schema ===
function p4me250Schema() {
  const add = (t,c,d) => { try { run(\`ALTER TABLE \${t} ADD COLUMN \${c} \${d}\`); } catch {} };

  add('team_members','worker_type',"TEXT NOT NULL DEFAULT 'employee'");
  add('team_members','company_access',"TEXT NOT NULL DEFAULT 'company'");
  add('team_members','skills_json',"TEXT NOT NULL DEFAULT '[]'");
  add('team_members','license_number',"TEXT NOT NULL DEFAULT ''");
  add('team_members','insurance_status',"TEXT NOT NULL DEFAULT ''");
  add('team_members','background_check_status',"TEXT NOT NULL DEFAULT ''");
  add('team_members','service_radius_miles',"INTEGER NOT NULL DEFAULT 25");
  add('team_members','public_profile',"INTEGER NOT NULL DEFAULT 0");
  add('team_members','api_access',"INTEGER NOT NULL DEFAULT 1");

  add('jobs','is_public',"INTEGER NOT NULL DEFAULT 0");
  add('jobs','trade',"TEXT NOT NULL DEFAULT ''");
  add('jobs','budget_cents',"INTEGER NOT NULL DEFAULT 0");
  add('jobs','required_skills_json',"TEXT NOT NULL DEFAULT '[]'");
  add('jobs','worker_classification',"TEXT NOT NULL DEFAULT 'employee_or_contractor'");
  add('jobs','visibility',"TEXT NOT NULL DEFAULT 'private'");

  run("CREATE TABLE IF NOT EXISTS worker_applications (id TEXT PRIMARY KEY, tenant_id TEXT, job_id TEXT, worker_id TEXT, full_name TEXT, email TEXT, phone TEXT, skills_json TEXT, rate_cents INTEGER DEFAULT 0, cover_note TEXT, status TEXT DEFAULT 'submitted', created_at TEXT)");
  run("CREATE TABLE IF NOT EXISTS external_api_keys (id TEXT PRIMARY KEY, tenant_id TEXT, label TEXT, key_hash TEXT, status TEXT DEFAULT 'active', created_by TEXT, created_at TEXT, last_used_at TEXT)");
}
p4me250Schema();`, 'p4me250Schema');

server = addBefore(server, "app.post('/api/auth/register'", `
// === 2.5.0 plugin/external API order ingestion ===
function externalKeyTenant(req) {
  const raw = req.headers['x-p4me-key'] || '';
  if (!raw) return null;
  return row('SELECT * FROM external_api_keys WHERE key_hash=? AND status=?', [tokenHash(String(raw)), 'active']);
}

app.post('/api/external/orders', (req, res) => {
  const key = externalKeyTenant(req);
  if (!key) return res.status(401).json({ error: 'Invalid or missing Promote4.me external API key.' });

  run('UPDATE external_api_keys SET last_used_at=? WHERE id=?', [now(), key.id]);

  const b = req.body || {};
  const id = b.id || \`P4-EXT-\${Date.now().toString().slice(-6)}\`;
  const team = row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1', [key.tenant_id]);
  const member = row('SELECT id FROM team_members WHERE tenant_id=? AND COALESCE(status,?) != ? ORDER BY created_at DESC LIMIT 1', [key.tenant_id, 'active', 'deleted']);

  run(\`INSERT INTO jobs (id, tenant_id, team_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, is_public, trade, budget_cents, visibility, worker_classification, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, [
    id, key.tenant_id, team?.id || null, member?.id || null,
    b.type || 'Package Delivery',
    b.title || 'External order',
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
    b.instructions || 'Imported from external API.',
    b.is_public ? 1 : 0,
    b.trade || '',
    Number(b.budget_cents || 0),
    b.visibility || 'private',
    b.worker_classification || 'employee_or_contractor',
    now(),
    now()
  ]);

  res.json({ ok: true, job: hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id])) });
});

app.post('/api/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  const raw = nanoid(32);
  const id = publicId('apikey');
  run('INSERT INTO external_api_keys (id, tenant_id, label, key_hash, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), req.body?.label || 'External API Key', tokenHash(raw), req.user.id, now()
  ]);
  res.json({ id, apiKey: raw, label: req.body?.label || 'External API Key', note: 'Save this key now. It will not be shown again.' });
});

app.get('/api/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ keys: all('SELECT id,label,status,created_at,last_used_at FROM external_api_keys WHERE tenant_id=? ORDER BY created_at DESC', [tenantId(req)]) });
});
`, '/api/external/orders');

server = addBefore(server, "app.post('/api/teams'", `
// === 2.5.0 workforce / contractor / public work board ===
app.get('/api/workforce', requireAuth, requireRole('manager'), (req, res) => {
  res.json({ workers: all('SELECT * FROM team_members WHERE tenant_id=? AND COALESCE(status,?) != ? ORDER BY worker_type, full_name', [tenantId(req), 'active', 'deleted']) });
});

app.post('/api/workforce', requireAuth, requireRole('manager'), upload.single('photo'), (req, res) => {
  const id = publicId('member');
  const b = req.body;
  const photoUrl = req.file ? \`/uploads/\${req.file.filename}\` : b.photo_url || '';

  run(\`INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, worker_type, company_access, pay_rate, territory, photo_url, emergency_contact, notes, status, skills_json, license_number, insurance_status, background_check_status, service_radius_miles, public_profile, api_access, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, [
    id, tenantId(req), b.team_id || null, b.full_name, b.email || '', b.phone || '',
    b.role || 'Contractor',
    b.worker_type || 'contractor',
    b.company_access || 'company',
    b.pay_rate || '',
    b.territory || '',
    photoUrl,
    b.emergency_contact || '',
    b.notes || '',
    b.status || 'active',
    b.skills_json || '[]',
    b.license_number || '',
    b.insurance_status || '',
    b.background_check_status || '',
    Number(b.service_radius_miles || 25),
    b.public_profile ? 1 : 0,
    b.api_access === '0' ? 0 : 1,
    now()
  ]);

  res.json({ worker: row('SELECT * FROM team_members WHERE id=?', [id]) });
});

app.get('/api/integrations/available', requireAuth, (req, res) => {
  res.json({
    integrations: all('SELECT id,provider,status,created_at,last_sync_at FROM integrations WHERE tenant_id=? ORDER BY provider', [tenantId(req)]),
    externalKeys: ['admin','super_admin'].includes(req.user.role)
      ? all('SELECT id,label,status,created_at,last_used_at FROM external_api_keys WHERE tenant_id=?', [tenantId(req)])
      : []
  });
});

app.get('/api/public/work-listings', (req, res) => {
  res.json({ jobs: all("SELECT id,title,type,source,customer_name,address,lat,lng,trade,budget_cents,required_skills_json,worker_classification,status,created_at FROM jobs WHERE is_public=1 AND COALESCE(status,'Assigned') NOT IN ('Delivered','Verified','Rejected') ORDER BY created_at DESC LIMIT 200") });
});

app.post('/api/public/work-listings/:id/apply', (req, res) => {
  const job = row('SELECT * FROM jobs WHERE id=? AND is_public=1', [req.params.id]);
  if (!job) return res.status(404).json({ error: 'Public work listing not found.' });
  const b = req.body || {};
  const id = publicId('app');
  run('INSERT INTO worker_applications (id, tenant_id, job_id, worker_id, full_name, email, phone, skills_json, rate_cents, cover_note, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id, job.tenant_id, job.id, b.worker_id || null, b.full_name || '', b.email || '', b.phone || '',
    JSON.stringify(b.skills || []), Number(b.rate_cents || 0), b.cover_note || '', 'submitted', now()
  ]);
  res.json({ ok: true, application_id: id });
});

app.get('/api/work-applications', requireAuth, requireRole('manager'), (req, res) => {
  res.json({ applications: all('SELECT * FROM worker_applications WHERE tenant_id=? ORDER BY created_at DESC', [tenantId(req)]) });
});
`, '/api/workforce');

fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx', 'utf8');

if (!app.includes('function WorkforcePanel')) {
  app = app.replace('["team", "Team", Users],', '["workforce", "Workforce", Users],\n    ["team", "Team", Users],');
  app = app.replace('["training", "Training", ShieldCheck],', '["marketplace", "Find Work", Map],\n    ["training", "Training", ShieldCheck],');
  app = app.replace('{active === "team" && <Team {...props} />}', '{active === "workforce" && <WorkforcePanel {...props} />}\n        {active === "team" && <Team {...props} />}');
  app = app.replace('{active === "training" && <TrainingPanel user={session.user} />}', '{active === "marketplace" && <MarketplacePanel {...props} />}\n        {active === "training" && <TrainingPanel user={session.user} />}');

  app = app.replace('function Team({ boot, reload, setNotice }) {', `function WorkforcePanel({ boot, reload, setNotice }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'Contractor',
    worker_type: 'contractor',
    company_access: 'company',
    territory: '',
    pay_rate: '',
    skills_json: '["Plumbing","Delivery"]',
    license_number: '',
    insurance_status: '',
    background_check_status: '',
    service_radius_miles: 25,
    public_profile: true,
    api_access: true,
    notes: ''
  });

  const workers = (boot.teamMembers || []).filter((worker) => worker.status !== 'deleted');

  async function save(event) {
    event.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value));
    await api('/api/workforce', { method: 'POST', body: fd });
    setNotice('Worker/contractor added');
    reload();
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Employees + Independent Contractors</h3>
        <p className="hint">Employees can belong to teams. Independent contractors can be company-approved without being assigned to a private team. Both can use company API-powered jobs if admins enable access.</p>
        <div className="card-grid">
          {workers.map((worker) => (
            <article className="person-card" key={worker.id}>
              <div className="avatar">{worker.full_name?.[0]}</div>
              <div>
                <strong>{worker.full_name}</strong>
                <p>{worker.worker_type || 'employee'} · {worker.role}</p>
                <small>{worker.email} · API access: {worker.api_access === 0 ? 'off' : 'on'}</small>
                <p>{worker.skills_json || worker.notes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3><UserPlus /> Add worker</h3>
        <form className="stack-form" onSubmit={save}>
          <select value={form.worker_type} onChange={(e) => setForm({ ...form, worker_type: e.target.value })}>
            <option value="employee">Employee</option>
            <option value="contractor">Independent Contractor / 1099</option>
          </select>
          <select value={form.company_access} onChange={(e) => setForm({ ...form, company_access: e.target.value })}>
            <option value="company">Company Access</option>
            <option value="team">Team Only</option>
            <option value="public_marketplace">Public Marketplace</option>
          </select>
          {['full_name','email','phone','role','territory','pay_rate','skills_json','license_number','insurance_status','background_check_status','service_radius_miles'].map((key) => (
            <input key={key} required={key === 'full_name'} placeholder={key.replaceAll('_',' ')} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
          <label className="check-line"><input type="checkbox" checked={form.public_profile} onChange={(e) => setForm({ ...form, public_profile: e.target.checked })} /> Public contractor profile</label>
          <label className="check-line"><input type="checkbox" checked={form.api_access} onChange={(e) => setForm({ ...form, api_access: e.target.checked })} /> Can access company API-powered jobs</label>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="primary">Add worker</button>
        </form>
      </section>
    </div>
  );
}

function Team({ boot, reload, setNotice }) {`);
}

if (!app.includes('function MarketplacePanel')) {
  app = app.replace('function AddOns({ boot, plans, setNotice }) {', `function MarketplacePanel({ setNotice }) {
  const [jobs, setJobs] = useState([]);
  const [apply, setApply] = useState({});

  useEffect(() => {
    fetch('/api/public/work-listings').then((r) => r.json()).then((data) => setJobs(data.jobs || [])).catch(() => {});
  }, []);

  async function submit(job) {
    const body = apply[job.id] || {};
    const response = await fetch('/api/public/work-listings/' + job.id + '/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error || 'Apply failed');
    setNotice('Application submitted: ' + data.application_id);
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Public Work Listings</h3>
        <p className="hint">Angi / Field Nation style work board focused on proof-of-work: technicians, plumbers, drivers, flyer teams, and contractors can apply.</p>
        <div className="card-grid">
          {jobs.map((job) => (
            <article className="client-card" key={job.id}>
              <strong>{job.title}</strong>
              <p>{job.trade || job.type} · {job.address}</p>
              <small>{job.worker_classification} · Budget ${(Number(job.budget_cents || 0) / 100).toFixed(2)}</small>
              <input placeholder="Your name" onChange={(e) => setApply({ ...apply, [job.id]: { ...(apply[job.id] || {}), full_name: e.target.value } })} />
              <input placeholder="Email" onChange={(e) => setApply({ ...apply, [job.id]: { ...(apply[job.id] || {}), email: e.target.value } })} />
              <textarea placeholder="Skills / cover note" onChange={(e) => setApply({ ...apply, [job.id]: { ...(apply[job.id] || {}), cover_note: e.target.value } })} />
              <button className="primary" onClick={() => submit(job)}>Apply</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AddOns({ boot, plans, setNotice }) {`);
}

if (!app.includes('promote4me-woocommerce.php')) {
  app = app.replace(
    '<h3>Installable add-ons & delivery networks</h3>',
    '<h3>Installable add-ons & delivery networks</h3><div className="download-grid"><a className="download-card" href="/downloads/promote4me-woocommerce.php" download><strong>Download WordPress/WooCommerce Plugin</strong><span>promote4me-woocommerce.php</span></a><a className="download-card" href="/downloads/promote4me-shopify-addon.html" download><strong>Download Shopify Beta Add-on</strong><span>promote4me-shopify-addon.html</span></a><a className="download-card" href="/downloads/README-addons.txt" download><strong>Setup Guide</strong><span>README-addons.txt</span></a></div>'
  );
}

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css', 'utf8');
if (!css.includes('P4ME 2.5.0 WORKFORCE PATCH')) {
  css += `
/* P4ME 2.5.0 WORKFORCE PATCH */
.download-grid{display:grid;grid-template-column[200~cat > scripts/apply-2.5.0-workforce-plugins.mjs <<'EOF'
import fs from 'fs';
import path from 'path';

function addBefore(src, marker, block, key) {
  if (src.includes(key)) return src;
  if (!src.includes(marker)) throw new Error('Missing marker ' + marker);
  return src.replace(marker, block + '\n' + marker);
}
function addAfter(src, marker, block, key) {
  if (src.includes(key)) return src;
  if (!src.includes(marker)) throw new Error('Missing marker ' + marker);
  return src.replace(marker, marker + '\n' + block);
}
function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

writeFile('public/downloads/promote4me-woocommerce.php', `<?php
/**
 * Plugin Name: Promote4.me WooCommerce Proof of Work
 * Description: Sends WooCommerce orders to Promote4.me proof-of-work tracking. Beta 2.5.0 connector.
 * Version: 2.5.0
 */
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function(){
  add_options_page('Promote4.me', 'Promote4.me', 'manage_options', 'promote4me', 'p4me_settings_page');
});

add_action('admin_init', function(){
  register_setting('p4me_settings','p4me_api_url');
  register_setting('p4me_settings','p4me_api_key');
});

function p4me_settings_page(){ ?>
<div class="wrap">
  <h1>Promote4.me WooCommerce</h1>
  <p>Connect WooCommerce orders to Promote4.me proof tracking.</p>

  <form method="post" action="options.php">
    <?php settings_fields('p4me_settings'); ?>
    <table class="form-table">
      <tr>
        <th>API URL</th>
        <td><input name="p4me_api_url" value="<?php echo esc_attr(get_option('p4me_api_url','https://promote4.me')); ?>" class="regular-text" /></td>
      </tr>
      <tr>
        <th>External API Key</th>
        <td><input name="p4me_api_key" value="<?php echo esc_attr(get_option('p4me_api_key','')); ?>" class="regular-text" /></td>
      </tr>
    </table>
    <?php submit_button(); ?>
  </form>

  <form method="post">
    <input type="hidden" name="p4me_test_order" value="1" />
    <?php submit_button('Send Test Order'); ?>
  </form>
</div>
<?php
  if (!empty($_POST['p4me_test_order'])) {
    p4me_send_order_to_promote4me(null, true);
    echo '<div class="notice notice-success"><p>Test order sent.</p></div>';
  }
}

add_action('woocommerce_order_status_processing', function($order_id){
  p4me_send_order_to_promote4me($order_id, false);
});

function p4me_send_order_to_promote4me($order_id, $test=false) {
  $api = rtrim(get_option('p4me_api_url','https://promote4.me'),'/');
  $key = get_option('p4me_api_key','');
  if (!$key) return;

  $order = $order_id && function_exists('wc_get_order') ? wc_get_order($order_id) : null;

  $payload = array(
    'source' => 'WooCommerce',
    'type' => 'Package Delivery',
    'title' => $test ? 'WooCommerce Test Order' : 'WooCommerce Order #'.$order_id,
    'order_number' => $test ? 'WC-TEST-'.time() : 'WC-'.$order_id,
    'customer_name' => $order ? trim($order->get_billing_first_name().' '.$order->get_billing_last_name()) : 'WooCommerce Test Customer',
    'customer_email' => $order ? $order->get_billing_email() : 'test@example.com',
    'customer_phone' => $order ? $order->get_billing_phone() : '',
    'address' => $order ? trim($order->get_shipping_address_1().' '.$order->get_shipping_city().' '.$order->get_shipping_state().' '.$order->get_shipping_postcode()) : 'Test delivery address',
    'status' => 'Assigned',
    'instructions' => 'Imported from WooCommerce. Upload proof before completion.'
  );

  wp_remote_post($api.'/api/external/orders', array(
    'headers' => array('Content-Type'=>'application/json','X-P4ME-Key'=>$key),
    'body' => wp_json_encode($payload),
    'timeout' => 15
  ));
}
?>`);

writeFile('public/downloads/promote4me-shopify-addon.html', `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Promote4.me Shopify Beta Add-on</title>
  <style>
    body{font-family:Inter,Arial;padding:30px;max-width:760px;margin:auto}
    input,button{width:100%;padding:12px;margin:8px 0}
    button{background:#111827;color:white;border:0;border-radius:10px}
  </style>
</head>
<body>
  <h1>Promote4.me Shopify Beta Add-on</h1>
  <p>Test Shopify-style order ingestion. Replace this with OAuth/webhooks after Shopify API credentials are provided.</p>
  <input id="url" value="https://promote4.me">
  <input id="key" placeholder="Promote4.me External API Key">
  <input id="order" value="SHOPIFY-TEST-001">
  <input id="name" value="Shopify Test Customer">
  <input id="address" value="302 E 4th St, Joplin, MO">
  <button onclick="send()">Send Shopify Test Order</button>
  <pre id="out"></pre>
  <script>
    async function send(){
      const base=document.getElementById('url').value.replace(/\\/$/,'');
      const key=document.getElementById('key').value;
      const body={
        source:'Shopify',
        type:'Package Delivery',
        title:'Shopify Test Local Delivery',
        order_number:document.getElementById('order').value,
        customer_name:document.getElementById('name').value,
        address:document.getElementById('address').value,
        status:'Assigned',
        instructions:'Imported from Shopify beta add-on. Upload delivery proof.'
      };
      const r=await fetch(base+'/api/external/orders',{
        method:'POST',
        headers:{'Content-Type':'application/json','X-P4ME-Key':key},
        body:JSON.stringify(body)
      });
      document.getElementById('out').textContent=await r.text();
    }
  </script>
</body>
</html>`);

writeFile('public/downloads/README-addons.txt', `Promote4.me 2.5.0 Add-ons

WooCommerce:
1. Download promote4me-woocommerce.php.
2. Place it in wp-content/plugins/promote4me-woocommerce/promote4me-woocommerce.php.
3. Activate it in WordPress.
4. Add API URL and External API Key.
5. Send Test Order.

Shopify Beta:
1. Download promote4me-shopify-addon.html.
2. Add Promote4.me URL and External API Key.
3. Send Shopify Test Order.
4. Full Shopify OAuth/webhooks will use the same /api/external/orders endpoint once credentials are provided.
`);

let server = fs.readFileSync('server/index.js', 'utf8');

server = addAfter(server, 'migrate();', `
// === 2.5.0 workforce / marketplace / external API schema ===
function p4me250Schema() {
  const add = (t,c,d) => { try { run(\`ALTER TABLE \${t} ADD COLUMN \${c} \${d}\`); } catch {} };

  add('team_members','worker_type',"TEXT NOT NULL DEFAULT 'employee'");
  add('team_members','company_access',"TEXT NOT NULL DEFAULT 'company'");
  add('team_members','skills_json',"TEXT NOT NULL DEFAULT '[]'");
  add('team_members','license_number',"TEXT NOT NULL DEFAULT ''");
  add('team_members','insurance_status',"TEXT NOT NULL DEFAULT ''");
  add('team_members','background_check_status',"TEXT NOT NULL DEFAULT ''");
  add('team_members','service_radius_miles',"INTEGER NOT NULL DEFAULT 25");
  add('team_members','public_profile',"INTEGER NOT NULL DEFAULT 0");
  add('team_members','api_access',"INTEGER NOT NULL DEFAULT 1");

  add('jobs','is_public',"INTEGER NOT NULL DEFAULT 0");
  add('jobs','trade',"TEXT NOT NULL DEFAULT ''");
  add('jobs','budget_cents',"INTEGER NOT NULL DEFAULT 0");
  add('jobs','required_skills_json',"TEXT NOT NULL DEFAULT '[]'");
  add('jobs','worker_classification',"TEXT NOT NULL DEFAULT 'employee_or_contractor'");
  add('jobs','visibility',"TEXT NOT NULL DEFAULT 'private'");

  run("CREATE TABLE IF NOT EXISTS worker_applications (id TEXT PRIMARY KEY, tenant_id TEXT, job_id TEXT, worker_id TEXT, full_name TEXT, email TEXT, phone TEXT, skills_json TEXT, rate_cents INTEGER DEFAULT 0, cover_note TEXT, status TEXT DEFAULT 'submitted', created_at TEXT)");
  run("CREATE TABLE IF NOT EXISTS external_api_keys (id TEXT PRIMARY KEY, tenant_id TEXT, label TEXT, key_hash TEXT, status TEXT DEFAULT 'active', created_by TEXT, created_at TEXT, last_used_at TEXT)");
}
p4me250Schema();`, 'p4me250Schema');

server = addBefore(server, "app.post('/api/auth/register'", `
// === 2.5.0 plugin/external API order ingestion ===
function externalKeyTenant(req) {
  const raw = req.headers['x-p4me-key'] || '';
  if (!raw) return null;
  return row('SELECT * FROM external_api_keys WHERE key_hash=? AND status=?', [tokenHash(String(raw)), 'active']);
}

app.post('/api/external/orders', (req, res) => {
  const key = externalKeyTenant(req);
  if (!key) return res.status(401).json({ error: 'Invalid or missing Promote4.me external API key.' });

  run('UPDATE external_api_keys SET last_used_at=? WHERE id=?', [now(), key.id]);

  const b = req.body || {};
  const id = b.id || \`P4-EXT-\${Date.now().toString().slice(-6)}\`;
  const team = row('SELECT id FROM teams WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1', [key.tenant_id]);
  const member = row('SELECT id FROM team_members WHERE tenant_id=? AND COALESCE(status,?) != ? ORDER BY created_at DESC LIMIT 1', [key.tenant_id, 'active', 'deleted']);

  run(\`INSERT INTO jobs (id, tenant_id, team_id, assigned_to, type, title, order_number, source, customer_name, customer_email, customer_phone, address, lat, lng, status, eta, reward_cents, instructions, is_public, trade, budget_cents, visibility, worker_classification, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, [
    id, key.tenant_id, team?.id || null, member?.id || null,
    b.type || 'Package Delivery',
    b.title || 'External order',
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
    b.instructions || 'Imported from external API.',
    b.is_public ? 1 : 0,
    b.trade || '',
    Number(b.budget_cents || 0),
    b.visibility || 'private',
    b.worker_classification || 'employee_or_contractor',
    now(),
    now()
  ]);

  res.json({ ok: true, job: hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id])) });
});

app.post('/api/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  const raw = nanoid(32);
  const id = publicId('apikey');
  run('INSERT INTO external_api_keys (id, tenant_id, label, key_hash, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), req.body?.label || 'External API Key', tokenHash(raw), req.user.id, now()
  ]);
  res.json({ id, apiKey: raw, label: req.body?.label || 'External API Key', note: 'Save this key now. It will not be shown again.' });
});

app.get('/api/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ keys: all('SELECT id,label,status,created_at,last_used_at FROM external_api_keys WHERE tenant_id=? ORDER BY created_at DESC', [tenantId(req)]) });
});
`, '/api/external/orders');

server = addBefore(server, "app.post('/api/teams'", `
// === 2.5.0 workforce / contractor / public work board ===
app.get('/api/workforce', requireAuth, requireRole('manager'), (req, res) => {
  res.json({ workers: all('SELECT * FROM team_members WHERE tenant_id=? AND COALESCE(status,?) != ? ORDER BY worker_type, full_name', [tenantId(req), 'active', 'deleted']) });
});

app.post('/api/workforce', requireAuth, requireRole('manager'), upload.single('photo'), (req, res) => {
  const id = publicId('member');
  const b = req.body;
  const photoUrl = req.file ? \`/uploads/\${req.file.filename}\` : b.photo_url || '';

  run(\`INSERT INTO team_members (id, tenant_id, team_id, full_name, email, phone, role, worker_type, company_access, pay_rate, territory, photo_url, emergency_contact, notes, status, skills_json, license_number, insurance_status, background_check_status, service_radius_miles, public_profile, api_access, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, [
    id, tenantId(req), b.team_id || null, b.full_name, b.email || '', b.phone || '',
    b.role || 'Contractor',
    b.worker_type || 'contractor',
    b.company_access || 'company',
    b.pay_rate || '',
    b.territory || '',
    photoUrl,
    b.emergency_contact || '',
    b.notes || '',
    b.status || 'active',
    b.skills_json || '[]',
    b.license_number || '',
    b.insurance_status || '',
    b.background_check_status || '',
    Number(b.service_radius_miles || 25),
    b.public_profile ? 1 : 0,
    b.api_access === '0' ? 0 : 1,
    now()
  ]);

  res.json({ worker: row('SELECT * FROM team_members WHERE id=?', [id]) });
});

app.get('/api/integrations/available', requireAuth, (req, res) => {
  res.json({
    integrations: all('SELECT id,provider,status,created_at,last_sync_at FROM integrations WHERE tenant_id=? ORDER BY provider', [tenantId(req)]),
    externalKeys: ['admin','super_admin'].includes(req.user.role)
      ? all('SELECT id,label,status,created_at,last_used_at FROM external_api_keys WHERE tenant_id=?', [tenantId(req)])
      : []
  });
});

app.get('/api/public/work-listings', (req, res) => {
  res.json({ jobs: all("SELECT id,title,type,source,customer_name,address,lat,lng,trade,budget_cents,required_skills_json,worker_classification,status,created_at FROM jobs WHERE is_public=1 AND COALESCE(status,'Assigned') NOT IN ('Delivered','Verified','Rejected') ORDER BY created_at DESC LIMIT 200") });
});

app.post('/api/public/work-listings/:id/apply', (req, res) => {
  const job = row('SELECT * FROM jobs WHERE id=? AND is_public=1', [req.params.id]);
  if (!job) return res.status(404).json({ error: 'Public work listing not found.' });
  const b = req.body || {};
  const id = publicId('app');
  run('INSERT INTO worker_applications (id, tenant_id, job_id, worker_id, full_name, email, phone, skills_json, rate_cents, cover_note, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id, job.tenant_id, job.id, b.worker_id || null, b.full_name || '', b.email || '', b.phone || '',
    JSON.stringify(b.skills || []), Number(b.rate_cents || 0), b.cover_note || '', 'submitted', now()
  ]);
  res.json({ ok: true, application_id: id });
});

app.get('/api/work-applications', requireAuth, requireRole('manager'), (req, res) => {
  res.json({ applications: all('SELECT * FROM worker_applications WHERE tenant_id=? ORDER BY created_at DESC', [tenantId(req)]) });
});
`, '/api/workforce');

fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx', 'utf8');

if (!app.includes('function WorkforcePanel')) {
  app = app.replace('["team", "Team", Users],', '["workforce", "Workforce", Users],\n    ["team", "Team", Users],');
  app = app.replace('["training", "Training", ShieldCheck],', '["marketplace", "Find Work", Map],\n    ["training", "Training", ShieldCheck],');
  app = app.replace('{active === "team" && <Team {...props} />}', '{active === "workforce" && <WorkforcePanel {...props} />}\n        {active === "team" && <Team {...props} />}');
  app = app.replace('{active === "training" && <TrainingPanel user={session.user} />}', '{active === "marketplace" && <MarketplacePanel {...props} />}\n        {active === "training" && <TrainingPanel user={session.user} />}');

  app = app.replace('function Team({ boot, reload, setNotice }) {', `function WorkforcePanel({ boot, reload, setNotice }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'Contractor',
    worker_type: 'contractor',
    company_access: 'company',
    territory: '',
    pay_rate: '',
    skills_json: '["Plumbing","Delivery"]',
    license_number: '',
    insurance_status: '',
    background_check_status: '',
    service_radius_miles: 25,
    public_profile: true,
    api_access: true,
    notes: ''
  });

  const workers = (boot.teamMembers || []).filter((worker) => worker.status !== 'deleted');

  async function save(event) {
    event.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value));
    await api('/api/workforce', { method: 'POST', body: fd });
    setNotice('Worker/contractor added');
    reload();
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Employees + Independent Contractors</h3>
        <p className="hint">Employees can belong to teams. Independent contractors can be company-approved without being assigned to a private team. Both can use company API-powered jobs if admins enable access.</p>
        <div className="card-grid">
          {workers.map((worker) => (
            <article className="person-card" key={worker.id}>
              <div className="avatar">{worker.full_name?.[0]}</div>
              <div>
                <strong>{worker.full_name}</strong>
                <p>{worker.worker_type || 'employee'} · {worker.role}</p>
                <small>{worker.email} · API access: {worker.api_access === 0 ? 'off' : 'on'}</small>
                <p>{worker.skills_json || worker.notes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3><UserPlus /> Add worker</h3>
        <form className="stack-form" onSubmit={save}>
          <select value={form.worker_type} onChange={(e) => setForm({ ...form, worker_type: e.target.value })}>
            <option value="employee">Employee</option>
            <option value="contractor">Independent Contractor / 1099</option>
          </select>
          <select value={form.company_access} onChange={(e) => setForm({ ...form, company_access: e.target.value })}>
            <option value="company">Company Access</option>
            <option value="team">Team Only</option>
            <option value="public_marketplace">Public Marketplace</option>
          </select>
          {['full_name','email','phone','role','territory','pay_rate','skills_json','license_number','insurance_status','background_check_status','service_radius_miles'].map((key) => (
            <input key={key} required={key === 'full_name'} placeholder={key.replaceAll('_',' ')} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
          <label className="check-line"><input type="checkbox" checked={form.public_profile} onChange={(e) => setForm({ ...form, public_profile: e.target.checked })} /> Public contractor profile</label>
          <label className="check-line"><input type="checkbox" checked={form.api_access} onChange={(e) => setForm({ ...form, api_access: e.target.checked })} /> Can access company API-powered jobs</label>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="primary">Add worker</button>
        </form>
      </section>
    </div>
  );
}

function Team({ boot, reload, setNotice }) {`);
}

if (!app.includes('function MarketplacePanel')) {
  app = app.replace('function AddOns({ boot, plans, setNotice }) {', `function MarketplacePanel({ setNotice }) {
  const [jobs, setJobs] = useState([]);
  const [apply, setApply] = useState({});

  useEffect(() => {
    fetch('/api/public/work-listings').then((r) => r.json()).then((data) => setJobs(data.jobs || [])).catch(() => {});
  }, []);

  async function submit(job) {
    const body = apply[job.id] || {};
    const response = await fetch('/api/public/work-listings/' + job.id + '/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error || 'Apply failed');
    setNotice('Application submitted: ' + data.application_id);
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Public Work Listings</h3>
        <p className="hint">Angi / Field Nation style work board focused on proof-of-work: technicians, plumbers, drivers, flyer teams, and contractors can apply.</p>
        <div className="card-grid">
          {jobs.map((job) => (
            <article className="client-card" key={job.id}>
              <strong>{job.title}</strong>
              <p>{job.trade || job.type} · {job.address}</p>
              <small>{job.worker_classification} · Budget ${(Number(job.budget_cents || 0) / 100).toFixed(2)}</small>
              <input placeholder="Your name" onChange={(e) => setApply({ ...apply, [job.id]: { ...(apply[job.id] || {}), full_name: e.target.value } })} />
              <input placeholder="Email" onChange={(e) => setApply({ ...apply, [job.id]: { ...(apply[job.id] || {}), email: e.target.value } })} />
              <textarea placeholder="Skills / cover note" onChange={(e) => setApply({ ...apply, [job.id]: { ...(apply[job.id] || {}), cover_note: e.target.value } })} />
              <button className="primary" onClick={() => submit(job)}>Apply</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AddOns({ boot, plans, setNotice }) {`);
}

if (!app.includes('promote4me-woocommerce.php')) {
  app = app.replace(
    '<h3>Installable add-ons & delivery networks</h3>',
    '<h3>Installable add-ons & delivery networks</h3><div className="download-grid"><a className="download-card" href="/downloads/promote4me-woocommerce.php" download><strong>Download WordPress/WooCommerce Plugin</strong><span>promote4me-woocommerce.php</span></a><a className="download-card" href="/downloads/promote4me-shopify-addon.html" download><strong>Download Shopify Beta Add-on</strong><span>promote4me-shopify-addon.html</span></a><a className="download-card" href="/downloads/README-addons.txt" download><strong>Setup Guide</strong><span>README-addons.txt</span></a></div>'
  );
}

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css', 'utf8');
if (!css.includes('P4ME 2.5.0 WORKFORCE PATCH')) {
  css += `
/* P4ME 2.5.0 WORKFORCE PATCH */
.download-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:16px 0}
.download-card{display:grid;gap:6px;text-decoration:none;border:1px solid rgba(125,211,252,.22);background:rgba(14,165,233,.10);border-radius:18px;padding:16px;color:#fff}
.download-card span{color:#7dd3fc}
.download-card:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.55)}
`;
}
fs.writeFileSync('src/styles.css', css);

console.log('Applied Promote4.me 2.5.0 workforce, contractor, public listings, API connector, and plugin downloads patch.');
