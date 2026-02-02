import SwiftUI

/// Detail view for a Bible study group — members, reading plan, discussion, prayer wall
struct GroupDetailView: View {
    @Environment(AppState.self) private var appState
    let group: BibleStudyGroup
    
    @State private var members: [GroupMember] = []
    @State private var discussions: [GroupDiscussion] = []
    @State private var prayerRequests: [GroupPrayerRequest] = []
    @State private var readingPlan: GroupReadingPlan?
    @State private var selectedTab: DetailTab = .discussion
    @State private var currentUserMember: GroupMember?
    @State private var showShareCode = false
    
    private let service = SupabaseGroupService()
    
    enum DetailTab: String, CaseIterable {
        case discussion = "Discussion"
        case prayerWall = "Prayer Wall"
        case members = "Members"
    }
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Group Header
                    groupHeader
                    
                    // Reading Plan Progress
                    if let plan = readingPlan {
                        readingPlanCard(plan)
                    }
                    
                    // Tab Picker
                    Picker("Section", selection: $selectedTab) {
                        ForEach(DetailTab.allCases, id: \.self) { tab in
                            Text(tab.rawValue).tag(tab)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    
                    // Tab Content
                    switch selectedTab {
                    case .discussion:
                        GroupDiscussionView(groupId: group.id)
                            .environment(appState)
                    case .prayerWall:
                        GroupPrayerWallView(groupId: group.id)
                            .environment(appState)
                    case .members:
                        membersSection
                    }
                }
                .padding(.bottom, 100)
            }
        }
        .navigationTitle(group.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showShareCode = true
                } label: {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
        }
        .sheet(isPresented: $showShareCode) {
            shareCodeSheet
        }
        .task {
            await loadData()
        }
    }
    
    // MARK: - Group Header
    
    private var groupHeader: some View {
        VStack(spacing: 8) {
            if let desc = group.description {
                Text(desc)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
            }
            
            HStack(spacing: 16) {
                statPill(icon: "person.2", value: "\(members.count)", label: "Members")
                
                if let plan = readingPlan {
                    statPill(icon: "book", value: "\(plan.dailyPassages.count)", label: "Days")
                }
                
                statPill(icon: "text.bubble", value: "\(discussions.count)", label: "Posts")
            }
        }
        .padding()
    }
    
    private func statPill(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption)
                Text(value)
                    .font(Theme.Typography.headline)
            }
            .foregroundStyle(Theme.Colors.primary)
            
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.smd)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(.ultraThinMaterial)
        }
    }
    
    // MARK: - Reading Plan Card
    
    private func readingPlanCard(_ plan: GroupReadingPlan) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "book.fill")
                    .foregroundStyle(Theme.Colors.accent)
                Text(plan.title)
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
            }
            
            if let todayIndex = todayPassageIndex(plan) {
                Text("Today: \(plan.dailyPassages[todayIndex])")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                
                ProgressView(value: Double(todayIndex + 1), total: Double(plan.dailyPassages.count))
                    .tint(Theme.Colors.primary)
            }
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
        .padding(.horizontal)
    }
    
    private func todayPassageIndex(_ plan: GroupReadingPlan) -> Int? {
        let daysSinceStart = Calendar.current.dateComponents([.day], from: plan.startDate, to: Date()).day ?? 0
        let index = max(0, daysSinceStart)
        return index < plan.dailyPassages.count ? index : nil
    }
    
    // MARK: - Members Section
    
    private var membersSection: some View {
        LazyVStack(spacing: 8) {
            ForEach(members) { member in
                HStack(spacing: 12) {
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.2))
                        .frame(width: 40, height: 40)
                        .overlay {
                            Text(memberInitials(member))
                                .font(Theme.Typography.captionSemibold)
                                .foregroundStyle(Theme.Colors.primary)
                        }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(member.displayName ?? "Member")
                                .font(Theme.Typography.subheadlineSemibold)
                                .foregroundStyle(Theme.Colors.text)
                            
                            if member.isPastor {
                                Text("Pastor")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Capsule().fill(Theme.Colors.primary))
                            } else if member.role == .leader {
                                Text("Leader")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(Theme.Colors.accent)
                            }
                        }
                        
                        if let progress = member.readingProgress {
                            Text("\(Int(progress * 100))% reading progress")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.secondaryText)
                        }
                    }
                    
                    Spacer()
                    
                    if let lastActive = member.lastActiveAt {
                        Text(lastActive.relativeTime)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
                .padding(Theme.Spacing.smd)
            }
        }
        .padding(.horizontal)
    }
    
    private func memberInitials(_ member: GroupMember) -> String {
        guard let name = member.displayName else { return "?" }
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
    
    // MARK: - Share Code Sheet
    
    private var shareCodeSheet: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()
                
                Image(systemName: "person.badge.plus")
                    .font(.system(size: 50))
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("Invite to \(group.name)")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.text)
                
                Text(group.inviteCode)
                    .font(.system(size: 40, weight: .bold, design: .monospaced))
                    .foregroundStyle(Theme.Colors.primary)
                    .padding()
                    .background {
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                            .fill(.ultraThinMaterial)
                    }
                
                Text("Share this code with others to join your group")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                
                ShareLink(
                    item: "Join my Bible study group \"\(group.name)\" on ChooseGOD! Use code: \(group.inviteCode)\n\nhttps://choosegod.app/invite/\(group.inviteCode)"
                ) {
                    Label("Share Invite", systemImage: "square.and.arrow.up")
                        .font(Theme.Typography.subheadlineSemibold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Theme.Colors.primary)
                        .cornerRadius(Theme.CornerRadius.lg)
                }
                .padding(.horizontal, 40)
                
                Spacer()
            }
            .padding()
            .background(Theme.Colors.background.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { showShareCode = false }
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    // MARK: - Data
    
    private func loadData() async {
        guard let userId = appState.currentUser?.id else { return }
        
        async let membersTask = service.getMembers(groupId: group.id)
        async let discussionsTask = service.getDiscussions(groupId: group.id, parentId: nil)
        async let prayersTask = service.getPrayerWall(groupId: group.id)
        async let planTask = service.getActiveReadingPlan(groupId: group.id)
        
        do {
            members = try await membersTask
            discussions = try await discussionsTask
            prayerRequests = try await prayersTask
            readingPlan = try await planTask
            currentUserMember = members.first { $0.userId == userId }
        } catch {
            // Silently handle — partial data is fine
        }
    }
}

#Preview {
    NavigationStack {
        GroupDetailView(group: .preview)
            .environment(AppState.preview)
    }
}
