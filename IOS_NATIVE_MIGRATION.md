# ChooseGOD → Native iOS Migration Plan
## React Native to Swift/SwiftUI Conversion

**Generated:** 2026-01-27
**Current Stack:** React Native + Expo 54
**Target Stack:** Swift 5.9+ / SwiftUI / iOS 16+

---

## Executive Summary

| Metric | React Native | Native Swift |
|--------|--------------|--------------|
| Bundle Size | ~50MB | ~15-20MB |
| Cold Start | 2-3s | <1s |
| Memory Usage | Higher | 30-40% less |
| Animation | Good (Reanimated) | Excellent (native) |
| Maintenance | JS + Native bridges | Single codebase |
| Developer Pool | Larger | iOS specialists |

**Estimated Timeline:** 16-20 weeks (1 senior iOS dev) or 10-12 weeks (2 devs)

---

## Decision Framework: When to Go Native

### ✅ Go Native If:
- iOS is 80%+ of your user base
- Performance is a key differentiator
- You want Apple ecosystem integration (Widgets, Shortcuts, Apple Watch)
- Long-term maintenance simplicity matters
- You have/can hire iOS expertise

### ❌ Stay React Native If:
- Android is significant (>30% users)
- Faster iteration speed is critical
- Your team is JS/React-focused
- Budget is constrained

---

## Architecture Decisions

### Recommended Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **UI Framework** | SwiftUI | Modern, declarative, similar to React |
| **Architecture** | MVVM + Coordinators | Clean separation, testable |
| **State Management** | Combine + @Observable | Native reactive programming |
| **Networking** | async/await + URLSession | No third-party needed |
| **Database** | Supabase Swift SDK | Keep existing backend! |
| **Persistence** | SwiftData or Core Data | Local caching |
| **Auth** | Supabase Auth + Sign in with Apple | Native integration |
| **Payments** | RevenueCat iOS SDK | Same backend, native SDK |
| **AI/Chat** | OpenAI Swift SDK | Direct API calls |

### Project Structure

```
ChooseGOD/
├── App/
│   ├── ChooseGODApp.swift          # @main entry
│   ├── AppCoordinator.swift        # Navigation coordinator
│   └── ContentView.swift           # Root view
│
├── Core/
│   ├── Theme/
│   │   ├── Theme.swift             # Colors, fonts, spacing
│   │   ├── Typography.swift
│   │   └── Components/             # Reusable UI components
│   │
│   ├── Services/
│   │   ├── SupabaseService.swift   # Supabase client
│   │   ├── AuthService.swift       # Authentication
│   │   ├── BibleService.swift      # Verse fetching
│   │   ├── ChatService.swift       # OpenAI integration
│   │   ├── AudioService.swift      # Bible Brain / AudioTreasure
│   │   └── NotificationService.swift
│   │
│   ├── Models/
│   │   ├── Verse.swift
│   │   ├── Prayer.swift
│   │   ├── Devotional.swift
│   │   ├── ReadingPlan.swift
│   │   └── User.swift
│   │
│   └── Utilities/
│       ├── Extensions/
│       └── Helpers/
│
├── Features/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   ├── SignUpView.swift
│   │   └── AuthViewModel.swift
│   │
│   ├── Onboarding/
│   │   ├── WelcomeView.swift
│   │   ├── QuizView.swift
│   │   └── OnboardingViewModel.swift
│   │
│   ├── Home/
│   │   ├── HomeView.swift
│   │   ├── HomeViewModel.swift
│   │   ├── DailyVerseCard.swift
│   │   └── StreakBar.swift
│   │
│   ├── Bible/
│   │   ├── BibleView.swift
│   │   ├── BibleViewModel.swift
│   │   ├── VerseRow.swift
│   │   ├── BookPicker.swift
│   │   ├── ChapterPicker.swift
│   │   ├── AudioPlayerBar.swift
│   │   └── CrossReferencesSheet.swift
│   │
│   ├── Chat/
│   │   ├── ChatView.swift
│   │   ├── ChatViewModel.swift
│   │   ├── MessageBubble.swift
│   │   └── ModeSelector.swift
│   │
│   ├── Journey/
│   │   ├── JourneyView.swift
│   │   ├── TimelineView.swift
│   │   └── InsightsView.swift
│   │
│   ├── Prayers/
│   │   ├── PrayersView.swift
│   │   ├── PrayerRow.swift
│   │   └── PrayerCirclesView.swift
│   │
│   ├── Devotionals/
│   │   ├── DevotionalHubView.swift
│   │   ├── SeriesDetailView.swift
│   │   └── DailyDevotionalView.swift
│   │
│   └── Settings/
│       ├── SettingsView.swift
│       └── SettingsViewModel.swift
│
├── Widgets/                        # iOS Widgets (NEW!)
│   ├── DailyVerseWidget.swift
│   └── StreakWidget.swift
│
└── Resources/
    ├── Assets.xcassets
    ├── Localizable.strings
    └── Info.plist
```

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1: Project Setup & Core Services

| Task | Effort | Notes |
|------|--------|-------|
| Create Xcode project with SwiftUI | 2 hrs | iOS 16+ target |
| Configure Supabase Swift SDK | 4 hrs | `supabase-swift` package |
| Implement AuthService | 1 day | Apple Sign-In + email |
| Set up Theme system | 4 hrs | Port colors, fonts, spacing |
| Configure RevenueCat iOS | 4 hrs | Same API keys work |

**Supabase Swift Setup:**
```swift
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://your-project.supabase.co")!,
    supabaseKey: "your-anon-key"
)

// Auth
let session = try await supabase.auth.signIn(
    email: email,
    password: password
)

// Queries
let verses: [Verse] = try await supabase
    .from("verses")
    .select()
    .eq("book", value: "John")
    .eq("chapter", value: 3)
    .execute()
    .value
```

### Week 2: Auth & Onboarding

| Task | Effort | Notes |
|------|--------|-------|
| LoginView + SignUpView | 1 day | Native Apple Sign-In! |
| WelcomeView | 4 hrs | Simple SwiftUI |
| OnboardingCarousel | 4 hrs | TabView with paging |
| PersonalizationQuiz | 1 day | Multi-step form |
| Paywall integration | 4 hrs | RevenueCat SwiftUI |

**Native Apple Sign-In:**
```swift
import AuthenticationServices

SignInWithAppleButton(.signIn) { request in
    request.requestedScopes = [.fullName, .email]
} onCompletion: { result in
    switch result {
    case .success(let auth):
        // Pass to Supabase
        Task {
            try await supabase.auth.signInWithIdToken(
                credentials: .init(
                    provider: .apple,
                    idToken: auth.credential.identityToken
                )
            )
        }
    case .failure(let error):
        print(error)
    }
}
```

### Week 3: Navigation & Tab Bar

| Task | Effort | Notes |
|------|--------|-------|
| App Coordinator pattern | 4 hrs | Navigation management |
| Tab bar with 5 tabs | 4 hrs | Home, Devotionals, Bible, Journey, Prayers |
| Custom center Bible button | 4 hrs | Raised purple FAB |
| Deep linking setup | 4 hrs | URL schemes + Universal Links |
| Settings modal | 4 hrs | Sheet presentation |

---

## Phase 2: Core Features (Weeks 4-8)

### Week 4-5: Bible Reader

| Task | Effort | Notes |
|------|--------|-------|
| BibleView with lazy list | 1 day | Native List is performant |
| VerseRow with highlights | 1 day | Swipe actions native |
| Book/Chapter pickers | 1 day | Native Picker or custom |
| Cross-references sheet | 1 day | Sheet presentation |
| Search functionality | 4 hrs | Searchable modifier |
| Audio player integration | 1 day | AVPlayer + AudioTreasure |

**SwiftUI Bible List (no FlashList needed!):**
```swift
struct BibleView: View {
    @StateObject var viewModel = BibleViewModel()
    
    var body: some View {
        List(viewModel.verses) { verse in
            VerseRow(verse: verse)
                .swipeActions(edge: .trailing) {
                    Button { viewModel.highlight(verse) } label: {
                        Label("Highlight", systemImage: "highlighter")
                    }
                    .tint(.yellow)
                }
        }
        .searchable(text: $viewModel.searchText)
        .refreshable { await viewModel.refresh() }
    }
}
```

### Week 6: Home Screen

| Task | Effort | Notes |
|------|--------|-------|
| HomeView layout | 1 day | ScrollView + VStack |
| Daily verse card | 4 hrs | Card component |
| Streak bar | 4 hrs | HStack with circles |
| Active steps section | 4 hrs | Horizontal scroll |
| Ask the Bible button | 2 hrs | Prominent CTA |

### Week 7: Chat/AI

| Task | Effort | Notes |
|------|--------|-------|
| ChatView with messages | 1 day | LazyVStack for messages |
| Streaming responses | 1 day | AsyncStream |
| Mode selector | 4 hrs | Picker or custom |
| Verse context integration | 4 hrs | Pass context to prompts |
| Seeds/quota tracking | 4 hrs | RevenueCat integration |

**Streaming Chat:**
```swift
func streamChat(message: String) async {
    let stream = try await openAI.chats.stream(
        model: "gpt-4",
        messages: [.user(content: message)]
    )
    
    for try await chunk in stream {
        await MainActor.run {
            self.currentResponse += chunk.choices.first?.delta.content ?? ""
        }
    }
}
```

### Week 8: Journey & Prayers

| Task | Effort | Notes |
|------|--------|-------|
| JourneyView with tabs | 4 hrs | Timeline + Insights |
| TimelineView | 1 day | Grouped list |
| InsightsView charts | 1 day | Swift Charts (native!) |
| PrayersView | 1 day | List with filters |
| Prayer circles | 1 day | Real-time with Supabase |

---

## Phase 3: Advanced Features (Weeks 9-12)

### Week 9-10: Devotionals & Reading Plans

| Task | Effort | Notes |
|------|--------|-------|
| Devotional hub | 1 day | Grid layout |
| Series detail | 1 day | Scroll view |
| Daily devotional | 1 day | Rich content |
| Reading plans | 2 days | Progress tracking |
| Lectio Divina | 1 day | Guided steps with timers |

### Week 11: Memory Practice & Extras

| Task | Effort | Notes |
|------|--------|-------|
| Memory flashcards | 1 day | Card flip animation |
| SM-2 spaced repetition | 4 hrs | Algorithm port |
| Journal compose | 1 day | Rich text input |
| Celebration overlays | 4 hrs | Native confetti |
| Scripture scan (OCR) | 1 day | Vision framework |

### Week 12: Notifications & Background

| Task | Effort | Notes |
|------|--------|-------|
| Push notifications | 1 day | APNs + Supabase |
| Local notifications | 4 hrs | Prayer reminders |
| Background refresh | 4 hrs | Daily verse fetch |
| Notification preferences | 4 hrs | Settings integration |

---

## Phase 4: iOS Exclusives (Weeks 13-16)

### Week 13-14: Widgets

| Task | Effort | Notes |
|------|--------|-------|
| Daily Verse widget (small) | 1 day | WidgetKit |
| Daily Verse widget (medium) | 4 hrs | More context |
| Streak widget | 4 hrs | Week view |
| Reading progress widget | 4 hrs | Plan progress |
| Widget configuration | 4 hrs | User selection |

**Widget Example:**
```swift
struct DailyVerseWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "DailyVerse",
            provider: DailyVerseProvider()
        ) { entry in
            DailyVerseWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Verse")
        .description("See today's verse at a glance")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### Week 15: Apple Watch (Optional)

| Task | Effort | Notes |
|------|--------|-------|
| Watch app target | 4 hrs | Setup |
| Daily verse complication | 1 day | ClockKit |
| Prayer reminder glance | 4 hrs | Simple UI |
| Streak display | 4 hrs | Ring UI |

### Week 16: Siri Shortcuts & Spotlight

| Task | Effort | Notes |
|------|--------|-------|
| Siri Shortcuts | 1 day | App Intents |
| "Read today's verse" | 4 hrs | Voice command |
| "Start prayer time" | 4 hrs | Voice command |
| Spotlight indexing | 4 hrs | CSSearchableItem |
| Handoff support | 4 hrs | Continuity |

---

## Phase 5: Polish & Launch (Weeks 17-20)

### Week 17-18: Testing & Performance

| Task | Effort | Notes |
|------|--------|-------|
| Unit tests | 2 days | XCTest |
| UI tests | 2 days | XCUITest |
| Performance profiling | 1 day | Instruments |
| Memory optimization | 1 day | Leaks analysis |
| Accessibility audit | 1 day | VoiceOver, Dynamic Type |

### Week 19: App Store Prep

| Task | Effort | Notes |
|------|--------|-------|
| App Store screenshots | 1 day | All device sizes |
| Preview video | 1 day | 30-second demo |
| App Store description | 4 hrs | Keyword optimized |
| Privacy labels | 2 hrs | Accurate declaration |
| Review guidelines check | 4 hrs | Compliance |

### Week 20: Migration & Launch

| Task | Effort | Notes |
|------|--------|-------|
| Data migration path | 1 day | Export/import user data |
| Beta testing (TestFlight) | 3 days | Bug fixes |
| Staged rollout | — | 10% → 50% → 100% |
| Monitor & hotfix | — | Ongoing |

---

## Data Migration Strategy

### Option A: Fresh Start (Recommended)
- New app on App Store (different bundle ID)
- Existing users re-authenticate
- Data syncs from Supabase automatically
- Old RN app stays available during transition

### Option B: In-Place Replacement
- Same bundle ID
- More complex migration
- Risk of data issues
- Seamless for users

### Supabase Data (No Migration Needed!)
All user data lives in Supabase — both apps connect to the same backend:
- ✅ User profiles
- ✅ Prayers
- ✅ Journal entries
- ✅ Reading progress
- ✅ Subscriptions (RevenueCat)

### Local Data Migration
Need to handle:
- Preferences (AsyncStorage → UserDefaults)
- Offline cached verses
- Local drafts

---

## Cost-Benefit Analysis

### Development Costs
| Item | React Native Improvement | Native Rewrite |
|------|--------------------------|----------------|
| Developer time | 20-24 weeks | 16-20 weeks |
| Hourly rate (senior) | $150/hr | $175/hr |
| **Total estimate** | $120-145k | $112-140k |

### Long-term Benefits
| Factor | React Native | Native Swift |
|--------|--------------|--------------|
| App Store approval | Occasional issues | Smooth |
| OS update compatibility | Lag 1-3 months | Day 1 |
| New iOS features | Wait for Expo | Immediate |
| Performance ceiling | Good | Excellent |
| Bundle size | ~50MB | ~15-20MB |
| Talent availability | Higher | iOS specialists |

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Timeline overrun | Medium | Buffer 20%, MVP first |
| Feature parity gaps | Low | Document all features first |
| User churn during transition | Medium | Overlap period, clear comms |
| iOS expertise gaps | Medium | Hire/contract iOS specialist |
| Supabase Swift SDK issues | Low | Well-maintained, fallback to REST |

---

## Recommended Approach

### If Going Native:

1. **Week 1-2:** Spike/prototype critical screens (Bible, Chat)
2. **Week 3:** Go/No-Go decision based on velocity
3. **Week 4-16:** Full development
4. **Week 17-20:** Polish and launch

### Hybrid Option:
Keep React Native for now, but:
1. Fix critical issues (social login, persistence)
2. Add iOS widgets via native module
3. Evaluate native rewrite in 6 months based on growth

---

## Quick Reference: React Native → SwiftUI

| React Native | SwiftUI |
|--------------|---------|
| `View` | `VStack`, `HStack`, `ZStack` |
| `Text` | `Text` |
| `TouchableOpacity` | `Button` |
| `ScrollView` | `ScrollView` |
| `FlatList` | `List` or `LazyVStack` |
| `useState` | `@State` |
| `useEffect` | `.onAppear`, `.task` |
| `useContext` | `@EnvironmentObject` |
| Zustand | `@Observable` + `@Environment` |
| `StyleSheet` | ViewModifiers |
| `Animated` | `withAnimation`, `Animation` |
| React Navigation | `NavigationStack` |

---

*Last updated: 2026-01-27*
