import Foundation

/// Tracks reading streak and chapter count in UserDefaults
enum ReadingStatsManager {
    
    private static let streakKey = "readingStreak"
    private static let lastStreakDateKey = "lastStreakDate"
    private static let chaptersKey = "chaptersReadTotal"
    
    /// Call when a chapter is loaded/read
    static func recordChapterRead() {
        // Increment total chapters
        let total = UserDefaults.standard.integer(forKey: chaptersKey) + 1
        UserDefaults.standard.set(total, forKey: chaptersKey)
        
        // Update streak
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        
        if let lastDate = UserDefaults.standard.object(forKey: lastStreakDateKey) as? Date {
            let lastDay = calendar.startOfDay(for: lastDate)
            if lastDay == today {
                // Already counted today
                return
            }
            let diff = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0
            if diff == 1 {
                // Consecutive day — increment streak
                let streak = UserDefaults.standard.integer(forKey: streakKey) + 1
                UserDefaults.standard.set(streak, forKey: streakKey)
            } else if diff > 1 {
                // Streak broken — reset to 1
                UserDefaults.standard.set(1, forKey: streakKey)
            }
        } else {
            // First ever read
            UserDefaults.standard.set(1, forKey: streakKey)
        }
        
        UserDefaults.standard.set(today, forKey: lastStreakDateKey)
    }
    
    /// Current streak value (0 if never read, or expired)
    static func currentStreak() -> Int {
        let streak = UserDefaults.standard.integer(forKey: streakKey)
        guard streak > 0,
              let lastDate = UserDefaults.standard.object(forKey: lastStreakDateKey) as? Date else {
            return 0
        }
        // If more than 1 day has passed since last read, streak is 0
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let lastDay = calendar.startOfDay(for: lastDate)
        let diff = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0
        return diff <= 1 ? streak : 0
    }
}
