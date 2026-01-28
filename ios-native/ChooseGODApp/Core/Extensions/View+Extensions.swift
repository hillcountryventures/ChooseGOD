import SwiftUI

// MARK: - Conditional Modifier

extension View {
    /// Apply a modifier only when a condition is true
    @ViewBuilder
    func `if`<Transform: View>(_ condition: Bool, transform: (Self) -> Transform) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
    
    /// Apply one of two modifiers based on condition
    @ViewBuilder
    func `if`<TrueContent: View, FalseContent: View>(
        _ condition: Bool,
        then trueTransform: (Self) -> TrueContent,
        else falseTransform: (Self) -> FalseContent
    ) -> some View {
        if condition {
            trueTransform(self)
        } else {
            falseTransform(self)
        }
    }
}

// MARK: - onFirstAppear

struct OnFirstAppearModifier: ViewModifier {
    @State private var hasAppeared = false
    let action: () -> Void
    
    func body(content: Content) -> some View {
        content.onAppear {
            guard !hasAppeared else { return }
            hasAppeared = true
            action()
        }
    }
}

extension View {
    /// Executes action only on the first appearance
    func onFirstAppear(_ action: @escaping () -> Void) -> some View {
        modifier(OnFirstAppearModifier(action: action))
    }
}

// MARK: - Glow Effect

extension View {
    func glow(color: Color = Theme.Colors.primary, radius: CGFloat = 12) -> some View {
        self.shadow(color: color.opacity(0.5), radius: radius)
    }
}

// MARK: - Card Style

extension View {
    func cardStyle(padding: CGFloat = Theme.Spacing.md) -> some View {
        self
            .padding(padding)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
            .highContrastBorder()
    }
}
