import Foundation

// MARK: - Poetry Models (PoetryDB)

struct Poem: Codable, Hashable {
    let id: String
    let title: String
    let author: String
    let linecount: String
    let lines: [String]

    enum CodingKeys: String, CodingKey {
        case id = "id"
        case title
        case author
        case linecount
        case lines
    }

    var fullText: String {
        lines.joined(separator: "\n")
    }
}

// MARK: - Met Museum Models

struct MetArtwork: Codable, Hashable {
    let objectID: Int
    let title: String
    let artistDisplayName: String
    let artistWikidata_URL: String?
    let objectDate: String?
    let medium: String?
    let primaryImage: String?
    let primaryImageSmall: String?
    let creditLine: String?
    let objectURL: String?
    let isPublicDomain: Bool

    enum CodingKeys: String, CodingKey {
        case objectID
        case title
        case artistDisplayName
        case artistWikidata_URL = "artistWikidata_URL"
        case objectDate
        case medium
        case primaryImage
        case primaryImageSmall
        case creditLine
        case objectURL
        case isPublicDomain
    }

    var imageURL: URL? {
        primaryImage.flatMap { URL(string: $0) }
    }

    var thumbURL: URL? {
        primaryImageSmall.flatMap { URL(string: $0) }
    }
}

struct MetSearchResponse: Codable {
    let objectIDs: [Int]?

    enum CodingKeys: String, CodingKey {
        case objectIDs
    }
}

// MARK: - Gutendex Models

struct GutendexBook: Codable, Hashable {
    let id: Int
    let title: String
    let authors: [GutendexAuthor]
    let coverImage: String?
    let formats: GutendexFormats

    enum CodingKeys: String, CodingKey {
        case id, title, authors
        case coverImage = "cover_image"
        case formats
    }
}

struct GutendexAuthor: Codable, Hashable {
    let name: String
    let birth_year: Int?
    let death_year: Int?
}

struct GutendexFormats: Codable, Hashable {
    let html: String?
    let epub: String?
    let kindle: String?
    let txt: String?
}

struct GutendexResponse: Codable {
    let count: Int
    let next: String?
    let previous: String?
    let results: [GutendexBook]
}

// MARK: - Open Library Models

struct OpenLibraryBook: Codable, Hashable {
    let key: String
    let title: String
    let author_name: [String]?
    let first_publish_year: Int?
    let isbn: [String]?
    let cover_i: Int?
    let first_sentence: [String]?

    var coverImageURL: URL? {
        guard let coverId = cover_i else { return nil }
        return URL(string: "https://covers.openlibrary.org/b/id/\(coverId)-M.jpg")
    }

    var openLibraryURL: URL? {
        URL(string: "https://openlibrary.org\(key)")
    }
}

struct OpenLibraryResponse: Codable {
    let numFound: Int
    let docs: [OpenLibraryBook]

    enum CodingKeys: String, CodingKey {
        case numFound = "num_found"
        case docs
    }
}

// MARK: - Crossref Models

struct ScholarlyWork: Codable, Hashable {
    let DOI: String
    let title: [String]?
    let author: [CrossrefAuthor]?
    let containerTitle: [String]?
    let issued: CrossrefDate?
    let abstract: String?
    let URL: String?

    enum CodingKeys: String, CodingKey {
        case DOI
        case title, author, containerTitle
        case issued
        case abstract, URL
    }

    var displayTitle: String {
        title?.first ?? "Untitled"
    }

    var displayAuthors: String {
        guard let authors = author, !authors.isEmpty else { return "Unknown" }
        return authors.prefix(3).map { $0.family ?? "Unknown" }.joined(separator: ", ")
    }

    var doiURL: Foundation.URL? {
        // Fully-qualified: this struct has a `URL` String field that shadows the type.
        Foundation.URL(string: "https://doi.org/\(DOI)")
    }
}

struct CrossrefAuthor: Codable, Hashable {
    let family: String?
    let given: String?

    var displayName: String {
        if let family = family, let given = given {
            return "\(given) \(family)"
        }
        return family ?? given ?? "Unknown"
    }
}

struct CrossrefDate: Codable, Hashable {
    let dateTime: String?
    let timestamp: Int?

    enum CodingKeys: String, CodingKey {
        case dateTime = "date-time"
        case timestamp
    }

    var dateString: String {
        if let dateTime = dateTime {
            let components = dateTime.split(separator: "-").map(String.init)
            return components.prefix(3).joined(separator: "-")
        }
        return "Unknown"
    }
}

struct CrossrefResponse: Codable {
    let message: CrossrefMessage
}

struct CrossrefMessage: Codable {
    let items: [ScholarlyWork]

    enum CodingKeys: String, CodingKey {
        case items
    }
}
