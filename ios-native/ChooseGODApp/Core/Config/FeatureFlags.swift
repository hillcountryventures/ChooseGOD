import Foundation

/// Compile-time feature flags for the v1.2 production cut.
///
/// Resolved via grill: the app contains a large amount of built-but-incomplete
/// surface area (Pastor Pack web half missing, Series Generator decode
/// round-trip unverified, Scripture Scan device-only/high-risk, Daily Drop has
/// no seeded content, Founding Member SKU not yet in App Store Connect, Sunday
/// Digest needs a RESEND key, Prayer Circles add a moderation/abuse surface,
/// Referral was killed by the strategy doc, check-ins won't fire for <60-day
/// users, Milestones contradicts the "no-shame" wedge + is a compile-error stub).
///
/// Shipping any of these as *visible-but-broken* is the worst failure mode for
/// a sale — a buyer tapping a dead toggle concludes "buggy app." So every
/// deferred entry point checks its flag here. The code stays in the binary as
/// a visible roadmap for a technical buyer; flipping a flag to `true` ships it
/// in v1.3 with no surgery.
///
/// Default = OFF for v1.2. Turn on individually as each is finished + configured.
enum FeatureFlags {

    // MARK: - Deferred to v1.3 (off for v1.2)

    /// Discover → "Build a series" entry. Off until the generate-series decode
    /// round-trip is verified end-to-end.
    static let seriesGenerator = false

    /// Paywall → Founding Member ($129 lifetime) card. Off until the
    /// non-consumable IAP exists in App Store Connect + RevenueCat.
    static let foundingMember = false

    /// Settings → "For pastors → Church partnership". Off until the co-branded
    /// web landing page (choosegod.app/[slug]) exists.
    static let pastorPartnership = false

    /// Bible Tools menu → "Scan a verse" (VisionKit camera). Off — device-only,
    /// highest runtime risk, hardest to verify.
    static let scriptureScan = false

    /// Settings → Sunday Digest toggle. Off until RESEND_API_KEY + verified
    /// sending domain are configured (the toggle does nothing without them).
    static let sundayDigest = false

    /// Prayers → group prayer circles. Off for v1.2 — personal prayers only.
    /// Removes the social/moderation/abuse review surface.
    static let prayerCircles = false

    /// Referral program. Off — the strategy doc killed it
    /// (Apple/RevenueCat compliance overhead not worth it).
    static let referral = false

    /// Home → Daily Art+Verse Drop card. Off until ~500 curated_art rows +
    /// daily_drops are seeded (renders nothing until then anyway).
    static let dailyDrop = false

    /// Periodic life-events + 6-month covenant check-in modals. Off — won't
    /// fire for users under 60 days old; no demo value at launch.
    static let checkIns = false

    /// Journey → Milestones segment. Off — gamification/badges contradict the
    /// "Bible app that doesn't shame you" wedge, and the view is a stub.
    static let milestones = false
}
