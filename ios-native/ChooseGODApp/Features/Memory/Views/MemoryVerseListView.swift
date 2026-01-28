import SwiftUI

struct MemoryVerseListView: View {
    @StateObject private var viewModel = MemoryViewModel()
    @State private var showAddSheet = false
    @State private var showPractice = false
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            if viewModel.isLoading && viewModel.verses.isEmpty {
                ProgressView()
                    .tint(Theme.Colors.primary)
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
    }
    
    private var dueBanner: some View {
        Button {
            viewModel.resetPractice()
            showPractice = true
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "brain.head.profile")
                    .font(.title2)
                    .foregroundStyle(Theme.Colors.primary)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(viewModel.dueVerses.count) verse\(viewModel.dueVerses.count == 1 ? "" : "s") due")
                        .font(.headline)
                        .foregroundStyle(Theme.Colors.text)
                    Text("Tap to start practice")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(16)
            .modifier(GlassCard())
        }
    }
    
    private func verseCard(_ verse: MemoryVerse) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(verse.reference)
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                
                Spacer()
                
                Text(verse.translation.uppercased())
                    .font(.caption2.bold())
                    .foregroundStyle(Theme.Colors.primary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Theme.Colors.primaryAlpha(0.2))
                    .clipShape(Capsule())
            }
            
            Text(verse.text)
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.textSecondary)
                .lineLimit(2)
            
            HStack(spacing: 16) {
                Label(reviewDateText(verse.nextReview), systemImage: "clock")
                Label("\(verse.reviewCount) reviews", systemImage: "arrow.triangle.2.circlepath")
            }
            .font(.caption)
            .foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding(16)
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
        VStack(spacing: 16) {
            Image(systemName: "book.closed.fill")
                .font(.system(size: 56))
                .foregroundStyle(Theme.Colors.textTertiary)
            Text("No Memory Verses")
                .font(.title3.bold())
                .foregroundStyle(Theme.Colors.text)
            Text("Add verses from the Bible reader to build your memorization queue.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            Button("Add Verse") { showAddSheet = true }
                .buttonStyle(GlassButtonStyle(isProminent: true))
        }
        .padding(40)
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
