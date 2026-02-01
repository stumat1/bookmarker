// Test script for IndexedDB implementation
// Run this in the browser console to verify database operations

import {
  bookmarkDB,
  directoryDB,
  settingsDB,
  initializeDB,
} from "./src/utils/db.js";

async function testDatabase() {
  console.log("🧪 Starting IndexedDB tests...\n");

  try {
    // Test 1: Initialize database
    console.log("Test 1: Initializing database...");
    await initializeDB();
    console.log("✅ Database initialized\n");

    // Test 2: Add a bookmark
    console.log("Test 2: Adding a test bookmark...");
    const testBookmark = {
      url: "https://example.com",
      title: "Example Site",
      tags: ["test", "example"],
      dateAdded: new Date().toISOString(),
      archived: false,
      directory: "Unsorted",
    };
    const addedBookmark = await bookmarkDB.add(testBookmark);
    console.log("✅ Bookmark added:", addedBookmark);
    console.log("\n");

    // Test 3: Get all bookmarks
    console.log("Test 3: Retrieving all bookmarks...");
    const allBookmarks = await bookmarkDB.getAll();
    console.log("✅ Retrieved bookmarks:", allBookmarks.length);
    console.log(allBookmarks);
    console.log("\n");

    // Test 4: Update a bookmark
    console.log("Test 4: Updating bookmark...");
    await bookmarkDB.update(addedBookmark.id, {
      title: "Updated Example Site",
    });
    const updated = await bookmarkDB.get(addedBookmark.id);
    console.log("✅ Bookmark updated:", updated);
    console.log("\n");

    // Test 5: Test directories
    console.log("Test 5: Testing directories...");
    await directoryDB.add("Test Directory");
    const dirs = await directoryDB.getAll();
    console.log("✅ Directories:", dirs);
    console.log("\n");

    // Test 6: Test settings
    console.log("Test 6: Testing settings...");
    await settingsDB.set("testSetting", "testValue");
    const setting = await settingsDB.get("testSetting");
    console.log("✅ Setting retrieved:", setting);
    console.log("\n");

    // Test 7: Search bookmarks
    console.log("Test 7: Testing search...");
    const searchResults = await bookmarkDB.search("example");
    console.log("✅ Search results:", searchResults.length);
    console.log(searchResults);
    console.log("\n");

    // Test 8: Delete bookmark
    console.log("Test 8: Deleting test bookmark...");
    await bookmarkDB.delete(addedBookmark.id);
    const afterDelete = await bookmarkDB.getAll();
    console.log("✅ Bookmark deleted. Remaining:", afterDelete.length);
    console.log("\n");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run tests
testDatabase();
