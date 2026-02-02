import SwiftUI

/// App Icon design preview - use this as reference for actual asset creation
struct AppIconPreview: View {
    var body: some View {
        VStack(spacing: 40) {
            Text("ChooseGOD App Icon Concepts")
                .font(Theme.Typography.title2)
            
            HStack(spacing: 30) {
                // Concept 1: Cross + Book with Glass
                AppIconConcept1()
                    .frame(width: 120, height: 120)
                
                // Concept 2: Radiant Cross
                AppIconConcept2()
                    .frame(width: 120, height: 120)
                
                // Concept 3: Minimal Scripture
                AppIconConcept3()
                    .frame(width: 120, height: 120)
            }
            
            HStack(spacing: 30) {
                // Concept 4: Glowing Dove
                AppIconConcept4()
                    .frame(width: 120, height: 120)
                
                // Concept 5: Crown + Cross (ChooseGOD theme)
                AppIconConcept5()
                    .frame(width: 120, height: 120)
                
                // Concept 6: Abstract Faith
                AppIconConcept6()
                    .frame(width: 120, height: 120)
            }
            
            Text("Recommended: Concept 5 (Crown)")
                .font(Theme.Typography.caption)
                .foregroundStyle(.secondary)
        }
        .padding(Theme.Spacing.xxl)
        .background(Color.black)
    }
}

// MARK: - Concept 1: Cross + Open Book

struct AppIconConcept1: View {
    var body: some View {
        ZStack {
            // Background gradient
            RoundedRectangle(cornerRadius: 26)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "8B5CF6"), Color(hex: "6D28D9")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Glass overlay
            RoundedRectangle(cornerRadius: 26)
                .fill(.ultraThinMaterial.opacity(0.3))
            
            // Book icon
            VStack(spacing: -4) {
                Image(systemName: "book.fill")
                    .font(Theme.Typography.iconLarge)
                    .foregroundStyle(.white)
                
                // Small cross
                Image(systemName: "cross.fill")
                    .font(Theme.Typography.body)
                    .foregroundStyle(.white.opacity(0.9))
            }
            
            // Subtle glow
            Circle()
                .fill(.white.opacity(0.15))
                .frame(width: 60, height: 60)
                .blur(radius: 20)
                .offset(x: -15, y: -15)
        }
        .clipShape(RoundedRectangle(cornerRadius: 26))
    }
}

// MARK: - Concept 2: Radiant Cross

struct AppIconConcept2: View {
    var body: some View {
        ZStack {
            // Dark background
            RoundedRectangle(cornerRadius: 26)
                .fill(Color(hex: "1a1a2e"))
            
            // Radial glow
            RadialGradient(
                colors: [Color(hex: "8B5CF6").opacity(0.6), .clear],
                center: .center,
                startRadius: 5,
                endRadius: 60
            )
            
            // Cross with glow
            Image(systemName: "cross.fill")
                .font(Theme.Typography.display)
                .foregroundStyle(
                    LinearGradient(
                        colors: [.white, Color(hex: "A78BFA")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .shadow(color: Color(hex: "8B5CF6"), radius: 15)
        }
        .clipShape(RoundedRectangle(cornerRadius: 26))
    }
}

// MARK: - Concept 3: Minimal Scripture

struct AppIconConcept3: View {
    var body: some View {
        ZStack {
            // Gradient background
            RoundedRectangle(cornerRadius: 26)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "6366F1"), Color(hex: "4F46E5")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            
            // Stylized "G" with cross
            ZStack {
                Text("G")
                    .font(Theme.Typography.displayRounded)
                    .foregroundStyle(.white)
                
                // Small cross accent
                Image(systemName: "cross.fill")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(.white)
                    .offset(x: 18, y: -18)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 26))
    }
}

// MARK: - Concept 4: Glowing Dove

struct AppIconConcept4: View {
    var body: some View {
        ZStack {
            // Deep purple background
            RoundedRectangle(cornerRadius: 26)
                .fill(Color(hex: "1e1b4b"))
            
            // Glow effect
            Circle()
                .fill(Color(hex: "8B5CF6").opacity(0.4))
                .frame(width: 70, height: 70)
                .blur(radius: 20)
            
            // Dove/Spirit symbol
            Image(systemName: "bird.fill")
                .font(Theme.Typography.iconLarge)
                .foregroundStyle(.white)
                .rotationEffect(.degrees(-15))
            
            // Light rays
            ForEach(0..<6, id: \.self) { i in
                Rectangle()
                    .fill(.white.opacity(0.3))
                    .frame(width: 2, height: 15)
                    .offset(y: -45)
                    .rotationEffect(.degrees(Double(i) * 60))
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 26))
    }
}

// MARK: - Concept 5: Crown + Cross (RECOMMENDED)

struct AppIconConcept5: View {
    var body: some View {
        ZStack {
            // Rich gradient background
            RoundedRectangle(cornerRadius: 26)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(hex: "7C3AED"),
                            Color(hex: "5B21B6"),
                            Color(hex: "4C1D95")
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Glass shimmer
            RoundedRectangle(cornerRadius: 26)
                .fill(
                    LinearGradient(
                        colors: [.white.opacity(0.2), .clear, .white.opacity(0.05)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Crown with cross integrated
            VStack(spacing: -8) {
                // Crown
                Image(systemName: "crown.fill")
                    .font(Theme.Typography.chapterTitle)
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "FCD34D"), Color(hex: "F59E0B")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .shadow(color: Color(hex: "F59E0B").opacity(0.5), radius: 8)
                
                // Cross beneath crown
                Image(systemName: "cross.fill")
                    .font(Theme.Typography.display)
                    .foregroundStyle(.white)
                    .shadow(color: .white.opacity(0.3), radius: 5)
            }
            
            // Corner accent
            Circle()
                .fill(.white.opacity(0.1))
                .frame(width: 40, height: 40)
                .blur(radius: 15)
                .offset(x: -30, y: -30)
        }
        .clipShape(RoundedRectangle(cornerRadius: 26))
        .overlay(
            RoundedRectangle(cornerRadius: 26)
                .stroke(.white.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Concept 6: Abstract Faith Spark

struct AppIconConcept6: View {
    var body: some View {
        ZStack {
            // Dark gradient
            RoundedRectangle(cornerRadius: 26)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "1f1f3a"), Color(hex: "0f0f1a")],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            
            // Sparkle burst
            Image(systemName: "sparkles")
                .font(Theme.Typography.display)
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color(hex: "A78BFA"), Color(hex: "8B5CF6"), Color(hex: "6D28D9")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .shadow(color: Color(hex: "8B5CF6"), radius: 10)
            
            // Subtle cross in center
            Image(systemName: "plus")
                .font(Theme.Typography.title3)
                .foregroundStyle(.white.opacity(0.8))
        }
        .clipShape(RoundedRectangle(cornerRadius: 26))
    }
}

// MARK: - Preview

#Preview("App Icon Concepts") {
    AppIconPreview()
}

#Preview("Recommended Icon - Large") {
    AppIconConcept5()
        .frame(width: 200, height: 200)
        .padding(50) // Keep custom large padding for preview
        .background(Color.black)
}
