import Foundation
import Speech
import AVFoundation
import Combine

/// Voice input service using SFSpeechRecognizer
@MainActor
final class VoiceInputService: ObservableObject {
    @Published var isListening = false
    @Published var isAvailable = false
    @Published var transcript = ""
    @Published var interimTranscript = ""
    @Published var error: String?
    @Published var hasPermission = false
    @Published var audioLevel: Float = 0
    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    // Bible-contextual hints
    private static let contextualStrings = [
        "Scripture", "Bible", "Jesus", "Christ", "God", "Lord",
        "prayer", "pray", "amen", "verse", "chapter",
        "Genesis", "Exodus", "Psalms", "Proverbs", "Isaiah",
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
        "Corinthians", "Galatians", "Ephesians", "Philippians",
        "Revelation", "Hebrews", "James", "Peter"
    ]
    
    init() {
        checkAvailability()
    }
    
    private func checkAvailability() {
        isAvailable = speechRecognizer?.isAvailable ?? false
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            Task { @MainActor in
                self?.hasPermission = status == .authorized
                self?.isAvailable = status == .authorized && (self?.speechRecognizer?.isAvailable ?? false)
            }
        }
    }
    
    /// Request microphone + speech recognition permissions
    func requestPermission() async -> Bool {
        // Microphone
        let micGranted: Bool
        if #available(iOS 17.0, *) {
            micGranted = await AVAudioApplication.requestRecordPermission()
        } else {
            micGranted = await withCheckedContinuation { cont in
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    cont.resume(returning: granted)
                }
            }
        }
        
        guard micGranted else {
            error = "Microphone permission denied"
            return false
        }
        
        // Speech recognition
        let speechStatus = await withCheckedContinuation { cont in
            SFSpeechRecognizer.requestAuthorization { status in
                cont.resume(returning: status)
            }
        }
        
        hasPermission = speechStatus == .authorized
        isAvailable = hasPermission && (speechRecognizer?.isAvailable ?? false)
        
        if !hasPermission {
            error = "Speech recognition permission denied"
        }
        return hasPermission
    }
    
    /// Start listening for speech
    func startListening() async {
        if !isAvailable {
            if !hasPermission {
                let granted = await requestPermission()
                if !granted { return }
            } else {
                error = "Speech recognition not available"
                return
            }
        }
        
        // Stop any existing session
        stopListening()
        
        transcript = ""
        interimTranscript = ""
        error = nil
        
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.addsPunctuation = true
        if #available(iOS 16.0, *) {
            request.customizedLanguageModel = nil
        }
        recognitionRequest = request
        
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.record, mode: .measurement, options: .duckOthers)
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            self.error = "Audio session error: \(error.localizedDescription)"
            return
        }
        
        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
            // Calculate audio level for visualization
            let level = self?.calculateLevel(buffer: buffer) ?? 0
            Task { @MainActor in
                self?.audioLevel = level
            }
        }
        
        do {
            try audioEngine.start()
            isListening = true
        } catch {
            self.error = "Audio engine error: \(error.localizedDescription)"
            return
        }
        
        recognitionTask = speechRecognizer?.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self else { return }
                
                if let result {
                    let text = result.bestTranscription.formattedString
                    if result.isFinal {
                        self.transcript = text
                        self.interimTranscript = ""
                        self.stopListening()
                    } else {
                        self.interimTranscript = text
                    }
                }
                
                if let error {
                    // Ignore "no speech detected" style errors
                    let nsError = error as NSError
                    if nsError.domain != "kAFAssistantErrorDomain" || nsError.code != 1110 {
                        self.error = error.localizedDescription
                    }
                    self.stopListening()
                }
            }
        }
    }
    
    /// Stop listening and finalize
    func stopListening() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        isListening = false
        audioLevel = 0
        
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
    
    /// Cancel and discard
    func cancelListening() {
        stopListening()
        transcript = ""
        interimTranscript = ""
    }
    
    private func calculateLevel(buffer: AVAudioPCMBuffer) -> Float {
        guard let data = buffer.floatChannelData?[0] else { return 0 }
        let count = Int(buffer.frameLength)
        var sum: Float = 0
        for i in 0..<count { sum += abs(data[i]) }
        let avg = sum / Float(max(count, 1))
        return min(avg * 5, 1.0) // Normalize to 0-1
    }
}
