import Foundation

/// Protocol defining authentication service capabilities
/// Allows for easy mocking in tests and previews
protocol AuthServiceProtocol {
    /// Current authenticated user, if any
    var currentUser: User? { get }
    
    /// Whether user is currently authenticated
    var isAuthenticated: Bool { get }
    
    /// Sign in with Apple ID (native iOS)
    /// - Returns: Authenticated user
    /// - Throws: AuthError if sign in fails
    func signInWithApple() async throws -> User
    
    /// Sign in with email and password
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    /// - Returns: Authenticated user
    /// - Throws: AuthError if credentials invalid
    func signInWithEmail(email: String, password: String) async throws -> User
    
    /// Create new account with email
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    ///   - name: User's display name
    /// - Returns: Newly created user
    /// - Throws: AuthError if registration fails
    func signUp(email: String, password: String, name: String) async throws -> User
    
    /// Sign out current user
    /// - Throws: AuthError if sign out fails
    func signOut() async throws
    
    /// Send password reset email
    /// - Parameter email: User's email address
    /// - Throws: AuthError if email not found
    func resetPassword(email: String) async throws
    
    /// Restore previous session from Keychain
    /// - Returns: Restored session or nil if no valid session
    func restoreSession() async -> Session?
    
    /// Delete user account permanently
    /// - Throws: AuthError if deletion fails
    func deleteAccount() async throws
}

// MARK: - Auth Error Types

enum AuthError: LocalizedError {
    case invalidCredentials
    case emailAlreadyExists
    case weakPassword
    case networkError
    case appleSignInFailed(Error)
    case sessionExpired
    case userNotFound
    case deletionFailed
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password. Please try again."
        case .emailAlreadyExists:
            return "An account with this email already exists."
        case .weakPassword:
            return "Password must be at least 8 characters."
        case .networkError:
            return "Network error. Please check your connection."
        case .appleSignInFailed(let error):
            return "Apple Sign In failed: \(error.localizedDescription)"
        case .sessionExpired:
            return "Your session has expired. Please sign in again."
        case .userNotFound:
            return "No account found with this email."
        case .deletionFailed:
            return "Failed to delete account. Please try again."
        case .unknown(let error):
            return "An error occurred: \(error.localizedDescription)"
        }
    }
}

// MARK: - Session Model

struct Session {
    let accessToken: String
    let refreshToken: String
    let user: User
    let expiresAt: Date
    
    var isExpired: Bool {
        Date() >= expiresAt
    }
}
