import Foundation

/// Tracks engagement state per Strategy Decision #8.
///
/// Two parallel counters:
///   * `daysWithGod` — cumulative, never resets. Primary number on the Home
///     card. Increments once per distinct day with activity.
///   * `currentStreak` — consecutive days with activity. Secondary "this week"
///     signal. Resets if the user misses 2+ days without a Grace Day.
///
/// Grace Days (Decision #8 — un-paywalled grace mechanic):
///   * Free users get 2/month auto-granted (rolls over on first activity of a
///     new calendar month).
///   * Pro users have unbounded grace (the cap is never enforced).
///   * Using a Grace Day repairs a 1-day miss without breaking the streak,
///     but never decreases `daysWithGod` — that counter only grows.
@Observable
final class StreakManager {

    static let shared = StreakManager()

    // MARK: - UserDefaults Keys
    private let streakCountKey               = "streak_currentCount"
    private let lastActivityDateKey          = "streak_lastActivityDate"
    private let longestStreakKey             = "streak_longestStreak"
    private let totalActiveDaysKey           = "streak_totalActiveDays"           // legacy alias of daysWithGod
    private let daysWithGodKey               = "streak_daysWithGod"
    private let graceDaysUsedThisMonthKey    = "streak_graceDaysUsedThisMonth"
    private let graceDaysMonthAnchorKey      = "streak_graceDaysMonthAnchor"

    private let calendar = Calendar.current
    private let isoFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withFullDate]
        return f
    }()

    /// Free users get this many Grace Days/month. Pro users are uncapped.
    static let freeGraceDaysPerMonth: Int = 2

    private init() {
        // One-time migration: backfill daysWithGod from the legacy totalActiveDays
        // counter so existing users don't see their cumulative number reset.
        let stored = UserDefaults.standard.integer(forKey: daysWithGodKey)
        let legacy = UserDefaults.standard.integer(forKey: totalActiveDaysKey)
        if stored == 0 && legacy > 0 {
            UserDefaults.standard.set(legacy, forKey: daysWithGodKey)
        }
    }

    // MARK: - Public API — Days With God (primary)

    /// Cumulative days with any activity. Never decrements.
    var daysWithGod: Int {
        UserDefaults.standard.integer(forKey: daysWithGodKey)
    }

    // MARK: - Public API — Consecutive streak (secondary)

    var currentStreak: Int {
        recalculateIfNeeded()
        return UserDefaults.standard.integer(forKey: streakCountKey)
    }

    var longestStreak: Int {
        get { UserDefaults.standard.integer(forKey: longestStreakKey) }
        set { UserDefaults.standard.set(newValue, forKey: longestStreakKey) }
    }

    var hasActivityToday: Bool {
        guard let last = lastActivityDate else { return false }
        return calendar.isDateInToday(last)
    }

    /// Sun…Sat boolean array for the current week, derived from currentStreak.
    var weekActivity: [Bool] {
        guard let last = lastActivityDate, currentStreak > 0 else {
            return Array(repeating: false, count: 7)
        }
        var result = Array(repeating: false, count: 7)
        for i in 0..<min(currentStreak, 7) {
            guard let day = calendar.date(byAdding: .day, value: -i, to: last) else { continue }
            let weekday = calendar.component(.weekday, from: day) - 1
            if (0..<7).contains(weekday) { result[weekday] = true }
        }
        return result
    }

    // MARK: - Public API — Grace Days

    /// How many Grace Days the user has remaining this month.
    /// Returns `Int.max` for Pro users — Grace Days are uncapped for them.
    func graceDaysRemaining(isPremium: Bool) -> Int {
        if isPremium { return Int.max }
        rolloverIfNewMonth()
        let used = UserDefaults.standard.integer(forKey: graceDaysUsedThisMonthKey)
        return max(0, Self.freeGraceDaysPerMonth - used)
    }

    /// True if the user is positioned to use a Grace Day to recover a 1-day miss.
    func canRecoverStreak(isPremium: Bool) -> Bool {
        guard let last = lastActivityDate else { return false }
        let today = calendar.startOfDay(for: Date())
        let lastDay = calendar.startOfDay(for: last)
        let daysBetween = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0
        return daysBetween == 2 && graceDaysRemaining(isPremium: isPremium) > 0
    }

    var streakRecoveryMessage: String? {
        // Conservative — only show if a Grace Day is currently available.
        guard canRecoverStreak(isPremium: false) || canRecoverStreak(isPremium: true) else {
            return nil
        }
        let count = UserDefaults.standard.integer(forKey: streakCountKey)
        return "You missed yesterday — use a Grace Day to keep your \(count)-day streak?"
    }

    // MARK: - Public API — Activity recording

    /// Record activity for today. Returns the new consecutive streak count.
    /// `isPremium` controls Grace Day availability. Pass `userId` to fire-and-forget
    /// sync the new state to Supabase.
    @discardableResult
    func recordActivity(isPremium: Bool, userId: String? = nil) -> Int {
        rolloverIfNewMonth()

        let today = calendar.startOfDay(for: Date())
        let alreadyRecordedToday = hasActivityToday

        if let last = lastActivityDate {
            let lastDay = calendar.startOfDay(for: last)

            if calendar.isDateInToday(last) {
                return UserDefaults.standard.integer(forKey: streakCountKey)
            }

            let daysBetween = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0

            if daysBetween == 1 {
                incrementStreak()
            } else if daysBetween == 2 && graceDaysRemaining(isPremium: isPremium) > 0 {
                consumeGraceDay(isPremium: isPremium)
                incrementStreak()
            } else {
                resetStreak()
            }
        } else {
            resetStreak()
        }

        UserDefaults.standard.set(Date(), forKey: lastActivityDateKey)

        // Days With God: only grows, only on the first activity of the day.
        if !alreadyRecordedToday {
            let next = daysWithGod + 1
            UserDefaults.standard.set(next, forKey: daysWithGodKey)
            // Keep the legacy `totalActiveDays` mirror so existing read-sites don't break.
            UserDefaults.standard.set(next, forKey: totalActiveDaysKey)
        }

        let current = UserDefaults.standard.integer(forKey: streakCountKey)
        if current > longestStreak { longestStreak = current }

        if let userId { syncToSupabase(userId: userId) }
        // Decision G1 — anything that bumps the user's state should invalidate
        // the personalization cache so the next chat reflects it.
        UserContextService.shared.invalidate()
        return current
    }

    // MARK: - Supabase Sync

    /// Pull state from Supabase. Server wins unless local is strictly newer.
    func loadFromSupabase(userId: String) async {
        guard let client = try? SupabaseManager.shared.requireClient() else { return }

        struct StreakRow: Codable {
            let currentStreak: Int
            let longestStreak: Int
            let daysWithGod: Int?
            let lastActivityDate: String?
            let graceDaysUsedThisMonth: Int?
            let graceDaysMonthAnchor: String?

            enum CodingKeys: String, CodingKey {
                case currentStreak              = "current_streak"
                case longestStreak              = "longest_streak"
                case daysWithGod                = "days_with_god"
                case lastActivityDate           = "last_activity_date"
                case graceDaysUsedThisMonth     = "grace_days_used_this_month"
                case graceDaysMonthAnchor       = "grace_days_month_anchor"
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
        let localDate = localDateStr.flatMap { isoFormatter.date(from: $0) }
        let serverDate = row.lastActivityDate.flatMap { isoFormatter.date(from: $0) }

        if let localDate, let serverDate, localDate > serverDate {
            return
        }

        UserDefaults.standard.set(row.currentStreak, forKey: streakCountKey)
        UserDefaults.standard.set(row.longestStreak, forKey: longestStreakKey)
        if let dwg = row.daysWithGod {
            UserDefaults.standard.set(dwg, forKey: daysWithGodKey)
            UserDefaults.standard.set(dwg, forKey: totalActiveDaysKey)
        }
        if let serverDate {
            UserDefaults.standard.set(serverDate, forKey: lastActivityDateKey)
        }
        if let used = row.graceDaysUsedThisMonth {
            UserDefaults.standard.set(used, forKey: graceDaysUsedThisMonthKey)
        }
        if let anchorStr = row.graceDaysMonthAnchor,
           let anchor = isoFormatter.date(from: anchorStr) {
            UserDefaults.standard.set(anchor, forKey: graceDaysMonthAnchorKey)
        }
    }

    func syncToSupabase(userId: String) {
        Task.detached(priority: .background) { [weak self] in
            guard let self else { return }
            guard let client = try? SupabaseManager.shared.requireClient() else { return }

            let now = Date()
            let isoNow = ISO8601DateFormatter().string(from: now)
            let dayOnly = String(isoNow.prefix(10))
            let monthAnchor = self.firstOfMonth(for: now)
            let monthAnchorStr = self.isoFormatter.string(from: monthAnchor)

            struct StreakRow: Codable {
                let user_id: String
                let current_streak: Int
                let longest_streak: Int
                let days_with_god: Int
                let last_activity_date: String
                let grace_days_used_this_month: Int
                let grace_days_month_anchor: String
                let updated_at: String
            }

            let row = StreakRow(
                user_id: userId,
                current_streak: self.currentStreak,
                longest_streak: self.longestStreak,
                days_with_god: self.daysWithGod,
                last_activity_date: dayOnly,
                grace_days_used_this_month: UserDefaults.standard.integer(forKey: self.graceDaysUsedThisMonthKey),
                grace_days_month_anchor: monthAnchorStr,
                updated_at: isoNow
            )

            _ = try? await client.from("user_streaks").upsert(row).execute()
        }
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

        // Pessimistic: only auto-reset if more than 2 days have elapsed. The
        // 2-day case is left alone so the user has a chance to land on the
        // Home screen and consume a Grace Day before we zero them out.
        if daysBetween > 2 {
            UserDefaults.standard.set(0, forKey: streakCountKey)
        }
    }

    private func consumeGraceDay(isPremium: Bool) {
        // Pro = uncapped, no decrement bookkeeping needed.
        guard !isPremium else { return }
        let used = UserDefaults.standard.integer(forKey: graceDaysUsedThisMonthKey)
        UserDefaults.standard.set(used + 1, forKey: graceDaysUsedThisMonthKey)
    }

    /// First-of-month rollover for the Grace Day counter. Idempotent — only
    /// resets when the stored anchor predates the current month's anchor.
    private func rolloverIfNewMonth() {
        let anchor = firstOfMonth(for: Date())
        let stored = UserDefaults.standard.object(forKey: graceDaysMonthAnchorKey) as? Date
        guard stored != anchor else { return }
        UserDefaults.standard.set(0, forKey: graceDaysUsedThisMonthKey)
        UserDefaults.standard.set(anchor, forKey: graceDaysMonthAnchorKey)
    }

    private func firstOfMonth(for date: Date) -> Date {
        let components = calendar.dateComponents([.year, .month], from: date)
        return calendar.date(from: components) ?? date
    }

    private func incrementStreak() {
        let current = UserDefaults.standard.integer(forKey: streakCountKey)
        UserDefaults.standard.set(current + 1, forKey: streakCountKey)
    }

    private func resetStreak() {
        UserDefaults.standard.set(1, forKey: streakCountKey)
    }
}
