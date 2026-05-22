import Foundation
import Supabase

/// Per-user prefs synced from `user_preferences` (migration 050). Currently
/// holds tradition (Decision #13). Loaded once on auth, cached in-memory,
/// upserted when the user changes it. Observed so onboarding/settings views
/// can bind to the current value.
@Observable
final class UserPreferencesService {

    static let shared = UserPreferencesService()

    /// In-memory cache. Defaults to `.nonDenominational` (matches the migration's
    /// DB default) so chats can fire before the row is loaded — the server-side
    /// default would have been used either way.
    private(set) var tradition: Tradition = .nonDenominational
    private(set) var isLoaded: Bool = false

    private init() {}

    /// Pull the user's preferences. Safe to call repeatedly; idempotent.
    /// If the user has no `user_preferences` row yet (first login), one is
    /// upserted with defaults so subsequent reads succeed.
    func load(userId: String) async {
        do {
            let supabase = try SupabaseManager.shared.requireClient()

            struct PrefsRow: Decodable {
                let tradition: String
            }

            let row: PrefsRow? = try? await supabase
                .from("user_preferences")
                .select("tradition")
                .eq("user_id", value: userId)
                .single()
                .execute()
                .value

            if let row, let parsed = Tradition(rawValue: row.tradition) {
                self.tradition = parsed
                self.isLoaded = true
                return
            }

            // No row — create one with the migration's default so future reads
            // are point-lookups.
            try? await supabase
                .from("user_preferences")
                .upsert(["user_id": userId, "tradition": Tradition.nonDenominational.rawValue])
                .execute()

            self.tradition = .nonDenominational
            self.isLoaded = true
        } catch {
            // Non-fatal — caller proceeds with the cached default.
            self.isLoaded = false
        }
    }

    /// Persist a new tradition for the current user.
    func setTradition(_ new: Tradition, userId: String) async throws {
        let supabase = try SupabaseManager.shared.requireClient()
        try await supabase
            .from("user_preferences")
            .upsert(["user_id": userId, "tradition": new.rawValue])
            .execute()
        self.tradition = new
        self.isLoaded = true
    }

    /// Reset on sign-out so a fresh user doesn't inherit the previous one's pick.
    func reset() {
        tradition = .nonDenominational
        isLoaded = false
    }
}
