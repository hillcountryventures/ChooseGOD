import Foundation
import Supabase

/// Referral stats model
struct ReferralStats {
    let referralCode: String
    var totalReferrals: Int
    var successfulReferrals: Int
    var daysEarned: Int
}

/// Manages referral codes and tracking via Supabase
/// "Give 7 days Pro, Get 7 days Pro" program
final class ReferralService {
    
    static let shared = ReferralService()
    
    private let rewardDays = 7
    
    private var supabase: SupabaseClient? {
        SupabaseManager.shared.client
    }
    
    private init() {}
    
    // MARK: - Public API
    
    /// Get existing stats or create a new referral record for this user
    func getOrCreateStats(userId: String) async -> ReferralStats? {
        guard let client = supabase else { return nil }
        
        do {
            // Try to fetch existing
            let response: [ReferralRow] = try await client
                .from("user_referrals")
                .select()
                .eq("user_id", value: userId)
                .execute()
                .value
            
            if let row = response.first {
                return ReferralStats(
                    referralCode: row.referral_code,
                    totalReferrals: row.total_referrals,
                    successfulReferrals: row.successful_referrals,
                    daysEarned: row.days_earned
                )
            }
            
            // Create new
            let code = generateCode(userId: userId)
            let newRow = ReferralInsert(
                user_id: userId,
                referral_code: code,
                total_referrals: 0,
                successful_referrals: 0,
                days_earned: 0
            )
            
            try await client
                .from("user_referrals")
                .insert(newRow)
                .execute()
            
            return ReferralStats(
                referralCode: code,
                totalReferrals: 0,
                successfulReferrals: 0,
                daysEarned: 0
            )
        } catch {
            print("ReferralService: Error loading stats: \(error)")
            return nil
        }
    }
    
    /// Apply a referral code during onboarding
    func applyReferralCode(_ code: String, forUserId userId: String) async -> Bool {
        guard let client = supabase else { return false }
        
        do {
            // Find referrer
            let rows: [ReferralRow] = try await client
                .from("user_referrals")
                .select()
                .eq("referral_code", value: code.uppercased())
                .execute()
                .value
            
            guard let referrer = rows.first else { return false }
            
            // Don't allow self-referral
            if referrer.user_id == userId { return false }
            
            // Increment referrer stats
            try await client
                .from("user_referrals")
                .update([
                    "total_referrals": "\(referrer.total_referrals + 1)",
                    "successful_referrals": "\(referrer.successful_referrals + 1)",
                    "days_earned": "\(referrer.days_earned + rewardDays)",
                ])
                .eq("user_id", value: referrer.user_id)
                .execute()
            
            // Record who referred whom
            let redemption = ReferralRedemption(
                referrer_user_id: referrer.user_id,
                referred_user_id: userId,
                referral_code: code.uppercased(),
                reward_days: rewardDays
            )
            
            try await client
                .from("referral_redemptions")
                .insert(redemption)
                .execute()
            
            return true
        } catch {
            print("ReferralService: Error applying code: \(error)")
            return false
        }
    }
    
    // MARK: - Code Generation
    
    /// Generate a unique 8-char code from user ID: "CG" + first 6 hex chars
    private func generateCode(userId: String) -> String {
        let cleaned = userId.replacingOccurrences(of: "-", with: "")
        let prefix = String(cleaned.prefix(6)).uppercased()
        return "CG\(prefix)"
    }
}

// MARK: - Codable Models for Supabase

private struct ReferralRow: Codable {
    let user_id: String
    let referral_code: String
    let total_referrals: Int
    let successful_referrals: Int
    let days_earned: Int
}

private struct ReferralInsert: Codable {
    let user_id: String
    let referral_code: String
    let total_referrals: Int
    let successful_referrals: Int
    let days_earned: Int
}

private struct ReferralRedemption: Codable {
    let referrer_user_id: String
    let referred_user_id: String
    let referral_code: String
    let reward_days: Int
}
