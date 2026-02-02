import os
import Foundation
import AVFoundation
import MediaPlayer
import Observation

/// Wraps AVAudioPlayer with background playback and lock screen controls
@Observable
final class AudioDevotionalPlayer {
    static let shared = AudioDevotionalPlayer()
    
    // MARK: - State
    
    enum PlayerState: Equatable {
        case idle
        case loading
        case playing
        case paused
        case error(String)
    }
    
    private(set) var state: PlayerState = .idle
    private(set) var currentTime: TimeInterval = 0
    private(set) var duration: TimeInterval = 0
    private(set) var title: String = ""
    private(set) var subtitle: String = ""
    
    var progress: Double {
        guard duration > 0 else { return 0 }
        return currentTime / duration
    }
    
    // MARK: - Private
    
    private var audioPlayer: AVAudioPlayer?
    private var displayLink: CADisplayLink?
    
    private init() {
        configureAudioSession()
        setupRemoteTransportControls()
    }
    
    // MARK: - Audio Session
    
    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio, options: [.allowAirPlay])
            try session.setActive(true)
        } catch {
            AppLogger.audio.error("AudioDevotionalPlayer session error: \(error)")
        }
    }
    
    // MARK: - Remote Controls (Lock Screen)
    
    private func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.play()
            return .success
        }
        
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.pause()
            return .success
        }
        
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] _ in
            self?.togglePlayPause()
            return .success
        }
        
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let event = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            self?.seek(to: event.positionTime)
            return .success
        }
        
        commandCenter.skipForwardCommand.preferredIntervals = [15]
        commandCenter.skipForwardCommand.addTarget { [weak self] _ in
            self?.skipForward()
            return .success
        }
        
        commandCenter.skipBackwardCommand.preferredIntervals = [15]
        commandCenter.skipBackwardCommand.addTarget { [weak self] _ in
            self?.skipBackward()
            return .success
        }
    }
    
    private func updateNowPlayingInfo() {
        var info = [String: Any]()
        info[MPMediaItemPropertyTitle] = title
        info[MPMediaItemPropertyArtist] = "ChooseGOD"
        info[MPMediaItemPropertyAlbumTitle] = subtitle
        info[MPMediaItemPropertyPlaybackDuration] = duration
        info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = currentTime
        info[MPNowPlayingInfoPropertyPlaybackRate] = state == .playing ? 1.0 : 0.0
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
    
    // MARK: - Load & Play
    
    func load(url: URL, title: String, subtitle: String, autoPlay: Bool = true) {
        stop()
        
        self.title = title
        self.subtitle = subtitle
        self.state = .loading
        
        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.prepareToPlay()
            duration = audioPlayer?.duration ?? 0
            currentTime = 0
            
            if autoPlay {
                play()
            } else {
                state = .paused
            }
            
            updateNowPlayingInfo()
        } catch {
            state = .error(error.localizedDescription)
            AppLogger.audio.error("AudioDevotionalPlayer load error: \(error)")
        }
    }
    
    func loadData(_ data: Data, title: String, subtitle: String, autoPlay: Bool = true) {
        stop()
        
        self.title = title
        self.subtitle = subtitle
        self.state = .loading
        
        do {
            audioPlayer = try AVAudioPlayer(data: data)
            audioPlayer?.prepareToPlay()
            duration = audioPlayer?.duration ?? 0
            currentTime = 0
            
            if autoPlay {
                play()
            } else {
                state = .paused
            }
            
            updateNowPlayingInfo()
        } catch {
            state = .error(error.localizedDescription)
            AppLogger.audio.error("AudioDevotionalPlayer loadData error: \(error)")
        }
    }
    
    // MARK: - Controls
    
    func play() {
        audioPlayer?.play()
        state = .playing
        startTimeUpdates()
        updateNowPlayingInfo()
    }
    
    func pause() {
        audioPlayer?.pause()
        state = .paused
        stopTimeUpdates()
        updateNowPlayingInfo()
    }
    
    func togglePlayPause() {
        if state == .playing {
            pause()
        } else {
            play()
        }
    }
    
    func stop() {
        audioPlayer?.stop()
        audioPlayer = nil
        state = .idle
        currentTime = 0
        duration = 0
        stopTimeUpdates()
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }
    
    func seek(to time: TimeInterval) {
        let clamped = min(max(time, 0), duration)
        audioPlayer?.currentTime = clamped
        currentTime = clamped
        updateNowPlayingInfo()
    }
    
    func seekToProgress(_ progress: Double) {
        seek(to: duration * progress)
    }
    
    func skipForward(_ seconds: TimeInterval = 15) {
        seek(to: currentTime + seconds)
    }
    
    func skipBackward(_ seconds: TimeInterval = 15) {
        seek(to: currentTime - seconds)
    }
    
    // MARK: - Time Updates
    
    private func startTimeUpdates() {
        stopTimeUpdates()
        displayLink = CADisplayLink(target: self, selector: #selector(updateTime))
        displayLink?.preferredFrameRateRange = CAFrameRateRange(minimum: 4, maximum: 15, preferred: 10)
        displayLink?.add(to: .main, forMode: .common)
    }
    
    private func stopTimeUpdates() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    @objc private func updateTime() {
        guard let player = audioPlayer else { return }
        currentTime = player.currentTime
        
        if !player.isPlaying && state == .playing {
            // Playback ended
            state = .paused
            currentTime = duration
            stopTimeUpdates()
            updateNowPlayingInfo()
        }
    }
}
