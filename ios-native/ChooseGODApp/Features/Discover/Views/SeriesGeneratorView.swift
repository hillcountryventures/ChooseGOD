import SwiftUI
import Supabase

/// Decision #9 + #12 — premium moat. Pro users describe what they're walking
/// through; the app generates a personalized devotional series grounded in
/// scripture, cross-refs, Strong's, and (Pro tier) tradition-aware nuance.
///
/// Free users see this view with a paywall in front of the generate button.
struct SeriesGeneratorView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var topic: String = ""
    @State private var durationDays: Int = 7
    @State private var maturityLevel: MaturityLevel = .growing
    @State private var isGenerating: Bool = false
    @State private var generatedSeries: GeneratedSeries?
    @State private var errorMessage: String?
    @State private var showPaywall: Bool = false

    private var isPremium: Bool {
        appState.currentUser?.isPremium ?? false
    }

    enum MaturityLevel: String, CaseIterable, Identifiable {
        case newBeliever = "new_believer"
        case growing
        case mature
        var id: String { rawValue }
        var displayName: String {
            switch self {
            case .newBeliever: return "New believer"
            case .growing:     return "Growing"
            case .mature:      return "Mature"
            }
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                if let series = generatedSeries {
                    resultView(series)
                } else if isGenerating {
                    generatingView
                } else {
                    formView
                }
            }
            .navigationTitle("Build a series")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
            .alert("Couldn't generate", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: { Text(errorMessage ?? "") }
            .fullScreenCover(isPresented: $showPaywall) {
                PaywallView().environment(appState)
            }
        }
    }

    // MARK: - Form

    private var formView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header
                topicField
                durationPicker
                maturityPicker
                ctaButton
                if !isPremium { proHint }
            }
            .padding(20)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Tell me what you're walking through.")
                .font(.title3)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("I'll build a scripture-grounded devotional series for you, tailored to your tradition. Powered by the same engine that knows your journal.")
                .font(.subheadline)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var topicField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Topic or theme")
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.secondaryText)
            TextField("e.g. \u{201C}Rebuilding after a hard year\u{201D}", text: $topic, axis: .vertical)
                .font(.body)
                .lineLimit(2...4)
                .padding(12)
                .background(Theme.Colors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var durationPicker: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Duration")
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.secondaryText)
            HStack(spacing: 8) {
                ForEach([7, 14, 21, 30], id: \.self) { days in
                    Button {
                        durationDays = days
                    } label: {
                        Text("\(days) days")
                            .font(.caption)
                            .bold()
                            .foregroundStyle(durationDays == days ? .white : Theme.Colors.text)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(durationDays == days ? Theme.Colors.primary : Theme.Colors.surface)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var maturityPicker: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Where are you in your walk?")
                .font(.caption)
                .bold()
                .foregroundStyle(Theme.Colors.secondaryText)
            Picker("Maturity", selection: $maturityLevel) {
                ForEach(MaturityLevel.allCases) { level in
                    Text(level.displayName).tag(level)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var ctaButton: some View {
        Button {
            if isPremium {
                Task { await generate() }
            } else {
                showPaywall = true
            }
        } label: {
            HStack {
                if !isPremium {
                    Image(systemName: "lock.fill")
                }
                Text(isPremium ? "Generate my series" : "Pro feature \u{2014} unlock")
                    .font(.headline)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.Colors.primary)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(topic.trimmingCharacters(in: .whitespaces).isEmpty)
    }

    private var proHint: some View {
        HStack(spacing: 8) {
            Image(systemName: "sparkles")
                .foregroundStyle(Theme.Colors.primary)
            Text("Series generation is Pro. Free users can browse curated series in Discover.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(10)
        .background(Theme.Colors.primary.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    // MARK: - States

    private var generatingView: some View {
        VStack(spacing: 14) {
            Spacer()
            ProgressView().scaleEffect(1.4)
            Text("Composing your series\u{2026}")
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            Text("This pulls scripture, cross-references, Strong's word studies, and tradition-aware reflections. Takes ~30 seconds.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            Spacer()
        }
    }

    private func resultView(_ series: GeneratedSeries) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(series.title)
                    .font(.title)
                    .bold()
                    .foregroundStyle(Theme.Colors.text)
                Text(series.description)
                    .font(.subheadline)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .fixedSize(horizontal: false, vertical: true)

                ForEach(series.days, id: \.dayNumber) { day in
                    dayCard(day)
                }

                Text("Series saved to your enrollments. Find it on the Discover tab.")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .padding(.top, 4)

                Button {
                    dismiss()
                } label: {
                    Text("Open in Discover")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Theme.Colors.primary)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(20)
        }
    }

    private func dayCard(_ day: GeneratedSeries.Day) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Text("Day \(day.dayNumber)")
                    .font(.caption2)
                    .bold()
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Theme.Colors.primary)
                    .clipShape(Capsule())
                Text(day.title)
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
                Spacer()
            }
            if let scripture = day.scripture {
                Text("\(scripture.book) \(scripture.chapter):\(scripture.verseStart)\(scripture.verseEnd.map { "-\($0)" } ?? "")")
                    .font(.caption)
                    .bold()
                    .foregroundStyle(Theme.Colors.primary)
                Text(scripture.text)
                    .font(.caption)
                    .italic()
                    .foregroundStyle(Theme.Colors.text)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Text(day.reflection)
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .lineLimit(4)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Generate

    @MainActor
    private func generate() async {
        guard let userId = appState.currentUser?.id else { return }
        guard let supabase = try? SupabaseManager.shared.requireClient() else {
            errorMessage = "Couldn't connect."
            return
        }
        isGenerating = true
        defer { isGenerating = false }

        do {
            struct Body: Encodable {
                let userId: String
                let topic: String
                let durationDays: Int
                let maturityLevel: String
            }

            let trimmed = topic.trimmingCharacters(in: .whitespacesAndNewlines)
            // Explicit type so the invoke<T: Decodable> generic can infer T
            // (matches InsightsService / GraceModeService pattern).
            let result: GeneratedSeries = try await supabase.functions.invoke(
                "generate-series",
                options: .init(body: Body(
                    userId: userId,
                    topic: trimmed,
                    durationDays: durationDays,
                    maturityLevel: maturityLevel.rawValue
                ))
            )
            generatedSeries = result

            AnalyticsService.shared.capture(
                "series_generated",
                properties: ["topic": trimmed, "duration": durationDays]
            )
        } catch {
            errorMessage = "Couldn't generate the series. Try again in a moment."
        }
    }
}

// MARK: - Decoded series response

struct GeneratedSeries: Decodable {
    let id: String?
    let title: String
    let description: String
    let days: [Day]

    struct Day: Decodable {
        let dayNumber: Int
        let title: String
        let scripture: Scripture?
        let reflection: String
        let strongsInsight: String?
        let reflectionQuestions: [String]?
        let prayerFocus: String?
    }

    struct Scripture: Decodable {
        let book: String
        let chapter: Int
        let verseStart: Int
        let verseEnd: Int?
        let text: String
    }
}

#Preview {
    SeriesGeneratorView()
        .environment(AppState.preview)
}
