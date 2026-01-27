import SwiftUI

/// Coordinator view for authentication flow
struct AuthCoordinatorView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        LoginView()
            .environment(appState)
    }
}

#Preview {
    AuthCoordinatorView()
        .environment(AppState.preview)
}
