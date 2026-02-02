import SwiftUI

/// Displays verse sources returned by the AI companion
struct SourceVerseCard: View {
    let sources: [VerseSource]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: "book.closed")
                    .font(Theme.Typography.caption)
                Text("Sources")
                    .font(Theme.Typography.captionSemibold)
            }
            .foregroundStyle(Theme.Colors.secondaryText)
            
            ForEach(sources) { source in
                HStack(alignment: .top, spacing: 8) {
                    Text(source.reference)
                        .font(Theme.Typography.captionMedium)
                        .foregroundStyle(Theme.Colors.primary)
                        .frame(minWidth: 80, alignment: .leading)
                    
                    if let text = source.text {
                        Text(text)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                            .lineLimit(2)
                    }
                }
                .padding(Theme.Spacing.sm)
                .background(Theme.Colors.surface.opacity(0.6))
                .cornerRadius(Theme.CornerRadius.md)
            }
        }
        .padding(Theme.Spacing.mds)
        .background(Theme.Colors.primary.opacity(0.06))
        .cornerRadius(Theme.CornerRadius.lg)
    }
}

/// Inline source pills for displaying under a message
struct SourceVersePills: View {
    let sources: [VerseSource]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(sources) { source in
                    Text(source.reference)
                        .font(Theme.Typography.captionMedium)
                        .foregroundStyle(Theme.Colors.primary)
                        .padding(.horizontal, Theme.Spacing.sm)
                        .padding(.vertical, 4)
                        .background(Theme.Colors.primary.opacity(0.1))
                        .clipShape(Capsule())
                }
            }
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        SourceVerseCard(sources: [
            VerseSource(book: "Philippians", chapter: 4, verse: 6, text: "Be careful for nothing; but in every thing by prayer...", translation: "KJV"),
            VerseSource(book: "1 Peter", chapter: 5, verse: 7, text: "Casting all your care upon him; for he careth for you.", translation: "KJV")
        ])
        
        SourceVersePills(sources: [
            VerseSource(book: "John", chapter: 3, verse: 16, text: nil, translation: nil),
            VerseSource(book: "Romans", chapter: 8, verse: 28, text: nil, translation: nil)
        ])
    }
    .padding()
    .background(Theme.Colors.background)
}
