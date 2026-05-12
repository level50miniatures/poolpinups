// app.jsx — Pool Pinups: top-level App with screen routing + tweaks panel + i18n

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "gold",
  "glow": 1,
  "fontDisplay": "Cinzel",
  "darkness": 1,
  "kickstarterUrl": "https://www.kickstarter.com/projects/your-handle/pool-pinups"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  gold:   { color: "#c9a558", glow: "#b83040" },
  silver: { color: "#b5b0a8", glow: "#7080a0" },
  purple: { color: "#a888d0", glow: "#6a4a8a" },
};

const FONT_OPTIONS = ["Cinzel", "Cormorant Garamond", "Marcellus", "UnifrakturCook"];

function applyTweaks(t) {
  const root = document.documentElement;
  const a = ACCENT_PRESETS[t.accent] || ACCENT_PRESETS.gold;
  if (t.accent === "gold") {
    root.style.setProperty("--accent", "var(--gold)");
    root.style.setProperty("--accent-glow", "var(--crimson-glow)");
    root.style.setProperty("--gold", "#c9a558");
    root.style.setProperty("--gold-bright", "#e6c884");
    root.style.setProperty("--gold-deep", "#8a6e34");
    root.style.setProperty("--gold-faint", "rgba(201, 165, 88, 0.25)");
  } else {
    root.style.setProperty("--accent", a.color);
    root.style.setProperty("--accent-glow", a.glow);
    root.style.setProperty("--gold", a.color);
    root.style.setProperty("--gold-faint", a.color + "40");
    root.style.setProperty("--gold-bright", a.color);
    root.style.setProperty("--gold-deep", a.color);
  }
  root.style.setProperty("--glow-strength", String(t.glow));
  root.style.setProperty("--font-display", `"${t.fontDisplay}", serif`);
  const bg = t.darkness === 0 ? "#000000" : t.darkness === 2 ? "#0e0805" : "#050302";
  root.style.setProperty("--bg-deep", bg);
}

function App() {
  const [screen, setScreen] = React.useState(() => {
    const h = (window.location.hash || "").replace("#", "");
    return ["landing", "login", "dashboard", "voting", "results"].includes(h) ? h : "landing";
  });
  const [lang, setLang] = React.useState(window.__lang || "en");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyTweaks(t); }, [t]);
  React.useEffect(() => {
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);

  const handleLang = React.useCallback((l) => {
    window.__lang = l;
    localStorage.setItem("pp_lang", l);
    document.documentElement.lang = l;
    setLang(l);
  }, []);

  React.useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  React.useEffect(() => {
    const id = "tweak-font-link";
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const family = t.fontDisplay.replace(/ /g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
  }, [t.fontDisplay]);

  const tr = window.t || ((s) => s);
  const ksUrl = t.kickstarterUrl || "#";
  const screens = {
    landing: <LandingScreen onNav={setScreen} ksUrl={ksUrl} />,
    login: <LoginScreen onNav={setScreen} />,
    dashboard: <DashboardScreen onNav={setScreen} />,
    voting: <VotingScreen onNav={setScreen} />,
    results: <ResultsScreen onNav={setScreen} />,
  };

  return (
    <>
      <AppNav screen={screen} onNav={setScreen} lang={lang} onLang={handleLang} />
      <div data-screen-label={`${["landing","login","dashboard","voting","results"].indexOf(screen) + 1} ${screen}`} key={lang}>
        {screens[screen]}
      </div>
      <footer className="app-foot">{tr("Pool Pinups · A community-forged fantasy reliquary · MMXXVI")}</footer>

      <TweaksPanel title={tr("Tweaks")}>
        <TweakSection label={tr("Accent")} />
        <TweakRadio
          label={tr("Sigil colour")}
          value={t.accent}
          options={["gold", "silver", "purple"]}
          onChange={(v) => setTweak("accent", v)}
        />

        <TweakSection label={tr("Atmosphere")} />
        <TweakSlider
          label={tr("Glow intensity")}
          value={t.glow}
          min={0} max={2.5} step={0.1}
          onChange={(v) => setTweak("glow", v)}
        />
        <TweakSelect
          label={tr("Backdrop")}
          value={t.darkness}
          options={[
            { value: 0, label: tr("Pitch (#000)") },
            { value: 1, label: tr("Matte (#050)") },
            { value: 2, label: tr("Warm shadow") },
          ]}
          onChange={(v) => setTweak("darkness", v)}
        />

        <TweakSection label={tr("Type")} />
        <TweakSelect
          label={tr("Display font")}
          value={t.fontDisplay}
          options={FONT_OPTIONS.map(f => ({ value: f, label: f }))}
          onChange={(v) => setTweak("fontDisplay", v)}
        />

        <TweakSection label={tr("Kickstarter")} />
        <TweakText
          label={tr("Project URL")}
          value={t.kickstarterUrl}
          onChange={(v) => setTweak("kickstarterUrl", v)}
          placeholder="https://www.kickstarter.com/projects/..."
        />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
