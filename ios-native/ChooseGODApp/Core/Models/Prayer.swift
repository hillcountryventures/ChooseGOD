import Foundation

// MARK: - Prayer Status

enum PrayerStatus: String, Codable, CaseIterable {
    case active
    case answered
    case ongoing
    
    var displayName: String {
        switch self {
        case .active: return "Active"
        case .answered: return "Answered"
        case .ongoing: return "Ongoing"
        }
    }
    
    var icon: String {
        switch self {
        case .active: return "hands.sparkles"
        case .answered: return "checkmark.circle.fill"
        case .ongoing: return "arrow.clockwise"
        }
    }
}

// MARK: - Scripture Anchor

struct ScriptureAnchor: Codable, Equatable {
    let book: String
    let chapter: Int
    let verse: Int
    let text: String
    
    var reference: String {
        "\(book) \(chapter):\(verse)"
    }
}

// MARK: - Prayer Request

struct PrayerRequest: Identifiable, Codable {
    let id: String
    let userId: String
    var circleId: String?
    let request: String
    var scriptureAnchor: ScriptureAnchor?
    var status: PrayerStatus
    var answeredAt: Date?
    var answeredReflection: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case circleId = "circle_id"
        case request
        case scriptureAnchor = "scripture_anchor"
        case status
        case answeredAt = "answered_at"
        case answeredReflection = "answered_reflection"
        case createdAt = "created_at"
    }
    
    static var preview: PrayerRequest {
        PrayerRequest(
            id: "preview-1",
            userId: "user-1",
            circleId: nil,
            request: "Lord, please guide me in my career decisions and help me to trust in Your plan.",
            scriptureAnchor: ScriptureAnchor(
                book: "Proverbs",
                chapter: 3,
                verse: 5,
                text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding."
            ),
            status: .active,
            answeredAt: nil,
            answeredReflection: nil,
            createdAt: Date()
        )
    }
}

// MARK: - Prayer Circle

struct PrayerCircle: Identifiable, Codable {
    let id: String
    let name: String
    let createdBy: String
    let inviteCode: String
    var memberCount: Int?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case createdBy = "created_by"
        case inviteCode = "invite_code"
        case memberCount = "member_count"
        case createdAt = "created_at"
    }
    
    static var preview: PrayerCircle {
        PrayerCircle(
            id: "circle-1",
            name: "Family Prayer Group",
            createdBy: "user-1",
            inviteCode: "FAMILY2024",
            memberCount: 5,
            createdAt: Date()
        )
    }
}

// MARK: - Circle Member

struct CircleMember: Codable {
    let circleId: String
    let userId: String
    var displayName: String?
    let joinedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case circleId = "circle_id"
        case userId = "user_id"
        case displayName = "display_name"
        case joinedAt = "joined_at"
    }
}
