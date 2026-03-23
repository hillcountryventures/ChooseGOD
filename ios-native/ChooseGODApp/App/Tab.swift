import SwiftUI

/// Application tab navigation enum
enum Tab: Int, CaseIterable {
    case home
    case discover
    case bible
    case journey
    case prayers

    var title: String {
        switch self {
        case .home: return "Home"
        case .discover: return "Discover"
        case .bible: return "Bible"
        case .journey: return "Journey"
        case .prayers: return "Prayers"
        }
    }

    var icon: String {
        switch self {
        case .home: return "house"
        case .discover: return "safari"
        case .bible: return "book"
        case .journey: return "chart.line.uptrend.xyaxis"
        case .prayers: return "hands.sparkles"
        }
    }

    var selectedIcon: String {
        switch self {
        case .home: return "house.fill"
        case .discover: return "safari.fill"
        case .bible: return "book.fill"
        case .journey: return "chart.line.uptrend.xyaxis"
        case .prayers: return "hands.sparkles.fill"
        }
    }
}
