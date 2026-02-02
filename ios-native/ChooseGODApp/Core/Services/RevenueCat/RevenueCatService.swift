import os
import Foundation
import RevenueCat

/// RevenueCat-backed subscription service
final class RevenueCatService: SubscriptionServiceProtocol {
    
    // MARK: - Singleton
    
    static let shared = RevenueCatService()
    
    // MARK: - Properties
    
    private(set) var isPremium: Bool = false
    
    // MARK: - Initialization
    
    private init() {}
    
    // MARK: - Configuration
    
    func configure(userId: String?) async {
        guard let apiKey = Bundle.main.object(forInfoDictionaryKey: "REVENUECAT_API_KEY") as? String, !apiKey.isEmpty else {
            Logger(subsystem: "com.choosegod.app", category: "subscription").warning("REVENUECAT_API_KEY not found in Info.plist")
            return
        }
        
        Purchases.logLevel = .debug
        
        if let userId = userId {
            Purchases.configure(withAPIKey: apiKey, appUserID: userId)
        } else {
            Purchases.configure(withAPIKey: apiKey)
        }
        
        // Check initial premium status
        isPremium = await checkPremiumStatus()
    }
    
    // MARK: - Premium Status
    
    func checkPremiumStatus() async -> Bool {
        do {
            let customerInfo = try await Purchases.shared.customerInfo()
            isPremium = customerInfo.entitlements["premium"]?.isActive == true
            return isPremium
        } catch {
            Logger(subsystem: "com.choosegod.app", category: "subscription").error("Failed to check premium status: \(error)")
            return false
        }
    }
    
    // MARK: - Purchases
    
    func purchase(package: SubscriptionPackage) async throws -> Bool {
        // Get offerings
        let offerings = try await Purchases.shared.offerings()
        
        guard let offering = offerings.current else {
            throw SubscriptionError.noOfferingsAvailable
        }
        
        // Find the matching package
        let rcPackage: Package?
        switch package {
        case .monthly:
            rcPackage = offering.monthly
        case .annual:
            rcPackage = offering.annual
        }
        
        guard let packageToPurchase = rcPackage else {
            throw SubscriptionError.packageNotFound
        }
        
        // Make purchase
        let (_, customerInfo, _) = try await Purchases.shared.purchase(package: packageToPurchase)
        
        isPremium = customerInfo.entitlements["premium"]?.isActive == true
        if isPremium {
            // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("subscription_purchased", properties: ["package": String(describing: package)])
        }
        return isPremium
    }
    
    func restorePurchases() async throws -> Bool {
        let customerInfo = try await Purchases.shared.restorePurchases()
        isPremium = customerInfo.entitlements["premium"]?.isActive == true
        return isPremium
    }
    
}


// MARK: - Errors

enum SubscriptionError: Error, LocalizedError {
    case noOfferingsAvailable
    case packageNotFound
    case purchaseFailed(Error)
    
    var errorDescription: String? {
        switch self {
        case .noOfferingsAvailable:
            return "No subscription offerings are currently available."
        case .packageNotFound:
            return "The selected subscription package was not found."
        case .purchaseFailed(let error):
            return "Purchase failed: \(error.localizedDescription)"
        }
    }
}
