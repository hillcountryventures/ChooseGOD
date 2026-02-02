import SwiftUI

// MARK: - Card Template

enum ShareCardTemplate: String, CaseIterable, Identifiable {
    case dark, light, nature, sunset, minimal, royal
    
    var id: String { rawValue }
    
    var displayName: String {
        rawValue.capitalized
    }
    
    var icon: String {
        switch self {
        case .dark:    return "moon.stars.fill"
        case .light:   return "sun.max.fill"
        case .nature:  return "leaf.fill"
        case .sunset:  return "sunset.fill"
        case .minimal: return "square"
        case .royal:   return "crown.fill"
        }
    }
}

// MARK: - Card Size

enum ShareCardSize: String, CaseIterable, Identifiable {
    case square    // 1080x1080
    case story     // 1080x1920
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .square: return "Square"
        case .story:  return "Story"
        }
    }
    
    var size: CGSize {
        switch self {
        case .square: return CGSize(width: 1080, height: 1080)
        case .story:  return CGSize(width: 1080, height: 1920)
        }
    }
    
    var aspectRatio: CGFloat {
        size.width / size.height
    }
}

// MARK: - Share Card View

struct VerseShareCardView: View {
    let verseText: String
    let reference: String
    let template: ShareCardTemplate
    let cardSize: ShareCardSize
    
    var body: some View {
        ZStack {
            background
            
            VStack(spacing: 0) {
                Spacer()
                
                // Decorative top element
                topDecoration
                    .padding(.bottom, cardSize == .story ? 40 : 24)
                
                // Verse text
                Text("\u{201C}\(verseText)\u{201D}")
                    .font(.system(size: fontSize, weight: .regular, design: fontDesign))
                    .foregroundStyle(textColor)
                    .multilineTextAlignment(.center)
                    .lineSpacing(8)
                    .padding(.horizontal, 60)
                
                // Reference
                Text(reference)
                    .font(.system(size: 18, weight: .semibold, design: .serif))
                    .foregroundStyle(referenceColor)
                    .padding(.top, Theme.Spacing.lg)
                
                Spacer()
                
                // Watermark
                HStack(spacing: 6) {
                    Image(systemName: "cross.fill")
                        .font(.system(size: 10))
                    Text("ChooseGOD")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                }
                .foregroundStyle(watermarkColor)
                .padding(.bottom, cardSize == .story ? 60 : 40)
            }
        }
        .frame(width: cardSize.size.width, height: cardSize.size.height)
    }
    
    // MARK: - Computed Properties
    
    private var fontSize: CGFloat {
        let len = verseText.count
        if len > 300 { return 24 }
        if len > 200 { return 28 }
        if len > 100 { return 32 }
        return 36
    }
    
    private var fontDesign: Font.Design {
        template == .minimal ? .default : .serif
    }
    
    @ViewBuilder
    private var background: some View {
        switch template {
        case .dark:
            LinearGradient(
                colors: [Color(red: 0.05, green: 0.07, blue: 0.18), Color(red: 0.08, green: 0.10, blue: 0.28)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .light:
            LinearGradient(
                colors: [Color(red: 0.98, green: 0.96, blue: 0.90), Color(red: 0.95, green: 0.92, blue: 0.85)],
                startPoint: .top, endPoint: .bottom
            )
        case .nature:
            LinearGradient(
                colors: [Color(red: 0.10, green: 0.30, blue: 0.18), Color(red: 0.15, green: 0.42, blue: 0.25), Color(red: 0.08, green: 0.25, blue: 0.14)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .sunset:
            LinearGradient(
                colors: [Color(red: 0.95, green: 0.55, blue: 0.35), Color(red: 0.90, green: 0.35, blue: 0.45), Color(red: 0.65, green: 0.20, blue: 0.50)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        case .minimal:
            Color.white
        case .royal:
            LinearGradient(
                colors: [Color(red: 0.25, green: 0.10, blue: 0.40), Color(red: 0.35, green: 0.15, blue: 0.55), Color(red: 0.20, green: 0.08, blue: 0.35)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        }
    }
    
    @ViewBuilder
    private var topDecoration: some View {
        switch template {
        case .dark:
            Image(systemName: "sparkles")
                .font(.system(size: 28))
                .foregroundStyle(Color(red: 0.6, green: 0.7, blue: 1.0).opacity(0.6))
        case .light:
            Rectangle()
                .fill(Color(red: 0.70, green: 0.60, blue: 0.45).opacity(0.3))
                .frame(width: 60, height: 2)
        case .nature:
            Image(systemName: "leaf.fill")
                .font(.system(size: 24))
                .foregroundStyle(Color.green.opacity(0.5))
        case .sunset:
            Image(systemName: "sun.max.fill")
                .font(.system(size: 28))
                .foregroundStyle(Color.yellow.opacity(0.6))
        case .minimal:
            Rectangle()
                .fill(Color.black.opacity(0.15))
                .frame(width: 40, height: 2)
        case .royal:
            Image(systemName: "crown.fill")
                .font(.system(size: 28))
                .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.7))
        }
    }
    
    private var textColor: Color {
        switch template {
        case .dark:    return .white
        case .light:   return Color(red: 0.20, green: 0.18, blue: 0.15)
        case .nature:  return .white
        case .sunset:  return .white
        case .minimal: return .black
        case .royal:   return .white
        }
    }
    
    private var referenceColor: Color {
        switch template {
        case .dark:    return Color(red: 0.6, green: 0.7, blue: 1.0)
        case .light:   return Color(red: 0.55, green: 0.45, blue: 0.30)
        case .nature:  return Color(red: 0.60, green: 0.85, blue: 0.65)
        case .sunset:  return Color(red: 1.0, green: 0.85, blue: 0.70)
        case .minimal: return .gray
        case .royal:   return Color(red: 0.85, green: 0.70, blue: 0.30)
        }
    }
    
    private var watermarkColor: Color {
        switch template {
        case .dark:    return .white.opacity(0.25)
        case .light:   return Color(red: 0.55, green: 0.45, blue: 0.30).opacity(0.3)
        case .nature:  return .white.opacity(0.25)
        case .sunset:  return .white.opacity(0.30)
        case .minimal: return .black.opacity(0.15)
        case .royal:   return Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.3)
        }
    }
}

#Preview {
    VerseShareCardView(
        verseText: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        reference: "John 3:16 KJV",
        template: .dark,
        cardSize: .square
    )
    .scaleEffect(0.3)
}
