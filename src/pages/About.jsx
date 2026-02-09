import React from "react";
import { Bookmark, Shield, HardDrive, Tags, FolderOpen, Search, ArrowUpDown, Archive } from "lucide-react";

function About() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookmarker</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          A privacy-focused bookmark manager that runs entirely in your browser.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Version 1.0.0</p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Why Bookmarker?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Your bookmarks are personal. Bookmarker keeps them that way by storing
          everything locally on your device using IndexedDB. No accounts, no
          servers, no data collection. Your bookmarks never leave your computer.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="100% Private"
            description="All data stays on your device. Nothing is sent to any server."
          />
          <FeatureCard
            icon={<HardDrive className="w-5 h-5" />}
            title="Offline Storage"
            description="Uses IndexedDB for fast, reliable local storage that works offline."
          />
          <FeatureCard
            icon={<FolderOpen className="w-5 h-5" />}
            title="Directories"
            description="Organize bookmarks into custom directories to keep things tidy."
          />
          <FeatureCard
            icon={<Tags className="w-5 h-5" />}
            title="Tagging"
            description="Add tags to bookmarks for flexible categorization and filtering."
          />
          <FeatureCard
            icon={<Search className="w-5 h-5" />}
            title="Search & Filter"
            description="Quickly find bookmarks by searching titles, URLs, or filtering by tag."
          />
          <FeatureCard
            icon={<ArrowUpDown className="w-5 h-5" />}
            title="Sorting"
            description="Sort bookmarks by date or title in ascending or descending order."
          />
          <FeatureCard
            icon={<Archive className="w-5 h-5" />}
            title="Archiving"
            description="Archive bookmarks you want to keep but don't need right now."
          />
          <FeatureCard
            icon={<Bookmark className="w-5 h-5" />}
            title="Simple & Fast"
            description="A clean interface focused on getting you to your bookmarks quickly."
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Built With</h2>
        <div className="flex flex-wrap gap-2">
          {["React", "Vite", "Tailwind CSS", "Dexie.js", "Lucide Icons"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default About;
