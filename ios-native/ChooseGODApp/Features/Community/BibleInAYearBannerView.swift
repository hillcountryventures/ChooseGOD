import SwiftUI

/// Promotional banner for the Bible in a Year challenge.
/// Drop into HomeView or any parent view.
struct BibleInAYearBannerView: View {
    var onTap: (() -> Void)?
    
    private var dayOfYear: Int {
        Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
    }
    
    var body: some View {
        Button {
            onTap?()
        } label: {
            HStack(spacing: 16) {
                VStack(spacing: 4) {
                    Text("📖")
                        .font(.system(size: 36))
                    Text("Day \(dayOfYear)")
                        .font(.caption2.bold())
                        .foregroundStyle(.white.opacity(0.9))
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Bible in a Year")
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text("Join thousands reading through the Bible together. Start today!")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.85))
                        .lineLimit(2)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [.blue, .indigo],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack {
        BibleInAYearBannerView()
            .padding()
    }
}
