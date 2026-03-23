import SwiftUI

// MARK: - Hebrew Calendar Models (inline to avoid import issues)

/// Hebrew date information
struct HebrewDate: Codable, Hashable {
    let gregorianDate: Date
    let hebrewDateString: String // e.g., "18 Tevet 5784"
    let hebrewYear: Int
    let hebrewMonth: Int
    let hebrewDay: Int

    enum CodingKeys: String, CodingKey {
        case gregorianDate, hebrewDateString, hebrewYear, hebrewMonth, hebrewDay
    }
}

/// Torah portion (Parasha) information
struct TorahPortion: Codable, Hashable {
    let id: String // e.g., "parashat-bereishit"
    let name: String // English name: "Parashat Bereishit"
    let hebrewName: String // Hebrew name: "פרשת בראשית"
    let date: Date
    let aliyot: [String] // breakdown of the 7 readings: ["Genesis 1:1-1:5", ...]
    var description: String? // One-line English summary of the Torah portion

    enum CodingKeys: String, CodingKey {
        case id, name, hebrewName, date, aliyot, description
    }
}

/// Card showing Hebrew date + Torah portion context
struct CalendarContextCard: View {
    @State private var hebrewDate: HebrewDate?
    @State private var torahPortion: TorahPortion?
    @State private var isLoading = true

    var body: some View {
        ZStack {
            if isLoading {
                RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                    .fill(.ultraThinMaterial)
                    .frame(height: 100)
                    .redacted(reason: .placeholder)
            } else if let hebrewDate = hebrewDate {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Hebrew Calendar")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(.white.opacity(0.7))
                            Text(hebrewDate.hebrewDateString)
                                .font(Theme.Typography.title3)
                                .foregroundStyle(Theme.Colors.text)
                        }

                        Spacer()

                        if let torah = torahPortion {
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("Torah Portion")
                                    .font(Theme.Typography.captionSemibold)
                                    .foregroundStyle(.white.opacity(0.6))
                                Text(torah.name)
                                    .font(Theme.Typography.body)
                                    .foregroundStyle(Theme.Colors.accent)
                                    .lineLimit(1)
                                if let desc = torah.description {
                                    Text(desc)
                                        .font(Theme.Typography.caption)
                                        .foregroundStyle(Theme.Colors.secondaryText)
                                        .lineLimit(1)
                                }
                            }
                        }
                    }
                }
                .padding(Theme.Spacing.md)
                .background {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .fill(.ultraThinMaterial)
                }
                .overlay {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                        .stroke(.white.opacity(0.1), lineWidth: 1)
                }
            }
        }
        .task {
            await loadCalendarData()
        }
    }

    private func loadCalendarData() async {
        isLoading = true

        await withTaskGroup(of: Void.self) { group in
            group.addTask {
                if let date = await HebcalService.shared.getHebrewDate(for: Date()) {
                    await MainActor.run {
                        hebrewDate = date
                    }
                }
            }
            group.addTask {
                if let torah = await HebcalService.shared.getTorahPortion(for: Date()) {
                    await MainActor.run {
                        torahPortion = torah
                    }
                }
            }
        }

        isLoading = false
    }
}

#Preview {
    CalendarContextCard()
        .padding()
        .background(Color.black)
}
