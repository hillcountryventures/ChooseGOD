import SwiftUI
import StoreKit

/// Main home screen with daily verse and quick actions
struct HomeView: View {
    @Environment(AppState.self) private var appState
    @State private var dailyVerse: Verse?
    @State private var isLoading = true
    @State private var dailyVerseError: String?
    @State private var streak = 0
    @State private var showChat = false
    @State private var showShareSheet = false
    @State private var showStreakRecovery = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Animated gradient background
                backgroundGradient
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Greeting with glass pill
                        greetingSection
                        
                        // Streak recovery prompt
                        if showStreakRecovery {
                            streakRecoveryCard
                        }
                        
                        // Fix 5: Continue Reading banner
                        continueReadingCard
                        
                        // Daily Verse Card (Glass)
                        dailyVerseCard

                        // Hebrew Calendar Context
                        CalendarContextCard()

                        // Quick Actions with glass
                        quickActionsSection
                        
                        // Stats row
                        statsSection
                        
                        Spacer(minLength: 100)
                    }
                    .padding()
                }
                .refreshable {
                    await loadDailyVerse()
                }
            }
            .navigationBarHidden(true)
            .task {
                await loadDailyVerse()
            }
            .onAppear {
                loadStreak()
                AnalyticsService.shared.screen("home")
            }
            // Fix 4: Share sheet
            .sheet(isPresented: $showShareSheet) {
                if let verse = dailyVerse {
                    let shareText = "\"\(verse.text)\"\n— \(verse.reference) (\(verse.translation))\n\nRead more on ChooseGOD: https://choosegod.app/verse/\(verse.book)/\(verse.chapter)/\(verse.verse)"
                    ShareSheet(activityItems: [shareText])
                }
            }
        }
    }
    
    // MARK: - Streak Loading
    
    private func loadStreak() {
        // Record activity on home screen visit & get real streak
        let manager = StreakManager.shared
        streak = manager.recordActivity()
        
        // Check for streak milestone review prompt
        ReviewRequestManager.shared.requestIfStreakMilestone(streak)
        
        // Check if streak recovery is available
        showStreakRecovery = manager.canRecoverStreak
        
        // Grant streak freeze to premium users
        if appState.subscriptionService.isPremium {
            manager.grantStreakFreeze()
        }
    }
    
    // MARK: - Background
    
    private var backgroundGradient: some View {
        LinearGradient(
            colors: Theme.Colors.backgroundGradient,
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
    
    // MARK: - Streak Recovery Card
    
    private var streakRecoveryCard: some View {
        HStack(spacing: 14) {
            Image(systemName: "snowflake")
                .font(Theme.Typography.title2)
                .foregroundStyle(.cyan)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Streak Freeze Available!")
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(Theme.Colors.text)
                Text(StreakManager.shared.streakRecoveryMessage ?? "Keep your streak alive!")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            Spacer()
            
            Button("Use") {
                streak = StreakManager.shared.recordActivity()
                withAnimation { showStreakRecovery = false }
            }
            .font(Theme.Typography.subheadlineSemibold)
            .foregroundStyle(.white)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(Capsule().fill(Theme.Colors.primary))
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(.ultraThinMaterial)
        }
        .overlay {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .stroke(.cyan.opacity(0.3), lineWidth: 1)
        }
        .transition(.move(edge: .top).combined(with: .opacity))
    }
    
    // MARK: - Subviews
    
    private var greetingSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(greeting)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                
                Text(appState.currentUser?.displayName ?? AppStrings.Home.defaultName)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.text)
            }
            
            Spacer()
            
            // Streak badge with glass
            HStack(spacing: 6) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("\(streak)")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(Theme.Colors.text)
            }
            .padding(.horizontal, Theme.Spacing.mds)
            .padding(.vertical, Theme.Spacing.smd)
            .background {
                Capsule()
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                Capsule()
                    .stroke(.white.opacity(0.1), lineWidth: 1)
            }
            .accessibilityLabel(AccessibilityLabels.streak(days: streak))
        }
        .padding(.top, 60)
    }
    
    // MARK: - Fix 5: Continue Reading Card
    
    @ViewBuilder
    private var continueReadingCard: some View {
        let lastBook = UserDefaults.standard.string(forKey: "lastReadBook")
        let lastChapter = UserDefaults.standard.integer(forKey: "lastReadChapter")
        let lastDate = UserDefaults.standard.object(forKey: "lastReadDate") as? Date
        
        if let book = lastBook, lastChapter > 0 {
            NavigationLink {
                BibleReaderView()
            } label: {
                HStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.primary.opacity(0.2))
                            .frame(width: 44, height: 44)
                        Image(systemName: "book.fill")
                            .font(Theme.Typography.title3)
                            .foregroundStyle(Theme.Colors.primary)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Continue Reading")
                            .font(Theme.Typography.subheadlineSemibold)
                            .foregroundStyle(Theme.Colors.text)
                        
                        HStack(spacing: 4) {
                            Text("\(book) \(lastChapter)")
                                .font(Theme.Typography.captionMedium)
                                .foregroundStyle(Theme.Colors.secondaryText)
                            
                            if let date = lastDate {
                                Text("•")
                                    .foregroundStyle(Theme.Colors.textTertiary)
                                Text(date.relativeTime)
                                    .font(Theme.Typography.caption)
                                    .foregroundStyle(Theme.Colors.textTertiary)
                            }
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(Theme.Typography.captionSemibold)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
                .padding(Theme.Spacing.md)
                .background {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .fill(.ultraThinMaterial)
                }
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .stroke(.white.opacity(0.1), lineWidth: 1)
                }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Continue reading \(book) chapter \(lastChapter)")
            .accessibilityHint("Double tap to resume reading")
        }
    }
    
    private var dailyVerseCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "sun.max.fill")
                        .foregroundStyle(.yellow)
                    Text(AppStrings.Home.verseOfTheDay)
                        .font(Theme.Typography.subheadlineMedium)
                }
                .foregroundStyle(.white.opacity(0.9))
                
                Spacer()
                
                if let verse = dailyVerse {
                    Text(verse.reference)
                        .font(Theme.Typography.captionSemibold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, Theme.Spacing.smd)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(.white.opacity(0.2)))
                }
            }
            
            if isLoading {
                ShimmerView(height: 20)
                    .tint(.white)
                    .frame(maxWidth: .infinity, minHeight: 80)
            } else if let error = dailyVerseError {
                ErrorRetryView(message: error) {
                    dailyVerseError = nil
                    isLoading = true
                    Task { await loadDailyVerse() }
                }
            } else if let verse = dailyVerse {
                Text(verse.text)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(.white)
                    .lineSpacing(6)
                
                // Actions
                HStack(spacing: 16) {
                    GlassIconButton(icon: "square.and.arrow.up", action: shareVerse)
                    .accessibilityLabel("Share verse")
                    .accessibilityHint("Double tap to share this verse")
                    GlassIconButton(icon: "bookmark", action: bookmarkVerse)
                    .accessibilityLabel("Bookmark verse")
                    .accessibilityHint("Double tap to save this verse")
                    GlassIconButton(icon: "bubble.left", action: { showChat = true })
                    .accessibilityLabel("Discuss verse")
                    .accessibilityHint("Double tap to chat about this verse")
                    Spacer()
                }
            }
        }
        .padding(Theme.Spacing.lg)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(
                    LinearGradient(
                        colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .fill(.ultraThinMaterial.opacity(0.2))
                }
        }
        .overlay {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .stroke(
                    LinearGradient(
                        colors: [.white.opacity(0.3), .white.opacity(0.05)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        }
        .shadow(color: Theme.Colors.primary.opacity(0.3), radius: 20, y: 10)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Verse of the day. \(dailyVerse?.reference ?? ""). \(dailyVerse?.text ?? "Loading")")
    }
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(AppStrings.Home.continueJourney)
                .sectionHeaderStyle()
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                GlassQuickAction(icon: "book.fill", title: AppStrings.Home.readBible, color: .blue) {}
                GlassQuickAction(icon: "bubble.left.fill", title: AppStrings.Home.askTheBible, color: Theme.Colors.accent) { showChat = true }
                GlassQuickAction(icon: "hands.sparkles.fill", title: AppStrings.Home.pray, color: Theme.Colors.prayer) {}
                GlassQuickAction(icon: "sun.max.fill", title: AppStrings.Home.devotional, color: .orange) {}
            }
        }
    }
    
    private var statsSection: some View {
        HStack(spacing: 12) {
            GlassStatCard(value: "\(streak)", label: AppStrings.Home.dayStreak, icon: "flame.fill", color: .orange)
                .accessibilityLabel("\(streak) day streak")
            GlassStatCard(value: "12", label: AppStrings.Home.chapters, icon: "book.fill", color: .blue)
                .accessibilityLabel("12 chapters read")
            GlassStatCard(value: "45", label: AppStrings.Home.saved, icon: "bookmark.fill", color: .purple)
                .accessibilityLabel("45 verses saved")
        }
    }
    
    // MARK: - Helpers
    
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return AppStrings.Home.goodMorning
        case 12..<17: return AppStrings.Home.goodAfternoon
        default: return AppStrings.Home.goodEvening
        }
    }
    
    private func loadDailyVerse() async {
        do {
            let service = SupabaseBibleService()
            dailyVerse = try await service.getDailyVerse()
        } catch {
            dailyVerseError = "Couldn't load today's verse. Please try again."
            dailyVerse = nil
        }
        isLoading = false
    }
    
    private func shareVerse() {
        showShareSheet = true
    }
    
    private func bookmarkVerse() {
        HapticManager.shared.success()
        // Bookmark logic here
    }
}

// MARK: - Glass Quick Action

struct GlassQuickAction: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.3))
                        .frame(width: 50, height: 50)
                        .blur(radius: 10)
                    
                    Image(systemName: icon)
                        .font(Theme.Typography.title2)
                        .foregroundStyle(color)
                }
                
                Text(title)
                    .font(Theme.Typography.subheadlineMedium)
                    .foregroundStyle(Theme.Colors.text)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.Spacing.mdl)
            .background {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                    .stroke(.white.opacity(0.1), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
        .scaleEffect(isPressed ? 0.95 : 1)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
        .accessibilityLabel(title)
        .accessibilityHint("Double tap to \(title.lowercased())")
    }
}

#Preview {
    HomeView()
        .environment(AppState.preview)
}
