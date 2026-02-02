# Bookmarker

Privacy-focused smart bookmark manager. 100% client-side with IndexedDB storage.

## Tech Stack

- **React 19.2** with functional components and hooks
- **Vite 7.2** for build/dev
- **Tailwind CSS 4.1** for styling
- **Dexie.js 4.2** for IndexedDB wrapper
- **React Router DOM 7.11** for routing
- **Lucide React** for icons
- **Vitest** for testing

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers (LayoutContext)
├── pages/          # Route pages (BookmarkManager, Settings)
├── utils/          # Utilities (db.js, validation.js)
└── test/           # Vitest tests
```

## Key Files

- `src/utils/db.js` - Dexie database schema and operations
- `src/utils/validation.js` - Input sanitization and validation
- `src/pages/BookmarkManager.jsx` - Main app interface
- `src/contexts/LayoutContext.jsx` - Global layout state

## Database Schema

```javascript
bookmarks: "++id, url, title, directory, archived, dateAdded, *tags";
directories: "++id, name";
settings: "key, value";
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run test     # Run Vitest tests
```

## Conventions

- Use functional components with hooks
- State: useState for local, Context for global, IndexedDB for persistence
- Validate all user inputs via `validation.js`
- Sanitize HTML to prevent XSS
- Max 20 tags per bookmark, 50 chars each
- Max 500 char titles
- Default directory is "Unsorted"

## Testing

Tests are in `src/test/` using Vitest with jsdom environment. Run with `npm run test`.
