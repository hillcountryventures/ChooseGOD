import SwiftUI

struct JournalDetailView: View {
    let moment: SpiritualMoment
    @Bindable var viewModel: JournalViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var isEditing = false
    @State private var editedContent: String
    @State private var showDeleteAlert = false
    @State private var isSaving = false
    
    init(moment: SpiritualMoment, viewModel: JournalViewModel) {
        self.moment = moment
        self.viewModel = viewModel
        _editedContent = State(initialValue: moment.content)
    }
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Date
                    Text(moment.formattedDate)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    
                    // Content
                    if isEditing {
                        TextEditor(text: $editedContent)
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.text)
                            .scrollContentBackground(.hidden)
                            .frame(minHeight: 200)
                            .padding()
                            .background(Theme.Colors.surface, in: RoundedRectangle(cornerRadius: 16))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Theme.Colors.surfaceElevated, lineWidth: 1)
                            )
                    } else {
                        Text(moment.content)
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.text)
                            .lineSpacing(6)
                    }
                    
                    // Media
                    if let media = moment.media, !media.isEmpty {
                        mediaSection(media)
                    }
                    
                    // Linked verses
                    if !moment.linkedVerses.isEmpty {
                        versesSection
                    }
                    
                    // Themes
                    if !moment.themes.isEmpty {
                        themesSection
                    }
                    
                    // AI Insights
                    if let insights = moment.aiInsights {
                        insightsSection(insights)
                    }
                    
                    // Actions
                    if !isEditing {
                        actionsSection
                    } else {
                        cancelEditButton
                    }
                }
                .padding()
            }
        }
        .navigationTitle(isEditing ? "Edit Entry" : "Journal Entry")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if isEditing {
                    Button {
                        Task { await saveEdit() }
                    } label: {
                        Text(isSaving ? "Saving..." : "Save")
                            .fontWeight(.semibold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 6)
                            .background(Theme.Colors.primary, in: Capsule())
                    }
                    .disabled(isSaving || editedContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                } else {
                    Button {
                        isEditing = true
                    } label: {
                        Image(systemName: "pencil")
                            .foregroundStyle(Theme.Colors.primary)
                    }
                }
            }
        }
        .alert("Delete Entry", isPresented: $showDeleteAlert) {
            Button("Delete", role: .destructive) {
                Task {
                    await viewModel.deleteEntry(moment.id)
                    dismiss()
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure? This cannot be undone.")
        }
    }
    
    // MARK: - Media
    
    private func mediaSection(_ media: [JournalMedia]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            let photos = media.filter { $0.type == .photo }
            let voices = media.filter { $0.type == .voice }
            
            if !photos.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(photos) { _ in
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Theme.Colors.surfaceElevated)
                                .frame(width: 160, height: 160)
                                .overlay {
                                    Image(systemName: "photo")
                                        .font(.largeTitle)
                                        .foregroundStyle(Theme.Colors.textTertiary)
                                }
                        }
                    }
                }
            }
            
            ForEach(voices) { voice in
                HStack(spacing: 12) {
                    Image(systemName: "waveform")
                        .font(.title3)
                        .foregroundStyle(Theme.Colors.primary)
                    
                    VStack(alignment: .leading) {
                        Text("Voice Note")
                            .font(Theme.Typography.caption.weight(.medium))
                            .foregroundStyle(Theme.Colors.text)
                        if let dur = voice.duration {
                            Text("\(Int(dur))s")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textTertiary)
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "play.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Theme.Colors.primary)
                }
                .padding()
                .background(Theme.Colors.surface, in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.Colors.surfaceElevated, lineWidth: 1))
            }
        }
    }
    
    // MARK: - Verses
    
    private var versesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Scripture References")
                .font(Theme.Typography.caption.weight(.semibold))
                .foregroundStyle(Theme.Colors.text)
            
            ForEach(moment.linkedVerses) { verse in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "book")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.primary)
                        Text(verse.reference)
                            .font(Theme.Typography.body.weight(.semibold))
                            .foregroundStyle(Theme.Colors.primary)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                    
                    if let text = verse.text {
                        Text("\"\(text)\"")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                            .italic()
                            .lineSpacing(4)
                    }
                }
                .padding()
                .background(Theme.Colors.surface, in: RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.Colors.surfaceElevated, lineWidth: 1))
            }
        }
    }
    
    // MARK: - Themes
    
    private var themesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Themes")
                .font(Theme.Typography.caption.weight(.semibold))
                .foregroundStyle(Theme.Colors.text)
            
            FlowLayout(spacing: 8) {
                ForEach(moment.themes, id: \.self) { theme in
                    Text(theme.capitalized)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Theme.Colors.primary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Theme.Colors.primaryAlpha(0.2), in: Capsule())
                }
            }
        }
    }
    
    // MARK: - AI Insights
    
    private func insightsSection(_ insights: JournalAIInsights) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                Image(systemName: "sparkles")
                    .foregroundStyle(Theme.Colors.accent)
                Text("Insights")
                    .font(Theme.Typography.caption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.text)
            }
            
            if let summary = insights.summary {
                Text(summary)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.text)
                    .lineSpacing(4)
            }
            
            if let questions = insights.reflectionQuestions, !questions.isEmpty {
                Divider().background(Theme.Colors.surfaceElevated)
                
                Text("Reflection Questions")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                ForEach(questions, id: \.self) { q in
                    Text("• \(q)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .lineSpacing(3)
                }
            }
        }
        .padding()
        .background(Theme.Colors.surface, in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.Colors.surfaceElevated, lineWidth: 1))
    }
    
    // MARK: - Actions
    
    private var actionsSection: some View {
        HStack(spacing: 16) {
            Spacer()
            
            Button {
                shareEntry()
            } label: {
                Label("Share", systemImage: "square.and.arrow.up")
                    .font(Theme.Typography.caption.weight(.medium))
                    .foregroundStyle(Theme.Colors.primary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Theme.Colors.surface, in: Capsule())
                    .overlay(Capsule().stroke(Theme.Colors.surfaceElevated, lineWidth: 1))
            }
            
            Button {
                showDeleteAlert = true
            } label: {
                Label("Delete", systemImage: "trash")
                    .font(Theme.Typography.caption.weight(.medium))
                    .foregroundStyle(Theme.Colors.error)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Theme.Colors.surface, in: Capsule())
                    .overlay(Capsule().stroke(Theme.Colors.error.opacity(0.3), lineWidth: 1))
            }
            
            Spacer()
        }
        .padding(.top, 12)
    }
    
    private var cancelEditButton: some View {
        Button {
            editedContent = moment.content
            isEditing = false
        } label: {
            Text("Cancel")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
        }
    }
    
    // MARK: - Helpers
    
    private func saveEdit() async {
        isSaving = true
        await viewModel.updateEntry(moment, newContent: editedContent.trimmingCharacters(in: .whitespacesAndNewlines))
        isSaving = false
        isEditing = false
    }
    
    private func shareEntry() {
        var text = moment.content
        if !moment.linkedVerses.isEmpty {
            let refs = moment.linkedVerses.map(\.reference).joined(separator: ", ")
            text += "\n\nScripture: \(refs)"
        }
        text += "\n\n— From my journal in ChooseGOD"
        
        let activity = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = windowScene.windows.first?.rootViewController {
            root.present(activity, animated: true)
        }
    }
}

#Preview {
    NavigationStack {
        JournalDetailView(
            moment: SpiritualMoment.samples[0],
            viewModel: JournalViewModel()
        )
    }
    .preferredColorScheme(.dark)
}
