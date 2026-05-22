import SwiftUI

/// Strategy Decision #2 — surfaces when GraceModeService detects 2+ missed
/// devotional days. Sheet that loads a generated catch-up summary on demand
/// from the `grace-path-summary` edge function and gives the user a one-tap
/// way to mark the missed days as completed without shame.
struct GraceSummaryModal: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState

    let eligibility: GraceModeService.CatchUpEligibility

    @State private var phase: Phase = .invitation
    @State private var summary: GracePathResponse?
    @State private var loadError: String?

    enum Phase {
        case invitation
        case loading
        case revealed
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    header
                    Divider()
                    switch phase {
                    case .invitation: invitationBody
                    case .loading: loadingBody
                    case .revealed: revealedBody
                    }
                }
                .padding(20)
            }
            .background(Theme.Colors.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
        }
        .presentationDetents([.large])
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "leaf.fill")
                    .foregroundStyle(Color.green)
                Text("Welcome back.")
                    .font(.title3)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            if let title = eligibility.enrollment.series?.title {
                Text(title)
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
    }

    private var invitationBody: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("You've missed \(eligibility.missedDays.count) days. No big deal — here's a gentle bridge back so you don't have to read everything you missed.")
                .font(.body)
                .foregroundStyle(Theme.Colors.text)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(eligibility.missedDays.prefix(5), id: \.id) { day in
                    HStack(spacing: 8) {
                        Text("Day \(day.dayNumber)")
                            .font(.caption)
                            .bold()
                            .foregroundStyle(Theme.Colors.primary)
                        Text(day.title)
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.text)
                            .lineLimit(1)
                    }
                }
                if eligibility.missedDays.count > 5 {
                    Text("+ \(eligibility.missedDays.count - 5) more")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            Button { Task { await loadSummary() } } label: {
                Text("See my catch-up")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Button { dismiss() } label: {
                Text("Not right now")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
            }
        }
    }

    private var loadingBody: some View {
        VStack(spacing: 14) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Pulling together what you missed…")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private var revealedBody: some View {
        VStack(alignment: .leading, spacing: 16) {
            if let error = loadError {
                Text(error)
                    .font(.subheadline)
                    .foregroundStyle(.red)
            }

            if let summary {
                Text(summary.summary)
                    .font(.body)
                    .foregroundStyle(Theme.Colors.text)
                    .fixedSize(horizontal: false, vertical: true)

                if let verses = summary.highlightedVerses, !verses.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Verses to sit with")
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.text)
                        ForEach(verses, id: \.reference) { verse in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(verse.reference)
                                    .font(.caption)
                                    .bold()
                                    .foregroundStyle(Theme.Colors.primary)
                                if let text = verse.text {
                                    Text(text)
                                        .font(.caption)
                                        .italic()
                                        .foregroundStyle(Theme.Colors.text)
                                }
                            }
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Theme.Colors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                    .padding(.top, 4)
                }
            }

            Button {
                Task {
                    await GraceModeService.shared.acknowledgeCatchUp(eligibility: eligibility)
                    // Decision #15 — completion fires only after the user
                    // explicitly accepts the catch-up; viewing the summary
                    // alone doesn't count.
                    MagicMomentsService.shared.capture(
                        .day46_grace_mode_completed,
                        properties: ["missed_days": eligibility.missedDays.count]
                    )
                    dismiss()
                }
            } label: {
                Text("I'm caught up")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    // MARK: - Actions

    @MainActor
    private func loadSummary() async {
        guard let userId = appState.currentUser?.id else {
            loadError = "Sign in to load your catch-up."
            phase = .revealed
            return
        }
        phase = .loading
        do {
            let result = try await GraceModeService.shared.requestCatchUp(
                userId: userId,
                eligibility: eligibility
            )
            self.summary = result
            self.phase = .revealed
        } catch {
            self.loadError = "Couldn't load your catch-up right now. Try again in a moment."
            self.phase = .revealed
        }
    }
}
