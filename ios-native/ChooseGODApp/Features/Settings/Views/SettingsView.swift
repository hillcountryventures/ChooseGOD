import SwiftUI

/// Settings screen with preferences and account management
struct SettingsView: View {
    @Environment(AppState.self) private var appState
    @State private var showDeleteConfirmation = false
    @State private var showSignOutConfirmation = false
    @State private var showExportShare = false
    @State private var exportURL: URL?
    
    var body: some View {
        NavigationStack {
            List {
                // Profile Section
                Section {
                    HStack(spacing: 16) {
                        // Avatar
                        ZStack {
                            Circle()
                                .fill(Theme.Colors.primary.opacity(0.2))
                                .frame(width: 60, height: 60)
                            
                            Text(appState.currentUser?.displayName.prefix(1).uppercased() ?? "?")
                                .font(Theme.Typography.title2.bold())
                                .foregroundStyle(Theme.Colors.primary)
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(appState.currentUser?.displayName ?? "User")
                                .font(Theme.Typography.title3)
                                .foregroundStyle(Theme.Colors.text)
                            
                            Text(appState.currentUser?.email ?? "")
                                .font(Theme.Typography.bodySmall)
                                .foregroundStyle(Theme.Colors.secondaryText)
                            
                            if appState.currentUser?.isPremium == true {
                                HStack(spacing: 4) {
                                    Image(systemName: "crown.fill")
                                        .font(Theme.Typography.caption)
                                    Text(AppStrings.Settings.premium)
                                        .font(Theme.Typography.caption.weight(.medium))
                                }
                                .foregroundStyle(.yellow)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, Theme.Spacing.sm)
                }
                
                // Subscription & Referral
                Section {
                    if appState.currentUser?.isPremium != true {
                        NavigationLink {
                            PaywallView()
                        } label: {
                            HStack {
                                Image(systemName: "crown.fill")
                                    .foregroundStyle(.yellow)
                                Text(AppStrings.Settings.upgradeToPremium)
                                    .foregroundStyle(Theme.Colors.text)
                            }
                        }
                    }
                    
                    NavigationLink {
                        ReferralView()
                    } label: {
                        HStack {
                            Image(systemName: "gift.fill")
                                .foregroundStyle(Theme.Colors.accent)
                            Text(AppStrings.Settings.shareAndEarn)
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                    
                    NavigationLink {
                        GiftSubscriptionView()
                    } label: {
                        HStack {
                            Image(systemName: "gift.circle.fill")
                                .foregroundStyle(.yellow)
                            Text("Gift ChooseGOD")
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                }
                
                // Reading Preferences
                Section(AppStrings.Settings.reading) {
                    Picker(AppStrings.Settings.translation, selection: Binding(
                        get: { appState.preferences.preferredTranslation },
                        set: { 
                            appState.preferences.preferredTranslation = $0
                            appState.preferences.save()
                        }
                    )) {
                        ForEach(BibleTranslation.allCases) { translation in
                            Text(translation.displayName).tag(translation)
                        }
                    }
                    
                    Picker(AppStrings.Settings.fontSize, selection: Binding(
                        get: { appState.preferences.fontSize },
                        set: {
                            appState.preferences.fontSize = $0
                            appState.preferences.save()
                        }
                    )) {
                        ForEach(UserPreferences.FontSize.allCases, id: \.self) { size in
                            Text(size.rawValue.capitalized).tag(size)
                        }
                    }
                }
                
                // Notifications
                Section(AppStrings.Settings.notifications) {
                    Toggle(AppStrings.Settings.morningReminder, isOn: Binding(
                        get: { appState.preferences.morningNotificationEnabled },
                        set: {
                            appState.preferences.morningNotificationEnabled = $0
                            appState.preferences.save()
                        }
                    ))
                    
                    Toggle(AppStrings.Settings.eveningReminder, isOn: Binding(
                        get: { appState.preferences.eveningNotificationEnabled },
                        set: {
                            appState.preferences.eveningNotificationEnabled = $0
                            appState.preferences.save()
                        }
                    ))
                    
                    Toggle(AppStrings.Settings.hapticFeedback, isOn: Binding(
                        get: { appState.preferences.hapticFeedbackEnabled },
                        set: {
                            appState.preferences.hapticFeedbackEnabled = $0
                            appState.preferences.save()
                        }
                    ))
                }
                
                // Privacy & Data
                Section(AppStrings.Settings.privacyAndData) {
                    NavigationLink {
                        ConsentManagementView()
                    } label: {
                        HStack {
                            Image(systemName: "hand.raised.fill")
                                .foregroundStyle(Theme.Colors.primary)
                            Text(AppStrings.Settings.privacySettings)
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                    
                    Button {
                        exportUserData()
                    } label: {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundStyle(Theme.Colors.accent)
                            Text(AppStrings.Settings.exportMyData)
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                }
                
                // Support
                Section(AppStrings.Settings.support) {
                    Link(destination: AppURLs.support) {
                        HStack {
                            Image(systemName: "envelope")
                            Text(AppStrings.Settings.contactSupport)
                        }
                    }
                    
                    Link(destination: AppURLs.privacy) {
                        HStack {
                            Image(systemName: "hand.raised")
                            Text(AppStrings.Auth.privacyPolicy)
                        }
                    }
                    
                    Link(destination: AppURLs.terms) {
                        HStack {
                            Image(systemName: "doc.text")
                            Text(AppStrings.Auth.termsOfService)
                        }
                    }
                }
                
                // Account Actions
                Section {
                    Button {
                        showSignOutConfirmation = true
                    } label: {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text(AppStrings.Settings.signOut)
                        .accessibilityLabel(AppStrings.Settings.signOutLabel)
                        .accessibilityHint(AppStrings.Settings.signOutHint)
                        }
                        .foregroundStyle(.orange)
                    }
                    
                    Button {
                        showDeleteConfirmation = true
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                            Text(AppStrings.Settings.deleteAccount)
                        .accessibilityLabel(AppStrings.Settings.deleteAccountLabel)
                        .accessibilityHint(AppStrings.Settings.deleteAccountHint)
                        }
                        .foregroundStyle(.red)
                    }
                }
                
                // App Info
                Section {
                    HStack {
                        Text(AppStrings.Settings.version)
                        Spacer()
                        Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0")
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
            }
            .navigationTitle(AppStrings.Settings.title)
            .alert(AppStrings.Settings.signOut, isPresented: $showSignOutConfirmation) {
                Button(AppStrings.Errors.cancel, role: .cancel) {}
                Button(AppStrings.Settings.signOut, role: .destructive) {
                    Task { await appState.signOut() }
                }
            } message: {
                Text(AppStrings.Settings.signOutConfirmation)
            }
            .alert(AppStrings.Settings.deleteAccount, isPresented: $showDeleteConfirmation) {
                Button(AppStrings.Errors.cancel, role: .cancel) {}
                Button(AppStrings.Settings.deleteAccount, role: .destructive) {
                    Task {
                        try? await appState.authService.deleteAccount()
                    }
                }
            } message: {
                Text(AppStrings.Settings.deleteAccountWarning)
            }
            .sheet(isPresented: $showExportShare) {
                if let exportURL {
                    ShareSheet(activityItems: [exportURL])
                }
            }
        }
        .onAppear { AnalyticsService.shared.screen("settings") }
    }
    
    private func exportUserData() {
        Task {
            var userData: [String: Any] = [
                "displayName": appState.currentUser?.displayName ?? "",
                "email": appState.currentUser?.email ?? "",
                "exportDate": ISO8601DateFormatter().string(from: Date()),
                "note": "This is a complete copy of your ChooseGOD account data."
            ]
            
            let userId = appState.currentUser?.id ?? ""
            let isoFormatter = ISO8601DateFormatter()
            
            // Journal entries (spiritual moments)
            let journalService = SupabaseJournalService()
            if let moments = try? await journalService.getMoments(userId: userId, type: nil, limit: 10000, offset: 0) {
                userData["journalEntries"] = moments.map { moment in
                    [
                        "id": moment.id,
                        "type": moment.momentType.rawValue,
                        "content": moment.content,
                        "themes": moment.themes,
                        "date": isoFormatter.string(from: moment.createdAt)
                    ] as [String: Any]
                }
            }
            
            // Prayer requests
            let prayerService = SupabasePrayerService()
            if let prayers = try? await prayerService.getPrayers(userId: userId, status: nil) {
                userData["prayerRequests"] = prayers.map { prayer in
                    [
                        "id": prayer.id,
                        "request": prayer.request,
                        "status": prayer.status.rawValue,
                        "date": isoFormatter.string(from: prayer.createdAt)
                    ] as [String: Any]
                }
            }
            
            // Devotional progress (enrollments)
            let devotionalService = SupabaseDevotionalService()
            if let enrollments = try? await devotionalService.getEnrollments(userId: userId) {
                userData["devotionalProgress"] = enrollments.map { enrollment in
                    [
                        "id": enrollment.id,
                        "seriesId": enrollment.seriesId,
                        "currentDay": enrollment.currentDay,
                        "isPrimary": enrollment.isPrimary
                    ] as [String: Any]
                }
            }
            
            // Preferences / settings
            userData["preferences"] = [
                "preferredTranslation": appState.preferences.preferredTranslation.rawValue,
                "fontSize": appState.preferences.fontSize.rawValue,
                "morningNotificationEnabled": appState.preferences.morningNotificationEnabled,
                "eveningNotificationEnabled": appState.preferences.eveningNotificationEnabled,
                "hapticFeedbackEnabled": appState.preferences.hapticFeedbackEnabled,
                "analyticsConsent": UserDefaults.standard.bool(forKey: "consent_analytics"),
                "crashReportingConsent": UserDefaults.standard.bool(forKey: "consent_crash_reporting")
            ] as [String: Any]
            
            await MainActor.run {
                if let jsonData = try? JSONSerialization.data(withJSONObject: userData, options: [.prettyPrinted, .sortedKeys]) {
                    let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("ChooseGOD_DataExport.json")
                    try? jsonData.write(to: tempURL)
                    exportURL = tempURL
                    showExportShare = true
                }
            }
        }
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - Subscription View

struct SubscriptionView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedPackage: SubscriptionPackage = .annual
    @State private var isPurchasing = false
    
    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 16) {
                Image(systemName: "crown.fill")
                    .font(.system(size: 60)) // Keep custom size for icon
                    .foregroundStyle(.yellow)
                
                Text(AppStrings.Settings.unlockPremium)
                    .font(Theme.Typography.title1.bold())
                    .foregroundStyle(Theme.Colors.text)
                
                Text(AppStrings.Settings.unlockPremiumBody)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .padding(.top, 32)
            
            // Package Options
            VStack(spacing: 12) {
                PackageCard(
                    package: .annual,
                    isSelected: selectedPackage == .annual,
                    price: AppStrings.Settings.annualPrice,
                    savings: AppStrings.Settings.save50
                ) {
                    selectedPackage = .annual
                }
                
                PackageCard(
                    package: .monthly,
                    isSelected: selectedPackage == .monthly,
                    price: AppStrings.Settings.monthlyPrice,
                    savings: nil
                ) {
                    selectedPackage = .monthly
                }
            }
            .padding(.horizontal)
            
            Spacer()
            
            // Purchase Button
            Button {
                Task { await purchase() }
            } label: {
                if isPurchasing {
                    ShimmerView(height: 20)
                        .tint(.white)
                } else {
                    Text(AppStrings.Paywall.subscribeNow)
                        .font(Theme.Typography.title3)
                }
            }
            .primaryButtonStyle()
            .padding(.horizontal)
            .disabled(isPurchasing)
            
            // Restore
            Button(AppStrings.Paywall.restorePurchases) {
                Task {
                    try? await appState.subscriptionService.restorePurchases()
                }
            }
            .secondaryButtonStyle()
            .padding(.bottom, 32)
        }
        .screenBackground()
        .navigationTitle(AppStrings.Settings.premium)
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func purchase() async {
        isPurchasing = true
        do {
            _ = try await appState.subscriptionService.purchase(package: selectedPackage)
        } catch {
            appState.handleError(error)
        }
        isPurchasing = false
    }
}

// MARK: - Package Card

struct PackageCard: View {
    let package: SubscriptionPackage
    let isSelected: Bool
    let price: String
    let savings: String?
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(package.displayName)
                            .font(Theme.Typography.title3)
                            .foregroundStyle(Theme.Colors.text)
                        
                        if let savings = savings {
                            Text(savings)
                                .font(Theme.Typography.caption.weight(.medium))
                                .foregroundStyle(.white)
                                .padding(.horizontal, Theme.Spacing.sm)
                                .padding(.vertical, 4)
                                .background(Color.green)
                                .cornerRadius(8)
                        }
                    }
                    
                    Text(price)
                        .font(Theme.Typography.bodySmall)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(Theme.Typography.title2)
                    .foregroundStyle(isSelected ? Theme.Colors.primary : Theme.Colors.secondaryText)
            }
            .padding()
            .background(Theme.Colors.surface)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Theme.Colors.primary : Color.clear, lineWidth: 2)
            )
        }
    }
}

#Preview {
    SettingsView()
        .environment(AppState.preview)
}
