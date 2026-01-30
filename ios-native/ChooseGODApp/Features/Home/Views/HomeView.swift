import SwiftUI

/// Main home screen with daily verse and quick actions
struct HomeView: View {
    @Environment(AppState.self) private var appState
    @State private var dailyVerse: Verse?
    @State private var isLoading = true
    @State private var showChat = false
    @State private var showShareSheet = false
    @State private var isDailyVerseBookmarked = false
    
    // MARK: - Real Stats from UserDefaults
    @State private var streak: Int = UserDefaults.standard.integer(forKey: "readingStreak")
    @State private var chaptersRead: Int = UserDefaults.standard.integer(forKey: "chaptersReadTotal")
    @State private var savedCount: Int = {
        let data = UserDefaults.standard.data(forKey: "bookmarkedVerses") ?? Data()
        let bookmarks = (try? JSONDecoder().decode([BookmarkedVerse].self, from: data)) ?? []
        return bookmarks.count
    }()
    
    /// Callback to switch tabs (provided by MainTabView)
    var switchToTab: ((MainTabView.Tab) -> Void)?
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Animated gradient background
                backgroundGradient
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Greeting with glass pill
                        greetingSection
                        
                        // Continue Reading banner
                        continueReadingCard
                        
                        // Daily Verse Card (Glass)
                        dailyVerseCard
                        
                        // Quick Actions with glass
                        quickActionsSection
                        
                        // Stats row
                        statsSection
                        
                        Spacer(minLength: 100)
                    }
                    .padding()
                }
            }
            .navigationBarHidden(true)
            .task {
                await loadDailyVerse()
                refreshStats()
            }
            .onAppear {
                refreshStats()
            }
            // Share sheet
            .sheet(isPresented: $showShareSheet) {
                if let verse = dailyVerse {
                    let shareText = "\"\(verse.text)\"\n— \(verse.reference) (\(verse.translation))\n\nRead more on ChooseGOD: https://choosegod.app/verse/\(verse.book)/\(verse.chapter)/\(verse.verse)"
                    ShareSheet(activityItems: [shareText])
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("home") }
    }
    
    // MARK: - Refresh Stats
    
    private func refreshStats() {
        streak = ReadingStatsManager.currentStreak()
        chaptersRead = UserDefaults.standard.integer(forKey: "chaptersReadTotal")
        let data = UserDefaults.standard.data(forKey: "bookmarkedVerses") ?? Data()
        let bookmarks = (try? JSONDecoder().decode([BookmarkedVerse].self, from: data)) ?? []
        savedCount = bookmarks.count
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
    
    // MARK: - Subviews
    
    private var greetingSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(greeting)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                
                Text(appState.currentUser?.displayName ?? AppStrings.Home.defaultName)
                    .font(.title2.bold())
                    .foregroundStyle(Theme.Colors.text)
            }
            
            Spacer()
            
            // Streak badge with glass
            HStack(spacing: 6) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("\(streak)")
                    .font(.headline.bold())
                    .foregroundStyle(Theme.Colors.text)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
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
    
    // MARK: - Continue Reading Card (wired to last read position)
    
    @ViewBuilder
    private var continueReadingCard: some View {
        let lastBook = UserDefaults.standard.string(forKey: "lastReadBook")
        let lastChapter = UserDefaults.standard.integer(forKey: "lastReadChapter")
        let lastDate = UserDefaults.standard.object(forKey: "lastReadDate") as? Date
        
        if let book = lastBook, lastChapter > 0 {
            NavigationLink {
                BibleReaderView(initialBook: book, initialChapter: lastChapter)
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
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.Colors.text)
                        
                        HStack(spacing: 4) {
                            Text("\(book) \(lastChapter)")
                                .font(.caption.weight(.medium))
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
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
                .padding(16)
                .background {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.ultraThinMaterial)
                }
                .overlay {
                    RoundedRectangle(cornerRadius: 16)
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
                        .font(.subheadline.weight(.medium))
                }
                .foregroundStyle(.white.opacity(0.9))
                
                Spacer()
                
                if let verse = dailyVerse {
                    Text(verse.reference)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(.white.opacity(0.2)))
                }
            }
            
            if isLoading {
                ShimmerView(height: 20)
                    .tint(.white)
                    .frame(maxWidth: .infinity, minHeight: 80)
            } else if let verse = dailyVerse {
                Text(verse.text)
                    .font(.system(.title3, design: .serif))
                    .foregroundStyle(.white)
                    .lineSpacing(6)
                
                // Actions
                HStack(spacing: 16) {
                    GlassIconButton(icon: "square.and.arrow.up", action: shareVerse)
                    .accessibilityLabel("Share verse")
                    .accessibilityHint("Double tap to share this verse")
                    GlassIconButton(icon: isDailyVerseBookmarked ? "bookmark.fill" : "bookmark", action: bookmarkVerse)
                    .accessibilityLabel(isDailyVerseBookmarked ? "Remove bookmark" : "Bookmark verse")
                    .accessibilityHint("Double tap to save this verse")
                    GlassIconButton(icon: "bubble.left", action: { showChat = true })
                    .accessibilityLabel("Discuss verse")
                    .accessibilityHint("Double tap to chat about this verse")
                    Spacer()
                }
            }
        }
        .padding(24)
        .background {
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay {
                    RoundedRectangle(cornerRadius: 24)
                        .fill(.ultraThinMaterial.opacity(0.2))
                }
        }
        .overlay {
            RoundedRectangle(cornerRadius: 24)
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
                GlassQuickAction(icon: "book.fill", title: AppStrings.Home.readBible, color: .blue) {
                    switchToTab?(.bible)
                }
                GlassQuickAction(icon: "bubble.left.fill", title: AppStrings.Home.askTheBible, color: Theme.Colors.accent) { showChat = true }
                GlassQuickAction(icon: "hands.sparkles.fill", title: AppStrings.Home.pray, color: Theme.Colors.prayer) {
                    switchToTab?(.prayers)
                }
                GlassQuickAction(icon: "sun.max.fill", title: AppStrings.Home.devotional, color: .orange) {
                    switchToTab?(.devotionals)
                }
            }
        }
    }
    
    private var statsSection: some View {
        HStack(spacing: 12) {
            GlassStatCard(value: "\(streak)", label: AppStrings.Home.dayStreak, icon: "flame.fill", color: .orange)
                .accessibilityLabel("\(streak) day streak")
            GlassStatCard(value: "\(chaptersRead)", label: AppStrings.Home.chapters, icon: "book.fill", color: .blue)
                .accessibilityLabel("\(chaptersRead) chapters read")
            GlassStatCard(value: "\(savedCount)", label: AppStrings.Home.saved, icon: "bookmark.fill", color: .purple)
                .accessibilityLabel("\(savedCount) verses saved")
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
            dailyVerse = Verse(
                id: "john-3-16",
                book: "John",
                chapter: 3,
                verse: 16,
                text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
                translation: "KJV"
            )
        }
        isLoading = false
        // Check if daily verse is already bookmarked
        if let verse = dailyVerse {
            isDailyVerseBookmarked = BookmarkManager.isBookmarked(verse)
        }
    }
    
    private func shareVerse() {
        showShareSheet = true
    }
    
    private func bookmarkVerse() {
        guard let verse = dailyVerse else { return }
        isDailyVerseBookmarked = BookmarkManager.toggle(verse)
        refreshStats()
    }
}

// MARK: - Share Sheet (UIKit bridge)

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]
    var applicationActivities: [UIActivity]? = nil
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(
            activityItems: activityItems,
            applicationActivities: applicationActivities
        )
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
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
                    // Glow
                    Circle()
                        .fill(color.opacity(0.3))
                        .frame(width: 50, height: 50)
                        .blur(radius: 10)
                    
                    Image(systemName: icon)
                        .font(Theme.Typography.title2)
                        .foregroundStyle(color)
                }
                
                Text(title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.Colors.text)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background {
                RoundedRectangle(cornerRadius: 16)
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                RoundedRectangle(cornerRadius: 16)
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
