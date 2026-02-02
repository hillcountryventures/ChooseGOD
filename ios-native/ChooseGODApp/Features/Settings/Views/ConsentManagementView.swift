import SwiftUI

/// GDPR-compliant consent management for analytics and crash reporting
struct ConsentManagementView: View {
    @AppStorage("consent_analytics") private var analyticsEnabled = false
    @AppStorage("consent_crash_reporting") private var crashReportingEnabled = false
    @AppStorage("consent_date") private var consentDate: Double = 0
    
    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Your Privacy Matters")
                        .font(Theme.Typography.title3)
                        .foregroundStyle(Theme.Colors.text)
                    Text("We respect your data. Choose which optional services you'd like to enable. These are OFF by default and the app works fully without them.")
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                .padding(.vertical, Theme.Spacing.sm)
            }
            
            Section("Optional Data Sharing") {
                Toggle(isOn: $analyticsEnabled) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Analytics")
                            .foregroundStyle(Theme.Colors.text)
                        Text("Help us improve by sharing anonymous usage data")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
                .onChange(of: analyticsEnabled) { _, _ in saveConsentDate() }
                
                Toggle(isOn: $crashReportingEnabled) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Crash Reporting")
                            .foregroundStyle(Theme.Colors.text)
                        Text("Send crash reports to help us fix bugs faster")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
                .onChange(of: crashReportingEnabled) { _, _ in saveConsentDate() }
            }
            
            Section {
                Link(destination: AppURLs.privacy) {
                    HStack {
                        Image(systemName: "hand.raised")
                        Text("Privacy Policy")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
                
                if consentDate > 0 {
                    HStack {
                        Text("Last updated")
                        Spacer()
                        Text(Date(timeIntervalSince1970: consentDate), style: .date)
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
            }
        }
        .navigationTitle("Privacy Settings")
    }
    
    private func saveConsentDate() {
        consentDate = Date().timeIntervalSince1970
    }
}

#Preview {
    NavigationStack {
        ConsentManagementView()
    }
}
