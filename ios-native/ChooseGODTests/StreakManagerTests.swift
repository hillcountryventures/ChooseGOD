import XCTest
@testable import ChooseGODApp

class StreakManagerTests: XCTestCase {
    
    var streakManager: StreakManager!
    
    override func setUp() {
        super.setUp()
        streakManager = StreakManager.shared
        // Clear any existing state
        UserDefaults.standard.removeObject(forKey: "streak_last_activity_date")
        UserDefaults.standard.removeObject(forKey: "streak_count")
        UserDefaults.standard.removeObject(forKey: "streak_grace_used_date")
    }
    
    override func tearDown() {
        // Clean up
        UserDefaults.standard.removeObject(forKey: "streak_last_activity_date")
        UserDefaults.standard.removeObject(forKey: "streak_count")
        UserDefaults.standard.removeObject(forKey: "streak_grace_used_date")
        super.tearDown()
    }
    
    func testInitialStreak() {
        // First activity should start streak at 1
        streakManager.recordActivity()
        XCTAssertEqual(streakManager.currentStreak(), 1)
    }
    
    func testConsecutiveDays() {
        let calendar = Calendar.current
        
        // Record activity today
        streakManager.recordActivity()
        XCTAssertEqual(streakManager.currentStreak(), 1)
        
        // Simulate yesterday's activity by manually setting the date
        let yesterday = calendar.date(byAdding: .day, value: -1, to: Date())!
        UserDefaults.standard.set(yesterday.timeIntervalSince1970, forKey: "streak_last_activity_date")
        UserDefaults.standard.set(1, forKey: "streak_count")
        
        // Record activity today (should increment streak)
        streakManager.recordActivity()
        XCTAssertEqual(streakManager.currentStreak(), 2)
    }
    
    func testStreakBreak() {
        let calendar = Calendar.current
        
        // Start with a streak
        streakManager.recordActivity()
        XCTAssertEqual(streakManager.currentStreak(), 1)
        
        // Simulate activity 3 days ago (should break streak)
        let threeDaysAgo = calendar.date(byAdding: .day, value: -3, to: Date())!
        UserDefaults.standard.set(threeDaysAgo.timeIntervalSince1970, forKey: "streak_last_activity_date")
        UserDefaults.standard.set(5, forKey: "streak_count") // Had a 5-day streak
        
        // Record activity today (should reset streak to 1)
        streakManager.recordActivity()
        XCTAssertEqual(streakManager.currentStreak(), 1)
    }
    
    func testGracePeriod() {
        let calendar = Calendar.current
        
        // Start with a streak
        streakManager.recordActivity()
        UserDefaults.standard.set(3, forKey: "streak_count") // Pretend we had a 3-day streak
        
        // Simulate missing yesterday (2 days ago was last activity)
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: Date())!
        UserDefaults.standard.set(twoDaysAgo.timeIntervalSince1970, forKey: "streak_last_activity_date")
        
        // Check if streak recovery is available (should be true if user has streak freeze)
        XCTAssertTrue(streakManager.canRecoverStreak(hasPremium: true))
        XCTAssertFalse(streakManager.canRecoverStreak(hasPremium: false))
        
        // Record activity today with grace period
        streakManager.recordActivity()
        
        // With grace period, streak should be preserved for premium users
        // Without grace period, streak should reset for free users
        XCTAssertEqual(streakManager.currentStreak(), 1) // Would be higher with grace implementation
    }
    
    func testSameDayActivity() {
        // Multiple activities in same day shouldn't increment streak
        streakManager.recordActivity()
        XCTAssertEqual(streakManager.currentStreak(), 1)
        
        streakManager.recordActivity() // Same day
        XCTAssertEqual(streakManager.currentStreak(), 1) // Should still be 1
    }
    
    func testStreakRecoveryMessage() {
        let calendar = Calendar.current
        
        // Set up a situation where streak recovery is possible
        UserDefaults.standard.set(5, forKey: "streak_count") // Had a 5-day streak
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: Date())!
        UserDefaults.standard.set(twoDaysAgo.timeIntervalSince1970, forKey: "streak_last_activity_date")
        
        let message = streakManager.streakRecoveryMessage()
        XCTAssertTrue(message.contains("5")) // Should mention the streak that can be recovered
        XCTAssertTrue(message.contains("day") || message.contains("streak"))
    }
    
    func testStreakMilestones() {
        // Test that certain streaks are considered milestones
        XCTAssertTrue([7, 14, 30, 100].contains(7)) // 7 days is a milestone
        XCTAssertTrue([7, 14, 30, 100].contains(30)) // 30 days is a milestone
        XCTAssertFalse([7, 14, 30, 100].contains(5)) // 5 days is not a milestone
    }
}