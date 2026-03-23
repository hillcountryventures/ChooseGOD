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
                Theme.Colors.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Theme.Spacing.xl) {
                        Text("Create Account")
                            .font(Theme.Typography.title1)
                            .foregroundStyle(Theme.Colors.text)

                        Text("Join us on your spiritual journey")
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.textSecondary)

                        // Apple Sign In Button
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
                        .frame(height: 50)
                        .cornerRadius(Theme.CornerRadius.lg)

                        // Divider
                        HStack {
                            Rectangle().fill(Theme.Colors.textTertiary.opacity(0.3)).frame(height: 1)
                            Text("or email").font(.caption).foregroundStyle(Theme.Colors.textTertiary)
                            Rectangle().fill(Theme.Colors.textTertiary.opacity(0.3)).frame(height: 1)
                        }

                        // Form Fields
                        VStack(spacing: Theme.Spacing.md) {
                            TextField("Full Name", text: $name)
                                .textFieldStyle(.roundedBorder)
                                .onChange(of: name) { _, newValue in
                                    _ = viewModel.validateName(newValue)
                                }

                            TextField("Email", text: $email)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .onChange(of: email) { _, newValue in
                                    _ = viewModel.validateEmail(newValue)
                                }

                            SecureField("Password", text: $password)
                                .textFieldStyle(.roundedBorder)
                                .onChange(of: password) { _, newValue in
                                    _ = viewModel.validatePassword(newValue)
                                }

                            SecureField("Confirm Password", text: $confirmPassword)
                                .textFieldStyle(.roundedBorder)

                            Toggle(isOn: $agreeToTerms) {
                                Text("I agree to Terms & Privacy")
                                    .font(Theme.Typography.bodySmall)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                            }
                            .tint(Theme.Colors.primary)
                        }
                        .padding()
                        .background(Theme.Colors.surface)
                        .cornerRadius(Theme.CornerRadius.lg)

                        // Create Account Button
                        Button {
                            Task { await createAccount() }
                        } label: {
                            Text("Create Account")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(isFormValid ? Theme.Colors.primary : Theme.Colors.primary.opacity(0.5))
                                .foregroundStyle(.white)
                                .cornerRadius(Theme.CornerRadius.lg)
                        }
                        .disabled(!isFormValid || viewModel.isLoading)

                        Spacer(minLength: Theme.Spacing.xl)
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.top, Theme.Spacing.lg)
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.3))
                }
            }
        }
    }

    private var isFormValid: Bool {
        !name.isEmpty &&
        viewModel.validateEmail(email) &&
        viewModel.validatePassword(password) &&
        password == confirmPassword &&
        agreeToTerms
    }

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

#Preview {
    SignUpView()
        .environment(AppState.preview)
}
