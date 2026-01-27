import Foundation

/// User model representing an authenticated user
struct User: Identifiable, Codable, Equatable {
    let id: String
    let email: String
    let displayName: String
    var avatarUrl: String?
    var isPremium: Bool
    let createdAt: Date
    
    // MARK: - Computed Properties
    
    var initials: String {
        let components = displayName.split(separator: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))".uppercased()
        }
        return String(displayName.prefix(2)).uppercased()
    }
    
    var firstName: String {
        displayName.split(separator: " ").first.map(String.init) ?? displayName
    }
    
    // MARK: - Preview
    
    static var preview: User {
        User(
            id: "preview-user-id",
            email: "bobby@example.com",
            displayName: "Bobby Hansen",
            avatarUrl: nil,
            isPremium: true,
            createdAt: Date()
        )
    }
}

// MARK: - User Statistics

struct UserStatistics: Codable {
    let versesRead: Int
    let chaptersCompleted: Int
    let prayersCreated: Int
    let prayersAnswered: Int
    let journalEntries: Int
    let currentStreak: Int
    let longestStreak: Int
    let totalDaysActive: Int
    
    static var empty: UserStatistics {
        UserStatistics(
            versesRead: 0,
            chaptersCompleted: 0,
            prayersCreated: 0,
            prayersAnswered: 0,
            journalEntries: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalDaysActive: 0
        )
    }
    
    static var preview: UserStatistics {
        UserStatistics(
            versesRead: 1247,
            chaptersCompleted: 89,
            prayersCreated: 45,
            prayersAnswered: 12,
            journalEntries: 34,
            currentStreak: 7,
            longestStreak: 21,
            totalDaysActive: 45
        )
    }
}
