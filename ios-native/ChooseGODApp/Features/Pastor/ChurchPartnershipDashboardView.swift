import SwiftUI

/// Decision G7 — pastor-facing church partnership dashboard.
/// Different from the existing `PastorDashboardView` (which is built around
/// Bible study groups). This view is church-partnership-specific: pastor
/// registers their church, submits weekly sermons for sermon-companion drops,
/// and sees aggregate install/engagement stats.
struct ChurchPartnershipDashboardView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var church: ChurchService.Church?
    @State private var stats: ChurchService.Stats?
    @State private var isLoading: Bool = true
    @State private var showOnboarding: Bool = false
    @State private var showSermonComposer: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                if isLoading {
                    ProgressView().scaleEffect(1.2)
                } else if let church {
                    dashboardContent(church)
                } else {
                    emptyState
                }
            }
            .navigationTitle("My Church")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .task { await load() }
            .sheet(isPresented: $showOnboarding) {
                ChurchOnboardingSheet { newChurch in
                    self.church = newChurch
                    Task { await refreshStats() }
                }
                .environment(appState)
            }
            .sheet(isPresented: $showSermonComposer) {
                if let church {
                    SermonComposerSheet(church: church)
                        .environment(appState)
                }
            }
        }
    }

    // MARK: - States

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "building.columns.fill")
                .font(.system(size: 56))
                .foregroundStyle(Theme.Colors.primary)
            Text("Set up your church partnership")
                .font(.title3)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            Text("ChooseGOD partners with churches at no cost. You'll get a co-branded landing page for your congregation, sermon-companion devotionals, and a dashboard for engagement.")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.Colors.secondaryText)
                .padding(.horizontal, 32)
            Button {
                showOnboarding = true
            } label: {
                Text("Register my church")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding(.horizontal, 32)
        }
    }

    private func dashboardContent(_ church: ChurchService.Church) -> some View {
        ScrollView {
            VStack(spacing: 18) {
                churchHeader(church)
                statsCards
                landingPageCard(church)
                sermonCompanionCard
            }
            .padding(20)
        }
    }

    private func churchHeader(_ church: ChurchService.Church) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(church.name)
                .font(.title2)
                .bold()
                .foregroundStyle(Theme.Colors.text)
            HStack(spacing: 4) {
                if let denom = church.denomination, !denom.isEmpty {
                    Text(denom)
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                if let city = church.city, !city.isEmpty,
                   let state = church.state, !state.isEmpty {
                    if church.denomination?.isEmpty == false { Text("\u{2022}") }
                    Text("\(city), \(state)")
                        .font(.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var statsCards: some View {
        HStack(spacing: 10) {
            statCard("Total installs", value: "\(stats?.totalInstalls ?? 0)", color: Theme.Colors.primary)
            statCard("Last 7 days", value: "\(stats?.installsLast7d ?? 0)", color: .green)
            statCard("Active 7d", value: "\(stats?.activeUsersLast7d ?? 0)", color: .orange)
        }
    }

    private func statCard(_ label: String, value: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3)
                .bold()
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func landingPageCard(_ church: ChurchService.Church) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "link")
                    .foregroundStyle(Theme.Colors.primary)
                Text("Your install link")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
            }
            Text("choosegod.app/\(church.slug)")
                .font(.callout)
                .monospaced()
                .foregroundStyle(Theme.Colors.text)
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.Colors.background)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            Text("Share this link with your congregation. They'll see a co-branded landing page, install ChooseGOD, and be linked to your church automatically.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)

            Button {
                let url = "https://choosegod.app/\(church.slug)"
                UIPasteboard.general.string = url
            } label: {
                Label("Copy link", systemImage: "doc.on.doc")
                    .font(.caption)
                    .bold()
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Theme.Colors.primary)
                    .clipShape(Capsule())
            }
            .buttonStyle(.plain)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var sermonCompanionCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "text.bubble.fill")
                    .foregroundStyle(Theme.Colors.primary)
                Text("Sermon companion")
                    .font(.headline)
                    .foregroundStyle(Theme.Colors.text)
            }
            Text("Submit your weekly sermon and your congregation gets a 5-day devotional drop tied to it.")
                .font(.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
                .fixedSize(horizontal: false, vertical: true)

            Button {
                showSermonComposer = true
            } label: {
                Text("Submit this week's sermon")
                    .font(.subheadline)
                    .bold()
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Theme.Colors.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .padding(.top, 4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Loaders

    @MainActor
    private func load() async {
        isLoading = true
        defer { isLoading = false }
        church = await ChurchService.shared.myChurch()
        await refreshStats()
    }

    @MainActor
    private func refreshStats() async {
        guard let church else { return }
        stats = try? await ChurchService.shared.stats(for: church.id)
    }
}

// MARK: - Onboarding sheet

private struct ChurchOnboardingSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    let onCompleted: (ChurchService.Church) -> Void

    @State private var name: String = ""
    @State private var slug: String = ""
    @State private var denomination: String = ""
    @State private var city: String = ""
    @State private var state: String = ""
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Church name") {
                    TextField("Hope Community Church", text: $name)
                }
                Section("URL slug") {
                    TextField("hope-community", text: $slug)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Text("Your link will be choosegod.app/\(slug.isEmpty ? "your-slug" : slug)")
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                Section("About (optional)") {
                    TextField("Denomination", text: $denomination)
                    TextField("City", text: $city)
                    TextField("State", text: $state)
                }
            }
            .navigationTitle("Register your church")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { Task { await submit() } } label: {
                        if isSubmitting { ProgressView() } else { Text("Register").bold() }
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty
                              || slug.trimmingCharacters(in: .whitespaces).isEmpty
                              || isSubmitting)
                }
            }
            .alert("Couldn't register", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: { Text(errorMessage ?? "") }
        }
    }

    @MainActor
    private func submit() async {
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            let church = try await ChurchService.shared.registerChurch(
                slug: slug.trimmingCharacters(in: .whitespaces).lowercased(),
                name: name.trimmingCharacters(in: .whitespaces),
                denomination: denomination.isEmpty ? nil : denomination,
                city: city.isEmpty ? nil : city,
                state: state.isEmpty ? nil : state.uppercased()
            )
            onCompleted(church)
            dismiss()
        } catch {
            errorMessage = "Couldn't register your church. The slug may already be taken."
        }
    }
}

// MARK: - Sermon composer sheet

private struct SermonComposerSheet: View {
    @Environment(\.dismiss) private var dismiss
    let church: ChurchService.Church

    @State private var title: String = ""
    @State private var bodyText: String = ""
    @State private var scriptureRefsRaw: String = ""
    @State private var sermonDate: Date = Date()
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Sermon date") {
                    DatePicker("Date preached", selection: $sermonDate, displayedComponents: .date)
                }
                Section("Title") {
                    TextField("e.g. Trust in the Lord", text: $title)
                }
                Section("Scripture references") {
                    TextField("Comma-separated, e.g. Proverbs 3:5-6, James 1:5", text: $scriptureRefsRaw)
                }
                Section("Sermon text") {
                    TextEditor(text: $bodyText)
                        .frame(minHeight: 220)
                }
            }
            .navigationTitle("This week's sermon")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { Task { await submit() } } label: {
                        if isSubmitting { ProgressView() } else { Text("Submit").bold() }
                    }
                    .disabled(title.isEmpty || bodyText.isEmpty || isSubmitting)
                }
            }
            .alert("Couldn't submit", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: { Text(errorMessage ?? "") }
        }
    }

    @MainActor
    private func submit() async {
        isSubmitting = true
        defer { isSubmitting = false }

        let refs = scriptureRefsRaw
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }

        do {
            try await ChurchService.shared.submitSermon(
                churchId: church.id,
                date: sermonDate,
                title: title,
                bodyText: bodyText,
                scriptureRefs: refs
            )
            dismiss()
        } catch {
            errorMessage = "Couldn't submit your sermon. Try again."
        }
    }
}
