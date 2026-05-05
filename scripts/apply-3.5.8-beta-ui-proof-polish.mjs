import fs from 'fs';

console.log('Applying Promote4.me 3.5.8 beta UI and proof polish...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.5.8';
for (const s of ['apply-3.5.7-beta-shell.mjs','apply-3.5.8-beta-ui-proof-polish.mjs']) {
  if (!pkg.scripts.prebuild.includes(s)) pkg.scripts.prebuild += ' && node scripts/' + s;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g,"version: '3.5.8'");
server = server.replace(/version: "[^"]+"/g,'version: "3.5.8"');
if (!server.includes('/api/proof/exif-batch-v358')) {
  const block = `
app.post('/api/proof/exif-batch-v358', p4me355ProofUpload.any(), async (req,res)=>{ try { const files=(req.files||[]).slice(0,12); if(!files.length) return res.status(400).json({ok:false,error:'Upload one or more photos first.'}); const exifr = await import('exifr'); const results=[]; for(const file of files){ let exif={}; try{ exif = await exifr.parse(file.buffer,{xmp:true,iptc:true,icc:true,jfif:true,ihdr:true,tiff:true,gps:true,reviveValues:true}) || {}; }catch(e){ exif={parse_error:e.message||String(e)}; } const gps=p4me355Gps(exif); const fields=p4me355FlatExif(exif); const important={file_name:file.originalname,mime_type:file.mimetype,size_bytes:file.size,captured_at:exif.DateTimeOriginal||exif.CreateDate||exif.ModifyDate||exif.DateTime||'',camera:[exif.Make,exif.Model].filter(Boolean).join(' '),software:exif.Software||'',lens:exif.LensModel||exif.Lens||'',gps,image_width:exif.ExifImageWidth||exif.ImageWidth||exif.PixelXDimension||'',image_height:exif.ExifImageHeight||exif.ImageHeight||exif.PixelYDimension||'',orientation:exif.Orientation||'',altitude:exif.GPSAltitude||exif.altitude||'',direction:exif.GPSImgDirection||'',has_gps:!!gps,has_timestamp:!!(exif.DateTimeOriginal||exif.CreateDate||exif.DateTime),field_count:Object.keys(fields).length}; const confidence=(important.has_gps?45:0)+(important.has_timestamp?25:0)+(important.camera?15:0)+(important.image_width?10:0)+(important.software?5:0); results.push({ok:true,important,confidence_score:Math.min(confidence,100),fields}); } const summary={count:results.length,with_gps:results.filter(r=>r.important.has_gps).length,with_timestamp:results.filter(r=>r.important.has_timestamp).length,avg_score:Math.round(results.reduce((a,r)=>a+r.confidence_score,0)/Math.max(results.length,1))}; res.json({ok:true,version:'3.5.8',summary,results}); } catch(e){ res.status(500).json({ok:false,error:e.message||String(e)}); } });
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replaceAll('Promote4.me v3.5.7','Promote4.me v3.5.8').replaceAll('Promote4.me v3.5.6','Promote4.me v3.5.8').replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.8');

const betaShell = `
/* P4ME_BETA_SHELL_358 polished beta shell. */
if (typeof window !== 'undefined' && !window.__P4ME_BETA_SHELL_358__) {
  window.__P4ME_BETA_SHELL_358__ = true;
  const start358 = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  start358(() => {
    document.querySelectorAll('.p4me-beta-dock357,.p4me-dock355').forEach(el=>el.remove());
    const css = document.createElement('style');
    css.textContent = [
      '.p4me-beta-fab358{position:fixed;right:18px;bottom:18px;z-index:99999;display:grid;gap:10px;justify-items:end}',
      '.p4me-beta-fab358 .main{width:58px;height:58px;border:0;border-radius:22px;background:linear-gradient(135deg,#38bdf8,#22c55e);color:#04111f;font-weight:950;font-size:22px;box-shadow:0 18px 50px rgba(0,0,0,.48)}',
      '.p4me-beta-menu358{display:none;grid-template-columns:1fr;gap:8px;padding:10px;border:1px solid rgba(125,211,252,.26);border-radius:20px;background:rgba(5,18,32,.96);backdrop-filter:blur(16px);box-shadow:0 18px 60px rgba(0,0,0,.48)}',
      '.p4me-beta-fab358.open .p4me-beta-menu358{display:grid}.p4me-beta-menu358 button{min-height:42px;min-width:138px;border:1px solid rgba(125,211,252,.24);border-radius:14px;background:#102033;color:#eaf3ff;font-weight:850;font-size:13px}.p4me-beta-menu358 button.danger{border-color:rgba(248,113,113,.45);color:#fecaca}',
      '.p4me-beta-modal358{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);display:none;align-items:end;justify-content:center}.p4me-beta-card358{width:min(920px,100%);max-height:92vh;overflow:auto;background:linear-gradient(145deg,#07111f,#0b2035);color:#eaf3ff;border:1px solid rgba(125,211,252,.25);border-radius:26px 26px 0 0;padding:18px;box-shadow:0 -20px 90px rgba(0,0,0,.58)}',
      '.p4me-beta-head358{display:flex;justify-content:space-between;gap:10px;align-items:center}.p4me-beta-head358 button,.p4me-beta-actions358 button,.p4me-beta-actions358 label{border:1px solid rgba(125,211,252,.25);border-radius:999px;background:#0ea5e9;color:#fff;padding:10px 14px;font-weight:850;cursor:pointer}.p4me-beta-actions358{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.p4me-beta-actions358 input{display:none}',
      '.p4me-beta-status358{padding:10px;border-radius:15px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.22);margin:10px 0}.p4me-beta-grid358{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:12px}.p4me-beta-grid358 article,.p4me-beta-grid358 div{display:grid;gap:5px;background:rgba(255,255,255,.052);border:1px solid rgba(125,211,252,.14);border-radius:16px;padding:12px}.p4me-beta-grid358 b{color:#7dd3fc;font-size:12px}.p4me-beta-grid358 span{font-size:12px;word-break:break-word}',
      '.p4me-proof-strip358{display:flex;gap:10px;overflow:auto;padding:8px 0}.p4me-proof-strip358 img{width:94px;height:94px;object-fit:cover;border-radius:15px;border:1px solid rgba(125,211,252,.22);background:#020817}.p4me-beta-preview358{width:100%;max-height:290px;object-fit:contain;background:#020817;border:1px solid rgba(125,211,252,.15);border-radius:18px}',
      '@media(max-width:760px){.p4me-beta-fab358{right:12px;bottom:12px}.p4me-beta-fab358 .main{width:54px;height:54px}.p4me-beta-menu358 button{min-width:132px}.p4me-beta-card358{padding:14px}.p4me-beta-grid358{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(css);
    const fab = document.createElement('div');
    fab.className = 'p4me-beta-fab358';
    fab.innerHTML = '<div class="p4me-beta-menu358"><button data-act="site">Public Site</button><button data-act="work">Work Hub</button><button data-act="proof">Proof Studio</button><button data-act="release">Release</button><button class="danger" data-act="logout">Logout</button></div><button class="main" data-act="toggle">✦</button>';
    document.body.appendChild(fab);
    const modal = document.createElement('div');
    modal.className = 'p4me-beta-modal358';
    modal.innerHTML = '<div class="p4me-beta-card358"><div class="p4me-beta-head358"><div><h2 data-title>Promote4.me Beta Tools</h2><p data-subtitle>Polished mobile/admin control center.</p></div><button data-close>Close</button></div><div data-body></div></div>';
    document.body.appendChild(modal);
    const title = modal.querySelector('[data-title]'), subtitle = modal.querySelector('[data-subtitle]'), body = modal.querySelector('[data-body]');
    const esc = v => String(v==null?'':v).replace(/[<>&]/g,'');
    const kv = obj => '<div class="p4me-beta-grid358">'+Object.entries(obj||{}).map(([k,v])=>'<div><b>'+esc(k)+'</b><span>'+esc(typeof v==='object'?JSON.stringify(v):v)+'</span></div>').join('')+'</div>';
    function open(name,sub){ modal.style.display='flex'; title.textContent=name; subtitle.textContent=sub||''; body.innerHTML=''; fab.classList.remove('open'); }
    async function showRelease(){ open('Release Center','Build and deployment sanity checks.'); body.innerHTML='<div class="p4me-beta-status358">Loading...</div>'; try{ const d=await fetch('/api/admin/beta-shell/status-v357').then(r=>r.json()); body.innerHTML='<div class="p4me-beta-status358">Version '+esc(d.version||'')+'</div>'+kv(d)+'<div class="p4me-beta-actions358"><button data-copy>Copy update command</button><button data-reload>Reload</button></div>'; body.querySelector('[data-copy]')?.addEventListener('click',()=>navigator.clipboard?.writeText(d.update_command||'promote4me-update')); body.querySelector('[data-reload]')?.addEventListener('click',()=>location.reload()); }catch(e){ body.innerHTML='<div class="p4me-beta-status358">Login as super admin to view Release Center. '+esc(e.message)+'</div>'; } }
    function showWork(){ open('Work Hub','Fast job-lead search with ZIP support.'); body.innerHTML='<form class="p4me-beta-search358" style="display:grid;grid-template-columns:1fr 120px 120px;gap:8px"><input name="q" value="hiring" style="padding:10px;border-radius:12px;background:#0b1828;color:#eaf3ff;border:1px solid rgba(125,211,252,.2)"><input name="zip" value="64801" style="padding:10px;border-radius:12px;background:#0b1828;color:#eaf3ff;border:1px solid rgba(125,211,252,.2)"><button style="border-radius:12px;border:0;background:#0ea5e9;color:white;font-weight:850">Search</button></form><div class="p4me-beta-status358">Ready.</div><div class="p4me-beta-grid358" data-results></div>'; const form=body.querySelector('form'), status=body.querySelector('.p4me-beta-status358'), results=body.querySelector('[data-results]'); form.addEventListener('submit',async e=>{e.preventDefault(); status.textContent='Searching...'; const fd=new FormData(form); try{const d=await fetch('/api/public/work-hub/search-v352',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:fd.get('q'),location:fd.get('zip'),source:'all',work_mode:'all'})}).then(r=>r.json()); status.textContent=(d.results||[]).length+' results near '+[d.center?.city,d.center?.state,d.zip].filter(Boolean).join(' '); results.innerHTML=(d.results||[]).slice(0,12).map(r=>'<article><b>'+esc(r.title)+'</b><span>'+esc(r.source_name)+' · '+esc(r.location)+'</span><span>'+esc(r.description||'')+'</span><a target="_blank" href="'+esc(r.external_url||'#')+'">Open listing</a></article>').join('')||'<article>No results.</article>'; }catch(err){status.textContent='Search failed: '+err.message;}}); form.dispatchEvent(new Event('submit')); }
    function showProof(){ open('Proof Studio','Upload multiple existing photos or take a new proof photo. Some phones strip GPS from shared/downloaded images; fresh camera captures are more likely to include metadata if location is enabled.'); body.innerHTML='<div class="p4me-beta-actions358"><label>Upload from gallery<input id="p4me-gallery358" type="file" accept="image/*" multiple></label><label>Take new photo<input id="p4me-camera358" type="file" accept="image/*" capture="environment"></label></div><div class="p4me-beta-status358">No photos selected.</div><div class="p4me-proof-strip358"></div><div data-proof></div><details><summary>All EXIF fields</summary><div data-all></div></details>'; const gallery=body.querySelector('#p4me-gallery358'), camera=body.querySelector('#p4me-camera358'), status=body.querySelector('.p4me-beta-status358'), strip=body.querySelector('.p4me-proof-strip358'), proof=body.querySelector('[data-proof]'), all=body.querySelector('[data-all]'); async function scan(files){ files=[...files]; if(!files.length){status.textContent='Choose photos first.';return;} strip.innerHTML=files.map(f=>'<img src="'+URL.createObjectURL(f)+'" alt="proof">').join(''); status.textContent='Scanning '+files.length+' photo(s)...'; const fd=new FormData(); files.forEach(f=>fd.append('photos',f)); try{const d=await fetch('/api/proof/exif-batch-v358',{method:'POST',body:fd}).then(r=>r.json()); if(!d.ok){status.textContent='Scan failed: '+(d.error||'Unknown');return;} status.innerHTML='Photos: <b>'+d.summary.count+'</b> · GPS found: <b>'+d.summary.with_gps+'</b> · Timestamp found: <b>'+d.summary.with_timestamp+'</b> · Avg score: <b>'+d.summary.avg_score+'/100</b>'; proof.innerHTML=(d.results||[]).map((r,i)=>'<article><h3>Photo '+(i+1)+' · '+r.confidence_score+'/100</h3>'+kv(r.important)+'</article>').join(''); all.innerHTML=(d.results||[]).map((r,i)=>'<h4>Photo '+(i+1)+'</h4>'+kv(r.fields)).join('');}catch(e){status.textContent='Scan failed: '+e.message;}} gallery.addEventListener('change',()=>scan(gallery.files||[])); camera.addEventListener('change',()=>scan(camera.files||[])); }
    modal.querySelector('[data-close]').addEventListener('click',()=>modal.style.display='none');
    fab.addEventListener('click',e=>{const act=e.target?.dataset?.act;if(!act)return;if(act==='toggle')fab.classList.toggle('open'); if(act==='site')window.open('/?public=1&v=3.5.8','_blank'); if(act==='work')showWork(); if(act==='proof')showProof(); if(act==='release')showRelease(); if(act==='logout'){try{localStorage.clear();sessionStorage.clear();}catch{} location.href='/?logged_out=1';}});
  });
}
`;

if (!app.includes('P4ME_BETA_SHELL_358')) {
  app = app.replace(/(import[^;]+;\s*)+/, m => m + betaShell + '\n');
}
fs.writeFileSync('src/ProductApp.jsx', app);
console.log('Promote4.me 3.5.8 beta UI and proof polish applied.');
