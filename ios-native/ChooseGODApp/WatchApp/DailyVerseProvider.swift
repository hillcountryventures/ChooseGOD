import Foundation

/// Provides daily verses from a built-in collection, deterministic by date
struct DailyVerseProvider {
    
    static func verseForToday() -> WatchDailyVerse {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        let index = (dayOfYear - 1) % verses.count
        return verses[index]
    }
    
    // MARK: - Curated Verses (365)
    // Subset shown; full list would cover all 365 days
    
    static let verses: [WatchDailyVerse] = [
        WatchDailyVerse(text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", reference: "John 3:16 KJV", date: ""),
        WatchDailyVerse(text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1 KJV", date: ""),
        WatchDailyVerse(text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13 KJV", date: ""),
        WatchDailyVerse(text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", reference: "Proverbs 3:5 KJV", date: ""),
        WatchDailyVerse(text: "And we know that all things work together for good to them that love God.", reference: "Romans 8:28 KJV", date: ""),
        WatchDailyVerse(text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", reference: "Joshua 1:9 KJV", date: ""),
        WatchDailyVerse(text: "The Lord is my light and my salvation; whom shall I fear?", reference: "Psalm 27:1 KJV", date: ""),
        WatchDailyVerse(text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.", reference: "Isaiah 40:31 KJV", date: ""),
        WatchDailyVerse(text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", reference: "Jeremiah 29:11 KJV", date: ""),
        WatchDailyVerse(text: "The Lord is near to all who call on him, to all who call on him in truth.", reference: "Psalm 145:18 KJV", date: ""),
        WatchDailyVerse(text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", reference: "Matthew 11:28 KJV", date: ""),
        WatchDailyVerse(text: "He hath made every thing beautiful in his time.", reference: "Ecclesiastes 3:11 KJV", date: ""),
        WatchDailyVerse(text: "The grass withereth, the flower fadeth: but the word of our God shall stand for ever.", reference: "Isaiah 40:8 KJV", date: ""),
        WatchDailyVerse(text: "Delight thyself also in the Lord; and he shall give thee the desires of thine heart.", reference: "Psalm 37:4 KJV", date: ""),
        WatchDailyVerse(text: "God is our refuge and strength, a very present help in trouble.", reference: "Psalm 46:1 KJV", date: ""),
        WatchDailyVerse(text: "In the beginning God created the heaven and the earth.", reference: "Genesis 1:1 KJV", date: ""),
        WatchDailyVerse(text: "Jesus said unto him, I am the way, the truth, and the life.", reference: "John 14:6 KJV", date: ""),
        WatchDailyVerse(text: "Create in me a clean heart, O God; and renew a right spirit within me.", reference: "Psalm 51:10 KJV", date: ""),
        WatchDailyVerse(text: "The Lord bless thee, and keep thee.", reference: "Numbers 6:24 KJV", date: ""),
        WatchDailyVerse(text: "This is the day which the Lord hath made; we will rejoice and be glad in it.", reference: "Psalm 118:24 KJV", date: ""),
        WatchDailyVerse(text: "Be still, and know that I am God.", reference: "Psalm 46:10 KJV", date: ""),
        WatchDailyVerse(text: "The Lord is good, a strong hold in the day of trouble; and he knoweth them that trust in him.", reference: "Nahum 1:7 KJV", date: ""),
        WatchDailyVerse(text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith.", reference: "Galatians 5:22 KJV", date: ""),
        WatchDailyVerse(text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.", reference: "Isaiah 41:10 KJV", date: ""),
        WatchDailyVerse(text: "If God be for us, who can be against us?", reference: "Romans 8:31 KJV", date: ""),
        WatchDailyVerse(text: "Thy word is a lamp unto my feet, and a light unto my path.", reference: "Psalm 119:105 KJV", date: ""),
        WatchDailyVerse(text: "Cast thy burden upon the Lord, and he shall sustain thee.", reference: "Psalm 55:22 KJV", date: ""),
        WatchDailyVerse(text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", reference: "1 Corinthians 13:13 KJV", date: ""),
        WatchDailyVerse(text: "The Lord is my strength and my shield; my heart trusted in him, and I am helped.", reference: "Psalm 28:7 KJV", date: ""),
        WatchDailyVerse(text: "For where two or three are gathered together in my name, there am I in the midst of them.", reference: "Matthew 18:20 KJV", date: ""),
        WatchDailyVerse(text: "Great is the Lord, and greatly to be praised.", reference: "Psalm 48:1 KJV", date: ""),
    ]
}
