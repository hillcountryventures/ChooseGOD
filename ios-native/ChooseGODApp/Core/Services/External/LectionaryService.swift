import Foundation
import os

// MARK: - Protocol

protocol LectionaryServiceProtocol {
    func getTodaysLectionary() async -> DailyLectionary?
    func getLectionary(for date: Date) async -> DailyLectionary?
    func getLiturgicalDay(for date: Date) async -> LiturgicalDay?
}

// MARK: - Implementation

final class LectionaryService: LectionaryServiceProtocol {
    static let shared = LectionaryService()

    private let logger = Logger(subsystem: "com.choosegod.lectionary", category: "service")
    private let liturgicalBaseURL = "https://calapi.inadiutorium.cz/api/v0/en/calendars/general-en"
    private let cache = NSCache<NSString, CachedLectionary>()

    private init() {}

    // MARK: - Public API

    func getTodaysLectionary() async -> DailyLectionary? {
        await getLectionary(for: Date())
    }

    func getLectionary(for date: Date) async -> DailyLectionary? {
        let cacheKey = cacheKey(for: date)

        // Check cache
        if let cached = cache.object(forKey: cacheKey as NSString) {
            return cached.lectionary
        }

        // Fetch from API
        guard let liturgicalDay = await getLiturgicalDay(for: date) else {
            logger.debug("Failed to fetch lectionary for \(date)")
            return nil
        }

        let lectionary = DailyLectionary(date: date, day: liturgicalDay, readings: liturgicalDay.readings)

        // Cache for 24 hours
        let cached = CachedLectionary(lectionary: lectionary)
        cache.setObject(cached, forKey: cacheKey as NSString, cost: 1)

        return lectionary
    }

    func getLiturgicalDay(for date: Date) async -> LiturgicalDay? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        let dateString = formatter.string(from: date)

        let urlString = "\(liturgicalBaseURL)/\(dateString)"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid URL: \(urlString)")
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            // Log response
            if let httpResponse = response as? HTTPURLResponse {
                logger.debug("Liturgical API response: \(httpResponse.statusCode)")
            }

            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let calendarResponse = try decoder.decode(ChurchCalendarResponse.self, from: data)

            guard let firstDay = calendarResponse.calendar.first else {
                logger.warning("No calendar data in response for \(dateString)")
                return nil
            }

            // Convert to LiturgicalDay with readings
            let day = LiturgicalDay(
                date: firstDay.date,
                name: firstDay.name,
                season: parseSeason(firstDay.season),
                color: firstDay.colour,
                readings: [] // LectServe would provide specific readings
            )

            return day
        } catch {
            logger.error("Failed to fetch liturgical day: \(error)")
            return nil
        }
    }

    // MARK: - Private Helpers

    private func cacheKey(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return "lectionary_\(formatter.string(from: date))"
    }

    private func parseSeason(_ seasonString: String?) -> LiturgicalSeason {
        guard let season = seasonString?.lowercased() else { return .ordinary }

        switch season {
        case _ where season.contains("advent"): return .advent
        case _ where season.contains("christmas"): return .christmas
        case _ where season.contains("epiphany"): return .epiphany
        case _ where season.contains("lent"): return .lent
        case _ where season.contains("easter"): return .eastertide
        case _ where season.contains("pentecost"): return .pentecost
        default: return .ordinary
        }
    }
}

// MARK: - Cache Wrapper

private class CachedLectionary {
    let lectionary: DailyLectionary
    let cachedAt: Date

    init(lectionary: DailyLectionary) {
        self.lectionary = lectionary
        self.cachedAt = Date()
    }
}
