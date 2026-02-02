import SwiftUI
import WidgetKit

// MARK: - Timeline Provider

struct VerseOfTheDayProvider: TimelineProvider {
    
    func placeholder(in context: Context) -> VerseEntry {
        VerseEntry(date: Date(), verse: DailyVerse.allVerses[0])
    }
    
    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(VerseEntry(date: Date(), verse: DailyVerse.today))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let currentVerse = DailyVerse.today
        let entry = VerseEntry(date: Date(), verse: currentVerse)
        
        // Refresh at midnight for the next verse
        let calendar = Calendar.current
        let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: Date())!)
        
        let timeline = Timeline(entries: [entry], policy: .after(tomorrow))
        completion(timeline)
    }
}

// MARK: - Timeline Entry

struct VerseEntry: TimelineEntry {
    let date: Date
    let verse: DailyVerse
}

// MARK: - Widget Views

struct VerseSmallView: View {
    let entry: VerseEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: "book.closed.fill")
                .font(.caption)
                .foregroundStyle(.secondary)
            
            Spacer()
            
            Text(entry.verse.shortText)
                .font(.system(.caption, design: .serif))
                .foregroundStyle(.primary)
                .lineLimit(4)
                .minimumScaleFactor(0.8)
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(entry.verse.deepLinkURL)
    }
}

struct VerseMediumView: View {
    let entry: VerseEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "book.closed.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("Verse of the Day")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            
            Text(entry.verse.text)
                .font(.system(.caption, design: .serif))
                .foregroundStyle(.primary)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
            
            Text("— \(entry.verse.reference)")
                .font(.system(.caption2, design: .serif))
                .foregroundStyle(.secondary)
                .italic()
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(entry.verse.deepLinkURL)
    }
}

struct VerseLockScreenView: View {
    let entry: VerseEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.verse.shortText)
                .font(.system(.caption2, design: .serif))
                .lineLimit(2)
                .minimumScaleFactor(0.8)
            
            Text(entry.verse.reference)
                .font(.system(.caption2, design: .serif))
                .foregroundStyle(.secondary)
        }
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(entry.verse.deepLinkURL)
    }
}

// MARK: - Widget Configuration

struct VerseOfTheDayWidget: Widget {
    let kind: String = "VerseOfTheDayWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerseOfTheDayProvider()) { entry in
            VerseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Verse of the Day")
        .description("Start your day with God's Word.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

// MARK: - Entry View Router

struct VerseWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: VerseEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            VerseSmallView(entry: entry)
        case .systemMedium:
            VerseMediumView(entry: entry)
        case .accessoryRectangular:
            VerseLockScreenView(entry: entry)
        default:
            VerseMediumView(entry: entry)
        }
    }
}

// MARK: - Preview

#Preview("Small", as: .systemSmall) {
    VerseOfTheDayWidget()
} timeline: {
    VerseEntry(date: Date(), verse: DailyVerse.allVerses[0])
}

#Preview("Medium", as: .systemMedium) {
    VerseOfTheDayWidget()
} timeline: {
    VerseEntry(date: Date(), verse: DailyVerse.allVerses[0])
}

#Preview("Lock Screen", as: .accessoryRectangular) {
    VerseOfTheDayWidget()
} timeline: {
    VerseEntry(date: Date(), verse: DailyVerse.allVerses[0])
}
