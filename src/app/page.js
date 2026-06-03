"use client";

import React, { useState, useEffect } from "react";
import { LandingScreen, LoginScreen, DashboardScreen, VotingScreen, ResultsScreen } from "../components/Screens";
import { AppNav } from "../components/Components";
import { t } from "../lib/i18n";
import { getPhases, getSettings, getImageUrls } from "./actions/admin";
import { getUserVotes } from "./actions/vote";
import { ImageUrlProvider } from "../lib/imageUrlContext";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [phases, setPhases] = useState([]);
  const [settings, setSettings] = useState({ kickstarterUrl: "#" });
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userVotes, setUserVotes] = useState({});
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    getPhases().then(setPhases);
    getSettings().then(setSettings);
    getImageUrls().then(setImageUrls);
    setUserEmail(sessionStorage.getItem("userEmail") || "");
    setUserId(sessionStorage.getItem("userId") || "");
    const h = (window.location.hash || "").replace("#", "");
    if (["landing", "login", "dashboard", "voting", "results"].includes(h)) {
      setScreen(h);
    }
  }, []);

  const refreshUserVotes = React.useCallback(() => {
    if (userId) {
      getUserVotes(userId).then(setUserVotes);
    } else {
      setUserVotes({});
    }
  }, [userId]);

  useEffect(() => {
    refreshUserVotes();
  }, [refreshUserVotes]);

  // After a vote, re-fetch both the live tallies and the user's votes so the
  // Live Tally and the green "voted" card stay in sync with the server.
  const handleVoted = React.useCallback(() => {
    getPhases().then(setPhases);
    refreshUserVotes();
  }, [refreshUserVotes]);
  
  useEffect(() => {
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);

  const handleLogin = (email, id) => {
    setUserEmail(email);
    setUserId(id);
    sessionStorage.setItem("userEmail", email);
    sessionStorage.setItem("userId", id);
  };

  const activePhases = phases.filter(p => p.status === 'ACTIVE');

  const ksUrl = settings.kickstarterUrl || "#";
  const flipSoundUrl = settings.flipSoundUrl || null;
  const screens = {
    landing: <LandingScreen onNav={setScreen} ksUrl={ksUrl} phases={phases} settings={settings} />,
    login: <LoginScreen onNav={setScreen} onLogin={handleLogin} />,
    dashboard: <DashboardScreen onNav={setScreen} userEmail={userEmail} activePhases={activePhases} phases={phases} userVotes={userVotes} />,
    voting: <VotingScreen onNav={setScreen} activePhases={activePhases} userId={userId} flipSoundUrl={flipSoundUrl} userVotes={userVotes} onVoted={handleVoted} />,
    results: <ResultsScreen onNav={setScreen} phases={phases} />,
  };

  return (
    <ImageUrlProvider value={imageUrls}>
      <AppNav screen={screen} onNav={setScreen} />
      <div data-screen-label={`${["landing","login","dashboard","voting","results"].indexOf(screen) + 1} ${screen}`}>
        {screens[screen]}
      </div>
      <footer className="app-foot">{t("Pinup Forge · A community-forged fantasy reliquary · MMXXVI")}</footer>
    </ImageUrlProvider>
  );
}
