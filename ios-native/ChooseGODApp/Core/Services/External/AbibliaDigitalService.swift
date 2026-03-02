import Foundation
import os

// MARK: - Protocol

protocol AbibliaDigitalServiceProtocol {
    func fetchChapter(book: String, chapter: Int) async throws -> [AbibliaVerse]
    func fetchVerse(book: String, chapter: Int, verse: Int) async throws -> AbibliaVerse?
}

// MARK: - Implementation

final class AbibliaDigitalService: AbibliaDigitalServiceProtocol {
    static let shared = AbibliaDigitalService()

    private let logger = Logger(subsystem: "com.choosegod.abiblia", category: "service")
    private let baseURL = "https://www.abibliadigital.com.br/api"
    private var apiKey: String?
    private let cache = NSCache<NSString, CachedAbibliaVerses>()

    private init() {
        // Load API key from Info.plist
        apiKey = Bundle.main.object(forInfoDictionaryKey: "ABIBLIA_DIGITAL_API_KEY") as? String
        if apiKey?.isEmpty ?? true {
            logger.warning("A Bíblia Digital API key not configured")
        }
    }

    // MARK: - Public API

    func fetchChapter(book: String, chapter: Int) async throws -> [AbibliaVerse] {
        guard let apiKey = apiKey, !apiKey.isEmpty else {
            throw AbibliaError.missingApiKey
        }

        let cacheKey = "abiblia_\(book)_\(chapter)_nvi" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.verses
        }

        let verses = try await fetchChapterFromAPI(book: book, chapter: chapter, apiKey: apiKey)

        // Cache for 5 minutes
        let cached = CachedAbibliaVerses(verses: verses)
        cache.setObject(cached, forKey: cacheKey, cost: verses.count)

        return verses
    }

    func fetchVerse(book: String, chapter: Int, verse: Int) async throws -> AbibliaVerse? {
        let verses = try await fetchChapter(book: book, chapter: chapter)
        return verses.first { $0.number == verse }
    }

    // MARK: - Private Helpers

    private func fetchChapterFromAPI(book: String, chapter: Int, apiKey: String) async throws -> [AbibliaVerse] {
        let bookSlug = bookNameToSlug(book)
        guard !bookSlug.isEmpty else {
            throw AbibliaError.invalidBook
        }

        // A Bíblia Digital endpoint format: /verses/nvi/{bookSlug}/{chapter}
        let urlString = "\(baseURL)/verses/nvi/\(bookSlug)/\(chapter)"

        guard let url = URL(string: urlString) else {
            logger.error("Invalid Abiblia Digital URL")
            throw AbibliaError.invalidUrl
        }

        do {
            var request = URLRequest(url: url)
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

            let (data, response) = try await URLSession.shared.data(for: request)

            if let httpResponse = response as? HTTPURLResponse {
                switch httpResponse.statusCode {
                case 200:
                    break
                case 401, 403:
                    throw AbibliaError.invalidApiKey
                case 404:
                    throw AbibliaError.notFound
                default:
                    logger.error("Abiblia Digital returned \(httpResponse.statusCode)")
                    throw AbibliaError.serverError
                }
            }

            let decoder = JSONDecoder()
            let result = try decoder.decode(AbibliaResponse.self, from: data)

            return result.verses
        } catch {
            logger.error("Failed to fetch chapter from Abiblia Digital: \(error)")
            throw AbibliaError.networkError
        }
    }

    private func bookNameToSlug(_ name: String) -> String {
        let slugMap: [String: String] = [
            "Genesis": "genesis", "Exodus": "exodus", "Leviticus": "leviticus", "Numbers": "numbers",
            "Deuteronomy": "deuteronomy", "Joshua": "joshua", "Judges": "judges", "Ruth": "ruth",
            "1 Samuel": "1-samuel", "2 Samuel": "2-samuel", "1 Kings": "1-kings", "2 Kings": "2-kings",
            "1 Chronicles": "1-chronicles", "2 Chronicles": "2-chronicles", "Ezra": "ezra", "Nehemiah": "nehemiah",
            "Esther": "esther", "Job": "job", "Psalms": "psalms", "Proverbs": "proverbs",
            "Ecclesiastes": "ecclesiastes", "Song of Solomon": "song-of-solomon", "Isaiah": "isaiah", "Jeremiah": "jeremiah",
            "Lamentations": "lamentations", "Ezekiel": "ezekiel", "Daniel": "daniel", "Hosea": "hosea",
            "Joel": "joel", "Amos": "amos", "Obadiah": "obadiah", "Jonah": "jonah",
            "Micah": "micah", "Nahum": "nahum", "Habakkuk": "habakkuk", "Zephaniah": "zephaniah",
            "Haggai": "haggai", "Zechariah": "zechariah", "Malachi": "malachi",
            "Matthew": "matthew", "Mark": "mark", "Luke": "luke", "John": "john",
            "Acts": "acts", "Romans": "romans", "1 Corinthians": "1-corinthians", "2 Corinthians": "2-corinthians",
            "Galatians": "galatians", "Ephesians": "ephesians", "Philippians": "philippians", "Colossians": "colossians",
            "1 Thessalonians": "1-thessalonians", "2 Thessalonians": "2-thessalonians", "1 Timothy": "1-timothy", "2 Timothy": "2-timothy",
            "Titus": "titus", "Philemon": "philemon", "Hebrews": "hebrews", "James": "james",
            "1 Peter": "1-peter", "2 Peter": "2-peter", "1 John": "1-john", "2 John": "2-john",
            "3 John": "3-john", "Jude": "jude", "Revelation": "revelation"
        ]

        return slugMap[name] ?? ""
    }
}

// MARK: - Errors

enum AbibliaError: LocalizedError {
    case missingApiKey
    case invalidApiKey
    case invalidBook
    case invalidUrl
    case notFound
    case serverError
    case networkError

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
        }
    }
}

// MARK: - Cache Wrapper

private class CachedAbibliaVerses {
    let verses: [AbibliaVerse]
    let cachedAt: Date

    init(verses: [AbibliaVerse]) {
        self.verses = verses
        self.cachedAt = Date()
    }
}
