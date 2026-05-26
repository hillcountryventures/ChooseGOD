import SwiftUI

/// View for redeeming a gift subscription code
struct GiftRedemptionView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    let code: String
    @State private var isRedeeming = false
    @State private var redeemError: String?
    @State private var redeemSuccess = false

    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()

            VStack(spacing: Theme.Spacing.lg) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    Spacer()
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.md)

                if redeemSuccess {
                    // Success state
                    VStack(spacing: Theme.Spacing.lg) {
                        Spacer()

                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 72))
                            .foregroundStyle(Theme.Colors.success)

                        VStack(spacing: Theme.Spacing.sm) {
                            Text("Your gift is active!")
                                .font(Theme.Typography.title2)
                                .foregroundStyle(Theme.Colors.text)

                            Text("Enjoy unlimited access to ChooseGOD Premium")
                                .font(Theme.Typography.body)
                                .foregroundStyle(Theme.Colors.textSecondary)
                                .multilineTextAlignment(.center)
                        }

                        Button(action: { dismiss() }) {
                            Text("Continue")
                                .font(Theme.Typography.button)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(Theme.Colors.primary)
                                .cornerRadius(Theme.CornerRadius.lg)
                        }

                        Spacer()
                    }
                    .padding(Theme.Spacing.lg)
                } else {
                    // Redemption form
                    VStack(spacing: Theme.Spacing.lg) {
                        Image(systemName: "gift.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(Theme.Colors.primary)

                        VStack(spacing: Theme.Spacing.sm) {
                            Text("Redeem Gift")
                                .font(Theme.Typography.title2)
                                .foregroundStyle(Theme.Colors.text)

                            Text("Code: \(code)")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(Theme.Colors.textSecondary)
                                .padding(.horizontal, Theme.Spacing.md)
                                .padding(.vertical, Theme.Spacing.sm)
                                .background(Theme.Colors.surface)
                                .cornerRadius(Theme.CornerRadius.md)
                        }

                        if let error = redeemError {
                            VStack(spacing: Theme.Spacing.sm) {
                                Text("Redemption Error")
                                    .font(Theme.Typography.bodySmall)
                                    .foregroundColor(.red)

                                Text(error)
                                    .font(Theme.Typography.caption)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(Theme.Spacing.md)
                            .background(Theme.Colors.surface)
                            .cornerRadius(Theme.CornerRadius.lg)
                        }

                        Button(action: { Task { await redeemGift() } }) {
                            if isRedeeming {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Redeem Now")
                                    .font(Theme.Typography.button)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(isRedeeming ? Theme.Colors.primary.opacity(0.6) : Theme.Colors.primary)
                        .foregroundColor(.white)
                        .cornerRadius(Theme.CornerRadius.lg)
                        .disabled(isRedeeming)

                        Spacer()
                    }
                    .padding(Theme.Spacing.lg)
                }
            }
        }
    }

    private func redeemGift() async {
        isRedeeming = true
        redeemError = nil

        guard let userId = appState.currentUser?.id else {
            redeemError = "You must be signed in to redeem a gift."
            isRedeeming = false
            return
        }

        do {
            guard let client = try? SupabaseManager.shared.requireClient() else {
                redeemError = "Unable to connect to server. Please try again."
                isRedeeming = false
                return
            }

            // Call edge function to validate and apply the gift code
            struct RedeemRequest: Codable {
                let code: String
                let userId: String
            }

            struct RedeemResponse: Codable {
                let success: Bool
                let message: String?
                let error: String?
            }

            let request = RedeemRequest(code: code, userId: userId)

            let response: RedeemResponse = try await client.functions
                .invoke("redeem-gift", options: .init(body: request))

            if response.success {
                // Refresh premium so gated features unlock immediately (no restart)
                await appState.refreshPremiumStatus()
                redeemSuccess = true
            } else {
                redeemError = response.error ?? "Unable to redeem this code. It may be invalid or already used."
            }
        } catch {
            redeemError = error.localizedDescription
        }

        isRedeeming = false
    }
}

#Preview {
    GiftRedemptionView(code: "GIFT-ABC12345")
        .environment(AppState.preview)
}
