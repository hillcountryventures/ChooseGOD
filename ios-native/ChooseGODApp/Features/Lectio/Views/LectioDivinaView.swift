import SwiftUI

/// Strategy Decision #6 — guided 4-step Lectio Divina practice.
/// Hosts the existing LectioStepView + LectioViewModel (both already built),
/// renders the verse passage at the top, paginates through the 4 steps with
/// timer + optional reflection input, and saves a SpiritualMoment on completion.
struct LectioDivinaView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @StateObject private var viewModel: LectioViewModel
    @State private var currentInput: String = ""
    @State private var isSaving: Bool = false

    private let journalService: JournalServiceProtocol = SupabaseJournalService()

    init(verseRef: String = "Psalm 46:10",
         verseText: String = "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.") {
        _viewModel = StateObject(wrappedValue: LectioViewModel(verseRef: verseRef, verseText: verseText))
    }

    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()

            if viewModel.isComplete {
                completionView
            } else {
                practiceView
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                if !viewModel.isComplete {
                    Button("Back", systemImage: "chevron.left") {
                        if viewModel.currentStepIndex > 0 {
                            commitInputForCurrentStep()
                            viewModel.goBack()
                            currentInput = viewModel.responses[viewModel.currentStep.id] ?? ""
                        } else {
                            dismiss()
                        }
                    }
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button("Close") { dismiss() }
            }
        }
        .navigationTitle("Lectio Divina")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            MagicMomentsService.shared.capture(.day810_lectio_introduced)
        }
    }

    // MARK: - Practice

    private var practiceView: some View {
        ScrollView {
            VStack(spacing: 16) {
                progressBar
                versePassage
                LectioStepView(
                    step: viewModel.currentStep,
                    timeRemaining: viewModel.formattedTime,
                    isPaused: viewModel.isPaused,
                    onToggleTimer: { viewModel.toggleTimer() },
                    inputText: $currentInput
                )
                continueButton
            }
            .padding(20)
        }
    }

    private var progressBar: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Step \(viewModel.currentStepIndex + 1) of \(viewModel.totalSteps)")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
                Spacer()
            }
            ProgressView(value: viewModel.progress)
                .tint(Theme.Colors.primary)
        }
    }

    private var versePassage: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(viewModel.verseRef)
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.primary)
            Text("\u{201C}\(viewModel.verseText)\u{201D}")
                .font(.body)
                .italic()
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var continueButton: some View {
        Button {
            commitInputForCurrentStep()
            viewModel.advanceStep()
            currentInput = viewModel.responses[viewModel.currentStep.id] ?? ""
        } label: {
            Text(viewModel.currentStepIndex == viewModel.totalSteps - 1 ? "Complete" : "Next step")
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Theme.Colors.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private func commitInputForCurrentStep() {
        guard viewModel.currentStep.hasInput else { return }
        let trimmed = currentInput.trimmingCharacters(in: .whitespacesAndNewlines)
        viewModel.responses[viewModel.currentStep.id] = trimmed.isEmpty ? nil : trimmed
    }

    // MARK: - Completion

    private var completionView: some View {
        VStack(spacing: 22) {
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 64))
                .foregroundStyle(Theme.Colors.primary)

            Text("You're done.")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)

            Text("4 steps. \(viewModel.verseRef). Slow on purpose.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)

            if let med = viewModel.responses["meditatio"], !med.isEmpty {
                snippetCard(title: "What stood out", body: med)
            }
            if let ora = viewModel.responses["oratio"], !ora.isEmpty {
                snippetCard(title: "Your prayer", body: ora)
            }

            Spacer()

            Button {
                Task { await saveAndDismiss() }
            } label: {
                if isSaving {
                    ProgressView().tint(.white)
                } else {
                    Text("Save & finish")
                        .font(.headline)
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.Colors.primary)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            Button { dismiss() } label: {
                Text("Don't save")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
        .padding(28)
    }

    private func snippetCard(title: String, body: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.primary)
            Text(body)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    @MainActor
    private func saveAndDismiss() async {
        isSaving = true
        defer { isSaving = false }
        guard let userId = appState.currentUser?.id else {
            dismiss()
            return
        }

        let parts: [String] = [
            "**Lectio Divina — \(viewModel.verseRef)**",
            "",
            "*Passage:* \u{201C}\(viewModel.verseText)\u{201D}",
            viewModel.responses["meditatio"].flatMap { $0.isEmpty ? nil : "*What stood out:* \($0)" } ?? "",
            viewModel.responses["oratio"].flatMap { $0.isEmpty ? nil : "*Prayer response:* \($0)" } ?? ""
        ].filter { !$0.isEmpty }

        let moment = SpiritualMoment(
            id: UUID().uuidString,
            userId: userId,
            momentType: .lectio,
            content: parts.joined(separator: "\n"),
            aiReflection: nil,
            linkedVerses: [],
            sentimentScore: nil,
            themes: ["lectio"],
            createdAt: Date(),
            updatedAt: nil,
            metadata: nil,
            media: nil,
            aiInsights: nil,
            status: .published,
            source: JournalSource(type: .standalone)
        )

        _ = try? await journalService.createMoment(moment)

        StreakManager.shared.recordActivity(
            isPremium: appState.currentUser?.isPremium ?? false,
            userId: userId
        )
        MagicMomentsService.shared.capture(.day810_lectio_completed)
        AnalyticsService.shared.capture("lectio_completed")
        dismiss()
    }
}

#Preview {
    NavigationStack {
        LectioDivinaView()
    }
    .environment(AppState.preview)
}
