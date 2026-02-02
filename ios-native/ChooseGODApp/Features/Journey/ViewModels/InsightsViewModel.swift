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
    
    func loadAll() async {
        isLoading = true
        error = nil
        
        // For now, use computed sample data that mirrors the RN logic
        // In production, this would call SupabaseInsightsService
        await computeSampleData()
        computeMilestones()
        computeTimeline()
        
        isLoading = false
    }
    
    func refresh() async {
        await loadAll()
    }
    
    // MARK: - Generate AI Insight
    
    func generateAIInsight() async {
        isGeneratingInsight = true
        defer { isGeneratingInsight = false }
        
        // In production: call SupabaseInsightsService.shared.generateAIInsight(...)
        // For now, use a local computed insight
        aiSummary = AIGrowthSummary(
            summary: "Your prayer life has deepened significantly this month. You've been consistently showing up, and your journal entries reflect growing trust in God's timing.",
            scriptureConnection: "Philippians 4:6-7 — \"Do not be anxious about anything, but in everything by prayer and petition, with thanksgiving, present your requests to God.\"",
            growthPrediction: "At your current pace, you'll hit your 30-day streak milestone by next week. Your focus on anxiety & peace themes suggests a season of spiritual breakthrough.",
            encouragement: "God sees every quiet moment you spend with Him. Keep pressing in — the fruit is already growing."
        )
    }
    
    // MARK: - Private Computation
    
    private func computeSampleData() async {
        // Weekly activity
        let calendar = Calendar.current
        let dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        weeklyActivity = (0..<7).reversed().map { daysAgo in
            let date = calendar.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
            let dateStr = ISO8601DateFormatter().string(from: date).prefix(10)
            let weekday = calendar.component(.weekday, from: date) - 1
            return DailyActivity(
                date: String(dateStr),
                dayLabel: dayLabels[weekday],
                prayerMinutes: Int.random(in: 0...25),
                momentCount: Int.random(in: 0...5)
            )
        }
        
        // Topics
        topicsExplored = [
            TopicEngagement(id: "anxiety-peace", emoji: "😰", label: "Anxiety & Peace", chatCount: 12, percentage: 35, color: "8B9A7D"),
            TopicEngagement(id: "prayer-life", emoji: "🙏", label: "Prayer Life", chatCount: 8, percentage: 24, color: "E8D5A3"),
            TopicEngagement(id: "love-relationships", emoji: "❤️", label: "Love & Relationships", chatCount: 6, percentage: 18, color: "C9A962"),
            TopicEngagement(id: "faith-doubt", emoji: "💪", label: "Faith & Doubt", chatCount: 5, percentage: 15, color: "6366F1"),
            TopicEngagement(id: "purpose-calling", emoji: "🎯", label: "Purpose & Calling", chatCount: 3, percentage: 8, color: "8B7355"),
        ]
        
        // Sentiment trend
        sentimentTrend = (0..<30).map { daysAgo in
            let date = calendar.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
            let score = 0.3 + Double.random(in: -0.3...0.4) + Double(30 - daysAgo) * 0.01 // slight upward trend
            return SentimentDataPoint(date: date, score: min(max(score, -1), 1), label: "")
        }.reversed().map { $0 }
        
        // Health score
        spiritualHealth = SpiritualHealthScore(
            score: 72,
            change: 8,
            prayerDays: 18,
            versesRead: 247,
            stepsCompleted: 5,
            message: "You're growing beautifully! Your prayer consistency and Scripture engagement have improved significantly this month."
        )
        
        // Growth insight
        growthInsight = GrowthInsight(
            id: "insight-1",
            userId: "",
            periodStart: calendar.date(byAdding: .day, value: -30, to: Date()) ?? Date(),
            periodEnd: Date(),
            insightType: .monthly,
            title: "Monthly Growth Summary",
            narrative: "You've been exploring anxiety & peace topics more frequently, suggesting intentional seeking of God's guidance in this area.",
            keyMoments: ["Started prayer journal", "Memorized Philippians 4:6", "30-day reading streak"],
            themesGrowth: ["anxiety-peace": 35, "prayer-life": 24, "love-relationships": 18],
            createdAt: Date()
        )
    }
    
    private func computeMilestones() {
        // Sample stats — in production, computed from real data
        let stats: [Milestone.MilestoneType: Int] = [
            .streak: 14,
            .verseCount: 62,
            .prayerCount: 23,
            .journalCount: 15,
            .devotionalCount: 18,
            .booksCompleted: 2,
            .answeredPrayer: 3,
            .memoryVerse: 8,
        ]
        
        milestones = Milestone.definitions.map { def in
            var m = def
            m.current = stats[def.type] ?? 0
            m.achieved = m.current >= m.target
            if m.achieved {
                m.achievedAt = Calendar.current.date(byAdding: .day, value: -Int.random(in: 1...30), to: Date())
            }
            return m
        }
    }
    
    private func computeTimeline() {
        let calendar = Calendar.current
        let types: [TimelineItem.TimelineItemType] = [.devotional, .prayer, .journal, .gratitude, .memoryPractice, .answeredPrayer]
        let sampleContent = [
            "Spent time meditating on Psalm 23 and its promises of provision.",
            "Lord, give me wisdom for the decisions ahead. I trust Your plan.",
            "Reflected on how God has been faithful through this season of waiting.",
            "Grateful for the peace that passes understanding, even amid uncertainty.",
            "Practiced memorizing Philippians 4:13 — I can do all things through Christ.",
            "God answered my prayer about the job interview! His timing is perfect.",
            "Read through Romans 8 and was struck by 'nothing can separate us from God's love.'",
            "Journaled about surrender and what it means to truly let go and let God.",
        ]
        
        timelineItems = (0..<20).map { i in
            let type = types[i % types.count]
            let date = calendar.date(byAdding: .hour, value: -i * Int.random(in: 4...12), to: Date()) ?? Date()
            return TimelineItem(
                id: "timeline-\(i)",
                type: type,
                title: type.displayLabel,
                content: sampleContent[i % sampleContent.count],
                icon: type.displayIcon,
                color: type.displayColor,
                linkedVerses: i % 3 == 0 ? ["Philippians 4:6-7"] : [],
                themes: i % 2 == 0 ? ["peace", "trust"] : ["prayer"],
                createdAt: date
            )
        }
    }
}
