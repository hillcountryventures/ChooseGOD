import Foundation
import Supabase

/// Service for fetching growth insights, milestones, and timeline data
actor SupabaseInsightsService {
    static let shared = SupabaseInsightsService()

    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }

    private init() {}

    // MARK: - Public Models

    struct JourneyStats {
        let prayerCount: Int
        let answeredPrayerCount: Int
        let journalCount: Int
        let memoryVerseCount: Int
        let devotionalDaysCount: Int

        init(_ prayers: Int, _ answered: Int, _ journals: Int, _ memories: Int, _ devotional: Int) {
            self.prayerCount = prayers
            self.answeredPrayerCount = answered
            self.journalCount = journals
            self.memoryVerseCount = memories
            self.devotionalDaysCount = devotional
        }
    }
    
    // MARK: - Row Types
    
    private struct MomentRow: Codable {
        let id: String
        let userId: String
        let momentType: String
        let content: String
        var aiReflection: String?
        var themes: [String]?
        let createdAt: String
        
        enum CodingKeys: String, CodingKey {
            case id
            case userId = "user_id"
            case momentType = "moment_type"
            case content
            case aiReflection = "ai_reflection"
            case themes
            case createdAt = "created_at"
        }
    }
    
    private struct InsightRow: Codable {
        let id: String
        let userId: String
        let insightType: String
        let title: String
        let narrative: String
        var keyMoments: [String]?
        var themesGrowth: [String: Int]?
        let periodStart: String?
        let periodEnd: String?
        let createdAt: String
        
        enum CodingKeys: String, CodingKey {
            case id
            case userId = "user_id"
            case insightType = "insight_type"
            case title
            case narrative
            case keyMoments = "key_moments"
            case themesGrowth = "themes_growth"
            case periodStart = "period_start"
            case periodEnd = "period_end"
            case createdAt = "created_at"
        }
    }
    
    // MARK: - Spiritual Moments
    
    private func fetchSpiritualMoments(userId: String) async throws -> [MomentRow] {
        let ninetyDaysAgo = Calendar.current.date(byAdding: .day, value: -90, to: Date()) ?? Date()
        let isoDate = ISO8601DateFormatter().string(from: ninetyDaysAgo)
        
        return try await requireSupabase().from("spiritual_moments")
            .select()
            .eq("user_id", value: userId)
            .gte("created_at", value: isoDate)
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    // MARK: - Helper: Period to Date Range

    private func startDate(for period: InsightsViewModel.Period) -> Date {
        let calendar = Calendar.current
        let now = Date()
        let dayCount: Int

        switch period {
        case .week:
            dayCount = 7
        case .month:
            dayCount = 30
        case .quarter:
            dayCount = 90
        case .year:
            dayCount = 365
        }

        return calendar.date(byAdding: .day, value: -dayCount, to: now) ?? now
    }

    // MARK: - Growth Insights

    func fetchGrowthInsights(userId: String, period: InsightsViewModel.Period = .month, type: GrowthInsight.InsightType? = nil) async throws -> [GrowthInsight] {
        let start = startDate(for: period)
        let formatter = ISO8601DateFormatter()
        let isoStart = formatter.string(from: start)

        let query = try requireSupabase().from("growth_insights")
            .select()
            .eq("user_id", value: userId)
            .gte("created_at", value: isoStart)
            .order("created_at", ascending: false)
            .limit(10)

        let rows: [InsightRow] = try await query.execute().value

        return rows.compactMap { row in
            guard let insightType = GrowthInsight.InsightType(rawValue: row.insightType) else { return nil }

            let createdAt = formatter.date(from: row.createdAt) ?? Date()
            let periodStart = row.periodStart.flatMap { formatter.date(from: $0) } ?? createdAt
            let periodEnd = row.periodEnd.flatMap { formatter.date(from: $0) } ?? createdAt

            return GrowthInsight(
                id: row.id,
                userId: userId,
                periodStart: periodStart,
                periodEnd: periodEnd,
                insightType: insightType,
                title: row.title,
                narrative: row.narrative,
                keyMoments: row.keyMoments ?? [],
                themesGrowth: row.themesGrowth ?? [:],
                createdAt: createdAt
            )
        }
    }

    // MARK: - Journey Stats

    func fetchJourneyStats(userId: String, period: InsightsViewModel.Period = .month) async -> JourneyStats {
        guard let db = try? requireSupabase() else { return .init(0, 0, 0, 0, 0) }

        // Fetch prayer counts in parallel (using full stats, not period-filtered for MVP)
        let prayerCountTask = Task {
            (try? await db.from("prayer_requests")
                .select("id", head: true)
                .eq("user_id", value: userId)
                .execute()
                .count) ?? 0
        }

        let answeredCountTask = Task {
            (try? await db.from("prayer_requests")
                .select("id", head: true)
                .eq("user_id", value: userId)
                .eq("status", value: "answered")
                .execute()
                .count) ?? 0
        }

        let journalCountTask = Task {
            (try? await db.from("spiritual_moments")
                .select("id", head: true)
                .eq("user_id", value: userId)
                .eq("moment_type", value: "journal")
                .execute()
                .count) ?? 0
        }

        let memoryVerseCountTask = Task {
            (try? await db.from("memory_verses")
                .select("id", head: true)
                .eq("user_id", value: userId)
                .execute()
                .count) ?? 0
        }

        let devotionalCountTask = Task {
            await fetchDevotionalCompletionCount(userId: userId, db: db)
        }

        let (prayers, answered, journals, memories, devotional) = await (
            prayerCountTask.value,
            answeredCountTask.value,
            journalCountTask.value,
            memoryVerseCountTask.value,
            devotionalCountTask.value
        )

        return .init(prayers, answered, journals, memories, devotional)
    }

    private func fetchDevotionalCompletionCount(userId: String, db: SupabaseClient) async -> Int {
        struct EnrollmentRow: Codable {
            let completedDays: [Int]
            enum CodingKeys: String, CodingKey {
                case completedDays = "completed_days"
            }
        }

        do {
            let rows: [EnrollmentRow] = try await db.from("user_series_enrollments")
                .select("completed_days")
                .eq("user_id", value: userId)
                .execute()
                .value
            return rows.reduce(0) { $0 + $1.completedDays.count }
        } catch {
            return 0
        }
    }

    /// Save current period's spiritual health score to Supabase for historical tracking
    func saveHealthScore(userId: String, score: Int, period: String, periodStart: Date) async {
        guard let client = try? requireSupabase() else { return }
        let formatter = ISO8601DateFormatter()
        let row: [String: AnyJSON] = [
            "user_id": .string(userId),
            "score": .double(Double(score)),
            "period": .string(period),
            "period_start": .string(formatter.string(from: periodStart))
        ]
        _ = try? await client.from("spiritual_health_scores").insert(row).execute()
    }

    /// Fetch prior period's spiritual health score for calculating change %
    func fetchPriorPeriodScore(userId: String, period: InsightsViewModel.Period) async -> Double? {
        guard let client = try? requireSupabase() else { return nil }
        let currentStart = periodStart(for: period)
        let formatter = ISO8601DateFormatter()

        struct ScoreRow: Codable { let score: Int }

        let rows: [ScoreRow]? = try? await client
            .from("spiritual_health_scores")
            .select("score")
            .eq("user_id", value: userId)
            .eq("period", value: period.rawValue)
            .lt("period_start", value: formatter.string(from: currentStart))
            .order("recorded_at", ascending: false)
            .limit(1)
            .execute()
            .value

        return rows?.first.map { Double($0.score) }
    }

    private func periodStart(for period: InsightsViewModel.Period) -> Date {
        let cal = Calendar.current
        let now = Date()
        switch period {
        case .week:
            return cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now)) ?? now
        case .month:
            return cal.date(from: cal.dateComponents([.year, .month], from: now)) ?? now
        case .quarter:
            let m = (cal.component(.month, from: now) - 1) / 3 * 3 + 1
            return cal.date(from: DateComponents(year: cal.component(.year, from: now), month: m)) ?? now
        case .year:
            return cal.date(from: cal.dateComponents([.year], from: now)) ?? now
        }
    }

    // MARK: - Generate AI Insight

    func generateAIInsight(userId: String, totalMoments: Int, prayers: Int, journals: Int, devotionals: Int, topThemes: [String]) async throws -> AIGrowthSummary {
        let client = try requireSupabase()

        let prompt = """
        Analyze this person's spiritual journey and respond ONLY with valid JSON (no markdown):
        - Prayers: \(prayers), Journals: \(journals), Devotionals: \(devotionals)
        - Top themes: \(topThemes.prefix(5).joined(separator: ", "))
        Respond with exactly: {"scripture":"<Book Ch:v>","reflection":"<2-3 sentences>","prayer":"<1 sentence prayer>","theme":"<1-word theme>"}
        """

        struct CompanionRequest: Codable {
            let userId: String
            let message: String
            let contextMode: String

            enum CodingKeys: String, CodingKey {
                case userId = "user_id"
                case message
                case contextMode = "context_mode"
            }
        }

        struct CompanionResponse: Codable {
            let response: String?
        }

        let requestBody = CompanionRequest(userId: userId, message: prompt, contextMode: "insight")

        do {
            let response: CompanionResponse = try await client.functions
                .invoke("companion", options: .init(body: requestBody))

            // Parse JSON from AI response
            if let responseText = response.response,
               let data = responseText.data(using: .utf8),
               let parsed = try? JSONDecoder().decode(AIInsightJSON.self, from: data) {
                return AIGrowthSummary(
                    summary: parsed.reflection,
                    scriptureConnection: parsed.scripture,
                    growthPrediction: parsed.theme,
                    encouragement: parsed.prayer
                )
            }
        } catch {
            // Fall through to default
        }

        // Fallback: meaningful generic insight
        return AIGrowthSummary(
            summary: "Your faithfulness in prayer and study is building a deeper relationship with God. Every moment spent in His Word matters.",
            scriptureConnection: "Psalm 119:105",
            growthPrediction: "faithfulness",
            encouragement: "Lord, continue to grow my hunger for Your Word and presence."
        )
    }

    private struct AIInsightJSON: Codable {
        let scripture: String
        let reflection: String
        let prayer: String
        let theme: String
    }
    
    // MARK: - Timeline

    func fetchTimeline(userId: String, period: InsightsViewModel.Period = .month, limit: Int = 50) async throws -> [TimelineItem] {
        let start = startDate(for: period)
        let formatter = ISO8601DateFormatter()
        let isoStart = formatter.string(from: start)

        let rows: [MomentRow] = try await requireSupabase().from("spiritual_moments")
            .select()
            .eq("user_id", value: userId)
            .gte("created_at", value: isoStart)
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value
        
        return rows.compactMap { row in
            guard let type = TimelineItem.TimelineItemType(rawValue: row.momentType) else { return nil }
            let createdAt = formatter.date(from: row.createdAt) ?? Date()
            
            return TimelineItem(
                id: row.id,
                type: type,
                title: row.aiReflection ?? type.displayLabel,
                content: row.content,
                icon: type.displayIcon,
                color: type.displayColor,
                linkedVerses: [],
                themes: row.themes ?? [],
                createdAt: createdAt
            )
        }
    }
}
