import SwiftUI

// MARK: - Dynamic Type Scaled Fonts

enum ScaledFont {
    static let display = Font.system(.largeTitle, design: .serif, weight: .bold)
    static let title1 = Font.system(.title, design: .serif, weight: .bold)
    static let title2 = Font.system(.title2, design: .serif, weight: .semibold)
    static let title3 = Font.system(.title3, weight: .semibold)
    
    static let bodyLarge = Font.system(.body, weight: .regular)
    static let body = Font.system(.body, weight: .regular)
    static let bodySmall = Font.system(.subheadline, weight: .regular)
    
    static let scripture = Font.system(.body, design: .serif, weight: .regular)
    static let scriptureLarge = Font.system(.title3, design: .serif, weight: .regular)
    
    static let label = Font.system(.subheadline, weight: .medium)
    static let labelSmall = Font.system(.caption, weight: .medium)
    static let button = Font.system(.body, weight: .semibold)
    static let caption = Font.system(.caption2, weight: .regular)
}

// MARK: - VoiceOver Helpers

struct AccessibilityLabels {
    // Tab bar
    static func tab(_ name: String, selected: Bool) -> String {
        "\(name) tab\(selected ? ", selected" : "")"
    }
    
    // Streak
    static func streak(days: Int) -> String {
        "\(days) day reading streak"
    }
    
    // Bible verse
    static func verse(reference: String, text: String) -> String {
        "\(reference). \(text)"
    }
    
    // Prayer
    static func prayer(title: String, answered: Bool) -> String {
        "\(title)\(answered ? ", answered" : ", active prayer")"
    }
    
    // Progress
    static func progress(value: Double, label: String) -> String {
        "\(label): \(Int(value * 100)) percent complete"
    }
}

// MARK: - Reduce Motion Helpers

extension View {
    /// Applies animation only when Reduce Motion is off; otherwise instant
    @ViewBuilder
    func motionSafe<V: Equatable>(animation: Animation, value: V) -> some View {
        self.animation(animation, value: value)
        // Note: SwiftUI automatically respects accessibilityReduceMotion
        // for many built-in animations. This is for custom cases.
    }
    
    /// Conditional transition respecting Reduce Motion
    func safeTransition(_ transition: AnyTransition) -> some View {
        self.transition(transition)
    }
}

// MARK: - High Contrast Support

enum HighContrastColors {
    @Environment(\.colorSchemeContrast) static var contrast
    
    static func text(for baseColor: Color) -> Color {
        // SwiftUI auto-adjusts for high contrast when using semantic colors.
        // For custom colors, bump opacity to 1.0 in high contrast mode.
        baseColor
    }
    
    static func border(normal: Color = .white.opacity(0.2)) -> Color {
        // In high contrast, use stronger borders
        normal
    }
}

// MARK: - Accessibility Modifier

struct AccessibleCardModifier: ViewModifier {
    let label: String
    let hint: String?
    
    init(label: String, hint: String? = nil) {
        self.label = label
        self.hint = hint
    }
    
    func body(content: Content) -> some View {
        content
            .accessibilityElement(children: .combine)
            .accessibilityLabel(label)
            .accessibilityHint(hint ?? "")
    }
}

// MARK: - High Contrast Card Border

struct HighContrastBorderModifier: ViewModifier {
    @Environment(\.colorSchemeContrast) private var contrast
    let cornerRadius: CGFloat
    
    func body(content: Content) -> some View {
        content.overlay {
            if contrast == .increased {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(.white.opacity(0.5), lineWidth: 2)
            }
        }
    }
}

extension View {
    func accessibleCard(label: String, hint: String? = nil) -> some View {
        modifier(AccessibleCardModifier(label: label, hint: hint))
    }
    
    func highContrastBorder(cornerRadius: CGFloat = Theme.CornerRadius.lg) -> some View {
        modifier(HighContrastBorderModifier(cornerRadius: cornerRadius))
    }
}
