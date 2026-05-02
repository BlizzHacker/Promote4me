import fs from 'fs';

const has = (s, x) => s.includes(x);

console.log('Applying Promote4.me 2.9.0 public map, marketplace, and API beta patch...');

// -----------------------------
// Backend: public map jobs + API beta metadata
// -----------------------------
let server = fs.readFileSync('server/index.js', 'utf8');

server = server.replace(
  "app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.6.0' }));",
  "app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.9.0' }));"
);
server = server.replace(
  "app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.3.0' }));",
  "app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '2.9.0' }));"
);

if (!has(server, "/api/public/map-jobs")) {
  const publicMapEndpoint = `
app.get('/api/public/map-jobs', (req, res) => {
  const jobs = all("SELECT id,title,type,source,address,lat,lng,trade,budget_cents,reward_cents,work_mode,visibility,status,created_at FROM jobs WHERE COALESCE(is_public,0)=1 OR COALESCE(visibility,'private')='public' OR id LIKE 'DEMO-%' OR id LIKE 'PUBLIC-%' ORDER BY created_at DESC LIMIT 300");
  const normalized = jobs.map((job) => ({
    ...job,
    lat: Number(job.lat || 37.0842),
    lng: Number(job.lng || -94.5133),
    available: !['Delivered','Verified','Rejected','Cancelled'].includes(job.status || ''),
    taken: ['In Progress','Submitted','Delivered','Verified'].includes(job.status || ''),
    reward: Number(job.budget_cents || job.reward_cents || 0)
  }));
  res.json({
    ok: true,
    version: '2.9.0',
    counts: {
      total: normalized.length,
      available: normalized.filter((j) => j.available && !j.taken).length,
      taken: normalized.filter((j) => j.taken).length,
      online: normalized.filter((j) => j.work_mode === 'online').length,
      inPerson: normalized.filter((j) => (j.work_mode || 'in_person') !== 'online').length
    },
    jobs: normalized
  });
});

app.get('/api/public/beta-status', (req, res) => res.json({
  ok: true,
  version: '2.9.0',
  goals: ['public map', 'available/taken jobs', 'in-person marketplace', 'online work queue', 'integration API tests', 'role/security audit'],
  integrations: ['Shopify App Starter', 'WooCommerce Plugin', 'DoorDash profile', 'Grubhub profile', 'Uber Eats profile', 'Instacart profile', 'Shipt profile', 'Roadie profile', 'Walmart Spark profile', 'Amazon Flex profile', 'Custom Courier profile'],
  securityRules: ['tenant isolation', 'demo safety', 'team-scoped approvals', 'manager/admin approval only', 'public applicant isolation']
}));
`;
  server = server.replace("app.post('/api/auth/register'", publicMapEndpoint + "\napp.post('/api/auth/register'");
}

fs.writeFileSync('server/index.js', server);

// -----------------------------
// Frontend: public homepage map + social job cards
// -----------------------------
let app = fs.readFileSync('src/ProductApp.jsx', 'utf8');

if (!has(app, 'function PublicWorkMap')) {
  const component = `
function PublicWorkMap() {
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
  const mapUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=' +
    (Number(center.lng) - 0.08) + '%2C' + (Number(center.lat) - 0.08) + '%2C' +
    (Number(center.lng) + 0.08) + '%2C' + (Number(center.lat) + 0.08) +
    '&layer=mapnik&marker=' + center.lat + '%2C' + center.lng;

  return (
    <section className="public-map-section">
      <div className="public-map-copy">
        <span className="eyebrow">Live Work Map · 2.9 beta</span>
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
`;
  app = app.replace('function AuthCard({ action, onAuthed, onBack }) {', component + '\nfunction AuthCard({ action, onAuthed, onBack }) {');
}

if (!has(app, '<PublicWorkMap />')) {
  if (has(app, '</div>\n        <div className="hero-actions">')) {
    app = app.replace('</div>\n        <div className="hero-actions">', '</div>\n        <PublicWorkMap />\n        <div className="hero-actions">');
  } else if (has(app, '<div className="hero-actions">')) {
    app = app.replace('<div className="hero-actions">', '<PublicWorkMap />\n        <div className="hero-actions">');
  }
}

// Make existing marketplace copy more 2.9-oriented if present.
app = app.replace(
  'Apply for local or remote work. In-person jobs require GPS/photo proof; online jobs require digital deliverables and manager approval.',
  'Apply for local or remote work. In-person jobs require GPS/photo proof; online jobs require Fiverr-style deliverables, milestones, and manager approval.'
);

fs.writeFileSync('src/ProductApp.jsx', app);

// -----------------------------
// CSS: social/fun map UX
// -----------------------------
let css = fs.readFileSync('src/styles.css', 'utf8');
if (!has(css, 'P4ME 2.9 PUBLIC MAP PATCH')) {
  css += `
/* P4ME 2.9 PUBLIC MAP PATCH */
.public-map-section{margin:28px 0;padding:22px;border:1px solid rgba(125,211,252,.22);border-radius:28px;background:linear-gradient(135deg,rgba(14,165,233,.14),rgba(124,58,237,.12));box-shadow:0 24px 80px rgba(0,0,0,.24)}
.public-map-copy h2{margin:6px 0 8px;font-size:clamp(28px,4vw,48px);letter-spacing:-.05em;color:#fff}.public-map-copy p{max-width:850px;color:#c7d7ea}.map-stats{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}.map-stats button{border:1px solid rgba(125,211,252,.25);background:rgba(7,17,31,.72);color:#dff3ff;border-radius:999px;padding:10px 14px;cursor:pointer}.map-stats button.active{background:#38bdf8;color:#07111f}.map-stats strong{margin-left:6px}.public-map-grid{display:grid;grid-template-columns:minmax(320px,1.4fr) minmax(280px,.8fr);gap:16px}.public-map-frame{position:relative;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,.14);min-height:380px;background:#0b1727}.public-map-frame iframe{width:100%;height:420px;border:0;filter:saturate(1.1) contrast(1.02)}.map-legend{position:absolute;left:14px;bottom:14px;background:rgba(7,17,31,.88);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:10px 14px;color:#eaf3ff;font-size:13px}.dot{display:inline-block;width:10px;height:10px;border-radius:999px;margin:0 6px}.dot.open{background:#22c55e}.dot.taken{background:#f59e0b}.dot.online{background:#a78bfa}.public-job-feed{display:grid;gap:10px;max-height:420px;overflow:auto;padding-right:4px}.public-job-card{display:grid;gap:6px;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;background:rgba(255,255,255,.055)}.public-job-card.open{border-color:rgba(34,197,94,.35)}.public-job-card.taken{border-color:rgba(245,158,11,.35);opacity:.86}.public-job-card strong{color:#fff}.public-job-card span{display:block;color:#bbd1e8}.public-job-card small{color:#7dd3fc}@media(max-width:900px){.public-map-grid{grid-template-columns:1fr}.public-map-frame iframe{height:320px}}
`;
}
fs.writeFileSync('src/styles.css', css);

console.log('Promote4.me 2.9.0 public map, marketplace, and API beta patch applied.');
