import SwiftUI

/// Strategy Decision #8 — primary engagement number on the Home screen.
/// Cumulative count that never resets. Replaces the old consecutive-streak
/// shame loop. Consecutive streak still appears beneath as a secondary
/// "this week" signal. Grace Days remaining is surfaced as a soft pill so
/// users see the un-paywalled grace mechanic, not just feel it.
struct DaysWithGodCard: View {
    @Environment(AppState.self) private var appState

    @State private var daysWithGod: Int = 0
    @State private var consecutiveStreak: Int = 0
    @State private var graceDaysRemaining: Int = 0
    @State private var isPremium: Bool = false

    var body: some View {
        VStack(spacing: 14) {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Text("\(daysWithGod)")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.Colors.primary)
                    .contentTransition(.numericText())

                VStack(alignment: .leading, spacing: 2) {
                    Text(daysWithGod == 1 ? "Day With God" : "Days With God")
                        .font(.headline)
                        .foregroundStyle(Theme.Colors.text)
                    if daysWithGod == 0 {
                        Text("Today is a good day to start.")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    } else {
                        Text("Every one of them counts.")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
                Spacer()
            }

            HStack(spacing: 10) {
                if consecutiveStreak > 0 {
                    badge(
                        icon: "flame.fill",
                        text: "\(consecutiveStreak)-day streak",
                        tint: .orange
                    )
                }

                if !isPremium && graceDaysRemaining > 0 {
                    badge(
                        icon: "leaf.fill",
                        text: "\(graceDaysRemaining) Grace Day\(graceDaysRemaining == 1 ? "" : "s") this month",
                        tint: Color.green
                    )
                } else if isPremium {
                    badge(
                        icon: "leaf.fill",
                        text: "Unlimited Grace",
                        tint: Color.green
                    )
                }

                Spacer()
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(Theme.Colors.surface)
        )
        .padding(.horizontal)
        .task {
            await refresh()
        }
    }

    private func badge(icon: String, text: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(tint)
            Text(text)
                .font(.caption)
                .foregroundStyle(Theme.Colors.text)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(tint.opacity(0.12))
        .clipShape(Capsule())
    }

    private func refresh() async {
        let user = appState.currentUser
        isPremium = user?.isPremium ?? false

        if let userId = user?.id {
            await StreakManager.shared.loadFromSupabase(userId: userId)
        }

        daysWithGod = StreakManager.shared.daysWithGod
        consecutiveStreak = StreakManager.shared.currentStreak
        graceDaysRemaining = StreakManager.shared.graceDaysRemaining(isPremium: isPremium)
    }
}

#Preview {
    DaysWithGodCard()
        .environment(AppState.preview)
        .padding(.vertical)
        .background(Theme.Colors.background)
}
