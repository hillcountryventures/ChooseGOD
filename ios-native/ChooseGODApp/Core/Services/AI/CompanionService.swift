import Foundation
import Supabase

/// Service for calling the Supabase "companion" Edge Function
final class CompanionService {
    
    static let shared = CompanionService()
    private init() {}
    
    private var supabase: SupabaseClient {
        guard let client = SupabaseManager.shared.client else {
            fatalError("Supabase client not initialized")
        }
        return client
    }
    
    /// Send a message to the companion AI
    func sendMessage(
        message: String,
        conversationHistory: [ChatMessage],
        contextMode: ChatMode = .auto,
        verseContext: ChatBibleContext? = nil
    ) async throws -> CompanionResponse {
        // Get current user ID
        let session = try await supabase.auth.session
        let userId = session.user.id.uuidString
        
        // Build conversation history payload
        let history = conversationHistory.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        }
        
        // Build verse context if available
        var versePayload: CompanionRequest.VerseContextPayload?
        if let ctx = verseContext {
            versePayload = CompanionRequest.VerseContextPayload(
                book: ctx.book,
                chapter: ctx.chapter,
                verse: ctx.selectedVerse?.verse,
                text: ctx.selectedVerse?.text
            )
        }
        
        let request = CompanionRequest(
            userId: userId,
            message: message,
            conversationHistory: history,
            contextMode: contextMode.rawValue,
            verseContext: versePayload
        )
        
        let response: CompanionResponse = try await supabase.functions.invoke(
            "companion",
            options: .init(body: request)
        )
        
        return response
    }
    
    /// Log chat interaction for analytics (fire and forget)
    func logInteraction(query: String, response: String, sources: [VerseSource]?, responseTimeMs: Int) {
        Task {
            do {
                let session = try await supabase.auth.session
                let userId = session.user.id.uuidString
                
                let payload: [String: AnyEncodable] = [
                    "user_id": AnyEncodable(userId),
                    "query": AnyEncodable(query),
                    "response": AnyEncodable(String(response.prefix(2000))),
                    "sources": AnyEncodable(sources ?? []),
                    "response_time_ms": AnyEncodable(responseTimeMs),
                    "created_at": AnyEncodable(ISO8601DateFormatter().string(from: Date()))
                ]
                
                try await supabase.from("chat_logs").insert(payload).execute()
            } catch {
                // Silently fail — analytics should not disrupt UX
                print("[CompanionService] Analytics log failed: \(error.localizedDescription)")
            }
        }
    }
}

// MARK: - Type-erased Encodable wrapper

struct AnyEncodable: Encodable {
    private let _encode: (Encoder) throws -> Void
    
    init<T: Encodable>(_ wrapped: T) {
        _encode = { encoder in
            try wrapped.encode(to: encoder)
        }
    }
    
    func encode(to encoder: Encoder) throws {
        try _encode(encoder)
    }
}
