import SwiftUI

/// Comprehensive discovery hub: devotionals + books + art + poetry + scholarship
struct DiscoverView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: DiscoverViewModel = DiscoverViewModel()

    // Devotional state
    @State private var enrollments: [UserSeriesEnrollment] = []
    @State private var allSeries: [DevotionalSeries] = []
    @State private var selectedSeries: DevotionalSeries?
    @State private var devotionalLoading = true

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()

                if viewModel.isLoading && devotionalLoading {
                    // Initial loading shimmer
                    VStack(spacing: 16) {
                        ForEach(0..<4, id: \.self) { _ in
                            ShimmerView(height: 100)
                        }
                    }
                    .padding()
                } else {
                    ScrollView {
                        VStack(spacing: 24) {
                            // Lectionary Card (top)
                            if let lectionary = viewModel.todaysLectionary {
                                lectionaryCard(lectionary)
                            }

                            // Devotionals Section
                            devotionalSection

                            // Poetry
                            if let poem = viewModel.dailyPoem {
                                poetryCard(poem)
                            }

                            // Artwork
                            if !viewModel.biblicalArtwork.isEmpty {
                                artworkSection
                            }

                            // Books
                            if !viewModel.classicCommentaries.isEmpty {
                                classicsSection
                            }

                            if !viewModel.recommendedBooks.isEmpty {
                                booksSection
                            }

                            // Scholarship
                            if !viewModel.biblicalScholarship.isEmpty {
                                scholarshipSection
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Discover")
            .sheet(item: $selectedSeries) { series in
                SeriesDetailSheet(series: series) {
                    Task { await loadDevotionalData() }
                }
            }
            .task {
                await loadDevotionalData()
                await viewModel.loadAll()
            }
        }
    }

    // MARK: - Sections

    private func lectionaryCard(_ lectionary: DailyLectionary) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Today's Liturgy")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(.white.opacity(0.7))
                    Text(lectionary.day.name)
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.text)
                }
                Spacer()
                ZStack {
                    Circle()
                        .fill(Theme.Colors.accent.opacity(0.2))
                    Text(lectionary.day.color.prefix(1))
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.accent)
                }
                .frame(width: 40, height: 40)
            }

            Divider()
                .background(Theme.Colors.accent.opacity(0.2))

            VStack(alignment: .leading, spacing: 8) {
                ForEach(lectionary.day.readings, id: \.label) { reading in
                    HStack(spacing: 8) {
                        Text(reading.label)
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(.white.opacity(0.6))
                        Text("\(reading.book) \(reading.chapter):\(reading.verseStart)-\(reading.verseEnd)")
                            .font(Theme.Typography.body)
                            .foregroundStyle(Theme.Colors.text)
                    }
                }
            }
        }
        .padding(16)
        .background(Theme.Colors.glass)
        .cornerRadius(12)
    }

    private var devotionalSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Continue Your Journey")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)

            if devotionalLoading {
                ShimmerView(height: 80)
            } else {
                // Current enrollment (if any)
                if let primary = enrollments.first(where: { $0.isPrimary }) {
                    currentSeriesView(primary)
                }

                // Other active enrollments
                let others = enrollments.filter { !$0.isPrimary }
                if !others.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(others) { enrollment in
                            if let series = enrollment.series {
                                NavigationLink {
                                    DailyDevotionalView(enrollment: enrollment)
                                } label: {
                                    SmallSeriesCard(enrollment: enrollment, series: series)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                // Browse series
                VStack(alignment: .leading, spacing: 12) {
                    Text("Explore Series")
                        .font(Theme.Typography.body)
                        .foregroundStyle(.white.opacity(0.7))

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(allSeries) { series in
                            Button {
                                selectedSeries = series
                            } label: {
                                SeriesBrowseCard(series: series)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private func currentSeriesView(_ enrollment: UserSeriesEnrollment) -> some View {
        if let series = enrollment.series {
            return AnyView(
                NavigationLink {
                    DailyDevotionalView(enrollment: enrollment)
                } label: {
                    CurrentSeriesCard(enrollment: enrollment, series: series)
                }
                .buttonStyle(.plain)
            )
        }
        return AnyView(EmptyView())
    }

    private func poetryCard(_ poem: Poem) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Devotional Poetry")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(.white.opacity(0.7))
                    Text(poem.title)
                        .font(Theme.Typography.title3)
                        .lineLimit(2)
                        .foregroundStyle(Theme.Colors.text)
                }
                Spacer()
                Text(poem.author)
                    .font(Theme.Typography.bodySmall)
                    .foregroundStyle(Theme.Colors.accent)
            }

            VStack(alignment: .leading, spacing: 8) {
                ForEach(poem.lines.prefix(3), id: \.self) { line in
                    Text(line)
                        .font(Theme.Typography.body)
                        .foregroundStyle(.white.opacity(0.9))
                }
                if poem.lines.count > 3 {
                    Text("...")
                        .font(Theme.Typography.body)
                        .foregroundStyle(.white.opacity(0.6))
                }
            }
        }
        .padding(16)
        .background(Theme.Colors.glass)
        .cornerRadius(12)
    }

    private var artworkSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Biblical Art")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.biblicalArtwork, id: \.objectID) { artwork in
                        artworkThumbnail(artwork)
                    }
                }
            }
        }
    }

    private func artworkThumbnail(_ artwork: MetArtwork) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            if let imageURL = artwork.imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .empty:
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Theme.Colors.glass)
                            .frame(height: 120)
                    case let .success(image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(height: 120)
                            .clipped()
                            .cornerRadius(8)
                    case .failure:
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Theme.Colors.glass)
                            .frame(height: 120)
                    @unknown default:
                        EmptyView()
                    }
                }
            }

            Text(artwork.title)
                .font(Theme.Typography.bodySmall)
                .lineLimit(2)
                .foregroundStyle(Theme.Colors.text)
                .frame(width: 120, alignment: .topLeading)
        }
        .frame(width: 140)
    }

    private var classicsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Classic Commentaries")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(viewModel.classicCommentaries, id: \.id) { book in
                    HStack(spacing: 8) {
                        if let coverURL = URL(string: book.coverImage ?? "") {
                            AsyncImage(url: coverURL) { phase in
                                switch phase {
                                case .empty:
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Theme.Colors.glass)
                                        .frame(width: 40, height: 60)
                                case let .success(image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 40, height: 60)
                                        .clipped()
                                        .cornerRadius(4)
                                case .failure:
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Theme.Colors.glass)
                                        .frame(width: 40, height: 60)
                                @unknown default:
                                    EmptyView()
                                }
                            }
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(book.title)
                                .font(Theme.Typography.body)
                                .lineLimit(2)
                                .foregroundStyle(Theme.Colors.text)

                            if let authors = book.authors.first?.name {
                                Text(authors)
                                    .font(Theme.Typography.bodySmall)
                                    .foregroundStyle(.white.opacity(0.6))
                            }
                        }

                        Spacer()
                    }
                    .padding(8)
                    .background(Theme.Colors.glass)
                    .cornerRadius(8)
                }
            }
        }
    }

    private var booksSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recommended Reads")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.recommendedBooks, id: \.key) { book in
                        bookCard(book)
                    }
                }
            }
        }
    }

    private func bookCard(_ book: OpenLibraryBook) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            if let coverURL = book.coverImageURL {
                AsyncImage(url: coverURL) { phase in
                    switch phase {
                    case .empty:
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Theme.Colors.glass)
                            .frame(height: 140)
                    case let .success(image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(height: 140)
                            .clipped()
                            .cornerRadius(8)
                    case .failure:
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Theme.Colors.glass)
                            .frame(height: 140)
                    @unknown default:
                        EmptyView()
                    }
                }
            }

            Text(book.title)
                .font(Theme.Typography.bodySmall)
                .lineLimit(2)
                .foregroundStyle(Theme.Colors.text)
                .frame(width: 120, alignment: .topLeading)
        }
        .frame(width: 140)
    }

    private var scholarshipSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Deep Dive — Academic")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(viewModel.biblicalScholarship, id: \.DOI) { work in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(work.displayTitle)
                            .font(Theme.Typography.body)
                            .lineLimit(2)
                            .foregroundStyle(Theme.Colors.text)

                        Text(work.displayAuthors)
                            .font(Theme.Typography.bodySmall)
                            .foregroundStyle(.white.opacity(0.6))

                        if let containerTitle = work.containerTitle?.first {
                            Text(containerTitle)
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(Theme.Colors.accent)
                        }
                    }
                    .padding(8)
                    .background(Theme.Colors.glass)
                    .cornerRadius(8)
                }
            }
        }
    }

    // MARK: - Data Loading

    private func loadDevotionalData() async {
        devotionalLoading = true
        guard let userId = appState.currentUser?.id else {
            devotionalLoading = false
            return
        }

        let service = SupabaseDevotionalService()

        do {
            async let enrollmentsTask = service.getEnrollments(userId: userId)
            async let seriesTask = service.getAllSeries()

            enrollments = try await enrollmentsTask
            allSeries = try await seriesTask
        } catch {
            allSeries = [.preview]
        }

        devotionalLoading = false
    }
}

#Preview {
    DiscoverView()
        .environment(AppState())
}
