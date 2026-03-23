import SwiftUI

// TODO: Fix AnalyticsService and StreakManager imports - temporarily stubbed
struct JourneyView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack {
            Text("Your Journey")
                .font(.title)
            Text("Spiritual growth tracking")
                .font(.subheadline)
        }
    }
}

#Preview {
    JourneyView()
        .environment(AppState.preview)
}
