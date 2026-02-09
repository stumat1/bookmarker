# Bookmarker - Smart Bookmark Manager

A modern, privacy-focused bookmark manager built with React, featuring robust data persistence and an intuitive user interface. 100% client-side with no accounts or servers.

## Features

- **Smart Bookmark Management** - Add, edit, organize, and search bookmarks with ease
- **Custom Directories** - Organize bookmarks into custom folders
- **Tagging System** - Tag bookmarks for better organization
- **Powerful Search** - Search across titles, URLs, and tags
- **Archive System** - Archive bookmarks to keep your list clean
- **Robust Persistence** - All data saved in IndexedDB, survives restarts
- **Import/Export** - Backup and restore your bookmarks as JSON
- **Multiple Layouts** - Compact, Default, or Generous spacing
- **Light/Dark Theme** - Switch between light and dark themes
- **Undo Support** - Undo deletions with ease
- **Drag & Drop** - Move bookmarks between directories

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone or download the repository
cd bookmarker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## Data Persistence

This app uses **IndexedDB** with **Dexie.js** for robust, scalable data persistence:

- **Automatic saving** - All changes are saved immediately
- **Large storage capacity** - Gigabytes of storage (vs 5-10MB for localStorage)
- **Fast queries** - Indexed searches for instant results
- **Offline support** - Works completely offline
- **Auto-migration** - Automatically migrates from old localStorage data

### Viewing Your Data

1. Open Browser DevTools (F12)
2. Go to "Application" > "IndexedDB" > "BookmarkerDB"
3. View your bookmarks, directories, and settings in real-time

## Documentation

See [claude.md](claude.md) for project-specific coding guidelines and conventions.

## Testing

### Run Automated Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

All 84 tests must pass before deployment.

### Manual Testing in Browser Console

```javascript
// Import database module
const db = await import("/src/utils/db.js");

// View your bookmarks
const bookmarks = await db.bookmarkDB.getAll();
console.log("Bookmarks:", bookmarks);

// View directories
const dirs = await db.directoryDB.getAll();
console.log("Directories:", dirs);
```

Or run the automated test script:

```javascript
// Copy and paste contents of test-indexeddb.js into console
```

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **Dexie.js** - IndexedDB wrapper for data persistence
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icon library
- **React Router 7** - Navigation
- **Vitest** - Testing framework

## Features in Detail

### Bookmark Operations

- Add bookmarks with automatic title fetching
- Edit bookmark details (URL, title, tags, directory)
- Delete with undo support
- Archive/unarchive bookmarks
- Drag and drop to move between directories
- Bulk operations (select multiple, delete, archive, move)

### Organization

- Create custom directories
- Move bookmarks between directories
- Tag bookmarks with multiple tags
- Search across all fields
- Filter by archived/unread status
- Sort by date or title (ascending/descending)

### Data Management

- **Export** - Download bookmarks as JSON backup
- **Import** - Restore from backup (merge or replace)
- **Auto-save** - All changes saved immediately to IndexedDB
- **Migration** - Automatic one-time migration from localStorage

### Settings

- **Theme** - Switch between Light and Dark themes (persisted to IndexedDB)
- **Layout Density** - Choose Compact, Default, or Generous spacing
- **Database Status** - View bookmark count and migration status

## UI Features

- Responsive design
- Light and Dark theme support with smooth transitions
- Smooth animations and transitions
- Loading states and error handling

## Project Structure

```
bookmarker/
├── src/
│   ├── components/
│   │   ├── AddBookmarkForm.jsx    # Bookmark creation form
│   │   ├── BookmarkCard.jsx       # Individual bookmark display
│   │   ├── DatabaseStatus.jsx     # DB connection status
│   │   ├── DirectoryList.jsx      # Directory navigation
│   │   └── ErrorBoundary.jsx      # Error handling wrapper
│   ├── contexts/
│   │   ├── LayoutContext.jsx      # Layout density state
│   │   └── ThemeContext.jsx       # Theme state (light/dark)
│   ├── pages/
│   │   ├── About.jsx              # About page
│   │   ├── BookmarkManager.jsx    # Main bookmark manager
│   │   └── Settings.jsx           # Settings page
│   ├── test/
│   │   ├── BookmarkManager.test.jsx
│   │   ├── ErrorBoundary.test.jsx
│   │   ├── Settings.test.jsx
│   │   ├── setup.js
│   │   ├── testUtils.jsx
│   │   └── validation.test.js
│   ├── utils/
│   │   ├── db.js                  # IndexedDB utilities
│   │   ├── errorMonitoring.js     # Global error handlers
│   │   ├── layoutUtils.js         # Layout density styles
│   │   ├── themeUtils.js          # Theme color styles
│   │   └── validation.js          # Input validation
│   ├── App.jsx
│   └── main.jsx
├── public/
├── claude.md                      # Coding guidelines
└── package.json
```

## Privacy & Security

- **100% Local** - Your bookmark data is stored exclusively in your browser's IndexedDB and never leaves your device
- **No accounts** - No sign-up required
- **Offline** - Works completely offline
- **XSS Protection** - All inputs sanitized
- **Validated Inputs** - Comprehensive URL and data validation

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- Opera 67+

All modern browsers with IndexedDB support.

## Production Deployment

Run `npm run build` to create an optimized production build in the `dist/` folder. Deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Status

**Version:** 1.0.0
**Tests:** 84 passing

## License

This project is available for personal and educational use.

## Contributing

Contributions, issues, and feature requests are welcome!
