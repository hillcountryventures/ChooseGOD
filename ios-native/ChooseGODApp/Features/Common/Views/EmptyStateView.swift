import SwiftUI

/// Reusable empty state with icon, title, description, and optional action button
struct EmptyStateView: View {
    let icon: String
    let title: String
    let description: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    
    @State private var appeared = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Icon
            Image(systemName: icon)
                .font(Theme.Typography.iconXXL)
                .foregroundStyle(Theme.Colors.primary.opacity(0.6))
                .scaleEffect(appeared ? 1 : (reduceMotion ? 1 : 0.7))
                .opacity(appeared ? 1 : 0)
            
            VStack(spacing: Theme.Spacing.sm) {
                Text(title)
                    .font(ScaledFont.title3)
                    .foregroundStyle(Theme.Colors.text)
                    .multilineTextAlignment(.center)
                
                Text(description)
                    .font(ScaledFont.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            
            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(ScaledFont.button)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 28)
                        .padding(.vertical, Theme.Spacing.mds)
                }
                .buttonStyle(GlassButtonStyle(isProminent: true))
            }
        }
        .padding(Theme.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibleCard(label: "\(title). \(description)")
        .onAppear {
            withAnimation(reduceMotion ? .none : .spring(response: 0.5, dampingFraction: 0.7)) {
                appeared = true
            }
        }
    }
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        EmptyStateView(
            icon: "hands.sparkles",
            title: "No Prayers Yet",
            description: "Start your prayer journey by adding your first prayer request.",
            actionTitle: "Add Prayer",
            action: {}
        )
    }
}
