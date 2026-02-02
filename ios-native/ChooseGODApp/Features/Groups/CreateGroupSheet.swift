import SwiftUI

/// Sheet for creating a new Bible study group
struct CreateGroupSheet: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var description = ""
    @State private var churchAffiliation = ""
    @State private var isCreating = false
    @State private var errorMessage: String?
    
    let onCreated: (BibleStudyGroup) -> Void
    private let service = SupabaseGroupService()
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Icon
                        ZStack {
                            Circle()
                                .fill(Theme.Colors.primary.opacity(0.2))
                                .frame(width: 80, height: 80)
                            Image(systemName: "person.3.fill")
                                .font(.system(size: 32))
                                .foregroundStyle(Theme.Colors.primary)
                        }
                        .padding(.top, Theme.Spacing.mdl)
                        
                        Text("Create a Bible Study Group")
                            .font(Theme.Typography.title2)
                            .foregroundStyle(Theme.Colors.text)
                        
                        // Form Fields
                        VStack(spacing: 16) {
                            fieldSection(title: "Group Name *", placeholder: "e.g. Sunday Morning Study") {
                                TextField("Group Name", text: $name)
                                    .textContentType(.organizationName)
                            }
                            
                            fieldSection(title: "Description", placeholder: "") {
                                TextField("What's this group about?", text: $description, axis: .vertical)
                                    .lineLimit(3...6)
                            }
                            
                            fieldSection(title: "Church Affiliation", placeholder: "") {
                                TextField("Optional church name", text: $churchAffiliation)
                            }
                        }
                        .padding(.horizontal)
                        
                        if let error = errorMessage {
                            Text(error)
                                .font(Theme.Typography.caption)
                                .foregroundStyle(.red)
                        }
                        
                        // Create Button
                        Button {
                            Task { await createGroup() }
                        } label: {
                            Group {
                                if isCreating {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text("Create Group")
                                }
                            }
                            .font(Theme.Typography.subheadlineSemibold)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Theme.Colors.primary)
                            .cornerRadius(Theme.CornerRadius.lg)
                        }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isCreating)
                        .padding(.horizontal)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
    
    private func fieldSection<Content: View>(title: String, placeholder: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(Theme.Typography.captionSemibold)
                .foregroundStyle(Theme.Colors.secondaryText)
            
            content()
                .padding(Theme.Spacing.md)
                .background {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .fill(.ultraThinMaterial)
                }
        }
    }
    
    private func createGroup() async {
        guard let userId = appState.currentUser?.id else { return }
        isCreating = true
        errorMessage = nil
        
        do {
            let group = try await service.createGroup(
                name: name.trimmingCharacters(in: .whitespaces),
                description: description.isEmpty ? nil : description,
                churchAffiliation: churchAffiliation.isEmpty ? nil : churchAffiliation,
                createdBy: userId
            )
            HapticManager.shared.success()
            onCreated(group)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
            HapticManager.shared.error()
        }
        isCreating = false
    }
}

#Preview {
    CreateGroupSheet { _ in }
        .environment(AppState.preview)
}
