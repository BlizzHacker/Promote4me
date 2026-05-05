import fs from 'fs';

console.log('Applying Promote4.me 3.5.4 mobile proof flow...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.5.4';
for (const s of ['apply-3.5.3-no-manual-zip-fallback.mjs','apply-3.5.4-mobile-proof-flow.mjs']) {
  if (!pkg.scripts.prebuild.includes(s)) pkg.scripts.prebuild += ' && node scripts/' + s;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g,"version: '3.5.4'");
if (!server.includes("from 'multer'")) server = "import multer from 'multer';\n" + server;
if (!server.includes('/api/proof/exif-scan-v354')) {
  const block = `
const p4me354ProofUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 1 } });
function p4me354FlatExif(obj={}, prefix='', out={}) { for (const [k,v] of Object.entries(obj||{})) { const key = prefix ? prefix + '.' + k : k; if (v && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v) && !Array.isArray(v)) p4me354FlatExif(v,key,out); else out[key] = v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join(', ') : String(v ?? ''); } return out; }
function p4me354GpsFromExif(exif={}) { const lat = Number(exif.latitude ?? exif.GPSLatitude ?? exif['gps.latitude']); const lng = Number(exif.longitude ?? exif.GPSLongitude ?? exif['gps.longitude']); return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null; }
app.post('/api/proof/exif-scan-v354', p4me354ProofUpload.any(), async (req,res)=>{ try { const file = (req.files||[])[0]; if (!file) return res.status(400).json({ok:false,error:'Upload a photo first.'}); const exifr = await import('exifr'); let exif = {}; try { exif = await exifr.parse(file.buffer, { xmp:true, iptc:true, icc:true, jfif:true, ihdr:true, tiff:true, gps:true, reviveValues:true }) || {}; } catch(e) { exif = { parse_error: e.message || String(e) }; } const gps = p4me354GpsFromExif(exif); const flat = p4me354FlatExif(exif); const important = { file_name:file.originalname, mime_type:file.mimetype, size_bytes:file.size, captured_at: exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate || exif.DateTime || '', camera: [exif.Make, exif.Model].filter(Boolean).join(' '), software: exif.Software || '', lens: exif.LensModel || exif.Lens || '', gps, image_width: exif.ExifImageWidth || exif.ImageWidth || exif.PixelXDimension || '', image_height: exif.ExifImageHeight || exif.ImageHeight || exif.PixelYDimension || '', orientation: exif.Orientation || '', altitude: exif.GPSAltitude || exif.altitude || '', direction: exif.GPSImgDirection || '', has_gps: !!gps, has_timestamp: !!(exif.DateTimeOriginal || exif.CreateDate || exif.DateTime), field_count: Object.keys(flat).length }; const confidence = (important.has_gps?45:0) + (important.has_timestamp?25:0) + (important.camera?15:0) + (important.image_width?10:0) + (important.software?5:0); res.json({ok:true,version:'3.5.4',important,confidence_score:Math.min(confidence,100),fields:flat}); } catch(e) { res.status(500).json({ok:false,error:e.message || String(e)}); } });
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replace('import React, { useEffect, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";');
app = app.replaceAll('Promote4.me v3.5.3','Promote4.me v3.5.4');
app = app.replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.4');
app = app.replaceAll('Authentik / Social Login','Social Login');

if (!app.includes('function PhotoEvidenceScanner354')) {
  const comp = String.raw`
function PhotoEvidenceScanner354({setNotice}){const[file,setFile]=useState(null),[preview,setPreview]=useState(''),[scan,setScan]=useState(null),[busy,setBusy]=useState(false);async function run(f=file){if(!f){setNotice?.('Choose a photo first.');return}setBusy(true);try{const fd=new FormData();fd.append('photo',f);const d=await fetch('/api/proof/exif-scan-v354',{method:'POST',body:fd}).then(r=>r.json());setScan(d);setNotice?.(d.ok?'Photo evidence scanned.':'Scan failed: '+(d.error||''))}catch(e){setNotice?.('Scan failed: '+e.message)}finally{setBusy(false)}}function pick(e){const f=e.target.files?.[0];setFile(f||null);setScan(null);if(f){setPreview(URL.createObjectURL(f));setTimeout(()=>run(f),50)}}const important=scan?.important||{};return <section className="panel wide proof354"><div className="proof354-head"><div><h3>Photo Proof Scanner</h3><p className="hint">Upload a job photo to preview it, extract EXIF/GPS/timestamp/camera details, and judge proof strength.</p></div><label className="primary proof354-pick"><input type="file" accept="image/*" capture="environment" onChange={pick}/>Upload photo</label></div>{preview&&<div className="proof354-layout"><img src={preview} alt="Proof preview"/><div className="proof354-summary"><strong>Evidence score: {scan?.confidence_score ?? 0}/100</strong><span>GPS: {important.has_gps?'Found':'Not found'}</span><span>Timestamp: {important.has_timestamp?'Found':'Not found'}</span><span>Camera: {important.camera || 'Unknown'}</span>{important.gps&&<a target="_blank" href={'https://www.google.com/maps/search/?api=1&query='+important.gps.lat+','+important.gps.lng}>Open GPS location</a>}<button className="secondary" disabled={!file||busy} onClick={()=>run()}>{busy?'Scanning...':'Rescan EXIF'}</button></div></div>}{scan?.fields&&<details className="proof354-details" open><summary>Important EXIF fields</summary><div className="proof354-grid">{Object.entries(important).map(([k,v])=><div key={k}><b>{k}</b><span>{typeof v==='object'?JSON.stringify(v):String(v||'')}</span></div>)}</div><summary>All extracted fields</summary><div className="proof354-grid all">{Object.entries(scan.fields).slice(0,140).map(([k,v])=><div key={k}><b>{k}</b><span>{String(v||'')}</span></div>)}</div></details>}</section>}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', comp+'\nfunction PublicSite({ plans, onAuthed }) {');
}

// Add logged-in mobile-safe action buttons where previous topbar actions exist.
app = app.replace('<div className="topbar-actions"><button className="secondary" onClick={() => setActive("dashboard")}>Home</button><button className="secondary" onClick={() => { window.dispatchEvent(new Event("p4me-workhub-refresh")); reload(); }}><RefreshCcw size={16} /> Refresh</button></div>', '<div className="topbar-actions"><button className="secondary" onClick={() => setActive("dashboard")}>Home</button><button className="secondary" onClick={() => { window.dispatchEvent(new Event("p4me-workhub-refresh")); reload(); setTimeout(()=>window.location.reload(),250); }}><RefreshCcw size={16} /> Refresh</button><button className="secondary danger" onClick={() => { localStorage.clear(); setSession(null); window.location.href="/"; }}>Logout</button></div>');

// Put scanner into Marketplace Work Hub and, if DashboardPanel exists, under dashboard via current dashboard panel text.
app = app.replace('<PublicWorkHub350 onSignup={()=>setNotice?.(\'Already signed in. Save or convert leads here.\')} /></section><section className="panel"><h3>Saved leads</h3>', '<PublicWorkHub350 onSignup={()=>setNotice?.(\'Already signed in. Save or convert leads here.\')} /><PhotoEvidenceScanner354 setNotice={setNotice}/></section><section className="panel"><h3>Saved leads</h3>');
app = app.replace('<PublicWorkHub350 onSignup={()=>setNotice?.("Already signed in. Save or convert leads here.")} /></section><section className="panel"><h3>Saved leads</h3>', '<PublicWorkHub350 onSignup={()=>setNotice?.("Already signed in. Save or convert leads here.")} /><PhotoEvidenceScanner354 setNotice={setNotice}/></section><section className="panel"><h3>Saved leads</h3>');

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css','utf8');
if (!css.includes('P4ME 3.5.4 MOBILE PROOF FLOW')) css += `
/* P4ME 3.5.4 MOBILE PROOF FLOW */
.topbar-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.topbar-actions .danger{border-color:rgba(248,113,113,.45);color:#fecaca}.proof354{margin-top:14px}.proof354-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.proof354-pick input{display:none}.proof354-layout{display:grid;grid-template-columns:minmax(0,320px) 1fr;gap:14px;align-items:start}.proof354-layout img{width:100%;max-height:360px;object-fit:contain;border-radius:18px;border:1px solid rgba(125,211,252,.2);background:#06111d}.proof354-summary{display:grid;gap:8px;background:rgba(255,255,255,.045);border:1px solid rgba(125,211,252,.15);border-radius:16px;padding:12px}.proof354-summary a{color:#7dd3fc}.proof354-details{margin-top:12px}.proof354-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:10px}.proof354-grid div{display:grid;gap:3px;background:rgba(255,255,255,.04);border:1px solid rgba(125,211,252,.12);border-radius:12px;padding:9px;min-width:0}.proof354-grid b{color:#7dd3fc;font-size:12px}.proof354-grid span{word-break:break-word;color:#dcefff;font-size:12px}@media(max-width:780px){.topbar{position:sticky;top:0;z-index:20}.topbar-actions{width:100%;display:grid;grid-template-columns:1fr 1fr 1fr}.topbar-actions button{min-height:44px}.proof354-head,.proof354-layout{grid-template-columns:1fr;display:grid}.proof354-pick{text-align:center}.proof354-layout img{max-height:300px}.proof354-grid{grid-template-columns:1fr}.sidebar{max-height:55vh;overflow:auto}}
`;
fs.writeFileSync('src/styles.css', css);
console.log('Promote4.me 3.5.4 mobile proof flow applied.');
