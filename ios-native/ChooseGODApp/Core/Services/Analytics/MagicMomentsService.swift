import Foundation

/// Strategy Decision #15 — the 14-day "magic moments" funnel that the PMF
/// dashboard (Decision #20) reads from. Each moment fires once at a specific
/// trigger; the user's first-activity date determines which day-bucket they're
/// in. Wraps `AnalyticsService.shared.capture()` so all events flow into the
/// same PostHog stream as everything else in the app.
///
/// Event names match the React Native `src/services/magicMoments.ts` 1:1 so
/// the PMF dashboard's existing queries work for both platforms during the
/// migration window.
@Observable
final class MagicMomentsService {

    static let shared = MagicMomentsService()

    private init() {}

    // MARK: - Event names

    enum Moment: String {
        // Day 0 — onboarding
        case day0_grace_demo_revealed
        case day0_grace_demo_seen
        case day0_tradition_selected

        // Day 1 — first day post-install
        case day1_first_chat_sent
        case day1_tool_confirmation

        // Day 2-3 — depth surfacing
        case day23_strongs_reveal
        case day23_camera_ocr_opened
        case day23_camera_ocr_completed

        // Day 4-6 — Grace Mode in the wild
        case day46_grace_mode_triggered
        case day46_grace_mode_completed

        // Day 7 — Sunday Digest
        case day7_sunday_digest_sent
        case day7_sunday_digest_opened

        // Day 8-10 — earned invitations
        case day810_memory_introduced
        case day810_memory_session_completed
        case day810_lectio_introduced
        case day810_lectio_completed

        // Day 11-12 — celebration
        case day1112_answered_prayer_prompt
        case day1112_celebration_shown

        // Day 13 — gentle trial warning
        case day13_trial_warning_shown

        // Day 14 — conversion moment
        case day14_conversion_paywall_shown
        case day14_converted
        case day14_stayed_free
    }

    // MARK: - Capture

    /// Fire a magic moment. Caller can pass extra properties; the service
    /// auto-attaches `day_bucket` (0/1/23/46/7/810/1112/13/14) so PMF queries
    /// can group without parsing event names.
    func capture(_ moment: Moment, properties: [String: Any]? = nil) {
        var payload: [String: Any] = properties ?? [:]
        payload["day_bucket"] = moment.dayBucket
        payload["magic_moment"] = true
        AnalyticsService.shared.capture(moment.rawValue, properties: payload)
    }

    // MARK: - Day-bucket helper

    /// 0-indexed bucket. Useful for PMF cohort queries.
    func currentDayBucket(firstActivityDate: Date?) -> Int {
        guard let first = firstActivityDate else { return 0 }
        let days = Calendar.current.dateComponents([.day], from: first, to: Date()).day ?? 0
        switch days {
        case 0: return 0
        case 1: return 1
        case 2...3: return 23
        case 4...6: return 46
        case 7: return 7
        case 8...10: return 810
        case 11...12: return 1112
        case 13: return 13
        case 14: return 14
        default: return -1
        }
    }
}

private extension MagicMomentsService.Moment {
    var dayBucket: Int {
        switch self {
        case .day0_grace_demo_revealed, .day0_grace_demo_seen, .day0_tradition_selected:
            return 0
        case .day1_first_chat_sent, .day1_tool_confirmation:
            return 1
        case .day23_strongs_reveal, .day23_camera_ocr_opened, .day23_camera_ocr_completed:
            return 23
        case .day46_grace_mode_triggered, .day46_grace_mode_completed:
            return 46
        case .day7_sunday_digest_sent, .day7_sunday_digest_opened:
            return 7
        case .day810_memory_introduced, .day810_memory_session_completed,
             .day810_lectio_introduced, .day810_lectio_completed:
            return 810
        case .day1112_answered_prayer_prompt, .day1112_celebration_shown:
            return 1112
        case .day13_trial_warning_shown:
            return 13
        case .day14_conversion_paywall_shown, .day14_converted, .day14_stayed_free:
            return 14
        }
    }
}
