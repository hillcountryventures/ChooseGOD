import Foundation

/// Manages daily AI chat quota: 3 free chats/day for free users, unlimited for premium
@Observable
final class ChatQuotaManager {
    
    static let shared = ChatQuotaManager()
    
    // MARK: - Constants
    
    static let dailyFreeLimit = 3
    
    // MARK: - State
    
    private(set) var chatsUsedToday: Int = 0
    private(set) var showUpgradePrompt = false
    
    var chatsRemaining: Int {
        max(0, Self.dailyFreeLimit - chatsUsedToday)
    }
    
    var isOnLastChat: Bool {
        chatsRemaining == 1
    }
    
    var hasChatsAvailable: Bool {
        chatsRemaining > 0
    }
    
    // MARK: - UserDefaults keys
    
    private let chatsUsedKey = "chat_quota_used_today"
    private let lastResetDateKey = "chat_quota_last_reset"
    
    // MARK: - Init
    
    private init() {
        loadState()
        checkAndResetDaily()
    }
    
    // MARK: - Actions
    
    /// Attempt to use a chat. Returns true if allowed.
    func useChat(isPremium: Bool) -> Bool {
        if isPremium { return true }
        
        guard hasChatsAvailable else { return false }
        
        chatsUsedToday += 1
        saveState()
        
        if chatsRemaining == 0 {
            showUpgradePrompt = true
        }
        
        return true
    }
    
    func canSendMessage(isPremium: Bool) -> Bool {
        isPremium || hasChatsAvailable
    }
    
    func dismissUpgradePrompt() {
        showUpgradePrompt = false
    }
    
    func getQuotaMessage(isPremium: Bool) -> String? {
        if isPremium { return nil }
        
        if chatsRemaining == 0 {
            return "You've used all your free chats for today. Upgrade for unlimited access."
        }
        if isOnLastChat {
            return "This is your last free chat for today."
        }
        return nil
    }
    
    // MARK: - Persistence
    
    private func checkAndResetDaily() {
        let defaults = UserDefaults.standard
        let lastReset = defaults.object(forKey: lastResetDateKey) as? Date ?? .distantPast
        
        if !Calendar.current.isDateInToday(lastReset) {
            chatsUsedToday = 0
            defaults.set(Date(), forKey: lastResetDateKey)
            defaults.set(0, forKey: chatsUsedKey)
        }
    }
    
    private func loadState() {
        chatsUsedToday = UserDefaults.standard.integer(forKey: chatsUsedKey)
    }
    
    private func saveState() {
        UserDefaults.standard.set(chatsUsedToday, forKey: chatsUsedKey)
    }
}
