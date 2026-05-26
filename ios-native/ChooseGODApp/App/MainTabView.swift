import SwiftUI

/// Main tab bar navigation for the app
struct MainTabView: View {
    @Environment(AppState.self) private var appState
    @State private var showChat = false
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Tab Content
            TabView(selection: Bindable(appState).selectedTab) {
                HomeView()
                    .tag(Tab.home)

                DiscoverView()
                    .tag(Tab.discover)

                BibleReaderView()
                    .tag(Tab.bible)

                JourneyView()
                    .tag(Tab.journey)

                PrayersView()
                    .tag(Tab.prayers)
            }
            .environment(appState)
            .onChange(of: appState.selectedTab) { _, _ in
                HapticManager.shared.selectionChanged()
            }
            
            // Frosted Glass Tab Bar
            GlassTabBar(selectedTab: Bindable(appState).selectedTab)
            
            // Floating Glass Chat Button
            VStack {
                Spacer()
                
                HStack {
                    Spacer()
                    
                    GlassFAB(icon: "bubble.left.fill", color: Theme.Colors.accent) {
                        showChat = true
                    }
                    .accessibilityLabel("Open AI chat companion")
                    .accessibilityHint("Double tap to start a conversation")
                    .padding(.trailing, 20)
                    .padding(.bottom, 110)
                }
            }
        }
        .ignoresSafeArea(.keyboard)
        .sheet(isPresented: $showChat) {
            ChatView()
                .environment(appState)
                .presentationBackground(Material.ultraThinMaterial)
                .presentationCornerRadius(32)
        }
        .sheet(isPresented: Binding(
            get: { appState.pendingGiftCode != nil },
            set: { if !$0 { appState.pendingGiftCode = nil } }
        )) {
            if let code = appState.pendingGiftCode {
                GiftRedemptionView(code: code)
                    .environment(appState)
                    .presentationBackground(Material.ultraThinMaterial)
                    .presentationCornerRadius(32)
            }
        }
    }
}

// MARK: - Glass Tab Bar

struct GlassTabBar: View {
    @Binding var selectedTab: Tab
    @Namespace private var animation
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(Tab.allCases, id: \.self) { tab in
                if tab == .bible {
                    // Center Bible button (elevated glass orb)
                    glassBibleButton(tab: tab)
                } else {
                    glassTabButton(tab: tab)
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.sm)
        .padding(.top, Theme.Spacing.mds)
        .padding(.bottom, 28)
        .background {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()
        }
        .overlay(alignment: .top) {
            // Top highlight line
            LinearGradient(
                colors: [.white.opacity(0.2), .white.opacity(0.05), .clear],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(height: 1)
        }
    }
    
    private func glassTabButton(tab: Tab) -> some View {
        Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    if selectedTab == tab {
                        Circle()
                            .fill(Theme.Colors.primary.opacity(0.2))
                            .frame(width: 44, height: 44)
                            .matchedGeometryEffect(id: "tabBg", in: animation)
                    }
                    
                    Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                        .font(selectedTab == tab ? Theme.Typography.title3 : Theme.Typography.body)
                        .foregroundStyle(selectedTab == tab ? Theme.Colors.primary : Theme.Colors.textTertiary)
                }
                .frame(height: 44)
                
                Text(tab.title)
                    .font(selectedTab == tab ? Theme.Typography.captionSemibold : Theme.Typography.caption2)
                    .foregroundStyle(selectedTab == tab ? Theme.Colors.primary : Theme.Colors.textTertiary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(AccessibilityLabels.tab(tab.title, selected: selectedTab == tab))
        .accessibilityHint("Double tap to switch to \(tab.title) tab")
    }
    
    private func glassBibleButton(tab: Tab) -> some View {
        Button {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    // Outer glow
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.4))
                        .frame(width: 64, height: 64)
                        .blur(radius: selectedTab == tab ? 12 : 8)
                    
                    // Glass orb
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: 56, height: 56)
                    
                    // Gradient overlay
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 56, height: 56)
                        .opacity(selectedTab == tab ? 1 : 0.7)
                    
                    // Inner highlight
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [.white.opacity(0.5), .white.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1.5
                        )
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                        .font(Theme.Typography.title2)
                        .foregroundStyle(.white)
                }
                .offset(y: -16)
                .shadow(color: Theme.Colors.primary.opacity(0.5), radius: 12, y: 6)
                
                Text(tab.title)
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(selectedTab == tab ? Theme.Colors.primary : Theme.Colors.textTertiary)
                    .offset(y: -12)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(AccessibilityLabels.tab(tab.title, selected: selectedTab == tab))
        .accessibilityHint("Double tap to open Bible reader")
    }
}

#Preview {
    MainTabView()
        .environment(AppState.preview)
}
