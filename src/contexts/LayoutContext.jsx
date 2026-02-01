import React, { createContext, useContext, useState, useEffect } from "react";
import { settingsDB } from "../utils/db";

const LayoutContext = createContext();

export const LAYOUT_DENSITIES = {
  COMPACT: "compact",
  DEFAULT: "default",
  GENEROUS: "generous",
};

export function LayoutProvider({ children }) {
  const [layoutDensity, setLayoutDensity] = useState(LAYOUT_DENSITIES.DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadLayoutDensity = async () => {
      try {
        const saved = await settingsDB.get(
          "layoutDensity",
          LAYOUT_DENSITIES.DEFAULT
        );
        if (saved && Object.values(LAYOUT_DENSITIES).includes(saved)) {
          setLayoutDensity(saved);
        }
      } catch (error) {
        console.error("Failed to load layout density:", error);
      } finally {
        setLoaded(true);
      }
    };

    loadLayoutDensity();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const saveLayoutDensity = async () => {
      try {
        await settingsDB.set("layoutDensity", layoutDensity);
      } catch (error) {
        console.error("Failed to save layout density:", error);
      }
    };

    saveLayoutDensity();
  }, [layoutDensity, loaded]);

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
