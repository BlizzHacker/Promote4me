import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  Building2,
  CalendarDays,
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
  Users,
} from 'lucide-react';
import './styles.css';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD_HASH = '797f272c18a8d5739be09cf38e5f82a0d311de01ff584f848ed5fef8ae73a444';
const STORAGE_KEY = 'p4me2-state-v1';

const seedState = {
  settings: {
    companyName: 'Promote4.me',
    googleMapsApiKey: '',
    publicTrackingEnabled: true,
    shopifyStoreUrl: 'your-shop.myshopify.com',
    wordpressSiteUrl: 'https://example.com',
  },
  drivers: [
    { id: 'drv-1', name: 'Alex Driver', phone: '(555) 201-2001', status: 'Active' },
    { id: 'drv-2', name: 'Morgan Courier', phone: '(555) 201-2002', status: 'Active' },
  ],
  customers: [
    { id: 'cus-1', name: 'Jamie Walker', email: 'jamie@example.com', phone: '(555) 991-1000' },
    { id: 'cus-2', name: 'Central Plaza', email: 'receiving@central.example', phone: '(555) 991-2000' },
  ],
  deliveries: [
    {
      id: 'P4-1001',
      orderNumber: 'SHOP-1042',
      customerName: 'Jamie Walker',
      customerPhone: '(555) 991-1000',
      address: '201 S Main St, Joplin, MO',
      lat: 37.0842,
      lng: -94.5133,
      driverId: 'drv-1',
      status: 'Out for Delivery',
      eta: 'Today 3:30 PM',
      source: 'Shopify',
      notes: 'Leave by front door if no answer.',
      history: ['Created from Shopify order', 'Packed', 'Out for Delivery'],
    },
    {
      id: 'P4-1002',
      orderNumber: 'WP-7781',
      customerName: 'Central Plaza Receiving',
      customerPhone: '(555) 991-2000',
      address: '302 E 4th St, Joplin, MO',
      lat: 37.0878,
      lng: -94.5107,
      driverId: 'drv-2',
      status: 'Packed',
      eta: 'Today 5:15 PM',
      source: 'WordPress',
      notes: 'Ask for receiving manager.',
      history: ['Created from WooCommerce order', 'Packed'],
    },
    {
      id: 'P4-1003',
      orderNumber: 'MAN-2201',
      customerName: 'Northside Shops',
      customerPhone: '(555) 991-3000',
      address: '901 N Range Line Rd, Joplin, MO',
      lat: 37.1012,
      lng: -94.4778,
      driverId: '',
      status: 'Pending',
      eta: 'Tomorrow 10:00 AM',
      source: 'Manual',
      notes: 'Assign driver before morning route.',
      history: ['Manual delivery created'],
    },
  ],
  messages: [
    { id: 'msg-1', title: 'Delivery update', body: 'P4-1001 is out for delivery.', read: false },
    { id: 'msg-2', title: 'Integration ready', body: 'Shopify and WordPress embed options are available.', read: true },
  ],
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return seedState;
    return { ...seedState, ...JSON.parse(saved) };
  } catch {
    return seedState;
  }
}

function saveState(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const menu = {
  mobile: [
    ['tracker', 'Track Delivery', PackageCheck],
    ['map', 'Live Map', Map],
    ['messages', 'Updates', Bell],
    ['settings', 'Settings', Settings],
  ],
  admin: [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['deliveries', 'Deliveries', Truck],
    ['map', 'Route Map', Map],
    ['drivers', 'Drivers', Users],
    ['customers', 'Customers', Building2],
    ['integrations', 'Add-ons', Store],
    ['settings', 'Settings', Settings],
  ],
};

function App() {
  const [state, setState] = useState(loadState);
  const [portal, setPortal] = useState('home');
  const [session, setSession] = useState(() => JSON.parse(sessionStorage.getItem('p4me-session') || 'null'));
  const [active, setActive] = useState(session?.type === 'mobile' ? 'tracker' : 'dashboard');

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    if (session) sessionStorage.setItem('p4me-session', JSON.stringify(session));
    else sessionStorage.removeItem('p4me-session');
  }, [session]);

  const updateState = (patcher) => setState((current) => typeof patcher === 'function' ? patcher(current) : { ...current, ...patcher });
  const logout = () => { setSession(null); setPortal('home'); setActive('dashboard'); };

  if (!session) {
    return <Landing state={state} setPortal={setPortal} portal={portal} onLogin={(next) => { setSession(next); setPortal(next.type); setActive(next.type === 'mobile' ? 'tracker' : 'dashboard'); }} />;
  }

  return <Shell state={state} updateState={updateState} session={session} active={active} setActive={setActive} logout={logout} />;
}

function Landing({ state, portal, setPortal, onLogin }) {
  if (portal === 'admin-login') return <AdminLogin onLogin={onLogin} onBack={() => setPortal('home')} />;
  if (portal === 'mobile-login') return <CustomerLogin deliveries={state.deliveries} onLogin={onLogin} onBack={() => setPortal('home')} />;

  return (
    <main className="landing">
      <section className="hero-card">
        <div className="badge"><ShieldCheck size={18} /> Promote4.me 2.0 Delivery Monitor</div>
        <h1>Standalone delivery tracking for websites, Shopify, and WordPress.</h1>
        <p>
          Customers can track orders, admins can manage routes, and each site owner can add their own Google Maps API key.
          This revision works locally with persistent browser storage and is ready to connect to a real backend when needed.
        </p>
        <div className="portal-grid">
          <button className="portal-card" onClick={() => setPortal('mobile-login')}>
            <Smartphone size={42} />
            <span>Customer / Mobile Tracking</span>
            <small>Track a delivery by order number or tracking ID. Works as a public website or embedded widget.</small>
            <b>Track Delivery <ChevronRight size={18} /></b>
          </button>
          <button className="portal-card admin-card" onClick={() => setPortal('admin-login')}>
            <LayoutDashboard size={42} />
            <span>Admin Dashboard</span>
            <small>Manage deliveries, drivers, customers, maps, Shopify, WordPress, and public tracking embeds.</small>
            <b>Admin Login <ChevronRight size={18} /></b>
          </button>
        </div>
      </section>
    </main>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const [form, setForm] = useState({ username: ADMIN_USER, password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const hash = await sha256(form.password);
    if (form.username.trim().toLowerCase() === ADMIN_USER && hash === ADMIN_PASSWORD_HASH) {
      onLogin({ type: 'admin', name: 'Admin', signedInAt: new Date().toISOString() });
    } else {
      setError('Wrong admin username or password.');
    }
  }

  return <LoginCard title="Admin Login" icon={Lock} onBack={onBack} onSubmit={submit} error={error}>
    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" />
    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary admin password" autoFocus />
    <button className="primary">Sign in</button>
  </LoginCard>;
}

function CustomerLogin({ deliveries, onLogin, onBack }) {
  const [query, setQuery] = useState('P4-1001');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const found = deliveries.find((item) => [item.id, item.orderNumber].includes(query.trim()));
    if (found) onLogin({ type: 'mobile', trackingId: found.id, name: found.customerName });
    else setError('No delivery found for that tracking ID or order number.');
  }

  return <LoginCard title="Track Delivery" icon={PackageCheck} onBack={onBack} onSubmit={submit} error={error}>
    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tracking ID or order number" autoFocus />
    <button className="primary">Track now</button>
    <p className="hint">Try seeded tracking IDs: P4-1001, P4-1002, P4-1003.</p>
  </LoginCard>;
}

function LoginCard({ title, icon: Icon, onBack, onSubmit, error, children }) {
  return <main className="landing"><form className="login-card" onSubmit={onSubmit}>
    <button type="button" className="text-button" onClick={onBack}>← Back</button>
    <div className="badge"><Icon size={18} /> {title}</div>
    <h2>{title}</h2>
    {children}
    {error && <div className="error-box">{error}</div>}
  </form></main>;
}

function Shell({ state, updateState, session, active, setActive, logout }) {
  const items = menu[session.type];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><Truck size={24} /> {state.settings.companyName}</div>
      <nav>{items.map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><Icon size={18} /> {label}</button>)}</nav>
      <button className="logout" onClick={logout}><LogOut size={18} /> Log out</button>
    </aside>
    <section className="workspace">
      <header className="topbar"><div><span className="eyebrow">{session.type === 'admin' ? 'Admin' : 'Customer'}</span><h2>{title(active)}</h2></div><div className="session-pill"><ShieldCheck size={16} /> Signed in</div></header>
      <Content state={state} updateState={updateState} session={session} active={active} />
    </section>
  </div>;
}

function Content(props) {
  const { active, session } = props;
  if (session.type === 'mobile') {
    if (active === 'tracker') return <Tracker {...props} />;
    if (active === 'map') return <MapPanel {...props} />;
    if (active === 'messages') return <Messages {...props} />;
    return <SettingsPanel {...props} />;
  }
  if (active === 'deliveries') return <Deliveries {...props} />;
  if (active === 'map') return <MapPanel {...props} />;
  if (active === 'drivers') return <Drivers {...props} />;
  if (active === 'customers') return <Customers {...props} />;
  if (active === 'integrations') return <Integrations {...props} />;
  if (active === 'settings') return <SettingsPanel {...props} />;
  return <Dashboard {...props} />;
}

function Dashboard({ state }) {
  const out = state.deliveries.filter((d) => d.status === 'Out for Delivery').length;
  const delivered = state.deliveries.filter((d) => d.status === 'Delivered').length;
  const pending = state.deliveries.filter((d) => d.status !== 'Delivered').length;
  return <div className="content-grid">
    <section className="stat-grid">
      <Stat icon={Truck} label="Active Deliveries" value={pending} />
      <Stat icon={PackageCheck} label="Out for Delivery" value={out} />
      <Stat icon={CheckCircle2} label="Delivered" value={delivered} />
      <Stat icon={Users} label="Drivers" value={state.drivers.length} />
    </section>
    <section className="panel wide"><h3>Live Delivery Queue</h3><DeliveryTable state={state} /></section>
    <section className="panel"><h3>Setup Checklist</h3><ul className="clean-list"><li>Add your Google Maps API key in Settings.</li><li>Use Add-ons to copy Shopify or WordPress snippets.</li><li>Create deliveries manually or connect API/webhooks.</li></ul></section>
  </div>;
}

function Stat({ icon: Icon, label, value }) {
  return <article className="stat-card"><Icon size={24} /><span>{label}</span><strong>{value}</strong></article>;
}

function Tracker({ state, session }) {
  const delivery = state.deliveries.find((item) => item.id === session.trackingId) || state.deliveries[0];
  return <section className="panel tracker-panel">
    <div className="tracker-head"><PackageCheck size={42} /><div><h3>{delivery.id}</h3><p>{delivery.orderNumber} · {delivery.customerName}</p></div><StatusBadge status={delivery.status} /></div>
    <div className="tracking-steps">{['Pending', 'Packed', 'Out for Delivery', 'Delivered'].map((step) => <div key={step} className={stepIndex(delivery.status) >= stepIndex(step) ? 'done' : ''}><CheckCircle2 size={20} /><span>{step}</span></div>)}</div>
    <div className="detail-grid"><Info label="ETA" value={delivery.eta} /><Info label="Address" value={delivery.address} /><Info label="Driver" value={driverName(state, delivery.driverId)} /><Info label="Notes" value={delivery.notes} /></div>
  </section>;
}

function Deliveries({ state, updateState }) {
  const blank = { orderNumber: '', customerName: '', customerPhone: '', address: '', eta: '', source: 'Manual', notes: '' };
  const [form, setForm] = useState(blank);
  const [query, setQuery] = useState('');
  const filtered = state.deliveries.filter((d) => JSON.stringify(d).toLowerCase().includes(query.toLowerCase()));

  function addDelivery(event) {
    event.preventDefault();
    const next = {
      ...form,
      id: `P4-${Date.now().toString().slice(-5)}`,
      lat: 37.0842 + Math.random() / 50,
      lng: -94.5133 + Math.random() / 50,
      driverId: state.drivers[0]?.id || '',
      status: 'Pending',
      history: ['Delivery created'],
    };
    updateState((s) => ({ ...s, deliveries: [next, ...s.deliveries] }));
    setForm(blank);
  }

  function updateStatus(id, status) {
    updateState((s) => ({ ...s, deliveries: s.deliveries.map((d) => d.id === id ? { ...d, status, history: [...d.history, status] } : d) }));
  }

  return <div className="content-grid"><section className="panel wide"><div className="table-toolbar"><h3>Deliveries</h3><label className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search deliveries" /></label></div><DeliveryTable state={{ ...state, deliveries: filtered }} updateStatus={updateStatus} editable /></section><section className="panel"><h3><Plus size={18} /> New Delivery</h3><form onSubmit={addDelivery} className="stack-form">{Object.keys(blank).map((key) => <input key={key} required={['orderNumber','customerName','address'].includes(key)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={labelFromKey(key)} />)}<button className="primary">Create Delivery</button></form></section></div>;
}

function DeliveryTable({ state, updateStatus, editable }) {
  return <div className="responsive-table"><table><thead><tr><th>ID</th><th>Order</th><th>Customer</th><th>Status</th><th>ETA</th><th>Driver</th>{editable && <th>Update</th>}</tr></thead><tbody>{state.deliveries.map((d) => <tr key={d.id}><td>{d.id}</td><td>{d.orderNumber}</td><td>{d.customerName}</td><td><StatusBadge status={d.status} /></td><td>{d.eta}</td><td>{driverName(state, d.driverId)}</td>{editable && <td><select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)}><option>Pending</option><option>Packed</option><option>Out for Delivery</option><option>Delivered</option><option>Exception</option></select></td>}</tr>)}</tbody></table></div>;
}

function MapPanel({ state, session }) {
  const [ready, setReady] = useState(false);
  const deliveryList = session.type === 'mobile' ? state.deliveries.filter((d) => d.id === session.trackingId) : state.deliveries;

  useEffect(() => {
    if (!state.settings.googleMapsApiKey) return;
    const id = 'p4me-google-maps';
    if (window.google?.maps) { setReady(true); return; }
    if (!document.getElementById(id)) {
      const script = document.createElement('script');
      script.id = id;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(state.settings.googleMapsApiKey)}`;
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    }
  }, [state.settings.googleMapsApiKey]);

  useEffect(() => {
    if (!ready || !window.google?.maps) return;
    const center = deliveryList[0] || { lat: 37.0842, lng: -94.5133 };
    const map = new window.google.maps.Map(document.getElementById('delivery-map'), { center: { lat: center.lat, lng: center.lng }, zoom: 12 });
    deliveryList.forEach((d) => new window.google.maps.Marker({ position: { lat: d.lat, lng: d.lng }, map, title: `${d.id} ${d.status}` }));
  }, [ready, deliveryList]);

  return <section className="panel map-panel"><h3>Delivery Map</h3>{state.settings.googleMapsApiKey ? <div id="delivery-map" className="map-box" /> : <div className="map-placeholder"><MapPin size={42} /><h3>Add your Google Maps API key</h3><p>Go to Settings and paste your own key. Until then, delivery coordinates still work in table/list mode.</p></div>}</section>;
}

function Drivers({ state, updateState }) {
  const [name, setName] = useState('');
  function add(event) { event.preventDefault(); updateState((s) => ({ ...s, drivers: [...s.drivers, { id: `drv-${Date.now()}`, name, phone: '', status: 'Active' }] })); setName(''); }
  return <section className="panel"><h3>Drivers</h3><List rows={state.drivers.map((d) => `${d.name} · ${d.phone || 'No phone'} · ${d.status}`)} /><form onSubmit={add} className="inline-form"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="New driver name" required /><button className="primary">Add</button></form></section>;
}

function Customers({ state }) {
  return <section className="panel"><h3>Customers</h3><List rows={state.customers.map((c) => `${c.name} · ${c.email} · ${c.phone}`)} /></section>;
}

function Messages({ state }) {
  return <section className="panel"><h3>Delivery Updates</h3><List rows={state.messages.map((m) => `${m.title}: ${m.body}`)} /></section>;
}

function Integrations({ state }) {
  const embed = `<script src="https://your-domain.com/embed/promote4me-widget.js" data-p4me-company="${state.settings.companyName}" data-p4me-api="https://your-domain.com"></script>`;
  const iframe = `<iframe src="https://your-domain.com/?tracking=ORDER_ID" style="width:100%;height:720px;border:0;border-radius:16px"></iframe>`;
  return <div className="content-grid"><section className="panel"><h3><ShoppingBag size={20} /> Shopify Add-on</h3><p>Use the Liquid snippet in <code>shopify/promote4me-delivery-widget.liquid</code>, or paste this widget script into a theme section.</p><Code value={embed} /></section><section className="panel"><h3><Store size={20} /> WordPress Add-on</h3><p>Install the plugin folder in <code>wordpress/promote4me-delivery-monitor</code>. Shortcode: <code>[promote4me_delivery_tracker]</code>.</p><Code value={iframe} /></section></div>;
}

function SettingsPanel({ state, updateState }) {
  const [settings, setSettings] = useState(state.settings);
  function save(event) { event.preventDefault(); updateState((s) => ({ ...s, settings })); }
  function resetData() { if (confirm('Reset local Promote4.me data?')) updateState(seedState); }
  return <section className="panel form-panel"><h3><Settings size={20} /> Settings</h3><form onSubmit={save} className="stack-form"><input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} placeholder="Company name" /><label>Google Maps API Key<input value={settings.googleMapsApiKey} onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })} placeholder="Paste your own Google Maps API key" /></label><input value={settings.shopifyStoreUrl} onChange={(e) => setSettings({ ...settings, shopifyStoreUrl: e.target.value })} placeholder="Shopify store URL" /><input value={settings.wordpressSiteUrl} onChange={(e) => setSettings({ ...settings, wordpressSiteUrl: e.target.value })} placeholder="WordPress site URL" /><button className="primary"><KeyRound size={16} /> Save Settings</button></form><button className="secondary danger" onClick={resetData}><RefreshCcw size={16} /> Reset Local Data</button></section>;
}

function StatusBadge({ status }) { return <span className={`status ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>; }
function Info({ label, value }) { return <div className="info"><span>{label}</span><strong>{value || '—'}</strong></div>; }
function Code({ value }) { return <pre className="code"><code>{value}</code></pre>; }
function List({ rows }) { return <ul className="clean-list">{rows.map((row) => <li key={row}>{row}</li>)}</ul>; }
function stepIndex(status) { return ['Pending', 'Packed', 'Out for Delivery', 'Delivered'].indexOf(status); }
function driverName(state, id) { return state.drivers.find((d) => d.id === id)?.name || 'Unassigned'; }
function title(value) { return value.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' '); }
function labelFromKey(key) { return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()); }

createRoot(document.getElementById('root')).render(<App />);
