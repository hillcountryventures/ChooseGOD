import Foundation
import Supabase

// MARK: - Protocol

protocol JournalServiceProtocol {
    func getMoments(userId: String, type: MomentType?, limit: Int, offset: Int) async throws -> [SpiritualMoment]
    func getMoment(id: String) async throws -> SpiritualMoment
    func createMoment(_ moment: SpiritualMoment) async throws -> SpiritualMoment
    func updateMoment(_ moment: SpiritualMoment) async throws
    func deleteMoment(id: String) async throws
    func searchMoments(userId: String, query: String) async throws -> [SpiritualMoment]
}

// MARK: - Supabase Implementation

final class SupabaseJournalService: JournalServiceProtocol {
    
    private var supabase: SupabaseClient {
        guard let client = SupabaseManager.shared.client else {
            fatalError("Supabase client not initialized")
        }
        return client
    }
    
    private let tableName = "spiritual_moments"
    
    func getMoments(userId: String, type: MomentType? = nil, limit: Int = 50, offset: Int = 0) async throws -> [SpiritualMoment] {
        var query = supabase
            .from(tableName)
            .select()
            .eq("user_id", value: userId)
        
        if let type = type {
            query = query.eq("moment_type", value: type.rawValue)
        }
        
        return try await query
            .order("created_at", ascending: false)
            .range(from: offset, to: offset + limit - 1)
            .execute()
            .value
    }
    
    func getMoment(id: String) async throws -> SpiritualMoment {
        try await supabase
            .from(tableName)
            .select()
            .eq("id", value: id)
            .single()
            .execute()
            .value
    }
    
    func createMoment(_ moment: SpiritualMoment) async throws -> SpiritualMoment {
        try await supabase
            .from(tableName)
            .insert(moment)
            .select()
            .single()
            .execute()
            .value
    }
    
    func updateMoment(_ moment: SpiritualMoment) async throws {
        try await supabase
            .from(tableName)
            .update(moment)
            .eq("id", value: moment.id)
            .execute()
    }
    
    func deleteMoment(id: String) async throws {
        try await supabase
            .from(tableName)
            .delete()
            .eq("id", value: id)
            .execute()
    }
    
    func searchMoments(userId: String, query: String) async throws -> [SpiritualMoment] {
        try await supabase
            .from(tableName)
            .select()
            .eq("user_id", value: userId)
            .ilike("content", pattern: "%\(InputSanitizer.sanitizeSearchQuery(query))%")
            .order("created_at", ascending: false)
            .limit(30)
            .execute()
            .value
    }
}

// MARK: - Mock Implementation

final class MockJournalService: JournalServiceProtocol {
    
    private var moments: [SpiritualMoment] = SpiritualMoment.samples
    
    func getMoments(userId: String, type: MomentType?, limit: Int, offset: Int) async throws -> [SpiritualMoment] {
        var result = moments
        if let type = type {
            result = result.filter { $0.momentType == type }
        }
        return Array(result.dropFirst(offset).prefix(limit))
    }
    
    func getMoment(id: String) async throws -> SpiritualMoment {
        guard let moment = moments.first(where: { $0.id == id }) else {
            throw NSError(domain: "Journal", code: 404, userInfo: [NSLocalizedDescriptionKey: "Moment not found"])
        }
        return moment
    }
    
    func createMoment(_ moment: SpiritualMoment) async throws -> SpiritualMoment {
        moments.insert(moment, at: 0)
        return moment
    }
    
    func updateMoment(_ moment: SpiritualMoment) async throws {
        if let idx = moments.firstIndex(where: { $0.id == moment.id }) {
            moments[idx] = moment
        }
    }
    
    func deleteMoment(id: String) async throws {
        moments.removeAll { $0.id == id }
    }
    
    func searchMoments(userId: String, query: String) async throws -> [SpiritualMoment] {
        moments.filter { $0.content.localizedCaseInsensitiveContains(query) }
    }
}

// MARK: - Sample Data

extension SpiritualMoment {
    static let samples: [SpiritualMoment] = [
        SpiritualMoment(
            id: "sample-1",
            userId: "local-user",
            momentType: .journal,
            content: "Today I was struck by how God's faithfulness shows up in the small things. The sunrise reminded me of His mercies being new every morning. I want to carry this gratitude throughout the day.",
            linkedVerses: [VerseSource(book: "Lamentations", chapter: 3, verse: 23, text: "They are new every morning; great is your faithfulness.", translation: "ESV")],
            themes: ["gratitude", "faithfulness"],
            createdAt: Date().addingTimeInterval(-86400),
            status: .published,
            source: JournalSource(type: .standalone)
        ),
        SpiritualMoment(
            id: "sample-2",
            userId: "local-user",
            momentType: .gratitude,
            content: "I am grateful for:\n• My family's health\n• A kind word from a stranger\n• The peace I felt during prayer this morning",
            linkedVerses: [],
            themes: ["gratitude"],
            createdAt: Date().addingTimeInterval(-172800),
            status: .published,
            source: JournalSource(type: .standalone)
        ),
        SpiritualMoment(
            id: "sample-3",
            userId: "local-user",
            momentType: .prayer,
            content: "Lord, give me wisdom as I navigate this decision at work. Help me to trust You fully and not lean on my own understanding.",
            linkedVerses: [VerseSource(book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the LORD with all your heart and lean not on your own understanding.", translation: "NIV")],
            themes: ["wisdom", "trust"],
            createdAt: Date().addingTimeInterval(-259200),
            status: .published,
            source: JournalSource(type: .standalone)
        ),
    ]
}
