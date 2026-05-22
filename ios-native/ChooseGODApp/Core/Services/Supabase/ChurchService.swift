import Foundation
import Supabase

/// Decision G3 + G7 — backend wiring for the Pastor Pack.
/// Backed by migration 060 (churches, church_sermons, church_install_log).
@Observable
final class ChurchService {

    static let shared = ChurchService()

    struct Church: Decodable, Identifiable {
        let id: String
        let slug: String
        let name: String
        let denomination: String?
        let city: String?
        let state: String?
        let pastorUserId: String?
        let welcomeMessage: String?
        let crestImageUrl: String?
        let isActive: Bool

        enum CodingKeys: String, CodingKey {
            case id, slug, name, denomination, city, state
            case pastorUserId   = "pastor_user_id"
            case welcomeMessage = "welcome_message"
            case crestImageUrl  = "crest_image_url"
            case isActive       = "is_active"
        }
    }

    struct Stats: Decodable {
        let totalInstalls: Int
        let installsLast7d: Int
        let installsLast30d: Int
        let activeUsersLast7d: Int

        enum CodingKeys: String, CodingKey {
            case totalInstalls    = "total_installs"
            case installsLast7d   = "installs_last_7d"
            case installsLast30d  = "installs_last_30d"
            case activeUsersLast7d = "active_users_last_7d"
        }
    }

    struct Sermon: Identifiable, Decodable {
        let id: String
        let churchId: String
        let sermonDate: String
        let title: String
        let bodyText: String
        let scriptureRefs: [String]
        let devotionalDropText: String?
        let isPublished: Bool

        enum CodingKeys: String, CodingKey {
            case id, title
            case churchId           = "church_id"
            case sermonDate         = "sermon_date"
            case bodyText           = "body_text"
            case scriptureRefs      = "scripture_refs"
            case devotionalDropText = "devotional_drop_text"
            case isPublished        = "is_published"
        }
    }

    private init() {}

    // MARK: - Pastor flows

    /// Find the church the current user pastors (if any).
    func myChurch() async -> Church? {
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return nil }
        guard let session = try? await supabase.auth.session else { return nil }
        let userId = session.user.id.uuidString

        let rows: [Church] = (try? await supabase
            .from("churches")
            .select("*")
            .eq("pastor_user_id", value: userId)
            .limit(1)
            .execute()
            .value) ?? []
        return rows.first
    }

    /// Register a new church. Creates the row + assigns current user as pastor.
    func registerChurch(slug: String, name: String, denomination: String?, city: String?, state: String?) async throws -> Church {
        let supabase = try SupabaseManager.shared.requireClient()
        struct Params: Encodable {
            let p_slug: String
            let p_name: String
            let p_denomination: String?
            let p_city: String?
            let p_state: String?
        }
        let row: Church = try await supabase
            .rpc("register_church", params: Params(
                p_slug: slug,
                p_name: name,
                p_denomination: denomination,
                p_city: city,
                p_state: state
            ))
            .execute()
            .value
        return row
    }

    /// Aggregate stats for the pastor dashboard.
    func stats(for churchId: String) async throws -> Stats {
        let supabase = try SupabaseManager.shared.requireClient()
        let rows: [Stats] = try await supabase
            .rpc("church_stats", params: ["p_church_id": churchId])
            .execute()
            .value
        return rows.first ?? Stats(totalInstalls: 0, installsLast7d: 0, installsLast30d: 0, activeUsersLast7d: 0)
    }

    /// Submit a sermon for the sermon-companion flow.
    func submitSermon(churchId: String, date: Date, title: String, bodyText: String, scriptureRefs: [String]) async throws {
        let supabase = try SupabaseManager.shared.requireClient()
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withFullDate]

        struct Insert: Encodable {
            let church_id: String
            let sermon_date: String
            let title: String
            let body_text: String
            let scripture_refs: [String]
            let is_published: Bool
        }

        _ = try await supabase
            .from("church_sermons")
            .upsert(Insert(
                church_id: churchId,
                sermon_date: f.string(from: date),
                title: title,
                body_text: bodyText,
                scripture_refs: scriptureRefs,
                is_published: true
            ))
            .execute()
    }

    // MARK: - Congregant flows

    /// Called by iOS when launched with a `church_slug` deep-link parameter.
    /// Links the current user's profile to that church and logs the install.
    @discardableResult
    func linkUserToChurch(slug: String) async throws -> String {
        let supabase = try SupabaseManager.shared.requireClient()
        let churchId: String = try await supabase
            .rpc("link_user_to_church", params: ["p_slug": slug])
            .execute()
            .value
        return churchId
    }

    /// Latest published sermon for the user's linked church.
    func currentSermonForUser() async -> Sermon? {
        guard let supabase = try? SupabaseManager.shared.requireClient() else { return nil }
        guard let session = try? await supabase.auth.session else { return nil }
        let userId = session.user.id.uuidString

        // 1) Find user's church
        struct ProfileRow: Decodable { let church_id: String? }
        guard let prof: ProfileRow = try? await supabase
            .from("user_profiles")
            .select("church_id")
            .eq("id", value: userId)
            .single()
            .execute()
            .value,
              let cid = prof.church_id else { return nil }

        // 2) Find latest published sermon
        let rows: [Sermon] = (try? await supabase
            .from("church_sermons")
            .select("*")
            .eq("church_id", value: cid)
            .eq("is_published", value: true)
            .order("sermon_date", ascending: false)
            .limit(1)
            .execute()
            .value) ?? []
        return rows.first
    }
}
