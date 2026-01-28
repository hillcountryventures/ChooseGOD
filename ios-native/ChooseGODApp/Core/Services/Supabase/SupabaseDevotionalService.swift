import Foundation
import Supabase

/// Protocol for devotional service
protocol DevotionalServiceProtocol {
    func getAllSeries() async throws -> [DevotionalSeries]
    func getSeries(id: String) async throws -> DevotionalSeries
    func getSeriesBySlug(slug: String) async throws -> DevotionalSeries
    
    func getDay(seriesId: String, dayNumber: Int) async throws -> DevotionalDay
    func getDaysForSeries(seriesId: String) async throws -> [DevotionalDay]
    
    func getEnrollments(userId: String) async throws -> [UserSeriesEnrollment]
    func getPrimaryEnrollment(userId: String) async throws -> UserSeriesEnrollment?
    func enrollInSeries(userId: String, seriesId: String, isPrimary: Bool) async throws -> UserSeriesEnrollment
    func completeDay(enrollmentId: String, dayNumber: Int) async throws
    func unenroll(enrollmentId: String) async throws
}

/// Supabase-backed devotional service
final class SupabaseDevotionalService: DevotionalServiceProtocol {
    
    private var supabase: SupabaseClient {
        guard let client = SupabaseManager.shared.client else {
            fatalError("Supabase client not initialized")
        }
        return client
    }
    
    // MARK: - Series
    
    func getAllSeries() async throws -> [DevotionalSeries] {
        try await supabase
            .from("devotional_series")
            .select()
            .order("title")
            .execute()
            .value
    }
    
    func getSeries(id: String) async throws -> DevotionalSeries {
        try await supabase
            .from("devotional_series")
            .select()
            .eq("id", value: id)
            .single()
            .execute()
            .value
    }
    
    func getSeriesBySlug(slug: String) async throws -> DevotionalSeries {
        try await supabase
            .from("devotional_series")
            .select()
            .eq("slug", value: slug)
            .single()
            .execute()
            .value
    }
    
    // MARK: - Days
    
    func getDay(seriesId: String, dayNumber: Int) async throws -> DevotionalDay {
        try await supabase
            .from("devotional_days")
            .select()
            .eq("series_id", value: seriesId)
            .eq("day_number", value: dayNumber)
            .single()
            .execute()
            .value
    }
    
    func getDaysForSeries(seriesId: String) async throws -> [DevotionalDay] {
        try await supabase
            .from("devotional_days")
            .select()
            .eq("series_id", value: seriesId)
            .order("day_number")
            .execute()
            .value
    }
    
    // MARK: - Enrollments
    
    func getEnrollments(userId: String) async throws -> [UserSeriesEnrollment] {
        // First get enrollments
        var enrollments: [UserSeriesEnrollment] = try await supabase
            .from("user_series_enrollments")
            .select()
            .eq("user_id", value: userId)
            .eq("is_active", value: true)
            .order("is_primary", ascending: false)
            .execute()
            .value
        
        // Then fetch series for each enrollment
        let seriesIds = enrollments.map { $0.seriesId }
        let allSeries: [DevotionalSeries] = try await supabase
            .from("devotional_series")
            .select()
            .in("id", values: seriesIds)
            .execute()
            .value
        
        // Map series to enrollments
        let seriesMap = Dictionary(uniqueKeysWithValues: allSeries.map { ($0.id, $0) })
        for i in enrollments.indices {
            enrollments[i].series = seriesMap[enrollments[i].seriesId]
        }
        
        return enrollments
    }
    
    func getPrimaryEnrollment(userId: String) async throws -> UserSeriesEnrollment? {
        let enrollments = try await getEnrollments(userId: userId)
        return enrollments.first { $0.isPrimary }
    }
    
    func enrollInSeries(userId: String, seriesId: String, isPrimary: Bool) async throws -> UserSeriesEnrollment {
        struct NewEnrollment: Codable {
            let userId: String
            let seriesId: String
            let currentDay: Int
            let completedDays: [Int]
            let isActive: Bool
            let isPrimary: Bool
            let reminderTime: String
            
            enum CodingKeys: String, CodingKey {
                case userId = "user_id"
                case seriesId = "series_id"
                case currentDay = "current_day"
                case completedDays = "completed_days"
                case isActive = "is_active"
                case isPrimary = "is_primary"
                case reminderTime = "reminder_time"
            }
        }
        
        // If setting as primary, unset other primaries first
        if isPrimary {
            try await supabase
                .from("user_series_enrollments")
                .update(["is_primary": false])
                .eq("user_id", value: userId)
                .eq("is_primary", value: true)
                .execute()
        }
        
        let enrollment = NewEnrollment(
            userId: userId,
            seriesId: seriesId,
            currentDay: 1,
            completedDays: [],
            isActive: true,
            isPrimary: isPrimary,
            reminderTime: "07:00:00"
        )
        
        return try await supabase
            .from("user_series_enrollments")
            .insert(enrollment)
            .select()
            .single()
            .execute()
            .value
    }
    
    func completeDay(enrollmentId: String, dayNumber: Int) async throws {
        // Get current enrollment
        var enrollment: UserSeriesEnrollment = try await supabase
            .from("user_series_enrollments")
            .select()
            .eq("id", value: enrollmentId)
            .single()
            .execute()
            .value
        
        // Add day to completed if not already
        if !enrollment.completedDays.contains(dayNumber) {
            enrollment.completedDays.append(dayNumber)
            enrollment.completedDays.sort()
        }
        
        struct UpdateData: Codable {
            let completedDays: [Int]
            let currentDay: Int
            let lastActivityAt: Date
            
            enum CodingKeys: String, CodingKey {
                case completedDays = "completed_days"
                case currentDay = "current_day"
                case lastActivityAt = "last_activity_at"
            }
        }
        
        let update = UpdateData(
            completedDays: enrollment.completedDays,
            currentDay: dayNumber + 1,
            lastActivityAt: Date()
        )
        
        try await supabase
            .from("user_series_enrollments")
            .update(update)
            .eq("id", value: enrollmentId)
            .execute()
    }
    
    func unenroll(enrollmentId: String) async throws {
        try await supabase
            .from("user_series_enrollments")
            .update(["is_active": false])
            .eq("id", value: enrollmentId)
            .execute()
    }
}
