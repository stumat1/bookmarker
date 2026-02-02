import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Search,
  FolderOpen,
  Trash2,
  Settings as SettingsIcon,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Undo,
  CheckSquare,
  Square,
  ArrowUpDown,
  Archive,
} from "lucide-react";
import { useLayout } from "../contexts/LayoutContext";
import { useTheme } from "../contexts/ThemeContext";
import { getLayoutStyles } from "../utils/layoutUtils";
import { getThemeStyles } from "../utils/themeUtils";
import {
  validateAndSanitizeURL,
  parseAndValidateTags,
  validateDirectoryName,
  sanitizeTitle,
  validateBookmark,
} from "../utils/validation";
import { bookmarkDB, directoryDB, initializeDB } from "../utils/db";
import BookmarkCard from "../components/BookmarkCard";
import AddBookmarkForm from "../components/AddBookmarkForm";
import DirectoryList from "../components/DirectoryList";

export default function BookmarkManager() {
  const { layoutDensity } = useLayout();
  const { theme } = useTheme();
  const layout = getLayoutStyles(layoutDensity);
  const themeStyles = getThemeStyles(theme);

  // Maximum undo stack size to prevent memory issues
  const MAX_UNDO_STACK = 50;

  const [bookmarks, setBookmarks] = useState([]);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, archived
  const [directories, setDirectories] = useState(["Unsorted"]);
  const [newDirectory, setNewDirectory] = useState("");
  const [selectedDirectory, setSelectedDirectory] = useState("Unsorted");
  const [errorMessage, setErrorMessage] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, title-asc, title-desc
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editForm, setEditForm] = useState({
    url: "",
    tags: "",
    directory: "",
    title: "",
  });
  const [draggedBookmark, setDraggedBookmark] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Track pending changes for efficient sync (only modified bookmark IDs)
  const pendingUpdates = useRef(new Set());
  const pendingDeletes = useRef(new Set());
  const knownIds = useRef(new Set());

  // Initialize database and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize database and run migration
        await initializeDB();
        setDbInitialized(true);

        // Load bookmarks
        const savedBookmarks = await bookmarkDB.getAll();
        const validBookmarks = savedBookmarks.filter(validateBookmark);
        if (validBookmarks.length !== savedBookmarks.length) {
          console.warn(
            `Removed ${
              savedBookmarks.length - validBookmarks.length
            } invalid bookmarks`,
          );
        }
        setBookmarks(validBookmarks);
        // Initialize known IDs for efficient sync
        knownIds.current = new Set(validBookmarks.map((b) => b.id));

        // Load directories
        const savedDirs = await directoryDB.getAll();
        // Ensure 'Unsorted' always exists
        if (savedDirs.length === 0 || !savedDirs.includes("Unsorted")) {
          await directoryDB.add("Unsorted");
          setDirectories(["Unsorted"]);
        } else {
          setDirectories(savedDirs);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setErrorMessage("Failed to load data from database. Starting fresh.");
        setBookmarks([]);
        setDirectories(["Unsorted"]);
        setDbInitialized(true);
      }
    };

    loadData();
  }, []);

  // Sync bookmarks to IndexedDB - only process pending changes (not all bookmarks)
  useEffect(() => {
    if (!dbInitialized) return;

    const syncBookmarks = async () => {
      try {
        // Process pending deletes
        if (pendingDeletes.current.size > 0) {
          const idsToDelete = [...pendingDeletes.current];
          for (const id of idsToDelete) {
            await bookmarkDB.delete(id);
            knownIds.current.delete(id);
          }
          pendingDeletes.current.clear();
        }

        // Process pending updates only
        if (pendingUpdates.current.size > 0) {
          const idsToUpdate = [...pendingUpdates.current];
          for (const id of idsToUpdate) {
            const bookmark = bookmarks.find((b) => b.id === id);
            if (bookmark && knownIds.current.has(id)) {
              await bookmarkDB.update(id, bookmark);
            }
          }
          pendingUpdates.current.clear();
        }
      } catch (error) {
        console.error("Failed to sync bookmarks:", error);
        setErrorMessage("Failed to save changes to database.");
      }
    };

    syncBookmarks();
  }, [bookmarks, dbInitialized]);

  // Save directories to IndexedDB whenever they change
  useEffect(() => {
    if (!dbInitialized) return;

    const saveDirectories = async () => {
      try {
        const currentDirs = await directoryDB.getAll();

        // Add new directories
        for (const dir of directories) {
          if (!currentDirs.includes(dir)) {
            await directoryDB.add(dir);
          }
        }

        // Remove deleted directories
        for (const dir of currentDirs) {
          if (!directories.includes(dir)) {
            await directoryDB.delete(dir);
          }
        }
      } catch (error) {
        console.error("Failed to save directories:", error);
        setErrorMessage("Failed to save directory changes.");
      }
    };

    saveDirectories();
  }, [directories, dbInitialized]);

  // Clear selection when filter changes
  useEffect(() => {
    setSelectedBookmarks(new Set());
  }, [filter]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Debounce search term for better performance (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addBookmark = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // Validate and sanitize URL
      const validatedURL = validateAndSanitizeURL(url);

      // Check for duplicate URL
      const existingBookmark = bookmarks.find((b) => b.url === validatedURL);
      if (existingBookmark) {
        const shouldAdd = window.confirm(
          `A bookmark with this URL already exists:\n"${existingBookmark.title}"\n\nAdd anyway?`,
        );
        if (!shouldAdd) {
          setLoading(false);
          return;
        }
      }

      // Parse and validate tags
      const validatedTags = parseAndValidateTags(tags);

      // Create bookmark object (without ID - let DB generate it)
      const bookmarkData = {
        url: validatedURL,
        title: sanitizeTitle(validatedURL),
        tags: validatedTags,
        dateAdded: new Date().toISOString(),
        archived: false,
        directory: selectedDirectory || "Unsorted",
      };

      // Add to DB first to get the real ID
      const newBookmark = await bookmarkDB.add(bookmarkData);
      knownIds.current.add(newBookmark.id);

      setBookmarks([newBookmark, ...bookmarks]);
      setUrl("");
      setTags("");
      setSelectedDirectory("Unsorted");
      setLoading(false);

      const bookmarkId = newBookmark.id;

      // Fetch page title in background (non-blocking) with retry
      const fetchTitle = async (retries = 2) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(
            `https://api.allorigins.win/get?url=${encodeURIComponent(
              validatedURL,
            )}`,
            { signal: controller.signal },
          );
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error("Failed to fetch");

          const data = await response.json();
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, "text/html");
          const title = doc.querySelector("title")?.textContent;

          if (title && title.trim()) {
            const sanitizedTitle = sanitizeTitle(title.trim());
            // Update bookmark with fetched title only if it still exists
            pendingUpdates.current.add(bookmarkId);
            setBookmarks((prev) => {
              const bookmark = prev.find((b) => b.id === bookmarkId);
              if (!bookmark) {
                // Bookmark was deleted, don't update
                pendingUpdates.current.delete(bookmarkId);
                return prev;
              }
              return prev.map((b) =>
                b.id === bookmarkId ? { ...b, title: sanitizedTitle } : b,
              );
            });
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
        `Are you sure you want to delete "${bookmark.title}"? You can undo this action.`,
      )
    ) {
      // Add to undo stack with size limit
      const newUndoStack = [
        ...undoStack.slice(-MAX_UNDO_STACK + 1),
        { action: "delete", data: bookmark },
      ];
      setUndoStack(newUndoStack);
      pendingDeletes.current.add(id);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    }
  };

  const toggleArchive = (id) => {
    pendingUpdates.current.add(id);
    setBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, archived: !b.archived } : b)),
    );
  };

  // Undo last action
  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];

    if (lastAction.action === "delete") {
      // Restore deleted bookmark - re-add to DB
      const restored = await bookmarkDB.add(lastAction.data);
      knownIds.current.add(restored.id);
      setBookmarks([restored, ...bookmarks]);
    } else if (lastAction.action === "bulkDelete") {
      // Restore multiple deleted bookmarks - re-add to DB
      const restoredBookmarks = [];
      for (const bookmark of lastAction.data) {
        const restored = await bookmarkDB.add(bookmark);
        knownIds.current.add(restored.id);
        restoredBookmarks.push(restored);
      }
      setBookmarks([...restoredBookmarks, ...bookmarks]);
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
        `Delete ${selectedBookmarks.size} selected bookmark(s)? You can undo this action.`,
      )
    ) {
      const deletedBookmarks = bookmarks.filter((b) =>
        selectedBookmarks.has(b.id),
      );

      // Add to undo stack with size limit
      const newUndoStack = [
        ...undoStack.slice(-MAX_UNDO_STACK + 1),
        { action: "bulkDelete", data: deletedBookmarks },
      ];
      setUndoStack(newUndoStack);

      // Mark all as pending deletes
      selectedBookmarks.forEach((id) => pendingDeletes.current.add(id));
      setBookmarks(bookmarks.filter((b) => !selectedBookmarks.has(b.id)));
      setSelectedBookmarks(new Set());
    }
  };

  // Bulk archive/unarchive selected bookmarks
  const bulkArchiveBookmarks = (archive) => {
    if (selectedBookmarks.size === 0) return;

    // Mark all as pending updates
    selectedBookmarks.forEach((id) => pendingUpdates.current.add(id));
    setBookmarks(
      bookmarks.map((b) =>
        selectedBookmarks.has(b.id) ? { ...b, archived: archive } : b,
      ),
    );
    setSelectedBookmarks(new Set());
  };

  // Bulk move selected bookmarks to directory
  const bulkMoveBookmarks = (directory) => {
    if (selectedBookmarks.size === 0) return;

    // Mark all as pending updates
    selectedBookmarks.forEach((id) => pendingUpdates.current.add(id));
    setBookmarks(
      bookmarks.map((b) =>
        selectedBookmarks.has(b.id) ? { ...b, directory } : b,
      ),
    );
    setSelectedBookmarks(new Set());
  };

  // Drag and Drop handlers
  const handleDragStart = (e, bookmark) => {
    setDraggedBookmark(bookmark);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", bookmark.id);
  };

  const handleDragEnd = () => {
    setDraggedBookmark(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, directory) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(directory);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e, directory) => {
    e.preventDefault();
    if (!draggedBookmark) return;

    // Move the bookmark to the new directory
    pendingUpdates.current.add(draggedBookmark.id);
    setBookmarks(
      bookmarks.map((b) =>
        b.id === draggedBookmark.id ? { ...b, directory } : b,
      ),
    );

    setDraggedBookmark(null);
    setDropTarget(null);
  };

  // Start editing a bookmark
  const startEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark.id);
    setEditForm({
      url: bookmark.url,
      tags: bookmark.tags.join(", "),
      directory: bookmark.directory || "Unsorted",
      title: bookmark.title,
    });
    setErrorMessage("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingBookmark(null);
    setEditForm({ url: "", tags: "", directory: "", title: "" });
    setErrorMessage("");
  };

  // Save edited bookmark
  const saveEditBookmark = () => {
    if (!editingBookmark) return;

    try {
      // Validate and sanitize URL
      const validatedURL = validateAndSanitizeURL(editForm.url);

      // Parse and validate tags
      const validatedTags = parseAndValidateTags(editForm.tags);

      // Sanitize title
      const validatedTitle = sanitizeTitle(editForm.title);

      // Mark as pending update
      pendingUpdates.current.add(editingBookmark);

      // Update the bookmark
      setBookmarks(
        bookmarks.map((b) =>
          b.id === editingBookmark
            ? {
                ...b,
                url: validatedURL,
                title: validatedTitle,
                tags: validatedTags,
                directory: editForm.directory || "Unsorted",
              }
            : b,
        ),
      );

      // Clear edit mode
      cancelEdit();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const addDirectory = () => {
    setErrorMessage("");
    try {
      const validatedName = validateDirectoryName(newDirectory);

      // Case-insensitive duplicate check
      const lowerDirs = directories.map((d) => d.toLowerCase());
      if (lowerDirs.includes(validatedName.toLowerCase())) {
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
      (b) => b.directory === dirName,
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
          b.directory === dirName ? { ...b, directory: "Unsorted" } : b,
        ),
      );
    }
  };

  // Export bookmarks to JSON file
  const exportBookmarks = () => {
    let url = null;
    let a = null;
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
      url = URL.createObjectURL(blob);
      a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();

      setErrorMessage(""); // Clear any errors
      setSuccessMessage("Bookmarks exported successfully!");
    } catch (error) {
      setErrorMessage("Failed to export bookmarks: " + error.message);
    } finally {
      // Always clean up resources
      if (a && a.parentNode) {
        document.body.removeChild(a);
      }
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  };

  // Import bookmarks from JSON file
  const importBookmarks = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
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

        // Validate and filter imported directories
        let importedDirs = data.directories || ["Unsorted"];
        const validDirs = importedDirs.filter((dir) => {
          try {
            validateDirectoryName(dir);
            return true;
          } catch {
            return false;
          }
        });

        if (!validDirs.includes("Unsorted")) {
          validDirs.unshift("Unsorted");
        }

        // Remap bookmarks with invalid directories to Unsorted (without mutating original)
        const remappedBookmarks = validBookmarks.map((bookmark) => {
          if (!validDirs.includes(bookmark.directory)) {
            return { ...bookmark, directory: "Unsorted" };
          }
          return bookmark;
        });

        // Ask user if they want to merge or replace with improved dialog
        const shouldMerge = window.confirm(
          `Import ${remappedBookmarks.length} bookmark(s)?\n\n` +
            `• Click OK to MERGE with existing (${bookmarks.length} current bookmarks)\n` +
            `• Click Cancel to REPLACE ALL (⚠️ WARNING: will delete all existing bookmarks)\n\n` +
            `Recommended: Click OK to merge safely.`,
        );

        if (shouldMerge) {
          // Merge: Add imported bookmarks with new IDs to avoid collisions
          const mergedBookmarks = [...bookmarks];
          const existingIds = new Set(bookmarks.map((b) => b.id));

          // Counter for generating unique IDs when collisions occur
          let idCounter = 0;
          const newBookmarksToAdd = [];

          remappedBookmarks.forEach((bookmark) => {
            let newId = bookmark.id;
            if (existingIds.has(newId)) {
              // Generate unique integer ID using timestamp + counter
              // This approach guarantees uniqueness and prevents infinite loops
              const MAX_ATTEMPTS = 1000;
              let attempts = 0;
              do {
                // Use crypto.getRandomValues for better randomness, fallback to Math.random
                const randomPart = typeof crypto !== "undefined" && crypto.getRandomValues
                  ? crypto.getRandomValues(new Uint32Array(1))[0]
                  : Math.floor(Math.random() * 0xFFFFFFFF);
                newId = Date.now() * 1000 + (randomPart % 1000) + idCounter++;
                attempts++;
              } while (existingIds.has(newId) && attempts < MAX_ATTEMPTS);

              if (attempts >= MAX_ATTEMPTS) {
                console.error("Failed to generate unique ID after max attempts");
                return; // Skip this bookmark
              }
            }
            existingIds.add(newId);
            const newBookmark = { ...bookmark, id: newId };
            mergedBookmarks.push(newBookmark);
            newBookmarksToAdd.push(newBookmark);
          });

          // Add new bookmarks to DB
          for (const bookmark of newBookmarksToAdd) {
            await bookmarkDB.add(bookmark);
            knownIds.current.add(bookmark.id);
          }

          const mergedDirs = [...new Set([...directories, ...validDirs])];

          setBookmarks(mergedBookmarks);
          setDirectories(mergedDirs);
        } else {
          // Replace: Clear existing and add all imported bookmarks to DB
          // Delete all existing bookmarks from DB
          for (const id of knownIds.current) {
            await bookmarkDB.delete(id);
          }
          knownIds.current.clear();

          // Add all imported bookmarks to DB
          for (const bookmark of remappedBookmarks) {
            await bookmarkDB.add(bookmark);
            knownIds.current.add(bookmark.id);
          }

          setBookmarks(remappedBookmarks);
          setDirectories(validDirs);
        }

        setErrorMessage("");
        setSuccessMessage(`Successfully imported ${remappedBookmarks.length} bookmark(s)!`);
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
      // Use debounced search term for better performance
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();

      const matchesSearch =
        b.title.toLowerCase().includes(lowerSearchTerm) ||
        b.url.toLowerCase().includes(lowerSearchTerm) ||
        (Array.isArray(b.tags) &&
          b.tags.some((t) => t.toLowerCase().includes(lowerSearchTerm)));

      if (filter === "archived") return b.archived && matchesSearch;
      if (filter === "unread") return !b.archived && matchesSearch;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc": {
          const dateA = new Date(a.dateAdded).getTime() || 0;
          const dateB = new Date(b.dateAdded).getTime() || 0;
          return dateB - dateA;
        }
        case "date-asc": {
          const dateA = new Date(a.dateAdded).getTime() || 0;
          const dateB = new Date(b.dateAdded).getTime() || 0;
          return dateA - dateB;
        }
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

  return (
    <div
      className={`min-h-screen ${themeStyles.pageBackground} ${themeStyles.textPrimary} ${layout.pagePadding}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`${layout.headerMargin} text-center relative`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt="Bookmarker Logo"
              className={`${layout.logoSize} object-contain`}
            />
            <h1
              className={`${layout.titleSize} font-bold ${themeStyles.headerGradient}`}
            >
              Bookmarker
            </h1>
          </div>
          <p className={`${themeStyles.textSecondary} ${layout.subtitleSize}`}>
            Save now, decide later. Organize your reading list efficiently.
          </p>

          {/* Settings link in top right */}
          <Link
            to="/settings"
            className={`absolute top-0 right-0 flex items-center gap-2 ${layout.buttonPadding} ${themeStyles.buttonSecondary} border ${themeStyles.cardBorder} ${layout.buttonRounded} transition-all group`}
          >
            <SettingsIcon className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          </Link>
        </div>

        {/* ARIA Live Region for Screen Reader Announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {successMessage && successMessage}
          {errorMessage && `Error: ${errorMessage}`}
        </div>

        {/* Success Message Display */}
        {successMessage && (
          <div
            role="alert"
            aria-live="polite"
            className={`mb-6 ${themeStyles.successBackground} backdrop-blur-xl rounded-xl p-4 border ${themeStyles.successBorder} flex items-start gap-3`}
          >
            <CheckCircle className={`w-5 h-5 ${themeStyles.successIcon} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`${themeStyles.successText} font-medium`}>{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className={`${themeStyles.successIcon} hover:opacity-70 transition-colors`}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Message Display */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className={`mb-6 ${themeStyles.errorBackground} backdrop-blur-xl rounded-xl p-4 border ${themeStyles.errorBorder} flex items-start gap-3`}
          >
            <AlertCircle className={`w-5 h-5 ${themeStyles.errorIcon} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`${themeStyles.errorText} font-medium`}>{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className={`${themeStyles.errorIcon} hover:opacity-70 transition-colors`}
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
            className={`flex items-center gap-2 px-4 py-2 ${themeStyles.buttonSuccess} rounded-lg font-semibold`}
          >
            <Download className="w-4 h-4" />
            Export Bookmarks
          </button>
          <label className={`flex items-center gap-2 px-4 py-2 ${themeStyles.buttonPrimary} rounded-lg font-semibold cursor-pointer`}>
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
            className={`flex items-center gap-2 px-4 py-2 ${themeStyles.buttonWarning} disabled:${themeStyles.buttonDisabled} disabled:cursor-not-allowed rounded-lg font-semibold disabled:transform-none`}
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
          <div className={`text-sm ${themeStyles.textMuted} flex items-center`}>
            <Bookmark className="w-4 h-4 mr-1" />
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${layout.cardGap}`}>
          {/* Left Column - Add Bookmark Form & Directory Management */}
          <div className={`lg:col-span-1 ${layout.cardGap}`}>
            <AddBookmarkForm
              url={url}
              setUrl={setUrl}
              tags={tags}
              setTags={setTags}
              selectedDirectory={selectedDirectory}
              setSelectedDirectory={setSelectedDirectory}
              directories={directories}
              loading={loading}
              onSubmit={addBookmark}
              themeStyles={themeStyles}
              layout={layout}
            />

            <DirectoryList
              directories={directories}
              bookmarks={bookmarks}
              newDirectory={newDirectory}
              setNewDirectory={setNewDirectory}
              dropTarget={dropTarget}
              themeStyles={themeStyles}
              layout={layout}
              onAddDirectory={addDirectory}
              onDeleteDirectory={deleteDirectory}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </div>

          {/* Right Column - Bookmarks List */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div
              className={`flex flex-col sm:flex-row gap-4 ${layout.headerMargin}`}
            >
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${themeStyles.textMuted}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bookmarks..."
                  className={`w-full ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${layout.filterButtonRounded} pl-12 pr-4 ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${themeStyles.inputPlaceholder}`}
                />
              </div>
              <div className="flex gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setFilter("all")}
                  className={`${layout.filterButtonPadding} ${
                    layout.filterButtonRounded
                  } font-medium transition-all ${
                    filter === "all"
                      ? themeStyles.filterActive
                      : themeStyles.filterInactive
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
                      ? themeStyles.filterActive
                      : themeStyles.filterInactive
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
                      ? themeStyles.filterActive
                      : themeStyles.filterInactive
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
                <ArrowUpDown className={`w-4 h-4 ${themeStyles.textMuted}`} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`${themeStyles.sortSelect} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
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
                    <span className={`text-sm ${themeStyles.textSecondary}`}>
                      {selectedBookmarks.size} selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className={`px-3 py-1.5 text-sm ${themeStyles.buttonNeutral} rounded-lg transition-all`}
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => bulkArchiveBookmarks(true)}
                      className={`px-3 py-1.5 text-sm ${themeStyles.bulkArchive} rounded-lg transition-all flex items-center gap-1`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </button>
                    <button
                      onClick={() => bulkArchiveBookmarks(false)}
                      className={`px-3 py-1.5 text-sm ${themeStyles.bulkUnarchive} rounded-lg transition-all flex items-center gap-1`}
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
                      className={`px-3 py-1.5 text-sm ${themeStyles.buttonNeutral} rounded-lg transition-all`}
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
                      className={`px-3 py-1.5 text-sm ${themeStyles.bulkDelete} rounded-lg transition-all flex items-center gap-1`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={selectAllBookmarks}
                    disabled={filteredBookmarks.length === 0}
                    className={`px-3 py-1.5 text-sm ${themeStyles.buttonNeutral} disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-1`}
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
                  className={`text-center py-16 ${themeStyles.textMuted} ${themeStyles.emptyStateBackground} ${layout.cardRounded} border ${themeStyles.emptyStateBorder}`}
                >
                  <FolderOpen className="w-20 h-20 mx-auto mb-4 opacity-40" />
                  <p className="text-lg">
                    No bookmarks yet. Add your first one!
                  </p>
                </div>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    isSelected={selectedBookmarks.has(bookmark.id)}
                    isEditing={editingBookmark === bookmark.id}
                    isDragged={draggedBookmark?.id === bookmark.id}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    directories={directories}
                    themeStyles={themeStyles}
                    layout={layout}
                    onToggleSelection={toggleBookmarkSelection}
                    onStartEdit={startEditBookmark}
                    onSaveEdit={saveEditBookmark}
                    onCancelEdit={cancelEdit}
                    onToggleArchive={toggleArchive}
                    onDelete={deleteBookmark}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
