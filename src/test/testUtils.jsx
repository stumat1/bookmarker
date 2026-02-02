import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock database operations
export const mockSettingsDB = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
};

export const mockBookmarkDB = {
  getAll: vi.fn().mockResolvedValue([]),
  add: vi.fn().mockImplementation((bookmark) =>
    Promise.resolve({ ...bookmark, id: Date.now() })
  ),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
  bulkDelete: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(null),
  search: vi.fn().mockResolvedValue([]),
};

export const mockDirectoryDB = {
  getAll: vi.fn().mockResolvedValue(["Unsorted"]),
  add: vi.fn().mockResolvedValue("Unsorted"),
  delete: vi.fn().mockResolvedValue(undefined),
  initialize: vi.fn().mockResolvedValue(undefined),
};

export const mockInitializeDB = vi.fn().mockResolvedValue(true);

// Mock the database module
vi.mock("../utils/db", () => ({
  settingsDB: mockSettingsDB,
  bookmarkDB: mockBookmarkDB,
  directoryDB: mockDirectoryDB,
  initializeDB: mockInitializeDB,
  db: {
    bookmarks: { count: vi.fn().mockResolvedValue(0) },
    directories: { count: vi.fn().mockResolvedValue(1) },
  },
}));

// Simple context providers for testing
const TestLayoutContext = React.createContext();
const TestThemeContext = React.createContext();

export function TestLayoutProvider({ children, layoutDensity = "default" }) {
  const [density, setDensity] = React.useState(layoutDensity);
  return (
    <TestLayoutContext.Provider
      value={{
        layoutDensity: density,
        setLayoutDensity: setDensity,
        isCompact: density === "compact",
        isDefault: density === "default",
        isGenerous: density === "generous",
      }}
    >
      {children}
    </TestLayoutContext.Provider>
  );
}

export function TestThemeProvider({ children, theme = "dark" }) {
  const [currentTheme, setTheme] = React.useState(theme);
  return (
    <TestThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme,
        toggleTheme: () =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark")),
        isDark: currentTheme === "dark",
        isLight: currentTheme === "light",
      }}
    >
      {children}
    </TestThemeContext.Provider>
  );
}

// Mock the context hooks
vi.mock("../contexts/LayoutContext", async () => {
  const actual = await vi.importActual("../contexts/LayoutContext");
  return {
    ...actual,
    useLayout: () => React.useContext(TestLayoutContext),
    LayoutProvider: ({ children }) => children,
    LAYOUT_DENSITIES: {
      COMPACT: "compact",
      DEFAULT: "default",
      GENEROUS: "generous",
    },
  };
});

vi.mock("../contexts/ThemeContext", async () => {
  const actual = await vi.importActual("../contexts/ThemeContext");
  return {
    ...actual,
    useTheme: () => React.useContext(TestThemeContext),
    ThemeProvider: ({ children }) => children,
    THEMES: {
      DARK: "dark",
      LIGHT: "light",
    },
  };
});

// Wrapper component with all providers
export function TestProviders({ children, theme = "dark", layoutDensity = "default" }) {
  return (
    <BrowserRouter>
      <TestThemeProvider theme={theme}>
        <TestLayoutProvider layoutDensity={layoutDensity}>
          {children}
        </TestLayoutProvider>
      </TestThemeProvider>
    </BrowserRouter>
  );
}

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  const { theme = "dark", layoutDensity = "default", ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders theme={theme} layoutDensity={layoutDensity}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
}

// Helper to reset all mocks
export function resetAllMocks() {
  mockSettingsDB.get.mockReset().mockResolvedValue(null);
  mockSettingsDB.set.mockReset().mockResolvedValue(undefined);
  mockBookmarkDB.getAll.mockReset().mockResolvedValue([]);
  mockBookmarkDB.add.mockReset().mockImplementation((bookmark) =>
    Promise.resolve({ ...bookmark, id: Date.now() })
  );
  mockBookmarkDB.update.mockReset().mockResolvedValue({});
  mockBookmarkDB.delete.mockReset().mockResolvedValue(undefined);
  mockDirectoryDB.getAll.mockReset().mockResolvedValue(["Unsorted"]);
  mockInitializeDB.mockReset().mockResolvedValue(true);
}

// Sample test data
export const sampleBookmarks = [
  {
    id: 1,
    url: "https://example.com",
    title: "Example Site",
    tags: ["test", "example"],
    dateAdded: "2024-01-01T00:00:00.000Z",
    archived: false,
    directory: "Unsorted",
  },
  {
    id: 2,
    url: "https://github.com",
    title: "GitHub",
    tags: ["code", "git"],
    dateAdded: "2024-01-02T00:00:00.000Z",
    archived: false,
    directory: "Development",
  },
  {
    id: 3,
    url: "https://archived.org",
    title: "Archived Site",
    tags: ["old"],
    dateAdded: "2024-01-03T00:00:00.000Z",
    archived: true,
    directory: "Unsorted",
  },
];

export const sampleDirectories = ["Unsorted", "Development", "Reading"];
