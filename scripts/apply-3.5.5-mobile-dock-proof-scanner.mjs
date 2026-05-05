import fs from 'fs';

console.log('Applying Promote4.me 3.5.5 mobile dock and proof scanner...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.5.5';
for (const s of ['apply-3.5.3-no-manual-zip-fallback.mjs','apply-3.5.4-mobile-proof-flow.mjs','apply-3.5.5-mobile-dock-proof-scanner.mjs']) {
  if (!pkg.scripts.prebuild.includes(s)) pkg.scripts.prebuild += ' && node scripts/' + s;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g,"version: '3.5.5'");
server = server.replace(/version: "[^"]+"/g,'version: "3.5.5"');
if (!server.includes("from 'multer'")) server = "import multer from 'multer';\n" + server;
if (!server.includes('/api/proof/exif-scan-v355')) {
  const block = `
const p4me355ProofUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
function p4me355FlatExif(obj={}, prefix='', out={}) { for (const [k,v] of Object.entries(obj||{})) { const key = prefix ? prefix + '.' + k : k; if (v && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v) && !Array.isArray(v)) p4me355FlatExif(v,key,out); else out[key] = v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join(', ') : String(v ?? ''); } return out; }
function p4me355Gps(exif={}) { const lat = Number(exif.latitude ?? exif.GPSLatitude ?? exif['gps.latitude']); const lng = Number(exif.longitude ?? exif.GPSLongitude ?? exif['gps.longitude']); return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null; }
app.post('/api/proof/exif-scan-v355', p4me355ProofUpload.any(), async (req,res)=>{ try { const file=(req.files||[])[0]; if(!file) return res.status(400).json({ok:false,error:'Upload a photo first.'}); const exifr = await import('exifr'); let exif={}; try { exif = await exifr.parse(file.buffer,{xmp:true,iptc:true,icc:true,jfif:true,ihdr:true,tiff:true,gps:true,reviveValues:true}) || {}; } catch(e) { exif={parse_error:e.message||String(e)}; } const gps=p4me355Gps(exif); const fields=p4me355FlatExif(exif); const important={file_name:file.originalname,mime_type:file.mimetype,size_bytes:file.size,captured_at:exif.DateTimeOriginal||exif.CreateDate||exif.ModifyDate||exif.DateTime||'',camera:[exif.Make,exif.Model].filter(Boolean).join(' '),software:exif.Software||'',lens:exif.LensModel||exif.Lens||'',gps,image_width:exif.ExifImageWidth||exif.ImageWidth||exif.PixelXDimension||'',image_height:exif.ExifImageHeight||exif.ImageHeight||exif.PixelYDimension||'',orientation:exif.Orientation||'',altitude:exif.GPSAltitude||exif.altitude||'',direction:exif.GPSImgDirection||'',has_gps:!!gps,has_timestamp:!!(exif.DateTimeOriginal||exif.CreateDate||exif.DateTime),field_count:Object.keys(fields).length}; const confidence=(important.has_gps?45:0)+(important.has_timestamp?25:0)+(important.camera?15:0)+(important.image_width?10:0)+(important.software?5:0); res.json({ok:true,version:'3.5.5',important,confidence_score:Math.min(confidence,100),fields}); } catch(e) { res.status(500).json({ok:false,error:e.message||String(e)}); } });
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replace('import React, { useEffect, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";');
app = app.replaceAll('Promote4.me v3.5.4','Promote4.me v3.5.5').replaceAll('Promote4.me v3.5.3','Promote4.me v3.5.5').replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.5').replaceAll('Authentik / Social Login','Social Login');
if (!app.includes('P4ME_MOBILE_DOCK_355')) {
  const dock = String.raw`

/* P4ME_MOBILE_DOCK_355: DOM-level mobile navigation and proof scanner fallback. */
if (typeof window !== 'undefined' && !window.__P4ME_MOBILE_DOCK_355__) {
  window.__P4ME_MOBILE_DOCK_355__ = true;
  const ready355 = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  ready355(() => {
    const css = document.createElement('style');
    css.textContent = `
      .p4me-dock355{position:fixed;left:10px;right:10px;bottom:10px;z-index:99999;display:grid;grid-template-columns:repeat(5,1fr);gap:7px;padding:8px;border:1px solid rgba(125,211,252,.28);border-radius:20px;background:rgba(5,18,32,.96);backdrop-filter:blur(14px);box-shadow:0 12px 44px rgba(0,0,0,.45)}
      .p4me-dock355 button{min-height:46px;border:1px solid rgba(125,211,252,.24);border-radius:14px;background:#102033;color:#eaf3ff;font-weight:700;font-size:12px}.p4me-dock355 button.danger{border-color:rgba(248,113,113,.45);color:#fecaca}.p4me-proof-modal355{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);display:none;align-items:end;justify-content:center}.p4me-proof-card355{width:min(760px,100%);max-height:92vh;overflow:auto;background:#07111f;color:#eaf3ff;border:1px solid rgba(125,211,252,.25);border-radius:24px 24px 0 0;padding:16px;box-shadow:0 -20px 80px rgba(0,0,0,.55)}.p4me-proof-head355{display:flex;justify-content:space-between;gap:10px;align-items:center}.p4me-proof-head355 button,.p4me-proof-actions355 button,.p4me-proof-actions355 label{border:1px solid rgba(125,211,252,.25);border-radius:999px;background:#0ea5e9;color:#fff;padding:10px 14px;font-weight:800}.p4me-proof-actions355{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.p4me-proof-actions355 input{display:none}.p4me-proof-preview355{width:100%;max-height:300px;object-fit:contain;background:#020817;border:1px solid rgba(125,211,252,.15);border-radius:16px}.p4me-proof-grid355{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:12px}.p4me-proof-grid355 div{display:grid;gap:3px;padding:9px;background:rgba(255,255,255,.045);border:1px solid rgba(125,211,252,.12);border-radius:12px}.p4me-proof-grid355 b{font-size:12px;color:#7dd3fc}.p4me-proof-grid355 span{font-size:12px;word-break:break-word}.p4me-proof-status355{padding:10px;border-radius:14px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.22);margin:10px 0}.p4me-proof-map355{color:#7dd3fc}@media(min-width:900px){.p4me-dock355{left:auto;right:18px;bottom:18px;width:430px}}body{padding-bottom:78px!important}`;
    document.head.appendChild(css);
    const dock = document.createElement('div');
    dock.className = 'p4me-dock355';
    dock.innerHTML = `<button data-act="home">Home</button><button data-act="proof">Proof</button><button data-act="workhub">Work Hub</button><button data-act="refresh">Refresh</button><button class="danger" data-act="logout">Logout</button>`;
    document.body.appendChild(dock);
    const modal = document.createElement('div');
    modal.className = 'p4me-proof-modal355';
    modal.innerHTML = `<div class="p4me-proof-card355"><div class="p4me-proof-head355"><div><h2>Photo Proof Scanner</h2><p>Upload/take a photo to extract GPS, timestamp, camera, and EXIF evidence.</p></div><button data-close>Close</button></div><div class="p4me-proof-actions355"><label>Choose / Take Photo<input id="p4me-proof-input355" type="file" accept="image/*" capture="environment"></label><button data-rescan disabled>Rescan</button></div><div class="p4me-proof-status355">No photo selected.</div><img class="p4me-proof-preview355" style="display:none" alt="Proof preview"><div class="p4me-proof-grid355"></div><details><summary>All EXIF fields</summary><div class="p4me-proof-grid355 all"></div></details></div>`;
    document.body.appendChild(modal);
    const status = modal.querySelector('.p4me-proof-status355'), preview = modal.querySelector('.p4me-proof-preview355'), grid = modal.querySelector('.p4me-proof-grid355'), all = modal.querySelector('.p4me-proof-grid355.all'), input = modal.querySelector('#p4me-proof-input355'), rescan = modal.querySelector('[data-rescan]');
    let currentFile = null;
    function showProof(){ modal.style.display='flex'; }
    function rowHtml(obj){ return Object.entries(obj||{}).map(([k,v])=>`<div><b>${String(k).replace(/[<>&]/g,'')}</b><span>${typeof v==='object'?JSON.stringify(v):String(v||'').replace(/[<>&]/g,'')}</span></div>`).join(''); }
    async function scan(file=currentFile){ if(!file){status.textContent='Choose a photo first.';return;} currentFile=file; rescan.disabled=true; status.textContent='Scanning photo evidence...'; const fd=new FormData(); fd.append('photo',file); try{ const d=await fetch('/api/proof/exif-scan-v355',{method:'POST',body:fd}).then(r=>r.json()); if(!d.ok){status.textContent='Scan failed: '+(d.error||'Unknown error');return;} const gps=d.important?.gps; status.innerHTML = `Evidence score: <b>${d.confidence_score}/100</b> · GPS: <b>${d.important?.has_gps?'Found':'Not found'}</b> · Timestamp: <b>${d.important?.has_timestamp?'Found':'Not found'}</b>${gps?` · <a class="p4me-proof-map355" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}">Open GPS</a>`:''}`; grid.innerHTML=rowHtml(d.important||{}); all.innerHTML=rowHtml(d.fields||{}); } catch(e){ status.textContent='Scan failed: '+e.message; } finally{rescan.disabled=false;} }
    input.addEventListener('change',()=>{ const file=input.files?.[0]; if(file){ preview.src=URL.createObjectURL(file); preview.style.display='block'; scan(file); }});
    rescan.addEventListener('click',()=>scan());
    modal.querySelector('[data-close]').addEventListener('click',()=>modal.style.display='none');
    dock.addEventListener('click',(e)=>{ const act=e.target?.dataset?.act; if(!act)return; if(act==='home'){ location.href='/'; } if(act==='proof'){ showProof(); } if(act==='workhub'){ document.querySelector('.public-hub-350,.public-hub-347,.public-hub-345,[data-marker="P4ME_WORK_HUB_345_VISIBLE"]')?.scrollIntoView({behavior:'smooth',block:'start'}); } if(act==='refresh'){ window.dispatchEvent(new Event('p4me-workhub-refresh')); setTimeout(()=>location.reload(),250); } if(act==='logout'){ try{localStorage.clear();sessionStorage.clear();}catch{} location.href='/'; } });
  });
}
`;
  app = app.replace(/(import[^;]+;\s*)+/, (m)=>m + dock + '\n');
}
fs.writeFileSync('src/ProductApp.jsx', app);
console.log('Promote4.me 3.5.5 mobile dock and proof scanner applied.');
