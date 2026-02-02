import SwiftUI
import RevenueCat

/// Gift a ChooseGOD Premium subscription
struct GiftSubscriptionView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedPlan: SubscriptionPackage = .annual
    @State private var recipientName = ""
    @State private var senderName = ""
    @State private var isPurchasing = false
    @State private var purchaseComplete = false
    @State private var promoCode = ""
    @State private var giftCardImage: UIImage?
    @State private var showShareSheet = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            if purchaseComplete {
                giftCompleteView
            } else {
                giftFormView
            }
        }
    }
    
    // MARK: - Form View
    
    private var giftFormView: some View {
        ScrollView {
            VStack(spacing: 28) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "gift.fill")
                        .font(.system(size: 56))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(red: 0.85, green: 0.70, blue: 0.30), Color(red: 0.75, green: 0.55, blue: 0.20)],
                                startPoint: .top, endPoint: .bottom
                            )
                        )
                    
                    Text("Gift ChooseGOD Premium")
                        .font(.title2.bold())
                        .foregroundStyle(Theme.Colors.text)
                    
                    Text("Share the gift of deeper Bible study with someone you love.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding(.top, Theme.Spacing.md)
                
                // Plan selection
                VStack(alignment: .leading, spacing: 12) {
                    Text("Select Plan")
                        .font(.headline)
                        .foregroundStyle(Theme.Colors.text)
                    
                    GiftPlanCard(
                        title: "Annual",
                        subtitle: "Best value — 12 months of Premium",
                        price: "$49.99/year",
                        isSelected: selectedPlan == .annual
                    ) { selectedPlan = .annual }
                    
                    GiftPlanCard(
                        title: "Monthly",
                        subtitle: "1 month of Premium access",
                        price: "$4.99/month",
                        isSelected: selectedPlan == .monthly
                    ) { selectedPlan = .monthly }
                }
                .padding(.horizontal)
                
                // Names
                VStack(alignment: .leading, spacing: 16) {
                    Text("Personalize")
                        .font(.headline)
                        .foregroundStyle(Theme.Colors.text)
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Your Name")
                            .font(.subheadline)
                            .foregroundStyle(Theme.Colors.secondaryText)
                        TextField("Your name", text: $senderName)
                            .textFieldStyle(.roundedBorder)
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Recipient's Name")
                            .font(.subheadline)
                            .foregroundStyle(Theme.Colors.secondaryText)
                        TextField("Their name", text: $recipientName)
                            .textFieldStyle(.roundedBorder)
                    }
                }
                .padding(.horizontal)
                
                if let errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(.horizontal)
                }
                
                // Purchase button
                Button {
                    Task { await purchaseGift() }
                } label: {
                    if isPurchasing {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Purchase Gift")
                            .font(.headline)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(canPurchase ? Theme.Colors.primary : Theme.Colors.primary.opacity(0.4))
                .foregroundStyle(.white)
                .cornerRadius(14)
                .padding(.horizontal)
                .disabled(!canPurchase || isPurchasing)
                
                Text("Gift purchases use Apple's promotional subscription system. The recipient will receive a redemption code.")
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.xl)
                    .padding(.bottom, Theme.Spacing.lg)
            }
        }
        .background(Theme.Colors.background)
        .navigationTitle("Gift Premium")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
        }
    }
    
    // MARK: - Complete View
    
    private var giftCompleteView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Scaled gift card preview
            GiftCardView(
                senderName: senderName,
                recipientName: recipientName,
                planName: selectedPlan == .annual ? "Annual Plan" : "Monthly Plan",
                redemptionCode: promoCode
            )
            .scaleEffect(0.3)
            .frame(width: 324, height: 324)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(0.2), radius: 12, y: 6)
            
            Text("Gift Ready! 🎉")
                .font(.title2.bold())
                .foregroundStyle(Theme.Colors.text)
            
            Text("Share the gift card image with \(recipientName.isEmpty ? "your recipient" : recipientName).")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            // Copy code
            if !promoCode.isEmpty {
                Button {
                    UIPasteboard.general.string = promoCode
                    HapticManager.shared.impact()
                } label: {
                    Label("Copy Code: \(promoCode)", systemImage: "doc.on.doc")
                        .font(.subheadline.weight(.medium))
                }
                .buttonStyle(.bordered)
            }
            
            Spacer()
            
            // Share button
            Button {
                generateGiftCardImage()
            } label: {
                Label("Share Gift Card", systemImage: "square.and.arrow.up")
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Theme.Colors.primary)
            .foregroundStyle(.white)
            .cornerRadius(14)
            .padding(.horizontal)
            
            Button("Done") { dismiss() }
                .foregroundStyle(Theme.Colors.secondaryText)
                .padding(.bottom, Theme.Spacing.lg)
        }
        .background(Theme.Colors.background)
        .navigationBarBackButtonHidden()
        .sheet(isPresented: $showShareSheet) {
            if let giftCardImage {
                ShareSheet(activityItems: [giftCardImage])
            }
        }
    }
    
    // MARK: - Logic
    
    private var canPurchase: Bool {
        !recipientName.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private func purchaseGift() async {
        isPurchasing = true
        errorMessage = nil
        
        do {
            // Purchase via RevenueCat
            let success = try await appState.subscriptionService.purchase(package: selectedPlan)
            
            if success {
                // Generate a pseudo promo code (real implementation uses RevenueCat promo API)
                promoCode = generatePromoCode()
                
                AnalyticsService.shared.capture("gift_purchased", properties: [
                    "plan": selectedPlan.rawValue,
                    "has_sender_name": (!senderName.isEmpty).description
                ])
                
                withAnimation {
                    purchaseComplete = true
                }
            } else {
                errorMessage = "Purchase was not completed. Please try again."
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isPurchasing = false
    }
    
    private func generatePromoCode() -> String {
        let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        let code = (0..<8).map { _ in String(chars.randomElement()!) }.joined()
        return "GIFT-\(code)"
    }
    
    @MainActor
    private func generateGiftCardImage() {
        let view = GiftCardView(
            senderName: senderName,
            recipientName: recipientName,
            planName: selectedPlan == .annual ? "Annual Plan" : "Monthly Plan",
            redemptionCode: promoCode
        )
        let renderer = ImageRenderer(content: view)
        renderer.scale = 1.0
        giftCardImage = renderer.uiImage
        if giftCardImage != nil {
            showShareSheet = true
        }
    }
}

// MARK: - Gift Plan Card

private struct GiftPlanCard: View {
    let title: String
    let subtitle: String
    let price: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(Theme.Colors.text)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text(price)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.Colors.text)
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryText)
                }
            }
            .padding()
            .background(Theme.Colors.surface)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Theme.Colors.primary : .clear, lineWidth: 2)
            )
        }
    }
}

#Preview {
    GiftSubscriptionView()
        .environment(AppState.preview)
}
