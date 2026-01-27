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
                // Background
                Theme.Colors.background
                    .ignoresSafeArea()
                
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
            .navigationBarHidden(true)
            .sheet(isPresented: $showSignUp) {
                SignUpView()
            }
            .sheet(isPresented: $showForgotPassword) {
                ForgotPasswordView()
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
    }
    
    // MARK: - Header
    
    private var headerSection: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Logo/Icon
            Image(systemName: "book.closed.fill")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primary)
            
            Text("Welcome Back")
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            
            Text("Sign in to continue your journey")
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
            
            Text("or continue with email")
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
            
            // Password Field
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text("Password")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                HStack {
                    Group {
                        if showPassword {
                            TextField("Enter your password", text: $password)
                        } else {
                            SecureField("Enter your password", text: $password)
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
            Text("Sign In")
                .font(Theme.Typography.button)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Theme.Dimensions.buttonHeight)
                .background(Theme.Colors.primary)
                .cornerRadius(Theme.CornerRadius.lg)
        }
        .disabled(email.isEmpty || password.isEmpty || viewModel.isLoading)
        .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1.0)
    }
    
    // MARK: - Forgot Password
    
    private var forgotPasswordButton: some View {
        Button {
            showForgotPassword = true
        } label: {
            Text("Forgot Password?")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.primary)
        }
    }
    
    // MARK: - Sign Up Link
    
    private var signUpLink: some View {
        HStack(spacing: Theme.Spacing.xs) {
            Text("Don't have an account?")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            Button {
                showSignUp = true
            } label: {
                Text("Sign Up")
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
                ProgressView()
                    .tint(Theme.Colors.primary)
                    .scaleEffect(1.5)
                
                Text("Please wait...")
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
