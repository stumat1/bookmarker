import React, { createContext, useContext, useState, useEffect } from "react";

const LayoutContext = createContext();

export const LAYOUT_DENSITIES = {
  COMPACT: "compact",
  DEFAULT: "default",
  GENEROUS: "generous",
};

export function LayoutProvider({ children }) {
  const [layoutDensity, setLayoutDensity] = useState(LAYOUT_DENSITIES.DEFAULT);

  useEffect(() => {
    const saved = localStorage.getItem("layoutDensity");
    if (saved && Object.values(LAYOUT_DENSITIES).includes(saved)) {
      setLayoutDensity(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("layoutDensity", layoutDensity);
  }, [layoutDensity]);

  const value = {
    layoutDensity,
    setLayoutDensity,
    isCompact: layoutDensity === LAYOUT_DENSITIES.COMPACT,
    isDefault: layoutDensity === LAYOUT_DENSITIES.DEFAULT,
    isGenerous: layoutDensity === LAYOUT_DENSITIES.GENEROUS,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
