import XCTest
@testable import ChooseGODApp

class BookmarkManagerTests: XCTestCase {
    
    override func setUp() {
        super.setUp()
        // Clear any existing bookmarks
        UserDefaults.standard.removeObject(forKey: BookmarkManager.bookmarksKey)
    }
    
    override func tearDown() {
        // Clean up
        UserDefaults.standard.removeObject(forKey: BookmarkManager.bookmarksKey)
        super.tearDown()
    }
    
    func testInitialState() {
        let manager = BookmarkManager()
        XCTAssertEqual(manager.all().count, 0)
        XCTAssertFalse(manager.isBookmarked(book: "John", chapter: 3, verse: 16))
    }
    
    func testToggleBookmark() {
        let manager = BookmarkManager()
        
        // Add bookmark
        let isBookmarked = manager.toggle(book: "John", chapter: 3, verse: 16, text: "For God so loved the world...")
        XCTAssertTrue(isBookmarked)
        XCTAssertTrue(manager.isBookmarked(book: "John", chapter: 3, verse: 16))
        XCTAssertEqual(manager.all().count, 1)
        
        // Remove bookmark (toggle again)
        let isStillBookmarked = manager.toggle(book: "John", chapter: 3, verse: 16, text: "For God so loved the world...")
        XCTAssertFalse(isStillBookmarked)
        XCTAssertFalse(manager.isBookmarked(book: "John", chapter: 3, verse: 16))
        XCTAssertEqual(manager.all().count, 0)
    }
    
    func testMultipleBookmarks() {
        let manager = BookmarkManager()
        
        // Add multiple bookmarks
        manager.toggle(book: "John", chapter: 3, verse: 16, text: "For God so loved the world...")
        manager.toggle(book: "Psalm", chapter: 23, verse: 1, text: "The Lord is my shepherd...")
        manager.toggle(book: "Romans", chapter: 8, verse: 28, text: "And we know that all things work together...")
        
        XCTAssertEqual(manager.all().count, 3)
        XCTAssertTrue(manager.isBookmarked(book: "John", chapter: 3, verse: 16))
        XCTAssertTrue(manager.isBookmarked(book: "Psalm", chapter: 23, verse: 1))
        XCTAssertTrue(manager.isBookmarked(book: "Romans", chapter: 8, verse: 28))
    }
    
    func testPersistence() {
        let manager1 = BookmarkManager()
        
        // Add a bookmark
        manager1.toggle(book: "John", chapter: 3, verse: 16, text: "For God so loved the world...")
        XCTAssertEqual(manager1.all().count, 1)
        
        // Create new instance to test persistence
        let manager2 = BookmarkManager()
        XCTAssertEqual(manager2.all().count, 1)
        XCTAssertTrue(manager2.isBookmarked(book: "John", chapter: 3, verse: 16))
    }
    
    func testBookmarkedVerseStructure() {
        let manager = BookmarkManager()
        manager.toggle(book: "John", chapter: 3, verse: 16, text: "For God so loved the world...")
        
        let bookmarks = manager.all()
        let bookmark = bookmarks.first!
        
        XCTAssertEqual(bookmark.book, "John")
        XCTAssertEqual(bookmark.chapter, 3)
        XCTAssertEqual(bookmark.verse, 16)
        XCTAssertEqual(bookmark.text, "For God so loved the world...")
        XCTAssertNotNil(bookmark.dateAdded)
        
        // Reference should be formatted correctly
        XCTAssertEqual(bookmark.reference, "John 3:16")
    }
    
    func testBookmarkOrdering() {
        let manager = BookmarkManager()
        
        // Add bookmarks with slight delays to test ordering
        manager.toggle(book: "John", chapter: 3, verse: 16, text: "First")
        Thread.sleep(forTimeInterval: 0.01) // Small delay
        manager.toggle(book: "Psalm", chapter: 23, verse: 1, text: "Second")
        Thread.sleep(forTimeInterval: 0.01)
        manager.toggle(book: "Romans", chapter: 8, verse: 28, text: "Third")
        
        let bookmarks = manager.all()
        // Should be ordered by date added (most recent first)
        XCTAssertEqual(bookmarks[0].text, "Third")
        XCTAssertEqual(bookmarks[1].text, "Second") 
        XCTAssertEqual(bookmarks[2].text, "First")
    }
}