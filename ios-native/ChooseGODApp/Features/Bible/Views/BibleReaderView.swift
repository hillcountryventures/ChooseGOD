import SwiftUI

// Allow Int to be used with .sheet(item:)
extension Int: @retroactive Identifiable {
    public var id: Int { self }
}

/// Bible reader with book/chapter navigation
struct BibleReaderView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedBook = "Genesis"
    @State private var selectedChapter = 1
    @State private var verses: [Verse] = []
    @State private var isLoading = false
    @State private var showBookPicker = false
    @State private var isLoadingAudio = false
    @State private var showCrossRefsForVerse: Int?
    @State private var audioPlayer = AudioPlayerManager.shared
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if isLoading {
                    VStack(spacing: 16) { ShimmerCard(); ShimmerCard() }.padding()
                } else {
                    VStack(spacing: 0) {
                        ScrollView {
                            VStack(alignment: .leading, spacing: 0) {
                                // Chapter header
                                Text("\(selectedBook) \(selectedChapter)")
                                    .font(Theme.Typography.chapterTitle)
                                    .foregroundStyle(Theme.Colors.text)
                                    .padding(.horizontal)
                                    .padding(.top, Theme.Spacing.sm)
                                    .padding(.bottom, Theme.Spacing.lg)
                                
                                // Verses
                                ForEach(verses) { verse in
                                    VerseRow(
                                        verse: verse,
                                        isHighlightedByAudio: audioPlayer.playbackState.currentVerse == verse.verse,
                                        onCrossRefTap: {
                                            showCrossRefsForVerse = verse.verse
                                        }
                                    )
                                }
                            }
                            .padding(.vertical)
                            // Extra padding at bottom for audio bar
                            .padding(.bottom, audioPlayer.playbackState.currentTrack != nil ? 70 : 0)
                        }
                        .refreshable {
                            await loadChapter()
                        }
                        
                        // Sticky audio player bar
                        AudioPlayerBar()
                    }
                }
            }
            .navigationTitle("Bible")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Button {
                        showBookPicker = true
                    } label: {
                        HStack(spacing: 4) {
                            Text("\(selectedBook) \(selectedChapter)")
                                .font(Theme.Typography.title3)
                            Image(systemName: "chevron.down")
                                .font(Theme.Typography.caption)
                        }
                        .foregroundStyle(Theme.Colors.primary)
                    }
                    .accessibilityLabel("Translation: \(appState.preferences.preferredTranslation.rawValue)")
                    .accessibilityHint("Double tap to change Bible translation")
                }
                
                ToolbarItem(placement: .topBarLeading) {
                    AudioLoadingButton(
                        isLoading: isLoadingAudio,
                        hasAudio: audioPlayer.playbackState.currentTrack != nil
                    ) {
                        Task { await loadAudio() }
                    }
                    .accessibilityLabel(audioPlayer.playbackState.currentTrack != nil ? "Audio playing" : "Listen to chapter")
                    .accessibilityHint("Double tap to play audio for this chapter")
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        ForEach(BibleTranslation.allCases) { translation in
                            Button {
                                appState.preferences.preferredTranslation = translation
                                appState.preferences.save()
                                Task { await loadChapter() }
                            } label: {
                                HStack {
                                    Text(translation.displayName)
                                    if translation == appState.preferences.preferredTranslation {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        Text(appState.preferences.preferredTranslation.rawValue)
                            .font(Theme.Typography.subheadlineMedium)
                            .foregroundStyle(Theme.Colors.primary)
                    }
                }
            }
            .sheet(isPresented: $showBookPicker) {
                BookPickerView(
                    selectedBook: $selectedBook,
                    selectedChapter: $selectedChapter
                ) {
                    showBookPicker = false
                    Task { await loadChapter() }
                }
            }
            .sheet(item: $showCrossRefsForVerse) { verseNum in
                CrossReferencesSheet(
                    book: selectedBook,
                    chapter: selectedChapter,
                    verse: verseNum,
                    translation: appState.preferences.preferredTranslation.rawValue
                )
            }
            .task {
                await loadChapter()
            }
        }
        .onAppear { AnalyticsService.shared.screen("bible_reader")
            AnalyticsService.shared.capture("bible_read") }
    }
    
    private func loadChapter() async {
        isLoading = true
        do {
            verses = try await appState.bibleService.fetchChapter(
                book: selectedBook,
                chapter: selectedChapter,
                translation: appState.preferences.preferredTranslation
            )
        } catch {
            appState.handleError(error)
        }
        isLoading = false
    }
    
    private func loadAudio() async {
        isLoadingAudio = true
        let translationStr = appState.preferences.preferredTranslation.rawValue
        
        if let track = await BibleAudioService.shared.getChapterAudio(
            book: selectedBook,
            chapter: selectedChapter,
            translation: translationStr
        ) {
            let timestamps = await BibleAudioService.shared.getTimestamps(
                book: selectedBook,
                chapter: selectedChapter,
                translation: translationStr
            )
            AudioPlayerManager.shared.load(track: track, timestamps: timestamps)
        }
        isLoadingAudio = false
    }
}

// MARK: - Verse Row

struct VerseRow: View {
    let verse: Verse
    var isHighlightedByAudio: Bool = false
    var onCrossRefTap: (() -> Void)?
    @State private var isBookmarked = false
    @State private var showShareCard = false
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(verse.verse)")
                .font(Theme.Typography.verseNumber)
                .foregroundStyle(isHighlightedByAudio ? Theme.Colors.accent : Theme.Colors.primary)
                .frame(width: 28, alignment: .trailing)
            
            Text(verse.text)
                .font(Theme.Typography.bodySerif)
                .foregroundStyle(Theme.Colors.text)
                .lineSpacing(6)
        }
        .padding(.horizontal)
        .padding(.vertical, Theme.Spacing.sm)
        .background(
            isHighlightedByAudio
                ? Theme.Colors.primaryAlpha(0.12)
                : Color.clear
        )
        .animation(Theme.Animation.fast, value: isHighlightedByAudio)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Verse \(verse.verse). \(verse.text)")
        .accessibilityHint("Long press for options like bookmark, cross-references, copy, and share")
        .contextMenu {
            Button {
                isBookmarked.toggle()
                HapticManager.shared.impact()
            } label: {
                Label(isBookmarked ? "Remove Bookmark" : "Bookmark", systemImage: isBookmarked ? "bookmark.fill" : "bookmark")
            }
            
            Button {
                onCrossRefTap?()
            } label: {
                Label("Cross-References", systemImage: "link")
            }
            
            Button {
                UIPasteboard.general.string = "\(verse.reference) - \(verse.text)"
            } label: {
                Label("Copy", systemImage: "doc.on.doc")
            }
            
            ShareLink(item: "\(verse.reference)\n\n\(verse.text)") {
                Label("Share Text", systemImage: "square.and.arrow.up")
            }
            
            Button {
                showShareCard = true
            } label: {
                Label("Share as Card", systemImage: "photo")
            }
        }
        .sheet(isPresented: $showShareCard) {
            ShareCardPickerView(
                verseText: verse.text,
                reference: "\(verse.reference) \(verse.translation)"
            )
        }
    }
}

// MARK: - Book Picker

struct BookPickerView: View {
    @Binding var selectedBook: String
    @Binding var selectedChapter: Int
    let onSelect: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    
    private let books = [
        // Old Testament
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
        "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
        "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
        "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
        "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
        "Zephaniah", "Haggai", "Zechariah", "Malachi",
        // New Testament
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
        "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
        "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
        "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
        "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
        "Jude", "Revelation"
    ]
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(books, id: \.self) { book in
                    NavigationLink {
                        ChapterPickerView(
                            book: book,
                            selectedChapter: $selectedChapter
                        ) {
                            selectedBook = book
                            onSelect()
                        }
                    } label: {
                        HStack {
                            Text(book)
                                .foregroundStyle(Theme.Colors.text)
                            
                            if book == selectedBook {
                                Spacer()
                                Image(systemName: "checkmark")
                                    .foregroundStyle(Theme.Colors.primary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Select Book")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .accessibilityLabel("Cancel book selection")
                }
            }
        }
    }
}

// MARK: - Chapter Picker

struct ChapterPickerView: View {
    let book: String
    @Binding var selectedChapter: Int
    let onSelect: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    
    private var chapterCount: Int {
        // Simplified - real app would have actual chapter counts
        switch book {
        case "Psalms": return 150
        case "Genesis", "Isaiah": return 50
        case "Exodus", "Job": return 40
        case "Jeremiah": return 52
        default: return 28
        }
    }
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 5), spacing: 12) {
                ForEach(1...chapterCount, id: \.self) { chapter in
                    Button {
                        selectedChapter = chapter
                        dismiss()
                        onSelect()
                    } label: {
                        Text("\(chapter)")
                            .font(Theme.Typography.title3)
                            .foregroundStyle(chapter == selectedChapter ? .white : Theme.Colors.text)
                            .frame(width: 56, height: 56)
                            .background(chapter == selectedChapter ? Theme.Colors.primary : Theme.Colors.surface)
                            .cornerRadius(Theme.CornerRadius.md)
                    }
                    .accessibilityLabel("Chapter \(chapter)\(chapter == selectedChapter ? ", selected" : "")")
                    .accessibilityHint("Double tap to read chapter \(chapter)")
                }
            }
            .padding()
        }
        .navigationTitle(book)
        .background(Theme.Colors.background)
    }
}

#Preview {
    BibleReaderView()
        .environment(AppState.preview)
}
