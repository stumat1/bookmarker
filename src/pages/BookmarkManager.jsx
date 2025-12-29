import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Trash2,
  Tag,
  ExternalLink,
  Search,
  FolderOpen,
  FolderPlus,
  Folder,
  Settings as SettingsIcon,
  Download,
  Upload,
  AlertCircle,
  Undo,
  CheckSquare,
  Square,
  ArrowUpDown,
  Archive,
} from "lucide-react";
import { useLayout } from "../contexts/LayoutContext";
import { getLayoutStyles } from "../utils/layoutUtils";
import {
  validateAndSanitizeURL,
  parseAndValidateTags,
  validateDirectoryName,
  sanitizeTitle,
  validateBookmark,
  safeLocalStorageSet,
  safeLocalStorageGet,
  MAX_URL_LENGTH,
  MAX_TAG_LENGTH,
} from "../utils/validation";

export default function BookmarkManager() {
  const { layoutDensity } = useLayout();
  const layout = getLayoutStyles(layoutDensity);

  const [bookmarks, setBookmarks] = useState([]);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, archived
  const [directories, setDirectories] = useState(["Unsorted"]);
  const [newDirectory, setNewDirectory] = useState("");
  const [selectedDirectory, setSelectedDirectory] = useState("Unsorted");
  const [errorMessage, setErrorMessage] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, title-asc, title-desc

  useEffect(() => {
    try {
      const saved = safeLocalStorageGet("bookmarks", []);
      // Validate each bookmark
      const validBookmarks = saved.filter(validateBookmark);
      if (validBookmarks.length !== saved.length) {
        console.warn(
          `Removed ${saved.length - validBookmarks.length} invalid bookmarks`
        );
      }
      setBookmarks(validBookmarks);

      const savedDirs = safeLocalStorageGet("directories", ["Unsorted"]);
      // Ensure 'Unsorted' always exists
      if (!savedDirs.includes("Unsorted")) {
        savedDirs.unshift("Unsorted");
      }
      setDirectories(savedDirs);
    } catch (error) {
      console.error("Failed to load data:", error);
      setErrorMessage("Failed to load data. Starting fresh.");
      setBookmarks([]);
      setDirectories(["Unsorted"]);
    }
  }, []);

  useEffect(() => {
    try {
      safeLocalStorageSet("bookmarks", bookmarks);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      safeLocalStorageSet("directories", directories);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [directories]);

  const addBookmark = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // Validate and sanitize URL
      const validatedURL = validateAndSanitizeURL(url);

      // Parse and validate tags
      const validatedTags = parseAndValidateTags(tags);

      // Add bookmark immediately with URL as title
      const bookmarkId = Date.now();
      const newBookmark = {
        id: bookmarkId,
        url: validatedURL,
        title: sanitizeTitle(validatedURL),
        tags: validatedTags,
        dateAdded: new Date().toISOString(),
        archived: false,
        directory: selectedDirectory || "Unsorted",
      };

      setBookmarks([newBookmark, ...bookmarks]);
      setUrl("");
      setTags("");
      setSelectedDirectory("Unsorted");
      setLoading(false);

      // Fetch page title in background (non-blocking) with retry
      const fetchTitle = async (retries = 2) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(
            `https://api.allorigins.win/get?url=${encodeURIComponent(
              validatedURL
            )}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error("Failed to fetch");

          const data = await response.json();
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, "text/html");
          const title = doc.querySelector("title")?.textContent;

          if (title && title.trim()) {
            const sanitizedTitle = sanitizeTitle(title.trim());
            // Update bookmark with fetched title
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === bookmarkId ? { ...b, title: sanitizedTitle } : b
              )
            );
          }
        } catch (error) {
          if (retries > 0) {
            console.log(`Retrying title fetch (${retries} attempts left)...`);
            setTimeout(() => fetchTitle(retries - 1), 2000);
          } else {
            console.log("Failed to fetch title:", error.message);
          }
        }
      };

      fetchTitle();
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const deleteBookmark = (id) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${bookmark.title}"? You can undo this action.`
      )
    ) {
      // Add to undo stack
      setUndoStack([...undoStack, { action: "delete", data: bookmark }]);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    }
  };

  const toggleArchive = (id) => {
    setBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, archived: !b.archived } : b))
    );
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];

    if (lastAction.action === "delete") {
      // Restore deleted bookmark
      setBookmarks([lastAction.data, ...bookmarks]);
    } else if (lastAction.action === "bulkDelete") {
      // Restore multiple deleted bookmarks
      setBookmarks([...lastAction.data, ...bookmarks]);
    }

    // Remove from undo stack
    setUndoStack(undoStack.slice(0, -1));
  };

  // Toggle bookmark selection
  const toggleBookmarkSelection = (id) => {
    const newSelection = new Set(selectedBookmarks);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedBookmarks(newSelection);
  };

  // Select all filtered bookmarks
  const selectAllBookmarks = () => {
    const allIds = new Set(filteredBookmarks.map((b) => b.id));
    setSelectedBookmarks(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedBookmarks(new Set());
  };

  // Bulk delete selected bookmarks
  const bulkDeleteBookmarks = () => {
    if (selectedBookmarks.size === 0) return;

    if (
      window.confirm(
        `Delete ${selectedBookmarks.size} selected bookmark(s)? You can undo this action.`
      )
    ) {
      const deletedBookmarks = bookmarks.filter((b) =>
        selectedBookmarks.has(b.id)
      );

      // Add to undo stack
      setUndoStack([
        ...undoStack,
        { action: "bulkDelete", data: deletedBookmarks },
      ]);

      setBookmarks(bookmarks.filter((b) => !selectedBookmarks.has(b.id)));
      setSelectedBookmarks(new Set());
    }
  };

  // Bulk archive/unarchive selected bookmarks
  const bulkArchiveBookmarks = (archive) => {
    if (selectedBookmarks.size === 0) return;

    setBookmarks(
      bookmarks.map((b) =>
        selectedBookmarks.has(b.id) ? { ...b, archived: archive } : b
      )
    );
    setSelectedBookmarks(new Set());
  };

  // Bulk move selected bookmarks to directory
  const bulkMoveBookmarks = (directory) => {
    if (selectedBookmarks.size === 0) return;

    setBookmarks(
      bookmarks.map((b) =>
        selectedBookmarks.has(b.id) ? { ...b, directory } : b
      )
    );
    setSelectedBookmarks(new Set());
  };

  const addDirectory = () => {
    setErrorMessage("");
    try {
      const validatedName = validateDirectoryName(newDirectory);

      if (directories.includes(validatedName)) {
        setErrorMessage("Directory already exists!");
        return;
      }

      setDirectories([...directories, validatedName]);
      setNewDirectory("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const deleteDirectory = (dirName) => {
    if (dirName === "Unsorted") {
      setErrorMessage("Cannot delete 'Unsorted' directory!");
      return;
    }

    const bookmarkCount = bookmarks.filter(
      (b) => b.directory === dirName
    ).length;
    const message =
      bookmarkCount > 0
        ? `Delete "${dirName}" directory? ${bookmarkCount} bookmark(s) will be moved to Unsorted.`
        : `Delete "${dirName}" directory?`;

    if (window.confirm(message)) {
      setDirectories(directories.filter((d) => d !== dirName));
      // Move bookmarks from deleted directory to Unsorted
      setBookmarks(
        bookmarks.map((b) =>
          b.directory === dirName ? { ...b, directory: "Unsorted" } : b
        )
      );
    }
  };

  // Export bookmarks to JSON file
  const exportBookmarks = () => {
    try {
      const data = {
        bookmarks,
        directories,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setErrorMessage(""); // Clear any errors
      alert("Bookmarks exported successfully!");
    } catch (error) {
      setErrorMessage("Failed to export bookmarks: " + error.message);
    }
  };

  // Import bookmarks from JSON file
  const importBookmarks = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);

        // Validate imported data
        if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
          throw new Error("Invalid backup file format");
        }

        // Validate each bookmark
        const validBookmarks = data.bookmarks.filter(validateBookmark);

        if (validBookmarks.length === 0) {
          throw new Error("No valid bookmarks found in backup file");
        }

        const importedDirs = data.directories || ["Unsorted"];
        if (!importedDirs.includes("Unsorted")) {
          importedDirs.unshift("Unsorted");
        }

        // Ask user if they want to merge or replace
        const shouldMerge = window.confirm(
          `Import ${validBookmarks.length} bookmark(s)?\n\nClick OK to MERGE with existing bookmarks.\nClick Cancel to REPLACE all bookmarks.`
        );

        if (shouldMerge) {
          // Merge: Add imported bookmarks and directories
          const mergedBookmarks = [...bookmarks];
          const existingIds = new Set(bookmarks.map((b) => b.id));

          validBookmarks.forEach((bookmark) => {
            if (!existingIds.has(bookmark.id)) {
              mergedBookmarks.push(bookmark);
            }
          });

          const mergedDirs = [...new Set([...directories, ...importedDirs])];

          setBookmarks(mergedBookmarks);
          setDirectories(mergedDirs);
        } else {
          // Replace: Use imported data
          setBookmarks(validBookmarks);
          setDirectories(importedDirs);
        }

        setErrorMessage("");
        alert(`Successfully imported ${validBookmarks.length} bookmark(s)!`);
      } catch (error) {
        setErrorMessage("Failed to import bookmarks: " + error.message);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read file");
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  const filteredBookmarks = bookmarks
    .filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filter === "archived") return b.archived && matchesSearch;
      if (filter === "unread") return !b.archived && matchesSearch;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case "date-asc":
          return new Date(a.dateAdded) - new Date(b.dateAdded);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white ${layout.pagePadding}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`${layout.headerMargin} text-center relative`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt="Bookmark Triave Logo"
              className={`${layout.logoSize} object-contain`}
            />
            <h1
              className={`${layout.titleSize} font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}
            >
              Bookmark Triave
            </h1>
          </div>
          <p className={`text-slate-300 ${layout.subtitleSize}`}>
            Save now, decide later. Organize your reading list efficiently.
          </p>

          {/* Settings link in top right */}
          <Link
            to="/settings"
            className={`absolute top-0 right-0 flex items-center gap-2 ${layout.buttonPadding} bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 ${layout.buttonRounded} transition-all group`}
          >
            <SettingsIcon className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="mb-6 bg-red-900/50 backdrop-blur-xl rounded-xl p-4 border border-red-700/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200 font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-300 hover:text-red-100 transition-colors"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Export/Import/Undo Bar */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center items-center">
          <button
            onClick={exportBookmarks}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export Bookmarks
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Bookmarks
            <input
              type="file"
              accept=".json"
              onChange={importBookmarks}
              className="hidden"
            />
          </label>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
            title={
              undoStack.length > 0
                ? `Undo (${undoStack.length} action${
                    undoStack.length > 1 ? "s" : ""
                  })`
                : "Nothing to undo"
            }
          >
            <Undo className="w-4 h-4" />
            Undo {undoStack.length > 0 && `(${undoStack.length})`}
          </button>
          <div className="text-sm text-slate-400 flex items-center">
            <Bookmark className="w-4 h-4 mr-1" />
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${layout.cardGap}`}>
          {/* Left Column - Add Bookmark Form */}
          <div className={`lg:col-span-1 ${layout.cardGap}`}>
            <div
              className={`bg-slate-800/60 backdrop-blur-xl ${layout.cardRounded} ${layout.cardPadding} border border-slate-700/50 shadow-2xl shadow-purple-900/20 ${layout.stickyTop} lg:sticky`}
            >
              <h2
                className={`${layout.bookmarkTitleSize} font-semibold ${layout.labelMargin} text-slate-200`}
              >
                Add Bookmark
              </h2>
              <div className={layout.cardGap}>
                <div>
                  <label
                    className={`block ${layout.labelSize} font-semibold ${layout.labelMargin} text-slate-200`}
                  >
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBookmark()}
                    placeholder="https://example.com/article"
                    maxLength={MAX_URL_LENGTH}
                    required
                    className={`w-full bg-slate-900/80 border border-slate-600 ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-500`}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Enter a valid http:// or https:// URL
                  </p>
                </div>
                <div>
                  <label
                    className={`block ${layout.labelSize} font-semibold ${layout.labelMargin} text-slate-200`}
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBookmark()}
                    placeholder="tech, programming, tutorial"
                    maxLength={MAX_TAG_LENGTH * 10}
                    className={`w-full bg-slate-900/80 border border-slate-600 ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-slate-500`}
                  />
                </div>
                <div>
                  <label
                    className={`block ${layout.labelSize} font-semibold ${layout.labelMargin} text-slate-200`}
                  >
                    Directory
                  </label>
                  <select
                    value={selectedDirectory}
                    onChange={(e) => setSelectedDirectory(e.target.value)}
                    className={`w-full bg-slate-900/80 border border-slate-600 ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    {directories.map((dir) => (
                      <option key={dir} value={dir}>
                        {dir}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addBookmark}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 ${layout.buttonRounded} ${layout.buttonPadding} font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:transform-none disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add Bookmark"
                  )}
                </button>
              </div>
            </div>

            {/* Directory Management */}
            <div
              className={`bg-slate-800/60 backdrop-blur-xl ${layout.cardRounded} ${layout.cardPadding} border border-slate-700/50 shadow-2xl shadow-purple-900/20 ${layout.stickyTop} lg:sticky`}
            >
              <h2
                className={`${layout.bookmarkTitleSize} font-semibold ${layout.labelMargin} text-slate-200 flex items-center gap-2`}
              >
                <FolderPlus className="w-5 h-5" />
                Directories
              </h2>
              <div className={layout.cardGap}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDirectory}
                    onChange={(e) => setNewDirectory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDirectory()}
                    placeholder="New directory name"
                    className={`flex-1 bg-slate-900/80 border border-slate-600 ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-slate-500`}
                  />
                  <button
                    onClick={addDirectory}
                    className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 ${layout.buttonRounded} ${layout.buttonPadding} font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                    title="Add Directory"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {directories.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No directories yet
                    </p>
                  ) : (
                    directories.map((dir) => (
                      <div
                        key={dir}
                        className={`flex items-center justify-between bg-slate-900/50 ${layout.directoryItemRounded} ${layout.directoryItemPadding} border border-slate-700/50 hover:border-slate-600 transition-all`}
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          <Folder className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium">{dir}</span>
                          <span className="text-xs text-slate-500">
                            (
                            {
                              bookmarks.filter((b) => b.directory === dir)
                                .length
                            }
                            )
                          </span>
                        </div>
                        <button
                          onClick={() => deleteDirectory(dir)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded p-1 transition-all"
                          title="Delete Directory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bookmarks List */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div
              className={`flex flex-col sm:flex-row gap-4 ${layout.headerMargin}`}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bookmarks..."
                  className={`w-full bg-slate-800/60 border border-slate-700/50 ${layout.filterButtonRounded} pl-12 pr-4 ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-500`}
                />
              </div>
              <div className="flex gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setFilter("all")}
                  className={`${layout.filterButtonPadding} ${
                    layout.filterButtonRounded
                  } font-medium transition-all ${
                    filter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`${layout.filterButtonPadding} ${
                    layout.filterButtonRounded
                  } font-medium transition-all ${
                    filter === "unread"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter("archived")}
                  className={`${layout.filterButtonPadding} ${
                    layout.filterButtonRounded
                  } font-medium transition-all ${
                    filter === "archived"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50"
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>

            {/* Sorting and Bulk Operations Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>

              {/* Bulk Selection Controls */}
              <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
                {selectedBookmarks.size > 0 ? (
                  <>
                    <span className="text-sm text-slate-300">
                      {selectedBookmarks.size} selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => bulkArchiveBookmarks(true)}
                      className="px-3 py-1.5 text-sm bg-green-700/50 hover:bg-green-600/50 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </button>
                    <button
                      onClick={() => bulkArchiveBookmarks(false)}
                      className="px-3 py-1.5 text-sm bg-blue-700/50 hover:bg-blue-600/50 rounded-lg transition-all flex items-center gap-1"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Unarchive
                    </button>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          bulkMoveBookmarks(e.target.value);
                        }
                      }}
                      value=""
                      className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all"
                    >
                      <option value="">Move to...</option>
                      {directories.map((dir) => (
                        <option key={dir} value={dir}>
                          {dir}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={bulkDeleteBookmarks}
                      className="px-3 py-1.5 text-sm bg-red-700/50 hover:bg-red-600/50 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={selectAllBookmarks}
                    disabled={filteredBookmarks.length === 0}
                    className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Select All
                  </button>
                )}
              </div>
            </div>

            {/* Bookmarks List */}
            <div className={layout.bookmarkSpacing}>
              {filteredBookmarks.length === 0 ? (
                <div
                  className={`text-center py-16 text-slate-400 bg-slate-800/30 ${layout.cardRounded} border border-slate-700/50`}
                >
                  <FolderOpen className="w-20 h-20 mx-auto mb-4 opacity-40" />
                  <p className="text-lg">
                    No bookmarks yet. Add your first one!
                  </p>
                </div>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className={`bg-slate-800/50 backdrop-blur-xl ${
                      layout.bookmarkCardRounded
                    } ${
                      layout.bookmarkCardPadding
                    } border border-slate-700/50 hover:border-slate-600/80 hover:shadow-xl hover:shadow-purple-900/10 transition-all group ${
                      selectedBookmarks.has(bookmark.id)
                        ? "ring-2 ring-blue-500/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex flex-col sm:flex-row justify-between items-start ${layout.bookmarkCardGap} mb-3`}
                    >
                      <div className="flex gap-3 flex-1 min-w-0">
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleBookmarkSelection(bookmark.id)}
                          className="mt-1 flex-shrink-0 text-slate-400 hover:text-blue-400 transition-colors"
                          aria-label={
                            selectedBookmarks.has(bookmark.id)
                              ? "Deselect bookmark"
                              : "Select bookmark"
                          }
                        >
                          {selectedBookmarks.has(bookmark.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`${layout.bookmarkTitleSize} font-semibold mb-2 group-hover:text-blue-300 transition-colors`}
                          >
                            {bookmark.title}
                          </h3>
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 break-all"
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            {bookmark.url}
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleArchive(bookmark.id)}
                          className={`p-2.5 ${
                            layout.buttonRounded
                          } transition-all shadow-lg ${
                            bookmark.archived
                              ? "bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/30"
                              : "bg-slate-600/50 hover:bg-slate-500/50 border border-slate-600"
                          }`}
                          title={bookmark.archived ? "Unarchive" : "Archive"}
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className={`p-2.5 bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 ${layout.buttonRounded} transition-all shadow-lg hover:shadow-red-500/30`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {bookmark.tags.length > 0 && (
                      <div className={`flex ${layout.tagGap} mb-4 flex-wrap`}>
                        {bookmark.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`flex items-center gap-1.5 ${layout.tagSize} font-medium bg-gradient-to-br from-slate-700 to-slate-800 ${layout.tagPadding} rounded-full border border-slate-600/50`}
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {bookmark.directory && (
                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                        <Folder className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">
                          {bookmark.directory}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 mt-3 flex items-center gap-2">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Added {new Date(bookmark.dateAdded).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
