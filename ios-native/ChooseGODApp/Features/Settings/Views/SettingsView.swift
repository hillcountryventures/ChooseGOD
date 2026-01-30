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
                                .font(.title2.bold())
                                .foregroundStyle(Theme.Colors.primary)
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(appState.currentUser?.displayName ?? "User")
                                .font(.headline)
                                .foregroundStyle(Theme.Colors.text)
                            
                            Text(appState.currentUser?.email ?? "")
                                .font(.subheadline)
                                .foregroundStyle(Theme.Colors.secondaryText)
                            
                            if appState.currentUser?.isPremium == true {
                                HStack(spacing: 4) {
                                    Image(systemName: "crown.fill")
                                        .font(.caption)
                                    Text("Premium")
                                        .font(.caption.weight(.medium))
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
                    Link(destination: URL(string: "mailto:support@choosegod.app")!) {
                        HStack {
                            Image(systemName: "envelope")
                            Text("Contact Support")
                        }
                    }
                    
                    Link(destination: URL(string: "https://choosegod.app/privacy")!) {
                        HStack {
                            Image(systemName: "hand.raised")
                            Text("Privacy Policy")
                        }
                    }
                    
                    Link(destination: URL(string: "https://choosegod.app/terms")!) {
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
                        }
                        .foregroundStyle(.orange)
                    }
                    
                    Button {
                        showDeleteConfirmation = true
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                            Text("Delete Account")
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
        let userData: [String: Any] = [
            "displayName": appState.currentUser?.displayName ?? "",
            "email": appState.currentUser?.email ?? "",
            "exportDate": ISO8601DateFormatter().string(from: Date()),
            "note": "This is a copy of your ChooseGOD account data."
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: userData, options: .prettyPrinted) {
            let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("ChooseGOD_DataExport.json")
            try? jsonData.write(to: tempURL)
            exportURL = tempURL
            showExportShare = true
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
                    .font(.system(size: 60))
                    .foregroundStyle(.yellow)
                
                Text("Unlock Premium")
                    .font(.title.bold())
                    .foregroundStyle(Theme.Colors.text)
                
                Text("Get unlimited AI questions, remove ads, and access exclusive content.")
                    .font(.body)
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
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Subscribe Now")
                        .font(.headline)
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Theme.Colors.primary)
            .cornerRadius(16)
            .padding(.horizontal)
            .disabled(isPurchasing)
            
            // Restore
            Button("Restore Purchases") {
                Task {
                    try? await appState.subscriptionService.restorePurchases()
                }
            }
            .font(.subheadline)
            .foregroundStyle(Theme.Colors.secondaryText)
            .padding(.bottom, 32)
        }
        .background(Theme.Colors.background)
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
                            .font(.headline)
                            .foregroundStyle(Theme.Colors.text)
                        
                        if let savings = savings {
                            Text(savings)
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.green)
                                .cornerRadius(8)
                        }
                    }
                    
                    Text(price)
                        .font(.subheadline)
                        .foregroundStyle(Theme.Colors.secondaryText)
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
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
