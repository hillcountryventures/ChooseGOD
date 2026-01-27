# ChooseGOD iOS Native Architecture
## Deep Dive: Swift/SwiftUI Implementation Guide

**Target:** iOS 16.0+
**Language:** Swift 5.9+
**UI Framework:** SwiftUI
**Architecture:** MVVM + Coordinators
**Concurrency:** Swift async/await

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Dependency Graph](#dependency-graph)
3. [Core Services Layer](#core-services-layer)
4. [State Management](#state-management)
5. [Navigation Architecture](#navigation-architecture)
6. [Data Flow](#data-flow)
7. [Authentication Flow](#authentication-flow)
8. [Offline Strategy](#offline-strategy)
9. [Testing Strategy](#testing-strategy)

---

## Project Structure

```
ChooseGOD/
│
├── App/
│   ├── ChooseGODApp.swift              # @main entry point
│   ├── AppState.swift                   # Root observable state
│   ├── AppCoordinator.swift             # Navigation coordinator
│   └── DependencyContainer.swift        # DI container
│
├── Core/
│   ├── Services/
│   │   ├── Protocols/
│   │   │   ├── AuthServiceProtocol.swift
│   │   │   ├── BibleServiceProtocol.swift
│   │   │   ├── ChatServiceProtocol.swift
│   │   │   └── StorageServiceProtocol.swift
│   │   │
│   │   ├── Supabase/
│   │   │   ├── SupabaseClient.swift     # Singleton client
│   │   │   ├── SupabaseAuthService.swift
│   │   │   ├── SupabaseBibleService.swift
│   │   │   └── SupabasePrayerService.swift
│   │   │
│   │   ├── Audio/
│   │   │   ├── AudioService.swift       # AVPlayer wrapper
│   │   │   ├── BibleBrainService.swift
│   │   │   └── AudioTreasureService.swift
│   │   │
│   │   ├── AI/
│   │   │   ├── ChatService.swift        # OpenAI integration
│   │   │   └── StreamingResponse.swift
│   │   │
│   │   ├── RevenueCatService.swift      # Subscriptions
│   │   └── NotificationService.swift    # Push + Local
│   │
│   ├── Models/
│   │   ├── User.swift
│   │   ├── Verse.swift
│   │   ├── Prayer.swift
│   │   ├── JournalMoment.swift
│   │   ├── Devotional.swift
│   │   ├── ReadingPlan.swift
│   │   └── ChatMessage.swift
│   │
│   ├── Theme/
│   │   ├── Theme.swift                  # Main theme definition
│   │   ├── Colors.swift                 # Color palette
│   │   ├── Typography.swift             # Font styles
│   │   ├── Spacing.swift                # Layout constants
│   │   └── Components/
│   │       ├── PrimaryButton.swift
│   │       ├── SecondaryButton.swift
│   │       ├── CardView.swift
│   │       ├── VerseText.swift
│   │       └── LoadingView.swift
│   │
│   ├── Extensions/
│   │   ├── View+Extensions.swift
│   │   ├── String+Extensions.swift
│   │   ├── Date+Extensions.swift
│   │   └── Color+Extensions.swift
│   │
│   └── Utilities/
│       ├── KeychainManager.swift        # Secure storage
│       ├── UserDefaultsManager.swift    # Preferences
│       ├── NetworkMonitor.swift         # Connectivity
│       └── HapticManager.swift          # Haptic feedback
│
├── Features/
│   ├── Auth/
│   │   ├── AuthCoordinator.swift
│   │   ├── Views/
│   │   │   ├── LoginView.swift
│   │   │   ├── SignUpView.swift
│   │   │   └── ForgotPasswordView.swift
│   │   └── ViewModels/
│   │       └── AuthViewModel.swift
│   │
│   ├── Onboarding/
│   │   ├── OnboardingCoordinator.swift
│   │   ├── Views/
│   │   │   ├── WelcomeView.swift
│   │   │   ├── OnboardingCarousel.swift
│   │   │   ├── QuizView.swift
│   │   │   ├── RecommendationsView.swift
│   │   │   └── PaywallView.swift
│   │   └── ViewModels/
│   │       └── OnboardingViewModel.swift
│   │
│   ├── Home/
│   │   ├── Views/
│   │   │   ├── HomeView.swift
│   │   │   ├── DailyVerseCard.swift
│   │   │   ├── StreakBar.swift
│   │   │   └── ActiveStepsSection.swift
│   │   └── ViewModels/
│   │       └── HomeViewModel.swift
│   │
│   ├── Bible/
│   │   ├── Views/
│   │   │   ├── BibleView.swift
│   │   │   ├── VerseRow.swift
│   │   │   ├── BookPickerView.swift
│   │   │   ├── ChapterPickerView.swift
│   │   │   ├── AudioPlayerBar.swift
│   │   │   └── CrossReferencesSheet.swift
│   │   └── ViewModels/
│   │       └── BibleViewModel.swift
│   │
│   ├── Chat/
│   │   ├── Views/
│   │   │   ├── ChatView.swift
│   │   │   ├── MessageBubble.swift
│   │   │   └── ModeSelector.swift
│   │   └── ViewModels/
│   │       └── ChatViewModel.swift
│   │
│   ├── Journey/
│   │   ├── Views/
│   │   │   ├── JourneyView.swift
│   │   │   ├── TimelineView.swift
│   │   │   └── InsightsView.swift
│   │   └── ViewModels/
│   │       └── JourneyViewModel.swift
│   │
│   ├── Prayers/
│   │   ├── Views/
│   │   │   ├── PrayersView.swift
│   │   │   ├── PrayerRow.swift
│   │   │   └── PrayerCirclesView.swift
│   │   └── ViewModels/
│   │       └── PrayersViewModel.swift
│   │
│   ├── Devotionals/
│   │   ├── Views/
│   │   │   ├── DevotionalHubView.swift
│   │   │   ├── SeriesDetailView.swift
│   │   │   └── DailyDevotionalView.swift
│   │   └── ViewModels/
│   │       └── DevotionalViewModel.swift
│   │
│   └── Settings/
│       ├── Views/
│       │   └── SettingsView.swift
│       └── ViewModels/
│           └── SettingsViewModel.swift
│
├── Widgets/
│   ├── DailyVerseWidget/
│   │   ├── DailyVerseWidget.swift
│   │   ├── DailyVerseProvider.swift
│   │   └── DailyVerseWidgetView.swift
│   └── StreakWidget/
│       └── StreakWidget.swift
│
├── Resources/
│   ├── Assets.xcassets/
│   ├── LaunchScreen.storyboard
│   ├── Info.plist
│   └── Localizable.strings
│
└── Tests/
    ├── UnitTests/
    └── UITests/
```

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ChooseGODApp                               │
│                         (@main entry)                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           AppState                                   │
│              (@Observable root state container)                      │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ AuthState   │  │ UserState   │  │ AppConfig   │                 │
│  │ - session   │  │ - profile   │  │ - theme     │                 │
│  │ - isOnboard │  │ - prefs     │  │ - feature   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DependencyContainer                             │
│                    (Service Locator / DI)                            │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                        Services                              │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ AuthService  │  │ BibleService │  │ ChatService  │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ PrayerService│  │ AudioService │  │RevenueCatSvc │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Feature Modules                               │
│                                                                      │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│   │  Auth   │  │  Home   │  │  Bible  │  │  Chat   │  │ Journey │ │
│   │ Module  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │ │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘ │
│        │            │            │            │            │       │
│        ▼            ▼            ▼            ▼            ▼       │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    Shared Components                         │  │
│   │    VerseCard, Button, Card, EmptyState, LoadingView, etc.   │  │
│   └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Services Layer

### Service Protocol Pattern

Every service has a protocol for testability:

```swift
// Protocol
protocol AuthServiceProtocol {
    var currentUser: User? { get }
    var isAuthenticated: Bool { get }
    
    func signInWithApple() async throws -> User
    func signInWithEmail(email: String, password: String) async throws -> User
    func signUp(email: String, password: String, name: String) async throws -> User
    func signOut() async throws
    func resetPassword(email: String) async throws
}

// Implementation
final class SupabaseAuthService: AuthServiceProtocol {
    // Real implementation using Supabase
}

// Mock for testing
final class MockAuthService: AuthServiceProtocol {
    // Mock implementation for previews/tests
}
```

### Service Initialization Order

```
1. Supabase Client (singleton)
     ↓
2. Auth Service (depends on Supabase)
     ↓
3. RevenueCat (needs user ID from auth)
     ↓
4. Other Services (Bible, Prayer, etc.)
```

---

## State Management

### @Observable Pattern (iOS 17+ / backport)

```swift
@Observable
final class AppState {
    // Auth
    var isAuthenticated = false
    var currentUser: User?
    var hasCompletedOnboarding = false
    
    // App-wide
    var isLoading = false
    var errorMessage: String?
    
    // Services (injected)
    let authService: AuthServiceProtocol
    let bibleService: BibleServiceProtocol
    
    init(
        authService: AuthServiceProtocol = SupabaseAuthService(),
        bibleService: BibleServiceProtocol = SupabaseBibleService()
    ) {
        self.authService = authService
        self.bibleService = bibleService
    }
}
```

### Feature-Level ViewModels

```swift
@Observable
final class BibleViewModel {
    // State
    var verses: [Verse] = []
    var currentBook = "Genesis"
    var currentChapter = 1
    var isLoading = false
    var error: Error?
    
    // Computed
    var reference: String {
        "\(currentBook) \(currentChapter)"
    }
    
    // Dependencies
    private let bibleService: BibleServiceProtocol
    
    // Actions
    func loadChapter() async { ... }
    func navigateToVerse(_ verse: Int) { ... }
}
```

---

## Navigation Architecture

### Coordinator Pattern with NavigationStack

```swift
@Observable
final class AppCoordinator {
    var authPath = NavigationPath()
    var mainPath = NavigationPath()
    var selectedTab: Tab = .home
    
    enum Tab: Int, CaseIterable {
        case home, devotionals, bible, journey, prayers
    }
    
    enum AuthRoute: Hashable {
        case login
        case signUp
        case forgotPassword
    }
    
    enum MainRoute: Hashable {
        case settings
        case chatHub(contextVerse: Verse?)
        case journalCompose
        case bibleVerse(book: String, chapter: Int, verse: Int)
        case prayerCircleDetail(id: String)
    }
}
```

### Deep Linking

```swift
// URL Scheme: choosegod://
// Universal Links: https://choosegod.app/

enum DeepLink {
    case bible(book: String?, chapter: Int?, verse: Int?)
    case prayer(id: String)
    case devotional(seriesId: String, day: Int?)
    case chat
    
    init?(url: URL) {
        // Parse URL into DeepLink case
    }
}
```

---

## Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   SwiftUI    │      │  ViewModel   │      │   Service    │
│    View      │◄────►│  @Observable │◄────►│   Layer      │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                     │
       │ User Action         │ State Change        │ API Call
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Button     │─────►│ viewModel    │─────►│  Supabase    │
│   .onTap     │      │ .loadData()  │      │  .from()     │
└──────────────┘      └──────────────┘      └──────────────┘
                             │                     │
                             │◄────────────────────┘
                             │    Response
                             ▼
                      ┌──────────────┐
                      │ @Published   │
                      │ state update │
                      │      ↓       │
                      │ View re-render
                      └──────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      App Launch                              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Check Keychain    │
                    │ for session       │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
     ┌────────────────┐              ┌────────────────┐
     │ Session Found  │              │ No Session     │
     └────────┬───────┘              └────────┬───────┘
              │                               │
              ▼                               ▼
     ┌────────────────┐              ┌────────────────┐
     │ Validate with  │              │ Show Auth      │
     │ Supabase       │              │ Screen         │
     └────────┬───────┘              └────────┬───────┘
              │                               │
              │                               ▼
              │                      ┌────────────────┐
              │                      │ Apple Sign In  │
              │                      │ OR Email/Pass  │
              │                      └────────┬───────┘
              │                               │
              │◄──────────────────────────────┘
              │
              ▼
     ┌────────────────┐
     │ Check Onboard  │
     │ Status         │
     └────────┬───────┘
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
┌─────────┐      ┌─────────┐
│Onboarded│      │ Not Yet │
└────┬────┘      └────┬────┘
     │                │
     ▼                ▼
┌─────────┐      ┌─────────┐
│Main App │      │Onboarding│
│ (Tabs)  │      │  Flow    │
└─────────┘      └─────────┘
```

---

## Offline Strategy

### SwiftData for Local Persistence

```swift
@Model
final class CachedVerse {
    @Attribute(.unique) var id: String
    var book: String
    var chapter: Int
    var verse: Int
    var text: String
    var translation: String
    var cachedAt: Date
    
    var isStale: Bool {
        Date().timeIntervalSince(cachedAt) > 86400 * 7 // 7 days
    }
}

@Model
final class LocalAnnotation {
    @Attribute(.unique) var verseKey: String
    var highlightColor: String?
    var note: String?
    var isBookmarked: Bool
    var updatedAt: Date
    var isSynced: Bool
}
```

### Sync Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    User Action                            │
│              (highlight, note, bookmark)                  │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ Save to SwiftData     │
              │ (isSynced = false)    │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ Check Network         │
              └───────────┬───────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
   ┌─────────────┐                ┌─────────────┐
   │  Online     │                │  Offline    │
   └──────┬──────┘                └──────┬──────┘
          │                              │
          ▼                              ▼
   ┌─────────────┐                ┌─────────────┐
   │ Sync to     │                │ Queue for   │
   │ Supabase    │                │ later sync  │
   └──────┬──────┘                └─────────────┘
          │
          ▼
   ┌─────────────┐
   │ isSynced    │
   │ = true      │
   └─────────────┘
```

---

## Testing Strategy

### Unit Tests
- ViewModels: State changes, computed properties
- Services: Mocked network layer
- Models: Encoding/decoding, validation

### UI Tests
- Critical flows: Auth, Bible navigation, Chat
- Accessibility: VoiceOver traversal
- Screenshots: App Store automation

### Test Coverage Targets
- Models: 90%+
- ViewModels: 80%+
- Services: 70%+
- Views: 40% (UI tests)

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold start | <1.5s | Instruments Time Profiler |
| Bible scroll | 60fps | Core Animation instrument |
| Memory (idle) | <80MB | Allocations instrument |
| Memory (peak) | <200MB | Allocations instrument |
| API response | <500ms | Network instrument |
| Animation | 60fps | Core Animation instrument |

---

## Security Considerations

1. **Keychain** for sensitive data (tokens, credentials)
2. **App Transport Security** enabled (HTTPS only)
3. **Certificate Pinning** for Supabase (optional)
4. **Biometric auth** option for app unlock
5. **No sensitive data in UserDefaults**
6. **Obfuscation** for release builds

---

*Architecture Document v1.0 - 2026-01-27*
