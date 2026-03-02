import SwiftUI

/// AI Chat companion view — wired to Supabase Edge Function "companion"
struct ChatView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    
    @State private var viewModel = ChatViewModel()
    @FocusState private var isInputFocused: Bool
    @State private var voiceService = VoiceInputService()
    @State private var showPaywall = false
    
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
                    
                    // Chat quota indicator (free users)
                    if !isEffectivelyPremium {
                        quotaIndicator
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
                
                // Upgrade prompt overlay
                if viewModel.showUpgradePrompt {
                    upgradePromptOverlay
                }
            }
            .screenBackground()
            .navigationTitle(AppStrings.Chat.navTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(AppStrings.Chat.close) { dismiss() }
                        .accessibilityLabel(AppStrings.Chat.close)
                        .accessibilityHint(AppStrings.Chat.closeChatHint)
                }
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button(role: .destructive) {
                            viewModel.clearConversation()
                        } label: {
                            Label(AppStrings.Chat.clearChat, systemImage: "trash")
                                .accessibilityLabel(AppStrings.Chat.clearChat)
                                .accessibilityHint(AppStrings.Chat.clearChatHint)
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
                // Load chat quota from server
                if let userId = userId {
                    Task {
                        try? await ChatQuotaManager.shared.loadCount(userId: userId)
                    }
                }
                if let prompt = initialPrompt {
                    viewModel.sendMessage(prompt, isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                } else {
                    viewModel.handlePendingMessage(isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("chat") }
        .fullScreenCover(isPresented: $showPaywall) {
            PaywallView()
        }
    }
    
    private var isPremium: Bool {
        appState.currentUser?.isPremium ?? false
    }

    private var isEffectivelyPremium: Bool {
        (appState.currentUser?.isPremium ?? false) || ReferralService.shared.hasReferralPremium
    }

    private var userId: String? {
        appState.currentUser?.id
    }
    
    // MARK: - Quota Indicator
    
    private var quotaIndicator: some View {
        HStack(spacing: 6) {
            ForEach(0..<ChatQuotaManager.lifetimeFreeLimit, id: \.self) { index in
                Image(systemName: index < viewModel.chatsRemaining ? "bubble.left.fill" : "bubble.left")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(index < viewModel.chatsRemaining ? Theme.Colors.primary : Theme.Colors.secondaryText.opacity(0.4))
            }
            Text(AppStrings.Chat.chatsRemaining(viewModel.chatsRemaining))
                .font(Theme.Typography.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(.vertical, 6)
        .frame(maxWidth: .infinity)
        .background(Theme.Colors.surface.opacity(0.5))
    }
    
    // MARK: - Upgrade Prompt
    
    private var upgradePromptOverlay: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture { viewModel.dismissUpgradePrompt() }
            
            VStack(spacing: 20) {
                Image(systemName: "crown.fill")
                    .font(Theme.Typography.iconXXL)
                    .foregroundStyle(Theme.Colors.primary)
                
                Text(AppStrings.Chat.quotaExhaustedTitle)
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
                
                Text(AppStrings.Chat.quotaExhaustedBody)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                
                Button {
                    viewModel.dismissUpgradePrompt()
                    showPaywall = true
                } label: {
                    Text(AppStrings.Chat.unlockUnlimited)
                        .primaryButtonStyle()
                }
                .accessibilityLabel(AppStrings.Chat.unlockUnlimited)
                .accessibilityHint(AppStrings.Chat.unlockHint)
                
                Button(AppStrings.Chat.maybeLater) {
                    viewModel.dismissUpgradePrompt()
                }
                .secondaryButtonStyle()
                .foregroundStyle(Theme.Colors.secondaryText)
            }
            .padding(Theme.Spacing.xl)
            .background(Theme.Colors.background)
            .cornerRadius(Theme.CornerRadius.xl)
            .padding(Theme.Spacing.xl)
        }
    }
    
    // MARK: - Welcome Message
    
    private var welcomeMessage: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(Theme.Typography.iconLarge)
                .foregroundStyle(Theme.Colors.primary)
            
            Text(AppStrings.Chat.welcomeTitle)
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            Text(AppStrings.Chat.welcomeBody)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
            
            if let ctx = verseContext {
                HStack(spacing: 8) {
                    Image(systemName: "book.closed")
                    Text(AppStrings.Chat.readingContext(ctx.reference))
                }
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.primary)
                .padding(.horizontal, Theme.Spacing.mds)
                .padding(.vertical, 6)
                .background(Theme.Colors.primary.opacity(0.1))
                .cornerRadius(Theme.CornerRadius.lg)
            }
        }
        .padding(Theme.Spacing.xl)
    }
    
    // MARK: - Suggested Actions
    
    private var suggestedActionsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(viewModel.suggestedActions) { action in
                    QuickPromptChip(text: action.label) {
                        viewModel.sendMessage(action.prompt, isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
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
                QuickPromptChip(text: AppStrings.Chat.promptAnxiety) {
                    viewModel.sendMessage(AppStrings.Chat.promptAnxiety, isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                }

                QuickPromptChip(text: AppStrings.Chat.promptJohn316) {
                    viewModel.sendMessage(AppStrings.Chat.promptJohn316, isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                }

                QuickPromptChip(text: AppStrings.Chat.promptEncouragement) {
                    viewModel.sendMessage(AppStrings.Chat.promptEncouragement, isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                }

                QuickPromptChip(text: AppStrings.Chat.promptSermon) {
                    viewModel.sendMessage(AppStrings.Chat.promptSermonFull, isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, Theme.Spacing.sm)
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
                
                TextField(AppStrings.Chat.inputPlaceholder, text: $viewModel.inputText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .inputFieldStyle()
                    .focused($isInputFocused)
                    .lineLimit(1...5)

                    .accessibilityLabel(AppStrings.Chat.inputPlaceholder)
                    .accessibilityHint(AppStrings.Chat.messageInputHint)
                    .onSubmit {
                        viewModel.sendMessage(isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                    }

                Button {
                    viewModel.sendMessage(isPremium: isPremium, hasReferralPremium: ReferralService.shared.hasReferralPremium, userId: userId)
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(Theme.Typography.display)
                        .foregroundStyle(viewModel.inputText.isEmpty ? Theme.Colors.secondaryText : Theme.Colors.primary)
                }
                .disabled(viewModel.inputText.isEmpty || viewModel.isLoading)
                .accessibilityLabel(AppStrings.Chat.sendMessage)
                .accessibilityHint(AppStrings.Chat.sendMessageHint)
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
                Text(try! AttributedString(markdown: message.content))
                    .font(Theme.Typography.body)
                    .foregroundStyle(message.role == .user ? .white : Theme.Colors.text)
                    .padding(Theme.Spacing.mds)
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
                .padding(.horizontal, Theme.Spacing.mds)
                .padding(.vertical, Theme.Spacing.sm)
                .background(Theme.Colors.primary.opacity(0.1))
                .cornerRadius(Theme.CornerRadius.xl)
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
            .padding(Theme.Spacing.mds)
            .background(Theme.Colors.surface)
            .cornerRadius(Theme.CornerRadius.xl)
            
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
