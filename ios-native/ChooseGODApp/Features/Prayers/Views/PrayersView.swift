import SwiftUI

/// Prayer journal view with active/answered tabs
struct PrayersView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedTab: PrayerTab = .active
    @State private var prayers: [PrayerRequest] = []
    @State private var isLoading = true
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
                Theme.Colors.background
                    .ignoresSafeArea()
                
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
                        ProgressView()
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
                    }
                }
            }
            .navigationTitle("Prayers")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showNewPrayerSheet = true
                    } label: {
                        Image(systemName: "plus")
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
    }
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Image(systemName: "hands.sparkles")
                .font(.system(size: 60))
                .foregroundStyle(Theme.Colors.primary.opacity(0.5))
            
            Text(selectedTab == .answered ? "No answered prayers yet" : "No prayers yet")
                .font(.title3.weight(.medium))
                .foregroundStyle(Theme.Colors.text)
            
            Text(selectedTab == .answered ? "When God answers, you'll see them here" : "Tap + to add your first prayer request")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
            
            Spacer()
        }
        .padding()
    }
    
    private func loadPrayers() async {
        guard let userId = appState.currentUser?.id else { return }
        
        do {
            let service = SupabasePrayerService()
            prayers = try await service.getPrayers(userId: userId, status: nil)
        } catch {
            // Use mock data if no real data
            prayers = [.preview]
        }
        isLoading = false
    }
    
    private func markAsAnswered(_ prayer: PrayerRequest) {
        guard let index = prayers.firstIndex(where: { $0.id == prayer.id }) else { return }
        prayers[index].status = .answered
        prayers[index].answeredAt = Date()
        
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
                    .font(.caption.weight(.medium))
                    .foregroundStyle(statusColor)
                
                Spacer()
                
                Text(prayer.createdAt, style: .date)
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
            
            // Prayer text
            Text(prayer.request)
                .font(.body)
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(4)
            
            // Scripture anchor if exists
            if let scripture = prayer.scriptureAnchor {
                HStack(spacing: 8) {
                    Image(systemName: "book.closed")
                        .font(.caption)
                    Text(scripture.reference)
                        .font(.caption.weight(.medium))
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
                            .font(.subheadline.weight(.medium))
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
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Theme.Colors.secondaryText)
                    
                    Text(reflection)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.text)
                }
            }
        }
        .padding()
        .background(Theme.Colors.surface)
        .cornerRadius(12)
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
                Theme.Colors.background
                    .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    // Prompt
                    Text("What's on your heart?")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(Theme.Colors.text)
                    
                    // Text editor
                    TextEditor(text: $prayerText)
                        .font(.body)
                        .scrollContentBackground(.hidden)
                        .padding()
                        .background(Theme.Colors.surface)
                        .cornerRadius(12)
                        .frame(minHeight: 150)
                    
                    Spacer()
                    
                    // Submit button
                    Button {
                        Task { await savePrayer() }
                    } label: {
                        if isSaving {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Add Prayer")
                                .font(.headline)
                        }
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(prayerText.isEmpty ? Theme.Colors.secondaryText : Theme.Colors.primary)
                    .cornerRadius(16)
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
