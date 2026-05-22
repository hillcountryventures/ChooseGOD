import Foundation

// MARK: - Chat Intent (user-facing per Decision #6)

/// Strategy Decision #6 — what the user picks. The full set of `ChatMode`
/// values still exists internally for prompt routing, but the UI surfaces
/// just three intents.
enum ChatIntent: String, CaseIterable, Identifiable {
    case ask
    case pray
    case reflect

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .ask:     return "Ask"
        case .pray:    return "Pray"
        case .reflect: return "Reflect"
        }
    }

    var subtitle: String {
        switch self {
        case .ask:     return "What does Scripture say about…"
        case .pray:    return "Help me pray about…"
        case .reflect: return "Sit with what's on my heart"
        }
    }

    var icon: String {
        switch self {
        case .ask:     return "questionmark.circle"
        case .pray:    return "hands.sparkles"
        case .reflect: return "leaf"
        }
    }

    /// Maps an intent + the user's typed message into the legacy ChatMode
    /// the companion edge function expects. `reflect` auto-adapts to the
    /// finer-grained mode based on simple text signals so the AI can switch
    /// tone without making the user pick.
    func resolveMode(forInput input: String = "") -> ChatMode {
        switch self {
        case .ask:
            return .auto
        case .pray:
            return .prayer
        case .reflect:
            let lowered = input.lowercased()
            if lowered.contains("thank") || lowered.contains("grateful") || lowered.contains("blessed") {
                return .gratitude
            }
            if lowered.contains("sorry") || lowered.contains("forgive") || lowered.contains("confess") {
                return .confession
            }
            if lowered.contains("celebrate") || lowered.contains("answered") || lowered.contains("praise") {
                return .celebration
            }
            return .journal
        }
    }
}

// MARK: - Chat Mode (legacy / internal prompt routing)

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
    /// Strategy Decision #14 — set by the companion edge function via
    /// `_shared/crisis-detection.ts`. 1 = life safety, 2 = serious pattern,
    /// 3 = faith crisis, 4 = grief. Drives inline resource-card rendering.
    var crisisTier: Int?

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
        suggestedActions: [SuggestedAction]? = nil,
        crisisTier: Int? = nil
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
        self.crisisTier = crisisTier
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
    /// Strategy Decision #13 — sent on every chat so the companion edge
    /// function can route to tradition-aware system prompts.
    let tradition: String?
    /// Decision G1 — the personalization moat. Bundle of journal summaries,
    /// recent prayers, current intention, Days With God, etc., injected into
    /// the system prompt so the AI grounds replies in the user's actual walk.
    let userContext: UserContextService.Bundle?

    enum CodingKeys: String, CodingKey {
        case userId, message, conversationHistory, contextMode, verseContext, tradition
        case userContext = "user_context"
    }

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
    /// Strategy Decision #14 — populated by `_shared/crisis-detection.ts`
    /// when a crisis signal is detected. 1 = life safety, 2 = serious pattern,
    /// 3 = faith crisis, 4 = grief. Nil for normal exchanges.
    let crisisTier: Int?

    struct SavedData: Decodable {
        let journalId: String?
        let prayerId: String?
        let momentId: String?
    }
}
