import SwiftUI

/// View displayed when user has no seeds/credits remaining
struct NoSeedsView: View {
    @Environment(\.dismiss) private var dismiss
    let onUpgrade: () -> Void
    
    @State private var scaleEffect: CGFloat = 0.8
    @State private var opacity: Double = 0
    @State private var seedRotation: Double = 0
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: Theme.Colors.paywallGradient,
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                // Animated icon
                ZStack {
                    // Glow effect
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [
                                    Theme.Colors.primary.opacity(0.3),
                                    .clear
                                ],
                                center: .center,
                                startRadius: 10,
                                endRadius: 80
                            )
                        )
                        .frame(width: 160, height: 160)
                    
                    // Seed icon
                    Image(systemName: "leaf.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [
                                    Theme.Colors.primary,
                                    Theme.Colors.primaryDark
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .rotationEffect(.degrees(seedRotation))
                        .shadow(color: Theme.Colors.primary.opacity(0.5), radius: 20)
                }
                .scaleEffect(scaleEffect)
                .opacity(opacity)
                
                // Message
                VStack(spacing: 12) {
                    Text("Out of Seeds")
                        .font(Theme.Typography.title1)
                        .foregroundStyle(.white)
                        .opacity(opacity)
                    
                    Text("Upgrade to Premium for unlimited access to all features")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .opacity(opacity)
                }
                
                Spacer()
                
                // Action buttons
                VStack(spacing: 16) {
                    // Upgrade button
                    Button {
                        onUpgrade()
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "crown.fill")
                                .font(Theme.Typography.bodySmall)
                            Text("Upgrade to Premium")
                                .font(Theme.Typography.title3)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background {
                            Capsule().fill(
                                LinearGradient(
                                    colors: [
                                        Theme.Colors.primary,
                                        Theme.Colors.primaryDark
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                        }
                        .shadow(color: Theme.Colors.primary.opacity(0.4), radius: 16, y: 6)
                    }
                    
                    // Dismiss button
                    Button {
                        dismiss()
                    } label: {
                        Text("Maybe Later")
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
                .padding(.horizontal, Theme.Spacing.mdl)
                .opacity(opacity)
                
                Spacer()
                    .frame(height: Theme.Spacing.lg)
            }
        }
        .onAppear {
            animateEntrance()
        }
    }
    
    // MARK: - Animation
    
    private func animateEntrance() {
        withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
            scaleEffect = 1.0
            opacity = 1.0
        }
        
        // Subtle rotation animation
        withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
            seedRotation = 15
        }
    }
}

// MARK: - Preview

#Preview {
    NoSeedsView {
        print("Upgrade tapped")
    }
}
