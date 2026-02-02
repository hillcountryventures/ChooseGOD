import os

/// Centralized logging using os.Logger — replaces print() statements
struct AppLogger {
    static let general = Logger(subsystem: "com.choosegod.app", category: "general")
    static let auth = Logger(subsystem: "com.choosegod.app", category: "auth")
    static let network = Logger(subsystem: "com.choosegod.app", category: "network")
    static let analytics = Logger(subsystem: "com.choosegod.app", category: "analytics")
    static let audio = Logger(subsystem: "com.choosegod.app", category: "audio")
    static let subscription = Logger(subsystem: "com.choosegod.app", category: "subscription")
    static let ai = Logger(subsystem: "com.choosegod.app", category: "ai")
    static let notifications = Logger(subsystem: "com.choosegod.app", category: "notifications")
    static let bible = Logger(subsystem: "com.choosegod.app", category: "bible")
    static let journal = Logger(subsystem: "com.choosegod.app", category: "journal")
    static let referral = Logger(subsystem: "com.choosegod.app", category: "referral")
    static let onboarding = Logger(subsystem: "com.choosegod.app", category: "onboarding")
}
