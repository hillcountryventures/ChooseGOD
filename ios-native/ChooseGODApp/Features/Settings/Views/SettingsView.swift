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
                                .font(Theme.Typography.title2)
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
                                    Text("Premium")
                                        .font(Theme.Typography.captionMedium)
                                }
                                .foregroundStyle(.yellow)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 8)
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
                                Text("Upgrade to Premium")
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
                            Text("Share & Earn Free Days")
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                }
                
                // Reading Preferences
                Section("Reading") {
                    Picker("Translation", selection: Binding(
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
                    
                    Picker("Font Size", selection: Binding(
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
                Section("Notifications") {
                    Toggle("Morning Reminder", isOn: Binding(
                        get: { appState.preferences.morningNotificationEnabled },
                        set: {
                            appState.preferences.morningNotificationEnabled = $0
                            appState.preferences.save()
                        }
                    ))
                    
                    Toggle("Evening Reminder", isOn: Binding(
                        get: { appState.preferences.eveningNotificationEnabled },
                        set: {
                            appState.preferences.eveningNotificationEnabled = $0
                            appState.preferences.save()
                        }
                    ))
                    
                    Toggle("Haptic Feedback", isOn: Binding(
                        get: { appState.preferences.hapticFeedbackEnabled },
                        set: {
                            appState.preferences.hapticFeedbackEnabled = $0
                            appState.preferences.save()
                        }
                    ))
                }
                
                // Privacy & Data
                Section("Privacy & Data") {
                    NavigationLink {
                        ConsentManagementView()
                    } label: {
                        HStack {
                            Image(systemName: "hand.raised.fill")
                                .foregroundStyle(Theme.Colors.primary)
                            Text("Privacy Settings")
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                    
                    Button {
                        exportUserData()
                    } label: {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundStyle(Theme.Colors.accent)
                            Text("Export My Data")
                                .foregroundStyle(Theme.Colors.text)
                        }
                    }
                }
                
                // Support
                Section("Support") {
                    Link(destination: AppURLs.support) {
                        HStack {
                            Image(systemName: "envelope")
                            Text("Contact Support")
                        }
                    }
                    
                    Link(destination: AppURLs.privacy) {
                        HStack {
                            Image(systemName: "hand.raised")
                            Text("Privacy Policy")
                        }
                    }
                    
                    Link(destination: AppURLs.terms) {
                        HStack {
                            Image(systemName: "doc.text")
                            Text("Terms of Service")
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
                            Text("Sign Out")
                        .accessibilityLabel("Sign out of your account")
                        .accessibilityHint("Double tap to sign out")
                        }
                        .foregroundStyle(.orange)
                    }
                    
                    Button {
                        showDeleteConfirmation = true
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                            Text("Delete Account")
                        .accessibilityLabel("Delete your account")
                        .accessibilityHint("Double tap to permanently delete your account")
                        }
                        .foregroundStyle(.red)
                    }
                }
                
                // App Info
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0")
                            .foregroundStyle(Theme.Colors.secondaryText)
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Sign Out", isPresented: $showSignOutConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Sign Out", role: .destructive) {
                    Task { await appState.signOut() }
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .alert("Delete Account", isPresented: $showDeleteConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    Task {
                        try? await appState.authService.deleteAccount()
                    }
                }
            } message: {
                Text("This action cannot be undone. All your data will be permanently deleted.")
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
                    .font(Theme.Typography.iconHuge)
                    .foregroundStyle(.yellow)
                
                Text("Unlock Premium")
                    .font(Theme.Typography.title1)
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Get unlimited AI questions, remove ads, and access exclusive content.")
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
                    price: "$29.99/year",
                    savings: "Save 50%"
                ) {
                    selectedPackage = .annual
                }
                
                PackageCard(
                    package: .monthly,
                    isSelected: selectedPackage == .monthly,
                    price: "$4.99/month",
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
                    Text("Subscribe Now")
                        .font(Theme.Typography.title3)
                }
            }
            .primaryButtonStyle()
            .padding(.horizontal)
            .disabled(isPurchasing)
            
            // Restore
            Button("Restore Purchases") {
                Task {
                    try? await appState.subscriptionService.restorePurchases()
                }
            }
            .secondaryButtonStyle()
            .padding(.bottom, 32)
        }
        .screenBackground()
        .navigationTitle("Premium")
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
                                .font(Theme.Typography.captionMedium)
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
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
