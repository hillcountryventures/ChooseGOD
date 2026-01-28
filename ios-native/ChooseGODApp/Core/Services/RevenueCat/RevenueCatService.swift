import Foundation
import RevenueCat

/// RevenueCat-backed subscription service
final class RevenueCatService: SubscriptionServiceProtocol {
    
    // MARK: - Singleton
    
    static let shared = RevenueCatService()
    
    // MARK: - Configuration
    
    /// RevenueCat API key from App Store Connect
    private static let apiKey = "appl_YdofSCNUFqkTUNzuOTwwrvdZtJF"
    
    // MARK: - Properties
    
    private(set) var isPremium: Bool = false
    private(set) var seedsRemaining: Int = 3
    private(set) var seedsUsedToday: Int = 0
    
    private let freeSeeds = 3
    private let seedsKey = "dailySeedsRemaining"
    private let lastResetKey = "lastSeedResetDate"
    
    // MARK: - Initialization
    
    private init() {
        loadSeedState()
    }
    
    // MARK: - Configuration
    
    func configure(userId: String?) async {
        Purchases.logLevel = .debug
        
        if let userId = userId {
            Purchases.configure(withAPIKey: Self.apiKey, appUserID: userId)
        } else {
            Purchases.configure(withAPIKey: Self.apiKey)
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
            print("RevenueCat: Failed to check premium status: \(error)")
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
        return isPremium
    }
    
    func restorePurchases() async throws -> Bool {
        let customerInfo = try await Purchases.shared.restorePurchases()
        isPremium = customerInfo.entitlements["premium"]?.isActive == true
        return isPremium
    }
    
    // MARK: - Seed Management (Freemium Feature Gating)
    
    func useSeed() -> Bool {
        // Premium users have unlimited seeds
        if isPremium { return true }
        
        // Check if we need to reset seeds (new day)
        checkDailyReset()
        
        // Check if seeds available
        if seedsRemaining > 0 {
            seedsRemaining -= 1
            seedsUsedToday += 1
            saveSeedState()
            return true
        }
        
        return false
    }
    
    private func checkDailyReset() {
        let today = Calendar.current.startOfDay(for: Date())
        
        if let lastReset = UserDefaults.standard.object(forKey: lastResetKey) as? Date {
            let lastResetDay = Calendar.current.startOfDay(for: lastReset)
            
            if today > lastResetDay {
                // New day - reset seeds
                seedsRemaining = freeSeeds
                seedsUsedToday = 0
                UserDefaults.standard.set(today, forKey: lastResetKey)
                saveSeedState()
            }
        } else {
            // First time - set today as last reset
            UserDefaults.standard.set(today, forKey: lastResetKey)
        }
    }
    
    private func loadSeedState() {
        seedsRemaining = UserDefaults.standard.integer(forKey: seedsKey)
        if seedsRemaining == 0 && !UserDefaults.standard.bool(forKey: "seedsInitialized") {
            seedsRemaining = freeSeeds
            UserDefaults.standard.set(true, forKey: "seedsInitialized")
        }
        seedsUsedToday = freeSeeds - seedsRemaining
        checkDailyReset()
    }
    
    private func saveSeedState() {
        UserDefaults.standard.set(seedsRemaining, forKey: seedsKey)
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
