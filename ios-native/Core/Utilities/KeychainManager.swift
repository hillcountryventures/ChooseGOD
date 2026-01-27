import Foundation
import Security

/// Secure Keychain storage manager for sensitive data
enum KeychainManager {
    
    // MARK: - Keys
    
    enum Key: String {
        case session = "com.choosegod.session"
        case appleUserId = "com.choosegod.appleUserId"
    }
    
    // MARK: - Errors
    
    enum KeychainError: LocalizedError {
        case saveFailed(OSStatus)
        case readFailed(OSStatus)
        case deleteFailed(OSStatus)
        case dataConversionFailed
        case itemNotFound
        
        var errorDescription: String? {
            switch self {
            case .saveFailed(let status):
                return "Failed to save to Keychain: \(status)"
            case .readFailed(let status):
                return "Failed to read from Keychain: \(status)"
            case .deleteFailed(let status):
                return "Failed to delete from Keychain: \(status)"
            case .dataConversionFailed:
                return "Failed to convert data"
            case .itemNotFound:
                return "Item not found in Keychain"
            }
        }
    }
    
    // MARK: - Save
    
    static func save(key: Key, data: Data) throws {
        // Delete existing item first
        try? delete(key: key)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }
    
    static func save(key: Key, string: String) throws {
        guard let data = string.data(using: .utf8) else {
            throw KeychainError.dataConversionFailed
        }
        try save(key: key, data: data)
    }
    
    // MARK: - Get
    
    static func get(key: Key) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw KeychainError.itemNotFound
            }
            throw KeychainError.readFailed(status)
        }
        
        guard let data = result as? Data else {
            throw KeychainError.dataConversionFailed
        }
        
        return data
    }
    
    static func getString(key: Key) throws -> String {
        let data = try get(key: key)
        guard let string = String(data: data, encoding: .utf8) else {
            throw KeychainError.dataConversionFailed
        }
        return string
    }
    
    // MARK: - Delete
    
    static func delete(key: Key) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status)
        }
    }
    
    // MARK: - Exists
    
    static func exists(key: Key) -> Bool {
        do {
            _ = try get(key: key)
            return true
        } catch {
            return false
        }
    }
    
    // MARK: - Clear All
    
    static func clearAll() {
        for key in [Key.session, Key.appleUserId] {
            try? delete(key: key)
        }
    }
}
