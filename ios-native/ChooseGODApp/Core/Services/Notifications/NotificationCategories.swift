import UserNotifications

/// Defines notification categories and actions for ChooseGOD
enum NotificationCategory {
    static let devotionalReminder = "DEVOTIONAL_REMINDER"
    static let prayerReminder = "PRAYER_REMINDER"
    static let dailyVerse = "DAILY_VERSE"
    
    // MARK: - Action Identifiers
    
    enum Action {
        static let openDevotional = "OPEN_DEVOTIONAL"
        static let dismiss = "DISMISS"
        static let openPrayer = "OPEN_PRAYER"
        static let markPrayerDone = "MARK_PRAYER_DONE"
    }
    
    // MARK: - Notification Request Identifiers
    
    enum RequestID {
        static let morningDevotional = "morning_devotional"
        static let eveningDevotional = "evening_devotional"
        static let prayerReminder = "prayer_reminder"
        static let dailyVerse = "daily_verse"
    }
    
    // MARK: - Register Categories
    
    static func registerAll() {
        let openDevotionalAction = UNNotificationAction(
            identifier: Action.openDevotional,
            title: "Open Devotional",
            options: [.foreground]
        )
        
        let dismissAction = UNNotificationAction(
            identifier: Action.dismiss,
            title: "Dismiss",
            options: [.destructive]
        )
        
        let openPrayerAction = UNNotificationAction(
            identifier: Action.openPrayer,
            title: "Open Prayer",
            options: [.foreground]
        )
        
        let markPrayerDoneAction = UNNotificationAction(
            identifier: Action.markPrayerDone,
            title: "Done Praying",
            options: []
        )
        
        let devotionalCategory = UNNotificationCategory(
            identifier: devotionalReminder,
            actions: [openDevotionalAction, dismissAction],
            intentIdentifiers: [],
            options: []
        )
        
        let prayerCategory = UNNotificationCategory(
            identifier: prayerReminder,
            actions: [openPrayerAction, markPrayerDoneAction, dismissAction],
            intentIdentifiers: [],
            options: []
        )
        
        let dailyVerseCategory = UNNotificationCategory(
            identifier: dailyVerse,
            actions: [openDevotionalAction, dismissAction],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([
            devotionalCategory,
            prayerCategory,
            dailyVerseCategory
        ])
    }
}
