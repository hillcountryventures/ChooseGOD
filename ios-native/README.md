# ChooseGOD iOS Native

Native Swift/SwiftUI implementation of the ChooseGOD Bible app.

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## Dependencies

Add these via Swift Package Manager in Xcode:

```swift
// Package.swift or Xcode SPM
dependencies: [
    .package(url: "https://github.com/supabase-community/supabase-swift", from: "2.0.0"),
    .package(url: "https://github.com/RevenueCat/purchases-ios", from: "4.0.0"),
]
```

### Required Packages

| Package | Version | Purpose |
|---------|---------|---------|
| [supabase-swift](https://github.com/supabase-community/supabase-swift) | 2.x | Backend, Auth, Database |
| [purchases-ios](https://github.com/RevenueCat/purchases-ios) | 4.x | In-app subscriptions |

### Optional Packages

| Package | Purpose |
|---------|---------|
| [OpenAI](https://github.com/MacPaw/OpenAI) | AI chat functionality |
| [Lottie](https://github.com/airbnb/lottie-ios) | Animations |

## Project Setup

### 1. Clone and Open in Xcode

```bash
# Create new Xcode project
# Choose: iOS > App > SwiftUI > Swift
# Name: ChooseGOD

# Copy ios-native/* into project
```

### 2. Configure Info.plist

Add these keys to your Info.plist:

```xml
<!-- Supabase Configuration -->
<key>SUPABASE_URL</key>
<string>https://your-project.supabase.co</string>
<key>SUPABASE_ANON_KEY</key>
<string>your-anon-key</string>

<!-- Sign in with Apple -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>choosegod</string>
        </array>
    </dict>
</array>
```

### 3. Enable Capabilities

In Xcode, go to your target's "Signing & Capabilities" and add:

- ✅ Sign in with Apple
- ✅ Push Notifications
- ✅ Background Modes (Background fetch, Remote notifications)
- ✅ App Groups (for widgets)
- ✅ Keychain Sharing

### 4. Configure Apple Sign In

1. In Apple Developer Portal:
   - Enable "Sign in with Apple" for your App ID
   - Create a Services ID for web auth (if needed)
   - Configure return URLs in Supabase

2. In Supabase Dashboard:
   - Go to Authentication > Providers > Apple
   - Add your Service ID and Key

## Architecture

```
ios-native/
├── App/
│   ├── ChooseGODApp.swift      # @main entry point
│   ├── AppState.swift          # Root observable state
│   └── MainTabView.swift       # Tab navigation
│
├── Core/
│   ├── Services/               # API services (Supabase, RevenueCat)
│   ├── Models/                 # Data models
│   ├── Theme/                  # Design system
│   └── Utilities/              # Helpers (Keychain, etc.)
│
├── Features/
│   ├── Auth/                   # Login, SignUp, ForgotPassword
│   ├── Home/                   # Home screen
│   ├── Bible/                  # Bible reader
│   └── ...                     # Other features
│
└── Widgets/                    # iOS Widgets
```

## Key Files

| File | Description |
|------|-------------|
| `SupabaseAuthService.swift` | Full Apple Sign In + email auth |
| `Theme.swift` | Design tokens (colors, typography, spacing) |
| `LoginView.swift` | Login screen with Apple Sign In button |
| `MainTabView.swift` | Tab bar with custom Bible center button |
| `KeychainManager.swift` | Secure credential storage |

## Testing

### Previews

All views have `#Preview` macros with mock data:

```swift
#Preview {
    LoginView()
        .environment(AppState.preview)
}
```

### Unit Tests

```swift
// Test auth service
let mockAuth = MockAuthService()
let user = try await mockAuth.signInWithEmail(email: "test@test.com", password: "password")
XCTAssertNotNil(user)
```

## Migration Notes

### From React Native

| React Native | Swift/SwiftUI |
|--------------|---------------|
| Zustand stores | @Observable classes |
| AsyncStorage | UserDefaults / SwiftData |
| Keychain (expo-secure-store) | KeychainManager |
| React Navigation | NavigationStack |
| Supabase JS | supabase-swift |
| RevenueCat RN | purchases-ios |

### Data Compatibility

- ✅ Supabase backend is fully compatible
- ✅ RevenueCat subscriptions work across platforms
- ✅ User data syncs automatically

## Building for Production

```bash
# Archive for App Store
xcodebuild -scheme ChooseGOD -configuration Release archive

# Or use Xcode: Product > Archive
```

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Supabase Swift Docs](https://supabase.com/docs/reference/swift)
- [RevenueCat iOS Docs](https://www.revenuecat.com/docs/ios)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)

---

*Generated: 2026-01-27*
