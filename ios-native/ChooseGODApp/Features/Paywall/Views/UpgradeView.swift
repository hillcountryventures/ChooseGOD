import SwiftUI

/// Shown when free lifetime AI conversations run out — upsell to premium
struct UpgradeView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var showPaywall = false
    @State private var iconScale: CGFloat = 0.8
    @State private var iconOpacity: Double = 0

    /// Chats used (lifetime)
    let chatsUsed: Int
    /// Total lifetime free chats
    let chatsTotal: Int
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Crown illustration
            ZStack {
                Circle()
                    .fill(Theme.Colors.accent.opacity(0.1))
                    .frame(width: 120, height: 120)
                
                Image(systemName: "crown.fill")
                    .font(Theme.Typography.iconXXL)
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Theme.Colors.primary, Theme.Colors.accent],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .scaleEffect(iconScale)
                    .opacity(iconOpacity)
            }
            
            VStack(spacing: 12) {
                Text("Upgrade for Unlimited Access")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(.white)
                
                // Chat dots
                HStack(spacing: 8) {
                    ForEach(0..<chatsTotal, id: \.self) { i in
                        Circle()
                            .fill(i < chatsUsed ? Theme.Colors.textTertiary : Theme.Colors.accent)
                            .frame(width: 12, height: 12)
                            .overlay {
                                if i < chatsUsed {
                                    Image(systemName: "xmark")
                                        .font(Theme.Typography.caption2)
                                        .foregroundStyle(.white.opacity(0.5))
                                }
                            }
                    }
                }
                
                Text("You've used all \(chatsTotal) free AI conversations.\nUpgrade for unlimited access!")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.lg)
            }
            
            // Premium benefits
            VStack(spacing: 10) {
                benefitRow(icon: "infinity", text: "Unlimited AI conversations")
                benefitRow(icon: "sparkles", text: "10+ spiritual practice modes")
                benefitRow(icon: "crown.fill", text: "7-day free trial")
            }
            .padding(Theme.Spacing.mdl)
            .glassCard(cornerRadius: Theme.CornerRadius.xl)
            
            Spacer()
            
            // CTA
            VStack(spacing: 14) {
                Button {
                    showPaywall = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "crown.fill")
                            .font(Theme.Typography.bodySmall)
                        Text("Unlock Unlimited Access")
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
                
                Button("Maybe Later") {
                    dismiss()
                }
                .accessibilityLabel("Dismiss upgrade prompt")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(.horizontal, Theme.Spacing.mdl)
            .padding(.bottom, Theme.Spacing.xl)
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
                iconScale = 1.0
                iconOpacity = 1.0
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
    UpgradeView(chatsUsed: 5, chatsTotal: 5)
        .environment(AppState.preview)
}
