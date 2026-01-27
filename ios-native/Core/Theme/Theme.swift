import SwiftUI

/// Central theme definition for ChooseGOD
/// Mirrors the React Native theme for consistency
enum Theme {
    
    // MARK: - Colors
    
    enum Colors {
        // Primary palette
        static let primary = Color(hex: "8B5CF6")        // Purple
        static let primaryLight = Color(hex: "A78BFA")
        static let primaryDark = Color(hex: "7C3AED")
        
        // Accent
        static let accent = Color(hex: "F59E0B")         // Amber
        static let accentLight = Color(hex: "FBBF24")
        
        // Background
        static let background = Color(hex: "0F0F0F")     // Near black
        static let surface = Color(hex: "1A1A1A")        // Elevated surface
        static let surfaceElevated = Color(hex: "262626")
        
        // Text
        static let text = Color(hex: "FFFFFF")
        static let textSecondary = Color(hex: "A3A3A3")
        static let textTertiary = Color(hex: "737373")
        
        // Semantic
        static let success = Color(hex: "22C55E")
        static let error = Color(hex: "EF4444")
        static let warning = Color(hex: "F59E0B")
        static let info = Color(hex: "3B82F6")
        
        // Prayer specific
        static let prayer = Color(hex: "A78BFA")
        static let prayerAnswered = Color(hex: "22C55E")
        
        // Highlight colors (for Bible verses)
        static let highlightYellow = Color(hex: "FEF08A").opacity(0.4)
        static let highlightGreen = Color(hex: "BBF7D0").opacity(0.4)
        static let highlightBlue = Color(hex: "BFDBFE").opacity(0.4)
        static let highlightPink = Color(hex: "FBCFE8").opacity(0.4)
        static let highlightPurple = Color(hex: "DDD6FE").opacity(0.4)
        static let highlightOrange = Color(hex: "FED7AA").opacity(0.4)
        
        // Alpha variants
        static func primaryAlpha(_ opacity: Double) -> Color {
            primary.opacity(opacity)
        }
        
        static func accentAlpha(_ opacity: Double) -> Color {
            accent.opacity(opacity)
        }
    }
    
    // MARK: - Typography
    
    enum Typography {
        // Display
        static let display = Font.system(size: 36, weight: .bold, design: .serif)
        static let title1 = Font.system(size: 28, weight: .bold, design: .serif)
        static let title2 = Font.system(size: 24, weight: .semibold, design: .serif)
        static let title3 = Font.system(size: 20, weight: .semibold)
        
        // Body
        static let bodyLarge = Font.system(size: 18, weight: .regular)
        static let body = Font.system(size: 16, weight: .regular)
        static let bodySmall = Font.system(size: 14, weight: .regular)
        
        // Scripture (serif for Bible text)
        static let scripture = Font.system(size: 18, weight: .regular, design: .serif)
        static let scriptureLarge = Font.system(size: 22, weight: .regular, design: .serif)
        
        // UI
        static let label = Font.system(size: 14, weight: .medium)
        static let labelSmall = Font.system(size: 12, weight: .medium)
        static let button = Font.system(size: 16, weight: .semibold)
        static let caption = Font.system(size: 12, weight: .regular)
    }
    
    // MARK: - Spacing
    
    enum Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }
    
    // MARK: - Corner Radius
    
    enum CornerRadius {
        static let sm: CGFloat = 4
        static let md: CGFloat = 8
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
        static let full: CGFloat = 9999
    }
    
    // MARK: - Shadows
    
    enum Shadows {
        static let sm = Shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        static let md = Shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
        static let lg = Shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
    }
    
    struct Shadow {
        let color: Color
        let radius: CGFloat
        let x: CGFloat
        let y: CGFloat
    }
    
    // MARK: - Animation
    
    enum Animation {
        static let fast = SwiftUI.Animation.easeOut(duration: 0.15)
        static let normal = SwiftUI.Animation.easeOut(duration: 0.25)
        static let slow = SwiftUI.Animation.easeOut(duration: 0.4)
        
        static let spring = SwiftUI.Animation.spring(response: 0.35, dampingFraction: 0.7)
        static let springBouncy = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.6)
        static let springGentle = SwiftUI.Animation.spring(response: 0.5, dampingFraction: 0.8)
    }
    
    // MARK: - Dimensions
    
    enum Dimensions {
        // Common component sizes
        static let buttonHeight: CGFloat = 52
        static let inputHeight: CGFloat = 48
        static let iconButtonSize: CGFloat = 44
        static let tabBarHeight: CGFloat = 83
        static let headerHeight: CGFloat = 56
        
        // Card sizes
        static let cardMinHeight: CGFloat = 120
        static let verseCardHeight: CGFloat = 200
        
        // Icon sizes
        static let iconXS: CGFloat = 16
        static let iconSM: CGFloat = 20
        static let iconMD: CGFloat = 24
        static let iconLG: CGFloat = 32
        static let iconXL: CGFloat = 48
    }
}

// MARK: - Color Extension for Hex Support

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Extensions for Theme

extension View {
    func themeShadow(_ shadow: Theme.Shadow) -> some View {
        self.shadow(
            color: shadow.color,
            radius: shadow.radius,
            x: shadow.x,
            y: shadow.y
        )
    }
}
