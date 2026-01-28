import Foundation

// MARK: - Growth Insight

struct GrowthInsight: Identifiable, Codable {
    let id: String
    let userId: String
    let periodStart: Date
    let periodEnd: Date
    let insightType: InsightType
    let title: String
    let narrative: String
    let keyMoments: [String]
    let themesGrowth: [String: Int]
    let createdAt: Date
    
    enum InsightType: String, Codable {
        case weekly, monthly, quarterly, yearly, theme
    }
}

// MARK: - AI Growth Summary

struct AIGrowthSummary: Codable {
    let summary: String
    let scriptureConnection: String?
    let growthPrediction: String?
    let encouragement: String?
}

// MARK: - Milestone

struct Milestone: Identifiable {
    let id: String
    let type: MilestoneType
    let title: String
    let description: String
    let icon: String
    let emoji: String
    let scripture: String
    let scriptureRef: String
    let target: Int
    var current: Int
    var achieved: Bool
    var achievedAt: Date?
    
    var progress: Double {
        min(Double(current) / Double(target), 1.0)
    }
    
    enum MilestoneType: String, CaseIterable {
        case streak
        case verseCount = "verse_count"
        case prayerCount = "prayer_count"
        case journalCount = "journal_count"
        case devotionalCount = "devotional_count"
        case booksCompleted = "books_completed"
        case answeredPrayer = "answered_prayer"
        case memoryVerse = "memory_verse"
    }
}

// MARK: - Milestone Definitions

extension Milestone {
    static let definitions: [Milestone] = [
        // Streaks
        Milestone(id: "streak-7", type: .streak, title: "7-Day Streak", description: "A week of faithfulness",
                  icon: "flame.fill", emoji: "🔥", scripture: "On the seventh day God finished his work.", scriptureRef: "Genesis 2:2",
                  target: 7, current: 0, achieved: false),
        Milestone(id: "streak-30", type: .streak, title: "30-Day Streak", description: "A month of devotion",
                  icon: "trophy.fill", emoji: "🏆", scripture: "Daniel got down on his knees three times a day and prayed.", scriptureRef: "Daniel 6:10",
                  target: 30, current: 0, achieved: false),
        Milestone(id: "streak-100", type: .streak, title: "100-Day Faithfulness", description: "Enduring commitment",
                  icon: "medal.fill", emoji: "🎖️", scripture: "Let us run with endurance the race set before us.", scriptureRef: "Hebrews 12:1",
                  target: 100, current: 0, achieved: false),
        Milestone(id: "streak-365", type: .streak, title: "Year of Devotion", description: "365 days with God",
                  icon: "crown.fill", emoji: "👑", scripture: "Be faithful unto death, and I will give you the crown of life.", scriptureRef: "Revelation 2:10",
                  target: 365, current: 0, achieved: false),
        
        // Verses
        Milestone(id: "verse-10", type: .verseCount, title: "10 Verses", description: "Hiding God's Word in your heart",
                  icon: "bookmark.fill", emoji: "📖", scripture: "I have stored up your word in my heart.", scriptureRef: "Psalm 119:11",
                  target: 10, current: 0, achieved: false),
        Milestone(id: "verse-50", type: .verseCount, title: "50 Verses", description: "Building on the Word",
                  icon: "book.fill", emoji: "📚", scripture: "Your word is a lamp to my feet.", scriptureRef: "Psalm 119:105",
                  target: 50, current: 0, achieved: false),
        Milestone(id: "verse-100", type: .verseCount, title: "100 Verses", description: "Scripture scholar",
                  icon: "graduationcap.fill", emoji: "🎓", scripture: "All Scripture is breathed out by God.", scriptureRef: "2 Timothy 3:16",
                  target: 100, current: 0, achieved: false),
        
        // Prayers
        Milestone(id: "prayer-10", type: .prayerCount, title: "Faithful Intercessor", description: "10 prayers offered",
                  icon: "hands.sparkles.fill", emoji: "🙏", scripture: "The prayer of a righteous person is powerful.", scriptureRef: "James 5:16",
                  target: 10, current: 0, achieved: false),
        Milestone(id: "prayer-50", type: .prayerCount, title: "50 Prayers", description: "Persistent in prayer",
                  icon: "heart.circle.fill", emoji: "💜", scripture: "Pray without ceasing.", scriptureRef: "1 Thessalonians 5:17",
                  target: 50, current: 0, achieved: false),
        
        // Answered prayers
        Milestone(id: "answered-1", type: .answeredPrayer, title: "First Answer", description: "God hears your prayers",
                  icon: "checkmark.seal.fill", emoji: "✅", scripture: "Ask, and it will be given to you.", scriptureRef: "Matthew 7:7",
                  target: 1, current: 0, achieved: false),
        Milestone(id: "answered-10", type: .answeredPrayer, title: "10 Answered", description: "A journal of faithfulness",
                  icon: "star.fill", emoji: "⭐", scripture: "The Lord has done great things for us.", scriptureRef: "Psalm 126:3",
                  target: 10, current: 0, achieved: false),
        
        // Books completed
        Milestone(id: "books-1", type: .booksCompleted, title: "First Book", description: "Completed a Bible book",
                  icon: "book.closed.fill", emoji: "📕", scripture: "Blessed is the one who reads.", scriptureRef: "Revelation 1:3",
                  target: 1, current: 0, achieved: false),
        Milestone(id: "books-5", type: .booksCompleted, title: "5 Books", description: "Growing in knowledge",
                  icon: "books.vertical.fill", emoji: "📚", scripture: "Study to show yourself approved.", scriptureRef: "2 Timothy 2:15",
                  target: 5, current: 0, achieved: false),
        
        // Memory verses mastered
        Milestone(id: "memory-5", type: .memoryVerse, title: "5 Memorized", description: "Verses hidden in heart",
                  icon: "brain.head.profile", emoji: "🧠", scripture: "I have stored up your word in my heart.", scriptureRef: "Psalm 119:11",
                  target: 5, current: 0, achieved: false),
        Milestone(id: "memory-25", type: .memoryVerse, title: "25 Memorized", description: "Walking Scripture library",
                  icon: "sparkles", emoji: "✨", scripture: "Let the word of Christ dwell in you richly.", scriptureRef: "Colossians 3:16",
                  target: 25, current: 0, achieved: false),
        
        // Journals
        Milestone(id: "journal-10", type: .journalCount, title: "10 Reflections", description: "Documenting your journey",
                  icon: "pencil.line", emoji: "📝", scripture: "Remember the days of old.", scriptureRef: "Deuteronomy 32:7",
                  target: 10, current: 0, achieved: false),
        Milestone(id: "journal-50", type: .journalCount, title: "50 Entries", description: "A testimony of faithfulness",
                  icon: "text.book.closed.fill", emoji: "📓", scripture: "Write this as a memorial in a book.", scriptureRef: "Exodus 17:14",
                  target: 50, current: 0, achieved: false),
        
        // Devotionals
        Milestone(id: "devotional-10", type: .devotionalCount, title: "Morning Seeker", description: "10 devotionals completed",
                  icon: "sunrise.fill", emoji: "🌅", scripture: "Seek first the kingdom of God.", scriptureRef: "Matthew 6:33",
                  target: 10, current: 0, achieved: false),
        Milestone(id: "devotional-30", type: .devotionalCount, title: "30 Devotionals", description: "A month of morning mercies",
                  icon: "sun.max.fill", emoji: "☀️", scripture: "His mercies are new every morning.", scriptureRef: "Lamentations 3:23",
                  target: 30, current: 0, achieved: false),
    ]
}

// MARK: - Timeline Item

struct TimelineItem: Identifiable {
    let id: String
    let type: TimelineItemType
    let title: String
    let content: String
    let icon: String
    let color: String
    let linkedVerses: [String]
    let themes: [String]
    let createdAt: Date
    
    enum TimelineItemType: String, Codable {
        case journal, prayer, devotional, gratitude, confession
        case memoryPractice = "memory_practice"
        case obedienceStep = "obedience_step"
        case answeredPrayer = "answered_prayer"
        case memoryMilestone = "memory_milestone"
        case lectio, examen
        
        var displayIcon: String {
            switch self {
            case .journal: return "pencil.line"
            case .prayer: return "hands.sparkles.fill"
            case .devotional: return "sun.max.fill"
            case .gratitude: return "heart.fill"
            case .confession: return "person.crop.circle.badge.checkmark"
            case .memoryPractice: return "brain.head.profile"
            case .obedienceStep: return "figure.walk"
            case .answeredPrayer: return "checkmark.seal.fill"
            case .memoryMilestone: return "star.fill"
            case .lectio: return "book.fill"
            case .examen: return "moon.stars.fill"
            }
        }
        
        var displayColor: String {
            switch self {
            case .journal: return "22C55E"
            case .prayer: return "A78BFA"
            case .devotional: return "F59E0B"
            case .gratitude: return "EC4899"
            case .confession: return "6366F1"
            case .memoryPractice: return "3B82F6"
            case .obedienceStep: return "8B5CF6"
            case .answeredPrayer: return "22C55E"
            case .memoryMilestone: return "F59E0B"
            case .lectio: return "6366F1"
            case .examen: return "8B5CF6"
            }
        }
        
        var displayLabel: String {
            switch self {
            case .journal: return "Journal"
            case .prayer: return "Prayer"
            case .devotional: return "Devotional"
            case .gratitude: return "Gratitude"
            case .confession: return "Confession"
            case .memoryPractice: return "Memory Practice"
            case .obedienceStep: return "Step of Faith"
            case .answeredPrayer: return "Answered Prayer"
            case .memoryMilestone: return "Milestone"
            case .lectio: return "Lectio Divina"
            case .examen: return "Examen"
            }
        }
    }
}

// MARK: - Spiritual Health Score

struct SpiritualHealthScore {
    let score: Int // 0-100
    let change: Int // percentage change
    let prayerDays: Int
    let versesRead: Int
    let stepsCompleted: Int
    let message: String
    
    static let empty = SpiritualHealthScore(score: 0, change: 0, prayerDays: 0, versesRead: 0, stepsCompleted: 0, message: "Start your journey with God today.")
}

// MARK: - Topic Engagement

struct TopicEngagement: Identifiable {
    let id: String
    let emoji: String
    let label: String
    let chatCount: Int
    let percentage: Double
    let color: String
}

// MARK: - Daily Activity

struct DailyActivity: Identifiable {
    var id: String { date }
    let date: String
    let dayLabel: String
    let prayerMinutes: Int
    let momentCount: Int
}

// MARK: - Sentiment Data Point

struct SentimentDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let score: Double // -1.0 to 1.0
    let label: String
}
