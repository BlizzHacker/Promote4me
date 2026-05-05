import fs from 'fs';

console.log('Applying Promote4.me 3.5.2 real ZIP, marketplace, refresh, and enter key fixes...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.5.2';
for (const script of ['apply-3.5.0-workhub-completion.mjs','apply-3.5.1-functionality-completion.mjs','apply-3.5.2-real-zip-marketplace-refresh.mjs']) {
  if (!pkg.scripts.prebuild.includes(script)) pkg.scripts.prebuild += ' && node scripts/' + script;
}
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.5.2'").replaceAll('authRequired','requireAuth');

if (!server.includes('/api/public/work-hub/search-v352')) {
  const block = `
async function p4me352Center(location='64801'){
  const s=String(location||'64801').trim(); const zip=(s.match(/\\d{5}/)||[])[0];
  const cache={64801:{city:'Joplin',state:'MO',lat:37.0842,lng:-94.5133},74354:{city:'Miami',state:'OK',lat:36.8745,lng:-94.8775},78240:{city:'San Antonio',state:'TX',lat:29.5233,lng:-98.6039},90210:{city:'Beverly Hills',state:'CA',lat:34.0901,lng:-118.4065},10001:{city:'New York',state:'NY',lat:40.7506,lng:-73.9972},60601:{city:'Chicago',state:'IL',lat:41.8864,lng:-87.6186},75201:{city:'Dallas',state:'TX',lat:32.7876,lng:-96.7994},33101:{city:'Miami',state:'FL',lat:25.7751,lng:-80.1947},85001:{city:'Phoenix',state:'AZ',lat:33.4484,lng:-112.0740}};
  if(zip){
    try{ const r=await fetch('https://api.zippopotam.us/us/'+zip,{signal:AbortSignal.timeout(3500)}); if(r.ok){ const j=await r.json(); const p=j.places?.[0]; if(p) return {city:p['place name'],state:p['state abbreviation'],lat:Number(p.latitude),lng:Number(p.longitude),zip,label:zip,source:'zippopotam'}; } }catch{}
    if(cache[zip]) return {...cache[zip],zip,label:zip,source:'cache'};
  }
  try{ const key=(p4me331MapConfig?p4me331MapConfig('tenant-moveweight')?.google_embed_key:'')||process.env.GOOGLE_MAPS_API_KEY||process.env.P4ME_GOOGLE_MAPS_API_KEY||''; if(key){ const r=await fetch('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(s)+'&components=country:US&key='+encodeURIComponent(key),{signal:AbortSignal.timeout(4500)}); const j=await r.json(); const g=j.results?.[0]; if(g){ let city='',state='',z=zip||''; for(const c of g.address_components||[]){ if(c.types.includes('locality'))city=c.long_name; if(c.types.includes('administrative_area_level_1'))state=c.short_name; if(c.types.includes('postal_code'))z=c.long_name; } return {city:city||g.formatted_address.split(',')[0],state,lat:g.geometry.location.lat,lng:g.geometry.location.lng,zip:z||zip||s,label:s,source:'google-geocode'}; } } }catch{}
  return {...cache[64801],zip:zip||'64801',label:s,source:'fallback'};
}
function p4me352Around(c,i){const a=(i*41%360)*Math.PI/180,r=.006+(Math.floor(i/8)*.012);return{lat:c.lat+Math.cos(a)*r,lng:c.lng+Math.sin(a)*r}}
function p4me352Source(url=''){const u=String(url).toLowerCase();if(u.includes('indeed.'))return{id:'indeed',name:'Indeed'};if(u.includes('ziprecruiter.'))return{id:'ziprecruiter',name:'ZipRecruiter'};if(u.includes('linkedin.'))return{id:'linkedin',name:'LinkedIn Jobs'};if(u.includes('upwork.'))return{id:'upwork',name:'Upwork'};if(u.includes('fiverr.'))return{id:'fiverr',name:'Fiverr'};return{id:'public',name:'Public Search'};}
function p4me352CleanTitle(t=''){return String(t||'').replace(/\\s[-|]\\s(Indeed|ZipRecruiter|LinkedIn).*$/i,'').trim()||'Work opportunity'}
function p4me352Company(title='',snippet=''){const text=(title+' '+snippet).replace(/jobs? in .*/i,'').replace(/employment in .*/i,'').replace(/now hiring.*/i,''); const patterns=[/at\\s+([A-Z][A-Za-z0-9&.' -]{2,48})/i,/by\\s+([A-Z][A-Za-z0-9&.' -]{2,48})/i,/([A-Z][A-Za-z0-9&.' -]{2,48})\\s+(?:is hiring|careers|jobs)/i,/Easily apply\\.\\s*([A-Z][A-Za-z0-9&.' -]{2,48})/i]; for(const p of patterns){const m=text.match(p); if(m?.[1]) return m[1].replace(/\\s+(jobs|careers|hiring).*$/i,'').trim()} return '';}
function p4me352BadDemo(p){const s=JSON.stringify(p||{}).toLowerCase();return ['imported test opportunity','fix sink leak','promote4.me free post','csv / manual import','email parser','field nation imported','angi / angies list imported','hellotech style workflows imported','fiverr imported','upwork imported'].some(x=>s.includes(x));}
async function p4me352Search(q,c,source='all'){
 const terms={all:'(site:indeed.com OR site:ziprecruiter.com OR site:linkedin.com/jobs OR site:jobs2careers.com OR site:simplyhired.com OR site:snagajob.com)',indeed:'site:indeed.com',ziprecruiter:'site:ziprecruiter.com',linkedin:'site:linkedin.com/jobs',public:'(site:jobs2careers.com OR site:simplyhired.com OR site:snagajob.com OR site:craigslist.org)',remote:'(site:upwork.com OR site:fiverr.com)'};
 const where=[c.city,c.state,c.zip].filter(Boolean).join(' '); const url='http://search.moveweight.com/search?q='+encodeURIComponent([q,'jobs hiring',where,terms[source]||terms.all].join(' '))+'&format=json';
 try{ const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(6000)}); if(!r.ok)return[]; const j=await r.json(); return (j.results||[]).slice(0,24).map((x,i)=>{ const src=p4me352Source(x.url); const title=p4me352CleanTitle(x.title||q); const desc=String(x.content||x.pretty_url||'Public job search result').replace(/Missing:.*$/,'').slice(0,280); const company=p4me352Company(title,desc); return {id:'live352-'+i,title,company,description:desc,source_name:src.name,source_id:src.id,source_type:'public_discovery',external_url:x.url||url,company_research_url:company?'https://www.google.com/search?q='+encodeURIComponent(company+' reviews careers '+c.city+' '+c.state):'',share_url:'https://promote4.me/?workhub=1&q='+encodeURIComponent(q)+'&zip='+encodeURIComponent(c.zip)+'&source='+encodeURIComponent(source),pay_cents:0,status:'discovered',work_mode:(src.id==='upwork'||src.id==='fiverr'||i%6===0)?'online':'in_person',...p4me352Around(c,i),location:[c.city,c.state,c.zip].filter(Boolean).join(', ').replace(', '+c.zip,' '+c.zip),city:c.city,state:c.state,zip:c.zip}; }); }catch{return[]}
}
app.post('/api/public/work-hub/search-v352', async (req,res)=>{const b=req.body||{},query=String(b.query||'hiring').trim()||'hiring',source=String(b.source||'all'),mode=b.work_mode||'all',demo=!!b.demo,c=await p4me352Center(b.location||b.zip||'64801');let live=await p4me352Search(query,c,source);let native=all('SELECT * FROM marketplace_posts WHERE visibility=? ORDER BY created_at DESC LIMIT 40',['public']).filter(p=>demo||!p4me352BadDemo(p)).map((p,i)=>({...p,...p4me352Around(c,i+live.length),description:p.description||p.instructions||'Native Promote4.me public lead.',source_name:p.source_platform||'Promote4.me',source_id:'promote4me',source_type:'native',pay_cents:p.budget_cents||0,company_research_url:(p.customer_name||p.title)?'https://www.google.com/search?q='+encodeURIComponent((p.customer_name||p.title)+' reviews careers'):'',share_url:'https://promote4.me/?lead='+encodeURIComponent(p.id),location:[c.city,c.state,c.zip].filter(Boolean).join(', ').replace(', '+c.zip,' '+c.zip),city:c.city,state:c.state,zip:c.zip}));let results=[...live,...native];if(mode!=='all')results=results.filter(r=>r.work_mode===mode);if(source!=='all')results=results.filter(r=>r.source_id===source||(source==='remote'&&['upwork','fiverr'].includes(r.source_id)));res.json({ok:true,version:'3.5.2',query,zip:c.zip,center:c,results:results.slice(0,30),source,mode,map:p4me331MapConfig?p4me331MapConfig('tenant-moveweight'):{provider:'openstreetmap'}})});
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
app = app.replace('import React, { useEffect, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";');
app = app.replaceAll('Authentik / Social Login','Social Login');
app = app.replaceAll('Promote4.me v3.2.0','Promote4.me v3.5.2');
app = app.replace('<button className="secondary" onClick={reload}><RefreshCcw size={16} /> Refresh</button>', '<div className="topbar-actions"><button className="secondary" onClick={() => setActive("dashboard")}>Home</button><button className="secondary" onClick={() => { window.dispatchEvent(new Event("p4me-workhub-refresh")); reload(); }}><RefreshCcw size={16} /> Refresh</button></div>');
app = app.replace('setSession({ token: data.token, user: data.user });', 'setSession({ token: data.token, user: data.user });\n    if (localStorage.getItem("p4me-pending-lead")) { setActive("marketplace"); setNotice("Saved lead loaded. Convert it inside Marketplace."); }');
app = app.replace('{active === "marketplace" && <MarketplacePanel />}', '{active === "marketplace" && <MarketplacePanel352 setNotice={setNotice} />}');
if (!app.includes('function MarketplacePanel352')) {
  const mp = String.raw`
function MarketplacePanel352({setNotice}){const[pending,setPending]=useState(null),[leads,setLeads]=useState([]);async function load(){try{setPending(JSON.parse(localStorage.getItem('p4me-pending-lead')||'null'));const d=await fetch('/api/public/work-hub/saved-leads-v351').then(r=>r.json());setLeads(d.leads||[])}catch{}}useEffect(()=>{load();window.addEventListener('p4me-workhub-refresh',load);return()=>window.removeEventListener('p4me-workhub-refresh',load)},[]);async function convert(lead){try{const d=await api('/api/work-hub/convert-saved-lead-v351',{method:'POST',body:JSON.stringify({lead})});localStorage.removeItem('p4me-pending-lead');setPending(null);setNotice?.(d.message+' '+d.job_id)}catch(e){setNotice?.(e.message)}}return <div className="content-grid"><section className="panel wide"><h3>Marketplace Work Hub</h3><p className="hint">Search public job leads, save opportunities, then convert them into Promote4.me work orders.</p>{pending&&<article className="pending-lead-card"><h3>Saved lead ready</h3><strong>{pending.title}</strong><p>{pending.description}</p><small>{pending.source_name} · {pending.location}</small><div className="button-row"><button className="primary" onClick={()=>convert(pending)}>Convert to work order</button><button className="secondary" onClick={()=>{localStorage.removeItem('p4me-pending-lead');setPending(null)}}>Clear</button></div></article>}<PublicWorkHub350 onSignup={()=>setNotice?.('Already signed in. Save or convert leads here.')} /></section><section className="panel"><h3>Saved leads</h3><div className="saved-leads-list">{leads.map(l=><article key={l.id}><strong>{l.title}</strong><span>{l.source_name} · {l.location}</span><button className="secondary" onClick={()=>convert(l)}>Convert</button></article>)}{!leads.length&&<p className="hint">No saved leads yet.</p>}</div></section></div>}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', mp+'\nfunction PublicSite({ plans, onAuthed }) {');
}
app = app.replaceAll('/api/public/work-hub/search-v350','/api/public/work-hub/search-v352');
app = app.replaceAll('Work Hub · v3.5.0','Work Hub · v3.5.2');
app = app.replace('<div className="hub350-search"><input value={q.query}', '<form className="hub350-search" onSubmit={search}><input value={q.query}');
app = app.replace('<button className="primary" onClick={search}>{loading?\'Searching...\':\'Search\'}</button></div><div className="hub350-tabs">', '<button type="submit" className="primary">{loading?\'Searching...\':\'Search\'}</button></form><div className="hub350-tabs">');
app = app.replace('async function search(){setLoading(true);try{const d=await fetch(\'/api/public/work-hub/search-v352\'', 'async function search(event){event?.preventDefault?.();setLoading(true);try{const d=await fetch(\'/api/public/work-hub/search-v352\'');
app = app.replace('useEffect(()=>{search()},[]);return <section className="public-hub-350">', 'useEffect(()=>{search();const h=()=>search();window.addEventListener("p4me-workhub-refresh",h);return()=>window.removeEventListener("p4me-workhub-refresh",h)},[]);return <section className="public-hub-350">');
app = app.replace('setNote(d.message||\'Lead saved\')', 'localStorage.setItem("p4me-pending-lead",JSON.stringify({...item,lead_id:d.lead_id}));setNote((d.message||\'Lead saved\')+\' Use Log in to convert it.\')');
fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css','utf8');
if (!css.includes('P4ME 3.5.2 REAL FUNCTION FIXES')) css += `
/* P4ME 3.5.2 REAL FUNCTION FIXES */
.topbar-actions{display:flex;gap:10px;align-items:center}.pending-lead-card{display:grid;gap:8px;margin:12px 0;background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.34);border-radius:18px;padding:14px}.saved-leads-list{display:grid;gap:10px}.saved-leads-list article{display:grid;gap:6px;background:rgba(255,255,255,.045);border:1px solid rgba(125,211,252,.14);border-radius:14px;padding:12px}.saved-leads-list span{color:#7dd3fc}@media(max-width:760px){.topbar-actions{width:100%;justify-content:flex-end}.topbar-actions .secondary{padding:10px 12px}.hub350-search{grid-template-columns:1fr!important}}
`;
fs.writeFileSync('src/styles.css', css);
console.log('Promote4.me 3.5.2 real ZIP, marketplace, refresh, and enter key fixes applied.');
