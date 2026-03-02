import Foundation
import os

// MARK: - Protocol

protocol OpenLibraryServiceProtocol {
    func searchBooks(query: String, limit: Int) async -> [OpenLibraryBook]?
    func getRecommendedBibleCommentaries() async -> [OpenLibraryBook]?
    func getRecommendedTheologyBooks() async -> [OpenLibraryBook]?
}

// MARK: - Implementation

final class OpenLibraryService: OpenLibraryServiceProtocol {
    static let shared = OpenLibraryService()

    private let logger = Logger(subsystem: "com.choosegod.openlibrary", category: "service")
    private let baseURL = "https://openlibrary.org/search.json"

    private let cache = NSCache<NSString, CachedOpenLibraryBooks>()

    private init() {}

    // MARK: - Public API

    func searchBooks(query: String, limit: Int = 10) async -> [OpenLibraryBook]? {
        let cacheKey = "books_\(query)_\(limit)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.books
        }

        guard let books = await fetchBooks(query: query, limit: limit) else {
            return nil
        }

        let cached = CachedOpenLibraryBooks(books: books)
        cache.setObject(cached, forKey: cacheKey, cost: books.count)

        return books.isEmpty ? nil : books
    }

    func getRecommendedBibleCommentaries() async -> [OpenLibraryBook]? {
        let queries = [
            "Bible commentary",
            "biblical studies",
            "scripture interpretation"
        ]

        var allBooks: [OpenLibraryBook] = []
        for query in queries {
            if let books = await searchBooks(query: query, limit: 5) {
                allBooks.append(contentsOf: books)
            }
            if allBooks.count >= 15 {
                break
            }
        }

        return allBooks.isEmpty ? nil : Array(allBooks.prefix(15))
    }

    func getRecommendedTheologyBooks() async -> [OpenLibraryBook]? {
        let queries = [
            "Christian theology",
            "doctrine",
            "biblical interpretation"
        ]

        var allBooks: [OpenLibraryBook] = []
        for query in queries {
            if let books = await searchBooks(query: query, limit: 5) {
                allBooks.append(contentsOf: books)
            }
            if allBooks.count >= 15 {
                break
            }
        }

        return allBooks.isEmpty ? nil : Array(allBooks.prefix(15))
    }

    // MARK: - Private Helpers

    private func fetchBooks(query: String, limit: Int) async -> [OpenLibraryBook]? {
        let urlString = "\(baseURL)?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&limit=\(limit)&fields=key,title,author_name,first_publish_year,isbn,cover_i,first_sentence"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Open Library search URL")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                logger.debug("Open Library search returned \(httpResponse.statusCode)")
            }

            let decoder = JSONDecoder()
            let result = try decoder.decode(OpenLibraryResponse.self, from: data)

            return result.docs
        } catch {
            logger.error("Failed to search Open Library: \(error)")
            return nil
        }
    }
}

// MARK: - Cache Wrapper

private class CachedOpenLibraryBooks {
    let books: [OpenLibraryBook]
    let cachedAt: Date

    init(books: [OpenLibraryBook]) {
        self.books = books
        self.cachedAt = Date()
    }
}
