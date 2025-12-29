import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Layout, Maximize2, Minimize2 } from "lucide-react";
import { useLayout, LAYOUT_DENSITIES } from "../contexts/LayoutContext";

export default function Settings() {
  const { layoutDensity, setLayoutDensity } = useLayout();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookmarks
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Settings content */}
        <div className="space-y-6">
          {/* Layout Density Setting */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl shadow-purple-900/20">
            <h2 className="text-2xl font-semibold mb-2 text-slate-100">
              Layout Density
            </h2>
            <p className="text-slate-400 mb-6">
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
                        : "border-slate-700/50 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50"
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
                        isSelected ? "text-blue-400" : "text-slate-400"
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isSelected ? "text-blue-300" : "text-slate-200"
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className="text-sm text-slate-400">
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
