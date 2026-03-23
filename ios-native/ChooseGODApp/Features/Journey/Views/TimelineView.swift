import SwiftUI

/// Chronological feed of all spiritual activity
struct TimelineView: View {
    let items: [TimelineItem]
    @State private var filterType: TimelineItem.TimelineItemType?
    @State private var appearedIds: Set<String> = []
    
    private var filteredItems: [TimelineItem] {
        guard let filter = filterType else { return items }
        return items.filter { $0.type == filter }
    }
    
    private var groupedByDate: [(String, [TimelineItem])] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: filteredItems) { item in
            if calendar.isDateInToday(item.createdAt) { return "Today" }
            if calendar.isDateInYesterday(item.createdAt) { return "Yesterday" }
            let formatter = DateFormatter()
            formatter.dateFormat = "EEEE, MMM d"
            return formatter.string(from: item.createdAt)
        }
        return grouped.sorted { lhs, rhs in
            let lhsDate = lhs.value.first?.createdAt ?? Date.distantPast
            let rhsDate = rhs.value.first?.createdAt ?? Date.distantPast
            return lhsDate > rhsDate
        }
    }
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    filterBar
                    
                    if filteredItems.isEmpty {
                        emptyState
                    } else {
                        ForEach(groupedByDate, id: \.0) { date, dayItems in
                            dateSection(date: date, items: dayItems)
                        }

                        // Timeline cap note
                        if items.count >= 50 {
                            HStack {
                                Image(systemName: "info.circle.fill")
                                    .foregroundStyle(Theme.Colors.textSecondary)
                                Text("Showing your 50 most recent entries. Full timeline coming soon.")
                                    .font(Theme.Typography.caption)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                                Spacer()
                            }
                            .padding()
                            .background(Theme.Colors.surface)
                            .cornerRadius(12)
                        }
                    }

                    Color.clear.frame(height: 80)
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle("Timeline")
        .navigationBarTitleDisplayMode(.large)
    }
    
    // MARK: - Filter Bar
    
    private var filterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterChip(label: "All", type: nil)
                filterChip(label: "🙏 Prayer", type: .prayer)
                filterChip(label: "📝 Journal", type: .journal)
                filterChip(label: "☀️ Devotional", type: .devotional)
                filterChip(label: "❤️ Gratitude", type: .gratitude)
                filterChip(label: "🧠 Memory", type: .memoryPractice)
                filterChip(label: "✅ Answered", type: .answeredPrayer)
            }
        }
    }
    
    private func filterChip(label: String, type: TimelineItem.TimelineItemType?) -> some View {
        Button {
            withAnimation(.spring(response: 0.3)) {
                filterType = type
            }
        } label: {
            Text(label)
                .font(Theme.Typography.captionSemibold)
                .foregroundStyle(filterType == type ? .white : Theme.Colors.textSecondary)
                .padding(.horizontal, Theme.Spacing.mds)
                .padding(.vertical, Theme.Spacing.sm)
                .background {
                    if filterType == type {
                        Capsule().fill(Theme.Colors.primary)
                    } else {
                        Capsule().fill(Theme.Colors.surface)
                    }
                }
        }
    }
    
    // MARK: - Date Section
    
    private func dateSection(date: String, items: [TimelineItem]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(date)
                .font(Theme.Typography.subheadlineSemibold)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.bottom, Theme.Spacing.mds)
            
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                HStack(alignment: .top, spacing: 0) {
                    // Timeline connector
                    VStack(spacing: 0) {
                        Circle()
                            .fill(Color(hex: item.type.displayColor))
                            .frame(width: 12, height: 12)
                            .shadow(color: Color(hex: item.type.displayColor).opacity(0.5), radius: 4)
                        
                        if index < items.count - 1 {
                            Rectangle()
                                .fill(Theme.Colors.surface)
                                .frame(width: 2)
                                .frame(maxHeight: .infinity)
                        }
                    }
                    .frame(width: 24)
                    .padding(.top, 6)
                    
                    // Content card
                    timelineCard(item)
                        .padding(.leading, 12)
                        .padding(.bottom, Theme.Spacing.mds)
                        .onAppear {
                            withAnimation(.spring(response: 0.4).delay(Double(index) * 0.05)) {
                                _ = appearedIds.insert(item.id)
                            }
                        }
                        .opacity(appearedIds.contains(item.id) ? 1 : 0)
                        .offset(x: appearedIds.contains(item.id) ? 0 : 20)
                }
            }
        }
    }
    
    private func timelineCard(_ item: TimelineItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: item.type.displayIcon)
                    .foregroundStyle(Color(hex: item.type.displayColor))
                
                Text(item.type.displayLabel)
                    .font(Theme.Typography.captionSemibold)
                    .foregroundStyle(Color(hex: item.type.displayColor))
                
                Spacer()
                
                Text(item.createdAt, style: .time)
                    .font(Theme.Typography.caption2)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            
            Text(item.content)
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.text)
                .lineLimit(3)
            
            if !item.linkedVerses.isEmpty {
                HStack(spacing: 6) {
                    ForEach(item.linkedVerses, id: \.self) { verse in
                        Text(verse)
                            .font(Theme.Typography.captionMedium)
                            .foregroundStyle(Theme.Colors.primary)
                            .padding(.horizontal, Theme.Spacing.sm)
                            .padding(.vertical, 4)
                            .background(Theme.Colors.primary.opacity(0.15))
                            .cornerRadius(Theme.CornerRadius.sm)
                    }
                }
            }
            
            if !item.themes.isEmpty {
                HStack(spacing: 6) {
                    ForEach(item.themes, id: \.self) { theme in
                        Text("#\(theme)")
                            .font(Theme.Typography.caption2)
                            .foregroundStyle(Theme.Colors.textTertiary)
                    }
                }
            }
        }
        .padding(Theme.Spacing.mds)
        .frame(maxWidth: .infinity, alignment: .leading)
        .modifier(GlassCard(cornerRadius: Theme.CornerRadius.lg))
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Text("📖")
                .font(Theme.Typography.iconXL)
            Text("No activity yet")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            Text("Start reading, praying, or journaling to see your timeline come alive.")
                .font(Theme.Typography.bodySmall)
                .foregroundStyle(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(Theme.Spacing.xxl)
    }
}

#Preview {
    NavigationStack {
        TimelineView(items: (0..<15).map { i in
            let types: [TimelineItem.TimelineItemType] = [.devotional, .prayer, .journal, .gratitude, .memoryPractice]
            let type = types[i % types.count]
            return TimelineItem(
                id: "t-\(i)",
                type: type,
                title: type.displayLabel,
                content: "Sample content for timeline item \(i)",
                icon: type.displayIcon,
                color: type.displayColor,
                linkedVerses: i % 3 == 0 ? ["Psalm 23:1"] : [],
                themes: ["peace"],
                createdAt: Date().addingTimeInterval(Double(-i * 3600 * 4))
            )
        })
    }
}
