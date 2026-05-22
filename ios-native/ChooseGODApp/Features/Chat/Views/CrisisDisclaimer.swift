import SwiftUI

/// Strategy Decision #14 + #15 — required at every chat entry.
/// "ChooseGOD is not a replacement for professional mental health or crisis
///  care. If in immediate danger, call 988."
/// Persistent, collapsible. One-tap call to 988 when expanded.
struct CrisisDisclaimer: View {
    @State private var isExpanded: Bool = false

    var body: some View {
        VStack(spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: "info.circle.fill")
                        .foregroundStyle(Color.orange)
                        .font(.caption)
                    Text("Not a replacement for professional care.")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Text(isExpanded ? "Hide" : "Tap for resources")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Crisis disclaimer")
            .accessibilityHint("Tap to expand for emergency resources")

            if isExpanded {
                expandedContent
            }
        }
        .background(Color.orange.opacity(0.08))
        .overlay(
            Rectangle()
                .fill(Color.orange.opacity(0.25))
                .frame(height: 0.5),
            alignment: .bottom
        )
    }

    private var expandedContent: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("ChooseGOD is not a substitute for professional mental health or crisis care. If you're in immediate danger or considering harm, please reach out to a real human now.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 10) {
                Button {
                    callHotline("988")
                } label: {
                    Label("Call 988", systemImage: "phone.fill")
                        .font(.caption)
                        .bold()
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.red)
                        .clipShape(Capsule())
                }
                Button {
                    textHotline()
                } label: {
                    Label("Text HOME to 741741", systemImage: "message.fill")
                        .font(.caption)
                        .bold()
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.blue)
                        .clipShape(Capsule())
                }
                Spacer()
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }

    private func callHotline(_ number: String) {
        if let url = URL(string: "tel://\(number)") {
            UIApplication.shared.open(url)
        }
    }

    private func textHotline() {
        if let url = URL(string: "sms:741741&body=HOME") {
            UIApplication.shared.open(url)
        }
    }
}

#Preview {
    CrisisDisclaimer()
        .environment(AppState.preview)
}
