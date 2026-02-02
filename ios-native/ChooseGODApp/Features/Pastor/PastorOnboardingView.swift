import SwiftUI

struct PastorOnboardingView: View {
    let userId: String
    var onComplete: (() -> Void)?
    
    @Environment(\.dismiss) private var dismiss
    @State private var churchName = ""
    @State private var denomination = ""
    @State private var isCreating = false
    @State private var errorMessage: String?
    @State private var createdGroup: BibleStudyGroup?
    
    private let groupService: GroupServiceProtocol = SupabaseGroupService()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if let group = createdGroup {
                    successView(group: group)
                } else {
                    formView
                }
            }
            .navigationTitle("Set Up Your Church")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
    
    // MARK: - Form
    
    private var formView: some View {
        Form {
            Section {
                TextField("Church Name", text: $churchName)
                    .textContentType(.organizationName)
                TextField("Denomination (optional)", text: $denomination)
            } header: {
                Text("Church Information")
            } footer: {
                Text("This creates a group for your congregation. Members can join using a code.")
            }
            
            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(Theme.Typography.subheadline)
                }
            }
            
            Section {
                Button {
                    Task { await createChurch() }
                } label: {
                    HStack {
                        Spacer()
                        if isCreating {
                            ProgressView()
                        } else {
                            Label("Create Church Group", systemImage: "building.columns.fill")
                        }
                        Spacer()
                    }
                }
                .disabled(churchName.trimmingCharacters(in: .whitespaces).isEmpty || isCreating)
            }
        }
    }
    
    // MARK: - Success
    
    private func successView(group: BibleStudyGroup) -> some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(.green)
            
            Text("Church Created!")
                .font(.title.bold())
            
            Text(group.name)
                .font(Theme.Typography.title3)
                .foregroundStyle(.secondary)
            
            VStack(spacing: 8) {
                Text("Your Join Code")
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(.secondary)
                Text(group.inviteCode)
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                    .kerning(4)
            }
            .padding()
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            
            Text("Share this code with your congregation so they can join.")
                .font(Theme.Typography.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Spacer()
            
            Button {
                onComplete?()
                dismiss()
            } label: {
                Text("Go to Dashboard")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .padding(.horizontal)
            .padding(.bottom)
        }
    }
    
    // MARK: - Actions
    
    private func createChurch() async {
        isCreating = true
        defer { isCreating = false }
        errorMessage = nil
        
        let trimmedName = churchName.trimmingCharacters(in: .whitespaces)
        let trimmedDenom = denomination.trimmingCharacters(in: .whitespaces)
        
        do {
            let group = try await groupService.createGroup(
                name: trimmedName,
                description: "Church group for \(trimmedName)",
                churchAffiliation: trimmedDenom.isEmpty ? nil : trimmedDenom,
                createdBy: userId
            )
            
            // Upgrade creator to pastor role
            let members = try await groupService.getMembers(groupId: group.id)
            if let me = members.first(where: { $0.userId == userId }) {
                try await groupService.updateMemberRole(memberId: me.id, role: .pastor, isPastor: true)
            }
            
            createdGroup = group
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    PastorOnboardingView(userId: "preview-user")
}
