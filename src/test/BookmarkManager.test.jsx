import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";

// Mock database
vi.mock("../utils/db", () => ({
  bookmarkDB: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    bulkDelete: vi.fn().mockResolvedValue(undefined),
  },
  directoryDB: {
    getAll: vi.fn().mockResolvedValue(["Unsorted"]),
    add: vi.fn().mockResolvedValue("Test"),
    delete: vi.fn().mockResolvedValue(undefined),
    initialize: vi.fn().mockResolvedValue(undefined),
  },
  initializeDB: vi.fn().mockResolvedValue(true),
  settingsDB: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

// Create mock contexts
const MockLayoutContext = React.createContext();
const MockThemeContext = React.createContext();

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

// Import after mocks
import BookmarkManager from "../pages/BookmarkManager";

function renderBookmarkManager() {
  return render(
    <BrowserRouter>
      <MockThemeContext.Provider
        value={{
          theme: "dark",
          setTheme: vi.fn(),
          toggleTheme: vi.fn(),
          isDark: true,
          isLight: false,
        }}
      >
        <MockLayoutContext.Provider
          value={{
            layoutDensity: "default",
            setLayoutDensity: vi.fn(),
            isCompact: false,
            isDefault: true,
            isGenerous: false,
          }}
        >
          <BookmarkManager />
        </MockLayoutContext.Provider>
      </MockThemeContext.Provider>
    </BrowserRouter>
  );
}

describe("BookmarkManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
    window.alert = vi.fn();
  });

  describe("Initial Render", () => {
    it("renders the page title", () => {
      renderBookmarkManager();
      expect(screen.getByText("Bookmarker")).toBeInTheDocument();
    });

    it("renders the tagline", () => {
      renderBookmarkManager();
      expect(screen.getByText(/Save now, decide later/)).toBeInTheDocument();
    });

    it("renders URL input", () => {
      renderBookmarkManager();
      expect(
        screen.getByPlaceholderText("https://example.com/article")
      ).toBeInTheDocument();
    });

    it("renders tags input", () => {
      renderBookmarkManager();
      expect(
        screen.getByPlaceholderText("tech, programming, tutorial")
      ).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderBookmarkManager();
      expect(
        screen.getByPlaceholderText("Search bookmarks...")
      ).toBeInTheDocument();
    });

    it("renders new directory input", () => {
      renderBookmarkManager();
      expect(
        screen.getByPlaceholderText("New directory name")
      ).toBeInTheDocument();
    });

    it("renders export button", () => {
      renderBookmarkManager();
      expect(screen.getByText("Export Bookmarks")).toBeInTheDocument();
    });

    it("renders import button", () => {
      renderBookmarkManager();
      expect(screen.getByText("Import Bookmarks")).toBeInTheDocument();
    });

    it("renders filter buttons", () => {
      renderBookmarkManager();
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Unread")).toBeInTheDocument();
      expect(screen.getByText("Archived")).toBeInTheDocument();
    });

    it("renders sort dropdown", () => {
      renderBookmarkManager();
      expect(screen.getByText("Newest First")).toBeInTheDocument();
    });

    it("renders directories section", () => {
      renderBookmarkManager();
      expect(screen.getByText("Directories")).toBeInTheDocument();
    });

    it("renders undo button", () => {
      renderBookmarkManager();
      expect(screen.getByText(/Undo/)).toBeInTheDocument();
    });
  });
});
