import Foundation
import os

/// Router that dispatches Bible requests to the appropriate service based on translation
/// Currently all translations come from Supabase, but architecture is ready for:
/// - scripture.api.bible (keyed) for NIV/ESV/NLT if needed
/// - A Bíblia Digital (keyed) for Portuguese NVI if needed
final class BibleServiceRouter: BibleServiceProtocol {
    private let logger = Logger(subsystem: "com.choosegod.bible-router", category: "service")

    private let supabaseService: BibleServiceProtocol
    // Keep these for future use when keyed APIs are integrated
    private let scriptureApiService: ScriptureAPIBibleServiceProtocol
    private let abibliaService: AbibliaDigitalServiceProtocol

    init(
        supabaseService: BibleServiceProtocol = SupabaseBibleService(),
        scriptureApiService: ScriptureAPIBibleServiceProtocol = ScriptureAPIBibleService.shared,
        abibliaService: AbibliaDigitalServiceProtocol = AbibliaDigitalService.shared
    ) {
        self.supabaseService = supabaseService
        self.scriptureApiService = scriptureApiService
        self.abibliaService = abibliaService
    }

    // MARK: - BibleServiceProtocol

    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [Verse] {
        // Full-offline: if this translation is downloaded, serve from disk first
        // (instant + works with no signal).
        if OfflineBibleStore.shared.isDownloaded(translation),
           let offline = OfflineBibleStore.shared.chapter(book: book, chapter: chapter, translation: translation) {
            return offline
        }

        // Otherwise hit the network. If that fails (offline, not downloaded),
        // make one last attempt to serve any locally cached copy before erroring.
        do {
            return try await supabaseService.fetchChapter(book: book, chapter: chapter, translation: translation)
        } catch {
            if let offline = OfflineBibleStore.shared.chapter(book: book, chapter: chapter, translation: translation) {
                return offline
            }
            throw error
        }
    }

    func searchVerses(query: String, translation: BibleTranslation, limit: Int) async throws -> [Verse] {
        return try await supabaseService.searchVerses(query: query, translation: translation, limit: limit)
    }

    func getDailyVerse() async throws -> Verse {
        return try await supabaseService.getDailyVerse()
    }
}
