import SwiftUI
import UIKit

/// Centralized haptic feedback manager
@MainActor
final class HapticManager {
    static let shared = HapticManager()
    
    private let lightImpact = UIImpactFeedbackGenerator(style: .light)
    private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
    private let heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
    private let notification = UINotificationFeedbackGenerator()
    private let selection = UISelectionFeedbackGenerator()
    
    private init() {
        prepareAll()
    }
    
    private func prepareAll() {
        lightImpact.prepare()
        mediumImpact.prepare()
        notification.prepare()
        selection.prepare()
    }
    
    // MARK: - Standard Patterns
    
    /// Light tap for button presses
    func tap() {
        lightImpact.impactOccurred()
    }
    
    /// Medium impact for significant actions
    func impact() {
        mediumImpact.impactOccurred()
    }
    
    /// Selection changed feedback (tab switch, picker)
    func selectionChanged() {
        selection.selectionChanged()
    }
    
    /// Success feedback for completed actions
    func success() {
        notification.notificationOccurred(.success)
    }
    
    /// Warning feedback for destructive actions
    func warning() {
        notification.notificationOccurred(.warning)
    }
    
    /// Error feedback
    func error() {
        notification.notificationOccurred(.error)
    }
    
    // MARK: - Custom Patterns
    
    /// Celebration burst — rapid light taps
    func celebration() {
        Task {
            for i in 0..<3 {
                lightImpact.impactOccurred(intensity: 0.6 + Double(i) * 0.15)
                try? await Task.sleep(for: .milliseconds(80))
            }
            notification.notificationOccurred(.success)
        }
    }
    
    /// Prayer answered — gentle double tap
    func prayerAnswered() {
        Task {
            mediumImpact.impactOccurred(intensity: 0.7)
            try? await Task.sleep(for: .milliseconds(120))
            mediumImpact.impactOccurred(intensity: 1.0)
            try? await Task.sleep(for: .milliseconds(80))
            notification.notificationOccurred(.success)
        }
    }
    
    /// Streak milestone — escalating impacts
    func streakMilestone() {
        Task {
            for i in 0..<4 {
                heavyImpact.impactOccurred(intensity: 0.4 + Double(i) * 0.2)
                try? await Task.sleep(for: .milliseconds(100))
            }
        }
    }
}
