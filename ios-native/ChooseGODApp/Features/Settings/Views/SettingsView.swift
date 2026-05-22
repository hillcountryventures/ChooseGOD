import SwiftUI

/// Settings screen — proper sections with working entries.
/// Replaces the previous stub. Subscription section drives the graceful
/// cancellation flow (Decision #17). Tradition is editable here so users can
/// change their pick without re-onboarding.
struct SettingsView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var showCancellationFlow = false
    @State private var showPaywall = false
    @State private var showTraditionPicker = false
    @State private var showIntentionEditor = false
    @State private var showOfflineBible = false
    @State private var showConsent = false
    @State private var showPrivacyCenter = false
    @State private var showPastorDashboard = false
    @State private var weeklyDigestEnabled: Bool = true

    private var isPremium: Bool {
        appState.currentUser?.isPremium ?? false
    }

    var body: some View {
        NavigationStack {
            List {
                accountSection
                subscriptionSection
                preferencesSection
                privacySection
                if FeatureFlags.pastorPartnership {
                    pastorSection
                }
                aboutSection
                signOutSection
            }
            .scrollContentBackground(.hidden)
            .background(Theme.Colors.background)
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .fullScreenCover(isPresented: $showCancellationFlow) {
                CancellationFlowView()
                    .environment(appState)
            }
            .task { await loadDigestPref() }
            .fullScreenCover(isPresented: $showPaywall) {
                PaywallView()
                    .environment(appState)
            }
            .sheet(isPresented: $showTraditionPicker) {
                NavigationStack {
                    TraditionEditorSheet()
                        .environment(appState)
                }
            }
            .sheet(isPresented: $showIntentionEditor) {
                NavigationStack {
                    IntentionEditorSheet()
                        .environment(appState)
                }
            }
            .sheet(isPresented: $showOfflineBible) {
                OfflineBibleView()
                    .environment(appState)
            }
            .sheet(isPresented: $showConsent) {
                ConsentManagementView()
                    .environment(appState)
            }
            .sheet(isPresented: $showPrivacyCenter) {
                PrivacyCenterView()
                    .environment(appState)
            }
            .sheet(isPresented: $showPastorDashboard) {
                ChurchPartnershipDashboardView()
                    .environment(appState)
            }
        }
    }

    // MARK: - Sections

    private var accountSection: some View {
        Section("Account") {
            if let user = appState.currentUser {
                LabeledRow(label: "Name", value: user.displayName)
                LabeledRow(label: "Email", value: user.email)
            } else {
                Text("Not signed in")
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
    }

    private var subscriptionSection: some View {
        Section("Subscription") {
            HStack {
                Text("Plan")
                Spacer()
                Text(isPremium ? "ChooseGOD Pro" : "Free")
                    .foregroundStyle(isPremium ? Theme.Colors.primary : Theme.Colors.secondaryText)
                    .bold()
            }

            if isPremium {
                Button(role: .destructive) {
                    showCancellationFlow = true
                } label: {
                    Label("Manage or cancel subscription", systemImage: "xmark.circle")
                }
            } else {
                Button {
                    showPaywall = true
                } label: {
                    Label("Upgrade to Pro", systemImage: "crown.fill")
                        .foregroundStyle(Theme.Colors.primary)
                }
            }
        }
    }

    private var preferencesSection: some View {
        Section("Preferences") {
            if FeatureFlags.sundayDigest {
                Toggle(isOn: $weeklyDigestEnabled) {
                    Label {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Sunday Digest email")
                                .foregroundStyle(Theme.Colors.text)
                            Text("Weekly summary of your walk — sent Sunday morning")
                                .font(.caption2)
                                .foregroundStyle(Theme.Colors.secondaryText)
                        }
                    } icon: {
                        Image(systemName: "envelope.fill")
                    }
                }
                .onChange(of: weeklyDigestEnabled) { _, newValue in
                    Task { await persistDigestPref(enabled: newValue) }
                }
            }

            Button {
                showTraditionPicker = true
            } label: {
                HStack {
                    Label("Tradition", systemImage: "person.crop.circle")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Text(UserPreferencesService.shared.tradition.pickerLabel)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }

            Button {
                showIntentionEditor = true
            } label: {
                HStack {
                    Label("What you're praying through", systemImage: "hands.sparkles")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }

            Button {
                showOfflineBible = true
            } label: {
                HStack {
                    Label("Offline Bible", systemImage: "arrow.down.circle")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
        }
    }

    private var privacySection: some View {
        Section("Privacy") {
            Button {
                showPrivacyCenter = true
            } label: {
                HStack {
                    Label("Privacy Center", systemImage: "lock.shield.fill")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }

            Button {
                showConsent = true
            } label: {
                Label("Consent & data sharing", systemImage: "hand.raised.fill")
                    .foregroundStyle(Theme.Colors.text)
            }
        }
    }

    private var pastorSection: some View {
        Section("For pastors") {
            Button {
                showPastorDashboard = true
            } label: {
                HStack {
                    Label("Church partnership", systemImage: "building.columns")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
        }
    }

    private var aboutSection: some View {
        Section("About") {
            LabeledRow(label: "Version", value: appVersion)
            Link(destination: URL(string: "https://choosegod.app/privacy")!) {
                Label("Privacy Policy", systemImage: "lock.shield")
                    .foregroundStyle(Theme.Colors.text)
            }
            Link(destination: URL(string: "https://choosegod.app/terms")!) {
                Label("Terms of Service", systemImage: "doc.text")
                    .foregroundStyle(Theme.Colors.text)
            }
        }
    }

    private var signOutSection: some View {
        Section {
            Button(role: .destructive) {
                Task { await appState.signOut() }
            } label: {
                Label("Sign Out", systemImage: "arrow.right.square")
            }
        }
    }

    private var appVersion: String {
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "0"
        return "\(v) (\(b))"
    }

    // MARK: - Digest pref

    @MainActor
    private func loadDigestPref() async {
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }
        struct Row: Decodable { let weekly_digest_enabled: Bool? }
        if let row: Row = try? await supabase
            .from("user_profiles")
            .select("weekly_digest_enabled")
            .eq("id", value: userId)
            .single()
            .execute()
            .value {
            weeklyDigestEnabled = row.weekly_digest_enabled ?? true
        }
    }

    @MainActor
    private func persistDigestPref(enabled: Bool) async {
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }
        _ = try? await supabase
            .from("user_profiles")
            .update(["weekly_digest_enabled": enabled])
            .eq("id", value: userId)
            .execute()
    }
}

private struct LabeledRow: View {
    let label: String
    let value: String
    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
    }
}

// MARK: - Tradition editor

private struct TraditionEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var current: Tradition = UserPreferencesService.shared.tradition
    @State private var isSaving = false

    var body: some View {
        List {
            Section("Tradition") {
                ForEach(Tradition.allCases, id: \.self) { tradition in
                    Button {
                        current = tradition
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(tradition.pickerLabel)
                                    .foregroundStyle(Theme.Colors.text)
                                Text(tradition.pickerSubtitle)
                                    .font(.caption)
                                    .foregroundStyle(Theme.Colors.secondaryText)
                            }
                            Spacer()
                            if current == tradition {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(Theme.Colors.primary)
                            }
                        }
                    }
                }
            }

            Section {
                Text("This shapes how the AI talks with you, what scripture surfaces first, and how reflections are framed.")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
        .navigationTitle("Tradition")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Save") {
                    Task { await save() }
                }
                .disabled(isSaving)
            }
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }
        guard let userId = appState.currentUser?.id else { return }
        try? await UserPreferencesService.shared.setTradition(current, userId: userId)
        dismiss()
    }
}

// MARK: - Intention editor

private struct IntentionEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var content: String = UserIntentionsService.shared.current?.content ?? ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("What's on your heart right now?")
                    .font(.title2)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
                Text("One sentence. The companion uses this to ground every conversation in your walk — not a generic answer.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)

                TextEditor(text: $content)
                    .font(.body)
                    .scrollContentBackground(.hidden)
                    .frame(minHeight: 160)
                    .padding(12)
                    .background(Theme.Colors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                if let setAt = UserIntentionsService.shared.current?.setAt {
                    Text("Set \(setAt.formatted(date: .abbreviated, time: .omitted)). Auto-expires after 30 days unless you update it.")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
            .padding(20)
        }
        .navigationTitle("Praying through")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button { Task { await save() } } label: {
                    if isSaving { ProgressView() } else { Text("Save").bold() }
                }
                .disabled(content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSaving)
            }
        }
        .alert("Couldn't save", isPresented: .constant(errorMessage != nil)) {
            Button("OK") { errorMessage = nil }
        } message: { Text(errorMessage ?? "") }
    }

    @MainActor
    private func save() async {
        isSaving = true
        defer { isSaving = false }
        let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        do {
            _ = try await UserIntentionsService.shared.setIntention(trimmed, source: "settings")
            UserContextService.shared.invalidate()
            dismiss()
        } catch {
            errorMessage = "Couldn't save your intention. Try again."
        }
    }
}

#Preview {
    SettingsView()
        .environment(AppState.preview)
}
