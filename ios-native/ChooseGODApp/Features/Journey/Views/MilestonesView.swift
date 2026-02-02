import SwiftUI

/// Achievement badges with fun animations when earned
struct MilestonesView: View {
    let milestones: [Milestone]
    @State private var celebratingId: String?
    @State private var appearedIds: Set<String> = []
    
    private var achieved: [Milestone] { milestones.filter(\.achieved) }
    private var upcoming: [Milestone] { milestones.filter { !$0.achieved }.sorted { $0.progress > $1.progress } }
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    summaryHeader
                    
                    if !achieved.isEmpty {
                        achievedSection
                    }
                    
                    if !upcoming.isEmpty {
                        upcomingSection
                    }
                    
                    Color.clear.frame(height: 80)
                }
                .padding(.horizontal)
            }
            
            // Celebration overlay
            if celebratingId != nil {
                celebrationOverlay
            }
        }
        .navigationTitle("Milestones")
        .navigationBarTitleDisplayMode(.large)
    }
    
    // MARK: - Summary Header
    
    private var summaryHeader: some View {
        VStack(spacing: 12) {
            HStack(spacing: 20) {
                VStack(spacing: 4) {
                    Text("\(achieved.count)")
                        .font(Theme.Typography.displayRounded)
                        .foregroundStyle(Theme.Colors.accent)
                    Text("Earned")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                
                Divider().frame(height: 40)
                
                VStack(spacing: 4) {
                    Text("\(milestones.count)")
                        .font(Theme.Typography.displayRounded)
                        .foregroundStyle(Theme.Colors.text)
                    Text("Total")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                
                Divider().frame(height: 40)
                
                if let next = upcoming.first {
                    VStack(spacing: 4) {
                        Text("\(Int(next.progress * 100))%")
                            .font(Theme.Typography.displayRounded)
                            .foregroundStyle(Theme.Colors.primary)
                        Text("Next")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding(Theme.Spacing.mdl)
        .modifier(GlassCard())
    }
    
    // MARK: - Achieved Section
    
    private var achievedSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("🏆 Achievements Unlocked")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(achieved) { milestone in
                    achievedBadge(milestone)
                        .onAppear {
                            let idx = achieved.firstIndex(where: { $0.id == milestone.id }) ?? 0
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(Double(idx) * 0.1)) {
                                _ = appearedIds.insert(milestone.id)
                            }
                        }
                        .onTapGesture {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.5)) {
                                celebratingId = milestone.id
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                withAnimation { celebratingId = nil }
                            }
                        }
                }
            }
        }
    }
    
    private func achievedBadge(_ milestone: Milestone) -> some View {
        let appeared = appearedIds.contains(milestone.id)
        
        return VStack(spacing: 10) {
            Text(milestone.emoji)
                .font(Theme.Typography.iconLarge)
                .shadow(color: Theme.Colors.accent.opacity(0.5), radius: 10)
            
            Text(milestone.title)
                .font(Theme.Typography.subheadlineSemibold)
                .foregroundStyle(Theme.Colors.text)
                .multilineTextAlignment(.center)
            
            Text(milestone.description)
                .font(Theme.Typography.caption2)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            
            if let date = milestone.achievedAt {
                Text(date, style: .date)
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, minHeight: 150)
        .background(
            LinearGradient(
                colors: [Theme.Colors.accent.opacity(0.1), Theme.Colors.primary.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .modifier(GlassCard())
        .scaleEffect(appeared ? 1 : 0.5)
        .opacity(appeared ? 1 : 0)
    }
    
    // MARK: - Upcoming Section
    
    private var upcomingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("🎯 In Progress")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            ForEach(upcoming) { milestone in
                upcomingRow(milestone)
            }
        }
    }
    
    private func upcomingRow(_ milestone: Milestone) -> some View {
        HStack(spacing: 14) {
            Text(milestone.emoji)
                .font(Theme.Typography.title1)
                .frame(width: 50, height: 50)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
            
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(milestone.title)
                        .font(Theme.Typography.subheadlineMedium)
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Text("\(milestone.current)/\(milestone.target)")
                        .font(Theme.Typography.captionSemibold)
                        .foregroundStyle(Theme.Colors.primary)
                }
                
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.sm)
                            .fill(Theme.Colors.surface)
                            .frame(height: 6)
                        
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.sm)
                            .fill(
                                LinearGradient(
                                    colors: [Theme.Colors.primary, Theme.Colors.accent],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geo.size.width * milestone.progress, height: 6)
                    }
                }
                .frame(height: 6)
                
                Text(milestone.scriptureRef)
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .italic()
            }
        }
        .padding(Theme.Spacing.md)
        .modifier(GlassCard())
    }
    
    // MARK: - Celebration Overlay
    
    private var celebrationOverlay: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation { celebratingId = nil }
                }
            
            if let id = celebratingId, let milestone = milestones.first(where: { $0.id == id }) {
                VStack(spacing: 20) {
                    Text(milestone.emoji)
                        .font(Theme.Typography.iconMassive)
                        .shadow(color: Theme.Colors.accent.opacity(0.8), radius: 20)
                        .scaleEffect(celebratingId != nil ? 1 : 0.3)
                    
                    Text(milestone.title)
                        .font(Theme.Typography.title2)
                        .foregroundStyle(Theme.Colors.text)
                    
                    Text(milestone.description)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    
                    VStack(spacing: 8) {
                        Text("\"\(milestone.scripture)\"")
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(Theme.Colors.text)
                            .italic()
                            .multilineTextAlignment(.center)
                        
                        Text("— \(milestone.scriptureRef)")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.accent)
                    }
                    .padding()
                    .background(Theme.Colors.primary.opacity(0.1))
                    .cornerRadius(Theme.CornerRadius.lg)
                    
                    // Confetti-style emojis
                    HStack(spacing: 20) {
                        ForEach(["🎉", "⭐", "🙌", "✨", "🎊"], id: \.self) { emoji in
                            Text(emoji)
                                .font(Theme.Typography.title1)
                                .rotationEffect(.degrees(Double.random(in: -20...20)))
                        }
                    }
                }
                .padding(Theme.Spacing.xl)
                .modifier(GlassCard())
                .padding(.horizontal, 30)
                .transition(.scale.combined(with: .opacity))
            }
        }
    }
}

#Preview {
    NavigationStack {
        MilestonesView(milestones: Milestone.definitions.enumerated().map { i, m in
            var milestone = m
            milestone.current = i < 5 ? m.target : m.target / 2
            milestone.achieved = i < 5
            milestone.achievedAt = i < 5 ? Date() : nil
            return milestone
        })
    }
}
