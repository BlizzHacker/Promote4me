import fs from "fs";

const has = (s, x) => s.includes(x);

console.log("Applying Promote4.me 2.6.0 recovery patch...");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.version = "2.6.0";
pkg.scripts.prebuild = [
  "node scripts/apply-beta-hardening.mjs",
  "node scripts/apply-2.5-visible-addons.mjs",
  "node scripts/apply-2.6.0-recovery.mjs"
].join(" && ");
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

fs.writeFileSync("public/downloads/README-addons.html", `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Promote4.me Integration Guide</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;background:#07111f;color:#eaf3ff;margin:0;line-height:1.55}
    .wrap{max-width:1050px;margin:auto;padding:40px}
    .badge{display:inline-block;background:#12324b;border:1px solid #1e5b82;border-radius:999px;padding:6px 12px;color:#8bdcff}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
    .card{background:#101d2e;border:1px solid #24364d;border-radius:18px;padding:22px;margin:16px 0}
    a{color:#7dd3fc}
    pre{background:#06101e;border:1px solid #24364d;border-radius:12px;padding:16px;white-space:pre-wrap;overflow:auto}
  </style>
</head>
<body>
  <div class="wrap">
    <span class="badge">Promote4.me 2.6.0</span>
    <h1>Integration & Beta Testing Guide</h1>
    <p>Connect Shopify, WooCommerce, DoorDash-style delivery APIs, contractor work, online deliverables, and proof-of-work approval flows.</p>

    <div class="grid">
      <section class="card">
        <h2>WooCommerce</h2>
        <p>Download the plugin, activate it in WordPress, paste your Promote4.me External API Key, then send a test order.</p>
        <p><a href="/downloads/promote4me-woocommerce.php">Download WooCommerce Plugin</a></p>
      </section>

      <section class="card">
        <h2>Shopify App Starter</h2>
        <p>Use the starter server as the base for a Shopify Partner app webhook receiver.</p>
        <p><a href="/downloads/shopify-app-server.js">Download Shopify App Server</a></p>
        <p><a href="/downloads/shopify-app-package.json">Download Shopify package.json</a></p>
      </section>

      <section class="card">
        <h2>Delivery / Field APIs</h2>
        <p>Credential profiles are planned for DoorDash, Grubhub, Uber Eats, Instacart, Shipt, Roadie, Walmart Spark, Amazon Flex, Shopify, WooCommerce, Online Work, and Custom Courier.</p>
      </section>
    </div>

    <section class="card">
      <h2>External Order Endpoint</h2>
      <pre>POST https://promote4.me/api/external/orders
Headers:
  Content-Type: application/json
  X-P4ME-Key: YOUR_EXTERNAL_API_KEY

{
  "source": "Shopify",
  "type": "Package Delivery",
  "title": "Shopify Local Delivery",
  "order_number": "1001",
  "customer_name": "Jane Customer",
  "address": "302 E 4th St, Joplin, MO",
  "status": "Assigned",
  "instructions": "Upload proof before completion."
}</pre>
    </section>
  </div>
</body>
</html>`);

fs.writeFileSync("public/downloads/shopify-app-package.json", JSON.stringify({
  name: "promote4me-shopify-app",
  version: "2.6.0",
  type: "module",
  scripts: { start: "node server.js" },
  dependencies: { express: "latest" }
}, null, 2) + "\n");

fs.writeFileSync("public/downloads/shopify-app-server.js", `import express from "express";

const app = express();
app.use(express.json({ limit: "5mb" }));

const P4ME_URL = process.env.P4ME_URL || "https://promote4.me";
const P4ME_KEY = process.env.P4ME_KEY || "";

app.post("/webhooks/orders-create", async (req, res) => {
  const order = req.body || {};
  const shipping = order.shipping_address || {};
  const payload = {
    source: "Shopify",
    type: "Package Delivery",
    title: "Shopify Order " + (order.name || order.id || ""),
    order_number: String(order.name || order.id || ""),
    customer_name: [shipping.first_name, shipping.last_name].filter(Boolean).join(" "),
    customer_email: order.email || "",
    customer_phone: shipping.phone || "",
    address: [shipping.address1, shipping.city, shipping.province, shipping.zip].filter(Boolean).join(", "),
    status: "Assigned",
    instructions: "Imported from Shopify app webhook. Upload proof before completion."
  };

  const response = await fetch(P4ME_URL.replace(/\\/$/, "") + "/api/external/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-P4ME-Key": P4ME_KEY },
    body: JSON.stringify(payload)
  });

  res.status(response.ok ? 200 : 500).send(await response.text());
});

app.get("/", (req, res) => res.send("Promote4.me Shopify App Starter is running."));
app.listen(process.env.PORT || 3000, () => console.log("Promote4.me Shopify app starter listening."));
`);

let app = fs.readFileSync("src/ProductApp.jsx", "utf8");

const replacements = [
  [`["dashboard", session.user?.role === "super_admin" ? "Super Admin" : "Dashboard", LayoutDashboard],`, `["dashboard", "Overview", LayoutDashboard],`],
  [`["hierarchy", session.user?.role === "super_admin" ? "Clients > Companies > Teams > Users" : "Companies > Teams > Users", Building2],`, `["hierarchy", session.user?.role === "super_admin" ? "Platform" : "Company", Building2],`],
  [`["jobs", "Jobs & Orders", ClipboardList],`, `["jobs", "Work Orders", ClipboardList],`],
  [`["review", "Evidence Review", ShieldCheck],`, `["review", "Approvals", ShieldCheck],`],
  [`["map", "Proof Map", Map],`, `["map", "Map", Map],`],
  [`["workforce", "Workforce", Users],`, `["workforce", "People", Users],`],
  [`["team", "Team", Users],`, `["team", "Teams", Users],`],
  [`["clients", "Clients", Building2],`, `["clients", "Locations", Building2],`],
  [`["addons", "Add-ons", Store],`, `["addons", "Integrations", Store],`],
  [`["marketplace", "Find Work", Map],`, `["marketplace", "Marketplace", Map],`],
  [`<h1>GPS photo proof for deliveries, contractors, field teams, Shopify, and WooCommerce.</h1>`, `<h1>Find work, hire contractors, and verify success with proof.</h1>`],
  [`<p>Promote4.me verifies that work happened at the right location with photo uploads, browser GPS, image GPS metadata, audit history, CRM tools, and customer tracking.</p>`, `<p>One platform for in-person field work, delivery proof, contractor dispatch, online deliverables, client approvals, and GPS/photo evidence.</p>`]
];

for (const [from, to] of replacements) app = app.replace(from, to);

if (!has(app, "Looking for Work?")) {
  app = app.replace(
    `<div className="hero-actions">`,
    `<div className="intent-grid">
          <article><strong>Looking for Work?</strong><span>Apply for local or remote 1099 jobs.</span></article>
          <article><strong>Looking for Contractors or Team Members?</strong><span>Post jobs, invite workers, approve proof.</span></article>
          <article><strong>Need to Monitor Success?</strong><span>Track GPS/photo evidence and client approvals.</span></article>
        </div>
        <div className="hero-actions">`
  );
}

if (has(app, "function MarketplacePanel") && !has(app, "Apply for local or remote")) {
  app = app.replace(
    "Angi / Field Nation style work board focused on proof-of-work for technicians, plumbers, delivery drivers, flyer teams, and contractors.",
    "Apply for local or remote work. In-person jobs require GPS/photo proof; online jobs require digital deliverables and manager approval."
  );
}

if (!has(app, "API Credential Center")) {
  app = app.replace(
    `<h3>Installable add-ons & delivery networks</h3>`,
    `<h3>Installable add-ons & delivery networks</h3>
    <div className="api-center">
      <strong>API Credential Center</strong>
      <p>Paste provider API keys in Settings/Integrations, then run Test to create a proof-ready job. Delivery providers, Shopify, WooCommerce, online work, and custom courier profiles are supported.</p>
    </div>`
  );
}

app = app.replaceAll("README-addons.txt", "README-addons.html");
app = app.replaceAll("Setup Guide</strong><span>README-addons.html</span>", "Interactive Setup Guide</strong><span>README-addons.html</span>");

fs.writeFileSync("src/ProductApp.jsx", app);

let css = fs.readFileSync("src/styles.css", "utf8");

if (!has(css, "P4ME 2.6 UI PATCH")) {
  css += `
/* P4ME 2.6 UI PATCH */
.intent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin:22px 0}
.intent-grid article,.api-center{border:1px solid rgba(125,211,252,.22);background:linear-gradient(135deg,rgba(14,165,233,.12),rgba(124,58,237,.10));border-radius:20px;padding:18px}
.intent-grid strong,.api-center strong{display:block;color:#fff;font-size:18px;margin-bottom:6px}
.intent-grid span{color:#c7d7ea}
.sidebar nav{gap:4px}
.sidebar nav button{border-radius:14px}
.workspace{max-width:1600px}
.panel h3{letter-spacing:-.02em}
.api-center{margin:0 0 16px}
`;
}

fs.writeFileSync("src/styles.css", css);

console.log("Promote4.me 2.6.0 recovery patch applied.");
