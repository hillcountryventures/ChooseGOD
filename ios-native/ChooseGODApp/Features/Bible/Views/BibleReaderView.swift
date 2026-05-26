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
    @State private var bookmarkedVerseNumbers: Set<Int> = []
    @State private var chapterHighlights: [VerseHighlight] = []
    @State private var showSearchSheet = false
    @State private var showScriptureScan = false
    @AppStorage("readerFontScale") private var readerFontScale: Double = 1.0
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if isLoading {
                    ShimmerView(height: 24).padding()
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
                                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))

                                // Verses
                                ForEach(verses) { verse in
                                    let isBookmarked = bookmarkedVerseNumbers.contains(verse.verse)
                                    let highlight = chapterHighlights.first { $0.verse == verse.verse }

                                    VerseRow(
                                        verse: verse,
                                        isBookmarked: isBookmarked,
                                        highlight: highlight,
                                        isHighlightedByAudio: audioPlayer.playbackState.currentVerse == verse.verse,
                                        fontScale: readerFontScale,
                                        onBookmarkToggle: {
                                            Task { await toggleBookmark(verse: verse) }
                                        },
                                        onHighlightToggle: { color in
                                            Task { await toggleHighlight(verse: verse, color: color) }
                                        },
                                        onCrossRefTap: {
                                            showCrossRefsForVerse = verse.verse
                                        }
                                    )
                                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
                                }
                            }
                            .padding(.vertical)
                            // Reserve space for the floating tab bar (+ audio bar when playing)
                            .padding(.bottom, Theme.Spacing.tabBarInset + (audioPlayer.playbackState.currentTrack != nil ? 70 : 0))
                        }
                        .simultaneousGesture(
                            DragGesture(minimumDistance: 50)
                                .onEnded { value in
                                    let h = value.translation.width
                                    let v = value.translation.height
                                    guard abs(h) > abs(v) else { return }
                                    if h < -50 {
                                        navigateToNextChapter()
                                    } else if h > 50 {
                                        navigateToPreviousChapter()
                                    }
                                }
                        )
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
                    HStack(spacing: Theme.Spacing.sm) {
                        // Tools menu (Search, Word Study, Scripture Scan)
                        Menu {
                            Button {
                                showSearchSheet = true
                            } label: {
                                Label("Search Bible", systemImage: "magnifyingglass")
                            }
                            Menu {
                                Button {
                                    readerFontScale = min(1.8, readerFontScale + 0.1)
                                } label: { Label("Larger", systemImage: "textformat.size.larger") }
                                Button {
                                    readerFontScale = max(0.8, readerFontScale - 0.1)
                                } label: { Label("Smaller", systemImage: "textformat.size.smaller") }
                                Button {
                                    readerFontScale = 1.0
                                } label: { Label("Reset text size", systemImage: "arrow.counterclockwise") }
                            } label: {
                                Label("Text size", systemImage: "textformat.size")
                            }
                            if FeatureFlags.scriptureScan {
                                Button {
                                    showScriptureScan = true
                                } label: {
                                    Label("Scan a verse", systemImage: "camera.viewfinder")
                                }
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                                .foregroundStyle(Theme.Colors.primary)
                        }
                        .accessibilityLabel("Bible tools")

                        // Translation menu
                        translationMenuView
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
            .sheet(isPresented: $showScriptureScan) {
                ScriptureScanView()
                    .environment(appState)
            }
            .sheet(isPresented: $showSearchSheet) {
                BibleSearchView { book, chapter in
                    selectedBook = book
                    selectedChapter = chapter
                    Task { await loadChapter() }
                }
                .environment(appState)
                .presentationBackground(.ultraThinMaterial)
                .presentationCornerRadius(32)
            }
            .task {
                restoreOrSetDefaultPosition()
                await loadChapter()
            }
        }
        .onAppear {
            // TODO: Analytics removed
            // TODO: Analytics removed
        }
    }
    
    private func restoreOrSetDefaultPosition() {
        let defaults = UserDefaults.standard
        if let savedBook = defaults.string(forKey: "lastReadBook"),
           defaults.integer(forKey: "lastReadChapter") > 0 {
            selectedBook = savedBook
            selectedChapter = defaults.integer(forKey: "lastReadChapter")
        } else {
            // First time — default to John 1
            selectedBook = "John"
            selectedChapter = 1
            defaults.set("John", forKey: "lastReadBook")
            defaults.set(1, forKey: "lastReadChapter")
            defaults.set(Date(), forKey: "lastReadDate")
        }
    }

    private func loadChapter() async {
        isLoading = true
        do {
            let fetchedVerses = try await appState.bibleService.fetchChapter(
                book: selectedBook,
                chapter: selectedChapter,
                translation: appState.preferences.preferredTranslation
            )
            withAnimation(Theme.Animation.normal) {
                verses = fetchedVerses
            }

            // Load bookmarks for this chapter
            if let userId = appState.currentUser?.id {
                let bookmarks = try? await BookmarkService.shared.getBookmarksForChapter(
                    book: selectedBook,
                    chapter: selectedChapter,
                    userId: userId
                )
                bookmarkedVerseNumbers = Set(bookmarks ?? [])
            } else {
                bookmarkedVerseNumbers.removeAll()
            }

            // Load highlights for this chapter
            if let userId = appState.currentUser?.id {
                chapterHighlights = (try? await HighlightService.shared.getHighlightsForChapter(
                    book: selectedBook,
                    chapter: selectedChapter,
                    userId: userId
                )) ?? []
            } else {
                chapterHighlights.removeAll()
            }

            // Decision #8: opening a chapter counts as activity for Days With God.
            // First-call-of-the-day increments the cumulative counter; subsequent
            // calls today are no-ops inside StreakManager.
            if let userId = appState.currentUser?.id {
                StreakManager.shared.recordActivity(
                    isPremium: appState.currentUser?.isPremium ?? false,
                    userId: userId
                )
            }

            // Persist reading position and record progress
            let defaults = UserDefaults.standard
            defaults.set(selectedBook, forKey: "lastReadBook")
            defaults.set(selectedChapter, forKey: "lastReadChapter")
            defaults.set(Date(), forKey: "lastReadDate")
            // TODO: ReadingStatsManager removed
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

    // MARK: - Chapter Navigation

    private func navigateToNextChapter() {
        let maxChapter = getChapterCount(for: selectedBook)
        if selectedChapter < maxChapter {
            selectedChapter += 1
        } else if let idx = BIBLE_BOOKS.firstIndex(where: { $0.name == selectedBook }), idx + 1 < BIBLE_BOOKS.count {
            selectedBook = BIBLE_BOOKS[idx + 1].name
            selectedChapter = 1
        }
        HapticManager.shared.selectionChanged()
        Task { await loadChapter() }
    }

    private func navigateToPreviousChapter() {
        if selectedChapter > 1 {
            selectedChapter -= 1
        } else if let idx = BIBLE_BOOKS.firstIndex(where: { $0.name == selectedBook }), idx > 0 {
            let prev = BIBLE_BOOKS[idx - 1]
            selectedBook = prev.name
            selectedChapter = prev.chapters
        }
        HapticManager.shared.selectionChanged()
        Task { await loadChapter() }
    }

    // MARK: - Bookmarks

    private func toggleBookmark(verse: Verse) async {
        guard let userId = appState.currentUser?.id else { return }
        let isCurrentlyBookmarked = bookmarkedVerseNumbers.contains(verse.verse)

        do {
            if isCurrentlyBookmarked {
                try await BookmarkService.shared.removeBookmark(
                    book: verse.book,
                    chapter: verse.chapter,
                    verse: verse.verse,
                    translation: verse.translation,
                    userId: userId
                )
                bookmarkedVerseNumbers.remove(verse.verse)
            } else {
                try await BookmarkService.shared.saveBookmark(verse: verse, userId: userId)
                bookmarkedVerseNumbers.insert(verse.verse)
            }
        } catch {
            appState.handleError(error)
        }
    }

    // MARK: - Highlights

    private func toggleHighlight(verse: Verse, color: HighlightColor) async {
        guard let userId = appState.currentUser?.id else { return }
        let existing = chapterHighlights.first { $0.verse == verse.verse }

        do {
            let result = try await HighlightService.shared.toggleHighlight(
                verse: verse,
                color: color,
                userId: userId,
                existingHighlight: existing
            )
            chapterHighlights.removeAll { $0.verse == verse.verse }
            if let updated = result {
                chapterHighlights.append(updated)
            }
            HapticManager.shared.impact()
        } catch {
            appState.handleError(error)
        }
    }

    // MARK: - UI Helpers

    @ViewBuilder
    private var translationMenuView: some View {
        Menu {
            Section("Popular") {
                translationButton(.kjv)
                translationButton(.niv)
            }
            Section("All Translations") {
                ForEach(BibleTranslation.allCases.filter { $0 != .kjv && $0 != .niv }) { translation in
                    translationButton(translation)
                }
            }
        } label: {
            Text(appState.preferences.preferredTranslation.rawValue)
                .font(Theme.Typography.subheadlineMedium)
                .foregroundStyle(Theme.Colors.primary)
        }
    }

    @ViewBuilder
    private func translationButton(_ translation: BibleTranslation) -> some View {
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
}

// MARK: - Verse Row

struct VerseRow: View {
    let verse: Verse
    var isBookmarked: Bool = false
    var highlight: VerseHighlight? = nil
    var isHighlightedByAudio: Bool = false
    /// Reader font scale (0.8–1.8), controlled by the in-app "Aa" control.
    /// Accessibility: lets older users enlarge scripture independent of the
    /// system Dynamic Type setting — the #1 a11y need for a Bible app.
    var fontScale: Double = 1.0
    var onBookmarkToggle: (() -> Void)?
    var onHighlightToggle: ((HighlightColor) -> Void)?
    var onCrossRefTap: (() -> Void)?

    @State private var showReflectionSheet = false

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(verse.verse)")
                .font(.system(size: 13 * fontScale, weight: .semibold, design: .serif))
                .foregroundStyle(isHighlightedByAudio ? Theme.Colors.accent : Theme.Colors.primary)
                .frame(width: 28, alignment: .trailing)

            Text(verse.text)
                .font(.system(size: 18 * fontScale, weight: .regular, design: .serif))
                .foregroundStyle(Theme.Colors.text)
                .lineSpacing(6 * fontScale)
        }
        .padding(.horizontal)
        .padding(.vertical, Theme.Spacing.sm)
        .background(
            Group {
                if let h = highlight {
                    Color(hex: h.color.color).opacity(0.25)
                } else if isHighlightedByAudio {
                    Theme.Colors.primaryAlpha(0.12)
                } else {
                    Color.clear
                }
            }
        )
        .animation(Theme.Animation.fast, value: isHighlightedByAudio)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Verse \(verse.verse). \(verse.text)")
        .accessibilityHint("Long press for options")
        .contextMenu {
            Button(action: { onBookmarkToggle?() }) {
                Label(
                    isBookmarked ? "Remove Bookmark" : "Bookmark",
                    systemImage: isBookmarked ? "bookmark.fill" : "bookmark"
                )
            }

            Button {
                onCrossRefTap?()
            } label: {
                Label("Cross-References", systemImage: "link")
            }

            // Highlight menu
            Menu {
                ForEach(HighlightColor.allCases, id: \.self) { color in
                    Button {
                        onHighlightToggle?(color)
                    } label: {
                        Label(
                            color.rawValue.capitalized,
                            systemImage: highlight?.color == color ? "circle.fill" : "circle"
                        )
                    }
                }
                if highlight != nil {
                    Divider()
                    Button(role: .destructive) {
                        if let h = highlight { onHighlightToggle?(h.color) }
                    } label: {
                        Label("Remove Highlight", systemImage: "xmark")
                    }
                }
            } label: {
                Label(
                    highlight != nil ? "Change Highlight" : "Highlight",
                    systemImage: "highlighter"
                )
            }

            Button {
                showReflectionSheet = true
            } label: {
                Label("Reflect", systemImage: "pencil.and.scribble")
            }

            Button {
                UIPasteboard.general.string = "\(verse.reference) - \(verse.text)"
            } label: {
                Label("Copy", systemImage: "doc.on.doc")
            }

            ShareLink(item: "\(verse.reference)\n\n\(verse.text)") {
                Label("Share Text", systemImage: "square.and.arrow.up")
            }
        }
        .sheet(isPresented: $showReflectionSheet) {
            ReflectionSheet(
                verseRef: verse.reference,
                verseText: verse.text,
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verse
            )
            .presentationBackground(.ultraThinMaterial)
            .presentationCornerRadius(32)
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
