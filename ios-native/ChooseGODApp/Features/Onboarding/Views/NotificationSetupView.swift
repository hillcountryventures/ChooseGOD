import os
import SwiftUI

/// Onboarding screen for notification permission request
struct NotificationSetupView: View {
    let onContinue: () -> Void
    
    @State private var isRequesting = false
    @State private var permissionGranted: Bool?
    
    private let notificationTypes: [(icon: String, title: String, description: String, color: Color)] = [
        ("sun.max.fill", "Morning Devotional", "Start each day with Scripture & reflection", Theme.Colors.accent),
        ("moon.stars.fill", "Evening Reflection", "Wind down with gratitude & prayer", Theme.Colors.primary),
        ("hands.sparkles.fill", "Prayer Reminders", "Stay connected in prayer throughout the day", Theme.Colors.prayer),
    ]
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                // Bell icon
                ZStack {
                    Circle()
                        .fill(Theme.Colors.primaryAlpha(0.15))
                        .frame(width: 100, height: 100)
                    
                    Image(systemName: "bell.badge.fill")
                        .font(Theme.Typography.iconLarge)
                        .foregroundStyle(Theme.Colors.primary)
                        .symbolEffect(.bounce, value: isRequesting)
                }
                
                // Title
                VStack(spacing: 8) {
                    Text("Stay Connected")
                        .font(Theme.Typography.title1)
                        .foregroundStyle(Theme.Colors.text)
                    
                    Text("Get gentle reminders to walk with God daily")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.xl)
                }
                
                // Notification type previews
                VStack(spacing: 12) {
                    ForEach(Array(notificationTypes.enumerated()), id: \.offset) { _, item in
                        notificationPreviewRow(
                            icon: item.icon,
                            title: item.title,
                            description: item.description,
                            color: item.color
                        )
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                
                Spacer()
                
                // Buttons
                VStack(spacing: 12) {
                    if let granted = permissionGranted {
                        // Post-permission state
                        HStack(spacing: 8) {
                            Image(systemName: granted ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .foregroundStyle(granted ? Theme.Colors.success : Theme.Colors.textSecondary)
                            Text(granted ? "Notifications enabled!" : "You can enable later in Settings")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(granted ? Theme.Colors.success : Theme.Colors.textSecondary)
                        }
                        .padding(.bottom, Theme.Spacing.sm)
                        
                        Button(action: onContinue) {
                            Text("Continue")
                        .accessibilityLabel("Continue")
                        .accessibilityHint("Double tap to proceed")
                                .font(Theme.Typography.button)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Theme.Spacing.md)
                                .background(Theme.Colors.primary, in: Capsule())
                        }
                    } else {
                        // Pre-permission
                        Button(action: requestPermission) {
                            HStack(spacing: 8) {
                                if isRequesting {
                                    ShimmerView(height: 20)
                                        .tint(.white)
                                } else {
                                    Image(systemName: "bell.fill")
                                    Text("Enable Notifications")
                                }
                            }
                            .font(Theme.Typography.button)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Theme.Spacing.md)
                            .background(Theme.Colors.primary, in: Capsule())
                        }
                        .disabled(isRequesting)
                        
                        Button(action: onContinue) {
                            Text("Maybe Later")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(Theme.Colors.textTertiary)
                        }
                    }
                }
                .padding(.horizontal, Theme.Spacing.xl)
                .padding(.bottom, Theme.Spacing.xl)
            }
        }
        // TODO: Fix AnalyticsService import - .onAppear { AnalyticsService.shared.screen("onboarding_notifications") }
    }
    
    // MARK: - Subviews
    
    @ViewBuilder
    private func notificationPreviewRow(icon: String, title: String, description: String, color: Color) -> some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .fill(color.opacity(0.15))
                    .frame(width: 44, height: 44)
                
                Image(systemName: icon)
                    .font(Theme.Typography.title3)
                    .foregroundStyle(color)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.text)
                
                Text(description)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            
            Spacer()
        }
        .padding(Theme.Spacing.mds)
        .modifier(GlassCard(cornerRadius: Theme.CornerRadius.xl, opacity: 0.5))
    }
    
    // MARK: - Actions
    
    private func requestPermission() {
        isRequesting = true
        Task {
            do {
                let granted = try await NotificationService.shared.requestPermission()
                if granted {
                    await NotificationService.shared.configureFromPreferences(UserPreferences.load())
                }
                await MainActor.run {
                    withAnimation {
                        permissionGranted = granted
                        isRequesting = false
                    }
                }
            } catch {
                await MainActor.run {
                    permissionGranted = false
                    isRequesting = false
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NotificationSetupView {
        Logger(subsystem: "com.choosegod.app", category: "onboarding").debug("Notification setup continue tapped")
    }
}
