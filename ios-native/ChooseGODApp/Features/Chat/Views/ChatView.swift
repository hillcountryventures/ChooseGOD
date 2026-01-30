import SwiftUI

/// AI Chat companion view — wired to Supabase Edge Function "companion"
struct ChatView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var viewModel = ChatViewModel()
    @FocusState private var isInputFocused: Bool
    @State private var voiceService = VoiceInputService()
    
    // Initial context (optional)
    var initialPrompt: String?
    var verseContext: ChatBibleContext?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.clear // background via .screenBackground()
                
                VStack(spacing: 0) {
                    // Context bar (if context is set)
                    if viewModel.contextDescription != nil {
                        ChatContextBar(
                            context: viewModel.context,
                            currentMode: viewModel.currentMode,
                            onModeChange: { viewModel.setMode($0) }
                        )
                    }
                    
                    // Seed quota indicator (free users)
                    if !isPremium {
                        seedIndicator
                    }
                    
                    // Messages
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 16) {
                                if viewModel.messages.isEmpty {
                                    welcomeMessage
                                }
                                
                                ForEach(viewModel.messages) { message in
                                    VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 6) {
                                        MessageBubble(message: message)
                                        
                                        // Source verse pills
                                        if let sources = message.sources, !sources.isEmpty {
                                            SourceVersePills(sources: sources)
                                                .padding(.horizontal, 4)
                                        }
                                    }
                                    .id(message.id)
                                }
                                
                                if viewModel.isLoading {
                                    TypingIndicator()
                                        .id("typing")
                                }
                            }
                            .padding()
                        }
                        .onChange(of: viewModel.messages.count) { _, _ in
                            withAnimation {
                                proxy.scrollTo(viewModel.messages.last?.id ?? "typing", anchor: .bottom)
                            }
                        }
                    }
                    
                    // Suggested actions
                    if !viewModel.suggestedActions.isEmpty && !viewModel.isLoading {
                        suggestedActionsBar
                    }
                    
                    // Quick prompts (when empty)
                    if viewModel.messages.isEmpty {
                        quickPrompts
                    }
                    
                    // Input bar
                    inputBar
                }
                
                // Final seed interstitial overlay
                if viewModel.showFinalSeedInterstitial {
                    seedInterstitialOverlay
                }
            }
            .screenBackground()
            .navigationTitle("Ask the Bible")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                        .accessibilityLabel("Close chat")
                        .accessibilityHint("Double tap to close the chat")
                }
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button(role: .destructive) {
                            viewModel.clearConversation()
                        } label: {
                            Label("Clear Chat", systemImage: "trash")
                                .accessibilityLabel("Clear conversation")
                                .accessibilityHint("Double tap to delete all messages")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .onAppear {
                if let ctx = verseContext {
                    viewModel.setBibleContext(book: ctx.book, chapter: ctx.chapter, selectedVerse: ctx.selectedVerse)
                }
                if let prompt = initialPrompt {
                    viewModel.sendMessage(prompt, isPremium: isPremium)
                } else {
                    viewModel.handlePendingMessage(isPremium: isPremium)
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("chat") }
    }
    
    private var isPremium: Bool {
        appState.currentUser?.isPremium ?? false
    }
    
    // MARK: - Seed Indicator
    
    private var seedIndicator: some View {
        HStack(spacing: 6) {
            ForEach(0..<ChatQuotaManager.totalSeeds, id: \.self) { index in
                Image(systemName: index < viewModel.seedsRemaining ? "leaf.fill" : "leaf")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(index < viewModel.seedsRemaining ? Theme.Colors.primary : Theme.Colors.secondaryText.opacity(0.4))
            }
            Text("\(viewModel.seedsRemaining) seeds remaining")
                .font(Theme.Typography.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(.vertical, 6)
        .frame(maxWidth: .infinity)
        .background(Theme.Colors.surface.opacity(0.5))
    }
    
    // MARK: - Seed Interstitial
    
    private var seedInterstitialOverlay: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture { viewModel.dismissFinalSeedInterstitial() }
            
            VStack(spacing: 20) {
                Image(systemName: "leaf.circle.fill")
                    .font(Theme.Typography.iconXXL)
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("Seeds Planted for Today")
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("You've used all 3 daily seeds. Come back tomorrow for more, or upgrade to Premium for unlimited conversations.")
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                
                Button {
                    // TODO: Navigate to premium
                    viewModel.dismissFinalSeedInterstitial()
                } label: {
                    Text("Unlock Unlimited")
                        .primaryButtonStyle()
                }
                .accessibilityLabel("Unlock unlimited conversations")
                .accessibilityHint("Double tap to view premium options")
                
                Button("Maybe Later") {
                    viewModel.dismissFinalSeedInterstitial()
                }
                .accessibilityLabel("Dismiss")
                .secondaryButtonStyle()
                .foregroundStyle(Theme.Colors.secondaryText)
            }
            .padding(32)
            .background(Theme.Colors.background)
            .cornerRadius(24)
            .padding(32)
        }
    }
    
    // MARK: - Welcome Message
    
    private var welcomeMessage: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(Theme.Typography.iconLarge)
                .foregroundStyle(Theme.Colors.primary)
            
            Text("Hi! I'm your Bible companion")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            Text("Ask me anything about Scripture, faith, or life. I'll help you find wisdom in God's Word.")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
            
            if let ctx = verseContext {
                HStack(spacing: 8) {
                    Image(systemName: "book.closed")
                    Text("Reading: \(ctx.reference)")
                }
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Theme.Colors.primary.opacity(0.1))
                .cornerRadius(12)
            }
        }
        .padding(32)
    }
    
    // MARK: - Suggested Actions
    
    private var suggestedActionsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(viewModel.suggestedActions) { action in
                    QuickPromptChip(text: action.label) {
                        viewModel.sendMessage(action.prompt, isPremium: isPremium)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 4)
        }
    }
    
    // MARK: - Quick Prompts
    
    private var quickPrompts: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                QuickPromptChip(text: "What does the Bible say about anxiety?") {
                    viewModel.sendMessage("What does the Bible say about anxiety?", isPremium: isPremium)
                }
                
                QuickPromptChip(text: "Help me understand John 3:16") {
                    viewModel.sendMessage("Help me understand John 3:16", isPremium: isPremium)
                }
                
                QuickPromptChip(text: "I need encouragement today") {
                    viewModel.sendMessage("I need encouragement today", isPremium: isPremium)
                }
                
                QuickPromptChip(text: "Explain the Sermon on the Mount") {
                    viewModel.sendMessage("Can you explain the Sermon on the Mount?", isPremium: isPremium)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
    }
    
    // MARK: - Input Bar
    
    private var inputBar: some View {
        VStack(spacing: 0) {
            // Voice transcript overlay
            VoiceTranscriptOverlay(voiceService: voiceService)
            
            HStack(spacing: 12) {
                // Voice input button
                VoiceInputButton(voiceService: voiceService) { transcript in
                    viewModel.inputText += transcript
                }
                .frame(width: 44, height: 44)
                
                TextField("Ask anything...", text: $viewModel.inputText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .inputFieldStyle()
                    .focused($isInputFocused)
                    .lineLimit(1...5)
                    
                    .accessibilityLabel("Message input")
                    .accessibilityHint("Type your message here")
                    .onSubmit {
                        viewModel.sendMessage(isPremium: isPremium)
                    }
                
                Button {
                    viewModel.sendMessage(isPremium: isPremium)
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(Theme.Typography.display)
                        .foregroundStyle(viewModel.inputText.isEmpty ? Theme.Colors.secondaryText : Theme.Colors.primary)
                }
                .disabled(viewModel.inputText.isEmpty || viewModel.isLoading)
                .accessibilityLabel("Send message")
                .accessibilityHint("Double tap to send your message")
            }
            .padding()
        }
        .background(Theme.Colors.background)
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: ChatMessage
    
    var body: some View {
        HStack {
            if message.role == .user { Spacer(minLength: 60) }
            
            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                Text((try? AttributedString(markdown: message.content)) ?? AttributedString(message.content))
                    .font(Theme.Typography.body)
                    .foregroundStyle(message.role == .user ? .white : Theme.Colors.text)
                    .padding(12)
                    .background(message.role == .user ? Theme.Colors.primary : Theme.Colors.surface)
                    .cornerRadius(16, corners: message.role == .user ? [.topLeft, .topRight, .bottomLeft] : [.topLeft, .topRight, .bottomRight])
                
                Text(message.timestamp, style: .time)
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("\(message.role == .user ? "You" : "Bible companion"): \(message.content)")
            
            if message.role == .assistant { Spacer(minLength: 60) }
        }
    }
}

// MARK: - Quick Prompt Chip

struct QuickPromptChip: View {
    let text: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(text)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Theme.Colors.primary.opacity(0.1))
                .cornerRadius(16)
        }
        .accessibilityLabel(text)
        .accessibilityHint("Double tap to ask this question")
    }
}

// MARK: - Typing Indicator

struct TypingIndicator: View {
    @State private var phase = 0
    
    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { index in
                    Circle()
                        .fill(Theme.Colors.secondaryText)
                        .frame(width: 8, height: 8)
                        .opacity(phase == index ? 1 : 0.4)
                }
            }
            .padding(12)
            .background(Theme.Colors.surface)
            .cornerRadius(16)
            
            Spacer()
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 0.6).repeatForever()) {
                phase = (phase + 1) % 3
            }
        }
    }
}

// MARK: - Corner Radius Extension

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    ChatView()
        .environment(AppState.preview)
}
