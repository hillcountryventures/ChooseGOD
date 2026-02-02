import SwiftUI

/// Password reset screen
struct ForgotPasswordView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = AuthViewModel()
    
    @State private var email = ""
    @State private var emailSent = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                VStack(spacing: Theme.Spacing.xl) {
                    if emailSent {
                        successView
                    } else {
                        resetFormView
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage ?? "An error occurred")
            }
            .overlay {
                if viewModel.isLoading {
                    LoadingOverlay()
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("forgot_password") }
    }
    
    // MARK: - Reset Form
    
    private var resetFormView: some View {
        VStack(spacing: Theme.Spacing.xl) {
            // Icon
            Image(systemName: "key.fill")
                .font(Theme.Typography.iconXL)
                .foregroundStyle(Theme.Colors.primary)
                .padding(.top, Theme.Spacing.xxl)
            
            // Header
            VStack(spacing: Theme.Spacing.sm) {
                Text("Reset Password")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Enter your email address and we'll send you a link to reset your password.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            
            // Email Field
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text("Email")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                TextField("Enter your email", text: $email)
                    .textFieldStyle(ChooseGODTextFieldStyle())
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .autocorrectionDisabled()
            }
            
            // Send Button
            Button {
                Task {
                    await sendResetEmail()
                }
            } label: {
                Text("Send Reset Link")
                    .font(Theme.Typography.button)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.Dimensions.buttonHeight)
                    .background(email.isEmpty ? Theme.Colors.primary.opacity(0.5) : Theme.Colors.primary)
                    .cornerRadius(Theme.CornerRadius.lg)
            }
            .disabled(email.isEmpty || viewModel.isLoading)
            
            Spacer()
        }
    }
    
    // MARK: - Success View
    
    private var successView: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Spacer()
            
            // Success Icon
            Image(systemName: "envelope.badge.fill")
                .font(Theme.Typography.iconHuge)
                .foregroundStyle(Theme.Colors.success)
            
            // Message
            VStack(spacing: Theme.Spacing.sm) {
                Text("Check Your Email")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("We've sent a password reset link to:")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                Text(email)
                    .font(Theme.Typography.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("Please check your inbox and follow the instructions to reset your password.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.top, Theme.Spacing.sm)
            }
            
            // Done Button
            Button {
                dismiss()
            } label: {
                Text("Done")
                        .accessibilityLabel("Done")
                    .font(Theme.Typography.button)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.Dimensions.buttonHeight)
                    .background(Theme.Colors.primary)
                    .cornerRadius(Theme.CornerRadius.lg)
            }
            .padding(.top, Theme.Spacing.lg)
            
            // Resend Link
            Button {
                Task {
                    await sendResetEmail()
                }
            } label: {
                Text("Didn't receive the email? Send again")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.primary)
            }
            
            Spacer()
        }
    }
    
    // MARK: - Actions
    
    private func sendResetEmail() async {
        viewModel.isLoading = true
        defer { viewModel.isLoading = false }
        
        do {
            try await appState.authService.resetPassword(email: email)
            await MainActor.run {
                withAnimation {
                    emailSent = true
                }
            }
        } catch {
            viewModel.handleError(error)
        }
    }
}

#Preview {
    ForgotPasswordView()
        .environment(AppState.preview)
}
