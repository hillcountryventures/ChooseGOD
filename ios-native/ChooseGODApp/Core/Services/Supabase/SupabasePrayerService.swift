import Foundation
import Supabase

/// Protocol for prayer service
protocol PrayerServiceProtocol {
    func getPrayers(userId: String, status: PrayerStatus?) async throws -> [PrayerRequest]
    func createPrayer(_ prayer: PrayerRequest) async throws -> PrayerRequest
    func updatePrayer(_ prayer: PrayerRequest) async throws
    func deletePrayer(id: String) async throws
    func markAsAnswered(id: String, reflection: String?) async throws
    
    func getCircles(userId: String) async throws -> [PrayerCircle]
    func createCircle(name: String, userId: String) async throws -> PrayerCircle
    func joinCircle(inviteCode: String, userId: String) async throws -> PrayerCircle
    func leaveCircle(circleId: String, userId: String) async throws
    func getCirclePrayers(circleId: String) async throws -> [PrayerRequest]
    func getCircleMembers(circleId: String) async throws -> [CircleMember]
}

/// Supabase-backed prayer service
final class SupabasePrayerService: PrayerServiceProtocol {
    
    private func requireSupabase() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }
    
    // MARK: - Prayers
    
    func getPrayers(userId: String, status: PrayerStatus?) async throws -> [PrayerRequest] {
        let client = try requireSupabase()
        var query = client
            .from("prayer_requests")
            .select()
            .eq("user_id", value: userId)

        if let status = status {
            query = query.eq("status", value: status.rawValue)
        }

        return try await query
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    func createPrayer(_ prayer: PrayerRequest) async throws -> PrayerRequest {
        let client = try requireSupabase()
        return try await client
            .from("prayer_requests")
            .insert(prayer)
            .select()
            .single()
            .execute()
            .value
    }
    
    func updatePrayer(_ prayer: PrayerRequest) async throws {
        let client = try requireSupabase()
        try await client
            .from("prayer_requests")
            .update(prayer)
            .eq("id", value: prayer.id)
            .execute()
    }
    
    func deletePrayer(id: String) async throws {
        let client = try requireSupabase()
        try await client
            .from("prayer_requests")
            .delete()
            .eq("id", value: id)
            .execute()
    }
    
    func markAsAnswered(id: String, reflection: String?) async throws {
        struct AnsweredUpdate: Codable {
            let status: String
            let answeredAt: Date
            let answeredReflection: String?
            
            enum CodingKeys: String, CodingKey {
                case status
                case answeredAt = "answered_at"
                case answeredReflection = "answered_reflection"
            }
        }
        
        let update = AnsweredUpdate(
            status: PrayerStatus.answered.rawValue,
            answeredAt: Date(),
            answeredReflection: reflection
        )

        let client = try requireSupabase()
        try await client
            .from("prayer_requests")
            .update(update)
            .eq("id", value: id)
            .execute()
    }
    
    // MARK: - Circles
    
    func getCircles(userId: String) async throws -> [PrayerCircle] {
        // Get circles where user is a member
        let client = try requireSupabase()
        let memberships: [CircleMemberRow] = try await client
            .from("circle_members")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        guard !memberships.isEmpty else { return [] }

        let circleIds = memberships.map { $0.circleId }

        return try await client
            .from("prayer_circles")
            .select()
            .in("id", values: circleIds)
            .execute()
            .value
    }
    
    func createCircle(name: String, userId: String) async throws -> PrayerCircle {
        // Generate invite code
        let inviteCode = generateInviteCode()
        
        struct CreateCircle: Codable {
            let name: String
            let createdBy: String
            let inviteCode: String
            
            enum CodingKeys: String, CodingKey {
                case name
                case createdBy = "created_by"
                case inviteCode = "invite_code"
            }
        }
        
        let newCircle = CreateCircle(name: name, createdBy: userId, inviteCode: inviteCode)

        let client = try requireSupabase()
        let circle: PrayerCircle = try await client
            .from("prayer_circles")
            .insert(newCircle)
            .select()
            .single()
            .execute()
            .value
        
        // Add creator as member
        try await addMember(circleId: circle.id, userId: userId)
        
        return circle
    }
    
    func joinCircle(inviteCode: String, userId: String) async throws -> PrayerCircle {
        // Find circle by invite code
        let client = try requireSupabase()
        let circle: PrayerCircle = try await client
            .from("prayer_circles")
            .select()
            .eq("invite_code", value: inviteCode.uppercased())
            .single()
            .execute()
            .value
        
        // Add user as member
        try await addMember(circleId: circle.id, userId: userId)
        
        return circle
    }
    
    func leaveCircle(circleId: String, userId: String) async throws {
        let client = try requireSupabase()
        try await client
            .from("circle_members")
            .delete()
            .eq("circle_id", value: circleId)
            .eq("user_id", value: userId)
            .execute()
    }
    
    // MARK: - Circle Prayers & Members
    
    func getCirclePrayers(circleId: String) async throws -> [PrayerRequest] {
        let client = try requireSupabase()
        return try await client
            .from("prayer_requests")
            .select()
            .eq("circle_id", value: circleId)
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    func getCircleMembers(circleId: String) async throws -> [CircleMember] {
        let client = try requireSupabase()
        return try await client
            .from("circle_members")
            .select()
            .eq("circle_id", value: circleId)
            .order("joined_at", ascending: true)
            .execute()
            .value
    }
    
    // MARK: - Private Helpers
    
    private func addMember(circleId: String, userId: String) async throws {
        struct NewMember: Codable {
            let circleId: String
            let userId: String

            enum CodingKeys: String, CodingKey {
                case circleId = "circle_id"
                case userId = "user_id"
            }
        }

        let client = try requireSupabase()
        try await client
            .from("circle_members")
            .insert(NewMember(circleId: circleId, userId: userId))
            .execute()
    }
    
    private func generateInviteCode() -> String {
        let letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return String((0..<8).map { _ in letters.randomElement() ?? Character("A") })
    }
}

// MARK: - Row Types

private struct CircleMemberRow: Codable {
    let circleId: String
    let userId: String
    
    enum CodingKeys: String, CodingKey {
        case circleId = "circle_id"
        case userId = "user_id"
    }
}
