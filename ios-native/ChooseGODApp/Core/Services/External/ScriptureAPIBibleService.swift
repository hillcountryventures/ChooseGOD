import Foundation
import os

// MARK: - Protocol

protocol ScriptureAPIBibleServiceProtocol {
    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [BibleVerse]
    func fetchVerse(book: String, chapter: Int, verse: Int, translation: BibleTranslation) async throws -> BibleVerse?
}

// MARK: - Implementation

final class ScriptureAPIBibleService: ScriptureAPIBibleServiceProtocol {
    static let shared = ScriptureAPIBibleService()

    private let logger = Logger(subsystem: "com.choosegod.scripture-api-bible", category: "service")
    private let baseURL = "https://api.scripture.api.bible/v1"
    private var apiKey: String?
    private let cache = NSCache<NSString, CachedVerses>()

    // Bible IDs for scripture.api.bible (using default IDs; these vary by API account)
    private let bibleIds: [BibleTranslation: String] = [
        .niv: "de4e12af7f28f599-02", // NIV
        .esv: "c00fb6c7da9a67f5-01", // ESV
        .nlt: "e4ed3d42515e3fe4-06" // NLT
    ]

    private init() {
        // Load API key from Info.plist
        apiKey = Bundle.main.object(forInfoDictionaryKey: "SCRIPTURE_API_BIBLE_KEY") as? String
        if apiKey?.isEmpty ?? true {
            logger.warning("Scripture API Bible key not configured")
        }
    }

    // MARK: - Public API

    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [BibleVerse] {
        guard translation.apiProvider == "scripture.api.bible" else {
            throw APIError.unsupportedTranslation
        }

        guard let apiKey = apiKey, !apiKey.isEmpty else {
            throw APIError.missingApiKey
        }

        let cacheKey = "scripture_\(book)_\(chapter)_\(translation.rawValue)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.verses
        }

        guard let bibleId = bibleIds[translation] else {
            throw APIError.unsupportedTranslation
        }

        let verses = try await fetchChapterFromAPI(bibleId: bibleId, book: book, chapter: chapter, apiKey: apiKey)

        // Cache for 5 minutes
        let cached = CachedVerses(verses: verses)
        cache.setObject(cached, forKey: cacheKey, cost: verses.count)

        return verses
    }

    func fetchVerse(book: String, chapter: Int, verse: Int, translation: BibleTranslation) async throws -> BibleVerse? {
        let verses = try await fetchChapter(book: book, chapter: chapter, translation: translation)
        return verses.first { $0.verse == verse }
    }

    // MARK: - Private Helpers

    private func fetchChapterFromAPI(bibleId: String, book: String, chapter: Int, apiKey: String) async throws -> [BibleVerse] {
        // Convert book name to book ID (example: "Genesis" -> "GEN")
        let bookId = bookNameToId(book)
        guard !bookId.isEmpty else {
            throw APIError.invalidBook
        }

        let urlString = "\(baseURL)/bibles/\(bibleId)/chapters/\(bookId)\(chapter)?content-type=text&include-verse-numbers=true&api-key=\(apiKey)"

        guard let url = URL(string: urlString) else {
            logger.error("Invalid Scripture API Bible URL")
            throw APIError.invalidUrl
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                switch httpResponse.statusCode {
                case 200:
                    break
                case 401, 403:
                    throw APIError.invalidApiKey
                case 404:
                    throw APIError.notFound
                default:
                    logger.error("Scripture API returned \(httpResponse.statusCode)")
                    throw APIError.serverError
                }
            }

            let decoder = JSONDecoder()
            let result = try decoder.decode(ScriptureApiBibleResponse.self, from: data)

            return result.data.verses
        } catch {
            logger.error("Failed to fetch chapter from Scripture API: \(error)")
            throw APIError.networkError
        }
    }

    private func bookNameToId(_ name: String) -> String {
        let bookMap: [String: String] = [
            "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
            "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
            "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
            "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
            "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
            "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
            "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
            "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
            "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP",
            "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
            "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
            "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
            "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
            "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI", "2 Timothy": "2TI",
            "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB", "James": "JAS",
            "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
            "3 John": "3JN", "Jude": "JUD", "Revelation": "REV"
        ]

        return bookMap[name] ?? ""
    }
}

// MARK: - Errors

enum APIError: LocalizedError {
    case missingApiKey
    case invalidApiKey
    case invalidBook
    case invalidUrl
    case notFound
    case serverError
    case networkError
    case unsupportedTranslation

    var errorDescription: String? {
        switch self {
        case .missingApiKey:
            return "API key not configured"
        case .invalidApiKey:
            return "Invalid API key"
        case .invalidBook:
            return "Book not found"
        case .invalidUrl:
            return "Invalid URL"
        case .notFound:
            return "Chapter not found"
        case .serverError:
            return "Server error"
        case .networkError:
            return "Network error"
        case .unsupportedTranslation:
            return "Translation not supported by this service"
        }
    }
}

// MARK: - Cache Wrapper

private class CachedVerses {
    let verses: [BibleVerse]
    let cachedAt: Date

    init(verses: [BibleVerse]) {
        self.verses = verses
        self.cachedAt = Date()
    }
}
