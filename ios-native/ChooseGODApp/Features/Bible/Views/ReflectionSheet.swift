import os
import SwiftUI

/// Reflection modal for saving verse reflections
struct ReflectionSheet: View {
    let verseRef: String
    let verseText: String
    let book: String
    let chapter: Int
    let verse: Int

    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var reflection = ""
    @State private var characterCount = 0
    @State private var isSaving = false
    @FocusState private var isTextFocused: Bool

    private let maxCharacters = 500
    private var isSaveEnabled: Bool {
        characterCount >= 10 && !isSaving
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.lg) {
                    // Verse card
                    verseCard

                    // Prompt
                    Text("What stood out to you?")
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.text)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    // Text editor with placeholder
                    TextEditor(text: $reflection)
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                        .scrollContentBackground(.hidden)
                        .frame(minHeight: 140)
                        .padding(Theme.Spacing.md)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                                .fill(Theme.Colors.surface)
                        )
                        .overlay(alignment: .topLeading) {
                            if reflection.isEmpty {
                                Text("Write your thoughts, prayers, or reflections...")
                                    .font(Theme.Typography.body)
                                    .foregroundStyle(Theme.Colors.textTertiary)
                                    .padding(Theme.Spacing.md)
                                    .padding(.top, Theme.Spacing.sm)
                                    .allowsHitTesting(false)
                            }
                        }
                        .focused($isTextFocused)

                    // Character count
                    HStack {
                        Spacer()
                        Text("\(characterCount)/\(maxCharacters)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(
                                characterCount > maxCharacters
                                    ? Color.red
                                    : Theme.Colors.textTertiary
                            )
                    }
                }
                .padding(Theme.Spacing.lg)
            }
            .background(Theme.Colors.background.ignoresSafeArea())
            .navigationTitle("Reflect")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .foregroundStyle(Theme.Colors.text)
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button(action: save) {
                        Text("Save")
                            .font(Theme.Typography.button)
                            .foregroundStyle(.white)
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.xs)
                            .background(Capsule().fill(Theme.Colors.primary))
                    }
                    .disabled(!isSaveEnabled)
                    .opacity(isSaveEnabled ? 1 : 0.5)
                }
            }
            .onChange(of: reflection) { _, newValue in
                characterCount = newValue.count
                if newValue.count > maxCharacters {
                    reflection = String(newValue.prefix(maxCharacters))
                }
            }
            .onAppear {
                isTextFocused = true
                // AnalyticsService.shared.screen("reflection_sheet") // TODO: Service not available
            }
        }
    }

    // MARK: - Verse Card

    private var verseCard: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: "book")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.primary)

                Text(verseRef)
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.primary)
            }

            Text("\"\(verseText)\"")
                .font(Theme.Typography.scripture)
                .foregroundStyle(Theme.Colors.text)
                .italic()
                .lineSpacing(6)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(Theme.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(Theme.Colors.primary.opacity(0.2), lineWidth: 1)
                )
        )
    }

    // MARK: - Save

    private func save() {
        let trimmed = reflection.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 10 else { return }

        isSaving = true

        let moment = SpiritualMoment(
            id: UUID().uuidString,
            userId: appState.currentUser?.id ?? "",
            momentType: .journal,
            content: trimmed,
            aiReflection: nil,
            linkedVerses: [
                VerseSource(
                    book: book,
                    chapter: chapter,
                    verse: verse,
                    text: verseText,
                    translation: appState.preferences.preferredTranslation.rawValue
                )
            ],
            sentimentScore: nil,
            themes: [],
            createdAt: Date(),
            updatedAt: nil,
            metadata: nil,
            media: nil,
            aiInsights: nil,
            status: nil,
            source: JournalSource(type: .verseReflection)
        )

        Task {
            do {
                _ = try await SupabaseJournalService().createMoment(moment)
            } catch {
                // Fallback: save to UserDefaults
                var saved = (UserDefaults.standard.array(forKey: "localReflections") as? [[String: String]]) ?? []
                saved.append([
                    "ref": verseRef,
                    "text": trimmed,
                    "date": ISO8601DateFormatter().string(from: Date())
                ])
                UserDefaults.standard.set(saved, forKey: "localReflections")
            }

            await MainActor.run {
                isSaving = false
                HapticManager.shared.success()
                dismiss()
            }
        }
    }
}

#Preview {
    ReflectionSheet(
        verseRef: "Psalm 46:10",
        verseText: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
        book: "Psalms",
        chapter: 46,
        verse: 10
    )
    .preferredColorScheme(.dark)
}
