// screens.jsx — Pool Pinups: Landing, Login, Dashboard, Voting, Results
const _t = (s) => (window.t ? window.t(s) : s);

const NEXT_REVEAL = Date.now() + (2 * 86400000) + (7 * 3600000) + (42 * 60000);

// ─── LANDING ────────────────────────────────────────────────────────────
const LandingScreen = ({ onNav, ksUrl }) => (
  <div className="screen active">
    <div className="shell">
      <section className="hero">
        <div className="hero-side">
          <Eyebrow>{_t("Chapter II · Anno Forge MMXXVI")}</Eyebrow>
          <h1 className="h1">{_t("Forge")}<br />{_t("the Next")}<br /><span className="gold">{_t("Heroine")}</span></h1>
          <p className="lore" style={{ fontSize: 17, maxWidth: 360 }}>
            {_t("Backers of the realm summon the next fantasy pinup, vote by vote — race, blade, vow, and pose — until she is sealed in resin and shipped to your shelf.")}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
            <a href={ksUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn primary>◆ {_t("Back on Kickstarter")} ↗</Btn>
            </a>
            <Btn onClick={() => onNav("voting")}>{_t("Join the Vote")}</Btn>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 30, flexWrap: "wrap" }}>
            <Stat num="14,328" label={_t("Voices Pledged")} />
            <Stat num="3 / 9" label={_t("Phases Forged")} />
          </div>
        </div>

        <div className="hero-tarot">
          <div className="tarot-frame">
            <image-slot id="hero-pinup" shape="rect" placeholder={_t("HEROINE — drop hero render")}></image-slot>
            <RuneRing />
          </div>
          <div className="tarot-banner">{_t("The Tiefling · Phase I Winner")}</div>
        </div>

        <div className="hero-side right">
          <Pill>{_t("Live · Phase II open")}</Pill>
          <h3 className="h3" style={{ textAlign: "right" }}>{_t("Choose her")}<br/>{_t("Class & Steel")}</h3>
          <p className="lore" style={{ fontSize: 14, maxWidth: 280 }}>
            {_t("Four sigils stand before the council. The bearer of the most votes will be inked into the next plate.")}
          </p>
          <Frame className="deep" style={{ padding: 20, width: "100%", maxWidth: 300 }}>
            <div className="mono" style={{ color: "var(--gold)", marginBottom: 10 }}>{_t("Phase II Closes In")}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--gold-bright)", letterSpacing: "0.06em" }}>02 : 07 : 42</div>
            <Progress value={64} />
            <div className="mono" style={{ color: "var(--muted)", marginTop: 10, fontSize: 9 }}>{_t("64% of the council has voiced")}</div>
          </Frame>
        </div>
      </section>

      <Divider>{_t("The Process")}</Divider>

      <section style={{ marginTop: 60 }}>
        <SectionHead
          eyebrow={_t("The Rite of Forging")}
          title={_t("Three Councils · One Heroine")}
          lore={_t("Each phase asks the realm a single question. When the moon turns, the votes are sealed and her form is carved one step closer to flesh.")}
        />
        <div className="grid-3">
          {[
            { num: "I", title: "Choose the Race", lore: "The blood that carries her — Tiefling, Drow, Elf, or Human. Decided.", state: "sealed", winner: "Tiefling" },
            { num: "II", title: "Choose the Class", lore: "The blade she draws and the vow she keeps — warlock, ranger, paladin, rogue.", state: "active" },
            { num: "III", title: "Choose the Pose", lore: "The moment she is frozen in resin — defiant, prowling, triumphant.", state: "locked" },
          ].map(s => (
            <Frame key={s.num} className={s.state === "active" ? "deep" : ""} style={{ padding: 32 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--gold-bright)", lineHeight: 1, marginBottom: 12, textShadow: s.state === "active" ? "0 0 20px var(--accent-glow)" : "none" }}>{s.num}</div>
              <h3 className="h3" style={{ marginBottom: 10 }}>{_t(s.title)}</h3>
              <p className="lore">{_t(s.lore)}</p>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{
                  color: s.state === "sealed" ? "var(--gold)" : s.state === "active" ? "var(--crimson-glow)" : "var(--muted)"
                }}>
                  {s.state === "sealed" ? `${_t("Race · Sealed").split("·")[1].trim()} · ${_t(s.winner)}` : s.state === "active" ? _t("Council in session") : _t("Sealed by oath")}
                </span>
              </div>
            </Frame>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 100 }}>
        <SectionHead eyebrow={_t("The Forge Ledger")} title={_t("What the Council has Decreed")} />
        <Frame style={{ padding: 36 }}>
          <div className="grid-3" style={{ gap: 32 }}>
            <div>
              <div className="mono" style={{ color: "var(--muted)", marginBottom: 8 }}>{_t("Race · Sealed")}</div>
              <h3 className="h3" style={{ color: "var(--gold-bright)" }}>{_t("Tiefling")}</h3>
              <p className="lore" style={{ marginTop: 8 }}>{_t("Won with 38.4% of 12,402 voices. Crimson skin, ember-horned, scion of the Hollow Court.")}</p>
              <div style={{ marginTop: 16 }}><Progress value={100} /></div>
            </div>
            <div>
              <div className="mono" style={{ color: "var(--crimson-glow)", marginBottom: 8 }}>{_t("● Class · In Council")}</div>
              <h3 className="h3">{_t("Choose her Vow")}</h3>
              <p className="lore" style={{ marginTop: 8 }}>{_t("14,328 voices have spoken so far. Warlock leads — but rogue gathers shadow. Cast yours before the moon turns.")}</p>
              <div style={{ marginTop: 16 }}><Progress value={64} /></div>
            </div>
            <div>
              <div className="mono" style={{ color: "var(--muted)", marginBottom: 8 }}>{_t("Pose · Sealed by Oath")}</div>
              <h3 className="h3" style={{ color: "var(--muted)" }}>{_t("Locked")}</h3>
              <p className="lore" style={{ marginTop: 8, color: "var(--hush)" }}>{_t("The third council convenes when Phase II's moon has turned. Two days hence.")}</p>
              <div style={{ marginTop: 16 }}><Progress value={0} /></div>
            </div>
          </div>
        </Frame>
      </section>

      <section style={{ marginTop: 100 }}>
        <SectionHead
          eyebrow={_t("The Last Reveal")}
          title={_t("Sister of the Crimson Vow")}
          lore={_t("Phase I's heroine. Hand-painted, 75mm scale, photographed under cathedral light. The same fate awaits the heroine you forge today.")}
        />
        <Frame className="deep" style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", minHeight: 460 }} className="featured-grid">
            <div style={{ position: "relative", borderRight: "1px solid var(--gold-faint)" }}>
              <ImageSlot id="featured-mini" label={_t("MINI · 75mm · cathedral light")} placeholder={_t("Drop painted miniature on white")} style={{ width: "100%", height: "100%", minHeight: 440 }} />
            </div>
            <div style={{ padding: 44, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
              <Eyebrow>{_t("Phase I · Sealed Edition")}</Eyebrow>
              <h3 className="h2">{_t("The Sister")}<br/>{_t("of the")}<br/>{_t("Crimson Vow")}</h3>
              <p className="lore">{_t("Forged in 8K resin. Distributed to 3,847 backers across nine moons. She watches you from the shelf with patient, ember-lit eyes.")}</p>
              <div className="mono" style={{ display: "flex", gap: 20, color: "var(--gold)", marginTop: 8 }}>
                <span>SCALE 75mm</span>
                <span>RESIN 8K</span>
                <span>STL + PRESUPPORTED</span>
              </div>
            </div>
          </div>
        </Frame>
      </section>

      <section style={{ marginTop: 120, textAlign: "center" }}>
        <Eyebrow>{_t("Phase II Closes")}</Eyebrow>
        <h2 className="h2" style={{ margin: "16px 0 32px" }}>{_t("The moon turns in")}</h2>
        <Countdown targetMs={NEXT_REVEAL} />
        <div style={{ marginTop: 32 }}>
          <Btn primary onClick={() => onNav("voting")}>{_t("Cast Your Voice")}</Btn>
        </div>
      </section>

      <section style={{ marginTop: 120 }}>
        <SectionHead eyebrow={_t("The Council")} title={_t("Voices in the Hall")} />
        <div className="grid-4">
          {[
            { n: "14,328", l: "Voices Pledged", s: "across nine kingdoms" },
            { n: "26,704", l: "Votes Cast", s: "in three phases" },
            { n: "3 / 9", l: "Phases Sealed", s: "race · class pending" },
            { n: "02d 07h", l: "Until Reveal", s: "next council convenes" },
          ].map((s, i) => (
            <Frame key={i} style={{ padding: 28 }}>
              <Stat num={s.n} label={_t(s.l)} sub={_t(s.s)} />
            </Frame>
          ))}
        </div>
      </section>
    </div>
  </div>
);

// ─── LOGIN ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onNav }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onNav("dashboard");
  };

  return (
    <div className="screen active">
      <div className="shell narrow" style={{ paddingTop: 90, minHeight: "80vh" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <div style={{ width: 64, height: 64, border: "1px solid var(--gold)", background: "var(--surface-1)" }}>
              <image-slot id="login-logo" shape="rect" placeholder="LOGO" style={{ width: "100%", height: "100%", display: "block" }}></image-slot>
            </div>
          </div>
          <Eyebrow>{_t("The Threshold")}</Eyebrow>
          <h1 className="h2" style={{ margin: "14px 0 12px" }}>{_t("Enter the Hall")}</h1>
          <p className="lore" style={{ maxWidth: 460, margin: "0 auto" }}>
            {_t("Use the email and password the council granted you.")}
          </p>
        </div>

        <Frame className="deep" style={{ padding: 36 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="mono" style={{ color: "var(--gold)", display: "block", marginBottom: 8 }}>{_t("Email")}</label>
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
              <label className="mono" style={{ color: "var(--gold)", display: "block", marginBottom: 8 }}>{_t("Password")}</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="mono" style={{ color: "var(--muted)", marginTop: 6, fontSize: 9 }}>
                {_t("Granted to you by the council. Do not share it.")}
              </p>
            </div>
            <div className="divider" style={{ margin: "4px 0" }}>
              <span className="diamond"></span>
            </div>
            <Btn primary type="submit">{_t("Enter the Hall →")}</Btn>
          </form>
        </Frame>

        {/* Rule of the realm */}
        <div style={{
          marginTop: 22,
          padding: "16px 20px",
          border: "1px solid var(--gold-faint)",
          background: "rgba(201,165,88,0.04)",
          textAlign: "center",
        }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.28em", marginBottom: 8 }}>
            ◆ {_t("RULE OF THE COUNCIL")}
          </div>
          <p className="lore" style={{ fontSize: 13, margin: 0 }}>
            {_t("One email · one voice. You may change your vote freely until the moon turns — but you cannot cast twice with the same name.")}
          </p>
        </div>

        <p className="mono" style={{ textAlign: "center", color: "var(--muted)", marginTop: 22, fontSize: 9 }}>
          {_t("By entering, you swear no oath but to vote with care.")}
        </p>
      </div>
    </div>
  );
};

// ─── DASHBOARD ──────────────────────────────────────────────────────────
const DashboardScreen = ({ onNav }) => (
  <div className="screen active">
    <div className="shell">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
        <div>
          <Eyebrow>{_t("Hall of the Forge · Returning Voice")}</Eyebrow>
          <h1 className="h2" style={{ margin: "12px 0 0" }}>{_t("Welcome back,")} <span className="gold">Ravenna</span></h1>
        </div>
        <div className="user-badge">
          <div className="crest">R</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.06em" }}>ravenna@kingdom.realm</div>
            <div className="mono" style={{ color: "var(--muted)", marginTop: 4, fontSize: 9 }}>{_t("Voices cast: 7 · Phases sealed: 3")}</div>
          </div>
        </div>
      </div>

      <Frame className="deep" style={{ padding: 28, marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 14 }}>
          <div className="mono" style={{ color: "var(--gold)" }}>{_t("Your Forge Progress")}</div>
          <div className="mono" style={{ color: "var(--ivory-dim)" }}>{_t("3 of 9 phases")}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 6 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              height: 8,
              background: i < 3 ? "linear-gradient(90deg, var(--crimson-deep), var(--crimson-glow))" : i === 3 ? "rgba(184,48,64,0.4)" : "var(--surface-3)",
              border: "1px solid " + (i < 4 ? "var(--gold-faint)" : "rgba(201,165,88,0.1)"),
              boxShadow: i === 3 ? "0 0 calc(12px * var(--glow-strength)) var(--accent-glow)" : "none",
            }}></div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span className="mono" style={{ color: "var(--muted)", fontSize: 9 }}>{_t("RACE · CLASS · POSE · ARMOR · WEAPON · MOUNT · ALIGNMENT · NAME · LORE")}</span>
        </div>
      </Frame>

      <Frame className="deep" style={{ padding: 0, marginBottom: 40, overflow: "hidden" }}>
        <div style={{ padding: "32px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <Eyebrow>{_t("Phase II · The Council Convenes")}</Eyebrow>
            <h2 className="h2" style={{ margin: "10px 0 8px" }}>{_t("Choose her Class")}</h2>
            <p className="lore" style={{ maxWidth: 540 }}>{_t("The Tiefling now needs a vow. Four banners stand. Cast your voice — one only — before the moon turns.")}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ color: "var(--muted)" }}>{_t("Closes in")}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--gold-bright)", letterSpacing: "0.06em" }}>02 : 07 : 42</div>
          </div>
        </div>

        <div className="grid-4" style={{ padding: "28px 36px 36px", gap: 18 }}>
          {[
            { id: "warlock", title: "Warlock", lore: "Pact-bound. Speaks to the deep.", tally: "5,124" },
            { id: "ranger",  title: "Ranger",  lore: "Of the wild. First to draw.", tally: "3,802" },
            { id: "paladin", title: "Paladin", lore: "Sworn to a fading sun.", tally: "2,610" },
            { id: "rogue",   title: "Rogue",   lore: "Shadow first, blade second.", tally: "2,792" },
          ].map(o => (
            <div key={o.id} className="vote-card" onClick={() => onNav("voting")} style={{ aspectRatio: "3/4.4" }}>
              <div className="vote-inner">
                <div className="vote-face">
                  <div className="frame">
                    <Corners />
                    <div className="vote-art">
                      <image-slot id={`dash-${o.id}`} placeholder={`${o.title} portrait`}></image-slot>
                      <RuneRing />
                    </div>
                    <div className="vote-meta">
                      <h3>{_t(o.title)}</h3>
                      <p className="lore">{_t(o.lore)}</p>
                      <div className="mono" style={{ color: "var(--gold)", display: "flex", justifyContent: "space-between" }}>
                        <span>{o.tally} {_t("voices")}</span><span>{_t("Vote →")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Frame>

      <div className="grid-2" style={{ marginBottom: 40 }}>
        <Frame style={{ padding: 32 }}>
          <Eyebrow>{_t("The Ledger")}</Eyebrow>
          <h3 className="h3" style={{ marginTop: 12, marginBottom: 18 }}>{_t("Sealed Phases")}</h3>
          {[
            { ph: "I", title: "Race", winner: "Tiefling", pct: "38.4%" },
            { ph: "II", title: "Class", winner: "In Council", pct: "—", active: true },
            { ph: "III", title: "Pose", winner: "Sealed by Oath", pct: "—", locked: true },
          ].map(p => (
            <div key={p.ph} style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr auto",
              gap: 16,
              padding: "16px 0",
              borderTop: "1px solid rgba(201,165,88,0.08)",
              alignItems: "center",
              opacity: p.locked ? 0.45 : 1,
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: p.active ? "var(--crimson-glow)" : "var(--gold)" }}>{p.ph}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: "0.06em" }}>{_t(p.title)}</div>
                <div className="mono" style={{ color: p.active ? "var(--crimson-glow)" : "var(--muted)", marginTop: 2, fontSize: 9 }}>{_t(p.winner)}</div>
              </div>
              <div className="mono" style={{ color: "var(--gold)" }}>{p.pct}</div>
            </div>
          ))}
        </Frame>

        <Frame className="deep" style={{ padding: 32 }}>
          <Eyebrow>{_t("Next Reveal")}</Eyebrow>
          <h3 className="h3" style={{ marginTop: 12, marginBottom: 22 }}>{_t("The moon turns in")}</h3>
          <Countdown targetMs={NEXT_REVEAL} />
          <div style={{ marginTop: 24 }}>
            <Btn primary onClick={() => onNav("voting")}>{_t("Cast Your Voice")}</Btn>
          </div>
        </Frame>
      </div>

      <Frame style={{ padding: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <Eyebrow>{_t("Phase I · Sealed")}</Eyebrow>
            <h3 className="h3" style={{ marginTop: 10 }}>{_t("The Race that Won")}</h3>
          </div>
          <div className="mono" style={{ color: "var(--muted)" }}>12,402 {_t("voices · closed 9 days ago")}</div>
        </div>
        <Divider />
        <div style={{ marginTop: 12 }}>
          <BarRow label={_t("Tiefling")} pct={38} winner />
          <BarRow label={_t("Drow")} pct={27} />
          <BarRow label={_t("Elf")} pct={21} />
          <BarRow label={_t("Human")} pct={14} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn ghost onClick={() => onNav("results")}>{_t("View full results →")}</Btn>
        </div>
      </Frame>
    </div>
  </div>
);

// ─── VOTING ─────────────────────────────────────────────────────────────
const VOTE_OPTIONS = [
  { id: "warlock", title: "Warlock",  kind: "Class · Pact",     lore: "Pact-bound to the deep. Casts in shadow and ember.",       flavor: "Her grimoire smolders with a name no mortal speaks." },
  { id: "ranger",  title: "Ranger",   kind: "Class · Wild",     lore: "Of the wild. First to draw, last to speak.",                flavor: "She has slept beneath every stone in the Greenmoor." },
  { id: "paladin", title: "Paladin",  kind: "Class · Vow",      lore: "Sworn to a fading sun. Her oath holds a city.",             flavor: "Her armor is graven with a god no longer remembered." },
  { id: "rogue",   title: "Rogue",    kind: "Class · Shadow",   lore: "Shadow first, blade second. Coin she does not need.",       flavor: "Her dagger is older than the Hollow Court itself." },
];

const VotingScreen = ({ onNav }) => {
  const [flippedId, setFlippedId] = React.useState(null);
  const [confirmed, setConfirmed] = React.useState(null);

  const handleCardClick = (option, payload) => {
    if (payload && payload.confirm) {
      setConfirmed(option.id);
      return;
    }
    setFlippedId(prev => prev === option.id ? null : option.id);
  };

  if (confirmed) {
    const winner = VOTE_OPTIONS.find(o => o.id === confirmed);
    return (
      <div className="screen active">
        <div className="shell narrow" style={{ paddingTop: 80, textAlign: "center" }}>
          <div className="reveal">
            <div style={{ display: "inline-flex", marginBottom: 26 }} className="pulse-glow">
              <Sigil size={56} />
            </div>
            <Eyebrow>{_t("Vote Sealed")}</Eyebrow>
            <h1 className="h2" style={{ margin: "16px 0 18px" }}>{_t("Your voice shapes")}<br/>{_t("the next heroine.")}</h1>
            <p className="lore" style={{ fontSize: 17 }}>{_t("You bound your name to")} <span className="gold">{_t(winner.title)}</span>{_t(". The council has heard. Return when the moon turns.")}</p>

            <Frame className="deep" style={{ padding: 28, margin: "32px auto 0", maxWidth: 360 }}>
              <Eyebrow>{_t("Phase II · Live Tally")}</Eyebrow>
              <div style={{ marginTop: 16 }}>
                <BarRow label={_t("Warlock")} pct={36} winner={confirmed === "warlock"} />
                <BarRow label={_t("Ranger")} pct={26} winner={confirmed === "ranger"} />
                <BarRow label={_t("Paladin")} pct={18} winner={confirmed === "paladin"} />
                <BarRow label={_t("Rogue")} pct={20} winner={confirmed === "rogue"} />
              </div>
            </Frame>

            <div style={{ marginTop: 36, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn ghost onClick={() => { setConfirmed(null); setFlippedId(null); }}>{_t("Recast (until moon)")}</Btn>
              <Btn primary onClick={() => onNav("results")}>{_t("View Results →")}</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="shell">
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <Pill>{_t("● Phase II · Council in Session")}</Pill>
        </div>
        <h1 className="h1" style={{ textAlign: "center", marginBottom: 18 }}>{_t("Choose her")} <span className="gold">{_t("Class")}</span></h1>
        <p className="lore" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          {_t("Four banners stand before the council. Tap a card to read her oath; tap again to seal your voice. Until the moon turns, your vote can be unspoken.")}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 24, flexWrap: "wrap" }}>
          <div className="mono" style={{ color: "var(--gold)" }}>14,328 {_t("voices · 64% of council")}</div>
          <div className="mono" style={{ color: "var(--crimson-glow)" }}>{_t("Closes")} 02d 07h 42m</div>
        </div>

        <Divider />

        <div className="grid-4" style={{ marginTop: 30 }}>
          {VOTE_OPTIONS.map(o => (
            <VoteCard
              key={o.id}
              option={o}
              flipped={flippedId === o.id}
              selected={false}
              onClick={(payload) => handleCardClick(o, payload)}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p className="lore" style={{ fontSize: 13 }}>{_t("You may cast one voice this phase. The seal is broken only when the moon turns.")}</p>
        </div>
      </div>
    </div>
  );
};

// ─── RESULTS ────────────────────────────────────────────────────────────
const ResultsScreen = ({ onNav }) => (
  <div className="screen active">
    <div className="shell">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Pill>{_t("Phase I · Sealed by Council")}</Pill>
      </div>
      <h1 className="h1" style={{ textAlign: "center", marginBottom: 14 }}>{_t("The Race is")} <span className="gold">{_t("Sealed")}</span></h1>
      <p className="lore" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 60px" }}>
        {_t("Of twelve thousand four hundred voices, the council has decreed her bloodline. The next moon convenes Phase II.")}
      </p>

      <Frame className="winner-card pulse-glow" style={{ padding: 0, marginBottom: 60 }}>
        <Corners />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", minHeight: 520 }} className="winner-grid">
          <div style={{ position: "relative", overflow: "hidden", borderRight: "1px solid var(--gold-faint)" }}>
            <image-slot id="winner-tiefling" placeholder={_t("TIEFLING — winning render")} style={{ width: "100%", height: "100%", display: "block", minHeight: 520 }}></image-slot>
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
            }}>{_t("● Phase I · Winner")}</div>
          </div>
          <div style={{ padding: 50, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <Eyebrow>{_t("Race · 38.4% of 12,402")}</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 600, letterSpacing: "0.06em", margin: 0, color: "var(--gold-bright)", textShadow: "0 0 30px var(--accent-glow)" }}>
              {_t("Tiefling")}
            </h2>
            <p className="lore" style={{ fontSize: 15 }}>
              {_t("Crimson skinned and ember horned. Scion of the Hollow Court, her blood remembers the bargain her grandmother struck and never names. The council has chosen well.")}
            </p>
            <div className="mono" style={{ color: "var(--gold)", display: "flex", gap: 18, flexWrap: "wrap", marginTop: 8 }}>
              <span>{_t("SEALED · 9 DAYS AGO")}</span>
              <span>{_t("4,762 VOICES")}</span>
              <span>{_t("MARGIN +11.2%")}</span>
            </div>
          </div>
        </div>
      </Frame>

      <div className="grid-2">
        <Frame style={{ padding: 36 }}>
          <Eyebrow>{_t("The Council Spoke")}</Eyebrow>
          <h3 className="h3" style={{ margin: "12px 0 22px" }}>{_t("Final Tally")}</h3>
          <BarRow label={_t("Tiefling")} pct={38} winner />
          <BarRow label={_t("Drow")} pct={27} />
          <BarRow label={_t("Elf")} pct={21} />
          <BarRow label={_t("Human")} pct={14} />
          <div className="mono" style={{ color: "var(--muted)", marginTop: 18, fontSize: 9 }}>12,402 {_t("voices · margin of victory: 11.2 points")}</div>
        </Frame>

        <Frame className="deep" style={{ padding: 36 }}>
          <Eyebrow>{_t("Next in the Forge")}</Eyebrow>
          <h3 className="h3" style={{ margin: "12px 0 8px" }}>{_t("Phase II · Class & Steel")}</h3>
          <p className="lore">{_t("The Tiefling now needs a vow. Four banners have already been raised. Be among the first to cast.")}</p>
          <div style={{ marginTop: 22, marginBottom: 22 }}>
            <Countdown targetMs={NEXT_REVEAL} />
          </div>
          <Btn primary onClick={() => onNav("voting")}>{_t("Open Phase II →")}</Btn>
        </Frame>
      </div>

      <div style={{ marginTop: 80 }}>
        <SectionHead eyebrow={_t("The Realm")} title={_t("Voices in this Phase")} />
        <div className="grid-4">
          {[
            { n: "12,402", l: "Votes Cast" },
            { n: "9", l: "Kingdoms Voiced" },
            { n: "94%", l: "Returned to Vote" },
            { n: "+11.2", l: "Margin of Victory" },
          ].map((s, i) => (
            <Frame key={i} style={{ padding: 28 }}>
              <Stat num={s.n} label={_t(s.l)} />
            </Frame>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { LandingScreen, LoginScreen, DashboardScreen, VotingScreen, ResultsScreen });
