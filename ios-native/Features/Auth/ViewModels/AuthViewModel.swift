import SwiftUI
import Observation

/// ViewModel for authentication screens
@Observable
final class AuthViewModel {
    // MARK: - State
    var isLoading = false
    var errorMessage: String?
    var showError = false
    
    // Form validation
    var emailError: String?
    var passwordError: String?
    var nameError: String?
    
    // MARK: - Validation
    
    func validateEmail(_ email: String) -> Bool {
        let emailRegex = #"^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        let isValid = email.range(of: emailRegex, options: .regularExpression) != nil
        
        if !isValid && !email.isEmpty {
            emailError = "Please enter a valid email address"
        } else {
            emailError = nil
        }
        
        return isValid
    }
    
    func validatePassword(_ password: String) -> Bool {
        let isValid = password.count >= 8
        
        if !isValid && !password.isEmpty {
            passwordError = "Password must be at least 8 characters"
        } else {
            passwordError = nil
        }
        
        return isValid
    }
    
    func validateName(_ name: String) -> Bool {
        let isValid = name.trimmingCharacters(in: .whitespaces).count >= 2
        
        if !isValid && !name.isEmpty {
            nameError = "Please enter your name"
        } else {
            nameError = nil
        }
        
        return isValid
    }
    
    // MARK: - Error Handling
    
    func handleError(_ error: Error) {
        if let authError = error as? AuthError {
            errorMessage = authError.errorDescription
        } else {
            errorMessage = error.localizedDescription
        }
        showError = true
    }
    
    func clearErrors() {
        errorMessage = nil
        showError = false
        emailError = nil
        passwordError = nil
        nameError = nil
    }
}
