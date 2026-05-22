import SwiftUI

/// Journey tab — surfaces the user's spiritual timeline, earned milestones,
/// and guided practices. Three segments under one tab keeps the bottom bar
/// at five tabs (UX ceiling) while still exposing all of Strategy Decision
/// #6's Practices work and Decision #8's progress mechanics.
struct JourneyView: View {
    @Environment(AppState.self) private var appState

    enum Section: String, CaseIterable, Identifiable {
        case timeline = "Timeline"
        case insights = "Insights"
        case practices = "Practices"
        // Milestones cut from v1.2 (gamification vs. the "no-shame" wedge).
        // FeatureFlags.milestones gates its return in v1.3.
        var id: String { rawValue }
    }

    @State private var selection: Section = .timeline

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Section", selection: $selection) {
                    ForEach(Section.allCases) { section in
                        Text(section.rawValue).tag(section)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)

                Group {
                    switch selection {
                    case .timeline:    TimelineContainerView()
                    case .insights:    InsightsView(mode: .review)
                    case .practices:   PracticesHubView()
                    }
                }
            }
            .background(Theme.Colors.background.ignoresSafeArea())
            .navigationTitle("Journey")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

/// Loads real history via TimelineViewModel and feeds the existing
/// `TimelineView(items:)`. Shows a warm Day-0 empty state.
private struct TimelineContainerView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = TimelineViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && !viewModel.hasLoaded {
                ShimmerView(height: 20)
                    .tint(Theme.Colors.primary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                TimelineView(items: viewModel.items)
            }
        }
        .task(id: appState.currentUser?.id) {
            guard let userId = appState.currentUser?.id else { return }
            await viewModel.load(userId: userId)
        }
        .refreshable {
            guard let userId = appState.currentUser?.id else { return }
            await viewModel.load(userId: userId)
        }
    }
}

#Preview {
    JourneyView()
        .environment(AppState.preview)
}
