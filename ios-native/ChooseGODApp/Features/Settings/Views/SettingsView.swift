import SwiftUI

/// Settings screen with preferences and account management
struct SettingsView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                VStack(spacing: 20) {
                    HStack {
                        Text("Settings")
                            .font(.title2)
                            .bold()
                        Spacer()
                        Button("Done") { dismiss() }
                    }
                    .padding()

                    List {
                        Section("Account") {
                            Text("Account Settings")
                                .foregroundStyle(Theme.Colors.secondaryText)
                        }

                        Section("Support") {
                            Text("Help & Support")
                                .foregroundStyle(Theme.Colors.secondaryText)
                        }

                        Section("About") {
                            Text("Version 1.0.0")
                                .foregroundStyle(Theme.Colors.secondaryText)
                        }
                    }
                }
            }
        }
    }
}

#Preview {
    SettingsView()
        .environment(AppState.preview)
}
