import Foundation

// MARK: - Bible Verse

struct BibleVerse: Identifiable, Codable, Equatable {
    let id: String
    let book: String
    let chapter: Int
    let verse: Int
    let text: String
    let translation: String
    
    var reference: String {
        "\(book) \(chapter):\(verse)"
    }
    
    // Coding keys for Supabase snake_case
    enum CodingKeys: String, CodingKey {
        case id
        case book
        case chapter
        case verse
        case text
        case translation
    }
}

// MARK: - Bible Chapter

struct BibleChapter: Identifiable {
    var id: String { "\(book)-\(chapter)" }
    let book: String
    let chapter: Int
    let verses: [BibleVerse]
}

// MARK: - Highlight Color

enum HighlightColor: String, Codable, CaseIterable {
    case yellow, green, blue, pink, purple, orange
    
    var color: String {
        switch self {
        case .yellow: return "#FEF08A"
        case .green: return "#BBF7D0"
        case .blue: return "#BFDBFE"
        case .pink: return "#FBCFE8"
        case .purple: return "#DDD6FE"
        case .orange: return "#FED7AA"
        }
    }
}

// MARK: - Verse Highlight

struct VerseHighlight: Identifiable, Codable {
    let id: String
    let userId: String
    let book: String
    let chapter: Int
    let verse: Int
    let color: HighlightColor
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case book
        case chapter
        case verse
        case color
        case createdAt = "created_at"
    }
}

// MARK: - Verse Note

struct VerseNote: Identifiable, Codable {
    let id: String
    let userId: String
    let book: String
    let chapter: Int
    let verse: Int
    let content: String
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case book
        case chapter
        case verse
        case content
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Verse Bookmark

struct VerseBookmark: Identifiable, Codable {
    let id: String
    let userId: String
    let book: String
    let chapter: Int
    let verse: Int
    var label: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case book
        case chapter
        case verse
        case label
        case createdAt = "created_at"
    }
    
    var reference: String {
        "\(book) \(chapter):\(verse)"
    }
}

// MARK: - Daily Verse

struct DailyVerse: Codable {
    let verse: BibleVerse
    let date: String
    let translation: String?
    let reflection: String?
}

// MARK: - Bible Books

struct BibleBook {
    let name: String
    let chapters: Int
    let testament: Testament
    
    enum Testament {
        case old, new
    }
}

let BIBLE_BOOKS: [BibleBook] = [
    // Old Testament
    BibleBook(name: "Genesis", chapters: 50, testament: .old),
    BibleBook(name: "Exodus", chapters: 40, testament: .old),
    BibleBook(name: "Leviticus", chapters: 27, testament: .old),
    BibleBook(name: "Numbers", chapters: 36, testament: .old),
    BibleBook(name: "Deuteronomy", chapters: 34, testament: .old),
    BibleBook(name: "Joshua", chapters: 24, testament: .old),
    BibleBook(name: "Judges", chapters: 21, testament: .old),
    BibleBook(name: "Ruth", chapters: 4, testament: .old),
    BibleBook(name: "1 Samuel", chapters: 31, testament: .old),
    BibleBook(name: "2 Samuel", chapters: 24, testament: .old),
    BibleBook(name: "1 Kings", chapters: 22, testament: .old),
    BibleBook(name: "2 Kings", chapters: 25, testament: .old),
    BibleBook(name: "1 Chronicles", chapters: 29, testament: .old),
    BibleBook(name: "2 Chronicles", chapters: 36, testament: .old),
    BibleBook(name: "Ezra", chapters: 10, testament: .old),
    BibleBook(name: "Nehemiah", chapters: 13, testament: .old),
    BibleBook(name: "Esther", chapters: 10, testament: .old),
    BibleBook(name: "Job", chapters: 42, testament: .old),
    BibleBook(name: "Psalms", chapters: 150, testament: .old),
    BibleBook(name: "Proverbs", chapters: 31, testament: .old),
    BibleBook(name: "Ecclesiastes", chapters: 12, testament: .old),
    BibleBook(name: "Song of Solomon", chapters: 8, testament: .old),
    BibleBook(name: "Isaiah", chapters: 66, testament: .old),
    BibleBook(name: "Jeremiah", chapters: 52, testament: .old),
    BibleBook(name: "Lamentations", chapters: 5, testament: .old),
    BibleBook(name: "Ezekiel", chapters: 48, testament: .old),
    BibleBook(name: "Daniel", chapters: 12, testament: .old),
    BibleBook(name: "Hosea", chapters: 14, testament: .old),
    BibleBook(name: "Joel", chapters: 3, testament: .old),
    BibleBook(name: "Amos", chapters: 9, testament: .old),
    BibleBook(name: "Obadiah", chapters: 1, testament: .old),
    BibleBook(name: "Jonah", chapters: 4, testament: .old),
    BibleBook(name: "Micah", chapters: 7, testament: .old),
    BibleBook(name: "Nahum", chapters: 3, testament: .old),
    BibleBook(name: "Habakkuk", chapters: 3, testament: .old),
    BibleBook(name: "Zephaniah", chapters: 3, testament: .old),
    BibleBook(name: "Haggai", chapters: 2, testament: .old),
    BibleBook(name: "Zechariah", chapters: 14, testament: .old),
    BibleBook(name: "Malachi", chapters: 4, testament: .old),
    // New Testament
    BibleBook(name: "Matthew", chapters: 28, testament: .new),
    BibleBook(name: "Mark", chapters: 16, testament: .new),
    BibleBook(name: "Luke", chapters: 24, testament: .new),
    BibleBook(name: "John", chapters: 21, testament: .new),
    BibleBook(name: "Acts", chapters: 28, testament: .new),
    BibleBook(name: "Romans", chapters: 16, testament: .new),
    BibleBook(name: "1 Corinthians", chapters: 16, testament: .new),
    BibleBook(name: "2 Corinthians", chapters: 13, testament: .new),
    BibleBook(name: "Galatians", chapters: 6, testament: .new),
    BibleBook(name: "Ephesians", chapters: 6, testament: .new),
    BibleBook(name: "Philippians", chapters: 4, testament: .new),
    BibleBook(name: "Colossians", chapters: 4, testament: .new),
    BibleBook(name: "1 Thessalonians", chapters: 5, testament: .new),
    BibleBook(name: "2 Thessalonians", chapters: 3, testament: .new),
    BibleBook(name: "1 Timothy", chapters: 6, testament: .new),
    BibleBook(name: "2 Timothy", chapters: 4, testament: .new),
    BibleBook(name: "Titus", chapters: 3, testament: .new),
    BibleBook(name: "Philemon", chapters: 1, testament: .new),
    BibleBook(name: "Hebrews", chapters: 13, testament: .new),
    BibleBook(name: "James", chapters: 5, testament: .new),
    BibleBook(name: "1 Peter", chapters: 5, testament: .new),
    BibleBook(name: "2 Peter", chapters: 3, testament: .new),
    BibleBook(name: "1 John", chapters: 5, testament: .new),
    BibleBook(name: "2 John", chapters: 1, testament: .new),
    BibleBook(name: "3 John", chapters: 1, testament: .new),
    BibleBook(name: "Jude", chapters: 1, testament: .new),
    BibleBook(name: "Revelation", chapters: 22, testament: .new),
]

func getChapterCount(for book: String) -> Int {
    BIBLE_BOOKS.first { $0.name == book }?.chapters ?? 28
}

// MARK: - Bible Translation

enum BibleTranslation: String, Codable, CaseIterable, Hashable, Identifiable {
    // Supabase (16 translations, all free!)
    case kjv = "KJV"
    case asv = "ASV"
    case bbe = "BBE"
    case cuv = "CUV"
    case finnish = "FINNISH"
    case french = "FRENCH"
    case greek = "GREEK"
    case korean = "KOREAN"
    case niv = "NIV"
    case paa = "PAA"
    case romanian = "ROMANIAN"
    case rvr = "RVR"
    case rvr1960 = "RVR1960"
    case schlachter = "SCHLACHTER"
    case synodal = "SYNODAL"
    case vietnamese = "VIETNAMESE"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .kjv: return "King James Version"
        case .asv: return "American Standard Version"
        case .bbe: return "Bible in Basic English"
        case .cuv: return "Chinese Union Version"
        case .finnish: return "Finnish Bible"
        case .french: return "French Bible"
        case .greek: return "Greek New Testament"
        case .korean: return "Korean Bible"
        case .niv: return "New International Version"
        case .paa: return "Pazgupta Bible"
        case .romanian: return "Romanian Bible"
        case .rvr: return "Reina Valera Revisada"
        case .rvr1960: return "Reina Valera 1960"
        case .schlachter: return "Schlachter Bible (German)"
        case .synodal: return "Synodal Bible (Russian)"
        case .vietnamese: return "Vietnamese Bible"
        }
    }

    var requiresApiKey: Bool {
        false // All from Supabase, no keys needed!
    }

    var apiProvider: String {
        "supabase" // Everything comes from Supabase
    }
}
