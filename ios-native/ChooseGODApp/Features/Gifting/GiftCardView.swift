import SwiftUI

/// Beautiful gift card view for sharing
struct GiftCardView: View {
    let senderName: String
    let recipientName: String
    let planName: String
    let redemptionCode: String
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [
                    Color(red: 0.15, green: 0.10, blue: 0.35),
                    Color(red: 0.25, green: 0.12, blue: 0.50),
                    Color(red: 0.18, green: 0.08, blue: 0.38)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Subtle pattern overlay
            VStack {
                HStack {
                    Spacer()
                    Image(systemName: "cross.fill")
                        .font(.system(size: 200))
                        .foregroundStyle(.white.opacity(0.03))
                        .rotationEffect(.degrees(15))
                        .offset(x: 40, y: -30)
                }
                Spacer()
            }
            
            VStack(spacing: 0) {
                Spacer()
                
                // Crown icon
                Image(systemName: "gift.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                    .padding(.bottom, Theme.Spacing.lg)
                
                // Title
                Text("You've been gifted")
                    .font(.system(size: 20, weight: .medium, design: .serif))
                    .foregroundStyle(.white.opacity(0.8))
                
                Text("ChooseGOD Premium")
                    .font(.system(size: 32, weight: .bold, design: .serif))
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                    .padding(.top, 4)
                
                // Plan
                Text(planName)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white.opacity(0.5))
                    .padding(.top, Theme.Spacing.sm)
                
                // Divider
                Rectangle()
                    .fill(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.3))
                    .frame(width: 120, height: 1)
                    .padding(.vertical, 28)
                
                // From
                if !senderName.isEmpty {
                    VStack(spacing: 4) {
                        Text("From")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.white.opacity(0.4))
                        Text(senderName)
                            .font(.system(size: 18, weight: .semibold, design: .serif))
                            .foregroundStyle(.white)
                    }
                    .padding(.bottom, Theme.Spacing.mds)
                }
                
                // To
                if !recipientName.isEmpty {
                    VStack(spacing: 4) {
                        Text("To")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.white.opacity(0.4))
                        Text(recipientName)
                            .font(.system(size: 18, weight: .semibold, design: .serif))
                            .foregroundStyle(.white)
                    }
                }
                
                Spacer()
                
                // Redemption code
                if !redemptionCode.isEmpty {
                    VStack(spacing: 6) {
                        Text("Redemption Code")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(.white.opacity(0.4))
                        
                        Text(redemptionCode)
                            .font(.system(size: 16, weight: .bold, design: .monospaced))
                            .foregroundStyle(.white)
                            .padding(.horizontal, Theme.Spacing.md)
                            .padding(.vertical, Theme.Spacing.sm)
                            .background(.white.opacity(0.1))
                            .cornerRadius(8)
                    }
                    .padding(.bottom, Theme.Spacing.sm)
                }
                
                // Watermark
                HStack(spacing: 6) {
                    Image(systemName: "cross.fill")
                        .font(.system(size: 10))
                    Text("ChooseGOD")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                }
                .foregroundStyle(.white.opacity(0.2))
                .padding(.bottom, 40)
            }
        }
        .frame(width: 1080, height: 1080)
    }
}

#Preview {
    GiftCardView(
        senderName: "Bobby",
        recipientName: "Sarah",
        planName: "Annual Plan",
        redemptionCode: "GIFT-ABC123"
    )
    .scaleEffect(0.35)
}
