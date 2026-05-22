import Foundation
import Observation

/// Loads the unified "your walk" history feed for the Journey → Timeline tab.
/// Merges the user's journal entries (`spiritual_moments`) + prayers
/// (`prayer_requests`, active + answered) into one chronological `TimelineItem`
/// list that drives the existing filter bar (All / Prayer / Journal /
/// Devotional / Gratitude / Answered).
///
/// Replaces the old "dumb" `TimelineView(items:)` that was fed sample data and
/// called with no arguments (a compile error).
@Observable
final class TimelineViewModel {

    private(set) var items: [TimelineItem] = []
    private(set) var isLoading = false
    private(set) var hasLoaded = false

    private let journalService: JournalServiceProtocol
    private let prayerService: PrayerServiceProtocol

    init(
        journalService: JournalServiceProtocol = SupabaseJournalService(),
        prayerService: PrayerServiceProtocol = SupabasePrayerService()
    ) {
        self.journalService = journalService
        self.prayerService = prayerService
    }

    @MainActor
    func load(userId: String) async {
        isLoading = true
        defer { isLoading = false; hasLoaded = true }

        async let momentsTask = (try? await journalService.getMoments(userId: userId, type: nil, limit: 100, offset: 0)) ?? []
        async let prayersTask = (try? await prayerService.getPrayers(userId: userId, status: nil)) ?? []

        let moments = await momentsTask
        let prayers = await prayersTask

        var mapped: [TimelineItem] = []
        mapped.append(contentsOf: moments.map(Self.map(moment:)))
        mapped.append(contentsOf: prayers.map(Self.map(prayer:)))

        items = mapped.sorted { $0.createdAt > $1.createdAt }
    }

    // MARK: - Mapping

    private static func map(moment: SpiritualMoment) -> TimelineItem {
        let type = mapMomentType(moment.momentType)
        return TimelineItem(
            id: moment.id,
            type: type,
            title: type.displayLabel,
            content: moment.content,
            icon: type.displayIcon,
            color: type.displayColor,
            linkedVerses: moment.linkedVerses.map { $0.reference },
            themes: moment.themes,
            createdAt: moment.createdAt
        )
    }

    private static func map(prayer: PrayerRequest) -> TimelineItem {
        let answered = prayer.status == .answered
        let type: TimelineItem.TimelineItemType = answered ? .answeredPrayer : .prayer
        // For an answered prayer, lead with the testimony if present so the
        // faithfulness log reads as "what God did."
        let content: String = {
            if answered, let reflection = prayer.answeredReflection, !reflection.isEmpty {
                return "\(prayer.request)\n\n✅ \(reflection)"
            }
            return prayer.request
        }()
        return TimelineItem(
            id: prayer.id,
            type: type,
            title: type.displayLabel,
            content: content,
            icon: type.displayIcon,
            color: type.displayColor,
            linkedVerses: prayer.scriptureAnchor.map { [$0.reference] } ?? [],
            themes: [],
            createdAt: answered ? (prayer.answeredAt ?? prayer.createdAt) : prayer.createdAt
        )
    }

    private static func mapMomentType(_ t: MomentType) -> TimelineItem.TimelineItemType {
        switch t {
        case .journal:         return .journal
        case .prayer:          return .prayer
        case .devotional:      return .devotional
        case .gratitude:       return .gratitude
        case .confession:      return .confession
        case .memoryPractice:  return .memoryPractice
        case .obedienceStep:   return .obedienceStep
        case .lectio:          return .lectio
        case .examen:          return .examen
        case .answeredPrayer:  return .answeredPrayer
        }
    }
}
