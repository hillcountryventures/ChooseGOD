import SwiftUI
import Observation

/// Manages the full onboarding flow state
@Observable
final class OnboardingViewModel {
    
    // MARK: - Flow State
    
    enum OnboardingStep: Int, CaseIterable {
        case ageGate
        case welcome
        case quizLifeArea
        case quizTime
        case quizExperience
        case quizLifeStage
        case recommendations
        case paywall
        case notificationSetup
        
        var isQuizStep: Bool {
            switch self {
            case .quizLifeArea, .quizTime, .quizExperience, .quizLifeStage: return true
            default: return false
            }
        }
        
        var isAgeGate: Bool { self == .ageGate }
        
        var quizIndex: Int {
            switch self {
            case .quizLifeArea: return 0
            case .quizTime: return 1
            case .quizExperience: return 2
            case .quizLifeStage: return 3
            default: return -1
            }
        }
        
        static let quizStepCount = 4
    }
    
    var currentStep: OnboardingStep = .ageGate
    var responses = OnboardingResponses()
    var recommendations: [SeriesRecommendation] = []
    var selectedSeriesIds: Set<String> = []
    var isLoadingRecommendations = false
    var transitionDirection: Edge = .trailing
    
    private let service: OnboardingServiceProtocol
    
    init(service: OnboardingServiceProtocol = SupabaseOnboardingService()) {
        self.service = service
    }
    
    // MARK: - Navigation
    
    var canProceed: Bool {
        switch currentStep {
        case .ageGate: return true
        case .welcome: return true
        case .quizLifeArea: return responses.lifeAreaFocus != nil
        case .quizTime: return responses.timeAvailable != nil
        case .quizExperience: return responses.experienceLevel != nil
        case .quizLifeStage: return responses.lifeStage != nil
        case .recommendations: return !selectedSeriesIds.isEmpty
        case .paywall: return true
        case .notificationSetup: return true
        }
    }
    
    func advance() {
        // TODO: Fix AnalyticsService import
        // AnalyticsService.shared.capture("onboarding_step_completed", properties: ["step": String(currentStep.rawValue)])
        transitionDirection = .trailing
        guard let allSteps = OnboardingStep.allCases.first(where: { $0.rawValue == currentStep.rawValue + 1 }) else { return }
        
        if currentStep == .quizLifeStage {
            // After last quiz step, load recommendations
            Task { await loadRecommendations() }
        }
        
        withAnimation(Theme.Animation.spring) {
            currentStep = allSteps
        }
    }
    
    func goBack() {
        transitionDirection = .leading
        guard let prev = OnboardingStep.allCases.first(where: { $0.rawValue == currentStep.rawValue - 1 }) else { return }
        withAnimation(Theme.Animation.spring) {
            currentStep = prev
        }
    }
    
    // MARK: - Quiz Selections
    
    func selectLifeArea(_ area: LifeAreaFocus) {
        responses.lifeAreaFocus = area
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    func selectTime(_ time: TimeAvailable) {
        responses.timeAvailable = time
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    func selectExperience(_ level: ExperienceLevel) {
        responses.experienceLevel = level
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    func selectLifeStage(_ stage: LifeStage) {
        responses.lifeStage = stage
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    func toggleSeries(_ id: String) {
        if selectedSeriesIds.contains(id) {
            selectedSeriesIds.remove(id)
        } else {
            selectedSeriesIds.insert(id)
        }
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    // MARK: - Data
    
    @MainActor
    func loadRecommendations() async {
        isLoadingRecommendations = true
        do {
            recommendations = try await service.getRecommendations(for: responses)
            // Auto-select top recommendation
            if let first = recommendations.first {
                selectedSeriesIds.insert(first.id)
            }
        } catch {
            // Fallback handled by service
        }
        isLoadingRecommendations = false
    }
    
    func saveAndComplete(userId: String?) async {
        // TODO: Fix AnalyticsService import
        // AnalyticsService.shared.capture("onboarding_completed")
        if let userId {
            try? await service.saveResponses(responses, userId: userId)
        }
    }
}

// HapticManager is defined in Core/Theme/Haptics.swift
