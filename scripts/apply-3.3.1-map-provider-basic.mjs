import fs from 'fs';

console.log('Applying Promote4.me 3.3.1 map provider basics...');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '3.3.1';
if (!pkg.scripts.prebuild.includes('apply-3.3.1-map-provider-basic.mjs')) {
  pkg.scripts.prebuild += ' && node scripts/apply-3.3.1-map-provider-basic.mjs';
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

let server = fs.readFileSync('server/index.js', 'utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.3.1'");
server = server.replaceAll('authRequired', 'requireAuth');

if (!server.includes('p4me331MapProviderSchema')) {
  server = server.replace('migrate();', `migrate();
function p4me331MapProviderSchema() {
  run("CREATE TABLE IF NOT EXISTS app_settings (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, setting_key TEXT NOT NULL, setting_value TEXT NOT NULL DEFAULT '', is_secret INTEGER NOT NULL DEFAULT 0, updated_by TEXT NOT NULL DEFAULT '', updated_at TEXT, UNIQUE(tenant_id, setting_key))");
}
p4me331MapProviderSchema();`);
}

if (!server.includes("app.get('/api/public/map-config'")) {
  const block = `
function p4me331Setting(tid, key) {
  const local = row('SELECT setting_value FROM app_settings WHERE tenant_id=? AND setting_key=?', [tid, key]);
  if (local?.setting_value) return local.setting_value;
  const global = row('SELECT setting_value FROM app_settings WHERE tenant_id=? AND setting_key=?', ['moveweight', key]) || row('SELECT setting_value FROM app_settings WHERE tenant_id=? AND setting_key=?', ['tenant-moveweight', key]);
  return global?.setting_value || '';
}
function p4me331MapConfig(tid='tenant-moveweight') {
  const envKey = process.env.P4ME_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY || '';
  const savedKey = p4me331Setting(tid, 'google_maps_api_key') || p4me331Setting(tid, 'maps_api_key');
  const key = savedKey || envKey;
  const requested = (p4me331Setting(tid, 'map_provider') || process.env.P4ME_MAP_PROVIDER || (key ? 'google' : 'openstreetmap')).toLowerCase();
  return { provider: requested === 'google' && key ? 'google' : 'openstreetmap', requested_provider: requested, has_google_key: !!key, google_embed_key: requested === 'google' ? key : '', default_center: { lat: 37.0842, lng: -94.5133 } };
}
app.get('/api/public/map-config', (req, res) => res.json(p4me331MapConfig('tenant-moveweight')));
app.get('/api/maps/config', requireAuth, (req, res) => res.json(p4me331MapConfig(req.user.tenant_id)));
app.post('/api/maps/config', requireAuth, requireRole('super_admin'), (req, res) => {
  const tid = req.body?.tenant_id || 'moveweight';
  const save = (key, value, secret=0) => {
    if (!value) return;
    run('INSERT INTO app_settings (id,tenant_id,setting_key,setting_value,is_secret,updated_by,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(tenant_id,setting_key) DO UPDATE SET setting_value=excluded.setting_value,is_secret=excluded.is_secret,updated_by=excluded.updated_by,updated_at=excluded.updated_at', [publicId('set'), tid, key, String(value), secret ? 1 : 0, req.user.id, now()]);
  };
  save('map_provider', req.body?.provider || req.body?.map_provider || 'google');
  save('google_maps_api_key', req.body?.google_maps_api_key || req.body?.maps_api_key || '', 1);
  res.json({ ok: true, config: p4me331MapConfig(tid) });
});
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx', 'utf8');
if (!app.includes('buildMapEmbed331')) {
  const helper = `
function buildMapEmbed331(center, config={}) {
  const lat = Number(center?.lat || 37.0842);
  const lng = Number(center?.lng || -94.5133);
  if (config.provider === 'google' && config.google_embed_key) return 'https://www.google.com/maps/embed/v1/view?key=' + encodeURIComponent(config.google_embed_key) + '&center=' + lat + ',' + lng + '&zoom=13&maptype=roadmap';
  return 'https://www.openstreetmap.org/export/embed.html?bbox=' + (lng - 0.08) + '%2C' + (lat - 0.08) + '%2C' + (lng + 0.08) + '%2C' + (lat + 0.08) + '&layer=mapnik&marker=' + lat + '%2C' + lng;
}
function useMapConfig331(isPublic=false) {
  const [config, setConfig] = useState({ provider: 'openstreetmap', default_center: { lat: 37.0842, lng: -94.5133 } });
  useEffect(() => { fetch(isPublic ? '/api/public/map-config' : '/api/maps/config', { headers: localStorage.getItem(TOKEN_KEY) ? { Authorization: 'Bearer ' + localStorage.getItem(TOKEN_KEY) } : {} }).then(r => r.json()).then(setConfig).catch(() => {}); }, [isPublic]);
  return config;
}
function MapProviderBadge331({ config }) { return <div className="map-provider-badge">{config?.provider === 'google' ? 'Google Maps' : 'OpenStreetMap'}</div>; }
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', helper + '\nfunction PublicSite({ plans, onAuthed }) {');
}

app = app.replace('function PublicWorkMap() {\n  const [jobs, setJobs] = useState([]);', 'function PublicWorkMap() {\n  const mapConfig = useMapConfig331(true);\n  const [jobs, setJobs] = useState([]);');
app = app.replace("const mapUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=' +\n    (Number(center.lng) - 0.08) + '%2C' + (Number(center.lat) - 0.08) + '%2C' +\n    (Number(center.lng) + 0.08) + '%2C' + (Number(center.lat) + 0.08) +\n    '&layer=mapnik&marker=' + center.lat + '%2C' + center.lng;", "const mapUrl = buildMapEmbed331(center, mapConfig);");
app = app.replace('<div className="public-map-frame">\n          <iframe title="Promote4.me public work map" src={mapUrl} />', '<div className="public-map-frame">\n          <MapProviderBadge331 config={mapConfig} />\n          <iframe title="Promote4.me public work map" src={mapUrl} />');
app = app.replace('function WorkMapSearch330({setNotice, publicMode=false}){', 'function WorkMapSearch330({setNotice, publicMode=false}){const mapConfig330 = useMapConfig331(false);');
app = app.replace("src={'https://www.openstreetmap.org/export/embed.html?bbox='+((center.lng||-94.5133)-0.08)+'%2C'+((center.lat||37.0842)-0.06)+'%2C'+((center.lng||-94.5133)+0.08)+'%2C'+((center.lat||37.0842)+0.06)+'&layer=mapnik&marker='+(center.lat||37.0842)+'%2C'+(center.lng||-94.5133)}", "src={buildMapEmbed331(center,mapConfig330)}");
app = app.replace('<div className="workmap-canvas"><iframe', '<div className="workmap-canvas"><MapProviderBadge331 config={mapConfig330} /><iframe');

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css', 'utf8');
if (!css.includes('P4ME 3.3.1 MAP PROVIDER')) {
  css += `\n/* P4ME 3.3.1 MAP PROVIDER */\n.map-provider-badge{position:absolute;z-index:5;top:10px;left:10px;background:rgba(7,17,31,.86);border:1px solid rgba(125,211,252,.28);border-radius:14px;padding:8px 10px;color:#eaf3ff;font-weight:800}.public-map-frame,.workmap-canvas,.public-workmap-preview{position:relative}\n`;
}
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 3.3.1 map provider basics applied.');
