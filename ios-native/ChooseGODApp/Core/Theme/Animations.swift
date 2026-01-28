import SwiftUI

// MARK: - Reusable Animation Presets

enum AppAnimations {
    
    // MARK: - Page Transition (Slide + Fade)
    
    static let pageTransition = AnyTransition.asymmetric(
        insertion: .move(edge: .trailing).combined(with: .opacity),
        removal: .move(edge: .leading).combined(with: .opacity)
    )
    
    static let pageTransitionUp = AnyTransition.asymmetric(
        insertion: .move(edge: .bottom).combined(with: .opacity),
        removal: .move(edge: .top).combined(with: .opacity)
    )
    
    static let fadeScale = AnyTransition.opacity.combined(with: .scale(scale: 0.92))
    
    // MARK: - Card Entrance (Scale + Opacity with Stagger)
    
    static func cardEntrance(index: Int, total: Int = 10) -> Animation {
        .spring(response: 0.45, dampingFraction: 0.75)
        .delay(Double(index) * 0.06)
    }
    
    static let cardTransition = AnyTransition.scale(scale: 0.9).combined(with: .opacity)
    
    // MARK: - Pulse Animation
    
    static let pulse = Animation.easeInOut(duration: 1.2).repeatForever(autoreverses: true)
    static let pulseFast = Animation.easeInOut(duration: 0.8).repeatForever(autoreverses: true)
    
    // MARK: - Shimmer
    
    static let shimmer = Animation.linear(duration: 1.5).repeatForever(autoreverses: false)
    
    // MARK: - Celebration
    
    static let celebrationBurst = Animation.spring(response: 0.5, dampingFraction: 0.6, blendDuration: 0.3)
    
    // MARK: - Reduce Motion Aware
    
    static func reduceMotionAware(_ animation: Animation) -> Animation {
        // At call site, check UIAccessibility.isReduceMotionEnabled
        animation
    }
}

// MARK: - Card Entrance Modifier

struct CardEntranceModifier: ViewModifier {
    let index: Int
    @State private var appeared = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .scaleEffect(appeared ? 1 : (reduceMotion ? 1 : 0.9))
            .offset(y: appeared ? 0 : (reduceMotion ? 0 : 20))
            .onAppear {
                if reduceMotion {
                    appeared = true
                } else {
                    withAnimation(AppAnimations.cardEntrance(index: index)) {
                        appeared = true
                    }
                }
            }
    }
}

// MARK: - Pulse Modifier

struct PulseModifier: ViewModifier {
    @State private var isPulsing = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isPulsing && !reduceMotion ? 1.08 : 1.0)
            .opacity(isPulsing ? 0.85 : 1.0)
            .onAppear {
                guard !reduceMotion else { return }
                withAnimation(AppAnimations.pulse) {
                    isPulsing = true
                }
            }
    }
}

// MARK: - Shimmer Modifier

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    func body(content: Content) -> some View {
        content
            .overlay {
                if !reduceMotion {
                    GeometryReader { geo in
                        LinearGradient(
                            colors: [
                                .clear,
                                .white.opacity(0.15),
                                .clear
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        .frame(width: geo.size.width * 0.6)
                        .offset(x: -geo.size.width * 0.3 + phase * (geo.size.width * 1.6))
                        .onAppear {
                            withAnimation(AppAnimations.shimmer) {
                                phase = 1
                            }
                        }
                    }
                    .clipped()
                }
            }
    }
}

// MARK: - View Extensions

extension View {
    func cardEntrance(index: Int) -> some View {
        modifier(CardEntranceModifier(index: index))
    }
    
    func pulseAnimation() -> some View {
        modifier(PulseModifier())
    }
    
    func shimmerEffect() -> some View {
        modifier(ShimmerModifier())
    }
}
