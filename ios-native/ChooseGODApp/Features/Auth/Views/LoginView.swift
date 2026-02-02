import SwiftUI
import os

struct LoginView: View {
    @Environment private var appState: AppState
    @State private var viewModel = AuthViewModel()
    @State private var showSignUp = false
    @State private var showForgotPassword = false
    @State private var showPassword = false
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        ZStack {
            Color.clear.ignoresSafeArea() // Placeholder for Theme.Colors.background
            ScrollView {
                ContentView(email: $email, password: $password, showPassword: $showPassword, showForgotPassword: $showForgotPassword, showSignUp: $showSignUp, viewModel: viewModel, appState: appState)
            }
            .navigationTitle("Welcome Back")
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    BackButton {
                        // appState.authMode = .signUp // TODO: Fix this property
                        showSignUp = true
                    }
                }
            }
            // TODO: Fix AnalyticsService import - AnalyticsService.shared.screen("login")
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showSignUp) {
            SignUpView()
        }
        .sheet(isPresented: $showForgotPassword) {
            ForgotPasswordView()
        }
        // TODO: Fix AppStrings import - .alert(AppStrings.Errors.genericTitle, isPresented: $viewModel.showError) {
        //     Button(AppStrings.Errors.ok, role: .cancel) {}
        // } message: {
        //     Text(viewModel.errorMessage ?? AppStrings.Errors.genericBody)
        // }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
                    .ignoresSafeArea()
                    .background(Color.gray.opacity(0.6)) // Placeholder for Theme.Colors.background.opacity(0.6)
            }
        }
    }
    
    // MARK: - Sign Up Link
    
    var signUpLink: some View {
        HStack {
            Text("Don't have an account?")
                .font(.caption) // Placeholder for Theme.Typography.body2
                .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
            Button {
                showSignUp = true
            } label: {
                Text("Sign Up")
                    .font(.caption) // Placeholder for Theme.Typography.body2
                    .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
            }
            .buttonStyle(.plain)
            Spacer()
        }
    }
    
    // MARK: - Back Button
    
    struct BackButton: View {
        let action: () -> Void
        
        var body: some View {
            Button {
                action()
            } label: {
                Image(systemName: "chevron.backward")
                    .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
            }
            .buttonStyle(.plain)
        }
    }
}

struct ContentView: View {
    @Binding var email: String
    @Binding var password: String
    @Binding var showPassword: Bool
    @Binding var showForgotPassword: Bool
    @Binding var showSignUp: Bool
    @State var viewModel: AuthViewModel
    @Environment var appState: AppState
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Title
            Text("Welcome Back")
                .font(.largeTitle) // Placeholder for Theme.Typography.display
                .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
            
            // Subtitle
            Text("Sign in to continue")
                .font(.body) // Placeholder for Theme.Typography.body
                .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                .padding(.bottom, 24) // Placeholder for Theme.Spacing.xl
            
            // Form
            VStack(spacing: 16) { // Placeholder for Theme.Spacing.lg
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
                }
                
                // Password Field
                VStack(alignment: .leading, spacing: 8) { // Placeholder for Theme.Spacing.sm
                    Text("Password")
                        .font(.caption) // Placeholder for Theme.Typography.label
                        .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                    
                    HStack {
                        Group {
                            if showPassword {
                                TextField("Password", text: $password)
                            } else {
                                SecureField("Password", text: $password)
                            }
                        }
                        .textContentType(.password)
                        
                        Button {
                            showPassword.toggle()
                        } label: {
                            Image(systemName: showPassword ? "eye.slash" : "eye")
                                .foregroundColor(.gray) // Placeholder for Theme.Colors.textTertiary
                        }
                    }
                }
                
                // Forgot Password Link
                Button {
                    showForgotPassword = true
                } label: {
                    Text("Forgot Password?")
                        .font(.caption) // Placeholder for Theme.Typography.caption1
                        .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                .buttonStyle(.plain)
            }
            .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
            
            // Sign In Button
            Button {
                Task {
                    do {
                        let user = try await viewModel.login(email: email, password: password)
                        appState.currentUser = user
                        appState.isAuthenticated = true
                    } catch {
                        viewModel.handleError(error)
                    }
                }
            } label: {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.blue, in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.primary
                } else {
                    Text("Sign In")
                        .font(.headline) // Placeholder for Theme.Typography.button
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.blue, in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.primary
                }
            }
            .disabled(email.isEmpty || password.isEmpty || viewModel.isLoading)
            .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
            
            // Divider with OR text
            HStack {
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.gray) // Placeholder for Theme.Colors.divider
                Text("OR")
                    .font(.caption) // Placeholder for Theme.Typography.caption1
                    .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                    .padding(.horizontal, 8) // Placeholder for Theme.Spacing.sm
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.gray) // Placeholder for Theme.Colors.divider
            }
            .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
            
            // Social Sign In Buttons
            VStack(spacing: 12) { // Placeholder for Theme.Spacing.md
                // Apple Sign In
                Button {
                    // TODO: Implement Apple Sign In
                } label: {
                    HStack {
                        Image(systemName: "apple.logo")
                            .font(.title3) // Placeholder for Theme.Typography.iconSmall
                        Text("Continue with Apple")
                            .font(.headline) // Placeholder for Theme.Typography.button
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(.black, in: RoundedRectangle(cornerRadius: 10))
                }
                
                // Google Sign In
                Button {
                    // TODO: Implement Google Sign In
                } label: {
                    HStack {
                        // TODO: Use Google icon asset
                        Image(systemName: "g.circle.fill")
                            .font(.title3) // Placeholder for Theme.Typography.iconSmall
                        Text("Continue with Google")
                            .font(.headline) // Placeholder for Theme.Typography.button
                    }
                    .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.backgroundSecondary
                    .overlay {
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1) // Placeholder for Theme.Colors.divider
                    }
                }
            }
            .padding(.bottom, 24) // Placeholder for Theme.Spacing.xl
            
            Spacer(minLength: 24) // Placeholder for Theme.Spacing.xxl
            
            // Sign Up Link
            HStack {
                Text("Don't have an account?")
                    .font(.caption) // Placeholder for Theme.Typography.body2
                    .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                Button {
                    showSignUp = true
                } label: {
                    Text("Sign Up")
                        .font(.caption) // Placeholder for Theme.Typography.body2
                        .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                }
                .buttonStyle(.plain)
                Spacer()
            }
        }
        .padding(.horizontal, 16) // Placeholder for Theme.Spacing.lg
        .padding(.top, 24) // Placeholder for Theme.Spacing.xxl
    }
}

// MARK: - Custom Text Field Style

struct AuthTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(.body) // Placeholder for Theme.Typography.body
            .foregroundColor(.primary) // Placeholder for Theme.Colors.text
            .padding(.horizontal, 16) // Placeholder for Theme.Spacing.md
            .padding(.vertical, 12) // Placeholder for Theme.Spacing.sm
            .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 8)) // Placeholder for Theme.Colors.backgroundSecondary
            .overlay {
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1) // Placeholder for Theme.Colors.divider
            }
    }
}

// #Preview {
//    NavigationStack {
//        LoginView()
//            .environmentObject(AppState())
//    }
//}
