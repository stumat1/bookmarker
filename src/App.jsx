import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Trash2,
  Tag,
  ExternalLink,
  Sparkles,
  Search,
  FolderOpen,
  FolderPlus,
  Folder,
} from "lucide-react";

export default function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState([]);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, archived
  const [directories, setDirectories] = useState([]);
  const [newDirectory, setNewDirectory] = useState("");
  const [selectedDirectory, setSelectedDirectory] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks");
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
    const savedDirs = localStorage.getItem("directories");
    if (savedDirs) {
      setDirectories(JSON.parse(savedDirs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("directories", JSON.stringify(directories));
  }, [directories]);

  const addBookmark = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Fetch page title with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, "text/html");
      const title = doc.querySelector("title")?.textContent || url;

      const newBookmark = {
        id: Date.now(),
        url: url.trim(),
        title: title.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        dateAdded: new Date().toISOString(),
        summary: null,
        archived: false,
        directory: selectedDirectory,
      };

      setBookmarks([newBookmark, ...bookmarks]);
      setUrl("");
      setTags("");
      setSelectedDirectory("");
    } catch (error) {
      // Fallback if fetch fails or times out
      console.log(
        "Failed to fetch title, using URL as fallback:",
        error.message
      );
      const newBookmark = {
        id: Date.now(),
        url: url.trim(),
        title: url.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        dateAdded: new Date().toISOString(),
        summary: null,
        archived: false,
        directory: selectedDirectory,
      };
      setBookmarks([newBookmark, ...bookmarks]);
      setUrl("");
      setTags("");
      setSelectedDirectory("");
    }
    setLoading(false);
  };

  const deleteBookmark = (id) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const toggleArchive = (id) => {
    setBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, archived: !b.archived } : b))
    );
  };

  const addDirectory = () => {
    if (!newDirectory.trim()) return;
    if (directories.includes(newDirectory.trim())) {
      alert("Directory already exists!");
      return;
    }
    setDirectories([...directories, newDirectory.trim()]);
    setNewDirectory("");
  };

  const deleteDirectory = (dirName) => {
    setDirectories(directories.filter((d) => d !== dirName));
    // Remove directory from bookmarks
    setBookmarks(
      bookmarks.map((b) =>
        b.directory === dirName ? { ...b, directory: "" } : b
      )
    );
  };

  const summarizeBookmark = async (id) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    setBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, summarizing: true } : b))
    );

    try {
      // Fetch page content
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(bookmark.url)}`
      );
      const data = await response.json();

      // Call Claude API for summary
      const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Summarize this webpage in 2-3 sentences. Focus on the main point and key takeaways:\n\n${data.contents.slice(
                0,
                10000
              )}`,
            },
          ],
        }),
      });

      const apiData = await apiResponse.json();
      const summary = apiData.content[0].text;

      setBookmarks(
        bookmarks.map((b) =>
          b.id === id ? { ...b, summary, summarizing: false } : b
        )
      );
    } catch (error) {
      console.error("Summarization failed:", error);
      setBookmarks(
        bookmarks.map((b) =>
          b.id === id
            ? {
                ...b,
                summary: "Failed to generate summary",
                summarizing: false,
              }
            : b
        )
      );
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === "archived") return b.archived && matchesSearch;
    if (filter === "unread") return !b.archived && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bookmark Triage
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Save now, decide later. Let AI help you manage your reading list.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Bookmark Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl shadow-purple-900/20 lg:sticky lg:top-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">
                Add Bookmark
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBookmark()}
                    placeholder="https://example.com/article"
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBookmark()}
                    placeholder="tech, programming, tutorial"
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Directory (optional)
                  </label>
                  <select
                    value={selectedDirectory}
                    onChange={(e) => setSelectedDirectory(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">No directory</option>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 rounded-lg px-4 py-3 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:transform-none disabled:cursor-not-allowed"
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
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl shadow-purple-900/20 lg:sticky lg:top-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                Directories
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDirectory}
                    onChange={(e) => setNewDirectory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDirectory()}
                    placeholder="New directory name"
                    className="flex-1 bg-slate-900/80 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-slate-500"
                  />
                  <button
                    onClick={addDirectory}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg px-4 py-2 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
                        className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-2 border border-slate-700/50 hover:border-slate-600 transition-all"
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
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bookmarks..."
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${
                    filter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${
                    filter === "unread"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter("archived")}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${
                    filter === "archived"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50"
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>

            {/* Bookmarks List */}
            <div className="space-y-4">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <FolderOpen className="w-20 h-20 mx-auto mb-4 opacity-40" />
                  <p className="text-lg">
                    No bookmarks yet. Add your first one!
                  </p>
                </div>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/80 hover:shadow-xl hover:shadow-purple-900/10 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors">
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
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => summarizeBookmark(bookmark.id)}
                          disabled={bookmark.summarizing}
                          className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 disabled:shadow-none"
                          title="Summarize with AI"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleArchive(bookmark.id)}
                          className={`p-2.5 rounded-xl transition-all shadow-lg ${
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
                          className="p-2.5 bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl transition-all shadow-lg hover:shadow-red-500/30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {bookmark.tags.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {bookmark.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 text-xs font-medium bg-gradient-to-br from-slate-700 to-slate-800 px-3 py-1.5 rounded-full border border-slate-600/50"
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

                    {bookmark.summarizing && (
                      <div className="text-sm text-slate-300 italic flex items-center gap-2 bg-purple-900/20 rounded-lg p-3 border border-purple-700/30">
                        <svg
                          className="animate-spin h-4 w-4 text-purple-400"
                          viewBox="0 0 24 24"
                        >
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
                        Generating summary...
                      </div>
                    )}

                    {bookmark.summary && !bookmark.summarizing && (
                      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-4 text-sm text-slate-200 border-l-4 border-purple-500 shadow-lg">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{bookmark.summary}</p>
                        </div>
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
