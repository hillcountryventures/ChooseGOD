import Foundation

/// Persisted bookmark model
struct BookmarkedVerse: Codable, Equatable {
    let book: String
    let chapter: Int
    let verse: Int
    let text: String
    let translation: String
    let dateAdded: Date
    
    /// Unique key for dedup
    var key: String { "\(book)-\(chapter)-\(verse)-\(translation)" }
}

/// Manages verse bookmarks in UserDefaults
enum BookmarkManager {
    
    private static let storageKey = "bookmarkedVerses"
    
    // MARK: - Read
    
    static func all() -> [BookmarkedVerse] {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let list = try? JSONDecoder().decode([BookmarkedVerse].self, from: data) else {
            return []
        }
        return list
    }
    
    static func isBookmarked(_ verse: Verse) -> Bool {
        let key = "\(verse.book)-\(verse.chapter)-\(verse.verse)-\(verse.translation)"
        return all().contains { $0.key == key }
    }
    
    // MARK: - Write
    
    /// Toggle bookmark state. Returns new isBookmarked value.
    @discardableResult
    static func toggle(_ verse: Verse) -> Bool {
        var list = all()
        let key = "\(verse.book)-\(verse.chapter)-\(verse.verse)-\(verse.translation)"
        
        if let idx = list.firstIndex(where: { $0.key == key }) {
            list.remove(at: idx)
            save(list)
            return false
        } else {
            let bm = BookmarkedVerse(
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verse,
                text: verse.text,
                translation: verse.translation,
                dateAdded: Date()
            )
            list.insert(bm, at: 0)
            save(list)
            return true
        }
    }
    
    // MARK: - Persistence
    
    private static func save(_ list: [BookmarkedVerse]) {
        if let data = try? JSONEncoder().encode(list) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}
