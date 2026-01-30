import SwiftUI

struct PersonalizationQuizView: View {
    @Bindable var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(spacing: 0) {
            // Progress bar
            quizProgressBar
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.md)
            
            // Question content
            Group {
                switch viewModel.currentStep {
                case .quizLifeArea:
                    lifeAreaQuestion
                case .quizTime:
                    timeQuestion
                case .quizExperience:
                    experienceQuestion
                case .quizLifeStage:
                    lifeStageQuestion
                default:
                    EmptyView()
                }
            }
            .transition(.asymmetric(
                insertion: .move(edge: viewModel.transitionDirection == .trailing ? .trailing : .leading).combined(with: .opacity),
                removal: .move(edge: viewModel.transitionDirection == .trailing ? .leading : .trailing).combined(with: .opacity)
            ))
            .id(viewModel.currentStep)
            
            Spacer()
            
            // Navigation
            HStack(spacing: 16) {
                Button(action: { viewModel.goBack() }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Theme.Colors.textSecondary)
                        .frame(width: 52, height: 52)
                        .background(.ultraThinMaterial)
                        .clipShape(Circle())
                }
                
                Button(action: { viewModel.advance() }) {
                    HStack(spacing: 8) {
                        Text(viewModel.currentStep == .quizLifeStage ? "See Recommendations" : "Continue")
                            .font(Theme.Typography.button)
                        Image(systemName: "arrow.right")
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.Dimensions.buttonHeight)
                    .background(viewModel.canProceed
                        ? LinearGradient(colors: [Theme.Colors.primary, Theme.Colors.primaryDark], startPoint: .leading, endPoint: .trailing)
                        : LinearGradient(colors: [Theme.Colors.surfaceElevated, Theme.Colors.surfaceElevated], startPoint: .leading, endPoint: .trailing)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
                }
                .disabled(!viewModel.canProceed)
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, 40)
        }
        .onAppear { AnalyticsService.shared.screen("onboarding_quiz") }
    }
    
    // MARK: - Progress Bar
    
    private var quizProgressBar: some View {
        let step = viewModel.currentStep.quizIndex
        let total = OnboardingViewModel.OnboardingStep.quizStepCount
        
        return GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Theme.Colors.surface)
                    .frame(height: 6)
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(
                        LinearGradient(colors: [Theme.Colors.primary, Theme.Colors.primaryLight], startPoint: .leading, endPoint: .trailing)
                    )
                    .frame(width: geo.size.width * CGFloat(step + 1) / CGFloat(total), height: 6)
                    .animation(Theme.Animation.spring, value: step)
            }
        }
        .frame(height: 6)
    }
    
    // MARK: - Life Area
    
    private var lifeAreaQuestion: some View {
        QuizQuestionLayout(
            title: "What area of life\nneeds God's Word most?",
            subtitle: "Choose the topic closest to your heart right now"
        ) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(LifeAreaFocus.allCases) { area in
                    QuizOptionCard(
                        icon: area.icon,
                        label: area.label,
                        isSelected: viewModel.responses.lifeAreaFocus == area,
                        accentHex: area.color
                    ) {
                        viewModel.selectLifeArea(area)
                    }
                }
            }
        }
    }
    
    // MARK: - Time
    
    private var timeQuestion: some View {
        QuizQuestionLayout(
            title: "How much time can you\ndevote each day?",
            subtitle: "We'll tailor your reading plan accordingly"
        ) {
            VStack(spacing: 12) {
                ForEach(TimeAvailable.allCases) { time in
                    QuizOptionRow(
                        icon: time.icon,
                        label: time.label,
                        description: time.description,
                        isSelected: viewModel.responses.timeAvailable == time
                    ) {
                        viewModel.selectTime(time)
                    }
                }
            }
        }
    }
    
    // MARK: - Experience
    
    private var experienceQuestion: some View {
        QuizQuestionLayout(
            title: "Where are you in\nyour faith journey?",
            subtitle: "No wrong answers — we meet you where you are"
        ) {
            VStack(spacing: 12) {
                ForEach(ExperienceLevel.allCases) { level in
                    QuizOptionRow(
                        icon: level.icon,
                        label: level.label,
                        description: level.description,
                        isSelected: viewModel.responses.experienceLevel == level
                    ) {
                        viewModel.selectExperience(level)
                    }
                }
            }
        }
    }
    
    // MARK: - Life Stage
    
    private var lifeStageQuestion: some View {
        QuizQuestionLayout(
            title: "What's your current\nlife stage?",
            subtitle: "Helps us recommend relevant devotionals"
        ) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(LifeStage.allCases) { stage in
                    QuizOptionCard(
                        icon: stage.icon,
                        label: stage.label,
                        isSelected: viewModel.responses.lifeStage == stage,
                        accentHex: nil
                    ) {
                        viewModel.selectLifeStage(stage)
                    }
                }
            }
        }
    }
}

// MARK: - Question Layout

private struct QuizQuestionLayout<Content: View>: View {
    let title: String
    let subtitle: String
    @ViewBuilder let content: () -> Content
    
    @State private var appeared = false
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text(title)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.text)
                    .multilineTextAlignment(.center)
                
                Text(subtitle)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 32)
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 15)
            
            ScrollView(showsIndicators: false) {
                content()
                    .padding(.horizontal, Theme.Spacing.lg)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 20)
        }
        .onAppear {
            withAnimation(Theme.Animation.springGentle.delay(0.1)) {
                appeared = true
            }
        }
    }
}

// MARK: - Option Card (Grid)

private struct QuizOptionCard: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let accentHex: String?
    let action: () -> Void
    
    private var accent: Color {
        if let hex = accentHex { return Color(hex: hex) }
        return Theme.Colors.primary
    }
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(isSelected ? accent.opacity(0.2) : Theme.Colors.surface)
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundStyle(isSelected ? accent : Theme.Colors.textSecondary)
                }
                
                Text(label)
                    .font(Theme.Typography.label)
                    .foregroundStyle(isSelected ? Theme.Colors.text : Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .padding(.horizontal, 8)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .fill(isSelected ? accent.opacity(0.08) : Theme.Colors.surface.opacity(0.6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .stroke(isSelected ? accent.opacity(0.5) : Color.clear, lineWidth: 1.5)
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(Theme.Animation.spring, value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Option Row (List)

private struct QuizOptionRow: View {
    let icon: String
    let label: String
    let description: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Theme.Colors.primary.opacity(0.2) : Theme.Colors.surface)
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.textSecondary)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(Theme.Typography.body)
                        .foregroundStyle(isSelected ? Theme.Colors.text : Theme.Colors.textSecondary)
                    
                    Text(description)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(Theme.Colors.primary)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .fill(isSelected ? Theme.Colors.primary.opacity(0.08) : Theme.Colors.surface.opacity(0.6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .stroke(isSelected ? Theme.Colors.primary.opacity(0.4) : Color.clear, lineWidth: 1.5)
            )
            .animation(Theme.Animation.spring, value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        PersonalizationQuizView(viewModel: OnboardingViewModel(service: MockOnboardingService()))
    }
}
