import SwiftUI
import Charts

/// AI-generated growth insights dashboard: weekly/monthly summaries, theme tracking,
/// sentiment trends, and reading patterns
struct JourneyInsightsView: View {
    @State private var viewModel = InsightsViewModel()
    @State private var showAISummary = false
    @Namespace private var animation
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                if viewModel.isLoading {
                    loadingView
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            periodPicker
                            healthScoreCard
                            prayerActivityChart
                            sentimentTrendChart
                            topicsSection
                            growthInsightCard
                            aiSummarySection
                            
                            // Navigation to sub-views
                            NavigationLink(destination: MilestonesView(milestones: viewModel.milestones)) {
                                milestonesPreview
                            }
                            .buttonStyle(.plain)
                            
                            NavigationLink(destination: TimelineView(items: viewModel.timelineItems)) {
                                timelinePreview
                            }
                            .buttonStyle(.plain)
                            
                            Color.clear.frame(height: 80)
                        }
                        .padding(.horizontal)
                    }
                    .refreshable { await viewModel.refresh() }
                }
            }
            .navigationTitle("Journey Insights")
            .navigationBarTitleDisplayMode(.large)
            .task { await viewModel.loadAll() }
        }
    }
    
    // MARK: - Period Picker
    
    private var periodPicker: some View {
        HStack(spacing: 8) {
            ForEach(InsightsViewModel.Period.allCases, id: \.self) { period in
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        viewModel.selectedPeriod = period
                    }
                } label: {
                    Text(period.rawValue)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(viewModel.selectedPeriod == period ? .white : Theme.Colors.textSecondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background {
                            if viewModel.selectedPeriod == period {
                                Capsule()
                                    .fill(Theme.Colors.primary)
                                    .matchedGeometryEffect(id: "period", in: animation)
                            } else {
                                Capsule()
                                    .fill(Theme.Colors.surface)
                            }
                        }
                }
            }
        }
    }
    
    // MARK: - Health Score
    
    private var healthScoreCard: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Spiritual Health")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
                HStack(spacing: 4) {
                    Image(systemName: viewModel.spiritualHealth.change >= 0 ? "arrow.up.right" : "arrow.down.right")
                        .font(.caption)
                    Text("\(abs(viewModel.spiritualHealth.change))%")
                        .font(.caption.bold())
                }
                .foregroundStyle(viewModel.spiritualHealth.change >= 0 ? Theme.Colors.success : Theme.Colors.error)
            }
            
            ZStack {
                Circle()
                    .stroke(Theme.Colors.surface, lineWidth: 12)
                    .frame(width: 120, height: 120)
                
                Circle()
                    .trim(from: 0, to: Double(viewModel.spiritualHealth.score) / 100)
                    .stroke(
                        AngularGradient(
                            colors: [Theme.Colors.primary, Theme.Colors.accent, Theme.Colors.primary],
                            center: .center
                        ),
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 2) {
                    Text("\(viewModel.spiritualHealth.score)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.Colors.text)
                    Text("/ 100")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            
            HStack(spacing: 20) {
                miniStat(value: "\(viewModel.spiritualHealth.prayerDays)", label: "Prayer Days", icon: "hands.sparkles.fill")
                miniStat(value: "\(viewModel.spiritualHealth.versesRead)", label: "Verses", icon: "book.fill")
                miniStat(value: "\(viewModel.spiritualHealth.stepsCompleted)", label: "Steps", icon: "figure.walk")
            }
            
            Text(viewModel.spiritualHealth.message)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    private func miniStat(value: String, label: String, icon: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.Colors.primary)
            Text(value)
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Prayer Activity Chart
    
    private var prayerActivityChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Prayer Activity")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
                let avg = viewModel.weeklyActivity.isEmpty ? 0 : viewModel.weeklyActivity.map(\.prayerMinutes).reduce(0, +) / max(viewModel.weeklyActivity.count, 1)
                Text("Avg \(avg) min/day")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            
            Chart(viewModel.weeklyActivity) { day in
                BarMark(
                    x: .value("Day", day.dayLabel),
                    y: .value("Minutes", day.prayerMinutes)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [Theme.Colors.primary, Theme.Colors.accent],
                        startPoint: .bottom,
                        endPoint: .top
                    )
                )
                .cornerRadius(6)
            }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisValueLabel {
                        Text("\(value.as(Int.self) ?? 0)m")
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
            }
            .chartXAxis {
                AxisMarks { value in
                    AxisValueLabel {
                        Text(value.as(String.self) ?? "")
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
            }
            .frame(height: 160)
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    // MARK: - Sentiment Trend
    
    private var sentimentTrendChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Sentiment Trend")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
                Image(systemName: "face.smiling")
                    .foregroundStyle(Theme.Colors.success)
            }
            
            Text("How your journal entries reflect your emotional journey")
                .font(.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            Chart(viewModel.sentimentTrend) { point in
                LineMark(
                    x: .value("Date", point.date),
                    y: .value("Sentiment", point.score)
                )
                .foregroundStyle(Theme.Colors.success)
                .interpolationMethod(.catmullRom)
                
                AreaMark(
                    x: .value("Date", point.date),
                    y: .value("Sentiment", point.score)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [Theme.Colors.success.opacity(0.3), Theme.Colors.success.opacity(0)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)
            }
            .chartYAxis {
                AxisMarks(values: [-1, 0, 1]) { value in
                    AxisValueLabel {
                        let v = value.as(Double.self) ?? 0
                        Text(v > 0 ? "😊" : v < 0 ? "😔" : "😐")
                            .font(.caption)
                    }
                }
            }
            .chartXAxis(.hidden)
            .frame(height: 140)
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    // MARK: - Topics
    
    private var topicsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Topics Explored")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            ForEach(viewModel.topicsExplored) { topic in
                HStack(spacing: 12) {
                    Text(topic.emoji)
                        .font(.title2)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(topic.label)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(Theme.Colors.text)
                            Spacer()
                            Text("\(topic.chatCount) chats")
                                .font(.caption)
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                        
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Theme.Colors.surface)
                                    .frame(height: 6)
                                
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color(hex: topic.color))
                                    .frame(width: geo.size.width * topic.percentage / 100, height: 6)
                            }
                        }
                        .frame(height: 6)
                    }
                }
            }
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    // MARK: - Growth Insight Card
    
    private var growthInsightCard: some View {
        Group {
            if let insight = viewModel.growthInsight {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("💡")
                            .font(.title2)
                            .padding(8)
                            .background(Theme.Colors.success.opacity(0.2))
                            .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(insight.title)
                                .font(.headline)
                                .foregroundStyle(Theme.Colors.text)
                            Text(insight.insightType.rawValue.capitalized)
                                .font(.caption)
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                    }
                    
                    Text(insight.narrative)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    
                    if !insight.keyMoments.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Key Moments")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.Colors.text)
                            ForEach(insight.keyMoments, id: \.self) { moment in
                                HStack(spacing: 8) {
                                    Circle()
                                        .fill(Theme.Colors.success)
                                        .frame(width: 6, height: 6)
                                    Text(moment)
                                        .font(.caption)
                                        .foregroundStyle(Theme.Colors.textSecondary)
                                }
                            }
                        }
                    }
                }
                .padding(20)
                .background(
                    LinearGradient(
                        colors: [Theme.Colors.success.opacity(0.08), Theme.Colors.success.opacity(0.15), Theme.Colors.success.opacity(0.08)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .modifier(GlassCard())
            }
        }
    }
    
    // MARK: - AI Summary
    
    private var aiSummarySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundStyle(Theme.Colors.accent)
                Text("AI Growth Analysis")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
            }
            
            if let summary = viewModel.aiSummary {
                VStack(alignment: .leading, spacing: 10) {
                    Text(summary.summary)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    
                    if let scripture = summary.scriptureConnection {
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "book.fill")
                                .foregroundStyle(Theme.Colors.primary)
                                .font(.caption)
                            Text(scripture)
                                .font(.caption)
                                .foregroundStyle(Theme.Colors.text)
                                .italic()
                        }
                        .padding(10)
                        .background(Theme.Colors.primary.opacity(0.1))
                        .cornerRadius(8)
                    }
                    
                    if let prediction = summary.growthPrediction {
                        Label(prediction, systemImage: "chart.line.uptrend.xyaxis")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.success)
                    }
                    
                    if let encouragement = summary.encouragement {
                        Text("💛 \(encouragement)")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.accent)
                    }
                }
            } else {
                Button {
                    Task { await viewModel.generateAIInsight() }
                } label: {
                    HStack {
                        if viewModel.isGeneratingInsight {
                            ProgressView()
                                .tint(Theme.Colors.accent)
                        }
                        Text(viewModel.isGeneratingInsight ? "Analyzing your journey..." : "Generate AI Insight")
                            .font(.subheadline.weight(.medium))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
                .buttonStyle(GlassButtonStyle(isProminent: true))
                .disabled(viewModel.isGeneratingInsight)
            }
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    // MARK: - Preview Cards
    
    private var milestonesPreview: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Milestones")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
                HStack(spacing: 4) {
                    Text("\(viewModel.achievedMilestones.count) earned")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.accent)
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.achievedMilestones.prefix(4)) { milestone in
                        VStack(spacing: 8) {
                            Text(milestone.emoji)
                                .font(.largeTitle)
                            Text(milestone.title)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.Colors.text)
                                .multilineTextAlignment(.center)
                        }
                        .frame(width: 100, height: 100)
                        .background(Theme.Colors.surface)
                        .cornerRadius(16)
                    }
                }
            }
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    private var timelinePreview: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Activity Timeline")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
                HStack(spacing: 4) {
                    Text("See all")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.accent)
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            
            ForEach(viewModel.recentTimeline.prefix(3)) { item in
                HStack(spacing: 12) {
                    Image(systemName: item.type.displayIcon)
                        .foregroundStyle(Color(hex: item.type.displayColor))
                        .frame(width: 32)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.title)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Theme.Colors.text)
                        Text(item.content)
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                            .lineLimit(1)
                    }
                    
                    Spacer()
                    
                    Text(item.createdAt, style: .relative)
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
        }
        .padding(20)
        .modifier(GlassCard())
    }
    
    // MARK: - Loading
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(Theme.Colors.accent)
                .scaleEffect(1.5)
            Text("Loading your journey...")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
}

#Preview {
    JourneyInsightsView()
}
