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
    
    // Social proof
    var communityCount: Int = 12_400
    var rating: String = "4.9"
    var ratingCount: String = "500+"
    
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
        ("Daily AI Questions", "3 seeds", "Unlimited"),
        ("Spiritual Practices", "3 basic", "10+ modes"),
        ("Devotional Series", "1 active", "Unlimited"),
        ("Verse Card Designs", "3", "12+"),
        ("Journal Insights", "Basic", "Advanced AI"),
        ("Export / Backup", "—", "✓"),
    ]
    
    // MARK: - Initialization
    
    init() {
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
            print("PaywallVM: Failed to load offerings: \(error)")
        }
    }
    
    // MARK: - Purchase
    
    func purchase(using service: SubscriptionServiceProtocol) async {
        isPurchasing = true
        defer { isPurchasing = false }
        
        do {
            let success = try await service.purchase(package: selectedPlan)
            if success {
                purchaseSucceeded = true
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
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
        }
    }
}
