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
        case .foundingMember:
            // RevenueCat exposes one-time non-consumables via the `lifetime` accessor
            rcPackage = offering.lifetime
        }

        guard let packageToPurchase = rcPackage else {
            throw SubscriptionError.packageNotFound
        }

        // For Founding Member, gate on the server-side cap before charging the user.
        if package == .foundingMember {
            let available = try await FoundingMemberService.shared.isAvailable()
            guard available else {
                throw SubscriptionError.foundingMemberCapReached
            }
        }

        // Make purchase
        let (transaction, customerInfo, _) = try await Purchases.shared.purchase(package: packageToPurchase)

        isPremium = customerInfo.entitlements["premium"]?.isActive == true

        // Record the founding-member claim atomically against the cap. If recording fails
        // (cap raced past 1,000 between gate and charge), the user is still entitled, but
        // the team will reconcile via support.
        if isPremium && package == .foundingMember {
            let txId = transaction?.transactionIdentifier
            try? await FoundingMemberService.shared.recordClaim(transactionId: txId)
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
    case foundingMemberCapReached

    var errorDescription: String? {
        switch self {
        case .noOfferingsAvailable:
            return "No subscription offerings are currently available."
        case .packageNotFound:
            return "The selected subscription package was not found."
        case .purchaseFailed(let error):
            return "Purchase failed: \(error.localizedDescription)"
        case .foundingMemberCapReached:
            return "All 500 Founding Member spots have been claimed."
        }
    }
}
