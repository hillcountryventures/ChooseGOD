import SwiftUI
import Observation

@Observable
final class JournalViewModel {
    
    // MARK: - State
    
    var moments: [SpiritualMoment] = []
    var isLoading = false
    var errorMessage: String?
    var searchText = ""
    var activeFilter: JournalFilter = .all
    
    // Compose state
    var composeContent = ""
    var composeLinkedVerses: [VerseSource] = []
    var composeMedia: [JournalMedia] = []
    var isSaving = false
    var showingCompose = false
    var editingMoment: SpiritualMoment?
    
    // Draft
    var currentDraft: JournalDraft?
    
    // Detail
    var selectedMoment: SpiritualMoment?
    
    // MARK: - Services
    
    private let journalService: JournalServiceProtocol
    private var autoSaveTask: Task<Void, Never>?
    
    // MARK: - Computed
    
    var filteredMoments: [SpiritualMoment] {
        var result = moments
        
        if let type = activeFilter.momentType {
            result = result.filter { $0.momentType == type }
        }
        
        if !searchText.isEmpty {
            result = result.filter {
                $0.content.localizedCaseInsensitiveContains(searchText) ||
                $0.themes.contains(where: { $0.localizedCaseInsensitiveContains(searchText) }) ||
                $0.linkedVerses.contains(where: { $0.reference.localizedCaseInsensitiveContains(searchText) })
            }
        }
        
        return result
    }
    
    var canPost: Bool {
        !composeContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    var wordCount: Int {
        composeContent.split(separator: " ").filter { !$0.isEmpty }.count
    }
    
    var prompts: [JournalPrompt] {
        Self.timeBasedPrompts()
    }
    
    // MARK: - Init
    
    init(journalService: JournalServiceProtocol = MockJournalService()) {
        self.journalService = journalService
    }
    
    // MARK: - Data Loading
    
    func loadMoments(userId: String = "local-user") async {
        isLoading = true
        errorMessage = nil
        
        do {
            moments = try await journalService.getMoments(userId: userId, type: nil, limit: 50, offset: 0)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func searchMoments(query: String, userId: String = "local-user") async {
        guard !query.isEmpty else {
            await loadMoments(userId: userId)
            return
        }
        
        isLoading = true
        do {
            moments = try await journalService.searchMoments(userId: userId, query: query)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
    
    // MARK: - CRUD
    
    func postEntry(source: JournalSource = JournalSource(type: .standalone)) async {
        let trimmed = composeContent.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        
        isSaving = true
        
        let moment = SpiritualMoment(
            id: "journal-\(Int(Date().timeIntervalSince1970))",
            userId: "local-user",
            momentType: .journal,
            content: trimmed,
            linkedVerses: composeLinkedVerses,
            themes: [],
            createdAt: Date(),
            media: composeMedia.isEmpty ? nil : composeMedia,
            status: .published,
            source: source
        )
        
        do {
            let saved = try await journalService.createMoment(moment)
            moments.insert(saved, at: 0)
            resetCompose()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isSaving = false
    }
    
    func updateEntry(_ moment: SpiritualMoment, newContent: String) async {
        var updated = moment
        updated.content = newContent
        updated.updatedAt = Date()
        
        do {
            try await journalService.updateMoment(updated)
            if let idx = moments.firstIndex(where: { $0.id == moment.id }) {
                moments[idx] = updated
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func deleteEntry(_ id: String) async {
        do {
            try await journalService.deleteMoment(id: id)
            moments.removeAll { $0.id == id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    // MARK: - Compose Helpers
    
    func resetCompose() {
        composeContent = ""
        composeLinkedVerses = []
        composeMedia = []
        currentDraft = nil
        editingMoment = nil
        autoSaveTask?.cancel()
    }
    
    func applyPrompt(_ prompt: JournalPrompt) {
        composeContent = prompt.text + "\n\n"
        if let verse = prompt.relatedVerse {
            addVerse(verse)
        }
    }
    
    func addVerse(_ verse: VerseSource) {
        guard !composeLinkedVerses.contains(where: { $0.id == verse.id }) else { return }
        composeLinkedVerses.append(verse)
    }
    
    func removeVerse(at index: Int) {
        guard composeLinkedVerses.indices.contains(index) else { return }
        composeLinkedVerses.remove(at: index)
    }
    
    func addMedia(_ media: JournalMedia) {
        composeMedia.append(media)
    }
    
    func removeMedia(_ id: String) {
        composeMedia.removeAll { $0.id == id }
    }
    
    // MARK: - Auto-save Draft
    
    func scheduleAutoSave() {
        autoSaveTask?.cancel()
        autoSaveTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(30))
            guard let self, !Task.isCancelled else { return }
            self.saveDraft()
        }
    }
    
    func saveDraft() {
        guard !composeContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
              !composeLinkedVerses.isEmpty || !composeMedia.isEmpty else { return }
        
        currentDraft = JournalDraft(
            id: currentDraft?.id ?? "draft-\(Int(Date().timeIntervalSince1970))",
            content: composeContent,
            linkedVerses: composeLinkedVerses,
            media: composeMedia,
            lastSavedAt: Date()
        )
    }
    
    func restoreDraft(_ draft: JournalDraft) {
        composeContent = draft.content
        composeLinkedVerses = draft.linkedVerses
        composeMedia = draft.media
        currentDraft = draft
    }
    
    // MARK: - Prompts
    
    static func timeBasedPrompts() -> [JournalPrompt] {
        let hour = Calendar.current.component(.hour, from: Date())
        
        if hour < 12 {
            return [
                JournalPrompt(id: "m1", type: .morning, text: "Morning Reflection: What is God speaking to your heart this morning?", relatedVerse: nil, icon: "sunrise.fill"),
                JournalPrompt(id: "m2", type: .morning, text: "Gratitude: List three things you're thankful for today", relatedVerse: nil, icon: "heart.fill"),
                JournalPrompt(id: "m3", type: .verseBased, text: "Scripture Response: How does today's reading apply to your life?", relatedVerse: nil, icon: "book.fill"),
            ]
        } else if hour < 18 {
            return [
                JournalPrompt(id: "a1", type: .contextual, text: "Midday Check-in: Where have you seen God at work today?", relatedVerse: nil, icon: "sun.max.fill"),
                JournalPrompt(id: "a2", type: .themeBased, text: "Prayer Request: What's weighing on your heart right now?", relatedVerse: nil, icon: "hands.sparkles.fill"),
                JournalPrompt(id: "a3", type: .contextual, text: "Obedience Step: What is God calling you to do today?", relatedVerse: nil, icon: "figure.walk"),
            ]
        } else {
            return [
                JournalPrompt(id: "e1", type: .evening, text: "Evening Examen: Where did you encounter God today?", relatedVerse: nil, icon: "moon.stars.fill"),
                JournalPrompt(id: "e2", type: .evening, text: "Confession: Is there anything you need to lay before the Lord?", relatedVerse: nil, icon: "drop.fill"),
                JournalPrompt(id: "e3", type: .evening, text: "Tomorrow's Hope: What are you trusting God for tomorrow?", relatedVerse: nil, icon: "sparkles"),
            ]
        }
    }
}
