import fs from 'fs';

console.log('Applying Promote4.me 3.4.6 Work Hub polish and functionality...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.4.6';
for (const script of ['apply-3.4.5-visible-homepage-map.mjs','apply-3.4.6-workhub-polish-functionality.mjs']) {
  if (!pkg.scripts.prebuild.includes(script)) pkg.scripts.prebuild += ' && node scripts/' + script;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.4.6'").replaceAll('authRequired','requireAuth');
if (!server.includes('/api/public/work-hub/save-lead-v346')) {
  const block = `
app.post('/api/public/work-hub/save-lead-v346',(req,res)=>{ const b=req.body||{}, id=publicId('lead'); try { run('INSERT INTO public_buyer_intake (id,name,email,phone,city,state,title,description,category,budget_cents,work_mode,status,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[id,b.name||'',b.email||'',b.phone||'',b.city||'',b.state||'',b.title||'Saved public work lead',b.description||b.source_name||'',b.category||'Public Search Lead',Number(b.budget_cents||b.pay_cents||0),b.work_mode||'in_person','saved',now(),now()]); } catch {} res.json({ok:true,lead_id:id,message:'Lead saved. Create a free account to manage applicants, proof, and dispatch.'}); });
app.get('/api/public/work-hub/top-categories-v346',(req,res)=>res.json({categories:['Hiring now','Delivery driver','Plumber','Electrician','IT field tech','Restaurant','Warehouse','Remote assistant','Customer support','Cleaning'],zips:['64801','64804','64108','65807','10001','60601','75201','33101','85001']}));
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replaceAll('public-hub-345', 'public-hub-346');
app = app.replaceAll('hub345-', 'hub346-');
app = app.replaceAll('P4ME_WORK_HUB_345_VISIBLE', 'P4ME_WORK_HUB_346_VISIBLE');
app = app.replaceAll('Work Hub · live map · v3.4.5', 'Work Hub · live map · v3.4.6');
app = app.replaceAll('P4ME_WORK_HUB_346_VISIBLE — Find 10+ places hiring from any ZIP code.', 'Find local work leads from any ZIP code.');
if (!app.includes('savePublicLead346')) {
  const fn = `
async function savePublicLead346(item,setNotice){try{const r=await fetch('/api/public/work-hub/save-lead-v346',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}).then(r=>r.json());setNotice?.(r.message||'Lead saved')}catch{setNotice?.('Lead save failed')}}
`;
  app = app.replace('function PublicWorkHub345', fn + '\nfunction PublicWorkHub345');
}
app = app.replaceAll("<strong>{r.title}</strong><span>{r.source_name} · {r.location}</span><small>{r.status} · {r.work_mode} · {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((r.pay_cents||0)/100)}</small></article>", "<strong>{r.title}</strong><span>{r.source_name} · {r.location}</span><small>{r.status} · {r.work_mode} · {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((r.pay_cents||0)/100)}</small><div className=\"hub346-actions\"><a href={r.external_url} target=\"_blank\">Source</a><button onClick={(e)=>{e.stopPropagation();savePublicLead346(r,setNote)}}>Save lead</button></div></article>");
fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css','utf8');
if (!css.includes('P4ME 3.4.6 WORK HUB POLISH')) css += `
/* P4ME 3.4.6 WORK HUB POLISH */
.public-hub-346{display:grid!important;gap:18px;margin:22px 0 26px;padding:18px;border:1px solid rgba(125,211,252,.22);border-radius:30px;background:linear-gradient(145deg,rgba(5,18,32,.98),rgba(8,43,48,.96));box-shadow:0 22px 90px rgba(0,0,0,.32);max-width:100%;overflow:hidden}.hub346-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:18px;border-radius:24px;border:1px solid rgba(125,211,252,.18);background:radial-gradient(circle at 18% 12%,rgba(34,197,94,.22),transparent 26%),radial-gradient(circle at 86% 18%,rgba(14,165,233,.24),transparent 32%),rgba(255,255,255,.035)}.hub346-hero h2{font-size:34px;line-height:1.02;color:#fff;margin:7px 0;max-width:900px}.hub346-hero p{max-width:780px;color:#cfe4f7}.hub346-search{display:grid;grid-template-columns:minmax(180px,1fr) 180px 130px 130px;gap:10px}.hub346-search input,.hub346-search select{min-width:0}.hub346-tabs{display:flex;gap:8px;overflow:auto;padding-bottom:2px}.hub346-tabs button{white-space:nowrap;border:1px solid rgba(125,211,252,.24);background:#102033;color:#eaf3ff;border-radius:999px;padding:10px 14px}.hub346-tabs button.active{background:#0ea5e9;color:#fff}.hub346-layout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:14px;align-items:stretch}.hub346-map{position:relative;min-height:460px;border-radius:24px;overflow:hidden;border:1px solid rgba(125,211,252,.26);background:#081827}.hub346-map iframe{display:block;width:100%;height:100%;min-height:460px;border:0}.hub346-feed{display:grid;gap:8px;max-height:460px;overflow:auto;padding-right:4px}.hub346-feed article{display:grid;gap:6px;background:rgba(255,255,255,.052);border:1px solid rgba(125,211,252,.14);border-radius:16px;padding:12px;cursor:pointer;transition:.16s transform,.16s border-color,.16s background}.hub346-feed article:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.48)}.hub346-feed article.active{border-color:#22c55e;background:rgba(34,197,94,.13)}.hub346-feed span,.hub346-feed a{color:#7dd3fc}.hub346-feed small{color:#bdd4ea}.hub346-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}.hub346-actions a,.hub346-actions button{font-size:12px;border:1px solid rgba(125,211,252,.22);background:#0b1b2a;color:#dff4ff;border-radius:999px;padding:6px 9px;text-decoration:none}.hub346-actions button{cursor:pointer}.hub346-form{display:grid;grid-template-columns:1fr;gap:10px}.public-hub-346 .map-bubbles{position:absolute;inset:0;pointer-events:none}.public-hub-346 .map-bubbles button{position:absolute;pointer-events:auto;border:0;border-radius:999px;background:#22c55e;color:#05200e;width:32px;height:32px;box-shadow:0 8px 24px rgba(0,0,0,.28);font-size:15px}.public-hub-346 .map-bubbles button.active{background:#0ea5e9;color:#fff;transform:scale(1.16)}.public-hub-344,.public-hub-345{display:none!important}@media(max-width:980px){.public-hub-346{padding:14px;margin:14px 0}.hub346-hero,.hub346-search,.hub346-layout{grid-template-columns:1fr}.hub346-hero h2{font-size:27px}.hub346-map,.hub346-map iframe{min-height:330px}.hub346-feed{max-height:360px}.hub346-search{gap:8px}.hub346-actions a,.hub346-actions button{width:100%;text-align:center}}
`;
fs.writeFileSync('src/styles.css', css);
console.log('Promote4.me 3.4.6 Work Hub polish and functionality applied');
