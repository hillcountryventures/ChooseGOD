import SwiftUI

/// Main tab bar navigation for the app
struct MainTabView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedTab: Tab = .home
    @State private var showSettings = false
    @State private var showChatHub = false
    
    enum Tab: Int, CaseIterable {
        case home
        case devotionals
        case bible
        case journey
        case prayers
        
        var title: String {
            switch self {
            case .home: return "Home"
            case .devotionals: return "Devotionals"
            case .bible: return "Bible"
            case .journey: return "Journey"
            case .prayers: return "Prayers"
            }
        }
        
        var icon: String {
            switch self {
            case .home: return "house"
            case .devotionals: return "heart"
            case .bible: return "book"
            case .journey: return "chart.line.uptrend.xyaxis"
            case .prayers: return "hands.sparkles"
            }
        }
        
        var selectedIcon: String {
            switch self {
            case .home: return "house.fill"
            case .devotionals: return "heart.fill"
            case .bible: return "book.fill"
            case .journey: return "chart.line.uptrend.xyaxis"
            case .prayers: return "hands.sparkles.fill"
            }
        }
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Tab Content
            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(Tab.home)
                
                DevotionalHubPlaceholder()
                    .tag(Tab.devotionals)
                
                BibleViewPlaceholder()
                    .tag(Tab.bible)
                
                JourneyViewPlaceholder()
                    .tag(Tab.journey)
                
                PrayersViewPlaceholder()
                    .tag(Tab.prayers)
            }
            .environment(appState)
            
            // Custom Tab Bar
            CustomTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
        .sheet(isPresented: $showSettings) {
            SettingsViewPlaceholder()
                .environment(appState)
        }
        .sheet(isPresented: $showChatHub) {
            ChatHubPlaceholder()
                .environment(appState)
        }
    }
}

// MARK: - Custom Tab Bar

struct CustomTabBar: View {
    @Binding var selectedTab: MainTabView.Tab
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(MainTabView.Tab.allCases, id: \.self) { tab in
                if tab == .bible {
                    // Center Bible button (elevated)
                    centerBibleButton(tab: tab)
                } else {
                    tabButton(tab: tab)
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.top, Theme.Spacing.sm)
        .padding(.bottom, Theme.Spacing.xl)
        .background(
            Theme.Colors.surface
                .ignoresSafeArea(edges: .bottom)
        )
        .overlay(
            Rectangle()
                .fill(Theme.Colors.textTertiary.opacity(0.2))
                .frame(height: 0.5),
            alignment: .top
        )
    }
    
    private func tabButton(tab: MainTabView.Tab) -> some View {
        Button {
            withAnimation(Theme.Animation.fast) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: Theme.Spacing.xxs) {
                Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                    .font(.system(size: Theme.Dimensions.iconSM))
                    .symbolRenderingMode(.hierarchical)
                
                Text(tab.title)
                    .font(Theme.Typography.caption)
            }
            .foregroundStyle(selectedTab == tab ? Theme.Colors.primary : Theme.Colors.textTertiary)
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
    
    private func centerBibleButton(tab: MainTabView.Tab) -> some View {
        Button {
            withAnimation(Theme.Animation.spring) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: Theme.Spacing.xxs) {
                ZStack {
                    Circle()
                        .fill(Theme.Colors.primary)
                        .frame(width: 52, height: 52)
                        .shadow(color: Theme.Colors.primary.opacity(0.4), radius: 8, y: 4)
                    
                    Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                        .font(.system(size: Theme.Dimensions.iconMD, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .offset(y: -12)
                
                Text(tab.title)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(selectedTab == tab ? Theme.Colors.primary : Theme.Colors.textTertiary)
                    .offset(y: -12)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Placeholder Views (to be implemented)

struct HomeView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: Theme.Spacing.lg) {
                        // Greeting
                        HStack {
                            VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                                Text(greeting)
                                    .font(Theme.Typography.bodySmall)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                                
                                Text(appState.currentUser?.firstName ?? "Friend")
                                    .font(Theme.Typography.title2)
                                    .foregroundStyle(Theme.Colors.text)
                            }
                            
                            Spacer()
                            
                            Button {
                                // Open settings
                            } label: {
                                Image(systemName: "gearshape.fill")
                                    .font(.system(size: Theme.Dimensions.iconMD))
                                    .foregroundStyle(Theme.Colors.textSecondary)
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.top, Theme.Spacing.md)
                        
                        // Daily Verse Card (placeholder)
                        DailyVerseCardPlaceholder()
                        
                        // Quick Actions
                        QuickActionsSection()
                        
                        Spacer(minLength: 100)
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }
    
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return "Good morning,"
        case 12..<17: return "Good afternoon,"
        default: return "Good evening,"
        }
    }
}

struct DailyVerseCardPlaceholder: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Verse of the Day")
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            Text("\"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.\"")
                .font(Theme.Typography.scripture)
                .foregroundStyle(Theme.Colors.text)
            
            Text("— John 3:16 KJV")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.primary)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .cornerRadius(Theme.CornerRadius.xl)
        .padding(.horizontal, Theme.Spacing.lg)
    }
}

struct QuickActionsSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Quick Actions")
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.horizontal, Theme.Spacing.lg)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Theme.Spacing.md) {
                    QuickActionButton(icon: "book.fill", title: "Read", color: Theme.Colors.primary)
                    QuickActionButton(icon: "bubble.left.fill", title: "Ask", color: Theme.Colors.accent)
                    QuickActionButton(icon: "hands.sparkles.fill", title: "Pray", color: Theme.Colors.prayer)
                    QuickActionButton(icon: "pencil.line", title: "Journal", color: Theme.Colors.success)
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let title: String
    let color: Color
    
    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: Theme.Dimensions.iconLG))
                .foregroundStyle(color)
            
            Text(title)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .frame(width: 80, height: 80)
        .background(color.opacity(0.15))
        .cornerRadius(Theme.CornerRadius.lg)
    }
}

// Additional placeholder views
struct DevotionalHubPlaceholder: View {
    var body: some View {
        PlaceholderScreen(title: "Devotionals", icon: "heart.fill")
    }
}

struct BibleViewPlaceholder: View {
    var body: some View {
        PlaceholderScreen(title: "Bible", icon: "book.fill")
    }
}

struct JourneyViewPlaceholder: View {
    var body: some View {
        PlaceholderScreen(title: "Journey", icon: "chart.line.uptrend.xyaxis")
    }
}

struct PrayersViewPlaceholder: View {
    var body: some View {
        PlaceholderScreen(title: "Prayers", icon: "hands.sparkles.fill")
    }
}

struct SettingsViewPlaceholder: View {
    var body: some View {
        PlaceholderScreen(title: "Settings", icon: "gearshape.fill")
    }
}

struct ChatHubPlaceholder: View {
    var body: some View {
        PlaceholderScreen(title: "Ask the Bible", icon: "bubble.left.fill")
    }
}

struct PlaceholderScreen: View {
    let title: String
    let icon: String
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            VStack(spacing: Theme.Spacing.lg) {
                Image(systemName: icon)
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primary)
                
                Text(title)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Coming soon...")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
    }
}

// MARK: - Onboarding Coordinator Placeholder

struct OnboardingCoordinatorView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            VStack(spacing: Theme.Spacing.xl) {
                Spacer()
                
                Image(systemName: "sparkles")
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("Welcome to ChooseGOD")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Your spiritual journey begins here")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                Spacer()
                
                Button {
                    appState.completeOnboarding()
                } label: {
                    Text("Get Started")
                        .font(Theme.Typography.button)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: Theme.Dimensions.buttonHeight)
                        .background(Theme.Colors.primary)
                        .cornerRadius(Theme.CornerRadius.lg)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.xxl)
            }
        }
    }
}

#Preview {
    MainTabView()
        .environment(AppState.preview)
}
