import SwiftUI

/// Prayer journal view with active/answered tabs
struct PrayersView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedTab: PrayerTab = .active
    @State private var prayers: [PrayerRequest] = []
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var showNewPrayerSheet = false
    
    enum PrayerTab: String, CaseIterable {
        case active = "Active"
        case answered = "Answered"
        case all = "All"
    }
    
    var filteredPrayers: [PrayerRequest] {
        switch selectedTab {
        case .active:
            return prayers.filter { $0.status == .active || $0.status == .ongoing }
        case .answered:
            return prayers.filter { $0.status == .answered }
        case .all:
            return prayers
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.clear // background applied via .screenBackground()
                
                VStack(spacing: 0) {
                    // Tab picker
                    Picker("Filter", selection: $selectedTab) {
                        ForEach(PrayerTab.allCases, id: \.self) { tab in
                            Text(tab.rawValue).tag(tab)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding()
                    
                    if isLoading {
                        Spacer()
                        ShimmerCard()
                        Spacer()
                    } else if let error = loadError {
                        Spacer()
                        ErrorRetryView(message: error) {
                            loadError = nil
                            isLoading = true
                            Task { await loadPrayers() }
                        }
                        Spacer()
                    } else if filteredPrayers.isEmpty {
                        emptyState
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(filteredPrayers) { prayer in
                                    PrayerCard(prayer: prayer) {
                                        // Mark as answered
                                        markAsAnswered(prayer)
                                    }
                                }
                            }
                            .padding()
                        }
                        .refreshable {
                            await loadPrayers()
                        }
                    }
                }
            }
            .screenBackground()
            .navigationTitle("Prayers")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showNewPrayerSheet = true
                    } label: {
                        Image(systemName: "plus")
                        .accessibilityLabel("Add new prayer request")
                        .accessibilityHint("Double tap to create a prayer")
                    }
                }
            }
            .sheet(isPresented: $showNewPrayerSheet) {
                NewPrayerSheet { newPrayer in
                    prayers.insert(newPrayer, at: 0)
                }
            }
            .task {
                await loadPrayers()
            }
        }
        .onAppear { AnalyticsService.shared.screen("prayers") }
    }
    
    private var emptyState: some View {
        EmptyStateView(
            icon: "hands.sparkles",
            title: selectedTab == .answered ? "No Answered Prayers Yet" : "Begin Your Prayer Journey",
            description: selectedTab == .answered
                ? "When God answers, you'll see them here. Keep praying — He hears you."
                : "Cast your cares upon the Lord. Tap + to lift your first prayer.",
            actionTitle: selectedTab == .answered ? nil : "Add Prayer",
            action: selectedTab == .answered ? nil : { showNewPrayerSheet = true }
        )
    }
    
    private func loadPrayers() async {
        guard let userId = appState.currentUser?.id else { return }
        
        do {
            let service = SupabasePrayerService()
            prayers = try await service.getPrayers(userId: userId, status: nil)
        } catch {
            loadError = "Unable to load prayers. Please check your connection."
        }
        isLoading = false
    }
    
    private func markAsAnswered(_ prayer: PrayerRequest) {
        guard let index = prayers.firstIndex(where: { $0.id == prayer.id }) else { return }
        prayers[index].status = .answered
        prayers[index].answeredAt = Date()
        HapticManager.shared.prayerAnswered()
        
        Task {
            let service = SupabasePrayerService()
            try? await service.markAsAnswered(id: prayer.id, reflection: nil)
        }
    }
}

// MARK: - Prayer Card

struct PrayerCard: View {
    let prayer: PrayerRequest
    let onMarkAnswered: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Status badge
            HStack {
                Label(prayer.status.displayName, systemImage: prayer.status.icon)
                    .font(Theme.Typography.captionMedium)
                    .foregroundStyle(statusColor)
                
                Spacer()
                
                Text(prayer.createdAt, style: .date)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            // Prayer text
            Text(prayer.request)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(4)
            
            // Scripture anchor if exists
            if let scripture = prayer.scriptureAnchor {
                HStack(spacing: 8) {
                    Image(systemName: "book.closed")
                        .font(Theme.Typography.caption)
                    Text(scripture.reference)
                        .font(Theme.Typography.captionMedium)
                }
                .foregroundStyle(Theme.Colors.primary)
            }
            
            // Actions
            if prayer.status == .active {
                HStack {
                    Spacer()
                    
                    Button {
                        onMarkAnswered()
                    } label: {
                        Label("Answered!", systemImage: "checkmark.circle")
                            .font(Theme.Typography.subheadlineMedium)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Theme.Colors.success)
                }
            }
            
            // Answered reflection
            if prayer.status == .answered, let reflection = prayer.answeredReflection {
                Divider()
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Reflection")
                        .font(Theme.Typography.captionMedium)
                        .foregroundStyle(Theme.Colors.secondaryText)
                    
                    Text(reflection)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.text)
                }
            }
        }
        .padding()
        .background(Theme.Colors.surface)
        .cornerRadius(Theme.CornerRadius.lg)
    }
    
    private var statusColor: Color {
        switch prayer.status {
        case .active: return Theme.Colors.primary
        case .answered: return Theme.Colors.success
        case .ongoing: return Theme.Colors.accent
        }
    }
}

// MARK: - New Prayer Sheet

struct NewPrayerSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    
    @State private var prayerText = ""
    @State private var isSaving = false
    
    let onCreate: (PrayerRequest) -> Void
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.clear // background applied via .screenBackground()
                
                VStack(spacing: 20) {
                    // Prompt
                    Text("What's on your heart?")
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.text)
                    
                    // Text editor
                    TextEditor(text: $prayerText)
                        .font(Theme.Typography.body)
                        .scrollContentBackground(.hidden)
                        .padding()
                        .background(Theme.Colors.surface)
                        .cornerRadius(Theme.CornerRadius.lg)
                        .frame(minHeight: 150)
                    
                    Spacer()
                    
                    // Submit button
                    Button {
                        Task { await savePrayer() }
                    } label: {
                        if isSaving {
                ShimmerView(height: 20)
                                .tint(.white)
                        } else {
                            Text("Add Prayer")
                                .font(Theme.Typography.title3)
                        }
                    }
                    .primaryButtonStyle(isDisabled: prayerText.isEmpty)
                    .disabled(prayerText.isEmpty || isSaving)
                }
                .padding()
            }
            .navigationTitle("New Prayer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
    
    private func savePrayer() async {
        AnalyticsService.shared.capture("prayer_added")
        guard let userId = appState.currentUser?.id else { return }
        
        isSaving = true
        
        let newPrayer = PrayerRequest(
            id: UUID().uuidString,
            userId: userId,
            circleId: nil,
            request: prayerText,
            scriptureAnchor: nil,
            status: .active,
            answeredAt: nil,
            answeredReflection: nil,
            createdAt: Date()
        )
        
        do {
            let service = SupabasePrayerService()
            let saved = try await service.createPrayer(newPrayer)
            HapticManager.shared.success()
            onCreate(saved)
        } catch {
            // Still add locally
            onCreate(newPrayer)
        }
        
        dismiss()
    }
}

#Preview {
    PrayersView()
        .environment(AppState.preview)
}
