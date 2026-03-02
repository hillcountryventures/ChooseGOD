import Foundation
import os

// MARK: - Protocol

protocol PoetryDBServiceProtocol {
    func getDevotionalPoem() async -> Poem?
    func getPoemsByAuthor(_ author: String) async -> [Poem]?
    func getRandomDevotionalPoem() async -> Poem?
}

// MARK: - Implementation

final class PoetryDBService: PoetryDBServiceProtocol {
    static let shared = PoetryDBService()

    private let logger = Logger(subsystem: "com.choosegod.poetrydb", category: "service")
    private let baseURL = "https://poetrydb.org"

    /// Curated list of Christian devotional poets
    private let devotionalAuthors = [
        "John Donne",
        "George Herbert",
        "Gerard Manley Hopkins",
        "Christina Rossetti",
        "William Cowper",
        "John Milton"
    ]

    private let cache = NSCache<NSString, CachedPoem>()

    private init() {}

    // MARK: - Public API

    func getDevotionalPoem() async -> Poem? {
        let author = devotionalAuthors.randomElement() ?? "George Herbert"
        return await getPoemsByAuthor(author)?.randomElement()
    }

    func getPoemsByAuthor(_ author: String) async -> [Poem]? {
        let cacheKey = "poems_\(author)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.poems
        }

        guard let poems = await fetchPoemsByAuthor(author) else {
            return nil
        }

        let cached = CachedPoem(poems: poems)
        cache.setObject(cached, forKey: cacheKey, cost: poems.count)

        return poems
    }

    func getRandomDevotionalPoem() async -> Poem? {
        let authors = devotionalAuthors.shuffled()

        for author in authors {
            if let poems = await getPoemsByAuthor(author), !poems.isEmpty {
                return poems.randomElement()
            }
        }

        return nil
    }

    // MARK: - Private Helpers

    private func fetchPoemsByAuthor(_ author: String) async -> [Poem]? {
        let urlString = "\(baseURL)/author/\(author.replacingOccurrences(of: " ", with: "_"))"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid poetry URL for author: \(author)")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode != 200 {
                    logger.debug("PoetryDB returned \(httpResponse.statusCode) for \(author)")
                    return nil
                }
            }

            let decoder = JSONDecoder()
            let poems = try decoder.decode([Poem].self, from: data)

            return poems.isEmpty ? nil : poems
        } catch {
            logger.error("Failed to fetch poems for \(author): \(error)")
            return nil
        }
    }
}

// MARK: - Cache Wrapper

private class CachedPoem {
    let poems: [Poem]
    let cachedAt: Date

    init(poems: [Poem]) {
        self.poems = poems
        self.cachedAt = Date()
    }
}
