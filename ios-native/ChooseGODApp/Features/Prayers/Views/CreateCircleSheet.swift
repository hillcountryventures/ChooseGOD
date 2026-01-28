import SwiftUI

/// Sheet for creating a new prayer circle
struct CreateCircleSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @Bindable var viewModel: CircleViewModel
    
    @State private var circleName = ""
    @State private var createdCircle: PrayerCircle?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if let circle = createdCircle {
                    successView(circle)
                } else {
                    createForm
                }
            }
            .navigationTitle(createdCircle != nil ? "Circle Created!" : "New Circle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(createdCircle != nil ? "Done" : "Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .presentationBackground(.ultraThinMaterial)
        .presentationCornerRadius(32)
    }
    
    // MARK: - Create Form
    
    private var createForm: some View {
        VStack(spacing: 24) {
            // Icon
            ZStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.15))
                    .frame(width: 80, height: 80)
                    .blur(radius: 8)
                
                Image(systemName: "person.3.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(Theme.Colors.primary)
            }
            .padding(.top, Theme.Spacing.lg)
            
            Text("Give your prayer circle a name")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            // Name input
            TextField("e.g. Family Prayers", text: $circleName)
                .font(Theme.Typography.bodyLarge)
                .foregroundStyle(Theme.Colors.text)
                .padding()
                .background(Theme.Colors.surface)
                .cornerRadius(Theme.CornerRadius.lg)
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(Theme.Colors.primary.opacity(0.3), lineWidth: 1)
                }
            
            Spacer()
            
            // Create button
            Button {
                Task {
                    guard let userId = appState.currentUser?.id else { return }
                    if let circle = await viewModel.createCircle(name: circleName.trimmingCharacters(in: .whitespaces), userId: userId) {
                        withAnimation(Theme.Animation.spring) {
                            createdCircle = circle
                        }
                    }
                }
            } label: {
                Group {
                    if viewModel.isCreating {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Create Circle")
                            .font(Theme.Typography.button)
                    }
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Theme.Dimensions.buttonHeight)
                .background(
                    circleName.trimmingCharacters(in: .whitespaces).count < 2
                        ? Theme.Colors.textTertiary
                        : Theme.Colors.primary
                )
                .cornerRadius(Theme.CornerRadius.xl)
            }
            .disabled(circleName.trimmingCharacters(in: .whitespaces).count < 2 || viewModel.isCreating)
            
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
            
            // Success animation
            ZStack {
                Circle()
                    .fill(Theme.Colors.success.opacity(0.15))
                    .frame(width: 100, height: 100)
                    .blur(radius: 10)
                
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(Theme.Colors.success)
            }
            
            Text(circle.name)
                .font(Theme.Typography.title2)
                .foregroundStyle(Theme.Colors.text)
            
            Text("Share this invite code with others:")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            // Invite code display
            Button {
                UIPasteboard.general.string = circle.inviteCode
            } label: {
                HStack(spacing: 10) {
                    Text(circle.inviteCode)
                        .font(.system(.title2, design: .monospaced).weight(.bold))
                        .foregroundStyle(Theme.Colors.accent)
                    
                    Image(systemName: "doc.on.doc")
                        .font(.body)
                        .foregroundStyle(Theme.Colors.accent.opacity(0.7))
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .glassCard(cornerRadius: Theme.CornerRadius.lg)
            }
            
            Text("Tap to copy")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    CreateCircleSheet(viewModel: CircleViewModel())
        .environment(AppState.preview)
}
