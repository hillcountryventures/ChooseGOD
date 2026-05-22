import Foundation

// MARK: - Mock Auth Service

final class MockAuthService: AuthServiceProtocol {
    var currentUser: User? = .preview
    var isAuthenticated: Bool { currentUser != nil }
    
    func signInWithApple() async throws -> User {
        try await Task.sleep(nanoseconds: 500_000_000) // 0.5s delay
        return .preview
    }
    
    func signInWithEmail(email: String, password: String) async throws -> User {
        try await Task.sleep(nanoseconds: 500_000_000)
        
        if email == "test@test.com" && password == "password" {
            return .preview
        }
        throw AuthError.invalidCredentials
    }
    
    func signUp(email: String, password: String, name: String) async throws -> User {
        try await Task.sleep(nanoseconds: 500_000_000)
        return User(
            id: UUID().uuidString,
            email: email,
            displayName: name,
            avatarUrl: nil,
            isPremium: false,
            createdAt: Date()
        )
    }
    
    func signOut() async throws {
        currentUser = nil
    }
    
    func resetPassword(email: String) async throws {
        try await Task.sleep(nanoseconds: 300_000_000)
    }
    
    func restoreSession() async -> Session? {
        nil
    }
    
    func deleteAccount() async throws {
        currentUser = nil
    }
}

// MARK: - Mock Bible Service

final class MockBibleService: BibleServiceProtocol {
    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [Verse] {
        // Return sample verses
        (1...31).map { verseNum in
            Verse(
                id: "\(book)-\(chapter)-\(verseNum)",
                book: book,
                chapter: chapter,
                verse: verseNum,
                text: "This is verse \(verseNum) of \(book) chapter \(chapter). Lorem ipsum dolor sit amet.",
                translation: translation.rawValue
            )
        }
    }
    
    func searchVerses(query: String, translation: BibleTranslation, limit: Int) async throws -> [Verse] {
        []
    }
    
    func getDailyVerse() async throws -> Verse {
        Verse(
            id: "john-3-16",
            book: "John",
            chapter: 3,
            verse: 16,
            text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
            translation: "KJV"
        )
    }
}

// MARK: - Mock Subscription Service

final class MockSubscriptionService: SubscriptionServiceProtocol {
    var isPremium: Bool = true
    
    func configure(userId: String?) async {}
    
    func checkPremiumStatus() async -> Bool {
        isPremium
    }
    
    func purchase(package: SubscriptionPackage) async throws -> Bool {
        isPremium = true
        return true
    }
    
    func restorePurchases() async throws -> Bool {
        true
    }
}

// MARK: - Mock Notification Service

final class MockNotificationService: NotificationServiceProtocol {
    func requestPermission() async throws -> Bool {
        true
    }
    
    func scheduleDailyReminder(at time: DateComponents, title: String, body: String) async throws {}
    
    func cancelAllNotifications() {}
}

// MARK: - Protocols

protocol BibleServiceProtocol {
    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [Verse]
    func searchVerses(query: String, translation: BibleTranslation, limit: Int) async throws -> [Verse]
    func getDailyVerse() async throws -> Verse
}

protocol SubscriptionServiceProtocol {
    var isPremium: Bool { get }
    
    func configure(userId: String?) async
    func checkPremiumStatus() async -> Bool
    func purchase(package: SubscriptionPackage) async throws -> Bool
    func restorePurchases() async throws -> Bool
}

protocol NotificationServiceProtocol {
    func requestPermission() async throws -> Bool
    func scheduleDailyReminder(at time: DateComponents, title: String, body: String) async throws
    func cancelAllNotifications()
}

// MARK: - Supporting Types

struct Verse: Identifiable, Codable, Equatable {
    let id: String
    let book: String
    let chapter: Int
    let verse: Int
    let text: String
    let translation: String
    
    var reference: String {
        "\(book) \(chapter):\(verse)"
    }
}

enum SubscriptionPackage: String {
    case monthly
    case annual
    case foundingMember

    var displayName: String {
        switch self {
        case .monthly: return "Monthly"
        case .annual: return "Annual"
        case .foundingMember: return "Founding Member"
        }
    }
}

// RevenueCatService is in Core/Services/RevenueCat/RevenueCatService.swift

// NOTE: External service mocks (Lectionary, Hebcal, Poetry, MetMuseum, Gutendex, OpenLibrary, Crossref)
// are not needed here since the real services are used throughout the app and have their own
// implementations. The real services are in Core/Services/External/ and have full functionality.

// NOTE: Phase 2 service mocks (ScriptureAPIBibleService, AbibliaDigitalService) are not needed
// since the real services exist in Core/Services/External/ and BibleServiceRouter handles routing
