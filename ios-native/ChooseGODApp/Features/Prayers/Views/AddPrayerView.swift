import SwiftUI

/// Create a personal prayer request. Real implementation (replaces the prior
/// stub that just dismissed). Saves via PrayerViewModel → SupabasePrayerService.
struct AddPrayerView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @ObservedObject var viewModel: PrayerViewModel

    @State private var content: String = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("What's on your heart?")
                            .font(.title3)
                            .bold()
                            .foregroundStyle(Theme.Colors.text)
                        Text("Name it. You'll be able to mark it answered when God moves.")
                            .font(.subheadline)
                            .foregroundStyle(Theme.Colors.secondaryText)

                        ZStack(alignment: .topLeading) {
                            TextEditor(text: $content)
                                .font(.body)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 180)
                                .padding(10)
                                .background(Theme.Colors.surface)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            if content.isEmpty {
                                Text("Lord, I'm praying for…")
                                    .font(.body)
                                    .foregroundStyle(Theme.Colors.secondaryText)
                                    .padding(16)
                                    .allowsHitTesting(false)
                            }
                        }
                    }
                    .padding(20)
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle("New Prayer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { Task { await save() } } label: {
                        if isSaving { ProgressView() } else { Text("Save").bold() }
                    }
                    .disabled(content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSaving)
                }
            }
            .alert("Couldn't save", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: { Text(errorMessage ?? "") }
        }
    }

    @MainActor
    private func save() async {
        guard let userId = appState.currentUser?.id else {
            errorMessage = "You need to be signed in."
            return
        }
        let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        isSaving = true
        defer { isSaving = false }
        do {
            try await viewModel.addPrayer(request: trimmed, scriptureAnchor: nil, userId: userId)
            // A new prayer is fresh moat context.
            UserContextService.shared.invalidate()
            AnalyticsService.shared.capture("prayer_added")
            dismiss()
        } catch {
            errorMessage = "Couldn't save your prayer. Try again."
        }
    }
}

#Preview {
    AddPrayerView(viewModel: PrayerViewModel())
        .environment(AppState.preview)
}
