import Foundation

// MARK: - Scripture.api.bible Models

struct BibleVerse: Codable, Hashable, Identifiable {
    let id: String
    let orgId: String
    let bookId: String
    let bookName: String
    let chapter: Int
    let verse: Int
    let text: String
    let verseText: String?

    enum CodingKeys: String, CodingKey {
        case id, orgId, bookId, bookName, chapter, verse, text
        case verseText = "verseText"
    }

    var reference: String {
        "\(bookName) \(chapter):\(verse)"
    }
}

struct BibleChapter: Codable, Hashable {
    let id: String
    let bibleId: String
    let bookId: String
    let chapterNumber: Int
    let verses: [BibleVerse]

    enum CodingKeys: String, CodingKey {
        case id, bibleId, bookId
        case chapterNumber = "number"
        case verses
    }
}

struct ScriptureApiBibleResponse: Codable {
    let data: BibleChapter
}

struct ScriptureApiVersesResponse: Codable {
    let data: [BibleVerse]
}

// MARK: - A Bíblia Digital Models

struct AbibliaVerse: Codable, Hashable, Identifiable {
    let id: String
    let book: String
    let chapter: Int
    let number: Int
    let text: String
    let version: String

    enum CodingKeys: String, CodingKey {
        case book, chapter, number, text, version
        case id = "id"
    }

    var verseId: String {
        "\(book) \(chapter):\(number)"
    }
}

struct AbibliaChapter: Codable, Hashable {
    let book: String
    let chapter: Int
    let verses: [AbibliaVerse]
    let version: String
}

struct AbibliaResponse: Codable {
    let book: String
    let chapter: Int
    let verses: [AbibliaVerse]
    let version: String
}

// MARK: - Translation Enum

enum BibleTranslation: String, Codable, CaseIterable, Hashable {
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
