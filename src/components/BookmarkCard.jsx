import React from "react";
import {
  Trash2,
  Tag,
  ExternalLink,
  FolderOpen,
  Folder,
  Edit,
  Save,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { MAX_URL_LENGTH } from "../utils/validation";

export default function BookmarkCard({
  bookmark,
  isSelected,
  isEditing,
  isDragged,
  editForm,
  setEditForm,
  directories,
  themeStyles,
  layout,
  onToggleSelection,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleArchive,
  onDelete,
  onDragStart,
  onDragEnd,
}) {
  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, bookmark)}
      onDragEnd={onDragEnd}
      className={`${themeStyles.bookmarkCardBackground} ${
        layout.bookmarkCardRounded
      } ${layout.bookmarkCardPadding} border ${themeStyles.bookmarkCardBorder} ${
        themeStyles.cardHover
      } transition-all group ${
        isSelected ? themeStyles.bookmarkCardSelected : ""
      } ${isEditing ? themeStyles.bookmarkCardEditing : ""} ${
        isDragged ? "opacity-50 cursor-grabbing" : "cursor-grab"
      }`}
    >
      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${themeStyles.editTitleColor}`}
            >
              Edit Bookmark
            </h3>
            <button
              onClick={onCancelEdit}
              className={`${themeStyles.textMuted} hover:${themeStyles.textSecondary} transition-colors`}
              title="Cancel editing"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${themeStyles.editLabelColor}`}
            >
              Title
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  title: e.target.value,
                })
              }
              placeholder="Bookmark title"
              className={`w-full ${themeStyles.inputBackground} border ${themeStyles.inputBorder} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
          </div>

          {/* URL Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${themeStyles.editLabelColor}`}
            >
              URL
            </label>
            <input
              type="url"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              placeholder="https://example.com"
              maxLength={MAX_URL_LENGTH}
              className={`w-full ${themeStyles.inputBackground} border ${themeStyles.inputBorder} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
          </div>

          {/* Tags Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${themeStyles.editLabelColor}`}
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={editForm.tags}
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
              placeholder="tag1, tag2, tag3"
              className={`w-full ${themeStyles.inputBackground} border ${themeStyles.inputBorder} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
          </div>

          {/* Directory Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${themeStyles.editLabelColor}`}
            >
              Directory
            </label>
            <select
              value={editForm.directory}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  directory: e.target.value,
                })
              }
              className={`w-full ${themeStyles.selectBackground} border ${themeStyles.selectBorder} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            >
              {directories.map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onSaveEdit}
              className={`flex-1 flex items-center justify-center gap-2 ${themeStyles.buttonSuccess} rounded-lg px-4 py-2.5 font-semibold transition-all`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={onCancelEdit}
              className={`flex-1 flex items-center justify-center gap-2 ${themeStyles.buttonNeutral} rounded-lg px-4 py-2.5 font-semibold transition-all`}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <>
          <div
            className={`flex flex-col sm:flex-row justify-between items-start ${layout.bookmarkCardGap} mb-3`}
          >
            <div className="flex gap-3 flex-1 min-w-0">
              {/* Selection Checkbox */}
              <button
                onClick={() => onToggleSelection(bookmark.id)}
                className={`mt-1 flex-shrink-0 ${themeStyles.textMuted} hover:text-blue-400 transition-colors`}
                aria-label={isSelected ? "Deselect bookmark" : "Select bookmark"}
              >
                {isSelected ? (
                  <CheckSquare
                    className={`w-5 h-5 ${themeStyles.iconCheckSelected}`}
                  />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h3
                  className={`${layout.bookmarkTitleSize} font-semibold mb-2 group-hover:text-blue-400 transition-colors truncate`}
                >
                  {bookmark.title}
                </h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${themeStyles.textLink} flex items-center gap-1.5 break-all`}
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  {bookmark.url}
                </a>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onStartEdit(bookmark)}
                className={`p-2.5 ${themeStyles.editButton} ${layout.buttonRounded} transition-all shadow-lg`}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleArchive(bookmark.id)}
                className={`p-2.5 ${layout.buttonRounded} transition-all shadow-lg ${
                  bookmark.archived
                    ? themeStyles.archiveActive
                    : themeStyles.archiveInactive
                }`}
                title={bookmark.archived ? "Unarchive" : "Archive"}
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(bookmark.id)}
                className={`p-2.5 ${themeStyles.buttonDanger} ${layout.buttonRounded} transition-all shadow-lg`}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {bookmark.tags.length > 0 && (
            <div className={`flex ${layout.tagGap} mb-4 flex-wrap`}>
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className={`flex items-center gap-1.5 ${layout.tagSize} font-medium ${themeStyles.tagBackground} ${layout.tagPadding} rounded-full border ${themeStyles.tagBorder}`}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {bookmark.directory && (
            <div
              className={`mb-3 flex items-center gap-2 text-sm ${themeStyles.textSecondary}`}
            >
              <Folder className={`w-4 h-4 ${themeStyles.iconFolder}`} />
              <span className="font-medium">{bookmark.directory}</span>
            </div>
          )}

          <div
            className={`text-xs ${themeStyles.textMuted} mt-3 flex items-center gap-2`}
          >
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
        </>
      )}
    </div>
  );
}
