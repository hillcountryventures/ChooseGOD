import SwiftUI

/// Strategy Decision #13 — single tradition picker that replaces the previous
/// 4-question quiz. The selected tradition is persisted to
/// `user_preferences.tradition` (migration 050) and injected into the AI
/// system prompt on every companion call.
///
/// Filename retained as PersonalizationQuizView so the existing OnboardingStep
/// case wiring stays compatible — the *contents* are the new picker.
struct PersonalizationQuizView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onContinue: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 16) {
                    header
                        .padding(.top, 24)
                        .padding(.horizontal, 24)

                    VStack(spacing: 10) {
                        ForEach(Tradition.allCases, id: \.self) { tradition in
                            TraditionCard(
                                tradition: tradition,
                                isSelected: viewModel.selectedTradition == tradition
                            ) {
                                viewModel.selectTradition(tradition)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }

            VStack(spacing: 8) {
                Button {
                    onContinue()
                } label: {
                    Text("Continue")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(viewModel.canProceed
                                    ? Theme.Colors.primary
                                    : Theme.Colors.primary.opacity(0.4))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(!viewModel.canProceed)

                Text("You can change this anytime in Settings.")
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 30)
            .padding(.top, 12)
            .background(Theme.Colors.background.ignoresSafeArea(edges: .bottom))
        }
        .background(Theme.Colors.background.ignoresSafeArea())
    }

    private var header: some View {
        VStack(spacing: 10) {
            Text("Pick your path.")
                .font(.title)
                .bold()
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.Colors.text)
            Text("We'll honor it. Your tradition shapes how the AI talks with you, what scripture surfaces first, and how reflections are framed.")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
    }
}

private struct TraditionCard: View {
    let tradition: Tradition
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                    .font(.title2)
                    .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryText)
                    .padding(.top, 2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(tradition.pickerLabel)
                        .font(.headline)
                        .foregroundStyle(Theme.Colors.text)
                    Text(tradition.pickerSubtitle)
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(isSelected ? Theme.Colors.primary.opacity(0.06) : Theme.Colors.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(
                        isSelected
                            ? Theme.Colors.primary
                            : Theme.Colors.secondaryText.opacity(0.2),
                        lineWidth: isSelected ? 2 : 1
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    PersonalizationQuizView(viewModel: OnboardingViewModel(), onContinue: {})
        .environment(AppState.preview)
}
