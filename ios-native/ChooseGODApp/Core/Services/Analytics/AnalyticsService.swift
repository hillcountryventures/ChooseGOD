import Foundation

// TODO: Add PostHog SDK via SPM and replace stub implementation

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
    
    private init() {}
    
    // MARK: - Setup
    
    func initialize(apiKey: String) {
        guard !apiKey.isEmpty else {
            print("[Analytics] ⚠️ Empty API key — skipping initialization")
            return
        }
        
        // TODO: Replace with PostHog SDK initialization
        // PostHogSDK.shared.setup(PHGPostHogConfiguration(apiKey: apiKey, host: "https://app.posthog.com"))
        isInitialized = true
        
        #if DEBUG
        print("[Analytics] ✅ Initialized with key: \(apiKey.prefix(8))...")
        #endif
    }
    
    // MARK: - Tracking
    
    func screen(_ name: String) {
        // TODO: PostHogSDK.shared.screen(name)
        #if DEBUG
        print("[Analytics] 📱 Screen: \(name)")
        #endif
    }
    
    func capture(_ event: String, properties: [String: Any]? = nil) {
        // TODO: PostHogSDK.shared.capture(event, properties: properties)
        #if DEBUG
        print("[Analytics] 📊 Event: \(event) | \(properties ?? [:])")
        #endif
    }
    
    func identify(_ userId: String, properties: [String: String]? = nil) {
        // TODO: PostHogSDK.shared.identify(userId, userProperties: properties)
        #if DEBUG
        print("[Analytics] 👤 Identify: \(userId) | \(properties ?? [:])")
        #endif
    }
    
    func reset() {
        // TODO: PostHogSDK.shared.reset()
        #if DEBUG
        print("[Analytics] 🔄 Reset (logout)")
        #endif
    }
}
