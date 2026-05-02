import fs from "fs";

console.log("Applying Promote4.me 2.9.2 version lock...");

const targetVersion = "2.9.2";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.version = targetVersion;
if (!pkg.scripts.prebuild.includes("apply-2.9.2-version-lock.mjs")) {
  pkg.scripts.prebuild += " && node scripts/apply-2.9.2-version-lock.mjs";
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

let server = fs.readFileSync("server/index.js", "utf8");
server = server.replace(
  /app\.get\('\/api\/health', \(req, res\) => res\.json\(\{ ok: true, product: 'Promote4\.me', version: '[^']+' \}\)\);/,
  "app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.9.2' }));"
);
fs.writeFileSync("server/index.js", server);

let app = fs.readFileSync("src/ProductApp.jsx", "utf8");
app = app.replaceAll("Live Work Map · 2.9 beta", "Live Work Map · 2.9.2 beta");
app = app.replaceAll("Live Work Map · 2.9.1 beta", "Live Work Map · 2.9.2 beta");
app = app.replaceAll("promote4me-woocommerce.php", "promote4me-woocommerce.zip");
fs.writeFileSync("src/ProductApp.jsx", app);

console.log("Promote4.me 2.9.2 version lock applied.");
