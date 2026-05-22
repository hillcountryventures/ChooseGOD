import SwiftUI

// Series cards + detail sheet used by DiscoverView. Extracted from the
// retired DevotionalHubView during the elon-audit dead-code cleanup.

struct CurrentSeriesCard: View {
    let enrollment: UserSeriesEnrollment
    let series: DevotionalSeries
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Day \(enrollment.currentDay) of \(series.totalDays)")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(.white.opacity(0.8))
                    
                    Text(series.title)
                        .font(Theme.Typography.title2)
                        .foregroundStyle(.white)
                }
                
                Spacer()
                
                // Progress ring
                ZStack {
                    Circle()
                        .stroke(.white.opacity(0.3), lineWidth: 4)
                    
                    Circle()
                        .trim(from: 0, to: enrollment.progressPercentage)
                        .stroke(.white, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    
                    Text("\(Int(enrollment.progressPercentage * 100))%")
                        .font(Theme.Typography.captionBold)
                        .foregroundStyle(.white)
                }
                .frame(width: 50, height: 50)
            }
            
            // Continue button
            HStack {
                Text("Continue")
                            .accessibilityLabel("Continue devotional")
                    .font(Theme.Typography.subheadlineSemibold)
                Image(systemName: "arrow.right")
            }
            .foregroundStyle(.white)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.smd)
            .background(.white.opacity(0.2))
            .cornerRadius(Theme.CornerRadius.xl)
        }
        .padding(Theme.Spacing.mdl)
        .background(series.gradient)
        .cornerRadius(Theme.CornerRadius.xl)
    }
}

// MARK: - Small Series Card

struct SmallSeriesCard: View {
    let enrollment: UserSeriesEnrollment
    let series: DevotionalSeries
    
    var body: some View {
        HStack(spacing: 12) {
            // Progress indicator
            ZStack {
                Circle()
                    .fill(series.gradient)
                    .frame(width: 44, height: 44)
                
                Text("\(enrollment.currentDay)")
                    .font(Theme.Typography.title3)
                    .foregroundStyle(.white)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(series.title)
                    .font(Theme.Typography.subheadlineMedium)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Day \(enrollment.currentDay) of \(series.totalDays)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding()
        .background(Theme.Colors.surface)
        .cornerRadius(Theme.CornerRadius.lg)
    }
}

// MARK: - Series Browse Card

struct SeriesBrowseCard: View {
    let series: DevotionalSeries
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Gradient header
            RoundedRectangle(cornerRadius: Theme.CornerRadius.md)
                .fill(series.gradient)
                .frame(height: 60)
                .overlay(
                    Text("\(series.totalDays) days")
                        .font(Theme.Typography.captionMedium)
                        .foregroundStyle(.white)
                        .padding(Theme.Spacing.sm),
                    alignment: .bottomTrailing
                )
            
            Text(series.title)
                .font(Theme.Typography.subheadlineMedium)
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(2)
            
            Text(series.difficultyLevel.displayName)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(Theme.Spacing.mds)
        .background(Theme.Colors.surface)
        .cornerRadius(Theme.CornerRadius.lg)
    }
}

// MARK: - Series Detail Sheet

struct SeriesDetailSheet: View {
    let series: DevotionalSeries
    let onEnroll: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var isEnrolling = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .fill(series.gradient)
                        .frame(height: 150)
                        .overlay(
                            VStack {
                                Spacer()
                                Text(series.title)
                                    .font(Theme.Typography.title1)
                                    .foregroundStyle(.white)
                                    .padding()
                            }
                        )
                    
                    // Info
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Label("\(series.totalDays) days", systemImage: "calendar")
                            Spacer()
                            Label(series.difficultyLevel.displayName, systemImage: "chart.bar")
                        }
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        
                        Text(series.description)
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.text)
                        
                        // Topics
                        FlowLayout(spacing: 8) {
                            ForEach(series.topics, id: \.self) { topic in
                                Text(topic)
                                    .font(Theme.Typography.caption)
                                    .padding(.horizontal, Theme.Spacing.smd)
                                    .padding(.vertical, 5)
                                    .background(Theme.Colors.primary.opacity(0.2))
                                    .foregroundStyle(Theme.Colors.primary)
                                    .cornerRadius(Theme.CornerRadius.lg)
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    Spacer(minLength: 80)
                }
            }
            .background(Theme.Colors.background)
            .safeAreaInset(edge: .bottom) {
                Button {
                    Task { await enroll() }
                } label: {
                    if isEnrolling {
                        ShimmerView(height: 20)
                    } else {
                        Text("Start Journey")
                            .font(Theme.Typography.title3)
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Theme.Colors.primary)
                .cornerRadius(Theme.CornerRadius.xl)
                .padding()
                .background(Theme.Colors.background)
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
    
    private func enroll() async {
        guard let userId = appState.currentUser?.id else { return }
        
        isEnrolling = true
        
        let service = SupabaseDevotionalService()
        _ = try? await service.enrollInSeries(userId: userId, seriesId: series.id, isPrimary: true)
        
        onEnroll()
        dismiss()
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var rowHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                if x + size.width > maxWidth, x > 0 {
                    x = 0
                    y += rowHeight + spacing
                    rowHeight = 0
                }
                positions.append(CGPoint(x: x, y: y))
                rowHeight = max(rowHeight, size.height)
                x += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: y + rowHeight)
        }
    }
}
