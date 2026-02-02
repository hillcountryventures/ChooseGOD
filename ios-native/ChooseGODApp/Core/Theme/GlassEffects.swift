import SwiftUI

// MARK: - Glass Card Modifier

struct GlassCard: ViewModifier {
    var cornerRadius: CGFloat = 20
    var opacity: Double = 0.7
    
    func body(content: Content) -> some View {
        content
            .background {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .opacity(opacity)
            }
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.3), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
            .shadow(color: .black.opacity(0.15), radius: 20, x: 0, y: 10)
    }
}

// MARK: - Glass Button Style

struct GlassButtonStyle: ButtonStyle {
    var isProminent: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, Theme.Spacing.mdl)
            .padding(.vertical, Theme.Spacing.mds)
            .background {
                if isProminent {
                    Capsule()
                        .fill(Theme.Colors.primary.opacity(0.8))
                        .background(.ultraThinMaterial, in: Capsule())
                } else {
                    Capsule()
                        .fill(.ultraThinMaterial)
                }
            }
            .overlay {
                Capsule()
                    .stroke(.white.opacity(0.2), lineWidth: 1)
            }
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Frosted Tab Bar

struct FrostedTabBar<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.top, Theme.Spacing.mds)
            .padding(.bottom, Theme.Spacing.xl)
            .background {
                Rectangle()
                    .fill(.ultraThinMaterial)
                    .ignoresSafeArea()
            }
            .overlay(alignment: .top) {
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [.white.opacity(0.15), .clear],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(height: 1)
            }
    }
}

// MARK: - Glass Navigation Bar

struct GlassNavigationBar: ViewModifier {
    func body(content: Content) -> some View {
        content
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
    }
}

// MARK: - Animated Glass Sheet

struct GlassSheet<SheetContent: View>: ViewModifier {
    @Binding var isPresented: Bool
    let sheetContent: () -> SheetContent
    
    func body(content: Content) -> some View {
        content
            .sheet(isPresented: $isPresented) {
                sheetContent()
                    .presentationBackground(.ultraThinMaterial)
                    .presentationCornerRadius(32)
            }
    }
}

// MARK: - Floating Glass FAB

struct GlassFAB: View {
    let icon: String
    let color: Color
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            ZStack {
                // Outer glow
                Circle()
                    .fill(color.opacity(0.3))
                    .frame(width: 70, height: 70)
                    .blur(radius: 10)
                
                // Glass background
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 60, height: 60)
                
                // Color overlay
                Circle()
                    .fill(color.opacity(0.6))
                    .frame(width: 60, height: 60)
                
                // Border highlight
                Circle()
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.5), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.5
                    )
                    .frame(width: 60, height: 60)
                
                // Icon
                Image(systemName: icon)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(.white)
            }
        }
        .scaleEffect(isPressed ? 0.9 : 1)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .shadow(color: color.opacity(0.4), radius: 15, y: 8)
    }
}

// MARK: - Glass Verse Card

struct GlassVerseCard: View {
    let reference: String
    let text: String
    var gradient: LinearGradient = LinearGradient(colors: [Theme.Colors.primary, Theme.Colors.primaryDark], startPoint: .topLeading, endPoint: .bottomTrailing)
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Reference with glass pill
            Text(reference)
                .font(Theme.Typography.subheadlineSemibold)
                .foregroundStyle(.white)
                .padding(.horizontal, Theme.Spacing.mds)
                .padding(.vertical, Theme.Spacing.sm)
                .background {
                    Capsule()
                        .fill(.white.opacity(0.2))
                        .background(.ultraThinMaterial, in: Capsule())
                }
            
            // Verse text
            Text(text)
                .font(Theme.Typography.subheadlineSerif)
                .foregroundStyle(.white)
                .lineSpacing(6)
            
            // Actions row
            HStack(spacing: 16) {
                GlassIconButton(icon: "square.and.arrow.up", action: {})
                GlassIconButton(icon: "bookmark", action: {})
                GlassIconButton(icon: "highlighter", action: {})
                Spacer()
            }
        }
        .padding(Theme.Spacing.lg)
        .background {
            RoundedRectangle(cornerRadius: 24)
                .fill(gradient)
                .overlay {
                    RoundedRectangle(cornerRadius: 24)
                        .fill(.ultraThinMaterial.opacity(0.3))
                }
        }
        .overlay {
            RoundedRectangle(cornerRadius: 24)
                .stroke(
                    LinearGradient(
                        colors: [.white.opacity(0.4), .white.opacity(0.1)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        }
        .shadow(color: .black.opacity(0.2), radius: 20, y: 10)
    }
}

// MARK: - Glass Icon Button

struct GlassIconButton: View {
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(Theme.Typography.label)
                .foregroundStyle(.white.opacity(0.9))
                .frame(width: 40, height: 40)
                .background {
                    Circle()
                        .fill(.white.opacity(0.15))
                        .background(.ultraThinMaterial.opacity(0.5), in: Circle())
                }
        }
    }
}

// MARK: - Glass Stat Card

struct GlassStatCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            // Icon with glow
            ZStack {
                Circle()
                    .fill(color.opacity(0.3))
                    .frame(width: 50, height: 50)
                    .blur(radius: 8)
                
                Image(systemName: icon)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(color)
            }
            
            Text(value)
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.mdl)
        .glassCard(cornerRadius: 16)
    }
}

// MARK: - View Extensions

extension View {
    func glassCard(cornerRadius: CGFloat = 20, opacity: Double = 0.7) -> some View {
        modifier(GlassCard(cornerRadius: cornerRadius, opacity: opacity))
    }
    
    func glassNavigationBar() -> some View {
        modifier(GlassNavigationBar())
    }
    
    func glassSheet<Content: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Content) -> some View {
        modifier(GlassSheet(isPresented: isPresented, sheetContent: content))
    }
}

// MARK: - Preview

#Preview("Glass Components") {
    ZStack {
        // Gradient background
        LinearGradient(
            colors: [Color(hex: "1a1a2e"), Color(hex: "16213e")],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
        
        ScrollView {
            VStack(spacing: 24) {
                GlassVerseCard(
                    reference: "John 3:16",
                    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
                )
                
                HStack(spacing: 12) {
                    GlassStatCard(value: "7", label: "Day Streak", icon: "flame.fill", color: .orange)
                    GlassStatCard(value: "23", label: "Chapters", icon: "book.fill", color: .blue)
                }
                
                Button("Glass Button") {}
                    .buttonStyle(GlassButtonStyle(isProminent: true))
                
                Button("Secondary") {}
                    .buttonStyle(GlassButtonStyle())
            }
            .padding()
        }
    }
}
