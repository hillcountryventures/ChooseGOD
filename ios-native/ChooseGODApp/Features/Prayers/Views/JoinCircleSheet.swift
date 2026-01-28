import SwiftUI

/// Sheet for joining a prayer circle via invite code
struct JoinCircleSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @Bindable var viewModel: CircleViewModel
    
    @State private var inviteCode = ""
    @State private var joinedCircle: PrayerCircle?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if let circle = joinedCircle {
                    successView(circle)
                } else {
                    joinForm
                }
            }
            .navigationTitle(joinedCircle != nil ? "Joined!" : "Join Circle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(joinedCircle != nil ? "Done" : "Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .presentationBackground(.ultraThinMaterial)
        .presentationCornerRadius(32)
    }
    
    // MARK: - Join Form
    
    private var joinForm: some View {
        VStack(spacing: 24) {
            // Icon
            ZStack {
                Circle()
                    .fill(Theme.Colors.accent.opacity(0.15))
                    .frame(width: 80, height: 80)
                    .blur(radius: 8)
                
                Image(systemName: "person.badge.plus")
                    .font(.system(size: 32))
                    .foregroundStyle(Theme.Colors.accent)
            }
            .padding(.top, Theme.Spacing.lg)
            
            Text("Enter the invite code to join a circle")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
            
            // Code input
            TextField("INVITE CODE", text: $inviteCode)
                .font(.system(.title3, design: .monospaced).weight(.semibold))
                .foregroundStyle(Theme.Colors.text)
                .multilineTextAlignment(.center)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()
                .padding()
                .background(Theme.Colors.surface)
                .cornerRadius(Theme.CornerRadius.lg)
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(Theme.Colors.accent.opacity(0.3), lineWidth: 1)
                }
                .onChange(of: inviteCode) { _, newValue in
                    inviteCode = String(newValue.uppercased().prefix(8))
                }
            
            Spacer()
            
            // Join button
            Button {
                Task {
                    guard let userId = appState.currentUser?.id else { return }
                    if let circle = await viewModel.joinCircle(inviteCode: inviteCode, userId: userId) {
                        withAnimation(Theme.Animation.spring) {
                            joinedCircle = circle
                        }
                    }
                }
            } label: {
                Group {
                    if viewModel.isJoining {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Join Circle")
                            .font(Theme.Typography.button)
                    }
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Theme.Dimensions.buttonHeight)
                .background(
                    inviteCode.count < 4
                        ? Theme.Colors.textTertiary
                        : Theme.Colors.accent
                )
                .cornerRadius(Theme.CornerRadius.xl)
            }
            .disabled(inviteCode.count < 4 || viewModel.isJoining)
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.error)
            }
        }
        .padding()
    }
    
    // MARK: - Success View
    
    private func successView(_ circle: PrayerCircle) -> some View {
        VStack(spacing: 24) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(Theme.Colors.success.opacity(0.15))
                    .frame(width: 100, height: 100)
                    .blur(radius: 10)
                
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(Theme.Colors.success)
            }
            
            Text("You joined")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            Text(circle.name)
                .font(Theme.Typography.title2)
                .foregroundStyle(Theme.Colors.text)
            
            Text("\(circle.memberCount ?? 0) members praying together")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textTertiary)
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    JoinCircleSheet(viewModel: CircleViewModel())
        .environment(AppState.preview)
}
