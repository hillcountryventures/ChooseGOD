import SwiftUI
import AuthenticationServices

/// Login screen with Apple Sign In as primary option
struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = AuthViewModel()
    
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var showSignUp = false
    @State private var showForgotPassword = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Background applied via .screenBackground()
                Color.clear
                
                ScrollView {
                    VStack(spacing: Theme.Spacing.xl) {
                        // Header
                        headerSection
                        
                        // Apple Sign In (Primary)
                        appleSignInButton
                        
                        // Divider
                        dividerSection
                        
                        // Email/Password Form
                        emailPasswordForm
                        
                        // Sign In Button
                        signInButton
                        
                        // Forgot Password
                        forgotPasswordButton
                        
                        Spacer(minLength: Theme.Spacing.xxl)
                        
                        // Sign Up Link
                        signUpLink
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.top, Theme.Spacing.xxl)
                }
            }
            .screenBackground()
            .navigationBarHidden(true)
            .sheet(isPresented: $showSignUp) {
                SignUpView()
            }
            .sheet(isPresented: $showForgotPassword) {
                ForgotPasswordView()
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
        .onAppear { AnalyticsService.shared.screen("login") }
    }
    
    // MARK: - Header
    
    private var headerSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Logo/Icon
            Image(systemName: "book.closed.fill")
                .font(Theme.Typography.iconHuge)
                .foregroundStyle(Theme.Colors.primary)
            
            Text(AppStrings.Auth.welcomeBack)
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            
            Text(AppStrings.Auth.signInSubtitle)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .padding(.bottom, Theme.Spacing.lg)
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
            
            Text(AppStrings.Auth.orContinueWithEmail)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
            
            Rectangle()
                .fill(Theme.Colors.textTertiary.opacity(0.3))
                .frame(height: 1)
        }
        .padding(.vertical, Theme.Spacing.md)
    }
    
    // MARK: - Email/Password Form
    
    private var emailPasswordForm: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Email Field
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(AppStrings.Auth.email)
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                TextField(AppStrings.Auth.emailPlaceholder, text: $email)
                    .textFieldStyle(ChooseGODTextFieldStyle())
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .autocorrectionDisabled()
            }
            
            // Password Field
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(AppStrings.Auth.password)
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                HStack {
                    Group {
                        if showPassword {
                            TextField(AppStrings.Auth.passwordPlaceholder, text: $password)
                        } else {
                            SecureField(AppStrings.Auth.passwordPlaceholder, text: $password)
                        }
                    }
                    .textContentType(.password)
                    
                    Button {
                        showPassword.toggle()
                    } label: {
                        Image(systemName: showPassword ? "eye.slash" : "eye")
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
                .textFieldStyle(ChooseGODTextFieldStyle())
            }
        }
    }
    
    // MARK: - Sign In Button
    
    private var signInButton: some View {
        Button {
            Task {
                await signInWithEmail()
            }
        } label: {
            Text(AppStrings.Auth.signIn)
                        .accessibilityLabel(AppStrings.Auth.signInLabel)
                        .accessibilityHint(AppStrings.Auth.signInHint)
                .primaryButtonStyle()
        }
        .disabled(email.isEmpty || password.isEmpty || viewModel.isLoading)
        .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1.0)
    }
    
    // MARK: - Forgot Password
    
    private var forgotPasswordButton: some View {
        Button {
            showForgotPassword = true
        } label: {
            Text(AppStrings.Auth.forgotPassword)
                        .accessibilityLabel(AppStrings.Auth.forgotPasswordLabel)
                        .accessibilityHint(AppStrings.Auth.forgotPasswordHint)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.primary)
        }
    }
    
    // MARK: - Sign Up Link
    
    private var signUpLink: some View {
        HStack(spacing: Theme.Spacing.xs) {
            Text(AppStrings.Auth.noAccount)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            Button {
                showSignUp = true
            } label: {
                Text(AppStrings.Auth.signUp)
                        .accessibilityLabel(AppStrings.Auth.createAccountLabel)
                        .accessibilityHint(AppStrings.Auth.createAccountHint)
                    .font(Theme.Typography.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.Colors.primary)
            }
        }
        .padding(.bottom, Theme.Spacing.xl)
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
            }
        } catch {
            viewModel.handleError(error)
        }
    }
    
    private func signInWithEmail() async {
        viewModel.isLoading = true
        defer { viewModel.isLoading = false }
        
        do {
            let user = try await appState.authService.signInWithEmail(
                email: email,
                password: password
            )
            await MainActor.run {
                appState.currentUser = user
                appState.isAuthenticated = true
            }
        } catch {
            viewModel.handleError(error)
        }
    }
}

// MARK: - Custom Text Field Style

struct ChooseGODTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(Theme.Spacing.md)
            .background(Theme.Colors.surface)
            .cornerRadius(Theme.CornerRadius.lg)
            .foregroundStyle(Theme.Colors.text)
    }
}

// MARK: - Loading Overlay

struct LoadingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            
            VStack(spacing: Theme.Spacing.md) {
                ShimmerView(height: 20)
                    .tint(Theme.Colors.primary)
                    .scaleEffect(1.5)
                
                Text(AppStrings.Errors.pleaseWait)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.text)
            }
            .padding(Theme.Spacing.xl)
            .background(Theme.Colors.surface)
            .cornerRadius(Theme.CornerRadius.xl)
        }
    }
}

// MARK: - Preview

#Preview {
    LoginView()
        .environment(AppState.preview)
}
