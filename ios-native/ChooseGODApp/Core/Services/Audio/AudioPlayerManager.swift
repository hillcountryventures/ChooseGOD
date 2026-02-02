import os
import Foundation
import AVFoundation
import Observation

/// AVFoundation-based audio player with verse synchronization
@Observable
final class AudioPlayerManager {
    static let shared = AudioPlayerManager()
    
    // MARK: - Published State
    
    private(set) var playbackState = PlaybackState()
    private(set) var timestamps: [AudioTimestamp] = []
    
    // MARK: - Private
    
    private var player: AVPlayer?
    private var playerItem: AVPlayerItem?
    private var timeObserver: Any?
    private var statusObservation: NSKeyValueObservation?
    private var itemEndObserver: NSObjectProtocol?
    
    private init() {
        configureAudioSession()
    }
    
    deinit {
        cleanup()
    }
    
    // MARK: - Audio Session
    
    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio, options: [.allowAirPlay])
            try session.setActive(true)
        } catch {
            AppLogger.audio.error("Audio session error: \(error)")
        }
    }
    
    // MARK: - Load & Play
    
    /// Load an audio track and optionally start playing
    func load(track: AudioTrack, timestamps: [AudioTimestamp] = [], autoPlay: Bool = true) {
        cleanup()
        
        self.timestamps = timestamps
        playbackState.currentTrack = track
        playbackState.status = .loading
        playbackState.position = 0
        playbackState.duration = track.duration ?? 0
        playbackState.currentVerse = nil
        
        playerItem = AVPlayerItem(url: track.url)
        player = AVPlayer(playerItem: playerItem)
        player?.rate = playbackState.playbackRate
        
        // Observe player item status
        statusObservation = playerItem?.observe(\.status, options: [.new]) { [weak self] item, _ in
            Task { @MainActor in
                guard let self else { return }
                switch item.status {
                case .readyToPlay:
                    let duration = CMTimeGetSeconds(item.duration)
                    if duration.isFinite {
                        self.playbackState.duration = duration
                    }
                    if autoPlay {
                        self.play()
                    } else {
                        self.playbackState.status = .paused
                    }
                case .failed:
                    self.playbackState.status = .error(item.error?.localizedDescription ?? "Playback failed")
                default:
                    break
                }
            }
        }
        
        // Observe playback end
        itemEndObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: playerItem,
            queue: .main
        ) { [weak self] _ in
            self?.playbackState.status = .paused
            self?.playbackState.position = self?.playbackState.duration ?? 0
        }
        
        // Periodic time updates (every 0.25s)
        timeObserver = player?.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.25, preferredTimescale: 600),
            queue: .main
        ) { [weak self] time in
            guard let self else { return }
            let position = CMTimeGetSeconds(time)
            guard position.isFinite else { return }
            self.playbackState.position = position
            self.updateCurrentVerse(at: position)
        }
    }
    
    // MARK: - Controls
    
    func play() {
        player?.rate = playbackState.playbackRate
        playbackState.status = .playing
    }
    
    func pause() {
        player?.pause()
        playbackState.status = .paused
    }
    
    func togglePlayPause() {
        if playbackState.status == .playing {
            pause()
        } else {
            play()
        }
    }
    
    func stop() {
        player?.pause()
        player?.seek(to: .zero)
        playbackState.status = .idle
        playbackState.position = 0
        playbackState.currentVerse = nil
        playbackState.currentTrack = nil
        cleanup()
    }
    
    func seek(to seconds: TimeInterval) {
        let time = CMTime(seconds: seconds, preferredTimescale: 600)
        player?.seek(to: time, toleranceBefore: .zero, toleranceAfter: .zero)
        playbackState.position = seconds
    }
    
    func seekToVerse(_ verse: Int) {
        guard let ts = timestamps.first(where: { $0.verseStart == verse }) else { return }
        seek(to: ts.timestamp)
    }
    
    func skipForward(_ seconds: TimeInterval = 15) {
        let target = min(playbackState.position + seconds, playbackState.duration)
        seek(to: target)
    }
    
    func skipBackward(_ seconds: TimeInterval = 15) {
        let target = max(playbackState.position - seconds, 0)
        seek(to: target)
    }
    
    func setPlaybackRate(_ rate: Float) {
        playbackState.playbackRate = rate
        if playbackState.status == .playing {
            player?.rate = rate
        }
    }
    
    func cyclePlaybackRate() {
        let rates: [Float] = [0.75, 1.0, 1.25, 1.5, 2.0]
        let currentIndex = rates.firstIndex(of: playbackState.playbackRate) ?? 1
        let nextIndex = (currentIndex + 1) % rates.count
        setPlaybackRate(rates[nextIndex])
    }
    
    // MARK: - Verse Sync
    
    private func updateCurrentVerse(at position: TimeInterval) {
        guard !timestamps.isEmpty else { return }
        
        var currentVerse: Int?
        for i in stride(from: timestamps.count - 1, through: 0, by: -1) {
            if position >= timestamps[i].timestamp {
                currentVerse = timestamps[i].verseStart
                break
            }
        }
        
        if playbackState.currentVerse != currentVerse {
            playbackState.currentVerse = currentVerse
        }
    }
    
    // MARK: - Cleanup
    
    private func cleanup() {
        if let timeObserver {
            player?.removeTimeObserver(timeObserver)
        }
        timeObserver = nil
        
        if let itemEndObserver {
            NotificationCenter.default.removeObserver(itemEndObserver)
        }
        itemEndObserver = nil
        
        statusObservation?.invalidate()
        statusObservation = nil
        
        player?.pause()
        player = nil
        playerItem = nil
    }
}
