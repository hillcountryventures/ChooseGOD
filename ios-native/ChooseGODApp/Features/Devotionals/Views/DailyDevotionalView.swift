import SwiftUI

/// Daily devotional content view
struct DailyDevotionalView: View {
    let enrollment: UserSeriesEnrollment
    
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    
    @State private var day: DevotionalDay?
    @State private var scriptureText: String = ""
    @State private var isLoading = true
    @State private var showReflection = false
    @State private var isCompleting = false
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            if isLoading {
                ShimmerView(height: 20)
            } else if let day = day {
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Day header
                        dayHeader(day)
                        
                        // Scripture
                        scriptureSection(day)
                        
                        // Reflection questions
                        reflectionSection(day)
                        
                        // Prayer focus
                        if let prayerFocus = day.prayerFocus {
                            prayerSection(prayerFocus)
                        }
                        
                        Spacer(minLength: 100)
                    }
                    .padding()
                }
                .safeAreaInset(edge: .bottom) {
                    completeButton
                }
            }
        }
        .navigationTitle(enrollment.series?.title ?? "Devotional")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadDay()
        }
        // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - .onAppear { AnalyticsService.shared.screen("daily_devotional") }
    }
    
    // MARK: - Subviews
    
    private func dayHeader(_ day: DevotionalDay) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Day \(day.dayNumber)")
                .font(Theme.Typography.subheadlineMedium)
                .foregroundStyle(Theme.Colors.primary)
            
            Text(day.title)
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
            
            // Progress
            if let series = enrollment.series {
                ProgressView(value: Double(enrollment.currentDay - 1), total: Double(series.totalDays))
                    .tint(Theme.Colors.primary)
            }
        }
    }
    
    private func scriptureSection(_ day: DevotionalDay) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Scripture reference
            HStack {
                Image(systemName: "book.closed.fill")
                    .foregroundStyle(Theme.Colors.primary)
                
                Text(day.scriptureRefs.map { $0.reference }.joined(separator: ", "))
                    .font(Theme.Typography.subheadlineMedium)
                    .foregroundStyle(Theme.Colors.primary)
            }
            
            // Scripture text
            Text(scriptureText.isEmpty ? day.contentPrompt : scriptureText)
                .font(Theme.Typography.bodySerif)
                .foregroundStyle(Theme.Colors.text)
                .lineSpacing(6)
                .padding()
                .background(Theme.Colors.surface)
                .cornerRadius(Theme.CornerRadius.lg)
        }
    }
    
    private func reflectionSection(_ day: DevotionalDay) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundStyle(Theme.Colors.accent)
                
                Text("Reflection Questions")
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
            }
            
            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(day.reflectionQuestions.enumerated()), id: \.offset) { index, question in
                    HStack(alignment: .top, spacing: 12) {
                        Text("\(index + 1).")
                            .font(Theme.Typography.subheadlineSemibold)
                            .foregroundStyle(Theme.Colors.primary)
                        
                        Text(question)
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(Theme.Colors.text)
                    }
                }
            }
            .padding()
            .background(Theme.Colors.surface)
            .cornerRadius(Theme.CornerRadius.lg)
        }
    }
    
    private func prayerSection(_ prayerFocus: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "hands.sparkles.fill")
                    .foregroundStyle(Theme.Colors.prayer)
                
                Text("Prayer Focus")
                    .font(Theme.Typography.title3)
                    .foregroundStyle(Theme.Colors.text)
            }
            
            Text(prayerFocus)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.text)
                .italic()
                .padding()
                .background(Theme.Colors.prayer.opacity(0.1))
                .cornerRadius(Theme.CornerRadius.lg)
        }
    }
    
    private var completeButton: some View {
        Button {
            Task { await completeDay() }
        } label: {
            if isCompleting {
                ShimmerView(height: 20)
            } else {
                HStack {
                    Text("Complete Day \(enrollment.currentDay)")
                            .accessibilityLabel("Complete day \(enrollment.currentDay)")
                            .accessibilityHint("Double tap to mark this day as complete")
                    Image(systemName: "checkmark.circle.fill")
                }
                .font(Theme.Typography.title3)
            }
        }
        .foregroundColor(.white)
        .frame(maxWidth: .infinity)
        .frame(height: 56)
        .background(Theme.Colors.primary)
        .cornerRadius(Theme.CornerRadius.xl)
        .padding()
        .background(Theme.Colors.background)
    }
    
    // MARK: - Data Loading
    
    private func loadDay() async {
        guard let series = enrollment.series else {
            isLoading = false
            return
        }
        
        let service = SupabaseDevotionalService()
        
        do {
            day = try await service.getDay(seriesId: series.id, dayNumber: enrollment.currentDay)
            
            // Load scripture text if refs exist
            if let refs = day?.scriptureRefs, !refs.isEmpty {
                let bibleService = SupabaseBibleService()
                let ref = refs[0]
                let verses = try await bibleService.fetchChapter(
                    book: ref.book,
                    chapter: ref.chapter,
                    translation: appState.preferences.preferredTranslation
                )
                
                // Filter to specific verses
                let filtered = verses.filter { verse in
                    verse.verse >= ref.verseStart && (ref.verseEnd == nil || verse.verse <= (ref.verseEnd ?? ref.verseStart))
                }
                scriptureText = filtered.map { "\($0.verse). \($0.text)" }.joined(separator: " ")
            }
        } catch {
            // Use preview data
            day = .preview
        }
        
        isLoading = false
    }
    
    private func completeDay() async {
        // TODO: Fix AnalyticsService import - // TODO: Fix AnalyticsService import - AnalyticsService.shared.capture("devotional_completed")
        isCompleting = true
        
        let service = SupabaseDevotionalService()
        try? await service.completeDay(enrollmentId: enrollment.id, dayNumber: enrollment.currentDay)
        
        // Show celebration or go back
        dismiss()
    }
}

#Preview {
    NavigationStack {
        DailyDevotionalView(enrollment: UserSeriesEnrollment(
            id: "e1",
            userId: "u1",
            seriesId: "s1",
            series: .preview,
            enrolledAt: Date(),
            currentDay: 1,
            completedDays: [],
            isActive: true,
            isPrimary: true,
            lastActivityAt: Date(),
            reminderTime: "07:00:00",
            createdAt: Date()
        ))
        .environment(AppState.preview)
    }
}
