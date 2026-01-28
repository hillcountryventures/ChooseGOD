import SwiftUI

/// Loading placeholder with shimmer animation
struct ShimmerView: View {
    var width: CGFloat? = nil
    var height: CGFloat = 16
    var cornerRadius: CGFloat = Theme.CornerRadius.md
    
    @State private var phase: CGFloat = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(Theme.Colors.surfaceElevated)
            .frame(width: width, height: height)
            .overlay {
                if !reduceMotion {
                    GeometryReader { geo in
                        LinearGradient(
                            colors: [.clear, .white.opacity(0.12), .clear],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        .frame(width: geo.size.width * 0.5)
                        .offset(x: -geo.size.width * 0.25 + phase * geo.size.width * 1.5)
                    }
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                }
            }
            .onAppear {
                guard !reduceMotion else { return }
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}

/// Card-shaped shimmer placeholder
struct ShimmerCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            ShimmerView(height: 20)
            ShimmerView(width: 200, height: 14)
            ShimmerView(height: 14)
            ShimmerView(width: 140, height: 14)
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
    }
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        VStack(spacing: 16) {
            ShimmerView(height: 24)
            ShimmerView(width: 200, height: 16)
            ShimmerCard()
        }
        .padding()
    }
}
