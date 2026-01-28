import Foundation
import Supabase

/// CRUD service for memory_verses table
final class SupabaseMemoryService {
    
    private var client: SupabaseClient {
        SupabaseManager.shared.client
    }
    
    private let table = "memory_verses"
    
    // MARK: - Fetch
    
    func fetchVerses(userId: String) async throws -> [MemoryVerse] {
        let response: [MemoryVerse] = try await client
            .from(table)
            .select()
            .eq("user_id", value: userId)
            .order("next_review", ascending: true)
            .execute()
            .value
        return response
    }
    
    // MARK: - Add
    
    func addVerse(
        userId: String,
        book: String,
        chapter: Int,
        verseStart: Int,
        verseEnd: Int?,
        text: String,
        translation: String,
        mnemonic: String? = nil,
        storyVersion: String? = nil
    ) async throws -> MemoryVerse {
        let now = Date()
        let payload: [String: AnyJSON] = [
            "user_id": .string(userId),
            "book": .string(book),
            "chapter": .integer(chapter),
            "verse_start": .integer(verseStart),
            "verse_end": verseEnd.map { .integer($0) } ?? .null,
            "text": .string(text),
            "translation": .string(translation),
            "mnemonic": mnemonic.map { .string($0) } ?? .null,
            "story_version": storyVersion.map { .string($0) } ?? .null,
            "ease_factor": .double(SM2.defaultEaseFactor),
            "interval_days": .integer(1),
            "next_review": .string(ISO8601DateFormatter().string(from: now)),
            "review_count": .integer(0),
        ]
        
        let response: MemoryVerse = try await client
            .from(table)
            .insert(payload)
            .select()
            .single()
            .execute()
            .value
        
        return response
    }
    
    // MARK: - Review (Update)
    
    func updateReview(
        verseId: String,
        intervalDays: Int,
        easeFactor: Double,
        nextReview: Date,
        reviewCount: Int
    ) async throws {
        let payload: [String: AnyJSON] = [
            "interval_days": .integer(intervalDays),
            "ease_factor": .double(easeFactor),
            "next_review": .string(ISO8601DateFormatter().string(from: nextReview)),
            "review_count": .integer(reviewCount),
        ]
        
        try await client
            .from(table)
            .update(payload)
            .eq("id", value: verseId)
            .execute()
    }
    
    // MARK: - Delete
    
    func deleteVerse(verseId: String) async throws {
        try await client
            .from(table)
            .delete()
            .eq("id", value: verseId)
            .execute()
    }
}
