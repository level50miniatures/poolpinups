// components.jsx — Pool Pinups shared components

const Corners = () => (
  <>
    <span className="frame-corner tl"></span>
    <span className="frame-corner tr"></span>
    <span className="frame-corner bl"></span>
    <span className="frame-corner br"></span>
  </>
);

const Frame = ({ children, className = "", style, ...rest }) => (
  <div className={`frame ${className}`} style={style} {...rest}>
    <Corners />
    {children}
  </div>
);

const Divider = ({ children }) => (
  <div className="divider">
    <span className="diamond"></span>
    {children && <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.32em", textTransform: "uppercase", fontSize: 11, color: "var(--gold)" }}>{children}</span>}
    {children && <span className="diamond"></span>}
  </div>
);

const Eyebrow = ({ children }) => <div className="eyebrow">{children}</div>;

const Pill = ({ children, dot = true }) => (
  <span className="pill">
    {dot && <span className="dot"></span>}
    {children}
  </span>
);

const Btn = ({ children, primary, ghost, onClick, href, ...rest }) => {
  const cls = `btn ${primary ? "primary" : ""} ${ghost ? "ghost" : ""}`;
  if (href) return <a className={cls} href={href} onClick={onClick} {...rest}>{children}</a>;
  return <button className={cls} onClick={onClick} {...rest}>{children}</button>;
};

const Stat = ({ num, label, sub }) => (
  <div>
    <div className="stat-num">{num}</div>
    <div className="mono" style={{ marginTop: 8, color: "var(--ivory-dim)" }}>{label}</div>
    {sub && <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>{sub}</div>}
  </div>
);

const Progress = ({ value, max = 100 }) => (
  <div className="progress">
    <div className="progress-fill" style={{ width: `${(value / max) * 100}%` }}></div>
  </div>
);

const ImageSlot = ({ id, label, placeholder, style, shape = "rect" }) => (
  <div className="art-frame" style={{ position: "relative", ...style }}>
    <image-slot
      id={id}
      shape={shape}
      placeholder={placeholder || "Drop fantasy render"}
      style={{ width: "100%", height: "100%", display: "block" }}
    ></image-slot>
    {label && <span className="art-label">{label}</span>}
  </div>
);

// Decorative SVG: subtle runic ring (simple shapes only)
const RuneRing = () => (
  <svg className="runes" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="92" fill="none" stroke="var(--gold)" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="72" fill="none" stroke="var(--gold)" strokeWidth="0.3" strokeDasharray="2 6" />
    {[0, 60, 120, 180, 240, 300].map(a => (
      <g key={a} transform={`rotate(${a} 100 100)`}>
        <rect x="98.5" y="6" width="3" height="3" fill="var(--gold)" transform="rotate(45 100 7.5)" />
      </g>
    ))}
  </svg>
);

// Sigil mark for the brand
const Sigil = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
    <rect x="1" y="1" width="26" height="26" fill="none" stroke="var(--gold)" strokeWidth="1" />
    <rect x="11" y="11" width="6" height="6" fill="var(--gold)" transform="rotate(45 14 14)" />
    <line x1="0" y1="14" x2="6" y2="14" stroke="var(--gold)" strokeWidth="0.5" />
    <line x1="22" y1="14" x2="28" y2="14" stroke="var(--gold)" strokeWidth="0.5" />
    <line x1="14" y1="0" x2="14" y2="6" stroke="var(--gold)" strokeWidth="0.5" />
    <line x1="14" y1="22" x2="14" y2="28" stroke="var(--gold)" strokeWidth="0.5" />
  </svg>
);

// Countdown timer that ticks
const Countdown = ({ targetMs }) => {
  const tr = window.t || ((s) => s);
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  let diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);    diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="countdown">
      <div className="unit"><div className="num">{pad(d)}</div><div className="lbl">{tr("Moons")}</div></div>
      <div className="unit"><div className="num">{pad(h)}</div><div className="lbl">{tr("Hours")}</div></div>
      <div className="unit"><div className="num">{pad(m)}</div><div className="lbl">{tr("Minutes")}</div></div>
      <div className="unit"><div className="num">{pad(s)}</div><div className="lbl">{tr("Seconds")}</div></div>
    </div>
  );
};

// Bar row for vote results
const BarRow = ({ label, pct, winner }) => (
  <div className={`bar-row ${winner ? "winner" : ""}`}>
    <div className="label">{label}</div>
    <Progress value={pct} />
    <div className="pct">{pct}%</div>
  </div>
);

// Voting card with flip animation
const VoteCard = ({ option, selected, flipped, onClick }) => {
  const tr = window.t || ((s) => s);
  return (
  <div
    className={`vote-card ${flipped ? "flipped" : ""} ${selected ? "selected" : ""}`}
    onClick={onClick}
    style={{ aspectRatio: "3 / 4.6" }}
  >
    <div className="vote-inner">
      {/* Front */}
      <div className="vote-face">
        <div className="frame">
          <Corners />
          <div className="vote-art">
            <image-slot
              id={`vote-${option.id}`}
              shape="rect"
              placeholder={option.placeholder || `${option.title} portrait`}
            ></image-slot>
            <RuneRing />
          </div>
          <div className="vote-meta">
            <div className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>{tr(option.kind || "Aspect")}</div>
            <h3>{tr(option.title)}</h3>
            <p className="lore">{tr(option.lore)}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span className="mono" style={{ color: "var(--muted)" }}>{option.tally || ""}</span>
              <span className="mono" style={{ color: "var(--gold)" }}>{flipped ? tr("↩ Back") : tr("Reveal →")}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Back — confirm vote */}
      <div className="vote-face vote-back">
        <div className="frame" style={{ padding: 28, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <Corners />
          <div className="eyebrow" style={{ marginBottom: 14 }}>{tr("Sigil of Choice")}</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 10px", color: "var(--gold-bright)" }}>{tr(option.title)}</h3>
          <p className="lore" style={{ fontSize: 13, margin: "0 0 24px", maxWidth: 240 }}>{tr(option.flavor || option.lore)}</p>
          <Divider />
          <div style={{ marginTop: 18 }}>
            <Btn primary onClick={(e) => { e.stopPropagation(); onClick && onClick({ confirm: true }); }}>
              {tr("Seal Vote")}
            </Btn>
          </div>
          <div className="mono" style={{ marginTop: 16, color: "var(--muted)", fontSize: 9 }}>{tr("Tap card to return")}</div>
        </div>
      </div>
    </div>
  </div>
  );
};

// Section header with eyebrow + title + lore
const SectionHead = ({ eyebrow, title, lore, align = "center" }) => (
  <div style={{ textAlign: align, marginBottom: 40, display: "flex", flexDirection: "column", gap: 14, alignItems: align === "center" ? "center" : "flex-start" }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="h2">{title}</h2>
    {lore && <p className="lore" style={{ maxWidth: 560, margin: 0 }}>{lore}</p>}
  </div>
);

// Top-level prototype nav
const AppNav = ({ screen, onNav, lang, onLang }) => {
  const tr = window.t || ((s) => s);
  const tabs = [
    { id: "landing", label: tr("Landing") },
    { id: "login", label: tr("Login") },
    { id: "dashboard", label: tr("Dashboard") },
    { id: "voting", label: tr("Voting") },
    { id: "results", label: tr("Results") },
  ];
  return (
    <nav className="app-nav">
      <div className="brand">
        <div className="brand-logo" title={tr("Drop your company logo here")}>
          <image-slot id="brand-logo" shape="rect" placeholder="LOGO"></image-slot>
        </div>
        <span>Pool Pinups</span>
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${screen === t.id ? "active" : ""}`}
            onClick={() => onNav(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {window.LangSwitcher && <window.LangSwitcher lang={lang} onChange={onLang} />}
      </div>
    </nav>
  );
};

Object.assign(window, {
  Corners, Frame, Divider, Eyebrow, Pill, Btn, Stat, Progress,
  ImageSlot, RuneRing, Sigil, Countdown, BarRow, VoteCard, SectionHead, AppNav
});
