import SwiftUI

struct DevotionalNowPlayingView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var isLockedContent = false
    let series: DevotionalSeries
    let episode: DevotionalDay
    let player = AudioPlayerManager.shared

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Theme.Colors.primary.opacity(0.1),
                    Theme.Colors.background
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: Theme.Spacing.lg) {
                // Header
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.md)

                Spacer()

                // Artwork
                ZStack {
                    if let urlString = series.coverImageUrl, let url = URL(string: urlString) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .empty:
                                ZStack {
                                    series.gradient
                                    Image(systemName: "music.note")
                                        .font(.system(size: 60))
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
                                        .font(.system(size: 60))
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
                                .font(.system(size: 60))
                                .foregroundColor(.white)
                        }
                    }
                }
                .frame(width: 280, height: 280)
                .cornerRadius(Theme.CornerRadius.xl)
                .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)

                // Track info
                VStack(spacing: Theme.Spacing.sm) {
                    Text(series.title)
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textSecondary)

                    Text("Day \(episode.dayNumber) • \(episode.title)")
                        .font(Theme.Typography.title2)
                        .foregroundColor(Theme.Colors.text)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)

                    if !episode.scriptureRefs.isEmpty {
                        Text(episode.scriptureRefs.map { $0.reference }.joined(separator: ", "))
                            .font(Theme.Typography.bodySmall)
                            .foregroundColor(Theme.Colors.textSecondary)
                            .lineLimit(1)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)

                Spacer()

                // Scrubber
                VStack(spacing: Theme.Spacing.sm) {
                    Slider(
                        value: Binding(
                            get: { player.playbackState.progress },
                            set: { player.seek(to: $0 * player.playbackState.duration) }
                        )
                    )
                    .tint(Theme.Colors.primary)
                    .padding(.horizontal, Theme.Spacing.lg)

                    HStack {
                        Text(player.playbackState.positionText)
                            .font(Theme.Typography.caption)
                            .foregroundColor(Theme.Colors.textSecondary)

                        Spacer()

                        Text("-\(player.playbackState.remainingText)")
                            .font(Theme.Typography.caption)
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                }

                // Controls
                HStack(spacing: 40) {
                    Button(action: { player.skipBackward() }) {
                        Image(systemName: "gobackward.15")
                            .font(.system(size: 24))
                            .foregroundColor(Theme.Colors.primary)
                    }

                    Button(action: { player.togglePlayPause() }) {
                        ZStack {
                            Circle()
                                .fill(Theme.Colors.primary)
                                .frame(width: 60, height: 60)

                            Image(
                                systemName: player.playbackState.status == .playing
                                    ? "pause.fill"
                                    : "play.fill"
                            )
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                        }
                    }

                    Button(action: { player.skipForward() }) {
                        Image(systemName: "goforward.15")
                            .font(.system(size: 24))
                            .foregroundColor(Theme.Colors.primary)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)

                // Speed button
                Button(action: { player.cyclePlaybackRate() }) {
                    Text(rateLabel(player.playbackState.playbackRate))
                        .font(Theme.Typography.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Theme.Colors.surfaceElevated)
                        .foregroundColor(Theme.Colors.text)
                        .cornerRadius(Theme.CornerRadius.full)
                }
                .padding(.horizontal, Theme.Spacing.lg)

                // Error state
                if case .error(let message) = player.playbackState.status {
                    VStack(spacing: Theme.Spacing.md) {
                        Text("Playback Error")
                            .font(Theme.Typography.bodySmall)
                            .foregroundColor(Theme.Colors.text)

                        Text(message)
                            .font(Theme.Typography.caption)
                            .foregroundColor(Theme.Colors.textSecondary)

                        Button(action: { loadAndPlay() }) {
                            Text("Retry")
                                .font(Theme.Typography.button)
                                .foregroundColor(.white)
                        }
                        .frame(maxWidth: .infinity).frame(height: 52)
                    }
                    .padding(Theme.Spacing.lg)
                    .background(Theme.Colors.surface)
                    .cornerRadius(Theme.CornerRadius.lg)
                    .padding(Theme.Spacing.lg)
                }

                // Loading overlay
                if player.playbackState.status == .loading {
                    ZStack {
                        Color.black.opacity(0.3)

                        ProgressView()
                            .tint(Theme.Colors.primary)
                    }
                    .ignoresSafeArea()
                }

                // Locked content overlay (premium required)
                if isLockedContent {
                    ZStack {
                        Color.black.opacity(0.4)

                        VStack(spacing: Theme.Spacing.lg) {
                            Image(systemName: "crown.fill")
                                .font(.system(size: 56))
                                .foregroundStyle(Theme.Colors.primary)

                            VStack(spacing: Theme.Spacing.sm) {
                                Text("Premium Content")
                                    .font(Theme.Typography.title2)
                                    .foregroundStyle(Theme.Colors.text)

                                Text("This episode requires ChooseGOD Premium")
                                    .font(Theme.Typography.body)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                                    .multilineTextAlignment(.center)
                            }

                            Button(action: {
                                dismiss()
                                // TODO: Navigate to PaywallView after dismiss
                            }) {
                                Text("Upgrade Now")
                                    .font(Theme.Typography.button)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(Theme.Colors.primary)
                                    .cornerRadius(Theme.CornerRadius.lg)
                            }
                        }
                        .padding(Theme.Spacing.lg)
                        .background(Theme.Colors.surface)
                        .cornerRadius(Theme.CornerRadius.xl)
                        .padding(Theme.Spacing.lg)
                    }
                    .ignoresSafeArea()
                }

                Spacer()
            }
        }
        .task {
            loadAndPlay()
        }
        .onDisappear {
            player.stop()
        }
    }

    private func loadAndPlay() {
        guard let urlString = episode.audioUrl, !urlString.isEmpty else {
            // Check if this is a locked premium episode (day > 1 with no audio URL)
            if episode.dayNumber > 1 {
                isLockedContent = true
            }
            // Day 1 episodes should always have audio, but we can't set error state from here
            // The audio player will handle showing no content
            return
        }

        guard let url = URL(string: urlString) else {
            // Invalid URL - just don't load
            return
        }

        let track = AudioTrack(
            id: episode.id,
            bookName: series.title,
            chapter: episode.dayNumber,
            url: url,
            source: .devotional
        )

        player.load(track: track, autoPlay: true)
    }

    private func rateLabel(_ rate: Float) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 2
        let number = NSNumber(value: Double(rate))
        return (formatter.string(from: number) ?? "1") + "×"
    }
}

// MARK: - Preview

#Preview {
    DevotionalNowPlayingView(series: .preview, episode: .preview)
}
