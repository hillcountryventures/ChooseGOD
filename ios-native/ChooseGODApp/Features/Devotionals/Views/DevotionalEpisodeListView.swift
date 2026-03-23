import SwiftUI
import Observation

// MARK: - ViewModel

@Observable
final class DevotionalEpisodeViewModel {
    let series: DevotionalSeries
    var episodes: [DevotionalDay] = []
    var isLoading = true

    private let service: DevotionalAudioServiceProtocol

    init(series: DevotionalSeries, service: DevotionalAudioServiceProtocol = DevotionalAudioService.shared) {
        self.series = series
        self.service = service
    }

    func load() async {
        isLoading = true
        do {
            episodes = try await service.fetchEpisodes(forSeriesId: series.id)
        } catch {
            episodes = []
        }
        isLoading = false
    }

    func isLocked(_ day: DevotionalDay, isPremium: Bool) -> Bool {
        day.dayNumber > 1 && !isPremium
    }
}

// MARK: - View

struct DevotionalEpisodeListView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: DevotionalEpisodeViewModel
    @State private var selectedEpisode: DevotionalDay?
    @State private var showPaywall = false

    init(series: DevotionalSeries) {
        _viewModel = State(initialValue: DevotionalEpisodeViewModel(series: series))
    }

    private var isPremium: Bool {
        appState.currentUser?.isPremium ?? false
    }

    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    // Header with cover image
                    ZStack(alignment: .bottomLeading) {
                        if let urlString = viewModel.series.coverImageUrl, let url = URL(string: urlString) {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .empty:
                                    ZStack {
                                        viewModel.series.gradient
                                        Image(systemName: "music.note")
                                            .font(.system(size: 48))
                                            .foregroundColor(.white)
                                    }
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                case .failure:
                                    ZStack {
                                        viewModel.series.gradient
                                        Image(systemName: "music.note")
                                            .font(.system(size: 48))
                                            .foregroundColor(.white)
                                    }
                                @unknown default:
                                    EmptyView()
                                }
                            }
                        } else {
                            ZStack {
                                viewModel.series.gradient
                                Image(systemName: "music.note")
                                    .font(.system(size: 48))
                                    .foregroundColor(.white)
                            }
                        }

                        // Bottom fade gradient
                        LinearGradient(
                            gradient: Gradient(colors: [Color.clear, Color.black.opacity(0.5)]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        .ignoresSafeArea()
                    }
                    .frame(height: 220)
                    .clipped()

                    // Series info
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        Text(viewModel.series.title)
                            .font(Theme.Typography.title1)
                            .foregroundColor(Theme.Colors.text)

                        Text(viewModel.series.description)
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(Theme.Spacing.lg)

                    // Episode list
                    if viewModel.isLoading {
                        VStack(spacing: Theme.Spacing.md) {
                            ForEach(0..<3, id: \.self) { _ in
                                RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                                    .fill(Theme.Colors.surface)
                                    .frame(height: 100)
                                    .redacted(reason: .placeholder)
                            }
                        }
                        .padding(Theme.Spacing.lg)
                    } else {
                        LazyVStack(spacing: Theme.Spacing.md) {
                            ForEach(viewModel.episodes) { episode in
                                EpisodeRow(
                                    episode: episode,
                                    isLocked: viewModel.isLocked(episode, isPremium: isPremium),
                                    action: {
                                        if viewModel.isLocked(episode, isPremium: isPremium) {
                                            showPaywall = true
                                        } else {
                                            selectedEpisode = episode
                                        }
                                    }
                                )
                            }
                        }
                        .padding(Theme.Spacing.lg)
                    }
                }
            }
        }
        .navigationTitle("Episodes")
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(item: $selectedEpisode) { episode in
            DevotionalNowPlayingView(series: viewModel.series, episode: episode)
        }
        .fullScreenCover(isPresented: $showPaywall) {
            PaywallView()
        }
        .task {
            await viewModel.load()
        }
    }
}

// MARK: - Episode Row

struct EpisodeRow: View {
    let episode: DevotionalDay
    let isLocked: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.md) {
                // Day badge
                ZStack {
                    Circle()
                        .fill(Theme.Colors.primary)
                    Text("\(episode.dayNumber)")
                        .font(Theme.Typography.button)
                        .foregroundColor(.white)
                }
                .frame(width: 50, height: 50)

                // Episode info
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("Day \(episode.dayNumber) • \(episode.title)")
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.text)
                        .lineLimit(1)

                    if !episode.scriptureRefs.isEmpty {
                        Text(episode.scriptureRefs.map { $0.reference }.joined(separator: ", "))
                            .font(Theme.Typography.caption)
                            .foregroundColor(Theme.Colors.textSecondary)
                            .lineLimit(1)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Lock or play icon
                if isLocked {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 18))
                        .foregroundColor(Theme.Colors.textTertiary)
                } else {
                    Image(systemName: "play.fill")
                        .font(.system(size: 18))
                        .foregroundColor(Theme.Colors.primary)
                }
            }
            .padding(Theme.Spacing.md)
            .background(Theme.Colors.surface)
            .cornerRadius(Theme.CornerRadius.lg)
        }
    }
}

// MARK: - Preview

#Preview {
    DevotionalEpisodeListView(series: .preview)
        .environment(AppState.preview)
}
