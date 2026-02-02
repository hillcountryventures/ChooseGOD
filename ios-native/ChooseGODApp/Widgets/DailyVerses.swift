import Foundation

/// Curated list of daily verses, rotating by day of year
struct DailyVerse {
    let reference: String
    let text: String
    let shortText: String  // For lock screen widget
    let book: String
    let chapter: Int
    let verse: Int
    
    /// Get the verse for today based on day of year
    static var today: DailyVerse {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        let index = (dayOfYear - 1) % allVerses.count
        return allVerses[index]
    }
    
    /// Deep link URL to open the verse in the Bible reader
    var deepLinkURL: URL {
        URL(string: "choosegod://bible/\(book)/\(chapter)/\(verse)")!
    }
    
    // MARK: - Curated Verses (30 entries, rotating by day of year)
    
    static let allVerses: [DailyVerse] = [
        DailyVerse(
            reference: "Jeremiah 29:11",
            text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
            shortText: "I know the plans I have for you…",
            book: "Jeremiah", chapter: 29, verse: 11
        ),
        DailyVerse(
            reference: "Philippians 4:13",
            text: "I can do all things through Christ which strengtheneth me.",
            shortText: "I can do all things through Christ.",
            book: "Philippians", chapter: 4, verse: 13
        ),
        DailyVerse(
            reference: "Psalm 23:1",
            text: "The LORD is my shepherd; I shall not want.",
            shortText: "The LORD is my shepherd.",
            book: "Psalms", chapter: 23, verse: 1
        ),
        DailyVerse(
            reference: "Romans 8:28",
            text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
            shortText: "All things work together for good.",
            book: "Romans", chapter: 8, verse: 28
        ),
        DailyVerse(
            reference: "Proverbs 3:5-6",
            text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
            shortText: "Trust in the LORD with all thine heart.",
            book: "Proverbs", chapter: 3, verse: 5
        ),
        DailyVerse(
            reference: "Isaiah 41:10",
            text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.",
            shortText: "Fear not; for I am with thee.",
            book: "Isaiah", chapter: 41, verse: 10
        ),
        DailyVerse(
            reference: "John 3:16",
            text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
            shortText: "For God so loved the world…",
            book: "John", chapter: 3, verse: 16
        ),
        DailyVerse(
            reference: "Psalm 46:10",
            text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",
            shortText: "Be still, and know that I am God.",
            book: "Psalms", chapter: 46, verse: 10
        ),
        DailyVerse(
            reference: "Matthew 11:28",
            text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
            shortText: "Come unto me… I will give you rest.",
            book: "Matthew", chapter: 11, verse: 28
        ),
        DailyVerse(
            reference: "Joshua 1:9",
            text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
            shortText: "Be strong and of good courage.",
            book: "Joshua", chapter: 1, verse: 9
        ),
        DailyVerse(
            reference: "Psalm 119:105",
            text: "Thy word is a lamp unto my feet, and a light unto my path.",
            shortText: "Thy word is a lamp unto my feet.",
            book: "Psalms", chapter: 119, verse: 105
        ),
        DailyVerse(
            reference: "Romans 12:2",
            text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
            shortText: "Be transformed by renewing your mind.",
            book: "Romans", chapter: 12, verse: 2
        ),
        DailyVerse(
            reference: "2 Timothy 1:7",
            text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
            shortText: "God gave us power, love, and a sound mind.",
            book: "2 Timothy", chapter: 1, verse: 7
        ),
        DailyVerse(
            reference: "Psalm 37:4",
            text: "Delight thyself also in the LORD: and he shall give thee the desires of thine heart.",
            shortText: "Delight in the LORD.",
            book: "Psalms", chapter: 37, verse: 4
        ),
        DailyVerse(
            reference: "Galatians 5:22-23",
            text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.",
            shortText: "The fruit of the Spirit is love, joy, peace…",
            book: "Galatians", chapter: 5, verse: 22
        ),
        DailyVerse(
            reference: "1 Corinthians 13:4",
            text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.",
            shortText: "Love is patient, love is kind.",
            book: "1 Corinthians", chapter: 13, verse: 4
        ),
        DailyVerse(
            reference: "Hebrews 11:1",
            text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
            shortText: "Faith is the substance of things hoped for.",
            book: "Hebrews", chapter: 11, verse: 1
        ),
        DailyVerse(
            reference: "Psalm 34:8",
            text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
            shortText: "Taste and see that the LORD is good.",
            book: "Psalms", chapter: 34, verse: 8
        ),
        DailyVerse(
            reference: "Isaiah 40:31",
            text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary.",
            shortText: "They that wait upon the LORD renew their strength.",
            book: "Isaiah", chapter: 40, verse: 31
        ),
        DailyVerse(
            reference: "Ephesians 2:8-9",
            text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
            shortText: "By grace are ye saved through faith.",
            book: "Ephesians", chapter: 2, verse: 8
        ),
        DailyVerse(
            reference: "Psalm 91:1-2",
            text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress.",
            shortText: "He is my refuge and my fortress.",
            book: "Psalms", chapter: 91, verse: 1
        ),
        DailyVerse(
            reference: "Matthew 6:33",
            text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
            shortText: "Seek first the kingdom of God.",
            book: "Matthew", chapter: 6, verse: 33
        ),
        DailyVerse(
            reference: "1 Peter 5:7",
            text: "Casting all your care upon him; for he careth for you.",
            shortText: "Cast your cares upon Him.",
            book: "1 Peter", chapter: 5, verse: 7
        ),
        DailyVerse(
            reference: "Colossians 3:23",
            text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men.",
            shortText: "Do it heartily, as to the Lord.",
            book: "Colossians", chapter: 3, verse: 23
        ),
        DailyVerse(
            reference: "Psalm 27:1",
            text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
            shortText: "The LORD is my light and salvation.",
            book: "Psalms", chapter: 27, verse: 1
        ),
        DailyVerse(
            reference: "James 1:5",
            text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
            shortText: "Ask God for wisdom — He gives liberally.",
            book: "James", chapter: 1, verse: 5
        ),
        DailyVerse(
            reference: "Lamentations 3:22-23",
            text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
            shortText: "His mercies are new every morning.",
            book: "Lamentations", chapter: 3, verse: 22
        ),
        DailyVerse(
            reference: "Deuteronomy 31:6",
            text: "Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.",
            shortText: "He will not fail nor forsake thee.",
            book: "Deuteronomy", chapter: 31, verse: 6
        ),
        DailyVerse(
            reference: "Psalm 139:14",
            text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.",
            shortText: "Fearfully and wonderfully made.",
            book: "Psalms", chapter: 139, verse: 14
        ),
        DailyVerse(
            reference: "John 14:6",
            text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
            shortText: "I am the way, the truth, and the life.",
            book: "John", chapter: 14, verse: 6
        ),
    ]
}
