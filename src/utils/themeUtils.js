import { THEMES } from "../contexts/ThemeContext";

export function getThemeStyles(theme) {
  const styles = {
    [THEMES.DARK]: {
      // Page background
      pageBackground:
        "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950",
      textPrimary: "text-white",
      textSecondary: "text-slate-300",
      textMuted: "text-slate-400",
      textLink: "text-blue-400 hover:text-blue-300",

      // Card styles
      cardBackground: "bg-slate-800/60 backdrop-blur-xl",
      cardBorder: "border-slate-700/50",
      cardShadow: "shadow-2xl shadow-purple-900/20",
      cardHover: "hover:border-slate-600/80 hover:shadow-xl hover:shadow-purple-900/10",

      // Input styles
      inputBackground: "bg-slate-900/80",
      inputBorder: "border-slate-600",
      inputPlaceholder: "placeholder:text-slate-500",
      inputFocus: "focus:ring-blue-500",

      // Select styles
      selectBackground: "bg-slate-900/80",
      selectBorder: "border-slate-600",

      // Button styles
      buttonPrimary: "bg-blue-600",
      buttonSecondary: "bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/50",
      buttonSuccess: "bg-green-600",
      buttonDanger:
        "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
      buttonWarning: "bg-orange-600",
      buttonDisabled: "from-slate-600 to-slate-700",
      buttonNeutral: "bg-slate-700/50 hover:bg-slate-600/50",

      // Filter button styles
      filterActive:
        "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30",
      filterInactive: "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50",

      // Bookmark card
      bookmarkCardBackground: "bg-slate-800/50 backdrop-blur-xl",
      bookmarkCardBorder: "border-slate-700/50",
      bookmarkCardSelected: "ring-2 ring-blue-500/50",
      bookmarkCardEditing: "ring-2 ring-purple-500/50",

      // Tag styles
      tagBackground: "bg-gradient-to-br from-slate-700 to-slate-800",
      tagBorder: "border-slate-600/50",

      // Header gradient
      headerGradient:
        "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent",

      // Empty state
      emptyStateBackground: "bg-slate-800/30",
      emptyStateBorder: "border-slate-700/50",

      // Error message
      errorBackground: "bg-red-900/50",
      errorBorder: "border-red-700/50",
      errorText: "text-red-200",
      errorIcon: "text-red-400",

      // Directory styles
      directoryBackground: "bg-slate-900/50",
      directoryBorder: "border-slate-700/50",
      directoryHover: "hover:border-slate-600",
      directoryDropTarget:
        "border-green-500 bg-green-900/30 shadow-lg shadow-green-500/30",

      // Icon colors
      iconFolder: "text-yellow-400",
      iconCheck: "text-blue-500",
      iconCheckSelected: "text-blue-400",

      // Edit mode
      editLabelColor: "text-slate-300",
      editTitleColor: "text-purple-300",

      // Bulk operations
      bulkArchive: "bg-green-700/50 hover:bg-green-600/50",
      bulkUnarchive: "bg-blue-700/50 hover:bg-blue-600/50",
      bulkDelete: "bg-red-700/50 hover:bg-red-600/50",

      // Archive button states
      archiveActive:
        "bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/30",
      archiveInactive: "bg-slate-600/50 hover:bg-slate-500/50 border border-slate-600",

      // Edit button
      editButton:
        "bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/30",

      // Sort select
      sortSelect: "bg-slate-800/60 border-slate-700/50",
    },
    [THEMES.LIGHT]: {
      // Page background
      pageBackground: "bg-gradient-to-br from-slate-100 via-white to-blue-50",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-700",
      textMuted: "text-slate-500",
      textLink: "text-blue-600 hover:text-blue-700",

      // Card styles
      cardBackground: "bg-white/80 backdrop-blur-xl",
      cardBorder: "border-slate-200",
      cardShadow: "shadow-xl shadow-slate-200/50",
      cardHover: "hover:border-slate-300 hover:shadow-lg hover:shadow-slate-300/30",

      // Input styles
      inputBackground: "bg-white",
      inputBorder: "border-slate-300",
      inputPlaceholder: "placeholder:text-slate-400",
      inputFocus: "focus:ring-blue-500",

      // Select styles
      selectBackground: "bg-white",
      selectBorder: "border-slate-300",

      // Button styles
      buttonPrimary: "bg-blue-500 text-white",
      buttonSecondary:
        "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
      buttonSuccess: "bg-green-500 text-white",
      buttonDanger:
        "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white",
      buttonWarning: "bg-orange-500 text-white",
      buttonDisabled: "from-slate-300 to-slate-400",
      buttonNeutral: "bg-slate-100 hover:bg-slate-200 text-slate-700",

      // Filter button styles
      filterActive:
        "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-300/50 text-white",
      filterInactive:
        "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700",

      // Bookmark card
      bookmarkCardBackground: "bg-white/70 backdrop-blur-xl",
      bookmarkCardBorder: "border-slate-200",
      bookmarkCardSelected: "ring-2 ring-blue-400/50",
      bookmarkCardEditing: "ring-2 ring-purple-400/50",

      // Tag styles
      tagBackground: "bg-gradient-to-br from-slate-100 to-slate-200",
      tagBorder: "border-slate-300/50",

      // Header gradient
      headerGradient:
        "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",

      // Empty state
      emptyStateBackground: "bg-slate-100/50",
      emptyStateBorder: "border-slate-200",

      // Error message
      errorBackground: "bg-red-50",
      errorBorder: "border-red-200",
      errorText: "text-red-700",
      errorIcon: "text-red-500",

      // Directory styles
      directoryBackground: "bg-slate-50",
      directoryBorder: "border-slate-200",
      directoryHover: "hover:border-slate-300",
      directoryDropTarget:
        "border-green-400 bg-green-50 shadow-lg shadow-green-200/50",

      // Icon colors
      iconFolder: "text-amber-500",
      iconCheck: "text-blue-500",
      iconCheckSelected: "text-blue-500",

      // Edit mode
      editLabelColor: "text-slate-600",
      editTitleColor: "text-purple-600",

      // Bulk operations
      bulkArchive: "bg-green-100 hover:bg-green-200 text-green-700",
      bulkUnarchive: "bg-blue-100 hover:bg-blue-200 text-blue-700",
      bulkDelete: "bg-red-100 hover:bg-red-200 text-red-700",

      // Archive button states
      archiveActive:
        "bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-300/50 text-white",
      archiveInactive:
        "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600",

      // Edit button
      editButton:
        "bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 hover:shadow-purple-300/50 text-white",

      // Sort select
      sortSelect: "bg-white border-slate-200 text-slate-700",
    },
  };

  return styles[theme] || styles[THEMES.DARK];
}
