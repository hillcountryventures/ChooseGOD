import os
import Foundation

/// Unified Bible audio service combining AudioTreasure (free KJV) and Bible Brain API
final class BibleAudioService {
    static let shared = BibleAudioService()
    
    // MARK: - AudioTreasure (Public Domain KJV)
    
    private let audioTreasureBaseURL = "https://audiotreasure.com/content/KJV_AT"
    
    /// Book name mapping for AudioTreasure URL format
    private let bookNameMap: [String: (number: String, urlName: String)] = [
        "Genesis": ("01", "Genesis"), "Exodus": ("02", "Exodus"),
        "Leviticus": ("03", "Leviticus"), "Numbers": ("04", "Numbers"),
        "Deuteronomy": ("05", "Deuteronomy"), "Joshua": ("06", "Joshua"),
        "Judges": ("07", "Judges"), "Ruth": ("08", "Ruth"),
        "1 Samuel": ("09", "1Samuel"), "2 Samuel": ("10", "2Samuel"),
        "1 Kings": ("11", "1Kings"), "2 Kings": ("12", "2Kings"),
        "1 Chronicles": ("13", "1Chronicles"), "2 Chronicles": ("14", "2Chronicles"),
        "Ezra": ("15", "Ezra"), "Nehemiah": ("16", "Nehemiah"),
        "Esther": ("17", "Esther"), "Job": ("18", "Job"),
        "Psalms": ("19", "Psalms"), "Proverbs": ("20", "Proverbs"),
        "Ecclesiastes": ("21", "Ecclesiastes"), "Song of Solomon": ("22", "SongOfSolomon"),
        "Isaiah": ("23", "Isaiah"), "Jeremiah": ("24", "Jeremiah"),
        "Lamentations": ("25", "Lamentations"), "Ezekiel": ("26", "Ezekiel"),
        "Daniel": ("27", "Daniel"), "Hosea": ("28", "Hosea"),
        "Joel": ("29", "Joel"), "Amos": ("30", "Amos"),
        "Obadiah": ("31", "Obadiah"), "Jonah": ("32", "Jonah"),
        "Micah": ("33", "Micah"), "Nahum": ("34", "Nahum"),
        "Habakkuk": ("35", "Habakkuk"), "Zephaniah": ("36", "Zephaniah"),
        "Haggai": ("37", "Haggai"), "Zechariah": ("38", "Zechariah"),
        "Malachi": ("39", "Malachi"), "Matthew": ("40", "Matthew"),
        "Mark": ("41", "Mark"), "Luke": ("42", "Luke"),
        "John": ("43", "John"), "Acts": ("44", "Acts"),
        "Romans": ("45", "Romans"), "1 Corinthians": ("46", "1Corinthians"),
        "2 Corinthians": ("47", "2Corinthians"), "Galatians": ("48", "Galatians"),
        "Ephesians": ("49", "Ephesians"), "Philippians": ("50", "Philippians"),
        "Colossians": ("51", "Colossians"), "1 Thessalonians": ("52", "1Thessalonians"),
        "2 Thessalonians": ("53", "2Thessalonians"), "1 Timothy": ("54", "1Timothy"),
        "2 Timothy": ("55", "2Timothy"), "Titus": ("56", "Titus"),
        "Philemon": ("57", "Philemon"), "Hebrews": ("58", "Hebrews"),
        "James": ("59", "James"), "1 Peter": ("60", "1Peter"),
        "2 Peter": ("61", "2Peter"), "1 John": ("62", "1John"),
        "2 John": ("63", "2John"), "3 John": ("64", "3John"),
        "Jude": ("65", "Jude"), "Revelation": ("66", "Revelation"),
    ]
    
    /// USFM book ID mapping for Bible Brain
    private let bookToUSFM: [String: String] = [
        "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
        "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
        "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
        "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
        "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
        "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
        "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
        "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
        "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP",
        "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
        "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
        "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
        "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
        "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI", "2 Timothy": "2TI",
        "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB", "James": "JAS",
        "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
        "3 John": "3JN", "Jude": "JUD", "Revelation": "REV",
    ]
    
    /// Translation to Bible Brain fileset mapping
    private let translationFilesets: [String: TranslationFilesetMapping] = [
        "KJV": TranslationFilesetMapping(textFileset: "ENGKJV", audioFileset: "ENGKJVC1DA", audioDramaFileset: "ENGKJVC2DA", languageCode: "eng"),
        "ASV": TranslationFilesetMapping(textFileset: "ENGASV", audioFileset: "ENGASVC1DA", audioDramaFileset: nil, languageCode: "eng"),
        "WEB": TranslationFilesetMapping(textFileset: "ENGWEB", audioFileset: "ENGWEBN2DA", audioDramaFileset: nil, languageCode: "eng"),
    ]
    
    // MARK: - Bible Brain API
    
    private let bibleBrainBaseURL = "https://4.dbt.io/api"
    private var bibleBrainAPIKey: String?
    
    private init() {
        // Try to load API key from Info.plist
        bibleBrainAPIKey = Bundle.main.object(forInfoDictionaryKey: "BIBLE_BRAIN_API_KEY") as? String
    }
    
    // MARK: - Public API
    
    /// Get an audio track for a chapter, trying AudioTreasure first for KJV, then Bible Brain
    func getChapterAudio(book: String, chapter: Int, translation: String = "KJV") async -> AudioTrack? {
        // For KJV, prefer AudioTreasure (free, no API key needed)
        if translation == "KJV", let url = audioTreasureURL(book: book, chapter: chapter) {
            return AudioTrack(
                id: "at-\(book)-\(chapter)",
                bookName: book,
                chapter: chapter,
                url: url,
                source: .audioTreasure
            )
        }
        
        // Fall back to Bible Brain
        if let track = await bibleBrainChapterAudio(book: book, chapter: chapter, translation: translation) {
            return track
        }
        
        return nil
    }
    
    /// Get verse-level timestamps for synced highlighting
    func getTimestamps(book: String, chapter: Int, translation: String = "KJV", preferDrama: Bool = false) async -> [AudioTimestamp] {
        guard let apiKey = bibleBrainAPIKey,
              let bookId = bookToUSFM[book],
              let mapping = translationFilesets[translation],
              let filesetId = preferDrama ? mapping.audioDramaFileset ?? mapping.audioFileset : mapping.audioFileset
        else { return [] }
        
        let urlString = "\(bibleBrainBaseURL)/timestamps/\(filesetId)/\(bookId)/\(chapter)?key=\(apiKey)&v=4"
        guard let url = URL(string: urlString) else { return [] }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let wrapper = try JSONDecoder().decode(BibleBrainResponse<[BibleBrainTimestamp]>.self, from: data)
            return wrapper.data.map { ts in
                AudioTimestamp(
                    bookId: bookId,
                    chapter: chapter,
                    verseStart: ts.verseStart,
                    verseEnd: ts.verseEnd,
                    timestamp: ts.timestamp
                )
            }
        } catch {
            // AppLogger.audio.error("BibleAudioService failed to fetch timestamps: \(error)")
            return []
        }
    }
    
    /// Check if audio is available for a translation
    func hasAudioForTranslation(_ translation: String) -> Bool {
        if translation == "KJV" { return true } // AudioTreasure always available
        return translationFilesets[translation]?.audioFileset != nil
    }
    
    // MARK: - Private Helpers
    
    private func audioTreasureURL(book: String, chapter: Int) -> URL? {
        guard let info = bookNameMap[book] else { return nil }
        let chapterPadded = String(format: "%03d", chapter)
        return URL(string: "\(audioTreasureBaseURL)/\(info.number)_\(info.urlName)\(chapterPadded).mp3")
    }
    
    private func bibleBrainChapterAudio(book: String, chapter: Int, translation: String) async -> AudioTrack? {
        guard let apiKey = bibleBrainAPIKey,
              let bookId = bookToUSFM[book],
              let mapping = translationFilesets[translation],
              let filesetId = mapping.audioFileset
        else { return nil }
        
        let urlString = "\(bibleBrainBaseURL)/bibles/filesets/\(filesetId)/\(bookId)/\(chapter)?key=\(apiKey)&v=4"
        guard let url = URL(string: urlString) else { return nil }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let wrapper = try JSONDecoder().decode(BibleBrainResponse<[BibleBrainAudioFile]>.self, from: data)
            guard let file = wrapper.data.first, let audioURL = URL(string: file.path) else { return nil }
            
            return AudioTrack(
                id: "bb-\(translation)-\(book)-\(chapter)",
                bookName: book,
                chapter: chapter,
                url: audioURL,
                source: .bibleBrain,
                duration: file.duration
            )
        } catch {
            // AppLogger.audio.error("BibleAudioService Bible Brain error: \(error)")
            return nil
        }
    }
}

// MARK: - Bible Brain API Response Wrapper

private struct BibleBrainResponse<T: Decodable>: Decodable {
    let data: T
}
