import SwiftUI
import Observation

/// Manages the onboarding flow per Strategy Decision #7 — collapsed to 5 steps:
/// ageGate (COPPA-required) → welcome → graceModeDemo → traditionPicker → notificationSetup.
///
/// The previous 4-question PersonalizationQuiz + recommendations selection were
/// dropped per the resolved decisions: tradition is the only personalization
/// signal that materially affects AI prompts, and recommendations now surface
/// as a Home-screen card rather than a blocking onboarding step.
@Observable
final class OnboardingViewModel {

    // MARK: - Flow State

    enum OnboardingStep: Int, CaseIterable {
        case ageGate
        case welcome
        case graceModeDemo
        case traditionPicker
        case intentionCapture       // Decision G2 — front-load cold-start fix
        case notificationSetup

        var isAgeGate: Bool { self == .ageGate }
    }

    var currentStep: OnboardingStep = .ageGate
    var transitionDirection: Edge = .trailing

    /// Decision #13 — captured at TraditionPicker step.
    var selectedTradition: Tradition? = nil

    /// Decision G2 — captured at IntentionCapture step. Persisted on
    /// completion via UserIntentionsService.
    var pendingIntention: String = ""

    /// Legacy responses kept around because SupabaseOnboardingService still
    /// stores them for analytics; the flow no longer collects them, so they
    /// stay at their default values when persisted.
    var responses = OnboardingResponses()
    var recommendations: [SeriesRecommendation] = []
    var selectedSeriesIds: Set<String> = []
    var isLoadingRecommendations = false

    private let service: OnboardingServiceProtocol

    init(service: OnboardingServiceProtocol = SupabaseOnboardingService()) {
        self.service = service
    }

    // MARK: - Navigation

    var canProceed: Bool {
        switch currentStep {
        case .ageGate, .welcome, .graceModeDemo, .intentionCapture, .notificationSetup:
            return true
        case .traditionPicker:
            return selectedTradition != nil
        }
    }

    func advance() {
        transitionDirection = .trailing
        guard let next = OnboardingStep.allCases.first(where: {
            $0.rawValue == currentStep.rawValue + 1
        }) else { return }

        withAnimation(Theme.Animation.spring) {
            currentStep = next
        }
    }

    func goBack() {
        transitionDirection = .leading
        guard let prev = OnboardingStep.allCases.first(where: {
            $0.rawValue == currentStep.rawValue - 1
        }) else { return }
        withAnimation(Theme.Animation.spring) {
            currentStep = prev
        }
    }

    // MARK: - Tradition

    func selectTradition(_ tradition: Tradition) {
        selectedTradition = tradition
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        // Decision #15 — fire once per onboarding completion. Tradition value
        // attached so PMF dashboards can segment by Catholic / Protestant / etc.
        MagicMomentsService.shared.capture(
            .day0_tradition_selected,
            properties: ["tradition": tradition.rawValue]
        )
    }

    // MARK: - Legacy stubs

    /// Kept so RecommendationsView still compiles even though it's no longer
    /// in the onboarding flow. Safe to delete once that file is removed.
    func toggleSeries(_ id: String) {
        if selectedSeriesIds.contains(id) {
            selectedSeriesIds.remove(id)
        } else {
            selectedSeriesIds.insert(id)
        }
    }

    // MARK: - Persist

    func saveAndComplete(userId: String?) async {
        guard let userId else { return }
        // Decision #13 — write tradition first; this is what affects every
        // future companion call.
        if let tradition = selectedTradition {
            try? await UserPreferencesService.shared.setTradition(tradition, userId: userId)
        }

        // Decision G2 — persist the intention if the user provided one. Empty
        // string means they skipped; that's fine, we just don't insert a row.
        let intention = pendingIntention.trimmingCharacters(in: .whitespacesAndNewlines)
        if !intention.isEmpty {
            _ = try? await UserIntentionsService.shared.setIntention(
                intention,
                source: "onboarding"
            )
        }

        try? await service.saveResponses(responses, userId: userId)
    }
}

// HapticManager is defined in Core/Theme/Haptics.swift
