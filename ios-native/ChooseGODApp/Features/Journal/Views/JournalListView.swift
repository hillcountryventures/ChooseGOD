import SwiftUI

struct JournalListView: View {
    @StateObject private var viewModel = JournalViewModel()
    @State private var showCompose = false
    
    var body: some View {
        ZStack {
            Color.clear.ignoresSafeArea() // Placeholder for Theme.Colors.background
            
            if viewModel.isLoading && viewModel.entries.isEmpty {
                ShimmerView(height: 20)
                    .tint(.blue) // Placeholder for Theme.Colors.primary
            } else if let error = viewModel.error, viewModel.entries.isEmpty {
                // ErrorRetryView(message: error) { // Replaced with simple view
                VStack {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                    Button("Retry") {
                        viewModel.error = nil
                        Task { await viewModel.fetchEntries() }
                    }
                }
                // }
            } else if viewModel.entries.isEmpty {
                emptyState
            } else {
                listContent
            }
        }
        // .screenBackground(Theme.Colors.background) // TODO: Fix this modifier
        .navigationTitle("Journal")
        .navigationBarTitleDisplayMode(.large)
        .preferredColorScheme(.dark)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showCompose = true
                } label: {
                    Image(systemName: "square.and.pencil")
                        .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                }
            }
        }
        .sheet(isPresented: $showCompose) {
            JournalComposeView(viewModel: viewModel)
        }
        .task {
            await viewModel.fetchEntries()
        }
        .onAppear {
            // TODO: Fix AnalyticsService import - AnalyticsService.shared.screen("journal_list")
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "book.closed")
                .font(.system(size: 80)) // Placeholder for Theme.Typography.iconLarge
                .foregroundColor(.gray) // Placeholder for Theme.Colors.textTertiary
            Text("Your journal is empty")
                .font(.title2) // Placeholder for Theme.Typography.h3
                .foregroundColor(.primary) // Placeholder for Theme.Colors.text
            Text("Tap the pencil icon to write your first entry")
                .font(.body) // Placeholder for Theme.Typography.body
                .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                .multilineTextAlignment(.center)
            Button {
                showCompose = true
            } label: {
                Text("Write Entry")
                    .font(.headline) // Placeholder for Theme.Typography.button
                    .foregroundColor(.white)
                    .padding(.horizontal, 16) // Placeholder for Theme.Spacing.md
                    .padding(.vertical, 12) // Placeholder for Theme.Spacing.sm
                    .background(Color.blue, in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.primary
            }
        }
        .padding(.horizontal, 24) // Placeholder for Theme.Spacing.xl
    }
    
    // MARK: - Journal List
    
    private var listContent: some View {
        ScrollView {
            VStack(spacing: 16) { // Placeholder for Theme.Spacing.lg
                ForEach(viewModel.entries) { entry in
                    NavigationLink {
                        JournalDetailView(entry: entry, viewModel: viewModel)
                    } label: {
                        JournalEntryCard(entry: entry)
                    }
                    .buttonStyle(.plain)
                }
                
                if viewModel.hasMore {
                    Button {
                        Task { await viewModel.loadMore() }
                    } label: {
                        if viewModel.isLoadingMore {
                            ProgressView()
                                .tint(.blue) // Placeholder for Theme.Colors.primary
                        } else {
                            Text("Load More")
                                .font(.body) // Placeholder for Theme.Typography.body
                                .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                        }
                    }
                    .padding(.vertical, 16) // Placeholder for Theme.Spacing.lg
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 16) // Placeholder for Theme.Spacing.lg
            .padding(.vertical, 16) // Placeholder for Theme.Spacing.lg
        }
    }
}

// MARK: - Journal Entry Card

struct JournalEntryCard: View {
    let entry: JournalEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) { // Placeholder for Theme.Spacing.sm
            Text(entry.title)
                .font(.headline) // Placeholder for Theme.Typography.h4
                .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                .lineLimit(1)
            Text(entry.content)
                .font(.body) // Placeholder for Theme.Typography.body
                .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                .lineLimit(2)
            Text(entry.createdAt, style: .date)
                .font(.caption) // Placeholder for Theme.Typography.caption1
                .foregroundColor(.gray) // Placeholder for Theme.Colors.textTertiary
        }
        .padding(16) // Placeholder for Theme.Spacing.lg
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 12)) // Placeholder for Theme.Colors.backgroundSecondary
        .overlay {
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1) // Placeholder for Theme.Colors.divider
        }
    }
}

// MARK: - Shimmer View (Placeholder)

struct ShimmerView: View {
    let height: CGFloat
    @State private var phase = 0.0
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<5) { _ in
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: height)
                    .overlay {
                        GeometryReader { geo in
                            RoundedRectangle(cornerRadius: 8)
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(stops: [
                                            .init(color: .clear, location: 0),
                                            .init(color: .white.opacity(0.3), location: 0.5),
                                            .init(color: .clear, location: 1)
                                        ]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                    .offset(x: geo.size.width * phase)
                                )
                        }
                    }
            }
        }
        .padding(.horizontal, 16)
        .onAppear {
            withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                phase = 1.0
            }
        }
    }
}

#Preview {
    NavigationStack {
        JournalListView()
    }
}
