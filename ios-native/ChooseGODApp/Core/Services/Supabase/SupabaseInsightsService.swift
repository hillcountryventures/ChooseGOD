import Foundation
import Supabase

/// Service for fetching growth insights, milestones, and timeline data
actor SupabaseInsightsService {
    static let shared = SupabaseInsightsService()
    
    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }
    
    private init() {}
    
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
        let ninetyDaysAgo = Calendar.current.date(byAdding: .day, value: -90, to: Date())!
        let isoDate = ISO8601DateFormatter().string(from: ninetyDaysAgo)
        
        return try await requireSupabase().from("spiritual_moments")
            .select()
            .eq("user_id", value: userId)
            .gte("created_at", value: isoDate)
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    // MARK: - Growth Insights
    
    func fetchGrowthInsights(userId: String, type: GrowthInsight.InsightType? = nil) async throws -> [GrowthInsight] {
        var query = try requireSupabase().from("growth_insights")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(10)
        
        let rows: [InsightRow] = try await query.execute().value
        let formatter = ISO8601DateFormatter()
        
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
    
    // MARK: - Generate AI Insight
    
    func generateAIInsight(userId: String, totalMoments: Int, prayers: Int, journals: Int, devotionals: Int, topThemes: [String]) async throws -> AIGrowthSummary {
        let prompt = """
        As a spiritual companion, analyze this person's journey:
        - Total moments: \(totalMoments), Prayers: \(prayers), Journals: \(journals), Devotionals: \(devotionals)
        - Top themes: \(topThemes.joined(separator: ", "))
        Provide JSON: {"summary":"...","scriptureConnection":"...","growthPrediction":"...","encouragement":"..."}
        """
        
        struct CompanionRequest: Codable {
            let userId: String
            let message: String
            let contextMode: String
        }
        
        struct CompanionResponse: Codable {
            let response: String?
        }
        
        do {
            let response = try await requireSupabase().functions.invoke(
                "companion",
                options: .init(body: CompanionRequest(userId: userId, message: prompt, contextMode: "devotional"))
            )
            
            // Parse response
            return AIGrowthSummary(summary: "Keep growing in your faith!", scriptureConnection: nil, growthPrediction: nil, encouragement: nil)
        } catch {
            return AIGrowthSummary(summary: "Keep growing in your faith journey!", scriptureConnection: nil, growthPrediction: nil, encouragement: nil)
        }
    }
    
    // MARK: - Timeline
    
    func fetchTimeline(userId: String, limit: Int = 50) async throws -> [TimelineItem] {
        let rows: [MomentRow] = try await requireSupabase().from("spiritual_moments")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value
        
        let formatter = ISO8601DateFormatter()
        
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
