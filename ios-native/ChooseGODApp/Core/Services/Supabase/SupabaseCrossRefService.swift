import Foundation
import Supabase

/// Fetches cross-references from Supabase (Treasury of Scripture Knowledge)
final class SupabaseCrossRefService {
    static let shared = SupabaseCrossRefService()
    
    private let cache = NSCache<NSString, CachedRefs>()
    
    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }
    
    private init() {
        cache.countLimit = 100
    }
    
    // MARK: - RPC Param Types
    
    private struct RefParams: Codable {
        let p_book: String
        let p_chapter: Int
        let p_verse: Int
        let p_translation: String
        let p_limit: Int
        let p_min_votes: Int
    }
    
    private struct IdParams: Codable {
        let p_verse_id: Int
        let p_translation: String
        let p_limit: Int
        let p_min_votes: Int
    }
    
    /// Fetch cross-references by book/chapter/verse
    func fetchCrossReferences(
        book: String,
        chapter: Int,
        verse: Int,
        translation: String = "kjv",
        limit: Int = 10
    ) async throws -> [CrossReference] {
        let cacheKey = NSString(string: "\(book)-\(chapter)-\(verse)-\(translation)-\(limit)")
        
        if let cached = cache.object(forKey: cacheKey),
           Date().timeIntervalSince(cached.timestamp) < 300 {
            return cached.refs
        }
        
        let params = RefParams(
            p_book: book,
            p_chapter: chapter,
            p_verse: verse,
            p_translation: translation.lowercased(),
            p_limit: limit,
            p_min_votes: 0
        )
        
        let response = try await requireSupabase()
            .rpc("get_cross_references_by_ref", params: params)
            .execute()
        
        let refs = try JSONDecoder().decode([CrossReference].self, from: response.data)
        cache.setObject(CachedRefs(refs: refs), forKey: cacheKey)
        return refs
    }
    
    /// Fetch cross-references by verse database ID
    func fetchCrossReferences(
        verseId: Int,
        translation: String = "kjv",
        limit: Int = 10
    ) async throws -> [CrossReference] {
        let cacheKey = NSString(string: "id-\(verseId)-\(translation)-\(limit)")
        
        if let cached = cache.object(forKey: cacheKey),
           Date().timeIntervalSince(cached.timestamp) < 300 {
            return cached.refs
        }
        
        let params = IdParams(
            p_verse_id: verseId,
            p_translation: translation.lowercased(),
            p_limit: limit,
            p_min_votes: 0
        )
        
        let response = try await requireSupabase()
            .rpc("get_cross_references", params: params)
            .execute()
        
        let refs = try JSONDecoder().decode([CrossReference].self, from: response.data)
        cache.setObject(CachedRefs(refs: refs), forKey: cacheKey)
        return refs
    }
    
    /// Group cross-references by book
    func groupByBook(_ refs: [CrossReference]) -> [GroupedCrossReferences] {
        let grouped = Dictionary(grouping: refs) { $0.book }
        return grouped.map { book, references in
            GroupedCrossReferences(
                book: book,
                references: references.sorted { $0.votes > $1.votes }
            )
        }
        .sorted { a, b in
            let maxA = a.references.map(\.votes).max() ?? 0
            let maxB = b.references.map(\.votes).max() ?? 0
            return maxA > maxB
        }
    }
}

// MARK: - Cache Entry

private class CachedRefs {
    let refs: [CrossReference]
    let timestamp: Date
    
    init(refs: [CrossReference]) {
        self.refs = refs
        self.timestamp = Date()
    }
}

// MARK: - Errors

enum CrossRefError: LocalizedError {
    case notInitialized
    case fetchFailed(String)
    
    var errorDescription: String? {
        switch self {
        case .notInitialized: return "Supabase not initialized"
        case .fetchFailed(let msg): return "Failed to fetch cross-references: \(msg)"
        }
    }
}
