import SwiftUI
import StoreKit

/// Celebration screen after completing a devotional day
struct DevotionalCompleteView: View {
    let series: DevotionalSeries
    let dayNumber: Int
    let totalDays: Int
    var onContinue: (() -> Void)?
    var onDoneForToday: (() -> Void)?
    
    @Environment(\.dismiss) private var dismiss
    
    @State private var showIcon = false
    @State private var showContent = false
    @State private var showProgress = false
    @State private var showButtons = false
    @State private var progressValue: Double = 0
    @State private var showShareSheet = false
    @State private var streak: Int = 0
    
    private var isSeriesComplete: Bool { dayNumber >= totalDays }
    
    private static let encouragements = [
        "Well done! You're building a beautiful habit.",
        "Your faithfulness is inspiring!",
        "One day at a time, one step closer to God.",
        "You're investing in what matters most.",
        "Keep pressing on in faith!",
        "God sees your dedication. You're doing great!",
    ]
    
    @State private var encouragement = encouragements.randomElement() ?? "Keep pressing on in faith!"
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            VStack(spacing: 0) {
                Spacer()
                
                // Icon
                iconSection
                
                // Title
                Text(isSeriesComplete ? "Journey Complete!" : "Day Complete!")
                    .font(Theme.Typography.chapterTitle)
                    .foregroundStyle(Theme.Colors.text)
                    .opacity(showContent ? 1 : 0)
                    .offset(y: showContent ? 0 : 20)
                    .padding(.bottom, 6)
                
                if !isSeriesComplete {
                    Text("Day \(dayNumber) of \(totalDays)")
                        .font(Theme.Typography.bodyLarge)
                        .foregroundStyle(Theme.Colors.primary)
                        .fontWeight(.semibold)
                        .opacity(showContent ? 1 : 0)
                }
                
                Text(series.title)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .opacity(showContent ? 1 : 0)
                    .padding(.top, 4)
                    .padding(.bottom, Theme.Spacing.md)
                
                // Encouragement
                Text(encouragement)
                    .font(Theme.Typography.scripture)
                    .italic()
                    .foregroundStyle(Theme.Colors.text)
                    .multilineTextAlignment(.center)
                    .opacity(showContent ? 1 : 0)
                    .padding(.horizontal, Theme.Spacing.xl)
                    .padding(.bottom, Theme.Spacing.lg)
                
                // Streak card
                if streak > 0 {
                    streakCard
                        .opacity(showContent ? 1 : 0)
                        .scaleEffect(showContent ? 1 : 0.8)
                        .padding(.bottom, Theme.Spacing.mdl)
                }
                
                // Progress bar (non-complete)
                if !isSeriesComplete {
                    progressSection
                        .opacity(showProgress ? 1 : 0)
                        .padding(.horizontal, Theme.Spacing.xl)
                        .padding(.bottom, Theme.Spacing.mdl)
                }
                
                // Series complete message
                if isSeriesComplete {
                    completeMessage
                        .opacity(showProgress ? 1 : 0)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .padding(.bottom, Theme.Spacing.mdl)
                }
                
                // Share button
                Button {
                    showShareSheet = true
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share Progress")
                    }
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.primary)
                }
                .opacity(showContent ? 1 : 0)
                .padding(.bottom, Theme.Spacing.sm)
                
                Spacer()
                
                // Buttons
                footerButtons
                    .opacity(showButtons ? 1 : 0)
                    .offset(y: showButtons ? 0 : 30)
            }
        }
        .sheet(isPresented: $showShareSheet) {
            DevotionalShareSheet(activityItems: [shareText])
        }
        .onAppear {
            // Record activity and get real streak
            // TODO: Fix StreakManager import - streak = StreakManager.shared.recordActivity()
            
            // Trigger review request after devotional completion
            // TODO: Fix ReviewRequestManager import - ReviewRequestManager.shared.requestAfterDevotionalComplete()
            
            // Check streak milestone too
            // TODO: Fix ReviewRequestManager import - ReviewRequestManager.shared.requestIfStreakMilestone(streak)
            
            runEntryAnimation()
        }
    }
    
    // MARK: - Icon
    
    private var iconSection: some View {
        ZStack {
            Circle()
                .fill(series.gradient)
                .frame(width: 120, height: 120)
                .themeShadow(Theme.Shadows.lg)
            
            Image(systemName: isSeriesComplete ? "trophy.fill" : "checkmark.circle.fill")
                .font(Theme.Typography.iconXXL)
                .foregroundStyle(.white)
        }
        .scaleEffect(showIcon ? 1 : 0.3)
        .opacity(showIcon ? 1 : 0)
        .padding(.bottom, 28)
    }
    
    // MARK: - Streak Card
    
    private var streakCard: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Theme.Colors.accent.opacity(0.15))
                    .frame(width: 56, height: 56)
                Image(systemName: "flame.fill")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.accent)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text("\(streak)")
                    .font(Theme.Typography.display)
                    .foregroundStyle(Theme.Colors.accent)
                Text("Day Streak")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(.white.opacity(0.08))
                )
        }
    }
    
    // MARK: - Progress
    
    private var progressSection: some View {
        VStack(spacing: 8) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.sm)
                        .fill(Theme.Colors.surfaceElevated)
                        .frame(height: 8)
                    
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.sm)
                        .fill(
                            LinearGradient(
                                colors: [Theme.Colors.primary, Theme.Colors.primaryLight],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * progressValue, height: 8)
                }
            }
            .frame(height: 8)
            
            Text("\(totalDays - dayNumber) days remaining")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
    
    // MARK: - Complete Message
    
    private var completeMessage: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "heart.fill")
                .foregroundStyle(Theme.Colors.prayer)
            
            Text("You've completed this devotional journey. May God continue to bless your walk with Him!")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .lineSpacing(4)
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(Theme.Colors.surface)
        }
    }
    
    // MARK: - Footer Buttons
    
    private var footerButtons: some View {
        VStack(spacing: 12) {
            Button {
                if let onContinue {
                    onContinue()
                } else {
                    dismiss()
                }
            } label: {
                HStack(spacing: 8) {
                    Text(isSeriesComplete ? "Back to Devotionals" : "Continue to Day \(dayNumber + 1)")
                        .font(Theme.Typography.button)
                    Image(systemName: "arrow.right")
                        .font(Theme.Typography.subheadlineSemibold)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Theme.Dimensions.buttonHeight)
                .background(
                    LinearGradient(
                        colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                        startPoint: .leading, endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
                .themeShadow(Theme.Shadows.md)
            }
            
            if !isSeriesComplete {
                Button {
                    if let onDoneForToday {
                        onDoneForToday()
                    } else {
                        dismiss()
                    }
                } label: {
                    Text("Done for Today")
                        .accessibilityLabel("Finish for today")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.bottom, 40)
    }
    
    // MARK: - Share
    
    private var shareText: String {
        if isSeriesComplete {
            return "🎉 I just completed the \"\(series.title)\" devotional journey on ChooseGOD! \(streak) day streak 🔥"
        } else {
            return "✅ Day \(dayNumber)/\(totalDays) of \"\(series.title)\" complete on ChooseGOD! \(streak) day streak 🔥"
        }
    }
    
    // MARK: - Animation
    
    private func runEntryAnimation() {
        withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1)) {
            showIcon = true
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8).delay(0.4)) {
            showContent = true
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8).delay(0.8)) {
            showProgress = true
        }
        withAnimation(.easeOut(duration: 1.0).delay(1.0)) {
            progressValue = Double(dayNumber) / Double(totalDays)
        }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.7).delay(1.2)) {
            showButtons = true
        }
    }
}

// MARK: - Share Sheet

struct DevotionalShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    DevotionalCompleteView(
        series: .preview,
        dayNumber: 3,
        totalDays: 7
    )
    .environment(AppState.preview)
}
