import SwiftUI

/// Picker for share card template, preview, and share action
struct ShareCardPickerView: View {
    let verseText: String
    let reference: String
    
    @State private var selectedTemplate: ShareCardTemplate = .dark
    @State private var selectedSize: ShareCardSize = .square
    @State private var showShareSheet = false
    @State private var shareImage: UIImage?
    @State private var isGenerating = false
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Preview
                ScrollView {
                    VStack(spacing: 20) {
                        // Card preview (scaled down)
                        VerseShareCardView(
                            verseText: verseText,
                            reference: reference,
                            template: selectedTemplate,
                            cardSize: selectedSize
                        )
                        .scaleEffect(scaleForPreview)
                        .frame(
                            width: selectedSize.size.width * scaleForPreview,
                            height: selectedSize.size.height * scaleForPreview
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: .black.opacity(0.2), radius: 12, y: 6)
                        .padding(.top, Theme.Spacing.md)
                        
                        // Size picker
                        Picker("Size", selection: $selectedSize) {
                            ForEach(ShareCardSize.allCases) { size in
                                Text(size.displayName).tag(size)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                }
                
                // Template selector
                VStack(spacing: 12) {
                    Text("Style")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.secondary)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(ShareCardTemplate.allCases) { template in
                                TemplateButton(
                                    template: template,
                                    isSelected: template == selectedTemplate
                                ) {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        selectedTemplate = template
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, Theme.Spacing.lg)
                    }
                }
                .padding(.vertical, Theme.Spacing.md)
                .background(.ultraThinMaterial)
                
                // Share button
                Button {
                    generateAndShare()
                } label: {
                    if isGenerating {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Label("Share Card", systemImage: "square.and.arrow.up")
                            .font(.headline)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Theme.Colors.primary)
                .foregroundStyle(.white)
                .cornerRadius(14)
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.md)
                .disabled(isGenerating)
            }
            .background(Theme.Colors.background)
            .navigationTitle("Share Verse")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .sheet(isPresented: $showShareSheet) {
                if let shareImage {
                    ShareSheet(activityItems: [shareImage, "\(reference)\n\n\(verseText)"])
                }
            }
        }
    }
    
    private var scaleForPreview: CGFloat {
        let screenWidth = UIScreen.main.bounds.width - 48
        return min(screenWidth / selectedSize.size.width, 0.35)
    }
    
    private func generateAndShare() {
        isGenerating = true
        Task { @MainActor in
            shareImage = ShareCardGenerator.shared.generateImage(
                verseText: verseText,
                reference: reference,
                template: selectedTemplate,
                cardSize: selectedSize
            )
            isGenerating = false
            if shareImage != nil {
                showShareSheet = true
            }
        }
    }
}

// MARK: - Template Button

private struct TemplateButton: View {
    let template: ShareCardTemplate
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                ZStack {
                    Circle()
                        .fill(thumbnailColor)
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: template.icon)
                        .font(.system(size: 16))
                        .foregroundStyle(iconColor)
                }
                .overlay(
                    Circle()
                        .stroke(isSelected ? Theme.Colors.primary : .clear, lineWidth: 2.5)
                )
                
                Text(template.displayName)
                    .font(.caption2)
                    .foregroundStyle(isSelected ? Theme.Colors.primary : .secondary)
            }
        }
    }
    
    private var thumbnailColor: Color {
        switch template {
        case .dark:    return Color(red: 0.08, green: 0.10, blue: 0.28)
        case .light:   return Color(red: 0.95, green: 0.92, blue: 0.85)
        case .nature:  return Color(red: 0.15, green: 0.42, blue: 0.25)
        case .sunset:  return Color(red: 0.90, green: 0.45, blue: 0.40)
        case .minimal: return Color.white
        case .royal:   return Color(red: 0.30, green: 0.12, blue: 0.48)
        }
    }
    
    private var iconColor: Color {
        template == .minimal ? .black : .white
    }
}

#Preview {
    ShareCardPickerView(
        verseText: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        reference: "John 3:16 KJV"
    )
}
