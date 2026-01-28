import Foundation
import Supabase

/// Supabase-backed Bible service for fetching verses
final class SupabaseBibleService: BibleServiceProtocol {
    
    private var supabase: SupabaseClient {
        guard let client = SupabaseManager.shared.client else {
            fatalError("Supabase client not initialized")
        }
        return client
    }
    
    // MARK: - BibleServiceProtocol
    
    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [Verse] {
        let response: [BibleVerseRow] = try await supabase
            .from("bible_verses")
            .select()
            .eq("book", value: book)
            .eq("chapter", value: chapter)
            .eq("translation", value: translation.rawValue)
            .order("verse")
            .execute()
            .value
        
        return response.map { row in
            Verse(
                id: "\(row.book)-\(row.chapter)-\(row.verse)",
                book: row.book,
                chapter: row.chapter,
                verse: row.verse,
                text: row.text,
                translation: row.translation
            )
        }
    }
    
    func searchVerses(query: String, translation: BibleTranslation, limit: Int) async throws -> [Verse] {
        // Text search using ilike
        let response: [BibleVerseRow] = try await supabase
            .from("bible_verses")
            .select()
            .eq("translation", value: translation.rawValue)
            .ilike("text", pattern: "%\(query)%")
            .limit(limit)
            .execute()
            .value
        
        return response.map { row in
            Verse(
                id: "\(row.book)-\(row.chapter)-\(row.verse)",
                book: row.book,
                chapter: row.chapter,
                verse: row.verse,
                text: row.text,
                translation: row.translation
            )
        }
    }
    
    func getDailyVerse() async throws -> Verse {
        // Get verse of the day based on date seed
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        
        // Popular verses for daily rotation
        let dailyVerses = [
            ("John", 3, 16),
            ("Jeremiah", 29, 11),
            ("Philippians", 4, 13),
            ("Proverbs", 3, 5),
            ("Romans", 8, 28),
            ("Isaiah", 41, 10),
            ("Psalm", 23, 1),
            ("Matthew", 11, 28),
            ("Joshua", 1, 9),
            ("Psalm", 46, 1),
        ]
        
        let index = dayOfYear % dailyVerses.count
        let (book, chapter, verse) = dailyVerses[index]
        
        let response: [BibleVerseRow] = try await supabase
            .from("bible_verses")
            .select()
            .eq("book", value: book)
            .eq("chapter", value: chapter)
            .eq("verse", value: verse)
            .eq("translation", value: "KJV")
            .limit(1)
            .execute()
            .value
        
        guard let row = response.first else {
            // Return fallback
            return Verse(
                id: "john-3-16",
                book: "John",
                chapter: 3,
                verse: 16,
                text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
                translation: "KJV"
            )
        }
        
        return Verse(
            id: "\(row.book)-\(row.chapter)-\(row.verse)",
            book: row.book,
            chapter: row.chapter,
            verse: row.verse,
            text: row.text,
            translation: row.translation
        )
    }
    
    // MARK: - Highlights
    
    func getHighlights(userId: String, book: String, chapter: Int) async throws -> [VerseHighlight] {
        try await supabase
            .from("verse_highlights")
            .select()
            .eq("user_id", value: userId)
            .eq("book", value: book)
            .eq("chapter", value: chapter)
            .execute()
            .value
    }
    
    func saveHighlight(_ highlight: VerseHighlight) async throws {
        try await supabase
            .from("verse_highlights")
            .upsert(highlight)
            .execute()
    }
    
    func deleteHighlight(id: String) async throws {
        try await supabase
            .from("verse_highlights")
            .delete()
            .eq("id", value: id)
            .execute()
    }
    
    // MARK: - Bookmarks
    
    func getBookmarks(userId: String) async throws -> [VerseBookmark] {
        try await supabase
            .from("verse_bookmarks")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    func saveBookmark(_ bookmark: VerseBookmark) async throws {
        try await supabase
            .from("verse_bookmarks")
            .upsert(bookmark)
            .execute()
    }
    
    func deleteBookmark(id: String) async throws {
        try await supabase
            .from("verse_bookmarks")
            .delete()
            .eq("id", value: id)
            .execute()
    }
    
    // MARK: - Notes
    
    func getNotes(userId: String, book: String, chapter: Int) async throws -> [VerseNote] {
        try await supabase
            .from("verse_notes")
            .select()
            .eq("user_id", value: userId)
            .eq("book", value: book)
            .eq("chapter", value: chapter)
            .execute()
            .value
    }
    
    func saveNote(_ note: VerseNote) async throws {
        try await supabase
            .from("verse_notes")
            .upsert(note)
            .execute()
    }
    
    func deleteNote(id: String) async throws {
        try await supabase
            .from("verse_notes")
            .delete()
            .eq("id", value: id)
            .execute()
    }
}

// MARK: - Database Row Types

private struct BibleVerseRow: Codable {
    let id: Int
    let book: String
    let chapter: Int
    let verse: Int
    let text: String
    let translation: String
}
