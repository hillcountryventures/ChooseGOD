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
    
    var chatsRemaining: Int { quotaManager.chatsRemaining }
    var lifetimeFreeLimit: Int { ChatQuotaManager.lifetimeFreeLimit }
    var showUpgradePrompt: Bool { quotaManager.showUpgradePrompt }
    
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
    
    func sendMessage(_ text: String? = nil, isPremium: Bool = false, hasReferralPremium: Bool = false, userId: String? = nil) {
        let rawInput = (text ?? inputText).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !rawInput.isEmpty else { return }

        // Check quota (server-backed)
        guard quotaManager.canSend(isPremium: isPremium, hasReferralPremium: hasReferralPremium) else {
            quotaManager.triggerUpgradePrompt()
            errorMessage = quotaManager.getQuotaMessage(isPremium: isPremium, hasReferralPremium: hasReferralPremium)
            return
        }
        
        // Strip prompt injection patterns before sending
        let sanitized = rawInput // TODO: Re-enable TheologicalGuardrails when service is available

        // Add user message (show original text to user, send sanitized to AI)
        // HapticManager.shared.tap() // TODO: Async issue needs fixing
        // AnalyticsService.shared.capture("chat_message_sent") // TODO: Service not available
        let userMessage = ChatMessage(role: .user, content: rawInput)
        messages.append(userMessage)
        inputText = ""
        isLoading = true
        errorMessage = nil
        suggestedActions = []
        
        // Crisis detection disabled until TheologicalGuardrails service is wired
        let crisisDetected = false
        // TODO: Re-enable: crisisDetected = TheologicalGuardrails.detectCrisisInInput(rawInput)
        // if crisisDetected { show 988 message }
        
        // Still send to AI for a full response (use sanitized text)
        let messageToSend = sanitized.isEmpty ? rawInput : sanitized
        
        Task { @MainActor in
            let startTime = Date()
            do {
                let response = try await companionService.sendMessage(
                    message: messageToSend,
                    conversationHistory: messages,
                    contextMode: currentMode,
                    verseContext: context.bibleContext
                )
                
                // Validate AI response through theological guardrails
                let safeContent = response.response // TODO: Re-enable validation when service is available

                // If we already showed crisis message from input detection,
                // skip duplicate crisis message from AI response validation
                let skipAIResponse = crisisDetected

                if !skipAIResponse {
                    let aiMessage = ChatMessage(
                        role: .assistant,
                        content: safeContent,
                        sources: response.sources,
                        mode: currentMode,
                        toolsUsed: response.toolsUsed,
                        celebration: response.celebration,
                        suggestedActions: response.suggestedActions
                    )
                    messages.append(aiMessage)
                    suggestedActions = response.suggestedActions ?? []
                }
                
                // Log analytics
                let elapsed = Int(Date().timeIntervalSince(startTime) * 1000)
                companionService.logInteraction(
                    query: messageToSend,
                    response: response.response,
                    sources: response.sources,
                    responseTimeMs: elapsed
                )

                // Record sent chat on server
                if let userId = userId {
                    try await self.quotaManager.recordSent(userId: userId)
                }
            } catch {
                // Only show error if we didn't already show crisis message
                if !crisisDetected {
                    let errorMsg = ChatMessage(
                        role: .assistant,
                        content: "I'm having trouble connecting right now. Please try again in a moment."
                    )
                    messages.append(errorMsg)
                }
                self.errorMessage = error.localizedDescription
                // AnalyticsService.shared.capture("error", properties: ["source": "chat", "message": error.localizedDescription])
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
    
    func dismissUpgradePrompt() {
        quotaManager.dismissUpgradePrompt()
    }
    
    /// Process any pending message from context
    func handlePendingMessage(isPremium: Bool, hasReferralPremium: Bool = false, userId: String? = nil) {
        if let pending = context.pendingMessage {
            context.pendingMessage = nil
            sendMessage(pending, isPremium: isPremium, hasReferralPremium: hasReferralPremium, userId: userId)
        }
    }
}
