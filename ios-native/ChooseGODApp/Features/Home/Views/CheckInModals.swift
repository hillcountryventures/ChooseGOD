import SwiftUI
import Supabase

/// Decision #17 Pro delight — periodic check-ins that reshape AI tone +
/// notification cadence based on user's life state.
///
/// Two complementary modals:
///   * `LifeEventsCheckInView` — every 60 days, "How's your life?"
///       (thriving / struggling / big change / same). Reshapes notification
///       tone + devotional recs for next 60 days.
///   * `SixMonthCovenantCheckInView` — at Day 180, "Is this still serving you?"
///       (still loving / want more / thinking of canceling / sharing feedback).
///       Routes to upgrade, feedback, or cancellation flow accordingly.

// MARK: - Life events check-in

struct LifeEventsCheckInView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    enum LifeState: String, CaseIterable, Identifiable {
        case thriving, struggling, big_change, same
        var id: String { rawValue }

        var label: String {
            switch self {
            case .thriving:    return "Thriving"
            case .struggling:  return "Struggling"
            case .big_change:  return "Big change happening"
            case .same:        return "Same as last time"
            }
        }
        var icon: String {
            switch self {
            case .thriving:    return "sun.max.fill"
            case .struggling:  return "cloud.rain.fill"
            case .big_change:  return "arrow.triangle.branch"
            case .same:        return "circle.dotted"
            }
        }
        var color: Color {
            switch self {
            case .thriving:    return .yellow
            case .struggling:  return .blue
            case .big_change:  return .purple
            case .same:        return .gray
            }
        }
    }

    @State private var selectedState: LifeState?
    @State private var contextNote: String = ""
    @State private var isSaving: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        header
                        stateGrid
                        if selectedState != nil { contextField }
                        ctaButton
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Quick check-in")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Skip") {
                        Task { await skip() }
                    }
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("How are you, really?")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("It's been a couple of months. Where are you? Your answer reshapes the rhythm of your reflections for the next 60 days.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var stateGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
            ForEach(LifeState.allCases) { state in
                Button {
                    withAnimation { selectedState = state }
                } label: {
                    VStack(spacing: 8) {
                        Image(systemName: state.icon)
                            .font(.title2)
                            .foregroundStyle(state.color)
                        Text(state.label)
                            .font(.subheadline)
                            .bold()
                            .foregroundStyle(Theme.Colors.text)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(selectedState == state ? state.color.opacity(0.15) : Theme.Colors.surface)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(
                                selectedState == state ? state.color : Color.clear,
                                lineWidth: 2
                            )
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var contextField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Want to add context? (optional)")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
            TextField("Whatever you want to share\u{2026}", text: $contextNote, axis: .vertical)
                .font(.body)
                .lineLimit(2...4)
                .padding(12)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .transition(.opacity)
    }

    private var ctaButton: some View {
        Button {
            Task { await save() }
        } label: {
            if isSaving {
                ProgressView().tint(.white)
            } else {
                Text("Save")
                    .font(.headline)
            }
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(selectedState == nil ? Theme.Colors.primary.opacity(0.4) : Theme.Colors.primary)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .disabled(selectedState == nil || isSaving)
    }

    @MainActor
    private func save() async {
        guard let state = selectedState, let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }
        isSaving = true
        defer { isSaving = false }

        struct Insert: Encodable {
            let user_id: String
            let state: String
            let context_note: String?
        }

        _ = try? await supabase
            .from("life_events")
            .insert(Insert(
                user_id: userId,
                state: state.rawValue,
                context_note: contextNote.isEmpty ? nil : contextNote
            ))
            .execute()

        UserDefaults.standard.set(Date(), forKey: "lastLifeEventCheckIn")
        UserContextService.shared.invalidate()
        AnalyticsService.shared.capture("life_event_logged", properties: ["state": state.rawValue])
        dismiss()
    }

    @MainActor
    private func skip() async {
        // Mark a soft-skip so we don't re-prompt for ~14 days.
        UserDefaults.standard.set(Date(), forKey: "lastLifeEventCheckIn")
        dismiss()
    }
}

// MARK: - 6-month covenant check-in

struct SixMonthCovenantCheckInView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    enum Response: String, CaseIterable, Identifiable {
        case stillLoving        = "still_loving"
        case wantMore           = "want_more"
        case thinkingOfCanceling = "thinking_of_canceling"
        case sharingFeedback    = "sharing_feedback"
        var id: String { rawValue }

        var label: String {
            switch self {
            case .stillLoving:         return "Still loving it"
            case .wantMore:            return "I want more"
            case .thinkingOfCanceling: return "Thinking of stepping away"
            case .sharingFeedback:     return "Just sharing feedback"
            }
        }
        var icon: String {
            switch self {
            case .stillLoving:         return "heart.fill"
            case .wantMore:            return "sparkles"
            case .thinkingOfCanceling: return "leaf.fill"
            case .sharingFeedback:     return "bubble.left.fill"
            }
        }
    }

    @State private var selected: Response?
    @State private var feedback: String = ""
    @State private var isSaving: Bool = false
    @State private var showCancellation: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        header
                        responseList
                        if selected == .sharingFeedback || selected == .wantMore {
                            feedbackField
                        }
                        ctaButton
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Six months in")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Later") { dismiss() }
                }
            }
            .fullScreenCover(isPresented: $showCancellation) {
                CancellationFlowView()
                    .environment(appState)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("How's it serving you?")
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("It's been six months with ChooseGOD. We want to know honestly. No script, no pressure.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var responseList: some View {
        VStack(spacing: 10) {
            ForEach(Response.allCases) { response in
                Button {
                    withAnimation { selected = response }
                } label: {
                    HStack {
                        Image(systemName: response.icon)
                            .foregroundStyle(Theme.Colors.primary)
                        Text(response.label)
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.text)
                        Spacer()
                        if selected == response {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(Theme.Colors.primary)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Theme.Colors.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(selected == response ? Theme.Colors.primary : Color.clear, lineWidth: 2)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var feedbackField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("What's on your mind?")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
            TextField("Tell us anything\u{2026}", text: $feedback, axis: .vertical)
                .font(.body)
                .lineLimit(3...6)
                .padding(12)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .transition(.opacity)
    }

    private var ctaButton: some View {
        Button {
            Task { await save() }
        } label: {
            if isSaving {
                ProgressView().tint(.white)
            } else {
                Text(selected == .thinkingOfCanceling ? "Continue" : "Save")
                    .font(.headline)
            }
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(selected == nil ? Theme.Colors.primary.opacity(0.4) : Theme.Colors.primary)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .disabled(selected == nil || isSaving)
    }

    @MainActor
    private func save() async {
        guard let response = selected, let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }
        isSaving = true
        defer { isSaving = false }

        struct Insert: Encodable {
            let user_id: String
            let kind: String
            let response: String
            let feedback_text: String?
        }

        _ = try? await supabase
            .from("check_ins")
            .insert(Insert(
                user_id: userId,
                kind: "six_month",
                response: response.rawValue,
                feedback_text: feedback.isEmpty ? nil : feedback
            ))
            .execute()

        UserDefaults.standard.set(Date(), forKey: "lastSixMonthCheckIn")
        AnalyticsService.shared.capture(
            "six_month_check_in",
            properties: ["response": response.rawValue]
        )

        if response == .thinkingOfCanceling {
            showCancellation = true
            return
        }
        dismiss()
    }
}

// MARK: - Convenience triggers

enum CheckInTrigger {
    /// Should we show the 60-day life events check-in?
    static func shouldShowLifeEvents(installDate: Date?) -> Bool {
        let last = UserDefaults.standard.object(forKey: "lastLifeEventCheckIn") as? Date
        let cadence: TimeInterval = 60 * 24 * 60 * 60   // 60 days
        let softSkipDelay: TimeInterval = 14 * 24 * 60 * 60  // skip = re-prompt in 14d

        if let last {
            return Date().timeIntervalSince(last) >= softSkipDelay
                && Date().timeIntervalSince(last) >= cadence
        }
        // First check-in: only after the user has been active for at least 60 days.
        if let installDate {
            return Date().timeIntervalSince(installDate) >= cadence
        }
        return false
    }

    /// Should we show the 6-month covenant check-in?
    static func shouldShowSixMonth(installDate: Date?) -> Bool {
        guard UserDefaults.standard.object(forKey: "lastSixMonthCheckIn") == nil,
              let installDate else { return false }
        let sixMonths: TimeInterval = 180 * 24 * 60 * 60
        return Date().timeIntervalSince(installDate) >= sixMonths
    }
}

#Preview {
    LifeEventsCheckInView()
        .environment(AppState.preview)
}
