import Foundation
import os

// MARK: - Protocol

protocol CrossrefMetadataServiceProtocol {
    func searchScholarlyWorks(query: String, limit: Int) async -> [ScholarlyWork]?
    func getBiblicalScholarship() async -> [ScholarlyWork]?
}

// MARK: - Implementation

final class CrossrefMetadataService: CrossrefMetadataServiceProtocol {
    static let shared = CrossrefMetadataService()

    private let logger = Logger(subsystem: "com.choosegod.crossref", category: "service")
    private let baseURL = "https://api.crossref.org/works"

    private let cache = NSCache<NSString, CachedScholarlyWorks>()

    private init() {}

    // MARK: - Public API

    func searchScholarlyWorks(query: String, limit: Int = 10) async -> [ScholarlyWork]? {
        let cacheKey = "works_\(query)_\(limit)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.works
        }

        guard let works = await fetchWorks(query: query, limit: limit) else {
            return nil
        }

        let cached = CachedScholarlyWorks(works: works)
        cache.setObject(cached, forKey: cacheKey, cost: works.count)

        return works.isEmpty ? nil : works
    }

    func getBiblicalScholarship() async -> [ScholarlyWork]? {
        let queries = [
            "biblical exegesis",
            "biblical scholarship",
            "New Testament studies",
            "Old Testament interpretation"
        ]

        var allWorks: [ScholarlyWork] = []

        for query in queries {
            if let works = await searchScholarlyWorks(query: query, limit: 5) {
                allWorks.append(contentsOf: works)
            }
            if allWorks.count >= 20 {
                break
            }
        }

        return allWorks.isEmpty ? nil : Array(allWorks.prefix(20))
    }

    // MARK: - Private Helpers

    private func fetchWorks(query: String, limit: Int) async -> [ScholarlyWork]? {
        let urlString = "\(baseURL)?query=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&rows=\(limit)&filter=type:journal-article&sort=relevance"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Crossref search URL")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                logger.debug("Crossref search returned \(httpResponse.statusCode)")
            }

            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let result = try decoder.decode(CrossrefResponse.self, from: data)

            return result.message.items
        } catch {
            logger.error("Failed to search Crossref: \(error)")
            return nil
        }
    }
}

// MARK: - Cache Wrapper

private class CachedScholarlyWorks {
    let works: [ScholarlyWork]
    let cachedAt: Date

    init(works: [ScholarlyWork]) {
        self.works = works
        self.cachedAt = Date()
    }
}
