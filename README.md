# Bookmark Triave - Smart Bookmark Manager

A modern, elegant bookmark manager built with React, featuring robust data persistence and an intuitive user interface.

## ✨ Features

- 📑 **Smart Bookmark Management** - Add, edit, organize, and search bookmarks with ease
- 🗂️ **Custom Directories** - Organize bookmarks into custom folders
- 🏷️ **Tagging System** - Tag bookmarks for better organization
- 🔍 **Powerful Search** - Search across titles, URLs, and tags
- 📦 **Archive System** - Archive bookmarks to keep your list clean
- 💾 **Robust Persistence** - All data saved in IndexedDB, survives restarts
- 📤 **Import/Export** - Backup and restore your bookmarks as JSON
- 🎨 **Multiple Layouts** - Compact, Default, or Generous spacing
- ↩️ **Undo Support** - Undo deletions with ease
- 🔄 **Drag & Drop** - Move bookmarks between directories
- ✨ **Modern UI** - Beautiful gradient design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

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

## 💾 Data Persistence

This app uses **IndexedDB** with **Dexie.js** for robust, scalable data persistence:

- **Automatic saving** - All changes are saved immediately
- **Large storage capacity** - Gigabytes of storage (vs 5-10MB for localStorage)
- **Fast queries** - Indexed searches for instant results
- **Offline support** - Works completely offline
- **Auto-migration** - Automatically migrates from old localStorage data

### Viewing Your Data

1. Open Browser DevTools (F12)
2. Go to "Application" → "IndexedDB" → "BookmarkerDB"
3. View your bookmarks, directories, and settings in real-time

## 📖 Documentation

### For Users

- [**USER_GUIDE.md**](USER_GUIDE.md) - Complete user guide with tips and tricks
- [**QUICK_START.md**](QUICK_START.md) - Quick reference guide

### For Developers

- [**DATABASE_IMPLEMENTATION.md**](DATABASE_IMPLEMENTATION.md) - Technical details of the IndexedDB implementation
- [**TESTING_GUIDE.md**](TESTING_GUIDE.md) - Comprehensive testing procedures
- [**IMPLEMENTATION_SUMMARY.md**](IMPLEMENTATION_SUMMARY.md) - Overview of persistence features
- [**DEPLOYMENT.md**](DEPLOYMENT.md) - Production deployment guide

### Project Information

- [**CHANGELOG.md**](CHANGELOG.md) - Version history and changes
- [**HIGH_PRIORITY_FEATURES.md**](HIGH_PRIORITY_FEATURES.md) - Implemented features overview

## 🧪 Testing

### Run Automated Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

All 51 validation tests must pass before deployment.

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

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed testing instructions.

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Dexie.js** - IndexedDB wrapper for data persistence
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icon library
- **React Router** - Navigation

## 📱 Features in Detail

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

- **Layout Density** - Choose Compact, Default, or Generous spacing
- **Database Status** - View bookmark count and migration status

## 🎨 UI Features

- Responsive design (mobile-friendly)
- Beautiful gradient background
- Smooth animations and transitions
- Loading states and error handling
- Keyboard shortcuts
- Accessible design

## 📦 Project Structure

```
bookmarker/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   └── DatabaseStatus.jsx
│   ├── contexts/
│   │   └── LayoutContext.jsx
│   ├── pages/
│   │   ├── BookmarkManager.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── db.js                  # IndexedDB utilities
│   │   ├── layoutUtils.js
│   │   └── validation.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── DATABASE_IMPLEMENTATION.md
├── TESTING_GUIDE.md
└── IMPLEMENTATION_SUMMARY.md
```

## 🔒 Privacy & Security

- **100% Local** - All data stored locally in your browser
- **No tracking** - No analytics or external services (unless you configure Sentry)
- **No accounts** - No sign-up required
- **Offline** - Works completely offline
- **Private** - Your data never leaves your device
- **XSS Protection** - All inputs sanitized
- **Validated Inputs** - Comprehensive URL and data validation

## 🌐 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- Opera 67+

All modern browsers with IndexedDB support.

## 🚀 Production Deployment

Ready to deploy? See [DEPLOYMENT.md](DEPLOYMENT.md) for complete instructions including:

- Build optimization
- Hosting options (Vercel, Netlify, etc.)
- Environment configuration
- Error monitoring setup
- Performance optimization

## 📊 Status

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Tests:** 51 passing  
**Build:** Optimized  
**Documentation:** Complete

## 📝 License

This project is available for personal and educational use.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💡 Future Ideas

- Cloud sync across devices
- Browser extension
- Import from browser bookmarks
- Keyboard shortcuts
- Clickable tags for filtering
- Duplicate URL detection
- Tag suggestions and autocomplete
- Statistics and analytics
- Bookmark thumbnails/screenshots
- Collaborative bookmark sharing

---

**Built with ❤️ using React and IndexedDB**

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
