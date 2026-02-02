import SwiftUI

/// Guided Lectio Divina experience with four ancient prayer steps
struct LectioDivinaView: View {
    @StateObject private var viewModel: LectioViewModel
    @Environment(\.dismiss) private var dismiss
    
    // Ambient animation state
    @State private var ambientPhase: CGFloat = 0
    
    init(verseRef: String = "Psalm 46:10",
         verseText: String = "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.") {
        _viewModel = StateObject(wrappedValue: LectioViewModel(verseRef: verseRef, verseText: verseText))
    }
    
    var body: some View {
        ZStack {
            // Ambient background
            ambientBackground
            
            if viewModel.isComplete {
                completionView
                    .transition(.opacity.combined(with: .scale(scale: 0.95)))
            } else {
                mainContent
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.5), value: viewModel.isComplete)
        .onAppear {
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                ambientPhase = .pi * 2
            }
        }
        .onAppear { AnalyticsService.shared.screen("lectio_divina") }
    }
    
    // MARK: - Ambient Background
    
    private var ambientBackground: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            // Subtle moving gradient orbs
            Circle()
                .fill(viewModel.currentStep.color.opacity(0.06))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(
                    x: sin(ambientPhase) * 50,
                    y: cos(ambientPhase * 0.7) * 30
                )
            
            Circle()
                .fill(Theme.Colors.primary.opacity(0.04))
                .frame(width: 200, height: 200)
                .blur(radius: 60)
                .offset(
                    x: cos(ambientPhase * 0.5) * 40,
                    y: sin(ambientPhase * 0.8) * 50
                )
        }
    }
    
    // MARK: - Main Content
    
    private var mainContent: some View {
        VStack(spacing: 0) {
            // Header
            header
            
            // Progress bar
            progressBar
            
            // Step indicators
            stepDots
            
            ScrollView {
                VStack(spacing: Theme.Spacing.lg) {
                    // Verse card
                    verseCard
                    
                    // Current step
                    LectioStepView(
                        step: viewModel.currentStep,
                        timeRemaining: viewModel.formattedTime,
                        isPaused: viewModel.isPaused,
                        onToggleTimer: { viewModel.toggleTimer() },
                        inputText: binding(for: viewModel.currentStep.id)
                    )
                    .id(viewModel.currentStepIndex) // force re-render on step change
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.xxl)
            }
            
            // Navigation
            navigationBar
        }
    }
    
    // MARK: - Header
    
    private var header: some View {
        HStack {
            Button { dismiss() }
                .accessibilityLabel("Close Lectio Divina")
                //  label: {
                Image(systemName: "xmark")
                    .font(Theme.Typography.bodyLarge)
                    .foregroundStyle(Theme.Colors.text)
                    .frame(width: 44, height: 44)
            }
            
            Spacer()
            
            Text("Lectio Divina")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            Spacer()
            
            Color.clear.frame(width: 44, height: 44)
        }
        .padding(.horizontal, Theme.Spacing.md)
    }
    
    // MARK: - Progress Bar
    
    private var progressBar: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.xxs)
                    .fill(Theme.Colors.surface)
                
                RoundedRectangle(cornerRadius: Theme.CornerRadius.xxs)
                    .fill(Theme.Colors.primary)
                    .frame(width: geo.size.width * viewModel.progress)
                    .animation(.easeInOut(duration: 0.3), value: viewModel.progress)
            }
        }
        .frame(height: 3)
        .padding(.horizontal, Theme.Spacing.md)
    }
    
    // MARK: - Step Dots
    
    private var stepDots: some View {
        HStack(spacing: 12) {
            ForEach(Array(LectioViewModel.steps.enumerated()), id: \.element.id) { index, step in
                ZStack {
                    Circle()
                        .fill(index <= viewModel.currentStepIndex ? step.color : Theme.Colors.surface)
                        .frame(width: 24, height: 24)
                    
                    if index < viewModel.currentStepIndex {
                        Image(systemName: "checkmark")
                            .font(Theme.Typography.caption2)
                            .foregroundStyle(.white)
                    }
                }
            }
        }
        .padding(.vertical, Theme.Spacing.md)
    }
    
    // MARK: - Verse Card
    
    private var verseCard: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text(viewModel.verseRef)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.primary)
            
            Text(viewModel.verseText)
                .font(Theme.Typography.scripture)
                .foregroundStyle(Theme.Colors.text)
                .italic()
                .lineSpacing(6)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(Theme.Colors.surface)
        )
        .overlay(alignment: .leading) {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(Theme.Colors.primary)
                .frame(width: 4)
        }
    }
    
    // MARK: - Navigation Bar
    
    private var navigationBar: some View {
        HStack {
            Button { viewModel.goBack() }
                .accessibilityLabel("Go to previous step")
                //  label: {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text("Previous")
                }
                .font(Theme.Typography.button)
                .foregroundStyle(viewModel.currentStepIndex == 0 ? Theme.Colors.textTertiary : Theme.Colors.text)
            }
            .disabled(viewModel.currentStepIndex == 0)
            
            Spacer()
            
            Text("\(viewModel.currentStepIndex + 1) / \(viewModel.totalSteps)")
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.xs)
                .background(Capsule().fill(Theme.Colors.surface))
            
            Spacer()
            
            Button { viewModel.advanceStep() }
                .accessibilityLabel("Go to next step")
                //  label: {
                HStack(spacing: 4) {
                    Text(viewModel.currentStepIndex == viewModel.totalSteps - 1 ? "Complete" : "Next")
                    Image(systemName: viewModel.currentStepIndex == viewModel.totalSteps - 1 ? "checkmark" : "chevron.right")
                }
                .font(Theme.Typography.button)
                .foregroundStyle(Theme.Colors.text)
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.md)
        .background(Theme.Colors.surface.opacity(0.5))
    }
    
    // MARK: - Completion View
    
    private var completionView: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(Theme.Colors.success.opacity(0.15))
                    .frame(width: 120, height: 120)
                
                Image(systemName: "leaf")
                    .font(Theme.Typography.iconXL)
                    .foregroundStyle(Theme.Colors.success)
            }
            
            Text("Practice Complete")
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            
            Text("\"\(viewModel.verseRef)\"")
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.primary)
            
            Text("You've spent time in God's Word through the ancient practice of Lectio Divina. May His Word continue to dwell in you richly.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.horizontal, Theme.Spacing.lg)
            
            if let meditatio = viewModel.responses["meditatio"], !meditatio.isEmpty {
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text("What stood out:")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                    
                    Text(meditatio)
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                        .italic()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Theme.Spacing.md)
                .background(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .fill(Theme.Colors.surface)
                )
                .padding(.horizontal, Theme.Spacing.lg)
            }
            
            Spacer()
            
            Button {
                viewModel.saveReflection()
                dismiss()
            } label: {
                Text("Finish")
                    .font(Theme.Typography.button)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.Spacing.mds)
                    .background(Capsule().fill(Theme.Colors.primary))
            }
            .padding(.horizontal, Theme.Spacing.xxl)
            .padding(.bottom, Theme.Spacing.xl)
        }
    }
    
    // MARK: - Helpers
    
    private func binding(for stepId: String) -> Binding<String> {
        Binding(
            get: { viewModel.responses[stepId] ?? "" },
            set: { viewModel.responses[stepId] = $0 }
        )
    }
}

#Preview {
    LectioDivinaView()
        .preferredColorScheme(.dark)
}
