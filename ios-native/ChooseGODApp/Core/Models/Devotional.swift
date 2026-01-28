import Foundation
import SwiftUI

// MARK: - Difficulty Level

enum DifficultyLevel: String, Codable, CaseIterable {
    case beginner
    case intermediate
    case advanced
    
    var displayName: String {
        rawValue.capitalized
    }
}

// MARK: - Scripture Reference

struct ScriptureRef: Codable, Equatable {
    let book: String
    let chapter: Int
    let verseStart: Int
    var verseEnd: Int?
    
    var reference: String {
        if let end = verseEnd, end != verseStart {
            return "\(book) \(chapter):\(verseStart)-\(end)"
        }
        return "\(book) \(chapter):\(verseStart)"
    }
    
    enum CodingKeys: String, CodingKey {
        case book
        case chapter
        case verseStart = "verse_start"
        case verseEnd = "verse_end"
    }
}

// MARK: - Devotional Series

struct DevotionalSeries: Identifiable, Codable {
    let id: String
    let slug: String
    let title: String
    let description: String
    var coverImageUrl: String?
    let totalDays: Int
    let topics: [String]
    let isSeasonal: Bool
    var seasonStartMonth: Int?
    var seasonStartDay: Int?
    let difficultyLevel: DifficultyLevel
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case slug
        case title
        case description
        case coverImageUrl = "cover_image_url"
        case totalDays = "total_days"
        case topics
        case isSeasonal = "is_seasonal"
        case seasonStartMonth = "season_start_month"
        case seasonStartDay = "season_start_day"
        case difficultyLevel = "difficulty_level"
        case createdAt = "created_at"
    }
    
    var gradient: LinearGradient {
        let colors = SERIES_GRADIENTS[slug] ?? (Color(hex: "6366F1"), Color(hex: "4F46E5"))
        return LinearGradient(colors: [colors.0, colors.1], startPoint: .topLeading, endPoint: .bottomTrailing)
    }
    
    static var preview: DevotionalSeries {
        DevotionalSeries(
            id: "series-1",
            slug: "overcoming-anxiety",
            title: "Overcoming Anxiety",
            description: "A 7-day journey to finding peace in God's promises",
            coverImageUrl: nil,
            totalDays: 7,
            topics: ["peace", "anxiety", "trust"],
            isSeasonal: false,
            seasonStartMonth: nil,
            seasonStartDay: nil,
            difficultyLevel: .beginner,
            createdAt: Date()
        )
    }
}

// MARK: - Devotional Day

struct DevotionalDay: Identifiable, Codable {
    let id: String
    let seriesId: String
    let dayNumber: Int
    let title: String
    let scriptureRefs: [ScriptureRef]
    let contentPrompt: String
    let reflectionQuestions: [String]
    var prayerFocus: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case seriesId = "series_id"
        case dayNumber = "day_number"
        case title
        case scriptureRefs = "scripture_refs"
        case contentPrompt = "content_prompt"
        case reflectionQuestions = "reflection_questions"
        case prayerFocus = "prayer_focus"
        case createdAt = "created_at"
    }
    
    static var preview: DevotionalDay {
        DevotionalDay(
            id: "day-1",
            seriesId: "series-1",
            dayNumber: 1,
            title: "Casting Your Cares",
            scriptureRefs: [ScriptureRef(book: "1 Peter", chapter: 5, verseStart: 7, verseEnd: nil)],
            contentPrompt: "Today we explore what it means to truly cast our anxieties on God.",
            reflectionQuestions: ["What worries are you holding onto today?", "How can you practice releasing control to God?"],
            prayerFocus: "Lord, help me to release my worries to You.",
            createdAt: Date()
        )
    }
}

// MARK: - User Series Enrollment

struct UserSeriesEnrollment: Identifiable, Codable {
    let id: String
    let userId: String
    let seriesId: String
    var series: DevotionalSeries?
    let enrolledAt: Date
    var currentDay: Int
    var completedDays: [Int]
    var isActive: Bool
    var isPrimary: Bool
    let lastActivityAt: Date
    let reminderTime: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case seriesId = "series_id"
        case series
        case enrolledAt = "enrolled_at"
        case currentDay = "current_day"
        case completedDays = "completed_days"
        case isActive = "is_active"
        case isPrimary = "is_primary"
        case lastActivityAt = "last_activity_at"
        case reminderTime = "reminder_time"
        case createdAt = "created_at"
    }
    
    var progressPercentage: Double {
        guard let series = series, series.totalDays > 0 else { return 0 }
        return Double(completedDays.count) / Double(series.totalDays)
    }
}

// MARK: - Series Gradients

let SERIES_GRADIENTS: [String: (Color, Color)] = [
    "overcoming-anxiety": (Color(hex: "6366F1"), Color(hex: "4F46E5")),
    "strengthening-marriage": (Color(hex: "EC4899"), Color(hex: "DB2777")),
    "biblical-parenting": (Color(hex: "F59E0B"), Color(hex: "D97706")),
    "trusting-god-finances": (Color(hex: "10B981"), Color(hex: "059669")),
    "dealing-grief": (Color(hex: "8B5CF6"), Color(hex: "7C3AED")),
    "cultivating-gratitude": (Color(hex: "F59E0B"), Color(hex: "FBBF24")),
    "deepening-prayer": (Color(hex: "3B82F6"), Color(hex: "2563EB")),
    "knowing-gods-character": (Color(hex: "6366F1"), Color(hex: "8B5CF6")),
    "walking-grace-forgiveness": (Color(hex: "22C55E"), Color(hex: "16A34A")),
    "hearing-gods-voice": (Color(hex: "06B6D4"), Color(hex: "0891B2")),
    "advent": (Color(hex: "DC2626"), Color(hex: "B91C1C")),
    "lent": (Color(hex: "7C3AED"), Color(hex: "6D28D9")),
]

func getSeriesGradient(_ slug: String) -> LinearGradient {
    let colors = SERIES_GRADIENTS[slug] ?? (Color(hex: "6366F1"), Color(hex: "4F46E5"))
    return LinearGradient(colors: [colors.0, colors.1], startPoint: .topLeading, endPoint: .bottomTrailing)
}
