import Foundation

// MARK: - Audio Track

struct AudioTrack: Identifiable, Equatable {
    let id: String
    let bookName: String
    let chapter: Int
    let url: URL
    let source: AudioSource
    var duration: TimeInterval?
    
    var title: String {
        "\(bookName) \(chapter)"
    }
    
    enum AudioSource: String, Codable {
        case audioTreasure = "audio_treasure"
        case bibleBrain = "bible_brain"
    }
}

// MARK: - Playback State

enum PlaybackStatus: Equatable {
    case idle
    case loading
    case playing
    case paused
    case error(String)
    
    var isActive: Bool {
        switch self {
        case .playing, .paused: return true
        default: return false
        }
    }
}

struct PlaybackState: Equatable {
    var status: PlaybackStatus = .idle
    var currentTrack: AudioTrack?
    var position: TimeInterval = 0
    var duration: TimeInterval = 0
    var currentVerse: Int?
    var playbackRate: Float = 1.0
    
    var progress: Double {
        guard duration > 0 else { return 0 }
        return position / duration
    }
    
    var positionText: String {
        formatTime(position)
    }
    
    var durationText: String {
        formatTime(duration)
    }
    
    var remainingText: String {
        formatTime(max(0, duration - position))
    }
    
    private func formatTime(_ time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Audio Timestamp (verse sync)

struct AudioTimestamp: Equatable {
    let bookId: String
    let chapter: Int
    let verseStart: Int
    let verseEnd: Int
    let timestamp: TimeInterval // seconds from start
}

// MARK: - Cross Reference

struct CrossReference: Identifiable, Codable, Equatable {
    let id: Int
    let book: String
    let chapter: Int
    let verse: Int
    let text: String
    let translation: String
    let votes: Int
    let direction: String // "from" or "to"
    
    var reference: String {
        "\(book) \(chapter):\(verse)"
    }
}

struct GroupedCrossReferences: Identifiable {
    var id: String { book }
    let book: String
    let references: [CrossReference]
}

// MARK: - Bible Brain Types

struct BibleBrainAudioFile: Codable {
    let bookId: String?
    let bookName: String?
    let chapter: Int?
    let duration: Double?
    let path: String
    
    enum CodingKeys: String, CodingKey {
        case bookId = "book_id"
        case bookName = "book_name"
        case chapter
        case duration
        case path
    }
}

struct BibleBrainTimestamp: Codable {
    let verseStart: Int
    let verseEnd: Int
    let timestamp: Double
    
    enum CodingKeys: String, CodingKey {
        case verseStart = "verse_start"
        case verseEnd = "verse_end"
        case timestamp
    }
}

// MARK: - Translation to Fileset Mapping

struct TranslationFilesetMapping {
    let textFileset: String
    let audioFileset: String?
    let audioDramaFileset: String?
    let languageCode: String
}
