import Foundation

/// Manages lifetime AI chat quota: 5 free conversations total for free users, unlimited for premium
/// Chat count is stored server-side in Supabase user_profiles.ai_chat_count
@Observable
final class ChatQuotaManager {

    static let shared = ChatQuotaManager()

    // MARK: - Constants

    static let lifetimeFreeLimit = 5

    // MARK: - State

    private(set) var chatsUsed: Int = 0
    var isLoaded = false
    private(set) var showUpgradePrompt = false

    var chatsRemaining: Int {
        max(0, Self.lifetimeFreeLimit - chatsUsed)
    }

    var isOnLastChat: Bool {
        chatsRemaining == 1
    }

    var hasChatsAvailable: Bool {
        chatsRemaining > 0
    }

    // MARK: - Init

    private init() {}

    // MARK: - Actions

    /// Load current chat count from Supabase. Call on chat screen appear or app init.
    func loadCount(userId: String) async throws {
        let client = try SupabaseManager.shared.requireClient()
        struct UserProfile: Codable {
            let ai_chat_count: Int
        }
        let response: UserProfile = try await client
            .from("user_profiles")
            .select("ai_chat_count")
            .eq("id", value: userId)
            .single()
            .execute()
            .value

        self.chatsUsed = response.ai_chat_count
        self.isLoaded = true
    }

    /// Check if user can send a message
    func canSend(isPremium: Bool, hasReferralPremium: Bool) -> Bool {
        if isPremium || hasReferralPremium { return true }
        return hasChatsAvailable
    }

    /// Increment the chat count in Supabase after a successful AI response
    func recordSent(userId: String) async throws {
        let supabase = try SupabaseManager.shared.requireClient()
        let result: [[String: Int]] = try await supabase
            .rpc("increment_ai_chat_count", params: ["p_user_id": userId])
            .execute()
            .value

        if let data = result.first, let newCount = data["increment_ai_chat_count"] ?? data["0"] {
            self.chatsUsed = newCount
        }
    }

    func triggerUpgradePrompt() {
        showUpgradePrompt = true
    }

    func dismissUpgradePrompt() {
        showUpgradePrompt = false
    }

    func getQuotaMessage(isPremium: Bool, hasReferralPremium: Bool) -> String? {
        if isPremium || hasReferralPremium { return nil }

        if chatsRemaining == 0 {
            return "You've used all your free conversations. Upgrade for unlimited access."
        }
        if isOnLastChat {
            return "This is your last free conversation."
        }
        return nil
    }
}
