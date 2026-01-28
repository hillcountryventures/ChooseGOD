import SwiftUI

/// Reusable confetti celebration overlay using Canvas + TimelineView
struct ConfettiView: View {
    @Binding var isActive: Bool
    var particleCount: Int = 60
    var duration: TimeInterval = 3.0
    var colors: [Color] = [
        Theme.Colors.primary,
        Theme.Colors.accent,
        Theme.Colors.success,
        .pink, .cyan, .orange, .yellow
    ]
    
    @State private var particles: [ConfettiParticle] = []
    @State private var startTime: Date?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    var body: some View {
        if isActive && !reduceMotion {
            SwiftUI.TimelineView(.animation) { timeline in
                Canvas { context, size in
                    let elapsed = timeline.date.timeIntervalSince(startTime ?? timeline.date)
                    
                    for particle in particles {
                        let progress = elapsed / duration
                        guard progress <= 1.0 else { continue }
                        
                        let x = particle.startX * size.width + particle.drift * sin(elapsed * particle.wobbleSpeed) * 40
                        let y = particle.startY * size.height + elapsed * particle.fallSpeed * size.height * 0.3
                        let opacity = 1.0 - progress
                        let rotation = Angle(degrees: elapsed * particle.rotationSpeed)
                        
                        context.opacity = opacity
                        context.translateBy(x: x, y: y)
                        context.rotate(by: rotation)
                        
                        let rect = CGRect(x: -particle.width / 2, y: -particle.height / 2,
                                          width: particle.width, height: particle.height)
                        context.fill(Path(rect), with: .color(particle.color))
                        
                        context.rotate(by: -rotation)
                        context.translateBy(x: -x, y: -y)
                    }
                }
            }
            .ignoresSafeArea()
            .allowsHitTesting(false)
            .onAppear { spawnParticles() }
            .task {
                try? await Task.sleep(for: .seconds(duration))
                isActive = false
            }
        }
    }
    
    private func spawnParticles() {
        startTime = Date()
        particles = (0..<particleCount).map { _ in
            ConfettiParticle(
                startX: CGFloat.random(in: 0.1...0.9),
                startY: CGFloat.random(in: -0.2...0.0),
                width: CGFloat.random(in: 4...10),
                height: CGFloat.random(in: 6...14),
                color: colors.randomElement() ?? .white,
                fallSpeed: CGFloat.random(in: 0.5...1.2),
                drift: CGFloat.random(in: -1...1),
                wobbleSpeed: Double.random(in: 2...6),
                rotationSpeed: Double.random(in: 60...300)
            )
        }
    }
}

private struct ConfettiParticle {
    let startX: CGFloat
    let startY: CGFloat
    let width: CGFloat
    let height: CGFloat
    let color: Color
    let fallSpeed: CGFloat
    let drift: CGFloat
    let wobbleSpeed: Double
    let rotationSpeed: Double
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        ConfettiView(isActive: .constant(true))
    }
}
