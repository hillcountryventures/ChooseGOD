// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ChooseGOD",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "ChooseGOD",
            targets: ["ChooseGOD"]
        ),
    ],
    dependencies: [
        // Supabase Swift SDK
        .package(url: "https://github.com/supabase-community/supabase-swift", from: "2.0.0"),
        // RevenueCat for subscriptions
        .package(url: "https://github.com/RevenueCat/purchases-ios", from: "4.43.0"),
        // PostHog for analytics
        .package(url: "https://github.com/PostHog/posthog-ios", from: "3.0.0"),
    ],
    targets: [
        .target(
            name: "ChooseGOD",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "RevenueCat", package: "purchases-ios"),
                .product(name: "PostHog", package: "posthog-ios"),
            ]
        ),
    ]
)
