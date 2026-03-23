import SwiftUI
import Observation

// TODO: Fix AnalyticsService import - temporarily stubbed
@Observable
final class JournalViewModel {
    var moments: [SpiritualMoment] = []
    var isLoading = false
    var errorMessage: String?

    func fetchEntries() async {
        // Placeholder
    }
}
