import Foundation
import Observation

/// ViewModel for the AI Chat companion
@Observable
final class ChatViewModel {
    
    // MARK: - State
    
    var messages: [ChatMessage] = []
    var inputText = ""
    var isLoading = false
    var errorMessage: String?
    var currentMode: ChatMode = .auto
    var context: ChatContext = ChatContext()
    var suggestedActions: [SuggestedAction] = []
    
    // MARK: - Dependencies
    
    private let companionService = CompanionService.shared
    private let quotaManager = ChatQuotaManager.shared
    
    // MARK: - Computed
    
    var seedsRemaining: Int { quotaManager.seedsRemaining }
    var totalSeeds: Int { ChatQuotaManager.totalSeeds }
    var showFinalSeedInterstitial: Bool { quotaManager.showFinalSeedInterstitial }
    
    var contextDescription: String? {
        if let bible = context.bibleContext {
            return "Reading \(bible.reference)"
        }
        if let dev = context.devotionalContext {
            return "\(dev.seriesTitle) — Day \(dev.dayNumber)"
        }
        return nil
    }
    
    // MARK: - Init
    
    init() {}
    
    // MARK: - Actions
    
    func sendMessage(_ text: String? = nil, isPremium: Bool = false) {
        let trimmed = (text ?? inputText).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        
        // Check quota
        guard quotaManager.canSendMessage(isPremium: isPremium) else {
            errorMessage = quotaManager.getSeedMessage(isPremium: isPremium)
            return
        }
        
        // Use a seed
        let allowed = quotaManager.useSeed(isPremium: isPremium)
        guard allowed else { return }
        
        // Add user message
        AnalyticsService.shared.capture("chat_message_sent")
        let userMessage = ChatMessage(role: .user, content: trimmed)
        messages.append(userMessage)
        inputText = ""
        isLoading = true
        errorMessage = nil
        suggestedActions = []
        
        Task { @MainActor in
            let startTime = Date()
            do {
                let response = try await companionService.sendMessage(
                    message: trimmed,
                    conversationHistory: messages,
                    contextMode: currentMode,
                    verseContext: context.bibleContext
                )
                
                // Validate AI response through theological guardrails
                let validation = TheologicalGuardrails.validate(response.response)
                let safeContent = validation.isValid ? response.response : validation.sanitized
                
                let aiMessage = ChatMessage(
                    role: .assistant,
                    content: safeContent,
                    sources: validation.isValid ? response.sources : [],
                    mode: currentMode,
                    toolsUsed: validation.isValid ? response.toolsUsed : nil,
                    celebration: validation.isValid ? response.celebration : nil,
                    suggestedActions: validation.isValid ? response.suggestedActions : nil
                )
                messages.append(aiMessage)
                suggestedActions = response.suggestedActions ?? []
                
                // Log analytics
                let elapsed = Int(Date().timeIntervalSince(startTime) * 1000)
                companionService.logInteraction(
                    query: trimmed,
                    response: response.response,
                    sources: response.sources,
                    responseTimeMs: elapsed
                )
            } catch {
                let errorMsg = ChatMessage(
                    role: .assistant,
                    content: "I'm having trouble connecting right now. Please try again in a moment."
                )
                messages.append(errorMsg)
                self.errorMessage = error.localizedDescription
                AnalyticsService.shared.capture("error", properties: ["source": "chat", "message": error.localizedDescription])
            }
            isLoading = false
        }
    }
    
    func setMode(_ mode: ChatMode) {
        currentMode = mode
    }
    
    func setBibleContext(book: String, chapter: Int, selectedVerse: ChatBibleContext.SelectedVerse? = nil, pendingMessage: String? = nil) {
        context.screenType = .bible
        context.bibleContext = ChatBibleContext(book: book, chapter: chapter, selectedVerse: selectedVerse)
        context.devotionalContext = nil
        context.pendingMessage = pendingMessage
    }
    
    func setDevotionalContext(seriesId: String, seriesTitle: String, dayNumber: Int, scriptureRef: String? = nil) {
        context.screenType = .devotional
        context.devotionalContext = ChatDevotionalContext(seriesId: seriesId, seriesTitle: seriesTitle, dayNumber: dayNumber, scriptureRef: scriptureRef)
        context.bibleContext = nil
    }
    
    func clearContext() {
        context = ChatContext()
    }
    
    func clearConversation() {
        messages = []
        suggestedActions = []
        errorMessage = nil
    }
    
    func dismissFinalSeedInterstitial() {
        quotaManager.dismissFinalSeedInterstitial()
    }
    
    /// Process any pending message from context
    func handlePendingMessage(isPremium: Bool) {
        if let pending = context.pendingMessage {
            context.pendingMessage = nil
            sendMessage(pending, isPremium: isPremium)
        }
    }
}
