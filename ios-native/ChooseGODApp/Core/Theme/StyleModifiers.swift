import SwiftUI

// MARK: - Shared Style Modifiers

/// Standard input field styling
struct InputFieldModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(Theme.Typography.body)
            .foregroundStyle(Theme.Colors.text)
            .padding(Theme.Spacing.md)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .stroke(Theme.Colors.surfaceElevated, lineWidth: 1)
            )
    }
}

/// Standard section header styling
struct SectionHeaderModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(Theme.Typography.title3)
            .foregroundStyle(Theme.Colors.text)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
    }
}

/// Primary button style
struct PrimaryButtonModifier: ViewModifier {
    var isDisabled: Bool = false
    
    func body(content: Content) -> some View {
        content
            .font(Theme.Typography.button)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: Theme.Dimensions.buttonHeight)
            .background(
                isDisabled
                    ? Theme.Colors.primary.opacity(0.4)
                    : Theme.Colors.primary
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
    }
}

/// Secondary button style
struct SecondaryButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(Theme.Typography.button)
            .foregroundStyle(Theme.Colors.primary)
            .frame(maxWidth: .infinity)
            .frame(height: Theme.Dimensions.buttonHeight)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .stroke(Theme.Colors.primary.opacity(0.3), lineWidth: 1)
            )
    }
}

/// Standard screen background
struct ScreenBackgroundModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.Colors.background.ignoresSafeArea())
    }
}

// MARK: - View Extensions

extension View {
    func inputFieldStyle() -> some View {
        modifier(InputFieldModifier())
    }
    
    func sectionHeaderStyle() -> some View {
        modifier(SectionHeaderModifier())
    }
    
    func primaryButtonStyle(isDisabled: Bool = false) -> some View {
        modifier(PrimaryButtonModifier(isDisabled: isDisabled))
    }
    
    func secondaryButtonStyle() -> some View {
        modifier(SecondaryButtonModifier())
    }
    
    func screenBackground() -> some View {
        modifier(ScreenBackgroundModifier())
    }
}
