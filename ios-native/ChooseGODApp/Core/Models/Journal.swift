import Foundation

// MARK: - Moment Type

enum MomentType: String, Codable, CaseIterable {
    case journal
    case prayer
    case devotional
    case gratitude
    case confession
    case memoryPractice = "memory_practice"
    case obedienceStep = "obedience_step"
    case lectio
    case examen
    case answeredPrayer = "answered_prayer"
}

// MARK: - Media Type

enum JournalMediaType: String, Codable {
    case photo
    case voice
    case drawing
}

// MARK: - Journal Media

struct JournalMedia: Identifiable, Codable, Equatable {
    let id: String
    let type: JournalMediaType
    let uri: String
    var duration: TimeInterval?
    var thumbnail: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, type, uri, duration, thumbnail
        case createdAt = "created_at"
    }
}

// MARK: - AI Insights

struct JournalAIInsights: Codable, Equatable {
    var summary: String?
    var suggestedVerses: [VerseSource]?
    var reflectionQuestions: [String]?
    var growthPatterns: [String]?
    var generatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case summary
        case suggestedVerses = "suggested_verses"
        case reflectionQuestions = "reflection_questions"
        case growthPatterns = "growth_patterns"
        case generatedAt = "generated_at"
    }
}

// VerseSource is defined in ChatModels.swift — shared across Journal and Chat

// MARK: - Journal Source

enum JournalSourceType: String, Codable {
    case standalone
    case verseReflection = "verse_reflection"
    case devotional
    case aiPrompt = "ai_prompt"
    case bibleReading = "bible_reading"
}

struct JournalSource: Codable, Equatable {
    let type: JournalSourceType
    var referenceId: String?
    
    enum CodingKeys: String, CodingKey {
        case type
        case referenceId = "reference_id"
    }
}

// MARK: - Spiritual Moment

struct SpiritualMoment: Identifiable, Codable, Equatable {
    let id: String
    let userId: String
    let momentType: MomentType
    var content: String
    var aiReflection: String?
    var linkedVerses: [VerseSource]
    var sentimentScore: Double?
    var themes: [String]
    let createdAt: Date
    var updatedAt: Date?
    var metadata: [String: String]?
    var media: [JournalMedia]?
    var aiInsights: JournalAIInsights?
    var status: JournalStatus?
    var source: JournalSource?
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case momentType = "moment_type"
        case content
        case aiReflection = "ai_reflection"
        case linkedVerses = "linked_verses"
        case sentimentScore = "sentiment_score"
        case themes
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case metadata, media
        case aiInsights = "ai_insights"
        case status, source
    }
    
    var wordCount: Int {
        content.split(separator: " ").count
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .short
        return formatter.string(from: createdAt)
    }
    
    var shortDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: createdAt)
    }
}

// MARK: - Journal Status

enum JournalStatus: String, Codable {
    case draft
    case published
}

// MARK: - Journal Draft

struct JournalDraft: Identifiable, Codable, Equatable {
    let id: String
    var content: String
    var linkedVerses: [VerseSource]
    var media: [JournalMedia]
    var lastSavedAt: Date
    var source: JournalSource?
    
    enum CodingKeys: String, CodingKey {
        case id, content, media, source
        case linkedVerses = "linked_verses"
        case lastSavedAt = "last_saved_at"
    }
}

// MARK: - Journal Prompt

enum JournalPromptType: String, Codable {
    case morning, evening, verseBased, themeBased, contextual
}

struct JournalPrompt: Identifiable {
    let id: String
    let type: JournalPromptType
    let text: String
    let relatedVerse: VerseSource?
    let icon: String
}

// MARK: - Filter / Search

enum JournalFilter: String, CaseIterable {
    case all = "All"
    case journal = "Journal"
    case prayer = "Prayer"
    case gratitude = "Gratitude"
    case devotional = "Devotional"
    
    var momentType: MomentType? {
        switch self {
        case .all: return nil
        case .journal: return .journal
        case .prayer: return .prayer
        case .gratitude: return .gratitude
        case .devotional: return .devotional
        }
    }
}
