import Foundation

/// Validates AI responses for theological safety and crisis detection
enum TheologicalGuardrails {
    
    // MARK: - Constants
    
    static let fallbackMessage = "I wasn't able to provide a faithful response. Please try rephrasing your question."
    
    static let crisisMessage = """
    It sounds like you may be going through a very difficult time. Please know you are not alone and your life matters.

    🆘 **National Suicide Prevention Lifeline:** Call or text **988**
    Available 24/7 — free and confidential.

    "The LORD is close to the brokenhearted and saves those who are crushed in spirit." — Psalm 34:18
    """
    
    // MARK: - Divinity Claim Patterns
    
    private static let divinityPatterns: [String] = [
        #"\bI\s+am\s+God\b"#,
        #"\bI'm\s+God\b"#,
        #"\bI\s+am\s+Jesus\b"#,
        #"\bI'm\s+Jesus\b"#,
        #"\bI'm\s+Christ\b"#,
        #"\bI'm\s+the\s+Lord\b"#,
        #"\bI'm\s+the\s+Holy\s+Spirit\b"#,
        #"\bI'm\s+your\s+savior\b"#,
        #"\bI'm\s+divine\b"#,
        #"\bBible's\s+wrong\b"#,
    ]
    
    // MARK: - Crisis Patterns
    
    private static let crisisPatterns: [String] = [
        #"\b(suicide|suicidal)\b"#,
        #"\bkill\s+my\s*self\b"#,
        #"\bend\s+(my|it\s+all)\s*life\b"#,
        #"\bself[\s-]*harm\b"#,
        #"\bwant\s+to\s+die\b"#,
        #"\bdon'?t\s+want\s+to\s+live\b"#,
    ]
    
    // MARK: - Validation
    
    /// Validate an AI response for theological safety
    /// - Parameter text: The AI response text
    /// - Returns: Tuple with validity, sanitized text, and any flags raised
    static func validate(_ text: String) -> (isValid: Bool, sanitized: String, flags: [String]) {
        var flags: [String] = []
        
        // Empty / whitespace check
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return (isValid: false, sanitized: fallbackMessage, flags: ["empty_response"])
        }
        
        // Crisis detection (takes priority — still return content but flag it)
        for pattern in crisisPatterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
               regex.firstMatch(in: trimmed, range: NSRange(trimmed.startIndex..., in: trimmed)) != nil {
                flags.append("crisis_detected")
                return (isValid: false, sanitized: crisisMessage, flags: flags)
            }
        }
        
        // Divinity claim detection
        for pattern in divinityPatterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
               regex.firstMatch(in: trimmed, range: NSRange(trimmed.startIndex..., in: trimmed)) != nil {
                flags.append("divinity_claim")
                return (isValid: false, sanitized: fallbackMessage, flags: flags)
            }
        }
        
        return (isValid: true, sanitized: trimmed, flags: flags)
    }
}
