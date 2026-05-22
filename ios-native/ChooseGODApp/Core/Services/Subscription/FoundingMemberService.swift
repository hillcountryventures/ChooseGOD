import Foundation
import Supabase

/// Talks to the `founding_member_claims` table + RPCs added in migration 056.
/// Strategy decision #5: $99 lifetime, capped at 1,000. Cap is enforced server-side
/// (DB trigger), this service surfaces the count for UI and records claims after
/// a successful RevenueCat purchase.
@Observable
final class FoundingMemberService {

    static let shared = FoundingMemberService()

    /// Decision G8 — cap reduced from 1,000 to 500. Higher per-unit price ($129)
    /// + tighter cap = stronger scarcity signal + same revenue ceiling at
    /// realistic sell-through rate.
    static let cap = 500

    private(set) var claimCount: Int = 0
    private(set) var isLoaded: Bool = false

    private init() {}

    /// Pull the current claim count for paywall UI ("X of 1000 claimed").
    /// Safe to call without auth — `founding_member_claim_count()` is granted to anon.
    func loadClaimCount() async {
        do {
            let supabase = try SupabaseManager.shared.requireClient()
            let count: Int = try await supabase
                .rpc("founding_member_claim_count")
                .execute()
                .value
            self.claimCount = count
            self.isLoaded = true
        } catch {
            // Non-fatal: paywall still shows the tier, just without the live counter.
            self.isLoaded = false
        }
    }

    /// Convenience for "is the tier still available?". Falls back to local count if
    /// the RPC fails — better to optimistically show "available" than to incorrectly
    /// hide the SKU from a user who would otherwise convert.
    func isAvailable() async throws -> Bool {
        let supabase = try SupabaseManager.shared.requireClient()
        let available: Bool = try await supabase
            .rpc("founding_member_available")
            .execute()
            .value
        return available
    }

    /// Records the user's claim against the cap. Called after RevenueCat reports
    /// a successful lifetime purchase. The DB trigger raises if the cap has been
    /// reached between the availability check and the purchase — caller treats
    /// that as a soft-error (entitlement is already granted by Apple).
    @discardableResult
    func recordClaim(transactionId: String?) async throws -> Int {
        let supabase = try SupabaseManager.shared.requireClient()
        var params: [String: AnyJSON] = [
            "p_price_cents": .integer(12900)
        ]
        if let txId = transactionId {
            params["p_transaction_id"] = .string(txId)
        } else {
            params["p_transaction_id"] = .null
        }
        _ = try await supabase
            .rpc("record_founding_member_claim", params: params)
            .execute()

        await loadClaimCount()
        return claimCount
    }
}
