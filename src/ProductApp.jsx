import React, { useEffect, useState } from "react";
import {
  Activity, Building2, Camera, CheckCircle2, ClipboardList, CreditCard,
  Download, Edit3, KeyRound, LayoutDashboard, Lock, LogOut, Map, Plus,
  RefreshCcw, Search, Settings, ShieldCheck, ShoppingBag, Sparkles, Store,
  Trash2, Upload, Users, UserPlus, X
} from "lucide-react";

const TOKEN_KEY = "p4me-api-token";
const USER_KEY = "p4me-api-user";

const statuses = ["Assigned", "In Progress", "Submitted", "Verified", "Rejected", "Delivered", "Exception"];
const jobTypes = ["Team Promo", "Technician On-Site", "Plumber / Contractor", "Food Delivery", "Package Delivery", "Custom Proof Job"];
const deliveryServices = ["Promote4.me Direct", "Uber Eats", "DoorDash", "Instacart", "Grubhub", "Postmates", "Walmart Spark", "Amazon Flex", "Roadie", "Shipt", "Custom Courier"];
const paymentProviders = ["stripe", "paypal", "square", "venmo", "cashapp"];
const fieldRoles = ["Lead Tech", "Dispatcher", "Route Manager", "Technician", "Plumber", "Electrician", "Delivery Driver", "Flyer Team Member", "Promoter", "Contractor", "Customer Service", "Client Viewer"];

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
    ["dashboard", "Dashboard", LayoutDashboard],
    ["jobs", "Jobs & Orders", ClipboardList],
    ["review", "Evidence Review", ShieldCheck],
    ["map", "Proof Map", Map],
    ["team", "Team", Users],
    ["clients", "Clients", Building2],
    ["addons", "Add-ons", Store],
    ["settings", "Settings", Settings],
  ];

  const props = { boot, plans, reload, setNotice };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><ShieldCheck /> Promote4.me</div>
        <div className="mini-profile">
          <strong>{session.user.full_name}</strong>
          <span>{session.user.role} · {boot.tenant?.plan}</span>
        </div>
        <nav>
          {menu.map(([id, label, Icon]) => (
            <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Log out</button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">{boot.tenant?.name}</span>
            <h2>{menu.find((m) => m[0] === active)?.[1]}</h2>
          </div>
          <button className="secondary" onClick={reload}><RefreshCcw size={16} /> Refresh</button>
        </header>

        {notice && <div className="toast"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}

        {active === "dashboard" && <Dashboard boot={boot} />}
        {active === "jobs" && <Jobs {...props} />}
        {active === "review" && <EvidenceReview {...props} />}
        {active === "map" && <ProofMap boot={boot} />}
        {active === "team" && <Team {...props} />}
        {active === "clients" && <Clients {...props} />}
        {active === "addons" && <AddOns {...props} />}
        {active === "settings" && <SettingsPanel {...props} />}
      </main>
    </div>
  );
}

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
        <h1>GPS photo proof for deliveries, contractors, field teams, Shopify, and WooCommerce.</h1>
        <p>Promote4.me verifies that work happened at the right location with photo uploads, browser GPS, image GPS metadata, audit history, CRM tools, and customer tracking.</p>
        <div className="hero-actions">
          <button className="primary big" onClick={() => setMode("signup")}>Start free</button>
          <button className="secondary big" onClick={() => setMode("login")}>Log in</button>
          <button className="secondary big" onClick={authentik}>Authentik / Social Login</button>
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
    </main>
  );
}

function AuthCard({ action, onAuthed, onBack }) {
  const [form, setForm] = useState({ companyName: "", fullName: "", email: "", username: action === "login" ? "Test" : "", password: "", plan: "free" });
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
    <form className="login-card floating-card" onSubmit={submit}>
      <button type="button" className="text-button" onClick={onBack}>← Back</button>
      <div className="badge"><Lock size={18} /> {action === "login" ? "Log in" : "Create workspace"}</div>

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
    <div className="content-grid mobile-stack">
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

      <section className="panel upload-panel">
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
        <h3>Installable add-ons & delivery networks</h3>
        <div className="integration-grid">
          <Integration icon={ShoppingBag} title="Shopify stores/restaurants" text="Create Promote4.me proof/delivery jobs from Shopify orders, restaurants, retail, and local store fulfillment." />
          <Integration icon={Store} title="WooCommerce" text="WordPress/WooCommerce order import, customer tracking links, and proof history." />
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
        <h3>Payment checkout tests</h3>
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
        <h3><Settings /> Company settings</h3>
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
