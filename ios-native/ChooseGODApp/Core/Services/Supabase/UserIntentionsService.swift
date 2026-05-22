import Foundation
import Supabase

/// Decision G2 — captures and surfaces "what is the user praying through right now."
/// The single most leverage signal for solving cold-start: companion AI gets a
/// real personal anchor from Day 0 (set in onboarding) instead of waiting for
/// the user to organically build journal/prayer history.
@Observable
final class UserIntentionsService {

    static let shared = UserIntentionsService()

    struct Intention: Decodable, Identifiable {
        let id: String
        let content: String
        let setAt: Date
        let expiresAt: Date
        let isActive: Bool
        let source: String

        enum CodingKeys: String, CodingKey {
            case id, content, source
            case setAt      = "set_at"
            case expiresAt  = "expires_at"
            case isActive   = "is_active"
        }
    }

    private(set) var current: Intention?
    private(set) var isLoaded: Bool = false

    private init() {}

    /// Pull the user's current active intention (if any).
    func load(userId: String) async {
        do {
            let supabase = try SupabaseManager.shared.requireClient()
            let rows: [Intention] = try await supabase
                .from("user_intentions")
                .select("id, content, set_at, expires_at, is_active, source")
                .eq("user_id", value: userId)
                .eq("is_active", value: true)
                .limit(1)
                .execute()
                .value

            self.current = rows.first
            self.isLoaded = true
        } catch {
            self.isLoaded = false
        }
    }

    /// Set a new active intention. Atomically archives any prior active one.
    @discardableResult
    func setIntention(_ content: String, source: String = "settings") async throws -> Intention {
        let supabase = try SupabaseManager.shared.requireClient()
        let row: Intention = try await supabase
            .rpc("set_user_intention", params: ["p_content": content, "p_source": source])
            .execute()
            .value
        self.current = row
        self.isLoaded = true
        return row
    }

    func reset() {
        current = nil
        isLoaded = false
    }
}
