import XCTest
import Foundation
@testable import ChooseGODApp

class ErrorMapperTests: XCTestCase {
    
    func testNSURLErrorMapping() {
        // Test network errors
        let notConnectedError = NSError(domain: NSURLErrorDomain, code: NSURLErrorNotConnectedToInternet, userInfo: nil)
        let mappedError = ErrorMapper.map(notConnectedError)
        
        switch mappedError {
        case .network(let message):
            XCTAssertTrue(message.contains("internet connection"))
        default:
            XCTFail("Expected network error")
        }
        
        // Test timeout error
        let timeoutError = NSError(domain: NSURLErrorDomain, code: NSURLErrorTimedOut, userInfo: nil)
        let mappedTimeout = ErrorMapper.map(timeoutError)
        
        switch mappedTimeout {
        case .network(let message):
            XCTAssertTrue(message.contains("timeout"))
        default:
            XCTFail("Expected network timeout error")
        }
        
        // Test DNS lookup failure
        let dnsError = NSError(domain: NSURLErrorDomain, code: NSURLErrorCannotFindHost, userInfo: nil)
        let mappedDns = ErrorMapper.map(dnsError)
        
        switch mappedDns {
        case .network(let message):
            XCTAssertTrue(message.contains("server"))
        default:
            XCTFail("Expected network server error")
        }
    }
    
    func testSupabaseErrorMapping() {
        // Test authentication error
        let authError = NSError(domain: "SupabaseAuth", code: 401, userInfo: [
            NSLocalizedDescriptionKey: "Invalid login credentials"
        ])
        let mappedAuth = ErrorMapper.map(authError)
        
        switch mappedAuth {
        case .authentication(let message):
            XCTAssertTrue(message.contains("email") || message.contains("password"))
        default:
            XCTFail("Expected authentication error")
        }
        
        // Test server error
        let serverError = NSError(domain: "SupabaseREST", code: 500, userInfo: [
            NSLocalizedDescriptionKey: "Internal server error"
        ])
        let mappedServer = ErrorMapper.map(serverError)
        
        switch mappedServer {
        case .server(let message):
            XCTAssertTrue(message.contains("server"))
        default:
            XCTFail("Expected server error")
        }
        
        // Test rate limiting
        let rateLimitError = NSError(domain: "SupabaseREST", code: 429, userInfo: [
            NSLocalizedDescriptionKey: "Too many requests"
        ])
        let mappedRateLimit = ErrorMapper.map(rateLimitError)
        
        switch mappedRateLimit {
        case .rateLimited(let message):
            XCTAssertTrue(message.contains("slow down") || message.contains("try again"))
        default:
            XCTFail("Expected rate limit error")
        }
    }
    
    func testValidationErrorMapping() {
        let validationError = NSError(domain: "ValidationError", code: 400, userInfo: [
            NSLocalizedDescriptionKey: "Email is required"
        ])
        let mappedValidation = ErrorMapper.map(validationError)
        
        switch mappedValidation {
        case .validation(let message):
            XCTAssertTrue(message.contains("Email"))
        default:
            XCTFail("Expected validation error")
        }
    }
    
    func testGenericErrorFallback() {
        // Test unknown error gets mapped to generic
        let unknownError = NSError(domain: "UnknownDomain", code: 999, userInfo: [
            NSLocalizedDescriptionKey: "Something weird happened"
        ])
        let mappedGeneric = ErrorMapper.map(unknownError)
        
        switch mappedGeneric {
        case .generic(let message):
            XCTAssertTrue(message.contains("Something went wrong"))
        default:
            XCTFail("Expected generic error fallback")
        }
    }
    
    func testUserFriendlyMessages() {
        // Verify that all error messages use AppStrings and are user-friendly
        let networkError = NSError(domain: NSURLErrorDomain, code: NSURLErrorNotConnectedToInternet, userInfo: nil)
        let mapped = ErrorMapper.map(networkError)
        
        switch mapped {
        case .network(let message):
            // Should not contain technical jargon
            XCTAssertFalse(message.contains("NSURLError"))
            XCTAssertFalse(message.contains("domain"))
            XCTAssertFalse(message.contains("nil"))
            // Should be encouraging and helpful
            XCTAssertTrue(message.count > 20) // Meaningful message length
        default:
            XCTFail("Expected network error")
        }
    }
}