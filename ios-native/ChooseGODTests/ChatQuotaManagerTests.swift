import XCTest
@testable import ChooseGODApp

class ChatQuotaManagerTests: XCTestCase {
    
    var quotaManager: ChatQuotaManager!
    
    override func setUp() {
        super.setUp()
        quotaManager = ChatQuotaManager.shared
        // Clear any existing state
        UserDefaults.standard.removeObject(forKey: "chat_seeds_used_today")
        UserDefaults.standard.removeObject(forKey: "chat_seeds_last_reset")
    }
    
    override func tearDown() {
        // Clean up
        UserDefaults.standard.removeObject(forKey: "chat_seeds_used_today")
        UserDefaults.standard.removeObject(forKey: "chat_seeds_last_reset")
        super.tearDown()
    }
    
    func testInitialState() {
        // Fresh state should have full seeds available
        XCTAssertEqual(quotaManager.remainingSeeds, 3)
        XCTAssertTrue(quotaManager.canSendMessage(isPremium: false))
    }
    
    func testSeedConsumption() {
        // Consume a seed
        quotaManager.consumeSeed()
        XCTAssertEqual(quotaManager.remainingSeeds, 2)
        
        // Consume all seeds
        quotaManager.consumeSeed()
        quotaManager.consumeSeed() 
        XCTAssertEqual(quotaManager.remainingSeeds, 0)
        XCTAssertFalse(quotaManager.canSendMessage(isPremium: false))
    }
    
    func testPremiumBypass() {
        // Premium users should always be able to send messages
        quotaManager.consumeSeed()
        quotaManager.consumeSeed()
        quotaManager.consumeSeed() // Use all seeds
        
        XCTAssertEqual(quotaManager.remainingSeeds, 0)
        XCTAssertTrue(quotaManager.canSendMessage(isPremium: true)) // Premium bypass
        XCTAssertFalse(quotaManager.canSendMessage(isPremium: false)) // Free user blocked
    }
    
    func testDailyReset() {
        // Consume all seeds
        quotaManager.consumeSeed()
        quotaManager.consumeSeed()
        quotaManager.consumeSeed()
        XCTAssertEqual(quotaManager.remainingSeeds, 0)
        
        // Simulate next day by setting last reset to yesterday
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        UserDefaults.standard.set(yesterday.timeIntervalSince1970, forKey: "chat_seeds_last_reset")
        
        // Check if reset is needed (this would normally happen on app launch)
        quotaManager.checkDailyReset()
        XCTAssertEqual(quotaManager.remainingSeeds, 3) // Should reset to full
    }
    
    func testPersistence() {
        // Use some seeds
        quotaManager.consumeSeed()
        quotaManager.consumeSeed()
        let remaining = quotaManager.remainingSeeds
        
        // Create new instance to test persistence
        let newManager = ChatQuotaManager()
        XCTAssertEqual(newManager.remainingSeeds, remaining)
    }
}