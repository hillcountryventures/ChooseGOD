import SwiftUI

/// Subtle banner shown when the device is offline
struct OfflineBanner: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "wifi.slash")
                .font(Theme.Typography.caption)
            Text("You're offline — changes will sync when connected")
                .font(Theme.Typography.caption)
        }
        .foregroundStyle(.white.opacity(0.9))
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.vertical, Theme.Spacing.sm)
        .frame(maxWidth: .infinity)
        .background(Theme.Colors.secondaryText.opacity(0.8))
    }
}
