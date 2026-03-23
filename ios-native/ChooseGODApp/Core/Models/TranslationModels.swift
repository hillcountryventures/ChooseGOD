import Foundation

// MARK: - Scripture.api.bible Models

struct ScriptureApiBibleVerse: Codable, Hashable, Identifiable {
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

struct ScriptureApiBibleChapter: Codable, Hashable {
    let id: String
    let bibleId: String
    let bookId: String
    let chapterNumber: Int
    let verses: [ScriptureApiBibleVerse]

    enum CodingKeys: String, CodingKey {
        case id, bibleId, bookId
        case chapterNumber = "number"
        case verses
    }
}

struct ScriptureApiBibleResponse: Codable {
    let data: ScriptureApiBibleChapter
}

struct ScriptureApiVersesResponse: Codable {
    let data: [ScriptureApiBibleVerse]
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

// MARK: - BibleTranslation moved to Bible.swift to avoid conflicts
