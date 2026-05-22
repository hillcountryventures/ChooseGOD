import SwiftUI

/// Download manager for full-offline Bible translations. Users download a
/// translation (~5 MB) for complete offline reading; manage storage; delete.
struct OfflineBibleView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var store = OfflineBibleStore.shared

    /// translation.rawValue -> 0…1 progress while downloading.
    @State private var progress: [String: Double] = [:]
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Download a translation to read it with no internet — in church, on a plane, anywhere.")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                Section("Translations") {
                    ForEach(BibleTranslation.allCases) { translation in
                        row(for: translation)
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.Colors.background)
            .navigationTitle("Offline Bible")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Download failed", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: { Text(errorMessage ?? "") }
        }
    }

    @ViewBuilder
    private func row(for translation: BibleTranslation) -> some View {
        let isDownloaded = store.downloaded.contains(translation.rawValue)
        let inProgress = progress[translation.rawValue]

        VStack(alignment: .leading, spacing: 6) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(translation.displayName)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.text)
                    if isDownloaded {
                        Text("Downloaded · \(sizeString(translation))")
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    } else if inProgress == nil {
                        Text(translation.rawValue)
                            .font(.caption2)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
                Spacer()
                trailing(translation: translation, isDownloaded: isDownloaded, inProgress: inProgress)
            }
            if let p = inProgress {
                ProgressView(value: p)
                    .tint(Theme.Colors.primary)
            }
        }
        .padding(.vertical, 2)
    }

    @ViewBuilder
    private func trailing(translation: BibleTranslation, isDownloaded: Bool, inProgress: Double?) -> some View {
        if inProgress != nil {
            Text("\(Int((inProgress ?? 0) * 100))%")
                .font(.caption)
                .monospacedDigit()
                .foregroundStyle(Theme.Colors.secondaryText)
        } else if isDownloaded {
            Button(role: .destructive) {
                store.delete(translation)
            } label: {
                Image(systemName: "trash")
                    .foregroundStyle(.red)
            }
            .buttonStyle(.plain)
        } else {
            Button {
                download(translation)
            } label: {
                Image(systemName: "arrow.down.circle")
                    .font(.title3)
                    .foregroundStyle(Theme.Colors.primary)
            }
            .buttonStyle(.plain)
        }
    }

    private func sizeString(_ translation: BibleTranslation) -> String {
        let bytes = store.sizeBytes(translation)
        let mb = Double(bytes) / 1_000_000
        return mb >= 1 ? String(format: "%.1f MB", mb) : String(format: "%.0f KB", Double(bytes) / 1000)
    }

    private func download(_ translation: BibleTranslation) {
        progress[translation.rawValue] = 0
        Task {
            do {
                try await store.download(translation) { frac in
                    progress[translation.rawValue] = frac
                }
                progress[translation.rawValue] = nil
                AnalyticsService.shared.capture(
                    "translation_downloaded",
                    properties: ["translation": translation.rawValue]
                )
            } catch {
                progress[translation.rawValue] = nil
                errorMessage = "Couldn't download \(translation.displayName). Check your connection and try again."
            }
        }
    }
}

#Preview {
    OfflineBibleView()
        .environment(AppState.preview)
}
