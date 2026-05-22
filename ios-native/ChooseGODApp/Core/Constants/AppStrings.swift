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

        // Chat Quota
        static func chatsRemaining(_ count: Int) -> String {
            "\(count) remaining"
        }
        static let quotaExhaustedTitle = "Conversations Used"
        static let quotaExhaustedBody = "You've used your 5 free AI conversations. Upgrade for unlimited access."
        static let unlockUnlimited = "Unlock Unlimited"
        static let maybeLater = "Maybe Later"

        // Quick prompts
        static let promptAnxiety = "What does the Bible say about anxiety?"
        static let promptJohn316 = "Help me understand John 3:16"
        static let promptEncouragement = "I need encouragement today"
        static let promptSermon = "Explain the Sermon on the Mount"
        static let promptSermonFull = "Can you explain the Sermon on the Mount?"

        // Context
        static func readingContext(_ reference: String) -> String {
            "Reading: \(reference)"
        }

        // Accessibility
        static let closeChatHint = "Double tap to close the chat"
        static let clearChatHint = "Double tap to delete all messages"
        static let unlockHint = "Double tap to view premium options"
        static let messageInputHint = "Type your message here"
        static let sendMessage = "Send message"
        static let sendMessageHint = "Double tap to send your message"
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

        // Accessibility
        static let signInHint = "Double tap to sign in"
        static let signInLabel = "Sign in to your account"
        static let forgotPasswordHint = "Double tap to reset your password"
        static let forgotPasswordLabel = "Forgot password"
        static let createAccountLabel = "Create new account"
        static let createAccountHint = "Double tap to create an account"
    }

    // MARK: - Paywall

    enum Paywall {
        static let heroTitle = "Unlock Deeper\nCompanionship"
        static let heroSubtitle = "Premium spiritual tools for deeper Bible study, guided practices, and personalized growth."

        // Social proof (removed — no longer using hardcoded fake numbers)

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
        static let legalAnd = "and"
        static let legalSuffix = "Your subscription supports faithful Bible tools for everyone."

        // Accessibility
        static let restoreLabel = "Restore previous purchases"
        static let restoreHint = "Double tap to restore your subscription"
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
        static let save50 = "Save 50%"

        // Accessibility
        static let signOutLabel = "Sign out of your account"
        static let signOutHint = "Double tap to sign out"
        static let deleteAccountLabel = "Delete your account"
        static let deleteAccountHint = "Double tap to permanently delete your account"
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

// AppURLs is defined canonically in Core/Constants/AppURLs.swift
// (this duplicate enum caused an ambiguous-lookup build error — removed).
