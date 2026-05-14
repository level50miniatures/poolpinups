"use client";

import React from "react";
import { t } from "../lib/i18n";
import {
  Btn, Corners, Frame, Divider, Eyebrow, Pill, Stat, Progress, ImageSlot, RuneRing, Sigil, Countdown, BarRow, VoteCard, SectionHead
} from "./Components";

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const NEXT_REVEAL = Date.now() + (2 * 86400000) + (7 * 3600000) + (42 * 60000);

export const LandingScreen = ({ onNav, ksUrl, phases = [], settings = {} }) => {
  const heroEyebrow = settings.heroEyebrow || "Chapter II · Anno Forge MMXXVI";
  const heroTitleLines = (settings.heroTitle || "Forge\nthe Next\nHeroine").split("\n");
  const heroLore = settings.heroLore || "Backers of the realm summon the next fantasy pinup, vote by vote — race, blade, vow, and pose — until she is sealed in resin and shipped to your shelf.";
  const heroBanner = settings.heroBanner || "";
  const heroPrimaryBtn = settings.heroPrimaryBtn || "◆ Back on Kickstarter ↗";
  const heroSecondaryBtn = settings.heroSecondaryBtn || "Join the Vote";
  const ctaButton = settings.ctaButton || "Cast Your Voice";

  const heroTitleNode = (
    <>
      {heroTitleLines.map((line, i) => (
        <React.Fragment key={i}>
          {i === heroTitleLines.length - 1 ? <span className="gold">{line}</span> : line}
          {i < heroTitleLines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );

  const totalVotes = phases.reduce((acc, p) => acc + (p.options || []).reduce((s, o) => s + (o.tally || 0), 0), 0);
  const sealedCount = phases.filter(p => p.status === "SEALED").length;
  const totalPhases = phases.length;
  const activePhases = phases.filter(p => p.status === "ACTIVE");
  const activeVotes = activePhases.reduce((acc, p) => acc + (p.options || []).reduce((s, o) => s + (o.tally || 0), 0), 0);
  const activeOptionsCount = activePhases.reduce((acc, p) => acc + (p.options?.length || 0), 0);
  const soonestActive = activePhases
    .filter(p => p.closesAt)
    .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())[0] || null;
  const soonestActiveMs = soonestActive ? new Date(soonestActive.closesAt).getTime() : null;

  return (
  <div className="screen active">
    <div className="shell">
      <section className="hero">
        <div className="hero-side">
          <Eyebrow>{heroEyebrow}</Eyebrow>
          <h1 className="h1 hero-title-desktop">
            {heroTitleNode}
          </h1>
          <p className="lore" style={{ fontSize: 17, maxWidth: 360, whiteSpace: "pre-line" }}>
            {heroLore}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
            <a href={ksUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn primary>{heroPrimaryBtn}</Btn>
            </a>
            <Btn onClick={() => onNav("voting")}>{heroSecondaryBtn}</Btn>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 30, flexWrap: "wrap" }}>
            <Stat num={totalVotes.toLocaleString()} label={t("Voices Pledged")} />
            <Stat num={totalPhases > 0 ? `${sealedCount} / ${totalPhases}` : "—"} label={t("Phases Forged")} />
          </div>
        </div>

        <div className="hero-tarot">
          <h1 className="h1 hero-title-mobile">{heroTitleNode}</h1>
          <div className="tarot-frame">
            <ImageSlot id="hero-pinup" shape="rect" placeholder={t("HEROINE — drop hero render")} />
            <RuneRing />
          </div>
          {heroBanner && <div className="tarot-banner">{heroBanner}</div>}
        </div>

        <div className="hero-side right" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {activePhases.length === 0 && (
            <p className="lore" style={{ textAlign: "right", color: "var(--muted)" }}>
              {t("The council rests. New phase soon.")}
            </p>
          )}
          {activePhases.map(phase => {
            const phaseVotes = (phase.options || []).reduce((s, o) => s + (o.tally || 0), 0);
            const closesAtMs = phase.closesAt ? new Date(phase.closesAt).getTime() : null;
            return (
              <div key={phase.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <Pill>● {phase.eyebrow || t("Live")}</Pill>
                <h3 className="h3" style={{ textAlign: "right", margin: 0 }} dangerouslySetInnerHTML={{ __html: phase.title }} />
                <p className="lore" style={{ fontSize: 14, maxWidth: 280, textAlign: "right", margin: 0 }}>
                  {phase.lore}
                </p>
                {closesAtMs && (
                  <Frame className="deep" style={{ padding: 20, width: "100%", maxWidth: 300 }}>
                    <div className="mono" style={{ color: "var(--gold)", marginBottom: 10 }}>{phase.title} · {t("Closes in")}</div>
                    <Countdown targetMs={closesAtMs} />
                    <div className="mono" style={{ color: "var(--muted)", marginTop: 10, fontSize: 9 }}>{phaseVotes.toLocaleString()} {t("voices cast")}</div>
                  </Frame>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {phases.length > 0 && (
        <>
          <Divider>{t("The Process")}</Divider>

          <section style={{ marginTop: 60 }}>
            <SectionHead
              eyebrow={settings.processEyebrow || "The Rite of Forging"}
              title={settings.processTitle || "Councils · One Heroine"}
              lore={settings.processLore || ""}
            />
            <div className={phases.length <= 3 ? "grid-3" : "grid-4"}>
              {phases.map((p, idx) => {
                const state = p.status === "SEALED" ? "sealed" : p.status === "ACTIVE" ? "active" : "locked";
                const sorted = [...(p.options || [])].sort((a, b) => (b.tally || 0) - (a.tally || 0));
                const winner = state === "sealed" && sorted[0] ? sorted[0].title : null;
                return (
                  <Frame key={p.id} className={state === "active" ? "deep" : ""} style={{ padding: 32 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--gold-bright)", lineHeight: 1, marginBottom: 12, textShadow: state === "active" ? "0 0 20px var(--accent-glow)" : "none" }}>
                      {ROMAN[idx] || idx + 1}
                    </div>
                    <h3 className="h3" style={{ marginBottom: 10 }}>{p.title}</h3>
                    <p className="lore">{p.lore}</p>
                    <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="mono" style={{
                        color: state === "sealed" ? "var(--gold)" : state === "active" ? "var(--crimson-glow)" : "var(--muted)"
                      }}>
                        {state === "sealed" ? `${t("Sealed")} · ${winner || "—"}` : state === "active" ? t("Council in session") : t("Sealed by oath")}
                      </span>
                    </div>
                  </Frame>
                );
              })}
            </div>
          </section>
        </>
      )}

      {phases.length > 0 && (
        <section style={{ marginTop: 100 }}>
          <SectionHead eyebrow={settings.forgeLedgerEyebrow || "The Forge Ledger"} title={settings.forgeLedgerTitle || "What the Council has Decreed"} />
          <Frame style={{ padding: 36 }}>
            <div className={phases.length <= 3 ? "grid-3" : "grid-4"} style={{ gap: 32 }}>
              {phases.map(p => {
                const sorted = [...(p.options || [])].sort((a, b) => (b.tally || 0) - (a.tally || 0));
                const totalP = sorted.reduce((s, o) => s + (o.tally || 0), 0);
                const winner = sorted[0];
                const winnerPct = winner && totalP > 0 ? (winner.tally / totalP) * 100 : 0;

                if (p.status === "SEALED") {
                  return (
                    <div key={p.id}>
                      <div className="mono" style={{ color: "var(--muted)", marginBottom: 8 }}>{p.title} · {t("Sealed")}</div>
                      <h3 className="h3" style={{ color: "var(--gold-bright)" }}>{winner ? winner.title : "—"}</h3>
                      <p className="lore" style={{ marginTop: 8 }}>
                        {winner ? `${t("Won with")} ${winnerPct.toFixed(1)}% ${t("of")} ${totalP.toLocaleString()} ${t("voices")}.` : t("No votes recorded.")}
                        {winner?.lore ? ` ${winner.lore}` : ""}
                      </p>
                      <div style={{ marginTop: 16 }}><Progress value={100} /></div>
                    </div>
                  );
                }
                if (p.status === "ACTIVE") {
                  return (
                    <div key={p.id}>
                      <div className="mono" style={{ color: "var(--crimson-glow)", marginBottom: 8 }}>● {p.title} · {t("In Council")}</div>
                      <h3 className="h3">{p.eyebrow || p.title}</h3>
                      <p className="lore" style={{ marginTop: 8 }}>
                        {totalP.toLocaleString()} {t("voices have spoken so far.")} {winner ? `${winner.title} ${t("leads.")}` : ""}
                      </p>
                      <div style={{ marginTop: 16 }}><Progress value={Math.min(100, winnerPct)} /></div>
                    </div>
                  );
                }
                return (
                  <div key={p.id}>
                    <div className="mono" style={{ color: "var(--muted)", marginBottom: 8 }}>{p.title} · {t("Sealed by Oath")}</div>
                    <h3 className="h3" style={{ color: "var(--muted)" }}>{t("Locked")}</h3>
                    <p className="lore" style={{ marginTop: 8, color: "var(--hush)" }}>
                      {t("This council convenes after the current phase has turned.")}
                    </p>
                    <div style={{ marginTop: 16 }}><Progress value={0} /></div>
                  </div>
                );
              })}
            </div>
          </Frame>
        </section>
      )}

      {settings.lastRevealShow !== false && (
        <section style={{ marginTop: 100 }}>
          <SectionHead
            eyebrow={settings.lastRevealEyebrow || "The Last Reveal"}
            title={settings.lastRevealTitle || "Sister of the Crimson Vow"}
            lore={settings.lastRevealLore || ""}
          />
          <Frame className="deep" style={{ padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", minHeight: 460 }} className="featured-grid">
              <div style={{ position: "relative", borderRight: "1px solid var(--gold-faint)" }}>
                <ImageSlot id="featured-mini" label={settings.lastRevealImageLabel || ""} placeholder={t("Drop painted miniature on white")} style={{ width: "100%", height: "100%", minHeight: 440 }} />
              </div>
              <div style={{ padding: 44, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                {settings.lastRevealCardEyebrow && <Eyebrow>{settings.lastRevealCardEyebrow}</Eyebrow>}
                {settings.lastRevealCardTitle && (
                  <h3 className="h2">
                    {settings.lastRevealCardTitle.split("\n").map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h3>
                )}
                {settings.lastRevealCardLore && (
                  <p className="lore" style={{ whiteSpace: "pre-line" }}>{settings.lastRevealCardLore}</p>
                )}
                {settings.lastRevealTags && (
                  <div className="mono" style={{ display: "flex", gap: 20, color: "var(--gold)", marginTop: 8, flexWrap: "wrap" }}>
                    {settings.lastRevealTags.split("\n").map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                      <span key={i}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Frame>
        </section>
      )}

      {soonestActive && soonestActiveMs && (
        <section style={{ marginTop: 120, textAlign: "center" }}>
          <Eyebrow>{soonestActive.eyebrow || `${soonestActive.title} · ${t("Closes")}`}</Eyebrow>
          <h2 className="h2" style={{ margin: "16px 0 32px" }}>{t("The moon turns in")}</h2>
          <Countdown targetMs={soonestActiveMs} />
          <div style={{ marginTop: 32 }}>
            <Btn primary onClick={() => onNav("voting")}>{ctaButton}</Btn>
          </div>
        </section>
      )}

      {totalPhases > 0 && (
        <section style={{ marginTop: 120 }}>
          <SectionHead eyebrow={settings.councilEyebrow || "The Council"} title={settings.councilTitle || "Voices in the Hall"} />
          <div className="grid-4">
            <Frame style={{ padding: 28 }}>
              <Stat num={totalVotes.toLocaleString()} label={t("Total Votes")} sub={t("across all phases")} />
            </Frame>
            <Frame style={{ padding: 28 }}>
              <Stat num={`${sealedCount} / ${totalPhases}`} label={t("Phases Sealed")} sub={t("of all forged")} />
            </Frame>
            <Frame style={{ padding: 28 }}>
              <Stat num={activeVotes.toLocaleString()} label={t("Votes in Council")} sub={activePhases.length > 0 ? `${activePhases.length} ${activePhases.length === 1 ? t("active phase") : t("active phases")}` : t("no phase open")} />
            </Frame>
            <Frame style={{ padding: 28 }}>
              <Stat num={activeOptionsCount || "—"} label={t("Sigils on the Table")} sub={activePhases.length > 0 ? t("currently in play") : t("rest")} />
            </Frame>
          </div>
        </section>
      )}
    </div>
  </div>
  );
};

import { login } from "../app/actions/auth";

export const LoginScreen = ({ onNav, onLogin }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const res = await login(email, password);
    if (res.error) {
      alert(res.error);
      return;
    }
    if (onLogin) onLogin(res.email, res.id);
    onNav("dashboard");
  };

  return (
    <div className="screen active">
      <div className="shell narrow" style={{ paddingTop: 90, minHeight: "80vh" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <div style={{ width: 64, height: 64, border: "1px solid var(--gold)", background: "var(--surface-1)" }}>
              <ImageSlot id="login-logo" shape="rect" placeholder="LOGO" style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          </div>
          <Eyebrow>{t("The Threshold")}</Eyebrow>
          <h1 className="h2" style={{ margin: "14px 0 12px" }}>{t("Enter the Hall")}</h1>
          <p className="lore" style={{ maxWidth: 460, margin: "0 auto" }}>
            {t("Use the email and password the council granted you.")}
          </p>
        </div>

        <Frame className="deep" style={{ padding: 36 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="mono" style={{ color: "var(--gold)", display: "block", marginBottom: 8 }}>{t("Email")}</label>
              <input
                type="email"
                className="input"
                placeholder="your.name@kingdom.realm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="mono" style={{ color: "var(--gold)", display: "block", marginBottom: 8 }}>{t("Password")}</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="mono" style={{ color: "var(--muted)", marginTop: 6, fontSize: 9 }}>
                {t("Granted to you by the council. Do not share it.")}
              </p>
            </div>
            <div className="divider" style={{ margin: "4px 0" }}>
              <span className="diamond"></span>
            </div>
            <Btn primary type="submit">{t("Enter the Hall →")}</Btn>
          </form>
        </Frame>

        <div style={{
          marginTop: 22,
          padding: "16px 20px",
          border: "1px solid var(--gold-faint)",
          background: "rgba(201,165,88,0.04)",
          textAlign: "center",
        }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.28em", marginBottom: 8 }}>
            ◆ {t("RULE OF THE COUNCIL")}
          </div>
          <p className="lore" style={{ fontSize: 13, margin: 0 }}>
            {t("One email · one voice. You may change your vote freely until the moon turns — but you cannot cast twice with the same name.")}
          </p>
        </div>

        <p className="mono" style={{ textAlign: "center", color: "var(--muted)", marginTop: 22, fontSize: 9 }}>
          {t("By entering, you swear no oath but to vote with care.")}
        </p>
      </div>
    </div>
  );
};

export const DashboardScreen = ({ onNav, userEmail, activePhases = [], phases = [], userVotes = {} }) => {
  const name = userEmail ? userEmail.split('@')[0] : "";
  const displayEmail = userEmail || "";

  const sealedCount = phases.filter(p => p.status === 'SEALED').length;
  const totalVotes = phases.reduce((acc, p) => acc + p.options.reduce((sum, o) => sum + o.tally, 0), 0);
  const soonestActive = activePhases
    .filter(p => p.closesAt)
    .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())[0] || null;
  const soonestActiveMs = soonestActive ? new Date(soonestActive.closesAt).getTime() : null;

  return (
  <div className="screen active">
    <div className="shell">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
        <div>
          <Eyebrow>{t("Hall of the Forge · Returning Voice")}</Eyebrow>
          {userEmail ? (
            <h1 className="h2" style={{ margin: "12px 0 0" }}>{t("Welcome back,")} <span className="gold">{name}</span></h1>
          ) : (
            <h1 className="h2" style={{ margin: "12px 0 0" }}>{t("Welcome to the Forge")}</h1>
          )}
        </div>
        {userEmail && (
          <div className="user-badge">
            <div className="crest">{name[0].toUpperCase()}</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.06em" }}>{displayEmail}</div>
              <div className="mono" style={{ color: "var(--muted)", marginTop: 4, fontSize: 9 }}>{t("Voices cast:")} {totalVotes} · {t("Phases sealed:")} {sealedCount}</div>
            </div>
          </div>
        )}
      </div>

      <Frame className="deep" style={{ padding: 28, marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 14 }}>
          <div className="mono" style={{ color: "var(--gold)" }}>{t("Your Forge Progress")}</div>
          <div className="mono" style={{ color: "var(--ivory-dim)" }}>{sealedCount} {t("of")} {phases.length} {t("phases")}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(phases.length, 1)}, 1fr)`, gap: 6 }}>
          {phases.map((p, i) => (
            <div key={i} style={{
              height: 8,
              background: p.status === 'SEALED' ? "linear-gradient(90deg, var(--crimson-deep), var(--crimson-glow))" : p.status === 'ACTIVE' ? "rgba(184,48,64,0.4)" : "var(--surface-3)",
              border: "1px solid " + (p.status !== 'PENDING' ? "var(--gold-faint)" : "rgba(201,165,88,0.1)"),
              boxShadow: p.status === 'ACTIVE' ? "0 0 calc(12px * var(--glow-strength)) var(--accent-glow)" : "none",
            }}></div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span className="mono" style={{ color: "var(--muted)", fontSize: 9 }}>{phases.map(p => p.name.toUpperCase()).join(" · ")}</span>
        </div>
      </Frame>

      {activePhases.length === 0 ? (
        <Frame className="deep" style={{ padding: 36, marginBottom: 40, textAlign: "center" }}>
          <Eyebrow>{t("The Council Rests")}</Eyebrow>
          <p className="lore" style={{ marginTop: 12 }}>{t("No active phases right now. Check back soon.")}</p>
        </Frame>
      ) : (
        activePhases.map(phase => {
          const phaseClosesMs = phase.closesAt ? new Date(phase.closesAt).getTime() : null;
          const phaseOptions = phase.options || [];
          const phaseTallyTotal = phaseOptions.reduce((s, o) => s + (o.tally || 0), 0);
          const phaseVotedId = userVotes[phase.id] || null;
          return (
            <Frame key={phase.id} className="deep" style={{ padding: 0, marginBottom: 40, overflow: "hidden" }}>
              <div style={{ padding: "32px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <Eyebrow>{phase.eyebrow}</Eyebrow>
                  <h2 className="h2" style={{ margin: "10px 0 8px" }} dangerouslySetInnerHTML={{ __html: phase.title }} />
                  <p className="lore" style={{ maxWidth: 540 }}>{phase.lore}</p>
                </div>
                {phaseClosesMs && (
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ color: "var(--muted)" }}>{t("Closes in")}</div>
                    <Countdown targetMs={phaseClosesMs} />
                  </div>
                )}
              </div>

              <div className="grid-4" style={{ padding: "28px 36px 36px", gap: 18 }}>
                {(phase.options || []).map(o => (
                  <div key={o.id} className="vote-card" onClick={() => onNav("voting")} style={{ aspectRatio: "3/4.4" }}>
                    <div className="vote-inner">
                      <div className="vote-face">
                        <div className="frame">
                          <Corners />
                          <div className="vote-art">
                            <ImageSlot id={o.slotId || `dash-${o.id}`} placeholder={`${o.title} portrait`} />
                            <RuneRing />
                          </div>
                          <div className="vote-meta">
                            <h3>{o.title}</h3>
                            <p className="lore">{o.lore}</p>
                            <div className="mono" style={{ color: "var(--gold)", display: "flex", justifyContent: "space-between" }}>
                              <span>{o.tally || "0"} {t("voices")}</span><span>{t("Vote →")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {phase.options.length === 0 && (
                  <p className="lore" style={{ color: "var(--muted)" }}>{t("No options currently available.")}</p>
                )}
              </div>

              {phaseOptions.length > 0 && (
                <div style={{ padding: "0 36px 32px" }}>
                  <Divider />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    <Eyebrow>{phase.title} · {t("Live Tally")}</Eyebrow>
                    <span className="mono" style={{ color: "var(--muted)", fontSize: 9 }}>{phaseTallyTotal.toLocaleString()} {t("voices cast")}</span>
                  </div>
                  {phaseTallyTotal === 0 ? (
                    <p className="lore" style={{ fontSize: 13, marginTop: 8 }}>{t("No votes yet. Be the first to cast.")}</p>
                  ) : (
                    <div style={{ marginTop: 12 }}>
                      {[...phaseOptions]
                        .sort((a, b) => (b.tally || 0) - (a.tally || 0))
                        .map(opt => {
                          const tally = opt.tally || 0;
                          const pct = Math.round((tally / phaseTallyTotal) * 100);
                          return (
                            <BarRow
                              key={opt.id}
                              label={`${opt.title} · ${tally}`}
                              pct={pct}
                              winner={phaseVotedId === opt.id}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </Frame>
          );
        })
      )}

      <div className="grid-2" style={{ marginBottom: 40 }}>
        <Frame style={{ padding: 32 }}>
          <Eyebrow>{t("The Ledger")}</Eyebrow>
          <h3 className="h3" style={{ marginTop: 12, marginBottom: 18 }}>{t("All Phases")}</h3>
          {phases.length === 0 && <p className="lore text-sm">{t("No phases created yet.")}</p>}
          {phases.map((p, idx) => {
            const isSealed = p.status === 'SEALED';
            const isActive = p.status === 'ACTIVE';
            const isPending = p.status === 'PENDING';
            const pVotes = p.options.reduce((sum, o) => sum + (o.tally || 0), 0);
            const winner = isSealed && p.options.length > 0
              ? p.options.reduce((max, o) => (o.tally || 0) > (max.tally || 0) ? o : max, p.options[0])
              : null;
            const pct = isSealed && pVotes > 0 && winner ? Math.round((winner.tally / pVotes) * 100) + "%" : "—";
            const statusLabel = isSealed
              ? (winner ? winner.title : t("No votes"))
              : isActive
                ? t("In Council")
                : t("Pending");
            const numColor = isActive ? "var(--crimson-glow)" : isPending ? "var(--muted)" : "var(--gold)";

            return (
              <div key={p.id} style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr auto",
                gap: 16,
                padding: "16px 0",
                borderTop: "1px solid rgba(201,165,88,0.08)",
                alignItems: "center",
                opacity: isPending ? 0.6 : 1,
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: numColor }}>{idx + 1}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: "0.06em" }}>{p.title}</div>
                  <div className="mono" style={{ color: isActive ? "var(--crimson-glow)" : "var(--muted)", marginTop: 2, fontSize: 9 }}>
                    {statusLabel}
                  </div>
                </div>
                <div className="mono" style={{ color: "var(--gold)" }}>{pct}</div>
              </div>
            );
          })}
        </Frame>

        <Frame className="deep" style={{ padding: 32 }}>
          <Eyebrow>{soonestActive ? soonestActive.eyebrow || t("Next Reveal") : t("Next Reveal")}</Eyebrow>
          <h3 className="h3" style={{ marginTop: 12, marginBottom: 22 }}>{soonestActiveMs ? t("The moon turns in") : t("No phase closing soon")}</h3>
          {soonestActiveMs ? (
            <Countdown targetMs={soonestActiveMs} />
          ) : (
            <p className="lore" style={{ fontSize: 13 }}>{t("Set a closing time for a phase from the admin panel.")}</p>
          )}
          <div style={{ marginTop: 24 }}>
            <Btn primary onClick={() => onNav("voting")}>{t("Cast Your Voice")}</Btn>
          </div>
        </Frame>
      </div>

      {phases.filter(p => p.status === 'SEALED').length > 0 && (() => {
        const sealed = phases.filter(p => p.status === 'SEALED');
        const lastSealed = sealed[sealed.length - 1];
        const options = [...lastSealed.options].sort((a, b) => (b.tally || 0) - (a.tally || 0));
        const totalVotes = options.reduce((sum, o) => sum + (o.tally || 0), 0);
        return (
          <Frame style={{ padding: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
              <div>
                <Eyebrow>{t(lastSealed.name)} · {t("Sealed")}</Eyebrow>
                <h3 className="h3" style={{ marginTop: 10 }}>{t(lastSealed.title)}</h3>
              </div>
              <div className="mono" style={{ color: "var(--muted)" }}>{totalVotes} {t("voices")}</div>
            </div>
            <Divider />
            <div style={{ marginTop: 12 }}>
              {options.slice(0, 4).map((o, i) => (
                 <BarRow key={o.id} label={t(o.title)} pct={totalVotes > 0 ? Math.round((o.tally / totalVotes) * 100) : 0} winner={i === 0} />
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Btn ghost onClick={() => onNav("results")}>{t("View full results →")}</Btn>
            </div>
          </Frame>
        );
      })()}
    </div>
  </div>
  );
};

import { castVote } from "../app/actions/vote";

const PhaseVoteBlock = ({ phase, userId, onNav, flipSoundUrl, votedOptionId }) => {
  const [flippedId, setFlippedId] = React.useState(null);
  const [confirmed, setConfirmed] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());
  const [localVote, setLocalVote] = React.useState(votedOptionId);
  const [tallyBumps, setTallyBumps] = React.useState({});
  const flipAudioRef = React.useRef(null);

  React.useEffect(() => {
    setLocalVote(votedOptionId);
  }, [votedOptionId]);

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!flipSoundUrl) {
      flipAudioRef.current = null;
      return;
    }
    const audio = new Audio(flipSoundUrl);
    audio.volume = 0.6;
    audio.preload = "auto";
    flipAudioRef.current = audio;
  }, [flipSoundUrl]);

  const playFlipSound = () => {
    const audio = flipAudioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };

  const closesAtMs = phase.closesAt ? new Date(phase.closesAt).getTime() : null;
  const isExpired = closesAtMs !== null && now >= closesAtMs;
  const options = phase.options || [];

  const handleCardClick = async (option, payload) => {
    if (isExpired) return;
    if (payload && payload.confirm) {
      if (!userId) {
        alert("Debes iniciar sesión primero para poder votar.");
        onNav("login");
        return;
      }
      setLoading(true);
      try {
        await castVote(userId, phase.id, option.id);
        const prevLocal = localVote;
        if (prevLocal !== option.id) {
          setTallyBumps(prev => {
            const next = { ...prev };
            next[option.id] = (next[option.id] || 0) + 1;
            if (prevLocal) next[prevLocal] = (next[prevLocal] || 0) - 1;
            return next;
          });
        }
        setLocalVote(option.id);
        setConfirmed(option.id);
      } catch (e) {
        alert("Error: " + e.message);
      }
      setLoading(false);
      return;
    }
    playFlipSound();
    setFlippedId(prev => prev === option.id ? null : option.id);
  };

  const getDisplayTally = (opt) => Math.max(0, (opt.tally || 0) + (tallyBumps[opt.id] || 0));
  const displayTotal = options.reduce((s, o) => s + getDisplayTally(o), 0);

  if (isExpired) {
    return (
      <div style={{ paddingTop: 40, paddingBottom: 40, textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}>
          <Pill>● {phase.eyebrow}</Pill>
        </div>
        <h2 className="h1" style={{ marginBottom: 18 }} dangerouslySetInnerHTML={{ __html: t(phase.title) }} />
        <p className="lore" style={{ maxWidth: 600, margin: "0 auto 24px" }}>
          {t("This pool is sealed. Voting has ended.")}
        </p>
        <Btn primary onClick={() => onNav("results")}>{t("View Results →")}</Btn>
      </div>
    );
  }

  if (confirmed) {
    const winner = options.find(o => o.id === confirmed);
    return (
      <div style={{ paddingTop: 40, paddingBottom: 40, textAlign: "center" }}>
        <div className="reveal">
          <div style={{ display: "inline-flex", marginBottom: 26 }} className="pulse-glow">
            <Sigil size={56} />
          </div>
          <Eyebrow>{t("Vote Sealed")} · {phase.title}</Eyebrow>
          <h2 className="h2" style={{ margin: "16px 0 18px" }}>{t("Your voice shapes")}<br/>{t("the next heroine.")}</h2>
          <p className="lore" style={{ fontSize: 17 }}>{t("You bound your name to")} <span className="gold">{t(winner.title)}</span>{t(". The council has heard. Return when the moon turns.")}</p>

          <Frame className="deep" style={{ padding: 28, margin: "32px auto 0", maxWidth: 420 }}>
            <Eyebrow>{phase.title} · {t("Live Tally")}</Eyebrow>
            <div className="mono" style={{ color: "var(--muted)", fontSize: 9, marginTop: 4 }}>{displayTotal.toLocaleString()} {t("voices cast")}</div>
            <div style={{ marginTop: 16 }}>
              {[...options]
                .sort((a, b) => getDisplayTally(b) - getDisplayTally(a))
                .map(opt => {
                  const tally = getDisplayTally(opt);
                  const pct = displayTotal > 0 ? Math.round((tally / displayTotal) * 100) : 0;
                  return (
                    <BarRow
                      key={opt.id}
                      label={`${opt.title} · ${tally}`}
                      pct={pct}
                      winner={confirmed === opt.id}
                    />
                  );
                })}
            </div>
          </Frame>

          <div style={{ marginTop: 36, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn ghost onClick={() => { setConfirmed(null); setFlippedId(null); }}>{t("Recast (until moon)")}</Btn>
            <Btn primary onClick={() => onNav("results")}>{t("View Results →")}</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <Pill>● {phase.eyebrow}</Pill>
      </div>
      <h2 className="h1" style={{ textAlign: "center", marginBottom: 18 }} dangerouslySetInnerHTML={{ __html: t(phase.title) }} />
      <p className="lore" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        {t(phase.lore)}
      </p>

      {closesAtMs && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div className="mono" style={{ color: "var(--gold)", marginBottom: 10 }}>{t("Closes in")}</div>
          <Countdown targetMs={closesAtMs} />
        </div>
      )}

      {localVote && (() => {
        const votedOpt = options.find(o => o.id === localVote);
        if (!votedOpt) return null;
        return (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              border: "1px solid rgba(74, 222, 128, 0.5)",
              background: "rgba(74, 222, 128, 0.08)",
            }}>
              <span className="mono" style={{ color: "#4ade80", fontSize: 10, letterSpacing: "0.2em" }}>✓ {t("YOUR SEALED VOTE")}</span>
              <span className="mono" style={{ color: "var(--gold)", letterSpacing: "0.1em" }}>{votedOpt.title}</span>
            </span>
          </div>
        );
      })()}

      <Divider />

      <div className="grid-4" style={{ marginTop: 30 }}>
        {options.map(o => (
          <VoteCard
            key={o.id}
            option={o}
            flipped={flippedId === o.id}
            selected={false}
            voted={localVote === o.id}
            onClick={(payload) => handleCardClick(o, payload)}
          />
        ))}
      </div>

      <Frame className="deep" style={{ padding: 28, marginTop: 50, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>{phase.title} · {t("Live Tally")}</Eyebrow>
          <span className="mono" style={{ color: "var(--muted)", fontSize: 9 }}>{displayTotal.toLocaleString()} {t("voices cast")}</span>
        </div>
        {displayTotal === 0 ? (
          <p className="lore" style={{ fontSize: 13, marginTop: 16 }}>{t("No votes yet. Be the first to cast.")}</p>
        ) : (
          <div style={{ marginTop: 16 }}>
            {[...options]
              .sort((a, b) => getDisplayTally(b) - getDisplayTally(a))
              .map(opt => {
                const tally = getDisplayTally(opt);
                const pct = displayTotal > 0 ? Math.round((tally / displayTotal) * 100) : 0;
                return (
                  <BarRow
                    key={opt.id}
                    label={`${opt.title} · ${tally}`}
                    pct={pct}
                    winner={localVote === opt.id}
                  />
                );
              })}
          </div>
        )}
      </Frame>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <p className="lore" style={{ fontSize: 13 }}>{t("You may cast one voice this phase. The seal is broken only when the moon turns.")}</p>
      </div>
    </div>
  );
};

export const VotingScreen = ({ onNav, activePhases = [], userId, flipSoundUrl, userVotes = {} }) => {
  if (!activePhases.length) {
    return (
      <div className="screen active">
        <div className="shell" style={{ textAlign: "center", paddingTop: 100 }}>
          <h1 className="h2">{t("The Council is Silent")}</h1>
          <p className="lore">{t("There are no active voting pools at this moment. Return when the moon turns.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="shell">
        {activePhases.map((phase, idx) => (
          <React.Fragment key={phase.id}>
            <PhaseVoteBlock
              phase={phase}
              userId={userId}
              onNav={onNav}
              flipSoundUrl={flipSoundUrl}
              votedOptionId={userVotes[phase.id] || null}
            />
            {idx < activePhases.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const ResultsScreen = ({ onNav, phases = [] }) => {
  const sealedPhases = phases.filter(p => p.status === 'SEALED');
  const lastSealed = sealedPhases.length > 0 ? sealedPhases[sealedPhases.length - 1] : null;

  if (!lastSealed) {
    return (
      <div className="screen active">
        <div className="shell" style={{ textAlign: "center", paddingTop: 100 }}>
          <h1 className="h2">{t("No Phases Sealed Yet")}</h1>
          <p className="lore">{t("The council has not yet concluded any voting phases. Return when the moon turns.")}</p>
        </div>
      </div>
    );
  }

  const options = [...(lastSealed.options || [])].sort((a, b) => (b.tally || 0) - (a.tally || 0));
  const winner = options.length > 0 ? options[0] : null;
  const runnerUp = options.length > 1 ? options[1] : null;
  
  const totalVotes = options.reduce((sum, o) => sum + (o.tally || 0), 0);
  const winPct = winner && totalVotes > 0 ? Math.round((winner.tally / totalVotes) * 100) : 0;
  const margin = winner && runnerUp && totalVotes > 0 ? Math.round(((winner.tally - runnerUp.tally) / totalVotes) * 100) : 0;

  return (
  <div className="screen active">
    <div className="shell">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Pill>{lastSealed.name} · {t("Sealed by Council")}</Pill>
      </div>
      <h1 className="h1" style={{ textAlign: "center", marginBottom: 14 }}>{t("The Phase is")} <span className="gold">{t("Sealed")}</span></h1>
      <p className="lore" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 60px" }}>
        {t("Of")} {totalVotes} {t("voices, the council has decreed. The next moon convenes the next phase.")}
      </p>

      {winner && (
        <Frame className="winner-card pulse-glow" style={{ padding: 0, marginBottom: 60 }}>
          <Corners />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", minHeight: 520 }} className="winner-grid">
            <div style={{ position: "relative", overflow: "hidden", borderRight: "1px solid var(--gold-faint)" }}>
              <ImageSlot id="winner-pinup" placeholder={t("GANADORA — Render de la ganadora")} style={{ width: "100%", height: "100%", display: "block", minHeight: 520 }} />
              <RuneRing />
              <div style={{
                position: "absolute", top: 18, left: 18,
                padding: "6px 14px",
                border: "1px solid var(--gold)",
                background: "rgba(5,3,2,0.85)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.28em",
                color: "var(--gold-bright)",
                textTransform: "uppercase",
              }}>● {lastSealed.name} · {t("Winner")}</div>
            </div>
            <div style={{ padding: 50, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
              <Eyebrow>{lastSealed.name} · {winPct}% {t("of")} {totalVotes}</Eyebrow>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 600, letterSpacing: "0.06em", margin: 0, color: "var(--gold-bright)", textShadow: "0 0 30px var(--accent-glow)" }}>
                {t(winner.title)}
              </h2>
              <p className="lore" style={{ fontSize: 15 }}>
                {t(winner.flavor || winner.lore || "The council has chosen well.")}
              </p>
              <div className="mono" style={{ color: "var(--gold)", display: "flex", gap: 18, flexWrap: "wrap", marginTop: 8 }}>
                <span>{t("SEALED")}</span>
                <span>{winner.tally} {t("VOICES")}</span>
                <span>{t("MARGIN")} +{margin}%</span>
              </div>
            </div>
          </div>
        </Frame>
      )}

      <div className="grid-2">
        <Frame style={{ padding: 36 }}>
          <Eyebrow>{t("The Council Spoke")}</Eyebrow>
          <h3 className="h3" style={{ margin: "12px 0 22px" }}>{t("Final Tally")}</h3>
          {options.map((o, i) => (
             <BarRow key={o.id} label={t(o.title)} pct={totalVotes > 0 ? Math.round((o.tally / totalVotes) * 100) : 0} winner={i === 0} />
          ))}
          <div className="mono" style={{ color: "var(--muted)", marginTop: 18, fontSize: 9 }}>{totalVotes} {t("voices · margin of victory:")} {margin} {t("points")}</div>
        </Frame>

        <Frame className="deep" style={{ padding: 36 }}>
          <Eyebrow>{t("Next in the Forge")}</Eyebrow>
          <h3 className="h3" style={{ margin: "12px 0 8px" }}>{t("The Council Returns")}</h3>
          <p className="lore">{t("The next phase of the forge awaits. The banners will be raised soon.")}</p>
          <div style={{ marginTop: 22, marginBottom: 22 }}>
            <Countdown targetMs={NEXT_REVEAL} />
          </div>
          <Btn primary onClick={() => onNav("voting")}>{t("View Active Phase →")}</Btn>
        </Frame>
      </div>

      <div style={{ marginTop: 80 }}>
        <SectionHead eyebrow={t("The Realm")} title={t("Voices in this Phase")} />
        <div className="grid-4">
          {[
            { n: String(totalVotes), l: "Votes Cast" },
            { n: "—", l: "Kingdoms Voiced" },
            { n: "—", l: "Returned to Vote" },
            { n: `+${margin}`, l: "Margin of Victory" },
          ].map((s, i) => (
            <Frame key={i} style={{ padding: 28 }}>
              <Stat num={s.n} label={t(s.l)} />
            </Frame>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};
