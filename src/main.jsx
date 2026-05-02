import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Compass,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  Settings,
  ShieldCheck,
  Smartphone,
  Upload,
  Users,
} from 'lucide-react';
import './styles.css';

const demo = {
  user: {
    firstName: 'Alex',
    lastName: 'Promoter',
    role: 'Field Team',
    email: 'alex@promote4.me',
    phone: '(555) 204-2000',
  },
  admin: {
    name: 'Admin',
    company: 'Promote4.me',
    email: 'admin@promote4.me',
  },
  stats: {
    photosToday: 18,
    photosWeek: 92,
    photosMonth: 384,
    scheduledToday: 6,
    activeUsers: 14,
    locations: 22,
  },
  schedule: [
    { time: '9:00 AM', title: 'Downtown retailer visit', location: 'Main Street Market' },
    { time: '12:30 PM', title: 'Lunch rush promo', location: 'Central Plaza' },
    { time: '4:00 PM', title: 'Evening product photos', location: 'Northside Shops' },
  ],
  locations: [
    { name: 'Main Street Market', distance: '0.4 mi', status: 'Ready for check-in' },
    { name: 'Central Plaza', distance: '1.1 mi', status: 'Event scheduled today' },
    { name: 'Northside Shops', distance: '2.8 mi', status: 'Needs new photos' },
  ],
  team: [
    { name: 'Alex Promoter', role: 'Field Team', photos: 82, status: 'Online' },
    { name: 'Morgan Lead', role: 'Team Lead', photos: 120, status: 'Online' },
    { name: 'Taylor Rep', role: 'Field Team', photos: 64, status: 'Offline' },
  ],
  photos: [
    { id: 1, title: 'Shelf display', location: 'Main Street Market', by: 'Alex', status: 'Approved' },
    { id: 2, title: 'Promo table', location: 'Central Plaza', by: 'Morgan', status: 'Pending' },
    { id: 3, title: 'Window signage', location: 'Northside Shops', by: 'Taylor', status: 'Needs review' },
  ],
  messages: [
    { from: 'Morgan Lead', body: 'Please capture close-ups of the front display today.' },
    { from: 'Admin', body: 'New schedule has been published for this week.' },
  ],
};

const panels = {
  mobile: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: 'Check-In', icon: Camera },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'team', label: 'The Team', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'schedules', label: 'Schedules', icon: CalendarDays },
    { id: 'locations', label: 'Locations', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
};

function App() {
  const [portal, setPortal] = useState('home');
  const [active, setActive] = useState('dashboard');
  const [session, setSession] = useState(null);

  const login = (type) => {
    setPortal(type);
    setActive('dashboard');
    setSession({ type, token: `demo-${type}-token`, signedInAt: new Date().toISOString() });
  };

  const logout = () => {
    setSession(null);
    setPortal('home');
    setActive('dashboard');
  };

  if (portal === 'home') {
    return <Landing onLogin={login} />;
  }

  return <Shell portal={portal} active={active} setActive={setActive} session={session} logout={logout} />;
}

function Landing({ onLogin }) {
  return (
    <main className="landing">
      <section className="hero-card">
        <div className="badge"><ShieldCheck size={18} /> Promote4.me 2.0</div>
        <h1>Field promotion tracking rebuilt for today’s web.</h1>
        <p>
          The original app managed mobile photo check-ins, nearby locations, schedules, messages, team members,
          and admin reporting. This 2.0 restores those workflows with a modern responsive front end and a clean split
          between mobile users and administrators.
        </p>
        <div className="portal-grid">
          <button className="portal-card" onClick={() => onLogin('mobile')}>
            <Smartphone size={42} />
            <span>Mobile Dashboard</span>
            <small>For field teams: check in, upload photos, find nearby locations, message teammates.</small>
            <b>Enter Mobile <ChevronRight size={18} /></b>
          </button>
          <button className="portal-card admin-card" onClick={() => onLogin('admin')}>
            <LayoutDashboard size={42} />
            <span>Admin Dashboard</span>
            <small>For managers: review photos, track schedules, manage users, monitor performance.</small>
            <b>Enter Admin <ChevronRight size={18} /></b>
          </button>
        </div>
      </section>
    </main>
  );
}

function Shell({ portal, active, setActive, session, logout }) {
  const menu = panels[portal];
  const title = portal === 'mobile' ? 'Mobile Dashboard' : 'Admin Dashboard';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Home size={24} /> Promote4.me</div>
        <nav>
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Log out</button>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">{title}</span>
            <h2>{labelFor(active)}</h2>
          </div>
          <div className="session-pill"><Lock size={16} /> Demo token active</div>
        </header>
        <Content portal={portal} active={active} session={session} />
      </section>
    </div>
  );
}

function Content({ portal, active }) {
  if (active === 'dashboard') return <Dashboard portal={portal} />;
  if (active === 'checkin') return <CheckIn />;
  if (active === 'locations') return <Locations />;
  if (active === 'team' || active === 'users') return <Team admin={active === 'users'} />;
  if (active === 'messages') return <Messages />;
  if (active === 'settings') return <SettingsPanel portal={portal} />;
  if (active === 'photos') return <Photos />;
  if (active === 'schedules') return <Schedules />;
  return <Dashboard portal={portal} />;
}

function Dashboard({ portal }) {
  const cards = useMemo(() => [
    ['Photos Today', demo.stats.photosToday, Camera],
    ['Photos This Week', demo.stats.photosWeek, BarChart3],
    ['Photos This Month', demo.stats.photosMonth, CheckCircle2],
    [portal === 'admin' ? 'Active Users' : 'Scheduled Today', portal === 'admin' ? demo.stats.activeUsers : demo.stats.scheduledToday, CalendarDays],
  ], [portal]);

  return (
    <div className="content-grid">
      <section className="stat-grid">
        {cards.map(([label, value, Icon]) => (
          <article className="stat-card" key={label}><Icon size={24} /><span>{label}</span><strong>{value}</strong></article>
        ))}
      </section>
      <section className="panel wide">
        <h3>Today’s Schedule</h3>
        <List rows={demo.schedule.map((item) => `${item.time} — ${item.title} · ${item.location}`)} />
      </section>
      <section className="panel">
        <h3>Recent Messages</h3>
        <List rows={demo.messages.map((msg) => `${msg.from}: ${msg.body}`)} />
      </section>
    </div>
  );
}

function CheckIn() {
  const [fileName, setFileName] = useState('No photo selected');
  return (
    <section className="panel action-panel">
      <Camera size={48} />
      <h3>Photo Check-In</h3>
      <p>Restores the legacy mobile upload flow with browser geolocation and photo proof for each location visit.</p>
      <label className="upload-box">
        <Upload size={22} /> {fileName}
        <input type="file" accept="image/*" onChange={(event) => setFileName(event.target.files?.[0]?.name || 'No photo selected')} />
      </label>
      <button className="primary">Submit Check-In</button>
    </section>
  );
}

function Locations() {
  return <section className="panel"><h3>Nearby Locations</h3><List rows={demo.locations.map((l) => `${l.name} · ${l.distance} · ${l.status}`)} /></section>;
}

function Team({ admin }) {
  return <section className="panel"><h3>{admin ? 'User Management' : 'The Team'}</h3><List rows={demo.team.map((m) => `${m.name} · ${m.role} · ${m.photos} photos · ${m.status}`)} /></section>;
}

function Messages() {
  return <section className="panel"><h3>Messages</h3><List rows={demo.messages.map((m) => `${m.from}: ${m.body}`)} /><textarea placeholder="Write a team message..." /><button className="primary">Send Message</button></section>;
}

function Photos() {
  return <section className="panel"><h3>Photo Review</h3><List rows={demo.photos.map((p) => `${p.title} · ${p.location} · ${p.by} · ${p.status}`)} /></section>;
}

function Schedules() {
  return <section className="panel"><h3>Schedules</h3><List rows={demo.schedule.map((s) => `${s.time} · ${s.title} · ${s.location}`)} /><button className="primary">Create Schedule</button></section>;
}

function SettingsPanel({ portal }) {
  const profile = portal === 'admin' ? demo.admin : demo.user;
  return (
    <section className="panel form-panel">
      <h3>Settings</h3>
      <input defaultValue={profile.name || `${profile.firstName} ${profile.lastName}`} />
      <input defaultValue={profile.email} />
      {'phone' in profile && <input defaultValue={profile.phone} />}
      <button className="primary">Save Settings</button>
    </section>
  );
}

function List({ rows }) {
  return <ul className="clean-list">{rows.map((row) => <li key={row}>{row}</li>)}</ul>;
}

function labelFor(active) {
  return active.replace(/(^|-)\w/g, (value) => value.toUpperCase()).replace('-', ' ');
}

createRoot(document.getElementById('root')).render(<App />);
