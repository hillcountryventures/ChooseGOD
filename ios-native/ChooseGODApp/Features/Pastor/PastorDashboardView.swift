import SwiftUI

// MARK: - View Model

@MainActor
final class PastorDashboardViewModel: ObservableObject {
    @Published var groups: [BibleStudyGroup] = []
    @Published var selectedGroup: BibleStudyGroup?
    @Published var members: [GroupMember] = []
    @Published var activePlan: GroupReadingPlan?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var weeklyPassage = ""
    @Published var showPassagePushed = false
    
    private let groupService: GroupServiceProtocol
    
    var memberCount: Int { members.count }
    
    var activeThisWeekPercent: Double {
        guard !members.isEmpty else { return 0 }
        let oneWeekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        let active = members.filter { ($0.lastActiveAt ?? .distantPast) > oneWeekAgo }.count
        return Double(active) / Double(members.count) * 100
    }
    
    var readingCompletionPercent: Double {
        guard !members.isEmpty else { return 0 }
        let total = members.compactMap(\.readingProgress).reduce(0, +)
        return total / Double(members.count) * 100
    }
    
    init(groupService: GroupServiceProtocol = SupabaseGroupService()) {
        self.groupService = groupService
    }
    
    func loadDashboard(userId: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            groups = try await groupService.getGroups(userId: userId)
            if let first = groups.first {
                selectedGroup = first
                await loadGroupDetails(first)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func loadGroupDetails(_ group: BibleStudyGroup) async {
        do {
            members = try await groupService.getMembers(groupId: group.id)
            activePlan = try await groupService.getActiveReadingPlan(groupId: group.id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func pushWeeklyPassage(userId: String) async {
        guard let group = selectedGroup, !weeklyPassage.isEmpty else { return }
        do {
            _ = try await groupService.postDiscussion(
                groupId: group.id,
                userId: userId,
                displayName: "Pastor",
                message: "📖 This Week's Passage: \(weeklyPassage)",
                passageReference: weeklyPassage,
                parentId: nil
            )
            showPassagePushed = true
            weeklyPassage = ""
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - View

struct PastorDashboardView: View {
    @StateObject private var viewModel = PastorDashboardViewModel()
    @State private var showReadingPlanPicker = false
    @State private var showOnboarding = false
    
    let userId: String
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading dashboard…")
                } else if viewModel.groups.isEmpty {
                    emptyState
                } else {
                    dashboardContent
                }
            }
            .navigationTitle("Pastor Dashboard")
            .task { await viewModel.loadDashboard(userId: userId) }
            .alert("Passage Sent!", isPresented: $viewModel.showPassagePushed) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Your congregation has been notified of this week's passage.")
            }
            .sheet(isPresented: $showOnboarding) {
                PastorOnboardingView(userId: userId) {
                    Task { await viewModel.loadDashboard(userId: userId) }
                }
            }
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "building.columns")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)
            Text("No Church Group Yet")
                .font(Theme.Typography.title2)
            Text("Set up your church to start managing your congregation's Bible study.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
                .padding(.horizontal)
            Button("Set Up My Church") {
                showOnboarding = true
            }
            .buttonStyle(.borderedProminent)
        }
    }
    
    // MARK: - Dashboard Content
    
    private var dashboardContent: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Group Picker
                if viewModel.groups.count > 1 {
                    groupPicker
                }
                
                // Stats Cards
                statsRow
                
                // Current Reading Plan
                readingPlanCard
                
                // Push Weekly Passage
                weeklyPassageCard
                
                // Church Code
                if let group = viewModel.selectedGroup {
                    NavigationLink {
                        ChurchCodeView(group: group)
                    } label: {
                        HStack {
                            Label("Share Church Code", systemImage: "qrcode")
                            Spacer()
                            Image(systemName: "chevron.right")
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            .padding()
        }
    }
    
    private var groupPicker: some View {
        Menu {
            ForEach(viewModel.groups) { group in
                Button(group.name) {
                    viewModel.selectedGroup = group
                    Task { await viewModel.loadGroupDetails(group) }
                }
            }
        } label: {
            HStack {
                Text(viewModel.selectedGroup?.name ?? "Select Group")
                    .font(Theme.Typography.headline)
                Image(systemName: "chevron.down")
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.smd)
            .background(.ultraThinMaterial)
            .clipShape(Capsule())
        }
    }
    
    private var statsRow: some View {
        HStack(spacing: 12) {
            StatCard(title: "Members", value: "\(viewModel.memberCount)", icon: "person.3", color: .blue)
            StatCard(title: "Active This Week", value: String(format: "%.0f%%", viewModel.activeThisWeekPercent), icon: "flame", color: .orange)
            StatCard(title: "Reading Done", value: String(format: "%.0f%%", viewModel.readingCompletionPercent), icon: "book", color: .green)
        }
    }
    
    private var readingPlanCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Current Reading Plan", systemImage: "list.bullet.rectangle")
                    .font(Theme.Typography.headline)
                Spacer()
                Button("Change") { showReadingPlanPicker = true }
                    .font(Theme.Typography.subheadline)
            }
            
            if let plan = viewModel.activePlan {
                Text(plan.title)
                    .font(Theme.Typography.title3)
                if let desc = plan.description {
                    Text(desc)
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(.secondary)
                }
            } else {
                Text("No plan assigned")
                    .foregroundStyle(.secondary)
                Button("Assign a Reading Plan") { showReadingPlanPicker = true }
                    .buttonStyle(.bordered)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    private var weeklyPassageCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("This Week's Passage", systemImage: "megaphone")
                .font(Theme.Typography.headline)
            
            TextField("e.g. John 3:16-21", text: $viewModel.weeklyPassage)
                .textFieldStyle(.roundedBorder)
            
            Button {
                Task { await viewModel.pushWeeklyPassage(userId: userId) }
            } label: {
                Label("Push to Congregation", systemImage: "paperplane.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.weeklyPassage.isEmpty)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Stat Card

private struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(Theme.Typography.title2)
                .foregroundStyle(color)
            Text(value)
                .font(Theme.Typography.title3)
            Text(title)
                .font(Theme.Typography.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.md)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Preview

#Preview {
    PastorDashboardView(userId: "preview-user")
}
