import Foundation
import os

// MARK: - Protocol

protocol MetMuseumServiceProtocol {
    func searchBiblicalArtwork(query: String, limit: Int) async -> [MetArtwork]?
    func getArtworkDetails(objectID: Int) async -> MetArtwork?
    func getRandomBiblicalArtwork() async -> MetArtwork?
}

// MARK: - Implementation

final class MetMuseumService: MetMuseumServiceProtocol {
    static let shared = MetMuseumService()

    private let logger = Logger(subsystem: "com.choosegod.met", category: "service")
    private let baseURL = "https://collectionapi.metmuseum.org/public/collection/v1"
    private let cache = NSCache<NSString, CachedArtwork>()

    private init() {}

    // MARK: - Public API

    func searchBiblicalArtwork(query: String, limit: Int = 10) async -> [MetArtwork]? {
        let cacheKey = "artwork_\(query)_\(limit)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.artworks
        }

        guard let objectIDs = await searchObjectIDs(query: query, limit: limit * 2) else {
            return nil
        }

        var artworks: [MetArtwork] = []
        for objectID in objectIDs.prefix(limit) {
            if let artwork = await getArtworkDetails(objectID: objectID) {
                if artwork.isPublicDomain && artwork.primaryImage != nil {
                    artworks.append(artwork)
                }
            }
            if artworks.count >= limit {
                break
            }
        }

        let cached = CachedArtwork(artworks: artworks)
        cache.setObject(cached, forKey: cacheKey, cost: artworks.count)

        return artworks.isEmpty ? nil : artworks
    }

    func getArtworkDetails(objectID: Int) async -> MetArtwork? {
        let cacheKey = "artwork_detail_\(objectID)" as NSString

        if let cached = cache.object(forKey: cacheKey) {
            return cached.artworks.first
        }

        guard let artwork = await fetchArtworkDetails(objectID: objectID) else {
            return nil
        }

        let cached = CachedArtwork(artworks: [artwork])
        cache.setObject(cached, forKey: cacheKey, cost: 1)

        return artwork
    }

    func getRandomBiblicalArtwork() async -> MetArtwork? {
        let queries = ["Jesus", "Nativity", "Resurrection", "Madonna", "Saints"]
        let randomQuery = queries.randomElement() ?? "Jesus"

        return await searchBiblicalArtwork(query: randomQuery, limit: 1)?.randomElement()
    }

    // MARK: - Private Helpers

    private func searchObjectIDs(query: String, limit: Int = 20) async -> [Int]? {
        let urlString = "\(baseURL)/search?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&isPublicDomain=true&hasImages=true&limit=\(limit)"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Met search URL")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                logger.debug("Met search returned \(httpResponse.statusCode)")
            }

            let decoder = JSONDecoder()
            let searchResult = try decoder.decode(MetSearchResponse.self, from: data)

            return searchResult.objectIDs
        } catch {
            logger.error("Failed to search Met Museum: \(error)")
            return nil
        }
    }

    private func fetchArtworkDetails(objectID: Int) async -> MetArtwork? {
        let urlString = "\(baseURL)/objects/\(objectID)"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Met artwork details URL")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                logger.debug("Met artwork details returned \(httpResponse.statusCode)")
                return nil
            }

            let decoder = JSONDecoder()
            let artwork = try decoder.decode(MetArtwork.self, from: data)

            return artwork
        } catch {
            logger.error("Failed to fetch artwork details for \(objectID): \(error)")
            return nil
        }
    }
}

// MARK: - Cache Wrapper

private class CachedArtwork {
    let artworks: [MetArtwork]
    let cachedAt: Date

    init(artworks: [MetArtwork]) {
        self.artworks = artworks
        self.cachedAt = Date()
    }
}
