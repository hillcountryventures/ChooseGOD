import SwiftUI

/// Celebration screen after enrolling in a series
struct EnrollmentConfirmView: View {
    let series: DevotionalSeries
    let enrollment: UserSeriesEnrollment
    
    @Environment(\.dismiss) private var dismiss
    
    @State private var showIcon = false
    @State private var showTitle = false
    @State private var showDetails = false
    @State private var showButton = false
    @State private var confettiPieces: [ConfettiPiece] = []
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            // Confetti layer
            confettiLayer
            
            VStack(spacing: 0) {
                Spacer()
                
                // Animated icon
                ZStack {
                    Circle()
                        .fill(series.gradient)
                        .frame(width: 120, height: 120)
                        .themeShadow(Theme.Shadows.lg)
                    
                    Image(systemName: "party.popper.fill")
                        .font(.system(size: 52))
                        .foregroundStyle(.white)
                }
                .scaleEffect(showIcon ? 1 : 0.3)
                .opacity(showIcon ? 1 : 0)
                .padding(.bottom, 32)
                
                // Title
                Text("You're Enrolled!")
                    .font(.system(size: 32, weight: .bold, design: .serif))
                    .foregroundStyle(Theme.Colors.text)
                    .opacity(showTitle ? 1 : 0)
                    .offset(y: showTitle ? 0 : 20)
                    .padding(.bottom, 8)
                
                Text(series.title)
                    .font(Theme.Typography.bodyLarge)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .opacity(showTitle ? 1 : 0)
                    .offset(y: showTitle ? 0 : 20)
                    .padding(.bottom, 32)
                
                // Series info card
                seriesInfoCard
                    .opacity(showDetails ? 1 : 0)
                    .offset(y: showDetails ? 0 : 30)
                    .padding(.horizontal, 24)
                
                Spacer()
                
                // Start Day 1 button
                Button {
                    dismiss()
                } label: {
                    HStack(spacing: 8) {
                        Text("Start Day 1")
                            .font(Theme.Typography.button)
                        Image(systemName: "arrow.right")
                            .font(.subheadline.weight(.semibold))
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.Dimensions.buttonHeight)
                    .background(
                        LinearGradient(
                            colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
                    .themeShadow(Theme.Shadows.md)
                }
                .opacity(showButton ? 1 : 0)
                .scaleEffect(showButton ? 1 : 0.9)
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
        .onAppear { runEntryAnimation() }
    }
    
    // MARK: - Series Info Card
    
    private var seriesInfoCard: some View {
        VStack(spacing: 16) {
            HStack(spacing: 20) {
                infoItem(icon: "calendar", label: "\(series.totalDays) Days")
                infoItem(icon: "chart.bar.fill", label: series.difficultyLevel.displayName)
            }
            
            if !series.topics.isEmpty {
                Divider().background(Theme.Colors.surfaceElevated)
                
                HStack(spacing: 6) {
                    ForEach(series.topics.prefix(3), id: \.self) { topic in
                        Text(topic)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.primary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Theme.Colors.primary.opacity(0.15))
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(20)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .stroke(.white.opacity(0.08))
                )
        }
    }
    
    private func infoItem(icon: String, label: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.accent)
            Text(label)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.text)
        }
    }
    
    // MARK: - Confetti
    
    private var confettiLayer: some View {
        GeometryReader { geo in
            ForEach(confettiPieces) { piece in
                Image(systemName: piece.icon)
                    .font(.system(size: piece.size))
                    .foregroundStyle(piece.color)
                    .position(piece.position)
                    .opacity(piece.opacity)
                    .rotationEffect(.degrees(piece.rotation))
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
    
    // MARK: - Animation
    
    private func runEntryAnimation() {
        // Spawn confetti
        spawnConfetti()
        
        withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1)) {
            showIcon = true
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8).delay(0.4)) {
            showTitle = true
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8).delay(0.7)) {
            showDetails = true
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.7).delay(1.0)) {
            showButton = true
        }
    }
    
    private func spawnConfetti() {
        let colors: [Color] = [
            Theme.Colors.accent, Theme.Colors.primary, Theme.Colors.success,
            Theme.Colors.prayer, Theme.Colors.info, Theme.Colors.warning
        ]
        let icons = ["star.fill", "sparkle", "circle.fill", "heart.fill"]
        
        for i in 0..<24 {
            let piece = ConfettiPiece(
                icon: icons[i % icons.count],
                color: colors[i % colors.count],
                size: CGFloat.random(in: 10...22),
                position: CGPoint(
                    x: CGFloat.random(in: 20...UIScreen.main.bounds.width - 20),
                    y: CGFloat.random(in: -40...UIScreen.main.bounds.height * 0.4)
                ),
                rotation: Double.random(in: 0...360),
                opacity: Double.random(in: 0.5...0.9)
            )
            confettiPieces.append(piece)
        }
        
        // Animate them falling
        withAnimation(.easeIn(duration: 3).delay(0.2)) {
            for i in confettiPieces.indices {
                confettiPieces[i].position.y += CGFloat.random(in: 300...600)
                confettiPieces[i].rotation += Double.random(in: 90...360)
                confettiPieces[i].opacity = 0
            }
        }
    }
}

// MARK: - Confetti Piece

struct ConfettiPiece: Identifiable {
    let id = UUID()
    let icon: String
    let color: Color
    let size: CGFloat
    var position: CGPoint
    var rotation: Double
    var opacity: Double
}

#Preview {
    EnrollmentConfirmView(
        series: .preview,
        enrollment: UserSeriesEnrollment(
            id: "e1", userId: "u1", seriesId: "series-1",
            series: .preview, enrolledAt: Date(), currentDay: 1,
            completedDays: [], isActive: true, isPrimary: true,
            lastActivityAt: Date(), reminderTime: "07:00:00", createdAt: Date()
        )
    )
    .environment(AppState.preview)
}
