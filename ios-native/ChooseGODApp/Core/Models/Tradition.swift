import Foundation

/// Christian tradition per Strategy Decision #13 (multi-tradition Option D).
/// Sent to the companion edge function on every chat send so AI responses are
/// tradition-aware. Raw values match the `user_preferences.tradition` CHECK
/// constraint defined in migration 050.
enum Tradition: String, CaseIterable, Codable {
    case catholic
    case protestantConservative = "protestant_conservative"
    case protestantProgressive = "protestant_progressive"
    case orthodox
    case nonDenominational = "non_denominational"
    case exploring

    var displayName: String {
        switch self {
        case .catholic: return "Catholic"
        case .protestantConservative: return "Protestant — Conservative"
        case .protestantProgressive: return "Protestant — Progressive"
        case .orthodox: return "Orthodox"
        case .nonDenominational: return "Non-denominational"
        case .exploring: return "Just exploring"
        }
    }

    /// Short label used on tradition picker cards.
    var pickerLabel: String {
        switch self {
        case .catholic: return "Catholic"
        case .protestantConservative: return "Conservative Protestant"
        case .protestantProgressive: return "Progressive Protestant"
        case .orthodox: return "Orthodox"
        case .nonDenominational: return "Non-denominational"
        case .exploring: return "Just exploring"
        }
    }

    var pickerSubtitle: String {
        switch self {
        case .catholic:
            return "Catechism, sacraments, Marian devotion."
        case .protestantConservative:
            return "Scripture-centered, evangelical, traditional theology."
        case .protestantProgressive:
            return "Scripture-rooted, inclusive, social-justice-oriented."
        case .orthodox:
            return "Eastern Orthodox liturgy, Church Fathers, Theotokos."
        case .nonDenominational:
            return "Bible-first, no denominational anchor."
        case .exploring:
            return "Curious. Tradition presented gently, doubt honored."
        }
    }
}
