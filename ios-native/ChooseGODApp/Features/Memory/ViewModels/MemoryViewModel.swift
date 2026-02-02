import Foundation
import SwiftUI

@MainActor
final class MemoryViewModel: ObservableObject {
    
    // MARK: - Published State
    
    @Published var verses: [MemoryVerse] = []
    @Published var isLoading = false
    @Published var error: String?
    
    // Practice state
    @Published var currentIndex = 0
    @Published var isRevealed = false
    @Published var showHint = false
    @Published var reviewedCount = 0
    @Published var showCelebration = false
    
    // MARK: - Computed
    
    var dueVerses: [MemoryVerse] {
        verses.filter { $0.isDue }
    }
    
    var currentVerse: MemoryVerse? {
        guard currentIndex < dueVerses.count else { return nil }
        return dueVerses[currentIndex]
    }
    
    var isComplete: Bool {
        currentIndex >= dueVerses.count && reviewedCount > 0
    }
    
    var progress: Double {
        guard dueVerses.count > 0 else { return 0 }
        return Double(reviewedCount) / Double(dueVerses.count)
    }
    
    // MARK: - Services
    
    private let service = SupabaseMemoryService()
    private var userId: String?
    
    // MARK: - Actions
    
    func setUser(_ id: String) {
        self.userId = id
    }
    
    func fetchVerses() async {
        guard let userId else { return }
        isLoading = true
        error = nil
        
        do {
            verses = try await service.fetchVerses(userId: userId)
        } catch {
            self.error = "Unable to load memory verses. Please try again."
        }
        
        isLoading = false
    }
    
    func addVerse(
        book: String,
        chapter: Int,
        verseStart: Int,
        verseEnd: Int?,
        text: String,
        translation: String
    ) async -> Bool {
        guard let userId else { return false }
        
        do {
            let verse = try await service.addVerse(
                userId: userId,
                book: book,
                chapter: chapter,
                verseStart: verseStart,
                verseEnd: verseEnd,
                text: text,
                translation: translation
            )
            verses.append(verse)
            HapticManager.shared.success()
            return true
        } catch {
            self.error = "Couldn't add verse. Please check your connection."
            HapticManager.shared.error()
            return false
        }
    }
    
    func reviewVerse(rating: ReviewRating) async {
        guard let verse = currentVerse else { return }
        
        let result = SM2.calculate(
            currentInterval: verse.intervalDays,
            currentEaseFactor: verse.easeFactor,
            rating: rating
        )
        
        do {
            try await service.updateReview(
                verseId: verse.id,
                intervalDays: result.intervalDays,
                easeFactor: result.easeFactor,
                nextReview: result.nextReview,
                reviewCount: verse.reviewCount + 1
            )
            
            // Update local state
            if let idx = verses.firstIndex(where: { $0.id == verse.id }) {
                verses[idx].intervalDays = result.intervalDays
                verses[idx].easeFactor = result.easeFactor
                verses[idx].nextReview = result.nextReview
                verses[idx].reviewCount += 1
            }
            
            reviewedCount += 1
            isRevealed = false
            showHint = false
            
            if currentIndex + 1 >= dueVerses.count {
                showCelebration = true
                HapticManager.shared.celebration()
            } else {
                currentIndex += 1
                HapticManager.shared.success()
            }
        } catch {
            self.error = "Couldn't save review. Please try again."
            HapticManager.shared.error()
        }
    }
    
    func deleteVerse(_ verse: MemoryVerse) async {
        do {
            try await service.deleteVerse(verseId: verse.id)
            verses.removeAll { $0.id == verse.id }
            HapticManager.shared.impact()
        } catch {
            self.error = "Couldn't delete verse. Please try again."
            HapticManager.shared.error()
        }
    }
    
    func resetPractice() {
        currentIndex = 0
        reviewedCount = 0
        isRevealed = false
        showHint = false
        showCelebration = false
    }
    
    /// Next interval preview for rating buttons
    func nextInterval(for rating: ReviewRating) -> Int {
        guard let verse = currentVerse else { return 1 }
        return SM2.calculate(
            currentInterval: verse.intervalDays,
            currentEaseFactor: verse.easeFactor,
            rating: rating
        ).intervalDays
    }
}
