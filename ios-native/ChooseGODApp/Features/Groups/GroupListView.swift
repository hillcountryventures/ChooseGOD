import SwiftUI

/// List of user's Bible study groups
struct GroupListView: View {
    @Environment(AppState.self) private var appState
    @State private var groups: [BibleStudyGroup] = []
    @State private var isLoading = true
    @State private var showCreateSheet = false
    @State private var showJoinSheet = false
    @State private var errorMessage: String?
    
    private let service = SupabaseGroupService()
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                if isLoading {
                    ProgressView()
                        .tint(Theme.Colors.primary)
                } else if groups.isEmpty {
                    emptyState
                } else {
                    groupsList
                }
            }
            .navigationTitle("Groups")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button {
                            showCreateSheet = true
                        } label: {
                            Label("Create Group", systemImage: "plus.circle")
                        }
                        
                        Button {
                            showJoinSheet = true
                        } label: {
                            Label("Join Group", systemImage: "person.badge.plus")
                        }
                    } label: {
                        Image(systemName: "plus")
                            .foregroundStyle(Theme.Colors.primary)
                    }
                }
            }
            .sheet(isPresented: $showCreateSheet) {
                CreateGroupSheet { group in
                    groups.insert(group, at: 0)
                }
                .environment(appState)
            }
            .sheet(isPresented: $showJoinSheet) {
                JoinGroupSheet { group in
                    groups.insert(group, at: 0)
                }
                .environment(appState)
            }
            .task {
                await loadGroups()
            }
            .refreshable {
                await loadGroups()
            }
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.3")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primary.opacity(0.6))
            
            Text("No Groups Yet")
                .font(Theme.Typography.title2)
                .foregroundStyle(Theme.Colors.text)
            
            Text("Create a Bible study group or join one with an invite code.")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            HStack(spacing: 12) {
                Button("Create Group") {
                    showCreateSheet = true
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.Colors.primary)
                
                Button("Join Group") {
                    showJoinSheet = true
                }
                .buttonStyle(.bordered)
                .tint(Theme.Colors.primary)
            }
        }
    }
    
    // MARK: - Groups List
    
    private var groupsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(groups) { group in
                    NavigationLink {
                        GroupDetailView(group: group)
                            .environment(appState)
                    } label: {
                        groupCard(group)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
        }
    }
    
    private func groupCard(_ group: BibleStudyGroup) -> some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.2))
                    .frame(width: 50, height: 50)
                Image(systemName: "person.3.fill")
                    .foregroundStyle(Theme.Colors.primary)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(group.name)
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(Theme.Colors.text)
                
                HStack(spacing: 8) {
                    if let church = group.churchAffiliation {
                        Label(church, systemImage: "building.columns")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                    
                    if let count = group.memberCount {
                        Label("\(count) members", systemImage: "person.2")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(.ultraThinMaterial)
        }
        .overlay {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .stroke(.white.opacity(0.1), lineWidth: 1)
        }
    }
    
    // MARK: - Data Loading
    
    private func loadGroups() async {
        guard let userId = appState.currentUser?.id else { return }
        do {
            groups = try await service.getGroups(userId: userId)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

#Preview {
    GroupListView()
        .environment(AppState.preview)
}
