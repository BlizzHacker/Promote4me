import fs from 'fs';

console.log('Applying Promote4.me 3.5.7 Beta Shell...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.5.7';
for (const s of ['apply-3.5.5-mobile-dock-proof-scanner.mjs','apply-3.5.6-release-center-lite.mjs','apply-3.5.7-beta-shell.mjs']) {
  if (!pkg.scripts.prebuild.includes(s)) pkg.scripts.prebuild += ' && node scripts/' + s;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g,"version: '3.5.7'");
server = server.replace(/version: "[^"]+"/g,'version: "3.5.7"');
if (!server.includes('/api/admin/beta-shell/status-v357')) {
  const block = `
app.get('/api/admin/beta-shell/status-v357', requireAuth, requireRole('super_admin'), (req,res)=>{let p={};try{p=JSON.parse(fs.readFileSync('package.json','utf8'))}catch{}let bundle=false;try{bundle=fs.readdirSync('dist/assets').filter(f=>f.endsWith('.js')).some(f=>fs.readFileSync('dist/assets/'+f,'utf8').includes('P4ME_BETA_SHELL_357'))}catch{}res.json({ok:true,version:'3.5.7',package_version:p.version||'unknown',bundle_has_beta_shell:bundle,release_center:true,mobile_dock:true,proof_scanner:true,marketplace_fallback:true,update_command:'promote4me-update'});});
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replace('import React, { useEffect, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";');
app = app.replaceAll('Promote4.me v3.5.6','Promote4.me v3.5.7').replaceAll('Promote4.me v3.5.5','Promote4.me v3.5.7').replaceAll('Promote4.me v3.5.4','Promote4.me v3.5.7').replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.7');
app = app.replaceAll('Authentik / Social Login','Social Login');

const betaShell = `
/* P4ME_BETA_SHELL_357: stable mobile/admin shell fallback. */
if (typeof window !== 'undefined' && !window.__P4ME_BETA_SHELL_357__) {
  window.__P4ME_BETA_SHELL_357__ = true;
  const start357 = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  start357(() => {
    const css = document.createElement('style');
    css.textContent = [
      '.p4me-beta-dock357{position:fixed;left:10px;right:10px;bottom:10px;z-index:99999;display:grid;grid-template-columns:repeat(5,1fr);gap:7px;padding:8px;border:1px solid rgba(125,211,252,.28);border-radius:20px;background:rgba(5,18,32,.96);backdrop-filter:blur(14px);box-shadow:0 12px 44px rgba(0,0,0,.45)}',
      '.p4me-beta-dock357 button{min-height:46px;border:1px solid rgba(125,211,252,.24);border-radius:14px;background:#102033;color:#eaf3ff;font-weight:800;font-size:12px}',
      '.p4me-beta-dock357 button.danger{border-color:rgba(248,113,113,.45);color:#fecaca}',
      '.p4me-beta-modal357{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);display:none;align-items:end;justify-content:center}',
      '.p4me-beta-card357{width:min(860px,100%);max-height:92vh;overflow:auto;background:#07111f;color:#eaf3ff;border:1px solid rgba(125,211,252,.25);border-radius:24px 24px 0 0;padding:16px;box-shadow:0 -20px 80px rgba(0,0,0,.55)}',
      '.p4me-beta-head357{display:flex;justify-content:space-between;gap:10px;align-items:center}.p4me-beta-head357 button,.p4me-beta-actions357 button,.p4me-beta-actions357 label{border:1px solid rgba(125,211,252,.25);border-radius:999px;background:#0ea5e9;color:#fff;padding:10px 14px;font-weight:800}',
      '.p4me-beta-actions357{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.p4me-beta-actions357 input{display:none}',
      '.p4me-beta-grid357{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px}.p4me-beta-grid357 article,.p4me-beta-grid357 div{display:grid;gap:4px;background:rgba(255,255,255,.045);border:1px solid rgba(125,211,252,.12);border-radius:14px;padding:11px}.p4me-beta-grid357 b{color:#7dd3fc;font-size:12px}.p4me-beta-grid357 span{font-size:12px;word-break:break-word}',
      '.p4me-beta-status357{padding:10px;border-radius:14px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.22);margin:10px 0}.p4me-beta-preview357{width:100%;max-height:300px;object-fit:contain;background:#020817;border:1px solid rgba(125,211,252,.15);border-radius:16px}',
      '.p4me-beta-search357{display:grid;grid-template-columns:1fr 120px 110px;gap:8px}.p4me-beta-search357 input,.p4me-beta-search357 select{border:1px solid rgba(125,211,252,.2);border-radius:12px;padding:10px;background:#0b1828;color:#eaf3ff}.p4me-beta-search357 button{border-radius:12px;border:0;background:#0ea5e9;color:white;font-weight:800}',
      '@media(min-width:900px){.p4me-beta-dock357{left:auto;right:18px;bottom:18px;width:460px}}body{padding-bottom:82px!important}'
    ].join('');
    document.head.appendChild(css);
    const dock = document.createElement('div');
    dock.className = 'p4me-beta-dock357';
    dock.innerHTML = '<button data-act="site">Site</button><button data-act="work">Work Hub</button><button data-act="proof">Proof</button><button data-act="release">Release</button><button class="danger" data-act="logout">Logout</button>';
    document.body.appendChild(dock);
    const modal = document.createElement('div');
    modal.className = 'p4me-beta-modal357';
    modal.innerHTML = '<div class="p4me-beta-card357"><div class="p4me-beta-head357"><div><h2 data-title>Promote4.me Beta Tools</h2><p data-subtitle>Stable mobile/admin fallback shell.</p></div><button data-close>Close</button></div><div data-body></div></div>';
    document.body.appendChild(modal);
    const title = modal.querySelector('[data-title]'), subtitle = modal.querySelector('[data-subtitle]'), body = modal.querySelector('[data-body]');
    function open(name){ modal.style.display='flex'; title.textContent=name; body.innerHTML=''; }
    function esc(v){return String(v==null?'':v).replace(/[<>&]/g,'')}
    function kv(obj){return '<div class="p4me-beta-grid357">'+Object.entries(obj||{}).map(([k,v])=>'<div><b>'+esc(k)+'</b><span>'+esc(typeof v==='object'?JSON.stringify(v):v)+'</span></div>').join('')+'</div>'}
    async function showRelease(){open('Release Center'); subtitle.textContent='Build status, deployment checks, and update command.'; body.innerHTML='<div class="p4me-beta-status357">Loading release status...</div>'; try{const token=localStorage.getItem('token')||localStorage.getItem('p4me-token')||''; const d=await fetch('/api/admin/beta-shell/status-v357',{headers:token?{Authorization:'Bearer '+token}:{}}).then(r=>r.json()); body.innerHTML='<div class="p4me-beta-status357">Version '+esc(d.version||'')+' · '+(d.ok?'OK':'Needs login as super admin')+'</div>'+kv(d)+'<div class="p4me-beta-actions357"><button data-copy>Copy update command</button><button data-refresh>Refresh page</button></div>'; body.querySelector('[data-copy]')?.addEventListener('click',()=>navigator.clipboard?.writeText(d.update_command||'promote4me-update')); body.querySelector('[data-refresh]')?.addEventListener('click',()=>location.reload());}catch(e){body.innerHTML='<div class="p4me-beta-status357">Release Center requires super admin login or API is unavailable: '+esc(e.message)+'</div>';}}
    async function showWork(){open('Work Hub'); subtitle.textContent='Search public work leads without relying on broken page placement.'; body.innerHTML='<form class="p4me-beta-search357"><input name="q" value="hiring"><input name="zip" value="64801"><select name="source"><option value="all">All</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="public">Public</option></select><button>Search</button></form><div class="p4me-beta-status357">Enter a ZIP and press Search.</div><div class="p4me-beta-grid357" data-results></div>'; const form=body.querySelector('form'), status=body.querySelector('.p4me-beta-status357'), results=body.querySelector('[data-results]'); form.addEventListener('submit',async e=>{e.preventDefault(); status.textContent='Searching...'; results.innerHTML=''; const fd=new FormData(form); try{const d=await fetch('/api/public/work-hub/search-v352',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:fd.get('q'),location:fd.get('zip'),source:fd.get('source'),work_mode:'all'})}).then(r=>r.json()); status.textContent=(d.results||[]).length+' results near '+[d.center?.city,d.center?.state,d.zip].filter(Boolean).join(' '); results.innerHTML=(d.results||[]).slice(0,12).map(r=>'<article><b>'+esc(r.title)+'</b><span>'+esc(r.source_name)+' · '+esc(r.location)+'</span><span>'+esc(r.description||'')+'</span><a target="_blank" href="'+esc(r.external_url||'#')+'">Open listing</a></article>').join('')||'<article>No results.</article>'; }catch(err){status.textContent='Search failed: '+err.message;}}); form.dispatchEvent(new Event('submit'));}
    function showProof(){open('Photo Proof Scanner'); subtitle.textContent='Upload/take a photo to extract GPS, timestamp, camera, and EXIF evidence.'; body.innerHTML='<div class="p4me-beta-actions357"><label>Choose / Take Photo<input id="p4me-proof-input357" type="file" accept="image/*" capture="environment"></label><button data-rescan disabled>Rescan</button></div><div class="p4me-beta-status357">No photo selected.</div><img class="p4me-beta-preview357" style="display:none" alt="Proof preview"><div data-proof></div><details><summary>All EXIF fields</summary><div data-all></div></details>'; const input=body.querySelector('#p4me-proof-input357'), status=body.querySelector('.p4me-beta-status357'), preview=body.querySelector('img'), proof=body.querySelector('[data-proof]'), all=body.querySelector('[data-all]'), rescan=body.querySelector('[data-rescan]'); let current=null; async function scan(file){file=file||current;if(!file){status.textContent='Choose a photo first.';return;} current=file; rescan.disabled=true; status.textContent='Scanning...'; const fd=new FormData(); fd.append('photo',file); try{const d=await fetch('/api/proof/exif-scan-v355',{method:'POST',body:fd}).then(r=>r.json()); if(!d.ok){status.textContent='Scan failed: '+(d.error||'Unknown');return;} const gps=d.important?.gps; status.innerHTML='Evidence score: <b>'+d.confidence_score+'/100</b> · GPS: <b>'+(d.important?.has_gps?'Found':'Not found')+'</b> · Timestamp: <b>'+(d.important?.has_timestamp?'Found':'Not found')+'</b>'+(gps?' · <a target="_blank" href="https://www.google.com/maps/search/?api=1&query='+gps.lat+','+gps.lng+'">Open GPS</a>':''); proof.innerHTML=kv(d.important||{}); all.innerHTML=kv(d.fields||{});}catch(err){status.textContent='Scan failed: '+err.message;}finally{rescan.disabled=false;}} input.addEventListener('change',()=>{const f=input.files?.[0];if(f){preview.src=URL.createObjectURL(f);preview.style.display='block';scan(f);}}); rescan.addEventListener('click',()=>scan());}
    modal.querySelector('[data-close]').addEventListener('click',()=>modal.style.display='none');
    dock.addEventListener('click',e=>{const act=e.target?.dataset?.act;if(!act)return;if(act==='site'){window.open('/?public=1&v=3.5.7','_blank');} if(act==='work')showWork(); if(act==='proof')showProof(); if(act==='release')showRelease(); if(act==='logout'){try{localStorage.clear();sessionStorage.clear();}catch{} location.href='/?logged_out=1';}});
  });
}
`;

if (!app.includes('P4ME_BETA_SHELL_357')) {
  app = app.replace(/(import[^;]+;\s*)+/, m => m + betaShell + '\n');
}
fs.writeFileSync('src/ProductApp.jsx', app);
console.log('Promote4.me 3.5.7 Beta Shell applied.');
