import SwiftUI

/// Real journal entry composer. Replaces the previous "Coming Soon" stub.
/// Persists via SupabaseJournalService into `spiritual_moments`. Counts as
/// activity for Days With God (Decision #8) on save.
struct JournalComposeView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    /// Optional pre-filled prompt (used when launched from a verse-tap or
    /// "reflect on what you read" surface in the Bible reader).
    let initialPrompt: String?
    let linkedVerse: VerseSource?

    @State private var content: String = ""
    @State private var selectedType: MomentType = .journal
    @State private var isSaving: Bool = false
    @State private var errorMessage: String?

    private let service: JournalServiceProtocol = SupabaseJournalService()

    init(initialPrompt: String? = nil, linkedVerse: VerseSource? = nil) {
        self.initialPrompt = initialPrompt
        self.linkedVerse = linkedVerse
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        typePicker
                        if let verse = linkedVerse { verseChip(verse) }
                        if let prompt = initialPrompt, !prompt.isEmpty {
                            promptCard(prompt)
                        }
                        editor
                        wordCountFooter
                    }
                    .padding(20)
                }
            }
            .navigationTitle(navTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await save() }
                    } label: {
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Save").bold()
                        }
                    }
                    .disabled(content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSaving)
                }
            }
            .alert("Couldn't save", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private var navTitle: String {
        switch selectedType {
        case .journal:    return "New Entry"
        case .gratitude:  return "Gratitude"
        case .prayer:     return "Prayer"
        case .confession: return "Confession"
        default:          return "New Entry"
        }
    }

    // MARK: - Sections

    private var typePicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(composableTypes, id: \.self) { type in
                    Button {
                        selectedType = type
                    } label: {
                        Text(label(for: type))
                            .font(.caption)
                            .bold()
                            .foregroundStyle(selectedType == type ? .white : Theme.Colors.text)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(selectedType == type ? Theme.Colors.primary : Theme.Colors.surface)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var composableTypes: [MomentType] {
        // Split-by-verb: journal = reflection. Prayers live in the Prayers tab
        // (the only place a prayer can be tracked + marked answered).
        [.journal, .gratitude, .confession]
    }

    private func label(for type: MomentType) -> String {
        switch type {
        case .journal:    return "Journal"
        case .gratitude:  return "Gratitude"
        case .prayer:     return "Prayer"
        case .confession: return "Confession"
        default:          return type.rawValue.capitalized
        }
    }

    private func verseChip(_ verse: VerseSource) -> some View {
        HStack(spacing: 6) {
            Image(systemName: "book.fill")
                .font(.caption)
            Text(verse.reference)
                .font(.caption)
                .bold()
        }
        .foregroundStyle(Theme.Colors.primary)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Theme.Colors.primary.opacity(0.12))
        .clipShape(Capsule())
    }

    private func promptCard(_ prompt: String) -> some View {
        Text(prompt)
            .font(.subheadline)
            .italic()
            .foregroundStyle(Theme.Colors.secondaryText)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private var editor: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(placeholder)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
            TextEditor(text: $content)
                .font(.body)
                .frame(minHeight: 280)
                .padding(8)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var placeholder: String {
        switch selectedType {
        case .journal:    return "What's on your heart?"
        case .gratitude:  return "What are you grateful for today?"
        case .prayer:     return "Write your prayer."
        case .confession: return "Whatever it is — He already knows."
        default:          return "What's on your heart?"
        }
    }

    private var wordCountFooter: some View {
        HStack {
            Spacer()
            Text("\(wordCount) words")
                .font(.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
    }

    private var wordCount: Int {
        content.split { $0.isWhitespace }.count
    }

    // MARK: - Save

    @MainActor
    private func save() async {
        guard let userId = appState.currentUser?.id else {
            errorMessage = "You need to be signed in to save."
            return
        }
        let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        isSaving = true
        defer { isSaving = false }

        let moment = SpiritualMoment(
            id: UUID().uuidString,
            userId: userId,
            momentType: selectedType,
            content: trimmed,
            aiReflection: nil,
            linkedVerses: linkedVerse.map { [$0] } ?? [],
            sentimentScore: nil,
            themes: [],
            createdAt: Date(),
            updatedAt: nil,
            metadata: nil,
            media: nil,
            aiInsights: nil,
            status: .published,
            source: JournalSource(type: linkedVerse != nil ? .verseReflection : .standalone)
        )

        do {
            _ = try await service.createMoment(moment)

            // Decision #8 — journaling counts toward Days With God.
            StreakManager.shared.recordActivity(
                isPremium: appState.currentUser?.isPremium ?? false,
                userId: userId
            )
            AnalyticsService.shared.capture(
                "journal_entry_saved",
                properties: ["type": selectedType.rawValue, "word_count": wordCount]
            )
            dismiss()
        } catch {
            errorMessage = "Couldn't save your entry. Try again."
        }
    }
}

#Preview {
    JournalComposeView()
        .environment(AppState.preview)
}
