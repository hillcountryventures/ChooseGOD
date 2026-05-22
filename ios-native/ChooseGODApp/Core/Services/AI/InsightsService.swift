import Foundation
import Supabase

/// Decision G2 — calls the `journey-insights` edge function for the AI-generated
/// summary surfaced on Day 30 (Insights-as-Paywall) and on the Journey tab
/// monthly thereafter for Pro users. Free users see the Day 30 view once;
/// Pro users get refreshed insights monthly.
@Observable
final class InsightsService {

    static let shared = InsightsService()

    struct Insight: Decodable, Equatable {
        let themes: [Theme]
        let sentimentArc: String
        let growthObservation: String
        let growthOpportunity: String

        struct Theme: Decodable, Equatable {
            let label: String
            let summary: String
        }
    }

    private(set) var cached: Insight?
    private(set) var isLoading: Bool = false
    private(set) var lastLoadedAt: Date?
    private let cacheLifetime: TimeInterval = 60 * 60 * 24 * 7  // 7d (matches edge fn cache)

    private init() {}

    func fetch(userId: String, force: Bool = false) async throws -> Insight {
        if !force,
           let cached,
           let ts = lastLoadedAt,
           Date().timeIntervalSince(ts) < cacheLifetime {
            return cached
        }
        isLoading = true
        defer { isLoading = false }

        let supabase = try SupabaseManager.shared.requireClient()

        struct Body: Encodable {
            let userId: String
            let force: Bool
            enum CodingKeys: String, CodingKey { case userId = "user_id"; case force }
        }

        let response: Insight = try await supabase.functions.invoke(
            "journey-insights",
            options: .init(body: Body(userId: userId, force: force))
        )

        cached = response
        lastLoadedAt = Date()
        return response
    }

    func reset() {
        cached = nil
        lastLoadedAt = nil
    }
}
