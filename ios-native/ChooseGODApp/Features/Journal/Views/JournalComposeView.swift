import SwiftUI
import PhotosUI

struct JournalComposeView: View {
    @Bindable var viewModel: JournalViewModel
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFocused: Bool
    
    @State private var showPrompts = true
    @State private var showPhotoPicker = false
    @State private var showDiscardAlert = false
    @State private var selectedPhotos: [PhotosPickerItem] = []
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Prompts carousel
                    if showPrompts && !isTextFocused {
                        promptsSection
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }
                    
                    // Main text area
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            TextEditor(text: $viewModel.composeContent)
                                .font(Theme.Typography.body)
                                .foregroundStyle(Theme.Colors.text)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 200)
                                .focused($isTextFocused)
                                .onChange(of: viewModel.composeContent) {
                                    viewModel.scheduleAutoSave()
                                }
                            
                            // Placeholder
                            if viewModel.composeContent.isEmpty {
                                Text("What's on your heart today?")
                                    .font(Theme.Typography.body)
                                    .foregroundStyle(Theme.Colors.textTertiary)
                                    .allowsHitTesting(false)
                                    .padding(.top, 8)
                                    .padding(.leading, 5)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .offset(y: -216)
                            }
                            
                            // Linked verses chips
                            if !viewModel.composeLinkedVerses.isEmpty {
                                versesChips
                            }
                            
                            // Media previews
                            if !viewModel.composeMedia.isEmpty {
                                mediaPreviews
                            }
                        }
                        .padding()
                    }
                    
                    // Bottom media bar
                    mediaBar
                }
            }
            .navigationTitle("Journal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        if viewModel.canPost || !viewModel.composeLinkedVerses.isEmpty {
                            showDiscardAlert = true
                        } else {
                            dismiss()
                        }
                    }
                    .foregroundStyle(Theme.Colors.text)
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        Task {
                            await viewModel.postEntry()
                            dismiss()
                        }
                    } label: {
                        Text(viewModel.isSaving ? "Saving..." : "Post")
                            .fontWeight(.semibold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 6)
                            .background(Theme.Colors.primary.opacity(viewModel.canPost ? 1 : 0.5), in: Capsule())
                    }
                    .disabled(!viewModel.canPost || viewModel.isSaving)
                }
            }
            .alert("Save as Draft?", isPresented: $showDiscardAlert) {
                Button("Discard", role: .destructive) {
                    viewModel.resetCompose()
                    dismiss()
                }
                Button("Save Draft") {
                    viewModel.saveDraft()
                    dismiss()
                }
                Button("Keep Writing", role: .cancel) {}
            }
            .photosPicker(isPresented: $showPhotoPicker, selection: $selectedPhotos, maxSelectionCount: 4, matching: .images)
            .onChange(of: selectedPhotos) { _, items in
                Task {
                    for item in items {
                        if let data = try? await item.loadTransferable(type: Data.self),
                           let _ = UIImage(data: data) {
                            let media = JournalMedia(
                                id: "photo-\(Int(Date().timeIntervalSince1970))-\(Int.random(in: 0...999))",
                                type: .photo,
                                uri: "local://\(UUID().uuidString)",
                                createdAt: Date()
                            )
                            viewModel.addMedia(media)
                        }
                    }
                    selectedPhotos = []
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("journal_compose") }
    }
    
    // MARK: - Prompts
    
    private var promptsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Tap a prompt to begin:")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                Spacer()
                Button {
                    withAnimation { showPrompts = false }
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
            .padding(.horizontal)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(viewModel.prompts) { prompt in
                        Button {
                            viewModel.applyPrompt(prompt)
                            withAnimation { showPrompts = false }
                            isTextFocused = true
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: prompt.icon)
                                    .font(.body)
                                    .foregroundStyle(Theme.Colors.primary)
                                    .frame(width: 32, height: 32)
                                    .background(Theme.Colors.primaryAlpha(0.15), in: Circle())
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    let parts = prompt.text.split(separator: ":", maxSplits: 1)
                                    Text(parts.first.map(String.init) ?? "")
                                        .font(.caption.weight(.bold))
                                        .foregroundStyle(Theme.Colors.primary)
                                    if parts.count > 1 {
                                        Text(parts[1].trimmingCharacters(in: .whitespaces))
                                            .font(.caption2)
                                            .foregroundStyle(Theme.Colors.textSecondary)
                                            .lineLimit(2)
                                    }
                                }
                            }
                            .padding(10)
                            .frame(minWidth: 180, alignment: .leading)
                            .background(Theme.Colors.surface, in: RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Theme.Colors.surfaceElevated, lineWidth: 1)
                            )
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding(.vertical, 10)
        .background(Theme.Colors.surface.opacity(0.5))
    }
    
    // MARK: - Verse Chips
    
    private var versesChips: some View {
        FlowLayout(spacing: 8) {
            ForEach(Array(viewModel.composeLinkedVerses.enumerated()), id: \.element.id) { idx, verse in
                HStack(spacing: 4) {
                    Image(systemName: "book")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.primary)
                    Text(verse.reference)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Theme.Colors.primary)
                    Button {
                        viewModel.removeVerse(at: idx)
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Theme.Colors.primaryAlpha(0.2), in: Capsule())
            }
        }
    }
    
    // MARK: - Media Previews
    
    private var mediaPreviews: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(viewModel.composeMedia) { media in
                    ZStack(alignment: .topTrailing) {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Theme.Colors.surfaceElevated)
                            .frame(width: 80, height: 80)
                            .overlay {
                                Image(systemName: media.type == .photo ? "photo" : "waveform")
                                    .font(.title2)
                                    .foregroundStyle(Theme.Colors.textTertiary)
                            }
                        
                        Button {
                            viewModel.removeMedia(media.id)
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.white)
                                .background(Circle().fill(.black.opacity(0.6)))
                        }
                        .offset(x: 4, y: -4)
                    }
                }
            }
        }
    }
    
    // MARK: - Media Bar
    
    private var mediaBar: some View {
        VStack(spacing: 0) {
            Divider().background(Theme.Colors.surfaceElevated)
            
            HStack(spacing: 0) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        mediaBarButton(icon: "camera", label: "Photo", color: Theme.Colors.primary) {
                            showPhotoPicker = true
                        }
                        mediaBarButton(icon: "mic", label: "Voice", color: Theme.Colors.primary) {
                            // Voice recording (placeholder)
                            let media = JournalMedia(id: "voice-\(Int(Date().timeIntervalSince1970))", type: .voice, uri: "local://voice", duration: 0, createdAt: Date())
                            viewModel.addMedia(media)
                        }
                        mediaBarButton(icon: "book", label: "Scripture", color: Theme.Colors.primary) {
                            // Verse picker (placeholder — would navigate to verse picker)
                            let verse = VerseSource(book: "Psalms", chapter: 23, verse: 1, text: "The Lord is my shepherd; I shall not want.", translation: "ESV")
                            viewModel.addVerse(verse)
                        }
                        mediaBarButton(icon: "hands.sparkles.fill", label: "Prayer", color: Theme.Colors.accent) {
                            let starter = viewModel.composeContent.isEmpty ? "Dear Lord,\n" : "\n\nDear Lord,\n"
                            viewModel.composeContent += starter
                            isTextFocused = true
                        }
                        mediaBarButton(icon: "heart", label: "Gratitude", color: Theme.Colors.error) {
                            let starter = viewModel.composeContent.isEmpty ? "I am grateful for:\n• " : "\n\nI am grateful for:\n• "
                            viewModel.composeContent += starter
                            isTextFocused = true
                        }
                        mediaBarButton(icon: "sparkles", label: "Ask AI", color: .white, bgColor: Theme.Colors.primary) {
                            // AI integration placeholder
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Word count
                Text("\(viewModel.wordCount) words")
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .padding(.trailing)
            }
            .padding(.vertical, 8)
            .background(Theme.Colors.background)
        }
    }
    
    private func mediaBarButton(icon: String, label: String, color: Color, bgColor: Color? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.body)
                    .foregroundStyle(bgColor != nil ? .white : color)
                    .frame(width: 40, height: 40)
                    .background(
                        Circle()
                            .fill(bgColor ?? Theme.Colors.surface)
                            .overlay(Circle().stroke(bgColor != nil ? .clear : Theme.Colors.surfaceElevated, lineWidth: 1))
                    )
                Text(label)
                    .font(.caption2)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
    }
}

// MARK: - Flow Layout (for verse chips)


#Preview {
    JournalComposeView(viewModel: JournalViewModel())
        .preferredColorScheme(.dark)
}
