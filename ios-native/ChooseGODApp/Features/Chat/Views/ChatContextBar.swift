import SwiftUI

/// Shows the current chat context (e.g. "Reading John 3" or "Devotional Day 3")
struct ChatContextBar: View {
    let context: ChatContext
    let currentMode: ChatMode
    let onModeChange: (ChatMode) -> Void
    
    @State private var showModePicker = false
    
    var body: some View {
        HStack(spacing: 10) {
            // Context pill
            if let description = contextDescription {
                HStack(spacing: 6) {
                    Image(systemName: contextIcon)
                        .font(Theme.Typography.caption)
                    Text(description)
                        .font(Theme.Typography.captionMedium)
                }
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, Theme.Spacing.smd)
                .padding(.vertical, 6)
                .background(Theme.Colors.primary.opacity(0.12))
                .clipShape(Capsule())
            }
            
            Spacer()
            
            // Mode selector
            Button {
                showModePicker.toggle()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: currentMode.icon)
                        .font(Theme.Typography.caption)
                    Text(currentMode.displayName)
                        .font(Theme.Typography.captionMedium)
                    Image(systemName: "chevron.down")
                        .font(Theme.Typography.caption2)
                }
                .foregroundStyle(Theme.Colors.secondaryText)
                .padding(.horizontal, Theme.Spacing.smd)
                .padding(.vertical, 6)
                .background(Theme.Colors.surface)
                .clipShape(Capsule())
            }
            .popover(isPresented: $showModePicker) {
                modePickerContent
                    .presentationCompactAdaptation(.popover)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 6)
        .background(Theme.Colors.background.opacity(0.95))
    }
    
    // MARK: - Helpers
    
    private var contextDescription: String? {
        if let bible = context.bibleContext {
            return "Reading \(bible.reference)"
        }
        if let dev = context.devotionalContext {
            return "\(dev.seriesTitle) — Day \(dev.dayNumber)"
        }
        return nil
    }
    
    private var contextIcon: String {
        switch context.screenType {
        case .bible: return "book.closed"
        case .devotional: return "text.book.closed"
        case .journey: return "figure.walk"
        default: return "sparkles"
        }
    }
    
    private var modePickerContent: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Chat Mode")
                .font(Theme.Typography.title3)
                .padding(.horizontal)
                .padding(.top, Theme.Spacing.mds)
            
            ForEach(ChatMode.allCases, id: \.self) { mode in
                Button {
                    onModeChange(mode)
                    showModePicker = false
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: mode.icon)
                            .frame(width: 24)
                        Text(mode.displayName)
                        Spacer()
                        if mode == currentMode {
                            Image(systemName: "checkmark")
                                .foregroundStyle(Theme.Colors.primary)
                        }
                    }
                    .foregroundStyle(Theme.Colors.text)
                    .padding(.horizontal)
                    .padding(.vertical, Theme.Spacing.smd)
                    .background(mode == currentMode ? Theme.Colors.primary.opacity(0.08) : .clear)
                }
            }
        }
        .frame(minWidth: 220)
        .padding(.bottom, Theme.Spacing.sm)
    }
}

#Preview {
    VStack {
        ChatContextBar(
            context: ChatContext(
                screenType: .bible,
                bibleContext: ChatBibleContext(book: "John", chapter: 3, selectedVerse: nil)
            ),
            currentMode: .auto,
            onModeChange: { _ in }
        )
        
        ChatContextBar(
            context: ChatContext(
                screenType: .devotional,
                devotionalContext: ChatDevotionalContext(seriesId: "1", seriesTitle: "Grace Unfailing", dayNumber: 3, scriptureRef: nil)
            ),
            currentMode: .devotional,
            onModeChange: { _ in }
        )
    }
    .background(Theme.Colors.background)
}
