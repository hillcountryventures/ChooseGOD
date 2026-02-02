import SwiftUI
import AuthenticationServices

/// Sign up screen with Apple Sign In as primary option
struct SignUpView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = AuthViewModel()
    
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var agreeToTerms = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.clear // background via .screenBackground()
                
                ScrollView {
                    VStack(spacing: Theme.Spacing.xl) {
                        // Header
                        headerSection
                        
                        // Apple Sign In (Primary)
                        appleSignInButton
                        
                        // Divider
                        dividerSection
                        
                        // Registration Form
                        registrationForm
                        
                        // Terms Agreement
                        termsSection
                        
                        // Create Account Button
                        createAccountButton
                        
                        Spacer(minLength: Theme.Spacing.xl)
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.top, Theme.Spacing.lg)
                }
            }
            .screenBackground()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(AppStrings.Auth.cancel) {
                        dismiss()
                    }
                    .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            .alert(AppStrings.Errors.genericTitle, isPresented: $viewModel.showError) {
                Button(AppStrings.Errors.ok, role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage ?? AppStrings.Errors.genericBody)
            }
            .overlay {
                if viewModel.isLoading {
                    LoadingOverlay()
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("sign_up") }
    }
    
    // MARK: - Header
    
    private var headerSection: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Text(AppStrings.Auth.createAccount)
                        .accessibilityLabel(AppStrings.Auth.createAccountLabel)
                        .accessibilityHint(AppStrings.Auth.createAccountHint)
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            
            Text(AppStrings.Auth.startJourney)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
    
    // MARK: - Apple Sign In
    
    private var appleSignInButton: some View {
        SignInWithAppleButton(
            onRequest: { request in
                request.requestedScopes = [.fullName, .email]
            },
            onCompletion: { result in
                Task {
                    await handleAppleSignIn(result)
                }
            }
        )
        .signInWithAppleButtonStyle(.white)
        .frame(height: Theme.Dimensions.buttonHeight)
        .cornerRadius(Theme.CornerRadius.lg)
    }
    
    // MARK: - Divider
    
    private var dividerSection: some View {
        HStack(spacing: Theme.Spacing.md) {
            Rectangle()
                .fill(Theme.Colors.textTertiary.opacity(0.3))
                .frame(height: 1)
            
            Text(AppStrings.Auth.orSignUpWithEmail)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
            
            Rectangle()
                .fill(Theme.Colors.textTertiary.opacity(0.3))
                .frame(height: 1)
        }
        .padding(.vertical, Theme.Spacing.md)
    }
    
    // MARK: - Registration Form
    
    private var registrationForm: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Name Field
            FormField(
                label: AppStrings.Auth.fullName,
                text: $name,
                placeholder: AppStrings.Auth.namePlaceholder,
                error: viewModel.nameError,
                contentType: .name
            )
            .onChange(of: name) { _, newValue in
                _ = viewModel.validateName(newValue)
            }
            
            // Email Field
            FormField(
                label: AppStrings.Auth.email,
                text: $email,
                placeholder: AppStrings.Auth.emailPlaceholder,
                error: viewModel.emailError,
                contentType: .emailAddress,
                keyboardType: .emailAddress
            )
            .onChange(of: email) { _, newValue in
                _ = viewModel.validateEmail(newValue)
            }
            
            // Password Field
            FormField(
                label: AppStrings.Auth.password,
                text: $password,
                placeholder: AppStrings.Auth.createPasswordPlaceholder,
                error: viewModel.passwordError,
                isSecure: !showPassword,
                contentType: .newPassword
            )
            .onChange(of: password) { _, newValue in
                _ = viewModel.validatePassword(newValue)
            }
            
            // Confirm Password
            FormField(
                label: AppStrings.Auth.confirmPassword,
                text: $confirmPassword,
                placeholder: AppStrings.Auth.confirmPasswordPlaceholder,
                error: password != confirmPassword && !confirmPassword.isEmpty ? AppStrings.Auth.passwordsMismatch : nil,
                isSecure: !showPassword,
                contentType: .newPassword
            )
            
            // Show password toggle
            Toggle(isOn: $showPassword) {
                Text(AppStrings.Auth.showPasswords)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            .tint(Theme.Colors.primary)
        }
    }
    
    // MARK: - Terms Section
    
    private var termsSection: some View {
        Toggle(isOn: $agreeToTerms) {
            Text(AppStrings.Auth.agreePrefix)
                .foregroundStyle(Theme.Colors.textSecondary)
            + Text(AppStrings.Auth.termsOfService)
                .foregroundStyle(Theme.Colors.primary)
            + Text(AppStrings.Auth.andText)
                .foregroundStyle(Theme.Colors.textSecondary)
            + Text(AppStrings.Auth.privacyPolicy)
                .foregroundStyle(Theme.Colors.primary)
        }
        .font(Theme.Typography.bodySmall)
        .tint(Theme.Colors.primary)
    }
    
    // MARK: - Create Account Button
    
    private var createAccountButton: some View {
        Button {
            Task {
                await createAccount()
            }
        } label: {
            Text(AppStrings.Auth.createAccount)
                .primaryButtonStyle(isDisabled: !isFormValid)
        }
        .disabled(!isFormValid || viewModel.isLoading)
    }
    
    // MARK: - Computed Properties
    
    private var isFormValid: Bool {
        !name.isEmpty &&
        viewModel.validateEmail(email) &&
        viewModel.validatePassword(password) &&
        password == confirmPassword &&
        agreeToTerms
    }
    
    // MARK: - Actions
    
    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) async {
        viewModel.isLoading = true
        defer { viewModel.isLoading = false }
        
        do {
            let user = try await appState.authService.signInWithApple()
            await MainActor.run {
                appState.currentUser = user
                appState.isAuthenticated = true
                dismiss()
            }
        } catch {
            viewModel.handleError(error)
        }
    }
    
    private func createAccount() async {
        viewModel.isLoading = true
        defer { viewModel.isLoading = false }
        
        do {
            let user = try await appState.authService.signUp(
                email: email,
                password: password,
                name: name
            )
            await MainActor.run {
                appState.currentUser = user
                appState.isAuthenticated = true
                dismiss()
            }
        } catch {
            viewModel.handleError(error)
        }
    }
}

// MARK: - Form Field Component

struct FormField: View {
    let label: String
    @Binding var text: String
    let placeholder: String
    var error: String?
    var isSecure: Bool = false
    var contentType: UITextContentType?
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(label)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboardType)
                }
            }
            .textContentType(contentType)
            .autocapitalization(keyboardType == .emailAddress ? .none : .words)
            .autocorrectionDisabled()
            .textFieldStyle(ChooseGODTextFieldStyle())
            
            if let error = error {
                Text(error)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.error)
            }
        }
    }
}

#Preview {
    SignUpView()
        .environment(AppState.preview)
}
