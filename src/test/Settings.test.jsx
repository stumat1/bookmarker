import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";

// Mock the database before importing components
vi.mock("../utils/db", () => ({
  settingsDB: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
  bookmarkDB: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  directoryDB: {
    getAll: vi.fn().mockResolvedValue(["Unsorted"]),
  },
  db: {
    bookmarks: { count: vi.fn().mockResolvedValue(5) },
    directories: { count: vi.fn().mockResolvedValue(3) },
  },
}));

// Create mock contexts
const MockLayoutContext = React.createContext();
const MockThemeContext = React.createContext();

// Mock context modules
vi.mock("../contexts/LayoutContext", () => ({
  useLayout: () => React.useContext(MockLayoutContext),
  LAYOUT_DENSITIES: {
    COMPACT: "compact",
    DEFAULT: "default",
    GENEROUS: "generous",
  },
}));

vi.mock("../contexts/ThemeContext", () => ({
  useTheme: () => React.useContext(MockThemeContext),
  THEMES: {
    DARK: "dark",
    LIGHT: "light",
  },
}));

// Import Settings after mocks are set up
import Settings from "../pages/Settings";

function renderSettings({ theme = "dark", layoutDensity = "default" } = {}) {
  const setLayoutDensity = vi.fn();
  const setTheme = vi.fn();

  return {
    setLayoutDensity,
    setTheme,
    ...render(
      <BrowserRouter>
        <MockThemeContext.Provider
          value={{
            theme,
            setTheme,
            toggleTheme: () => {},
            isDark: theme === "dark",
            isLight: theme === "light",
          }}
        >
          <MockLayoutContext.Provider
            value={{
              layoutDensity,
              setLayoutDensity,
              isCompact: layoutDensity === "compact",
              isDefault: layoutDensity === "default",
              isGenerous: layoutDensity === "generous",
            }}
          >
            <Settings />
          </MockLayoutContext.Provider>
        </MockThemeContext.Provider>
      </BrowserRouter>
    ),
  };
}

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the settings page with title", () => {
    renderSettings();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders back to bookmarks link", () => {
    renderSettings();
    expect(screen.getByText("Back to Bookmarks")).toBeInTheDocument();
  });

  it("renders theme section", () => {
    renderSettings();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(
      screen.getByText("Choose between light and dark appearance")
    ).toBeInTheDocument();
  });

  it("renders layout density section", () => {
    renderSettings();
    expect(screen.getByText("Layout Density")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose how much spacing and size you prefer for the interface"
      )
    ).toBeInTheDocument();
  });

  it("renders all theme options", () => {
    renderSettings();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("renders all layout density options", () => {
    renderSettings();
    expect(screen.getByText("Compact")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Generous")).toBeInTheDocument();
  });

  it("calls setTheme when theme option is clicked", () => {
    const { setTheme } = renderSettings({ theme: "dark" });

    fireEvent.click(screen.getByText("Light"));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("calls setLayoutDensity when layout option is clicked", () => {
    const { setLayoutDensity } = renderSettings({ layoutDensity: "default" });

    fireEvent.click(screen.getByText("Compact"));
    expect(setLayoutDensity).toHaveBeenCalledWith("compact");
  });

  it("renders layout option descriptions", () => {
    renderSettings();
    expect(
      screen.getByText("Maximize space, show more content")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Balanced spacing and readability")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Extra spacing for comfortable reading")
    ).toBeInTheDocument();
  });

  it("renders theme option descriptions", () => {
    renderSettings();
    expect(screen.getByText("Clean and bright appearance")).toBeInTheDocument();
    expect(
      screen.getByText("Easy on the eyes, perfect for night")
    ).toBeInTheDocument();
  });

  it("renders DatabaseStatus component", async () => {
    renderSettings();
    // DatabaseStatus shows loading initially, then status
    await waitFor(() => {
      expect(screen.getByText(/Database Status/i)).toBeInTheDocument();
    });
  });
});
