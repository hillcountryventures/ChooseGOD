import SwiftUI

/// Strategy Decision #6 — separate "Practices" surface for guided spiritual
/// disciplines, distinct from chat. The strategy plan called for a dedicated
/// tab, but the iOS-native tab bar is already at 5 (the design ceiling); we
/// surface Practices as the third segment of the Journey tab to keep tab
/// density manageable.
///
/// Pro gating per Decision #12: Practices are paywalled. Free users see the
/// list with locks; tapping a locked row presents the paywall.
struct PracticesHubView: View {
    @Environment(AppState.self) private var appState

    @State private var showLectio = false
    @State private var showMemory = false
    @State private var showExamen = false
    @State private var showPaywall = false

    private var isPremium: Bool {
        appState.currentUser?.isPremium ?? false
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Spiritual Practices")
                    .font(.title3)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
                    .padding(.horizontal, 20)

                Text("Guided disciplines, drawn from 2,000 years of practice. Slow on purpose.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .padding(.horizontal, 20)

                VStack(spacing: 12) {
                    PracticeRow(
                        icon: "text.book.closed.fill",
                        title: "Lectio Divina",
                        description: "4-step ancient practice: read, meditate, pray, contemplate.",
                        durationMinutes: 12,
                        isLocked: !isPremium
                    ) {
                        if isPremium { showLectio = true } else { showPaywall = true }
                    }

                    PracticeRow(
                        icon: "eye",
                        title: "Evening Examen",
                        description: "5-step Ignatian reflection on the day. Gratitude, review, sorrow, hope, rest.",
                        durationMinutes: 8,
                        isLocked: !isPremium
                    ) {
                        if isPremium { showExamen = true } else { showPaywall = true }
                    }

                    PracticeRow(
                        icon: "brain.head.profile",
                        title: "Memory Verse Practice",
                        description: "Spaced-repetition scripture memorization. Anki, but for the Word.",
                        durationMinutes: 5,
                        isLocked: !isPremium
                    ) {
                        if isPremium { showMemory = true } else { showPaywall = true }
                    }
                }
                .padding(.horizontal, 20)

                Spacer()
            }
            .padding(.vertical, 16)
        }
        .navigationDestination(isPresented: $showLectio) {
            LectioDivinaView()
        }
        .navigationDestination(isPresented: $showMemory) {
            MemoryVerseListView()
        }
        .sheet(isPresented: $showExamen) {
            ExamenView()
                .environment(appState)
        }
        .fullScreenCover(isPresented: $showPaywall) {
            PaywallView()
                .environment(appState)
        }
    }
}

// MARK: - Row

private struct PracticeRow: View {
    let icon: String
    let title: String
    let description: String
    let durationMinutes: Int
    let isLocked: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .foregroundStyle(Theme.Colors.primary)
                }

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(title)
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.text)
                    }
                    Text(description)
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption2)
                        Text("\(durationMinutes) min")
                            .font(.caption2)
                    }
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .padding(.top, 2)
                }
                Spacer()
                Image(systemName: isLocked ? "lock.fill" : "chevron.right")
                    .font(.caption)
                    .foregroundStyle(isLocked ? Theme.Colors.primary : Theme.Colors.secondaryText)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NavigationStack {
        PracticesHubView()
    }
    .environment(AppState.preview)
}
