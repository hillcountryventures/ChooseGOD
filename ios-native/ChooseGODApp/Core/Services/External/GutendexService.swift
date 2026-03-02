import Foundation
import os

// MARK: - Protocol

protocol GutendexServiceProtocol {
    func searchBooks(query: String, limit: Int) async -> [GutendexBook]?
    func getClassicCommentaries() async -> [GutendexBook]?
}

// MARK: - Implementation

final class GutendexService: GutendexServiceProtocol {
    static let shared = GutendexService()

    private let logger = Logger(subsystem: "com.choosegod.gutendex", category: "service")
    private let baseURL = "https://gutendex.com/books"

    /// Classic biblical commentators and authors
    private let classicAuthors = [
        "Charles Haddon Spurgeon",
        "Matthew Henry",
        "John Wesley",
        "Adam Clarke",
        "Albert Barnes",
        "Jamieson, Robert",
        "William Barclay",
        "Matthew Arnold"
    ]

    private let cache = NSCache<NSString, CachedBooks>()

    private init() {}

    // MARK: - Public API

    func searchBooks(query: String, limit: Int = 10) async -> [GutendexBook]? {
        let cacheKey = "books_\(query)_\(limit)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.books
        }

        guard let books = await fetchBooks(query: query, limit: limit) else {
            return nil
        }

        let cached = CachedBooks(books: books)
        cache.setObject(cached, forKey: cacheKey, cost: books.count)

        return books.isEmpty ? nil : books
    }

    func getClassicCommentaries() async -> [GutendexBook]? {
        var allBooks: [GutendexBook] = []

        for author in classicAuthors {
            if let books = await searchBooks(query: author, limit: 5) {
                allBooks.append(contentsOf: books)
            }
        }

        return allBooks.isEmpty ? nil : allBooks
    }

    // MARK: - Private Helpers

    private func fetchBooks(query: String, limit: Int) async -> [GutendexBook]? {
        let urlString = "\(baseURL)?search=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&limit=\(limit)"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Gutendex search URL")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                logger.debug("Gutendex search returned \(httpResponse.statusCode)")
            }

            let decoder = JSONDecoder()
            let result = try decoder.decode(GutendexResponse.self, from: data)

            return result.results
        } catch {
            logger.error("Failed to search Gutendex: \(error)")
            return nil
        }
    }
}

// MARK: - Cache Wrapper

private class CachedBooks {
    let books: [GutendexBook]
    let cachedAt: Date

    init(books: [GutendexBook]) {
        self.books = books
        self.cachedAt = Date()
    }
}
