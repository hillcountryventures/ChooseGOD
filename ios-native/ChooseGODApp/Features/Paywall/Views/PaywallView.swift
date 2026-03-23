import SwiftUI

struct PaywallView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                VStack(spacing: 20) {
                    HStack {
                        Text("Choose Your Plan")
                            .font(.title2)
                            .bold()
                        Spacer()
                        Button("Close") { dismiss() }
                    }
                    .padding()

                    ScrollView {
                        VStack(spacing: 16) {
                            Text("Unlock unlimited AI conversations")
                                .font(.headline)
                                .foregroundStyle(Theme.Colors.text)
                                .padding()

                            Text("Premium plans available")
                                .font(.subheadline)
                                .foregroundStyle(Theme.Colors.secondaryText)

                            Spacer()
                        }
                        .padding()
                    }

                    Button("Subscribe") { dismiss() }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Theme.Colors.primary)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                        .padding()
                }
            }
        }
    }
}

#Preview {
    PaywallView()
        .environment(AppState.preview)
}
