import SwiftUI

/// Full paywall screen — feature comparison, social proof, plan toggle, glass design
struct PaywallView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = PaywallViewModel()
    
    // Animation state
    @State private var headerVisible = false
    @State private var featuresVisible = false
    @State private var plansVisible = false
    @State private var ctaVisible = false
    @State private var crownRotation: Double = 0
    @State private var sparkleScale: CGFloat = 0.5
    @State private var sparkleOpacity: Double = 0
    
    var body: some View {
        ZStack {
            // Premium gradient background
            backgroundGradient
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    closeButton
                    heroSection
                    socialProofBar
                    featureComparison
                    testimonialsSection
                    planSelector
                    purchaseButton
                    trialNote
                    restoreAndLegal
                    Color.clear.frame(height: 20)
                }
                .padding(.horizontal, Theme.Spacing.mdl)
            }
        }
        .alert(AppStrings.Errors.genericTitle, isPresented: $viewModel.showError) {
            Button(AppStrings.Errors.ok) {}
        } message: {
            Text(viewModel.errorMessage ?? AppStrings.Errors.somethingWentWrong)
        }
        .onChange(of: viewModel.purchaseSucceeded) { _, success in
            if success { dismiss() }
        }
        .onAppear { animateEntrance() }
        .onAppear { AnalyticsService.shared.screen("paywall") }
    }
    
    // MARK: - Background
    
    private var backgroundGradient: some View {
        LinearGradient(
            colors: Theme.Colors.paywallGradient,
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
        .overlay {
            // Subtle radial glow behind crown
            RadialGradient(
                colors: [Theme.Colors.primary.opacity(0.15), .clear],
                center: .top,
                startRadius: 20,
                endRadius: 300
            )
            .ignoresSafeArea()
        }
    }
    
    // MARK: - Close Button
    
    private var closeButton: some View {
        HStack {
            Spacer()
            Button { dismiss() } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(.white.opacity(0.5))
            }
        }
        .padding(.top, Theme.Spacing.sm)
    }
    
    // MARK: - Hero
    
    private var heroSection: some View {
        VStack(spacing: 16) {
            // Animated crown with sparkles
            ZStack {
                // Sparkle ring
                ForEach(0..<6, id: \.self) { i in
                    Image(systemName: "sparkle")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.accent)
                        .offset(
                            x: cos(Double(i) * .pi / 3) * 50,
                            y: sin(Double(i) * .pi / 3) * 50
                        )
                        .scaleEffect(sparkleScale)
                        .opacity(sparkleOpacity)
                }
                
                Image(systemName: "crown.fill")
                    .font(Theme.Typography.iconMassive)
                    .foregroundStyle(
                        LinearGradient(
                            colors: Theme.Colors.goldGradient,
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .shadow(color: Theme.Colors.goldGradient[0].opacity(0.5), radius: 20)
                    .rotationEffect(.degrees(crownRotation))
            }
            .frame(height: 100)
            
            Text(AppStrings.Paywall.heroTitle)
                .font(Theme.Typography.title1)
                .multilineTextAlignment(.center)
                .foregroundStyle(.white)
            
            Text(AppStrings.Paywall.heroSubtitle)
                .font(Theme.Typography.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.horizontal, Theme.Spacing.sm)
        }
        .opacity(headerVisible ? 1 : 0)
        .offset(y: headerVisible ? 0 : 20)
    }
    
    // MARK: - Social Proof Bar
    
    private var socialProofBar: some View {
        HStack(spacing: 20) {
            socialProofItem(icon: "person.2.fill", value: "\(viewModel.communityCount / 1000)K+", label: AppStrings.Paywall.believers)
            divider
            socialProofItem(icon: "star.fill", value: viewModel.rating, label: AppStrings.Paywall.ratings(viewModel.ratingCount))
            divider
            socialProofItem(icon: "heart.fill", value: "7", label: AppStrings.Paywall.dayTrial)
        }
        .padding(.vertical, Theme.Spacing.mds)
        .padding(.horizontal, Theme.Spacing.md)
        .glassCard(cornerRadius: Theme.CornerRadius.xl)
        .opacity(headerVisible ? 1 : 0)
    }
    
    private func socialProofItem(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.accent)
                Text(value)
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(.white)
            }
            Text(label)
                .font(Theme.Typography.caption2)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
    }
    
    private var divider: some View {
        Rectangle()
            .fill(.white.opacity(0.15))
            .frame(width: 1, height: 30)
    }
    
    // MARK: - Feature Comparison
    
    private var featureComparison: some View {
        VStack(spacing: 0) {
            // Header row
            HStack {
                Text(AppStrings.Paywall.featureHeader)
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(Theme.Colors.textTertiary)
                Spacer()
                Text(AppStrings.Paywall.freeColumn)
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .frame(width: 70)
                Text(AppStrings.Paywall.proColumn)
                    .font(Theme.Typography.captionBold)
                    .foregroundStyle(Theme.Colors.accent)
                    .frame(width: 70)
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.smd)
            
            Divider().background(.white.opacity(0.1))
            
            // Feature rows with staggered animation
            ForEach(Array(PaywallViewModel.comparisonRows.enumerated()), id: \.offset) { index, row in
                HStack {
                    Text(row.feature)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(.white)
                    Spacer()
                    Text(row.free)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                        .frame(width: 70)
                    Text(row.premium)
                        .font(Theme.Typography.captionSemibold)
                        .foregroundStyle(Theme.Colors.accent)
                        .frame(width: 70)
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.smd)
                .opacity(featuresVisible ? 1 : 0)
                .offset(x: featuresVisible ? 0 : 30)
                .animation(
                    .spring(response: 0.5, dampingFraction: 0.7).delay(Double(index) * 0.08),
                    value: featuresVisible
                )
                
                if index < PaywallViewModel.comparisonRows.count - 1 {
                    Divider().background(.white.opacity(0.06))
                }
            }
        }
        .glassCard(cornerRadius: Theme.CornerRadius.xl)
    }
    
    // MARK: - Testimonials
    
    private var testimonialsSection: some View {
        VStack(spacing: 12) {
            ForEach(Array(PaywallViewModel.testimonials.enumerated()), id: \.offset) { index, t in
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "quote.opening")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.primary.opacity(0.6))
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(t.text)
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(.white.opacity(0.85))
                            .italic()
                        Text("— \(t.author)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
                .padding(Theme.Spacing.mds)
                .frame(maxWidth: .infinity, alignment: .leading)
                .glassCard(cornerRadius: Theme.CornerRadius.lg, opacity: 0.5)
                .opacity(featuresVisible ? 1 : 0)
                .offset(y: featuresVisible ? 0 : 15)
                .animation(
                    .spring(response: 0.5).delay(0.5 + Double(index) * 0.1),
                    value: featuresVisible
                )
            }
        }
    }
    
    // MARK: - Plan Selector
    
    private var planSelector: some View {
        VStack(spacing: 12) {
            // Annual plan
            planCard(
                isSelected: viewModel.selectedPlan == .annual,
                title: AppStrings.Paywall.annual,
                price: viewModel.annualPrice,
                subtitle: viewModel.annualMonthlyEquivalent,
                badge: AppStrings.Paywall.save50
            ) {
                withAnimation(.spring(response: 0.3)) { viewModel.selectedPlan = .annual }
            }
            
            // Monthly plan
            planCard(
                isSelected: viewModel.selectedPlan == .monthly,
                title: AppStrings.Paywall.monthly,
                price: viewModel.monthlyPrice,
                subtitle: nil,
                badge: nil
            ) {
                withAnimation(.spring(response: 0.3)) { viewModel.selectedPlan = .monthly }
            }
        }
        .opacity(plansVisible ? 1 : 0)
        .offset(y: plansVisible ? 0 : 20)
    }
    
    private func planCard(
        isSelected: Bool,
        title: String,
        price: String,
        subtitle: String?,
        badge: String?,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(title)
                            .font(Theme.Typography.title3)
                            .foregroundStyle(.white)
                        
                        if let badge {
                            Text(badge)
                                .font(Theme.Typography.caption2)
                                .foregroundStyle(.white)
                                .padding(.horizontal, Theme.Spacing.sm)
                                .padding(.vertical, 3)
                                .background(
                                    Capsule().fill(
                                        LinearGradient(
                                            colors: [.green, .green.opacity(0.7)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                )
                        }
                    }
                    
                    HStack(spacing: 6) {
                        Text(price)
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(Theme.Colors.textSecondary)
                        if let subtitle {
                            Text("(\(subtitle))")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textTertiary)
                        }
                    }
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.textTertiary)
            }
            .padding(Theme.Spacing.md)
            .background {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .fill(.ultraThinMaterial)
                    .opacity(0.7)
            }
            .overlay {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .stroke(
                        isSelected ? Theme.Colors.primary : .white.opacity(0.1),
                        lineWidth: isSelected ? 2 : 1
                    )
            }
        }
    }
    
    // MARK: - Purchase Button
    
    private var purchaseButton: some View {
        Button {
            Task { await viewModel.purchase(using: appState.subscriptionService) }
        } label: {
            Group {
                if viewModel.isPurchasing {
                    ShimmerView(height: 20)
                } else {
                    HStack(spacing: 8) {
                        Image(systemName: "crown.fill")
                            .font(Theme.Typography.bodySmall)
                        Text(viewModel.hasFreeTrial ? AppStrings.Paywall.startFreeTrial : AppStrings.Paywall.subscribeNow)
                            .font(Theme.Typography.title3)
                    }
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background {
                Capsule().fill(
                    LinearGradient(
                        colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
            }
            .shadow(color: Theme.Colors.primary.opacity(0.4), radius: 16, y: 6)
        }
        .disabled(viewModel.isPurchasing)
        .opacity(ctaVisible ? 1 : 0)
        .scaleEffect(ctaVisible ? 1 : 0.9)
    }
    
    // MARK: - Trial Note
    
    private var trialNote: some View {
        VStack(spacing: 4) {
            if viewModel.hasFreeTrial {
                let period = viewModel.selectedPlan == .annual ? "year" : "month"
                let price = viewModel.selectedPlan == .annual ? viewModel.annualPrice : viewModel.monthlyPrice
                Text(AppStrings.Paywall.trialNote(days: viewModel.trialDays, price: price, period: period))
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .multilineTextAlignment(.center)
            }
            let renewalPeriod = viewModel.selectedPlan == .annual ? "year" : "month"
            let renewalPrice = viewModel.selectedPlan == .annual ? viewModel.annualPrice : viewModel.monthlyPrice
            Text(AppStrings.Paywall.renewalDisclosure(price: renewalPrice, period: renewalPeriod))
                .font(Theme.Typography.caption2)
                .foregroundStyle(Theme.Colors.textTertiary.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
        }
    }
    
    // MARK: - Restore & Legal
    
    private var restoreAndLegal: some View {
        VStack(spacing: 10) {
            Button {
                Task { await viewModel.restore(using: appState.subscriptionService) }
            } label: {
                if viewModel.isRestoring {
                    ShimmerView(height: 20)
                } else {
                    Text(AppStrings.Paywall.restorePurchases)
                        .accessibilityLabel(AppStrings.Paywall.restoreLabel)
                        .accessibilityHint(AppStrings.Paywall.restoreHint)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
            
            VStack(spacing: 4) {
                HStack(spacing: 4) {
                    Text(AppStrings.Paywall.legalPrefix)
                        .font(Theme.Typography.caption2)
                        .foregroundStyle(Theme.Colors.textTertiary.opacity(0.6))
                    Link(AppStrings.Auth.termsOfService, destination: AppURLs.terms)
                        .font(Theme.Typography.caption2)
                    Text(AppStrings.Paywall.legalAnd)
                        .font(Theme.Typography.caption2)
                        .foregroundStyle(Theme.Colors.textTertiary.opacity(0.6))
                    Link(AppStrings.Auth.privacyPolicy, destination: AppURLs.privacy)
                        .font(Theme.Typography.caption2)
                }
                Text(AppStrings.Paywall.legalSuffix)
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary.opacity(0.6))
            }
            .multilineTextAlignment(.center)
            .padding(.horizontal, Theme.Spacing.mdl)
        }
    }
    
    // MARK: - Animation
    
    private func animateEntrance() {
        withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
            headerVisible = true
        }
        withAnimation(.spring(response: 0.6).delay(0.2)) {
            featuresVisible = true
        }
        withAnimation(.spring(response: 0.5).delay(0.5)) {
            plansVisible = true
        }
        withAnimation(.spring(response: 0.5).delay(0.7)) {
            ctaVisible = true
        }
        // Crown subtle float
        withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
            crownRotation = 5
        }
        // Sparkle pulse
        withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true).delay(0.3)) {
            sparkleScale = 1.0
            sparkleOpacity = 0.8
        }
    }
}

// MARK: - Preview

#Preview {
    PaywallView()
        .environment(AppState.preview)
}
