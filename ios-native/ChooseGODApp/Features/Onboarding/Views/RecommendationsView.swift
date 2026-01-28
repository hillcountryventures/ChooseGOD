import SwiftUI

struct RecommendationsView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onContinue: () -> Void
    
    @State private var appeared = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .font(.system(size: 28))
                    .foregroundStyle(Theme.Colors.accent)
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.5)
                
                Text("Your Personalized Plan")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Based on your answers, we recommend these devotionals")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 32)
            .padding(.horizontal, Theme.Spacing.lg)
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 15)
            
            if viewModel.isLoadingRecommendations {
                Spacer()
                ProgressView()
                    .tint(Theme.Colors.primary)
                    .scaleEffect(1.2)
                Spacer()
            } else {
                // Recommendations list
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 14) {
                        ForEach(Array(viewModel.recommendations.enumerated()), id: \.element.id) { index, rec in
                            RecommendationCard(
                                recommendation: rec,
                                isSelected: viewModel.selectedSeriesIds.contains(rec.id),
                                rank: index + 1
                            ) {
                                viewModel.toggleSeries(rec.id)
                            }
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(Theme.Animation.springGentle.delay(Double(index) * 0.12 + 0.3), value: appeared)
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.top, 24)
                    .padding(.bottom, 16)
                }
            }
            
            // Continue
            Button(action: onContinue) {
                HStack(spacing: 8) {
                    Text("Start \(viewModel.selectedSeriesIds.count == 1 ? "This Plan" : "These Plans")")
                        .font(Theme.Typography.button)
                    Image(systemName: "arrow.right")
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Theme.Dimensions.buttonHeight)
                .background(
                    LinearGradient(
                        colors: viewModel.selectedSeriesIds.isEmpty
                            ? [Theme.Colors.surfaceElevated, Theme.Colors.surfaceElevated]
                            : [Theme.Colors.primary, Theme.Colors.primaryDark],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
            }
            .disabled(viewModel.selectedSeriesIds.isEmpty)
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.bottom, 40)
        }
        .onAppear {
            withAnimation(Theme.Animation.springGentle) {
                appeared = true
            }
        }
    }
}

// MARK: - Card

private struct RecommendationCard: View {
    let recommendation: SeriesRecommendation
    let isSelected: Bool
    let rank: Int
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    // Rank badge
                    if rank == 1 {
                        Text("Best Match")
                            .font(.system(size: 10, weight: .bold))
                            .textCase(.uppercase)
                            .tracking(0.5)
                            .foregroundStyle(Theme.Colors.accent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Theme.Colors.accent.opacity(0.15))
                            .clipShape(Capsule())
                    }
                    
                    Spacer()
                    
                    // Selection indicator
                    ZStack {
                        Circle()
                            .stroke(isSelected ? Theme.Colors.primary : Theme.Colors.textTertiary.opacity(0.4), lineWidth: 2)
                            .frame(width: 24, height: 24)
                        
                        if isSelected {
                            Circle()
                                .fill(Theme.Colors.primary)
                                .frame(width: 24, height: 24)
                            
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                    .animation(Theme.Animation.spring, value: isSelected)
                }
                
                Text(recommendation.title)
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
                
                Text(recommendation.description)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .lineLimit(2)
                
                HStack(spacing: 16) {
                    Label("\(recommendation.totalDays) days", systemImage: "calendar")
                    
                    Label("\(Int(recommendation.matchScore * 100))% match", systemImage: "target")
                }
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
                
                // Match reasons
                HStack(spacing: 6) {
                    ForEach(recommendation.matchReasons.prefix(2), id: \.self) { reason in
                        Text(reason)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(Theme.Colors.primaryLight)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Theme.Colors.primary.opacity(0.1))
                            .clipShape(Capsule())
                    }
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .fill(isSelected ? Theme.Colors.primary.opacity(0.06) : Theme.Colors.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .stroke(isSelected ? Theme.Colors.primary.opacity(0.4) : Theme.Colors.surfaceElevated, lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        RecommendationsView(
            viewModel: {
                let vm = OnboardingViewModel(service: MockOnboardingService())
                return vm
            }(),
            onContinue: {}
        )
    }
}
