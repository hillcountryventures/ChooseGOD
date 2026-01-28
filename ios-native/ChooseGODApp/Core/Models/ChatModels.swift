import Foundation

// MARK: - Chat Mode

enum ChatMode: String, Codable, CaseIterable {
    case auto
    case devotional
    case prayer
    case journal
    case lectio
    case examen
    case memory
    case confession
    case gratitude
    case celebration
    
    var displayName: String {
        switch self {
        case .auto: return "Auto"
        case .devotional: return "Devotional"
        case .prayer: return "Prayer"
        case .journal: return "Journal"
        case .lectio: return "Lectio Divina"
        case .examen: return "Examen"
        case .memory: return "Memory"
        case .confession: return "Confession"
        case .gratitude: return "Gratitude"
        case .celebration: return "Celebration"
        }
    }
    
    var icon: String {
        switch self {
        case .auto: return "sparkles"
        case .devotional: return "book.closed"
        case .prayer: return "hands.sparkles"
        case .journal: return "pencil.and.scribble"
        case .lectio: return "text.book.closed"
        case .examen: return "eye"
        case .memory: return "brain.head.profile"
        case .confession: return "heart.circle"
        case .gratitude: return "sun.max"
        case .celebration: return "party.popper"
        }
    }
}

// MARK: - Chat Message

struct ChatMessage: Identifiable, Codable {
    let id: String
    let role: MessageRole
    let content: String
    let timestamp: Date
    var sources: [VerseSource]?
    var mode: ChatMode?
    var toolsUsed: [String]?
    var celebration: CelebrationData?
    var suggestedActions: [SuggestedAction]?
    
    enum MessageRole: String, Codable {
        case user
        case assistant
        case system
    }
    
    init(
        id: String = UUID().uuidString,
        role: MessageRole,
        content: String,
        timestamp: Date = Date(),
        sources: [VerseSource]? = nil,
        mode: ChatMode? = nil,
        toolsUsed: [String]? = nil,
        celebration: CelebrationData? = nil,
        suggestedActions: [SuggestedAction]? = nil
    ) {
        self.id = id
        self.role = role
        self.content = content
        self.timestamp = timestamp
        self.sources = sources
        self.mode = mode
        self.toolsUsed = toolsUsed
        self.celebration = celebration
        self.suggestedActions = suggestedActions
    }
}

// MARK: - Verse Source

struct VerseSource: Codable, Identifiable, Equatable, Hashable {
    var id: String { "\(book)-\(chapter)-\(verse)" }
    let book: String
    let chapter: Int
    let verse: Int
    let text: String?
    let translation: String?
    
    var reference: String {
        "\(book) \(chapter):\(verse)"
    }
}

// MARK: - Celebration Data

struct CelebrationData: Codable {
    let type: CelebrationType
    let message: String
    
    enum CelebrationType: String, Codable {
        case answeredPrayer = "answered_prayer"
        case memoryMilestone = "memory_milestone"
        case growthInsight = "growth_insight"
        case obedienceCompleted = "obedience_completed"
    }
}

// MARK: - Suggested Action

struct SuggestedAction: Codable, Identifiable {
    var id: String { label }
    let label: String
    let prompt: String
    let icon: String?
}

// MARK: - Chat Context

enum ChatScreenType: String, Codable {
    case home, bible, devotional, journey, settings, other
}

struct ChatBibleContext {
    let book: String
    let chapter: Int
    let selectedVerse: SelectedVerse?
    
    struct SelectedVerse {
        let verse: Int
        let text: String
        let translation: String
    }
    
    var reference: String {
        if let v = selectedVerse {
            return "\(book) \(chapter):\(v.verse)"
        }
        return "\(book) \(chapter)"
    }
}

struct ChatDevotionalContext {
    let seriesId: String
    let seriesTitle: String
    let dayNumber: Int
    let scriptureRef: String?
}

struct ChatContext {
    var screenType: ChatScreenType = .other
    var bibleContext: ChatBibleContext?
    var devotionalContext: ChatDevotionalContext?
    var pendingMessage: String?
}

// MARK: - Companion API Types

struct CompanionRequest: Encodable {
    let userId: String
    let message: String
    let conversationHistory: [[String: String]]
    let contextMode: String
    let verseContext: VerseContextPayload?
    
    struct VerseContextPayload: Encodable {
        let book: String
        let chapter: Int
        let verse: Int?
        let text: String?
    }
}

struct CompanionResponse: Decodable {
    let response: String
    let sources: [VerseSource]?
    let toolsUsed: [String]?
    let celebration: CelebrationData?
    let suggestedActions: [SuggestedAction]?
    let savedData: SavedData?
    
    struct SavedData: Decodable {
        let journalId: String?
        let prayerId: String?
        let momentId: String?
    }
}
