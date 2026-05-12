"use client";

import React from "react";

const ImageUrlContext = React.createContext({});

export function ImageUrlProvider({ value, children }) {
  return (
    <ImageUrlContext.Provider value={value || {}}>
      {children}
    </ImageUrlContext.Provider>
  );
}

// Returns the stored URL for the given slot id (e.g. "hero-pinup",
// "phase-abc-aasimar"). Returns null if not registered yet — callers can
// fall back to the legacy `/images/{id}.png` filesystem path.
export function useImageUrl(id) {
  const map = React.useContext(ImageUrlContext);
  return map[id] || null;
}
