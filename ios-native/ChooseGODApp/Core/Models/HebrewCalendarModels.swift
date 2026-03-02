import Foundation

// MARK: - Hebrew Calendar Models (Hebcal)

/// Hebrew date information
struct HebrewDate: Codable, Hashable {
    let gregorianDate: Date
    let hebrewDateString: String // e.g., "18 Tevet 5784"
    let hebrewYear: Int
    let hebrewMonth: Int
    let hebrewDay: Int

    enum CodingKeys: String, CodingKey {
        case gregorianDate, hebrewDateString, hebrewYear, hebrewMonth, hebrewDay
    }
}

/// Torah portion (Parasha) information
struct TorahPortion: Codable, Hashable {
    let id: String // e.g., "parashat-bereishit"
    let name: String // English name: "Parashat Bereishit"
    let hebrewName: String // Hebrew name: "פרשת בראשית"
    let date: Date
    let aliyot: [String] // breakdown of the 7 readings: ["Genesis 1:1-1:5", ...]

    enum CodingKeys: String, CodingKey {
        case id, name, hebrewName, date, aliyot
    }
}

/// Hebrew holiday or observance
struct HebrewHoliday: Codable, Hashable {
    let id: String // e.g., "rosh-hashanah"
    let title: String // English: "Rosh Hashanah"
    let hebrewTitle: String // Hebrew: "ראש השנה"
    let date: Date
    let category: String // "holiday", "observance", "fast", etc.

    enum CodingKeys: String, CodingKey {
        case id, title, hebrewTitle, date, category
    }
}

// MARK: - Hebcal API Response

struct HebcalResponse: Codable {
    let date: String // ISO date
    let hebrew: String // Hebrew date string
    let events: [HebcalEvent]
}

struct HebcalEvent: Codable {
    let date: String // YYYY-MM-DD
    let title: String
    let desc: String? // description
    let hebrew: String?
    let category: String? // "parsha", "holiday", "observance"
}
