import SwiftUI

/// Sticky bottom audio player bar with glass effect and verse sync
struct AudioPlayerBar: View {
    @State private var audioPlayer = AudioPlayerManager.shared
    @State private var isExpanded = false
    
    var body: some View {
        if audioPlayer.playbackState.currentTrack != nil {
            VStack(spacing: 0) {
                if isExpanded {
                    expandedView
                } else {
                    compactView
                }
            }
            .glassCard(cornerRadius: isExpanded ? 24 : 16)
            .padding(.horizontal, isExpanded ? 0 : 12)
            .padding(.bottom, Theme.Spacing.xs)
            .transition(.move(edge: .bottom).combined(with: .opacity))
            .animation(Theme.Animation.spring, value: isExpanded)
        }
    }
    
    // MARK: - Compact View
    
    private var compactView: some View {
        HStack(spacing: 12) {
            // Track info
            VStack(alignment: .leading, spacing: 2) {
                Text(audioPlayer.playbackState.currentTrack?.title ?? "")
                    .font(Theme.Typography.label)
                    .foregroundStyle(Theme.Colors.text)
                    .lineLimit(1)
                
                if let verse = audioPlayer.playbackState.currentVerse {
                    Text("Verse \(verse)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
            
            Spacer()
            
            // Progress pill
            Text(audioPlayer.playbackState.positionText)
                .font(Theme.Typography.monoSmall)
                .foregroundStyle(Theme.Colors.textSecondary)
            
            // Controls
            HStack(spacing: 8) {
                Button { audioPlayer.skipBackward(15) } label: {
                    Image(systemName: "gobackward.15")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                }
                .accessibilityLabel("Skip back 15 seconds")

                Button { audioPlayer.togglePlayPause() } label: {
                    Image(systemName: audioPlayer.playbackState.status == .playing ? "pause.fill" : "play.fill")
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.primary)
                        .frame(width: 36, height: 36)
                }
                .accessibilityLabel(audioPlayer.playbackState.status == .playing ? "Pause" : "Play")

                Button { audioPlayer.skipForward(15) } label: {
                    Image(systemName: "goforward.15")
                        .font(Theme.Typography.body)
                        .foregroundStyle(Theme.Colors.text)
                }
                .accessibilityLabel("Skip forward 15 seconds")
            }

            // Expand button
            Button { withAnimation { isExpanded = true } } label: {
                Image(systemName: "chevron.up")
                    .font(Theme.Typography.captionBold)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .accessibilityLabel("Expand player")
        }
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.vertical, Theme.Spacing.smd)
        .contentShape(Rectangle())
        .onTapGesture { withAnimation { isExpanded = true } }
        // Mini progress bar
        .overlay(alignment: .bottom) {
            GeometryReader { geo in
                Rectangle()
                    .fill(Theme.Colors.primary)
                    .frame(width: geo.size.width * audioPlayer.playbackState.progress, height: 2)
            }
            .frame(height: 2)
        }
    }
    
    // MARK: - Expanded View
    
    private var expandedView: some View {
        VStack(spacing: 16) {
            // Drag handle
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xs)
                .fill(Theme.Colors.textTertiary.opacity(0.5))
                .frame(width: 40, height: 5)
                .padding(.top, Theme.Spacing.mds)
                .onTapGesture { withAnimation { isExpanded = false } }
            
            // Track title
            VStack(spacing: 4) {
                Text(audioPlayer.playbackState.currentTrack?.title ?? "")
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
                
                if let source = audioPlayer.playbackState.currentTrack?.source {
                    Text(source == .audioTreasure ? "AudioTreasure • KJV" : "Bible Brain")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            
            // Current verse indicator
            if let verse = audioPlayer.playbackState.currentVerse {
                Text("Verse \(verse)")
                    .font(Theme.Typography.labelSmall)
                    .foregroundStyle(Theme.Colors.primary)
                    .padding(.horizontal, Theme.Spacing.mds)
                    .padding(.vertical, 4)
                    .background(
                        Capsule().fill(Theme.Colors.primaryAlpha(0.2))
                    )
            }
            
            // Progress slider
            VStack(spacing: 4) {
                Slider(
                    value: Binding(
                        get: { audioPlayer.playbackState.position },
                        set: { audioPlayer.seek(to: $0) }
                    ),
                    in: 0...max(audioPlayer.playbackState.duration, 1)
                )
                .tint(Theme.Colors.primary)
                
                HStack {
                    Text(audioPlayer.playbackState.positionText)
                    Spacer()
                    Text("-\(audioPlayer.playbackState.remainingText)")
                }
                .font(Theme.Typography.monoSmall)
                .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(.horizontal, Theme.Spacing.sm)
            
            // Main controls
            HStack(spacing: 32) {
                // Speed control
                Button { audioPlayer.cyclePlaybackRate() } label: {
                    Text(String(format: "%.2gx", audioPlayer.playbackState.playbackRate))
                        .font(Theme.Typography.monoMedium)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(Theme.Colors.surface))
                }
                
                Button { audioPlayer.skipBackward(15) } label: {
                    Image(systemName: "gobackward.15")
                        .font(Theme.Typography.title2)
                        .foregroundStyle(Theme.Colors.text)
                }
                
                // Play/Pause
                Button { audioPlayer.togglePlayPause() } label: {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.primary)
                            .frame(width: 56, height: 56)
                        
                        Image(systemName: audioPlayer.playbackState.status == .playing ? "pause.fill" : "play.fill")
                            .font(Theme.Typography.title2)
                            .foregroundStyle(.white)
                    }
                }
                
                Button { audioPlayer.skipForward(15) } label: {
                    Image(systemName: "goforward.15")
                        .font(Theme.Typography.title2)
                        .foregroundStyle(Theme.Colors.text)
                }
                
                // Stop
                Button { audioPlayer.stop() } label: {
                    Image(systemName: "xmark")
                        .font(Theme.Typography.subheadlineMedium)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(Theme.Colors.surface))
                }
            }
            .padding(.bottom, Theme.Spacing.md)
        }
        .padding(.horizontal, Theme.Spacing.md)
    }
}

// MARK: - Loading Indicator for Audio Button

struct AudioLoadingButton: View {
    let isLoading: Bool
    let hasAudio: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            if isLoading {
                ShimmerView(height: 20.0)
                    .tint(Theme.Colors.primary)
            } else {
                Image(systemName: hasAudio ? "speaker.wave.2.fill" : "speaker.wave.2")
                    .foregroundStyle(Theme.Colors.primary)
            }
        }
        .disabled(isLoading)
    }
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        
        VStack {
            Spacer()
            AudioPlayerBar()
        }
    }
}
