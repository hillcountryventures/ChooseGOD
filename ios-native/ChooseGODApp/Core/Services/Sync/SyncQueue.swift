import Foundation
import Observation

/// Queues write operations when offline and replays them on reconnect
@Observable
final class SyncQueue {
    static let shared = SyncQueue()

    /// Pending operations count
    var pendingCount: Int { operations.count }

    private var operations: [SyncOperation] = []
    private var isProcessing = false
    private let maxRetries = 5
    private let storageKey = "com.choosegod.syncqueue"

    private init() {
        loadFromDisk()
        observeNetwork()
    }

    // MARK: - Public API

    /// Enqueue an operation to be synced when online
    func enqueue(_ operation: SyncOperation) {
        operations.append(operation)
        saveToDisk()

        if NetworkMonitor.shared.isConnected == true {
            processQueue()
        }
    }

    /// Process all pending operations with exponential backoff
    func processQueue() {
        guard !isProcessing, !operations.isEmpty else { return }
        isProcessing = true

        Task {
            var remaining: [SyncOperation] = []

            for var op in operations {
                do {
                    try await execute(op)
                } catch {
                    op.retryCount += 1
                    if op.retryCount < maxRetries {
                        remaining.append(op)
                    }
                    // Exponential backoff
                    let delay = UInt64(pow(2.0, Double(op.retryCount))) * 1_000_000_000
                    try? await Task.sleep(nanoseconds: delay)
                }
            }

            await MainActor.run {
                self.operations = remaining
                self.saveToDisk()
                self.isProcessing = false
            }
        }
    }

    // MARK: - Fix 3: Wired execute() to actual Supabase services

    private func execute(_ op: SyncOperation) async throws {
        let bibleService = SupabaseBibleService()
        let journalService = SupabaseJournalService()
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        switch op.kind {
        case .bookmark:
            let bookmark = try decoder.decode(VerseBookmark.self, from: op.payload)
            try await bibleService.saveBookmark(bookmark)

        case .highlight:
            let highlight = try decoder.decode(VerseHighlight.self, from: op.payload)
            try await bibleService.saveHighlight(highlight)

        case .note:
            let note = try decoder.decode(VerseNote.self, from: op.payload)
            try await bibleService.saveNote(note)

        case .journalEntry:
            let moment = try decoder.decode(SpiritualMoment.self, from: op.payload)
            _ = try await journalService.createMoment(moment)
        }
    }

    private func observeNetwork() {
        // Use withObservationTracking to watch for connectivity changes
        func track() {
            withObservationTracking {
                _ = NetworkMonitor.shared.isConnected
            } onChange: {
                DispatchQueue.main.async { [weak self] in
                    if NetworkMonitor.shared.isConnected == true {
                        self?.processQueue()
                    }
                    track()
                }
            }
        }
        track()
    }

    // MARK: - Persistence

    private func saveToDisk() {
        if let data = try? JSONEncoder().encode(operations) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func loadFromDisk() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let ops = try? JSONDecoder().decode([SyncOperation].self, from: data) else { return }
        operations = ops
    }
}

// MARK: - Models

struct SyncOperation: Codable, Identifiable {
    let id: UUID
    let kind: Kind
    let payload: Data
    let createdAt: Date
    var retryCount: Int

    enum Kind: String, Codable {
        case bookmark, highlight, note, journalEntry
    }

    init(kind: Kind, payload: Data) {
        self.id = UUID()
        self.kind = kind
        self.payload = payload
        self.createdAt = Date()
        self.retryCount = 0
    }
}
