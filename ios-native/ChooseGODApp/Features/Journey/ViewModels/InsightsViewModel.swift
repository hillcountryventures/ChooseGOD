import SwiftUI
import Observation

/// ViewModel for Journey Insights — aggregates spiritual growth analytics
@Observable
final class InsightsViewModel {
    
    // MARK: - Published State
    
    var spiritualHealth: SpiritualHealthScore = .empty
    var weeklyActivity: [DailyActivity] = []
    var topicsExplored: [TopicEngagement] = []
    var sentimentTrend: [SentimentDataPoint] = []
    var growthInsight: GrowthInsight?
    var aiSummary: AIGrowthSummary?
    var milestones: [Milestone] = []
    var timelineItems: [TimelineItem] = []
    var selectedPeriod: Period = .month
    
    var isLoading = false
    var isGeneratingInsight = false
    var error: String?
    
    // MARK: - Computed
    
    var achievedMilestones: [Milestone] { milestones.filter(\.achieved) }
    var upcomingMilestones: [Milestone] { milestones.filter { !$0.achieved }.sorted { $0.progress > $1.progress } }
    var nextMilestone: Milestone? { upcomingMilestones.first }
    
    var recentTimeline: [TimelineItem] { Array(timelineItems.prefix(20)) }
    
    enum Period: String, CaseIterable {
        case week = "This Week"
        case month = "This Month"
        case quarter = "3 Months"
        case year = "This Year"

        /// Database value for storing scores (matches migration 037)
        var databaseValue: String {
            switch self {
            case .week: return "week"
            case .month: return "month"
            case .quarter: return "quarter"
            case .year: return "year"
            }
        }
    }
    
    // MARK: - Topic Categories
    
    private static let topicCategories: [String: (emoji: String, keywords: [String], color: String)] = [
        "love-relationships": ("❤️", ["love", "relationship", "marriage", "dating", "family", "friend", "forgive"], "C9A962"),
        "anxiety-peace": ("😰", ["anxiety", "peace", "worry", "stress", "calm", "fear", "rest", "sleep"], "8B9A7D"),
        "purpose-calling": ("🎯", ["purpose", "calling", "career", "work", "mission", "meaning", "direction"], "8B7355"),
        "prayer-life": ("🙏", ["prayer", "pray", "intercession", "fasting", "devotion", "worship"], "E8D5A3"),
        "faith-doubt": ("💪", ["faith", "doubt", "believe", "trust", "hope", "question"], "6366F1"),
        "healing-restoration": ("💚", ["heal", "healing", "restoration", "recover", "pain", "hurt", "trauma"], "22C55E"),
    ]
    
    // MARK: - Load Data

    func loadAll(userId: String? = nil) async {
        isLoading = true
        error = nil

        guard let userId else {
            // Empty state for logged-out users
            milestones = Milestone.definitions
            isLoading = false
            return
        }

        async let insightsTask = SupabaseInsightsService.shared.fetchGrowthInsights(userId: userId, period: selectedPeriod)
        async let timelineTask = SupabaseInsightsService.shared.fetchTimeline(userId: userId, period: selectedPeriod, limit: 50)
        async let statsTask = SupabaseInsightsService.shared.fetchJourneyStats(userId: userId, period: selectedPeriod)

        let (fetchedInsights, fetchedTimeline, fetchedStats) = await (
            (try? insightsTask) ?? [],
            (try? timelineTask) ?? [],
            statsTask
        )

        // Growth insight
        growthInsight = fetchedInsights.first

        // Timeline
        timelineItems = fetchedTimeline

        // Weekly activity chart — derived from timeline
        weeklyActivity = buildWeeklyActivity(from: fetchedTimeline, period: selectedPeriod)

        // Sentiment trend — derive from journal items or flat if insufficient
        sentimentTrend = buildSentimentTrend(from: fetchedTimeline, period: selectedPeriod)

        // Topics — count moment types as engagement categories
        topicsExplored = buildTopicEngagement(from: fetchedTimeline)

        // Spiritual health score
        let streak = 0 // TODO: StreakManager.shared.currentStreak
        let chapters = UserDefaults.standard.integer(forKey: "chaptersReadTotal")
        var score = 0
        score += min(streak * 10, 40)                           // +10/day, max 40
        score += fetchedStats.prayerCount > 0 ? 20 : 0          // +20 if any prayers
        score += fetchedStats.journalCount > 0 ? 20 : 0         // +20 if any journals
        score += chapters > 5 ? 20 : 0                          // +20 if > 5 chapters

        // Parallel: fetch prior score AND save current score
        async let priorScore = SupabaseInsightsService.shared.fetchPriorPeriodScore(userId: userId, period: selectedPeriod)
        Task.detached(priority: .background) {
            let calendar = Calendar.current
            let periodStartDate: Date
            switch self.selectedPeriod {
            case .week:
                periodStartDate = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date())) ?? Date()
            case .month:
                periodStartDate = calendar.date(from: calendar.dateComponents([.year, .month], from: Date())) ?? Date()
            case .quarter:
                let m = (calendar.component(.month, from: Date()) - 1) / 3 * 3 + 1
                periodStartDate = calendar.date(from: DateComponents(year: calendar.component(.year, from: Date()), month: m)) ?? Date()
            case .year:
                periodStartDate = calendar.date(from: calendar.dateComponents([.year], from: Date())) ?? Date()
            }
            await SupabaseInsightsService.shared.saveHealthScore(
                userId: userId,
                score: min(score, 100),
                period: self.selectedPeriod.databaseValue,
                periodStart: periodStartDate
            )
        }

        let prior = await priorScore
        let change: Double? = {
            if let prior, prior > 0 {
                let raw = (Double(score) - prior) / prior * 100
                // Round to 1 decimal place
                return (raw * 10).rounded() / 10
            } else {
                return nil
            }
        }()

        spiritualHealth = SpiritualHealthScore(
            score: min(score, 100),
            change: change,
            prayerDays: fetchedStats.prayerCount,
            versesRead: chapters * 26,
            stepsCompleted: fetchedStats.devotionalDaysCount,
            message: score > 60 ? "You're growing steadily. Keep it up!" : "Start reading and praying to see your insights grow."
        )

        // Milestones with real progress
        let verses = chapters * 26
        milestones = Milestone.definitions.map { m in
            var updated = m
            switch m.type {
            case .streak:          updated.current = streak
            case .verseCount:      updated.current = verses
            case .prayerCount:     updated.current = fetchedStats.prayerCount
            case .answeredPrayer:  updated.current = fetchedStats.answeredPrayerCount
            case .journalCount:    updated.current = fetchedStats.journalCount
            case .devotionalCount: updated.current = fetchedStats.devotionalDaysCount
            case .memoryVerse:     updated.current = fetchedStats.memoryVerseCount
            case .booksCompleted:  updated.current = chapters / 22  // ~22 chapters per book (rough)
            }
            updated.achieved = updated.current >= m.target
            if updated.achieved && updated.achievedAt == nil {
                updated.achievedAt = Date()
            }
            return updated
        }

        isLoading = false
    }

    func refresh(userId: String?) async {
        await loadAll(userId: userId)
    }
    
    // MARK: - Generate AI Insight

    func generateAIInsight(userId: String? = nil) async {
        isGeneratingInsight = true
        defer { isGeneratingInsight = false }

        guard let userId else { return }

        let topThemes = topicsExplored.prefix(3).map { $0.label }
        do {
            var summary = try await SupabaseInsightsService.shared.generateAIInsight(
                userId: userId,
                totalMoments: timelineItems.count,
                prayers: timelineItems.filter { $0.type == .prayer }.count,
                journals: timelineItems.filter { $0.type == .journal }.count,
                devotionals: timelineItems.filter { $0.type == .devotional }.count,
                topThemes: Array(topThemes)
            )
            summary.lastGeneratedAt = Date()
            aiSummary = summary
            saveInsightTimestamp(Date())
        } catch {
            // Fallback to empty/default
            aiSummary = AIGrowthSummary(
                summary: "Keep growing in your faith!",
                scriptureConnection: nil,
                growthPrediction: nil,
                encouragement: nil,
                lastGeneratedAt: Date()
            )
        }
    }

    private func saveInsightTimestamp(_ date: Date) {
        UserDefaults.standard.set(date, forKey: "aiInsightLastGeneratedAt")
    }

    func loadInsightTimestamp() {
        if let savedDate = UserDefaults.standard.object(forKey: "aiInsightLastGeneratedAt") as? Date {
            if aiSummary != nil {
                aiSummary?.lastGeneratedAt = savedDate
            }
        }
    }
    
    // MARK: - Private Helpers

    private func buildWeeklyActivity(from timeline: [TimelineItem], period: Period = .month) -> [DailyActivity] {
        let calendar = Calendar.current
        let dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        var dailyData: [String: (prayers: Int, moments: Int)] = [:]

        // Group timeline items by date
        for item in timeline {
            let dateStr = ISO8601DateFormatter().string(from: item.createdAt).prefix(10)
            if dailyData[String(dateStr)] == nil {
                dailyData[String(dateStr)] = (0, 0)
            }
            dailyData[String(dateStr)]!.moments += 1
            if item.type == .prayer || item.type == .answeredPrayer {
                dailyData[String(dateStr)]!.prayers += 5  // proxy: each prayer = ~5 min
            }
        }

        // Determine number of days based on period
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

        // Build activity view for the period
        return (0..<dayCount).reversed().map { daysAgo in
            let date = calendar.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
            let dateStr = String(ISO8601DateFormatter().string(from: date).prefix(10))
            let weekday = calendar.component(.weekday, from: date) - 1
            let data = dailyData[dateStr] ?? (0, 0)

            return DailyActivity(
                date: dateStr,
                dayLabel: dayLabels[weekday],
                prayerMinutes: data.prayers,
                momentCount: data.moments
            )
        }
    }

    private func buildSentimentTrend(from timeline: [TimelineItem], period: Period = .month) -> [SentimentDataPoint] {
        let calendar = Calendar.current

        // Group timeline items by date, compute sentiment proxy from content length
        var sentimentByDate: [String: Double] = [:]

        for item in timeline {
            let dateStr = String(ISO8601DateFormatter().string(from: item.createdAt).prefix(10))
            let contentLength = Double(item.content.count)
            let sentiment = min(max((contentLength / 100) - 0.5, -1), 1)  // rough proxy: longer = more thoughtful = more positive

            if sentimentByDate[dateStr] == nil {
                sentimentByDate[dateStr] = sentiment
            } else {
                sentimentByDate[dateStr] = (sentimentByDate[dateStr]! + sentiment) / 2
            }
        }

        // Determine number of days based on period
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

        // Build sentiment trend for the period
        let today = calendar.startOfDay(for: Date())
        return (0..<dayCount).map { daysAgo in
            let date = calendar.date(byAdding: .day, value: -daysAgo, to: today) ?? Date()
            let dateStr = String(ISO8601DateFormatter().string(from: date).prefix(10))
            let score = sentimentByDate[dateStr] ?? 0.0

            return SentimentDataPoint(date: date, score: score, label: "")
        }.reversed()
    }

    private func buildTopicEngagement(from timeline: [TimelineItem]) -> [TopicEngagement] {
        var topicCounts: [String: Int] = [:]

        // Count mentions by analyzing themes
        for item in timeline {
            for theme in item.themes {
                topicCounts[theme, default: 0] += 1
            }
        }

        // Map to known topics
        var engagements: [TopicEngagement] = []
        let totalMentions = topicCounts.values.reduce(0, +)

        for (key, (emoji, _, color)) in Self.topicCategories {
            let count = topicCounts[key] ?? 0
            let percentage = totalMentions > 0 ? Double(count) / Double(totalMentions) * 100 : 0

            engagements.append(TopicEngagement(
                id: key,
                emoji: emoji,
                label: key.replacingOccurrences(of: "-", with: " ").capitalized,
                chatCount: count,
                percentage: percentage,
                color: color
            ))
        }

        return engagements.sorted { $0.chatCount > $1.chatCount }
    }
}
