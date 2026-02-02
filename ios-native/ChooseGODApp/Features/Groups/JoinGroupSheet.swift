import SwiftUI

/// Sheet for joining a group by invite code
struct JoinGroupSheet: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var inviteCode = ""
    @State private var isJoining = false
    @State private var errorMessage: String?
    
    let onJoined: (BibleStudyGroup) -> Void
    private let service = SupabaseGroupService()
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    Spacer()
                    
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.accent.opacity(0.2))
                            .frame(width: 80, height: 80)
                        Image(systemName: "person.badge.plus")
                            .font(.system(size: 32))
                            .foregroundStyle(Theme.Colors.accent)
                    }
                    
                    Text("Join a Group")
                        .font(Theme.Typography.title2)
                        .foregroundStyle(Theme.Colors.text)
                    
                    Text("Enter the 6-character invite code shared by your group leader.")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                    
                    // Code Input
                    TextField("Invite Code", text: $inviteCode)
                        .font(.system(size: 28, weight: .bold, design: .monospaced))
                        .multilineTextAlignment(.center)
                        .textInputAutocapitalization(.characters)
                        .autocorrectionDisabled()
                        .padding()
                        .background {
                            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                                .fill(.ultraThinMaterial)
                        }
                        .padding(.horizontal, 60)
                        .onChange(of: inviteCode) { _, newValue in
                            inviteCode = String(newValue.prefix(6)).uppercased()
                        }
                    
                    if let error = errorMessage {
                        Text(error)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(.red)
                    }
                    
                    Button {
                        Task { await joinGroup() }
                    } label: {
                        Group {
                            if isJoining {
                                ProgressView().tint(.white)
                            } else {
                                Text("Join Group")
                            }
                        }
                        .font(Theme.Typography.subheadlineSemibold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Theme.Colors.primary)
                        .cornerRadius(Theme.CornerRadius.lg)
                    }
                    .disabled(inviteCode.count < 6 || isJoining)
                    .padding(.horizontal, 40)
                    
                    Spacer()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    private func joinGroup() async {
        guard let userId = appState.currentUser?.id else { return }
        isJoining = true
        errorMessage = nil
        
        do {
            let group = try await service.joinGroup(
                inviteCode: inviteCode,
                userId: userId,
                displayName: appState.currentUser?.displayName
            )
            HapticManager.shared.success()
            onJoined(group)
            dismiss()
        } catch {
            errorMessage = "Invalid code or you're already a member."
            HapticManager.shared.error()
        }
        isJoining = false
    }
}

#Preview {
    JoinGroupSheet { _ in }
        .environment(AppState.preview)
}
