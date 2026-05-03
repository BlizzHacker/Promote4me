import fs from 'fs';

const has = (s, x) => s.includes(x);
console.log('Applying Promote4.me 2.9.7 mobile UI and photo EXIF evidence upgrade...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '2.9.7';
if (!pkg.scripts.prebuild.includes('apply-2.9.7-mobile-photo-exif.mjs')) pkg.scripts.prebuild += ' && node scripts/apply-2.9.7-mobile-photo-exif.mjs';
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '2.9.7'");
if (!has(server, 'function p4me297ExifSchema')) {
  server = server.replace('migrate();', `migrate();
function p4me297ExifSchema() {
  const add = (table, column, definition) => { try { run('ALTER TABLE ' + table + ' ADD COLUMN ' + column + ' ' + definition); } catch {} };
  add('evidence', 'exif_json', "TEXT NOT NULL DEFAULT '{}'");
  add('evidence', 'photo_lat', 'REAL');
  add('evidence', 'photo_lng', 'REAL');
  add('evidence', 'photo_taken_at', "TEXT NOT NULL DEFAULT ''");
  add('evidence', 'device_make', "TEXT NOT NULL DEFAULT ''");
  add('evidence', 'device_model', "TEXT NOT NULL DEFAULT ''");
  add('evidence', 'gps_source', "TEXT NOT NULL DEFAULT 'browser'");
  add('evidence', 'gps_distance_m', 'REAL');
}
p4me297ExifSchema();`);
}

// Repair older generated runtime if it was already patched with the wrong middleware name.
server = server.replaceAll("app.post('/api/evidence/:jobId/photo-meta', authRequired", "app.post('/api/evidence/:jobId/photo-meta', requireAuth");
server = server.replaceAll("app.get('/api/evidence/:jobId', authRequired", "app.get('/api/evidence/:jobId', requireAuth");

if (!has(server, "app.post('/api/evidence/:jobId/photo-meta'")) {
  const endpoints = `
function p4meDistanceMeters(aLat,aLng,bLat,bLng){ if([aLat,aLng,bLat,bLng].some(v=>v===null||v===undefined||v===''||Number.isNaN(Number(v)))) return null; const R=6371000, toRad=d=>Number(d)*Math.PI/180; const dLat=toRad(bLat-aLat), dLng=toRad(bLng-aLng); const s=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2; return Math.round(R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))); }
app.post('/api/evidence/:jobId/photo-meta', requireAuth, (req,res)=>{
  const job = row('SELECT * FROM jobs WHERE id=? AND tenant_id=?', [req.params.jobId, req.user.tenant_id]);
  if(!job) return res.status(404).json({error:'Job not found.'});
  const b=req.body||{}, exif=b.exif||{};
  const photoLat = Number(exif.latitude ?? b.photo_lat ?? NaN), photoLng = Number(exif.longitude ?? b.photo_lng ?? NaN);
  const browserLat = Number(b.browser_lat ?? NaN), browserLng = Number(b.browser_lng ?? NaN);
  const distance = p4meDistanceMeters(job.lat, job.lng, Number.isFinite(photoLat)?photoLat:browserLat, Number.isFinite(photoLng)?photoLng:browserLng);
  const source = Number.isFinite(photoLat) && Number.isFinite(photoLng) ? 'photo_exif' : (Number.isFinite(browserLat)&&Number.isFinite(browserLng) ? 'browser_gps' : 'missing');
  const confidence = source==='photo_exif' && distance!==null && distance <= 150 ? 98 : source==='photo_exif' ? 82 : source==='browser_gps' ? 60 : 20;
  const id = publicId('evmeta');
  run('INSERT INTO evidence (id,tenant_id,job_id,user_id,type,notes,lat,lng,accuracy_m,confidence,status,file_url,exif_json,photo_lat,photo_lng,photo_taken_at,device_make,device_model,gps_source,gps_distance_m,created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, req.user.tenant_id, job.id, req.user.id, 'photo_meta', b.notes||'', Number.isFinite(browserLat)?browserLat:null, Number.isFinite(browserLng)?browserLng:null, b.accuracy_m||null, confidence, 'submitted', b.file_url||'', JSON.stringify(exif), Number.isFinite(photoLat)?photoLat:null, Number.isFinite(photoLng)?photoLng:null, exif.dateTimeOriginal||exif.DateTimeOriginal||exif.CreateDate||exif.ModifyDate||'', exif.Make||'', exif.Model||'', source, distance, now()]);
  run('UPDATE jobs SET status=?, updated_at=? WHERE id=?', ['Submitted', now(), job.id]);
  res.json({ok:true,evidence:row('SELECT * FROM evidence WHERE id=?',[id]),analysis:{source,confidence,distance_m:distance,photo_has_gps:source==='photo_exif',device:[exif.Make,exif.Model].filter(Boolean).join(' '),taken_at:exif.dateTimeOriginal||exif.DateTimeOriginal||exif.CreateDate||exif.ModifyDate||''}});
});
app.get('/api/evidence/:jobId', requireAuth, (req,res)=>{ const rows=all('SELECT * FROM evidence WHERE tenant_id=? AND job_id=? ORDER BY created_at DESC',[req.user.tenant_id, req.params.jobId]); res.json({evidence:rows}); });
`;
  server = server.replace("app.post('/api/auth/register'", endpoints + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
if (!has(app, 'function MobileTopBar297')) {
  const components = `
function MobileTopBar297({active,setActive,user}){const [open,setOpen]=useState(false);return <><div className="mobile-topbar"><button className="icon-btn" onClick={()=>setOpen(true)}>☰</button><strong>Promote4.me</strong><span>{user?.role||''}</span></div>{open&&<div className="mobile-drawer"><button className="drawer-close" onClick={()=>setOpen(false)}>×</button><h3>Promote4.me</h3>{navItemsForRole297(user?.role).map(item=><button key={item.id} className={active===item.id?'active':''} onClick={()=>{setActive(item.id);setOpen(false)}}>{item.label}</button>)}</div>}</>}
function navItemsForRole297(role){const owner=[['dashboard','Overview'],['hierarchy','Platform'],['jobs','Work Orders'],['evidence','Approvals'],['map','Map'],['workforce','People'],['team','Teams'],['clients','Locations'],['addons','Integrations'],['marketplace','Marketplace'],['training','Training'],['settings','Settings']]; const worker=[['jobs','My Work'],['evidence','Upload Proof'],['map','Map'],['marketplace','Find Work'],['training','Training']]; const arr=(role==='team_member'||role==='contractor')?worker:owner; return arr.map(([id,label])=>({id,label}));}
function PhotoEvidenceInspector297({job,setNotice}){const [file,setFile]=useState(null),[meta,setMeta]=useState(null),[busy,setBusy]=useState(false);async function pick(e){const f=e.target.files?.[0];setFile(f);setMeta(null);if(!f)return;try{const exif=await exifr.parse(f,{gps:true,tiff:true,exif:true,ifd1:true,interop:true,pick:['Make','Model','DateTimeOriginal','CreateDate','ModifyDate','latitude','longitude','GPSLatitude','GPSLongitude','GPSAltitude','Orientation','LensModel','Software']});setMeta(exif||{});}catch(err){setMeta({error:err.message});}}async function submit(){if(!job)return;setBusy(true);let pos={};try{pos=await new Promise((resolve)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>resolve({browser_lat:p.coords.latitude,browser_lng:p.coords.longitude,accuracy_m:p.coords.accuracy}),()=>resolve({}),{enableHighAccuracy:true,timeout:7000}):resolve({}));}catch{}try{const res=await api('/api/evidence/'+job.id+'/photo-meta',{method:'POST',body:JSON.stringify({exif:meta||{},...pos,notes:'Photo evidence inspected in browser before upload.'})});setNotice('Photo proof submitted · '+res.analysis.source+' · '+res.analysis.confidence+'% confidence');}catch(e){setNotice(e.message)}setBusy(false)}return <div className="photo-inspector"><label className="upload-drop"><Camera/> <span>{file?file.name:'Choose/take proof photo'}</span><input type="file" accept="image/*" capture="environment" onChange={pick}/></label>{meta&&<div className="exif-grid"><div><strong>Photo GPS</strong><span>{meta.latitude&&meta.longitude?meta.latitude.toFixed(6)+', '+meta.longitude.toFixed(6):'No embedded GPS found'}</span></div><div><strong>Taken</strong><span>{String(meta.DateTimeOriginal||meta.CreateDate||meta.ModifyDate||'Unknown')}</span></div><div><strong>Device</strong><span>{[meta.Make,meta.Model].filter(Boolean).join(' ')||'Unknown'}</span></div><div><strong>Software</strong><span>{meta.Software||'Unknown'}</span></div></div>}<button className="primary full" disabled={!file||busy} onClick={submit}>{busy?'Submitting…':'Submit Photo Proof + GPS Analysis'}</button></div>}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', components + '\nfunction PublicSite({ plans, onAuthed }) {');
}
if (!has(app, '<MobileTopBar297')) {
  app = app.replace('<div className="app-shell">', '<div className="app-shell"><MobileTopBar297 active={active} setActive={setActive} user={boot?.user} />');
}
if (!has(app, '<PhotoEvidenceInspector297')) {
  app = app.replace('<button className="primary full"', '{selectedJob && <PhotoEvidenceInspector297 job={selectedJob} setNotice={setNotice}/>}<button className="primary full"');
}
fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css','utf8');
if (!has(css, 'P4ME 2.9.7 MOBILE EXIF')) css += `
/* P4ME 2.9.7 MOBILE EXIF */
.mobile-topbar{display:none}.mobile-drawer{display:none}.photo-inspector{display:grid;gap:12px;margin:12px 0}.upload-drop{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;border:1px dashed rgba(125,211,252,.55);border-radius:16px;padding:16px;background:rgba(14,165,233,.08);cursor:pointer}.upload-drop input{position:absolute;inset:0;opacity:0;cursor:pointer}.exif-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.exif-grid div{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px}.exif-grid span{display:block;color:#bdd4ea;font-size:13px;margin-top:4px}.full{width:100%}@media(max-width:860px){body{overflow-x:hidden}.app-shell{display:block;padding-top:64px}.sidebar{display:none!important}.mobile-topbar{display:flex;position:fixed;top:0;left:0;right:0;z-index:80;align-items:center;gap:12px;justify-content:space-between;background:#07111f;border-bottom:1px solid rgba(125,211,252,.18);padding:12px 14px;color:#fff}.icon-btn{border:1px solid rgba(125,211,252,.25);background:#102033;color:#eaf3ff;border-radius:12px;padding:8px 12px}.mobile-drawer{display:grid;position:fixed;z-index:100;inset:0 auto 0 0;width:min(86vw,340px);background:#07111f;border-right:1px solid rgba(125,211,252,.2);padding:18px;gap:8px;align-content:start;box-shadow:20px 0 60px rgba(0,0,0,.45)}.mobile-drawer button{padding:14px;border-radius:14px;border:0;background:transparent;color:#eaf3ff;text-align:left}.mobile-drawer button.active{background:#12324b}.drawer-close{justify-self:end!important;font-size:28px!important}.main{padding:18px!important}.content-grid,.shopify-grid,.dashboard-grid{display:grid!important;grid-template-columns:1fr!important}.panel,.wide{grid-column:auto!important;max-width:none!important}.table-wrap{overflow-x:auto}.jobs-table,.orders-table{min-width:760px}.form-grid,.card-grid,.integration-cards,.stats-grid{grid-template-columns:1fr!important}h1{font-size:32px!important}.mobile-stack{display:grid!important;grid-template-columns:1fr!important}input,select,textarea,button{font-size:16px!important}.shopify-shell{padding:14px}.shopify-hero{display:grid}.shopify-actions{display:grid}.packet-row{display:grid}.photo-inspector{position:sticky;bottom:0;background:#07111f;border:1px solid rgba(125,211,252,.18);border-radius:18px;padding:12px}}
`;
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 2.9.7 mobile UI and photo EXIF evidence upgrade applied.');
