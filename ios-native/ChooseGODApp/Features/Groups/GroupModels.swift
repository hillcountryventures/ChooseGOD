import Foundation

// MARK: - Group Role

enum GroupRole: String, Codable, CaseIterable {
    case member
    case leader
    case pastor
    
    var displayName: String {
        rawValue.capitalized
    }
    
    var icon: String {
        switch self {
        case .member: return "person"
        case .leader: return "star"
        case .pastor: return "building.columns"
        }
    }
}

// MARK: - Bible Study Group

struct BibleStudyGroup: Identifiable, Codable {
    let id: String
    let name: String
    var description: String?
    var churchAffiliation: String?
    var churchLogoUrl: String?
    let createdBy: String
    let inviteCode: String
    var memberCount: Int?
    var activeReadingPlanId: String?
    var activeSermonPlanId: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case churchAffiliation = "church_affiliation"
        case churchLogoUrl = "church_logo_url"
        case createdBy = "created_by"
        case inviteCode = "invite_code"
        case memberCount = "member_count"
        case activeReadingPlanId = "active_reading_plan_id"
        case activeSermonPlanId = "active_sermon_plan_id"
        case createdAt = "created_at"
    }
    
    static var preview: BibleStudyGroup {
        BibleStudyGroup(
            id: "group-1",
            name: "Faith Community Group",
            description: "Weekly Bible study for our small group",
            churchAffiliation: "Grace Church",
            churchLogoUrl: nil,
            createdBy: "user-1",
            inviteCode: "FCG24A",
            memberCount: 8,
            activeReadingPlanId: nil,
            activeSermonPlanId: nil,
            createdAt: Date()
        )
    }
}

// MARK: - Group Member

struct GroupMember: Identifiable, Codable {
    let id: String
    let groupId: String
    let userId: String
    var displayName: String?
    var avatarUrl: String?
    var role: GroupRole
    var isPastor: Bool
    let joinedAt: Date
    var lastActiveAt: Date?
    var readingProgress: Double?
    
    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case userId = "user_id"
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
        case role
        case isPastor = "is_pastor"
        case joinedAt = "joined_at"
        case lastActiveAt = "last_active_at"
        case readingProgress = "reading_progress"
    }
    
    static var preview: GroupMember {
        GroupMember(
            id: "member-1",
            groupId: "group-1",
            userId: "user-1",
            displayName: "Bobby Hansen",
            avatarUrl: nil,
            role: .member,
            isPastor: false,
            joinedAt: Date(),
            lastActiveAt: Date(),
            readingProgress: 0.65
        )
    }
}

// MARK: - Group Discussion

struct GroupDiscussion: Identifiable, Codable {
    let id: String
    let groupId: String
    let userId: String
    var displayName: String?
    let message: String
    var passageReference: String?
    var parentId: String?
    var replyCount: Int?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case userId = "user_id"
        case displayName = "display_name"
        case message
        case passageReference = "passage_reference"
        case parentId = "parent_id"
        case replyCount = "reply_count"
        case createdAt = "created_at"
    }
    
    static var preview: GroupDiscussion {
        GroupDiscussion(
            id: "disc-1",
            groupId: "group-1",
            userId: "user-1",
            displayName: "Bobby",
            message: "This passage really spoke to me about trusting God's timing.",
            passageReference: "Proverbs 3:5-6",
            parentId: nil,
            replyCount: 3,
            createdAt: Date()
        )
    }
}

// MARK: - Group Reading Plan

struct GroupReadingPlan: Identifiable, Codable {
    let id: String
    let groupId: String
    let seriesId: String?
    let title: String
    var description: String?
    let startDate: Date
    var endDate: Date?
    var dailyPassages: [String]
    let assignedBy: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case seriesId = "series_id"
        case title, description
        case startDate = "start_date"
        case endDate = "end_date"
        case dailyPassages = "daily_passages"
        case assignedBy = "assigned_by"
        case createdAt = "created_at"
    }
    
    static var preview: GroupReadingPlan {
        GroupReadingPlan(
            id: "plan-1",
            groupId: "group-1",
            seriesId: nil,
            title: "Romans Deep Dive",
            description: "8-week study through Romans",
            startDate: Date(),
            endDate: Calendar.current.date(byAdding: .weekOfYear, value: 8, to: Date()),
            dailyPassages: ["Romans 1:1-17", "Romans 1:18-32", "Romans 2:1-16"],
            assignedBy: "user-1",
            createdAt: Date()
        )
    }
}

// MARK: - Group Prayer Request

struct GroupPrayerRequest: Identifiable, Codable {
    let id: String
    let groupId: String
    let userId: String
    var displayName: String?
    let request: String
    var status: PrayerStatus
    var prayedByCount: Int
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case userId = "user_id"
        case displayName = "display_name"
        case request, status
        case prayedByCount = "prayed_by_count"
        case createdAt = "created_at"
    }
    
    static var preview: GroupPrayerRequest {
        GroupPrayerRequest(
            id: "gpr-1",
            groupId: "group-1",
            userId: "user-1",
            displayName: "Bobby",
            request: "Please pray for my family during this transition.",
            status: .active,
            prayedByCount: 4,
            createdAt: Date()
        )
    }
}
