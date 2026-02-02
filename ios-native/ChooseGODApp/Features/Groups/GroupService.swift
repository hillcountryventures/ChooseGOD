import Foundation
import Supabase

// MARK: - Protocol

protocol GroupServiceProtocol {
    func getGroups(userId: String) async throws -> [BibleStudyGroup]
    func getGroup(id: String) async throws -> BibleStudyGroup
    func createGroup(name: String, description: String?, churchAffiliation: String?, createdBy: String) async throws -> BibleStudyGroup
    func joinGroup(inviteCode: String, userId: String, displayName: String?) async throws -> BibleStudyGroup
    func leaveGroup(groupId: String, userId: String) async throws
    
    func getMembers(groupId: String) async throws -> [GroupMember]
    func updateMemberRole(memberId: String, role: GroupRole, isPastor: Bool) async throws
    
    func assignReadingPlan(_ plan: GroupReadingPlan) async throws -> GroupReadingPlan
    func getActiveReadingPlan(groupId: String) async throws -> GroupReadingPlan?
    
    func getDiscussions(groupId: String, parentId: String?) async throws -> [GroupDiscussion]
    func postDiscussion(groupId: String, userId: String, displayName: String?, message: String, passageReference: String?, parentId: String?) async throws -> GroupDiscussion
    
    func getPrayerWall(groupId: String) async throws -> [GroupPrayerRequest]
    func postPrayerRequest(groupId: String, userId: String, displayName: String?, request: String) async throws -> GroupPrayerRequest
    func prayForRequest(requestId: String) async throws
}

// MARK: - Supabase Implementation

final class SupabaseGroupService: GroupServiceProtocol {
    
    private func client() throws -> SupabaseClient {
        try SupabaseManager.shared.requireClient()
    }
    
    // MARK: - Invite Code Generator
    
    private func generateInviteCode() -> String {
        let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // No I/O/0/1 for clarity
        return String((0..<6).map { _ in chars.randomElement()! })
    }
    
    // MARK: - Groups CRUD
    
    func getGroups(userId: String) async throws -> [BibleStudyGroup] {
        let supabase = try client()
        
        // Get group IDs the user belongs to
        let memberships: [GroupMember] = try await supabase
            .from("group_members")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value
        
        let groupIds = memberships.map { $0.groupId }
        guard !groupIds.isEmpty else { return [] }
        
        return try await supabase
            .from("bible_study_groups")
            .select()
            .in("id", values: groupIds)
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    func getGroup(id: String) async throws -> BibleStudyGroup {
        let supabase = try client()
        return try await supabase
            .from("bible_study_groups")
            .select()
            .eq("id", value: id)
            .single()
            .execute()
            .value
    }
    
    func createGroup(name: String, description: String?, churchAffiliation: String?, createdBy: String) async throws -> BibleStudyGroup {
        let supabase = try client()
        
        struct CreatePayload: Codable {
            let name: String
            let description: String?
            let churchAffiliation: String?
            let createdBy: String
            let inviteCode: String
            
            enum CodingKeys: String, CodingKey {
                case name, description
                case churchAffiliation = "church_affiliation"
                case createdBy = "created_by"
                case inviteCode = "invite_code"
            }
        }
        
        let payload = CreatePayload(
            name: name,
            description: description,
            churchAffiliation: churchAffiliation,
            createdBy: createdBy,
            inviteCode: generateInviteCode()
        )
        
        let group: BibleStudyGroup = try await supabase
            .from("bible_study_groups")
            .insert(payload)
            .select()
            .single()
            .execute()
            .value
        
        // Auto-add creator as leader
        struct MemberInsert: Codable {
            let groupId: String
            let userId: String
            let role: String
            let isPastor: Bool
            
            enum CodingKeys: String, CodingKey {
                case groupId = "group_id"
                case userId = "user_id"
                case role
                case isPastor = "is_pastor"
            }
        }
        
        try await supabase
            .from("group_members")
            .insert(MemberInsert(groupId: group.id, userId: createdBy, role: "leader", isPastor: false))
            .execute()
        
        return group
    }
    
    func joinGroup(inviteCode: String, userId: String, displayName: String?) async throws -> BibleStudyGroup {
        let supabase = try client()
        
        let group: BibleStudyGroup = try await supabase
            .from("bible_study_groups")
            .select()
            .eq("invite_code", value: inviteCode.uppercased())
            .single()
            .execute()
            .value
        
        struct MemberInsert: Codable {
            let groupId: String
            let userId: String
            let displayName: String?
            let role: String
            let isPastor: Bool
            
            enum CodingKeys: String, CodingKey {
                case groupId = "group_id"
                case userId = "user_id"
                case displayName = "display_name"
                case role
                case isPastor = "is_pastor"
            }
        }
        
        try await supabase
            .from("group_members")
            .insert(MemberInsert(groupId: group.id, userId: userId, displayName: displayName, role: "member", isPastor: false))
            .execute()
        
        return group
    }
    
    func leaveGroup(groupId: String, userId: String) async throws {
        let supabase = try client()
        try await supabase
            .from("group_members")
            .delete()
            .eq("group_id", value: groupId)
            .eq("user_id", value: userId)
            .execute()
    }
    
    // MARK: - Members
    
    func getMembers(groupId: String) async throws -> [GroupMember] {
        let supabase = try client()
        return try await supabase
            .from("group_members")
            .select()
            .eq("group_id", value: groupId)
            .order("joined_at", ascending: true)
            .execute()
            .value
    }
    
    func updateMemberRole(memberId: String, role: GroupRole, isPastor: Bool) async throws {
        let supabase = try client()
        
        struct RoleUpdate: Codable {
            let role: String
            let isPastor: Bool
            enum CodingKeys: String, CodingKey {
                case role
                case isPastor = "is_pastor"
            }
        }
        
        try await supabase
            .from("group_members")
            .update(RoleUpdate(role: role.rawValue, isPastor: isPastor))
            .eq("id", value: memberId)
            .execute()
    }
    
    // MARK: - Reading Plans
    
    func assignReadingPlan(_ plan: GroupReadingPlan) async throws -> GroupReadingPlan {
        let supabase = try client()
        
        let created: GroupReadingPlan = try await supabase
            .from("group_reading_plans")
            .insert(plan)
            .select()
            .single()
            .execute()
            .value
        
        // Update group's active plan
        struct PlanUpdate: Codable {
            let activeReadingPlanId: String
            enum CodingKeys: String, CodingKey {
                case activeReadingPlanId = "active_reading_plan_id"
            }
        }
        
        try await supabase
            .from("bible_study_groups")
            .update(PlanUpdate(activeReadingPlanId: created.id))
            .eq("id", value: plan.groupId)
            .execute()
        
        return created
    }
    
    func getActiveReadingPlan(groupId: String) async throws -> GroupReadingPlan? {
        let supabase = try client()
        let plans: [GroupReadingPlan] = try await supabase
            .from("group_reading_plans")
            .select()
            .eq("group_id", value: groupId)
            .order("created_at", ascending: false)
            .limit(1)
            .execute()
            .value
        return plans.first
    }
    
    // MARK: - Discussions
    
    func getDiscussions(groupId: String, parentId: String?) async throws -> [GroupDiscussion] {
        let supabase = try client()
        var query = supabase
            .from("group_discussions")
            .select()
            .eq("group_id", value: groupId)
        
        if let parentId = parentId {
            query = query.eq("parent_id", value: parentId)
        } else {
            query = query.is("parent_id", value: "null")
        }
        
        return try await query
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    func postDiscussion(groupId: String, userId: String, displayName: String?, message: String, passageReference: String?, parentId: String?) async throws -> GroupDiscussion {
        let supabase = try client()
        
        struct DiscussionInsert: Codable {
            let groupId: String
            let userId: String
            let displayName: String?
            let message: String
            let passageReference: String?
            let parentId: String?
            
            enum CodingKeys: String, CodingKey {
                case groupId = "group_id"
                case userId = "user_id"
                case displayName = "display_name"
                case message
                case passageReference = "passage_reference"
                case parentId = "parent_id"
            }
        }
        
        return try await supabase
            .from("group_discussions")
            .insert(DiscussionInsert(
                groupId: groupId,
                userId: userId,
                displayName: displayName,
                message: message,
                passageReference: passageReference,
                parentId: parentId
            ))
            .select()
            .single()
            .execute()
            .value
    }
    
    // MARK: - Prayer Wall
    
    func getPrayerWall(groupId: String) async throws -> [GroupPrayerRequest] {
        let supabase = try client()
        return try await supabase
            .from("group_prayer_requests")
            .select()
            .eq("group_id", value: groupId)
            .order("created_at", ascending: false)
            .execute()
            .value
    }
    
    func postPrayerRequest(groupId: String, userId: String, displayName: String?, request: String) async throws -> GroupPrayerRequest {
        let supabase = try client()
        
        struct PrayerInsert: Codable {
            let groupId: String
            let userId: String
            let displayName: String?
            let request: String
            let status: String
            
            enum CodingKeys: String, CodingKey {
                case groupId = "group_id"
                case userId = "user_id"
                case displayName = "display_name"
                case request, status
            }
        }
        
        return try await supabase
            .from("group_prayer_requests")
            .insert(PrayerInsert(groupId: groupId, userId: userId, displayName: displayName, request: request, status: "active"))
            .select()
            .single()
            .execute()
            .value
    }
    
    func prayForRequest(requestId: String) async throws {
        let supabase = try client()
        // Increment prayed_by_count via RPC or manual increment
        try await supabase.rpc("increment_prayer_count", params: ["request_id": requestId]).execute()
    }
}
