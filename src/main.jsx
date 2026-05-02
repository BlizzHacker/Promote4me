import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Home,
  KeyRound,
  LayoutDashboard,
  Link as LinkIcon,
  Lock,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
  Upload,
  Users,
  Wrench,
} from 'lucide-react';
import './styles.css';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD_HASH = '797f272c18a8d5739be09cf38e5f82a0d311de01ff584f848ed5fef8ae73a444';
const STORAGE_KEY = 'p4me2-state-v2';
const LEGACY_STORAGE_KEY = 'p4me2-state-v1';

const jobTypes = ['Street Team Promo', 'Technician On-Site', 'Plumber / Contractor', 'Food Delivery', 'Package Delivery', 'Custom Proof Job'];
const statuses = ['Assigned', 'In Progress', 'Submitted', 'Verified', 'Rejected', 'Delivered', 'Exception'];

const seedState = {
  settings: {
    companyName: 'Promote4.me',
    googleMapsApiKey: '',
    accuracyRadiusFeet: 350,
    requireGpsForRewards: true,
    shopifyStoreUrl: 'your-shop.myshopify.com',
    wordpressSiteUrl: 'https://example.com',
  },
  members: [
    { id: 'mem-1', name: 'Alex Street Team', phone: '(555) 201-2001', role: 'Promoter', status: 'Active' },
    { id: 'mem-2', name: 'Morgan Courier', phone: '(555) 201-2002', role: 'Driver', status: 'Active' },
    { id: 'mem-3', name: 'Taylor Tech', phone: '(555) 201-2003', role: 'Technician', status: 'Active' },
  ],
  clients: [
    { id: 'cli-1', name: 'Joplin Coffee Co.', email: 'owner@coffee.example', phone: '(555) 991-1000' },
    { id: 'cli-2', name: 'Central Plaza Receiving', email: 'receiving@central.example', phone: '(555) 991-2000' },
    { id: 'cli-3', name: 'Walker Residence', email: 'jamie@example.com', phone: '(555) 991-3000' },
  ],
  jobs: [
    {
      id: 'P4-1001', orderNumber: 'SHOP-1042', type: 'Package Delivery', clientName: 'Jamie Walker', clientPhone: '(555) 991-3000',
      address: '201 S Main St, Joplin, MO', lat: 37.0842, lng: -94.5133, assignedTo: 'mem-2', status: 'In Progress', eta: 'Today 3:30 PM', source: 'Shopify', reward: 8,
      instructions: 'Deliver package and upload front-door proof photo.', evidence: [], history: ['Created from Shopify order', 'Packed', 'Out for Delivery'],
    },
    {
      id: 'P4-1002', orderNumber: 'STREET-221', type: 'Street Team Promo', clientName: 'Joplin Coffee Co.', clientPhone: '(555) 991-1000',
      address: '302 E 4th St, Joplin, MO', lat: 37.0878, lng: -94.5107, assignedTo: 'mem-1', status: 'Assigned', eta: 'Today 5:15 PM', source: 'Manual', reward: 12,
      instructions: 'Place flyers on approved community board. Upload a clear photo showing flyer and surrounding board/location.', evidence: [
        { id: 'ev-seed-1', fileName: 'coffee-board-proof.jpg', preview: '', capturedAt: new Date().toISOString(), lat: 37.0879, lng: -94.5108, source: 'browser', distanceFeet: 47, score: 96, verdict: 'High confidence', warnings: [], note: 'Legacy/past work sample retained.' }
      ], history: ['Street team assignment created', 'Past work imported'],
    },
    {
      id: 'P4-1003', orderNumber: 'WP-7781', type: 'Food Delivery', clientName: 'Central Plaza Receiving', clientPhone: '(555) 991-2000',
      address: '901 N Range Line Rd, Joplin, MO', lat: 37.1012, lng: -94.4778, assignedTo: 'mem-2', status: 'Assigned', eta: 'Tomorrow 10:00 AM', source: 'WordPress', reward: 6,
      instructions: 'Deliver catering order to receiving desk and collect photo confirmation if requested.', evidence: [], history: ['Created from WooCommerce order'],
    },
    {
      id: 'P4-1004', orderNumber: 'TECH-501', type: 'Technician On-Site', clientName: 'Walker Residence', clientPhone: '(555) 991-3000',
      address: '1202 S Wall Ave, Joplin, MO', lat: 37.0764, lng: -94.5102, assignedTo: 'mem-3', status: 'Assigned', eta: 'Friday 1:00 PM', source: 'Manual', reward: 25,
      instructions: 'Arrive on site, photograph installed part or completed repair. GPS must match client location for reward approval.', evidence: [], history: ['Technician proof job created'],
    },
  ],
  messages: [
    { id: 'msg-1', title: 'Proof required', body: 'Street team and technician jobs now require location-scored evidence.', read: false },
    { id: 'msg-2', title: 'Delivery update', body: 'P4-1001 is out for delivery.', read: true },
  ],
};

function migrateState(raw) {
  if (!raw) return seedState;
  const parsed = JSON.parse(raw);
  if (parsed.jobs) return { ...seedState, ...parsed };
  if (parsed.deliveries) return { ...seedState, jobs: parsed.deliveries.map((d) => ({ ...d, type: d.source === 'Shopify' || d.source === 'WordPress' ? 'Package Delivery' : 'Custom Proof Job', assignedTo: d.driverId || '', reward: 0, instructions: d.notes || '', evidence: [] })) };
  return seedState;
}

function loadState() {
  try {
    return migrateState(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY));
  } catch { return seedState; }
}
function saveState(nextState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)); }
async function sha256(value) { const bytes = new TextEncoder().encode(value); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join(''); }

const menu = {
  mobile: [['work', 'My Work', ClipboardList], ['submit', 'Submit Proof', Camera], ['tracker', 'Customer View', PackageCheck], ['map', 'Map', Map], ['messages', 'Updates', Bell], ['settings', 'Settings', Settings]],
  admin: [['dashboard', 'Dashboard', LayoutDashboard], ['jobs', 'Jobs & Orders', ClipboardList], ['review', 'Evidence Review', ShieldCheck], ['map', 'Proof Map', Map], ['members', 'Street Team', Users], ['clients', 'Clients', Building2], ['integrations', 'Add-ons', Store], ['settings', 'Settings', Settings]],
};

function App() {
  const [state, setState] = useState(loadState);
  const [portal, setPortal] = useState('home');
  const [session, setSession] = useState(() => JSON.parse(sessionStorage.getItem('p4me-session') || 'null'));
  const [active, setActive] = useState(session?.type === 'mobile' ? 'work' : 'dashboard');
  useEffect(() => saveState(state), [state]);
  useEffect(() => { session ? sessionStorage.setItem('p4me-session', JSON.stringify(session)) : sessionStorage.removeItem('p4me-session'); }, [session]);
  const updateState = (patcher) => setState((current) => typeof patcher === 'function' ? patcher(current) : { ...current, ...patcher });
  const logout = () => { setSession(null); setPortal('home'); setActive('dashboard'); };
  if (!session) return <Landing state={state} portal={portal} setPortal={setPortal} onLogin={(next) => { setSession(next); setPortal(next.type); setActive(next.type === 'mobile' ? 'work' : 'dashboard'); }} />;
  return <Shell state={state} updateState={updateState} session={session} active={active} setActive={setActive} logout={logout} />;
}

function Landing({ state, portal, setPortal, onLogin }) {
  if (portal === 'admin-login') return <AdminLogin onLogin={onLogin} onBack={() => setPortal('home')} />;
  if (portal === 'mobile-login') return <WorkerLogin state={state} onLogin={onLogin} onBack={() => setPortal('home')} />;
  return <main className="landing"><section className="hero-card"><div className="badge"><ShieldCheck size={18} /> Promote4.me Proof-of-Work Platform</div><h1>Street team, service proof, and delivery tracking with GPS evidence.</h1><p>Promote4.me now supports flyer placement proof, technician/plumber on-site proof, food delivery, package delivery, Shopify/WooCommerce order tracking, and admin/customer review of evidence confidence.</p><div className="portal-grid"><button className="portal-card" onClick={() => setPortal('mobile-login')}><Smartphone size={42} /><span>Worker / Customer Portal</span><small>Submit proof, track orders, review assignment history, and capture GPS-backed photo evidence.</small><b>Open Portal <ChevronRight size={18} /></b></button><button className="portal-card admin-card" onClick={() => setPortal('admin-login')}><LayoutDashboard size={42} /><span>Admin Dashboard</span><small>Create jobs, assign street team members, review proof, score GPS accuracy, and manage integrations.</small><b>Admin Login <ChevronRight size={18} /></b></button></div></section></main>;
}
function AdminLogin({ onLogin, onBack }) { const [form, setForm] = useState({ username: ADMIN_USER, password: '' }); const [error, setError] = useState(''); async function submit(e) { e.preventDefault(); const hash = await sha256(form.password); if (form.username.trim().toLowerCase() === ADMIN_USER && hash === ADMIN_PASSWORD_HASH) onLogin({ type: 'admin', name: 'Admin', signedInAt: new Date().toISOString() }); else setError('Wrong admin username or password.'); } return <LoginCard title="Admin Login" icon={Lock} onBack={onBack} onSubmit={submit} error={error}><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary admin password" autoFocus /><button className="primary">Sign in</button></LoginCard>; }
function WorkerLogin({ state, onLogin, onBack }) { const [query, setQuery] = useState('P4-1002'); const [error, setError] = useState(''); function submit(e) { e.preventDefault(); const q = query.trim(); const job = state.jobs.find((item) => [item.id, item.orderNumber].includes(q)); const member = state.members.find((m) => m.name.toLowerCase().includes(q.toLowerCase())); if (job) onLogin({ type: 'mobile', trackingId: job.id, memberId: job.assignedTo, name: job.clientName }); else if (member) onLogin({ type: 'mobile', memberId: member.id, name: member.name }); else setError('No job/order/member found. Try P4-1002, P4-1004, or Alex.'); } return <LoginCard title="Worker / Customer Portal" icon={PackageCheck} onBack={onBack} onSubmit={submit} error={error}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tracking ID, order number, or member name" autoFocus /><button className="primary">Continue</button><p className="hint">Try P4-1001, P4-1002, P4-1003, P4-1004, Alex, Morgan, or Taylor.</p></LoginCard>; }
function LoginCard({ title, icon: Icon, onBack, onSubmit, error, children }) { return <main className="landing"><form className="login-card" onSubmit={onSubmit}><button type="button" className="text-button" onClick={onBack}>← Back</button><div className="badge"><Icon size={18} /> {title}</div><h2>{title}</h2>{children}{error && <div className="error-box">{error}</div>}</form></main>; }

function Shell({ state, updateState, session, active, setActive, logout }) { const items = menu[session.type]; return <div className="app-shell"><aside className="sidebar"><div className="brand"><ShieldCheck size={24} /> {state.settings.companyName}</div><nav>{items.map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><Icon size={18} /> {label}</button>)}</nav><button className="logout" onClick={logout}><LogOut size={18} /> Log out</button></aside><section className="workspace"><header className="topbar"><div><span className="eyebrow">{session.type === 'admin' ? 'Admin' : 'Worker / Customer'}</span><h2>{title(active)}</h2></div><div className="session-pill"><ShieldCheck size={16} /> Live local data</div></header><Content state={state} updateState={updateState} session={session} active={active} /></section></div>; }
function Content(props) { const { active, session } = props; if (session.type === 'mobile') { if (active === 'work') return <MyWork {...props} />; if (active === 'submit') return <SubmitProof {...props} />; if (active === 'tracker') return <Tracker {...props} />; if (active === 'map') return <MapPanel {...props} />; if (active === 'messages') return <Messages {...props} />; return <SettingsPanel {...props} />; } if (active === 'jobs') return <Jobs {...props} />; if (active === 'review') return <EvidenceReview {...props} />; if (active === 'map') return <MapPanel {...props} />; if (active === 'members') return <Members {...props} />; if (active === 'clients') return <Clients {...props} />; if (active === 'integrations') return <Integrations {...props} />; if (active === 'settings') return <SettingsPanel {...props} />; return <Dashboard {...props} />; }

function Dashboard({ state }) { const totalEvidence = state.jobs.reduce((sum, j) => sum + j.evidence.length, 0); const verified = state.jobs.filter((j) => j.status === 'Verified' || j.status === 'Delivered').length; const missingGps = state.jobs.flatMap((j) => j.evidence).filter((e) => e.verdict === 'GPS missing').length; const open = state.jobs.filter((j) => !['Verified', 'Delivered', 'Rejected'].includes(j.status)).length; return <div className="content-grid"><section className="stat-grid"><Stat icon={ClipboardList} label="Open Jobs" value={open} /><Stat icon={Camera} label="Proof Uploads" value={totalEvidence} /><Stat icon={CheckCircle2} label="Verified Work" value={verified} /><Stat icon={MapPin} label="GPS Missing" value={missingGps} /></section><section className="panel wide"><h3>Jobs, Orders, and Proof Work</h3><JobTable state={state} /></section><section className="panel"><h3>Accuracy Rules</h3><ul className="clean-list"><li>High confidence: photo/browser GPS within {state.settings.accuracyRadiusFeet} ft of job location.</li><li>Medium confidence: GPS present but outside target radius.</li><li>GPS missing: evidence kept, but reward/client confidence should be reviewed.</li></ul></section></div>; }
function Stat({ icon: Icon, label, value }) { return <article className="stat-card"><Icon size={24} /><span>{label}</span><strong>{value}</strong></article>; }

function MyWork({ state, session }) { const jobs = state.jobs.filter((j) => !session.memberId || j.assignedTo === session.memberId || j.id === session.trackingId); return <section className="panel"><h3>My Work & Past Proof</h3><p>Assignments include street team flyer drops, technician/plumber site proof, food delivery, and package delivery. Past work remains visible for audit.</p><JobTable state={{ ...state, jobs }} /></section>; }
function Tracker({ state, session }) { const job = state.jobs.find((item) => item.id === session.trackingId) || state.jobs[0]; return <section className="panel tracker-panel"><div className="tracker-head"><PackageCheck size={42} /><div><h3>{job.id}</h3><p>{job.orderNumber} · {job.type} · {job.clientName}</p></div><StatusBadge status={job.status} /></div><div className="tracking-steps">{['Assigned', 'In Progress', 'Submitted', job.type.includes('Delivery') ? 'Delivered' : 'Verified'].map((step) => <div key={step} className={stepIndex(job.status) >= stepIndex(step) ? 'done' : ''}><CheckCircle2 size={20} /><span>{step}</span></div>)}</div><div className="detail-grid"><Info label="ETA / Scheduled" value={job.eta} /><Info label="Location" value={job.address} /><Info label="Assigned To" value={memberName(state, job.assignedTo)} /><Info label="Evidence Confidence" value={summaryConfidence(job)} /></div><EvidenceList job={job} /></section>; }

function SubmitProof({ state, updateState, session }) { const jobs = state.jobs.filter((j) => !session.memberId || j.assignedTo === session.memberId || j.id === session.trackingId); const [jobId, setJobId] = useState(jobs[0]?.id || state.jobs[0]?.id); const [note, setNote] = useState(''); const [busy, setBusy] = useState(false); const job = state.jobs.find((j) => j.id === jobId) || state.jobs[0]; async function onFile(e) { const file = e.target.files?.[0]; if (!file || !job) return; setBusy(true); const evidence = await buildEvidence(file, job, note); updateState((s) => ({ ...s, jobs: s.jobs.map((j) => j.id === job.id ? { ...j, status: 'Submitted', evidence: [evidence, ...j.evidence], history: [`Proof submitted: ${evidence.verdict}`, ...j.history] } : j), messages: [{ id: `msg-${Date.now()}`, title: 'New proof submitted', body: `${job.id} ${evidence.fileName} scored ${evidence.score}%: ${evidence.verdict}`, read: false }, ...s.messages] })); setNote(''); setBusy(false); e.target.value = ''; } return <section className="panel action-panel"><h3><Upload size={20} /> Submit Photo Proof</h3><p>Promoters, drivers, plumbers, and technicians can upload photo proof. The app checks browser GPS first, reads photo metadata when available, compares it to the client location, and warns when accuracy is missing or weak.</p><label>Assignment<select value={jobId} onChange={(e) => setJobId(e.target.value)}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.id} · {j.type} · {j.clientName}</option>)}</select></label><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was completed? Example: Flyer placed on front community board beside event poster." /><label className="upload-box"><Camera size={22} /> {busy ? 'Checking GPS and image evidence...' : 'Choose photo proof'}<input type="file" accept="image/*" capture="environment" onChange={onFile} /></label>{job && <EvidenceList job={job} />}</section>; }

async function buildEvidence(file, job, note) { const preview = await fileToDataUrl(file); const browserGps = await getBrowserGps(); const imageGps = await getImageGps(file); const gps = browserGps || imageGps; const distanceFeet = gps ? Math.round(distanceFeetBetween(gps.lat, gps.lng, job.lat, job.lng)) : null; const scored = scoreEvidence({ gps, distanceFeet, job }); return { id: `ev-${Date.now()}`, fileName: file.name, preview, capturedAt: new Date().toISOString(), lat: gps?.lat || null, lng: gps?.lng || null, gpsAccuracyMeters: browserGps?.accuracy || null, source: browserGps ? 'browser geolocation' : imageGps ? 'photo metadata' : 'missing', distanceFeet, score: scored.score, verdict: scored.verdict, warnings: scored.warnings, note }; }
function fileToDataUrl(file) { return new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); }); }
function getBrowserGps() { return new Promise((resolve) => { if (!navigator.geolocation) return resolve(null); navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }), () => resolve(null), { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }); }); }
async function getImageGps(file) { try { const exifr = await import('exifr'); const gps = await exifr.gps(file); if (gps?.latitude && gps?.longitude) return { lat: gps.latitude, lng: gps.longitude }; } catch {} return null; }
function scoreEvidence({ gps, distanceFeet, job }) { if (!gps) return { score: 30, verdict: 'GPS missing', warnings: ['No browser GPS or image GPS metadata found. Keep evidence for manual review, but do not auto-approve rewards.'] }; const radius = Number(loadState().settings?.accuracyRadiusFeet || 350); if (distanceFeet <= radius) return { score: Math.max(90, 100 - Math.round(distanceFeet / 25)), verdict: 'High confidence', warnings: [] }; if (distanceFeet <= radius * 3) return { score: 65, verdict: 'Medium confidence', warnings: [`GPS was present but ${distanceFeet} ft from the expected client location.`] }; return { score: 35, verdict: 'Low confidence', warnings: [`GPS was ${distanceFeet} ft from the expected client location. Review before paying reward or approving client proof.`] }; }
function distanceFeetBetween(lat1, lon1, lat2, lon2) { const R = 6371000; const toRad = (v) => v * Math.PI / 180; const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1); const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2; return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 3.28084; }

function Jobs({ state, updateState }) { const blank = { orderNumber: '', type: 'Street Team Promo', clientName: '', clientPhone: '', address: '', eta: '', source: 'Manual', reward: 10, instructions: '' }; const [form, setForm] = useState(blank); const [query, setQuery] = useState(''); const filtered = state.jobs.filter((j) => JSON.stringify(j).toLowerCase().includes(query.toLowerCase())); function addJob(e) { e.preventDefault(); const next = { ...form, id: `P4-${Date.now().toString().slice(-5)}`, lat: 37.0842 + Math.random()/50, lng: -94.5133 + Math.random()/50, assignedTo: state.members[0]?.id || '', status: 'Assigned', evidence: [], history: ['Job created'] }; updateState((s) => ({ ...s, jobs: [next, ...s.jobs] })); setForm(blank); } function updateStatus(id, status) { updateState((s) => ({ ...s, jobs: s.jobs.map((j) => j.id === id ? { ...j, status, history: [`Status changed to ${status}`, ...j.history] } : j) })); } return <div className="content-grid"><section className="panel wide"><div className="table-toolbar"><h3>Jobs & Orders</h3><label className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs, clients, orders" /></label></div><JobTable state={{ ...state, jobs: filtered }} updateStatus={updateStatus} editable /></section><section className="panel"><h3><Plus size={18} /> New Work Order</h3><form onSubmit={addJob} className="stack-form"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{jobTypes.map((t) => <option key={t}>{t}</option>)}</select>{Object.keys(blank).filter((k) => k !== 'type').map((key) => <input key={key} required={['clientName','address'].includes(key)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={labelFromKey(key)} />)}<button className="primary">Create Job</button></form></section></div>; }
function JobTable({ state, updateStatus, editable }) { return <div className="responsive-table"><table><thead><tr><th>ID</th><th>Type</th><th>Client</th><th>Status</th><th>Proof</th><th>Confidence</th><th>Assigned</th>{editable && <th>Update</th>}</tr></thead><tbody>{state.jobs.map((j) => <tr key={j.id}><td>{j.id}<br/><small>{j.orderNumber}</small></td><td>{iconForType(j.type)} {j.type}</td><td>{j.clientName}<br/><small>{j.address}</small></td><td><StatusBadge status={j.status} /></td><td>{j.evidence.length} upload(s)</td><td><Confidence job={j} /></td><td>{memberName(state, j.assignedTo)}</td>{editable && <td><select value={j.status} onChange={(e) => updateStatus(j.id, e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></td>}</tr>)}</tbody></table></div>; }
function EvidenceReview({ state, updateState }) { function approve(jobId, status) { updateState((s) => ({ ...s, jobs: s.jobs.map((j) => j.id === jobId ? { ...j, status, history: [`Admin marked ${status}`, ...j.history] } : j) })); } return <section className="panel"><h3>Evidence Review</h3>{state.jobs.map((job) => <article className="evidence-job" key={job.id}><div className="tracker-head"><div><h3>{job.id} · {job.type}</h3><p>{job.clientName} · {job.address}</p></div><Confidence job={job} /></div><EvidenceList job={job} /><div className="button-row"><button className="primary" onClick={() => approve(job.id, job.type.includes('Delivery') ? 'Delivered' : 'Verified')}>Approve</button><button className="secondary danger" onClick={() => approve(job.id, 'Rejected')}>Reject</button></div></article>)}</section>; }
function EvidenceList({ job }) { if (!job.evidence.length) return <div className="empty-proof">No evidence uploaded yet.</div>; return <div className="evidence-grid">{job.evidence.map((e) => <article className="evidence-card" key={e.id}>{e.preview ? <img src={e.preview} alt={e.fileName} /> : <div className="photo-placeholder"><Camera size={32}/></div>}<div><strong>{e.fileName}</strong><p>{new Date(e.capturedAt).toLocaleString()} · {e.source}</p><StatusBadge status={e.verdict} /><p>Score: {e.score}% · Distance: {e.distanceFeet == null ? 'Unknown' : `${e.distanceFeet} ft`}</p>{e.note && <p>Note: {e.note}</p>}{e.warnings?.map((w) => <div className="warning" key={w}>{w}</div>)}</div></article>)}</div>; }
function Confidence({ job }) { const score = job.evidence[0]?.score || 0; const text = job.evidence.length ? `${score}% · ${job.evidence[0].verdict}` : 'No proof'; return <span className={`confidence ${score >= 85 ? 'high' : score >= 60 ? 'medium' : 'low'}`}>{text}</span>; }

function MapPanel({ state, session }) { const [ready, setReady] = useState(false); const jobs = session.type === 'mobile' ? state.jobs.filter((j) => !session.memberId || j.assignedTo === session.memberId || j.id === session.trackingId) : state.jobs; useEffect(() => { if (!state.settings.googleMapsApiKey) return; const id = 'p4me-google-maps'; if (window.google?.maps) { setReady(true); return; } if (!document.getElementById(id)) { const script = document.createElement('script'); script.id = id; script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(state.settings.googleMapsApiKey)}`; script.async = true; script.onload = () => setReady(true); document.body.appendChild(script); } }, [state.settings.googleMapsApiKey]); useEffect(() => { if (!ready || !window.google?.maps) return; const center = jobs[0] || { lat: 37.0842, lng: -94.5133 }; const map = new window.google.maps.Map(document.getElementById('delivery-map'), { center: { lat: center.lat, lng: center.lng }, zoom: 12 }); jobs.forEach((j) => { new window.google.maps.Marker({ position: { lat: j.lat, lng: j.lng }, map, title: `${j.id} ${j.type}` }); j.evidence.filter((e) => e.lat && e.lng).forEach((e) => new window.google.maps.Marker({ position: { lat: e.lat, lng: e.lng }, map, title: `${j.id} proof: ${e.verdict}` })); }); }, [ready, jobs]); return <section className="panel map-panel"><h3>Job & Proof Map</h3>{state.settings.googleMapsApiKey ? <div id="delivery-map" className="map-box" /> : <div className="map-placeholder"><MapPin size={42} /><h3>Add your Google Maps API key</h3><p>Settings accepts each site owner's own key. Coordinates and evidence scores still work without the visual map.</p></div>}</section>; }
function Members({ state, updateState }) { const [name, setName] = useState(''); function add(e) { e.preventDefault(); updateState((s) => ({ ...s, members: [...s.members, { id: `mem-${Date.now()}`, name, phone: '', role: 'Promoter', status: 'Active' }] })); setName(''); } return <section className="panel"><h3>Street Team / Drivers / Technicians</h3><List rows={state.members.map((m) => `${m.name} · ${m.role} · ${m.phone || 'No phone'} · ${m.status}`)} /><form onSubmit={add} className="inline-form"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="New team member" required /><button className="primary">Add</button></form></section>; }
function Clients({ state }) { return <section className="panel"><h3>Clients & Customers</h3><List rows={state.clients.map((c) => `${c.name} · ${c.email} · ${c.phone}`)} /></section>; }
function Messages({ state }) { return <section className="panel"><h3>Updates</h3><List rows={state.messages.map((m) => `${m.title}: ${m.body}`)} /></section>; }
function Integrations({ state }) { const embed = `<script src="https://promote4.me/embed/promote4me-widget.js" data-p4me-company="${state.settings.companyName}" data-p4me-api="https://promote4.me"></script>`; const iframe = `<iframe src="https://promote4.me/?tracking=ORDER_ID" style="width:100%;height:720px;border:0;border-radius:16px"></iframe>`; return <div className="content-grid"><section className="panel"><h3><ShoppingBag size={20} /> Shopify Orders</h3><p>Shopify customers can track delivery and managers can review proof-of-delivery/photo evidence. Use the Liquid snippet and map orders to P4 job IDs.</p><Code value={embed} /></section><section className="panel"><h3><Store size={20} /> WordPress / WooCommerce</h3><p>WooCommerce orders, service calls, and proof-of-work jobs can use the shortcode. Customers see job progress while admins see evidence details.</p><Code value={iframe} /></section></div>; }
function SettingsPanel({ state, updateState }) { const [settings, setSettings] = useState(state.settings); function save(e) { e.preventDefault(); updateState((s) => ({ ...s, settings })); } function resetData() { if (confirm('Reset local Promote4.me data?')) updateState(seedState); } return <section className="panel form-panel"><h3><Settings size={20} /> Settings</h3><form onSubmit={save} className="stack-form"><input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} placeholder="Company name" /><label>Google Maps API Key<input value={settings.googleMapsApiKey} onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })} placeholder="Paste your own Google Maps API key" /></label><label>Reward auto-approval radius, feet<input type="number" value={settings.accuracyRadiusFeet} onChange={(e) => setSettings({ ...settings, accuracyRadiusFeet: e.target.value })} /></label><input value={settings.shopifyStoreUrl} onChange={(e) => setSettings({ ...settings, shopifyStoreUrl: e.target.value })} placeholder="Shopify store URL" /><input value={settings.wordpressSiteUrl} onChange={(e) => setSettings({ ...settings, wordpressSiteUrl: e.target.value })} placeholder="WordPress site URL" /><button className="primary"><KeyRound size={16} /> Save Settings</button></form><button className="secondary danger" onClick={resetData}><RefreshCcw size={16} /> Reset Local Data</button></section>; }

function StatusBadge({ status }) { return <span className={`status ${String(status).toLowerCase().replaceAll(' ', '-')}`}>{status}</span>; }
function Info({ label, value }) { return <div className="info"><span>{label}</span><strong>{value || '—'}</strong></div>; }
function Code({ value }) { return <pre className="code"><code>{value}</code></pre>; }
function List({ rows }) { return <ul className="clean-list">{rows.map((row) => <li key={row}>{row}</li>)}</ul>; }
function stepIndex(status) { return ['Assigned', 'In Progress', 'Submitted', 'Verified', 'Delivered'].indexOf(status); }
function memberName(state, id) { return state.members.find((d) => d.id === id)?.name || 'Unassigned'; }
function summaryConfidence(job) { return job.evidence.length ? `${job.evidence[0].score}% · ${job.evidence[0].verdict}` : 'No proof uploaded'; }
function title(value) { return value.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' '); }
function labelFromKey(key) { return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()); }
function iconForType(type) { if (type.includes('Street')) return '📣'; if (type.includes('Technician') || type.includes('Plumber')) return '🔧'; if (type.includes('Food')) return '🍔'; if (type.includes('Package')) return '📦'; return '✅'; }

createRoot(document.getElementById('root')).render(<App />);
