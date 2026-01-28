import SwiftUI

/// Main home screen with daily verse and quick actions
struct HomeView: View {
    @Environment(AppState.self) private var appState
    @State private var dailyVerse: Verse?
    @State private var isLoading = true
    @State private var streak = 7
    @State private var showChat = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Animated gradient background
                backgroundGradient
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Greeting with glass pill
                        greetingSection
                        
                        // Daily Verse Card (Glass)
                        dailyVerseCard
                        
                        // Quick Actions with glass
                        quickActionsSection
                        
                        // Stats row
                        statsSection
                        
                        Spacer(minLength: 100)
                    }
                    .padding()
                }
            }
            .navigationBarHidden(true)
            .task {
                await loadDailyVerse()
            }
        }
    }
    
    // MARK: - Background
    
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(hex: "0f0f1a"),
                Color(hex: "1a1a2e"),
                Color(hex: "0f0f1a")
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
    
    // MARK: - Subviews
    
    private var greetingSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(greeting)
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                
                Text(appState.currentUser?.displayName ?? "Friend")
                    .font(.title2.bold())
                    .foregroundStyle(Theme.Colors.text)
            }
            
            Spacer()
            
            // Streak badge with glass
            HStack(spacing: 6) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("\(streak)")
                    .font(.headline.bold())
                    .foregroundStyle(Theme.Colors.text)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background {
                Capsule()
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                Capsule()
                    .stroke(.white.opacity(0.1), lineWidth: 1)
            }
        }
        .padding(.top, 60)
    }
    
    private var dailyVerseCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "sun.max.fill")
                        .foregroundStyle(.yellow)
                    Text("Verse of the Day")
                        .font(.subheadline.weight(.medium))
                }
                .foregroundStyle(.white.opacity(0.9))
                
                Spacer()
                
                if let verse = dailyVerse {
                    Text(verse.reference)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(.white.opacity(0.2)))
                }
            }
            
            if isLoading {
                ProgressView()
                    .tint(.white)
                    .frame(maxWidth: .infinity, minHeight: 80)
            } else if let verse = dailyVerse {
                Text(verse.text)
                    .font(.system(.title3, design: .serif))
                    .foregroundStyle(.white)
                    .lineSpacing(6)
                
                // Actions
                HStack(spacing: 16) {
                    GlassIconButton(icon: "square.and.arrow.up", action: shareVerse)
                    GlassIconButton(icon: "bookmark", action: bookmarkVerse)
                    GlassIconButton(icon: "bubble.left", action: { showChat = true })
                    Spacer()
                }
            }
        }
        .padding(24)
        .background {
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay {
                    RoundedRectangle(cornerRadius: 24)
                        .fill(.ultraThinMaterial.opacity(0.2))
                }
        }
        .overlay {
            RoundedRectangle(cornerRadius: 24)
                .stroke(
                    LinearGradient(
                        colors: [.white.opacity(0.3), .white.opacity(0.05)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        }
        .shadow(color: Theme.Colors.primary.opacity(0.3), radius: 20, y: 10)
    }
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Continue Your Journey")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                GlassQuickAction(icon: "book.fill", title: "Read Bible", color: .blue) {}
                GlassQuickAction(icon: "bubble.left.fill", title: "Ask AI", color: Theme.Colors.accent) { showChat = true }
                GlassQuickAction(icon: "hands.sparkles.fill", title: "Pray", color: Theme.Colors.prayer) {}
                GlassQuickAction(icon: "sun.max.fill", title: "Devotional", color: .orange) {}
            }
        }
    }
    
    private var statsSection: some View {
        HStack(spacing: 12) {
            GlassStatCard(value: "\(streak)", label: "Day Streak", icon: "flame.fill", color: .orange)
            GlassStatCard(value: "12", label: "Chapters", icon: "book.fill", color: .blue)
            GlassStatCard(value: "45", label: "Saved", icon: "bookmark.fill", color: .purple)
        }
    }
    
    // MARK: - Helpers
    
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return "Good morning,"
        case 12..<17: return "Good afternoon,"
        default: return "Good evening,"
        }
    }
    
    private func loadDailyVerse() async {
        do {
            let service = SupabaseBibleService()
            dailyVerse = try await service.getDailyVerse()
        } catch {
            dailyVerse = Verse(
                id: "john-3-16",
                book: "John",
                chapter: 3,
                verse: 16,
                text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
                translation: "KJV"
            )
        }
        isLoading = false
    }
    
    private func shareVerse() {
        // Share sheet
    }
    
    private func bookmarkVerse() {
        // Bookmark
    }
}

// MARK: - Glass Quick Action

struct GlassQuickAction: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                ZStack {
                    // Glow
                    Circle()
                        .fill(color.opacity(0.3))
                        .frame(width: 50, height: 50)
                        .blur(radius: 10)
                    
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(color)
                }
                
                Text(title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.Colors.text)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background {
                RoundedRectangle(cornerRadius: 16)
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(.white.opacity(0.1), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
        .scaleEffect(isPressed ? 0.95 : 1)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
    }
}

#Preview {
    HomeView()
        .environment(AppState.preview)
}
