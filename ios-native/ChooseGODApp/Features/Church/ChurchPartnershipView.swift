import SwiftUI

/// In-app church partnership landing page explaining the program
struct ChurchPartnershipView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showOnboarding = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 32) {
                        heroSection
                        benefitsSection
                        ChurchPricingView()
                        testimonialsSection
                        ctaSection
                    }
                    .padding()
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Church Partnership")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.Colors.text)
                }
            }
            .sheet(isPresented: $showOnboarding) {
                PastorOnboardingPlaceholderView()
            }
        }
        .onAppear { AnalyticsService.shared.screen("church_partnership") }
    }
    
    // MARK: - Hero
    
    private var heroSection: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Theme.Colors.primary.opacity(0.2))
                    .frame(width: 80, height: 80)
                Image(systemName: "building.columns.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(Theme.Colors.primary)
            }
            
            Text("Equip Your Congregation")
                .font(Theme.Typography.title1)
                .foregroundStyle(Theme.Colors.text)
                .multilineTextAlignment(.center)
            
            Text("AI-Powered Bible Study for Your Entire Church")
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
        }
        .padding(.top, Theme.Spacing.mdl)
    }
    
    // MARK: - Benefits
    
    private var benefitsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Why Partner with ChooseGOD?")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            BenefitRow(icon: "crown.fill", color: .amber, title: "Free Pastor Premium", subtitle: "Full premium access for your pastoral staff at no cost")
            BenefitRow(icon: "person.3.fill", color: .blue, title: "Congregation Management", subtitle: "Invite members, track engagement, and nurture spiritual growth")
            BenefitRow(icon: "text.book.closed.fill", color: .green, title: "Sermon Follow-Ups", subtitle: "Create guided study plans that complement your weekly sermons")
            BenefitRow(icon: "chart.bar.fill", color: .purple, title: "Group Analytics", subtitle: "See how your congregation engages with Scripture throughout the week")
        }
    }
    
    // MARK: - Testimonials
    
    private var testimonialsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("What Pastors Say")
                .font(Theme.Typography.title3)
                .foregroundStyle(Theme.Colors.text)
            
            TestimonialCard(
                quote: "ChooseGOD has transformed how our congregation engages with Scripture during the week.",
                author: "[PLACEHOLDER] — Pastor Name, Church Name"
            )
            
            TestimonialCard(
                quote: "The sermon follow-up feature alone is worth it. Members come to Sunday service already prepared.",
                author: "[PLACEHOLDER] — Pastor Name, Church Name"
            )
        }
    }
    
    // MARK: - CTA
    
    private var ctaSection: some View {
        VStack(spacing: 16) {
            Button {
                showOnboarding = true
            } label: {
                HStack {
                    Image(systemName: "arrow.right.circle.fill")
                    Text("Get Started")
                        .font(Theme.Typography.title3)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Theme.Colors.primary)
                .cornerRadius(Theme.CornerRadius.xl)
            }
            
            Text("Free for churches with up to 25 members")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
    }
}

// MARK: - Benefit Row

private struct BenefitRow: View {
    let icon: String
    let color: Color
    let title: String
    let subtitle: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(color.opacity(0.2))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .foregroundStyle(color)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.Typography.subheadlineSemibold)
                    .foregroundStyle(Theme.Colors.text)
                Text(subtitle)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(.ultraThinMaterial)
        }
    }
}

// MARK: - Testimonial Card

private struct TestimonialCard: View {
    let quote: String
    let author: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                Image(systemName: "quote.opening")
                    .foregroundStyle(Theme.Colors.primary.opacity(0.5))
                Text(quote)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.text)
                    .italic()
            }
            
            Text(author)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.secondaryText)
        }
        .padding(Theme.Spacing.md)
        .background {
            RoundedRectangle(cornerRadius: Theme.CornerRadius.lg)
                .fill(Theme.Colors.surface)
        }
    }
}

// MARK: - Pastor Onboarding Placeholder

struct PastorOnboardingPlaceholderView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()
                
                Image(systemName: "person.badge.plus")
                    .font(.system(size: 60))
                    .foregroundStyle(Theme.Colors.primary)
                
                Text("Pastor Onboarding")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("This feature is coming soon. We'll walk you through setting up your church profile, inviting your congregation, and configuring your first sermon follow-up.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.xl)
                
                Button {
                    // TODO: Link to waitlist or email
                } label: {
                    Text("Join the Waitlist")
                        .font(Theme.Typography.subheadlineSemibold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Theme.Colors.primary)
                        .cornerRadius(Theme.CornerRadius.xl)
                        .padding(.horizontal, Theme.Spacing.xl)
                }
                
                Spacer()
            }
            .background(Theme.Colors.background)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Color Extension for Amber

private extension Color {
    static let amber = Color(red: 0.96, green: 0.62, blue: 0.04)
}

#Preview {
    ChurchPartnershipView()
        .environment(AppState.preview)
}
