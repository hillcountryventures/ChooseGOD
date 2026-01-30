import SwiftUI

/// Shown when free daily seeds (AI queries) run out — upsell to premium
struct NoSeedsView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var showPaywall = false
    @State private var plantScale: CGFloat = 0.8
    @State private var plantOpacity: Double = 0
    
    /// Seeds used today
    let seedsUsed: Int
    /// Total free seeds per day
    let seedsTotal: Int
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Wilted plant illustration
            ZStack {
                Circle()
                    .fill(Theme.Colors.accent.opacity(0.1))
                    .frame(width: 120, height: 120)
                
                Image(systemName: "leaf.fill")
                    .font(Theme.Typography.iconXXL)
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Theme.Colors.accent.opacity(0.5), Theme.Colors.accent.opacity(0.2)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .rotationEffect(.degrees(-15))
                    .scaleEffect(plantScale)
                    .opacity(plantOpacity)
            }
            
            VStack(spacing: 12) {
                Text("Your Seeds for Today")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(.white)
                
                // Seed dots
                HStack(spacing: 8) {
                    ForEach(0..<seedsTotal, id: \.self) { i in
                        Circle()
                            .fill(i < seedsUsed ? Theme.Colors.textTertiary : Theme.Colors.accent)
                            .frame(width: 12, height: 12)
                            .overlay {
                                if i < seedsUsed {
                                    Image(systemName: "xmark")
                                        .font(Theme.Typography.caption2)
                                        .foregroundStyle(.white.opacity(0.5))
                                }
                            }
                    }
                }
                
                Text("You've planted all \(seedsTotal) free seeds today.\nUpgrade for unlimited conversations, or come back tomorrow!")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
            
            // Premium benefits peek
            VStack(spacing: 10) {
                benefitRow(icon: "infinity", text: "Unlimited AI conversations")
                benefitRow(icon: "sparkles", text: "10+ spiritual practice modes")
                benefitRow(icon: "crown.fill", text: "7-day free trial")
            }
            .padding(20)
            .glassCard(cornerRadius: 16)
            
            Spacer()
            
            // CTA
            VStack(spacing: 14) {
                Button {
                    showPaywall = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "crown.fill")
                            .font(Theme.Typography.bodySmall)
                        Text("Unlock Unlimited Seeds")
                            .font(Theme.Typography.title3)
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background {
                        Capsule().fill(
                            LinearGradient(
                                colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                    }
                    .shadow(color: Theme.Colors.primary.opacity(0.3), radius: 12, y: 4)
                }
                
                Button("Come Back Tomorrow") {
                    dismiss()
                }
                .accessibilityLabel("Dismiss and come back tomorrow")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background {
            LinearGradient(
                colors: [Color(hex: "0F0A1A"), Theme.Colors.background],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        }
        .fullScreenCover(isPresented: $showPaywall) {
            PaywallView()
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
                plantScale = 1.0
                plantOpacity = 1.0
            }
        }
    }
    
    private func benefitRow(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.accent)
                .frame(width: 24)
            Text(text)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(.white)
            Spacer()
        }
    }
}

// MARK: - Preview

#Preview {
    NoSeedsView(seedsUsed: 3, seedsTotal: 3)
        .environment(AppState.preview)
}
