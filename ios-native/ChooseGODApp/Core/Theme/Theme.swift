import SwiftUI

// MARK: - Theme Manager

/// Observable theme manager that persists color scheme preference
@Observable
class ThemeManager {
    static let shared = ThemeManager()
    
    enum SchemePreference: String, CaseIterable {
        case system, dark, light
    }
    
    var preference: SchemePreference {
        didSet { UserDefaults.standard.set(preference.rawValue, forKey: "themeSchemePreference") }
    }
    
    var resolvedColorScheme: ColorScheme? {
        switch preference {
        case .system: return nil
        case .dark: return .dark
        case .light: return .light
        }
    }
    
    private init() {
        let stored = UserDefaults.standard.string(forKey: "themeSchemePreference") ?? "dark"
        self.preference = SchemePreference(rawValue: stored) ?? .dark
    }
}

/// Central theme definition for ChooseGOD
/// Supports adaptive dark/light color schemes
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
        
        // Adaptive backgrounds — use UIColor for automatic dark/light
        static let background = Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: "0F0F0F"))
                : UIColor(Color(hex: "F8F8FA"))
        })
        
        static let surface = Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: "1A1A1A"))
                : UIColor(Color(hex: "FFFFFF"))
        })
        
        static let surfaceElevated = Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: "262626"))
                : UIColor(Color(hex: "F0F0F5"))
        })

        /// Translucent "glass" surface used by Discover cards. Alias to the
        /// elevated surface (a dedicated token DiscoverView referenced but that
        /// was never defined — added to fix the build).
        static let glass = surfaceElevated

        // Text — adaptive
        static let text = Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: "FFFFFF"))
                : UIColor(Color(hex: "1A1A1A"))
        })
        
        static let textSecondary = Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: "A3A3A3"))
                : UIColor(Color(hex: "6B6B6B"))
        })
        
        static let textTertiary = Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(Color(hex: "737373"))
                : UIColor(Color(hex: "9CA3AF"))
        })
        
        static let secondaryText = textSecondary  // Alias
        
        // Semantic (same in both modes)
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
        
        // Background gradients (centralized from HomeView/PaywallView)
        static let backgroundGradient = [
            Color(hex: "0f0f1a"),
            Color(hex: "1a1a2e"),
            Color(hex: "0f0f1a")
        ]
        
        static let paywallGradient = [
            Color(hex: "0F0A1A"),
            Color(hex: "1A0F2E"),
            Color(hex: "0F0F0F")
        ]
        
        static let goldGradient = [
            Color(hex: "FFD700"),
            Color(hex: "FFA500")
        ]
        
        // Alpha variants
        static func primaryAlpha(_ opacity: Double) -> Color {
            primary.opacity(opacity)
        }
        
        static func accentAlpha(_ opacity: Double) -> Color {
            accent.opacity(opacity)
        }
        
        // MARK: - Series Gradients (centralized from Devotional.swift)
        
        enum Series {
            static let defaultGradient: (Color, Color) = (Color(hex: "6366F1"), Color(hex: "4F46E5"))
            
            static let gradients: [String: (Color, Color)] = [
                "overcoming-anxiety": (Color(hex: "6366F1"), Color(hex: "4F46E5")),
                "strengthening-marriage": (Color(hex: "EC4899"), Color(hex: "DB2777")),
                "biblical-parenting": (Color(hex: "F59E0B"), Color(hex: "D97706")),
                "trusting-god-finances": (Color(hex: "10B981"), Color(hex: "059669")),
                "dealing-grief": (Color(hex: "8B5CF6"), Color(hex: "7C3AED")),
                "cultivating-gratitude": (Color(hex: "F59E0B"), Color(hex: "FBBF24")),
                "deepening-prayer": (Color(hex: "3B82F6"), Color(hex: "2563EB")),
                "knowing-gods-character": (Color(hex: "6366F1"), Color(hex: "8B5CF6")),
                "walking-grace-forgiveness": (Color(hex: "22C55E"), Color(hex: "16A34A")),
                "hearing-gods-voice": (Color(hex: "06B6D4"), Color(hex: "0891B2")),
                "advent": (Color(hex: "DC2626"), Color(hex: "B91C1C")),
                "lent": (Color(hex: "7C3AED"), Color(hex: "6D28D9")),
            ]
            
            static func gradient(for slug: String) -> LinearGradient {
                let colors = gradients[slug] ?? defaultGradient
                return LinearGradient(colors: [colors.0, colors.1], startPoint: .topLeading, endPoint: .bottomTrailing)
            }
            
            static func colors(for slug: String) -> (Color, Color) {
                gradients[slug] ?? defaultGradient
            }
        }
    }
    
    // MARK: - Typography
    
    enum Typography {
        static let display = Font.system(size: 36, weight: .bold, design: .serif)
        static let title1 = Font.system(size: 28, weight: .bold, design: .serif)
        static let title2 = Font.system(size: 24, weight: .semibold, design: .serif)
        static let title3 = Font.system(size: 20, weight: .semibold)
        
        static let bodyLarge = Font.system(size: 18, weight: .regular)
        static let body = Font.system(size: 16, weight: .regular)
        static let bodySmall = Font.system(size: 14, weight: .regular)
        
        static let scripture = Font.system(size: 18, weight: .regular, design: .serif)
        static let scriptureLarge = Font.system(size: 22, weight: .regular, design: .serif)
        
        static let label = Font.system(size: 14, weight: .medium)
        static let labelSmall = Font.system(size: 12, weight: .medium)
        static let button = Font.system(size: 16, weight: .semibold)
        static let caption = Font.system(size: 12, weight: .regular)
        static let caption2 = Font.system(size: 11, weight: .regular)
        static let captionBold = Font.system(size: 12, weight: .bold)
        static let captionSemibold = Font.system(size: 12, weight: .semibold)
        static let captionMedium = Font.system(size: 12, weight: .medium)
        static let headline = Font.system(size: 17, weight: .semibold)
        static let subheadline = Font.system(size: 15, weight: .regular)
        static let subheadlineMedium = Font.system(size: 15, weight: .medium)
        static let subheadlineSemibold = Font.system(size: 15, weight: .semibold)
        static let monoSmall = Font.system(size: 11, weight: .medium, design: .monospaced)
        static let monoMedium = Font.system(size: 13, weight: .semibold, design: .monospaced)
        static let calloutSerif = Font.system(.callout, design: .serif)
        static let subheadlineSerif = Font.system(size: 15, weight: .semibold, design: .serif)
        static let bodySerif = Font.system(.body, design: .serif)
        static let verseNumber = Font.system(size: 14, weight: .bold, design: .serif)
        static let displayRounded = Font.system(size: 36, weight: .bold, design: .rounded)
        static let chapterTitle = Font.system(size: 32, weight: .bold, design: .serif)
        static let iconLarge = Font.system(size: 44)
        static let iconXL = Font.system(size: 48)
        static let iconXXL = Font.system(size: 56)
        static let iconHuge = Font.system(size: 60)
        static let iconMassive = Font.system(size: 64)
    }
    
    // MARK: - Spacing
    
    enum Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let smd: CGFloat = 10
        static let mds: CGFloat = 12
        static let md: CGFloat = 16
        static let mdl: CGFloat = 20
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }
    
    // MARK: - Corner Radius
    
    enum CornerRadius {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 3
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
        static let buttonHeight: CGFloat = 52
        static let inputHeight: CGFloat = 48
        static let iconButtonSize: CGFloat = 44
        static let tabBarHeight: CGFloat = 83
        static let headerHeight: CGFloat = 56
        
        static let cardMinHeight: CGFloat = 120
        static let verseCardHeight: CGFloat = 200
        
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
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
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
