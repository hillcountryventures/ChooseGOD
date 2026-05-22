import SwiftUI
import Supabase
import Sentry

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
                    // Launch animation while initializing
                    LaunchAnimationView()
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
            // TODO: NetworkMonitor and OfflineBanner not in scope
            // .overlay(alignment: .top) {
            //     if NetworkMonitor.shared.isConnected == false {
            //         OfflineBanner()
            //             .transition(.move(edge: .top).combined(with: .opacity))
            //             .animation(.easeInOut(duration: 0.3), value: NetworkMonitor.shared.isConnected)
            //     }
            // }
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

        case "redeem":
            // /redeem?code=GIFT-ABC123
            if let queryItems = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems,
               let codeParam = queryItems.first(where: { $0.name == "code" })?.value {
                appState.pendingGiftCode = codeParam
            }

        default:
            break
        }
    }
    
    // MARK: - Initialization
    
    private func initialize() async {
        // Crash reporting (Sentry). DSN comes from Info.plist (xcconfig-backed).
        // No-ops cleanly if the DSN isn't set (e.g. local dev).
        if let dsn = Bundle.main.object(forInfoDictionaryKey: "SENTRY_DSN") as? String, !dsn.isEmpty {
            SentrySDK.start { options in
                options.dsn = dsn
                options.tracesSampleRate = 0.2
                #if DEBUG
                options.environment = "debug"
                #else
                options.environment = "production"
                #endif
            }
        }

        // Analytics (PostHog), consent-gated. AnalyticsService.capture() already
        // guards on consent internally, but we only initialize after consent so
        // nothing is sent pre-consent.
        let analyticsConsent = UserDefaults.standard.bool(forKey: "consent_analytics")
        if analyticsConsent {
            let posthogKey = (Bundle.main.object(forInfoDictionaryKey: "POSTHOG_API_KEY") as? String) ?? ""
            AnalyticsService.shared.initialize(apiKey: posthogKey)
        }

        // 1. Initialize Supabase
        do {
            try await SupabaseManager.shared.initialize()
        } catch {
            // Supabase init failed — user will see error on login attempt
            // Fall through — let user reach login screen even if Supabase init fails
            // The login attempt will surface an appropriate error when they try to sign in
        }
        
        // 2. Check for existing session
        if let session = await appState.authService.restoreSession() {
            appState.currentUser = session.user
            appState.isAuthenticated = true
            appState.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
            
            // TODO: Identify user in analytics (consent-gated)
            // if analyticsConsent {
            //     AnalyticsService.shared.identify(session.user.id, properties: [:])
            // }
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

        // TODO: Load streak from Supabase (server-backed persistence)
        // if let userId = appState.currentUser?.id {
        //     await StreakManager.shared.loadFromSupabase(userId: userId)
        // }

        // TODO: Track session count & check review milestone
        // ReviewRequestManager.shared.incrementSession()
        // ReviewRequestManager.shared.requestIfSessionMilestone()
        
        // 6. Sync referral earned days → premium access
        if let userId = appState.currentUser?.id {
            if let stats = await ReferralService.shared.getOrCreateStats(userId: userId) {
                ReferralService.shared.redeemEarnedDays(for: stats)
            }
            
            // TODO: Grant streak freeze to premium or referral-premium users
            // if appState.subscriptionService.isPremium || ReferralService.shared.hasReferralPremium {
            //     StreakManager.shared.grantStreakFreeze()
            // }
        }
        
        // 7. Mark as initialized
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
            
            VStack(spacing: Theme.Spacing.lg) {
                // App icon or logo
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 80)) // Keep custom size for splash logo
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("ChooseGOD")
                    .font(Theme.Typography.display)
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
