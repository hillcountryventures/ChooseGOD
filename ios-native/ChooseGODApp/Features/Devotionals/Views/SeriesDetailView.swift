import SwiftUI

/// Full series detail page with gradient hero, day overview, and enroll CTA
struct SeriesDetailView: View {
    let series: DevotionalSeries
    
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    
    @State private var enrollments: [UserSeriesEnrollment] = []
    @State private var days: [DevotionalDay] = []
    @State private var isEnrolling = false
    @State private var showEnrollmentConfirm = false
    @State private var newEnrollment: UserSeriesEnrollment?
    @State private var isLoadingDays = true
    @State private var heroScale: CGFloat = 1.0
    
    private var existingEnrollment: UserSeriesEnrollment? {
        enrollments.first { $0.seriesId == series.id }
    }
    
    private var isEnrolled: Bool { existingEnrollment != nil }
    
    private var progressPercentage: Double {
        guard let e = existingEnrollment else { return 0 }
        return Double(e.completedDays.count) / Double(series.totalDays)
    }
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    heroHeader
                    contentBody
                }
            }
            .ignoresSafeArea(edges: .top)
            
            // Footer CTA
            VStack {
                Spacer()
                footerCTA
            }
        }
        .navigationBarHidden(true)
        .fullScreenCover(isPresented: $showEnrollmentConfirm) {
            if let enrollment = newEnrollment {
                EnrollmentConfirmView(series: series, enrollment: enrollment)
            }
        }
        .task { await loadData() }
    }
    
    // MARK: - Hero Header
    
    private var heroHeader: some View {
        ZStack(alignment: .topLeading) {
            series.gradient
                .frame(height: 280)
                .scaleEffect(heroScale)
            
            // Frosted overlay at bottom
            VStack {
                Spacer()
                Rectangle()
                    .fill(.ultraThinMaterial.opacity(0.15))
                    .frame(height: 60)
            }
            .frame(height: 280)
            
            VStack(alignment: .leading, spacing: 0) {
                // Nav bar
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "arrow.left")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(.white)
                            .frame(width: 40, height: 40)
                            .background(.white.opacity(0.2))
                            .clipShape(Circle())
                    }
                    
                    Spacer()
                    
                    if series.isSeasonal {
                        HStack(spacing: 4) {
                            Image(systemName: "calendar")
                                .font(.caption)
                            Text("Seasonal")
                                .font(.caption.weight(.semibold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(.white.opacity(0.2))
                        .clipShape(Capsule())
                    }
                }
                .padding(.top, 56)
                .padding(.horizontal, 20)
                
                Spacer()
                
                // Title + meta
                VStack(alignment: .leading, spacing: 12) {
                    Text(series.title)
                        .font(.system(size: 32, weight: .bold, design: .serif))
                        .foregroundStyle(.white)
                    
                    HStack(spacing: 16) {
                        Label("\(series.totalDays) days", systemImage: "calendar.badge.clock")
                        Label(series.difficultyLevel.displayName, systemImage: "speedometer")
                    }
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.9))
                }
                .padding(20)
            }
            .frame(height: 280)
        }
    }
    
    // MARK: - Content
    
    private var contentBody: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Enrolled progress card
            if let enrollment = existingEnrollment {
                progressCard(enrollment)
            }
            
            // About
            section("About This Journey") {
                Text(series.description)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .lineSpacing(4)
            }
            
            // Topics
            if !series.topics.isEmpty {
                section("Topics Covered") {
                    FlowLayout(spacing: 8) {
                        ForEach(series.topics, id: \.self) { topic in
                            Text(topic)
                                .font(Theme.Typography.labelSmall)
                                .foregroundStyle(Theme.Colors.primary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Theme.Colors.primary.opacity(0.15))
                                .clipShape(Capsule())
                        }
                    }
                }
            }
            
            // What you'll experience
            section("What You'll Experience") {
                VStack(spacing: 14) {
                    featureRow(icon: "book.closed.fill", text: "Daily Scripture readings")
                    featureRow(icon: "sparkles", text: "AI-personalized reflections")
                    featureRow(icon: "pencil.and.outline", text: "Journaling prompts")
                    featureRow(icon: "hands.sparkles.fill", text: "Prayer guidance")
                }
            }
            
            // Day-by-day overview
            section("Day-by-Day Overview") {
                if isLoadingDays {
                    HStack { Spacer(); ProgressView(); Spacer() }
                } else if days.isEmpty {
                    Text("Days will be revealed as you progress.")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.textTertiary)
                } else {
                    VStack(spacing: 0) {
                        ForEach(Array(days.enumerated()), id: \.element.id) { index, day in
                            dayRow(day, index: index)
                            if index < days.count - 1 {
                                Divider().background(Theme.Colors.surfaceElevated)
                            }
                        }
                    }
                    .background(Theme.Colors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.lg))
                }
            }
            
            // Spacer for footer
            Color.clear.frame(height: 100)
        }
        .padding(20)
    }
    
    // MARK: - Components
    
    private func progressCard(_ enrollment: UserSeriesEnrollment) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(Theme.Colors.success)
                Text("You're Enrolled")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.Colors.success)
            }
            
            ProgressView(value: progressPercentage)
                .tint(Theme.Colors.primary)
            
            Text("Day \(enrollment.currentDay) of \(series.totalDays)")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                        .stroke(.white.opacity(0.08))
                )
        }
    }
    
    private func section(_ title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(Theme.Colors.text)
            content()
        }
    }
    
    private func featureRow(icon: String, text: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Theme.Colors.primary)
                .frame(width: 40, height: 40)
                .background(Theme.Colors.primary.opacity(0.12))
                .clipShape(Circle())
            
            Text(text)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.text)
        }
    }
    
    private func dayRow(_ day: DevotionalDay, index: Int) -> some View {
        let isCompleted = existingEnrollment?.completedDays.contains(day.dayNumber) ?? false
        
        return HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(isCompleted ? Theme.Colors.success : Theme.Colors.surfaceElevated)
                    .frame(width: 32, height: 32)
                
                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.white)
                } else {
                    Text("\(day.dayNumber)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Day \(day.dayNumber)")
                    .font(Theme.Typography.labelSmall)
                    .foregroundStyle(Theme.Colors.textTertiary)
                Text(day.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.Colors.text)
                    .lineLimit(1)
            }
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
    
    // MARK: - Footer CTA
    
    private var footerCTA: some View {
        Button {
            if isEnrolled {
                // Continue
                dismiss()
            } else {
                Task { await enroll() }
            }
        } label: {
            HStack(spacing: 8) {
                if isEnrolling {
                    ProgressView().tint(.white)
                } else {
                    Text(isEnrolled ? "Continue Journey" : "Start This Journey")
                        .font(Theme.Typography.button)
                    Image(systemName: "arrow.right")
                        .font(.subheadline.weight(.semibold))
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: Theme.Dimensions.buttonHeight)
            .background(
                LinearGradient(
                    colors: [Theme.Colors.primary, Theme.Colors.primaryDark],
                    startPoint: .leading, endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.xl))
            .themeShadow(Theme.Shadows.md)
        }
        .disabled(isEnrolling)
        .padding(.horizontal, 20)
        .padding(.bottom, 20)
        .background(
            LinearGradient(
                colors: [Theme.Colors.background.opacity(0), Theme.Colors.background],
                startPoint: .top, endPoint: .center
            )
        )
    }
    
    // MARK: - Data
    
    private func loadData() async {
        let service = SupabaseDevotionalService()
        
        if let userId = appState.currentUser?.id {
            enrollments = (try? await service.getEnrollments(userId: userId)) ?? []
        }
        
        do {
            days = try await service.getDaysForSeries(seriesId: series.id)
        } catch {
            days = []
        }
        isLoadingDays = false
    }
    
    private func enroll() async {
        guard let userId = appState.currentUser?.id else { return }
        isEnrolling = true
        
        let service = SupabaseDevotionalService()
        if let enrollment = try? await service.enrollInSeries(
            userId: userId, seriesId: series.id, isPrimary: enrollments.isEmpty
        ) {
            newEnrollment = enrollment
            withAnimation(Theme.Animation.spring) {
                showEnrollmentConfirm = true
            }
        }
        isEnrolling = false
    }
}

#Preview {
    NavigationStack {
        SeriesDetailView(series: .preview)
            .environment(AppState.preview)
    }
}
