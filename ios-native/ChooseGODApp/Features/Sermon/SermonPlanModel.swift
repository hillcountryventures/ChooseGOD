import Foundation

// MARK: - Sermon Devotional Plan

struct SermonDevotionalPlan: Identifiable, Codable {
    let id: String
    let passageReference: String
    let title: String
    let createdBy: String
    let days: [SermonDevotionalDay]
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case passageReference = "passage_reference"
        case title
        case createdBy = "created_by"
        case days
        case createdAt = "created_at"
    }
    
    static var preview: SermonDevotionalPlan {
        SermonDevotionalPlan(
            id: "sermon-plan-1",
            passageReference: "John 3:16-21",
            title: "Sermon Follow-Up: John 3:16-21",
            createdBy: "user-1",
            days: SermonDevotionalDay.previewWeek,
            createdAt: Date()
        )
    }
}

// MARK: - Devotional Day

struct SermonDevotionalDay: Identifiable, Codable {
    let id: String
    let dayNumber: Int
    let title: String
    let subtitle: String
    let content: String
    let passageReference: String?
    let crossReferences: [String]?
    let questions: [String]?
    let prayerPrompt: String?
    let memoryVerse: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case dayNumber = "day_number"
        case title, subtitle, content
        case passageReference = "passage_reference"
        case crossReferences = "cross_references"
        case questions
        case prayerPrompt = "prayer_prompt"
        case memoryVerse = "memory_verse"
    }
    
    static var previewWeek: [SermonDevotionalDay] {
        [
            SermonDevotionalDay(id: "d1", dayNumber: 1, title: "The Full Passage", subtitle: "Read & Reflect", content: "Read John 3:16-21 in its entirety. Consider the context: Jesus is speaking with Nicodemus, a Pharisee who came at night…", passageReference: "John 3:16-21", crossReferences: nil, questions: nil, prayerPrompt: nil, memoryVerse: nil),
            SermonDevotionalDay(id: "d2", dayNumber: 2, title: "Key Themes", subtitle: "Cross-References", content: "The central themes are God's love, belief, and eternal life…", passageReference: nil, crossReferences: ["Romans 5:8", "1 John 4:9", "Ephesians 2:8-9"], questions: nil, prayerPrompt: nil, memoryVerse: nil),
            SermonDevotionalDay(id: "d3", dayNumber: 3, title: "Personal Application", subtitle: "Questions for Reflection", content: "Take time to reflect on how this passage applies to your life…", passageReference: nil, crossReferences: nil, questions: ["How does God's love change the way you see yourself?", "What does it mean to 'believe' in your daily walk?", "Where do you see light vs darkness in your choices?"], prayerPrompt: nil, memoryVerse: nil),
            SermonDevotionalDay(id: "d4", dayNumber: 4, title: "Prayer Focus", subtitle: "Draw Near to God", content: "Use today to focus your prayers around the themes of this passage…", passageReference: nil, crossReferences: nil, questions: nil, prayerPrompt: "Lord, thank You for loving the world so much that You gave Your only Son. Help me to walk in the light and live out the belief that You have placed in my heart…", memoryVerse: nil),
            SermonDevotionalDay(id: "d5", dayNumber: 5, title: "Memory & Discussion", subtitle: "Carry It Forward", content: "Commit this verse to memory and discuss with your group…", passageReference: nil, crossReferences: nil, questions: ["What is one truth from this passage you want to carry into next week?", "How can your group support each other in living this out?"], prayerPrompt: nil, memoryVerse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. — John 3:16"),
        ]
    }
}

// MARK: - Day Type

enum SermonDayType: Int, CaseIterable {
    case fullPassage = 1
    case keyThemes = 2
    case application = 3
    case prayer = 4
    case memoryVerse = 5
    
    var title: String {
        switch self {
        case .fullPassage: return "Full Passage & Context"
        case .keyThemes: return "Key Themes & Cross-References"
        case .application: return "Personal Application"
        case .prayer: return "Prayer Focus"
        case .memoryVerse: return "Memory Verse & Discussion"
        }
    }
    
    var icon: String {
        switch self {
        case .fullPassage: return "book.fill"
        case .keyThemes: return "link"
        case .application: return "person.fill.questionmark"
        case .prayer: return "hands.sparkles.fill"
        case .memoryVerse: return "brain.head.profile"
        }
    }
}
