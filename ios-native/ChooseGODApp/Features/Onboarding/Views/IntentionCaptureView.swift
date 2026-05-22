import SwiftUI

/// Decision G2 — onboarding screen that solves the cold-start problem for
/// the personalization moat. Captures the user's current intention/prayer
/// before account creation, so the companion AI has something real to ground
/// in on the very first chat.
///
/// Skippable (some users won't share on first install) but pushed gently
/// because it's the most leverage personalization signal we'll ever get
/// from a Day-0 user.
struct IntentionCaptureView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onContinue: () -> Void

    @State private var content: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                        .padding(.top, 24)
                    examplePrompts
                    editor
                }
                .padding(.horizontal, 20)
            }

            footer
        }
        .background(Theme.Colors.background.ignoresSafeArea())
        .onAppear {
            // Slight delay so the autofocus doesn't fight the onboarding
            // transition animation.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                isFocused = true
            }
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("What's on your heart right now?")
                .font(.title)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("One sentence. The companion uses this to ground every conversation in YOUR walk \u{2014} not a generic answer.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var examplePrompts: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Examples")
                .font(.caption2)
                .bold()
                .foregroundStyle(Theme.Colors.secondaryText)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Self.examples, id: \.self) { example in
                        Button {
                            content = example
                            isFocused = true
                        } label: {
                            Text(example)
                                .font(.caption)
                                .foregroundStyle(Theme.Colors.text)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Theme.Colors.surface)
                                .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var editor: some View {
        ZStack(alignment: .topLeading) {
            TextEditor(text: $content)
                .font(.body)
                .scrollContentBackground(.hidden)
                .frame(minHeight: 160)
                .padding(12)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .focused($isFocused)
            if content.isEmpty {
                Text("My heart right now is\u{2026}")
                    .font(.body)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .padding(20)
                    .allowsHitTesting(false)
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 8) {
            Button {
                viewModel.pendingIntention = content.trimmingCharacters(in: .whitespacesAndNewlines)
                onContinue()
            } label: {
                Text(content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                     ? "Skip for now"
                     : "Continue")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }

            Text("You can change or remove this anytime in Settings.")
                .font(.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 30)
        .padding(.top, 12)
        .background(Theme.Colors.background.ignoresSafeArea(edges: .bottom))
    }

    // MARK: - Examples

    private static let examples: [String] = [
        "Wisdom for a decision at work",
        "Healing in my marriage",
        "Hope after a hard year",
        "Peace about my kids",
        "Strength in this season",
        "Direction \u{2014} I feel stuck"
    ]
}

#Preview {
    IntentionCaptureView(viewModel: OnboardingViewModel(), onContinue: {})
        .environment(AppState.preview)
}
