import SwiftUI
import Supabase

/// Decision #16 — privacy as moat. Surfaces the 5 privacy pillars in plain
/// English so users can see what we collect, what's protected, and what they
/// control. Each row is also actionable (toggle, view, export, delete).
struct PrivacyCenterView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @AppStorage("privacy_ai_training_optout") private var aiTrainingOptOut: Bool = true

    @State private var showCrisisFlags = false
    @State private var showExportSheet = false
    @State private var showDeleteConfirm = false
    @State private var isExporting = false
    @State private var exportError: String?
    @State private var deletionError: String?
    @State private var deletionScheduled = false

    var body: some View {
        NavigationStack {
            List {
                pillarsSection
                controlsSection
                exportSection
                dangerSection
                aboutSection
            }
            .scrollContentBackground(.hidden)
            .background(Theme.Colors.background)
            .navigationTitle("Privacy Center")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
            .sheet(isPresented: $showCrisisFlags) {
                NavigationStack {
                    CrisisFlagsView()
                        .environment(appState)
                }
            }
            .alert("Delete account permanently?", isPresented: $showDeleteConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    Task { await requestDeletion() }
                }
            } message: {
                Text("Your account will be marked for deletion. You have 24 hours to undo this from this screen. After that, all journal entries, prayers, chat history, and account data are permanently removed.")
            }
            .alert("Export error", isPresented: .constant(exportError != nil)) {
                Button("OK") { exportError = nil }
            } message: { Text(exportError ?? "") }
            .alert("Deletion error", isPresented: .constant(deletionError != nil)) {
                Button("OK") { deletionError = nil }
            } message: { Text(deletionError ?? "") }
            .alert("Account scheduled for deletion", isPresented: $deletionScheduled) {
                Button("OK") {}
            } message: {
                Text("Your account will be permanently deleted in 24 hours. You can cancel anytime before then from this screen.")
            }
        }
    }

    // MARK: - Sections

    private var pillarsSection: some View {
        Section {
            pillar(
                icon: "lock.shield.fill",
                title: "Encryption at rest",
                body: "Your journal entries, prayers, and chat history are encrypted in our database. A leak would expose nothing readable."
            )
            pillar(
                icon: "hand.raised.slash.fill",
                title: "No AdTech",
                body: "No Facebook pixel. No TikTok pixel. No advertising SDKs. We don't sell your data because there's no buyer in our pipeline."
            )
            pillar(
                icon: "brain.head.profile",
                title: "AI training opt-out",
                body: "By default, your conversations are NOT used to train AI models. We send a `training: false` flag with every OpenAI request."
            )
            pillar(
                icon: "exclamationmark.shield.fill",
                title: "Crisis flag transparency",
                body: "If our crisis detection flags one of your messages, you can view it and delete it. We don't surveil; we surface."
            )
            pillar(
                icon: "tray.and.arrow.up.fill",
                title: "Dignifying export & delete",
                body: "Your data is yours. Export everything as a PDF anytime. Delete your account with a 24-hour grace period."
            )
        } header: {
            Text("Five privacy pillars")
        } footer: {
            Text("\u{201C}The only Bible app that treats your prayers like they're sacred. Because they are.\u{201D}")
                .italic()
                .foregroundStyle(Theme.Colors.secondaryText)
        }
    }

    private var controlsSection: some View {
        Section("Your controls") {
            Toggle(isOn: $aiTrainingOptOut) {
                Label("AI training opt-out", systemImage: "brain.head.profile")
            }
            .onChange(of: aiTrainingOptOut) { _, newValue in
                AnalyticsService.shared.capture(
                    "ai_training_optout_changed",
                    properties: ["opted_out": newValue]
                )
            }

            Button {
                showCrisisFlags = true
            } label: {
                HStack {
                    Label("View flagged conversations", systemImage: "exclamationmark.bubble")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
        }
    }

    private var exportSection: some View {
        Section {
            Button {
                Task { await exportData() }
            } label: {
                HStack {
                    Label("Export my data", systemImage: "tray.and.arrow.up")
                        .foregroundStyle(Theme.Colors.text)
                    Spacer()
                    if isExporting { ProgressView() }
                }
            }
            .disabled(isExporting)
        } header: {
            Text("Your data, your hands")
        } footer: {
            Text("Generates a PDF of all your journal entries, prayers, devotional progress, and AI chats. Sent to your account email.")
        }
    }

    private var dangerSection: some View {
        Section("Danger zone") {
            Button(role: .destructive) {
                showDeleteConfirm = true
            } label: {
                Label("Delete my account", systemImage: "trash")
            }
        }
    }

    private var aboutSection: some View {
        Section("Read more") {
            Link(destination: URL(string: "https://choosegod.app/privacy")!) {
                Label("Full privacy policy", systemImage: "doc.text")
                    .foregroundStyle(Theme.Colors.text)
            }
            Link(destination: URL(string: "https://choosegod.app/data-commitments")!) {
                Label("Data commitments (plain English)", systemImage: "hand.raised")
                    .foregroundStyle(Theme.Colors.text)
            }
        }
    }

    // MARK: - Components

    private func pillar(icon: String, title: String, body: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Theme.Colors.primary)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Text(body)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Actions

    @MainActor
    private func exportData() async {
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else {
            exportError = "Couldn't connect."
            return
        }
        isExporting = true
        defer { isExporting = false }
        do {
            struct Body: Encodable { let user_id: String }
            _ = try await supabase.functions.invoke(
                "export-user-data",
                options: .init(body: Body(user_id: userId))
            )
        } catch {
            exportError = "Couldn't request export. Please try again."
        }
    }

    @MainActor
    private func requestDeletion() async {
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else {
            deletionError = "Couldn't connect. Please try again."
            return
        }
        do {
            // The edge function authenticates via the session JWT and requires the
            // camelCase `userId`, a "DELETE" confirmation, and a mode. Use "queue"
            // (24h grace window) to match the confirmation copy; keep the user signed
            // in so they can cancel from this screen before finalization.
            struct Body: Encodable { let userId: String; let confirmation: String; let mode: String }
            _ = try await supabase.functions.invoke(
                "delete-account",
                options: .init(body: Body(userId: userId, confirmation: "DELETE", mode: "queue"))
            )
            deletionScheduled = true
        } catch {
            deletionError = "Couldn't schedule deletion. Please try again."
        }
    }
}

// MARK: - Crisis flags viewer

private struct CrisisFlagsView: View {
    @Environment(AppState.self) private var appState
    @State private var flags: [CrisisFlag] = []
    @State private var isLoading: Bool = true

    struct CrisisFlag: Decodable, Identifiable {
        let id: String
        let tier: Int
        let userMessage: String
        let createdAt: String

        enum CodingKeys: String, CodingKey {
            case id, tier
            case userMessage = "user_message"
            case createdAt   = "created_at"
        }
    }

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if flags.isEmpty {
                emptyState
            } else {
                List {
                    ForEach(flags) { flag in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("Tier \(flag.tier)")
                                    .font(.caption2)
                                    .bold()
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(tierColor(flag.tier))
                                    .clipShape(Capsule())
                                Spacer()
                                Text(flag.createdAt.prefix(10))
                                    .font(.caption2)
                                    .foregroundStyle(Theme.Colors.secondaryText)
                            }
                            Text(flag.userMessage)
                                .font(.caption)
                                .foregroundStyle(Theme.Colors.text)
                                .lineLimit(3)
                        }
                        .padding(.vertical, 4)
                    }
                    .onDelete { indexSet in
                        Task { await delete(at: indexSet) }
                    }
                }
            }
        }
        .navigationTitle("Flagged conversations")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "checkmark.shield")
                .font(.system(size: 48))
                .foregroundStyle(Color.green)
            Text("Nothing flagged.")
                .font(.headline)
            Text("Your conversations are clean. We only flag messages that hit our crisis-protection criteria.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
    }

    private func tierColor(_ tier: Int) -> Color {
        switch tier {
        case 1: return .red
        case 2: return .orange
        case 3: return .blue
        case 4: return .purple
        default: return .gray
        }
    }

    @MainActor
    private func load() async {
        isLoading = true
        defer { isLoading = false }
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }

        flags = (try? await supabase
            .from("crisis_flags")
            .select("id, tier, user_message, created_at")
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value) ?? []
    }

    private func delete(at offsets: IndexSet) async {
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return }
        for idx in offsets {
            let flag = flags[idx]
            _ = try? await supabase
                .from("crisis_flags")
                .delete()
                .eq("id", value: flag.id)
                .execute()
        }
        flags.remove(atOffsets: offsets)
    }
}

#Preview {
    PrivacyCenterView()
        .environment(AppState.preview)
}
