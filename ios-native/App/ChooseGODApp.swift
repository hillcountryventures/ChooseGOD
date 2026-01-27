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
            .preferredColorScheme(.dark) // Default to dark mode
        }
    }
    
    // MARK: - Initialization
    
    private func initialize() async {
        // 1. Initialize Supabase
        await SupabaseManager.shared.initialize()
        
        // 2. Check for existing session
        if let session = await appState.authService.restoreSession() {
            appState.currentUser = session.user
            appState.isAuthenticated = true
            appState.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
        }
        
        // 3. Initialize RevenueCat
        await appState.subscriptionService.configure(userId: appState.currentUser?.id)
        
        // 4. Mark as initialized
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
