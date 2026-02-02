import SwiftUI

struct WelcomeView: View {
    let onContinue: () -> Void
    
    @State private var showTitle = false
    @State private var showSubtitle = false
    @State private var showButton = false
    @State private var glowPhase: CGFloat = 0
    @State private var crossScale: CGFloat = 0.3
    @State private var crossOpacity: CGFloat = 0
    
    var body: some View {
        ZStack {
            // Animated gradient background
            RadialGradient(
                colors: [
                    Theme.Colors.primary.opacity(0.3),
                    Theme.Colors.background
                ],
                center: .center,
                startRadius: 50,
                endRadius: 400
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Glowing cross icon
                ZStack {
                    // Glow ring
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.08 + 0.06 * Foundation.sin(glowPhase)))
                        .frame(width: 180, height: 180)
                    
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.12))
                        .frame(width: 140, height: 140)
                    
                    // Glass circle
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 120, height: 120)
                        .overlay(
                            Circle()
                                .stroke(Theme.Colors.primary.opacity(0.3), lineWidth: 1)
                        )
                    
                    Image(systemName: "cross.fill")
                        .font(Theme.Typography.iconXL)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Theme.Colors.primaryLight, Theme.Colors.primary],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .scaleEffect(crossScale)
                        .opacity(crossOpacity)
                }
                
                VStack(spacing: 16) {
                    Text("Welcome to")
                        .font(Theme.Typography.bodyLarge)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .opacity(showTitle ? 1 : 0)
                        .offset(y: showTitle ? 0 : 20)
                    
                    Text("ChooseGOD")
                        .font(Theme.Typography.display)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Theme.Colors.text, Theme.Colors.primaryLight],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .opacity(showTitle ? 1 : 0)
                        .offset(y: showTitle ? 0 : 20)
                    
                    Text("Your daily journey into\nGod's Word starts here")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .opacity(showSubtitle ? 1 : 0)
                        .offset(y: showSubtitle ? 0 : 15)
                }
                
                Spacer()
                
                // CTA Button
                Button(action: onContinue) {
                    HStack(spacing: 12) {
                        Text("Begin Your Journey")
                            .accessibilityLabel("Begin your journey with ChooseGOD")
                            .accessibilityHint("Double tap to start")
                            .font(Theme.Typography.button)
                        Image(systemName: "arrow.right")
                            .font(Theme.Typography.label)
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
                .opacity(showButton ? 1 : 0)
                .offset(y: showButton ? 0 : 30)
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, 50)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.2)) {
                crossScale = 1.0
                crossOpacity = 1.0
            }
            withAnimation(Theme.Animation.springGentle.delay(0.5)) {
                showTitle = true
            }
            withAnimation(Theme.Animation.springGentle.delay(0.8)) {
                showSubtitle = true
            }
            withAnimation(Theme.Animation.springGentle.delay(1.1)) {
                showButton = true
            }
            // Continuous glow
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                glowPhase = .pi * 2
            }
        }
        .onAppear { AnalyticsService.shared.screen("onboarding_welcome")
            AnalyticsService.shared.capture("onboarding_started") }
    }
}

#Preview {
    WelcomeView(onContinue: {})
}
