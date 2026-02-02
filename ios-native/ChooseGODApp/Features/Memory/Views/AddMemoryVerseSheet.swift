import SwiftUI

struct AddMemoryVerseSheet: View {
    @ObservedObject var viewModel: MemoryViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedBook = "John"
    @State private var chapter = "3"
    @State private var verseStart = "16"
    @State private var verseEnd = ""
    @State private var verseText = ""
    @State private var translation = "KJV"
    @State private var isSaving = false
    
    private let translations = ["KJV", "NIV", "ASV", "WEB", "BBE"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Book picker
                        VStack(alignment: .leading, spacing: 6) {
                            label("Book")
                            Picker("Book", selection: $selectedBook) {
                                ForEach(BIBLE_BOOKS, id: \.name) { book in
                                    Text(book.name).tag(book.name)
                                }
                            }
                            .pickerStyle(.menu)
                            .tint(Theme.Colors.primary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(Theme.Spacing.mds)
                            .background(Theme.Colors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
                        }
                        
                        // Chapter & Verses
                        HStack(spacing: 12) {
                            field("Chapter", text: $chapter)
                            field("Verse Start", text: $verseStart)
                            field("Verse End", text: $verseEnd, placeholder: "Optional")
                        }
                        
                        // Translation
                        VStack(alignment: .leading, spacing: 6) {
                            label("Translation")
                            Picker("Translation", selection: $translation) {
                                ForEach(translations, id: \.self) { t in
                                    Text(t).tag(t)
                                }
                            }
                            .pickerStyle(.segmented)
                        }
                        
                        // Verse text
                        VStack(alignment: .leading, spacing: 6) {
                            label("Verse Text")
                            TextEditor(text: $verseText)
                                .scrollContentBackground(.hidden)
                                .foregroundStyle(Theme.Colors.text)
                                .frame(minHeight: 120)
                                .padding(Theme.Spacing.mds)
                                .background(Theme.Colors.surface)
                                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Add Memory Verse")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task { await save() }
                    }
                    .disabled(!isValid || isSaving)
                    .foregroundStyle(isValid ? Theme.Colors.primary : Theme.Colors.textTertiary)
                }
            }
        }
    }
    
    // MARK: - Helpers
    
    private var isValid: Bool {
        !verseText.trimmingCharacters(in: .whitespaces).isEmpty
            && Int(chapter) != nil
            && Int(verseStart) != nil
    }
    
    private func save() async {
        isSaving = true
        let success = await viewModel.addVerse(
            book: selectedBook,
            chapter: Int(chapter) ?? 1,
            verseStart: Int(verseStart) ?? 1,
            verseEnd: Int(verseEnd),
            text: verseText.trimmingCharacters(in: .whitespacesAndNewlines),
            translation: translation
        )
        isSaving = false
        if success { dismiss() }
    }
    
    @ViewBuilder
    private func label(_ text: String) -> some View {
        Text(text)
            .font(Theme.Typography.captionBold)
            .foregroundStyle(Theme.Colors.textSecondary)
            .textCase(.uppercase)
    }
    
    @ViewBuilder
    private func field(_ title: String, text: Binding<String>, placeholder: String = "") -> some View {
        VStack(alignment: .leading, spacing: 6) {
            label(title)
            TextField(placeholder.isEmpty ? title : placeholder, text: text)
                .keyboardType(.numberPad)
                .foregroundStyle(Theme.Colors.text)
                .padding(Theme.Spacing.mds)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
        }
    }
}
