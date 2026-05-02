import fs from "fs";

const has = (s, x) => s.includes(x);

console.log("Applying Promote4.me 2.9.1 API Key Center...");

let server = fs.readFileSync("server/index.js", "utf8");

server = server
  .replace("version: '2.9.0'", "version: '2.9.1'")
  .replace("version: '2.3.0'", "version: '2.9.1'");

if (!has(server, "external_api_keys")) {
  server = server.replace("migrate();", `migrate();

function p4me291CredentialSchema() {
  const add = (table, column, definition) => {
    try { run("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition); } catch {}
  };

  add("jobs", "work_mode", "TEXT NOT NULL DEFAULT 'in_person'");
  add("jobs", "visibility", "TEXT NOT NULL DEFAULT 'private'");
  add("jobs", "is_public", "INTEGER NOT NULL DEFAULT 0");
  add("jobs", "trade", "TEXT NOT NULL DEFAULT ''");
  add("jobs", "budget_cents", "INTEGER NOT NULL DEFAULT 0");

  run("CREATE TABLE IF NOT EXISTS external_api_keys (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'active', created_by TEXT, created_at TEXT, last_used_at TEXT)");
}
p4me291CredentialSchema();`);
}

if (!has(server, "app.get('/api/external-keys'")) {
  const endpoints = `
app.get('/api/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  const keys = all('SELECT id,label,status,created_by,created_at,last_used_at FROM external_api_keys WHERE tenant_id=? ORDER BY created_at DESC', [tenantId(req)]);
  res.json({ keys });
});

app.post('/api/external-keys', requireAuth, requireRole('admin'), (req, res) => {
  const label = req.body?.label || 'WooCommerce Store';
  const raw = 'p4me_' + nanoid(40);
  const id = publicId('apikey');

  run('INSERT INTO external_api_keys (id,tenant_id,label,key_hash,status,created_by,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    id, tenantId(req), label, tokenHash(raw), 'active', req.user.id, now()
  ]);

  audit(req, 'external_api_key_created', { key_id: id, label });
  res.json({ id, label, apiKey: raw, note: 'Copy this key now. Promote4.me will not show it again.' });
});

app.delete('/api/external-keys/:id', requireAuth, requireRole('admin'), (req, res) => {
  const existing = row('SELECT * FROM external_api_keys WHERE id=? AND tenant_id=?', [req.params.id, tenantId(req)]);
  if (!existing) return res.status(404).json({ error: 'API key not found.' });

  run('UPDATE external_api_keys SET status=? WHERE id=? AND tenant_id=?', ['revoked', req.params.id, tenantId(req)]);
  audit(req, 'external_api_key_revoked', { key_id: req.params.id });
  res.json({ ok: true });
});

function p4meExternalKeyTenant(req) {
  const raw = req.headers['x-p4me-key'] || req.headers['x-promote4me-key'] || '';
  if (!raw) return null;
  return row('SELECT * FROM external_api_keys WHERE key_hash=? AND status=?', [tokenHash(String(raw)), 'active']);
}

app.post('/api/external/orders', (req, res) => {
  const key = p4meExternalKeyTenant(req);
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
    publicId('hist'), key.tenant_id, id, null, 'External API order imported from ' + (b.source || key.label || 'External API'), now()
  ]);

  res.json({ ok: true, job: hydrateJob(row('SELECT * FROM jobs WHERE id=?', [id])) });
});
`;

  server = server.replace("app.post('/api/auth/register'", endpoints + "\napp.post('/api/auth/register'");
}

fs.writeFileSync("server/index.js", server);

let app = fs.readFileSync("src/ProductApp.jsx", "utf8");

if (!has(app, "function ApiCredentialCenter291")) {
  const component = `
function ApiCredentialCenter291({ setNotice }) {
  const [keys, setKeys] = useState([]);
  const [label, setLabel] = useState("WooCommerce Store");
  const [newKey, setNewKey] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await api("/api/external-keys");
      setKeys(data.keys || []);
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function createKey() {
    setBusy(true);
    try {
      const data = await api("/api/external-keys", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      setNewKey(data.apiKey);
      setNotice("External API key created. Copy it into WordPress now.");
      load();
    } catch (error) {
      setNotice(error.message);
    }
    setBusy(false);
  }

  async function testKey() {
    if (!newKey) return setNotice("Create a key first.");

    const response = await fetch("/api/external/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-P4ME-Key": newKey },
      body: JSON.stringify({
        source: "Promote4.me API Credential Center",
        type: "Package Delivery",
        title: "API Credential Center Test Order",
        order_number: "P4ME-API-TEST",
        customer_name: "API Test Customer",
        address: "302 E 4th St, Joplin, MO",
        status: "Assigned",
        instructions: "This proves the External API Key works.",
      }),
    });

    const data = await response.json();
    setNotice(response.ok ? "API test created Work Order: " + data.job.id : (data.error || "API test failed."));
  }

  async function revoke(id) {
    if (!confirm("Revoke this API key?")) return;
    await api("/api/external-keys/" + id, { method: "DELETE" });
    setNotice("API key revoked.");
    load();
  }

  return (
    <section className="panel wide api-key-center">
      <h3><KeyRound /> API Credential Center</h3>
      <p className="hint">Create the External API Key for WordPress/WooCommerce, Shopify, delivery services, or custom apps.</p>

      <div className="api-key-actions">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Key label" />
        <button className="primary" disabled={busy} onClick={createKey}>{busy ? "Creating..." : "Create External API Key"}</button>
      </div>

      {newKey && (
        <div className="secret-box">
          <strong>Copy this into WordPress Settings → Promote4.me → External API Key:</strong>
          <code>{newKey}</code>
          <div className="button-row">
            <button className="secondary" onClick={() => navigator.clipboard?.writeText(newKey)}>Copy key</button>
            <button className="primary" onClick={testKey}>Test key now</button>
          </div>
        </div>
      )}

      <div className="key-list">
        {keys.map((key) => (
          <article key={key.id}>
            <strong>{key.label}</strong>
            <span>{key.status} · created {new Date(key.created_at).toLocaleString()} · last used {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "never"}</span>
            {key.status !== "revoked" && <button className="secondary danger" onClick={() => revoke(key.id)}>Revoke</button>}
          </article>
        ))}
        {!keys.length && <article><strong>No API keys yet</strong><span>Create one for your WordPress plugin.</span></article>}
      </div>
    </section>
  );
}
`;

  app = app.replace("function AddOns({ boot, plans, setNotice }) {", component + "\nfunction AddOns({ boot, plans, setNotice }) {");
}

app = app.replace(
  `{active === "addons" && <AddOns {...props} />}`,
  `{active === "addons" && <><ApiCredentialCenter291 setNotice={setNotice} /><AddOns {...props} /></>}`
);

app = app.replaceAll("promote4me-woocommerce.php", "promote4me-woocommerce.zip");
app = app.replaceAll("Download WordPress/WooCommerce Plugin</strong>", "Download WordPress/WooCommerce Plugin ZIP</strong>");

fs.writeFileSync("src/ProductApp.jsx", app);

let css = fs.readFileSync("src/styles.css", "utf8");

if (!has(css, "P4ME 2.9.1 API CREDENTIAL CENTER")) {
  css += `
/* P4ME 2.9.1 API CREDENTIAL CENTER */
.api-key-center{margin-bottom:18px}
.api-key-actions{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;margin:16px 0}
.secret-box{display:grid;gap:10px;border:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.09);border-radius:18px;padding:16px;margin:14px 0}
.secret-box code{display:block;word-break:break-all;background:rgba(7,17,31,.8);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;color:#7dd3fc}
.key-list{display:grid;gap:10px;margin-top:12px}
.key-list article{display:grid;gap:6px;border:1px solid rgba(125,211,252,.18);background:rgba(255,255,255,.045);border-radius:16px;padding:14px}
.key-list span{color:#bdd4ea;font-size:13px}
@media(max-width:760px){.api-key-actions{grid-template-columns:1fr}}
`;
}

fs.writeFileSync("src/styles.css", css);

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.version = "2.9.1";
if (!pkg.scripts.prebuild.includes("apply-2.9.1-api-key-center.mjs")) {
  pkg.scripts.prebuild += " && node scripts/apply-2.9.1-api-key-center.mjs";
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

console.log("Promote4.me 2.9.1 API Key Center applied.");
