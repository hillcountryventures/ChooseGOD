import SwiftUI

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
