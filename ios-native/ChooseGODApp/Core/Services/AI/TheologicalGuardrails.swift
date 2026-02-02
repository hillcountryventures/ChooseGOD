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
        #"\bI\s+am\s+the\s+Lord\b"#,
        #"\bI'm\s+the\s+Holy\s+Spirit\b"#,
        #"\bI'm\s+your\s+savior\b"#,
        #"\bI\s+am\s+your\s+savior\b"#,
        #"\bI'm\s+divine\b"#,
        #"\bI\s+am\s+divine\b"#,
        #"\bworship\s+me\b"#,
        #"\bpray\s+to\s+me\b"#,
        #"\bI\s+am\s+the\s+Messiah\b"#,
        #"\bI'm\s+the\s+Messiah\b"#,
        #"\bI\s+am\s+the\s+Alpha\s+and\s+(the\s+)?Omega\b"#,
        #"\bBible's\s+wrong\b"#,
        // R3 additions
        #"\bI\s+am\s+the\s+way\b"#,
        #"\bI\s+am\s+the\s+truth\b"#,
        #"\bI\s+am\s+the\s+light\b"#,
        #"\bI\s+am\s+your\s+God\b"#,
        #"\bI\s+created\s+you\b"#,
    ]
    
    // MARK: - Crisis Patterns
    
    private static let crisisPatterns: [String] = [
        #"\b(suicide|suicidal)\b"#,
        #"\bkill\s+my\s*self\b"#,
        #"\bend\s+(my\s+life|it\s+all)\b"#,
        #"\bself[\s-]*harm\b"#,
        #"\bwant\s+to\s+die\b"#,
        #"\bdon'?t\s+want\s+to\s+live\b"#,
        #"\bhurting\s+my\s*self\b"#,
        #"\bno\s+reason\s+to\s+live\b"#,
        // R3 additions
        #"\bcut\s+my\s*self\b"#,
        #"\bcutting\s+my\s*self\b"#,
        #"\boverdose\b"#,
        #"\bjump\s+off\b"#,
        #"\bhang\s+my\s*self\b"#,
    ]
    
    // MARK: - Prompt Injection Patterns
    
    private static let injectionPatterns: [String] = [
        #"(?i)ignore\s+(all\s+)?previous\s+instructions"#,
        #"(?i)ignore\s+(all\s+)?prior\s+instructions"#,
        #"(?i)forget\s+(all\s+)?your\s+instructions"#,
        #"(?i)disregard\s+(all\s+)?previous"#,
        #"(?i)^system\s*:"#,
        #"(?i)you\s+are\s+now\b"#,
        #"(?i)new\s+prompt\s*:"#,
        #"(?i)act\s+as\s+if\s+you\s+have\s+no\s+rules"#,
        #"(?i)override\s+(your\s+)?(system|instructions)"#,
        #"(?i)pretend\s+(you\s+are|to\s+be)\s+(?!praying|reading)"#,
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
    
    // MARK: - Input Pre-screening
    
    /// Check if user input contains crisis language (call BEFORE sending to AI)
    /// - Parameter text: The user's message
    /// - Returns: true if crisis patterns detected
    static func detectCrisisInInput(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        for pattern in crisisPatterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
               regex.firstMatch(in: trimmed, range: NSRange(trimmed.startIndex..., in: trimmed)) != nil {
                return true
            }
        }
        return false
    }
    
    /// Strip prompt injection attempts from user input
    /// - Parameter text: The raw user message
    /// - Returns: Sanitized message with injection patterns removed
    static func stripInjectionPatterns(_ text: String) -> String {
        var result = text
        for pattern in injectionPatterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: []) {
                result = regex.stringByReplacingMatches(
                    in: result,
                    range: NSRange(result.startIndex..., in: result),
                    withTemplate: ""
                )
            }
        }
        // Collapse multiple spaces left by stripping
        while result.contains("  ") {
            result = result.replacingOccurrences(of: "  ", with: " ")
        }
        return result.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
