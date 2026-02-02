import SwiftUI

struct ChurchCodeView: View {
    let group: BibleStudyGroup
    
    @State private var copied = false
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            Image(systemName: "building.columns.fill")
                .font(.system(size: 56)) // Keep custom size for church icon
                .foregroundStyle(.blue)
            
            Text(group.name)
                .font(Theme.Typography.title2)
            
            if let affiliation = group.churchAffiliation, !affiliation.isEmpty {
                Text(affiliation)
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            VStack(spacing: 12) {
                Text("Join Code")
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(.secondary)
                
                Text(group.inviteCode)
                    .font(.system(size: 48, weight: .bold, design: .monospaced)) // Keep custom monospaced font for code
                    .kerning(6)
                    .foregroundStyle(.primary)
            }
            .padding(Theme.Spacing.lg)
            .frame(maxWidth: .infinity)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .padding(.horizontal)
            
            HStack(spacing: 16) {
                Button {
                    UIPasteboard.general.string = group.inviteCode
                    copied = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                } label: {
                    Label(copied ? "Copied!" : "Copy Code", systemImage: copied ? "checkmark" : "doc.on.doc")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
                
                ShareLink(
                    item: "Join our Bible study group \"\(group.name)\" on ChooseGOD! Use code: \(group.inviteCode)",
                    subject: Text("Join \(group.name) on ChooseGOD"),
                    message: Text("Use this code to join our church group: \(group.inviteCode)")
                ) {
                    Label("Share", systemImage: "square.and.arrow.up")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding(.horizontal)
            
            Spacer()
            
            Text("Members enter this code in the app to join your group.")
                .font(Theme.Typography.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
                .padding(.bottom)
        }
        .navigationTitle("Church Code")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        ChurchCodeView(group: .preview)
    }
}
