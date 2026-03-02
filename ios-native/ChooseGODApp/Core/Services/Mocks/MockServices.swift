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
    
    var displayName: String {
        switch self {
        case .monthly: return "Monthly"
        case .annual: return "Annual"
        }
    }
}

// RevenueCatService is in Core/Services/RevenueCat/RevenueCatService.swift

// MARK: - Mock External Content Services

final class MockLectionaryService: LectionaryServiceProtocol {
    func getTodaysLectionary() async -> DailyLectionary? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return DailyLectionary(
            date: Date(),
            day: LiturgicalDay(
                date: ISO8601DateFormatter().string(from: Date()),
                name: "First Sunday of Advent",
                season: .advent,
                color: "Purple",
                readings: [
                    LectionaryReading(book: "Isaiah", chapter: 64, verseStart: 1, verseEnd: 9, label: "Old Testament"),
                    LectionaryReading(book: "Psalms", chapter: 80, verseStart: 1, verseEnd: 7, label: "Psalm"),
                    LectionaryReading(book: "1 Corinthians", chapter: 1, verseStart: 3, verseEnd: 9, label: "Epistle"),
                    LectionaryReading(book: "Mark", chapter: 13, verseStart: 24, verseEnd: 37, label: "Gospel")
                ]
            ),
            readings: []
        )
    }

    func getLectionary(for date: Date) async -> DailyLectionary? {
        await getTodaysLectionary()
    }

    func getLiturgicalDay(for date: Date) async -> LiturgicalDay? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return LiturgicalDay(
            date: ISO8601DateFormatter().string(from: date),
            name: "Sunday",
            season: .ordinary,
            color: "Green",
            readings: []
        )
    }
}

final class MockHebcalService: HebcalServiceProtocol {
    func getHebrewDate(for gregorianDate: Date) async -> HebrewDate? {
        try? await Task.sleep(nanoseconds: 200_000_000)
        return HebrewDate(
            gregorianDate: gregorianDate,
            hebrewDateString: "18 Tevet 5784",
            hebrewYear: 5784,
            hebrewMonth: 10,
            hebrewDay: 18
        )
    }

    func getTorahPortion(for date: Date) async -> TorahPortion? {
        try? await Task.sleep(nanoseconds: 200_000_000)
        return TorahPortion(
            id: "parashat-vayigash",
            name: "Parashat Vayigash",
            hebrewName: "פרשת ויגש",
            date: date,
            aliyot: ["Genesis 44:18-45:7", "Genesis 45:8-45:18"]
        )
    }

    func getTodaysHebrewInfo() async -> (date: HebrewDate?, torah: TorahPortion?)? {
        let date = await getHebrewDate(for: Date())
        let torah = await getTorahPortion(for: Date())
        return (date, torah)
    }
}

final class MockPoetryDBService: PoetryDBServiceProtocol {
    func getDevotionalPoem() async -> Poem? {
        try? await Task.sleep(nanoseconds: 200_000_000)
        return Poem(
            id: "george-herbert_love-iii",
            title: "Love (III)",
            author: "George Herbert",
            linecount: "15",
            lines: [
                "Love bade me welcome; yet my soul drew back,",
                "Guilty of dust and sin;",
                "But quick-ey'd Love, observing me grow slack",
                "From my first entrance in,",
                "Drew nearer to me, sweetly questioning,",
                "If I lack'd anything."
            ]
        )
    }

    func getPoemsByAuthor(_ author: String) async -> [Poem]? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return [
            Poem(
                id: "john-donne_holy-sonnet-10",
                title: "Holy Sonnet 10",
                author: author,
                linecount: "14",
                lines: ["Death, be not proud, though some have called thee", "Mighty and dreadful, for thou art not so;"]
            )
        ]
    }

    func getRandomDevotionalPoem() async -> Poem? {
        await getDevotionalPoem()
    }
}

final class MockMetMuseumService: MetMuseumServiceProtocol {
    func searchBiblicalArtwork(query: String, limit: Int) async -> [MetArtwork]? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return [
            MetArtwork(
                objectID: 459131,
                title: "The Nativity",
                artistDisplayName: "Unknown",
                artistWikidata_URL: nil,
                objectDate: "15th Century",
                medium: "Oil on panel",
                primaryImage: "https://images.metmuseum.org/CRDImages/asa/original/vs_459131_O2001_sf.jpg",
                primaryImageSmall: "https://images.metmuseum.org/CRDImages/asa/web-large/vs_459131_O2001_sf.jpg",
                creditLine: "The Metropolitan Museum of Art",
                objectURL: "https://www.metmuseum.org/art/collection/search/459131",
                isPublicDomain: true
            )
        ]
    }

    func getArtworkDetails(objectID: Int) async -> MetArtwork? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return MetArtwork(
            objectID: objectID,
            title: "Biblical Artwork",
            artistDisplayName: "Unknown",
            artistWikidata_URL: nil,
            objectDate: "Unknown Date",
            medium: "Unknown",
            primaryImage: nil,
            primaryImageSmall: nil,
            creditLine: "The Metropolitan Museum of Art",
            objectURL: nil,
            isPublicDomain: true
        )
    }

    func getRandomBiblicalArtwork() async -> MetArtwork? {
        await searchBiblicalArtwork(query: "Jesus", limit: 1)?.first
    }
}

final class MockGutendexService: GutendexServiceProtocol {
    func searchBooks(query: String, limit: Int) async -> [GutendexBook]? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return [
            GutendexBook(
                id: 1,
                title: "Gospel of John",
                authors: [GutendexAuthor(name: "John", birth_year: nil, death_year: nil)],
                coverImage: "https://www.gutendex.com/cache/epub/1/pg1.jpg",
                formats: GutendexFormats(html: nil, epub: nil, kindle: nil, txt: nil)
            )
        ]
    }

    func getClassicCommentaries() async -> [GutendexBook]? {
        try? await Task.sleep(nanoseconds: 500_000_000)
        return [
            GutendexBook(
                id: 2,
                title: "Spurgeon's Commentary",
                authors: [GutendexAuthor(name: "Charles Haddon Spurgeon", birth_year: 1834, death_year: 1892)],
                coverImage: nil,
                formats: GutendexFormats(html: nil, epub: nil, kindle: nil, txt: nil)
            )
        ]
    }
}

final class MockOpenLibraryService: OpenLibraryServiceProtocol {
    func searchBooks(query: String, limit: Int) async -> [OpenLibraryBook]? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return [
            OpenLibraryBook(
                key: "/works/OL45883W",
                title: "The Bible Handbook",
                author_name: ["Unknown"],
                first_publish_year: 2020,
                isbn: ["9780123456789"],
                cover_i: 1,
                first_sentence: ["A comprehensive guide to biblical study"]
            )
        ]
    }

    func getRecommendedBibleCommentaries() async -> [OpenLibraryBook]? {
        try? await Task.sleep(nanoseconds: 500_000_000)
        return await searchBooks(query: "Bible commentary", limit: 10)
    }

    func getRecommendedTheologyBooks() async -> [OpenLibraryBook]? {
        try? await Task.sleep(nanoseconds: 500_000_000)
        return await searchBooks(query: "Christian theology", limit: 10)
    }
}

final class MockCrossrefMetadataService: CrossrefMetadataServiceProtocol {
    func searchScholarlyWorks(query: String, limit: Int) async -> [ScholarlyWork]? {
        try? await Task.sleep(nanoseconds: 300_000_000)
        return [
            ScholarlyWork(
                DOI: "10.1234/example.doi",
                title: ["A Study of Biblical Exegesis"],
                author: [CrossrefAuthor(family: "Smith", given: "John")],
                containerTitle: ["Journal of Biblical Studies"],
                issued: CrossrefDate(dateTime: "2023-01-15T00:00:00Z", timestamp: nil),
                abstract: "An important study in biblical scholarship.",
                URL: "https://doi.org/10.1234/example.doi"
            )
        ]
    }

    func getBiblicalScholarship() async -> [ScholarlyWork]? {
        try? await Task.sleep(nanoseconds: 500_000_000)
        return await searchScholarlyWorks(query: "biblical exegesis", limit: 10)
    }
}

// MARK: - Mock Phase 2 Services

final class MockScriptureAPIBibleService: ScriptureAPIBibleServiceProtocol {
    func fetchChapter(book: String, chapter: Int, translation: BibleTranslation) async throws -> [BibleVerse] {
        try await Task.sleep(nanoseconds: 500_000_000)
        return (1...31).map { verseNum in
            BibleVerse(
                id: "\(book)-\(chapter)-\(verseNum)",
                orgId: "test",
                bookId: book,
                bookName: book,
                chapter: chapter,
                verse: verseNum,
                text: "This is verse \(verseNum) from \(translation.displayName). Lorem ipsum dolor sit amet.",
                verseText: "Verse \(verseNum)"
            )
        }
    }

    func fetchVerse(book: String, chapter: Int, verse: Int, translation: BibleTranslation) async throws -> BibleVerse? {
        try await Task.sleep(nanoseconds: 300_000_000)
        return BibleVerse(
            id: "\(book)-\(chapter)-\(verse)",
            orgId: "test",
            bookId: book,
            bookName: book,
            chapter: chapter,
            verse: verse,
            text: "This is verse \(verse) from \(translation.displayName).",
            verseText: "Verse \(verse)"
        )
    }
}

final class MockAbibliaDigitalService: AbibliaDigitalServiceProtocol {
    func fetchChapter(book: String, chapter: Int) async throws -> [AbibliaVerse] {
        try await Task.sleep(nanoseconds: 500_000_000)
        return (1...31).map { verseNum in
            AbibliaVerse(
                id: "\(book)-\(chapter)-\(verseNum)",
                book: book,
                chapter: chapter,
                number: verseNum,
                text: "Este é o versículo \(verseNum) em Português (NVI). Lorem ipsum dolor sit amet.",
                version: "nvi"
            )
        }
    }

    func fetchVerse(book: String, chapter: Int, verse: Int) async throws -> AbibliaVerse? {
        try await Task.sleep(nanoseconds: 300_000_000)
        return AbibliaVerse(
            id: "\(book)-\(chapter)-\(verse)",
            book: book,
            chapter: chapter,
            number: verse,
            text: "Este é o versículo \(verse) em Português (NVI).",
            version: "nvi"
        )
    }
}
