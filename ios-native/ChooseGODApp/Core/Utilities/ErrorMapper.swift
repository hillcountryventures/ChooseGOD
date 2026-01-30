import Foundation

// MARK: - App Error Types

/// Unified error type for user-facing error handling
enum AppError: LocalizedError {
    // Network
    case networkUnavailable
    case requestTimeout
    case serverError(statusCode: Int?)

    // Auth
    case invalidCredentials
    case accountNotFound
    case emailAlreadyInUse
    case weakPassword
    case sessionExpired

    // Subscription
    case purchaseFailed(underlying: Error?)
    case restoreFailed

    // Data
    case loadFailed(underlying: Error?)
    case saveFailed(underlying: Error?)

    // Generic
    case unknown(underlying: Error?)

    var errorDescription: String? { userMessage }

    /// User-friendly message suitable for display in alerts/toasts
    var userMessage: String {
        switch self {
        case .networkUnavailable:    return AppStrings.Errors.networkUnavailable
        case .requestTimeout:        return AppStrings.Errors.requestTimeout
        case .serverError:           return AppStrings.Errors.serverError
        case .invalidCredentials:    return AppStrings.Errors.invalidCredentials
        case .accountNotFound:       return AppStrings.Errors.accountNotFound
        case .emailAlreadyInUse:     return AppStrings.Errors.emailAlreadyInUse
        case .weakPassword:          return AppStrings.Errors.weakPassword
        case .sessionExpired:        return AppStrings.Errors.sessionExpired
        case .purchaseFailed:        return AppStrings.Errors.purchaseFailed
        case .restoreFailed:         return AppStrings.Errors.restoreFailed
        case .loadFailed:            return AppStrings.Errors.loadFailed
        case .saveFailed:            return AppStrings.Errors.saveFailed
        case .unknown:               return AppStrings.Errors.somethingWentWrong
        }
    }

    /// Title for alert dialogs
    var alertTitle: String {
        switch self {
        case .networkUnavailable, .requestTimeout:
            return "Connection Issue"
        case .serverError:
            return "Server Error"
        case .invalidCredentials, .accountNotFound, .emailAlreadyInUse, .weakPassword, .sessionExpired:
            return "Sign In Issue"
        case .purchaseFailed, .restoreFailed:
            return "Purchase Issue"
        case .loadFailed, .saveFailed:
            return "Data Error"
        case .unknown:
            return AppStrings.Errors.genericTitle
        }
    }
}

// MARK: - Error Mapper

/// Maps raw errors from services into user-friendly AppErrors
enum ErrorMapper {

    /// Convert any Error into a displayable AppError
    static func map(_ error: Error) -> AppError {
        // Already an AppError
        if let appError = error as? AppError {
            return appError
        }

        let nsError = error as NSError

        // URLSession / network errors
        if nsError.domain == NSURLErrorDomain {
            switch nsError.code {
            case NSURLErrorNotConnectedToInternet,
                 NSURLErrorNetworkConnectionLost,
                 NSURLErrorDataNotAllowed:
                return .networkUnavailable
            case NSURLErrorTimedOut:
                return .requestTimeout
            default:
                return .serverError(statusCode: nil)
            }
        }

        // Supabase auth error strings (common patterns)
        let message = error.localizedDescription.lowercased()
        if message.contains("invalid login") || message.contains("invalid credentials") {
            return .invalidCredentials
        }
        if message.contains("user not found") || message.contains("no user") {
            return .accountNotFound
        }
        if message.contains("already registered") || message.contains("already in use") || message.contains("duplicate") {
            return .emailAlreadyInUse
        }
        if message.contains("weak password") || message.contains("password") && message.contains("short") {
            return .weakPassword
        }
        if message.contains("expired") || message.contains("refresh") {
            return .sessionExpired
        }
        if message.contains("edge function") || message.contains("500") || message.contains("502") || message.contains("503") {
            return .serverError(statusCode: nil)
        }

        return .unknown(underlying: error)
    }

    /// Convenience: returns just the user-facing message string
    static func userMessage(for error: Error) -> String {
        map(error).userMessage
    }
}
