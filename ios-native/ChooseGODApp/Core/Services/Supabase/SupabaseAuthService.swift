import Foundation
import AuthenticationServices
import CryptoKit
import Supabase

/// Supabase-backed authentication service with Apple Sign-In support
final class SupabaseAuthService: NSObject, AuthServiceProtocol {
    
    // MARK: - Properties
    
    private(set) var currentUser: User?
    
    var isAuthenticated: Bool {
        currentUser != nil
    }
    
    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }
    private var currentNonce: String?
    
    // Continuation for async Apple Sign In
    private var appleSignInContinuation: CheckedContinuation<ASAuthorization, Error>?
    
    // MARK: - Apple Sign In
    
    func signInWithApple() async throws -> User {
        // 1. Generate nonce for security
        let nonce = try generateNonce()
        currentNonce = nonce
        
        // 2. Create Apple ID request
        let appleIDProvider = ASAuthorizationAppleIDProvider()
        let request = appleIDProvider.createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
        
        // 3. Present Apple Sign In UI and wait for result
        let authorization = try await performAppleSignIn(request: request)
        
        // 4. Extract credential
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = appleIDCredential.identityToken,
              let idTokenString = String(data: identityToken, encoding: .utf8) else {
            throw AuthError.appleSignInFailed(NSError(domain: "AppleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get identity token"]))
        }
        
        // 5. Sign in with Supabase using Apple ID token
        let session = try await requireSupabase().auth.signInWithIdToken(
            credentials: .init(
                provider: .apple,
                idToken: idTokenString,
                nonce: nonce
            )
        )
        
        // 6. Create/update user profile with Apple name if provided
        var displayName: String? = nil
        if let fullName = appleIDCredential.fullName {
            let formatter = PersonNameComponentsFormatter()
            displayName = formatter.string(from: fullName)
        }
        
        // 7. Upsert user profile in database
        let user = try await createOrUpdateUserProfile(
            authUser: session.user,
            displayName: displayName,
            email: appleIDCredential.email
        )
        
        // 8. Store session securely
        try await storeSession(session)
        
        currentUser = user
        // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.identify(user.id, properties: ["email": user.email])
        // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("login_completed", properties: ["method": "apple"])
        return user
    }
    
    /// Perform Apple Sign In using ASAuthorizationController
    private func performAppleSignIn(request: ASAuthorizationAppleIDRequest) async throws -> ASAuthorization {
        return try await withCheckedThrowingContinuation { continuation in
            self.appleSignInContinuation = continuation
            
            let authorizationController = ASAuthorizationController(authorizationRequests: [request])
            authorizationController.delegate = self
            authorizationController.presentationContextProvider = self
            authorizationController.performRequests()
        }
    }
    
    // MARK: - Email/Password Auth
    
    func signInWithEmail(email: String, password: String) async throws -> User {
        do {
            let session = try await requireSupabase().auth.signIn(
                email: email,
                password: password
            )
            
            let user = try await fetchUserProfile(authUser: session.user)
            try await storeSession(session)
            
            currentUser = user
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.identify(user.id, properties: ["email": user.email])
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("login_completed", properties: ["method": "email"])
            return user
        } catch {
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("error", properties: ["source": "auth", "method": "email_login", "message": error.localizedDescription])
            throw mapSupabaseError(error)
        }
    }
    
    func signUp(email: String, password: String, name: String) async throws -> User {
        guard password.count >= 8 else {
            throw AuthError.weakPassword
        }
        
        do {
            let session = try await requireSupabase().auth.signUp(
                email: email,
                password: password,
                data: ["display_name": .string(name)]
            )
            
            let authUser = session.user
            
            let user = try await createOrUpdateUserProfile(
                authUser: authUser,
                displayName: name,
                email: email
            )
            
            if let session = session.session {
                try await storeSession(session)
            }
            
            currentUser = user
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.identify(user.id, properties: ["email": user.email])
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("signup_completed", properties: ["method": "email"])
            return user
        } catch {
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("error", properties: ["source": "auth", "method": "email_signup", "message": error.localizedDescription])
            throw mapSupabaseError(error)
        }
    }
    
    // MARK: - Session Management
    
    func signOut() async throws {
        try await requireSupabase().auth.signOut()
        try KeychainManager.delete(key: .session)
        currentUser = nil
        // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.reset()
    }
    
    func restoreSession() async -> Session? {
        // 1. Try to get stored session from Keychain
        guard let sessionData = try? KeychainManager.get(key: .session),
              let storedSession = try? JSONDecoder().decode(StoredSession.self, from: sessionData) else {
            return nil
        }
        
        // 2. Check if session is expired
        if storedSession.expiresAt < Date() {
            try? KeychainManager.delete(key: .session)
            return nil
        }
        
        // 3. Restore session with Supabase
        do {
            let session = try await requireSupabase().auth.setSession(
                accessToken: storedSession.accessToken,
                refreshToken: storedSession.refreshToken
            )
            
            let user = try await fetchUserProfile(authUser: session.user)
            currentUser = user
            
            return Session(
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
                user: user,
                expiresAt: Date(timeIntervalSince1970: session.expiresAt)
            )
        } catch {
            try? KeychainManager.delete(key: .session)
            return nil
        }
    }
    
    func resetPassword(email: String) async throws {
        try await requireSupabase().auth.resetPasswordForEmail(email)
    }
    
    func deleteAccount() async throws {
        guard let userId = currentUser?.id else {
            throw AuthError.userNotFound
        }
        
        // Call Supabase edge function or RPC for account deletion
        do {
            try await requireSupabase().rpc("delete_user_account", params: ["user_id": userId])
                .execute()
        } catch {
            // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("error", properties: ["source": "auth", "method": "delete_account", "message": error.localizedDescription])
            throw error
        }
        
        // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("account_deleted")
        try await signOut()
    }
    
    // MARK: - Private Helpers
    
    private func createOrUpdateUserProfile(
        authUser: Supabase.User,
        displayName: String?,
        email: String?
    ) async throws -> User {
        let profile = UserProfile(
            id: authUser.id.uuidString,
            email: email ?? authUser.email ?? "",
            displayName: displayName ?? "User",
            createdAt: Date(),
            updatedAt: Date()
        )
        
        // Upsert to profiles table
        try await requireSupabase().from("profiles")
            .upsert(profile)
            .execute()
        
        return User(
            id: profile.id,
            email: profile.email,
            displayName: profile.displayName,
            avatarUrl: nil,
            isPremium: false,
            createdAt: profile.createdAt
        )
    }
    
    private func fetchUserProfile(authUser: Supabase.User) async throws -> User {
        let profile: UserProfile = try await requireSupabase().from("profiles")
            .select()
            .eq("id", value: authUser.id.uuidString)
            .single()
            .execute()
            .value
        
        // Also check subscription status
        let isPremium = await RevenueCatService.shared.checkPremiumStatus()
        
        return User(
            id: profile.id,
            email: profile.email,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            isPremium: isPremium,
            createdAt: profile.createdAt
        )
    }
    
    private func storeSession(_ session: Supabase.Session) async throws {
        let storedSession = StoredSession(
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresAt: Date(timeIntervalSince1970: session.expiresAt)
        )
        
        let data = try JSONEncoder().encode(storedSession)
        try KeychainManager.save(key: .session, data: data)
    }
    
    private func mapSupabaseError(_ error: Error) -> AuthError {
        let errorString = error.localizedDescription.lowercased()
        
        if errorString.contains("invalid login") || errorString.contains("invalid password") {
            return .invalidCredentials
        } else if errorString.contains("already registered") || errorString.contains("already exists") {
            return .emailAlreadyExists
        } else if errorString.contains("network") || errorString.contains("connection") {
            return .networkError
        }
        
        return .unknown(error)
    }
    
    // MARK: - Cryptographic Helpers for Apple Sign In
    
    private func generateNonce(length: Int = 32) throws -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            throw AuthError.unknown(NSError(domain: "Nonce", code: Int(errorCode), userInfo: [NSLocalizedDescriptionKey: "Unable to generate secure nonce"]))
        }
        
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        let nonce = randomBytes.map { byte in
            charset[Int(byte) % charset.count]
        }
        
        return String(nonce)
    }
    
    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        let hashString = hashedData.compactMap {
            String(format: "%02x", $0)
        }.joined()
        
        return hashString
    }
}

// MARK: - ASAuthorizationControllerDelegate

extension SupabaseAuthService: ASAuthorizationControllerDelegate {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        appleSignInContinuation?.resume(returning: authorization)
        appleSignInContinuation = nil
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        appleSignInContinuation?.resume(throwing: AuthError.appleSignInFailed(error))
        appleSignInContinuation = nil
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding

extension SupabaseAuthService: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Get the key window for presentation
        // This delegate method cannot throw, so we use a fallback UIWindow
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            // Return a new window as fallback rather than crashing
            return UIWindow()
        }
        return window
    }
}

// MARK: - Supporting Types

private struct StoredSession: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Date
}

private struct UserProfile: Codable {
    let id: String
    let email: String
    let displayName: String
    var avatarUrl: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Date Helper

private func parseDate(_ dateString: String) -> Date {
    ISO8601DateFormatter().date(from: dateString) ?? Date()
}
