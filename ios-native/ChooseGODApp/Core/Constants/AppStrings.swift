import Foundation

// MARK: - Centralized User-Facing Strings
// All user-visible copy lives here for easy localization and consistency.
// Usage: AppStrings.Chat.navTitle

enum AppStrings {

    // MARK: - Chat / Scripture Companion

    enum Chat {
        static let navTitle = "Ask the Bible"
        static let welcomeTitle = "Hi! I'm your Bible companion"
        static let welcomeBody = "Ask me anything about Scripture, faith, or life. I'll help you find wisdom in God's Word."
        static let inputPlaceholder = "Ask anything..."
        static let clearChat = "Clear Chat"
        static let close = "Close"

        // Seeds / Quota
        static func seedsRemaining(_ count: Int) -> String {
            "\(count) seeds remaining"
        }
        static let seedsExhaustedTitle = "Seeds Planted for Today"
        static let seedsExhaustedBody = "You've used all 3 daily seeds. Come back tomorrow for more, or upgrade to Premium for unlimited conversations."
        static let unlockUnlimited = "Unlock Unlimited"
        static let maybeLater = "Maybe Later"

        // Quick prompts
        static let promptAnxiety = "What does the Bible say about anxiety?"
        static let promptJohn316 = "Help me understand John 3:16"
        static let promptEncouragement = "I need encouragement today"
        static let promptSermon = "Explain the Sermon on the Mount"

        // Context
        static func readingContext(_ reference: String) -> String {
            "Reading: \(reference)"
        }
    }

    // MARK: - Home

    enum Home {
        static let verseOfTheDay = "Verse of the Day"
        static let continueJourney = "Continue Your Journey"

        // Quick Actions
        static let readBible = "Read Bible"
        static let askTheBible = "Ask the Bible"
        static let pray = "Pray"
        static let devotional = "Devotional"

        // Stats
        static let dayStreak = "Day Streak"
        static let chapters = "Chapters"
        static let saved = "Saved"

        // Greetings
        static let goodMorning = "Good morning,"
        static let goodAfternoon = "Good afternoon,"
        static let goodEvening = "Good evening,"

        static let defaultName = "Friend"
    }

    // MARK: - Auth

    enum Auth {
        // Login
        static let welcomeBack = "Welcome Back"
        static let signInSubtitle = "Sign in to continue your journey"
        static let signIn = "Sign In"
        static let forgotPassword = "Forgot Password?"
        static let noAccount = "Don't have an account?"
        static let signUp = "Sign Up"
        static let orContinueWithEmail = "or continue with email"

        // Sign Up
        static let createAccount = "Create Account"
        static let startJourney = "Start your spiritual journey today"
        static let orSignUpWithEmail = "or sign up with email"
        static let showPasswords = "Show passwords"
        static let cancel = "Cancel"

        // Form labels
        static let email = "Email"
        static let password = "Password"
        static let fullName = "Full Name"
        static let confirmPassword = "Confirm Password"
        static let emailPlaceholder = "Enter your email"
        static let passwordPlaceholder = "Enter your password"
        static let createPasswordPlaceholder = "Create a password"
        static let confirmPasswordPlaceholder = "Confirm your password"
        static let namePlaceholder = "Enter your name"

        // Terms
        static let agreePrefix = "I agree to the "
        static let termsOfService = "Terms of Service"
        static let andText = " and "
        static let privacyPolicy = "Privacy Policy"

        // Validation
        static let passwordsMismatch = "Passwords don't match"
    }

    // MARK: - Paywall

    enum Paywall {
        static let heroTitle = "Unlock Deeper\nCompanionship"
        static let heroSubtitle = "Premium spiritual tools for deeper Bible study, guided practices, and personalized growth."

        // Social proof
        static let believers = "Believers"
        static let dayTrial = "day trial"
        static func ratings(_ count: Int) -> String { "\(count) ratings" }

        // Feature comparison
        static let featureHeader = "Feature"
        static let freeColumn = "Free"
        static let proColumn = "Pro"

        // Plans
        static let annual = "Annual"
        static let monthly = "Monthly"
        static let save50 = "SAVE 50%"

        // Purchase
        static let startFreeTrial = "Start Free Trial"
        static let subscribeNow = "Subscribe Now"
        static let restorePurchases = "Restore Purchases"

        // Trial / Renewal
        static func trialNote(days: Int, price: String, period: String) -> String {
            "\(days)-day free trial, then \(price)/\(period). Cancel anytime."
        }
        static func renewalDisclosure(price: String, period: String) -> String {
            "Subscription automatically renews at \(price)/\(period) unless canceled at least 24 hours before the end of the current period. You can manage or cancel anytime in your App Store Settings."
        }

        // Legal
        static let legalPrefix = "By subscribing, you agree to our"
        static let legalSuffix = "Your subscription supports faithful Bible tools for everyone."
    }

    // MARK: - Settings

    enum Settings {
        static let title = "Settings"

        // Subscription
        static let upgradeToPremium = "Upgrade to Premium"
        static let premium = "Premium"
        static let shareAndEarn = "Share & Earn Free Days"

        // Sections
        static let reading = "Reading"
        static let notifications = "Notifications"
        static let privacyAndData = "Privacy & Data"
        static let support = "Support"

        // Preferences
        static let translation = "Translation"
        static let fontSize = "Font Size"
        static let morningReminder = "Morning Reminder"
        static let eveningReminder = "Evening Reminder"
        static let hapticFeedback = "Haptic Feedback"

        // Privacy & Data
        static let privacySettings = "Privacy Settings"
        static let exportMyData = "Export My Data"

        // Support
        static let contactSupport = "Contact Support"

        // Account
        static let signOut = "Sign Out"
        static let signOutConfirmation = "Are you sure you want to sign out?"
        static let deleteAccount = "Delete Account"
        static let deleteAccountWarning = "This action cannot be undone. All your data will be permanently deleted."
        static let version = "Version"

        // Subscription view
        static let unlockPremium = "Unlock Premium"
        static let unlockPremiumBody = "Get unlimited Scripture Companion questions, remove ads, and access exclusive content."
        static let annualPrice = "$29.99/year"
        static let monthlyPrice = "$4.99/month"
    }

    // MARK: - Prayers

    enum Prayers {
        static let title = "Prayers"
        static let newPrayer = "New Prayer"
        static let addPrayer = "Add Prayer"
        static let whatsOnYourHeart = "What's on your heart?"
        static let answered = "Answered!"
        static let reflection = "Reflection"

        // Empty states
        static let beginJourneyTitle = "Begin Your Prayer Journey"
        static let beginJourneyBody = "Cast your cares upon the Lord. Tap + to lift your first prayer."
        static let noAnsweredTitle = "No Answered Prayers Yet"
        static let noAnsweredBody = "When God answers, you'll see them here. Keep praying — He hears you."
    }

    // MARK: - Journal

    enum Journal {
        static let title = "Journal"
        static let searchPrompt = "Search entries..."
        static let loadingEntries = "Loading entries..."

        // Empty state
        static let emptyTitle = "Your Story Awaits"
        static let emptyBody = "Start writing to capture what God is doing in your life. Every entry is a testimony."
        static let writeEntry = "Write Entry"
    }

    // MARK: - Errors

    enum Errors {
        // Generic
        static let genericTitle = "Error"
        static let genericBody = "An error occurred"
        static let somethingWentWrong = "Something went wrong."
        static let ok = "OK"
        static let cancel = "Cancel"
        static let pleaseWait = "Please wait..."

        // Network
        static let networkUnavailable = "No internet connection. Please check your network and try again."
        static let requestTimeout = "The request timed out. Please try again."
        static let serverError = "Our servers are taking a break. Please try again in a moment."

        // Auth
        static let invalidCredentials = "Invalid email or password. Please try again."
        static let accountNotFound = "No account found with that email address."
        static let emailAlreadyInUse = "An account with that email already exists. Try signing in instead."
        static let weakPassword = "Password must be at least 8 characters with one letter and one number."
        static let sessionExpired = "Your session has expired. Please sign in again."

        // Subscription
        static let purchaseFailed = "Unable to complete the purchase. Please try again."
        static let restoreFailed = "We couldn't find any previous purchases to restore."

        // Data
        static let loadFailed = "Unable to load your data. Pull to refresh and try again."
        static let saveFailed = "We couldn't save your changes. Please try again."
    }

    // MARK: - Empty States

    enum EmptyStates {
        // Bible
        static let noBibleResultsTitle = "No Results"
        static let noBibleResultsBody = "Try a different search term or browse by book."

        // Chat
        static let noChatHistoryTitle = "No Conversations Yet"
        static let noChatHistoryBody = "Start a conversation with the Scripture Companion to explore God's Word."

        // Bookmarks
        static let noBookmarksTitle = "No Bookmarks Yet"
        static let noBookmarksBody = "Save verses that speak to you and find them here anytime."

        // Notes
        static let noNotesTitle = "No Notes Yet"
        static let noNotesBody = "Add notes as you study to deepen your understanding."

        // Devotionals
        static let noDevotionalsTitle = "Start Your First Devotional"
        static let noDevotionalsBody = "Explore curated reading plans to grow in faith every day."

        // Highlights
        static let noHighlightsTitle = "No Highlights Yet"
        static let noHighlightsBody = "Highlight meaningful verses as you read."
    }

    // MARK: - Splash

    enum Splash {
        static let appName = "ChooseGOD"
    }
}
