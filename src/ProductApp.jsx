import React, { useEffect, useRef, useState } from "react";
import {
  Activity, Building2, Camera, CheckCircle2, ClipboardList, CreditCard,
  Download, Edit3, KeyRound, LayoutDashboard, Lock, LogOut, Map, Plus,
  RefreshCcw, Search, Settings, ShieldCheck, ShoppingBag, Sparkles, Store,
  Trash2, Upload, Users, UserPlus, X
} from "lucide-react";



/* P4ME_ROOT_UNIFIED_363: one root, public/app decision, stable marketplace fallback. */
if (typeof window !== 'undefined' && !window.__P4ME_ROOT_UNIFIED_363__) {
  window.__P4ME_ROOT_UNIFIED_363__ = true;
  const start363 = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  start363(() => {
    const purgeOld = () => document.querySelectorAll('.p4me-beta-dock357,.p4me-dock355,.p4me-beta-fab358,.p4me-rescue359,.p4me-shell360,.p4me-shell361,.p4me-shell362,.p4me-modal359,.p4me-modal360,.p4me-modal361,.p4me-modal362').forEach(el=>el.remove());
    purgeOld(); let n=0; const purgeTimer=setInterval(()=>{ purgeOld(); if(++n>12) clearInterval(purgeTimer); },450);
    const params = new URLSearchParams(location.search);
    const hasToken = !!(localStorage.getItem('token') || localStorage.getItem('p4me-token') || localStorage.getItem('session'));
    const forcePublic = params.has('public') || params.has('logged_out');
    const forceApp = params.has('app') || params.has('dashboard');
    const shouldPublic = forcePublic || (!forceApp && !hasToken);
    const shouldApp = forceApp || (!forcePublic && hasToken);
    const style=document.createElement('style');
    style.textContent=[
      '.p4me-shell363{position:fixed;right:18px;bottom:18px;z-index:99999;display:grid;gap:10px;justify-items:end}.p4me-shell363 .orb{width:56px;height:56px;min-width:56px;border:0;border-radius:22px;background:linear-gradient(135deg,#38bdf8,#22c55e);color:#04111f;font-weight:950;font-size:22px;box-shadow:0 18px 50px rgba(0,0,0,.48)}',
      '.p4me-shell363 .menu{display:none;grid-template-columns:1fr;gap:8px;padding:10px;border:1px solid rgba(125,211,252,.26);border-radius:20px;background:rgba(5,18,32,.96);backdrop-filter:blur(16px);box-shadow:0 18px 60px rgba(0,0,0,.48)}.p4me-shell363.open .menu{display:grid}.p4me-shell363 button{min-height:42px;min-width:148px;border:1px solid rgba(125,211,252,.24);border-radius:14px;background:#102033;color:#eaf3ff;font-weight:850;font-size:13px}.p4me-shell363 .danger{border-color:rgba(248,113,113,.45);color:#fecaca}',
      '.p4me-modal363{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);display:none;align-items:end;justify-content:center}.p4me-card363{width:min(980px,100%);max-height:92vh;overflow:auto;background:linear-gradient(145deg,#07111f,#0b2035);color:#eaf3ff;border:1px solid rgba(125,211,252,.25);border-radius:26px 26px 0 0;padding:18px;box-shadow:0 -20px 90px rgba(0,0,0,.58)}',
      '.p4me-head363{display:flex;justify-content:space-between;gap:10px;align-items:center}.p4me-head363 button,.p4me-actions363 button,.p4me-actions363 label{border:1px solid rgba(125,211,252,.25);border-radius:999px;background:#0ea5e9;color:#fff;padding:10px 14px;font-weight:850;cursor:pointer}.p4me-actions363{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.p4me-actions363 input{display:none}.p4me-status363{padding:10px;border-radius:15px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.22);margin:10px 0}',
      '.p4me-grid363{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:12px}.p4me-grid363 article,.p4me-grid363 div{display:grid;gap:5px;background:rgba(255,255,255,.052);border:1px solid rgba(125,211,252,.14);border-radius:16px;padding:12px}.p4me-grid363 b{color:#7dd3fc;font-size:12px}.p4me-grid363 span{font-size:12px;word-break:break-word}.p4me-search363{display:grid;grid-template-columns:1fr 120px 120px;gap:8px}.p4me-search363 input,.p4me-search363 select{padding:10px;border-radius:12px;background:#0b1828;color:#eaf3ff;border:1px solid rgba(125,211,252,.2)}.p4me-search363 button{border-radius:12px;border:0;background:#0ea5e9;color:white;font-weight:850}',
      '.p4me-public363{max-width:1180px;margin:5vh auto;padding:24px;color:#eaf3ff}.p4me-public363 .hero{border:1px solid rgba(125,211,252,.2);border-radius:30px;padding:30px;background:radial-gradient(circle at 12% 0%,rgba(56,189,248,.22),transparent 28%),linear-gradient(145deg,rgba(8,32,55,.96),rgba(6,55,59,.85));box-shadow:0 24px 100px rgba(0,0,0,.35)}.p4me-public363 h1{font-size:clamp(34px,6vw,74px);line-height:.96;margin:8px 0 14px}.p4me-public363 .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.p4me-public363 button{border:0;border-radius:999px;background:#0ea5e9;color:#fff;padding:12px 18px;font-weight:900}.p4me-public363 .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:18px}.p4me-public363 .cards article{border:1px solid rgba(125,211,252,.16);background:rgba(255,255,255,.045);border-radius:18px;padding:14px}.p4me-public363 .workbox{margin-top:18px;border:1px solid rgba(125,211,252,.16);border-radius:22px;background:rgba(255,255,255,.035);padding:16px}',
      '.p4me-proofstrip363{display:flex;gap:10px;overflow:auto;padding:8px 0}.p4me-proofstrip363 img{width:94px;height:94px;object-fit:cover;border-radius:15px;border:1px solid rgba(125,211,252,.22);background:#020817}',
      '@media(max-width:760px){.p4me-shell363{right:12px;bottom:12px}.p4me-card363{padding:14px}.p4me-search363{grid-template-columns:1fr}.p4me-grid363{grid-template-columns:1fr}.p4me-public363{margin:2vh auto;padding:14px}.p4me-public363 .hero{padding:20px}}'
    ].join(''); document.head.appendChild(style);
    const shell=document.createElement('div'); shell.className='p4me-shell363'; shell.innerHTML='<div class="menu"><button data-act="dashboard">Dashboard</button><button data-act="public">Public Site</button><button data-act="market">Marketplace</button><button data-act="work">Work Hub</button><button data-act="proof">Proof Studio</button><button data-act="release">Release</button><button data-act="reload">Reload</button><button class="danger" data-act="logout">Logout</button></div><button class="orb" data-act="toggle">✦</button>'; document.body.appendChild(shell);
    const modal=document.createElement('div'); modal.className='p4me-modal363'; modal.innerHTML='<div class="p4me-card363"><div class="p4me-head363"><div><h2 data-title>Promote4.me Beta Tools</h2><p data-subtitle></p></div><button data-close>Close</button></div><div data-body></div></div>'; document.body.appendChild(modal);
    const title=modal.querySelector('[data-title]'), sub=modal.querySelector('[data-subtitle]'), body=modal.querySelector('[data-body]'); const esc=v=>String(v==null?'':v).replace(/[<>&]/g,''); const open=(t,s)=>{modal.style.display='flex';title.textContent=t;sub.textContent=s||'';body.innerHTML='';shell.classList.remove('open')}; const kv=o=>'<div class="p4me-grid363">'+Object.entries(o||{}).map(([k,v])=>'<div><b>'+esc(k)+'</b><span>'+esc(typeof v==='object'?JSON.stringify(v):v)+'</span></div>').join('')+'</div>';
    function goPublic(){ try{localStorage.removeItem('token');localStorage.removeItem('p4me-token');}catch{} history.replaceState(null,'','/'); renderPublic(); }
    function goDashboard(){ history.replaceState(null,'','/'); const root=document.getElementById('root'); if(root && (root.innerText||'').includes('Find work, post jobs')) root.innerHTML='<div style="color:#eaf3ff;display:grid;place-items:center;min-height:70vh"><h2>Loading Promote4.me dashboard...</h2></div>'; setTimeout(()=>{ if((document.body.innerText||'').includes('Loading Promote4.me dashboard')) showAppTrouble(); },1800); }
    function renderPublic(){ const root=document.getElementById('root'); if(!root)return; root.innerHTML='<main class="p4me-public363"><section class="hero"><small>MOVEWEIGHT / PROMOTE4.ME · BETA 3.6.3</small><h1>Find work, post jobs, and verify proof.</h1><p>Promote4.me helps workers and businesses discover opportunities, save leads, upload photo/GPS evidence, and convert leads into proof-ready work orders.</p><div class="actions"><button data-work>Search Work Hub</button><button data-proof>Open Proof Studio</button><button data-dash>Dashboard</button></div><div class="cards"><article><b>Workers</b><span>Search public leads by ZIP and source.</span></article><article><b>Businesses</b><span>Convert saved leads into proof-ready work orders.</span></article><article><b>Proof Studio</b><span>Scan photo metadata, timestamps, GPS, and camera details.</span></article></div><div class="workbox"><h2>Quick Work Search</h2><div data-public-work></div></div></section></main>'; root.querySelector('[data-work]')?.addEventListener('click',showWork); root.querySelector('[data-proof]')?.addEventListener('click',showProof); root.querySelector('[data-dash]')?.addEventListener('click',goDashboard); const box=root.querySelector('[data-public-work]'); if(box){ box.innerHTML='<form class="p4me-search363"><input name="q" value="hiring"><input name="zip" value="64801"><select name="source"><option value="all">All</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="public">Public</option></select><button>Search</button></form><div class="p4me-status363">Ready.</div><div class="p4me-grid363" data-results></div>'; wireWorkSearch(box); } }
    function showAppTrouble(){ open('Dashboard loading trouble','The authenticated dashboard did not finish loading yet.'); body.innerHTML='<div class="p4me-status363">Use Marketplace, Work Hub, Proof Studio, Reload, or Logout while the app shell is stabilized.</div><div class="p4me-actions363"><button data-market>Marketplace</button><button data-work>Work Hub</button><button data-proof>Proof Studio</button><button data-reload>Reload</button></div>'; body.querySelector('[data-market]')?.addEventListener('click',showMarketplace); body.querySelector('[data-work]')?.addEventListener('click',showWork); body.querySelector('[data-proof]')?.addEventListener('click',showProof); body.querySelector('[data-reload]')?.addEventListener('click',()=>location.reload()); }
    function wireWorkSearch(scope){ const f=scope.querySelector('form'), st=scope.querySelector('.p4me-status363'), out=scope.querySelector('[data-results]'); if(!f)return; f.addEventListener('submit',async e=>{e.preventDefault(); st.textContent='Searching...'; const fd=new FormData(f); try{const d=await fetch('/api/public/work-hub/search-v363',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:fd.get('q'),location:fd.get('zip'),source:fd.get('source')})}).then(r=>r.json()); st.textContent=(d.results||[]).length+' results near '+[d.center?.city,d.center?.state,d.zip].filter(Boolean).join(' '); out.innerHTML=(d.results||[]).slice(0,12).map(r=>'<article><b>'+esc(r.title)+'</b><span>'+esc(r.source_name)+' · '+esc(r.location)+'</span><span>'+esc(r.description)+'</span><a target="_blank" href="'+esc(r.external_url||'#')+'">Open listing</a></article>').join('')||'<article>No results.</article>'}catch(err){st.textContent='Search failed: '+err.message}}); f.dispatchEvent(new Event('submit')); }
    function showWork(){ open('Work Hub','Search public work leads by ZIP and source.'); body.innerHTML='<form class="p4me-search363"><input name="q" value="hiring"><input name="zip" value="64801"><select name="source"><option value="all">All</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="public">Public</option></select><button>Search</button></form><div class="p4me-status363">Ready.</div><div class="p4me-grid363" data-results></div>'; wireWorkSearch(body); }
    function showMarketplace(){ open('Marketplace','Beta marketplace fallback: search leads, save source links, and continue proof workflow.'); body.innerHTML='<div class="p4me-status363">Marketplace is being unified. This fallback keeps work discovery usable.</div><form class="p4me-search363"><input name="q" value="contractor"><input name="zip" value="64801"><select name="source"><option value="all">All</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="public">Public</option></select><button>Search</button></form><div class="p4me-grid363" data-results></div>'; wireWorkSearch(body); }
    async function showRelease(){ open('Release Center','Public-safe API/build sanity check.'); body.innerHTML='<div class="p4me-status363">Checking...</div>'; try{const d=await fetch('/api/public/beta/status-v363').then(r=>r.json()); body.innerHTML='<div class="p4me-status363">API '+(d.ok?'online':'issue')+' · '+esc(d.version)+'</div>'+kv(d);}catch(e){body.innerHTML='<div class="p4me-status363">API unavailable: '+esc(e.message)+'</div>';}}
    function showProof(){ open('Proof Studio','Upload from gallery or take a fresh proof photo.'); body.innerHTML='<div class="p4me-actions363"><label>Upload gallery<input id="p4me-g363" type="file" accept="image/*" multiple></label><label>Take new<input id="p4me-c363" type="file" accept="image/*" capture="environment"></label></div><div class="p4me-status363">No photos selected.</div><div class="p4me-proofstrip363"></div><div data-proof></div><details><summary>All EXIF fields</summary><div data-all></div></details>'; const g=body.querySelector('#p4me-g363'), c=body.querySelector('#p4me-c363'), st=body.querySelector('.p4me-status363'), strip=body.querySelector('.p4me-proofstrip363'), proof=body.querySelector('[data-proof]'), all=body.querySelector('[data-all]'); async function scan(files){files=[...files]; if(!files.length)return; strip.innerHTML=files.map(f=>'<img src="'+URL.createObjectURL(f)+'">').join(''); st.textContent='Scanning '+files.length+' photo(s)...'; const fd=new FormData(); files.forEach(f=>fd.append('photos',f)); try{const d=await fetch('/api/proof/exif-batch-v360',{method:'POST',body:fd}).then(r=>r.json()); if(!d.ok){st.textContent='Scan failed: '+(d.error||'Unknown');return;} st.innerHTML='Photos: <b>'+d.summary.count+'</b> · GPS: <b>'+d.summary.with_gps+'</b> · Timestamp: <b>'+d.summary.with_timestamp+'</b> · Avg: <b>'+d.summary.avg_score+'/100</b>'; proof.innerHTML=(d.results||[]).map((r,i)=>'<article><h3>Photo '+(i+1)+' · '+r.confidence_score+'/100</h3>'+kv(r.important)+'</article>').join(''); all.innerHTML=(d.results||[]).map((r,i)=>'<h4>Photo '+(i+1)+'</h4>'+kv(r.fields)).join('');}catch(e){st.textContent='Scan failed: '+e.message}} g.addEventListener('change',()=>scan(g.files||[])); c.addEventListener('change',()=>scan(c.files||[])); }
    setTimeout(()=>{ const loading=(document.body.innerText||'').includes('Loading Promote4.me'); if(shouldPublic || (loading && !shouldApp)){ renderPublic(); } if(loading && shouldApp){ showAppTrouble(); } }, 1200);
    modal.querySelector('[data-close]').addEventListener('click',()=>modal.style.display='none'); shell.addEventListener('click',e=>{const a=e.target?.dataset?.act;if(!a)return;if(a==='toggle')shell.classList.toggle('open'); if(a==='dashboard')goDashboard(); if(a==='public')goPublic(); if(a==='market')showMarketplace(); if(a==='work')showWork(); if(a==='proof')showProof(); if(a==='release')showRelease(); if(a==='reload')location.reload(); if(a==='logout'){try{localStorage.clear();sessionStorage.clear();}catch{} history.replaceState(null,'','/'); renderPublic();}});
  });
}

/* P4ME_BETA_UNIFIED_362: unified public/app routing shell. */
if (typeof window !== 'undefined' && !window.__P4ME_BETA_UNIFIED_362__) {
  window.__P4ME_BETA_UNIFIED_362__ = true;
  const start362 = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  start362(() => {
    const purgeOld = () => document.querySelectorAll('.p4me-beta-dock357,.p4me-dock355,.p4me-beta-fab358,.p4me-rescue359,.p4me-shell360,.p4me-shell361,.p4me-modal359,.p4me-modal360,.p4me-modal361').forEach(el=>el.remove());
    purgeOld(); let n=0; const purgeTimer=setInterval(()=>{ purgeOld(); if(++n>12) clearInterval(purgeTimer); },450);
    const params = new URLSearchParams(location.search);
    const isPublic = params.has('public') || params.has('logged_out');
    const isApp = params.has('app') || params.has('dashboard');
    const style=document.createElement('style');
    style.textContent=[
      '.p4me-shell362{position:fixed;right:18px;bottom:18px;z-index:99999;display:grid;gap:10px;justify-items:end}.p4me-shell362 .orb{width:56px;height:56px;min-width:56px;border:0;border-radius:22px;background:linear-gradient(135deg,#38bdf8,#22c55e);color:#04111f;font-weight:950;font-size:22px;box-shadow:0 18px 50px rgba(0,0,0,.48)}',
      '.p4me-shell362 .menu{display:none;grid-template-columns:1fr;gap:8px;padding:10px;border:1px solid rgba(125,211,252,.26);border-radius:20px;background:rgba(5,18,32,.96);backdrop-filter:blur(16px);box-shadow:0 18px 60px rgba(0,0,0,.48)}.p4me-shell362.open .menu{display:grid}.p4me-shell362 button{min-height:42px;min-width:148px;border:1px solid rgba(125,211,252,.24);border-radius:14px;background:#102033;color:#eaf3ff;font-weight:850;font-size:13px}.p4me-shell362 .danger{border-color:rgba(248,113,113,.45);color:#fecaca}',
      '.p4me-modal362{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);display:none;align-items:end;justify-content:center}.p4me-card362{width:min(980px,100%);max-height:92vh;overflow:auto;background:linear-gradient(145deg,#07111f,#0b2035);color:#eaf3ff;border:1px solid rgba(125,211,252,.25);border-radius:26px 26px 0 0;padding:18px;box-shadow:0 -20px 90px rgba(0,0,0,.58)}',
      '.p4me-head362{display:flex;justify-content:space-between;gap:10px;align-items:center}.p4me-head362 button,.p4me-actions362 button,.p4me-actions362 label{border:1px solid rgba(125,211,252,.25);border-radius:999px;background:#0ea5e9;color:#fff;padding:10px 14px;font-weight:850;cursor:pointer}.p4me-actions362{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.p4me-actions362 input{display:none}.p4me-status362{padding:10px;border-radius:15px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.22);margin:10px 0}',
      '.p4me-grid362{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:12px}.p4me-grid362 article,.p4me-grid362 div{display:grid;gap:5px;background:rgba(255,255,255,.052);border:1px solid rgba(125,211,252,.14);border-radius:16px;padding:12px}.p4me-grid362 b{color:#7dd3fc;font-size:12px}.p4me-grid362 span{font-size:12px;word-break:break-word}.p4me-search362{display:grid;grid-template-columns:1fr 120px 120px;gap:8px}.p4me-search362 input,.p4me-search362 select{padding:10px;border-radius:12px;background:#0b1828;color:#eaf3ff;border:1px solid rgba(125,211,252,.2)}.p4me-search362 button{border-radius:12px;border:0;background:#0ea5e9;color:white;font-weight:850}',
      '.p4me-public362{max-width:1180px;margin:5vh auto;padding:24px;color:#eaf3ff}.p4me-public362 .hero{border:1px solid rgba(125,211,252,.2);border-radius:30px;padding:30px;background:radial-gradient(circle at 12% 0%,rgba(56,189,248,.22),transparent 28%),linear-gradient(145deg,rgba(8,32,55,.96),rgba(6,55,59,.85));box-shadow:0 24px 100px rgba(0,0,0,.35)}.p4me-public362 h1{font-size:clamp(34px,6vw,74px);line-height:.96;margin:8px 0 14px}.p4me-public362 .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.p4me-public362 button{border:0;border-radius:999px;background:#0ea5e9;color:#fff;padding:12px 18px;font-weight:900}.p4me-public362 .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:18px}.p4me-public362 .cards article{border:1px solid rgba(125,211,252,.16);background:rgba(255,255,255,.045);border-radius:18px;padding:14px}.p4me-public362 .workbox{margin-top:18px;border:1px solid rgba(125,211,252,.16);border-radius:22px;background:rgba(255,255,255,.035);padding:16px}',
      '.p4me-proofstrip362{display:flex;gap:10px;overflow:auto;padding:8px 0}.p4me-proofstrip362 img{width:94px;height:94px;object-fit:cover;border-radius:15px;border:1px solid rgba(125,211,252,.22);background:#020817}',
      '@media(max-width:760px){.p4me-shell362{right:12px;bottom:12px}.p4me-card362{padding:14px}.p4me-search362{grid-template-columns:1fr}.p4me-grid362{grid-template-columns:1fr}.p4me-public362{margin:2vh auto;padding:14px}.p4me-public362 .hero{padding:20px}}'
    ].join(''); document.head.appendChild(style);
    const shell=document.createElement('div'); shell.className='p4me-shell362'; shell.innerHTML='<div class="menu"><button data-act="dashboard">Dashboard</button><button data-act="public">Public Site</button><button data-act="work">Work Hub</button><button data-act="proof">Proof Studio</button><button data-act="release">Release</button><button data-act="reload">Reload</button><button class="danger" data-act="logout">Logout</button></div><button class="orb" data-act="toggle">✦</button>'; document.body.appendChild(shell);
    const modal=document.createElement('div'); modal.className='p4me-modal362'; modal.innerHTML='<div class="p4me-card362"><div class="p4me-head362"><div><h2 data-title>Promote4.me Beta Tools</h2><p data-subtitle></p></div><button data-close>Close</button></div><div data-body></div></div>'; document.body.appendChild(modal);
    const title=modal.querySelector('[data-title]'), sub=modal.querySelector('[data-subtitle]'), body=modal.querySelector('[data-body]'); const esc=v=>String(v==null?'':v).replace(/[<>&]/g,''); const open=(t,s)=>{modal.style.display='flex';title.textContent=t;sub.textContent=s||'';body.innerHTML='';shell.classList.remove('open')}; const kv=o=>'<div class="p4me-grid362">'+Object.entries(o||{}).map(([k,v])=>'<div><b>'+esc(k)+'</b><span>'+esc(typeof v==='object'?JSON.stringify(v):v)+'</span></div>').join('')+'</div>';
    function setMode(mode){ const url = mode==='public' ? '/?public=1&v=3.6.2' : '/?app=1&v=3.6.2'; location.href=url; }
    function renderPublic(){ const root=document.getElementById('root'); if(!root)return; root.innerHTML='<main class="p4me-public362"><section class="hero"><small>MOVEWEIGHT / PROMOTE4.ME · BETA 3.6.2</small><h1>Find work, post jobs, and verify proof.</h1><p>Promote4.me helps workers and businesses discover opportunities, save leads, upload photo/GPS evidence, and convert leads into proof-ready work orders.</p><div class="actions"><button data-work>Search Work Hub</button><button data-proof>Open Proof Studio</button><button data-dash>Dashboard</button></div><div class="cards"><article><b>Workers</b><span>Search public leads by ZIP and source.</span></article><article><b>Businesses</b><span>Convert saved leads into proof-ready work orders.</span></article><article><b>Proof Studio</b><span>Scan photo metadata, timestamps, GPS, and camera details.</span></article></div><div class="workbox"><h2>Quick Work Search</h2><div data-public-work></div></div></section></main>'; root.querySelector('[data-work]')?.addEventListener('click',showWork); root.querySelector('[data-proof]')?.addEventListener('click',showProof); root.querySelector('[data-dash]')?.addEventListener('click',()=>setMode('app')); const box=root.querySelector('[data-public-work]'); if(box){ box.innerHTML='<form class="p4me-search362"><input name="q" value="hiring"><input name="zip" value="64801"><select name="source"><option value="all">All</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="public">Public</option></select><button>Search</button></form><div class="p4me-status362">Ready.</div><div class="p4me-grid362" data-results></div>'; wireWorkSearch(box); } }
    function wireWorkSearch(scope){ const f=scope.querySelector('form'), st=scope.querySelector('.p4me-status362'), out=scope.querySelector('[data-results]'); if(!f)return; f.addEventListener('submit',async e=>{e.preventDefault(); st.textContent='Searching...'; const fd=new FormData(f); try{const d=await fetch('/api/public/work-hub/search-v362',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:fd.get('q'),location:fd.get('zip'),source:fd.get('source')})}).then(r=>r.json()); st.textContent=(d.results||[]).length+' results near '+[d.center?.city,d.center?.state,d.zip].filter(Boolean).join(' '); out.innerHTML=(d.results||[]).slice(0,12).map(r=>'<article><b>'+esc(r.title)+'</b><span>'+esc(r.source_name)+' · '+esc(r.location)+'</span><span>'+esc(r.description)+'</span><a target="_blank" href="'+esc(r.external_url||'#')+'">Open listing</a></article>').join('')||'<article>No results.</article>'}catch(err){st.textContent='Search failed: '+err.message}}); f.dispatchEvent(new Event('submit')); }
    setTimeout(()=>{ const loading=(document.body.innerText||'').includes('Loading Promote4.me'); if(isPublic || (loading && !isApp)){ renderPublic(); } if(loading && isApp){ open('Dashboard loading trouble','Dashboard mode is not being replaced by the public homepage anymore.'); body.innerHTML='<div class="p4me-status362">The authenticated app did not finish loading. Use Reload, Logout, or Public Site while the app shell is stabilized.</div><div class="p4me-actions362"><button data-reload>Reload</button><button data-public>Public Site</button><button data-logout>Logout</button></div>'; body.querySelector('[data-reload]')?.addEventListener('click',()=>location.reload()); body.querySelector('[data-public]')?.addEventListener('click',()=>setMode('public')); body.querySelector('[data-logout]')?.addEventListener('click',()=>{localStorage.clear();sessionStorage.clear();location.href='/?logged_out=1&v=3.6.2'}); } }, 1600);
    function showWork(){ open('Work Hub','Stable public search by ZIP and source.'); body.innerHTML='<form class="p4me-search362"><input name="q" value="hiring"><input name="zip" value="64801"><select name="source"><option value="all">All</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="public">Public</option></select><button>Search</button></form><div class="p4me-status362">Ready.</div><div class="p4me-grid362" data-results></div>'; wireWorkSearch(body); }
    async function showRelease(){ open('Release Center','Public-safe API/build sanity check.'); body.innerHTML='<div class="p4me-status362">Checking...</div>'; try{const d=await fetch('/api/public/beta/status-v362').then(r=>r.json()); body.innerHTML='<div class="p4me-status362">API '+(d.ok?'online':'issue')+' · '+esc(d.version)+'</div>'+kv(d);}catch(e){body.innerHTML='<div class="p4me-status362">API unavailable: '+esc(e.message)+'</div>';}}
    function showProof(){ open('Proof Studio','Upload from gallery or take a fresh proof photo.'); body.innerHTML='<div class="p4me-actions362"><label>Upload gallery<input id="p4me-g362" type="file" accept="image/*" multiple></label><label>Take new<input id="p4me-c362" type="file" accept="image/*" capture="environment"></label></div><div class="p4me-status362">No photos selected.</div><div class="p4me-proofstrip362"></div><div data-proof></div><details><summary>All EXIF fields</summary><div data-all></div></details>'; const g=body.querySelector('#p4me-g362'), c=body.querySelector('#p4me-c362'), st=body.querySelector('.p4me-status362'), strip=body.querySelector('.p4me-proofstrip362'), proof=body.querySelector('[data-proof]'), all=body.querySelector('[data-all]'); async function scan(files){files=[...files]; if(!files.length)return; strip.innerHTML=files.map(f=>'<img src="'+URL.createObjectURL(f)+'">').join(''); st.textContent='Scanning '+files.length+' photo(s)...'; const fd=new FormData(); files.forEach(f=>fd.append('photos',f)); try{const d=await fetch('/api/proof/exif-batch-v360',{method:'POST',body:fd}).then(r=>r.json()); if(!d.ok){st.textContent='Scan failed: '+(d.error||'Unknown');return;} st.innerHTML='Photos: <b>'+d.summary.count+'</b> · GPS: <b>'+d.summary.with_gps+'</b> · Timestamp: <b>'+d.summary.with_timestamp+'</b> · Avg: <b>'+d.summary.avg_score+'/100</b>'; proof.innerHTML=(d.results||[]).map((r,i)=>'<article><h3>Photo '+(i+1)+' · '+r.confidence_score+'/100</h3>'+kv(r.important)+'</article>').join(''); all.innerHTML=(d.results||[]).map((r,i)=>'<h4>Photo '+(i+1)+'</h4>'+kv(r.fields)).join('');}catch(e){st.textContent='Scan failed: '+e.message}} g.addEventListener('change',()=>scan(g.files||[])); c.addEventListener('change',()=>scan(c.files||[])); }
    modal.querySelector('[data-close]').addEventListener('click',()=>modal.style.display='none'); shell.addEventListener('click',e=>{const a=e.target?.dataset?.act;if(!a)return;if(a==='toggle')shell.classList.toggle('open'); if(a==='dashboard')setMode('app'); if(a==='public')setMode('public'); if(a==='work')showWork(); if(a==='proof')showProof(); if(a==='release')showRelease(); if(a==='reload')location.reload(); if(a==='logout'){try{localStorage.clear();sessionStorage.clear();}catch{} location.href='/?logged_out=1&v=3.6.2';}});
  });
}

const TOKEN_KEY = "p4me-api-token";
const USER_KEY = "p4me-api-user";

const statuses = ["Assigned", "In Progress", "Submitted", "Verified", "Rejected", "Delivered", "Exception"];
const jobTypes = ["Team Promo", "Technician On-Site", "Plumber / Contractor", "Food Delivery", "Package Delivery", "Custom Proof Job"];
const deliveryServices = ["Promote4.me Direct", "Uber Eats", "DoorDash", "Instacart", "Grubhub", "Postmates", "Walmart Spark", "Amazon Flex", "Roadie", "Shipt", "Custom Courier"];
const paymentProviders = ["stripe", "paypal", "square", "venmo", "cashapp"];
const fieldRoles = ["Lead Tech", "Dispatcher", "Route Manager", "Technician", "Plumber", "Electrician", "Delivery Driver", "Flyer Team Member", "Promoter", "Contractor", "Customer Service", "Client Viewer"];
const demoUsernames = ["Test", "TestManager", "TestMember", "TestClient"];
function isDemoUser(user) { return user?.tenant_id === "tenant-test-demo" || demoUsernames.includes(user?.username); }
function canSeeTab(user, tab) {
  const role = user?.role;
  if (role === "super_admin") return true;
  if (role === "admin") return !["super_admin"].includes(tab);
  if (role === "manager") return ["dashboard", "jobs", "review", "map", "team", "clients", "training", "workforce", "marketplace"].includes(tab);
  if (role === "member") return ["dashboard", "jobs", "review", "map", "training", "marketplace"].includes(tab);
  return ["dashboard", "jobs", "map", "training", "marketplace"].includes(tab);
}

async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductApp() {
  if (location.pathname.startsWith("/shopify")) return <ShopifyEmbedded294 />;
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return token && user ? { token, user } : null;
  });
  const [boot, setBoot] = useState(null);
  const [plans, setPlans] = useState({ plans: [], providers: paymentProviders, mapProviders: [] });
  const [active, setActive] = useState("dashboard");
  const [notice, setNotice] = useState("");

  async function reload() {
    try {
      setBoot(await api("/api/bootstrap"));
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => {
    api("/api/public/plans").then((data) => {
      setPlans({
        ...data,
        providers: data.providers?.length ? data.providers : paymentProviders,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (session) reload();
  }, [session]);

  function onAuthed(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setSession({ token: data.token, user: data.user });
    if (localStorage.getItem("p4me-pending-lead")) { setActive("marketplace"); setNotice("Saved lead loaded. Convert it inside Marketplace."); }
    if (localStorage.getItem('p4me-pending-lead')) { setActive('marketplace'); setNotice('Saved lead loaded. Review it in Marketplace and convert it to a work order.'); }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession(null);
    setBoot(null);
  }

  if (!session) return <PublicSite plans={plans} onAuthed={onAuthed} />;
  if (!boot) return <div className="loading-screen"><Sparkles /> Loading Promote4.me...</div>;

  const menu = [
    ["dashboard", "Overview", LayoutDashboard],
    ["hierarchy", session.user?.role === "super_admin" ? "Platform" : "Company", Building2],
    ["jobs", "Work Orders", ClipboardList],
    ["review", "Approvals", ShieldCheck],
    ["map", "Map", Map],
    ["workforce", "People", Users],
    ["team", "Teams", Users],
    ["clients", "Locations", Building2],
    ["addons", "Integrations", Store],
    ["marketplace", "Marketplace", Map],
    ["training", "Training", ShieldCheck],
    ["settings", "Settings", Settings],
  ];

  const props = { boot, plans, reload, setNotice };

  return (
    <div className="app-shell"><MobileQuickActions299 active={active} setActive={setActive} user={session.user} jobs={boot.jobs || []} /><MobileTopBar297 active={active} setActive={setActive} user={boot?.user} /><MobileQuickActions299 active={active} setActive={setActive} user={session.user} jobs={boot.jobs || []} />
      <aside className="sidebar">
        <div className="brand"><ShieldCheck /> Promote4.me</div>
        <div className="mini-profile">
          <strong>{session.user.full_name}</strong>
          <span>{session.user.role} · {boot.tenant?.plan}</span>
        </div>
        <nav>
          {menu.filter(([id]) => canSeeTab(session.user, id)).map(([id, label, Icon]) => (
            <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Log out</button><div className="mobile-logout-refresh-320"><button onClick={reload}>Refresh</button><button onClick={logout}>Log out</button></div>
      </aside>

      <main className={`workspace page-${active}`}>
        <header className="topbar">
          <div>
            <span className="eyebrow">{boot.tenant?.name}</span>
            <h2>{menu.find((m) => m[0] === active)?.[1]}</h2>
          </div>
          <div className="topbar-actions"><button className="secondary" onClick={() => setActive("dashboard")}>Home</button><button className="secondary" onClick={() => { window.dispatchEvent(new Event("p4me-workhub-refresh")); reload(); }}><RefreshCcw size={16} /> Refresh</button></div>
        </header>

        {notice && <div className="toast"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}

        {active === "dashboard" && <Dashboard boot={boot} />}
        {active === "hierarchy" && <HierarchyConsole boot={boot} user={session.user} />}
        {active === "jobs" && <Jobs {...props} />}
        {active === "review" && <EvidenceReview {...props} />}
        {active === "map" && <ProofMap boot={boot} />}
        {active === "workforce" && <WorkforcePanel boot={boot} />}
        {active === "team" && <Team {...props} />}
        {active === "clients" && <Clients {...props} />}
        {active === "addons" && <IntegrationsHub294 {...props} />}
        {active === "marketplace" && <><WorkMapSearch330 setNotice={setNotice}/><WorkerSocialMarketplace310 setNotice={setNotice}/></>}
        {active === "training" && <TrainingPanel user={session.user} />}
        {active === "settings" && <SettingsPanel {...props} />}
      </main>
    </div>
  );
}


function ShopifyEmbedded294() {
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState('');
  async function load(){ try{ setStatus(await fetch('/api/shopify/status').then(r=>r.json())); } catch(e){ setNotice(e.message); } }
  useEffect(()=>{ load(); }, []);
  async function testOrder(){ const data = await fetch('/api/shopify/test-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'#P4ME-TEST',email:'shopify-test@example.com',customer:{first_name:'Shopify',last_name:'Buyer'},shipping_address:{address1:'302 E 4th St',city:'Joplin',province:'MO',zip:'64801'},line_items:[{title:'Demo delivery item',quantity:2,sku:'SHOP-DEMO',price:'12.00'}],total_price:'24.00'})}).then(r=>r.json()); setNotice(data.ok?'Created Shopify work packet '+data.job.id:(data.error||'Test failed')); load(); }
  const jobs = status?.jobs || [];
  return <main className="shopify-shell"><section className="shopify-hero"><div><span className="eyebrow">Promote4.me for Shopify</span><h1>Proof-ready fulfillment inside Shopify Admin</h1><p>Convert Shopify orders into delivery/service work packets with item checklists, GPS/photo proof, and approval tracking.</p></div><div className="shopify-actions"><button className="primary" onClick={testOrder}>Send Shopify test order</button><a className="secondary" href="/" target="_blank">Open full Promote4.me</a></div></section>{notice&&<div className="toast"><span>{notice}</span><button onClick={()=>setNotice('')}>×</button></div>}<section className="shopify-stats"><Stat icon={ShoppingBag} label="Imported" value={status?.counts?.imported||0}/><Stat icon={ClipboardList} label="Pending" value={status?.counts?.pending||0}/><Stat icon={ShieldCheck} label="Submitted" value={status?.counts?.submitted||0}/><Stat icon={KeyRound} label="Status" value={status?.connection?.status||'beta'}/></section><section className="shopify-grid"><article className="panel wide"><h3>Shopify work packets</h3>{jobs.map(j=><div className="packet-row" key={j.id}><div><strong>{j.title}</strong><span>{j.customer_name} · {j.address}</span></div><Status status={j.status}/></div>)}{!jobs.length&&<p className="hint">No Shopify orders yet. Send a test order or connect webhooks.</p>}</article><article className="panel"><h3>Webhook endpoints</h3><p className="hint">Use these in Shopify webhooks or app setup.</p><code>/api/shopify/webhooks/orders-create</code><code>/api/shopify/webhooks/orders-paid</code><code>/api/shopify/webhooks/orders-fulfilled</code></article></section></main>;
}
function IntegrationsHub294({ boot, plans, setNotice }) {
  return <div className="content-grid integrations-clean"><section className="panel wide"><h3><KeyRound /> API Credential Center</h3><p className="hint">Create secure keys for WordPress, Shopify, delivery services, and custom apps.</p><ApiCredentialCenter291 setNotice={setNotice}/></section><section className="panel wide"><h3>Installable apps</h3><div className="integration-cards"><a className="integration-card featured" href="/downloads/promote4me-proof-manager-2.9.6.zip" download><Download/><strong>WordPress Proof Manager</strong><span>Current ZIP plugin: dashboard, logs, order sync, work packets.</span></a><a className="integration-card featured" href="/shopify" target="_blank"><Store/><strong>Shopify Embedded App</strong><span>Open the Shopify-style dashboard and test order workflow.</span></a><a className="integration-card" href="/downloads/README-addons.html" target="_blank"><ClipboardList/><strong>Setup Guide</strong><span>HTML guide for API keys, webhooks, and test packets.</span></a></div></section><ProviderNetworks298 setNotice={setNotice}/><ProviderPlaybooks300 setNotice={setNotice}/><section className="panel wide"><h3>Delivery and proof templates</h3><p className="hint">These are order sources and proof templates. Add provider keys in Settings when real API credentials are ready.</p><div className="service-cloud">{deliveryServices.map(s=><span key={s}>{s}</span>)}</div></section><section className="panel"><h3>Connection checklist</h3><ol className="clean-list"><li>Create API key</li><li>Install WordPress ZIP or open Shopify app</li><li>Send test order</li><li>Review work packet</li><li>Upload proof and approve</li></ol></section></div>;
}


function MobileTopBar297({active,setActive,user}){const [open,setOpen]=useState(false);return <><div className="mobile-topbar"><button className="icon-btn" onClick={()=>setOpen(true)}>☰</button><strong>Promote4.me</strong><span>{user?.role||''}</span></div>{open&&<div className="mobile-drawer"><button className="drawer-close" onClick={()=>setOpen(false)}>×</button><h3>Promote4.me</h3>{navItemsForRole297(user?.role).map(item=><button key={item.id} className={active===item.id?'active':''} onClick={()=>{setActive(item.id);setOpen(false)}}>{item.label}</button>)}</div>}</>}
function navItemsForRole297(role){const owner=[['dashboard','Overview'],['hierarchy','Platform'],['jobs','Work Orders'],['evidence','Approvals'],['map','Map'],['workforce','People'],['team','Teams'],['clients','Locations'],['addons','Integrations'],['marketplace','Marketplace'],['training','Training'],['settings','Settings']]; const worker=[['jobs','My Work'],['evidence','Upload Proof'],['map','Map'],['marketplace','Find Work'],['training','Training']]; const arr=(role==='team_member'||role==='contractor')?worker:owner; return arr.map(([id,label])=>({id,label}));}
function PhotoEvidenceInspector297({job,setNotice}){const [file,setFile]=useState(null),[meta,setMeta]=useState(null),[busy,setBusy]=useState(false);async function pick(e){const f=e.target.files?.[0];setFile(f);setMeta(null);if(!f)return;try{const exif=await exifr.parse(f,{gps:true,tiff:true,exif:true,ifd1:true,interop:true,pick:['Make','Model','DateTimeOriginal','CreateDate','ModifyDate','latitude','longitude','GPSLatitude','GPSLongitude','GPSAltitude','Orientation','LensModel','Software']});setMeta(exif||{});}catch(err){setMeta({error:err.message});}}async function submit(){if(!job)return;setBusy(true);let pos={};try{pos=await new Promise((resolve)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>resolve({browser_lat:p.coords.latitude,browser_lng:p.coords.longitude,accuracy_m:p.coords.accuracy}),()=>resolve({}),{enableHighAccuracy:true,timeout:7000}):resolve({}));}catch{}try{const res=await api('/api/evidence/'+job.id+'/photo-meta',{method:'POST',body:JSON.stringify({exif:meta||{},...pos,notes:'Photo evidence inspected in browser before upload.'})});setNotice('Photo proof submitted · '+res.analysis.source+' · '+res.analysis.confidence+'% confidence');}catch(e){setNotice(e.message)}setBusy(false)}return <div className="photo-inspector"><label className="upload-drop"><Camera/> <span>{file?file.name:'Choose/take proof photo'}</span><input type="file" accept="image/*" capture="environment" onChange={pick}/></label>{meta&&<div className="exif-grid"><div><strong>Photo GPS</strong><span>{meta.latitude&&meta.longitude?meta.latitude.toFixed(6)+', '+meta.longitude.toFixed(6):'No embedded GPS found'}</span></div><div><strong>Taken</strong><span>{String(meta.DateTimeOriginal||meta.CreateDate||meta.ModifyDate||'Unknown')}</span></div><div><strong>Device</strong><span>{[meta.Make,meta.Model].filter(Boolean).join(' ')||'Unknown'}</span></div><div><strong>Software</strong><span>{meta.Software||'Unknown'}</span></div></div>}{selectedJob && <PhotoEvidenceInspector297 job={selectedJob} setNotice={setNotice}/>}<button className="primary full" disabled={!file||busy} onClick={submit}>{busy?'Submitting…':'Submit Photo Proof + GPS Analysis'}</button></div>}


function ProviderNetworks298({setNotice}){const [catalog,setCatalog]=useState([]),[selected,setSelected]=useState(null),[form,setForm]=useState({base_url:'',api_key:'',api_secret:'',account_id:'',webhook_secret:''}),[events,setEvents]=useState([]);async function load(){try{const c=await api('/api/providers/catalog');setCatalog(c.providers||[]);const e=await api('/api/providers/events').catch(()=>({events:[]}));setEvents(e.events||[]);}catch(e){setNotice(e.message)}}useEffect(()=>{load()},[]);async function save(p){try{await api('/api/providers/'+p.id+'/connect',{method:'POST',body:JSON.stringify({...form,status:'active'})});setNotice(p.name+' connected.');setSelected(null);setForm({base_url:'',api_key:'',api_secret:'',account_id:'',webhook_secret:''});load();}catch(e){setNotice(e.message)}}async function test(p){try{const r=await api('/api/providers/'+p.id+'/test',{method:'POST',body:JSON.stringify({})});setNotice(r.message||('Created '+p.name+' test packet.'));load();}catch(e){setNotice(e.message)}}const groups=['food_delivery','grocery_delivery','courier','retail_delivery','package_delivery','carrier','online_delivery'];return <div className="provider-hub"><section className="panel wide"><h3>Provider Network Command Center</h3><p className="hint">Connect delivery networks, carriers, and digital delivery platforms. Paste API credentials, create test work packets, and receive provider webhooks into Promote4.me proof workflows.</p>{groups.map(g=><div className="provider-group" key={g}><h4>{g.replaceAll('_',' ')}</h4><div className="provider-grid">{catalog.filter(p=>p.category===g).map(p=><article className="provider-card" key={p.id}><div><strong>{p.name}</strong><span>{p.capabilities.join(' · ')}</span></div><em className={p.connection?.status==='active'?'ok':'warn'}>{p.connection?.status||'not connected'}</em><div className="provider-actions"><button onClick={()=>setSelected(p)}>Configure</button><button onClick={()=>test(p)}>Test packet</button></div></article>)}</div></div>)}</section><section className="panel"><h3>Integration activity</h3>{events.slice(0,8).map(e=><div className="activity-row" key={e.id}><strong>{e.provider_id}</strong><span>{e.message}</span><small>{e.created_at}</small></div>)}{!events.length&&<p className="hint">No provider events yet.</p>}</section>{selected&&<div className="modal-backdrop"><div className="modal-card"><button className="drawer-close" onClick={()=>setSelected(null)}>×</button><h3>{selected.name} setup</h3><p className="hint">Paste API credentials from the provider portal. Promote4.me will use them for order imports, status sync, tracking, and proof-ready dispatch flows as each provider account is approved.</p>{selected.fields.map(f=><input key={f} placeholder={f.replaceAll('_',' ')} value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})}/>) }<button className="primary full" onClick={()=>save(selected)}>Save provider</button><code>/api/providers/webhook/{selected.id}</code></div></div>}</div>}


function MobileQuickActions299({ active, setActive, user, jobs=[] }) {
  const assigned = jobs.filter(j => ['Assigned','In Progress','Submitted'].includes(j.status)).length;
  const buttons = [
    ['dashboard','Home','⌂'], ['jobs','Work','□'], ['review','Proof','◎'], ['map','Map','⌖'], ['addons','Apps','◇']
  ];
  const role = user?.role || '';
  return <><div className="mobile-section-tabs">{buttons.map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}><b>{icon}</b><span>{label}</span>{id==='jobs'&&assigned>0&&<em>{assigned}</em>}</button>)}</div><button className="mobile-proof-fab" onClick={()=>setActive('review')}><Camera size={18}/> Submit Proof</button><div className="mobile-role-chip">{role.replaceAll('_',' ')} · tap Proof to upload GPS/photo evidence</div></>;
}
function PageSectionTabs299({ sections, active, setActive }) {
  return <div className="page-section-tabs">{sections.map(s=><button key={s.id} className={active===s.id?'active':''} onClick={()=>setActive(s.id)}>{s.label}</button>)}</div>;
}
function DemoLoginShortcuts299({ setForm }) {
  const demos = [['Test','Admin'],['TestManager','Manager'],['TestMember','Field Member'],['TestClient','Client']];
  return <div className="mobile-demo-shortcuts"><p>Quick demo logins</p>{demos.map(([username,label])=><button type="button" key={username} onClick={()=>setForm(f=>({...f,username,password:'TestUser123!'}))}>{label}</button>)}</div>;
}


function ProviderPlaybooks300({setNotice}){const [catalog,setCatalog]=useState([]),[provider,setProvider]=useState('doordash'),[book,setBook]=useState(null),[tracking,setTracking]=useState({carrier:'usps',tracking_number:''}),[trackingResult,setTrackingResult]=useState(null),[digital,setDigital]=useState({digital_delivery_url:'https://example.com/final-deliverable',status:'Submitted'}),[digitalResult,setDigitalResult]=useState(null);async function loadCatalog(){try{const c=await api('/api/providers/catalog');setCatalog(c.providers||[])}catch(e){setNotice(e.message)}}async function loadBook(id=provider){try{setBook(await api('/api/providers/'+id+'/playbook'))}catch(e){setBook(null);setNotice(e.message)}}useEffect(()=>{loadCatalog()},[]);useEffect(()=>{loadBook(provider)},[provider]);async function carrierPreview(){try{setTrackingResult(await api('/api/carriers/'+tracking.carrier+'/track',{method:'POST',body:JSON.stringify(tracking)}))}catch(e){setNotice(e.message)}}async function carrierPacket(){try{const r=await api('/api/carriers/'+tracking.carrier+'/proof-packet',{method:'POST',body:JSON.stringify(tracking)});setNotice('Carrier proof packet created: '+r.job.id)}catch(e){setNotice(e.message)}}async function digitalPreview(){try{setDigitalResult(await api('/api/digital-delivery/preview',{method:'POST',body:JSON.stringify(digital)}))}catch(e){setNotice(e.message)}}async function digitalPacket(){try{const r=await api('/api/digital-delivery/proof-packet',{method:'POST',body:JSON.stringify(digital)});setNotice('Digital proof packet created: '+r.job.id)}catch(e){setNotice(e.message)}}return <div className="provider-playbooks"><section className="panel wide"><h3>Platform Playbooks</h3><p className="hint">Provider-specific credentials, webhooks, status mappings, API access notes, and test payload templates.</p><div className="provider-tabs">{catalog.map(p=><button key={p.id} className={provider===p.id?'active':''} onClick={()=>setProvider(p.id)}>{p.name}</button>)}</div>{book&&<div className="playbook-grid"><article className="playbook-card access"><strong>API access</strong><span>{book.access}</span><em>requires approved API access</em></article><article className="playbook-card"><strong>Required credentials</strong>{book.required.map(([key,label])=><p key={key}><code>{key}</code> {label}</p>)}</article><article className="playbook-card"><strong>What this platform can do</strong><ul>{book.can.map(x=><li key={x}>{x}</li>)}</ul></article><article className="playbook-card"><strong>Webhook example</strong><code>{location.origin}{book.webhook}</code></article><article className="playbook-card"><strong>Status mapping</strong>{Object.entries(book.statuses||{}).map(([a,b])=><p key={a}><code>{a}</code> → <b>{b}</b></p>)}</article><article className="playbook-card"><strong>Test payload</strong><pre>{JSON.stringify(book.template,null,2)}</pre></article></div>}</section><section className="panel wide"><h3>USPS / FedEx / UPS tracking workflow</h3><div className="carrier-form"><select value={tracking.carrier} onChange={e=>setTracking({...tracking,carrier:e.target.value})}><option value="usps">USPS</option><option value="fedex">FedEx</option><option value="ups">UPS</option></select><input placeholder="Tracking number" value={tracking.tracking_number} onChange={e=>setTracking({...tracking,tracking_number:e.target.value})}/><button className="secondary" onClick={carrierPreview}>Preview status</button><button className="primary" onClick={carrierPacket}>Create proof packet</button></div>{trackingResult&&<div className="tracking-preview"><strong>{trackingResult.carrier} · {trackingResult.mapped_status}</strong><a href={trackingResult.tracking_url} target="_blank">Open carrier tracking</a>{trackingResult.events.map(e=><p key={e.status}>{e.label} · {e.time}</p>)}</div>}</section><section className="panel wide"><h3>Digital delivery workflow</h3><div className="carrier-form"><input placeholder="Deliverable URL" value={digital.digital_delivery_url} onChange={e=>setDigital({...digital,digital_delivery_url:e.target.value})}/><select value={digital.status} onChange={e=>setDigital({...digital,status:e.target.value})}><option>Submitted</option><option>Client Review</option><option>Revision Requested</option><option>Final Accepted</option></select><button className="secondary" onClick={digitalPreview}>Preview approval flow</button><button className="primary" onClick={digitalPacket}>Create digital proof packet</button></div>{digitalResult&&<div className="tracking-preview"><strong>{digitalResult.current}</strong><a href={digitalResult.deliverable_url} target="_blank">Open deliverable</a>{digitalResult.checklist.map(x=><p key={x.label}>{x.done?'✓':'○'} {x.label}</p>)}</div>}</section></div>}


function WorkerSocialMarketplace310({setNotice}){const [sources,setSources]=useState([]),[posts,setPosts]=useState([]),[profile,setProfile]=useState({display_name:'',headline:'',bio:'',city:'',state:'',skills:'delivery, field service, proof upload',links:{linkedin:'',portfolio:''},remote_ready:true,onsite_ready:true}),[tab,setTab]=useState('discover');async function load(){try{setSources((await api('/api/marketplace/sources/catalog')).sources||[]);setPosts((await api('/api/marketplace/posts')).posts||[]);const p=await api('/api/marketplace/profile').catch(()=>({})); if(p.profile){setProfile({...profile,...p.profile,skills:(JSON.parse(p.profile.skills_json||'[]')).join(', '),links:JSON.parse(p.profile.links_json||'{}')})}}catch(e){setNotice(e.message)}}useEffect(()=>{load()},[]);async function saveProfile(){try{await api('/api/marketplace/profile',{method:'POST',body:JSON.stringify({...profile,skills:String(profile.skills||'').split(',').map(s=>s.trim()).filter(Boolean)})});setNotice('Worker profile saved.');load()}catch(e){setNotice(e.message)}}async function importDemo(id){try{const r=await api('/api/marketplace/import-demo/'+id,{method:'POST',body:JSON.stringify({})});setNotice('Imported demo opportunity: '+r.post.title);load()}catch(e){setNotice(e.message)}}async function apply(post){try{await api('/api/marketplace/posts/'+post.id+'/apply',{method:'POST',body:JSON.stringify({cover_note:'I can complete this with GPS/photo proof.',bid_cents:post.budget_cents})});setNotice('Application submitted.')}catch(e){setNotice(e.message)}}return <div className="social-market"><section className="panel wide"><h3>Worker + Buyer Social Marketplace</h3><p className="hint">Angi / Field Nation / HelloTech / Upwork / Fiverr style discovery without scraping. Connect approved APIs, CSV exports, email parser feeds, or user-provided links.</p><div className="provider-tabs"><button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}>Discover work</button><button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}>Worker profile</button><button className={tab==='sources'?'active':''} onClick={()=>setTab('sources')}>External sources</button></div>{tab==='discover'&&<div className="social-grid">{posts.map(p=><article className="social-card" key={p.id}><strong>{p.title}</strong><span>{p.source_platform} · {p.work_mode} · {p.city} {p.state}</span><p>{p.description}</p><em>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((p.budget_cents||0)/100)}</em><button className="primary" onClick={()=>apply(p)}>Apply with proof profile</button></article>)}{!posts.length&&<article className="social-card"><strong>No public posts yet</strong><p>Import demo opportunities or post public work to fill this feed.</p></article>}</div>}{tab==='profile'&&<div className="profile-builder"><input placeholder="Display name" value={profile.display_name} onChange={e=>setProfile({...profile,display_name:e.target.value})}/><input placeholder="Headline" value={profile.headline} onChange={e=>setProfile({...profile,headline:e.target.value})}/><textarea placeholder="Bio" value={profile.bio} onChange={e=>setProfile({...profile,bio:e.target.value})}/><input placeholder="City" value={profile.city} onChange={e=>setProfile({...profile,city:e.target.value})}/><input placeholder="State" value={profile.state} onChange={e=>setProfile({...profile,state:e.target.value})}/><input placeholder="Skills, comma separated" value={profile.skills} onChange={e=>setProfile({...profile,skills:e.target.value})}/><input placeholder="LinkedIn profile URL" value={profile.links?.linkedin||''} onChange={e=>setProfile({...profile,links:{...(profile.links||{}),linkedin:e.target.value}})}/><input placeholder="Portfolio / resume URL" value={profile.links?.portfolio||''} onChange={e=>setProfile({...profile,links:{...(profile.links||{}),portfolio:e.target.value}})}/><label><input type="checkbox" checked={!!profile.remote_ready} onChange={e=>setProfile({...profile,remote_ready:e.target.checked})}/> Remote/online work</label><label><input type="checkbox" checked={!!profile.onsite_ready} onChange={e=>setProfile({...profile,onsite_ready:e.target.checked})}/> In-person field work</label><button className="primary" onClick={saveProfile}>Save social worker profile</button></div>}{tab==='sources'&&<div className="source-grid">{sources.map(s=><article className="source-card" key={s.id}><strong>{s.name}</strong><p>{s.access}</p><ul>{s.can.map(x=><li key={x}>{x}</li>)}</ul><button className="secondary" onClick={()=>importDemo(s.id)}>Import demo opportunity</button></article>)}</div>}</section></div>}


function SocialSearchRewards320({setNotice}){const [sources,setSources]=useState([]),[results,setResults]=useState([]),[q,setQ]=useState({query:'technician',location:'Joplin, MO',work_mode:'all'}),[rewards,setRewards]=useState(null),[tab,setTab]=useState('search');async function load(){try{setSources((await api('/api/work-search/catalog')).sources||[]);setRewards(await api('/api/rewards/status'))}catch(e){setNotice(e.message)}}useEffect(()=>{load()},[]);async function search(){try{setResults((await api('/api/work-search/query',{method:'POST',body:JSON.stringify(q)})).results||[])}catch(e){setNotice(e.message)}}async function importResult(r){try{await api('/api/work-search/import',{method:'POST',body:JSON.stringify(r)});setNotice('Imported work lead and earned credits.');load()}catch(e){setNotice(e.message)}}async function reward(event){try{const r=await api('/api/rewards/earn-demo',{method:'POST',body:JSON.stringify({event_type:event})});setRewards(r);setNotice('Reward earned.')}catch(e){setNotice(e.message)}}async function referral(){try{const r=await api('/api/rewards/referral',{method:'POST',body:JSON.stringify({})});setRewards(r);navigator.clipboard?.writeText(r.share_url);setNotice('Referral link copied: '+r.share_url)}catch(e){setNotice(e.message)}}return <div className="social-search-rewards"><section className="panel wide"><h3>Smart Work Search + Social Rewards</h3><p className="hint">Search/import work from approved APIs, feeds, CSVs, public links, and robots-friendly public sources. This is the Promote4.me search layer — not private scraping.</p><div className="provider-tabs"><button className={tab==='search'?'active':''} onClick={()=>setTab('search')}>Work search</button><button className={tab==='sources'?'active':''} onClick={()=>setTab('sources')}>Integrations guide</button><button className={tab==='rewards'?'active':''} onClick={()=>setTab('rewards')}>Rewards + referrals</button></div>{tab==='search'&&<><div className="search-hero-row"><input placeholder="What work? plumber, tech, delivery" value={q.query} onChange={e=>setQ({...q,query:e.target.value})}/><input placeholder="Where?" value={q.location} onChange={e=>setQ({...q,location:e.target.value})}/><select value={q.work_mode} onChange={e=>setQ({...q,work_mode:e.target.value})}><option value="all">All</option><option value="in_person">In-person</option><option value="online">Online</option></select><button className="primary" onClick={search}>Search work</button></div><div className="social-grid">{results.map(r=><article className="social-card" key={r.id}><strong>{r.title}</strong><span>{r.source_name} · {r.work_mode} · {r.location}</span><p>{r.notice}</p><em>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((r.pay_cents||0)/100)}</em><a href={r.external_url} target="_blank">Open source</a><button className="primary" onClick={()=>importResult(r)}>Import to Promote4.me</button></article>)}</div></>}{tab==='sources'&&<div className="source-grid">{sources.map(s=><article className="source-card" key={s.id}><strong>{s.name}</strong><p>{s.access}</p><ul>{s.guide?.map(x=><li key={x}>{x}</li>)}</ul><small>{s.fields?.join(' · ')}</small></article>)}</div>}{tab==='rewards'&&<div className="rewards-grid"><article className="reward-card"><strong>{rewards?.credits||0}</strong><span>Credits earned</span></article><article className="reward-card"><strong>{rewards?.free_months||0}</strong><span>Free months earned</span></article><article className="reward-card"><strong>{rewards?.referral_code||'P4ME'}</strong><span>Referral code</span></article><button className="primary" onClick={referral}>Copy referral link</button><button className="secondary" onClick={()=>reward('profile_complete')}>Earn profile reward</button><button className="secondary" onClick={()=>reward('proof_upload')}>Earn proof reward</button></div>}</section></div>}
function SiteFooter320(){const [info,setInfo]=useState({version:'3.2.0'});useEffect(()=>{fetch('/api/public/site-version').then(r=>r.json()).then(setInfo).catch(()=>{})},[]);return <footer className="site-footer"><strong>Promote4.me v{info.version}</strong><span>This is a Move Weight product · <a href="https://moveweight.net" target="_blank">moveweight.net</a></span><span>{info.copyright||'© Move Weight. All rights reserved.'}</span></footer>}
function EvidenceCards320({job}){return null}


function WorkMapSearch330({setNotice}){const [q,setQ]=useState({query:'technician',location:'Joplin, MO',work_mode:'all'}),[results,setResults]=useState([]),[selected,setSelected]=useState(null),[tab,setTab]=useState('map');async function search(){try{const r=await api('/api/work-map/search',{method:'POST',body:JSON.stringify(q)});setResults(r.results||[]);setSelected((r.results||[])[0]||null)}catch(e){setNotice?.(e.message)}}useEffect(()=>{search()},[]);async function importWork(r){try{await api('/api/work-map/import',{method:'POST',body:JSON.stringify(r)});setNotice?.('Imported work to Promote4.me.');search()}catch(e){setNotice?.(e.message)}}const center=selected||{lat:37.0842,lng:-94.5133};return <section className="workmap-330"><div className="workmap-hero"><div><span className="eyebrow">Live Work Map</span><h2>Find work. Post work. Prove work.</h2><p>Search native Promote4.me posts plus approved/API/feed discovery sources.</p></div><div className="workmap-search"><input value={q.query} onChange={e=>setQ({...q,query:e.target.value})}/><input value={q.location} onChange={e=>setQ({...q,location:e.target.value})}/><select value={q.work_mode} onChange={e=>setQ({...q,work_mode:e.target.value})}><option value="all">All</option><option value="in_person">In-person</option><option value="online">Online</option></select><button className="primary" onClick={search}>Search map</button></div></div><div className="workmap-tabs"><button className={tab==='map'?'active':''} onClick={()=>setTab('map')}>Map</button><button className={tab==='list'?'active':''} onClick={()=>setTab('list')}>List</button></div>{tab==='map'?<div className="workmap-layout"><div className="workmap-canvas"><MapProviderBadge331 config={mapConfig330} /><iframe title="Open work map" src={buildMapEmbed331(center,mapConfig330)} /><div className="map-bubbles">{results.slice(0,18).map((r,i)=><button key={r.id||i} className={selected?.id===r.id?'active':''} style={{left:(10+(i*17)%78)+'%',top:(16+(i*23)%62)+'%'}} onClick={()=>setSelected(r)}>{r.work_mode==='online'?'💻':'📍'}</button>)}</div></div><aside className="workmap-detail">{selected&&<><strong>{selected.title}</strong><span>{selected.source_name} · {selected.work_mode}</span><p>{selected.description}</p><em>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((selected.pay_cents||selected.budget_cents||0)/100)}</em><button className="primary" onClick={()=>importWork(selected)}>Import / claim workflow</button></>}</aside></div>:<div className="workmap-list">{results.map(r=><article key={r.id} className="work-card-row"><div><strong>{r.title}</strong><span>{r.source_name} · {r.location} · {r.work_mode}</span></div><em>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((r.pay_cents||0)/100)}</em><button onClick={()=>{setSelected(r);setTab('map')}}>View</button><button className="primary" onClick={()=>importWork(r)}>Import</button></article>)}</div>}</section>}
function HomeWorkMapTeaser330({onLogin}){return <section className="home-workmap"><div className="public-workmap-preview"><iframe title="Public preview map" src="https://www.openstreetmap.org/export/embed.html?bbox=-94.62%2C37.01%2C-94.39%2C37.16&layer=mapnik&marker=37.0842%2C-94.5133"></iframe><div className="preview-pin" style={{left:'18%',top:'28%'}}>📍<span>Work nearby<small>Promote4.me</small></span></div><div className="preview-pin" style={{left:'58%',top:'46%'}}>💻<span>Online gig<small>Remote</small></span></div></div><div className="home-workmap-copy"><span className="eyebrow">Work Map Beta</span><h2>Search the map before signing up.</h2><p>Find in-person and online opportunities, then sign up to apply, post, import, and prove work.</p><button className="primary" onClick={onLogin}>Create free account</button></div></section>}


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


function PublicWorkHub340({onSignup}){const [tab,setTab]=useState('map'),[q,setQ]=useState({query:'technician',location:'Joplin, MO',work_mode:'all'}),[results,setResults]=useState([]),[selected,setSelected]=useState(null),[cfg,setCfg]=useState({sources:[],map:{provider:'openstreetmap'}}),[post,setPost]=useState({title:'',description:'',city:'Joplin',state:'MO',work_mode:'in_person',budget_cents:5000,email:''}),[worker,setWorker]=useState({name:'',email:'',city:'Joplin',state:'MO',headline:'',skills:'delivery, technician, proof upload',work_mode:'both'}),[notice,setNotice]=useState('');useEffect(()=>{fetch('/api/public/work-hub/config').then(r=>r.json()).then(setCfg).catch(()=>{});search()},[]);async function search(){const r=await fetch('/api/public/work-hub/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)}).then(r=>r.json());setResults(r.results||[]);setSelected((r.results||[])[0]||null)}async function postWork(){const r=await fetch('/api/public/work-hub/post-work',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(post)}).then(r=>r.json());setNotice(r.ok?'Work posted to the public map. Create an account to manage applicants.':'Post failed');search()}async function saveWorker(){const r=await fetch('/api/public/work-hub/worker-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(worker)}).then(r=>r.json());setNotice(r.message||'Profile received')}const center=selected||{lat:37.0842,lng:-94.5133};const mapSrc=typeof buildMapEmbed331==='function'?buildMapEmbed331(center,cfg.map):'https://www.openstreetmap.org/export/embed.html?bbox=-94.62%2C37.01%2C-94.39%2C37.16&layer=mapnik&marker=37.0842%2C-94.5133';return <section className="public-hub-340"><div className="hub-hero"><div><span className="eyebrow">Public Work Hub</span><h2>Find local work, post a job, or bring outside leads into Promote4.me.</h2><p>Angi-style local services, FieldNation-style field work, HelloTech-style visits, and Upwork/Fiverr-style digital proof workflows — centered around a live work map.</p></div><button className="primary" onClick={onSignup}>Join free</button></div><div className="hub-tabs"><button className={tab==='map'?'active':''} onClick={()=>setTab('map')}>Work Map</button><button className={tab==='post'?'active':''} onClick={()=>setTab('post')}>Post Work</button><button className={tab==='worker'?'active':''} onClick={()=>setTab('worker')}>Looking for Work</button><button className={tab==='sources'?'active':''} onClick={()=>setTab('sources')}>Search Sources</button></div>{notice&&<div className="notice">{notice}</div>}{tab==='map'&&<><div className="hub-search"><input value={q.query} onChange={e=>setQ({...q,query:e.target.value})} placeholder="plumber, delivery, designer"/><input value={q.location} onChange={e=>setQ({...q,location:e.target.value})} placeholder="City, State"/><select value={q.work_mode} onChange={e=>setQ({...q,work_mode:e.target.value})}><option value="all">All</option><option value="in_person">In-person</option><option value="online">Online</option></select><button className="primary" onClick={search}>Search</button></div><div className="hub-map-layout"><div className="hub-map"><iframe title="Public work hub map" src={mapSrc}></iframe><div className="map-bubbles">{results.slice(0,24).map((r,i)=><button key={r.id||i} className={selected?.id===r.id?'active':''} style={{left:(8+(i*13)%84)+'%',top:(14+(i*17)%68)+'%'}} onClick={()=>setSelected(r)}>{r.work_mode==='online'?'💻':'📍'}</button>)}</div></div><aside className="hub-results">{results.slice(0,12).map(r=><article key={r.id} onClick={()=>setSelected(r)} className={selected?.id===r.id?'active':''}><strong>{r.title}</strong><span>{r.source_name} · {r.work_mode}</span><em>{r.status||'available'}</em></article>)}</aside></div></>}{tab==='post'&&<div className="hub-form"><input placeholder="Work title" value={post.title} onChange={e=>setPost({...post,title:e.target.value})}/><textarea placeholder="What needs done?" value={post.description} onChange={e=>setPost({...post,description:e.target.value})}/><input placeholder="City" value={post.city} onChange={e=>setPost({...post,city:e.target.value})}/><input placeholder="State" value={post.state} onChange={e=>setPost({...post,state:e.target.value})}/><select value={post.work_mode} onChange={e=>setPost({...post,work_mode:e.target.value})}><option value="in_person">In-person</option><option value="online">Online</option></select><input placeholder="Budget cents, e.g. 7500" value={post.budget_cents} onChange={e=>setPost({...post,budget_cents:e.target.value})}/><input placeholder="Email so workers can follow up" value={post.email} onChange={e=>setPost({...post,email:e.target.value})}/><button className="primary" onClick={postWork}>Post free work lead</button></div>}{tab==='worker'&&<div className="hub-form"><input placeholder="Name" value={worker.name} onChange={e=>setWorker({...worker,name:e.target.value})}/><input placeholder="Email" value={worker.email} onChange={e=>setWorker({...worker,email:e.target.value})}/><input placeholder="Headline" value={worker.headline} onChange={e=>setWorker({...worker,headline:e.target.value})}/><input placeholder="City" value={worker.city} onChange={e=>setWorker({...worker,city:e.target.value})}/><input placeholder="State" value={worker.state} onChange={e=>setWorker({...worker,state:e.target.value})}/><input placeholder="Skills" value={worker.skills} onChange={e=>setWorker({...worker,skills:e.target.value})}/><input placeholder="LinkedIn URL" value={worker.linkedin_url||''} onChange={e=>setWorker({...worker,linkedin_url:e.target.value})}/><input placeholder="Resume / portfolio URL" value={worker.resume_url||''} onChange={e=>setWorker({...worker,resume_url:e.target.value})}/><button className="primary" onClick={saveWorker}>Create looking-for-work profile</button></div>}{tab==='sources'&&<div className="source-grid">{cfg.sources?.map(s=><article className="source-card" key={s.id}><strong>{s.name}</strong><p>{s.note}</p><small>{s.kind} · {s.live?'ready':'requires approved access/import'}</small></article>)}</div>}</section>}


function buildHiringMap343(center, query, config={}) {
  const lat = Number(center?.lat || 37.0842), lng = Number(center?.lng || -94.5133);
  const q = encodeURIComponent((query || 'jobs hiring') + ' near ' + (center?.zip || center?.label || '64801'));
  if (config?.provider === 'google' && config?.google_embed_key) return 'https://www.google.com/maps/embed/v1/search?key=' + encodeURIComponent(config.google_embed_key) + '&q=' + q + '&center=' + lat + ',' + lng + '&zoom=12';
  return 'https://www.openstreetmap.org/export/embed.html?bbox=' + (lng - .09) + '%2C' + (lat - .075) + '%2C' + (lng + .09) + '%2C' + (lat + .075) + '&layer=mapnik&marker=' + lat + '%2C' + lng;
}
function PublicWorkHub343({ onSignup }) {
  const [tab,setTab]=useState('map'), [q,setQ]=useState({query:'hiring',location:'64801',work_mode:'all',source:'all'}), [results,setResults]=useState([]), [selected,setSelected]=useState(null), [center,setCenter]=useState({lat:37.0842,lng:-94.5133,zip:'64801'}), [mapConfig,setMapConfig]=useState({provider:'openstreetmap'}), [notice,setNotice]=useState('');
  const [post,setPost]=useState({title:'',description:'',city:'Joplin',state:'MO',work_mode:'in_person',budget_cents:7500,email:''});
  const [worker,setWorker]=useState({name:'',email:'',city:'Joplin',state:'MO',headline:'',skills:'plumbing, delivery, technician, proof photos'});
  async function searchWork(){ try{ const d=await fetch('/api/public/work-hub/places-hiring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)}).then(r=>r.json()); setResults(d.results||[]); setSelected((d.results||[])[0]||null); setCenter(d.center||center); setMapConfig(d.map||mapConfig); setNotice((d.results||[]).length+' places/results loaded near '+(d.zip||q.location)); }catch{ setNotice('Search is warming up. Try again.'); } }
  async function postWork(){ const d=await fetch('/api/public/work-hub/post-work',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(post)}).then(r=>r.json()); setNotice(d.ok?'Your work request is live on the map.':'Post failed.'); searchWork(); }
  async function saveWorker(){ const d=await fetch('/api/public/work-hub/worker-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(worker)}).then(r=>r.json()); setNotice(d.message||'Worker profile submitted.'); }
  useEffect(()=>{ searchWork(); },[]);
  const mapSrc = buildHiringMap343(center, q.query, mapConfig);
  return <section className="public-hub-343"><div className="hub343-hero"><div><span className="eyebrow">Work Hub · live hiring map</span><h2>Find 10+ places hiring from any ZIP code.</h2><p>Search a live Google map, post work for free, or create a looking-for-work profile. Indeed and ZipRecruiter feeds can plug into this same view when approved.</p></div><button className="primary big" onClick={onSignup}>Join free</button></div><div className="hub343-search"><input value={q.query} onChange={e=>setQ({...q,query:e.target.value})} placeholder="hiring, plumber, driver, tech"/><input value={q.location} onChange={e=>setQ({...q,location:e.target.value})} placeholder="ZIP or city"/><select value={q.work_mode} onChange={e=>setQ({...q,work_mode:e.target.value})}><option value="all">All work</option><option value="in_person">In-person</option><option value="online">Online</option></select><button className="primary" onClick={searchWork}>Search ZIP</button></div><div className="hub343-tabs">{[['map','Map + Results'],['post','Post Work'],['worker','Looking for Work'],['sources','Source Plan']].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>{notice&&<div className="notice">{notice}</div>}{tab==='map'&&<div className="hub343-layout"><div className="hub343-map"><iframe title="Places hiring map" src={mapSrc}></iframe><div className="map-provider-badge">{mapConfig?.provider==='google'?'Google Maps hiring search':'Map search'}</div><div className="map-bubbles">{results.slice(0,20).map((r,i)=><button key={r.id||i} className={selected?.id===r.id?'active':''} style={{left:(8+(i*13)%84)+'%',top:(14+(i*17)%68)+'%'}} onClick={()=>setSelected(r)}>{r.work_mode==='online'?'💻':'📍'}</button>)}</div></div><aside className="hub343-feed">{results.slice(0,15).map((r,i)=><article key={r.id||i} className={selected?.id===r.id?'active':''} onClick={()=>setSelected(r)}><strong>{r.title}</strong><span>{r.source_name} · {r.location || r.city}</span><small>{r.status||'available'} · {r.work_mode} · {r.pay_cents?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(r.pay_cents/100):'search result'}</small>{r.external_url&&<a href={r.external_url} target="_blank">Open source</a>}</article>)}</aside></div>}{tab==='post'&&<div className="hub343-form"><input placeholder="Work title" value={post.title} onChange={e=>setPost({...post,title:e.target.value})}/><textarea placeholder="Describe the work" value={post.description} onChange={e=>setPost({...post,description:e.target.value})}/><input placeholder="Email" value={post.email} onChange={e=>setPost({...post,email:e.target.value})}/><button className="primary" onClick={postWork}>Post free work lead</button></div>}{tab==='worker'&&<div className="hub343-form"><input placeholder="Name" value={worker.name} onChange={e=>setWorker({...worker,name:e.target.value})}/><input placeholder="Email" value={worker.email} onChange={e=>setWorker({...worker,email:e.target.value})}/><input placeholder="Headline" value={worker.headline} onChange={e=>setWorker({...worker,headline:e.target.value})}/><input placeholder="Skills" value={worker.skills} onChange={e=>setWorker({...worker,skills:e.target.value})}/><button className="primary" onClick={saveWorker}>Create looking-for-work profile</button></div>}{tab==='sources'&&<div className="hub343-sources"><article><strong>Indeed / ZipRecruiter</strong><p>Paste approved publisher/API/feed details in Integrations → Job Source Connectors. Until then, this view provides map search plus importable discovery cards.</p></article><article><strong>Upwork / Fiverr</strong><p>Remote work links become deliverable proof packets with review, revision, and final acceptance.</p></article><article><strong>Promote4.me native</strong><p>Free public posts, worker profiles, proof-ready jobs, GPS/photo evidence, and paid buyer workflows.</p></article></div>}</section>
}


function loadGoogleMaps347(key){return new Promise((resolve,reject)=>{if(window.google?.maps)return resolve(window.google.maps);const id='p4me-google-maps-js';const existing=document.getElementById(id);if(existing){existing.addEventListener('load',()=>resolve(window.google.maps));existing.addEventListener('error',reject);return;}const s=document.createElement('script');s.id=id;s.async=true;s.defer=true;s.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&libraries=places';s.onload=()=>resolve(window.google.maps);s.onerror=reject;document.head.appendChild(s);});}
function GoogleWorkMap347({center,items,onSelect,selected,mapConfig,query}){const ref=useRef(null),mapRef=useRef(null),markersRef=useRef([]);useEffect(()=>{let alive=true;async function init(){if(!mapConfig?.google_embed_key||!ref.current)return;const maps=await loadGoogleMaps347(mapConfig.google_embed_key);if(!alive)return;if(!mapRef.current){mapRef.current=new maps.Map(ref.current,{center:{lat:center.lat,lng:center.lng},zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:true});}else{mapRef.current.setCenter({lat:center.lat,lng:center.lng});}markersRef.current.forEach(m=>m.setMap(null));markersRef.current=[];const bounds=new maps.LatLngBounds();items.forEach((it,i)=>{const pos={lat:Number(it.lat||center.lat),lng:Number(it.lng||center.lng)};const marker=new maps.Marker({position:pos,map:mapRef.current,title:it.title,label:it.source_type==='live_search'?'★':String(i+1),animation:selected?.id===it.id?maps.Animation.BOUNCE:null});marker.addListener('click',()=>onSelect(it));markersRef.current.push(marker);bounds.extend(pos);});if(items.length>1)mapRef.current.fitBounds(bounds);}
init().catch(()=>{});return()=>{alive=false}},[mapConfig?.google_embed_key,center?.lat,center?.lng,items?.length,selected?.id]);return <div className="hub347-real-map" ref={ref}></div>}
function PublicWorkHub347({onSignup}){const[tab,setTab]=useState('map'),[q,setQ]=useState({query:'hiring',location:'64801',work_mode:'all'}),[results,setResults]=useState([]),[sel,setSel]=useState(null),[center,setCenter]=useState({lat:37.0842,lng:-94.5133,zip:'64801'}),[map,setMap]=useState({provider:'openstreetmap'}),[note,setNote]=useState(''),[loading,setLoading]=useState(false);async function search(){setLoading(true);try{const d=await fetch('/api/public/work-hub/live-ads-v349',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)}).then(r=>r.json());setResults(d.results||[]);setSel((d.results||[])[0]||null);setCenter(d.center||center);setMap(d.map||map);setNote((d.results||[]).length+' live/discovery results near '+(d.zip||q.location))}catch{setNote('Search is warming up. Try again.')}finally{setLoading(false)}}async function saveLead(item){try{const d=await fetch('/api/public/work-hub/save-lead-v346',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}).then(r=>r.json());setNote(d.message||'Saved')}catch{setNote('Save failed')}}useEffect(()=>{search()},[]);return <section className="public-hub-347"><div className="hub347-hero"><div><span className="eyebrow">Work Hub · real sources · v3.4.9</span><h2>Search real public job sources by ZIP.</h2><p>Map markers are now real Google Maps markers tied to coordinates. Results come from public discovery and approved feeds when connected. Demo/test imports are hidden from the public view.</p></div><button className="primary big" onClick={onSignup}>Join free</button></div><div className="hub347-search"><input value={q.query} onChange={e=>setQ({...q,query:e.target.value})} placeholder="hiring, plumber, driver, tech"/><input value={q.location} onChange={e=>setQ({...q,location:e.target.value})} placeholder="ZIP or city"/><select value={q.work_mode} onChange={e=>setQ({...q,work_mode:e.target.value})}><option value="all">All work</option><option value="in_person">In-person</option><option value="online">Online</option></select><select value={q.source} onChange={e=>setQ({...q,source:e.target.value})}><option value="all">All sources</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="linkedin">LinkedIn</option><option value="remote">Upwork/Fiverr</option></select><button className="primary" onClick={search}>{loading?'Searching...':'Search ZIP'}</button></div><div className="hub347-tabs"><button className={tab==='map'?'active':''} onClick={()=>setTab('map')}>Map + Results</button><button className={tab==='sources'?'active':''} onClick={()=>setTab('sources')}>Sources</button><button className={tab==='post'?'active':''} onClick={()=>setTab('post')}>Post Work</button></div>{note&&<div className="notice">{note}</div>}{tab==='map'&&<div className="hub347-layout"><div className="hub347-map"><GoogleWorkMap347 center={center} items={results} selected={sel} onSelect={setSel} mapConfig={map} query={q.query}/><div className="map-provider-badge">Real Google markers</div></div><aside className="hub347-feed">{results.map(r=><article key={r.id} className={sel?.id===r.id?'active':''} onClick={()=>setSel(r)}><strong>{r.title}</strong><span>{r.source_name} · {r.location}</span><p>{r.description || 'Public source result. Save it to manage as a Promote4.me lead.'}</p><small>{r.status} · {r.work_mode} · {r.pay_cents?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((r.pay_cents||0)/100):'public source'}</small><div className="hub347-actions"><a href={r.external_url} target="_blank">Open source</a><a href={r.glassdoor_url} target="_blank">Glassdoor</a><button onClick={(e)=>{e.stopPropagation();navigator.clipboard?.writeText(r.share_url||location.href);setNote('Share link copied')}}>Share</button><button onClick={(e)=>{e.stopPropagation();saveLead(r)}}>Save lead</button></div></article>)}</aside></div>}{tab==='sources'&&<div className="hub347-sources"><article><strong>Live discovery now</strong><p>Uses search.moveweight.com to find public job/search results and keeps them inside Promote4.me.</p></article><article><strong>Official feeds next</strong><p>Indeed and ZipRecruiter require approved publisher/API/feed access. Once you paste credentials in Integrations, those replace discovery fallback cards.</p></article><article><strong>No fake map pins</strong><p>The old fixed overlay dots are gone. These are actual Google Maps markers.</p></article></div>}{tab==='post'&&<div className="hub347-form"><input placeholder="Work title"/><textarea placeholder="Describe the work"/><button className="primary">Post free work lead</button></div>}</section>}


function JobSourceAdminGuide349({setNotice}){const[guide,setGuide]=useState(null);async function load(){try{setGuide(await api('/api/job-sources/admin-guide-v349'))}catch(e){setNotice?.(e.message)}}useEffect(()=>{load()},[]);if(!guide)return null;return <section className="panel wide guide349"><h3>Super Admin Job Source Setup Guide</h3><p className="hint">Public discovery is live now. These steps upgrade each source from discovery cards into approved direct feeds.</p><div className="guide349-grid">{guide.guides.map(g=><article key={g.source}><strong>{g.source}</strong><p>{g.status}</p><ol>{g.steps.map(s=><li key={s}>{s}</li>)}</ol><small>Fields: {g.fields.join(', ')}</small></article>)}</div></section>}


function loadGoogleMaps350(key){return new Promise((resolve,reject)=>{if(window.google?.maps)return resolve(window.google.maps);const id='p4me-google-maps-js';const old=document.getElementById(id);if(old){old.addEventListener('load',()=>resolve(window.google.maps));old.addEventListener('error',reject);return}const s=document.createElement('script');s.id=id;s.async=true;s.defer=true;s.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&libraries=places';s.onload=()=>resolve(window.google.maps);s.onerror=reject;document.head.appendChild(s)})}
function GoogleWorkMap350({center,items,onSelect,selected,mapConfig}){const ref=useRef(null),mapRef=useRef(null),markersRef=useRef([]);useEffect(()=>{let alive=true;async function init(){if(!mapConfig?.google_embed_key||!ref.current)return;const maps=await loadGoogleMaps350(mapConfig.google_embed_key);if(!alive)return;if(!mapRef.current)mapRef.current=new maps.Map(ref.current,{center:{lat:center.lat,lng:center.lng},zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:true});else mapRef.current.setCenter({lat:center.lat,lng:center.lng});markersRef.current.forEach(m=>m.setMap(null));markersRef.current=[];const bounds=new maps.LatLngBounds();items.forEach((it,i)=>{const pos={lat:Number(it.lat||center.lat),lng:Number(it.lng||center.lng)};const marker=new maps.Marker({position:pos,map:mapRef.current,title:it.title,label:it.source_id==='indeed'?'I':it.source_id==='ziprecruiter'?'Z':it.source_id==='linkedin'?'L':String(i+1)});marker.addListener('click',()=>onSelect(it));markersRef.current.push(marker);bounds.extend(pos)});if(items.length>1)mapRef.current.fitBounds(bounds)}init().catch(()=>{});return()=>{alive=false}},[mapConfig?.google_embed_key,center?.lat,center?.lng,items?.map(x=>x.id).join('|'),selected?.id]);return <div className="hub350-real-map" ref={ref}></div>}
function PublicWorkHub350({onSignup}){const[tab,setTab]=useState('map'),[q,setQ]=useState({query:'hiring',location:'64801',work_mode:'all',source:'all'}),[results,setResults]=useState([]),[sel,setSel]=useState(null),[center,setCenter]=useState({lat:37.0842,lng:-94.5133,zip:'64801'}),[map,setMap]=useState({provider:'openstreetmap'}),[note,setNote]=useState(''),[loading,setLoading]=useState(false);async function search(event){event?.preventDefault?.();setLoading(true);try{const d=await fetch('/api/public/work-hub/search-v352',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)}).then(r=>r.json());setResults(d.results||[]);setSel((d.results||[])[0]||null);setCenter(d.center||center);setMap(d.map||map);setNote((d.results||[]).length+' results near '+[(d.center?.city),(d.center?.state),(d.zip)].filter(Boolean).join(' '))}catch{setNote('Search failed. Try another ZIP or source.')}finally{setLoading(false)}}async function saveLead(item){try{const d=await fetch('/api/public/work-hub/save-lead-v350',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}).then(r=>r.json());localStorage.setItem('p4me-pending-lead',JSON.stringify({...item,lead_id:d.lead_id}));setNote((d.message||'Lead saved')+' Use Log in to convert it.')}catch{setNote('Save failed')}}function share(item){const u=item.share_url||location.origin+'/?workhub=1';if(navigator.share)navigator.share({title:item.title,text:item.description||'Promote4.me work lead',url:u}).catch(()=>{});else navigator.clipboard?.writeText(u).then(()=>setNote('Share link copied: '+u))}useEffect(()=>{const p=new URLSearchParams(location.search); const zip=p.get('zip'), sq=p.get('q'), src=p.get('source'); if(zip||sq||src){const next={...q,location:zip||q.location,query:sq||q.query,source:src||q.source}; setQ(next); setTimeout(()=>search(),0);} else search()},[]);return <section className="public-hub-350"><div className="hub350-hero"><div><span className="eyebrow">Work Hub · v3.5.3</span><h2>Find public job leads by ZIP code.</h2><p>Search public discovery sources now. Save promising leads into Promote4.me, then turn them into verified work orders when you sign in.</p></div><button className="primary big" onClick={onSignup}>Join free</button></div><form className="hub350-search" onSubmit={search}><input value={q.query} onChange={e=>setQ({...q,query:e.target.value})} placeholder="hiring, driver, plumber, technician"/><input value={q.location} onChange={e=>setQ({...q,location:e.target.value})} placeholder="ZIP or city"/><select value={q.work_mode} onChange={e=>setQ({...q,work_mode:e.target.value})}><option value="all">All work</option><option value="in_person">In-person</option><option value="online">Online</option></select><select value={q.source} onChange={e=>setQ({...q,source:e.target.value})}><option value="all">All sources</option><option value="indeed">Indeed</option><option value="ziprecruiter">ZipRecruiter</option><option value="linkedin">LinkedIn</option><option value="remote">Upwork/Fiverr</option></select><button type="submit" className="primary">{loading?'Searching...':'Search'}</button></form><div className="hub350-tabs"><button className={tab==='map'?'active':''} onClick={()=>setTab('map')}>Map + Results</button><button className={tab==='sources'?'active':''} onClick={()=>setTab('sources')}>How sources work</button></div>{note&&<div className="notice">{note}</div>}{tab==='map'&&<div className="hub350-layout"><div className="hub350-map"><GoogleWorkMap350 center={center} items={results} selected={sel} onSelect={setSel} mapConfig={map}/><div className="map-provider-badge">Real map markers</div></div><aside className="hub350-feed">{results.map(r=><article key={r.id} className={sel?.id===r.id?'active':''} onClick={()=>setSel(r)}><div className="hub350-card-top"><strong>{r.title}</strong><span>{r.source_name}</span></div><p>{r.description || 'Public source result. Save it to manage as a Promote4.me lead.'}</p><small>{r.location} · {r.work_mode} · {r.company?('Company: '+r.company):'company not detected'}</small><div className="hub350-actions"><a href={r.external_url} target="_blank">Open listing</a>{r.company_research_url ? <a href={r.company_research_url} target="_blank">Research company</a> : <span className="muted-pill">No company detected</span>}<button onClick={(e)=>{e.stopPropagation();share(r)}}>Share</button><button onClick={(e)=>{e.stopPropagation();saveLead(r)}}>Save lead</button></div></article>)}</aside></div>}{tab==='sources'&&<div className="hub350-sources"><article><strong>Current completion</strong><p>Public discovery is live through Move Weight Search. Cards open original sources, save into Promote4.me, and share reliable query links.</p></article><article><strong>Official feeds</strong><p>Indeed and ZipRecruiter direct posting/apply flows need the API approvals you requested. When credentials arrive, paste them in Integrations and these cards become official feed results.</p></article><article><strong>No fake Glassdoor</strong><p>The old Glassdoor button was replaced with broader company research using detected company/title context.</p></article></div>}</section>}


function MarketplacePanel351({setNotice}){const[pending,setPending]=useState(null),[leads,setLeads]=useState([]);async function load(){try{setPending(JSON.parse(localStorage.getItem('p4me-pending-lead')||'null'));const d=await fetch('/api/public/work-hub/saved-leads-v351').then(r=>r.json());setLeads(d.leads||[])}catch{}}useEffect(()=>{load()},[]);async function convert(lead){try{const d=await api('/api/work-hub/convert-saved-lead-v351',{method:'POST',body:JSON.stringify({lead})});localStorage.removeItem('p4me-pending-lead');setPending(null);setNotice?.(d.message+' '+d.job_id)}catch(e){setNotice?.(e.message)}}return <div className="content-grid"><section className="panel wide"><h3>Marketplace Work Hub</h3><p className="hint">Search public job leads, save promising opportunities, then convert them into Promote4.me work orders.</p><PublicWorkHub350 onSignup={()=>setNotice?.('You are already signed in. Use Save lead or Convert to work order.')} />{pending&&<article className="pending-lead-card"><h3>Saved lead ready</h3><strong>{pending.title}</strong><p>{pending.description}</p><small>{pending.source_name} · {pending.location}</small><div className="button-row"><button className="primary" onClick={()=>convert(pending)}>Convert to work order</button><button className="secondary" onClick={()=>{localStorage.removeItem('p4me-pending-lead');setPending(null)}}>Clear saved lead</button></div></article>}</section><section className="panel"><h3>Recently saved public leads</h3><div className="saved-leads-list">{leads.map(l=><article key={l.id}><strong>{l.title}</strong><span>{l.source_name} · {l.location}</span><button className="secondary" onClick={()=>convert(l)}>Convert</button></article>)}</div></section></div>}


function MarketplacePanel352({setNotice}){const[pending,setPending]=useState(null),[leads,setLeads]=useState([]);async function load(){try{setPending(JSON.parse(localStorage.getItem('p4me-pending-lead')||'null'));const d=await fetch('/api/public/work-hub/saved-leads-v351').then(r=>r.json());setLeads(d.leads||[])}catch{}}useEffect(()=>{load();window.addEventListener('p4me-workhub-refresh',load);return()=>window.removeEventListener('p4me-workhub-refresh',load)},[]);async function convert(lead){try{const d=await api('/api/work-hub/convert-saved-lead-v351',{method:'POST',body:JSON.stringify({lead})});localStorage.removeItem('p4me-pending-lead');setPending(null);setNotice?.(d.message+' '+d.job_id)}catch(e){setNotice?.(e.message)}}return <div className="content-grid"><section className="panel wide"><h3>Marketplace Work Hub</h3><p className="hint">Search public job leads, save opportunities, then convert them into Promote4.me work orders.</p>{pending&&<article className="pending-lead-card"><h3>Saved lead ready</h3><strong>{pending.title}</strong><p>{pending.description}</p><small>{pending.source_name} · {pending.location}</small><div className="button-row"><button className="primary" onClick={()=>convert(pending)}>Convert to work order</button><button className="secondary" onClick={()=>{localStorage.removeItem('p4me-pending-lead');setPending(null)}}>Clear</button></div></article>}<PublicWorkHub350 onSignup={()=>setNotice?.('Already signed in. Save or convert leads here.')} /></section><section className="panel"><h3>Saved leads</h3><div className="saved-leads-list">{leads.map(l=><article key={l.id}><strong>{l.title}</strong><span>{l.source_name} · {l.location}</span><button className="secondary" onClick={()=>convert(l)}>Convert</button></article>)}{!leads.length&&<p className="hint">No saved leads yet.</p>}</div></section></div>}

function PublicSite({ plans, onAuthed }) {
  const [mode, setMode] = useState("home");
  async function authentik() {
    const data = await api("/api/auth/authentik/url");
    location.href = data.url;
  }

  return (
    <main className="marketing">
      <section className="hero-card marketing-hero">
        <div className="badge"><Sparkles size={18} /> Sellable proof-of-work platform</div>
        <h1>Find work, hire contractors, and verify success with proof.</h1>
        <p>One platform for in-person field work, delivery proof, contractor dispatch, online deliverables, client approvals, and GPS/photo evidence.</p>
        
        <PublicWorkHub350 onSignup={() => setMode("signup")} />
        <div className="intent-grid">
          <article><strong>Looking for Work?</strong><span>Apply for local or remote 1099 jobs.</span></article>
          <article><strong>Looking for Contractors or Team Members?</strong><span>Post jobs, invite workers, approve proof.</span></article>
          <article><strong>Need to Monitor Success?</strong><span>Track GPS/photo evidence and client approvals.</span></article>
        </div>
        <div className="hero-actions">
          <button className="primary big" onClick={() => setMode("signup")}>Start free</button>
          <button className="secondary big" onClick={() => setMode("login")}>Log in</button>
          <button className="secondary big" onClick={authentik}>Social Login</button>
        </div>

        <div className="demo-tour-box">
          <h2>Tour the live demo</h2>
          <p>Password for every demo role: <strong>TestUser123!</strong></p>
          <div className="demo-login-grid">
            <article><strong>Demo Admin</strong><span>Test</span><small>Companies, teams, users, jobs, proof review</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
            <article><strong>Demo Manager</strong><span>TestManager</span><small>Dispatch, routes, CRM, evidence approvals</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
            <article><strong>Demo Field Member</strong><span>TestMember</span><small>Mobile proof upload and assigned work</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
            <article><strong>Demo Client</strong><span>TestClient</span><small>Customer proof and order history</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
          </div>
        </div>
        <div className="tag-grid">
          {deliveryServices.map((service) => <span className="service-tag" key={service}>{service}</span>)}
        </div>
      </section>

      {mode === "login" && <AuthCard action="login" onAuthed={onAuthed} onBack={() => setMode("home")} />}
      {mode === "signup" && <AuthCard action="register" onAuthed={onAuthed} onBack={() => setMode("home")} />}

      <section className="pricing-section">
        <h2>Plans built for buyers</h2>
        <div className="pricing-grid">
          {plans.plans.map((plan) => (
            <article className="price-card" key={plan.id}>
              <span>{plan.name}</span>
              <h3>{plan.price}</h3>
              <p>{plan.proof}</p>
              <ul>
                <li>{plan.jobs?.toLocaleString()} jobs/mo</li>
                <li>{plan.users} users</li>
                <li>Photo/GPS evidence history</li>
              </ul>
              <button className="primary" onClick={() => setMode("signup")}>{plan.cta}</button>
            </article>
          ))}
        </div>
      </section>
            <SiteFooter320 />
    </main>
  );
}


function PublicWorkMap() {
  const mapConfig = useMapConfig331(true);
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ total: 0, available: 0, taken: 0, online: 0, inPerson: 0 });
  const [userPos, setUserPos] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/public/map-jobs')
      .then((response) => response.json())
      .then((data) => { setJobs(data.jobs || []); setCounts(data.counts || {}); })
      .catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 600000 }
      );
    }
  }, []);

  const visible = jobs.filter((job) => {
    if (filter === 'available') return job.available && !job.taken;
    if (filter === 'taken') return job.taken;
    if (filter === 'online') return job.work_mode === 'online';
    if (filter === 'in_person') return (job.work_mode || 'in_person') !== 'online';
    return true;
  });

  const center = userPos || visible.find((job) => job.lat && job.lng) || { lat: 37.0842, lng: -94.5133 };
  const mapUrl = buildMapEmbed331(center, mapConfig);

  return (
    <section className="public-map-section">
      <div className="public-map-copy">
        <span className="eyebrow">Live Work Map · 2.9.2 beta</span>
        <h2>Work near you, proof-ready.</h2>
        <p>Browse open jobs, see what has already been taken, apply for local field work, or post contractor/team jobs that require verified proof.</p>
        <div className="map-stats">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All <strong>{counts.total || 0}</strong></button>
          <button className={filter === 'available' ? 'active' : ''} onClick={() => setFilter('available')}>Available <strong>{counts.available || 0}</strong></button>
          <button className={filter === 'taken' ? 'active' : ''} onClick={() => setFilter('taken')}>Taken <strong>{counts.taken || 0}</strong></button>
          <button className={filter === 'in_person' ? 'active' : ''} onClick={() => setFilter('in_person')}>In-person <strong>{counts.inPerson || 0}</strong></button>
          <button className={filter === 'online' ? 'active' : ''} onClick={() => setFilter('online')}>Online <strong>{counts.online || 0}</strong></button>
        </div>
      </div>
      <div className="public-map-grid">
        <div className="public-map-frame">
          <MapProviderBadge331 config={mapConfig} />
          <iframe title="Promote4.me public work map" src={mapUrl} />
          <div className="map-legend"><span className="dot open"></span> Available <span className="dot taken"></span> Taken <span className="dot online"></span> Online</div>
        </div>
        <div className="public-job-feed">
          {visible.slice(0, 8).map((job) => (
            <article className={'public-job-card ' + (job.taken ? 'taken' : 'open')} key={job.id}>
              <div>
                <strong>{job.title || job.id}</strong>
                <span>{job.trade || job.type || 'Work'} · {job.work_mode === 'online' ? 'Online' : (job.address || 'Local')}</span>
              </div>
              <small>{job.taken ? 'Taken / in progress' : 'Available now'} · {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(job.reward || job.budget_cents || 0) / 100)}</small>
            </article>
          ))}
          {!visible.length && <article className="public-job-card"><strong>No listings yet</strong><span>Post public work orders to fill this map.</span></article>}
        </div>
      </div>
    </section>
  );
}

function AuthCard({ action, onAuthed, onBack }) {
  const [form, setForm] = useState({ companyName: "", fullName: "", email: "", username: action === "login" ? "Test" : "", password: action === "login" ? "TestUser123!" : "", plan: "free" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      onAuthed(await api(action === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="login-card floating-card mobile-login-card" onSubmit={submit}>
      <button type="button" className="text-button" onClick={onBack}>← Back</button>
      <div className="badge"><Lock size={18} /> {action === "login" ? "Log in" : "Create workspace"}</div>{action === "login" && <DemoLoginShortcuts299 setForm={setForm} />}

      {action === "register" && <>
        <input required placeholder="Company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <input required placeholder="Your name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="agency">Agency</option>
        </select>
      </>}

      <input required placeholder="Username or email" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="primary">Continue</button>
      {error && <div className="error-box">{error}</div>}
    </form>
  );
}

function isMoveweightOwner(user) {
  return user?.role === "super_admin" &&
    (user.username === "moveweight" || user.email === "me@moveweight.com" || user.email === "wadeivy11@gmail.com");
}

function HierarchyConsole({ boot, user }) {
  const owner = isMoveweightOwner(user);
  const clients = boot.clients || [];
  const teams = boot.teams || [];
  const users = boot.users || [];
  const members = boot.teamMembers || [];

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>{owner ? "Clients > Companies > Teams > Users" : "Companies > Teams > Users"}</h3>
        <p className="hint">
          {owner
            ? "Only moveweight / Wade sees product-owner hierarchy. Paying customer admins start at Companies."
            : "Admin view for companies, teams, managers, field users, and clients."}
        </p>

        <div className="stat-grid">
          <Stat icon={Building2} label={owner ? "Clients" : "Companies"} value={owner ? clients.length : 1} />
          <Stat icon={Store} label="Companies" value={1} />
          <Stat icon={Users} label="Teams" value={teams.length} />
          <Stat icon={UserPlus} label="Users" value={users.length} />
        </div>

        <div className="hierarchy-tree">
          <article><h4>{owner ? "Client account" : "Company"}</h4><strong>{boot.tenant?.name}</strong><p>{boot.tenant?.plan} plan</p></article>
          <article><h4>Teams</h4>{teams.map((team) => <div className="tree-row" key={team.id}>{team.name}<span>{members.filter((member) => member.team_id === team.id).length} people</span></div>)}</article>
          <article><h4>Users</h4>{users.map((u) => <div className="tree-row" key={u.id}>{u.full_name}<span>{u.role}</span></div>)}</article>
          <article><h4>Clients</h4>{clients.map((client) => <div className="tree-row" key={client.id}>{client.name}<span>{client.address}</span></div>)}</article>
        </div>
      </section>
    </div>
  );
}

function Dashboard({ boot }) {
  const jobs = boot.jobs || [];
  const evidence = jobs.flatMap((job) => job.evidence || []);
  const verified = jobs.filter((job) => ["Verified", "Delivered"].includes(job.status)).length;
  const avgScore = evidence.length ? Math.round(evidence.reduce((sum, item) => sum + (item.score || 0), 0) / evidence.length) : 0;

  return (
    <div className="content-grid">
      <section className="stat-grid">
        <Stat icon={ClipboardList} label="Jobs" value={jobs.length} />
        <Stat icon={Camera} label="Proof uploads" value={evidence.length} />
        <Stat icon={CheckCircle2} label="Verified" value={verified} />
        <Stat icon={Activity} label="Avg confidence" value={`${avgScore}%`} />
      </section>
      <section className="panel wide">
        <h3>Revenue-ready pipeline</h3>
        <div className="pipeline">
          {statuses.map((status) => (
            <article key={status}>
              <strong>{status}</strong>
              {jobs.filter((job) => job.status === status).map((job) => (
                <div className="mini-job" key={job.id}>{job.id}<span>{job.source || job.type}</span></div>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <article className="stat-card"><Icon /><span>{label}</span><strong>{value}</strong></article>;
}

function Jobs({ boot, reload, setNotice }) {
  const sources = boot.deliveryServices?.length ? boot.deliveryServices : deliveryServices;
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    type: "Package Delivery",
    source: sources[0],
    title: "",
    order_number: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
    lat: "",
    lng: "",
    eta: "",
    reward_cents: "1200",
    instructions: "",
    assigned_to: boot.teamMembers?.[0]?.id || "",
    status: "Assigned",
  });

  const jobs = (boot.jobs || []).filter((job) => JSON.stringify(job).toLowerCase().includes(query.toLowerCase()));

  async function create(event) {
    event.preventDefault();
    await api("/api/jobs", { method: "POST", body: JSON.stringify(form) });
    setNotice("Job created");
    reload();
  }

  async function patchStatus(id, status) {
    await api(`/api/jobs/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    reload();
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <div className="table-toolbar">
          <h3>Live jobs & orders</h3>
          <label className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search DoorDash, Uber, clients, jobs" /></label>
        </div>
        <DataTable
          headers={["Job", "Customer", "Service", "Proof", "Status", "Assigned", "Action"]}
          rows={jobs.map((job) => [
            <><strong>{job.id}</strong><br /><small>{job.type} · {job.order_number}</small></>,
            <><strong>{job.customer_name || job.title}</strong><br /><small>{job.address}</small></>,
            <Status status={job.source || "Manual"} />,
            `${job.evidence?.length || 0} uploads · ${bestProof(job)}`,
            <Status status={job.status} />,
            memberName(boot, job.assigned_to),
            <select value={job.status} onChange={(e) => patchStatus(job.id, e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>,
          ])}
        />
      </section>

      <section className="panel">
        <h3><Plus /> Create work order</h3>
        <form className="stack-form" onSubmit={create}>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{jobTypes.map((type) => <option key={type}>{type}</option>)}</select>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{sources.map((service) => <option key={service}>{service}</option>)}</select>
          {["title", "order_number", "customer_name", "customer_email", "customer_phone", "address", "lat", "lng", "eta", "reward_cents"].map((key) => (
            <input key={key} required={["title", "customer_name", "address"].includes(key)} placeholder={key.replaceAll("_", " ")} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
          <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
            {(boot.teamMembers || []).filter((member) => member.status !== "deleted").map((member) => <option value={member.id} key={member.id}>{member.full_name}</option>)}
          </select>
          <textarea placeholder="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          <button className="primary">Create job</button>
        </form>
      </section>
    </div>
  );
}

function EvidenceReview({ boot, reload, setNotice }) {
  const [selected, setSelected] = useState(boot.jobs?.[0]?.id || "");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const job = (boot.jobs || []).find((item) => item.id === selected) || boot.jobs?.[0];

  async function submitProof() {
    if (!file || !job) {
      setNotice("Choose a proof photo first.");
      return;
    }

    setBusy(true);
    try {
      const gps = await getGps();
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("note", note);
      if (gps) {
        fd.append("browser_lat", gps.lat);
        fd.append("browser_lng", gps.lng);
        fd.append("browser_accuracy_meters", gps.accuracy || "");
      }
      await api(`/api/jobs/${job.id}/evidence`, { method: "POST", body: fd });
      setFile(null);
      setNote("");
      setNotice("Evidence uploaded and scored");
      reload();
    } catch (error) {
      setNotice(error.message);
    }
    setBusy(false);
  }

  async function approve(status) {
    await api(`/api/jobs/${job.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    reload();
  }

  return (
    <div className="content-grid mobile-stack proof-workflow">
      <section className="panel wide">
        <h3>Evidence lab</h3>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {(boot.jobs || []).map((item) => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
        </select>

        {job && <>
          <div className="proof-summary">
            <Stat icon={Camera} label="Uploads" value={job.evidence?.length || 0} />
            <Stat icon={CheckCircle2} label="Status" value={job.status} />
            <Stat icon={ShieldCheck} label="Best proof" value={bestProof(job)} />
          </div>
          <EvidenceCards job={job} />
          <div className="button-row">
            <button className="primary" onClick={() => approve(job.type?.includes("Delivery") ? "Delivered" : "Verified")}>Approve</button>
            <button className="secondary danger" onClick={() => approve("Rejected")}>Reject</button>
          </div>
        </>}
      </section>

      <section className="panel upload-panel" id="submit-proof">
        <h3><Upload /> Mobile proof upload</h3>
        <p className="hint">Choose/take a photo, add notes, then tap Submit Proof. This panel is mobile-safe.</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Completion notes" />
        <label className="upload-box">
          <Camera /> {file ? file.name : "Choose or take proof photo"}
          <input type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {file && <div className="file-chip"><span>{file.name}</span><button type="button" onClick={() => setFile(null)}><X size={16} /></button></div>}
        <button className="primary full-width" disabled={busy || !file} onClick={submitProof}>{busy ? "Scanning GPS and uploading..." : "Submit Proof"}</button>
      </section>
    </div>
  );
}

function EvidenceCards({ job }) {
  if (!job.evidence?.length) return <div className="empty-proof">No proof yet.</div>;
  return (
    <div className="evidence-grid">
      {job.evidence.map((evidence) => (
        <article className="evidence-card" key={evidence.id}>
          {evidence.file_url ? <img src={evidence.file_url} alt={evidence.file_name} /> : <div className="photo-placeholder"><Camera /></div>}
          <div>
            <strong>{evidence.file_name}</strong>
            <p>{new Date(evidence.created_at).toLocaleString()}</p>
            <Status status={evidence.verdict} />
            <p>Score {evidence.score}% · Distance {evidence.distance_feet ?? "unknown"} ft</p>
            <p>Browser GPS: {coord(evidence.browser_lat, evidence.browser_lng)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProofMap({ boot }) {
  const points = (boot.jobs || []).filter((job) => job.lat && job.lng);
  const center = points[0] || { lat: 37.0842, lng: -94.5133 };
  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Open proof map</h3>
        <iframe className="map-box" title="OpenStreetMap" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(center.lng)-0.05}%2C${Number(center.lat)-0.05}%2C${Number(center.lng)+0.05}%2C${Number(center.lat)+0.05}&layer=mapnik&marker=${center.lat}%2C${center.lng}`} />
      </section>
      <section className="panel">
        <h3>Locations</h3>
        <ul className="clean-list">
          {points.map((job) => <li key={job.id}><strong>{job.id}</strong><br />{job.source} · {job.address}</li>)}
        </ul>
      </section>
    </div>
  );
}

function WorkforcePanel({ boot }) { const workers=(boot.teamMembers||[]).filter(w=>w.status!=="deleted"); return <div className="content-grid"><section className="panel wide"><h3>Employees + Independent Contractors</h3><p className="hint">Employees can be on Teams. Independent Contractors can be company-approved without a private team and receive API-powered jobs when enabled by admins.</p><div className="card-grid">{workers.map(w=><article className="person-card" key={w.id}><div className="avatar">{w.full_name?.[0]}</div><div><strong>{w.full_name}</strong><p>{w.worker_type||"employee"} · {w.role}</p><small>{w.email} · Company API access: {w.api_access===0?"off":"on"}</small><p>{w.skills_json||w.notes}</p></div></article>)}</div></section><section className="panel"><h3>1099 Contractor System</h3><p>Use Team for employees/private teams. Use Workforce for independent contractors, plumbers, technicians, delivery drivers, and public marketplace workers.</p></section></div>; }
function Team({ boot, reload, setNotice }) {
  const roles = boot.fieldRoleCatalog?.length ? boot.fieldRoleCatalog : fieldRoles;
  const [editing, setEditing] = useState(null);
  const [csv, setCsv] = useState("");
  const [showImport, setShowImport] = useState(false);
  const blank = { team_id: boot.teams?.[0]?.id || "", full_name: "", email: "", phone: "", role: roles[0], pay_rate: "", territory: "", emergency_contact: "", notes: "", status: "active" };
  const [form, setForm] = useState(blank);

  function edit(member) {
    setEditing(member);
    setForm({ ...blank, ...member });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value || ""));
    const photo = event.target.photo?.files?.[0];
    if (photo) fd.append("photo", photo);
    await api(editing ? `/api/team-members/${editing.id}` : "/api/team-members", { method: editing ? "PATCH" : "POST", body: fd });
    setNotice(editing ? "Team member updated" : "Team member added");
    setEditing(null);
    setForm(blank);
    reload();
  }

  async function remove(member) {
    if (!confirm(`Deactivate ${member.full_name}?`)) return;
    await api(`/api/team-members/${member.id}`, { method: "DELETE" });
    setNotice("Team member deactivated");
    reload();
  }

  async function exportCsv() {
    const response = await fetch("/api/team-members/export.csv", {
      headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
    });
    downloadCsv("promote4me-team-members.csv", await response.text());
  }

  async function importCsv() {
    await api("/api/team-members/import", { method: "POST", body: JSON.stringify({ csv, team_id: boot.teams?.[0]?.id }) });
    setNotice("CSV imported");
    setCsv("");
    setShowImport(false);
    reload();
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <div className="table-toolbar">
          <h3>Team CRM</h3>
          <div className="button-row">
            <button className="secondary" onClick={exportCsv}><Download size={16} /> Export CSV</button>
            <button className="primary" onClick={() => setShowImport(!showImport)}><Upload size={16} /> Import CSV</button>
          </div>
        </div>

        {showImport && <div className="import-box">
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="full_name,email,phone,role,pay_rate,territory,emergency_contact,notes,status" />
          <button className="primary" onClick={importCsv}>Import members</button>
        </div>}

        <div className="card-grid">
          {(boot.teamMembers || []).filter((member) => member.status !== "deleted").map((member) => (
            <article className="person-card" key={member.id}>
              <div className="avatar">{member.photo_url ? <img src={member.photo_url} /> : member.full_name?.[0]}</div>
              <div>
                <strong>{member.full_name}</strong>
                <p>{member.role} · {member.territory}</p>
                <small>{member.email} · {member.phone}</small>
                <p>{member.notes}</p>
                <div className="button-row">
                  <button className="secondary" onClick={() => edit(member)}><Edit3 size={15} /> Edit</button>
                  <button className="secondary danger" onClick={() => remove(member)}><Trash2 size={15} /> Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3><UserPlus /> {editing ? "Edit member" : "Add detailed member"}</h3>
        <form className="stack-form" onSubmit={save}>
          {["full_name", "email", "phone", "pay_rate", "territory", "emergency_contact"].map((key) => (
            <input key={key} required={key === "full_name"} placeholder={key.replaceAll("_", " ")} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select>
          <select value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>active</option><option>inactive</option><option>deleted</option></select>
          <input name="photo" type="file" accept="image/*" />
          <textarea placeholder="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="primary">{editing ? "Save changes" : "Add member"}</button>
          {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
        </form>
      </section>
    </div>
  );
}

function Clients({ boot, reload, setNotice }) {
  const blank = { name: "", email: "", phone: "", address: "", lat: "", lng: "", notes: "" };
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  function edit(client) {
    setEditing(client);
    setForm({ ...blank, ...client });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    await api(editing ? `/api/clients/${editing.id}` : "/api/clients", { method: editing ? "PATCH" : "POST", body: JSON.stringify(form) });
    setNotice(editing ? "Client updated" : "Client created");
    setEditing(null);
    setForm(blank);
    reload();
  }

  async function remove(client) {
    if (!confirm(`Delete ${client.name}?`)) return;
    await api(`/api/clients/${client.id}`, { method: "DELETE" });
    setNotice("Client deleted");
    reload();
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Client CRM</h3>
        <div className="card-grid">
          {(boot.clients || []).filter((client) => client.status !== "deleted").map((client) => (
            <article className="client-card" key={client.id}>
              <strong>{client.name}</strong>
              <p>{client.address}</p>
              <small>{client.email} · {client.phone}</small>
              <p>{client.notes}</p>
              <div className="button-row">
                <button className="secondary" onClick={() => edit(client)}><Edit3 size={15} /> Edit</button>
                <button className="secondary danger" onClick={() => remove(client)}><Trash2 size={15} /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3><Building2 /> {editing ? "Edit client" : "Add client"}</h3>
        <form className="stack-form" onSubmit={save}>
          {Object.keys(blank).filter((key) => key !== "notes").map((key) => (
            <input key={key} required={key === "name"} placeholder={key} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
          <textarea placeholder="Rules, notes, requirements" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="primary">{editing ? "Save changes" : "Save client"}</button>
          {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
        </form>
      </section>
    </div>
  );
}

function MarketplacePanel() { const [jobs,setJobs]=useState([]); useEffect(()=>{fetch('/api/public/work-listings').then(r=>r.json()).then(d=>setJobs(d.jobs||[])).catch(()=>{})},[]); return <div className="content-grid"><section className="panel wide"><h3>Public Work Listings</h3><p className="hint">Angi / Field Nation style work board focused on proof-of-work for technicians, plumbers, delivery drivers, flyer teams, and contractors.</p><div className="card-grid">{jobs.length?jobs.map(j=><article className="client-card" key={j.id}><strong>{j.title}</strong><p>{j.trade||j.type} · {j.address}</p><small>{j.worker_classification} · Budget {Number(j.budget_cents||0)/100}</small><button className="primary">Apply</button></article>):<article className="client-card"><strong>No public listings yet</strong><p>Create a job and mark it public to test the marketplace.</p></article>}</div></section></div>; }

function ApiCredentialCenter291({ setNotice }) {
  const [keys, setKeys] = useState([]);
  const [label, setLabel] = useState("WordPress Store");
  const [newKey, setNewKey] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await api("/api/external-keys");
      setKeys(data.keys || []);
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function createKey() {
    setBusy(true);
    try {
      const data = await api("/api/external-keys", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      setNewKey(data.apiKey);
      setNotice("External API key created. Copy it into WordPress now.");
      load();
    } catch (error) {
      setNotice(error.message);
    }
    setBusy(false);
  }

  async function testKey() {
    if (!newKey) return setNotice("Create a key first.");

    const response = await fetch("/api/external/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-P4ME-Key": newKey },
      body: JSON.stringify({
        source: "Promote4.me API Credential Center",
        type: "Package Delivery",
        title: "API Credential Center Test Order",
        order_number: "P4ME-API-TEST",
        customer_name: "API Test Customer",
        address: "302 E 4th St, Joplin, MO",
        status: "Assigned",
        instructions: "This proves the External API Key works.",
      }),
    });

    const data = await response.json();
    setNotice(response.ok ? "API test created Work Order: " + data.job.id : (data.error || "API test failed."));
  }

  async function revoke(id) {
    if (!confirm("Revoke this API key?")) return;
    await api("/api/external-keys/" + id, { method: "DELETE" });
    setNotice("API key revoked.");
    load();
  }

  return (
    <section className="panel wide api-key-center">
      <h3><KeyRound /> API Credential Center</h3>
      <p className="hint">Create the External API Key for WordPress/WordPress, Shopify, delivery services, or custom apps.</p>

      <div className="api-key-actions">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Key label" />
        <button className="primary" disabled={busy} onClick={createKey}>{busy ? "Creating..." : "Create External API Key"}</button>
      </div>

      {newKey && (
        <div className="secret-box">
          <strong>Copy this into WordPress Settings → Promote4.me → External API Key:</strong>
          <code>{newKey}</code>
          <div className="button-row">
            <button className="secondary" onClick={() => navigator.clipboard?.writeText(newKey)}>Copy key</button>
            <button className="primary" onClick={testKey}>Test key now</button>
          </div>
        </div>
      )}

      <div className="key-list">
        {keys.map((key) => (
          <article key={key.id}>
            <strong>{key.label}</strong>
            <span>{key.status} · created {new Date(key.created_at).toLocaleString()} · last used {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "never"}</span>
            {key.status !== "revoked" && <button className="secondary danger" onClick={() => revoke(key.id)}>Revoke</button>}
          </article>
        ))}
        {!keys.length && <article><strong>No API keys yet</strong><span>Create one for your WordPress plugin.</span></article>}
      </div>
    </section>
  );
}

function AddOns({ boot, plans, setNotice }) {
  const sources = boot.deliveryServices?.length ? boot.deliveryServices : deliveryServices;
  const providers = plans.providers?.length ? plans.providers : paymentProviders;

  async function checkout(provider, plan) {
    const data = await api("/api/billing/checkout", { method: "POST", body: JSON.stringify({ provider, plan }) });
    setNotice(`${provider.toUpperCase()} ${data.message || "checkout created"}`);
  }

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>Installable add-ons & delivery networks</h3><div className="download-grid"><a className="download-card" href="/downloads/promote4me-proof-manager-2.9.6.zip" download><strong>Download WordPress/WordPress Plugin ZIP</strong><span>promote4me-proof-manager-2.9.6.zip</span></a><a className="download-card" href="/downloads/promote4me-shopify-addon.html" download><strong>Download Shopify Beta Add-on</strong><span>promote4me-shopify-addon.html</span></a><a className="download-card" href="/downloads/README-addons.html"><strong>Interactive Interactive Interactive Interactive Setup Guide</strong><span>README-addons.html</span></a></div>
    <div className="api-center">
      <strong>API Credential Center</strong>
      <p>Paste provider API keys in Settings/Integrations, then run Test to create a proof-ready job. Delivery providers, Shopify, WordPress, online work, and custom courier profiles are supported.</p>
    </div><div className="download-grid"><a className="download-card" href="/downloads/promote4me-proof-manager-2.9.6.zip" download><strong>Download WordPress/WordPress Plugin ZIP</strong><span>promote4me-proof-manager-2.9.6.zip</span></a><a className="download-card" href="/downloads/promote4me-shopify-addon.html" download><strong>Download Shopify Beta Add-on</strong><span>promote4me-shopify-addon.html</span></a><a className="download-card" href="/downloads/README-addons.html" download><strong>Interactive Interactive Interactive Interactive Setup Guide</strong><span>README-addons.html</span></a></div>
        <div className="integration-grid">
          <Integration icon={ShoppingBag} title="Shopify stores/restaurants" text="Create Promote4.me proof/delivery jobs from Shopify orders, restaurants, retail, and local store fulfillment." />
          <Integration icon={Store} title="WordPress" text="WordPress/WordPress order import, customer tracking links, and proof history." />
          <Integration icon={Map} title="Maps" text="OpenStreetMap by default, plus Google Maps, Mapbox, HERE, and Bing options." />
          <Integration icon={CreditCard} title="Payments" text={`Visible checkout providers: ${providers.join(", ")}`} />
        </div>

        <h3>Delivery service templates</h3>
        <p className="hint">Use these as order sources, fulfillment categories, or proof templates.</p>
        <div className="tag-grid">
          {sources.map((service) => <span className="service-tag" key={service}>{service}</span>)}
        </div>
      </section>

      <section className="panel">
        <h3>Billing integrations</h3>
        {plans.plans.map((plan) => (
          <div className="checkout-row multi-checkout" key={plan.id}>
            <strong>{plan.name}</strong>
            <span>{plan.price}</span>
            <div className="provider-buttons">
              {providers.map((provider) => (
                <button key={provider} className={provider === "stripe" ? "primary" : "secondary"} onClick={() => checkout(provider, plan.id)}>
                  {provider}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Integration({ icon: Icon, title, text }) {
  return <article className="integration-card"><Icon /><strong>{title}</strong><p>{text}</p></article>;
}

function TrainingPanel({ user }) {
  const modules = [
    ["1", "Create a client/location", "Add a customer, store, restaurant, campus board, residence, or job site."],
    ["2", "Create or sync work", "Create a job manually or use Add-ons to simulate DoorDash, Uber Eats, Shopify, WordPress, Roadie, Spark, Flex, Shipt, or Instacart."],
    ["3", "Assign the team", "Assign a driver, flyer promoter, technician, route manager, or contractor."],
    ["4", "Upload proof", "Field members upload a photo from mobile. Promote4.me scores GPS confidence and flags missing GPS."],
    ["5", "Review and approve", "Managers/admins approve, reject, or request better evidence before payment or client sign-off."],
  ];
  return <div className="content-grid"><section className="panel wide"><h3>Interactive Training</h3><p className="hint">Role: {user?.role}. Demo accounts can explore without changing passwords, roles, billing, or API secrets.</p><div className="training-grid">{modules.map(([n,t,d]) => <article key={n}><strong>{n}. {t}</strong><p>{d}</p><label className="check-line"><input type="checkbox"/> Mark complete</label></article>)}</div></section><section className="panel"><h3>Beta checklist</h3><ul className="clean-list"><li>Run one provider demo sync.</li><li>Create a client/location.</li><li>Create one job.</li><li>Upload mobile proof.</li><li>Review GPS confidence.</li></ul></section></div>;
}

function SettingsPanel({ boot, reload, setNotice }) {
  const [form, setForm] = useState({
    name: boot.tenant.name,
    plan: boot.tenant.plan,
    google_maps_api_key: boot.tenant.google_maps_api_key || "",
    accuracy_radius_feet: boot.tenant.accuracy_radius_feet || 350,
    require_gps_for_rewards: !!boot.tenant.require_gps_for_rewards,
    map_provider: boot.tenant.map_provider || "openstreetmap",
    billing_email: boot.tenant.billing_email || "",
  });

  async function save(event) {
    event.preventDefault();
    await api("/api/settings", { method: "PATCH", body: JSON.stringify(form) });
    setNotice("Settings saved");
    reload();
  }

  return (
    <div className="content-grid">
      <section className="panel form-panel">
        <h3><Settings /> Company settings</h3>{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}{boot.tenant?.id === 'tenant-test-demo' && <div className='warning'>Demo settings are read-only for billing, passwords, API secrets, roles, and owner controls.</div>}
        <form className="stack-form" onSubmit={save}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>{["free", "starter", "pro", "agency", "super"].map((plan) => <option key={plan}>{plan}</option>)}</select>
          <select value={form.map_provider} onChange={(e) => setForm({ ...form, map_provider: e.target.value })}>{(boot.mapProviders || []).map((map) => <option value={map.id} key={map.id}>{map.name}</option>)}</select>
          <input placeholder="Map API key" value={form.google_maps_api_key} onChange={(e) => setForm({ ...form, google_maps_api_key: e.target.value })} />
          <input type="number" value={form.accuracy_radius_feet} onChange={(e) => setForm({ ...form, accuracy_radius_feet: e.target.value })} />
          <input placeholder="Billing email" value={form.billing_email} onChange={(e) => setForm({ ...form, billing_email: e.target.value })} />
          <label className="check-line"><input type="checkbox" checked={form.require_gps_for_rewards} onChange={(e) => setForm({ ...form, require_gps_for_rewards: e.target.checked })} /> Require GPS for reward auto-approval</label>
          <button className="primary"><KeyRound /> Save settings</button>
        </form>
      </section>
    </div>
  );
}

function DataTable({ headers, rows }) {
  return <div className="responsive-table"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Status({ status }) {
  return <span className={`status ${String(status || "").toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`}>{status}</span>;
}

function bestProof(job) {
  const evidence = (job.evidence || [])[0];
  return evidence ? `${evidence.score}% ${evidence.verdict}` : "No proof";
}

function memberName(boot, id) {
  return (boot.teamMembers || []).find((member) => member.id === id)?.full_name || "Unassigned";
}

function coord(a, b) {
  return a && b ? `${Number(a).toFixed(5)}, ${Number(b).toFixed(5)}` : "missing";
}

function getGps() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
