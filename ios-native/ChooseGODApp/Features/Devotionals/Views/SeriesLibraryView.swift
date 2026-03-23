import SwiftUI

/// Browse all devotional series with filtering and search
struct SeriesLibraryView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var allSeries: [DevotionalSeries] = []
    @State private var enrollments: [UserSeriesEnrollment] = []
    @State private var searchQuery = ""
    @State private var activeFilter: SeriesFilter = .all
    @State private var isLoading = true
    @State private var selectedSeries: DevotionalSeries?
    
    enum SeriesFilter: String, CaseIterable {
        case all = "All"
        case enrolled = "Enrolled"
        case seasonal = "Seasonal"
        case beginner = "Beginner"
        case intermediate = "Intermediate"
        case advanced = "Advanced"
    }
    
    private var enrolledSeriesIds: Set<String> {
        Set(enrollments.map(\.seriesId))
    }
    
    private var filteredSeries: [DevotionalSeries] {
        allSeries.filter { series in
            // Search
            if !searchQuery.isEmpty {
                let q = searchQuery.lowercased()
                guard series.title.lowercased().contains(q)
                    || series.description.lowercased().contains(q)
                    || series.topics.contains(where: { $0.lowercased().contains(q) })
                else { return false }
            }
            // Category
            switch activeFilter {
            case .all: return true
            case .enrolled: return enrolledSeriesIds.contains(series.id)
            case .seasonal: return series.isSeasonal
            case .beginner: return series.difficultyLevel == .beginner
            case .intermediate: return series.difficultyLevel == .intermediate
            case .advanced: return series.difficultyLevel == .advanced
            }
        }
    }
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Search bar
                searchBar
                    .padding(.horizontal)
                    .padding(.top, Theme.Spacing.sm)
                
                // Filter chips
                filterChips
                    .padding(.vertical, Theme.Spacing.mds)
                
                // Grid
                if isLoading {
                    Spacer()
                ShimmerView(height: 20)
                    Spacer()
                } else if filteredSeries.isEmpty {
                    Spacer()
                    emptyState
                    Spacer()
                } else {
                    seriesGrid
                }
            }
        }
        .navigationTitle("Devotional Library")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedSeries) { series in
            NavigationStack {
                SeriesDetailView(series: series)
            }
        }
        .task { await loadData() }
        // .onAppear { AnalyticsService.shared.screen("series_library") } // TODO: Service not available
    }
    
    // MARK: - Search Bar
    
    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Theme.Colors.textTertiary)
            
            TextField("Search devotionals...", text: $searchQuery)
                .foregroundStyle(Theme.Colors.text)
                .autocorrectionDisabled()
            
            if !searchQuery.isEmpty {
                Button { searchQuery = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
        }
        .padding(Theme.Spacing.mds)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(.white.opacity(0.08))
                )
        }
    }
    
    // MARK: - Filter Chips
    
    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(SeriesFilter.allCases, id: \.self) { filter in
                    Button {
                        withAnimation(Theme.Animation.spring) {
                            activeFilter = filter
                        }
                    } label: {
                        Text(filter.rawValue)
                            .font(Theme.Typography.label)
                            .foregroundStyle(activeFilter == filter ? .white : Theme.Colors.textSecondary)
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.sm)
                            .background {
                                Capsule()
                                    .fill(activeFilter == filter ? Theme.Colors.primary : Theme.Colors.surface)
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Series Grid
    
    private var seriesGrid: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                ForEach(filteredSeries) { series in
                    Button {
                        selectedSeries = series
                    } label: {
                        SeriesGradientCard(
                            series: series,
                            isEnrolled: enrolledSeriesIds.contains(series.id)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .refreshable { await loadData() }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(Theme.Typography.iconXL)
                .foregroundStyle(Theme.Colors.textTertiary)
            Text("No devotionals found")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
    }
    
    // MARK: - Data
    
    private func loadData() async {
        let service = SupabaseDevotionalService()
        do {
            allSeries = try await service.getAllSeries()
            if let userId = appState.currentUser?.id {
                enrollments = try await service.getEnrollments(userId: userId)
            }
        } catch {
            allSeries = [.preview]
        }
        isLoading = false
    }
}

// MARK: - Series Gradient Card

struct SeriesGradientCard: View {
    let series: DevotionalSeries
    var isEnrolled: Bool = false
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            series.gradient
            
            // Glass overlay at bottom
            VStack {
                Spacer()
                Rectangle()
                    .fill(.ultraThinMaterial.opacity(0.3))
                    .frame(height: 40)
            }
            
            VStack(alignment: .leading, spacing: 0) {
                // Badges row
                HStack {
                    if isEnrolled {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(Theme.Typography.caption2)
                            Text("Enrolled")
                                .font(Theme.Typography.caption2)
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, Theme.Spacing.sm)
                        .padding(.vertical, 3)
                        .background(.white.opacity(0.25))
                        .clipShape(Capsule())
                    }
                    
                    Spacer()
                    
                    if series.isSeasonal {
                        Image(systemName: "calendar")
                            .font(Theme.Typography.caption2)
                            .foregroundStyle(.white)
                            .frame(width: 24, height: 24)
                            .background(.white.opacity(0.25))
                            .clipShape(Circle())
                    }
                }
                
                Spacer()
                
                // Title + meta
                Text(series.title)
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .padding(.bottom, Theme.Spacing.xs)
                
                HStack(spacing: 4) {
                    Text("\(series.totalDays) days")
                    Circle().fill(.white.opacity(0.5)).frame(width: 3, height: 3)
                    Text(series.difficultyLevel.displayName)
                }
                .font(Theme.Typography.caption2)
                .foregroundStyle(.white.opacity(0.8))
            }
            .padding(Theme.Spacing.mds)
        }
        .frame(height: 160)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
    }
}

#Preview {
    NavigationStack {
        SeriesLibraryView()
            .environment(AppState.preview)
    }
}
