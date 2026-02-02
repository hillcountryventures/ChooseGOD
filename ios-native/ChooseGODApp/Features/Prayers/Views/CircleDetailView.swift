import SwiftUI

/// Circle detail — shared prayers and members
struct CircleDetailView: View {
    let circle: PrayerCircle
    @Bindable var viewModel: CircleViewModel
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedTab: DetailTab = .prayers
    @State private var showAddPrayer = false
    @State private var newPrayerText = ""
    @State private var showLeaveAlert = false
    @State private var showShareSheet = false
    
    enum DetailTab: String, CaseIterable {
        case prayers = "Prayers"
        case members = "Members"
    }
    
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Theme.Colors.background
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header card with circle info
                circleHeader
                
                // Tab picker
                Picker("Tab", selection: $selectedTab) {
                    ForEach(DetailTab.allCases, id: \.self) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.vertical, Theme.Spacing.sm)
                
                // Content
                if viewModel.isLoadingDetail {
                    Spacer()
                ShimmerView(height: 20)
                        .tint(Theme.Colors.primary)
                    Spacer()
                } else {
                    switch selectedTab {
                    case .prayers:
                        prayersList
                    case .members:
                        membersList
                    }
                }
            }
            
            // FAB for adding prayer
            if selectedTab == .prayers {
                GlassFAB(icon: "plus", color: Theme.Colors.primary) {
                    showAddPrayer = true
                }
                .padding(.trailing, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.lg)
            }
        }
        .navigationTitle(circle.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button {
                        UIPasteboard.general.string = circle.inviteCode
                    } label: {
                        Label("Copy Invite Code", systemImage: "doc.on.doc")
                    }
                    
                    Button {
                        showShareSheet = true
                    } label: {
                        Label("Share Circle", systemImage: "square.and.arrow.up")
                    }
                    
                    Divider()
                    
                    Button(role: .destructive) {
                        showLeaveAlert = true
                    } label: {
                        Label("Leave Circle", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
        }
        .sheet(isPresented: $showAddPrayer) {
            addPrayerSheet
        }
        .alert("Leave Circle?", isPresented: $showLeaveAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Leave", role: .destructive)
                .accessibilityLabel("Leave this prayer circle") {
                Task {
                    guard let userId = appState.currentUser?.id else { return }
                    await viewModel.leaveCircle(circleId: circle.id, userId: userId)
                    dismiss()
                }
            }
        } message: {
            Text("You'll no longer see prayers from this circle.")
        }
        .task {
            await viewModel.loadCircleDetail(circle: circle)
        }
    }
    
    // MARK: - Circle Header
    
    private var circleHeader: some View {
        VStack(spacing: 12) {
            // Member avatars row
            HStack(spacing: -8) {
                ForEach(Array(viewModel.circleMembers.prefix(5).enumerated()), id: \.offset) { index, member in
                    MemberAvatar(member: member)
                        .zIndex(Double(5 - index))
                }
                
                if viewModel.circleMembers.count > 5 {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.surfaceElevated)
                            .frame(width: 36, height: 36)
                        
                        Text("+\(viewModel.circleMembers.count - 5)")
                            .font(Theme.Typography.labelSmall)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
            }
            
            // Invite code pill
            HStack(spacing: 6) {
                Image(systemName: "key.fill")
                    .font(Theme.Typography.caption2)
                Text(circle.inviteCode)
                    .font(.system(.caption, design: .monospaced).weight(.semibold))
            }
            .foregroundStyle(Theme.Colors.accent)
            .padding(.horizontal, Theme.Spacing.mds)
            .padding(.vertical, 6)
            .background {
                Capsule()
                    .fill(Theme.Colors.accent.opacity(0.15))
            }
            .onTapGesture {
                UIPasteboard.general.string = circle.inviteCode
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .glassCard(cornerRadius: Theme.CornerRadius.xl)
        .padding(.horizontal)
    }
    
    // MARK: - Prayers List
    
    private var prayersList: some View {
        Group {
            if viewModel.circlePrayers.isEmpty {
                VStack(spacing: 12) {
                    Spacer()
                    Image(systemName: "hands.sparkles")
                        .font(Theme.Typography.iconLarge)
                        .foregroundStyle(Theme.Colors.primary.opacity(0.4))
                    Text("No prayers yet")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    Text("Be the first to share a prayer request")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textTertiary)
                    Spacer()
                }
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.circlePrayers) { prayer in
                            CirclePrayerCard(
                                prayer: prayer,
                                member: viewModel.circleMembers.first { $0.userId == prayer.userId }
                            )
                        }
                    }
                    .padding()
                    .padding(.bottom, 80) // Room for FAB
                }
            }
        }
    }
    
    // MARK: - Members List
    
    private var membersList: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                ForEach(Array(viewModel.circleMembers.enumerated()), id: \.offset) { _, member in
                    MemberRow(member: member, isCreator: member.userId == circle.createdBy)
                }
            }
            .padding()
        }
    }
    
    // MARK: - Add Prayer Sheet
    
    private var addPrayerSheet: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    Text("Share a prayer with your circle")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    
                    TextEditor(text: $newPrayerText)
                        .font(Theme.Typography.body)
                        .scrollContentBackground(.hidden)
                        .padding()
                        .background(Theme.Colors.surface)
                        .cornerRadius(Theme.CornerRadius.lg)
                        .frame(minHeight: 150)
                    
                    Spacer()
                    
                    Button {
                        Task {
                            guard let userId = appState.currentUser?.id else { return }
                            await viewModel.addPrayerToCircle(
                                text: newPrayerText,
                                circleId: circle.id,
                                userId: userId
                            )
                            newPrayerText = ""
                            showAddPrayer = false
                        }
                    } label: {
                        Text("Share Prayer")
                            .font(Theme.Typography.button)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: Theme.Dimensions.buttonHeight)
                            .background(
                                newPrayerText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                    ? Theme.Colors.textTertiary
                                    : Theme.Colors.primary
                            )
                            .cornerRadius(Theme.CornerRadius.xl)
                    }
                    .disabled(newPrayerText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding()
            }
            .navigationTitle("New Prayer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showAddPrayer = false }
                .accessibilityLabel("Cancel adding prayer")
                }
            }
        }
        .presentationBackground(.ultraThinMaterial)
        .presentationCornerRadius(32)
    }
}

// MARK: - Circle Prayer Card

struct CirclePrayerCard: View {
    let prayer: PrayerRequest
    let member: CircleMember?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Author row
            HStack(spacing: 10) {
                MemberAvatar(member: member, size: 28)
                
                Text(member?.displayName ?? "Member")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.text)
                
                Spacer()
                
                Label(prayer.status.displayName, systemImage: prayer.status.icon)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(prayer.status == .answered ? Theme.Colors.success : Theme.Colors.primary)
            }
            
            Text(prayer.request)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(5)
            
            if let scripture = prayer.scriptureAnchor {
                HStack(spacing: 6) {
                    Image(systemName: "book.closed")
                        .font(Theme.Typography.caption2)
                    Text(scripture.reference)
                        .font(Theme.Typography.caption)
                }
                .foregroundStyle(Theme.Colors.primary)
            }
            
            Text(prayer.createdAt, style: .relative)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding()
        .glassCard(cornerRadius: Theme.CornerRadius.lg)
    }
}

// MARK: - Member Avatar

struct MemberAvatar: View {
    let member: CircleMember?
    var size: CGFloat = 36
    
    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Theme.Colors.primaryLight, Theme.Colors.primary],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)
            
            Text(initials)
                .font(.system(size: size * 0.38, weight: .bold))
                .foregroundStyle(.white)
        }
        .overlay {
            Circle()
                .stroke(.white.opacity(0.2), lineWidth: 1.5)
                .frame(width: size, height: size)
        }
    }
    
    private var initials: String {
        guard let name = member?.displayName, !name.isEmpty else { return "?" }
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

// MARK: - Member Row

struct MemberRow: View {
    let member: CircleMember
    let isCreator: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            MemberAvatar(member: member, size: 44)
            
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(member.displayName ?? "Member")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                    
                    if isCreator {
                        Text("Creator")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.accent)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background {
                                Capsule()
                                    .fill(Theme.Colors.accent.opacity(0.15))
                            }
                    }
                }
                
                Text("Joined \(member.joinedAt, style: .date)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            
            Spacer()
        }
        .padding()
        .glassCard(cornerRadius: Theme.CornerRadius.lg)
    }
}

#Preview {
    NavigationStack {
        CircleDetailView(
            circle: .preview,
            viewModel: CircleViewModel()
        )
    }
    .environment(AppState.preview)
}
