import SwiftUI

struct MemoryPracticeView: View {
    @ObservedObject var viewModel: MemoryViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var isFlipped = false
    @State private var cardRotation: Double = 0
    @State private var cardScale: CGFloat = 1.0
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            if viewModel.dueVerses.isEmpty && !viewModel.isLoading {
                emptyState
            } else if viewModel.isComplete && !viewModel.showCelebration {
                completionState
            } else if let verse = viewModel.currentVerse {
                practiceContent(verse: verse)
            }
            
            // Celebration overlay
            if viewModel.showCelebration {
                celebrationOverlay
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Memory Practice")
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
            }
            ToolbarItem(placement: .topBarTrailing) {
                if !viewModel.dueVerses.isEmpty {
                    Text("\(viewModel.currentIndex + 1)/\(viewModel.dueVerses.count)")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
        }
        .onAppear { 
            // TODO: Fix AnalyticsService import - AnalyticsService.shared.screen("memory_practice")
        }
    }
    
    // MARK: - Practice Content
    
    @ViewBuilder
    private func practiceContent(verse: MemoryVerse) -> some View {
        VStack(spacing: 0) {
            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xxs)
                        .fill(Theme.Colors.surface)
                        .frame(height: 4)
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xxs)
                        .fill(Theme.Colors.primary)
                        .frame(width: geo.size.width * viewModel.progress, height: 4)
                        .animation(.easeInOut(duration: 0.3), value: viewModel.progress)
                }
            }
            .frame(height: 4)
            .padding(.horizontal)
            
            Spacer()
            
            // Flashcard
            flashcard(verse: verse)
                .padding(.horizontal, Theme.Spacing.mdl)
            
            Spacer()
            
            // Actions
            actionButtons(verse: verse)
                .padding(.horizontal, Theme.Spacing.mdl)
                .padding(.bottom, Theme.Spacing.xl)
        }
    }
    
    // MARK: - Flashcard
    
    @ViewBuilder
    private func flashcard(verse: MemoryVerse) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Reference
            HStack(spacing: 8) {
                Image(systemName: "book.fill")
                    .foregroundStyle(Theme.Colors.primary)
                Text(verse.reference)
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
            }
            
            // Translation badge
            Text(verse.translation.uppercased())
                .font(Theme.Typography.captionBold)
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, Theme.Spacing.smd)
                .padding(.vertical, 4)
                .background(Theme.Colors.primaryAlpha(0.2))
                .clipShape(Capsule())
            
            Divider().background(Theme.Colors.surface)
            
            // Content — flips between question and answer
            ZStack {
                // Front (question)
                questionSide(verse: verse)
                    .opacity(viewModel.isRevealed ? 0 : 1)
                    .rotation3DEffect(
                        .degrees(viewModel.isRevealed ? 180 : 0),
                        axis: (x: 0, y: 1, z: 0)
                    )
                
                // Back (answer)
                answerSide(verse: verse)
                    .opacity(viewModel.isRevealed ? 1 : 0)
                    .rotation3DEffect(
                        .degrees(viewModel.isRevealed ? 0 : -180),
                        axis: (x: 0, y: 1, z: 0)
                    )
            }
            .animation(.spring(response: 0.6, dampingFraction: 0.8), value: viewModel.isRevealed)
            .frame(minHeight: 180)
            
            Divider().background(Theme.Colors.surface)
            
            // Review count
            HStack(spacing: 4) {
                Image(systemName: "arrow.triangle.2.circlepath")
                    .font(Theme.Typography.caption2)
                Text("Reviewed \(verse.reviewCount) time\(verse.reviewCount == 1 ? "" : "s")")
                    .font(Theme.Typography.caption)
            }
            .foregroundStyle(Theme.Colors.textTertiary)
            .frame(maxWidth: .infinity)
        }
        .padding(Theme.Spacing.lg)
        .modifier(GlassCard())
        .scaleEffect(cardScale)
    }
    
    @ViewBuilder
    private func questionSide(verse: MemoryVerse) -> some View {
        VStack(spacing: 16) {
            if viewModel.showHint {
                Text("First-letter hint:")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                Text(verse.hint)
                    .font(Theme.Typography.monoMedium)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            } else {
                Image(systemName: "questionmark.circle")
                    .font(Theme.Typography.iconLarge)
                    .foregroundStyle(Theme.Colors.textTertiary)
                Text("Can you recall this verse?")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                Button {
                    withAnimation { viewModel.showHint = true }
                } label: {
                    Label("Show hint", systemImage: "lightbulb")
                        .font(Theme.Typography.subheadlineMedium)
                        .foregroundStyle(Theme.Colors.accent)
                        .padding(.horizontal, Theme.Spacing.md)
                        .padding(.vertical, Theme.Spacing.sm)
                        .background(Theme.Colors.surface)
                        .clipShape(Capsule())
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
    
    @ViewBuilder
    private func answerSide(verse: MemoryVerse) -> some View {
        VStack(spacing: 16) {
            Text(verse.text)
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
                .multilineTextAlignment(.center)
                .lineSpacing(6)
            
            if let mnemonic = verse.mnemonic {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Memory aid:")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                    Text(mnemonic)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .italic()
                }
                .padding(Theme.Spacing.mds)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.Colors.surface.opacity(0.5))
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
            }
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Actions
    
    @ViewBuilder
    private func actionButtons(verse: MemoryVerse) -> some View {
        if !viewModel.isRevealed {
            Button {
                viewModel.isRevealed = true
            } label: {
                HStack(spacing: 10) {
                    Text("Reveal Answer")
                        .font(Theme.Typography.title3)
                    Image(systemName: "eye.fill")
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Theme.Spacing.md)
                .background(Theme.Colors.primary)
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
            }
        } else {
            VStack(spacing: 12) {
                Text("How well did you remember?")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                HStack(spacing: 12) {
                    ratingButton(rating: .again, icon: "xmark.circle.fill", color: Theme.Colors.error, label: "Again")
                        .accessibilityLabel("Rate as again, need more practice")
                    ratingButton(rating: .hard, icon: "exclamationmark.circle.fill", color: Theme.Colors.warning, label: "Hard")
                    ratingButton(rating: .good, icon: "checkmark.circle.fill", color: Theme.Colors.success, label: "Good")
                    ratingButton(rating: .easy, icon: "star.fill", color: Theme.Colors.primary, label: "Easy")
                        .accessibilityLabel("Rate as easy, well memorized")
                }
            }
        }
    }
    
    @ViewBuilder
    private func ratingButton(rating: ReviewRating, icon: String, color: Color, label: String) -> some View {
        Button {
            Task { await viewModel.reviewVerse(rating: rating) }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(Theme.Typography.title2)
                    .foregroundStyle(color)
                Text(label)
                    .font(Theme.Typography.captionBold)
                    .foregroundStyle(color)
                Text("\(viewModel.nextInterval(for: rating))d")
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.Spacing.mds)
            .background(Theme.Colors.surface)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
        }
    }
    
    // MARK: - States
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(Theme.Typography.iconMassive)
                .foregroundStyle(Theme.Colors.success)
            Text("All Caught Up!")
                .font(Theme.Typography.title2)
                .foregroundStyle(Theme.Colors.text)
            Text("No verses are due for review right now.\nAdd verses from the Bible screen to start memorizing.")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            Button("Done") { dismiss() }
                .buttonStyle(GlassButtonStyle(isProminent: true))
                .padding(.top, Theme.Spacing.sm)
        }
        .padding(Theme.Spacing.xxl)
    }
    
    private var completionState: some View {
        VStack(spacing: 16) {
            Image(systemName: "trophy.fill")
                .font(Theme.Typography.iconMassive)
                .foregroundStyle(Theme.Colors.accent)
            Text("Session Complete!")
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            Text("You reviewed \(viewModel.reviewedCount) verse\(viewModel.reviewedCount == 1 ? "" : "s") today.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            Button("Finish") { dismiss() }
                .buttonStyle(GlassButtonStyle(isProminent: true))
                .padding(.top, Theme.Spacing.sm)
        }
        .padding(Theme.Spacing.xxl)
    }
    
    private var celebrationOverlay: some View {
        ZStack {
            Color.black.opacity(0.6).ignoresSafeArea()
            VStack(spacing: 20) {
                Image(systemName: "hands.clap.fill")
                    .font(Theme.Typography.iconHuge)
                    .foregroundStyle(Theme.Colors.primary)
                Text("Well Done!")
                    .font(Theme.Typography.display)
                    .foregroundStyle(Theme.Colors.text)
                Text("\(viewModel.reviewedCount) verse\(viewModel.reviewedCount == 1 ? "" : "s") reviewed")
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            .padding(Theme.Spacing.xxl)
            .modifier(GlassCard())
        }
        .transition(.opacity)
        .onTapGesture { dismiss() }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                dismiss()
            }
        }
    }
}
