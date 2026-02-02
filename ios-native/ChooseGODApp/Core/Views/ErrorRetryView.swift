import os
import SwiftUI

struct ErrorRetryView: View {
    let message: String
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(Theme.Typography.iconLarge)
                .foregroundColor(Theme.Colors.warning)
            Text(message)
                .font(Theme.Typography.body)
                .multilineTextAlignment(.center)
            Button("Try Again", action: retryAction)
                .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

#Preview {
    ErrorRetryView(message: "Something went wrong. Please try again.") {
        AppLogger.general.debug("Retry tapped")
    }
    .preferredColorScheme(.dark)
}
