import SwiftUI

/// Strategy Decision #9 — Daily Art+Verse Drop on Home.
/// Renders today's published drop (image overlay + verse + caption + share
/// button). Quietly returns an empty view when there's no drop published
/// for today, so the card doesn't show stale or missing content.
struct DailyDropCard: View {
    @State private var drop: DailyDropService.Drop?
    @State private var isLoading: Bool = true
    @State private var showShare: Bool = false

    var body: some View {
        Group {
            if let drop {
                content(for: drop)
            } else if isLoading {
                placeholder
            }
            // else: render nothing — no drop scheduled for today
        }
        .task {
            isLoading = true
            drop = await DailyDropService.shared.loadTodaysDrop()
            isLoading = false
        }
    }

    private func content(for drop: DailyDropService.Drop) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image with verse overlay
            ZStack(alignment: .bottomLeading) {
                AsyncImage(url: URL(string: drop.art.imageUrl)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .failure:
                        Theme.Colors.surface
                    case .empty:
                        Theme.Colors.surface
                    @unknown default:
                        Theme.Colors.surface
                    }
                }
                .frame(height: 220)
                .clipped()

                // Gradient scrim for legibility
                LinearGradient(
                    colors: [.black.opacity(0.0), .black.opacity(0.55)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 220)

                VStack(alignment: .leading, spacing: 6) {
                    Text(drop.verseReference)
                        .font(.caption)
                        .bold()
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(.white.opacity(0.18))
                        .clipShape(Capsule())
                    Text(drop.caption)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .lineLimit(3)
                }
                .padding(14)
            }

            // Footer with attribution + share
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text(drop.art.title)
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.text)
                        .lineLimit(1)
                    Text(drop.art.attribution)
                        .font(.caption2)
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .lineLimit(1)
                }
                Spacer()
                Button {
                    showShare = true
                    AnalyticsService.shared.capture(
                        "daily_drop_shared",
                        properties: ["drop_id": drop.id]
                    )
                } label: {
                    Image(systemName: "square.and.arrow.up")
                        .font(.callout)
                        .foregroundStyle(Theme.Colors.primary)
                        .padding(8)
                        .background(Theme.Colors.primary.opacity(0.12))
                        .clipShape(Circle())
                }
            }
            .padding(12)
            .background(Theme.Colors.surface)
        }
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .padding(.horizontal)
        .sheet(isPresented: $showShare) {
            // Uses the canonical ShareSheet in Core/Views/ShareSheet.swift
            ShareSheet(activityItems: [
                "\(drop.caption)\n\n\u{2014} \(drop.verseReference)",
                URL(string: drop.art.imageUrl) as Any
            ])
        }
    }

    private var placeholder: some View {
        RoundedRectangle(cornerRadius: 18)
            .fill(Theme.Colors.surface)
            .frame(height: 240)
            .padding(.horizontal)
            .overlay(
                ProgressView().tint(Theme.Colors.secondaryText)
            )
    }
}

#Preview {
    DailyDropCard()
        .environment(AppState.preview)
}
