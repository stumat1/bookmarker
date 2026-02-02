import React from "react";
import { Folder, FolderPlus, Trash2 } from "lucide-react";

export default function DirectoryList({
  directories,
  bookmarks,
  newDirectory,
  setNewDirectory,
  dropTarget,
  themeStyles,
  layout,
  onAddDirectory,
  onDeleteDirectory,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onAddDirectory();
    }
  };

  const getBookmarkCount = (dir) => {
    return bookmarks.filter((b) => b.directory === dir).length;
  };

  return (
    <div
      className={`${themeStyles.cardBackground} ${layout.cardRounded} ${layout.cardPadding} border ${themeStyles.cardBorder} ${themeStyles.cardShadow} ${layout.stickyTop} lg:sticky`}
    >
      <h2
        className={`${layout.bookmarkTitleSize} font-semibold ${layout.labelMargin} ${themeStyles.textSecondary} flex items-center gap-2`}
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
            onKeyDown={handleKeyDown}
            placeholder="New directory name"
            className={`flex-1 ${themeStyles.inputBackground} border ${themeStyles.inputBorder} ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${themeStyles.inputPlaceholder}`}
          />
          <button
            onClick={onAddDirectory}
            className={`${themeStyles.buttonSuccess} ${layout.buttonRounded} ${layout.buttonPadding} font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
            title="Add Directory"
          >
            <FolderPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {directories.length === 0 ? (
            <p
              className={`text-sm ${themeStyles.textMuted} text-center py-4`}
            >
              No directories yet
            </p>
          ) : (
            directories.map((dir) => (
              <div
                key={dir}
                className={`flex items-center justify-between ${
                  themeStyles.directoryBackground
                } ${layout.directoryItemRounded} ${
                  layout.directoryItemPadding
                } border transition-all ${
                  dropTarget === dir
                    ? themeStyles.directoryDropTarget
                    : `${themeStyles.directoryBorder} ${themeStyles.directoryHover}`
                }`}
                onDragOver={(e) => onDragOver(e, dir)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, dir)}
              >
                <div
                  className={`flex items-center gap-2 ${themeStyles.textSecondary}`}
                >
                  <Folder className={`w-4 h-4 ${themeStyles.iconFolder}`} />
                  <span className="font-medium">{dir}</span>
                  <span className={`text-xs ${themeStyles.textMuted}`}>
                    ({getBookmarkCount(dir)})
                  </span>
                </div>
                <button
                  onClick={() => onDeleteDirectory(dir)}
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
  );
}
