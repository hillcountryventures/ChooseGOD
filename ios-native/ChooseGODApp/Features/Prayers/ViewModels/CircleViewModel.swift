import Foundation
import SwiftUI

/// ViewModel for Prayer Circles feature
@Observable
final class CircleViewModel {
    
    // MARK: - State
    
    var circles: [PrayerCircle] = []
    var currentCircle: PrayerCircle?
    var circlePrayers: [PrayerRequest] = []
    var circleMembers: [CircleMember] = []
    
    var isLoadingCircles = false
    var isLoadingDetail = false
    var isCreating = false
    var isJoining = false
    
    var errorMessage: String?
    
    private let service = SupabasePrayerService()
    
    // MARK: - Circles List
    
    func loadCircles(userId: String) async {
        isLoadingCircles = true
        errorMessage = nil
        
        do {
            circles = try await service.getCircles(userId: userId)
        } catch {
            errorMessage = "Failed to load circles"
            circles = []
        }
        
        isLoadingCircles = false
    }
    
    // MARK: - Circle Detail
    
    func loadCircleDetail(circle: PrayerCircle) async {
        currentCircle = circle
        isLoadingDetail = true
        
        do {
            async let prayers = service.getCirclePrayers(circleId: circle.id)
            async let members = service.getCircleMembers(circleId: circle.id)
            
            circlePrayers = try await prayers
            circleMembers = try await members
        } catch {
            errorMessage = "Failed to load circle details"
        }
        
        isLoadingDetail = false
    }
    
    // MARK: - Create Circle
    
    func createCircle(name: String, userId: String) async -> PrayerCircle? {
        isCreating = true
        errorMessage = nil
        
        do {
            let circle = try await service.createCircle(name: name, userId: userId)
            circles.insert(circle, at: 0)
            isCreating = false
            return circle
        } catch {
            errorMessage = "Failed to create circle"
            isCreating = false
            return nil
        }
    }
    
    // MARK: - Join Circle
    
    func joinCircle(inviteCode: String, userId: String) async -> PrayerCircle? {
        isJoining = true
        errorMessage = nil
        
        do {
            let circle = try await service.joinCircle(inviteCode: inviteCode, userId: userId)
            if !circles.contains(where: { $0.id == circle.id }) {
                circles.insert(circle, at: 0)
            }
            isJoining = false
            return circle
        } catch {
            errorMessage = "Invalid invite code or already a member"
            isJoining = false
            return nil
        }
    }
    
    // MARK: - Leave Circle
    
    func leaveCircle(circleId: String, userId: String) async {
        do {
            try await service.leaveCircle(circleId: circleId, userId: userId)
            circles.removeAll { $0.id == circleId }
            if currentCircle?.id == circleId {
                currentCircle = nil
            }
        } catch {
            errorMessage = "Failed to leave circle"
        }
    }
    
    // MARK: - Add Prayer to Circle
    
    func addPrayerToCircle(text: String, circleId: String, userId: String) async {
        let prayer = PrayerRequest(
            id: UUID().uuidString,
            userId: userId,
            circleId: circleId,
            request: text,
            scriptureAnchor: nil,
            status: .active,
            answeredAt: nil,
            answeredReflection: nil,
            createdAt: Date()
        )
        
        do {
            let saved = try await service.createPrayer(prayer)
            circlePrayers.insert(saved, at: 0)
        } catch {
            // Add locally anyway
            circlePrayers.insert(prayer, at: 0)
        }
    }
}
