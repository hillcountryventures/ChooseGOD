import Foundation
import Supabase

/// Strategy Decision #9 — fetches today's published Daily Drop (verse + art).
/// The daily-drop scheduler edge function generates 21 candidates per week;
/// the founder approves 7 to publish; this service shows whichever one is
/// scheduled for today's date. If nothing is published for today (early
/// stages, founder hasn't curated yet), the service returns nil and the UI
/// gracefully hides the card.
@Observable
final class DailyDropService {

    static let shared = DailyDropService()

    struct Drop: Decodable, Identifiable {
        let id: String
        let dropDate: String
        let verseBook: String
        let verseChapter: Int
        let verseStart: Int
        let verseEnd: Int?
        let translation: String
        let caption: String
        let narrationUrl: String?
        let videoUrl: String?
        let art: ArtAttribution

        enum CodingKeys: String, CodingKey {
            case id, caption, translation
            case dropDate     = "drop_date"
            case verseBook    = "verse_book"
            case verseChapter = "verse_chapter"
            case verseStart   = "verse_start"
            case verseEnd     = "verse_end"
            case narrationUrl = "narration_url"
            case videoUrl     = "video_url"
            case art          = "curated_art"
        }

        struct ArtAttribution: Decodable {
            let imageUrl: String
            let attribution: String
            let title: String
            let artist: String?

            enum CodingKeys: String, CodingKey {
                case title, artist, attribution
                case imageUrl = "image_url"
            }
        }

        var verseReference: String {
            if let end = verseEnd, end != verseStart {
                return "\(verseBook) \(verseChapter):\(verseStart)-\(end)"
            }
            return "\(verseBook) \(verseChapter):\(verseStart)"
        }
    }

    private(set) var todaysDrop: Drop?

    private init() {}

    /// Fetch today's published drop. Caches in-memory until the date rolls.
    @discardableResult
    func loadTodaysDrop() async -> Drop? {
        let today = Self.iso8601DateString(for: Date())

        // Skip the network round-trip if we already have today's drop cached.
        if let cached = todaysDrop, cached.dropDate == today {
            return cached
        }

        do {
            let supabase = try SupabaseManager.shared.requireClient()
            let drops: [Drop] = try await supabase
                .from("daily_drops")
                .select("""
                    id, drop_date, verse_book, verse_chapter, verse_start,
                    verse_end, translation, caption, narration_url, video_url,
                    curated_art(image_url, attribution, title, artist)
                """)
                .eq("drop_date", value: today)
                .eq("status", value: "published")
                .limit(1)
                .execute()
                .value

            todaysDrop = drops.first
            return todaysDrop
        } catch {
            return nil
        }
    }

    private static func iso8601DateString(for date: Date) -> String {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withFullDate]
        return f.string(from: date)
    }
}
