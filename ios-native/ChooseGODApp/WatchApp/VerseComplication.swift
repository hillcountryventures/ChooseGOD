import WidgetKit
import SwiftUI

// MARK: - Timeline Provider

struct VerseTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> VerseTimelineEntry {
        VerseTimelineEntry(
            date: Date(),
            verseText: "The Lord is my shepherd; I shall not want.",
            reference: "Psalm 23:1"
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (VerseTimelineEntry) -> Void) {
        let verse = DailyVerseProvider.verseForToday()
        completion(VerseTimelineEntry(date: Date(), verseText: verse.text, reference: verse.reference))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseTimelineEntry>) -> Void) {
        let verse = DailyVerseProvider.verseForToday()
        let entry = VerseTimelineEntry(date: Date(), verseText: verse.text, reference: verse.reference)
        
        // Refresh at midnight
        let midnight = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400))
        let timeline = Timeline(entries: [entry], policy: .after(midnight))
        completion(timeline)
    }
}

// MARK: - Timeline Entry

struct VerseTimelineEntry: TimelineEntry {
    let date: Date
    let verseText: String
    let reference: String
}

// MARK: - Complication Views

struct VerseComplicationEntryView: View {
    var entry: VerseTimelineProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            circularView
        case .accessoryRectangular:
            rectangularView
        case .accessoryCorner:
            cornerView
        case .accessoryInline:
            inlineView
        default:
            rectangularView
        }
    }
    
    private var circularView: some View {
        ZStack {
            AccessoryWidgetBackground()
            Image(systemName: "cross.fill")
                .font(.title3)
        }
    }
    
    private var rectangularView: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.reference)
                .font(.system(.caption2, design: .serif, weight: .bold))
                .widgetAccentable()
            
            Text(entry.verseText)
                .font(.system(.caption2, design: .serif))
                .lineLimit(3)
        }
    }
    
    private var cornerView: some View {
        Image(systemName: "cross.fill")
            .font(.title3)
            .widgetLabel {
                Text(entry.reference)
            }
    }
    
    private var inlineView: some View {
        Text("✝ \(entry.reference)")
    }
}

// MARK: - Widget

struct VerseComplicationWidget: Widget {
    let kind: String = "ChooseGODVerse"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerseTimelineProvider()) { entry in
            VerseComplicationEntryView(entry: entry)
        }
        .configurationDisplayName("Daily Verse")
        .description("See today's Bible verse on your watch face.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryCorner,
            .accessoryInline
        ])
    }
}

// MARK: - Widget Bundle

@main
struct ChooseGODWidgetBundle: WidgetBundle {
    var body: some Widget {
        VerseComplicationWidget()
    }
}
