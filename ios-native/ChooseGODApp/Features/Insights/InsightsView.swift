import SwiftUI

/// Decision G2 — the "AI knows you" showcase. Renders a personalized AI
/// summary of the user's walk so far. Shown:
///   * Once on Day 30 of the trial as the conversion paywall (`mode = .conversion`)
///   * Monthly thereafter for Pro users on the Journey tab (`mode = .review`)
///
/// The paywall *is* the moat showcase — the user sees the moat firsthand
/// before being asked to pay for unlimited access to it.
struct InsightsView: View {
    enum Mode {
        case conversion   // Day-30 trial-end paywall
        case review       // Pro monthly review (no paywall)
    }

    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    let mode: Mode

    @State private var insight: InsightsService.Insight?
    @State private var loadError: String?
    @State private var isLoading: Bool = true
    @State private var showFullPaywall: Bool = false

    init(mode: Mode = .conversion) {
        self.mode = mode
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 22) {
                        header
                        if isLoading {
                            loadingState
                        } else if let insight {
                            sentimentArcCard(insight.sentimentArc)
                            themesSection(insight.themes)
                            growthObservation(insight.growthObservation)
                            growthOpportunity(insight.growthOpportunity)
                        } else if let loadError {
                            errorState(loadError)
                        }
                        if mode == .conversion { conversionFooter }
                    }
                    .padding(20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
            .fullScreenCover(isPresented: $showFullPaywall) {
                PaywallView()
                    .environment(appState)
            }
            .task { await load() }
            .onAppear {
                AnalyticsService.shared.capture(
                    "insights_shown",
                    properties: ["mode": mode == .conversion ? "conversion" : "review"]
                )
                if mode == .conversion {
                    MagicMomentsService.shared.capture(.day14_conversion_paywall_shown,
                                                       properties: ["surface": "insights"])
                }
            }
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .foregroundStyle(Theme.Colors.primary)
                Text(mode == .conversion ? "30 days with God." : "This month with God.")
                    .font(.title2)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            Text(headerSubtitle)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var headerSubtitle: String {
        switch mode {
        case .conversion:
            return "Here's what we noticed about your walk. This is what makes us different — the AI here actually knows you."
        case .review:
            return "Your monthly Insights — drawn from your prayers, journal, and scripture."
        }
    }

    private var loadingState: some View {
        VStack(spacing: 12) {
            ProgressView().scaleEffect(1.2)
            Text("Reading your walk so far…")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    private func sentimentArcCard(_ arc: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            sectionLabel("The arc of your month")
            Text(arc)
                .font(.body)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func themesSection(_ themes: [InsightsService.Insight.Theme]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionLabel("What kept surfacing")
            VStack(spacing: 10) {
                ForEach(themes.indices, id: \.self) { idx in
                    let theme = themes[idx]
                    VStack(alignment: .leading, spacing: 4) {
                        Text(theme.label)
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.primary)
                        Text(theme.summary)
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.text)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Theme.Colors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }

    private func growthObservation(_ text: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            sectionLabel("Where you're growing")
            Text(text)
                .font(.body)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.green.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.green.opacity(0.3), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func growthOpportunity(_ text: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            sectionLabel("A gentle invitation")
            Text(text)
                .font(.body)
                .italic()
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.primary.opacity(0.06))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.Colors.primary.opacity(0.4), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var conversionFooter: some View {
        VStack(spacing: 12) {
            Text("Lock in unlimited Insights every month.")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
                .multilineTextAlignment(.center)
            Text("Pro = monthly Insights, unlimited AI conversations, all spiritual practices, and more — all built around your walk.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)

            Button {
                showFullPaywall = true
            } label: {
                Text("See plans")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Button { dismiss() } label: {
                Text("Continue with free plan")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
            }
        }
        .padding(.top, 12)
    }

    private func errorState(_ message: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: "exclamationmark.bubble")
                .font(.title2)
                .foregroundStyle(Theme.Colors.secondaryText)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
            Button("Try again") {
                Task { await load(force: true) }
            }
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(.caption)
            .bold()
            .foregroundStyle(Theme.Colors.secondaryText)
    }

    // MARK: - Actions

    @MainActor
    private func load(force: Bool = false) async {
        guard let userId = appState.currentUser?.id else {
            loadError = "Sign in to view your Insights."
            isLoading = false
            return
        }
        isLoading = true
        loadError = nil
        do {
            insight = try await InsightsService.shared.fetch(userId: userId, force: force)
        } catch {
            loadError = "Couldn't load your Insights right now. Try again in a moment."
        }
        isLoading = false
    }
}

#Preview {
    InsightsView(mode: .conversion)
        .environment(AppState.preview)
}
