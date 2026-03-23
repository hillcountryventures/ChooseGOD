import SwiftUI

/// Reverent launch animation shown on cold app start
/// Displays a warm golden cross, holds briefly, then fades for HomeView entrance
struct LaunchAnimationView: View {
    @State private var logoOpacity = 0.0
    @State private var logoScale = 0.9
    @State private var glowScale = 0.8
    @State private var glowOpacity = 0.0
    @State private var hasLaunched = false

    private let warmGold = Color(red: 0.96, green: 0.78, blue: 0.26)

    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()

            // Warm golden radial glow
            RadialGradient(
                colors: [warmGold.opacity(0.15), .clear],
                center: .center,
                startRadius: 0,
                endRadius: 200
            )
            .scaleEffect(glowScale)
            .opacity(glowOpacity)

            // Logo: Cross icon + ChooseGOD text
            VStack(spacing: 20) {
                Image(systemName: "cross.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(warmGold)

                Text("ChooseGOD")
                    .font(Theme.Typography.display)
                    .foregroundStyle(Theme.Colors.text)
            }
            .scaleEffect(logoScale)
            .opacity(logoOpacity)
        }
        .onAppear {
            animateIfNeeded()
        }
    }

    private func animateIfNeeded() {
        guard !hasLaunched else { return }
        hasLaunched = true

        // Skip animation if reduced motion is enabled
        if UIAccessibility.isReduceMotionEnabled {
            logoOpacity = 1.0
            return
        }

        animateLaunch()
    }

    private func animateLaunch() {
        // Phase 1: Fade in logo with glow (0.6s, easeOut)
        withAnimation(.easeOut(duration: 0.6)) {
            logoOpacity = 1.0
            logoScale = 1.0
            glowOpacity = 1.0
            glowScale = 1.2
        }

        // Phase 2: Hold for 0.5s, then fade out (0.3s, easeIn)
        Task {
            // Wait for fade-in (0.6s) + hold time (0.5s) = 1.1s total
            try? await Task.sleep(nanoseconds: 1_100_000_000)

            withAnimation(.easeIn(duration: 0.3)) {
                logoOpacity = 0.0
                glowOpacity = 0.0
            }
        }
    }
}

#Preview {
    LaunchAnimationView()
}
