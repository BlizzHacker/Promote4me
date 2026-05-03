import fs from 'fs';

const has = (s, x) => s.includes(x);
console.log('Applying Promote4.me 2.9.9 mobile workflow polish...');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '2.9.9';
if (!pkg.scripts.prebuild.includes('apply-2.9.9-mobile-workflow-polish.mjs')) pkg.scripts.prebuild += ' && node scripts/apply-2.9.9-mobile-workflow-polish.mjs';
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2)+'\n');

let server = fs.readFileSync('server/index.js','utf8');
server = server.replace(/version: '[^']+'/g, "version: '2.9.9'");
fs.writeFileSync('server/index.js', server);

let app = fs.readFileSync('src/ProductApp.jsx','utf8');

if (!has(app, 'function MobileQuickActions299')) {
  const components = `
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
`;
  app = app.replace('function PublicSite({ plans, onAuthed }) {', components + '\nfunction PublicSite({ plans, onAuthed }) {');
}

if (!has(app, '<MobileQuickActions299')) {
  app = app.replace('<div className="app-shell"><MobileTopBar297 active={active} setActive={setActive} user={boot?.user} />', '<div className="app-shell"><MobileTopBar297 active={active} setActive={setActive} user={boot?.user} /><MobileQuickActions299 active={active} setActive={setActive} user={session.user} jobs={boot.jobs || []} />');
  app = app.replace('<div className="app-shell">', '<div className="app-shell"><MobileQuickActions299 active={active} setActive={setActive} user={session.user} jobs={boot.jobs || []} />');
}

if (!has(app, '<DemoLoginShortcuts299')) {
  app = app.replace('<div className="badge"><Lock size={18} /> {action === "login" ? "Log in" : "Create workspace"}</div>', '<div className="badge"><Lock size={18} /> {action === "login" ? "Log in" : "Create workspace"}</div>{action === "login" && <DemoLoginShortcuts299 setForm={setForm} />}');
}

// Remove repeated TrainingPanel render spam from older generated patches.
app = app.replace(/(\s*\{active === "training" && <TrainingPanel user=\{session\.user\} \/>\}){2,}/g, '\n        {active === "training" && <TrainingPanel user={session.user} />}');

// Add page-class hooks for mobile section behavior.
app = app.replace('<main className="workspace">', '<main className={`workspace page-${active}`}>');
app = app.replace('<form className="login-card floating-card" onSubmit={submit}>', '<form className="login-card floating-card mobile-login-card" onSubmit={submit}>');
app = app.replace('<div className="content-grid mobile-stack">', '<div className="content-grid mobile-stack proof-workflow">');
app = app.replace('<section className="panel upload-panel">', '<section className="panel upload-panel" id="submit-proof">');

fs.writeFileSync('src/ProductApp.jsx', app);

let css = fs.readFileSync('src/styles.css','utf8');
if (!has(css, 'P4ME 2.9.9 MOBILE WORKFLOW')) css += `
/* P4ME 2.9.9 MOBILE WORKFLOW */
.mobile-section-tabs,.mobile-proof-fab,.mobile-role-chip{display:none}.page-section-tabs{display:flex;gap:8px;overflow:auto;margin:0 0 14px}.page-section-tabs button{white-space:nowrap;border:1px solid rgba(125,211,252,.22);background:#102033;color:#dff7ff;border-radius:999px;padding:8px 12px}.page-section-tabs button.active{background:#0ea5e9;color:#fff}.mobile-demo-shortcuts{display:grid;gap:8px;background:rgba(14,165,233,.08);border:1px solid rgba(125,211,252,.22);border-radius:16px;padding:12px;margin:8px 0}.mobile-demo-shortcuts p{margin:0;color:#bdd4ea;font-size:13px}.mobile-demo-shortcuts button{border:1px solid rgba(125,211,252,.25);background:#102033;color:#eaf3ff;border-radius:12px;padding:10px}.mobile-login-card{scroll-margin-top:80px}.proof-workflow .upload-panel{box-shadow:0 14px 40px rgba(14,165,233,.10)}.provider-card,.integration-card,.price-card,.client-card,.stat-card{touch-action:manipulation}
@media(max-width:860px){.marketing{padding:12px!important}.marketing-hero{padding:18px!important;border-radius:24px}.marketing-hero h1{font-size:34px!important;line-height:1.03}.hero-actions{display:grid!important;grid-template-columns:1fr!important}.hero-actions button{width:100%;min-height:48px}.intent-grid,.demo-login-grid,.pricing-grid{grid-template-columns:1fr!important}.floating-card{position:relative!important;inset:auto!important;width:auto!important;margin:14px 0!important}.mobile-login-card{background:#07111f!important;border:1px solid rgba(125,211,252,.22)!important;border-radius:22px!important;padding:16px!important}.mobile-login-card input,.mobile-login-card select,.mobile-login-card button{min-height:48px}.workspace{padding:14px!important;padding-bottom:104px!important}.topbar{display:none!important}.mobile-section-tabs{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:90;background:#07111f;border-top:1px solid rgba(125,211,252,.20);padding:8px 8px calc(8px + env(safe-area-inset-bottom));gap:6px;justify-content:space-around}.mobile-section-tabs button{position:relative;display:grid;gap:2px;place-items:center;min-width:58px;border:0;background:transparent;color:#9fb8cc;border-radius:14px;padding:7px 6px}.mobile-section-tabs button.active{background:#12324b;color:#fff}.mobile-section-tabs b{font-size:18px;line-height:1}.mobile-section-tabs span{font-size:11px}.mobile-section-tabs em{position:absolute;top:2px;right:8px;background:#22c55e;color:#03111a;border-radius:999px;min-width:18px;height:18px;display:grid;place-items:center;font-size:11px;font-style:normal}.mobile-proof-fab{display:flex;position:fixed;right:14px;bottom:82px;z-index:91;align-items:center;gap:8px;border:0;border-radius:999px;padding:13px 16px;background:#22c55e;color:#03111a;font-weight:800;box-shadow:0 12px 34px rgba(34,197,94,.35)}.mobile-role-chip{display:block;position:fixed;left:14px;right:150px;bottom:88px;z-index:89;background:rgba(7,17,31,.88);border:1px solid rgba(125,211,252,.18);color:#bdd4ea;border-radius:999px;padding:9px 12px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.proof-workflow{display:flex!important;flex-direction:column}.proof-workflow .upload-panel{order:-1;position:relative!important;bottom:auto!important;background:#081827!important;border:1px solid rgba(34,197,94,.28)!important}.proof-workflow .upload-panel h3{font-size:24px!important}.upload-box{min-height:120px!important;border-radius:18px!important}.upload-box input{font-size:18px!important}.full-width,.primary.full{min-height:52px!important}.evidence-grid{grid-template-columns:1fr!important}.evidence-card{display:grid!important}.evidence-card img{width:100%!important;height:auto!important;max-height:260px;object-fit:cover}.pipeline{display:flex!important;overflow:auto;scroll-snap-type:x mandatory}.pipeline article{min-width:260px;scroll-snap-align:start}.provider-hub{display:flex!important;flex-direction:column}.provider-group{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:12px}.provider-card{padding:14px!important}.provider-actions{display:grid!important;grid-template-columns:1fr 1fr}.provider-actions button{min-height:44px}.modal-card{max-height:88vh;overflow:auto}.content-grid{gap:12px!important}.panel{padding:14px!important;border-radius:18px!important}.table-toolbar{display:grid!important;gap:10px}.search input{width:100%}.stat-grid,.proof-summary{grid-template-columns:1fr 1fr!important}.stat-card{min-height:110px}.public-map-grid{grid-template-columns:1fr!important}.public-map-frame iframe{height:260px!important}.map-stats{display:flex!important;overflow:auto;padding-bottom:6px}.map-stats button{min-width:128px}.tag-grid,.service-cloud{max-height:150px;overflow:auto}.page-addons .panel.wide,.page-jobs .panel.wide,.page-review .panel.wide{max-height:none!important}.page-addons .content-grid,.page-settings .content-grid{display:flex!important;flex-direction:column}.shopify-shell{padding-bottom:96px!important}}
@media(max-width:430px){.mobile-role-chip{display:none}.mobile-proof-fab{right:10px;bottom:78px;padding:12px 14px}.mobile-section-tabs span{font-size:10px}.mobile-section-tabs button{min-width:50px}.stat-grid,.proof-summary{grid-template-columns:1fr!important}.marketing-hero h1{font-size:30px!important}}
`;
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 2.9.9 mobile workflow polish applied.');
