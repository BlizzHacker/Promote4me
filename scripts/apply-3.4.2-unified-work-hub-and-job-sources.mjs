import fs from 'fs';

console.log('Applying Promote4.me 3.4.2 unified Work Hub and job source adapters...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '3.4.2';
if (!pkg.scripts.prebuild.includes('apply-3.4.2-unified-work-hub-and-job-sources.mjs')) pkg.scripts.prebuild += ' && node scripts/apply-3.4.2-unified-work-hub-and-job-sources.mjs';
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '3.4.2'").replaceAll('authRequired','requireAuth');

if (!server.includes('function p4me342JobsSourceSchema')) {
  server = server.replace('migrate();', `migrate();
function p4me342JobsSourceSchema(){
  run("CREATE TABLE IF NOT EXISTS job_source_adapters (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, source_id TEXT NOT NULL, source_name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'inactive', access_mode TEXT NOT NULL DEFAULT 'guide', base_url TEXT NOT NULL DEFAULT '', api_key TEXT NOT NULL DEFAULT '', api_secret TEXT NOT NULL DEFAULT '', affiliate_id TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT, updated_at TEXT, UNIQUE(tenant_id, source_id))");
}
p4me342JobsSourceSchema();`);
}

if (!server.includes('P4ME_JOB_SOURCE_GUIDES_342')) {
  const block = `
const P4ME_JOB_SOURCE_GUIDES_342 = [
  {id:'indeed',name:'Indeed',mode:'approved API/feed or publisher feed',fields:['base_url','api_key','affiliate_id'],note:'Use approved API/feed/publisher access when available. Public fallback uses Move Weight Search results inside Promote4.me.'},
  {id:'ziprecruiter',name:'ZipRecruiter',mode:'approved publisher/API feed',fields:['base_url','api_key','affiliate_id'],note:'Use approved ZipRecruiter partner/publisher feed when available. Results can be imported into proof-ready posts.'},
  {id:'linkedin',name:'LinkedIn',mode:'approved API or user-provided public links',fields:['base_url','api_key','api_secret'],note:'Use approved LinkedIn app access or worker/job URLs submitted by users.'},
  {id:'upwork',name:'Upwork',mode:'approved API/export or public links',fields:['base_url','api_key'],note:'Remote work links become digital delivery proof packets with revision/final-accepted states.'},
  {id:'fiverr',name:'Fiverr',mode:'approved API/export or public links',fields:['base_url','api_key'],note:'Gig/order links become digital delivery proof packets.'},
  {id:'searxng',name:'Move Weight Search',mode:'embedded public metasearch',fields:['base_url'],note:'Uses search.moveweight.com as a public discovery fallback and keeps results inside Promote4.me.'}
];
function p4me342Geo(i){ return {lat:37.0842+((i%9)-4)*0.0108,lng:-94.5133+(Math.floor(i/9)-2)*0.0138}; }
async function p4me342SearchSearx(query, location){
  const url='http://search.moveweight.com/search?q='+encodeURIComponent(query+' '+location)+'&format=json';
  try{ const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(3500)}); if(!r.ok) return []; const j=await r.json(); return (j.results||[]).slice(0,12).map((x,i)=>({id:'searxng-'+i,source_id:'searxng',source_name:'Move Weight Search',title:x.title||query,description:x.content||x.pretty_url||'Public web result',external_url:x.url||url,work_mode:i%3===0?'online':'in_person',location,city:String(location).split(',')[0],state:(String(location).split(',')[1]||'').trim(),pay_cents:0,status:'available',...p4me342Geo(i)})); }catch{return []}
}
async function p4me342DirectAdapterSearch(source, query, location, mode){
  if(!source?.base_url || !source?.api_key) return [];
  const sep=source.base_url.includes('?')?'&':'?';
  const url=source.base_url+sep+'q='+encodeURIComponent(query)+'&location='+encodeURIComponent(location)+'&api_key='+encodeURIComponent(source.api_key)+'&affiliate_id='+encodeURIComponent(source.affiliate_id||'');
  try{ const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(5000)}); if(!r.ok) return []; const j=await r.json(); const rows=j.results||j.jobs||j.data||[]; return rows.slice(0,25).map((x,i)=>({id:source.source_id+'-direct-'+i,source_id:source.source_id,source_name:source.source_name,title:x.title||x.name||query,description:x.description||x.snippet||source.source_name+' direct result',external_url:x.url||x.apply_url||x.link||'',work_mode:mode==='online'?'online':(x.remote?'online':'in_person'),location:x.location||location,city:x.city||String(location).split(',')[0],state:x.state||'',pay_cents:Number(x.pay_cents||x.salary_cents||0),status:'available',...p4me342Geo(i+20)})); }catch{return []}
}
app.get('/api/job-sources/guides', requireAuth, (req,res)=>res.json({sources:P4ME_JOB_SOURCE_GUIDES_342}));
app.get('/api/job-sources/configured', requireAuth, (req,res)=>res.json({sources:all('SELECT id,source_id,source_name,status,access_mode,base_url,affiliate_id,notes,updated_at FROM job_source_adapters WHERE tenant_id=? ORDER BY source_name',[req.user.tenant_id])}));
app.post('/api/job-sources/:sourceId/configure', requireAuth, requireRole('super_admin'), (req,res)=>{ const g=P4ME_JOB_SOURCE_GUIDES_342.find(x=>x.id===req.params.sourceId); if(!g) return res.status(404).json({error:'Unknown source.'}); const b=req.body||{}; run('INSERT INTO job_source_adapters (id,tenant_id,source_id,source_name,status,access_mode,base_url,api_key,api_secret,affiliate_id,notes,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(tenant_id,source_id) DO UPDATE SET source_name=excluded.source_name,status=excluded.status,access_mode=excluded.access_mode,base_url=excluded.base_url,api_key=excluded.api_key,api_secret=excluded.api_secret,affiliate_id=excluded.affiliate_id,notes=excluded.notes,updated_at=excluded.updated_at',[publicId('jsrc'),req.user.tenant_id,g.id,g.name,b.status||'active',b.access_mode||g.mode,b.base_url||'',b.api_key||'',b.api_secret||'',b.affiliate_id||'',b.notes||'',now(),now()]); res.json({ok:true,source:row('SELECT id,source_id,source_name,status,access_mode,base_url,affiliate_id,notes FROM job_source_adapters WHERE tenant_id=? AND source_id=?',[req.user.tenant_id,g.id])}); });
app.post('/api/public/work-hub/live-search', async (req,res)=>{ const b=req.body||{}, query=String(b.query||'work'), location=String(b.location||'Joplin, MO'), mode=b.work_mode||'all'; const configured=all('SELECT * FROM job_source_adapters WHERE status=?',['active']); let results=[]; for(const src of configured) results.push(...await p4me342DirectAdapterSearch(src,query,location,mode)); const searx=await p4me342SearchSearx(query,location); const native=all('SELECT * FROM marketplace_posts WHERE visibility=? ORDER BY created_at DESC LIMIT 80',['public']).map((p,i)=>({...p,...p4me342Geo(i+40),source_name:p.source_platform||'Promote4.me',pay_cents:p.budget_cents||0,result_type:'native'})); results=[...native,...results,...searx]; if(mode!=='all') results=results.filter(r=>r.work_mode===mode); res.json({ok:true,query,location,mode,results,source_count:configured.length,searxng_count:searx.length}); });
`;
  server = server.replace("app.post('/api/auth/register'", block + "\napp.post('/api/auth/register'");
}
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');
// Remove duplicate old landing map when the new hub is present.
app = app.replace('<PublicWorkHub341 onSignup={() => setMode("signup")} />\n        <PublicWorkMap />','<PublicWorkHub341 onSignup={() => setMode("signup")} />');
app = app.replace('<PublicWorkHub340 onSignup={() => setAction("register")} />\n      <section className="intent-grid">','<section className="intent-grid">');
app = app.replace('<HomeWorkMapTeaser330 onLogin={() => setAction("login")} />\n      <section className="intent-grid">','<section className="intent-grid">');

if (!app.includes('function JobSourceConsole342')) {
  const comp = String.raw`
function JobSourceConsole342({ setNotice }) {
  const [guides,setGuides]=useState([]),[configured,setConfigured]=useState([]),[form,setForm]=useState({source_id:'indeed',base_url:'',api_key:'',affiliate_id:'',status:'active'});
  async function load(){try{setGuides((await api('/api/job-sources/guides')).sources||[]);setConfigured((await api('/api/job-sources/configured')).sources||[])}catch(e){setNotice?.(e.message)}}
  useEffect(()=>{load()},[]);
  async function save(){try{await api('/api/job-sources/'+form.source_id+'/configure',{method:'POST',body:JSON.stringify(form)});setNotice?.('Job source saved.');load()}catch(e){setNotice?.(e.message)}}
  return <section className="panel wide job-source-console"><h3>Job Source Connectors</h3><p className="hint">Configure approved Indeed, ZipRecruiter, LinkedIn, Upwork, Fiverr, or search-feed sources. Public visitors see embedded results; selected results become Promote4.me proof-ready work.</p><div className="source-config-row"><select value={form.source_id} onChange={e=>setForm({...form,source_id:e.target.value})}>{guides.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select><input placeholder="Approved feed/API endpoint" value={form.base_url} onChange={e=>setForm({...form,base_url:e.target.value})}/><input type="password" placeholder="API key" value={form.api_key} onChange={e=>setForm({...form,api_key:e.target.value})}/><input placeholder="Affiliate/publisher ID" value={form.affiliate_id} onChange={e=>setForm({...form,affiliate_id:e.target.value})}/><button className="primary" onClick={save}>Save connector</button></div><div className="hub341-sources">{guides.map(g=><article key={g.id}><strong>{g.name}</strong><p>{g.note}</p><small>{g.mode}</small></article>)}</div><h4>Configured</h4><div className="tag-grid">{configured.map(s=><span className="service-tag" key={s.id}>{s.source_name} · {s.status}</span>)}</div></section>
}
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', comp+'\nfunction PublicSite({ plans, onAuthed }) {');
}

// Make public hub use live-search endpoint and polished labels if component exists.
app = app.replace("fetch('/api/public/work-hub/search'", "fetch('/api/public/work-hub/live-search'");
app = app.replace('Public Work Hub · v3.4.1','Work Hub · Local + Online');
app = app.replace('Search work, post work, and find local pros on a live map.','Find local jobs, post work, and discover trusted pros on a live map.');

// Add source console inside integrations.
if (!app.includes('<JobSourceConsole342')) {
  app = app.replace('{active === "addons" && <><ApiCredentialCenter291 setNotice={setNotice} /><AddOns {...props} /></>}', '{active === "addons" && <><ApiCredentialCenter291 setNotice={setNotice} /><JobSourceConsole342 setNotice={setNotice}/><AddOns {...props} /></>}');
}

fs.writeFileSync('src/ProductApp.jsx', app);

let css=fs.readFileSync('src/styles.css','utf8');
if(!css.includes('P4ME 3.4.2 UNIFIED WORK HUB')) css+=`\n/* P4ME 3.4.2 UNIFIED WORK HUB */\n.job-source-console{margin-bottom:16px}.source-config-row{display:grid;grid-template-columns:180px 1fr 1fr 180px auto;gap:10px;margin:12px 0}.public-hub-341{margin-top:28px!important}.public-map-section{display:none!important}.hub341-hero{background:radial-gradient(circle at 20% 20%,rgba(34,197,94,.16),transparent 28%),radial-gradient(circle at 90% 10%,rgba(14,165,233,.20),transparent 34%);padding:18px;border-radius:24px;border:1px solid rgba(125,211,252,.18)}.hub341-feed article{transition:.18s transform,.18s border-color}.hub341-feed article:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.5)}@media(max-width:980px){.source-config-row{grid-template-columns:1fr}.public-map-section{display:none!important}}\n`;
fs.writeFileSync('src/styles.css',css);

console.log('Promote4.me 3.4.2 unified Work Hub and job source adapters applied.');
