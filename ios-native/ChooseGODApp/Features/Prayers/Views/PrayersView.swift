import SwiftUI

struct PrayersView: View {
    @StateObject private var viewModel = PrayerViewModel()
    @State private var showAddPrayer = false
    @State private var selectedTab: PrayerTab = .personal
    
    enum PrayerTab: String, CaseIterable {
        case personal = "Personal"
        case community = "Community"
    }
    
    var body: some View {
        ZStack {
            Color.clear.ignoresSafeArea() // Placeholder for Theme.Colors.background
            
            if viewModel.isLoading && viewModel.personalPrayers.isEmpty && viewModel.communityPrayers.isEmpty {
                ShimmerView(height: 20)
                    .tint(.blue) // Placeholder for Theme.Colors.primary
            } else if let error = viewModel.error, viewModel.personalPrayers.isEmpty, viewModel.communityPrayers.isEmpty {
                VStack {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                    Button("Retry") {
                        viewModel.error = nil
                        Task { await viewModel.fetchPrayers() }
                    }
                }
            } else {
                content
            }
        }
        // .screenBackground(Theme.Colors.background) // TODO: Fix this modifier
        .navigationTitle("Prayers")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showAddPrayer = true
                } label: {
                    Image(systemName: "plus")
                        .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                }
            }
        }
        .sheet(isPresented: $showAddPrayer) {
            AddPrayerView(viewModel: viewModel)
        }
        .task {
            await viewModel.fetchPrayers()
        }
        .onAppear {
            // TODO: Fix AnalyticsService import - AnalyticsService.shared.screen("prayers")
        }
    }
    
    private var content: some View {
        VStack(spacing: 0) {
            // Tab Picker
            Picker("Prayer Tab", selection: $selectedTab) {
                ForEach(PrayerTab.allCases, id: \.self) { tab in
                    Text(tab.rawValue)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16) // Placeholder for Theme.Spacing.lg
            .padding(.bottom, 16) // Placeholder for Theme.Spacing.lg
            
            // Tab Content
            TabView(selection: $selectedTab) {
                personalPrayersList
                    .tag(PrayerTab.personal)
                communityPrayersList
                    .tag(PrayerTab.community)
            }
        }
    }
    
    private var personalPrayersList: some View {
        ScrollView {
            VStack(spacing: 16) { // Placeholder for Theme.Spacing.lg
                if viewModel.personalPrayers.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "hands.and.sparkles")
                            .font(.system(size: 80)) // Placeholder for Theme.Typography.iconLarge
                            .foregroundColor(.gray) // Placeholder for Theme.Colors.textTertiary
                        Text("You haven't added any prayers yet")
                            .font(.title2) // Placeholder for Theme.Typography.h3
                            .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                        Text("Tap the + button to add your first prayer")
                            .font(.body) // Placeholder for Theme.Typography.body
                            .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                            .multilineTextAlignment(.center)
                        Button {
                            showAddPrayer = true
                        } label: {
                            Text("Add Prayer")
                                .font(.headline) // Placeholder for Theme.Typography.button
                                .foregroundColor(.white)
                                .padding(.horizontal, 16) // Placeholder for Theme.Spacing.md
                                .padding(.vertical, 12) // Placeholder for Theme.Spacing.sm
                                .background(Color.blue, in: RoundedRectangle(cornerRadius: 10)) // Placeholder for Theme.Colors.primary
                        }
                        // .primaryButtonStyle() // TODO: Fix primaryButtonStyle import
                    }
                    .padding(.horizontal, 24) // Placeholder for Theme.Spacing.xl
                } else {
                    ForEach(viewModel.personalPrayers) { prayer in
                        PrayerCard(prayer: prayer, viewModel: viewModel)
                    }
                }
            }
            .padding(.horizontal, 16) // Placeholder for Theme.Spacing.lg
            .padding(.vertical, 16) // Placeholder for Theme.Spacing.lg
        }
    }
    
    private var communityPrayersList: some View {
        ScrollView {
            VStack(spacing: 16) { // Placeholder for Theme.Spacing.lg
                if viewModel.communityPrayers.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "person.3")
                            .font(.system(size: 80)) // Placeholder for Theme.Typography.iconLarge
                            .foregroundColor(.gray) // Placeholder for Theme.Colors.textTertiary
                        Text("No community prayers yet")
                            .font(.title2) // Placeholder for Theme.Typography.h3
                            .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                        Text("Prayers shared by others will appear here")
                            .font(.body) // Placeholder for Theme.Typography.body
                            .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 24) // Placeholder for Theme.Spacing.xl
                } else {
                    ForEach(viewModel.communityPrayers) { prayer in
                        PrayerCard(prayer: prayer, viewModel: viewModel)
                    }
                }
            }
            .padding(.horizontal, 16) // Placeholder for Theme.Spacing.lg
            .padding(.vertical, 16) // Placeholder for Theme.Spacing.lg
        }
    }
}

struct PrayerCard: View {
    let prayer: Prayer
    @ObservedObject var viewModel: PrayerViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) { // Placeholder for Theme.Spacing.sm
            HStack {
                Text(prayer.title)
                    .font(.headline) // Placeholder for Theme.Typography.h4
                    .foregroundColor(.primary) // Placeholder for Theme.Colors.text
                    .lineLimit(1)
                Spacer()
                if prayer.isAnswered {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green) // Placeholder for Theme.Colors.success
                }
            }
            Text(prayer.content)
                .font(.body) // Placeholder for Theme.Typography.body
                .foregroundColor(.secondary) // Placeholder for Theme.Colors.textSecondary
                .lineLimit(3)
            HStack {
                Text(prayer.createdAt, style: .date)
                    .font(.caption) // Placeholder for Theme.Typography.caption1
                    .foregroundColor(.gray) // Placeholder for Theme.Colors.textTertiary
                Spacer()
                if prayer.isCommunity {
                    Button {
                        Task { await viewModel.prayFor(prayer) }
                    } label: {
                        HStack {
                            Image(systemName: "hands.and.sparkles")
                            Text("Pray")
                        }
                        .font(.caption) // Placeholder for Theme.Typography.caption1
                        .foregroundColor(.blue) // Placeholder for Theme.Colors.primary
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(16) // Placeholder for Theme.Spacing.lg
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 12)) // Placeholder for Theme.Colors.backgroundSecondary
        .overlay {
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1) // Placeholder for Theme.Colors.divider
        }
    }
}

// MARK: - Shimmer View (Placeholder)

struct ShimmerView: View {
    let height: CGFloat
    @State private var phase = 0.0
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<5) { _ in
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: height)
                    .overlay {
                        GeometryReader { geo in
                            RoundedRectangle(cornerRadius: 8)
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(stops: [
                                            .init(color: .clear, location: 0),
                                            .init(color: .white.opacity(0.3), location: 0.5),
                                            .init(color: .clear, location: 1)
                                        ]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                    .offset(x: geo.size.width * phase)
                                )
                        }
                    }
            }
        }
        .padding(.horizontal, 16)
        .onAppear {
            withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                phase = 1.0
            }
        }
    }
}

// #Preview {
//    NavigationStack {
//        PrayersView()
//    }
//}
