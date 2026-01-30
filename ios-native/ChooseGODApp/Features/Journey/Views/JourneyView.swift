import SwiftUI

/// Journey view showing spiritual growth stats and timeline
struct JourneyView: View {
    @Environment(AppState.self) private var appState
    @State private var stats: UserStats = .empty
    @State private var recentActivity: [ActivityItem] = []
    @State private var isLoading = true
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Streak card
                        streakCard
                        
                        // Stats grid
                        statsGrid
                        
                        // Recent activity
                        activitySection
                    }
                    .padding()
                }
            }
            .navigationTitle("Journey")
            .task {
                await loadData()
            }
        }
        .onAppear { AnalyticsService.shared.screen("journey") }
    }
    
    // MARK: - Streak Card
    
    private var streakCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Current Streak")
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                    
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(stats.currentStreak)")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundStyle(Theme.Colors.text)
                        
                        Text("days")
                            .font(.title3)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
                
                Spacer()
                
                // Flame icon
                Image(systemName: "flame.fill")
                    .font(.system(size: 50))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.orange, .red],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }
            
            // Week view
            HStack(spacing: 8) {
                ForEach(0..<7, id: \.self) { day in
                    let isActive = day < stats.currentStreak % 7 || stats.currentStreak >= 7
                    Circle()
                        .fill(isActive ? Theme.Colors.primary : Theme.Colors.surface)
                        .frame(width: 36, height: 36)
                        .overlay(
                            Text(dayLetter(day))
                                .font(.caption.bold())
                                .foregroundStyle(isActive ? .white : Theme.Colors.secondaryText)
                        )
                }
            }
            
            // Best streak
            if stats.longestStreak > stats.currentStreak {
                Text("Best: \(stats.longestStreak) days")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
        .padding(20)
        .background(Theme.Colors.surface)
        .cornerRadius(16)
    }
    
    // MARK: - Stats Grid
    
    private var statsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your Progress")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                StatBox(
                    value: "\(stats.versesRead)",
                    label: "Verses Read",
                    icon: "book.fill",
                    color: .blue
                )
                
                StatBox(
                    value: "\(stats.chaptersCompleted)",
                    label: "Chapters",
                    icon: "doc.text.fill",
                    color: .purple
                )
                
                StatBox(
                    value: "\(stats.prayersCreated)",
                    label: "Prayers",
                    icon: "hands.sparkles.fill",
                    color: Theme.Colors.prayer
                )
                
                StatBox(
                    value: "\(stats.prayersAnswered)",
                    label: "Answered",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
                
                StatBox(
                    value: "\(stats.journalEntries)",
                    label: "Journal",
                    icon: "pencil.line",
                    color: .orange
                )
                
                StatBox(
                    value: "\(stats.totalDaysActive)",
                    label: "Days Active",
                    icon: "calendar",
                    color: .cyan
                )
            }
        }
    }
    
    // MARK: - Activity Section
    
    private var activitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Activity")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            if recentActivity.isEmpty {
                Text("Start reading to see your activity here")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Theme.Colors.surface)
                    .cornerRadius(12)
            } else {
                VStack(spacing: 0) {
                    ForEach(recentActivity) { item in
                        ActivityRow(item: item)
                        
                        if item.id != recentActivity.last?.id {
                            Divider()
                                .background(Theme.Colors.secondaryText.opacity(0.2))
                        }
                    }
                }
                .background(Theme.Colors.surface)
                .cornerRadius(12)
            }
        }
    }
    
    // MARK: - Helpers
    
    private func dayLetter(_ index: Int) -> String {
        ["S", "M", "T", "W", "T", "F", "S"][index]
    }
    
    private func loadData() async {
        // Load from UserDefaults or Supabase
        // For now, use sample data
        stats = UserStats(
            versesRead: 247,
            chaptersCompleted: 12,
            prayersCreated: 15,
            prayersAnswered: 3,
            journalEntries: 8,
            currentStreak: 7,
            longestStreak: 14,
            totalDaysActive: 23
        )
        
        recentActivity = [
            ActivityItem(type: .devotional, title: "Completed Day 3", subtitle: "Overcoming Anxiety", date: Date()),
            ActivityItem(type: .prayer, title: "Prayer Answered!", subtitle: "Job interview guidance", date: Date().addingTimeInterval(-86400)),
            ActivityItem(type: .verse, title: "Highlighted verse", subtitle: "Philippians 4:13", date: Date().addingTimeInterval(-172800)),
        ]
        
        isLoading = false
    }
}

// MARK: - Models

struct UserStats {
    let versesRead: Int
    let chaptersCompleted: Int
    let prayersCreated: Int
    let prayersAnswered: Int
    let journalEntries: Int
    let currentStreak: Int
    let longestStreak: Int
    let totalDaysActive: Int
    
    static var empty: UserStats {
        UserStats(
            versesRead: 0,
            chaptersCompleted: 0,
            prayersCreated: 0,
            prayersAnswered: 0,
            journalEntries: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalDaysActive: 0
        )
    }
}

struct ActivityItem: Identifiable {
    let id = UUID()
    let type: ActivityType
    let title: String
    let subtitle: String
    let date: Date
    
    enum ActivityType {
        case verse, devotional, prayer, journal
        
        var icon: String {
            switch self {
            case .verse: return "book.fill"
            case .devotional: return "sun.max.fill"
            case .prayer: return "hands.sparkles.fill"
            case .journal: return "pencil.line"
            }
        }
        
        var color: Color {
            switch self {
            case .verse: return .blue
            case .devotional: return .orange
            case .prayer: return Theme.Colors.prayer
            case .journal: return .green
            }
        }
    }
}

// MARK: - Stat Box

struct StatBox: View {
    let value: String
    let label: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(color)
                
                Spacer()
            }
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(value)
                        .font(.title2.bold())
                        .foregroundStyle(Theme.Colors.text)
                    
                    Text(label)
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Theme.Colors.surface)
        .cornerRadius(12)
    }
}

// MARK: - Activity Row

struct ActivityRow: View {
    let item: ActivityItem
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: item.type.icon)
                .font(.title3)
                .foregroundStyle(item.type.color)
                .frame(width: 32)
            
            // Content
            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.Colors.text)
                
                Text(item.subtitle)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            Spacer()
            
            // Date
            Text(item.date, style: .relative)
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding()
    }
}

#Preview {
    JourneyView()
        .environment(AppState.preview)
}
