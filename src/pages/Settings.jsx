import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Layout, Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import { useLayout, LAYOUT_DENSITIES } from "../contexts/LayoutContext";
import { useTheme, THEMES } from "../contexts/ThemeContext";
import { getThemeStyles } from "../utils/themeUtils";
import DatabaseStatus from "../components/DatabaseStatus";

export default function Settings() {
  const { layoutDensity, setLayoutDensity } = useLayout();
  const { theme, setTheme } = useTheme();
  const themeStyles = getThemeStyles(theme);

  const layoutOptions = [
    {
      value: LAYOUT_DENSITIES.COMPACT,
      label: "Compact",
      description: "Maximize space, show more content",
      icon: Minimize2,
    },
    {
      value: LAYOUT_DENSITIES.DEFAULT,
      label: "Default",
      description: "Balanced spacing and readability",
      icon: Layout,
    },
    {
      value: LAYOUT_DENSITIES.GENEROUS,
      label: "Generous",
      description: "Extra spacing for comfortable reading",
      icon: Maximize2,
    },
  ];

  const themeOptions = [
    {
      value: THEMES.LIGHT,
      label: "Light",
      description: "Clean and bright appearance",
      icon: Sun,
    },
    {
      value: THEMES.DARK,
      label: "Dark",
      description: "Easy on the eyes, perfect for night",
      icon: Moon,
    },
  ];

  return (
    <div
      className={`min-h-screen ${themeStyles.pageBackground} ${themeStyles.textPrimary} p-4 sm:p-8`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${themeStyles.textSecondary} hover:${themeStyles.textPrimary} transition-colors mb-4`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookmarks
          </Link>
          <h1
            className={`text-4xl sm:text-5xl font-bold ${themeStyles.headerGradient}`}
          >
            Settings
          </h1>
        </div>

        {/* Settings content */}
        <div className="space-y-6">
          {/* Database Status */}
          <DatabaseStatus />

          {/* Theme Setting */}
          <div
            className={`${themeStyles.cardBackground} rounded-2xl p-8 border ${themeStyles.cardBorder} ${themeStyles.cardShadow}`}
          >
            <h2 className={`text-2xl font-semibold mb-2 ${themeStyles.textPrimary}`}>
              Theme
            </h2>
            <p className={`${themeStyles.textMuted} mb-6`}>
              Choose between light and dark appearance
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                        : `${themeStyles.cardBorder} ${themeStyles.cardBackground} ${themeStyles.cardHover}`
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    <Icon
                      className={`w-8 h-8 mb-4 ${
                        isSelected ? "text-blue-400" : themeStyles.textMuted
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isSelected ? "text-blue-400" : themeStyles.textSecondary
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className={`text-sm ${themeStyles.textMuted}`}>
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout Density Setting */}
          <div
            className={`${themeStyles.cardBackground} rounded-2xl p-8 border ${themeStyles.cardBorder} ${themeStyles.cardShadow}`}
          >
            <h2 className={`text-2xl font-semibold mb-2 ${themeStyles.textPrimary}`}>
              Layout Density
            </h2>
            <p className={`${themeStyles.textMuted} mb-6`}>
              Choose how much spacing and size you prefer for the interface
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {layoutOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = layoutDensity === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setLayoutDensity(option.value)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                        : `${themeStyles.cardBorder} ${themeStyles.cardBackground} ${themeStyles.cardHover}`
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    <Icon
                      className={`w-8 h-8 mb-4 ${
                        isSelected ? "text-blue-400" : themeStyles.textMuted
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isSelected ? "text-blue-400" : themeStyles.textSecondary
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className={`text-sm ${themeStyles.textMuted}`}>
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
