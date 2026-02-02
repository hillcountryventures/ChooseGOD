import SwiftUI

/// Prayer Circles list — view, create, and join circles
struct PrayerCirclesView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = CircleViewModel()
    @State private var showCreateSheet = false
    @State private var showJoinSheet = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if viewModel.isLoadingCircles {
                ShimmerView(height: 20)
                        .tint(Theme.Colors.primary)
                } else if viewModel.circles.isEmpty {
                    emptyState
                } else {
                    circlesList
                }
            }
            .navigationTitle("Prayer Circles")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button {
                            showCreateSheet = true
                        } label: {
                            Label("Create Circle", systemImage: "plus.circle")
                        }
                        
                        Button {
                            showJoinSheet = true
                        } label: {
                            Label("Join Circle", systemImage: "person.badge.plus")
                        }
                    } label: {
                        Image(systemName: "plus")
                            .foregroundStyle(Theme.Colors.primary)
                    }
                }
            }
            .sheet(isPresented: $showCreateSheet) {
                CreateCircleSheet(viewModel: viewModel)
            }
            .sheet(isPresented: $showJoinSheet) {
                JoinCircleSheet(viewModel: viewModel)
            }
            .task {
                guard let userId = appState.currentUser?.id else { return }
                await viewModel.loadCircles(userId: userId)
            }
            .refreshable {
                guard let userId = appState.currentUser?.id else { return }
                await viewModel.loadCircles(userId: userId)
            }
        }
    }
    
    // MARK: - Circles List
    
    private var circlesList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.circles) { circle in
                    NavigationLink {
                        CircleDetailView(circle: circle, viewModel: viewModel)
                    } label: {
                        CircleCardRow(circle: circle)
                    }
                }
            }
            .padding()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.15))
                    .frame(width: 100, height: 100)
                    .blur(radius: 10)
                
                Image(systemName: "person.3.fill")
                    .font(Theme.Typography.iconLarge)
                    .foregroundStyle(Theme.Colors.primary.opacity(0.6))
            }
            
            Text("No Prayer Circles Yet")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            Text("Create a circle to pray with friends\nand family, or join one with an invite code.")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            
            HStack(spacing: 12) {
                Button {
                    showCreateSheet = true
                } label: {
                    Label("Create", systemImage: "plus.circle")
                        .font(Theme.Typography.button)
                        .foregroundStyle(.white)
                }
                .buttonStyle(GlassButtonStyle(isProminent: true))
                .accessibilityLabel("Create prayer circle")
                .accessibilityHint("Double tap to create a new prayer circle")
                
                Button {
                    showJoinSheet = true
                } label: {
                    Label("Join", systemImage: "person.badge.plus")
                        .font(Theme.Typography.button)
                        .foregroundStyle(.white)
                }
                .buttonStyle(GlassButtonStyle())
                .accessibilityLabel("Join prayer circle")
                .accessibilityHint("Double tap to join an existing circle with an invite code")
            }
            
            Spacer()
        }
        .padding()
    }
}

// MARK: - Circle Card Row

struct CircleCardRow: View {
    let circle: PrayerCircle
    
    var body: some View {
        HStack(spacing: 16) {
            // Circle avatar
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 50, height: 50)
                
                Text(circleInitials)
                    .font(Theme.Typography.bodyLarge)
                    .foregroundStyle(.white)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(circle.name)
                    .font(Theme.Typography.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.Colors.text)
                
                HStack(spacing: 8) {
                    Label("\(circle.memberCount ?? 0)", systemImage: "person.2")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    
                    Text("•")
                        .foregroundStyle(Theme.Colors.textTertiary)
                    
                    Text(circle.createdAt, style: .date)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding()
        .glassCard(cornerRadius: Theme.CornerRadius.xl)
    }
    
    private var circleInitials: String {
        let words = circle.name.split(separator: " ")
        if words.count >= 2 {
            return "\(words[0].prefix(1))\(words[1].prefix(1))".uppercased()
        }
        return String(circle.name.prefix(2)).uppercased()
    }
}

#Preview {
    PrayerCirclesView()
        .environment(AppState.preview)
}
