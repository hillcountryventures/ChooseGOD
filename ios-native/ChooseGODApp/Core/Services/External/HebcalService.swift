import Foundation
import os

// MARK: - Protocol

protocol HebcalServiceProtocol {
    func getHebrewDate(for gregorianDate: Date) async -> HebrewDate?
    func getTorahPortion(for date: Date) async -> TorahPortion?
    func getTodaysHebrewInfo() async -> (date: HebrewDate?, torah: TorahPortion?)?
}

// MARK: - Implementation

final class HebcalService: HebcalServiceProtocol {
    static let shared = HebcalService()

    private let logger = Logger(subsystem: "com.choosegod.hebcal", category: "service")
    private let baseURL = "https://www.hebcal.com/api/v1"
    private let cache = NSCache<NSString, CachedHebrewData>()

    private init() {}

    // MARK: - Public API

    func getHebrewDate(for gregorianDate: Date) async -> HebrewDate? {
        let cacheKey = cacheKey(for: gregorianDate, prefix: "hebrew_date")

        if let cached = cache.object(forKey: cacheKey as NSString) {
            return cached.hebrewDate
        }

        guard let hebrewDate = await fetchHebrewDate(for: gregorianDate) else {
            return nil
        }

        let cached = CachedHebrewData(hebrewDate: hebrewDate)
        cache.setObject(cached, forKey: cacheKey as NSString, cost: 1)

        return hebrewDate
    }

    func getTorahPortion(for date: Date) async -> TorahPortion? {
        let cacheKey = cacheKey(for: date, prefix: "torah_portion")

        if let cached = cache.object(forKey: cacheKey as NSString) {
            return cached.torahPortion
        }

        guard let torah = await fetchTorahPortion(for: date) else {
            return nil
        }

        let cached = CachedHebrewData(torahPortion: torah)
        cache.setObject(cached, forKey: cacheKey as NSString, cost: 1)

        return torah
    }

    func getTodaysHebrewInfo() async -> (date: HebrewDate?, torah: TorahPortion?)? {
        let today = Date()
        let hebrewDate = await getHebrewDate(for: today)
        let torah = await getTorahPortion(for: today)

        return (hebrewDate, torah)
    }

    // MARK: - Private Helpers

    private func fetchHebrewDate(for gregorianDate: Date) async -> HebrewDate? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: gregorianDate)

        let urlString = "\(baseURL)/hebrew?cfg=json&date=\(dateString)"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Hebrew date URL")
            return nil
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoder = JSONDecoder()

            if let response = try? decoder.decode(HebcalResponse.self, from: data) {
                let components = response.hebrew.split(separator: " ").map(String.init)
                guard components.count >= 3 else { return nil }

                let day = Int(components[0]) ?? 1
                let monthStr = components[1]
                let year = Int(components[2]) ?? 5000

                let monthMap: [String: Int] = [
                    "Tevet": 10, "Shevat": 11, "Adar": 12, "Nisan": 1,
                    "Iyar": 2, "Sivan": 3, "Tammuz": 4, "Av": 5,
                    "Elul": 6, "Tishrei": 7, "Cheshvan": 8, "Kislev": 9
                ]

                let month = monthMap[monthStr] ?? 1

                return HebrewDate(
                    gregorianDate: gregorianDate,
                    hebrewDateString: response.hebrew,
                    hebrewYear: year,
                    hebrewMonth: month,
                    hebrewDay: day
                )
            }
        } catch {
            logger.error("Failed to fetch Hebrew date: \(error)")
        }

        return nil
    }

    private func fetchTorahPortion(for date: Date) async -> TorahPortion? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: date)

        let urlString = "\(baseURL)/events?cfg=json&date=\(dateString)&i=on&sedrot=on"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Torah portion URL")
            return nil
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoder = JSONDecoder()

            if let response = try? decoder.decode(HebcalResponse.self, from: data) {
                // Find the parsha event
                if let parshEvent = response.events.first(where: { ($0.category ?? "").lowercased().contains("parsha") }) {
                    let title = parshEvent.title
                    let hebrewTitle = parshEvent.hebrew ?? title
                    let id = title.lowercased().replacingOccurrences(of: " ", with: "-")

                    return TorahPortion(
                        id: id,
                        name: title,
                        hebrewName: hebrewTitle,
                        date: date,
                        aliyot: []
                    )
                }
            }
        } catch {
            logger.error("Failed to fetch Torah portion: \(error)")
        }

        return nil
    }

    private func cacheKey(for date: Date, prefix: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return "\(prefix)_\(formatter.string(from: date))"
    }
}

// MARK: - Cache Wrapper

private class CachedHebrewData {
    let hebrewDate: HebrewDate?
    let torahPortion: TorahPortion?

    init(hebrewDate: HebrewDate? = nil, torahPortion: TorahPortion? = nil) {
        self.hebrewDate = hebrewDate
        self.torahPortion = torahPortion
    }
}
