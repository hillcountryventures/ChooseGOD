import Foundation

// MARK: - Lectionary Models (LectServe + Church Calendar)

/// A single biblical reading within a day's lectionary
struct LectionaryReading: Codable, Hashable {
    let book: String
    let chapter: Int
    let verseStart: Int
    let verseEnd: Int
    let label: String // e.g., "First Reading", "Psalm", "Gospel"

    enum CodingKeys: String, CodingKey {
        case book, chapter, label
        case verseStart = "verse_start"
        case verseEnd = "verse_end"
    }
}

/// A day's liturgical context from Church Calendar API
struct LiturgicalDay: Codable, Hashable {
    let date: String // ISO date: YYYY-MM-DD
    let name: String // e.g., "First Sunday of Advent"
    let season: LiturgicalSeason
    let color: String // liturgical color: white, red, green, purple, etc.
    let readings: [LectionaryReading]

    enum CodingKeys: String, CodingKey {
        case date, name, season, color, readings
    }
}

/// Liturgical season of the church year
enum LiturgicalSeason: String, Codable, Hashable {
    case advent = "Advent"
    case christmas = "Christmas"
    case epiphany = "Epiphany"
    case lent = "Lent"
    case eastertide = "Eastertide"
    case pentecost = "Pentecost"
    case ordinary = "Ordinary Time"
    case unknown = "Unknown"
}

/// Complete daily lectionary reading set
struct DailyLectionary: Hashable {
    let date: Date
    let day: LiturgicalDay
    let readings: [LectionaryReading] // Old Testament, Psalm, Epistle, Gospel
}

// MARK: - Church Calendar API Response

struct ChurchCalendarResponse: Codable {
    let calendar: [CalendarDay]
}

struct CalendarDay: Codable {
    let date: String // YYYY-MM-DD
    let name: String
    let colour: String
    let week: String?
    let season: String?
}
