import SwiftUI

/// Main Watch app view showing the daily verse
struct WatchDailyVerseView: View {
    @State private var verse: WatchDailyVerse = .placeholder
    @State private var isLoading = true
    
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Cross icon
                Image(systemName: "cross.fill")
                    .font(.title3)
                    .foregroundStyle(.yellow)
                
                if isLoading {
                    ProgressView()
                        .padding()
                } else {
                    // Verse text
                    Text(verse.text)
                        .font(.system(.body, design: .serif))
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                    
                    // Reference
                    Text(verse.reference)
                        .font(.system(.caption, design: .serif, weight: .semibold))
                        .foregroundStyle(.secondary)
                        .padding(.top, 4)
                }
                
                Text("ChooseGOD")
                    .font(.system(size: 9, weight: .medium, design: .rounded))
                    .foregroundStyle(.tertiary)
                    .padding(.top, Theme.Spacing.sm)
            }
            .padding()
        }
        .task {
            await loadDailyVerse()
        }
    }
    
    private func loadDailyVerse() async {
        // Load from shared UserDefaults (App Group) or use built-in fallback
        if let data = UserDefaults(suiteName: "group.com.choosegod.app")?.data(forKey: "dailyVerse"),
           let saved = try? JSONDecoder().decode(WatchDailyVerse.self, from: data) {
            verse = saved
        } else {
            verse = DailyVerseProvider.verseForToday()
        }
        isLoading = false
    }
}

// MARK: - Watch Daily Verse Model

struct WatchDailyVerse: Codable {
    let text: String
    let reference: String
    let date: String
    
    static let placeholder = WatchDailyVerse(
        text: "The Lord is my shepherd; I shall not want.",
        reference: "Psalm 23:1 KJV",
        date: ""
    )
}

#Preview {
    WatchDailyVerseView()
}
