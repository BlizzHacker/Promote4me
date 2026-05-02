import fs from 'fs';

const appPath = 'src/ProductApp.jsx';
let s = fs.readFileSync(appPath, 'utf8');

s = s.replace(
  'username: action === "login" ? "Test" : "", password: ""',
  'username: action === "login" ? "Test" : "", password: action === "login" ? "TestUser123!" : ""'
);

if (!s.includes('Tour the live demo')) {
  s = s.replace(
`        <div className="hero-actions">
          <button className="primary big" onClick={() => setMode("signup")}>Start free</button>
          <button className="secondary big" onClick={() => setMode("login")}>Log in</button>
          <button className="secondary big" onClick={authentik}>Authentik / Social Login</button>
        </div>`,
`        <div className="hero-actions">
          <button className="primary big" onClick={() => setMode("signup")}>Start free</button>
          <button className="secondary big" onClick={() => setMode("login")}>Log in</button>
          <button className="secondary big" onClick={authentik}>Authentik / Social Login</button>
        </div>

        <div className="demo-tour-box">
          <h2>Tour the live demo</h2>
          <p>Password for every demo role: <strong>TestUser123!</strong></p>
          <div className="demo-login-grid">
            <article><strong>Demo Admin</strong><span>Test</span><small>Companies, teams, users, jobs, proof review</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
            <article><strong>Demo Manager</strong><span>TestManager</span><small>Dispatch, routes, CRM, evidence approvals</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
            <article><strong>Demo Field Member</strong><span>TestMember</span><small>Mobile proof upload and assigned work</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
            <article><strong>Demo Client</strong><span>TestClient</span><small>Customer proof and order history</small><button className="primary" onClick={() => setMode("login")}>Demo</button></article>
          </div>
        </div>`
  );
}

if (!s.includes('function isMoveweightOwner')) {
  s = s.replace(
`function Dashboard({ boot }) {`,
`function isMoveweightOwner(user) {
  return user?.role === "super_admin" &&
    (user.username === "moveweight" || user.email === "me@moveweight.com" || user.email === "wadeivy11@gmail.com");
}

function HierarchyConsole({ boot, user }) {
  const owner = isMoveweightOwner(user);
  const clients = boot.clients || [];
  const teams = boot.teams || [];
  const users = boot.users || [];
  const members = boot.teamMembers || [];

  return (
    <div className="content-grid">
      <section className="panel wide">
        <h3>{owner ? "Clients > Companies > Teams > Users" : "Companies > Teams > Users"}</h3>
        <p className="hint">
          {owner
            ? "Only moveweight / Wade sees product-owner hierarchy. Paying customer admins start at Companies."
            : "Admin view for companies, teams, managers, field users, and clients."}
        </p>

        <div className="stat-grid">
          <Stat icon={Building2} label={owner ? "Clients" : "Companies"} value={owner ? clients.length : 1} />
          <Stat icon={Store} label="Companies" value={1} />
          <Stat icon={Users} label="Teams" value={teams.length} />
          <Stat icon={UserPlus} label="Users" value={users.length} />
        </div>

        <div className="hierarchy-tree">
          <article><h4>{owner ? "Client account" : "Company"}</h4><strong>{boot.tenant?.name}</strong><p>{boot.tenant?.plan} plan</p></article>
          <article><h4>Teams</h4>{teams.map((team) => <div className="tree-row" key={team.id}>{team.name}<span>{members.filter((member) => member.team_id === team.id).length} people</span></div>)}</article>
          <article><h4>Users</h4>{users.map((u) => <div className="tree-row" key={u.id}>{u.full_name}<span>{u.role}</span></div>)}</article>
          <article><h4>Clients</h4>{clients.map((client) => <div className="tree-row" key={client.id}>{client.name}<span>{client.address}</span></div>)}</article>
        </div>
      </section>
    </div>
  );
}

function Dashboard({ boot }) {`
  );
}

s = s.replace(
  '["dashboard", "Dashboard", LayoutDashboard],',
  '["dashboard", session.user?.role === "super_admin" ? "Super Admin" : "Dashboard", LayoutDashboard],\n    ["hierarchy", session.user?.role === "super_admin" ? "Clients > Companies > Teams > Users" : "Companies > Teams > Users", Building2],'
);

s = s.replace(
  '{active === "dashboard" && <Dashboard boot={boot} />}',
  '{active === "dashboard" && <Dashboard boot={boot} />}\n        {active === "hierarchy" && <HierarchyConsole boot={boot} user={session.user} />}'
);

fs.writeFileSync(appPath, s);

const cssPath = 'src/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('HIERARCHY DEMO PATCH')) {
  css += `

/* HIERARCHY DEMO PATCH */
.demo-tour-box{margin-top:24px;padding:22px;border-radius:24px;border:1px solid rgba(125,211,252,.26);background:linear-gradient(135deg,rgba(56,189,248,.13),rgba(124,58,237,.12))}
.demo-tour-box h2{margin:0 0 8px;color:#fff}
.demo-login-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:16px}
.demo-login-grid article{border:1px solid rgba(125,211,252,.22);background:rgba(14,165,233,.10);border-radius:18px;padding:16px;display:grid;gap:8px}
.demo-login-grid strong{color:#fff}
.demo-login-grid span{color:#7dd3fc;font-size:20px;font-weight:900}
.hierarchy-tree{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:18px}
.hierarchy-tree article{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);border-radius:18px;padding:16px}
.tree-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}
.tree-row span{color:#9fb5ca;font-size:12px;text-align:right}
`;
}

fs.writeFileSync(cssPath, css);
console.log("Applied hierarchy/demo homepage patch.");
