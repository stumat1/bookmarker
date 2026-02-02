import React, { createContext, useContext, useState, useEffect } from "react";
import { settingsDB } from "../utils/db";

const ThemeContext = createContext();

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [loaded, setLoaded] = useState(false);

  // Load theme from IndexedDB on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await settingsDB.get("theme", THEMES.LIGHT);
        if (saved && Object.values(THEMES).includes(saved)) {
          setTheme(saved);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Save theme to IndexedDB when it changes
  useEffect(() => {
    if (!loaded) return;

    const saveTheme = async () => {
      try {
        await settingsDB.set("theme", theme);
      } catch (error) {
        console.error("Failed to save theme:", error);
      }
    };

    saveTheme();
  }, [theme, loaded]);

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === THEMES.DARK,
    isLight: theme === THEMES.LIGHT,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
