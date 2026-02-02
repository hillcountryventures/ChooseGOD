import Foundation

// MARK: - Sermon Devotional Generator

/// Generates a 5-day devotional plan from a sermon passage reference.
/// Day 1: Full passage + context
/// Day 2: Key themes + cross-references
/// Day 3: Personal application questions
/// Day 4: Prayer focus
/// Day 5: Memory verse + discussion prompt
struct SermonDevotionalGenerator {
    
    // MARK: - Cross-Reference Database (Common Passages)
    
    private static let crossReferenceMap: [String: [String]] = [
        "John 3": ["Romans 5:8", "1 John 4:9-10", "Ephesians 2:4-5", "Romans 6:23", "Titus 3:4-7"],
        "Romans 8": ["Psalm 139:7-10", "John 10:28-29", "Ephesians 1:13-14", "2 Corinthians 5:17", "Philippians 1:6"],
        "Psalm 23": ["John 10:11-14", "Isaiah 40:11", "Ezekiel 34:11-16", "Revelation 7:17", "Hebrews 13:20"],
        "Matthew 5": ["Luke 6:20-26", "James 1:12", "1 Peter 3:14", "Romans 12:14-21", "Psalm 37:11"],
        "Genesis 1": ["John 1:1-3", "Colossians 1:16-17", "Hebrews 11:3", "Psalm 33:6", "Isaiah 45:18"],
        "Ephesians 2": ["Romans 3:23-24", "Titus 3:5-7", "2 Corinthians 5:17", "Galatians 2:20", "Romans 6:23"],
        "Philippians 4": ["Matthew 6:25-34", "1 Peter 5:7", "Isaiah 26:3", "Psalm 46:1", "2 Corinthians 9:8"],
        "Isaiah 40": ["Psalm 103:1-5", "2 Corinthians 4:16-18", "Nehemiah 8:10", "Habakkuk 3:19", "Psalm 27:14"],
        "Romans 12": ["1 Peter 4:10-11", "Galatians 5:13", "Colossians 3:23-24", "1 Corinthians 12:4-7", "Ephesians 4:11-13"],
        "1 Corinthians 13": ["Colossians 3:14", "1 John 4:7-8", "Romans 13:8-10", "Galatians 5:22-23", "1 Peter 4:8"],
    ]
    
    // MARK: - Generate Plan
    
    static func generate(passageReference: String, createdBy: String) -> SermonDevotionalPlan {
        let id = UUID().uuidString
        let crossRefs = findCrossReferences(for: passageReference)
        
        let days = [
            generateDay1(passage: passageReference),
            generateDay2(passage: passageReference, crossRefs: crossRefs),
            generateDay3(passage: passageReference),
            generateDay4(passage: passageReference),
            generateDay5(passage: passageReference),
        ]
        
        return SermonDevotionalPlan(
            id: id,
            passageReference: passageReference,
            title: "Sermon Follow-Up: \(passageReference)",
            createdBy: createdBy,
            days: days,
            createdAt: Date()
        )
    }
    
    // MARK: - Day Generators
    
    private static func generateDay1(passage: String) -> SermonDevotionalDay {
        SermonDevotionalDay(
            id: UUID().uuidString,
            dayNumber: 1,
            title: "Full Passage & Context",
            subtitle: "Read & Reflect",
            content: """
            Read \(passage) slowly and carefully, ideally in two different translations.
            
            As you read, consider:
            • Who is speaking and who is the audience?
            • What is the historical and cultural context?
            • What events come before and after this passage?
            • What stands out to you on first reading?
            
            Take notes on anything that surprises you or raises questions. Sit with the text before moving to interpretation.
            """,
            passageReference: passage,
            crossReferences: nil,
            questions: nil,
            prayerPrompt: "Lord, open my eyes to see wonderful things in Your Word. Give me ears to hear what You are speaking through \(passage). Amen.",
            memoryVerse: nil
        )
    }
    
    private static func generateDay2(passage: String, crossRefs: [String]) -> SermonDevotionalDay {
        let refsText = crossRefs.isEmpty
            ? "Look up related passages using your Bible's cross-reference notes or a concordance."
            : "Explore these cross-references:\n" + crossRefs.enumerated().map { "• \($1)" }.joined(separator: "\n")
        
        return SermonDevotionalDay(
            id: UUID().uuidString,
            dayNumber: 2,
            title: "Key Themes & Cross-References",
            subtitle: "Go Deeper",
            content: """
            Re-read \(passage) and identify 2-3 key themes or repeated words.
            
            \(refsText)
            
            Notice how Scripture interprets Scripture. What additional light do these passages shed on the themes from Sunday's sermon?
            
            Write down connections you discover between these passages.
            """,
            passageReference: nil,
            crossReferences: crossRefs.isEmpty ? nil : crossRefs,
            questions: nil,
            prayerPrompt: nil,
            memoryVerse: nil
        )
    }
    
    private static func generateDay3(passage: String) -> SermonDevotionalDay {
        SermonDevotionalDay(
            id: UUID().uuidString,
            dayNumber: 3,
            title: "Personal Application",
            subtitle: "Questions for Reflection",
            content: """
            Today, move from understanding to application. Let \(passage) examine your heart.
            
            Spend time journaling your answers to the reflection questions below. Be honest with yourself and with God.
            """,
            passageReference: nil,
            crossReferences: nil,
            questions: [
                "What is one truth from \(passage) that challenges you right now?",
                "Is there a command to obey, a promise to claim, or a sin to confess?",
                "How does this passage change the way you see God? Yourself? Others?",
                "What is one specific action you can take this week in response?",
                "Who in your life needs to hear the truth in this passage?"
            ],
            prayerPrompt: nil,
            memoryVerse: nil
        )
    }
    
    private static func generateDay4(passage: String) -> SermonDevotionalDay {
        SermonDevotionalDay(
            id: UUID().uuidString,
            dayNumber: 4,
            title: "Prayer Focus",
            subtitle: "Draw Near to God",
            content: """
            Use \(passage) as the foundation for your prayer time today.
            
            Structure your prayer:
            1. **Adoration** — Praise God for what this passage reveals about His character.
            2. **Confession** — Confess where you have fallen short of what this passage teaches.
            3. **Thanksgiving** — Thank God for specific blessings related to this truth.
            4. **Supplication** — Ask God to help you and others live out this passage.
            
            Consider praying the passage back to God in your own words.
            """,
            passageReference: nil,
            crossReferences: nil,
            questions: nil,
            prayerPrompt: "Father, as I meditate on \(passage), transform my heart. Let the truth of Your Word take root deeply. Show me where I need to grow, and give me the courage to follow where You lead. In Jesus' name, Amen.",
            memoryVerse: nil
        )
    }
    
    private static func generateDay5(passage: String) -> SermonDevotionalDay {
        SermonDevotionalDay(
            id: UUID().uuidString,
            dayNumber: 5,
            title: "Memory Verse & Discussion",
            subtitle: "Carry It Forward",
            content: """
            Choose a key verse from \(passage) to memorize this week. Write it on a card, set it as your phone wallpaper, or use the ChooseGOD memory feature.
            
            Then connect with your group to discuss what you've learned this week.
            """,
            passageReference: nil,
            crossReferences: nil,
            questions: [
                "What was your biggest takeaway from \(passage) this week?",
                "How did God speak to you through the sermon and this follow-up?",
                "What action step are you committing to?",
                "How can the group pray for you as you apply this passage?"
            ],
            prayerPrompt: nil,
            memoryVerse: "Select a key verse from \(passage) to commit to memory this week."
        )
    }
    
    // MARK: - Cross-Reference Lookup
    
    private static func findCrossReferences(for passage: String) -> [String] {
        // Try to match book + chapter from the passage reference
        let normalized = passage.lowercased()
        for (key, refs) in crossReferenceMap {
            if normalized.contains(key.lowercased()) {
                return refs
            }
        }
        // Return generic helpful cross-refs
        return ["2 Timothy 3:16-17", "Hebrews 4:12", "Psalm 119:105"]
    }
}
