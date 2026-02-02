import SwiftUI

/// Shared prayer requests within a group
struct GroupPrayerWallView: View {
    @Environment(AppState.self) private var appState
    let groupId: String
    
    @State private var requests: [GroupPrayerRequest] = []
    @State private var isLoading = true
    @State private var showAddPrayer = false
    @State private var newPrayerText = ""
    @State private var isSubmitting = false
    
    private let service = SupabaseGroupService()
    
    var body: some View {
        VStack(spacing: 0) {
            if isLoading {
                ProgressView()
                    .tint(Theme.Colors.primary)
                    .frame(maxWidth: .infinity, minHeight: 100)
            } else if requests.isEmpty {
                emptyState
            } else {
                prayerList
            }
            
            // Add Prayer Button
            Button {
                showAddPrayer = true
            } label: {
                Label("Share a Prayer Request", systemImage: "plus.circle.fill")
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(Theme.Colors.primary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background {
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                            .fill(.ultraThinMaterial)
                    }
            }
            .padding()
        }
        .sheet(isPresented: $showAddPrayer) {
            addPrayerSheet
        }
        .task {
            await loadPrayers()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "hands.sparkles")
                .font(.system(size: 36))
                .foregroundStyle(Theme.Colors.primary.opacity(0.6))
            
            Text("Prayer Wall")
                .font(Theme.Typography.subheadlineSemibold)
                .foregroundStyle(Theme.Colors.text)
            
            Text("Share prayer requests and lift each other up in prayer.")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, minHeight: 150)
    }
    
    // MARK: - Prayer List
    
    private var prayerList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(requests) { request in
                    prayerCard(request)
                }
            }
            .padding()
        }
    }
    
    private func prayerCard(_ request: GroupPrayerRequest) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.2))
                    .frame(width: 32, height: 32)
                    .overlay {
                        Text(String(request.displayName?.prefix(1) ?? "?").uppercased())
                            .font(Theme.Typography.captionSemibold)
                            .foregroundStyle(Theme.Colors.primary)
                    }
                
                Text(request.displayName ?? "Member")
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(Theme.Colors.text)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: request.status.icon)
                    Text(request.status.displayName)
                }
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            Text(request.request)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.text)
            
            HStack {
                Text(request.createdAt, style: .relative)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                
                Spacer()
                
                Button {
                    Task { await prayFor(request) }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "hands.sparkles")
                        Text("Praying (\(request.prayedByCount))")
                    }
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(Theme.Colors.primary)
                    .padding(.horizontal, Theme.Spacing.smd)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(Theme.Colors.primary.opacity(0.15)))
                }
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
    }
    
    // MARK: - Add Prayer Sheet
    
    private var addPrayerSheet: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Share a Prayer Request")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(Theme.Colors.text)
                
                TextEditor(text: $newPrayerText)
                    .frame(minHeight: 120)
                    .padding(Theme.Spacing.smd)
                    .background {
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                            .fill(.ultraThinMaterial)
                    }
                    .padding(.horizontal)
                
                Button {
                    Task { await submitPrayer() }
                } label: {
                    Group {
                        if isSubmitting {
                            ProgressView().tint(.white)
                        } else {
                            Text("Share Request")
                        }
                    }
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Theme.Colors.primary)
                    .cornerRadius(Theme.CornerRadius.lg)
                }
                .disabled(newPrayerText.trimmingCharacters(in: .whitespaces).isEmpty || isSubmitting)
                .padding(.horizontal)
                
                Spacer()
            }
            .padding(.top, Theme.Spacing.mdl)
            .background(Theme.Colors.background.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { showAddPrayer = false }
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    // MARK: - Actions
    
    private func loadPrayers() async {
        do {
            requests = try await service.getPrayerWall(groupId: groupId)
        } catch { }
        isLoading = false
    }
    
    private func prayFor(_ request: GroupPrayerRequest) async {
        do {
            try await service.prayForRequest(requestId: request.id)
            if let idx = requests.firstIndex(where: { $0.id == request.id }) {
                var updated = requests[idx]
                updated = GroupPrayerRequest(
                    id: updated.id, groupId: updated.groupId, userId: updated.userId,
                    displayName: updated.displayName, request: updated.request,
                    status: updated.status, prayedByCount: updated.prayedByCount + 1,
                    createdAt: updated.createdAt
                )
                requests[idx] = updated
            }
            HapticManager.shared.success()
        } catch { }
    }
    
    private func submitPrayer() async {
        guard let userId = appState.currentUser?.id else { return }
        isSubmitting = true
        do {
            let request = try await service.postPrayerRequest(
                groupId: groupId,
                userId: userId,
                displayName: appState.currentUser?.displayName,
                request: newPrayerText.trimmingCharacters(in: .whitespaces)
            )
            requests.insert(request, at: 0)
            newPrayerText = ""
            showAddPrayer = false
            HapticManager.shared.success()
        } catch { }
        isSubmitting = false
    }
}

#Preview {
    GroupPrayerWallView(groupId: "group-1")
        .environment(AppState.preview)
}
