import SwiftUI

/// Devotional hub showing current series and available series
struct DevotionalHubView: View {
    @Environment(AppState.self) private var appState
    @State private var enrollments: [UserSeriesEnrollment] = []
    @State private var allSeries: [DevotionalSeries] = []
    @State private var isLoading = true
    @State private var selectedSeries: DevotionalSeries?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if isLoading {
                    ProgressView()
                } else {
                    ScrollView {
                        VStack(spacing: 24) {
                            // Current enrollment (if any)
                            if let primary = enrollments.first(where: { $0.isPrimary }) {
                                currentSeriesSection(primary)
                            }
                            
                            // Other active enrollments
                            let others = enrollments.filter { !$0.isPrimary }
                            if !others.isEmpty {
                                otherEnrollmentsSection(others)
                            }
                            
                            // Browse all series
                            browseSeriesSection
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Devotionals")
            .sheet(item: $selectedSeries) { series in
                SeriesDetailSheet(series: series) {
                    Task { await loadData() }
                }
            }
            .task {
                await loadData()
            }
        }
    }
    
    // MARK: - Sections
    
    private func currentSeriesSection(_ enrollment: UserSeriesEnrollment) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Continue Your Journey")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            if let series = enrollment.series {
                NavigationLink {
                    DailyDevotionalView(enrollment: enrollment)
                } label: {
                    CurrentSeriesCard(enrollment: enrollment, series: series)
                }
                .buttonStyle(.plain)
            }
        }
    }
    
    private func otherEnrollmentsSection(_ enrollments: [UserSeriesEnrollment]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Also In Progress")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            ForEach(enrollments) { enrollment in
                if let series = enrollment.series {
                    NavigationLink {
                        DailyDevotionalView(enrollment: enrollment)
                    } label: {
                        SmallSeriesCard(enrollment: enrollment, series: series)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    private var browseSeriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Explore Series")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(allSeries) { series in
                    Button {
                        selectedSeries = series
                    } label: {
                        SeriesBrowseCard(series: series)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    // MARK: - Data Loading
    
    private func loadData() async {
        guard let userId = appState.currentUser?.id else {
            isLoading = false
            return
        }
        
        let service = SupabaseDevotionalService()
        
        do {
            async let enrollmentsTask = service.getEnrollments(userId: userId)
            async let seriesTask = service.getAllSeries()
            
            enrollments = try await enrollmentsTask
            allSeries = try await seriesTask
        } catch {
            // Use mock data
            allSeries = [.preview]
        }
        
        isLoading = false
    }
}

// MARK: - Current Series Card

struct CurrentSeriesCard: View {
    let enrollment: UserSeriesEnrollment
    let series: DevotionalSeries
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Day \(enrollment.currentDay) of \(series.totalDays)")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.8))
                    
                    Text(series.title)
                        .font(.title2.bold())
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
                        .font(.caption.bold())
                        .foregroundStyle(.white)
                }
                .frame(width: 50, height: 50)
            }
            
            // Continue button
            HStack {
                Text("Continue")
                    .font(.subheadline.weight(.semibold))
                Image(systemName: "arrow.right")
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.white.opacity(0.2))
            .cornerRadius(20)
        }
        .padding(20)
        .background(series.gradient)
        .cornerRadius(16)
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
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(series.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Day \(enrollment.currentDay) of \(series.totalDays)")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding()
        .background(Theme.Colors.surface)
        .cornerRadius(12)
    }
}

// MARK: - Series Browse Card

struct SeriesBrowseCard: View {
    let series: DevotionalSeries
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Gradient header
            RoundedRectangle(cornerRadius: 8)
                .fill(series.gradient)
                .frame(height: 60)
                .overlay(
                    Text("\(series.totalDays) days")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.white)
                        .padding(8),
                    alignment: .bottomTrailing
                )
            
            Text(series.title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(2)
            
            Text(series.difficultyLevel.displayName)
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(12)
        .background(Theme.Colors.surface)
        .cornerRadius(12)
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
                    RoundedRectangle(cornerRadius: 16)
                        .fill(series.gradient)
                        .frame(height: 150)
                        .overlay(
                            VStack {
                                Spacer()
                                Text(series.title)
                                    .font(.title.bold())
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
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        
                        Text(series.description)
                            .font(.body)
                            .foregroundStyle(Theme.Colors.text)
                        
                        // Topics
                        FlowLayout(spacing: 8) {
                            ForEach(series.topics, id: \.self) { topic in
                                Text(topic)
                                    .font(.caption)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(Theme.Colors.primary.opacity(0.2))
                                    .foregroundStyle(Theme.Colors.primary)
                                    .cornerRadius(12)
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
                        ProgressView().tint(.white)
                    } else {
                        Text("Start Journey")
                            .font(.headline)
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Theme.Colors.primary)
                .cornerRadius(16)
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

#Preview {
    DevotionalHubView()
        .environment(AppState.preview)
}
