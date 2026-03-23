import os
import Foundation
import PostHog

// MARK: - Analytics Protocol

protocol AnalyticsProvider {
    func initialize(apiKey: String)
    func screen(_ name: String)
    func capture(_ event: String, properties: [String: Any]?)
    func identify(_ userId: String, properties: [String: String]?)
    func reset()
}

// MARK: - Analytics Service

final class AnalyticsService: AnalyticsProvider {
    
    static let shared = AnalyticsService()
    
    private var isInitialized = false
    
    /// Reads consent state from UserDefaults (matches ConsentManagementView's @AppStorage key)
    private var consentGranted: Bool {
        UserDefaults.standard.bool(forKey: "consent_analytics")
    }
    
    private init() {}
    
    // MARK: - Setup
    
    func initialize(apiKey: String) {
        guard !apiKey.isEmpty else {
            AppLogger.analytics.warning("Empty API key — skipping initialization")
            return
        }
        
        let config = PostHogConfig(apiKey: apiKey)
        PostHogSDK.shared.setup(config)
        isInitialized = true
        
        // Set global context properties
        setSuperProperties()
        
        #if DEBUG
        AppLogger.analytics.info("PostHog initialized with key: \(apiKey.prefix(8))...")
        #endif
    }
    
    // MARK: - Tracking
    
    func screen(_ name: String) {
        guard consentGranted else { return }
        PostHogSDK.shared.screen(name)
        #if DEBUG
        AppLogger.analytics.debug("Screen: \(name)")
        #endif
    }
    
    func capture(_ event: String, properties: [String: Any]? = nil) {
        guard consentGranted else { return }
        PostHogSDK.shared.capture(event, properties: properties)
        #if DEBUG
        AppLogger.analytics.debug("Event: \(event)")
        #endif
    }
    
    func identify(_ userId: String, properties: [String: String]? = nil) {
        guard consentGranted else { return }
        PostHogSDK.shared.identify(userId, userProperties: properties)
        #if DEBUG
        AppLogger.analytics.debug("Identify: \(userId)")
        #endif
    }
    
    func reset() {
        PostHogSDK.shared.reset()
        #if DEBUG
        AppLogger.analytics.debug("Reset (logout)")
        #endif
    }
    
    // MARK: - Super Properties
    
    func setSuperProperties() {
        guard consentGranted else { return }
        
        let properties: [String: Any] = [
            "app_version": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
            "platform": "ios",
            "subscription_tier": "free", // TODO: Update based on actual subscription status
            "onboarding_complete": UserDefaults.standard.bool(forKey: "onboarding_complete")
        ]
        
        PostHogSDK.shared.register(properties)
        
        #if DEBUG
        AppLogger.analytics.debug("Super properties set: \(properties)")
        #endif
    }
}
