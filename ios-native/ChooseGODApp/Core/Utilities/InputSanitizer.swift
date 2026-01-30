import Foundation

/// Sanitizes user input for safe use in database queries
enum InputSanitizer {
    
    /// Escape special SQL LIKE/ILIKE characters to prevent pattern injection
    /// - Parameter query: The raw search query
    /// - Returns: Escaped query safe for use in ILIKE patterns
    static func sanitizeSearchQuery(_ query: String) -> String {
        query
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "%", with: "\\%")
            .replacingOccurrences(of: "_", with: "\\_")
    }
}
