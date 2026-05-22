import SwiftUI
import Supabase

/// Strategy Decision #17 — graceful cancellation flow.
/// One honest reason question (price / content / timing / other), branched
/// follow-ups, and a Free Pause offer that's the hero retention mechanic.
/// No dark patterns. The user's data stays. Days With God carries over.
struct CancellationFlowView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    enum Step {
        case reason
        case priceOffer
        case feedback
        case freePauseOffer
        case freePauseConfirmed
        case manageInApple
    }

    enum Reason: String {
        case price, content, timing, other
        var displayLabel: String {
            switch self {
            case .price:   return "Too expensive"
            case .content: return "Content isn't for me"
            case .timing:  return "Bad timing — life is busy"
            case .other:   return "Something else"
            }
        }
    }

    @State private var step: Step = .reason
    @State private var selectedReason: Reason?
    @State private var feedbackText: String = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        switch step {
                        case .reason:              reasonStep
                        case .priceOffer:          priceOfferStep
                        case .feedback:            feedbackStep
                        case .freePauseOffer:      freePauseOfferStep
                        case .freePauseConfirmed:  freePauseConfirmedStep
                        case .manageInApple:       manageInAppleStep
                        }
                    }
                    .padding(20)
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
            .alert("Something went wrong", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    // MARK: - Steps

    private var reasonStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Cancel ChooseGOD Pro")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("Help us understand what's going on. One question, one tap.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)

            VStack(spacing: 10) {
                reasonButton(.price)
                reasonButton(.content)
                reasonButton(.timing)
                reasonButton(.other)
            }
            .padding(.top, 8)
        }
    }

    private func reasonButton(_ reason: Reason) -> some View {
        Button {
            selectedReason = reason
            switch reason {
            case .price:   step = .priceOffer
            case .content: step = .feedback
            case .timing:  step = .freePauseOffer
            case .other:   step = .feedback
            }
        } label: {
            HStack {
                Text(reason.displayLabel)
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }

    private var priceOfferStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Hear you on the price.")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("If price is the only blocker, the annual plan is $49.99/yr — the equivalent of $4.17/mo. Want to switch and we'll prorate?")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            VStack(spacing: 10) {
                Button {
                    Task {
                        await submitSurvey(reason: .price, feedback: "Wanted annual plan")
                        // Send the user to Apple's manage-subscriptions screen
                        // since plan switching has to happen there.
                        step = .manageInApple
                    }
                } label: {
                    Text("Switch to Annual")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Theme.Colors.primary)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button {
                    Task {
                        await submitSurvey(reason: .price)
                        step = .freePauseOffer
                    }
                } label: {
                    Text("Pause for 30 days instead")
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }

                Button {
                    Task {
                        await submitSurvey(reason: .price)
                        step = .manageInApple
                    }
                } label: {
                    Text("Cancel anyway")
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                }
            }
            .padding(.top, 8)
        }
    }

    private var feedbackStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("What didn't work?")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("We read every word. Optional.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)

            TextEditor(text: $feedbackText)
                .font(.body)
                .frame(minHeight: 140)
                .padding(8)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))

            Button {
                Task {
                    await submitSurvey(reason: selectedReason ?? .other, feedback: feedbackText)
                    step = .manageInApple
                }
            } label: {
                if isSubmitting {
                    ProgressView().tint(.white)
                } else {
                    Text("Submit & Continue")
                        .font(.headline)
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.Colors.primary)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .disabled(isSubmitting)
        }
    }

    private var freePauseOfferStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                Image(systemName: "leaf.fill")
                    .foregroundStyle(Color.green)
                Text("Take a 30-day breath.")
                    .font(.title2)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            Text("Pause your subscription for 30 days, free. Your journal stays. Your prayers stay. Your Days With God count carries over. We'll quietly check in when the pause ends.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            Text("This is what no other Bible app does. We mean it.")
                .font(.caption)
                .italic()
                .foregroundStyle(Theme.Colors.secondaryText)

            VStack(spacing: 10) {
                Button {
                    Task { await requestPause() }
                } label: {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Text("Pause for 30 days")
                            .font(.headline)
                    }
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.green)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .disabled(isSubmitting)

                Button {
                    Task {
                        await submitSurvey(reason: selectedReason ?? .timing)
                        step = .manageInApple
                    }
                } label: {
                    Text("No, cancel anyway")
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
            }
            .padding(.top, 8)
        }
    }

    private var freePauseConfirmedStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(Color.green)
                Text("You're paused.")
                    .font(.title2)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
            }
            Text("We'll check back in 30 days. To stop your Apple subscription billing while paused, manage your subscription in iOS Settings → Apple ID → Subscriptions.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            Button {
                openManageSubscriptions()
            } label: {
                Text("Open Subscription Settings")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Button { dismiss() } label: {
                Text("Done")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
        }
    }

    private var manageInAppleStep: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("One last step.")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)

            Text("Apple manages billing for ChooseGOD. To finish canceling, open your Apple subscription settings.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.text)
                .fixedSize(horizontal: false, vertical: true)

            Text("Your Days With God count, journal entries, and prayers all stay. Sign back in anytime.")
                .font(.caption)
                .italic()
                .foregroundStyle(Theme.Colors.secondaryText)

            Button {
                openManageSubscriptions()
            } label: {
                Text("Open Apple Subscriptions")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Button { dismiss() } label: {
                Text("I'll do it later")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
        }
    }

    // MARK: - Backend

    private func submitSurvey(reason: Reason, feedback: String? = nil) async {
        isSubmitting = true
        defer { isSubmitting = false }
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }

        struct SurveyRow: Encodable {
            let user_id: String
            let reason: String
            let feedback: String?
        }
        let row = SurveyRow(
            user_id: userId,
            reason: reason.rawValue,
            feedback: feedback?.isEmpty == false ? feedback : nil
        )
        _ = try? await supabase.from("cancellation_surveys").insert(row).execute()
    }

    private func requestPause() async {
        isSubmitting = true
        defer { isSubmitting = false }
        guard let supabase = try? SupabaseManager.shared.requireClient() else {
            errorMessage = "Couldn't connect."
            return
        }
        do {
            _ = try await supabase
                .rpc("request_subscription_pause",
                     params: ["p_reason_at_pause": selectedReason?.rawValue ?? "timing"])
                .execute()
            await submitSurvey(reason: selectedReason ?? .timing,
                               feedback: "Chose Free Pause")
            step = .freePauseConfirmed
        } catch {
            errorMessage = "Couldn't pause your subscription. Please try again."
        }
    }

    private func openManageSubscriptions() {
        if let url = URL(string: "itms-apps://apps.apple.com/account/subscriptions") {
            UIApplication.shared.open(url)
        }
    }
}

#Preview {
    CancellationFlowView()
        .environment(AppState.preview)
}
