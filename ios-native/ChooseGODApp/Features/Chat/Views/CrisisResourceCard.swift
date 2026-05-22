import SwiftUI

/// Strategy Decision #14 — rendered inline beneath an assistant message when
/// the companion's crisis-detection classifies the user's input as a crisis.
/// Tier 1 (life safety) shows lifelines prominently. Tier 2 (serious pattern)
/// surfaces counselor-finder. Tiers 3 & 4 don't render this card; the system
/// prompt handles their tone via lament scripture in the AI message body.
struct CrisisResourceCard: View {
    let tier: Int

    var body: some View {
        switch tier {
        case 1: tier1Body
        case 2: tier2Body
        default: EmptyView()
        }
    }

    // MARK: - Tier 1 — Life Safety

    private var tier1Body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(.white)
                Text("If you're in danger right now, please reach out:")
                    .font(.caption)
                    .bold()
                    .foregroundStyle(.white)
            }

            VStack(spacing: 8) {
                resourceButton(
                    title: "Call 988",
                    subtitle: "Suicide & Crisis Lifeline (24/7)",
                    icon: "phone.fill",
                    action: { open("tel://988") }
                )
                resourceButton(
                    title: "Text HOME to 741741",
                    subtitle: "Crisis Text Line",
                    icon: "message.fill",
                    action: { open("sms:741741&body=HOME") }
                )
                resourceButton(
                    title: "Call 911",
                    subtitle: "Immediate emergency",
                    icon: "cross.circle.fill",
                    action: { open("tel://911") }
                )
            }

            Text("You are not alone. Reaching out is brave.")
                .font(.caption2)
                .italic()
                .foregroundStyle(.white.opacity(0.85))
                .padding(.top, 4)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Color.red, Color.red.opacity(0.85)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Tier 2 — Serious Pattern

    private var tier2Body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "heart.text.square.fill")
                    .foregroundStyle(Theme.Colors.text)
                Text("Some weights are too heavy to carry alone.")
                    .font(.caption)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }

            Text("If what you're sharing is part of a longer pattern — abuse, addiction, or a hopelessness that doesn't lift — a counselor or pastor walking with you can be a real gift, not a replacement for prayer.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 8) {
                resourceLink(
                    title: "Find a counselor",
                    icon: "person.fill.questionmark",
                    url: "https://www.psychologytoday.com/us/therapists"
                )
                resourceLink(
                    title: "SAMHSA helpline",
                    icon: "phone.connection",
                    url: "tel://18006624357"
                )
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.primary.opacity(0.08))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Theme.Colors.primary.opacity(0.4), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Helpers

    private func resourceButton(title: String, subtitle: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .foregroundStyle(.white)
                VStack(alignment: .leading, spacing: 1) {
                    Text(title)
                        .font(.subheadline)
                        .bold()
                        .foregroundStyle(.white)
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.85))
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(.white.opacity(0.18))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
    }

    private func resourceLink(title: String, icon: String, url: String) -> some View {
        Button { open(url) } label: {
            Label(title, systemImage: icon)
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Theme.Colors.primary.opacity(0.12))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func open(_ urlString: String) {
        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        CrisisResourceCard(tier: 1)
        CrisisResourceCard(tier: 2)
    }
    .padding()
    .environment(AppState.preview)
}
