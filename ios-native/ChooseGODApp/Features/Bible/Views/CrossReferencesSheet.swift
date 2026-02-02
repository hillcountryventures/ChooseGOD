import SwiftUI

/// Sheet displaying cross-references for a selected verse (Treasury of Scripture Knowledge)
struct CrossReferencesSheet: View {
    let book: String
    let chapter: Int
    let verse: Int
    let translation: String
    
    @State private var crossRefs: [CrossReference] = []
    @State private var groupedRefs: [GroupedCrossReferences] = []
    @State private var isLoading = false
    @State private var loadError: String?
    @Environment(\.dismiss) private var dismiss
    
    private let service = SupabaseCrossRefService.shared
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                if isLoading {
                    VStack(spacing: 16) {
                ShimmerView(height: 20)
                            .tint(Theme.Colors.primary)
                        Text("Finding cross-references...")
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                } else if let error = loadError {
                    ErrorRetryView(message: error) {
                        loadError = nil
                        Task { await loadCrossReferences() }
                    }
                } else if groupedRefs.isEmpty {
                    emptyView
                } else {
                    contentView
                }
            }
            .navigationTitle("\(book) \(chapter):\(verse)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .task { await loadCrossReferences() }
        }
        .presentationBackground(.ultraThinMaterial)
        .presentationCornerRadius(32)
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
    
    // MARK: - Content
    
    private var contentView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                HStack(spacing: 8) {
                    Image(systemName: "link")
                        .foregroundStyle(Theme.Colors.primary)
                    Text("\(crossRefs.count) Cross-References")
                        .font(Theme.Typography.label)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                .padding(.horizontal)
                .padding(.top, Theme.Spacing.sm)
                
                // Grouped references
                ForEach(groupedRefs) { group in
                    VStack(alignment: .leading, spacing: 8) {
                        // Book header
                        Text(group.book)
                            .font(Theme.Typography.label)
                            .foregroundStyle(Theme.Colors.primary)
                            .padding(.horizontal)
                        
                        // References
                        ForEach(group.references) { ref in
                            crossRefCard(ref)
                        }
                    }
                }
            }
            .padding(.vertical)
        }
    }
    
    private func crossRefCard(_ ref: CrossReference) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(ref.reference)
                    .font(Theme.Typography.subheadlineSerif)
                    .foregroundStyle(Theme.Colors.primary)
                
                Spacer()
                
                // Vote indicator
                if ref.votes > 0 {
                    HStack(spacing: 2) {
                        Image(systemName: "hand.thumbsup.fill")
                            .font(Theme.Typography.caption2)
                        Text("\(ref.votes)")
                            .font(Theme.Typography.monoSmall)
                    }
                    .foregroundStyle(Theme.Colors.textTertiary)
                }
                
                // Direction badge
                Image(systemName: ref.direction == "to" ? "arrow.right" : "arrow.left")
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            
            Text(ref.text)
                .font(Theme.Typography.calloutSerif)
                .foregroundStyle(Theme.Colors.text)
                .lineSpacing(4)
        }
        .padding(Theme.Spacing.mds)
        .glassCard(cornerRadius: Theme.CornerRadius.lg, opacity: 0.5)
        .padding(.horizontal)
        .contextMenu {
            Button {
                UIPasteboard.general.string = "\(ref.reference) — \(ref.text)"
            } label: {
                Label("Copy", systemImage: "doc.on.doc")
            }
            
            ShareLink(item: "\(ref.reference)\n\n\(ref.text)") {
                Label("Share", systemImage: "square.and.arrow.up")
            }
        }
    }
    
    // MARK: - Empty & Error
    
    private var emptyView: some View {
        VStack(spacing: 16) {
            Image(systemName: "text.book.closed")
                .font(Theme.Typography.iconXL)
                .foregroundStyle(Theme.Colors.textTertiary)
            
            Text("No Cross-References Found")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            Text("No Treasury of Scripture Knowledge entries for this verse.")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(Theme.Spacing.xl)
    }
    
    // MARK: - Data Loading
    
    private func loadCrossReferences() async {
        isLoading = true
        loadError = nil
        
        do {
            let refs = try await service.fetchCrossReferences(
                book: book,
                chapter: chapter,
                verse: verse,
                translation: translation
            )
            crossRefs = refs
            groupedRefs = service.groupByBook(refs)
        } catch {
            loadError = "Couldn't load cross-references. Please try again."
        }
        
        isLoading = false
    }
}

#Preview {
    CrossReferencesSheet(
        book: "John",
        chapter: 3,
        verse: 16,
        translation: "KJV"
    )
}
