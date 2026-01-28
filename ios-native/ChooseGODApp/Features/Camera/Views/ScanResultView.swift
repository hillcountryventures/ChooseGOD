import SwiftUI

/// Shows recognized text with highlighted verse references
struct ScanResultView: View {
    let result: ScanResult
    @Environment(\.dismiss) private var dismiss
    @State private var showActions = false
    @State private var selectedVerse: VerseReference?
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Confidence indicator
                    confidenceBadge
                    
                    // Scanned text with highlighted references
                    scannedTextCard
                    
                    // Verse references found
                    if result.hasVerseReferences {
                        verseReferencesSection
                    }
                    
                    // Action buttons
                    actionButtons
                }
                .padding()
            }
            .background(Theme.Colors.background.ignoresSafeArea())
            .navigationTitle("Scan Result")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(Theme.Colors.text)
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
    }
    
    // MARK: - Confidence Badge
    
    private var confidenceBadge: some View {
        HStack(spacing: 8) {
            Image(systemName: confidenceIcon)
                .foregroundColor(confidenceColor)
            Text("Confidence: \(Int(result.confidence * 100))%")
                .font(.caption.weight(.medium))
                .foregroundColor(Theme.Colors.textSecondary)
            
            Spacer()
            
            if result.hasVerseReferences {
                Label("\(result.verseReferences.count) verse\(result.verseReferences.count == 1 ? "" : "s") found",
                      systemImage: "book.fill")
                    .font(.caption.weight(.medium))
                    .foregroundColor(Theme.Colors.primary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .modifier(GlassCard(cornerRadius: 12))
    }
    
    private var confidenceIcon: String {
        result.confidence > 0.8 ? "checkmark.circle.fill" :
        result.confidence > 0.5 ? "exclamationmark.circle.fill" : "questionmark.circle.fill"
    }
    
    private var confidenceColor: Color {
        result.confidence > 0.8 ? Theme.Colors.success :
        result.confidence > 0.5 ? Theme.Colors.warning : Theme.Colors.error
    }
    
    // MARK: - Scanned Text Card
    
    private var scannedTextCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Scanned Text", systemImage: "doc.text.viewfinder")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(Theme.Colors.text)
            
            highlightedText
                .font(.body)
                .lineSpacing(4)
        }
        .padding(16)
        .modifier(GlassCard(cornerRadius: 16))
    }
    
    /// Build attributed text with highlighted verse references
    private var highlightedText: some View {
        let text = result.fullText
        
        if result.verseReferences.isEmpty {
            return AnyView(
                Text(text)
                    .foregroundColor(Theme.Colors.textSecondary)
            )
        }
        
        // Build Text with highlighted refs
        var components: [HighlightComponent] = []
        var lastEnd = text.startIndex
        
        for ref in result.verseReferences {
            if lastEnd < ref.range.lowerBound {
                components.append(.plain(String(text[lastEnd..<ref.range.lowerBound])))
            }
            components.append(.verse(ref))
            lastEnd = ref.range.upperBound
        }
        if lastEnd < text.endIndex {
            components.append(.plain(String(text[lastEnd...])))
        }
        
        var combined = Text("")
        for component in components {
            switch component {
            case .plain(let str):
                combined = combined + Text(str).foregroundColor(Theme.Colors.textSecondary)
            case .verse(let ref):
                combined = combined + Text(ref.fullMatch)
                    .foregroundColor(Theme.Colors.primary)
                    .bold()
                    .underline()
            }
        }
        
        return AnyView(combined)
    }
    
    // MARK: - Verse References Section
    
    private var verseReferencesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Verse References", systemImage: "bookmark.fill")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(Theme.Colors.text)
            
            ForEach(result.verseReferences) { ref in
                Button {
                    selectedVerse = ref
                } label: {
                    HStack {
                        Image(systemName: "book.fill")
                            .foregroundColor(Theme.Colors.accent)
                        Text(ref.displayString)
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(Theme.Colors.text)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(Theme.Colors.textTertiary)
                    }
                    .padding(12)
                    .background(Theme.Colors.surfaceElevated)
                    .cornerRadius(10)
                }
            }
        }
        .padding(16)
        .modifier(GlassCard(cornerRadius: 16))
    }
    
    // MARK: - Action Buttons
    
    private var actionButtons: some View {
        VStack(spacing: 12) {
            // Ask AI about scanned text
            actionButton(
                title: "Ask AI About This",
                subtitle: "What does the Bible say?",
                icon: "sparkles",
                color: Theme.Colors.primary
            ) {
                // Navigate to chat with scanned text context
            }
            
            HStack(spacing: 12) {
                // Bookmark
                actionButton(
                    title: "Bookmark",
                    icon: "bookmark",
                    color: Theme.Colors.accent
                ) {
                    // Save to bookmarks
                }
                
                // Copy text
                actionButton(
                    title: "Copy Text",
                    icon: "doc.on.doc",
                    color: Theme.Colors.info
                ) {
                    UIPasteboard.general.string = result.fullText
                }
            }
        }
    }
    
    private func actionButton(
        title: String,
        subtitle: String? = nil,
        icon: String,
        color: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(Theme.Colors.text)
                    if let subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(Theme.Colors.textTertiary)
            }
            .padding(14)
            .modifier(GlassCard(cornerRadius: 14))
        }
    }
}

// MARK: - Helpers

private enum HighlightComponent {
    case plain(String)
    case verse(VerseReference)
}
