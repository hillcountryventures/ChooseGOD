import Foundation
import Supabase

/// Decision G1 — assembles the personalization context bundle that is
/// injected into every companion AI call. This is the moat: "the only Bible
/// app where the AI knows you."
///
/// Bundle contents (each optional, AI gracefully degrades if anything missing):
///   * `currentIntention` — the user's "What's on your heart right now" (G2)
///   * `tradition` — denominational stance (Decision #13)
///   * `daysWithGod` — cumulative engagement (Decision #8)
///   * `currentDevotionalSeries` — title + day number of primary enrollment
///   * `recentJournalSummaries` — last 5 entries with type + truncated body
///   * `recentPrayers` — last 5 active prayer requests
///   * `lastScriptureRef` — last book/chapter the user opened in the Bible reader
///   * `recentCrisisTier` — highest tier flagged in last 14 days (if any)
///
/// Caching: 5-minute in-memory cache to avoid hitting the DB on every chat
/// turn. Invalidated on: chat send (so the AI sees the user's just-sent
/// message reflected), journal save, prayer save, sign-out.
@Observable
final class UserContextService {

    static let shared = UserContextService()

    struct Bundle: Encodable {
        var currentIntention: String?
        var tradition: String?
        var daysWithGod: Int?
        var currentDevotionalSeries: SeriesSnippet?
        var recentJournalSummaries: [JournalSummary]
        var recentPrayers: [PrayerSummary]
        var lastScriptureRef: ScriptureSnippet?
        var recentCrisisTier: Int?

        struct SeriesSnippet: Encodable {
            let title: String
            let currentDay: Int
            let totalDays: Int
        }

        struct JournalSummary: Encodable {
            let type: String         // moment_type
            let setAt: String        // ISO date
            let excerpt: String      // first ~200 chars
            let themes: [String]
        }

        struct PrayerSummary: Encodable {
            let text: String
            let status: String        // "active" | "answered" | "ongoing"
            let testimony: String?    // answered_reflection, if answered
            let setAt: String
        }

        struct ScriptureSnippet: Encodable {
            let book: String
            let chapter: Int
        }

        var isEmpty: Bool {
            currentIntention == nil
                && tradition == nil
                && daysWithGod == nil
                && currentDevotionalSeries == nil
                && recentJournalSummaries.isEmpty
                && recentPrayers.isEmpty
                && lastScriptureRef == nil
                && recentCrisisTier == nil
        }
    }

    private(set) var cached: Bundle?
    private var cachedAt: Date?
    private let cacheLifetime: TimeInterval = 300  // 5 min

    private init() {}

    /// Get the current context bundle. Returns cached if fresh; otherwise
    /// rebuilds from Supabase. Safe to call before every chat send.
    func bundle(for userId: String) async -> Bundle {
        if let cached, let ts = cachedAt, Date().timeIntervalSince(ts) < cacheLifetime {
            return cached
        }
        let fresh = await buildBundle(userId: userId)
        cached = fresh
        cachedAt = Date()
        return fresh
    }

    /// Force-rebuild on next request. Call after journal save, prayer save,
    /// chat send (so the next chat turn reflects what just happened).
    func invalidate() {
        cached = nil
        cachedAt = nil
    }

    /// Sign-out reset.
    func reset() {
        cached = nil
        cachedAt = nil
    }

    // MARK: - Build

    private func buildBundle(userId: String) async -> Bundle {
        // Each fetch is best-effort. AI gracefully degrades if any signal
        // is missing. Run them concurrently for speed.
        async let intention      = fetchCurrentIntention()
        async let tradition      = fetchTradition()
        async let daysWithGod    = fetchDaysWithGod(userId: userId)
        async let series         = fetchCurrentSeries(userId: userId)
        async let journal        = fetchRecentJournal(userId: userId)
        async let prayers        = fetchRecentPrayers(userId: userId)
        async let lastScripture  = fetchLastScripture()
        async let crisisTier     = fetchRecentCrisisTier(userId: userId)

        return Bundle(
            currentIntention: await intention,
            tradition: await tradition,
            daysWithGod: await daysWithGod,
            currentDevotionalSeries: await series,
            recentJournalSummaries: await journal,
            recentPrayers: await prayers,
            lastScriptureRef: await lastScripture,
            recentCrisisTier: await crisisTier
        )
    }

    // MARK: - Fetchers

    private func fetchCurrentIntention() async -> String? {
        if !UserIntentionsService.shared.isLoaded { return nil }
        guard let intention = UserIntentionsService.shared.current else { return nil }
        return intention.content
    }

    private func fetchTradition() async -> String? {
        UserPreferencesService.shared.isLoaded
            ? UserPreferencesService.shared.tradition.rawValue
            : nil
    }

    private func fetchDaysWithGod(userId: String) async -> Int? {
        await StreakManager.shared.loadFromSupabase(userId: userId)
        let value = StreakManager.shared.daysWithGod
        return value > 0 ? value : nil
    }

    private func fetchCurrentSeries(userId: String) async -> Bundle.SeriesSnippet? {
        let service = SupabaseDevotionalService()
        guard let enrollment = try? await service.getPrimaryEnrollment(userId: userId),
              let title = enrollment.series?.title,
              let total = enrollment.series?.totalDays else { return nil }
        return .init(title: title, currentDay: enrollment.currentDay, totalDays: total)
    }

    private func fetchRecentJournal(userId: String) async -> [Bundle.JournalSummary] {
        let service = SupabaseJournalService()
        guard let moments = try? await service.getMoments(
            userId: userId, type: nil, limit: 5, offset: 0
        ) else { return [] }
        let f = ISO8601DateFormatter()
        return moments.map { m in
            Bundle.JournalSummary(
                type: m.momentType.rawValue,
                setAt: f.string(from: m.createdAt),
                excerpt: String(m.content.prefix(200)),
                themes: m.themes
            )
        }
    }

    private func fetchRecentPrayers(userId: String) async -> [Bundle.PrayerSummary] {
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return [] }
        // Real schema (migration 003): request / status / answered_reflection.
        // Fetch a mix of active + recently-answered so the AI can reference both
        // ("you've been praying for X" and "God answered Y — your testimony was…").
        struct PrayerRow: Decodable {
            let request: String
            let status: String?
            let answeredReflection: String?
            let createdAt: String
            enum CodingKeys: String, CodingKey {
                case request, status
                case answeredReflection = "answered_reflection"
                case createdAt = "created_at"
            }
        }
        let rows: [PrayerRow] = (try? await supabase
            .from("prayer_requests")
            .select("request, status, answered_reflection, created_at")
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(8)
            .execute()
            .value) ?? []
        return rows.map {
            Bundle.PrayerSummary(
                text: $0.request,
                status: $0.status ?? "active",
                testimony: $0.answeredReflection,
                setAt: $0.createdAt
            )
        }
    }

    private func fetchLastScripture() async -> Bundle.ScriptureSnippet? {
        // BibleReaderView persists last-read in UserDefaults via these keys.
        let book = UserDefaults.standard.string(forKey: "lastReadBook")
        let chapter = UserDefaults.standard.integer(forKey: "lastReadChapter")
        guard let book, !book.isEmpty, chapter > 0 else { return nil }
        return .init(book: book, chapter: chapter)
    }

    private func fetchRecentCrisisTier(userId: String) async -> Int? {
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return nil }
        struct CrisisRow: Decodable {
            let tier: Int
            enum CodingKeys: String, CodingKey { case tier }
        }
        let cutoff = ISO8601DateFormatter().string(
            from: Date().addingTimeInterval(-14 * 24 * 60 * 60)
        )
        let rows: [CrisisRow] = (try? await supabase
            .from("crisis_flags")
            .select("tier")
            .eq("user_id", value: userId)
            .gte("created_at", value: cutoff)
            .order("tier", ascending: false)
            .limit(1)
            .execute()
            .value) ?? []
        return rows.first?.tier
    }
}
