import os
import SwiftUI
import RevenueCat
import Observation

/// ViewModel for the paywall screen — handles RevenueCat offerings and purchase flow
@Observable
final class PaywallViewModel {
    
    // MARK: - State
    
    var selectedPlan: SubscriptionPackage = .annual
    var isLoading = false
    var isPurchasing = false
    var isRestoring = false
    var errorMessage: String?
    var showError = false
    var purchaseSucceeded = false

    // Offerings from RevenueCat. Fallbacks match the post-grill bootstrap
    // pricing (Decision G8): below Hallow on monthly + annual, higher Founding
    // price filters for true believers, 30-day trial buys time for the
    // personalization moat to compound.
    var monthlyPrice: String = "$4.99/month"
    var annualPrice: String = "$39.99/year"
    var annualMonthlyEquivalent: String = "$3.33/mo"
    var hasFreeTrial = true
    var trialDays: Int = 30

    // Founding Member ($129 lifetime, cap 500) — Decision G8
    var foundingPrice: String = "$129 lifetime"
    var foundingClaimed: Int = 0
    let foundingCap: Int = FoundingMemberService.cap
    var foundingAvailable: Bool { foundingClaimed < foundingCap }
    var foundingSpotsRemaining: Int { max(0, foundingCap - foundingClaimed) }

    // MARK: - Testimonials
    
    static let testimonials: [(text: String, author: String)] = [
        ("Finally, an app that helps me understand Scripture, not just read it.", "Sarah M."),
        ("The AI companion feels like talking to a wise pastor who knows the Bible deeply.", "James K."),
        ("This changed my quiet time completely. I look forward to it every morning now.", "Rachel T."),
    ]
    
    // MARK: - Features
    
    static let premiumFeatures: [(icon: String, title: String, description: String)] = [
        ("bubble.left.and.bubble.right.fill", "Unlimited AI Conversations", "Ask anything about Scripture — no daily limits."),
        ("sparkles", "Premium Spiritual Practices", "Lectio Divina, Evening Examen, Scripture memorization & more."),
        ("books.vertical.fill", "Unlimited Devotional Series", "Enroll in as many devotional series as you like."),
        ("paintpalette.fill", "Premium Verse Card Designs", "12+ beautiful gradient backgrounds for shareable cards."),
        ("chart.line.uptrend.xyaxis", "Advanced Journal Insights", "Growth patterns, sentiment themes & yearly reviews."),
        ("arrow.down.doc.fill", "Export Journal & Prayers", "Download your spiritual journey as a beautiful PDF."),
    ]
    
    // MARK: - Feature Comparison
    
    static let comparisonRows: [(feature: String, free: String, premium: String)] = [
        ("AI Conversations", "5 lifetime", "Unlimited"),
        ("Grace Mode catch-ups", "Text", "Founder-voice audio"),
        ("Devotional Series", "1 active", "Unlimited + AI-personalized"),
        ("Spiritual Practices", "—", "Lectio, Examen, Memory SRS"),
        ("Journal Insights", "Basic", "Monthly AI Insights"),
        ("Bible Tools", "Bookmarks, highlights", "Cross-refs + AI explanations"),
        ("Privacy", "Standard", "Encrypted at rest"),
        ("Export / Backup", "—", "Full PDF journey"),
    ]
    
    // MARK: - Initialization
    
    init() {
        Task {
            await loadOfferings()
            await loadFoundingMemberCount()
        }
    }

    // MARK: - Load Offerings

    func loadOfferings() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let offerings = try await Purchases.shared.offerings()
            guard let current = offerings.current else { return }

            if let monthly = current.monthly {
                let p = monthly.storeProduct
                monthlyPrice = p.localizedPriceString + "/month"
            }

            if let annual = current.annual {
                let p = annual.storeProduct
                annualPrice = p.localizedPriceString + "/year"
                let monthlyEquiv = p.price as Decimal / 12
                let fmt = NumberFormatter()
                fmt.numberStyle = .currency
                fmt.locale = p.priceFormatter?.locale ?? .current
                if let str = fmt.string(from: monthlyEquiv as NSDecimalNumber) {
                    annualMonthlyEquivalent = str + "/mo"
                }

                // Check for intro offer (free trial)
                if let intro = p.introductoryDiscount, intro.paymentMode == .freeTrial {
                    hasFreeTrial = true
                    trialDays = intro.subscriptionPeriod.value
                } else {
                    hasFreeTrial = false
                }
            }

            // Founding Member is configured as a non-consumable in App Store Connect
            // and exposed via the offering's `lifetime` accessor in RevenueCat.
            if let lifetime = current.lifetime {
                foundingPrice = lifetime.storeProduct.localizedPriceString + " lifetime"
            }
        } catch {
            // Fallbacks above remain accurate for first paint.
        }
    }

    // MARK: - Founding Member counter

    func loadFoundingMemberCount() async {
        await FoundingMemberService.shared.loadClaimCount()
        self.foundingClaimed = FoundingMemberService.shared.claimCount
    }
    
    // MARK: - Purchase
    
    func purchase(using service: SubscriptionServiceProtocol) async {
        AnalyticsService.shared.capture("purchase_tapped", properties: ["plan": String(describing: selectedPlan)])
        isPurchasing = true
        defer { isPurchasing = false }
        
        do {
            let success = try await service.purchase(package: selectedPlan)
            if success {
                purchaseSucceeded = true
                AnalyticsService.shared.capture("subscription_purchased", properties: ["plan": String(describing: selectedPlan)])
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
            AnalyticsService.shared.capture("subscription_failed", properties: ["plan": String(describing: selectedPlan), "error": error.localizedDescription])
            AnalyticsService.shared.capture("error", properties: ["source": "purchase", "message": error.localizedDescription])
        }
    }
    
    // MARK: - Restore
    
    func restore(using service: SubscriptionServiceProtocol) async {
        isRestoring = true
        defer { isRestoring = false }
        
        do {
            let restored = try await service.restorePurchases()
            if restored {
                purchaseSucceeded = true
            } else {
                errorMessage = "No active subscription found."
                showError = true
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
            AnalyticsService.shared.capture("error", properties: ["source": "restore_purchase", "message": error.localizedDescription])
        }
    }
}
