import SwiftUI

/// Pricing cards for the 3 church partnership tiers
struct ChurchPricingView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Choose Your Plan")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            VStack(spacing: 12) {
                PricingTierCard(
                    tier: .free,
                    isPopular: false
                )
                
                PricingTierCard(
                    tier: .growth,
                    isPopular: true
                )
                
                PricingTierCard(
                    tier: .church,
                    isPopular: false
                )
            }
        }
    }
}

// MARK: - Pricing Tier

enum ChurchPricingTier: String, CaseIterable {
    case free, growth, church
    
    var name: String {
        switch self {
        case .free: return "Free"
        case .growth: return "Growth"
        case .church: return "Church"
        }
    }
    
    var price: String {
        switch self {
        case .free: return "$0"
        case .growth: return "$29"
        case .church: return "$79"
        }
    }
    
    var period: String {
        switch self {
        case .free: return "forever"
        case .growth: return "/month"
        case .church: return "/month"
        }
    }
    
    var subtitle: String {
        switch self {
        case .free: return "Up to 25 members"
        case .growth: return "Unlimited members"
        case .church: return "Multi-pastor & branding"
        }
    }
    
    var features: [String] {
        switch self {
        case .free:
            return [
                "Up to 25 congregation members",
                "1 pastor premium account",
                "Basic engagement dashboard",
                "Weekly sermon follow-ups",
                "Community prayer wall"
            ]
        case .growth:
            return [
                "Unlimited congregation members",
                "1 pastor premium account",
                "Full analytics dashboard",
                "Unlimited sermon follow-ups",
                "Community prayer wall",
                "Group Bible study tools",
                "Email engagement reports"
            ]
        case .church:
            return [
                "Unlimited congregation members",
                "Up to 5 pastor premium accounts",
                "Full analytics + export",
                "Custom church branding",
                "Unlimited sermon follow-ups",
                "Multi-campus support",
                "Priority support",
                "API access for integration"
            ]
        }
    }
    
    var accentColor: Color {
        switch self {
        case .free: return .green
        case .growth: return Theme.Colors.primary
        case .church: return Color(red: 0.96, green: 0.62, blue: 0.04)
        }
    }
}

// MARK: - Pricing Tier Card

private struct PricingTierCard: View {
    let tier: ChurchPricingTier
    let isPopular: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(tier.name)
                            .font(Theme.Typography.title3)
                            .foregroundStyle(Theme.Colors.text)
                        
                        if isPopular {
                            Text("POPULAR")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, Theme.Spacing.sm)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(tier.accentColor))
                        }
                    }
                    
                    Text(tier.subtitle)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 0) {
                    Text(tier.price)
                        .font(Theme.Typography.title1)
                        .foregroundStyle(tier.accentColor)
                    Text(tier.period)
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
            }
            
            Divider()
                .background(Theme.Colors.textTertiary.opacity(0.3))
            
            // Features
            VStack(alignment: .leading, spacing: 8) {
                ForEach(tier.features, id: \.self) { feature in
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(tier.accentColor)
                        Text(feature)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.text)
                    }
                }
            }
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .fill(Theme.Colors.surface)
        }
        .overlay {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.xl)
                .stroke(isPopular ? tier.accentColor.opacity(0.5) : .clear, lineWidth: isPopular ? 2 : 0)
        }
    }
}

#Preview {
    ScrollView {
        ChurchPricingView()
            .padding()
    }
    .background(Theme.Colors.background)
}
