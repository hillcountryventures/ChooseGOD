import Foundation
import Supabase

/// Service for managing verse highlights
final class HighlightService {
    static let shared = HighlightService()
    private let bibleService = SupabaseBibleService()
    private init() {}

    // MARK: - Public Methods

    /// Get all highlights for a chapter
    func getHighlightsForChapter(book: String, chapter: Int, userId: String) async throws -> [VerseHighlight] {
        try await bibleService.getHighlights(userId: userId, book: book, chapter: chapter)
    }

    /// Save a highlight
    func saveHighlight(_ highlight: VerseHighlight) async throws {
        try await bibleService.saveHighlight(highlight)
    }

    /// Remove a highlight by ID
    func removeHighlight(id: String) async throws {
        try await bibleService.deleteHighlight(id: id)
    }

    /// Toggle a highlight (add, change color, or remove)
    func toggleHighlight(
        verse: Verse,
        color: HighlightColor,
        userId: String,
        existingHighlight: VerseHighlight?
    ) async throws -> VerseHighlight? {
        if let existing = existingHighlight {
            if existing.color == color {
                // Same color — remove highlight
                try await removeHighlight(id: existing.id)
                return nil
            } else {
                // Different color — update
                let updated = VerseHighlight(
                    id: existing.id,
                    userId: userId,
                    book: verse.book,
                    chapter: verse.chapter,
                    verse: verse.verse,
                    color: color,
                    createdAt: existing.createdAt
                )
                try await saveHighlight(updated)
                return updated
            }
        } else {
            // New highlight
            let highlight = VerseHighlight(
                id: UUID().uuidString,
                userId: userId,
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verse,
                color: color,
                createdAt: Date()
            )
            try await saveHighlight(highlight)
            return highlight
        }
    }
}
