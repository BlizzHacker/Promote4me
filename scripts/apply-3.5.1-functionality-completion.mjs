import fs from 'fs';

console.log('Applying Promote4.me 3.5.1 functionality completion...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.5.1';
for (const script of ['apply-3.5.0-workhub-completion.mjs','apply-3.5.1-functionality-completion.mjs']) {
  if (!pkg.scripts.prebuild.includes(script)) pkg.scripts.prebuild += ' && node scripts/' + script;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.5.1'").replaceAll('authRequired','requireAuth');

if (!server.includes('/api/public/work-hub/saved-leads-v351')) {
  const block = `
app.get('/api/public/work-hub/saved-leads-v351',(req,res)=>{try{res.json({ok:true,leads:all('SELECT * FROM public_saved_leads ORDER BY created_at DESC LIMIT 25')})}catch{res.json({ok:true,leads:[]})}});
app.post('/api/work-hub/convert-saved-lead-v351', requireAuth, (req,res)=>{const b=req.body||{}, lead=b.lead||{}; const id=publicId('P4-WORK'); run('INSERT INTO jobs (id, tenant_id, type, source, title, order_number, customer_name, customer_email, customer_phone, address, lat, lng, eta, reward_cents, instructions, assigned_to, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[id,req.user.tenant_id,lead.work_mode==='online'?'Online Work Lead':'Public Work Lead',lead.source_name||'Work Hub',lead.title||'Saved lead',lead.source_url||lead.external_url||id,lead.company||lead.source_name||'Public Lead','','',lead.location||'',lead.lat||'',lead.lng||'', '', lead.pay_cents||lead.budget_cents||0, lead.description||'Converted from Work Hub saved lead.', '', 'Assigned', req.user.id, now(), now()]); res.json({ok:true,job_id:id,message:'Saved lead converted into a Promote4.me work order.'})});
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}

// Improve v350 company extraction/location wording without re-adding risky scraping.
server = server.replace("const P4ME350_ZIPS={64801:", "const P4ME350_ZIPS={90001:{city:'Los Angeles',state:'CA',lat:33.9731,lng:-118.2479},90024:{city:'Los Angeles',state:'CA',lat:34.0635,lng:-118.4455},90046:{city:'Los Angeles',state:'CA',lat:34.1040,lng:-118.3490},64801:");
server = server.replace("function p4me350Company(title='',snippet=''){const text=(title+' '+snippet).replace(/jobs? in .*/i,'').replace(/employment in .*/i,'').replace(/now hiring.*/i,'').trim();const m=text.match(/(?:at|by)\\s+([A-Z][A-Za-z0-9&.' -]{2,40})/);return m?.[1]?.trim()||''}", "function p4me350Company(title='',snippet=''){const text=(title+' '+snippet).replace(/jobs? in .*/i,'').replace(/employment in .*/i,'').replace(/now hiring.*/i,'').trim(); const patterns=[/at\\s+([A-Z][A-Za-z0-9&.' -]{2,48})/i,/by\\s+([A-Z][A-Za-z0-9&.' -]{2,48})/i,/([A-Z][A-Za-z0-9&.' -]{2,48})\\s+is hiring/i,/Easily apply\\.\\s*([A-Z][A-Za-z0-9&.' -]{2,48})/i,/\\b([A-Z][A-Za-z0-9&.' -]{2,48})\\s+·/]; for(const p of patterns){const m=text.match(p); if(m?.[1]) return m[1].replace(/\\s+(jobs|careers|hiring).*$/i,'').trim()} return ''}");
server = server.replace("company_research_url:'https://www.google.com/search?q='+encodeURIComponent((company||title)+' company reviews jobs '+c.city+' '+c.state)", "company_research_url: company ? 'https://www.google.com/search?q='+encodeURIComponent(company+' reviews careers '+c.city+' '+c.state) : ''");
server = server.replace("company_research_url:'https://www.google.com/search?q='+encodeURIComponent((p.customer_name||p.title||'company')+' reviews')", "company_research_url:(p.customer_name||p.title)?'https://www.google.com/search?q='+encodeURIComponent((p.customer_name||p.title)+' reviews careers'):''");

fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replace('import React, { useEffect, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";');
app = app.replaceAll('Authentik / Social Login', 'Social Login');
app = app.replaceAll('Promote4.me v3.2.0', 'Promote4.me v3.5.1');

// After login from a saved lead, go to Marketplace instead of trapping user away from home/workflow.
app = app.replace("setSession({ token: data.token, user: data.user });", "setSession({ token: data.token, user: data.user });\n    if (localStorage.getItem('p4me-pending-lead')) { setActive('marketplace'); setNotice('Saved lead loaded. Review it in Marketplace and convert it to a work order.'); }");

// Make Marketplace real instead of blank.
app = app.replace('{active === "marketplace" && <MarketplacePanel />}', '{active === "marketplace" && <MarketplacePanel351 setNotice={setNotice} />}');

if (!app.includes('function MarketplacePanel351')) {
  const marketplace = String.raw`
function MarketplacePanel351({setNotice}){const[pending,setPending]=useState(null),[leads,setLeads]=useState([]);async function load(){try{setPending(JSON.parse(localStorage.getItem('p4me-pending-lead')||'null'));const d=await fetch('/api/public/work-hub/saved-leads-v351').then(r=>r.json());setLeads(d.leads||[])}catch{}}useEffect(()=>{load()},[]);async function convert(lead){try{const d=await api('/api/work-hub/convert-saved-lead-v351',{method:'POST',body:JSON.stringify({lead})});localStorage.removeItem('p4me-pending-lead');setPending(null);setNotice?.(d.message+' '+d.job_id)}catch(e){setNotice?.(e.message)}}return <div className="content-grid"><section className="panel wide"><h3>Marketplace Work Hub</h3><p className="hint">Search public job leads, save promising opportunities, then convert them into Promote4.me work orders.</p><PublicWorkHub350 onSignup={()=>setNotice?.('You are already signed in. Use Save lead or Convert to work order.')} />{pending&&<article className="pending-lead-card"><h3>Saved lead ready</h3><strong>{pending.title}</strong><p>{pending.description}</p><small>{pending.source_name} · {pending.location}</small><div className="button-row"><button className="primary" onClick={()=>convert(pending)}>Convert to work order</button><button className="secondary" onClick={()=>{localStorage.removeItem('p4me-pending-lead');setPending(null)}}>Clear saved lead</button></div></article>}</section><section className="panel"><h3>Recently saved public leads</h3><div className="saved-leads-list">{leads.map(l=><article key={l.id}><strong>{l.title}</strong><span>{l.source_name} · {l.location}</span><button className="secondary" onClick={()=>convert(l)}>Convert</button></article>)}</div></section></div>}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', marketplace+'\nfunction PublicSite({ plans, onAuthed }) {');
}

// Upgrade existing PublicWorkHub350 cards: no bad research button, real save persistence, better share.
app = app.replace("async function saveLead(item){try{const d=await fetch('/api/public/work-hub/save-lead-v350',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}).then(r=>r.json());setNote(d.message||'Lead saved')}catch{setNote('Save failed')}}", "async function saveLead(item){try{const d=await fetch('/api/public/work-hub/save-lead-v350',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)}).then(r=>r.json());localStorage.setItem('p4me-pending-lead',JSON.stringify({...item,lead_id:d.lead_id}));setNote((d.message||'Lead saved')+' Use Log in to convert it.')}catch{setNote('Save failed')}}");
app = app.replace("function share(item){const u=item.share_url||location.href;if(navigator.share)navigator.share({title:item.title,text:item.description,url:u}).catch(()=>{});else navigator.clipboard?.writeText(u).then(()=>setNote('Share link copied'))}", "function share(item){const u=item.share_url||location.origin+'/?workhub=1';if(navigator.share)navigator.share({title:item.title,text:item.description||'Promote4.me work lead',url:u}).catch(()=>{});else navigator.clipboard?.writeText(u).then(()=>setNote('Share link copied: '+u))}");
app = app.replace("<a href={r.company_research_url} target=\"_blank\">Research company</a><button onClick={(e)=>{e.stopPropagation();share(r)}}>Share</button>", "{r.company_research_url ? <a href={r.company_research_url} target=\"_blank\">Research company</a> : <span className=\"muted-pill\">No company detected</span>}<button onClick={(e)=>{e.stopPropagation();share(r)}}>Share</button>");

// Load shared query params into WorkHub defaults.
app = app.replace("useEffect(()=>{search()},[]);return <section className=\"public-hub-350\">", "useEffect(()=>{const p=new URLSearchParams(location.search); const zip=p.get('zip'), sq=p.get('q'), src=p.get('source'); if(zip||sq||src){const next={...q,location:zip||q.location,query:sq||q.query,source:src||q.source}; setQ(next); setTimeout(()=>search(),0);} else search()},[]);return <section className=\"public-hub-350\">");

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css','utf8');
if (!css.includes('P4ME 3.5.1 FUNCTION COMPLETION')) css += `
/* P4ME 3.5.1 FUNCTION COMPLETION */
.muted-pill{font-size:12px;border:1px solid rgba(125,211,252,.14);background:rgba(255,255,255,.035);color:#93a9bd;border-radius:999px;padding:6px 9px}.pending-lead-card{display:grid;gap:8px;margin-top:14px;background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.34);border-radius:18px;padding:14px}.saved-leads-list{display:grid;gap:10px}.saved-leads-list article{display:grid;gap:6px;background:rgba(255,255,255,.045);border:1px solid rgba(125,211,252,.14);border-radius:14px;padding:12px}.saved-leads-list span{color:#7dd3fc}.hub350-actions .muted-pill{display:inline-flex;align-items:center}.topbar .secondary{min-width:110px}
`;
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 3.5.1 functionality completion applied.');
