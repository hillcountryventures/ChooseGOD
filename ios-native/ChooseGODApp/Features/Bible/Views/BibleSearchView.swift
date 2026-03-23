import SwiftUI

/// Full-text search view for Bible verses
struct BibleSearchView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    var onVerseSelected: ((_ book: String, _ chapter: Int) -> Void)?

    @State private var query = ""
    @State private var results: [Verse] = []
    @State private var isLoading = false
    @State private var hasSearched = false
    @State private var searchTask: Task<Void, Never>?

    // Computed: unique books in order
    private var uniqueBooks: [String] {
        var seen = Set<String>()
        return results.compactMap { seen.insert($0.book).inserted ? $0.book : nil }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Search bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(Theme.Colors.textTertiary)
                        TextField("Search Bible...", text: $query)
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.text)
                        if !query.isEmpty {
                            Button { query = "" } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(Theme.Colors.textTertiary)
                            }
                        }
                    }
                    .padding(Theme.Spacing.md)
                    .background(Theme.Colors.surface)
                    .cornerRadius(Theme.CornerRadius.lg)
                    .padding(Theme.Spacing.md)

                    // Results or empty state
                    if isLoading {
                        VStack(spacing: 12) {
                            ForEach(0..<3, id: \.self) { _ in
                                ShimmerView(height: 20)
                                    .tint(Theme.Colors.primary)
                            }
                        }
                        .padding(Theme.Spacing.md)
                    } else if results.isEmpty && hasSearched {
                        VStack(spacing: 16) {
                            Image(systemName: "text.book.closed")
                                .font(.system(size: 60))
                                .foregroundStyle(Theme.Colors.textTertiary)
                            Text("No verses found for \"\(query)\"")
                                .font(Theme.Typography.title3)
                                .foregroundStyle(Theme.Colors.text)
                            Text("Try asking the AI Companion for deeper exploration")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(Theme.Colors.textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(Theme.Spacing.xl)
                    } else if results.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(Theme.Typography.iconXL)
                                .foregroundStyle(Theme.Colors.textTertiary)
                            Text("Search all 66 books")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                        .frame(maxHeight: .infinity)
                        .padding(Theme.Spacing.xl)
                    } else {
                        // Results list
                        List {
                            ForEach(uniqueBooks, id: \.self) { book in
                                Section(header: Text(book)
                                    .font(Theme.Typography.label)
                                    .foregroundStyle(Theme.Colors.primary)
                                ) {
                                    ForEach(results.filter { $0.book == book }) { verse in
                                        Button(action: {
                                            onVerseSelected?(verse.book, verse.chapter)
                                            dismiss()
                                        }) {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(verse.reference)
                                                    .font(Theme.Typography.label)
                                                    .foregroundStyle(Theme.Colors.primary)
                                                highlightedText(
                                                    String(verse.text.prefix(120)) + (verse.text.count > 120 ? "..." : ""),
                                                    query: query
                                                )
                                                .font(Theme.Typography.bodySmall)
                                                .lineLimit(3)
                                            }
                                            .padding(.vertical, Theme.Spacing.xs)
                                        }
                                    }
                                }
                            }
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Search Bible")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
            .onChange(of: query) { _, newQuery in
                searchTask?.cancel()
                guard newQuery.count >= 3 else {
                    results = []
                    hasSearched = false
                    return
                }
                searchTask = Task {
                    try? await Task.sleep(for: .milliseconds(400))
                    guard !Task.isCancelled else { return }
                    await performSearch(query: newQuery)
                }
            }
            .onAppear {
                // TODO: Analytics removed
            }
        }
    }

    // MARK: - Search

    private func performSearch(query: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let found = try await appState.bibleService.searchVerses(
                query: query,
                translation: appState.preferences.preferredTranslation,
                limit: 50
            )
            results = found
            hasSearched = true
            // TODO: Analytics removed
        } catch {
            results = []
            hasSearched = true
        }
    }

    // MARK: - Highlighting

    private func highlightedText(_ text: String, query: String) -> Text {
        var result = Text("")
        var remaining = text
        let queryLower = query.lowercased()
        let textLower = text.lowercased()
        var currentIndex = textLower.startIndex

        while let range = textLower[currentIndex...].range(of: queryLower, options: .caseInsensitive) {
            let before = String(remaining[remaining.startIndex..<range.lowerBound])
            let match = String(remaining[range])

            if !before.isEmpty {
                result = result + Text(before).foregroundStyle(Theme.Colors.text)
            }
            result = result + Text(match)
                .bold()
                .foregroundStyle(Theme.Colors.primary)

            remaining = String(remaining[range.upperBound...])
            currentIndex = range.upperBound
        }

        if !remaining.isEmpty {
            result = result + Text(remaining).foregroundStyle(Theme.Colors.text)
        }

        return result
    }
}

#Preview {
    BibleSearchView()
        .environment(AppState.preview)
}
