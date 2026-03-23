import SwiftUI

struct MemoryVerseListView: View {
    @StateObject private var viewModel = MemoryViewModel()
    @State private var showAddSheet = false
    @State private var showPractice = false
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            if viewModel.isLoading && viewModel.verses.isEmpty {
                ShimmerView(height: 20.0)
                    .tint(Theme.Colors.primary)
            } else if let error = viewModel.error, viewModel.verses.isEmpty {
                VStack {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                    Button("Retry") {
                        viewModel.error = nil
                        Task { await viewModel.fetchVerses() }
                    }
                }
            } else if viewModel.verses.isEmpty {
                emptyState
            } else {
                verseList
            }
        }
        .navigationTitle("Memory Verses")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showAddSheet = true
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            AddMemoryVerseSheet(viewModel: viewModel)
        }
        .navigationDestination(isPresented: $showPractice) {
            MemoryPracticeView(viewModel: viewModel)
        }
        .task {
            // TODO: Set userId from auth state
            await viewModel.fetchVerses()
        }
        .onAppear { 
            // TODO: Add analytics when service is properly imported
            // AnalyticsService.shared.screen("memory_verse_list") 
        }
    }
    
    // MARK: - Verse List
    
    private var verseList: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Due banner
                if !viewModel.dueVerses.isEmpty {
                    dueBanner
                }
                
                // All verses
                ForEach(viewModel.verses) { verse in
                    verseCard(verse)
                }
            }
            .padding()
        }
        .refreshable {
            await viewModel.fetchVerses()
        }
    }
    
    private var dueBanner: some View {
        Button {
            viewModel.resetPractice()
            showPractice = true
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "brain.head.profile")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.primary)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(viewModel.dueVerses.count) verse\(viewModel.dueVerses.count == 1 ? "" : "s") due")
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.text)
                    Text("Tap to start practice")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(Theme.Spacing.md)
            .modifier(GlassCard())
        }
    }
    
    private func verseCard(_ verse: MemoryVerse) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(verse.reference)
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
                
                Spacer()
                
                Text(verse.translation.uppercased())
                    .font(Theme.Typography.captionBold)
                    .foregroundStyle(Theme.Colors.primary)
                    .padding(.horizontal, Theme.Spacing.sm)
                    .padding(.vertical, 3)
                    .background(Theme.Colors.primaryAlpha(0.2))
                    .clipShape(Capsule())
            }
            
            Text(verse.text)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textSecondary)
                .lineLimit(2)
            
            HStack(spacing: 16) {
                Label(reviewDateText(verse.nextReview), systemImage: "clock")
                Label("\(verse.reviewCount) reviews", systemImage: "arrow.triangle.2.circlepath")
            }
            .font(Theme.Typography.caption)
            .foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding(Theme.Spacing.md)
        .modifier(GlassCard())
        .contextMenu {
            Button(role: .destructive) {
                Task { await viewModel.deleteVerse(verse) }
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }
    
    private var emptyState: some View {
        EmptyStateView(
            icon: "brain.head.profile",
            title: "Hide His Word in Your Heart",
            description: "Add verses from the Bible reader to memorize Scripture and grow deeper in faith.",
            actionTitle: "Add Verse",
            action: { showAddSheet = true }
        )
    }
    
    // MARK: - Helpers
    
    private func reviewDateText(_ date: Date) -> String {
        if date <= Date() {
            return "Due now"
        }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}
