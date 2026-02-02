import SwiftUI

/// Coordinator view for the enhanced onboarding flow
/// Flow: Welcome → Quiz (4 steps) → Recommendations → Notification Setup → Done
struct OnboardingCoordinatorView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = OnboardingViewModel()
    @State private var showPaywallSheet = false
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            Group {
                switch viewModel.currentStep {
                case .ageGate:
                    AgeGateView {
                        viewModel.advance()
                    }
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                    
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
                    
                case .paywall:
                    OnboardingPaywallView(
                        onSubscribe: {
                            showPaywallSheet = true
                        },
                        onSkip: {
                            viewModel.advance()
                        },
                        onRestore: {
                            Task {
                                _ = try? await RevenueCatService.shared.restorePurchases()
                                viewModel.advance()
                            }
                        }
                    )
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
        // TODO: Fix AnalyticsService import - .onAppear { AnalyticsService.shared.screen("onboarding_coordinator") }
        .sheet(isPresented: $showPaywallSheet) {
            PaywallView()
                .environment(appState)
                .onDisappear { viewModel.advance() }
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
                    .font(Theme.Typography.iconLarge)
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
                            .font(Theme.Typography.bodySmall)
                        Text("Enable Notifications")
                        .accessibilityLabel("Enable push notifications")
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

// MARK: - Age Gate (COPPA Compliance)

struct AgeGateView: View {
    let onConfirmed: () -> Void
    @State private var showBlockedMessage = false
    @State private var appeared = false
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            Image(systemName: "person.crop.circle.badge.checkmark")
                .font(Theme.Typography.iconHuge)
                .foregroundStyle(Theme.Colors.primary)
                .scaleEffect(appeared ? 1 : 0.7)
                .opacity(appeared ? 1 : 0)
            
            VStack(spacing: 12) {
                Text("Age Verification")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("To use ChooseGOD, please confirm your age.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
            
            if showBlockedMessage {
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(Theme.Typography.title1)
                        .foregroundStyle(.orange)
                    Text("Sorry, you must be 13 or older to use this app.")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                        .multilineTextAlignment(.center)
                    Text("This is required by the Children's Online Privacy Protection Act (COPPA).")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                VStack(spacing: 16) {
                    Button(action: onConfirmed) {
                        Text("I am 13 or older")
                            .font(Theme.Typography.button)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: Theme.Dimensions.buttonHeight)
                            .background(
                                LinearGradient(
                                    colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
                    }
                    
                    Button {
                        withAnimation { showBlockedMessage = true }
                    } label: {
                        Text("I am under 13")
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
            
            Spacer().frame(height: 50)
        }
        .onAppear {
            withAnimation(Theme.Animation.springGentle.delay(0.2)) {
                appeared = true
            }
        }
    }
}

// MARK: - Onboarding Paywall View

struct OnboardingPaywallView: View {
    let onSubscribe: () -> Void
    let onSkip: () -> Void
    var onRestore: (() -> Void)? = nil
    
    @State private var appeared = false
    @State private var isRestoring = false
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.12))
                    .frame(width: 140, height: 140)
                
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 110, height: 110)
                    .overlay(
                        Circle()
                            .stroke(Theme.Colors.primary.opacity(0.3), lineWidth: 1)
                    )
                
                Image(systemName: "crown.fill")
                    .font(Theme.Typography.iconLarge)
                    .foregroundStyle(Theme.Colors.primary)
            }
            .scaleEffect(appeared ? 1 : 0.7)
            .opacity(appeared ? 1 : 0)
            
            VStack(spacing: 12) {
                Text("Unlock Your Full Journey")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Get unlimited access to devotionals,\npersonalized reading plans & more")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 15)
            
            // Feature list
            VStack(alignment: .leading, spacing: 14) {
                PaywallFeatureRow(icon: "book.fill", text: "Unlimited Bible reading plans")
                PaywallFeatureRow(icon: "bubble.left.fill", text: "AI-powered Bible Q&A")
                PaywallFeatureRow(icon: "hands.sparkles.fill", text: "Guided prayer journaling")
                PaywallFeatureRow(icon: "chart.line.uptrend.xyaxis", text: "Advanced spiritual growth tracking")
            }
            .padding(.horizontal, Theme.Spacing.xl)
            .opacity(appeared ? 1 : 0)
            
            Spacer()
            
            VStack(spacing: 12) {
                Button(action: onSubscribe) {
                    HStack(spacing: 8) {
                        Image(systemName: "crown.fill")
                            .font(Theme.Typography.bodySmall)
                        Text("Start Free Trial")
                            .font(Theme.Typography.button)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.Dimensions.buttonHeight)
                    .background(
                        LinearGradient(
                            colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
                }
                
                // Auto-renewal disclosure (always visible per App Store guidelines)
                Text("Subscription automatically renews. Cancel anytime in App Store Settings at least 24 hours before the end of the current period.")
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textSecondary.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.md)
                
                // Restore Purchases
                Button {
                    if let onRestore {
                        isRestoring = true
                        onRestore()
                        isRestoring = false
                    }
                } label: {
                    if isRestoring {
                        ShimmerView(height: 20)
                    } else {
                        Text("Restore Purchases")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
                
                // Terms of Service & Privacy Policy links
                HStack(spacing: 4) {
                    // TODO: Fix AppURLs import - Link("Terms of Service", destination: AppURLs.terms)
                    //     .font(Theme.Typography.caption2)
                    Text("and")
                        .font(Theme.Typography.caption2)
                        .foregroundStyle(Theme.Colors.textSecondary.opacity(0.6))
                    // TODO: Fix AppURLs import - Link("Privacy Policy", destination: AppURLs.privacy)
                    //     .font(Theme.Typography.caption2)
                }
                
                Button(action: onSkip) {
                    Text("Continue with Free Plan")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, 40)
        }
        .onAppear {
            withAnimation(Theme.Animation.springGentle.delay(0.2)) {
                appeared = true
            }
        }
    }
}

struct PaywallFeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.primary)
                .frame(width: 24)
            Text(text)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.text)
        }
    }
}

#Preview {
    OnboardingCoordinatorView()
        .environment(AppState.preview)
}
