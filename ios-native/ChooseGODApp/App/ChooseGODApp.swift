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
    
    // MARK: - Deep Links
    
    private func handleDeepLink(_ url: URL) {
        // Handle choosegod://invite/{code} or https://choosegod.app/invite/{code}
        let pathComponents = url.pathComponents
        if let inviteIndex = pathComponents.firstIndex(of: "invite"),
           inviteIndex + 1 < pathComponents.count {
            let code = pathComponents[inviteIndex + 1]
            UserDefaults.standard.set(code.uppercased(), forKey: "pendingReferralCode")
        }
    }
    
    // MARK: - Initialization
    
    private func initialize() async {
        // TODO: Add Sentry iOS SDK
        // SentrySDK.start { options in
        //     options.dsn = Bundle.main.infoDictionary?["SENTRY_DSN"] as? String
        //     options.tracesSampleRate = 0.2
        // }

        // 1. Initialize Supabase
        await SupabaseManager.shared.initialize()
        
        // 2. Check for existing session
        if let session = await appState.authService.restoreSession() {
            appState.currentUser = session.user
            appState.isAuthenticated = true
            appState.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
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
                
                ProgressView()
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
