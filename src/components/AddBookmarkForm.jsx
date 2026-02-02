import React from "react";
import { MAX_URL_LENGTH, MAX_TAG_LENGTH } from "../utils/validation";

export default function AddBookmarkForm({
  url,
  setUrl,
  tags,
  setTags,
  selectedDirectory,
  setSelectedDirectory,
  directories,
  loading,
  onSubmit,
  themeStyles,
  layout,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div
      className={`${themeStyles.cardBackground} ${layout.cardRounded} ${layout.cardPadding} border ${themeStyles.cardBorder} ${themeStyles.cardShadow} ${layout.stickyTop} lg:sticky`}
    >
      <h2
        className={`${layout.bookmarkTitleSize} font-semibold ${layout.labelMargin} ${themeStyles.textSecondary}`}
      >
        Add Bookmark
      </h2>
      <div className={layout.cardGap}>
        <div>
          <label
            className={`block ${layout.labelSize} font-semibold ${layout.labelMargin} ${themeStyles.textSecondary}`}
          >
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/article"
            maxLength={MAX_URL_LENGTH}
            required
            className={`w-full ${themeStyles.inputBackground} border ${themeStyles.inputBorder} ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 ${themeStyles.inputFocus} focus:border-transparent transition-all ${themeStyles.inputPlaceholder}`}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${themeStyles.textMuted}`}>
              Enter a valid http:// or https:// URL
            </p>
            {url.length > MAX_URL_LENGTH - 200 && (
              <p
                className={`text-xs ${
                  url.length > MAX_URL_LENGTH - 50
                    ? "text-red-400 font-semibold"
                    : "text-orange-400"
                }`}
              >
                {MAX_URL_LENGTH - url.length} chars left
              </p>
            )}
          </div>
        </div>
        <div>
          <label
            className={`block ${layout.labelSize} font-semibold ${layout.labelMargin} ${themeStyles.textSecondary}`}
          >
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="tech, programming, tutorial"
            maxLength={MAX_TAG_LENGTH * 10}
            className={`w-full ${themeStyles.inputBackground} border ${themeStyles.inputBorder} ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${themeStyles.inputPlaceholder}`}
          />
          {tags.length > MAX_TAG_LENGTH * 5 && (
            <p
              className={`text-xs mt-1 ${
                tags.length > MAX_TAG_LENGTH * 9
                  ? "text-red-400 font-semibold"
                  : "text-orange-400"
              }`}
            >
              {MAX_TAG_LENGTH * 10 - tags.length} chars left
            </p>
          )}
        </div>
        <div>
          <label
            className={`block ${layout.labelSize} font-semibold ${layout.labelMargin} ${themeStyles.textSecondary}`}
          >
            Directory
          </label>
          <select
            value={selectedDirectory}
            onChange={(e) => setSelectedDirectory(e.target.value)}
            className={`w-full ${themeStyles.selectBackground} border ${themeStyles.selectBorder} ${layout.inputRounded} ${layout.inputPadding} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          >
            {directories.map((dir) => (
              <option key={dir} value={dir}>
                {dir}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full ${themeStyles.buttonPrimary} disabled:${themeStyles.buttonDisabled} ${layout.buttonRounded} ${layout.buttonPadding} font-semibold disabled:transform-none disabled:cursor-not-allowed`}
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
  );
}
