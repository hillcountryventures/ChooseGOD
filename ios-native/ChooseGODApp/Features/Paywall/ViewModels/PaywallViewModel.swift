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
    
    // Offerings from RevenueCat
    var monthlyPrice: String = "$3.99/month"
    var annualPrice: String = "$36.00/year"
    var annualMonthlyEquivalent: String = "$3.00/mo"
    var hasFreeTrial = true
    var trialDays: Int = 7

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
        ("AI Conversations", "5 total", "Unlimited"),
        ("Spiritual Practices", "3 basic", "10+ modes"),
        ("Devotional Series", "1 active", "Unlimited"),
        ("Verse Card Designs", "3", "12+"),
        ("Journal Insights", "Basic", "Advanced AI"),
        ("Export / Backup", "—", "✓"),
    ]
    
    // MARK: - Initialization
    
    init() {
        // // AnalyticsService.shared.capture("paywall_presented") // TODO: Service not available // TODO: Service not available
        Task { await loadOfferings() }
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
        } catch {
            // AppLogger.subscription.error("PaywallVM failed to load offerings: \(error)") // TODO: Service not available
        }
    }
    
    // MARK: - Purchase
    
    func purchase(using service: SubscriptionServiceProtocol) async {
        // AnalyticsService.shared.capture("purchase_tapped", properties: ["plan": String(describing: selectedPlan)]) // TODO: Service not available
        isPurchasing = true
        defer { isPurchasing = false }
        
        do {
            let success = try await service.purchase(package: selectedPlan)
            if success {
                purchaseSucceeded = true
                // AnalyticsService.shared.capture("subscription_purchased", properties: ["plan": String(describing: selectedPlan)]) // TODO: Service not available
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
            // AnalyticsService.shared.capture("subscription_failed", properties: ["plan": String(describing: selectedPlan), "error": error.localizedDescription]) // TODO: Service not available
            // AnalyticsService.shared.capture("error", properties: ["source": "purchase", "message": error.localizedDescription]) // TODO: Service not available
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
            // AnalyticsService.shared.capture("error", properties: ["source": "restore_purchase", "message": error.localizedDescription]) // TODO: Service not available
        }
    }
}
