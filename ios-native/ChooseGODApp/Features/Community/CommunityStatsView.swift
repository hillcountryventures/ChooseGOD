import SwiftUI

struct CommunityStatsView: View {
    // Placeholder data — replace with real API calls
    private let globalReaders = 2_847
    private let completedToday = 1_203
    private let averageStreak = 8.3
    
    private let leaderboard: [(name: String, day: Int, streak: Int)] = [
        ("Grace Community Church", 187, 45),
        ("New Life Fellowship", 182, 38),
        ("Crossroads Bible Study", 175, 32),
        ("Faith & Family Group", 170, 28),
        ("Young Adults Ministry", 165, 25),
        ("College Campus Group", 158, 22),
        ("Men of the Word", 152, 19),
        ("Women's Bible Study", 148, 17),
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                globalStats
                leaderboardSection
            }
            .padding()
        }
        .navigationTitle("Community Stats")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // MARK: - Global Stats
    
    private var globalStats: some View {
        VStack(spacing: 16) {
            Text("Global Participation")
                .font(.headline)
            
            HStack(spacing: 12) {
                statBubble(value: "\(globalReaders)", label: "Readers", icon: "person.3.fill", color: .blue)
                statBubble(value: "\(completedToday)", label: "Read Today", icon: "book.fill", color: .green)
                statBubble(value: String(format: "%.1f", averageStreak), label: "Avg Streak", icon: "flame.fill", color: .orange)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private func statBubble(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title3.bold())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Leaderboard
    
    private var leaderboardSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Group Leaderboard", systemImage: "trophy.fill")
                .font(.headline)
            
            ForEach(Array(leaderboard.enumerated()), id: \.offset) { index, entry in
                HStack(spacing: 12) {
                    Text("#\(index + 1)")
                        .font(.subheadline.bold())
                        .foregroundStyle(index < 3 ? .orange : .secondary)
                        .frame(width: 30)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.name)
                            .font(.subheadline.bold())
                            .lineLimit(1)
                        Text("Day \(entry.day) • \(entry.streak)-day streak")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    
                    Spacer()
                    
                    if index == 0 {
                        Image(systemName: "trophy.fill")
                            .foregroundStyle(.yellow)
                    }
                }
                .padding(.vertical, 6)
                
                if index < leaderboard.count - 1 {
                    Divider()
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    NavigationStack {
        CommunityStatsView()
    }
}
