import SwiftUI

/// Coordinator view for the enhanced onboarding flow
/// Flow: Welcome → Quiz (4 steps) → Recommendations → Notification Setup → Done
struct OnboardingCoordinatorView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = OnboardingViewModel()
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            Group {
                switch viewModel.currentStep {
                case .welcome:
                    WelcomeView {
                        viewModel.advance()
                    }
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                    
                case .quizLifeArea, .quizTime, .quizExperience, .quizLifeStage:
                    PersonalizationQuizView(viewModel: viewModel)
                        .transition(.asymmetric(
                            insertion: .move(edge: viewModel.transitionDirection),
                            removal: .move(edge: viewModel.transitionDirection == .trailing ? .leading : .trailing)
                        ))
                    
                case .recommendations:
                    RecommendationsView(viewModel: viewModel) {
                        viewModel.advance()
                    }
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                    
                case .notificationSetup:
                    OnboardingNotificationSetupView {
                        completeOnboarding()
                    } onSkip: {
                        completeOnboarding()
                    }
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                }
            }
            .animation(Theme.Animation.spring, value: viewModel.currentStep)
        }
    }
    
    private func completeOnboarding() {
        Task {
            await viewModel.saveAndComplete(userId: appState.currentUser?.id)
        }
        appState.completeOnboarding()
    }
}

// MARK: - Onboarding Notification Setup (inline version)

struct OnboardingNotificationSetupView: View {
    let onEnable: () -> Void
    let onSkip: () -> Void
    
    @State private var appeared = false
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(Theme.Colors.accent.opacity(0.12))
                    .frame(width: 140, height: 140)
                
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 110, height: 110)
                    .overlay(
                        Circle()
                            .stroke(Theme.Colors.accent.opacity(0.3), lineWidth: 1)
                    )
                
                Image(systemName: "bell.badge.fill")
                    .font(.system(size: 44))
                    .foregroundStyle(Theme.Colors.accent)
            }
            .scaleEffect(appeared ? 1 : 0.7)
            .opacity(appeared ? 1 : 0)
            
            VStack(spacing: 12) {
                Text("Stay on Track")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Get a gentle reminder each morning\nto start your day with God's Word")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 15)
            
            Spacer()
            
            VStack(spacing: 16) {
                Button(action: onEnable) {
                    HStack(spacing: 8) {
                        Image(systemName: "bell.fill")
                            .font(.system(size: 14))
                        Text("Enable Notifications")
                            .font(Theme.Typography.button)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.Dimensions.buttonHeight)
                    .background(
                        LinearGradient(
                            colors: [Theme.Colors.accent, Theme.Colors.accentLight],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
                }
                
                Button(action: onSkip) {
                    Text("Maybe Later")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, 50)
        }
        .onAppear {
            withAnimation(Theme.Animation.springGentle.delay(0.2)) {
                appeared = true
            }
        }
    }
}

#Preview {
    OnboardingCoordinatorView()
        .environment(AppState.preview)
}
