import SwiftUI

/// Strategy decision #5 + #12: three SKUs (monthly/annual/founding) on a single
/// paywall, free tier framed as genuinely generous, paywall sells depth not access.
/// Free chats stay at 5 lifetime; this screen converts on the *promise* of unlimited.
struct PaywallView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var viewModel = PaywallViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        header
                        wedgeCopy
                        planCards
                        ctaButton
                        socialProof
                        comparisonTable
                        legalFooter
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
                }
            }
            .onAppear {
                // Decision #15 — record that this user reached the conversion
                // surface, regardless of where they came from. The `source`
                // property is for funnel segmentation; today we only present
                // the paywall after the chat-quota wall, so the source is
                // implicit.
                AnalyticsService.shared.capture("paywall_presented")
                MagicMomentsService.shared.capture(.day14_conversion_paywall_shown)
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                ToolbarItem(placement: .topBarLeading) {
                    Button("Restore") {
                        Task {
                            await viewModel.restore(using: RevenueCatService.shared)
                            if viewModel.purchaseSucceeded { dismiss() }
                        }
                    }
                    .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
            .alert("Something went wrong", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage ?? "Please try again.")
            }
            .onChange(of: viewModel.purchaseSucceeded) { _, succeeded in
                guard succeeded else { return }
                MagicMomentsService.shared.capture(
                    .day14_converted,
                    properties: ["plan": viewModel.selectedPlan.rawValue]
                )
                dismiss()
            }
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(spacing: 8) {
            Text("Go Deeper")
                .font(.largeTitle)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            if viewModel.hasFreeTrial {
                Text("Try ChooseGOD Pro free for \(viewModel.trialDays) days")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.top, 16)
    }

    private var wedgeCopy: some View {
        Text("Everyone can use a little more grace.")
            .font(.title3)
            .italic()
            .foregroundStyle(Theme.Colors.text)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 24)
    }

    private var planCards: some View {
        VStack(spacing: 12) {
            planCard(
                package: .annual,
                title: "Annual",
                price: viewModel.annualPrice,
                subtitle: viewModel.annualMonthlyEquivalent + " · 2 months free",
                badge: "Best value"
            )
            planCard(
                package: .monthly,
                title: "Monthly",
                price: viewModel.monthlyPrice,
                subtitle: nil,
                badge: nil
            )
            if FeatureFlags.foundingMember && viewModel.foundingAvailable {
                foundingMemberCard
            }
        }
    }

    private func planCard(
        package: SubscriptionPackage,
        title: String,
        price: String,
        subtitle: String?,
        badge: String?
    ) -> some View {
        let isSelected = viewModel.selectedPlan == package

        return Button {
            viewModel.selectedPlan = package
        } label: {
            HStack(alignment: .center, spacing: 16) {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .font(.title2)
                    .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryText)

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(title)
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.text)
                        if let badge {
                            Text(badge)
                                .font(.caption2)
                                .bold()
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Theme.Colors.primary)
                                .clipShape(Capsule())
                        }
                    }
                    if let subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }

                Spacer()

                Text(price)
                    .font(.subheadline)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryText.opacity(0.3),
                            lineWidth: isSelected ? 2 : 1)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(isSelected ? Theme.Colors.primary.opacity(0.06) : Color.clear)
                    )
            )
        }
        .buttonStyle(.plain)
    }

    private var foundingMemberCard: some View {
        let isSelected = viewModel.selectedPlan == .foundingMember

        return Button {
            viewModel.selectedPlan = .foundingMember
        } label: {
            HStack(alignment: .center, spacing: 16) {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .font(.title2)
                    .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryText)

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text("Founding Member")
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.text)
                        Text("Limited")
                            .font(.caption2)
                            .bold()
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.orange)
                            .clipShape(Capsule())
                    }
                    Text("Lifetime access · \(viewModel.foundingSpotsRemaining) of \(viewModel.foundingCap) spots left")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }

                Spacer()

                Text(viewModel.foundingPrice)
                    .font(.subheadline)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(
                        isSelected ? Theme.Colors.primary : Color.orange.opacity(0.5),
                        lineWidth: isSelected ? 2 : 1
                    )
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(isSelected
                                  ? Theme.Colors.primary.opacity(0.06)
                                  : Color.orange.opacity(0.05))
                    )
            )
        }
        .buttonStyle(.plain)
    }

    private var ctaButton: some View {
        Button {
            Task { await viewModel.purchase(using: RevenueCatService.shared) }
        } label: {
            HStack {
                if viewModel.isPurchasing {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text(ctaLabel)
                        .font(.headline)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Theme.Colors.primary)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(viewModel.isPurchasing || viewModel.isLoading)
    }

    private var ctaLabel: String {
        switch viewModel.selectedPlan {
        case .foundingMember:
            return "Become a Founding Member"
        case .annual, .monthly:
            return viewModel.hasFreeTrial
                ? "Start \(viewModel.trialDays)-day Free Trial"
                : "Continue"
        }
    }

    private var socialProof: some View {
        VStack(spacing: 8) {
            Text("Join thousands of believers growing daily")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
    }

    private var comparisonTable: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Free vs Pro")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)

            VStack(spacing: 0) {
                comparisonHeaderRow
                ForEach(Array(PaywallViewModel.comparisonRows.enumerated()), id: \.offset) { _, row in
                    comparisonRow(row.feature, free: row.free, premium: row.premium)
                }
            }
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.Colors.secondaryText.opacity(0.2), lineWidth: 1)
            )
        }
        .padding(.top, 16)
    }

    private var comparisonHeaderRow: some View {
        HStack {
            Text("Feature").frame(maxWidth: .infinity, alignment: .leading)
            Text("Free").frame(width: 100, alignment: .center)
            Text("Pro").frame(width: 120, alignment: .center)
        }
        .font(.caption)
        .bold()
        .foregroundStyle(Theme.Colors.secondaryText)
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Theme.Colors.secondaryText.opacity(0.05))
    }

    private func comparisonRow(_ feature: String, free: String, premium: String) -> some View {
        HStack {
            Text(feature)
                .font(.caption)
                .foregroundStyle(Theme.Colors.text)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(free)
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .frame(width: 100, alignment: .center)
            Text(premium)
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.primary)
                .frame(width: 120, alignment: .center)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .overlay(
            Rectangle()
                .fill(Theme.Colors.secondaryText.opacity(0.1))
                .frame(height: 1),
            alignment: .top
        )
    }

    private var legalFooter: some View {
        VStack(spacing: 4) {
            if viewModel.selectedPlan != .foundingMember && viewModel.hasFreeTrial {
                Text("Cancel anytime before the trial ends. No charge.")
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            Text("Subscriptions auto-renew unless canceled in App Store settings. Founding Member is a one-time payment for lifetime access.")
                .font(.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 12)
    }
}

#Preview {
    PaywallView()
        .environment(AppState.preview)
}
