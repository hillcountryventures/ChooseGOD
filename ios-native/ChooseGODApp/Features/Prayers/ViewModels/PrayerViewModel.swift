import Foundation

/// ViewModel for Personal Prayers feature
@MainActor
final class PrayerViewModel: ObservableObject {

    // MARK: - Published State

    @Published var personalPrayers: [PrayerRequest] = []
    @Published var communityPrayers: [PrayerRequest] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedPrayerForEdit: PrayerRequest?

    // MARK: - Private

    private let service = SupabasePrayerService()

    // MARK: - Fetch All Prayers

    func fetchPrayers(userId: String) async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            async let personalTask = service.getPrayers(userId: userId, status: nil)
            async let circlesTask = service.getCircles(userId: userId)

            let personal = try await personalTask
            let circles = try await circlesTask

            // Personal prayers = those without a circle
            self.personalPrayers = personal.filter { $0.circleId == nil }

            // Community prayers = prayers from circles user belongs to (excluding own)
            var allCommunityPrayers: [PrayerRequest] = []
            if !circles.isEmpty {
                let circleIds = circles.map { $0.id }

                await withTaskGroup(of: [PrayerRequest].self) { group in
                    for circleId in circleIds {
                        group.addTask {
                            (try? await self.service.getCirclePrayers(circleId: circleId)) ?? []
                        }
                    }
                    for await circlePrayers in group {
                        allCommunityPrayers.append(contentsOf: circlePrayers)
                    }
                }
            }

            // Deduplicate by id and exclude user's own prayers
            var seenIds = Set<String>()
            self.communityPrayers = allCommunityPrayers
                .filter { prayer in
                    if seenIds.contains(prayer.id) {
                        return false
                    }
                    seenIds.insert(prayer.id)
                    return prayer.userId != userId  // exclude user's own circle prayers
                }
                .sorted { $0.createdAt > $1.createdAt }
        } catch {
            self.error = "Failed to load prayers"
            self.personalPrayers = []
            self.communityPrayers = []
        }
    }

    // MARK: - Add Prayer

    func addPrayer(request: String, scriptureAnchor: ScriptureAnchor?, userId: String) async throws {
        let prayer = PrayerRequest(
            id: UUID().uuidString,
            userId: userId,
            circleId: nil,
            request: request,
            scriptureAnchor: scriptureAnchor,
            status: .active,
            answeredAt: nil,
            answeredReflection: nil,
            createdAt: Date()
        )

        do {
            let saved = try await service.createPrayer(prayer)
            personalPrayers.insert(saved, at: 0)

            // Increment user defaults counter
            let current = UserDefaults.standard.integer(forKey: "totalPrayersAdded")
            UserDefaults.standard.set(current + 1, forKey: "totalPrayersAdded")

            // Analytics
            // AnalyticsService.shared.capture("prayer_added")
        } catch {
            throw error
        }
    }

    // MARK: - Mark as Answered

    func markAsAnswered(_ prayer: PrayerRequest) async throws {
        do {
            try await service.markAsAnswered(id: prayer.id, reflection: nil)

            // Update in-place
            if let index = personalPrayers.firstIndex(where: { $0.id == prayer.id }) {
                var updated = personalPrayers[index]
                updated.status = .answered
                personalPrayers[index] = updated
            }

            // Increment counter
            let current = UserDefaults.standard.integer(forKey: "totalAnsweredPrayers")
            UserDefaults.standard.set(current + 1, forKey: "totalAnsweredPrayers")

            // Haptic + Analytics
            HapticManager.shared.prayerAnswered()
            // AnalyticsService.shared.capture("prayer_answered")
        } catch {
            throw error
        }
    }

    // MARK: - Delete Prayer

    func deletePrayer(_ prayer: PrayerRequest) async throws {
        do {
            try await service.deletePrayer(id: prayer.id)
            personalPrayers.removeAll { $0.id == prayer.id }
        } catch {
            throw error
        }
    }

    // MARK: - Update Prayer

    func updatePrayer(_ prayer: PrayerRequest, newRequest: String, scriptureAnchor: ScriptureAnchor?) async throws {
        do {
            var updated = prayer
            updated.request = newRequest
            updated.scriptureAnchor = scriptureAnchor
            try await service.updatePrayer(updated)

            // Update in-place
            if let index = personalPrayers.firstIndex(where: { $0.id == prayer.id }) {
                personalPrayers[index] = updated
            }
        } catch {
            throw error
        }
    }

    // MARK: - Pray For Others

    func prayFor(_ prayer: PrayerRequest) {
        // No pray count field exists in model — log analytics only
        HapticManager.shared.tap()
        // AnalyticsService.shared.capture("prayer_for_others")
    }
}
