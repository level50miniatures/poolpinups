"use client";

import React from "react";
import { t, LangSwitcher } from "../lib/i18n";
import { useImageUrl } from "../lib/imageUrlContext";

export const Corners = () => (
  <>
    <span className="frame-corner tl"></span>
    <span className="frame-corner tr"></span>
    <span className="frame-corner bl"></span>
    <span className="frame-corner br"></span>
  </>
);

export const Frame = ({ children, className = "", style, ...rest }) => (
  <div className={`frame ${className}`} style={style} {...rest}>
    <Corners />
    {children}
  </div>
);

export const Divider = ({ children }) => (
  <div className="divider">
    <span className="diamond"></span>
    {children && <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.32em", textTransform: "uppercase", fontSize: 11, color: "var(--gold)" }}>{children}</span>}
    {children && <span className="diamond"></span>}
  </div>
);

export const Eyebrow = ({ children }) => <div className="eyebrow">{children}</div>;

export const Pill = ({ children, dot = true }) => (
  <span className="pill">
    {dot && <span className="dot"></span>}
    {children}
  </span>
);

export const Btn = ({ children, primary, ghost, onClick, href, ...rest }) => {
  const cls = `btn ${primary ? "primary" : ""} ${ghost ? "ghost" : ""}`;
  if (href) return <a className={cls} href={href} onClick={onClick} {...rest}>{children}</a>;
  return <button className={cls} onClick={onClick} {...rest}>{children}</button>;
};

export const Stat = ({ num, label, sub }) => (
  <div>
    <div className="stat-num">{num}</div>
    <div className="mono" style={{ marginTop: 8, color: "var(--ivory-dim)" }}>{label}</div>
    {sub && <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>{sub}</div>}
  </div>
);

export const Progress = ({ value, max = 100 }) => (
  <div className="progress">
    <div className="progress-fill" style={{ width: `${(value / max) * 100}%` }}></div>
  </div>
);

export const ImageSlot = ({ id, label, placeholder, style, shape = "rect" }) => {
  const [error, setError] = React.useState(false);
  const registeredUrl = useImageUrl(id);
  const src = registeredUrl || `/images/${id}.png`;
  return (
    <div className={`art-frame shape-${shape}`} style={{ position: "relative", ...style }}>
      {!error ? (
        <img
          src={src}
          alt={placeholder || id}
          onError={() => setError(true)}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", borderRadius: shape === 'circle' ? '50%' : '0' }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", color: "var(--muted)", fontSize: 11, textAlign: "center", padding: 20, fontFamily: "var(--font-mono)" }}>
          {id}.png<br/><br/>{placeholder}
        </div>
      )}
      {label && <span className="art-label">{label}</span>}
    </div>
  );
};

export const RuneRing = () => (
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

export const Sigil = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
    <rect x="1" y="1" width="26" height="26" fill="none" stroke="var(--gold)" strokeWidth="1" />
    <rect x="11" y="11" width="6" height="6" fill="var(--gold)" transform="rotate(45 14 14)" />
    <line x1="0" y1="14" x2="6" y2="14" stroke="var(--gold)" strokeWidth="0.5" />
    <line x1="22" y1="14" x2="28" y2="14" stroke="var(--gold)" strokeWidth="0.5" />
    <line x1="14" y1="0" x2="14" y2="6" stroke="var(--gold)" strokeWidth="0.5" />
    <line x1="14" y1="22" x2="14" y2="28" stroke="var(--gold)" strokeWidth="0.5" />
  </svg>
);

export const Countdown = ({ targetMs }) => {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const time = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(time);
  }, []);
  let diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);    diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="countdown">
      <div className="unit"><div className="num">{pad(d)}</div><div className="lbl">{t("Moons")}</div></div>
      <div className="unit"><div className="num">{pad(h)}</div><div className="lbl">{t("Hours")}</div></div>
      <div className="unit"><div className="num">{pad(m)}</div><div className="lbl">{t("Minutes")}</div></div>
      <div className="unit"><div className="num">{pad(s)}</div><div className="lbl">{t("Seconds")}</div></div>
    </div>
  );
};

export const BarRow = ({ label, pct, winner }) => (
  <div className={`bar-row ${winner ? "winner" : ""}`}>
    <div className="label">{label}</div>
    <Progress value={pct} />
    <div className="pct">{pct}%</div>
  </div>
);

export const VoteCard = ({ option, selected, flipped, voted, onClick }) => {
  return (
  <div
    className={`vote-card ${flipped ? "flipped" : ""} ${selected ? "selected" : ""} ${voted ? "voted" : ""}`}
    onClick={onClick}
    style={{ aspectRatio: "3 / 4.6" }}
  >
    <div className="vote-inner">
      {/* Front */}
      <div className="vote-face">
        <div className="frame">
          {voted && <div className="voted-badge">✓ {t("YOUR VOTE")}</div>}
          <Corners />
          <div className="vote-art">
            <ImageSlot
              id={option.slotId || `vote-${option.id}`}
              shape="rect"
              placeholder={option.placeholder || `${option.title} portrait`}
            />
            <RuneRing />
          </div>
          <div className="vote-meta">
            <div className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>{t(option.kind || "Aspect")}</div>
            <h3>{t(option.title)}</h3>
            <p className="lore">{t(option.lore)}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span className="mono" style={{ color: "var(--muted)" }}>{option.tally || ""}</span>
              <span className="mono" style={{ color: "var(--gold)" }}>{flipped ? t("↩ Back") : t("Reveal →")}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Back — confirm vote */}
      <div className="vote-face vote-back">
        <div className="frame" style={{ padding: 28, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <Corners />
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t("Sigil of Choice")}</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 10px", color: "var(--gold-bright)" }}>{t(option.title)}</h3>
          <p className="lore" style={{ fontSize: 13, margin: "0 0 24px", maxWidth: 240 }}>{t(option.flavor || option.lore)}</p>
          <Divider />
          <div style={{ marginTop: 18 }}>
            <Btn primary onClick={(e) => { e.stopPropagation(); onClick && onClick({ confirm: true }); }}>
              {t("Seal Vote")}
            </Btn>
          </div>
          <div className="mono" style={{ marginTop: 16, color: "var(--muted)", fontSize: 9 }}>{t("Tap card to return")}</div>
        </div>
      </div>
    </div>
  </div>
  );
};

export const SectionHead = ({ eyebrow, title, lore, align = "center" }) => (
  <div style={{ textAlign: align, marginBottom: 40, display: "flex", flexDirection: "column", gap: 14, alignItems: align === "center" ? "center" : "flex-start" }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="h2">{title}</h2>
    {lore && <p className="lore" style={{ maxWidth: 560, margin: 0 }}>{lore}</p>}
  </div>
);

export const AppNav = ({ screen, onNav, lang, onLang }) => {
  const tabs = [
    { id: "landing", label: t("Landing") },
    { id: "login", label: t("Login") },
    { id: "dashboard", label: t("Dashboard") },
    { id: "voting", label: t("Voting") },
    { id: "results", label: t("Results") },
  ];
  return (
    <nav className="app-nav">
      <div className="brand">
        <div className="brand-logo" title={t("Drop your company logo here")}>
          <ImageSlot id="brand-logo" shape="rect" placeholder="LOGO" />
        </div>
        <span>Pool Pinups</span>
      </div>
      <div className="tabs">
        {tabs.map(tb => (
          <button
            key={tb.id}
            className={`tab ${screen === tb.id ? "active" : ""}`}
            onClick={() => onNav(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <LangSwitcher lang={lang} onChange={onLang} />
      </div>
    </nav>
  );
};
