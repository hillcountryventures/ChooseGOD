import os
import SwiftUI
import Combine

// MARK: - Lectio Step Model

struct LectioStep: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let instruction: String
    let icon: String
    let color: Color
    let durationSeconds: Int
    let hasInput: Bool
    let inputPlaceholder: String
    
    init(
        id: String,
        title: String,
        subtitle: String,
        instruction: String,
        icon: String,
        color: Color,
        durationSeconds: Int,
        hasInput: Bool = false,
        inputPlaceholder: String = ""
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.instruction = instruction
        self.icon = icon
        self.color = color
        self.durationSeconds = durationSeconds
        self.hasInput = hasInput
        self.inputPlaceholder = inputPlaceholder
    }
}

// MARK: - ViewModel

@MainActor
final class LectioViewModel: ObservableObject {
    
    // MARK: - Steps
    
    static let steps: [LectioStep] = [
        LectioStep(
            id: "lectio",
            title: "Lectio",
            subtitle: "Read",
            instruction: "Read the passage slowly, out loud if possible. Let each word sink in. Read it 2-3 times.",
            icon: "book",
            color: Theme.Colors.primary,
            durationSeconds: 90
        ),
        LectioStep(
            id: "meditatio",
            title: "Meditatio",
            subtitle: "Reflect",
            instruction: "What word or phrase captures your attention? Sit with it. What is stirring in your heart?",
            icon: "heart",
            color: Theme.Colors.prayer,
            durationSeconds: 120,
            hasInput: true,
            inputPlaceholder: "The word/phrase that stands out to me..."
        ),
        LectioStep(
            id: "oratio",
            title: "Oratio",
            subtitle: "Respond",
            instruction: "Talk to God about what you noticed. Share your thoughts, questions, gratitude, or needs.",
            icon: "bubble.left",
            color: Theme.Colors.accent,
            durationSeconds: 120,
            hasInput: true,
            inputPlaceholder: "My prayer response..."
        ),
        LectioStep(
            id: "contemplatio",
            title: "Contemplatio",
            subtitle: "Rest",
            instruction: "Release words and thoughts. Simply rest in God's presence. Be still and know He is God.",
            icon: "moon",
            color: Theme.Colors.success,
            durationSeconds: 90
        ),
    ]
    
    // MARK: - Published State
    
    @Published var currentStepIndex = 0
    @Published var timeRemaining: Int
    @Published var isPaused = true
    @Published var isComplete = false
    @Published var responses: [String: String] = [:]
    
    var currentStep: LectioStep { Self.steps[currentStepIndex] }
    var totalSteps: Int { Self.steps.count }
    var progress: Double { Double(currentStepIndex + 1) / Double(totalSteps) }
    
    let verseRef: String
    let verseText: String
    
    private var timer: AnyCancellable?
    
    // MARK: - Init
    
    init(verseRef: String = "Psalm 46:10",
         verseText: String = "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.") {
        self.verseRef = verseRef
        self.verseText = verseText
        self.timeRemaining = Self.steps[0].durationSeconds
    }
    
    // MARK: - Timer
    
    func toggleTimer() {
        isPaused.toggle()
        if isPaused {
            stopTimer()
        } else {
            startTimer()
        }
    }
    
    private func startTimer() {
        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self else { return }
                if self.timeRemaining > 1 {
                    self.timeRemaining -= 1
                } else {
                    self.advanceStep()
                }
            }
    }
    
    private func stopTimer() {
        timer?.cancel()
        timer = nil
    }
    
    // MARK: - Navigation
    
    func advanceStep() {
        stopTimer()
        hapticFeedback()
        
        if currentStepIndex >= totalSteps - 1 {
            withAnimation(.easeInOut(duration: 0.4)) {
                isComplete = true
            }
            return
        }
        
        withAnimation(.easeInOut(duration: 0.4)) {
            currentStepIndex += 1
            timeRemaining = currentStep.durationSeconds
            isPaused = true
        }
    }
    
    func goBack() {
        guard currentStepIndex > 0 else { return }
        stopTimer()
        
        withAnimation(.easeInOut(duration: 0.4)) {
            currentStepIndex -= 1
            timeRemaining = currentStep.durationSeconds
            isPaused = true
        }
    }
    
    // MARK: - Formatting
    
    var formattedTime: String {
        let m = timeRemaining / 60
        let s = timeRemaining % 60
        return String(format: "%d:%02d", m, s)
    }
    
    // MARK: - Haptics
    
    private func hapticFeedback() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
    
    // MARK: - Save
    
    func saveReflection() {
        // TODO: Save to Supabase spiritual_moments
        let _ = [
            "**Lectio Divina - \(verseRef)**",
            "",
            "*Passage:* \"\(verseText)\"",
            responses["meditatio"].map { "*What stood out:* \($0)" } ?? "",
            responses["oratio"].map { "*Prayer response:* \($0)" } ?? "",
        ].filter { !$0.isEmpty }.joined(separator: "\n")
        
        Logger(subsystem: "com.choosegod.app", category: "journal").info("LectioDivina saving reflection")
    }
    
    deinit {
        timer?.cancel()
    }
}
