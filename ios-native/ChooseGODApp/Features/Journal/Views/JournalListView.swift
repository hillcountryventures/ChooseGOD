import SwiftUI

struct JournalListView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = JournalViewModel()
    @State private var showingCompose = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                if viewModel.isLoading && viewModel.moments.isEmpty {
                    loadingView
                } else if viewModel.filteredMoments.isEmpty {
                    emptyView
                } else {
                    momentsList
                }
            }
            .navigationTitle("Journal")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .searchable(text: $viewModel.searchText, prompt: "Search entries...")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingCompose = true
                    } label: {
                        Image(systemName: "square.and.pencil")
                            .foregroundStyle(Theme.Colors.primary)
                    }
                }
            }
            .sheet(isPresented: $showingCompose) {
                JournalComposeView(viewModel: viewModel)
            }
            .task {
                await viewModel.loadMoments()
            }
        }
        .onAppear { AnalyticsService.shared.screen("journal_list") }
    }
    
    // MARK: - Filter Bar
    
    private var filterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(JournalFilter.allCases, id: \.self) { filter in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            viewModel.activeFilter = filter
                        }
                    } label: {
                        Text(filter.rawValue)
                            .font(Theme.Typography.caption)
                            .fontWeight(viewModel.activeFilter == filter ? .semibold : .regular)
                            .foregroundStyle(viewModel.activeFilter == filter ? .white : Theme.Colors.textSecondary)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background {
                                Capsule()
                                    .fill(viewModel.activeFilter == filter
                                          ? Theme.Colors.primary
                                          : Theme.Colors.surface)
                            }
                    }
                }
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Moments List
    
    private var momentsList: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                filterBar
                    .padding(.vertical, 8)
                
                ForEach(viewModel.filteredMoments) { moment in
                    NavigationLink {
                        JournalDetailView(moment: moment, viewModel: viewModel)
                    } label: {
                        MomentRowView(moment: moment)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .refreshable {
            await viewModel.loadMoments()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyView: some View {
        EmptyStateView(
            icon: "book.closed.fill",
            title: "Your Story Awaits",
            description: "Start writing to capture what God is doing in your life. Every entry is a testimony.",
            actionTitle: "Write Entry",
            action: { showingCompose = true }
        )
    }
    
    // MARK: - Loading
    
    private var loadingView: some View {
        VStack(spacing: 12) {
            ProgressView()
                .tint(Theme.Colors.primary)
            Text("Loading entries...")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
    }
}

// MARK: - Moment Row

struct MomentRowView: View {
    let moment: SpiritualMoment
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header: type badge + date
            HStack {
                Label {
                    Text(moment.momentType.rawValue.capitalized)
                        .font(.caption2.weight(.semibold))
                } icon: {
                    Image(systemName: iconForType(moment.momentType))
                        .font(.caption2)
                }
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Theme.Colors.primaryAlpha(0.15), in: Capsule())
                
                Spacer()
                
                Text(moment.shortDate)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            
            // Content preview
            Text(moment.content)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(3)
            
            // Linked verses
            if !moment.linkedVerses.isEmpty {
                HStack(spacing: 6) {
                    Image(systemName: "book")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.primary)
                    
                    Text(moment.linkedVerses.map(\.reference).joined(separator: ", "))
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.primaryLight)
                        .lineLimit(1)
                }
            }
            
            // Themes
            if !moment.themes.isEmpty {
                HStack(spacing: 6) {
                    ForEach(moment.themes.prefix(3), id: \.self) { theme in
                        Text(theme)
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.textSecondary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Theme.Colors.surfaceElevated, in: Capsule())
                    }
                }
            }
        }
        .padding()
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .modifier(GlassCard(cornerRadius: 16, opacity: 0.5))
        .padding(.horizontal)
        .padding(.vertical, 4)
    }
    
    private func iconForType(_ type: MomentType) -> String {
        switch type {
        case .journal: return "pencil.line"
        case .prayer: return "hands.sparkles.fill"
        case .gratitude: return "heart.fill"
        case .devotional: return "book.fill"
        case .confession: return "drop.fill"
        case .lectio: return "text.book.closed.fill"
        case .examen: return "moon.stars.fill"
        default: return "circle.fill"
        }
    }
}

#Preview {
    JournalListView()
        .environment(AppState())
        .preferredColorScheme(.dark)
}
