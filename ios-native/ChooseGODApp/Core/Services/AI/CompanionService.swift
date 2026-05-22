import os
import Foundation
import Supabase

/// Service for calling the Supabase "companion" Edge Function
final class CompanionService {
    
    static let shared = CompanionService()
    private init() {}
    
    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }
    
    /// Send a message to the companion AI
    func sendMessage(
        message: String,
        conversationHistory: [ChatMessage],
        contextMode: ChatMode = .auto,
        verseContext: ChatBibleContext? = nil
    ) async throws -> CompanionResponse {
        // Get current user ID
        let session = try await requireSupabase().auth.session
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
        
        // Hydrate the user's tradition + intention lazily so they're available
        // for the context bundle. Both load() calls are idempotent.
        if !UserPreferencesService.shared.isLoaded {
            await UserPreferencesService.shared.load(userId: userId)
        }
        if !UserIntentionsService.shared.isLoaded {
            await UserIntentionsService.shared.load(userId: userId)
        }
        let tradition = UserPreferencesService.shared.tradition.rawValue

        // Decision G1 — assemble the personalization bundle. Cached for 5 min
        // so consecutive chat turns don't re-query Supabase.
        let userContext = await UserContextService.shared.bundle(for: userId)

        let request = CompanionRequest(
            userId: userId,
            message: message,
            conversationHistory: history,
            contextMode: contextMode.rawValue,
            verseContext: versePayload,
            tradition: tradition,
            userContext: userContext.isEmpty ? nil : userContext
        )
        
        let response: CompanionResponse = try await requireSupabase().functions.invoke(
            "companion",
            options: .init(body: request)
        )
        
        return response
    }
}
