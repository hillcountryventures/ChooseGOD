import SwiftUI

struct ForgotPasswordView: View {
    // @Environment(\AppState.self) private var appState // TODO: Fix this environment
    @State private var viewModel = AuthViewModel()
    @State private var email = ""
    
    var body: some View {
        ZStack {
            Color.clear.ignoresSafeArea() // Placeholder for Theme.Colors.background
            
            VStack(alignment: .leading, spacing: 0) {
                // Title
                Text("Reset Password")
                    .font(.largeTitle) // Placeholder for Theme.Typography.display
                    .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                    .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
                
                // Subtitle
                Text("Enter your email to receive a password reset link")
                    .font(.body) // Placeholder for Theme.Typography.body
                    .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                    .padding(.bottom, 24) // Placeholder for Theme.Spacing.xl
                
                // Email Field
                VStack(alignment: .leading, spacing: 8) { // Placeholder for Theme.Spacing.sm
                    Text("Email")
                        .font(.caption) // Placeholder for Theme.Typography.label
                        .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                    
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .disableAutocorrection(true)
                        // .textFieldStyle(ChooseGODTextFieldStyle()) // TODO: Fix ChooseGODTextFieldStyle import
                }
                .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
                
                // Send Reset Link Button
                Button {
                    Task {
                        await viewModel.resetPassword(email: email)
                    }
                } label: {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue, in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.primary
                    } else {
                        Text("Send Reset Link")
                            .font(.headline) // Placeholder for Theme.Typography.button
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue, in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.primary
                    }
                }
                .disabled(email.isEmpty || viewModel.isLoading)
                
                Spacer()
            }
            .padding(.horizontal, 16) // Placeholder for Theme.Spacing.lg
            .padding(.top, 24) // Placeholder for Theme.Spacing.xxl
        }
        .navigationTitle("Forgot Password")
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    // Dismiss
                    presentationMode.wrappedValue.dismiss()
                } label: {
                    Image(systemName: "chevron.backward")
                        .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                }
                .buttonStyle(.plain)
            }
        }
        // TODO: Fix AnalyticsService import - .onAppear { AnalyticsService.shared.screen("forgot_password") }
        // TODO: Fix AppStrings import - .alert(AppStrings.Auth.resetPasswordSentTitle, isPresented: $viewModel.showResetSent) {
        //     Button(AppStrings.Errors.ok, role: .cancel) {
        //         // Dismiss
        //         presentationMode.wrappedValue.dismiss()
        //     }
        // } message: {
        //     Text(AppStrings.Auth.resetPasswordSentMessage)
        // }
        // TODO: Fix AppStrings import - .alert(AppStrings.Errors.genericTitle, isPresented: $viewModel.showError) {
        //     Button(AppStrings.Errors.ok, role: .cancel) {}
        // } message: {
        //     Text(viewModel.errorMessage ?? AppStrings.Errors.genericBody)
        // }
        // .overlay(LoadingOverlay(isLoading: viewModel.isLoading)) // TODO: Fix LoadingOverlay import
    }
    
    @Environment(\PresentationMode.self) private var presentationMode
}

// #Preview {
//    NavigationStack {
//        ForgotPasswordView()
//            .environment(\AppState.self, AppState())
//    }
//}
