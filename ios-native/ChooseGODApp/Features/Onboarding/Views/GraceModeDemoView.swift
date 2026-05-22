import SwiftUI

/// Strategy Decision #7 + #2 — the hero mechanic demo, screen #2 of onboarding.
/// A 10–15s interactive simulation of "you missed two days, here's what we
/// did about it." The user feels Grace Mode before they create an account,
/// so the wedge ("the Bible app that doesn't shame you") is shown, not told.
struct GraceModeDemoView: View {
    let onContinue: () -> Void

    @State private var phase: Phase = .scenario
    @State private var appeared: Bool = false

    enum Phase {
        case scenario   // "You missed Tue + Wed"
        case revealing  // animating in the catch-up
        case revealed   // catch-up summary visible + continue CTA
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 24)

            header

            Spacer(minLength: 24)

            ZStack {
                if phase == .scenario {
                    scenarioCard
                        .transition(.opacity)
                } else {
                    catchUpCard
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                }
            }
            .padding(.horizontal, 20)

            Spacer()

            footer
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
        }
        .background(Theme.Colors.background.ignoresSafeArea())
        .onAppear {
            withAnimation(.easeOut(duration: 0.4).delay(0.1)) {
                appeared = true
            }
            // Decision #15 — the screen was rendered to the user.
            MagicMomentsService.shared.capture(.day0_grace_demo_seen)
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(spacing: 10) {
            Text("Everyone can use a little more grace.")
                .font(.title2)
                .bold()
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.Colors.text)
                .padding(.horizontal, 24)

            Text(phase == .scenario
                 ? "Watch what happens when you miss a few days."
                 : "No catch-up shame. Just a gentle bridge back.")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.Colors.secondaryText)
                .padding(.horizontal, 32)
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 12)
    }

    private var scenarioCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "calendar")
                    .foregroundStyle(Theme.Colors.secondaryText)
                Text("This week")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
                Spacer()
            }

            HStack(spacing: 8) {
                ForEach(0..<7, id: \.self) { i in
                    let day = ["S","M","T","W","T","F","S"][i]
                    let active = i == 0 || i == 1 || i == 5
                    let missed = i == 2 || i == 3
                    VStack(spacing: 6) {
                        Text(day)
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.secondaryText)
                        Circle()
                            .fill(active ? Theme.Colors.primary
                                  : missed ? Color.orange.opacity(0.3)
                                  : Theme.Colors.secondaryText.opacity(0.15))
                            .frame(width: 28, height: 28)
                            .overlay(
                                Group {
                                    if active {
                                        Image(systemName: "checkmark")
                                            .font(.caption2)
                                            .bold()
                                            .foregroundStyle(.white)
                                    } else if missed {
                                        Image(systemName: "minus")
                                            .font(.caption2)
                                            .foregroundStyle(.orange)
                                    }
                                }
                            )
                    }
                    .frame(maxWidth: .infinity)
                }
            }

            Text("You missed Tuesday and Wednesday.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.text)

            Text("Most apps would shame you back. ChooseGOD does this:")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    private var catchUpCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                Image(systemName: "leaf.fill")
                    .foregroundStyle(Color.green)
                Text("Welcome back. Here's where you left off.")
                    .font(.subheadline)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
            }

            VStack(alignment: .leading, spacing: 10) {
                catchUpRow(day: "Tuesday", verse: "Psalm 46:10",
                           summary: "Be still, and know that I am God. The day was about presence, not productivity.")
                catchUpRow(day: "Wednesday", verse: "Isaiah 41:10",
                           summary: "Fear not, for I am with you. About the courage to keep going when life gets in the way.")
            }

            Text("You're back. Today is still here.")
                .font(.caption)
                .italic()
                .foregroundStyle(Theme.Colors.secondaryText)
                .padding(.top, 4)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Color.green.opacity(0.10), Theme.Colors.surface],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(Color.green.opacity(0.3), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    private func catchUpRow(day: String, verse: String, summary: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Text(day)
                    .font(.caption)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
                Text("•")
                    .foregroundStyle(Theme.Colors.secondaryText)
                Text(verse)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.primary)
            }
            Text(summary)
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var footer: some View {
        VStack(spacing: 12) {
            Button {
                if phase == .scenario {
                    // Decision #15 — user actively chose to see the catch-up.
                    MagicMomentsService.shared.capture(.day0_grace_demo_revealed)
                    withAnimation(.easeInOut(duration: 0.5)) {
                        phase = .revealing
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        withAnimation { phase = .revealed }
                    }
                } else {
                    onContinue()
                }
            } label: {
                Text(phase == .scenario ? "Show me Grace Mode" : "Continue")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            if phase == .scenario {
                Text("This is a quick demo with sample data.")
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
    }
}

#Preview {
    GraceModeDemoView(onContinue: {})
        .environment(AppState.preview)
}
