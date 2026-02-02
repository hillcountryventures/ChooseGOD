import SwiftUI

struct BibleInAYearView: View {
    @State private var currentDay: Int = {
        Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
    }()
    @State private var streak = 12 // TODO: Load from user data
    @State private var completedDays: Set<Int> = [] // TODO: Persist
    
    private var todaysReading: DailyReading? {
        BibleInAYearPlan.reading(forDay: min(currentDay, 365))
    }
    
    private var progressPercent: Double {
        Double(currentDay) / 365.0
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    progressHeader
                    
                    if let reading = todaysReading {
                        todaysReadingCard(reading)
                    }
                    
                    streakBadge
                    
                    NavigationLink {
                        CommunityStatsView()
                    } label: {
                        communityStatsPreview
                    }
                    .buttonStyle(.plain)
                    
                    allReadingsSection
                }
                .padding()
            }
            .navigationTitle("Bible in a Year")
        }
    }
    
    // MARK: - Progress Header
    
    private var progressHeader: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .stroke(lineWidth: 12)
                    .foregroundStyle(.quaternary)
                Circle()
                    .trim(from: 0, to: progressPercent)
                    .stroke(style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .foregroundStyle(.blue.gradient)
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 2) {
                    Text("Day \(currentDay)")
                        .font(.title.bold())
                    Text("of 365")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 140, height: 140)
            
            Text(String(format: "%.0f%% Complete", progressPercent * 100))
                .font(.headline)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical)
    }
    
    // MARK: - Today's Reading
    
    private func todaysReadingCard(_ reading: DailyReading) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Label("Today's Reading", systemImage: "book.fill")
                    .font(.headline)
                Spacer()
                Text("Day \(reading.dayNumber)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            VStack(alignment: .leading, spacing: 10) {
                readingRow(label: "Old Testament", passage: reading.otPassage, color: .brown)
                readingRow(label: "New Testament", passage: reading.ntPassage, color: .blue)
                readingRow(label: "Psalm / Proverb", passage: reading.psalmProverb, color: .purple)
            }
            
            Button {
                completedDays.insert(reading.dayNumber)
            } label: {
                HStack {
                    Image(systemName: completedDays.contains(reading.dayNumber) ? "checkmark.circle.fill" : "circle")
                    Text(completedDays.contains(reading.dayNumber) ? "Completed!" : "Mark as Complete")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(completedDays.contains(reading.dayNumber) ? .green : .blue)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private func readingRow(label: String, passage: String, color: Color) -> some View {
        HStack {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(passage)
                    .font(.subheadline.bold())
            }
        }
    }
    
    // MARK: - Streak Badge
    
    private var streakBadge: some View {
        HStack(spacing: 12) {
            Image(systemName: "flame.fill")
                .font(.title)
                .foregroundStyle(.orange)
            VStack(alignment: .leading) {
                Text("\(streak)-Day Streak")
                    .font(.headline)
                Text("Keep it going!")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .background(.orange.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - Community Stats Preview
    
    private var communityStatsPreview: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Label("Community", systemImage: "person.3.fill")
                    .font(.headline)
                Text("See how everyone is doing")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - All Readings
    
    private var allReadingsSection: some View {
        DisclosureGroup {
            LazyVStack(spacing: 8) {
                ForEach(BibleInAYearPlan.readings) { reading in
                    HStack {
                        Text("Day \(reading.dayNumber)")
                            .font(.caption.bold())
                            .frame(width: 50, alignment: .leading)
                        Text(reading.otPassage)
                            .font(.caption)
                            .lineLimit(1)
                        Spacer()
                        if completedDays.contains(reading.dayNumber) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                                .font(.caption)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        } label: {
            Label("Full Reading Plan", systemImage: "list.number")
                .font(.headline)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    BibleInAYearView()
}
