import SwiftUI
import Supabase

/// Main entry point for ChooseGOD iOS app
@main
struct ChooseGODApp: App {
    // MARK: - State
    @State private var appState = AppState()
    @State private var isInitialized = false
    
    var body: some Scene {
        WindowGroup {
            Group {
                if !isInitialized {
                    // Splash screen while initializing
                    SplashView()
                        .task {
                            await initialize()
                        }
                } else if !appState.isAuthenticated {
                    // Auth flow
                    AuthCoordinatorView()
                        .environment(appState)
                } else if !appState.hasCompletedOnboarding {
                    // Onboarding flow
                    OnboardingCoordinatorView()
                        .environment(appState)
                } else {
                    // Main app
                    MainTabView()
                        .environment(appState)
                }
            }
            // Fix 1: OfflineBanner overlay
            .overlay(alignment: .top) {
                if NetworkMonitor.shared.isConnected == false {
                    OfflineBanner()
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .animation(.easeInOut(duration: 0.3), value: NetworkMonitor.shared.isConnected)
                }
            }
            .preferredColorScheme(ThemeManager.shared.resolvedColorScheme)
            .onOpenURL { url in
                handleDeepLink(url)
            }
            .task {
                // Reschedule rotating notifications weekly on app open
                try? await NotificationService.shared.scheduleRotatingReminders()
            }
        }
    }
    
    // MARK: - Deep Links (Fix 2: Expanded handling)
    
    private func handleDeepLink(_ url: URL) {
        // Support both custom scheme (choosegod://) and universal links (https://choosegod.app/)
        let pathComponents: [String]
        
        if url.scheme == "choosegod" {
            // choosegod://invite/CODE or choosegod://verse/John/3/16
            // host is the first path segment, pathComponents has the rest
            var parts: [String] = []
            if let host = url.host { parts.append(host) }
            parts.append(contentsOf: url.pathComponents.filter { $0 != "/" })
            pathComponents = parts
        } else {
            // https://choosegod.app/invite/CODE
            pathComponents = url.pathComponents.filter { $0 != "/" }
        }
        
        guard let firstSegment = pathComponents.first else { return }
        
        switch firstSegment {
        case "invite":
            // /invite/{code}
            if pathComponents.count >= 2 {
                let code = pathComponents[1]
                UserDefaults.standard.set(code.uppercased(), forKey: "pendingReferralCode")
                appState.deepLinkInviteCode = code.uppercased()
            }
            
        case "verse":
            // /verse/{book}/{chapter}/{verse}
            if pathComponents.count >= 4 {
                let book = pathComponents[1]
                let chapter = pathComponents[2]
                let verse = pathComponents[3]
                appState.deepLinkVerseRef = "\(book)/\(chapter)/\(verse)"
            }
            
        case "devotional":
            // /devotional/{id}
            if pathComponents.count >= 2 {
                appState.deepLinkDevotionalId = pathComponents[1]
            }
            
        default:
            break
        }
    }
    
    // MARK: - Initialization
    
    private func initialize() async {
        // TODO: Add Sentry iOS SDK
        // SentrySDK.start { options in
        //     options.dsn = Bundle.main.infoDictionary?["SENTRY_DSN"] as? String
        //     options.tracesSampleRate = 0.2
        // }

        // Fix 6: Initialize AnalyticsService with consent gating
        let analyticsConsent = UserDefaults.standard.bool(forKey: "consent_analytics")
        if analyticsConsent {
            // TODO: Replace empty string with real PostHog API key
            AnalyticsService.shared.initialize(apiKey: "")
        }

        // 1. Initialize Supabase
        do {
            try await SupabaseManager.shared.initialize()
        } catch {
            print("[ChooseGODApp] Failed to initialize Supabase: \(error.localizedDescription)")
            return
        }
        
        // 2. Check for existing session
        if let session = await appState.authService.restoreSession() {
            appState.currentUser = session.user
            appState.isAuthenticated = true
            appState.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
            
            // Identify user in analytics (consent-gated)
            if analyticsConsent {
                AnalyticsService.shared.identify(session.user.id, properties: nil)
            }
        }
        
        // 3. Auto-apply pending referral code
        if let userId = appState.currentUser?.id,
           let pendingCode = UserDefaults.standard.string(forKey: "pendingReferralCode") {
            let applied = await ReferralService.shared.applyReferralCode(pendingCode, forUserId: userId)
            if applied {
                UserDefaults.standard.removeObject(forKey: "pendingReferralCode")
            }
        }
        
        // 4. Initialize RevenueCat
        await appState.subscriptionService.configure(userId: appState.currentUser?.id)
        
        // 5. Mark as initialized
        withAnimation(.easeOut(duration: 0.3)) {
            isInitialized = true
        }
    }
}

// MARK: - Splash View

struct SplashView: View {
    @State private var opacity = 0.0
    @State private var scale = 0.8
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // App icon or logo
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("ChooseGOD")
                    .font(.system(size: 32, weight: .bold, design: .serif))
                    .foregroundStyle(Theme.Colors.text)
                
                ShimmerView(height: 20)
                    .tint(Theme.Colors.primary)
            }
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                opacity = 1.0
                scale = 1.0
            }
        }
    }
}

#Preview {
    SplashView()
}
