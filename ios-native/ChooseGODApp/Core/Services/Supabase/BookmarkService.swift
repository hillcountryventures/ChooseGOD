import Foundation
import Supabase

/// Service for managing persistent Bible verse bookmarks
final class BookmarkService {
    static let shared = BookmarkService()
    private init() {}

    // MARK: - Private Helpers

    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }

    // MARK: - Insert/Row Types

    private struct BookmarkInsert: Encodable {
        let user_id: String
        let book: String
        let chapter: Int
        let verse: Int
        let verse_text: String
        let translation: String
    }

    struct BookmarkRow: Codable {
        let id: String
        let user_id: String
        let book: String
        let chapter: Int
        let verse: Int
        let verse_text: String
        let translation: String
        let created_at: String
    }

    // MARK: - Public Methods

    /// Save a verse bookmark to Supabase
    func saveBookmark(verse: Verse, userId: String) async throws {
        guard !userId.isEmpty else {
            return
        }

        do {
            let insert = BookmarkInsert(
                user_id: userId,
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verse,
                verse_text: verse.text,
                translation: verse.translation
            )
            try await requireSupabase()
                .from("bookmarks")
                .upsert(insert)
                .execute()
            await HapticManager.shared.success()
        } catch {
            // Silently fail
        }
    }

    /// Remove a verse bookmark from Supabase
    func removeBookmark(book: String, chapter: Int, verse: Int, translation: String, userId: String) async throws {
        guard !userId.isEmpty else {
            return
        }

        do {
            try await requireSupabase()
                .from("bookmarks")
                .delete()
                .eq("user_id", value: userId)
                .eq("book", value: book)
                .eq("chapter", value: chapter)
                .eq("verse", value: verse)
                .eq("translation", value: translation)
                .execute()
            await HapticManager.shared.impact()
        } catch {
            // Silently fail — log but don't crash
        }
    }

    /// Check if a verse is bookmarked
    func isBookmarked(book: String, chapter: Int, verse: Int, translation: String, userId: String) async -> Bool {
        guard !userId.isEmpty else {
            return false
        }

        do {
            let response: [BookmarkRow] = try await requireSupabase()
                .from("bookmarks")
                .select("id")
                .eq("user_id", value: userId)
                .eq("book", value: book)
                .eq("chapter", value: chapter)
                .eq("verse", value: verse)
                .eq("translation", value: translation)
                .limit(1)
                .execute()
                .value
            return !response.isEmpty
        } catch {
            return false
        }
    }

    /// Get all bookmarks for a chapter (returns verse numbers only)
    func getBookmarksForChapter(book: String, chapter: Int, userId: String) async throws -> [Int] {
        guard !userId.isEmpty else {
            return []
        }

        let rows: [BookmarkRow] = try await requireSupabase()
            .from("bookmarks")
            .select()
            .eq("user_id", value: userId)
            .eq("book", value: book)
            .eq("chapter", value: chapter)
            .execute()
            .value

        return rows.map { $0.verse }
    }

    /// Get all bookmarks for a user
    func getAllBookmarks(userId: String) async throws -> [BookmarkRow] {
        guard !userId.isEmpty else {
            return []
        }

        return try await requireSupabase()
            .from("bookmarks")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    /// Get bookmark count for a user
    func getBookmarkCount(userId: String) async throws -> Int {
        guard !userId.isEmpty else {
            return 0
        }

        let response: [BookmarkRow] = try await requireSupabase()
            .from("bookmarks")
            .select("id")
            .eq("user_id", value: userId)
            .execute()
            .value
        return response.count
    }
}
