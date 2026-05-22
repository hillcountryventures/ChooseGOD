import Foundation
import Supabase

/// Strategy Decision #2 — the hero mechanic.
/// Detects when a user has fallen 2+ days behind on their primary devotional
/// enrollment and orchestrates a "grace catch-up" by calling the
/// `grace-path-summary` edge function. The result is rendered by
/// GraceSummaryModal on Home.
@Observable
final class GraceModeService {

    static let shared = GraceModeService()

    static let missedDayThreshold: Int = 2

    private let devotionalService: DevotionalServiceProtocol = SupabaseDevotionalService()

    private init() {}

    // MARK: - Detection

    /// What the Home screen needs to decide whether to surface the catch-up
    /// modal. Returns nil when there's nothing to catch up on.
    /// `Identifiable` is on the enrollment ID so SwiftUI's `.sheet(item:)`
    /// can drive presentation directly off this value.
    struct CatchUpEligibility: Identifiable {
        let enrollment: UserSeriesEnrollment
        let missedDays: [DevotionalDay]
        var id: String { enrollment.id }
    }

    func detectMissedDays(userId: String) async -> CatchUpEligibility? {
        guard let enrollment = try? await devotionalService.getPrimaryEnrollment(userId: userId) else {
            return nil
        }

        // Days the user *should* have completed by now.
        let target = enrollment.currentDay
        guard target > 0 else { return nil }

        let completed = Set(enrollment.completedDays)
        let missedNumbers = (1...target).filter { !completed.contains($0) }

        guard missedNumbers.count >= Self.missedDayThreshold else { return nil }

        // Hydrate the DevotionalDay records so we can pass real titles +
        // scripture refs to the edge function.
        guard let allDays = try? await devotionalService.getDaysForSeries(seriesId: enrollment.seriesId) else {
            return nil
        }
        let dayMap = Dictionary(uniqueKeysWithValues: allDays.map { ($0.dayNumber, $0) })
        let missedDays = missedNumbers.compactMap { dayMap[$0] }

        guard missedDays.count >= Self.missedDayThreshold else { return nil }

        return CatchUpEligibility(enrollment: enrollment, missedDays: missedDays)
    }

    // MARK: - Edge function call

    /// Request the catch-up summary. The edge function returns a single
    /// rich-text summary spanning all missed days.
    func requestCatchUp(
        userId: String,
        eligibility: CatchUpEligibility,
        preferredTranslation: String = "KJV"
    ) async throws -> GracePathResponse {
        let supabase = try SupabaseManager.shared.requireClient()

        let missedSections: [GracePathRequest.MissedSection] = eligibility.missedDays.map { day in
            GracePathRequest.MissedSection(
                dayNumber: day.dayNumber,
                displayTitle: day.title,
                versesJson: day.scriptureRefs.map { ref in
                    GracePathRequest.MissedSection.Verse(
                        book: ref.book,
                        startChapter: ref.chapter,
                        endChapter: ref.chapter
                    )
                }
            )
        }

        let body = GracePathRequest(
            userId: userId,
            progressId: eligibility.enrollment.id,
            missedSections: missedSections,
            preferredTranslation: preferredTranslation
        )

        let response: GracePathResponse = try await supabase.functions.invoke(
            "grace-path-summary",
            options: .init(body: body)
        )
        return response
    }

    /// After the user accepts the catch-up, mark the missed days as completed
    /// so the streak ledger and progress percentage reflect reality. Pro users
    /// get this for free (covered by the un-paywalled grace mechanic, Decision #8).
    func acknowledgeCatchUp(
        eligibility: CatchUpEligibility
    ) async {
        for day in eligibility.missedDays {
            try? await devotionalService.completeDay(
                enrollmentId: eligibility.enrollment.id,
                dayNumber: day.dayNumber
            )
        }
    }
}

// MARK: - Wire types matching the edge function shape

struct GracePathRequest: Encodable {
    let userId: String
    let progressId: String
    let missedSections: [MissedSection]
    let preferredTranslation: String

    struct MissedSection: Encodable {
        let dayNumber: Int
        let displayTitle: String
        let versesJson: [Verse]

        struct Verse: Encodable {
            let book: String
            let startChapter: Int
            let endChapter: Int
        }
    }
}

struct GracePathResponse: Decodable {
    /// Rich markdown-ish summary text from the edge function.
    let summary: String
    /// Any verses surfaced by the catch-up generator, suitable for "tap to
    /// open in the Bible reader" follow-through.
    let highlightedVerses: [HighlightedVerse]?

    struct HighlightedVerse: Decodable {
        let reference: String
        let text: String?
    }
}
