import SwiftUI

/// Share invite code, track referrals, earn free premium days
struct ReferralView: View {
    @Environment(AppState.self) private var appState
    @State private var referralService = ReferralService.shared
    @State private var stats: ReferralStats?
    @State private var isLoading = true
    @State private var isCopied = false
    @State private var giftBounce = false
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 28) {
                heroSection
                
                // Show active referral premium status
                if referralService.hasReferralPremium, let expiry = referralService.referralPremiumExpiry {
                    referralPremiumBanner(expiry: expiry)
                }
                
                codeCard
                shareButton
                statsSection
                howItWorks
                scriptureCard
                Color.clear.frame(height: 20)
            }
            .padding(.horizontal, Theme.Spacing.mdl)
            .padding(.top, Theme.Spacing.mds)
        }
        .background(Theme.Colors.background)
        .navigationTitle("Share & Earn")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadStats() }
        // TODO: Fix AnalyticsService import - .onAppear { AnalyticsService.shared.screen("referral") }
    }
    
    // MARK: - Referral Premium Banner
    
    private func referralPremiumBanner(expiry: Date) -> some View {
        HStack(spacing: 14) {
            Image(systemName: "crown.fill")
                .font(Theme.Typography.title2)
                .foregroundStyle(.yellow)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Referral Pro Active!")
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(Theme.Colors.text)
                Text("Premium until \(expiry.formatted(date: .abbreviated, time: .omitted))")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                if referralService.totalRedeemedDays > 0 {
                    Text("\(referralService.totalRedeemedDays) days earned from referrals")
                        .font(Theme.Typography.caption2)
                        .foregroundStyle(Theme.Colors.accent)
                }
            }
            
            Spacer()
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(.ultraThinMaterial)
        }
        .overlay {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .stroke(.yellow.opacity(0.3), lineWidth: 1)
        }
    }
    
    // MARK: - Hero
    
    private var heroSection: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Theme.Colors.accent.opacity(0.15))
                    .frame(width: 100, height: 100)
                
                Image(systemName: "gift.fill")
                    .font(Theme.Typography.iconXL)
                    .foregroundStyle(Theme.Colors.accent)
                    .scaleEffect(giftBounce ? 1.1 : 1.0)
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                    giftBounce = true
                }
            }
            
            Text("Give 7 Days, Get 7 Days")
                .font(Theme.Typography.title2)
                .foregroundStyle(.white)
            
            Text("Share ChooseGOD with friends. When they try Pro, you both get 7 days free!")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
        }
    }
    
    // MARK: - Code Card
    
    private var codeCard: some View {
        VStack(spacing: 10) {
            Text("Your Referral Code")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
            
            HStack(spacing: 14) {
                if isLoading {
                    ShimmerView(height: 20)
                } else {
                    Text(stats?.referralCode ?? "------")
                        .font(Theme.Typography.title1)
                        .foregroundStyle(Theme.Colors.primary)
                        .tracking(3)
                }
                
                Button {
                    copyCode()
                } label: {
                    Image(systemName: isCopied ? "checkmark" : "doc.on.doc")
                        .font(Theme.Typography.subheadlineMedium)
                        .foregroundStyle(isCopied ? Theme.Colors.success : Theme.Colors.primary)
                        .frame(width: 40, height: 40)
                        .background(Theme.Colors.background.opacity(0.6), in: RoundedRectangle(cornerRadius: Theme.CornerRadius.md))
                }
            }
            
            if isCopied {
                Text("Copied to clipboard!")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.success)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(Theme.Spacing.mdl)
        .frame(maxWidth: .infinity)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(Theme.Colors.surface)
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .strokeBorder(Theme.Colors.primary, style: StrokeStyle(lineWidth: 2, dash: [8, 6]))
                }
        }
    }
    
    // MARK: - Share Button
    
    private var shareButton: some View {
        Button {
            shareCode()
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "square.and.arrow.up")
                    .font(Theme.Typography.button)
                Text("Share with Friends")
                    .font(Theme.Typography.title3)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Capsule().fill(Theme.Colors.primary))
        }
    }
    
    // MARK: - Stats
    
    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your Impact")
                .font(Theme.Typography.title3)
                .foregroundStyle(.white)
            
            HStack(spacing: 12) {
                statCard(value: "\(stats?.totalReferrals ?? 0)", label: "Friends Invited", color: Theme.Colors.info)
                statCard(value: "\(stats?.successfulReferrals ?? 0)", label: "Tried Pro", color: Theme.Colors.success)
                statCard(value: "\(stats?.daysEarned ?? 0)", label: "Days Earned", color: Theme.Colors.accent)
            }
        }
    }
    
    private func statCard(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Text(value)
                .font(Theme.Typography.title1)
                .foregroundStyle(color)
            Text(label)
                .font(Theme.Typography.caption2)
                .foregroundStyle(Theme.Colors.textTertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.md)
        .glassCard(cornerRadius: Theme.CornerRadius.lg)
    }
    
    // MARK: - How It Works
    
    private var howItWorks: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("How It Works")
                .font(Theme.Typography.title3)
                .foregroundStyle(.white)
            
            stepRow(number: 1, title: "Share Your Code", desc: "Send your unique code to friends who might enjoy ChooseGOD")
            stepRow(number: 2, title: "They Sign Up", desc: "Your friend downloads the app and enters your code")
            stepRow(number: 3, title: "You Both Win", desc: "When they start their Pro trial, you both get 7 extra days free")
        }
    }
    
    private func stepRow(number: Int, title: String, desc: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Text("\(number)")
                .font(Theme.Typography.subheadlineSemibold)
                .foregroundStyle(.white)
                .frame(width: 30, height: 30)
                .background(Circle().fill(Theme.Colors.primary))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(.white)
                Text(desc)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
    }
    
    // MARK: - Scripture
    
    private var scriptureCard: some View {
        VStack(spacing: 8) {
            Image(systemName: "book")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
            Text("\u{201C}A generous person will prosper; whoever refreshes others will be refreshed.\u{201D}")
                .font(Theme.Typography.bodySmall)
                .italic()
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            Text("\u{2014} Proverbs 11:25")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding(Theme.Spacing.mdl)
        .frame(maxWidth: .infinity)
        .glassCard(cornerRadius: Theme.CornerRadius.lg)
    }
    
    // MARK: - Actions
    
    private func loadStats() async {
        guard let userId = appState.currentUser?.id else {
            isLoading = false
            return
        }
        stats = await referralService.getOrCreateStats(userId: userId)
        
        // Sync earned days → premium access
        if let stats = stats {
            referralService.redeemEarnedDays(for: stats)
        }
        
        isLoading = false
    }
    
    private func copyCode() {
        guard let code = stats?.referralCode else { return }
        UIPasteboard.general.string = code
        withAnimation { isCopied = true }
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { isCopied = false }
        }
    }
    
    private func shareCode() {
        guard let code = stats?.referralCode else { return }
        let url = "https://choosegod.app/invite/\(code)"
        let message = "I've been using ChooseGOD for Bible study and it's amazing! Use my invite code \"\(code)\" to get 7 days of Pro free:\n\(url)"
        
        let activityVC = UIActivityViewController(activityItems: [message], applicationActivities: nil)
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = windowScene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        ReferralView()
            .environment(AppState.preview)
    }
}
