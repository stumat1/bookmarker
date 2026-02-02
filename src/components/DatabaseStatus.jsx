import React, { useState, useEffect } from "react";
import { bookmarkDB, directoryDB, settingsDB } from "../utils/db";
import { Database, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeStyles } from "../utils/themeUtils";

export default function DatabaseStatus() {
  const { theme } = useTheme();
  const themeStyles = getThemeStyles(theme);

  const [status, setStatus] = useState({
    bookmarkCount: 0,
    directoryCount: 0,
    migrated: false,
    loading: true,
    error: null,
  });

  const loadStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: null }));

      const bookmarks = await bookmarkDB.getAll();
      const directories = await directoryDB.getAll();
      const migrated = await settingsDB.get("migrated", false);

      setStatus({
        bookmarkCount: bookmarks.length,
        directoryCount: directories.length,
        migrated,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to load database status:", error);
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (status.loading) {
    return (
      <div className={`${themeStyles.cardBackground} rounded-lg p-4 border ${themeStyles.cardBorder}`}>
        <div className={`flex items-center gap-2 ${themeStyles.textSecondary}`}>
          <Database className="w-5 h-5 animate-pulse" />
          <span>Loading database status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeStyles.cardBackground} rounded-lg p-4 border ${themeStyles.cardBorder}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className={`font-semibold ${themeStyles.textPrimary}`}>IndexedDB Status</h3>
        </div>
        <button
          onClick={loadStatus}
          className={`p-1 ${themeStyles.buttonNeutral} rounded transition-colors`}
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${themeStyles.textMuted}`} />
        </button>
      </div>

      {status.error ? (
        <div className="flex items-start gap-2 text-red-400">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Database Error</p>
            <p className="text-sm text-red-300">{status.error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className={themeStyles.textSecondary}>Bookmarks:</span>
            <span className={`font-semibold ${themeStyles.textPrimary}`}>
              {status.bookmarkCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={themeStyles.textSecondary}>Directories:</span>
            <span className={`font-semibold ${themeStyles.textPrimary}`}>
              {status.directoryCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={themeStyles.textSecondary}>Migration:</span>
            <div className="flex items-center gap-1">
              {status.migrated ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400">Complete</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`mt-3 pt-3 border-t ${themeStyles.cardBorder}`}>
        <p className={`text-xs ${themeStyles.textMuted}`}>
          Using IndexedDB for persistent storage
        </p>
      </div>
    </div>
  );
}
