import Foundation
import UserNotifications
import UIKit

/// Real push notification service using UNUserNotificationCenter
final class NotificationService: NSObject, NotificationServiceProtocol, UNUserNotificationCenterDelegate {
    
    static let shared = NotificationService()
    
    private let center = UNUserNotificationCenter.current()
    
    /// Callback when a notification action is tapped
    var onOpenDevotional: (() -> Void)?
    var onOpenPrayer: (() -> Void)?
    
    private override init() {
        super.init()
        center.delegate = self
        NotificationCategory.registerAll()
    }
    
    // MARK: - NotificationServiceProtocol
    
    func requestPermission() async throws -> Bool {
        let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
        if granted {
            await MainActor.run {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
        return granted
    }
    
    func scheduleDailyReminder(at time: DateComponents, title: String, body: String) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.categoryIdentifier = NotificationCategory.devotionalReminder
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: time, repeats: true)
        let id = time.hour ?? 0 < 12
            ? NotificationCategory.RequestID.morningDevotional
            : NotificationCategory.RequestID.eveningDevotional
        
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        try await center.add(request)
    }
    
    func cancelAllNotifications() {
        center.removeAllPendingNotificationRequests()
        clearBadge()
    }
    
    // MARK: - Extended Scheduling
    
    /// Schedule morning devotional reminder
    func scheduleMorningDevotional(hour: Int = 7, minute: Int = 0) async throws {
        var time = DateComponents()
        time.hour = hour
        time.minute = minute
        
        try await scheduleDailyReminder(
            at: time,
            title: "Good Morning ☀️",
            body: "Start your day with God's Word. Your devotional is ready."
        )
    }
    
    /// Schedule evening devotional reminder
    func scheduleEveningDevotional(hour: Int = 21, minute: Int = 0) async throws {
        var time = DateComponents()
        time.hour = hour
        time.minute = minute
        
        try await scheduleDailyReminder(
            at: time,
            title: "Evening Reflection 🌙",
            body: "End your day in God's presence. Reflect on today's journey."
        )
    }
    
    /// Schedule a prayer reminder
    func schedulePrayerReminder(hour: Int = 12, minute: Int = 0) async throws {
        let content = UNMutableNotificationContent()
        content.title = "Prayer Time 🙏"
        content.body = "Take a moment to bring your prayers before God."
        content.sound = .default
        content.categoryIdentifier = NotificationCategory.prayerReminder
        
        var time = DateComponents()
        time.hour = hour
        time.minute = minute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: time, repeats: true)
        let request = UNNotificationRequest(
            identifier: NotificationCategory.RequestID.prayerReminder,
            content: content,
            trigger: trigger
        )
        try await center.add(request)
    }
    
    /// Set up all notifications based on user preferences
    func configureFromPreferences(_ prefs: UserPreferences) async {
        // Cancel existing and re-schedule
        center.removeAllPendingNotificationRequests()
        
        do {
            if prefs.morningNotificationEnabled {
                try await scheduleMorningDevotional(
                    hour: prefs.morningNotificationTime.hour ?? 7,
                    minute: prefs.morningNotificationTime.minute ?? 0
                )
            }
            
            if prefs.eveningNotificationEnabled {
                try await scheduleEveningDevotional(
                    hour: prefs.eveningNotificationTime.hour ?? 21,
                    minute: prefs.eveningNotificationTime.minute ?? 0
                )
            }
            
            // Always schedule prayer reminder at noon
            try await schedulePrayerReminder()
        } catch {
            print("[NotificationService] Error scheduling: \(error)")
        }
    }
    
    // MARK: - Badge Management
    
    func setBadge(_ count: Int) {
        Task { @MainActor in
            UNUserNotificationCenter.current().setBadgeCount(count)
        }
    }
    
    func clearBadge() {
        setBadge(0)
    }
    
    func incrementBadge() {
        Task { @MainActor in
            let current = UIApplication.shared.applicationIconBadgeNumber
            try? await UNUserNotificationCenter.current().setBadgeCount(current + 1)
        }
    }
    
    // MARK: - Permission Check
    
    func checkPermissionStatus() async -> UNAuthorizationStatus {
        let settings = await center.notificationSettings()
        return settings.authorizationStatus
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    
    /// Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .badge, .sound]
    }
    
    /// Handle notification action tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        let actionID = response.actionIdentifier
        let categoryID = response.notification.request.content.categoryIdentifier
        
        switch actionID {
        case NotificationCategory.Action.openDevotional,
             UNNotificationDefaultActionIdentifier where categoryID == NotificationCategory.devotionalReminder:
            await MainActor.run { onOpenDevotional?() }
            
        case NotificationCategory.Action.openPrayer,
             UNNotificationDefaultActionIdentifier where categoryID == NotificationCategory.prayerReminder:
            await MainActor.run { onOpenPrayer?() }
            
        case NotificationCategory.Action.markPrayerDone:
            // Could track prayer completion analytics here
            break
            
        default:
            break
        }
        
        clearBadge()
    }
}
