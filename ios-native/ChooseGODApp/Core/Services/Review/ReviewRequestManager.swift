import StoreKit
import Foundation

/// Manages App Store review prompts at natural delight moments.
/// Apple limits requestReview() display to ~3x per 365-day period.
/// We self-limit to avoid wasted calls.
final class ReviewRequestManager {
    
    static let shared = ReviewRequestManager()
    
    private let maxRequestsPerYear = 3
    private let requestDatesKey = "review_requestDates"
    private let sessionCountKey = "review_sessionCount"
    
    private init() {}
    
    // MARK: - Session Tracking
    
    /// Call on each app launch. Returns session count.
    @discardableResult
    func incrementSession() -> Int {
        let count = UserDefaults.standard.integer(forKey: sessionCountKey) + 1
        UserDefaults.standard.set(count, forKey: sessionCountKey)
        return count
    }
    
    var sessionCount: Int {
        UserDefaults.standard.integer(forKey: sessionCountKey)
    }
    
    // MARK: - Review Request Triggers
    
    /// After streak milestone (7, 30, 100 days)
    func requestIfStreakMilestone(_ streak: Int) {
        let milestones = [7, 30, 100]
        guard milestones.contains(streak) else { return }
        requestReviewIfAllowed()
    }
    
    /// After completing a devotional day
    func requestAfterDevotionalComplete() {
        // Only prompt after 3+ sessions so user is engaged
        guard sessionCount >= 3 else { return }
        requestReviewIfAllowed()
    }
    
    /// After 7th app session
    func requestIfSessionMilestone() {
        guard sessionCount == 7 else { return }
        requestReviewIfAllowed()
    }
    
    // MARK: - Core Logic
    
    private func requestReviewIfAllowed() {
        let dates = recentRequestDates()
        
        // Filter to last 365 days
        let oneYearAgo = Calendar.current.date(byAdding: .year, value: -1, to: Date()) ?? Date()
        let recentDates = dates.filter { $0 > oneYearAgo }
        
        guard recentDates.count < maxRequestsPerYear else { return }
        
        // Minimum 60 days between requests
        if let lastDate = recentDates.last {
            let daysSinceLast = Calendar.current.dateComponents([.day], from: lastDate, to: Date()).day ?? 0
            guard daysSinceLast >= 60 else { return }
        }
        
        // Request review
        if let scene = UIApplication.shared.connectedScenes
            .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
        
        // Record this request
        var allDates = dates
        allDates.append(Date())
        saveRequestDates(allDates)
    }
    
    private func recentRequestDates() -> [Date] {
        guard let data = UserDefaults.standard.data(forKey: requestDatesKey),
              let dates = try? JSONDecoder().decode([Date].self, from: data) else {
            return []
        }
        return dates
    }
    
    private func saveRequestDates(_ dates: [Date]) {
        if let data = try? JSONEncoder().encode(dates) {
            UserDefaults.standard.set(data, forKey: requestDatesKey)
        }
    }
}
