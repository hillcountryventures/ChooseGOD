import os
import Foundation

/// Centralized logging using os.Logger — replaces print() statements
public struct AppLogger {
    public static let general = Logger(subsystem: "com.choosegod.app", category: "general")
    public static let auth = Logger(subsystem: "com.choosegod.app", category: "auth")
    public static let network = Logger(subsystem: "com.choosegod.app", category: "network")
    public static let analytics = Logger(subsystem: "com.choosegod.app", category: "analytics")
    public static let audio = Logger(subsystem: "com.choosegod.app", category: "audio")
    public static let subscription = Logger(subsystem: "com.choosegod.app", category: "subscription")
    public static let ai = Logger(subsystem: "com.choosegod.app", category: "ai")
    public static let notifications = Logger(subsystem: "com.choosegod.app", category: "notifications")
    public static let bible = Logger(subsystem: "com.choosegod.app", category: "bible")
    public static let journal = Logger(subsystem: "com.choosegod.app", category: "journal")
    public static let referral = Logger(subsystem: "com.choosegod.app", category: "referral")
    public static let onboarding = Logger(subsystem: "com.choosegod.app", category: "onboarding")
}
