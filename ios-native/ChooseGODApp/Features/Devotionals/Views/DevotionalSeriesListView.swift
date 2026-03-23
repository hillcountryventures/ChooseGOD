import SwiftUI
import Observation

// MARK: - ViewModel

@Observable
final class DevotionalSeriesViewModel {
    var series: [DevotionalSeries] = []
    var isLoading = true
    var errorMessage: String?

    private let service: DevotionalAudioServiceProtocol

    init(service: DevotionalAudioServiceProtocol = DevotionalAudioService.shared) {
        self.service = service
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            series = try await service.fetchAllSeries()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - View

struct DevotionalSeriesListView: View {
    @State private var viewModel = DevotionalSeriesViewModel()
    let gridColumns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                if viewModel.isLoading {
                    ScrollView {
                        LazyVGrid(columns: gridColumns, spacing: Theme.Spacing.md) {
                            ForEach(0..<4, id: \.self) { _ in
                                RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                                    .fill(Theme.Colors.surface)
                                    .frame(height: 280)
                                    .redacted(reason: .placeholder)
                            }
                        }
                        .padding(Theme.Spacing.md)
                    }
                } else if let error = viewModel.errorMessage {
                    VStack(spacing: Theme.Spacing.md) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(Theme.Colors.primary)

                        Text("Unable to Load Series")
                            .font(Theme.Typography.title2)

                        Text(error)
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.textSecondary)
                            .multilineTextAlignment(.center)

                        Button(action: {
                            Task { await viewModel.load() }
                        }) {
                            Text("Try Again")
                                .font(Theme.Typography.button)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Theme.Spacing.md)
                                .background(Theme.Colors.primary)
                                .foregroundColor(.white)
                                .cornerRadius(Theme.CornerRadius.lg)
                        }
                    }
                    .padding(Theme.Spacing.lg)
                } else {
                    ScrollView {
                        LazyVGrid(columns: gridColumns, spacing: Theme.Spacing.md) {
                            ForEach(viewModel.series) { series in
                                NavigationLink(destination: DevotionalEpisodeListView(series: series)) {
                                    SeriesAudioCard(series: series)
                                }
                            }
                        }
                        .padding(Theme.Spacing.md)
                    }
                }
            }
            .navigationTitle("Audio Devotionals")
            .navigationBarTitleDisplayMode(.inline)
        }
        .task {
            await viewModel.load()
        }
    }
}

// MARK: - Series Audio Card

struct SeriesAudioCard: View {
    let series: DevotionalSeries

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Cover Image
            ZStack(alignment: .bottomLeading) {
                if let urlString = series.coverImageUrl, let url = URL(string: urlString) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .empty:
                            ZStack {
                                series.gradient
                                Image(systemName: "music.note")
                                    .font(.system(size: 40))
                                    .foregroundColor(.white)
                            }
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                        case .failure:
                            ZStack {
                                series.gradient
                                Image(systemName: "music.note")
                                    .font(.system(size: 40))
                                    .foregroundColor(.white)
                            }
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    ZStack {
                        series.gradient
                        Image(systemName: "music.note")
                            .font(.system(size: 40))
                            .foregroundColor(.white)
                    }
                }

                // Gradient overlay at bottom
                LinearGradient(
                    gradient: Gradient(colors: [Color.clear, Color.black.opacity(0.4)]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                // Day count badge
                Text("\(series.totalDays) Days")
                    .font(Theme.Typography.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, Theme.Spacing.mds)
                    .padding(.vertical, 4)
                    .background(Theme.Colors.primary.opacity(0.9))
                    .cornerRadius(Theme.CornerRadius.sm)
                    .padding(Theme.Spacing.md)
            }
            .frame(height: 180)
            .clipped()

            // Title and Description
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text(series.title)
                    .font(Theme.Typography.bodySmall)
                    .fontWeight(.semibold)
                    .foregroundColor(Theme.Colors.text)
                    .lineLimit(2)

                Text(series.description)
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSecondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }
            .padding(Theme.Spacing.md)
        }
        .frame(height: 280)
        .background(Theme.Colors.surface)
        .cornerRadius(Theme.CornerRadius.xl)
        .glassCard(cornerRadius: Theme.CornerRadius.xl, opacity: 0.1)
    }
}

// MARK: - Preview

#Preview {
    DevotionalSeriesListView()
        .environment(AppState.preview)
}
