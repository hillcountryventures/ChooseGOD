import Foundation

// MARK: - Memory Verse

struct MemoryVerse: Identifiable, Codable, Equatable {
    let id: String
    let userId: String
    let book: String
    let chapter: Int
    let verseStart: Int
    let verseEnd: Int?
    let text: String
    let translation: String
    var mnemonic: String?
    var storyVersion: String?
    var easeFactor: Double
    var intervalDays: Int
    var nextReview: Date
    var reviewCount: Int
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case book
        case chapter
        case verseStart = "verse_start"
        case verseEnd = "verse_end"
        case text
        case translation
        case mnemonic
        case storyVersion = "story_version"
        case easeFactor = "ease_factor"
        case intervalDays = "interval_days"
        case nextReview = "next_review"
        case reviewCount = "review_count"
        case createdAt = "created_at"
    }
    
    var reference: String {
        if let end = verseEnd {
            return "\(book) \(chapter):\(verseStart)-\(end)"
        }
        return "\(book) \(chapter):\(verseStart)"
    }
    
    var isDue: Bool {
        nextReview <= Date()
    }
    
    /// Generate first-letter hints: "For God so loved" → "F___ G__ s_ l____"
    var hint: String {
        let words = text.components(separatedBy: " ")
        return words.map { (word: String) -> String in
            if word.count <= 2 { return word }
            let first = word.prefix(1)
            let rest = String(repeating: "_", count: max(0, word.count - 1) as Int)
            return "\(first)\(rest)"
        }.joined(separator: " ")
    }
}

// MARK: - Review Rating

enum ReviewRating: String {
    case again, hard, good, easy
    
    /// SM-2 quality score (0-5)
    var quality: Int {
        switch self {
        case .again: return 1
        case .hard: return 3
        case .good: return 4
        case .easy: return 5
        }
    }
}

// MARK: - SM-2 Algorithm

enum SM2 {
    static let minEaseFactor: Double = 1.3
    static let defaultEaseFactor: Double = 2.5
    
    struct ReviewResult {
        let intervalDays: Int
        let easeFactor: Double
        let nextReview: Date
    }
    
    static func calculate(
        currentInterval: Int,
        currentEaseFactor: Double,
        rating: ReviewRating
    ) -> ReviewResult {
        var newInterval: Int
        var newEaseFactor = currentEaseFactor
        
        switch rating {
        case .easy:
            newInterval = Int(round(Double(currentInterval) * 2.5))
            newEaseFactor = min(currentEaseFactor + 0.15, 3.0)
        case .good:
            newInterval = Int(round(Double(currentInterval) * currentEaseFactor))
            newEaseFactor = currentEaseFactor + 0.05
        case .hard:
            newInterval = Int(round(Double(currentInterval) * 1.2))
            newEaseFactor = max(currentEaseFactor - 0.15, minEaseFactor)
        case .again:
            newInterval = 1
            newEaseFactor = max(currentEaseFactor - 0.2, minEaseFactor)
        }
        
        newInterval = max(newInterval, 1)
        
        let nextReview = Calendar.current.date(
            byAdding: .day, value: newInterval, to: Date()
        ) ?? Date()
        
        return ReviewResult(
            intervalDays: newInterval,
            easeFactor: newEaseFactor,
            nextReview: nextReview
        )
    }
}
