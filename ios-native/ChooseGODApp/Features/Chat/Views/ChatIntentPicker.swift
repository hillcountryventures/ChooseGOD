import SwiftUI

/// Strategy Decision #6 — Ask / Pray / Reflect.
/// Single-pick segmented control. Each segment shows the icon + label and a
/// tiny subtitle on the focused option so the user understands what each
/// intent does without launching an explainer.
struct ChatIntentPicker: View {
    let selected: ChatIntent
    let onSelect: (ChatIntent) -> Void

    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                ForEach(ChatIntent.allCases) { intent in
                    Button {
                        onSelect(intent)
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: intent.icon)
                                .font(.callout)
                            Text(intent.displayName)
                                .font(.caption)
                                .bold()
                        }
                        .foregroundStyle(selected == intent ? .white : Theme.Colors.text)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(selected == intent
                                      ? Theme.Colors.primary
                                      : Theme.Colors.surface)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)

            Text(selected.subtitle)
                .font(.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
                .frame(maxWidth: .infinity, alignment: .center)
                .transition(.opacity)
                .animation(.easeOut(duration: 0.15), value: selected)
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    ChatIntentPicker(selected: .ask) { _ in }
        .environment(AppState.preview)
}
