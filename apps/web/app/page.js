const cards = [
  ["Active licenses", "—", "Live database connection pending"],
  ["Total activations", "—", "Available after API connection"],
  ["Managed products", "—", "Create your first product"],
  ["System status", "STARTER", "Configure Railway environment"]
];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="mark">V</span><div><b>VEXMOR</b><small>LICENSE SYSTEM</small></div></div>
        <nav><a className="selected">Overview</a><a>Licenses</a><a>Products</a><a>Users</a><a>Activity logs</a><a>Settings</a></nav>
        <div className="sidefoot">SECURE LICENSE CONTROL</div>
      </aside>
      <section className="content">
        <header><div><p className="eyebrow">CONTROL CENTER / OVERVIEW</p><h1>Dashboard</h1><p className="muted">Welcome to your VEXMOR workspace.</p></div><div className="status"><i/> SYSTEM STARTER</div></header>
        <div className="grid">{cards.map(([label,value,note]) => <article className="stat" key={label}><p>{label}</p><strong>{value}</strong><small>{note}</small></article>)}</div>
        <article className="panel"><div className="panelhead"><div><p className="eyebrow">GETTING STARTED</p><h2>Your license platform</h2></div><span className="tag">V1.0</span></div><p className="muted">Connect PostgreSQL and deploy the API and Discord bot on Railway to activate live license management.</p><div className="steps"><span>01&nbsp; Configure environment</span><span>02&nbsp; Deploy API + database</span><span>03&nbsp; Invite Discord bot</span></div></article>
        <footer>VEXMOR © 2026 <span>BUILT FOR YOUR PROJECTS</span></footer>
      </section>
    </main>
  );
    }
