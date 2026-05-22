import Foundation
import Supabase

/// Full-offline Bible: download an entire translation (~5 MB) to disk so the
/// reader works with no signal (YouVersion-style). Stored as per-book JSON in
/// Application Support so chapter lookups read a small file, not a 5 MB blob.
///
/// Layout: `…/Application Support/OfflineBible/{TRANSLATION}/{Book}.json`
///         `…/{TRANSLATION}/_manifest.json`
@Observable
final class OfflineBibleStore {

    static let shared = OfflineBibleStore()

    struct Manifest: Codable {
        let translation: String
        let verseCount: Int
        let downloadedAt: Date
        let complete: Bool
    }

    private struct StoredVerse: Codable {
        let book: String
        let chapter: Int
        let verse: Int
        let text: String
    }

    /// Row decoded from `bible_verses` during download.
    private struct VerseRow: Decodable {
        let book: String
        let chapter: Int
        let verse: Int
        let text: String
    }

    /// Cached list of which translations are fully downloaded (for UI).
    private(set) var downloaded: Set<String> = []

    private let fm = FileManager.default
    private let pageSize = 1000

    private init() {
        refreshDownloadedSet()
    }

    // MARK: - Paths

    private var rootDir: URL {
        let base = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("OfflineBible", isDirectory: true)
    }

    private func dir(for translation: BibleTranslation) -> URL {
        rootDir.appendingPathComponent(translation.rawValue, isDirectory: true)
    }

    private func bookFile(_ book: String, _ translation: BibleTranslation) -> URL {
        dir(for: translation).appendingPathComponent("\(book).json")
    }

    private func manifestFile(_ translation: BibleTranslation) -> URL {
        dir(for: translation).appendingPathComponent("_manifest.json")
    }

    // MARK: - Status

    func isDownloaded(_ translation: BibleTranslation) -> Bool {
        guard let data = try? Data(contentsOf: manifestFile(translation)),
              let manifest = try? JSONDecoder().decode(Manifest.self, from: data) else {
            return false
        }
        return manifest.complete
    }

    func sizeBytes(_ translation: BibleTranslation) -> Int64 {
        guard let files = try? fm.contentsOfDirectory(at: dir(for: translation),
                                                       includingPropertiesForKeys: [.fileSizeKey]) else {
            return 0
        }
        return files.reduce(0) { sum, url in
            let size = (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0
            return sum + Int64(size)
        }
    }

    func delete(_ translation: BibleTranslation) {
        try? fm.removeItem(at: dir(for: translation))
        refreshDownloadedSet()
    }

    private func refreshDownloadedSet() {
        var set = Set<String>()
        for t in BibleTranslation.allCases where isDownloaded(t) {
            set.insert(t.rawValue)
        }
        downloaded = set
    }

    // MARK: - Read (offline chapter)

    /// Returns the chapter from local storage, or nil if not downloaded.
    func chapter(book: String, chapter: Int, translation: BibleTranslation) -> [Verse]? {
        guard let data = try? Data(contentsOf: bookFile(book, translation)),
              let verses = try? JSONDecoder().decode([StoredVerse].self, from: data) else {
            return nil
        }
        let chapterVerses = verses
            .filter { $0.chapter == chapter }
            .sorted { $0.verse < $1.verse }
        guard !chapterVerses.isEmpty else { return nil }
        return chapterVerses.map {
            Verse(id: "\($0.book)-\($0.chapter)-\($0.verse)",
                  book: $0.book, chapter: $0.chapter, verse: $0.verse,
                  text: $0.text, translation: translation.rawValue)
        }
    }

    // MARK: - Download

    enum OfflineError: LocalizedError {
        case noClient, emptyTranslation
        var errorDescription: String? {
            switch self {
            case .noClient: return "Couldn't connect to download."
            case .emptyTranslation: return "No verses found for this translation."
            }
        }
    }

    /// Download an entire translation. Paginates `bible_verses`, groups by book,
    /// writes per-book files, then a completion manifest. `progress` is 0…1.
    func download(_ translation: BibleTranslation,
                  progress: @escaping (Double) -> Void) async throws {
        let supabase = try SupabaseManager.shared.requireClient()

        // Exact count for accurate progress.
        let countResp = try await supabase
            .from("bible_verses")
            .select("*", head: true, count: .exact)
            .eq("translation", value: translation.rawValue)
            .execute()
        let total = countResp.count ?? 0
        guard total > 0 else { throw OfflineError.emptyTranslation }

        // Prepare directory (clear any partial prior download).
        let translationDir = dir(for: translation)
        try? fm.removeItem(at: translationDir)
        try fm.createDirectory(at: translationDir, withIntermediateDirectories: true)

        var byBook: [String: [StoredVerse]] = [:]
        var fetched = 0
        var offset = 0

        while offset < total {
            let rows: [VerseRow] = try await supabase
                .from("bible_verses")
                .select("book, chapter, verse, text")
                .eq("translation", value: translation.rawValue)
                .order("id")
                .range(from: offset, to: offset + pageSize - 1)
                .execute()
                .value

            if rows.isEmpty { break }
            for r in rows {
                byBook[r.book, default: []].append(
                    StoredVerse(book: r.book, chapter: r.chapter, verse: r.verse, text: r.text)
                )
            }
            fetched += rows.count
            offset += pageSize
            // Reserve the last 5% for the disk-write phase.
            let frac = min(0.95, Double(fetched) / Double(total))
            await MainActor.run { progress(frac) }
        }

        // Write per-book files.
        let encoder = JSONEncoder()
        for (book, verses) in byBook {
            let data = try encoder.encode(verses)
            try data.write(to: bookFile(book, translation), options: .atomic)
        }

        // Completion manifest.
        let manifest = Manifest(translation: translation.rawValue,
                                verseCount: fetched,
                                downloadedAt: Date(),
                                complete: true)
        let manifestData = try encoder.encode(manifest)
        try manifestData.write(to: manifestFile(translation), options: .atomic)

        await MainActor.run {
            progress(1.0)
            self.refreshDownloadedSet()
        }
    }
}
