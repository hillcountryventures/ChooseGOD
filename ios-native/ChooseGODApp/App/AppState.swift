import SwiftUI
import Observation

/// Root application state container
/// Uses @Observable (iOS 17+) for efficient SwiftUI updates
@Observable
final class AppState {
    // MARK: - Authentication State
    var isAuthenticated = false
    var currentUser: User?
    var hasCompletedOnboarding = false
    
    // MARK: - App State
    var isLoading = false
    var errorMessage: String?
    var showError = false

    // MARK: - Deep Link Navigation
    var deepLinkVerseRef: String?
    var deepLinkInviteCode: String?
    var deepLinkDevotionalId: String?
    
    // MARK: - User Preferences
    var preferences: UserPreferences
    
    // MARK: - Services (Dependency Injection)
    let authService: AuthServiceProtocol
    let bibleService: BibleServiceProtocol
    let subscriptionService: SubscriptionServiceProtocol
    let notificationService: NotificationServiceProtocol
    
    // MARK: - Initialization
    
    init(
        authService: AuthServiceProtocol = SupabaseAuthService(),
        bibleService: BibleServiceProtocol = MockBibleService(),
        subscriptionService: SubscriptionServiceProtocol = RevenueCatService.shared,
        notificationService: NotificationServiceProtocol = NotificationService.shared
    ) {
        self.authService = authService
        self.bibleService = bibleService
        self.subscriptionService = subscriptionService
        self.notificationService = notificationService
        self.preferences = UserPreferences.load()
    }
    
    // MARK: - Convenience Initializer for Previews
    
    static var preview: AppState {
        let state = AppState(
            authService: MockAuthService(),
            bibleService: MockBibleService(),
            subscriptionService: MockSubscriptionService(),
            notificationService: MockNotificationService()
        )
        state.isAuthenticated = true
        state.currentUser = .preview
        state.hasCompletedOnboarding = true
        return state
    }
    
    // MARK: - Actions
    
    func handleError(_ error: Error) {
        errorMessage = error.localizedDescription
        showError = true
    }
    
    func clearError() {
        errorMessage = nil
        showError = false
    }
    
    func signOut() async {
        do {
            try await authService.signOut()
            withAnimation {
                isAuthenticated = false
                currentUser = nil
                hasCompletedOnboarding = false
            }
        } catch {
            handleError(error)
        }
    }
    
    /// Configure notifications after authentication
    func setupNotifications() async {
        let status = await NotificationService.shared.checkPermissionStatus()
        if status == .authorized {
            await NotificationService.shared.configureFromPreferences(preferences)
        }
    }
    
    func completeOnboarding() {
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
        withAnimation {
            hasCompletedOnboarding = true
        }
    }
}

// MARK: - User Preferences

struct UserPreferences: Codable {
    var preferredTranslation: BibleTranslation = .kjv
    var fontSize: FontSize = .medium
    var morningNotificationEnabled = true
    var eveningNotificationEnabled = true
    var morningNotificationTime = DateComponents(hour: 7, minute: 0)
    var eveningNotificationTime = DateComponents(hour: 21, minute: 0)
    var hapticFeedbackEnabled = true
    
    enum FontSize: String, Codable, CaseIterable {
        case small, medium, large, extraLarge
        
        var scaleFactor: CGFloat {
            switch self {
            case .small: return 0.85
            case .medium: return 1.0
            case .large: return 1.15
            case .extraLarge: return 1.3
            }
        }
    }
    
    // MARK: - Persistence
    
    private static let key = "userPreferences"
    
    static func load() -> UserPreferences {
        guard let data = UserDefaults.standard.data(forKey: key),
              let prefs = try? JSONDecoder().decode(UserPreferences.self, from: data) else {
            return UserPreferences()
        }
        return prefs
    }
    
    func save() {
        if let data = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(data, forKey: Self.key)
        }
    }
}

// MARK: - Bible Translation

enum BibleTranslation: String, Codable, CaseIterable, Identifiable {
    case kjv = "KJV"
    case asv = "ASV"
    case web = "WEB"
    case niv = "NIV"
    case rvr = "RVR"  // Spanish
    case cuv = "CUV"  // Chinese
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .kjv: return "King James Version"
        case .asv: return "American Standard Version"
        case .web: return "World English Bible"
        case .niv: return "New International Version"
        case .rvr: return "Reina Valera"
        case .cuv: return "Chinese Union Version"
        }
    }
    
    var language: String {
        switch self {
        case .kjv, .asv, .web, .niv: return "English"
        case .rvr: return "Español"
        case .cuv: return "中文"
        }
    }
    
    /// Whether audio is available for this translation
    var hasAudio: Bool {
        switch self {
        case .kjv: return true  // AudioTreasure
        case .asv, .web: return true  // Bible Brain
        default: return false
        }
    }
}
