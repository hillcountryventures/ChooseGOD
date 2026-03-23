import Foundation
import Supabase

/// Protocol for devotional audio service
protocol DevotionalAudioServiceProtocol {
    func fetchAllSeries() async throws -> [DevotionalSeries]
    func fetchEpisodes(forSeriesId: String) async throws -> [DevotionalDay]
}

/// Supabase-backed devotional audio service
final class DevotionalAudioService: DevotionalAudioServiceProtocol {
    static let shared = DevotionalAudioService()

    private init() {}

    // MARK: - Series

    func fetchAllSeries() async throws -> [DevotionalSeries] {
        let client = try SupabaseManager.shared.requireClient()
        return try await client
            .from("devotional_series")
            .select()
            .order("title")
            .execute()
            .value
    }

    // MARK: - Episodes

    func fetchEpisodes(forSeriesId seriesId: String) async throws -> [DevotionalDay] {
        let client = try SupabaseManager.shared.requireClient()
        // Call RPC that enforces premium gating at database level
        // audio_url is nullified for non-premium users on day > 1
        return try await client
            .rpc("get_devotional_episodes", params: ["p_series_id": seriesId])
            .execute()
            .value
    }
}

// MARK: - Mock Service (for Previews)

final class MockDevotionalAudioService: DevotionalAudioServiceProtocol {
    func fetchAllSeries() async throws -> [DevotionalSeries] {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return [
            DevotionalSeries(
                id: "series-1",
                slug: "overcoming-anxiety",
                title: "Overcoming Anxiety",
                description: "A 7-day journey to finding peace in God's promises",
                coverImageUrl: nil,
                totalDays: 7,
                topics: ["peace", "anxiety", "trust"],
                isSeasonal: false,
                seasonStartMonth: nil,
                seasonStartDay: nil,
                difficultyLevel: .beginner,
                createdAt: Date()
            ),
            DevotionalSeries(
                id: "series-2",
                slug: "daily-devotion",
                title: "Daily Devotion",
                description: "Start your day with Scripture and prayer",
                coverImageUrl: nil,
                totalDays: 10,
                topics: ["morning", "prayer", "scripture"],
                isSeasonal: false,
                seasonStartMonth: nil,
                seasonStartDay: nil,
                difficultyLevel: .beginner,
                createdAt: Date()
            )
        ]
    }

    func fetchEpisodes(forSeriesId seriesId: String) async throws -> [DevotionalDay] {
        try? await Task.sleep(nanoseconds: 200_000_000)
        return [
            DevotionalDay(
                id: "day-1",
                seriesId: seriesId,
                dayNumber: 1,
                title: "Casting Your Cares",
                scriptureRefs: [ScriptureRef(book: "1 Peter", chapter: 5, verseStart: 7)],
                contentPrompt: "Today we explore what it means to truly cast our anxieties on God.",
                reflectionQuestions: ["What worries are you holding onto today?", "How can you practice releasing control to God?"],
                prayerFocus: "Lord, help me to release my worries to You.",
                audioUrl: "https://example.com/devotional-1.mp3",
                createdAt: Date()
            ),
            DevotionalDay(
                id: "day-2",
                seriesId: seriesId,
                dayNumber: 2,
                title: "Be Still and Know",
                scriptureRefs: [ScriptureRef(book: "Psalm", chapter: 46, verseStart: 10)],
                contentPrompt: "Stillness is not inaction but trust in God's sovereignty.",
                reflectionQuestions: ["Where do you need to be still today?", "What would it look like to trust God more?"],
                prayerFocus: "Help me to find peace in your presence.",
                audioUrl: "https://example.com/devotional-2.mp3",
                createdAt: Date()
            ),
            DevotionalDay(
                id: "day-3",
                seriesId: seriesId,
                dayNumber: 3,
                title: "Fear Not",
                scriptureRefs: [ScriptureRef(book: "Isaiah", chapter: 41, verseStart: 10)],
                contentPrompt: "God's presence removes the grip of fear from our lives.",
                reflectionQuestions: ["What fear do you need to surrender?", "How does God's promise strengthen you?"],
                prayerFocus: "I choose to trust You more than my fears.",
                audioUrl: "https://example.com/devotional-3.mp3",
                createdAt: Date()
            )
        ]
    }
}
