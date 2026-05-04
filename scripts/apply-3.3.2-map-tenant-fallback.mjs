import fs from 'fs';

console.log('Applying Promote4.me 3.3.2 tenant map key fallback...');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '3.3.2';
if (!pkg.scripts.prebuild.includes('apply-3.3.2-map-tenant-fallback.mjs')) {
  pkg.scripts.prebuild += ' && node scripts/apply-3.3.2-map-tenant-fallback.mjs';
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

let server = fs.readFileSync('server/index.js', 'utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.3.2'");
server = server.replaceAll('authRequired', 'requireAuth');

if (server.includes('function p4me331MapConfig') && !server.includes('function p4me332TenantMap')) {
  const helper = `
function p4me332TenantMap(tid) {
  return row('SELECT id,map_provider,google_maps_api_key FROM tenants WHERE id=?', [tid]) ||
    row('SELECT id,map_provider,google_maps_api_key FROM tenants WHERE id=?', ['tenant-moveweight']) ||
    row('SELECT id,map_provider,google_maps_api_key FROM tenants WHERE google_maps_api_key IS NOT NULL AND google_maps_api_key != ? ORDER BY created_at DESC LIMIT 1', ['']);
}
`;
  server = server.replace('function p4me331MapConfig', helper + '\nfunction p4me331MapConfig');
  server = server.replace("const envKey = process.env.P4ME_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY || '';", "const tenantMap = p4me332TenantMap(tid) || {};\n  const envKey = process.env.P4ME_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY || '';");
  server = server.replace("const savedKey = p4me331Setting(tid, 'google_maps_api_key') || p4me331Setting(tid, 'maps_api_key');", "const savedKey = p4me331Setting(tid, 'google_maps_api_key') || p4me331Setting(tid, 'maps_api_key') || tenantMap.google_maps_api_key || '';");
  server = server.replace("const requested = (p4me331Setting(tid, 'map_provider') || process.env.P4ME_MAP_PROVIDER || (key ? 'google' : 'openstreetmap')).toLowerCase();", "const requested = (p4me331Setting(tid, 'map_provider') || tenantMap.map_provider || process.env.P4ME_MAP_PROVIDER || (key ? 'google' : 'openstreetmap')).toLowerCase();");
}

if (server.includes("app.post('/api/maps/config'") && !server.includes('UPDATE tenants SET map_provider')) {
  server = server.replace("save('google_maps_api_key', req.body?.google_maps_api_key || req.body?.maps_api_key || '', 1);", "save('google_maps_api_key', req.body?.google_maps_api_key || req.body?.maps_api_key || '', 1);\n  try { run('UPDATE tenants SET map_provider=?, google_maps_api_key=? WHERE id=?', [req.body?.provider || req.body?.map_provider || 'google', req.body?.google_maps_api_key || req.body?.maps_api_key || '', req.user.tenant_id]); } catch {}\n  try { run('UPDATE tenants SET map_provider=?, google_maps_api_key=? WHERE id=?', [req.body?.provider || req.body?.map_provider || 'google', req.body?.google_maps_api_key || req.body?.maps_api_key || '', 'tenant-moveweight']); } catch {}");
}

fs.writeFileSync('server/index.js', server);
console.log('Promote4.me 3.3.2 tenant map key fallback applied.');
