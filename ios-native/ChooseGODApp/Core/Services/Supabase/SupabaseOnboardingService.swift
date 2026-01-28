import Foundation

// MARK: - Onboarding Data Models

enum LifeAreaFocus: String, CaseIterable, Identifiable, Codable {
    case anxiety, marriage, parenting, finances, grief, prayer, knowingGod = "knowing_god", forgiveness
    
    var id: String { rawValue }
    
    var label: String {
        switch self {
        case .anxiety: return "Anxiety & Worry"
        case .marriage: return "Marriage"
        case .parenting: return "Parenting"
        case .finances: return "Finances"
        case .grief: return "Grief & Loss"
        case .prayer: return "Prayer Life"
        case .knowingGod: return "Knowing God"
        case .forgiveness: return "Forgiveness"
        }
    }
    
    var icon: String {
        switch self {
        case .anxiety: return "brain.head.profile"
        case .marriage: return "heart.fill"
        case .parenting: return "figure.and.child.holdinghands"
        case .finances: return "banknote.fill"
        case .grief: return "leaf.fill"
        case .prayer: return "hands.sparkles.fill"
        case .knowingGod: return "book.closed.fill"
        case .forgiveness: return "arrow.uturn.backward.circle.fill"
        }
    }
    
    var color: String {
        switch self {
        case .anxiety: return "6366F1"
        case .marriage: return "EC4899"
        case .parenting: return "F59E0B"
        case .finances: return "22C55E"
        case .grief: return "8B5CF6"
        case .prayer: return "3B82F6"
        case .knowingGod: return "A78BFA"
        case .forgiveness: return "14B8A6"
        }
    }
}

enum TimeAvailable: String, CaseIterable, Identifiable, Codable {
    case short = "5-10min"
    case medium = "10-20min"
    case long = "20+min"
    
    var id: String { rawValue }
    
    var label: String {
        switch self {
        case .short: return "5–10 minutes"
        case .medium: return "10–20 minutes"
        case .long: return "20+ minutes"
        }
    }
    
    var icon: String {
        switch self {
        case .short: return "clock.badge.checkmark"
        case .medium: return "clock.fill"
        case .long: return "clock.arrow.circlepath"
        }
    }
    
    var description: String {
        switch self {
        case .short: return "Quick daily reading"
        case .medium: return "Thoughtful study time"
        case .long: return "Deep dive into the Word"
        }
    }
}

enum ExperienceLevel: String, CaseIterable, Identifiable, Codable {
    case new, growing, deep
    
    var id: String { rawValue }
    
    var label: String {
        switch self {
        case .new: return "Just Starting"
        case .growing: return "Growing"
        case .deep: return "Going Deeper"
        }
    }
    
    var icon: String {
        switch self {
        case .new: return "sparkle"
        case .growing: return "leaf.arrow.circlepath"
        case .deep: return "mountain.2.fill"
        }
    }
    
    var description: String {
        switch self {
        case .new: return "New to faith or the Bible"
        case .growing: return "Building my daily practice"
        case .deep: return "Ready for deeper study"
        }
    }
}

enum LifeStage: String, CaseIterable, Identifiable, Codable {
    case single, married, parent, emptyNester = "empty_nester"
    
    var id: String { rawValue }
    
    var label: String {
        switch self {
        case .single: return "Single"
        case .married: return "Married"
        case .parent: return "Parent"
        case .emptyNester: return "Empty Nester"
        }
    }
    
    var icon: String {
        switch self {
        case .single: return "person.fill"
        case .married: return "person.2.fill"
        case .parent: return "figure.2.and.child.holdinghands"
        case .emptyNester: return "house.fill"
        }
    }
}

// MARK: - Quiz Responses

struct OnboardingResponses: Codable {
    var lifeAreaFocus: LifeAreaFocus?
    var timeAvailable: TimeAvailable?
    var experienceLevel: ExperienceLevel?
    var lifeStage: LifeStage?
    
    var isComplete: Bool {
        lifeAreaFocus != nil && timeAvailable != nil && experienceLevel != nil && lifeStage != nil
    }
}

// MARK: - Recommendation

struct SeriesRecommendation: Identifiable {
    let id: String
    let title: String
    let description: String
    let totalDays: Int
    let matchScore: Double
    let matchReasons: [String]
    let coverImageUrl: String?
    let topics: [String]
}

// MARK: - Service Protocol

protocol OnboardingServiceProtocol {
    func saveResponses(_ responses: OnboardingResponses, userId: String) async throws
    func getRecommendations(for responses: OnboardingResponses) async throws -> [SeriesRecommendation]
}

// MARK: - Supabase Implementation

final class SupabaseOnboardingService: OnboardingServiceProtocol {
    
    func saveResponses(_ responses: OnboardingResponses, userId: String) async throws {
        // TODO: Wire to Supabase client
        // For now, save locally
        let data = try JSONEncoder().encode(responses)
        UserDefaults.standard.set(data, forKey: "onboarding_responses_\(userId)")
    }
    
    func getRecommendations(for responses: OnboardingResponses) async throws -> [SeriesRecommendation] {
        // TODO: Call Supabase RPC for real recommendations
        // Return curated defaults based on quiz answers
        try await Task.sleep(for: .seconds(1)) // Simulate network
        
        var recs: [SeriesRecommendation] = []
        
        if let focus = responses.lifeAreaFocus {
            recs.append(SeriesRecommendation(
                id: "rec-\(focus.rawValue)",
                title: "Finding Peace: \(focus.label)",
                description: "A \(responses.timeAvailable == .long ? "deep" : "focused") journey through scripture addressing \(focus.label.lowercased()).",
                totalDays: responses.timeAvailable == .short ? 7 : 14,
                matchScore: 0.95,
                matchReasons: ["Matches your focus area", "Right for your experience level"],
                coverImageUrl: nil,
                topics: [focus.rawValue]
            ))
        }
        
        recs.append(SeriesRecommendation(
            id: "rec-foundations",
            title: "Foundations of Faith",
            description: "Essential truths every believer needs. Perfect for building a strong daily habit.",
            totalDays: 21,
            matchScore: 0.85,
            matchReasons: ["Great starting point", "Builds daily habits"],
            coverImageUrl: nil,
            topics: ["faith", "basics"]
        ))
        
        recs.append(SeriesRecommendation(
            id: "rec-psalms",
            title: "Psalms for Every Season",
            description: "Walk through the Psalms and discover God's comfort, praise, and promises.",
            totalDays: 30,
            matchScore: 0.78,
            matchReasons: ["Popular series", "Applies to every life stage"],
            coverImageUrl: nil,
            topics: ["psalms", "comfort"]
        ))
        
        return recs
    }
}

// MARK: - Mock for Previews

final class MockOnboardingService: OnboardingServiceProtocol {
    func saveResponses(_ responses: OnboardingResponses, userId: String) async throws {}
    
    func getRecommendations(for responses: OnboardingResponses) async throws -> [SeriesRecommendation] {
        [
            SeriesRecommendation(id: "1", title: "Finding Peace", description: "A journey through anxiety and trust.", totalDays: 14, matchScore: 0.95, matchReasons: ["Matches your focus"], coverImageUrl: nil, topics: ["anxiety"]),
            SeriesRecommendation(id: "2", title: "Foundations of Faith", description: "Essential truths for every believer.", totalDays: 21, matchScore: 0.85, matchReasons: ["Great starting point"], coverImageUrl: nil, topics: ["faith"]),
        ]
    }
}
