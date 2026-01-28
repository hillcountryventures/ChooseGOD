import SwiftUI

/// Reusable step view with title, instruction, and content area
struct LectioStepView: View {
    let step: LectioStep
    let timeRemaining: String
    let isPaused: Bool
    let onToggleTimer: () -> Void
    @Binding var inputText: String
    
    @State private var breatheScale: CGFloat = 1.0
    
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Step header
            HStack(spacing: Theme.Spacing.md) {
                ZStack {
                    Circle()
                        .fill(step.color.opacity(0.2))
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: step.icon)
                        .font(.system(size: 24))
                        .foregroundStyle(step.color)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(step.title)
                        .font(Theme.Typography.title2)
                        .foregroundStyle(Theme.Colors.text)
                    
                    Text(step.subtitle)
                        .font(Theme.Typography.label)
                        .foregroundStyle(step.color)
                }
                
                Spacer()
            }
            
            // Instruction
            Text(step.instruction)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .lineSpacing(4)
            
            // Timer area
            VStack(spacing: Theme.Spacing.sm) {
                // Breathing circle for contemplatio
                if step.id == "contemplatio" {
                    breathingCircle
                }
                
                Button(action: onToggleTimer) {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.surface)
                            .frame(width: 56, height: 56)
                        
                        Image(systemName: isPaused ? "play.fill" : "pause.fill")
                            .font(.system(size: 22))
                            .foregroundStyle(step.color)
                    }
                }
                
                Text(timeRemaining)
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .monospacedDigit()
                    .foregroundStyle(step.color)
                
                Text(isPaused ? "Tap to start" : "remaining")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(.vertical, Theme.Spacing.sm)
            
            // Input field for meditatio/oratio
            if step.hasInput {
                TextEditor(text: $inputText)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.text)
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 100)
                    .padding(Theme.Spacing.md)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                            .fill(Theme.Colors.surface)
                    )
                    .overlay(alignment: .topLeading) {
                        if inputText.isEmpty {
                            Text(step.inputPlaceholder)
                                .font(Theme.Typography.body)
                                .foregroundStyle(Theme.Colors.textTertiary)
                                .padding(Theme.Spacing.md)
                                .padding(.top, 8)
                                .allowsHitTesting(false)
                        }
                    }
            }
        }
        .padding(Theme.Spacing.lg)
        .modifier(GlassCard(cornerRadius: 20))
        .onAppear {
            if step.id == "contemplatio" {
                startBreathing()
            }
        }
    }
    
    // MARK: - Breathing Circle
    
    private var breathingCircle: some View {
        ZStack {
            Circle()
                .fill(step.color.opacity(0.08))
                .frame(width: 120, height: 120)
                .scaleEffect(breatheScale)
            
            Circle()
                .fill(step.color.opacity(0.15))
                .frame(width: 80, height: 80)
                .scaleEffect(breatheScale)
            
            Circle()
                .fill(step.color.opacity(0.25))
                .frame(width: 40, height: 40)
                .scaleEffect(breatheScale)
        }
        .animation(
            .easeInOut(duration: 4).repeatForever(autoreverses: true),
            value: breatheScale
        )
    }
    
    private func startBreathing() {
        breatheScale = 1.3
    }
}
