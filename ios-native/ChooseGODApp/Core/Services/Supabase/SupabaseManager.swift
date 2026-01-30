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
    
    /// Reads Supabase URL from Info.plist (set via xcconfig)
    private var supabaseURL: String {
        guard let url = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String, !url.isEmpty else {
            fatalError("SUPABASE_URL not set in Info.plist — check your xcconfig files")
        }
        return url
    }
    
    /// Reads Supabase anon key from Info.plist (set via xcconfig)
    private var supabaseAnonKey: String {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String, !key.isEmpty else {
            fatalError("SUPABASE_ANON_KEY not set in Info.plist — check your xcconfig files")
        }
        return key
    }
    
    // MARK: - Initialization
    
    private init() {}
    
    /// Initialize the Supabase client
    /// Call this early in app startup
    func initialize() async {
        guard !isInitialized else { return }
        
        print("[SupabaseManager] URL: \(supabaseURL.isEmpty ? "MISSING" : "SET")")
        print("[SupabaseManager] Anon Key: \(supabaseAnonKey.isEmpty ? "MISSING" : "SET")")
        
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
