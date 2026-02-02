import SwiftUI

/// Threaded discussion feed for a group's reading passage
struct GroupDiscussionView: View {
    @Environment(AppState.self) private var appState
    let groupId: String
    
    @State private var discussions: [GroupDiscussion] = []
    @State private var newMessage = ""
    @State private var isLoading = true
    @State private var isSending = false
    @State private var replyingTo: GroupDiscussion?
    
    private let service = SupabaseGroupService()
    
    var body: some View {
        VStack(spacing: 0) {
            if isLoading {
                ProgressView()
                    .tint(Theme.Colors.primary)
                    .frame(maxWidth: .infinity, minHeight: 100)
            } else if discussions.isEmpty {
                emptyDiscussion
            } else {
                discussionList
            }
            
            Divider().overlay(Theme.Colors.textTertiary.opacity(0.3))
            
            composeBar
        }
        .task {
            await loadDiscussions()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyDiscussion: some View {
        VStack(spacing: 12) {
            Image(systemName: "text.bubble")
                .font(.system(size: 36))
                .foregroundStyle(Theme.Colors.textTertiary)
            
            Text("No discussions yet")
                .font(Theme.Typography.subheadlineSemibold)
                .foregroundStyle(Theme.Colors.secondaryText)
            
            Text("Start a conversation about today's reading!")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .frame(maxWidth: .infinity, minHeight: 150)
    }
    
    // MARK: - Discussion List
    
    private var discussionList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(discussions) { discussion in
                    discussionBubble(discussion)
                }
            }
            .padding()
        }
    }
    
    private func discussionBubble(_ discussion: GroupDiscussion) -> some View {
        let isCurrentUser = discussion.userId == appState.currentUser?.id
        
        return VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
            if !isCurrentUser {
                Text(discussion.displayName ?? "Member")
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(Theme.Colors.primary)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                if let passage = discussion.passageReference {
                    HStack(spacing: 4) {
                        Image(systemName: "book")
                            .font(.caption2)
                        Text(passage)
                            .font(Theme.Typography.captionSemibold)
                    }
                    .foregroundStyle(Theme.Colors.accent)
                }
                
                Text(discussion.message)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(isCurrentUser ? .white : Theme.Colors.text)
            }
            .padding(Theme.Spacing.md)
            .background {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                    .fill(isCurrentUser ? Theme.Colors.primary : Color(.ultraThinMaterial).opacity(0.8))
            }
            
            HStack(spacing: 8) {
                Text(discussion.createdAt, style: .relative)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                
                if let replyCount = discussion.replyCount, replyCount > 0 {
                    Button {
                        replyingTo = discussion
                    } label: {
                        Text("\(replyCount) replies")
                            .font(Theme.Typography.captionSemibold)
                            .foregroundStyle(Theme.Colors.primary)
                    }
                }
                
                Button {
                    replyingTo = discussion
                } label: {
                    Text("Reply")
                        .font(Theme.Typography.captionSemibold)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: isCurrentUser ? .trailing : .leading)
    }
    
    // MARK: - Compose Bar
    
    private var composeBar: some View {
        VStack(spacing: 6) {
            if let replying = replyingTo {
                HStack {
                    Text("Replying to \(replying.displayName ?? "someone")")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                    Spacer()
                    Button {
                        replyingTo = nil
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
                .padding(.horizontal)
            }
            
            HStack(spacing: 10) {
                TextField("Share your thoughts...", text: $newMessage, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(Theme.Spacing.smd)
                    .background {
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                            .fill(.ultraThinMaterial)
                    }
                
                Button {
                    Task { await sendMessage() }
                } label: {
                    Group {
                        if isSending {
                            ProgressView().tint(Theme.Colors.primary)
                        } else {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 32))
                                .foregroundStyle(Theme.Colors.primary)
                        }
                    }
                }
                .disabled(newMessage.trimmingCharacters(in: .whitespaces).isEmpty || isSending)
            }
            .padding(.horizontal)
            .padding(.vertical, Theme.Spacing.sm)
        }
    }
    
    // MARK: - Actions
    
    private func loadDiscussions() async {
        do {
            discussions = try await service.getDiscussions(groupId: groupId, parentId: nil)
        } catch { }
        isLoading = false
    }
    
    private func sendMessage() async {
        guard let userId = appState.currentUser?.id else { return }
        let text = newMessage.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        
        isSending = true
        do {
            let discussion = try await service.postDiscussion(
                groupId: groupId,
                userId: userId,
                displayName: appState.currentUser?.displayName,
                message: text,
                passageReference: nil,
                parentId: replyingTo?.id
            )
            discussions.insert(discussion, at: 0)
            newMessage = ""
            replyingTo = nil
            HapticManager.shared.success()
        } catch { }
        isSending = false
    }
}

#Preview {
    GroupDiscussionView(groupId: "group-1")
        .environment(AppState.preview)
}
