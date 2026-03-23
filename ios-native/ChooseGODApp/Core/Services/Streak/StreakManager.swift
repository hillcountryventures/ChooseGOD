import Foundation

/// Tracks consecutive daily activity streaks with grace day support
final class StreakManager {
    
    static let shared = StreakManager()
    
    // MARK: - UserDefaults Keys
    private let streakCountKey = "streak_currentCount"
    private let lastActivityDateKey = "streak_lastActivityDate"
    private let graceDayUsedKey = "streak_graceDayUsedDate"
    private let streakFreezeAvailableKey = "streak_freezeAvailable"
    private let longestStreakKey = "streak_longestStreak"
    private let totalActiveDaysKey = "streak_totalActiveDays"
    
    private let calendar = Calendar.current
    
    private init() {}
    
    // MARK: - Public API
    
    /// Current streak count (recalculated on access)
    var currentStreak: Int {
        recalculateIfNeeded()
        return UserDefaults.standard.integer(forKey: streakCountKey)
    }
    
    /// Whether the user has already logged activity today
    var hasActivityToday: Bool {
        guard let last = lastActivityDate else { return false }
        return calendar.isDateInToday(last)
    }
    
    /// Whether a grace day (streak freeze) is available — premium perk
    var hasStreakFreeze: Bool {
        get { UserDefaults.standard.bool(forKey: streakFreezeAvailableKey) }
        set { UserDefaults.standard.set(newValue, forKey: streakFreezeAvailableKey) }
    }

    /// Best-ever streak, updated whenever currentStreak sets a new record
    var longestStreak: Int {
        get { UserDefaults.standard.integer(forKey: longestStreakKey) }
        set { UserDefaults.standard.set(newValue, forKey: longestStreakKey) }
    }

    /// Total distinct days any activity was recorded (never decrements)
    var totalActiveDays: Int {
        get { UserDefaults.standard.integer(forKey: totalActiveDaysKey) }
        set { UserDefaults.standard.set(newValue, forKey: totalActiveDaysKey) }
    }

    /// 7-element Bool array [Sun, Mon, Tue, Wed, Thu, Fri, Sat] for current week
    /// Derived from currentStreak + lastActivityDate — approximate but correct for continuous streaks
    var weekActivity: [Bool] {
        guard let last = lastActivityDate, currentStreak > 0 else {
            return Array(repeating: false, count: 7)
        }
        var result = Array(repeating: false, count: 7)
        for i in 0..<min(currentStreak, 7) {
            guard let day = calendar.date(byAdding: .day, value: -i, to: last) else { continue }
            let weekday = calendar.component(.weekday, from: day) - 1 // 0=Sun … 6=Sat
            if (0..<7).contains(weekday) { result[weekday] = true }
        }
        return result
    }

    /// Record activity for today. Returns the new streak count.
    /// Pass userId to sync changes to Supabase in the background.
    @discardableResult
    func recordActivity(userId: String? = nil) -> Int {
        let today = calendar.startOfDay(for: Date())
        let alreadyRecordedToday = hasActivityToday

        if let last = lastActivityDate {
            let lastDay = calendar.startOfDay(for: last)

            if calendar.isDateInToday(last) {
                // Already recorded today — return current
                return UserDefaults.standard.integer(forKey: streakCountKey)
            }

            let daysBetween = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0

            if daysBetween == 1 {
                // Consecutive day — increment
                incrementStreak()
            } else if daysBetween == 2 && canUseGraceDay() {
                // Missed exactly 1 day — use grace day
                useGraceDay()
                incrementStreak()
            } else {
                // Streak broken
                resetStreak()
            }
        } else {
            // First ever activity
            resetStreak()
        }

        UserDefaults.standard.set(Date(), forKey: lastActivityDateKey)

        // Update totalActiveDays only if this is the first activity of the day
        if !alreadyRecordedToday {
            totalActiveDays += 1
        }

        // Update longestStreak if current exceeds it
        let current = UserDefaults.standard.integer(forKey: streakCountKey)
        if current > longestStreak {
            longestStreak = current
        }

        // Sync to Supabase if userId provided
        if let userId {
            syncToSupabase(userId: userId)
        }

        return current
    }
    
    /// Grant a streak freeze (call when user earns premium or purchases)
    func grantStreakFreeze() {
        hasStreakFreeze = true
    }
    
    /// Check if user missed a day and can recover (for UI prompt)
    var canRecoverStreak: Bool {
        guard let last = lastActivityDate else { return false }
        let today = calendar.startOfDay(for: Date())
        let lastDay = calendar.startOfDay(for: last)
        let daysBetween = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0
        return daysBetween == 2 && canUseGraceDay()
    }
    
    /// Description of streak state for UI
    var streakRecoveryMessage: String? {
        guard canRecoverStreak else { return nil }
        return "You missed yesterday! Use your streak freeze to keep your \(UserDefaults.standard.integer(forKey: streakCountKey))-day streak?"
    }

    // MARK: - Supabase Sync

    /// Load streak from Supabase on app launch — merges local and server values
    func loadFromSupabase(userId: String) async {
        guard let client = try? SupabaseManager.shared.requireClient() else { return }

        struct StreakRow: Codable {
            let currentStreak: Int
            let longestStreak: Int
            let lastActivityDate: String?

            enum CodingKeys: String, CodingKey {
                case currentStreak = "current_streak"
                case longestStreak = "longest_streak"
                case lastActivityDate = "last_activity_date"
            }
        }

        guard let rows: [StreakRow] = try? await client
            .from("user_streaks")
            .select()
            .eq("user_id", value: userId)
            .limit(1)
            .execute()
            .value,
            let row = rows.first else { return }

        let localDateStr = UserDefaults.standard.string(forKey: lastActivityDateKey)
        let localDate = localDateStr.flatMap { dateFromISO($0) }
        let serverDate = row.lastActivityDate.flatMap { dateFromISO($0) }

        // Server wins UNLESS local is strictly newer
        if let localDate, let serverDate, localDate > serverDate {
            return  // Keep local values
        }

        // Update from server
        UserDefaults.standard.set(row.currentStreak, forKey: streakCountKey)
        UserDefaults.standard.set(row.longestStreak, forKey: longestStreakKey)
        if let serverDate {
            UserDefaults.standard.set(serverDate, forKey: lastActivityDateKey)
        }
    }

    /// Fire-and-forget upsert to Supabase after recordActivity
    func syncToSupabase(userId: String) {
        Task.detached(priority: .background) { [weak self] in
            guard let self else { return }
            guard let client = try? SupabaseManager.shared.requireClient() else { return }

            let todayStr = ISO8601DateFormatter().string(from: Date())
            
            struct StreakRow: Codable {
                let user_id: String
                let current_streak: Int
                let longest_streak: Int
                let last_activity_date: String
                let updated_at: String
            }
            
            let row = StreakRow(
                user_id: userId,
                current_streak: self.currentStreak,
                longest_streak: self.longestStreak,
                last_activity_date: String(todayStr.prefix(10)),  // YYYY-MM-DD
                updated_at: todayStr
            )
            
            _ = try? await client.from("user_streaks").upsert(row).execute()
        }
    }

    private func dateFromISO(_ iso: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return formatter.date(from: iso)
    }

    // MARK: - Private
    
    private var lastActivityDate: Date? {
        UserDefaults.standard.object(forKey: lastActivityDateKey) as? Date
    }
    
    private func recalculateIfNeeded() {
        guard let last = lastActivityDate else { return }
        let today = calendar.startOfDay(for: Date())
        let lastDay = calendar.startOfDay(for: last)
        let daysBetween = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0
        
        if daysBetween > 2 || (daysBetween == 2 && !canUseGraceDay()) {
            UserDefaults.standard.set(0, forKey: streakCountKey)
        }
    }
    
    private func canUseGraceDay() -> Bool {
        guard hasStreakFreeze else { return false }
        if let lastGrace = UserDefaults.standard.object(forKey: graceDayUsedKey) as? Date {
            let daysSinceGrace = calendar.dateComponents([.day], from: lastGrace, to: Date()).day ?? 0
            return daysSinceGrace >= 7
        }
        return true
    }
    
    private func useGraceDay() {
        UserDefaults.standard.set(Date(), forKey: graceDayUsedKey)
    }
    
    private func incrementStreak() {
        let current = UserDefaults.standard.integer(forKey: streakCountKey)
        UserDefaults.standard.set(current + 1, forKey: streakCountKey)
    }
    
    private func resetStreak() {
        UserDefaults.standard.set(1, forKey: streakCountKey)
    }
}
