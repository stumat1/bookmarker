import React, { useState, useEffect } from "react";
import { bookmarkDB, directoryDB, settingsDB } from "../utils/db";
import { Database, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function DatabaseStatus() {
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
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-4 border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-300">
          <Database className="w-5 h-5 animate-pulse" />
          <span>Loading database status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">IndexedDB Status</h3>
        </div>
        <button
          onClick={loadStatus}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
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
            <span className="text-slate-300">Bookmarks:</span>
            <span className="font-semibold text-white">
              {status.bookmarkCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Directories:</span>
            <span className="font-semibold text-white">
              {status.directoryCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Migration:</span>
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

      <div className="mt-3 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          Using IndexedDB for persistent storage
        </p>
      </div>
    </div>
  );
}
