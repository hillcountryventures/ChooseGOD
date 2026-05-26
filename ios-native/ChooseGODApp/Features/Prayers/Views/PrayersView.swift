import SwiftUI

/// Prayers tab — personal prayers (v1.2). Create, track, and mark answered
/// with a testimony + celebration. Prayer Circles are flag-gated to v1.3.
///
/// This is the moat's fuel: prayers feed the AI context, and answered prayers
/// + testimonies become the faithfulness log in the Journey Timeline.
struct PrayersView: View {
    @Environment(AppState.self) private var appState
    @StateObject private var viewModel = PrayerViewModel()

    @State private var showAddPrayer = false
    @State private var prayerToAnswer: PrayerRequest?
    @State private var prayerToDelete: PrayerRequest?
    @State private var showCelebration = false

    private var activePrayers: [PrayerRequest] {
        viewModel.personalPrayers.filter { $0.status != .answered }
    }
    private var answeredCount: Int {
        viewModel.personalPrayers.filter { $0.status == .answered }.count
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                if viewModel.isLoading && viewModel.personalPrayers.isEmpty {
                    ShimmerView(height: 20).tint(Theme.Colors.primary)
                } else if activePrayers.isEmpty {
                    emptyState
                } else {
                    prayerList
                }

                ConfettiView(isActive: $showCelebration)
                    .allowsHitTesting(false)
            }
            .navigationTitle("Prayers")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showAddPrayer = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundStyle(Theme.Colors.primary)
                    }
                    .accessibilityLabel("Add a prayer")
                }
            }
            .sheet(isPresented: $showAddPrayer) {
                AddPrayerView(viewModel: viewModel)
                    .environment(appState)
            }
            .sheet(item: $prayerToAnswer) { prayer in
                AnsweredPrayerSheet(prayer: prayer, viewModel: viewModel) {
                    showCelebration = true
                }
                .environment(appState)
            }
            .task(id: appState.currentUser?.id) {
                guard let userId = appState.currentUser?.id else { return }
                await viewModel.fetchPrayers(userId: userId)
            }
            .refreshable {
                guard let userId = appState.currentUser?.id else { return }
                await viewModel.fetchPrayers(userId: userId)
            }
            .confirmationDialog(
                "Delete this prayer?",
                isPresented: Binding(get: { prayerToDelete != nil }, set: { if !$0 { prayerToDelete = nil } }),
                presenting: prayerToDelete
            ) { prayer in
                Button("Delete", role: .destructive) {
                    Task { try? await viewModel.deletePrayer(prayer) }
                    prayerToDelete = nil
                }
                Button("Cancel", role: .cancel) { prayerToDelete = nil }
            } message: { _ in
                Text("This can't be undone.")
            }
        }
    }

    // MARK: - List

    private var prayerList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                if answeredCount > 0 {
                    answeredBanner
                }
                ForEach(activePrayers) { prayer in
                    PrayerCard(prayer: prayer) {
                        prayerToAnswer = prayer
                    } onDelete: {
                        prayerToDelete = prayer
                    }
                }

                // Clear the floating tab bar + FAB
                Color.clear.frame(height: Theme.Spacing.tabBarInset)
            }
            .padding()
        }
    }

    private var answeredBanner: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.seal.fill")
                .foregroundStyle(Color.green)
            Text("\(answeredCount) answered prayer\(answeredCount == 1 ? "" : "s")")
                .font(.subheadline)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Spacer()
            Text("See in Journey → Timeline")
                .font(.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.green.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Empty state

    private var emptyState: some View {
        VStack(spacing: 18) {
            Spacer()
            ZStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.15))
                    .frame(width: 100, height: 100)
                    .blur(radius: 10)
                Image(systemName: "hands.sparkles.fill")
                    .font(.system(size: 44))
                    .foregroundStyle(Theme.Colors.primary.opacity(0.7))
            }
            Text("What are you praying for?")
                .font(.title3)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("Write your first prayer. Track it. And one day, mark it answered — your prayers become a record of God's faithfulness.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button {
                showAddPrayer = true
            } label: {
                Label("Write your first prayer", systemImage: "plus")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(Capsule())
            }
            Spacer()
            Spacer()
        }
        .padding()
    }
}

// MARK: - Prayer card

private struct PrayerCard: View {
    let prayer: PrayerRequest
    let onMarkAnswered: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(prayer.request)
                .font(.body)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            if let anchor = prayer.scriptureAnchor {
                Text("\(anchor.reference) — \u{201C}\(anchor.text)\u{201D}")
                    .font(.caption)
                    .italic()
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .lineLimit(2)
            }

            HStack {
                Text(prayer.createdAt, style: .date)
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.secondaryText)
                Spacer()
                Button(action: onMarkAnswered) {
                    Label("Mark answered", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .bold()
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(Color.green)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Mark this prayer answered")
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .contextMenu {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}

// MARK: - Answered-prayer testimony sheet

private struct AnsweredPrayerSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    let prayer: PrayerRequest
    @ObservedObject var viewModel: PrayerViewModel
    let onCelebrate: () -> Void

    @State private var testimony: String = ""
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Your prayer")
                                .font(.caption)
                                .bold()
                                .foregroundStyle(Theme.Colors.secondaryText)
                            Text(prayer.request)
                                .font(.subheadline)
                                .foregroundStyle(Theme.Colors.text)
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Theme.Colors.surface)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            Text("What happened? (your testimony)")
                                .font(.caption)
                                .bold()
                                .foregroundStyle(Theme.Colors.secondaryText)
                            TextEditor(text: $testimony)
                                .font(.body)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 120)
                                .padding(10)
                                .background(Theme.Colors.surface)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .overlay(alignment: .topLeading) {
                                    if testimony.isEmpty {
                                        Text("How did God show up? (optional)")
                                            .font(.body)
                                            .foregroundStyle(Theme.Colors.secondaryText)
                                            .padding(16)
                                            .allowsHitTesting(false)
                                    }
                                }
                        }
                        Text("This becomes part of your faithfulness log — a record you'll look back on.")
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                    .padding(20)
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle("Answered")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { Task { await save() } } label: {
                        if isSaving { ProgressView() } else { Text("Celebrate").bold() }
                    }
                    .disabled(isSaving)
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(Color.green)
                Text("God answered.")
                    .font(.title2)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            Text("Take a moment to name what He did.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
    }

    @MainActor
    private func save() async {
        isSaving = true
        defer { isSaving = false }
        do {
            try await viewModel.markAsAnswered(prayer, reflection: testimony)
            dismiss()
            // Trigger the celebration on the parent after dismiss.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                onCelebrate()
            }
        } catch {
            // Non-fatal; leave sheet open.
        }
    }
}

#Preview {
    PrayersView()
        .environment(AppState.preview)
}
