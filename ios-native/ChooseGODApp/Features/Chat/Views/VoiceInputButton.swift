import os
import SwiftUI

/// Animated microphone button with waveform visualization
struct VoiceInputButton: View {
    @ObservedObject var voiceService: VoiceInputService
    var onTranscript: (String) -> Void
    
    @State private var pulseScale: CGFloat = 1.0
    @State private var waveAmplitudes: [CGFloat] = Array(repeating: 0.1, count: 5)
    
    var body: some View {
        Button {
            toggleListening()
        } label: {
            ZStack {
                // Pulse ring when listening
                if voiceService.isListening {
                    Circle()
                        .fill(Theme.Colors.primary.opacity(0.15))
                        .frame(width: 56, height: 56)
                        .scaleEffect(pulseScale)
                    
                    // Waveform bars
                    waveformBars
                }
                
                // Main button
                Circle()
                    .fill(voiceService.isListening ?
                          Theme.Colors.error :
                          Theme.Colors.primary.opacity(0.2))
                    .frame(width: 40, height: 40)
                    .overlay {
                        Image(systemName: voiceService.isListening ? "stop.fill" : "mic.fill")
                            .font(Theme.Typography.button)
                            .foregroundColor(voiceService.isListening ? .white : Theme.Colors.primary)
                    }
            }
            .frame(width: 56, height: 56)
        }
        .onChange(of: voiceService.audioLevel) { _, level in
            updateWaveform(level: level)
        }
        .onChange(of: voiceService.isListening) { _, listening in
            if listening {
                startPulse()
            } else {
                pulseScale = 1.0
            }
        }
        .onChange(of: voiceService.transcript) { _, text in
            if !text.isEmpty {
                onTranscript(text)
            }
        }
    }
    
    // MARK: - Waveform
    
    private var waveformBars: some View {
        HStack(spacing: 2) {
            ForEach(0..<5, id: \.self) { i in
                RoundedRectangle(cornerRadius: 1.5)
                    .fill(Theme.Colors.primary)
                    .frame(width: 3, height: max(4, waveAmplitudes[i] * 20))
                    .animation(.easeInOut(duration: 0.1), value: waveAmplitudes[i])
            }
        }
        .offset(y: -32)
    }
    
    private func updateWaveform(level: Float) {
        withAnimation(.easeInOut(duration: 0.08)) {
            // Shift bars left and add new value
            for i in 0..<4 {
                waveAmplitudes[i] = waveAmplitudes[i + 1]
            }
            waveAmplitudes[4] = CGFloat(level)
        }
    }
    
    private func startPulse() {
        withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
            pulseScale = 1.3
        }
    }
    
    private func toggleListening() {
        if voiceService.isListening {
            voiceService.stopListening()
        } else {
            Task { await voiceService.startListening() }
        }
    }
}

// MARK: - Inline transcript overlay

struct VoiceTranscriptOverlay: View {
    @ObservedObject var voiceService: VoiceInputService
    
    var body: some View {
        if voiceService.isListening || !voiceService.interimTranscript.isEmpty {
            VStack(spacing: 8) {
                if voiceService.isListening {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(Theme.Colors.error)
                            .frame(width: 8, height: 8)
                        Text("Listening...")
                            .font(Theme.Typography.captionMedium)
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                }
                
                if !voiceService.interimTranscript.isEmpty {
                    Text(voiceService.interimTranscript)
                        .font(Theme.Typography.bodySmall)
                        .foregroundColor(Theme.Colors.text.opacity(0.7))
                        .italic()
                        .padding(.horizontal, Theme.Spacing.mds)
                        .padding(.vertical, 6)
                        .modifier(GlassCard(cornerRadius: Theme.CornerRadius.md, opacity: 0.5))
                }
                
                if let error = voiceService.error {
                    Text(error)
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.error)
                }
            }
            .padding(Theme.Spacing.sm)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }
}

#Preview {
    ZStack {
        Theme.Colors.background.ignoresSafeArea()
        VoiceInputButton(voiceService: VoiceInputService()) { text in
            AppLogger.general.debug("Voice input: \(text)")
        }
    }
}
