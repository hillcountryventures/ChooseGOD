import Foundation
import Supabase

/// Singleton manager for Supabase client
final class SupabaseManager {
    
    // MARK: - Singleton
    
    static let shared = SupabaseManager()
    
    // MARK: - Properties
    
    /// The main Supabase client
    /// Access this for all Supabase operations
    private(set) var client: SupabaseClient!
    
    /// Whether the client has been initialized
    var isInitialized: Bool {
        client != nil
    }
    
    // MARK: - Configuration
    
    /// Supabase project URL
    /// Replace with your actual Supabase URL
    private let supabaseURL = "https://your-project.supabase.co"
    
    /// Supabase anon/public key
    /// Replace with your actual anon key
    /// Note: This is safe to include in the app - it's a public key
    private let supabaseAnonKey = "your-anon-key-here"
    
    // MARK: - Initialization
    
    private init() {}
    
    /// Initialize the Supabase client
    /// Call this early in app startup
    func initialize() async {
        guard !isInitialized else { return }
        
        client = SupabaseClient(
            supabaseURL: URL(string: supabaseURL)!,
            supabaseKey: supabaseAnonKey,
            options: .init(
                auth: .init(
                    storage: KeychainAuthStorage(),
                    flowType: .pkce
                ),
                global: .init(
                    headers: [
                        "X-Client-Info": "choosegod-ios/1.0.0"
                    ]
                )
            )
        )
    }
}

// MARK: - Keychain Auth Storage

/// Custom auth storage using Keychain for secure token persistence
struct KeychainAuthStorage: AuthLocalStorage {
    private let key = "supabase.auth.token"
    
    func store(key: String, value: Data) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: value,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        // Delete existing
        SecItemDelete(query as CFDictionary)
        
        // Add new
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw NSError(domain: "Keychain", code: Int(status))
        }
    }
    
    func retrieve(key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecItemNotFound {
            return nil
        }
        
        guard status == errSecSuccess else {
            throw NSError(domain: "Keychain", code: Int(status))
        }
        
        return result as? Data
    }
    
    func remove(key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw NSError(domain: "Keychain", code: Int(status))
        }
    }
}

// MARK: - Configuration from Environment

extension SupabaseManager {
    /// Load configuration from Info.plist or environment
    /// Use this in production to avoid hardcoding keys
    static func loadConfiguration() -> (url: String, key: String)? {
        guard let url = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              let key = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String else {
            return nil
        }
        return (url, key)
    }
}
