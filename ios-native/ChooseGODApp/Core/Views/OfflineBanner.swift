import SwiftUI

/// Subtle banner shown when the device is offline
struct OfflineBanner: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "wifi.slash")
                .font(.caption)
            Text("You're offline — changes will sync when connected")
                .font(.caption)
        }
        .foregroundStyle(.white.opacity(0.9))
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity)
        .background(Theme.Colors.secondaryText.opacity(0.8))
    }
}
