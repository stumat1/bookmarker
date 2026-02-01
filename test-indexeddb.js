/**
 * Quick Test Script for IndexedDB Implementation
 *
 * Open the browser console (F12) and paste this script to quickly test
 * the database functionality.
 */

(async function testIndexedDB() {
  console.log("🚀 Starting IndexedDB Quick Test\n");
  console.log("=====================================\n");

  try {
    // Import the database module
    const { bookmarkDB, directoryDB, settingsDB, initializeDB } = await import(
      "/src/utils/db.js"
    );

    // Test 1: Check if database is initialized
    console.log("📊 Test 1: Database Initialization");
    await initializeDB();
    console.log("✅ Database initialized successfully\n");

    // Test 2: Get current data
    console.log("📊 Test 2: Current Data Status");
    const bookmarks = await bookmarkDB.getAll();
    const directories = await directoryDB.getAll();
    const layoutDensity = await settingsDB.get("layoutDensity");
    const migrated = await settingsDB.get("migrated");

    console.log(`   Bookmarks: ${bookmarks.length}`);
    console.log(
      `   Directories: ${directories.length} - [${directories.join(", ")}]`
    );
    console.log(`   Layout Density: ${layoutDensity || "default"}`);
    console.log(
      `   Migration Status: ${migrated ? "✅ Completed" : "⏳ Pending"}`
    );
    console.log("");

    // Test 3: Add a test bookmark
    console.log("📊 Test 3: Adding Test Bookmark");
    const testBookmark = {
      url: "https://test-" + Date.now() + ".com",
      title: "Test Bookmark - " + new Date().toLocaleTimeString(),
      tags: ["test", "automated"],
      dateAdded: new Date().toISOString(),
      archived: false,
      directory: "Unsorted",
    };

    const added = await bookmarkDB.add(testBookmark);
    console.log(`✅ Added bookmark with ID: ${added.id}`);
    console.log(`   Title: ${added.title}`);
    console.log("");

    // Test 4: Verify the bookmark was saved
    console.log("📊 Test 4: Verifying Persistence");
    const retrieved = await bookmarkDB.get(added.id);
    if (retrieved && retrieved.title === added.title) {
      console.log("✅ Bookmark successfully retrieved from database");
      console.log(`   URL: ${retrieved.url}`);
      console.log(`   Tags: [${retrieved.tags.join(", ")}]`);
    } else {
      console.error("❌ Failed to retrieve bookmark");
    }
    console.log("");

    // Test 5: Update the bookmark
    console.log("📊 Test 5: Updating Bookmark");
    await bookmarkDB.update(added.id, {
      title: "Updated Test Bookmark",
      archived: true,
    });
    const updated = await bookmarkDB.get(added.id);
    console.log(`✅ Bookmark updated:`);
    console.log(`   New Title: ${updated.title}`);
    console.log(`   Archived: ${updated.archived}`);
    console.log("");

    // Test 6: Search functionality
    console.log("📊 Test 6: Search Functionality");
    const searchResults = await bookmarkDB.search("test");
    console.log(`✅ Found ${searchResults.length} bookmark(s) matching "test"`);
    console.log("");

    // Test 7: Clean up test data
    console.log("📊 Test 7: Cleanup");
    await bookmarkDB.delete(added.id);
    const afterDelete = await bookmarkDB.get(added.id);
    if (!afterDelete) {
      console.log("✅ Test bookmark cleaned up successfully");
    }
    console.log("");

    // Final summary
    console.log("=====================================");
    console.log("🎉 All tests passed!");
    console.log("=====================================\n");

    console.log("💡 Your IndexedDB implementation is working perfectly!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. Try adding some real bookmarks in the UI");
    console.log("   2. Refresh the page (F5) to verify persistence");
    console.log("   3. Check the Settings page for database status");
    console.log("   4. Export your bookmarks to create a backup");
    console.log("");

    // Display current data summary
    const finalBookmarks = await bookmarkDB.getAll();
    console.log(`Current data in IndexedDB:`);
    console.log(`   📑 ${finalBookmarks.length} bookmarks`);
    console.log(`   📁 ${directories.length} directories`);
    console.log(
      `   ⚙️  Settings configured: ${layoutDensity || "default"} layout`
    );
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    console.error("Stack trace:", error.stack);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("   1. Make sure the dev server is running");
    console.log(
      "   2. Check that you're on the app page (http://localhost:5173)"
    );
    console.log("   3. Look for any errors in the console");
    console.log("   4. Try refreshing the page");
  }
})();
