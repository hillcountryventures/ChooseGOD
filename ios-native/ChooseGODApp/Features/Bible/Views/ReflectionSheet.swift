import SwiftUI

/// Quick reflection modal after reading a verse
struct ReflectionSheet: View {
    let verseRef: String
    let verseText: String
    
    @Environment(\.dismiss) private var dismiss
    @State private var reflection = ""
    @State private var selectedTags: Set<String> = []
    @State private var isSaving = false
    @FocusState private var isTextFocused: Bool
    
    private let emotionTags = [
        "Grateful", "Peaceful", "Convicted", "Hopeful",
        "Curious", "Comforted", "Challenged", "Joyful"
    ]
    
    private let themeTags = [
        "Love", "Faith", "Grace", "Forgiveness",
        "Wisdom", "Courage", "Trust", "Praise"
    ]
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.lg) {
                    // Verse card
                    verseCard
                    
                    // Prompt
                    Text("What stood out to you?")
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // Journal entry
                    TextEditor(text: $reflection)
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                        .scrollContentBackground(.hidden)
                        .frame(minHeight: 140)
                        .padding(Theme.Spacing.md)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                                .fill(Theme.Colors.surface)
                        )
                        .overlay(alignment: .topLeading) {
                            if reflection.isEmpty {
                                Text("Write your thoughts, prayers, or reflections...")
                                    .font(Theme.Typography.body)
                                    .foregroundStyle(Theme.Colors.textTertiary)
                                    .padding(Theme.Spacing.md)
                                    .padding(.top, 8)
                                    .allowsHitTesting(false)
                            }
                        }
                        .focused($isTextFocused)
                    
                    // Emotion tags
                    tagSection(title: "How did this make you feel?", tags: emotionTags)
                    
                    // Theme tags
                    tagSection(title: "Themes", tags: themeTags)
                }
                .padding(Theme.Spacing.lg)
            }
            .background(Theme.Colors.background.ignoresSafeArea())
            .navigationTitle("Reflect")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .foregroundStyle(Theme.Colors.text)
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        save()
                    } label: {
                        Text("Save")
                            .font(Theme.Typography.button)
                            .foregroundStyle(.white)
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.xs)
                            .background(Capsule().fill(Theme.Colors.primary))
                    }
                    .disabled(reflection.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSaving)
                    .opacity(reflection.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.5 : 1)
                }
            }
            .onAppear { isTextFocused = true }
        }
    }
    
    // MARK: - Verse Card
    
    private var verseCard: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: "book")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.Colors.primary)
                
                Text(verseRef)
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.primary)
            }
            
            Text("\"\(verseText)\"")
                .font(Theme.Typography.scripture)
                .foregroundStyle(Theme.Colors.text)
                .italic()
                .lineSpacing(6)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(Theme.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(Theme.Colors.primary.opacity(0.2), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Tag Section
    
    private func tagSection(title: String, tags: [String]) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text(title)
                .font(Theme.Typography.label)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            FlowLayout(spacing: Theme.Spacing.sm) {
                ForEach(tags, id: \.self) { tag in
                    tagChip(tag)
                }
            }
        }
    }
    
    private func tagChip(_ tag: String) -> some View {
        let isSelected = selectedTags.contains(tag)
        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                if isSelected {
                    selectedTags.remove(tag)
                } else {
                    selectedTags.insert(tag)
                }
            }
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
        } label: {
            Text(tag)
                .font(Theme.Typography.labelSmall)
                .foregroundStyle(isSelected ? .white : Theme.Colors.textSecondary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(
                    Capsule().fill(isSelected ? Theme.Colors.primary : Theme.Colors.surface)
                )
                .overlay(
                    Capsule().stroke(isSelected ? Color.clear : Theme.Colors.textTertiary.opacity(0.3), lineWidth: 1)
                )
        }
    }
    
    // MARK: - Save
    
    private func save() {
        guard !reflection.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        isSaving = true
        
        // TODO: Save to Supabase journal/spiritual_moments
        print("[Reflection] Saved for \(verseRef): \(reflection.prefix(50))... tags: \(selectedTags)")
        
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        
        dismiss()
    }
}

// MARK: - Flow Layout

/// Simple wrapping horizontal layout for tags

// MARK: - Preview

#Preview {
    ReflectionSheet(
        verseRef: "Psalm 46:10",
        verseText: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."
    )
    .preferredColorScheme(.dark)
}
