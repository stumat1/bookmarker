import Dexie from "dexie";

// Initialize Dexie database
export const db = new Dexie("BookmarkerDB");

// Define database schema
db.version(1).stores({
  bookmarks: "++id, url, title, directory, archived, dateAdded, *tags",
  directories: "++id, name",
  settings: "key, value",
});

// Bookmark operations
export const bookmarkDB = {
  // Get all bookmarks
  async getAll() {
    return await db.bookmarks.toArray();
  },

  // Add a new bookmark
  async add(bookmark) {
    const id = await db.bookmarks.add(bookmark);
    return { ...bookmark, id };
  },

  // Update an existing bookmark
  async update(id, changes) {
    await db.bookmarks.update(id, changes);
    return await db.bookmarks.get(id);
  },

  // Delete a bookmark by ID
  async delete(id) {
    await db.bookmarks.delete(id);
  },

  // Get a single bookmark by ID
  async get(id) {
    return await db.bookmarks.get(id);
  },

  // Bulk delete bookmarks
  async bulkDelete(ids) {
    await db.bookmarks.bulkDelete(ids);
  },

  // Clear all bookmarks
  async clear() {
    await db.bookmarks.clear();
  },

  // Search bookmarks
  async search(searchTerm, filter = "all") {
    let collection = db.bookmarks;

    if (filter === "archived") {
      collection = collection.where("archived").equals(true);
    } else if (filter === "unread") {
      collection = collection.where("archived").equals(false);
    }

    const bookmarks = await collection.toArray();

    if (!searchTerm) return bookmarks;

    const term = searchTerm.toLowerCase();
    return bookmarks.filter(
      (b) =>
        (b.title && b.title.toLowerCase().includes(term)) ||
        (b.url && b.url.toLowerCase().includes(term)) ||
        (Array.isArray(b.tags) && b.tags.some((tag) => tag.toLowerCase().includes(term)))
    );
  },
};

// Directory operations
export const directoryDB = {
  // Get all directories
  async getAll() {
    const dirs = await db.directories.toArray();
    return dirs.map((d) => d.name);
  },

  // Add a new directory
  async add(name) {
    const existing = await db.directories.where("name").equals(name).first();
    if (!existing) {
      await db.directories.add({ name });
    }
    return name;
  },

  // Delete a directory
  async delete(name) {
    const dir = await db.directories.where("name").equals(name).first();
    if (dir) {
      await db.directories.delete(dir.id);
    }
  },

  // Initialize with default directory
  async initialize() {
    const dirs = await this.getAll();
    if (dirs.length === 0 || !dirs.includes("Unsorted")) {
      await this.add("Unsorted");
    }
  },
};

// Settings operations
export const settingsDB = {
  // Get a setting by key
  async get(key, defaultValue = null) {
    const setting = await db.settings.get(key);
    return setting ? setting.value : defaultValue;
  },

  // Set a setting
  async set(key, value) {
    await db.settings.put({ key, value });
  },

  // Delete a setting
  async delete(key) {
    await db.settings.delete(key);
  },
};

// Migration utility to move data from localStorage to IndexedDB
export const migrateFromLocalStorage = async () => {
  try {
    // Check if migration is needed
    const migrated = await settingsDB.get("migrated", false);
    if (migrated) {
      console.log("Data already migrated");
      return;
    }

    console.log("Starting migration from localStorage to IndexedDB...");

    // Migrate bookmarks
    const bookmarksJSON = localStorage.getItem("bookmarks");
    if (bookmarksJSON) {
      const bookmarks = JSON.parse(bookmarksJSON);
      if (Array.isArray(bookmarks) && bookmarks.length > 0) {
        // Clear existing data first
        await db.bookmarks.clear();

        // Add all bookmarks
        for (const bookmark of bookmarks) {
          await db.bookmarks.add(bookmark);
        }
        console.log(`Migrated ${bookmarks.length} bookmarks`);
      }
    }

    // Migrate directories
    const directoriesJSON = localStorage.getItem("directories");
    if (directoriesJSON) {
      const directories = JSON.parse(directoriesJSON);
      if (Array.isArray(directories) && directories.length > 0) {
        // Clear existing directories
        await db.directories.clear();

        // Add all directories
        for (const dir of directories) {
          await db.directories.add({ name: dir });
        }
        console.log(`Migrated ${directories.length} directories`);
      }
    }

    // Migrate layout density setting
    const layoutDensity = localStorage.getItem("layoutDensity");
    if (layoutDensity) {
      await settingsDB.set("layoutDensity", layoutDensity);
      console.log("Migrated layout density setting");
    }

    // Mark migration as complete
    await settingsDB.set("migrated", true);
    console.log("Migration completed successfully!");

    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
};

// Initialize database
export const initializeDB = async () => {
  try {
    // Ensure directories are initialized
    await directoryDB.initialize();

    // Run migration if needed
    await migrateFromLocalStorage();

    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
};

export default db;
