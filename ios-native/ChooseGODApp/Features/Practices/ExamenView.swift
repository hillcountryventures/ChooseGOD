import SwiftUI

/// Strategy Decision #6 — Evening Examen, 5-step Ignatian reflection.
/// Mirrors the Lectio pattern (timed steps, optional input per step,
/// completion saves a SpiritualMoment).
///
/// Steps: Gratitude → Review → Sorrow → Hope → Rest.
struct ExamenView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @StateObject private var viewModel = ExamenViewModel()
    @State private var currentInput: String = ""
    @State private var isSaving: Bool = false

    private let journalService: JournalServiceProtocol = SupabaseJournalService()

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                if viewModel.isComplete {
                    completionView
                } else {
                    practiceView
                }
            }
            .navigationTitle("Evening Examen")
            .navigationBarTitleDisplayMode(.inline)
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
            .onAppear {
                AnalyticsService.shared.capture("examen_started")
            }
        }
    }

    // MARK: - Practice

    private var practiceView: some View {
        ScrollView {
            VStack(spacing: 16) {
                progressBar
                stepCard
                continueButton
            }
            .padding(20)
        }
        .scrollDismissesKeyboard(.interactively)
    }

    private var progressBar: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Step \(viewModel.currentStepIndex + 1) of \(viewModel.totalSteps)")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
                Spacer()
                Text(viewModel.currentStep.subtitle)
                    .font(.caption)
                    .bold()
                    .foregroundStyle(Theme.Colors.primary)
            }
            ProgressView(value: viewModel.progress)
                .tint(Theme.Colors.primary)
        }
    }

    private var stepCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.16))
                        .frame(width: 56, height: 56)
                    Image(systemName: viewModel.currentStep.icon)
                        .font(.title2)
                        .foregroundStyle(Theme.Colors.primary)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(viewModel.currentStep.title)
                        .font(.title3)
                        .bold()
                        .foregroundStyle(Theme.Colors.text)
                    Text(viewModel.currentStep.subtitle)
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.primary)
                }
                Spacer()
            }

            Text(viewModel.currentStep.instruction)
                .font(.body)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            if viewModel.currentStep.hasInput {
                ZStack(alignment: .topLeading) {
                    TextEditor(text: $currentInput)
                        .font(.body)
                        .scrollContentBackground(.hidden)
                        .frame(minHeight: 140)
                        .padding(8)
                        .background(Theme.Colors.background)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    if currentInput.isEmpty {
                        Text(viewModel.currentStep.inputPlaceholder)
                            .font(.body)
                            .foregroundStyle(Theme.Colors.secondaryText)
                            .padding(16)
                            .allowsHitTesting(false)
                    }
                }
            } else {
                Text(viewModel.currentStep.contemplativePrompt ?? "Sit with this for a moment.")
                    .font(.subheadline)
                    .italic()
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 8)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var continueButton: some View {
        Button {
            commitInputForCurrentStep()
            viewModel.advanceStep()
            currentInput = viewModel.responses[viewModel.currentStep.id] ?? ""
        } label: {
            Text(viewModel.currentStepIndex == viewModel.totalSteps - 1 ? "Complete" : "Next")
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
            Image(systemName: "moon.stars.fill")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primary)
            Text("Rest well.")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("Five movements. One day reviewed in His presence.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
            Spacer()

            Button {
                Task { await saveAndDismiss() }
            } label: {
                if isSaving {
                    ProgressView().tint(.white)
                } else {
                    Text("Save reflection")
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

    @MainActor
    private func saveAndDismiss() async {
        isSaving = true
        defer { isSaving = false }
        guard let userId = appState.currentUser?.id else {
            dismiss()
            return
        }

        var lines = ["**Evening Examen**", ""]
        for step in ExamenViewModel.steps where step.hasInput {
            if let response = viewModel.responses[step.id], !response.isEmpty {
                lines.append("*\(step.title) — \(step.subtitle):* \(response)")
            }
        }

        let moment = SpiritualMoment(
            id: UUID().uuidString,
            userId: userId,
            momentType: .examen,
            content: lines.joined(separator: "\n"),
            aiReflection: nil,
            linkedVerses: [],
            sentimentScore: nil,
            themes: ["examen"],
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
        AnalyticsService.shared.capture("examen_completed")
        dismiss()
    }
}

// MARK: - ViewModel

@MainActor
final class ExamenViewModel: ObservableObject {

    struct Step: Identifiable {
        let id: String
        let title: String
        let subtitle: String
        let icon: String
        let instruction: String
        let hasInput: Bool
        let inputPlaceholder: String
        let contemplativePrompt: String?
    }

    static let steps: [Step] = [
        Step(
            id: "gratitude",
            title: "Gratitude",
            subtitle: "Where was grace today?",
            icon: "sun.max.fill",
            instruction: "Look back over your day. What are 1-3 moments of grace, kindness, or beauty? Even small ones.",
            hasInput: true,
            inputPlaceholder: "Today I'm grateful for…",
            contemplativePrompt: nil
        ),
        Step(
            id: "review",
            title: "Review",
            subtitle: "Walk through the day",
            icon: "clock.arrow.circlepath",
            instruction: "Replay your day from waking to now. Notice what stirred you — joy, frustration, longing, peace. Don't judge — just notice.",
            hasInput: true,
            inputPlaceholder: "What stood out today…",
            contemplativePrompt: nil
        ),
        Step(
            id: "sorrow",
            title: "Sorrow",
            subtitle: "Where did you fall short?",
            icon: "drop.fill",
            instruction: "Honest, not harsh. Where did you miss the mark — in word, action, or attitude? Ask for mercy. He gives it.",
            hasInput: true,
            inputPlaceholder: "Where I fell short…",
            contemplativePrompt: nil
        ),
        Step(
            id: "hope",
            title: "Hope",
            subtitle: "Look toward tomorrow",
            icon: "sparkles",
            instruction: "What does tomorrow ask of you? Where do you need His help? Name one thing you'll do differently.",
            hasInput: true,
            inputPlaceholder: "Tomorrow I want to…",
            contemplativePrompt: nil
        ),
        Step(
            id: "rest",
            title: "Rest",
            subtitle: "Let it go",
            icon: "moon.zzz.fill",
            instruction: "Release the day to God. He carried you through it; He'll carry you through tonight.",
            hasInput: false,
            inputPlaceholder: "",
            contemplativePrompt: "“He gives sleep to those He loves.” — Psalm 127:2"
        )
    ]

    @Published var currentStepIndex = 0
    @Published var isComplete = false
    @Published var responses: [String: String] = [:]

    var currentStep: Step { Self.steps[currentStepIndex] }
    var totalSteps: Int { Self.steps.count }
    var progress: Double { Double(currentStepIndex + 1) / Double(totalSteps) }

    func advanceStep() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        if currentStepIndex >= totalSteps - 1 {
            withAnimation(.easeInOut(duration: 0.4)) { isComplete = true }
            return
        }
        withAnimation(.easeInOut(duration: 0.4)) {
            currentStepIndex += 1
        }
    }

    func goBack() {
        guard currentStepIndex > 0 else { return }
        withAnimation(.easeInOut(duration: 0.4)) {
            currentStepIndex -= 1
        }
    }
}

#Preview {
    ExamenView()
        .environment(AppState.preview)
}
