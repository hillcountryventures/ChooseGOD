import SwiftUI
import StoreKit

/// Main home screen with daily verse and quick actions
struct HomeView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        HStack {
                            Text("ChooseGOD")
                                .font(.title)
                                .bold()
                            Spacer()
                        }
                        .padding()

                        // Daily Verse Card
                        VStack(spacing: 12) {
                            Text("Today's Verse")
                                .font(.headline)
                                .foregroundStyle(Theme.Colors.text)

                            Text("\"For God so loved the world...\" — John 3:16")
                                .font(.body)
                                .foregroundStyle(Theme.Colors.secondaryText)
                                .padding()
                                .background(Theme.Colors.surface)
                                .cornerRadius(12)
                        }
                        .padding()

                        // Quick Actions
                        VStack(spacing: 12) {
                            Button("Read Bible") { }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Theme.Colors.primary)
                                .foregroundStyle(.white)
                                .cornerRadius(12)

                            Button("Journal") { }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Theme.Colors.surface)
                                .foregroundStyle(Theme.Colors.text)
                                .cornerRadius(12)
                        }
                        .padding()

                        Spacer()
                    }
                }
            }
        }
    }
}

#Preview {
    HomeView()
        .environment(AppState.preview)
}
