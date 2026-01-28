import Foundation

/// Manages the "3 Daily Seeds" quota for free users
/// Premium users get unlimited access
@Observable
final class ChatQuotaManager {
    
    static let shared = ChatQuotaManager()
    
    // MARK: - Constants
    
    static let totalSeeds = 3
    
    // MARK: - State
    
    private(set) var seedsUsedToday: Int = 0
    private(set) var showFinalSeedInterstitial = false
    
    var seedsRemaining: Int {
        max(0, Self.totalSeeds - seedsUsedToday)
    }
    
    var isOnLastSeed: Bool {
        seedsRemaining == 1
    }
    
    var hasSeeds: Bool {
        seedsRemaining > 0
    }
    
    // MARK: - UserDefaults keys
    
    private let seedsUsedKey = "chat_seeds_used_today"
    private let lastResetDateKey = "chat_seeds_last_reset"
    
    // MARK: - Init
    
    private init() {
        loadState()
        checkAndResetDaily()
    }
    
    // MARK: - Actions
    
    /// Attempt to use a seed. Returns true if allowed.
    func useSeed(isPremium: Bool) -> Bool {
        if isPremium { return true }
        
        guard hasSeeds else { return false }
        
        seedsUsedToday += 1
        saveState()
        
        if seedsRemaining == 0 {
            showFinalSeedInterstitial = true
        }
        
        return true
    }
    
    func canSendMessage(isPremium: Bool) -> Bool {
        isPremium || hasSeeds
    }
    
    func dismissFinalSeedInterstitial() {
        showFinalSeedInterstitial = false
    }
    
    func getSeedMessage(isPremium: Bool) -> String? {
        if isPremium { return nil }
        
        if seedsRemaining == 0 {
            return "You've planted all your seeds for today."
        }
        if isOnLastSeed {
            return "This is your final daily seed. Make it a deep one."
        }
        return nil
    }
    
    // MARK: - Persistence
    
    private func checkAndResetDaily() {
        let defaults = UserDefaults.standard
        let lastReset = defaults.object(forKey: lastResetDateKey) as? Date ?? .distantPast
        
        if !Calendar.current.isDateInToday(lastReset) {
            seedsUsedToday = 0
            defaults.set(Date(), forKey: lastResetDateKey)
            defaults.set(0, forKey: seedsUsedKey)
        }
    }
    
    private func loadState() {
        seedsUsedToday = UserDefaults.standard.integer(forKey: seedsUsedKey)
    }
    
    private func saveState() {
        UserDefaults.standard.set(seedsUsedToday, forKey: seedsUsedKey)
    }
}
