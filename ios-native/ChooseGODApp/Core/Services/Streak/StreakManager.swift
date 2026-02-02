import Foundation

/// Tracks consecutive daily activity streaks with grace day support
final class StreakManager {
    
    static let shared = StreakManager()
    
    // MARK: - UserDefaults Keys
    private let streakCountKey = "streak_currentCount"
    private let lastActivityDateKey = "streak_lastActivityDate"
    private let graceDayUsedKey = "streak_graceDayUsedDate"
    private let streakFreezeAvailableKey = "streak_freezeAvailable"
    
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
    
    /// Record activity for today. Returns the new streak count.
    @discardableResult
    func recordActivity() -> Int {
        let today = calendar.startOfDay(for: Date())
        
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
        return UserDefaults.standard.integer(forKey: streakCountKey)
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
