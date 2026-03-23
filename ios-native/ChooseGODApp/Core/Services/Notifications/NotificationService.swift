import os
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
                // Also schedule rotating content for variety
                try await scheduleRotatingReminders(
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
            Logger(subsystem: "com.choosegod.app", category: "notifications").error("Error scheduling: \(error)")
        }
    }
    

    // MARK: - Rotating Notification Content
    
    private static let devotionalMessages: [(title: String, body: String)] = [
        ("Good Morning ☀️", "God's mercies are new every morning. Open His Word today."),
        ("Rise & Shine 🌅", "The Lord is your strength today. Start with Scripture."),
        ("New Day, New Grace ✨", "His faithfulness reaches to the skies. Read today's verse."),
        ("God is Calling 📖", "Be still and know He is God. Your devotional awaits."),
        ("Morning Light 🌤️", "Let God's Word be a lamp to your feet today."),
        ("Blessed Morning 🙏", "Seek first His kingdom. Your reading plan is waiting."),
        ("Walk in Faith 🌿", "Trust the Lord with all your heart. Dive into His Word."),
        ("Fresh Start 🌱", "Every morning is a chance to grow closer to God."),
        ("Grace Awaits 💛", "God has something to say to you today. Come and listen."),
        ("Daily Bread 🍞", "Man does not live by bread alone. Feed your spirit."),
        ("Heaven's Invitation 🕊️", "Draw near to God and He will draw near to you."),
        ("Peace Be With You ☮️", "Let the peace of Christ rule in your heart today."),
        ("Strength for Today 💪", "I can do all things through Christ who strengthens me."),
        ("Joy in the Morning 😊", "The joy of the Lord is your strength. Read and rejoice."),
        ("Love Letter 💌", "God wrote you a love letter. It's called the Bible."),
        ("Faithful & True 🌟", "Great is His faithfulness. Discover it in today's reading."),
        ("Heart Check ❤️", "Guard your heart, for everything flows from it. Start with God."),
        ("Wisdom Calling 🦉", "If any of you lacks wisdom, ask God. He gives generously."),
        ("Anchor Your Day ⚓", "Build your day on the rock of God's Word."),
        ("Renewed Mind 🧠", "Be transformed by the renewing of your mind. Read today."),
        ("Heavenly Focus 🎯", "Set your mind on things above. Your devotional is ready."),
        ("God's Promises 🌈", "Every promise of God is yes in Christ. Discover them."),
        ("Living Water 💧", "Come to the well that never runs dry. Read His Word."),
        ("Abide in Him 🍇", "Remain in the vine and bear much fruit today."),
        ("Fearfully Made 🌺", "You are wonderfully made. See yourself through His Word."),
        ("Kingdom Builder 👑", "Your labor in the Lord is not in vain. Be encouraged."),
        ("Light of the World 🕯️", "Let your light shine. Start by filling up on Scripture."),
        ("Good Shepherd 🐑", "The Lord is your shepherd. Follow His voice today."),
        ("Unshakable Hope 🏔️", "Hope that is seen is not hope. Walk by faith today."),
        ("Eternal Perspective 🌌", "What is seen is temporary. Focus on what is eternal."),
        ("Rooted & Grounded 🌳", "Be rooted in love. Let God's Word ground you today."),
        ("Amazing Grace 🎶", "Grace upon grace. Open the Bible and receive it."),
    ]
    
    /// Schedule 7 days of unique rotating notifications, cancelling old ones first
    func scheduleRotatingReminders(hour: Int = 7, minute: Int = 0) async throws {
        // Cancel existing rotating reminders
        let existingIds = (0..<7).map { "rotating_devotional_day_\($0)" }
        center.removePendingNotificationRequests(withIdentifiers: existingIds)
        
        let calendar = Calendar.current
        let today = Date()
        
        // Pick a rotating offset based on the week of the year so messages change weekly
        let weekOfYear = calendar.component(.weekOfYear, from: today)
        let startIndex = (weekOfYear * 7) % Self.devotionalMessages.count
        
        for dayOffset in 0..<7 {
            let msgIndex = (startIndex + dayOffset) % Self.devotionalMessages.count
            let message = Self.devotionalMessages[msgIndex]
            
            let content = UNMutableNotificationContent()
            content.title = message.title
            content.body = message.body
            content.sound = .default
            content.categoryIdentifier = NotificationCategory.devotionalReminder
            
            guard let futureDate = calendar.date(byAdding: .day, value: dayOffset, to: today) else { continue }
            var dateComponents = calendar.dateComponents([.year, .month, .day], from: futureDate)
            dateComponents.hour = hour
            dateComponents.minute = minute
            
            let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
            let request = UNNotificationRequest(
                identifier: "rotating_devotional_day_\(dayOffset)",
                content: content,
                trigger: trigger
            )
            try await center.add(request)
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
            let settings = await UNUserNotificationCenter.current().notificationSettings()
            guard settings.badgeSetting == .enabled else { return }
            // Note: iOS doesn't provide a direct API to read current badge count
            // App should track badge count internally if increment is needed
            try? await UNUserNotificationCenter.current().setBadgeCount(1)
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
