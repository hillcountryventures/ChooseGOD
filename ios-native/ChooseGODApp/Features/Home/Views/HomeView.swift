import SwiftUI
import StoreKit

/// Home screen — Days With God hero, real daily verse, working quick actions,
/// and the Grace Mode catch-up trigger (Strategy Decision #2).
struct HomeView: View {
    @Environment(AppState.self) private var appState

    @State private var dailyVerse: Verse?
    @State private var isLoadingVerse: Bool = true

    @State private var graceEligibility: GraceModeService.CatchUpEligibility?
    @State private var hasOfferedThisSession: Bool = false

    @State private var showSettings: Bool = false
    @State private var showJournalCompose: Bool = false

    @State private var showInsightsConversion: Bool = false
    @AppStorage("insightsDay30Shown") private var insightsDay30Shown: Bool = false

    @State private var showLifeEventsCheckIn: Bool = false
    @State private var showSixMonthCheckIn: Bool = false
    @AppStorage("appInstallDate") private var appInstallDate: Double = 0

    private let bibleService = BibleServiceRouter()

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(greeting)
                                    .font(.subheadline)
                                    .foregroundStyle(Theme.Colors.secondaryText)
                                Text(displayName)
                                    .font(.title)
                                    .bold()
                                    .foregroundStyle(Theme.Colors.text)
                            }
                            Spacer()
                            Button {
                                showSettings = true
                            } label: {
                                Image(systemName: "gearshape.fill")
                                    .font(.title3)
                                    .foregroundStyle(Theme.Colors.secondaryText)
                            }
                            .accessibilityLabel("Settings")
                        }
                        .padding(.horizontal)
                        .padding(.top, 8)

                        // Decision #8 — primary engagement number
                        DaysWithGodCard()

                        // Decision #9 — Daily Art+Verse Drop. Flag-gated off for
                        // v1.2 (no curated_art/daily_drops content seeded yet).
                        if FeatureFlags.dailyDrop {
                            DailyDropCard()
                        }

                        // Daily Verse Card (real, from BibleServiceRouter)
                        dailyVerseCard

                        // Quick Actions
                        VStack(spacing: 12) {
                            Button {
                                appState.selectedTab = .bible
                            } label: {
                                quickActionLabel(icon: "book.fill", title: "Read Bible", primary: true)
                            }

                            Button {
                                showJournalCompose = true
                            } label: {
                                quickActionLabel(icon: "pencil.and.scribble", title: "Journal", primary: false)
                            }
                        }
                        .padding(.horizontal)

                        Spacer(minLength: 100) // leave room for the floating tab bar + FAB
                    }
                }
            }
            .task(id: appState.currentUser?.id) {
                stampInstallDateIfNeeded()
                async let verse: () = loadDailyVerse()
                async let grace: () = detectGraceEligibility()
                async let insights: () = detectDay30Insights()
                _ = await (verse, grace, insights)
                detectCheckIns()
            }
            .sheet(item: $graceEligibility) { eligibility in
                GraceSummaryModal(eligibility: eligibility)
                    .environment(appState)
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
                    .environment(appState)
            }
            .sheet(isPresented: $showJournalCompose) {
                JournalComposeView()
                    .environment(appState)
            }
            .sheet(isPresented: $showInsightsConversion) {
                InsightsView(mode: .conversion)
                    .environment(appState)
            }
            .sheet(isPresented: $showLifeEventsCheckIn) {
                LifeEventsCheckInView()
                    .environment(appState)
            }
            .sheet(isPresented: $showSixMonthCheckIn) {
                SixMonthCovenantCheckInView()
                    .environment(appState)
            }
        }
    }

    // MARK: - Daily verse

    private var dailyVerseCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundStyle(Theme.Colors.primary)
                Text("Today's Verse")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
            }

            if let verse = dailyVerse {
                Button {
                    appState.selectedTab = .bible
                } label: {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("\u{201C}\(verse.text)\u{201D}")
                            .font(.body)
                            .italic()
                            .foregroundStyle(Theme.Colors.text)
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)
                        HStack {
                            Spacer()
                            Text("— \(verse.reference)")
                                .font(.caption)
                                .bold()
                                .foregroundStyle(Theme.Colors.primary)
                        }
                    }
                }
                .buttonStyle(.plain)
            } else if isLoadingVerse {
                ProgressView()
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 12)
            } else {
                Button {
                    appState.selectedTab = .bible
                } label: {
                    Text("Couldn't load today's verse. Tap to open the Bible.")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.primary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(Theme.Colors.surface)
        )
        .padding(.horizontal)
    }

    private func loadDailyVerse() async {
        isLoadingVerse = true
        defer { isLoadingVerse = false }
        dailyVerse = try? await bibleService.getDailyVerse()
    }

    // MARK: - Quick action style

    private func quickActionLabel(icon: String, title: String, primary: Bool) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.headline)
            Text(title)
                .font(.headline)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption2)
                .opacity(0.6)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(primary ? Theme.Colors.primary : Theme.Colors.surface)
        .foregroundStyle(primary ? Color.white : Theme.Colors.text)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Greeting

    private var displayName: String {
        appState.currentUser?.firstName ?? "Welcome"
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:  return "Good morning,"
        case 12..<17: return "Good afternoon,"
        case 17..<22: return "Good evening,"
        default:      return "Peace be with you,"
        }
    }

    // MARK: - Grace Mode

    private func detectGraceEligibility() async {
        guard !hasOfferedThisSession else { return }
        guard let userId = appState.currentUser?.id else { return }
        if let eligibility = await GraceModeService.shared.detectMissedDays(userId: userId) {
            self.graceEligibility = eligibility
            self.hasOfferedThisSession = true
            // Decision #15 — Grace Mode triggered for the first time this session.
            MagicMomentsService.shared.capture(
                .day46_grace_mode_triggered,
                properties: ["missed_days": eligibility.missedDays.count]
            )
        }
    }

    /// Decision G2 — Day-30 conversion moment. The Insights showcase IS the
    /// paywall surface; the user sees the moat firsthand before being asked
    /// to pay. Fires once per device for free users at Days With God >= 30.
    private func detectDay30Insights() async {
        guard !insightsDay30Shown else { return }
        guard let user = appState.currentUser, !user.isPremium else { return }
        // Use Days With God as the trigger (cumulative, never resets) so users
        // who installed but haven't used the app every day still hit it once
        // they cross the 30-day threshold by usage.
        let dwg = StreakManager.shared.daysWithGod
        guard dwg >= 30 else { return }
        showInsightsConversion = true
        insightsDay30Shown = true
    }

    /// Decision #17 — schedule the 60-day life-events check-in + 6-month
    /// covenant check-in. Only one fires per Home appearance to avoid
    /// stacked modals; 6-month takes priority over 60-day.
    private func detectCheckIns() {
        // Flag-gated off for v1.2 (won't fire for <60-day users; no launch value).
        guard FeatureFlags.checkIns else { return }
        // Don't pile on top of Day-30 conversion or Grace catch-up modals.
        if showInsightsConversion || graceEligibility != nil { return }

        let install: Date? = appInstallDate > 0
            ? Date(timeIntervalSince1970: appInstallDate)
            : nil

        if CheckInTrigger.shouldShowSixMonth(installDate: install) {
            showSixMonthCheckIn = true
            return
        }
        if CheckInTrigger.shouldShowLifeEvents(installDate: install) {
            showLifeEventsCheckIn = true
        }
    }

    /// First-ever Home appearance stamps the install date. Used by the
    /// check-in cadence logic to know when "60 days" and "6 months" begin.
    private func stampInstallDateIfNeeded() {
        guard appInstallDate == 0 else { return }
        appInstallDate = Date().timeIntervalSince1970
    }
}

#Preview {
    HomeView()
        .environment(AppState.preview)
}
