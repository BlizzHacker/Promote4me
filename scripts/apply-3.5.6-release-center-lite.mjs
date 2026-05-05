import fs from 'fs';

console.log('Applying Promote4.me 3.5.6 lightweight Release Center...');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '3.5.6';
for (const s of ['apply-3.5.5-mobile-dock-proof-scanner.mjs','apply-3.5.6-release-center-lite.mjs']) {
  if (!pkg.scripts.prebuild.includes(s)) pkg.scripts.prebuild += ' && node scripts/' + s;
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

let server = fs.readFileSync('server/index.js', 'utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.5.6'");
server = server.replace(/version: "[^"]+"/g, 'version: "3.5.6"');

if (!server.includes('/api/admin/release/status-v356')) {
  const block = `
function p4me356ReleaseStatus(){
  let p = {}, scripts = '';
  try { p = JSON.parse(fs.readFileSync('package.json','utf8')); scripts = p.scripts && p.scripts.prebuild || ''; } catch {}
  let bundleHasDock = false;
  try { bundleHasDock = fs.readdirSync('dist/assets').filter(f=>f.endsWith('.js')).some(f=>fs.readFileSync('dist/assets/'+f,'utf8').includes('P4ME_MOBILE_DOCK_355')); } catch {}
  return {
    package_version: p.version || 'unknown',
    script_count: scripts ? scripts.split('&&').length : 0,
    includes_mobile_dock_script: scripts.includes('apply-3.5.5-mobile-dock-proof-scanner.mjs'),
    includes_release_center_script: scripts.includes('apply-3.5.6-release-center-lite.mjs'),
    bundle_has_mobile_dock: bundleHasDock,
    update_command: 'promote4me-update',
    manual_command: 'cd /opt/promote4me/app && git fetch origin main && git reset --hard origin/main && npm install && npm run build && P4ME_DATA_DIR=/opt/promote4me/data npm run seed && systemctl restart promote4me-api && systemctl reload nginx'
  };
}
app.get('/api/admin/release/status-v356', requireAuth, requireRole('super_admin'), (req,res)=>res.json({ok:true, version:'3.5.6', status:p4me356ReleaseStatus()}));
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx', 'utf8');
app = app.replaceAll('Promote4.me v3.5.5','Promote4.me v3.5.6').replaceAll('Promote4.me v3.5.4','Promote4.me v3.5.6').replaceAll('Promote4.me v3.5.3','Promote4.me v3.5.6').replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.6');
app = app.replaceAll('Authentik / Social Login','Social Login');

if (!app.includes('function ReleaseCenter356Lite')) {
  const comp = String.raw`
function ReleaseCenter356Lite({setNotice}){const[status,setStatus]=useState(null);async function load(){try{setStatus(await api('/api/admin/release/status-v356'))}catch(e){setNotice?.(e.message)}}useEffect(()=>{load()},[]);return <section className="panel wide release356"><h3>Release Center</h3><p className="hint">Super admin stability panel. Shows whether the deployed build includes the critical mobile/proof/update scripts and gives the update command.</p><div className="button-row"><button className="secondary" onClick={load}>Refresh release status</button><button className="secondary" onClick={()=>navigator.clipboard?.writeText(status?.status?.manual_command||'promote4me-update')}>Copy update command</button></div>{status&&<div className="release356-grid"><article><strong>Package</strong><span>{status.status.package_version}</span></article><article><strong>Patch count</strong><span>{status.status.script_count}</span></article><article><strong>Mobile dock script</strong><span>{status.status.includes_mobile_dock_script?'yes':'no'}</span></article><article><strong>Bundle marker</strong><span>{status.status.bundle_has_mobile_dock?'yes':'no'}</span></article></div>}<pre className="release356-log">{status?.status?.manual_command||'Loading...'}</pre></section>}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', comp + '\nfunction PublicSite({ plans, onAuthed }) {');
}
if (!app.includes('<ReleaseCenter356Lite')) {
  app = app.replace('{active === "addons" && <><ApiCredentialCenter291 setNotice={setNotice} />', '{active === "addons" && <><ReleaseCenter356Lite setNotice={setNotice}/><ApiCredentialCenter291 setNotice={setNotice} />');
}

let css = fs.readFileSync('src/styles.css','utf8');
if (!css.includes('P4ME 3.5.6 RELEASE CENTER LITE')) css += `\n/* P4ME 3.5.6 RELEASE CENTER LITE */\n.release356-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0}.release356-grid article{display:grid;gap:4px;background:rgba(255,255,255,.045);border:1px solid rgba(125,211,252,.14);border-radius:14px;padding:12px}.release356-grid span{color:#7dd3fc}.release356-log{white-space:pre-wrap;background:#05111e;border:1px solid rgba(125,211,252,.16);border-radius:14px;padding:12px;color:#dcefff;overflow:auto}\n`;
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 3.5.6 lightweight Release Center applied.');
