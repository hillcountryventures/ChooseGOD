import Foundation
import os

@Observable final class DiscoverViewModel {
    // MARK: - State

    var isLoading = true
    var error: DiscoverError?

    // Lectionary
    var todaysLectionary: DailyLectionary?

    // Poetry
    var dailyPoem: Poem?

    // Artwork
    var biblicalArtwork: [MetArtwork] = []

    // Books
    var classicCommentaries: [GutendexBook] = []
    var recommendedBooks: [OpenLibraryBook] = []

    // Academic
    var biblicalScholarship: [ScholarlyWork] = []

    // MARK: - Services (use singletons)

    private let lectionaryService: LectionaryServiceProtocol
    private let hebcalService: HebcalServiceProtocol
    private let poetryService: PoetryDBServiceProtocol
    private let metService: MetMuseumServiceProtocol
    private let gutendexService: GutendexServiceProtocol
    private let openLibraryService: OpenLibraryServiceProtocol
    private let crossrefService: CrossrefMetadataServiceProtocol

    private let logger = Logger(subsystem: "com.choosegod.discover", category: "viewmodel")

    // MARK: - Init

    init(
        lectionaryService: LectionaryServiceProtocol = LectionaryService.shared,
        hebcalService: HebcalServiceProtocol = HebcalService.shared,
        poetryService: PoetryDBServiceProtocol = PoetryDBService.shared,
        metService: MetMuseumServiceProtocol = MetMuseumService.shared,
        gutendexService: GutendexServiceProtocol = GutendexService.shared,
        openLibraryService: OpenLibraryServiceProtocol = OpenLibraryService.shared,
        crossrefService: CrossrefMetadataServiceProtocol = CrossrefMetadataService.shared
    ) {
        self.lectionaryService = lectionaryService
        self.hebcalService = hebcalService
        self.poetryService = poetryService
        self.metService = metService
        self.gutendexService = gutendexService
        self.openLibraryService = openLibraryService
        self.crossrefService = crossrefService
    }

    // MARK: - Public Methods

    func loadAll() async {
        isLoading = true
        error = nil

        // Run all API calls concurrently using withTaskGroup
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadLectionary() }
            group.addTask { await self.loadPoetry() }
            group.addTask { await self.loadArtwork() }
            group.addTask { await self.loadCommentaries() }
            group.addTask { await self.loadBooks() }
            group.addTask { await self.loadScholarship() }
        }

        isLoading = false
    }

    // MARK: - Private Loaders

    private func loadLectionary() async {
        if let lectionary = await lectionaryService.getTodaysLectionary() {
            await MainActor.run {
                self.todaysLectionary = lectionary
            }
        }
    }

    private func loadPoetry() async {
        if let poem = await poetryService.getRandomDevotionalPoem() {
            await MainActor.run {
                self.dailyPoem = poem
            }
        }
    }

    private func loadArtwork() async {
        if let artwork = await metService.searchBiblicalArtwork(query: "Jesus", limit: 5) {
            await MainActor.run {
                self.biblicalArtwork = artwork
            }
        }
    }

    private func loadCommentaries() async {
        if let books = await gutendexService.getClassicCommentaries() {
            await MainActor.run {
                self.classicCommentaries = Array(books.prefix(6))
            }
        }
    }

    private func loadBooks() async {
        if let books = await openLibraryService.getRecommendedBibleCommentaries() {
            await MainActor.run {
                self.recommendedBooks = Array(books.prefix(6))
            }
        }
    }

    private func loadScholarship() async {
        if let works = await crossrefService.getBiblicalScholarship() {
            await MainActor.run {
                self.biblicalScholarship = Array(works.prefix(5))
            }
        }
    }
}

// MARK: - Error Type

enum DiscoverError: LocalizedError {
    case networkError
    case decodingError
    case unknown

    var errorDescription: String? {
        switch self {
        case .networkError:
            return "Network connection failed"
        case .decodingError:
            return "Failed to parse data"
        case .unknown:
            return "An unknown error occurred"
        }
    }
}
