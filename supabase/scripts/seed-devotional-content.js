/**
 * Seed script for devotional series with REAL content
 * Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/scripts/seed-devotional-content.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// WALKING IN LOVE - 7 Day Series
// =====================================================
const WALKING_IN_LOVE = {
  series: {
    slug: 'walking-in-love',
    title: 'Walking in Love',
    description: 'A 7-day journey to understand and practice the love of Christ in your daily life. Discover how God\'s love transforms relationships and empowers you to love others unconditionally.',
    total_days: 7,
    topics: ['love', 'relationships', 'compassion', 'grace', 'kindness'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'The Source of All Love',
      scripture_refs: [
        { book: '1 John', chapter: 4, verseStart: 7, verseEnd: 12 }
      ],
      content: `Love is not merely an emotion we conjure up or a decision we make in our own strength. True love—the kind that transforms lives and heals wounds—flows from one source alone: God Himself.

The apostle John makes a profound declaration: "God is love." This isn't just saying that God loves or that God is loving. It's an identification of His very nature. Love is who He is, not just what He does.

When we were still sinners, far from God and undeserving of His attention, He sent His only Son. This is the ultimate demonstration of love—not that we loved God, but that He loved us first. Before you ever thought of Him, before you knew His name, before you took your first breath—He loved you.

This love isn't based on your performance, your worthiness, or your potential. It's based solely on His character. And here's the beautiful truth: because God lives in you through His Spirit, His love can flow through you to others. You become a channel, not the source.

Today, rest in this reality. You don't have to manufacture love. You simply need to remain connected to the One who is love, and let His love overflow through you.`,
      reflection_questions: [
        'How does knowing that God loved you first change how you view yourself?',
        'In what relationships do you struggle to love? How might remembering that God is the source help?',
        'What would it look like today to be a channel of God\'s love rather than trying to produce love on your own?'
      ],
      prayer_focus: 'Father, thank You for loving me before I could ever love You back. Help me today to stop striving to love in my own strength and instead remain connected to You—the source of all love. Let Your love flow through me to everyone I encounter. Amen.'
    },
    {
      day_number: 2,
      title: 'Love That Transforms',
      scripture_refs: [
        { book: 'Romans', chapter: 5, verseStart: 6, verseEnd: 8 }
      ],
      content: `There's a kind of love the world offers—conditional, performance-based, and easily withdrawn. Then there's God's love—scandalous in its extravagance, pursuing us at our absolute worst.

Paul paints a striking picture: "While we were still sinners, Christ died for us." Not after we cleaned ourselves up. Not once we proved we were worth it. Not when we finally got our act together. While we were actively rebelling, hopelessly lost, completely undeserving—that's when love came.

This kind of love doesn't make sense to our human minds. We're wired to give love as a reward and withhold it as punishment. But God flips the script entirely. His love isn't a response to our goodness; it's the very thing that creates goodness in us.

When you truly grasp this—that you were loved at your most unlovable—it changes everything. Shame loses its grip because you realize love isn't something you earn. Fear of rejection fades because His love isn't based on your performance. And slowly, miraculously, you find yourself able to extend that same unmerited grace to others.

The love that found you in your mess is the same love that transforms you from the inside out. Not because you deserve it, but because He is love.`,
      reflection_questions: [
        'Think back to a time when you felt most unworthy of love. How does Romans 5:8 speak to that moment?',
        'Are there people in your life you\'ve withheld love from because they didn\'t deserve it? How does God\'s example challenge this?',
        'How is God\'s transforming love currently at work in your life?'
      ],
      prayer_focus: 'Lord Jesus, thank You for not waiting until I was worthy. Thank You for loving me at my worst and continuing to transform me through that love. Help me see others through Your eyes—not as they are, but as Your love can make them. Amen.'
    },
    {
      day_number: 3,
      title: 'Love in Action',
      scripture_refs: [
        { book: '1 John', chapter: 3, verseStart: 16, verseEnd: 18 }
      ],
      content: `Words are easy. "I love you" can roll off the tongue without any cost or commitment. But true love—the love modeled by Jesus—requires action, sacrifice, and sometimes, laying down our very lives.

John doesn't mince words: if you have the ability to help someone in need and don't, can you really claim God's love lives in you? This isn't about guilt—it's about the natural overflow of a heart transformed by grace.

Jesus showed us what love looks like in action. He touched the untouchable. He ate with the rejected. He stopped for the one when crowds demanded His attention. He washed dusty feet and embraced the betrayer. And ultimately, He laid down His life—not in words, but in bloody, agonizing, world-changing action.

Love with actions and in truth. This is our calling. It might look like giving your time when you'd rather rest. Listening when you'd rather talk. Forgiving when you'd rather hold a grudge. Serving when you'd rather be served. Giving sacrificially when you'd rather keep what's yours.

Today, look for one concrete way to turn your love into action. Not to earn God's approval—you already have that—but as a response to the love that has been lavished on you.`,
      reflection_questions: [
        'Think of someone who has shown you love through action. What did they do and how did it impact you?',
        'Is there someone in your life right now who needs your love to take a tangible form?',
        'What\'s one specific action you can take today to move your love from words to deeds?'
      ],
      prayer_focus: 'Father, forgive me for the times my love has been all talk and no action. Open my eyes today to see the needs around me. Give me the courage and generosity to love with my hands, my time, and my resources—not just my words. Amen.'
    },
    {
      day_number: 4,
      title: 'Patient and Kind Love',
      scripture_refs: [
        { book: '1 Corinthians', chapter: 13, verseStart: 4, verseEnd: 7 }
      ],
      content: `When Paul describes love, he doesn't start with feelings or attraction. He starts with action and character: love is patient, love is kind. These aren't passive traits that just happen—they're active choices made moment by moment.

Patience isn't gritting your teeth while waiting for someone to change. It's choosing to extend grace repeatedly, trusting God's timing over your frustration. It's remembering how patient God has been with you—and letting that memory soften your response to others.

Kindness isn't niceness when it's convenient. It's actively looking for ways to bless others, especially when they don't deserve it. It's choosing soft words when harsh ones want to escape. It's giving someone the benefit of the doubt when suspicion comes easier.

Notice what love is NOT: envious, boastful, proud, rude, self-seeking, easily angered. Love keeps no record of wrongs—it doesn't maintain a mental ledger of past hurts to pull out in future arguments.

Read this passage again, but this time, put your own name where "love" appears. Ouch, right? Now read it one more time and put "Jesus" where "love" appears. Perfect fit. This is the love we're called to, and through His Spirit in us, it's the love we can actually live.`,
      reflection_questions: [
        'Which aspect of love from this passage do you find most challenging: patience, kindness, not keeping records of wrongs, or something else?',
        'How does substituting your name in this passage reveal areas where you need God\'s help?',
        'Think of a current relationship. How might practicing just one of these love attributes transform it?'
      ],
      prayer_focus: 'Holy Spirit, I cannot manufacture this kind of love on my own. Produce in me the patience I lack, the kindness that doesn\'t come naturally, and the humility to stop keeping score. May Christ\'s love in me be evident to everyone I encounter. Amen.'
    },
    {
      day_number: 5,
      title: 'Loving the Unlovable',
      scripture_refs: [
        { book: 'Luke', chapter: 6, verseStart: 27, verseEnd: 36 }
      ],
      content: `"Love your enemies." Three words that turn everything upside down. This is perhaps the most radical command Jesus ever gave—and the one that most clearly distinguishes His followers from the rest of the world.

Anyone can love those who love them back. There's no credit in that, Jesus says. Even people who don't know God do that much. The supernatural, world-changing love of Christ goes further—it extends to those who hate you, curse you, mistreat you.

This doesn't mean pretending that hurt didn't happen or that wrong behavior is acceptable. It means choosing to respond to hatred with love, to curses with blessing, to harm with prayer for the one who harmed you.

Why? Because that's exactly what God did for you. "While we were enemies, we were reconciled to God through the death of his Son" (Romans 5:10). You were once God's enemy, and He loved you anyway. He pursued you, died for you, and welcomed you home.

Loving your enemies isn't natural—it's supernatural. It requires the Spirit's power and the humility to remember you were once an enemy too. This kind of love doesn't come from willpower; it comes from transformation. And it's the kind of love that can actually change the world.`,
      reflection_questions: [
        'Is there someone in your life you would consider an "enemy" or someone who has deeply hurt you? What would it look like to pray blessing over them?',
        'How does remembering that you were once God\'s enemy change your perspective on loving difficult people?',
        'What\'s the difference between loving an enemy and condoning their behavior?'
      ],
      prayer_focus: 'Lord, this is hard. There are people I don\'t want to love, people who have hurt me deeply. But You loved me when I was Your enemy. Help me extend that same mercy. Soften my heart toward [name]. Help me see them through Your eyes. Amen.'
    },
    {
      day_number: 6,
      title: 'Love That Forgives',
      scripture_refs: [
        { book: 'Ephesians', chapter: 4, verseStart: 31, verseEnd: 32 },
        { book: 'Colossians', chapter: 3, verseStart: 12, verseEnd: 14 }
      ],
      content: `Unforgiveness is like drinking poison and hoping the other person gets sick. It binds us to the past, chains us to the offense, and slowly corrodes our souls. But forgiveness—true, Christ-like forgiveness—sets us free.

Paul's instruction is clear: "Forgive as the Lord forgave you." This isn't a suggestion; it's the natural response of someone who truly understands how much they've been forgiven. If God could forgive the cosmic offense of your sin—a debt you could never repay—how can you withhold forgiveness from others?

This doesn't mean forgetting or excusing or putting yourself in harm's way again. Forgiveness isn't a feeling; it's a decision to release someone from the debt they owe you. It's choosing not to replay the hurt, not to demand payment, not to let bitterness take root.

The passage from Colossians paints a beautiful picture: clothe yourself with compassion, kindness, humility, gentleness, patience. Bear with each other. Forgive grievances. And over all these virtues, put on love—it's the thing that binds everything together in perfect unity.

Is there unforgiveness in your heart today? Not forgiving might feel like protecting yourself, but it's actually imprisoning yourself. Forgiveness is the key that sets you free.`,
      reflection_questions: [
        'Is there anyone you\'re currently holding unforgiveness toward? What happened and why has forgiveness been difficult?',
        'How does reflecting on God\'s forgiveness of you help you extend forgiveness to others?',
        'What practical step can you take today toward forgiveness—even if you don\'t feel ready?'
      ],
      prayer_focus: 'Father, I confess that unforgiveness has taken root in my heart. I\'ve been holding onto hurts that You\'ve called me to release. I choose today to forgive [name], not because they deserve it, but because You forgave me. Free me from this burden. Amen.'
    },
    {
      day_number: 7,
      title: 'Abiding in Love',
      scripture_refs: [
        { book: 'John', chapter: 15, verseStart: 9, verseEnd: 17 }
      ],
      content: `As we conclude this journey through love, Jesus gives us the key to living it out: abiding. "Remain in my love," He says. This isn't about trying harder or loving better through sheer willpower. It's about staying connected to the source.

A branch can only bear fruit when it stays attached to the vine. Cut it off, and it withers, no matter how hard it "tries" to produce grapes. Your ability to love—truly, supernaturally love—depends entirely on your connection to Christ.

Jesus is clear about what this abiding looks like: obedience. "If you keep my commands, you will remain in my love." This isn't earning His love; it's staying in the flow of it. Sin disconnects us. Disobedience creates distance. But when we walk in obedience, we position ourselves in the path of His love, and it overflows through us.

And what's the result? Complete joy. Love and joy are inseparable. When you abide in His love and let it flow through you to others, the result is a deep, unshakeable joy that circumstances can't touch.

Jesus calls us friends. He's shared everything with us. And His command? Love each other as He has loved us. Greater love has no one than this: to lay down one's life for one's friends. You've been loved like that. Now go and love likewise.`,
      reflection_questions: [
        'What does "abiding" or "remaining" in Christ\'s love practically look like in your daily life?',
        'How has your understanding of love grown or changed over the past seven days?',
        'What\'s one commitment you want to make going forward about how you\'ll walk in love?'
      ],
      prayer_focus: 'Jesus, thank You for calling me friend. Thank You for laying down Your life so I could experience Your love. As I go from this week, help me stay connected to You. Let Your love flow through me naturally—not as something I strive to produce, but as the fruit of abiding in You. May my life be marked by love. Amen.'
    }
  ]
};

// =====================================================
// OVERCOMING ANXIETY - 7 Day Series (Condensed version)
// =====================================================
const OVERCOMING_ANXIETY_CONDENSED = {
  series: {
    slug: 'overcoming-anxiety',
    title: 'Overcoming Anxiety & Finding Peace',
    description: 'A 7-day journey to discover God\'s peace in uncertain times. Learn to cast your anxieties on Him and find rest for your soul.',
    total_days: 7,
    topics: ['anxiety', 'peace', 'trust', 'worry', 'rest'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'The Invitation to Peace',
      scripture_refs: [
        { book: 'Matthew', chapter: 11, verseStart: 28, verseEnd: 30 }
      ],
      content: `"Come to me, all you who are weary and burdened, and I will give you rest."

These are some of the most tender words Jesus ever spoke. He sees you—exhausted from worry, heavy with anxiety, running on empty. And His invitation isn't to try harder or figure it out on your own. It's simply: come.

Anxiety tells us we need to control everything. It whispers that if we just think about the problem enough, we'll solve it. It keeps us up at night, replaying scenarios, planning for every possible disaster. And it leaves us utterly exhausted.

Jesus offers a different way. He doesn't promise to remove every problem or make life easy. But He promises rest for our souls. His yoke is easy and His burden is light—not because following Him requires nothing, but because He carries the weight with us.

Today, you don't need to figure everything out. You don't need to have all the answers. You just need to come. Bring your anxiety to Jesus. Lay it at His feet. And let Him give you the rest your soul desperately needs.`,
      reflection_questions: [
        'What burdens are you carrying right now that Jesus is inviting you to lay down?',
        'What does "rest for your soul" look like to you? What would change if you truly experienced it?',
        'What\'s one step you can take today to "come" to Jesus with your anxiety?'
      ],
      prayer_focus: 'Lord Jesus, I\'m tired. Anxiety has stolen my peace and robbed me of rest. Today I respond to Your invitation. I come to You with all my worries, fears, and burdens. Teach me what it means to find rest in You. Amen.'
    },
    {
      day_number: 2,
      title: 'Trading Worry for Prayer',
      scripture_refs: [
        { book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 }
      ],
      content: `"Do not be anxious about anything." Paul's instruction seems impossible, doesn't it? How can we simply stop being anxious?

But notice—Paul doesn't just tell us what NOT to do. He tells us what TO do instead. "But in every situation, by prayer and petition, with thanksgiving, present your requests to God."

This is the divine exchange: we trade our worry for prayer. Instead of rehearsing our fears, we redirect them to the One who can actually do something about them. This isn't positive thinking or denial—it's actively bringing our concerns to a God who hears, who cares, and who acts.

And here's the remarkable promise: when we do this, "the peace of God, which transcends all understanding, will guard your hearts and your minds." This peace doesn't make sense. Your circumstances might still be the same. The problems might still be there. But something shifts in your soul. A peace that can't be explained stands guard over your heart.

The word "guard" is a military term—like a soldier protecting a city. When you bring your anxiety to God in prayer, His peace becomes your protection against fear, worry, and despair.

Today, every time anxiety rises, turn it into a prayer. Don't suppress it or ignore it. Redirect it.`,
      reflection_questions: [
        'What specific anxieties can you turn into prayers right now?',
        'Have you experienced God\'s peace in the midst of difficult circumstances? What was that like?',
        'How might adding thanksgiving to your prayers change your perspective on your worries?'
      ],
      prayer_focus: 'Father, I confess that I\'ve been carrying anxieties that belong in Your hands. Right now I bring them to You: [name your specific worries]. I thank You that You hear me and that You care. Guard my heart and mind with Your unexplainable peace. Amen.'
    },
    {
      day_number: 3,
      title: 'Casting Your Cares',
      scripture_refs: [
        { book: '1 Peter', chapter: 5, verseStart: 6, verseEnd: 7 }
      ],
      content: `"Cast all your anxiety on him because he cares for you."

The word "cast" here is dramatic—it's the same word used when disciples threw their garments on a donkey for Jesus to ride. It means to throw forcefully, to fling, to release completely. This isn't a gentle setting down of our worries; it's a decisive throwing off of them.

Why can we do this? Because He cares for us. This isn't blind faith or wishful thinking. We cast our anxiety on God because He genuinely, deeply, personally cares about what happens to us. Your worries matter to Him. Your fears are not too small or too silly for His attention.

Notice the context: "Humble yourselves under God's mighty hand." There's a connection between humility and releasing anxiety. Anxiety often comes from trying to be God—trying to control outcomes, fix people, manage the future. Humility says, "God, You're in control. I'm not."

Today, take a moment to actually visualize casting your cares on God. Picture yourself picking up each anxiety—the health concern, the financial worry, the relationship stress—and throwing it at the feet of Jesus. He can carry what you cannot.`,
      reflection_questions: [
        'What anxieties have you been trying to carry yourself instead of casting on God?',
        'How does knowing that God genuinely cares for you change how you approach your worries?',
        'Is there a connection between your anxiety and trying to control things outside your control?'
      ],
      prayer_focus: 'Mighty God, I humble myself before You. I\'ve been trying to carry burdens that were never mine to carry. Today I cast them on You—every fear, every worry, every anxiety. I trust that You care for me and that Your hands are big enough to hold it all. Amen.'
    },
    {
      day_number: 4,
      title: 'The Antidote to Fear',
      scripture_refs: [
        { book: 'Isaiah', chapter: 41, verseStart: 10, verseEnd: 13 }
      ],
      content: `"Fear not, for I am with you; be not dismayed, for I am your God."

Throughout Scripture, God's most frequent command is "fear not." He knows our tendency toward fear and anxiety, and again and again, He addresses it directly. But notice that His antidote to fear isn't a technique or a strategy—it's His presence.

"I am with you. I am your God. I will strengthen you. I will help you. I will uphold you."

Five "I will" statements. God isn't asking you to overcome fear on your own. He's promising to be actively involved. He strengthens when you're weak. He helps when you're overwhelmed. He upholds you when you feel like you're falling.

The passage continues: "I am the LORD your God who takes hold of your right hand and says to you, Do not fear; I will help you."

Picture this: a loving Father taking the hand of His anxious child. Not dragging them, not leaving them behind, but walking with them, holding their hand, speaking comfort: "Don't be afraid. I've got you."

Whatever you're facing today, you're not facing it alone. The Creator of the universe is holding your hand.`,
      reflection_questions: [
        'In what situation do you most need to hear "Fear not, I am with you" right now?',
        'Which of God\'s "I will" statements speaks most directly to your current struggle?',
        'How does picturing God holding your hand change how you feel about what you\'re facing?'
      ],
      prayer_focus: 'Lord, I hear You saying "fear not" to my anxious heart today. Thank You that the antidote to my fear is Your presence. Strengthen me, help me, uphold me. Take my hand and walk with me through this. I choose to trust that You are with me. Amen.'
    },
    {
      day_number: 5,
      title: 'Guarding Your Mind',
      scripture_refs: [
        { book: 'Philippians', chapter: 4, verseStart: 8, verseEnd: 9 }
      ],
      content: `"Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things."

Anxiety often begins with what we allow our minds to dwell on. The more we rehearse worst-case scenarios, the more anxious we become. The more we scroll through negative news, the more our peace erodes. Our thought life matters.

Paul gives us a powerful strategy: intentionally direct your thoughts toward what is good. This isn't denial or pretending problems don't exist. It's choosing to focus on truth rather than fears, on God's promises rather than potential disasters.

Is what you're worried about actually true, or is it a fearful "what if"? Is it noble and right, or is it distorted by anxiety? Is it lovely and excellent, or is it stealing your peace?

This requires discipline. Your mind naturally gravitates toward worry. But you can train it to redirect. When anxious thoughts intrude, don't just try to stop thinking them—replace them with something better. Meditate on Scripture. Count blessings. Remember God's faithfulness.

The promise follows: "And the God of peace will be with you." When we align our thoughts with God's truth, His peace becomes our companion.`,
      reflection_questions: [
        'What thoughts have you been dwelling on that don\'t fit the categories Paul lists?',
        'What specific truths from Scripture could you use to replace anxious thoughts?',
        'How might limiting certain inputs (news, social media, etc.) help guard your mind?'
      ],
      prayer_focus: 'Father, I confess that I\'ve let my mind wander to places that steal my peace. Help me take every thought captive. When anxiety comes, give me Your truth to replace it. Train my mind to dwell on what is true, noble, right, and lovely. Be the guard of my thoughts. Amen.'
    },
    {
      day_number: 6,
      title: 'One Day at a Time',
      scripture_refs: [
        { book: 'Matthew', chapter: 6, verseStart: 25, verseEnd: 34 }
      ],
      content: `"Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own."

Jesus knew that most of our anxiety isn't about today—it's about tomorrow. What if I lose my job? What if they get sick? What if things don't work out? We borrow trouble from the future and carry it in the present.

But Jesus points to the birds of the air and the flowers of the field. They don't worry about tomorrow. They don't stockpile or stress. Yet God takes care of them. And you, Jesus says, are worth far more than birds or flowers.

This doesn't mean we don't plan or prepare. It means we don't let tomorrow's potential problems steal today's peace. Today has enough to deal with on its own.

"Seek first his kingdom and his righteousness, and all these things will be given to you as well." When our primary focus is on God's kingdom, everything else falls into proper perspective. We stop trying to control the future because we trust the One who holds it.

Today, just focus on today. What does God want from you in this moment? What is He asking you to trust Him with right now? Let tomorrow wait until it arrives.`,
      reflection_questions: [
        'How much of your current anxiety is about things that haven\'t happened yet?',
        'What would change if you truly believed God would provide for your tomorrows?',
        'What does it look like practically to "seek first His kingdom" in your current situation?'
      ],
      prayer_focus: 'Jesus, I confess I\'ve been borrowing trouble from tomorrow. I\'ve been worrying about things that haven\'t happened yet. Help me trust You with my future and focus on what You have for me today. Your grace is sufficient for today. I will trust You for tomorrow when it comes. Amen.'
    },
    {
      day_number: 7,
      title: 'Peace That Passes Understanding',
      scripture_refs: [
        { book: 'John', chapter: 14, verseStart: 27, verseEnd: 27 },
        { book: 'Colossians', chapter: 3, verseStart: 15, verseEnd: 17 }
      ],
      content: `"Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid."

As we conclude this journey, Jesus offers His parting gift: peace. Not just any peace—His peace. This is the peace He possessed when sleeping in a storm-tossed boat, when facing hostile crowds, when walking toward the cross. It's a peace not based on circumstances but on relationship with the Father.

The world offers temporary peace through control, comfort, or escape. But Jesus' peace is different. It remains when circumstances are chaotic. It sustains when answers don't come. It guards when fears are real.

"Let the peace of Christ rule in your hearts," Paul writes. That word "rule" means to act as an umpire—to make the call. When anxiety and peace battle for control, let Christ's peace make the final decision.

This peace isn't just for you—it's through you. As you receive God's peace, you become a conduit of peace to others. Anxious people spread anxiety. Peaceful people spread peace. Let whatever you do, in word or deed, flow from a heart at rest in Christ.

The journey doesn't end here. Anxiety may return. But now you have tools: prayer, casting cares, guarding your mind, trusting for today, and receiving Christ's peace. Return to these truths whenever you need them.`,
      reflection_questions: [
        'How has your understanding of anxiety and peace changed over these seven days?',
        'Which day\'s teaching or practice has been most helpful for you?',
        'What will you do differently going forward when anxiety arises?'
      ],
      prayer_focus: 'Lord Jesus, thank You for Your peace—peace that doesn\'t make sense, peace that guards my heart, peace that remains when life is hard. Let Your peace rule in my heart today and every day. Help me share this peace with others. I receive Your gift. My heart will not be troubled. I will not be afraid. Amen.'
    }
  ]
};

// =====================================================
// CULTIVATING GRATITUDE - 7 Day Series
// =====================================================
const CULTIVATING_GRATITUDE = {
  series: {
    slug: 'cultivating-gratitude',
    title: 'Cultivating Daily Gratitude',
    description: 'Transform your perspective in just 7 days. Discover the life-changing power of thanksgiving and learn to find joy in all circumstances.',
    total_days: 7,
    topics: ['gratitude', 'thanksgiving', 'joy', 'contentment', 'praise'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'The Command to Give Thanks',
      scripture_refs: [
        { book: '1 Thessalonians', chapter: 5, verseStart: 16, verseEnd: 18 }
      ],
      content: `"Give thanks in all circumstances; for this is God's will for you in Christ Jesus."

Notice Paul doesn't say give thanks FOR all circumstances—he says give thanks IN all circumstances. There's a crucial difference. We're not asked to be thankful for tragedy, loss, or pain. But we are called to find reasons for gratitude even in the midst of difficult seasons.

This is God's will for you. How often do we wonder what God wants? Here's part of the answer: thanksgiving. Constant, consistent, circumstance-defying gratitude.

Gratitude is a discipline, not just a feeling. Some days it flows naturally; other days it's a choice we make against the current of our emotions. But here's what happens when we practice it: our perspective shifts. Problems that seemed overwhelming appear smaller when framed by blessings. Joy sneaks in even when happiness seems impossible.

Today, start small. Don't try to be thankful for everything—just look for three things, even tiny things, that you can genuinely thank God for. Your morning coffee. A kind word. The breath in your lungs. Gratitude grows when we exercise it.`,
      reflection_questions: [
        'What circumstances make gratitude most difficult for you?',
        'What are three things—big or small—you can thank God for right now?',
        'How might practicing gratitude "in all circumstances" change your daily experience?'
      ],
      prayer_focus: 'Father, I confess that gratitude doesn\'t always come naturally. There are circumstances that make thanksgiving feel impossible. But I choose today to thank You—for breath, for grace, for Your presence. Teach me to cultivate gratitude as a daily practice. Amen.'
    },
    {
      day_number: 2,
      title: 'Remembering God\'s Faithfulness',
      scripture_refs: [
        { book: 'Psalm', chapter: 103, verseStart: 1, verseEnd: 5 }
      ],
      content: `"Praise the LORD, my soul, and forget not all his benefits."

Memory is a powerful thing. We tend to remember hurts and forget blessings, recall failures and overlook victories. David addresses this by commanding his soul: remember! Don't forget what God has done!

He then lists some of God's benefits: He forgives all your sins. He heals all your diseases. He redeems your life from the pit. He crowns you with love and compassion. He satisfies your desires with good things.

Take a moment to remember. When has God forgiven you? When has He brought healing—physical, emotional, or spiritual? When has He pulled you out of a pit you thought you'd never escape? When has His love covered your shame? When has He given you good things you didn't deserve?

Gratitude grows from memory. The Israelites built monuments to remember God's faithfulness. We can do the same—maybe through journaling, or by keeping a list of answered prayers, or simply by taking time regularly to recall God's goodness.

Today, spend time remembering. Let those memories fuel your gratitude.`,
      reflection_questions: [
        'What is one clear example of God\'s faithfulness in your past?',
        'How might regularly remembering God\'s past goodness affect your current worries?',
        'What\'s one way you could create a "monument" to help you remember what God has done?'
      ],
      prayer_focus: 'Lord, I don\'t want to forget. Today I remember [specific examples of God\'s faithfulness]. Thank You for forgiving me, for healing wounds I thought would never mend, for rescuing me from pits I dug myself into. You have been faithful. You will continue to be faithful. Praise Your name. Amen.'
    },
    {
      day_number: 3,
      title: 'Gratitude in Suffering',
      scripture_refs: [
        { book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 }
      ],
      content: `"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."

This might be the most counterintuitive verse in all of Scripture. Joy in trials? Gratitude in suffering? It sounds crazy—until you understand the bigger picture.

James isn't asking us to pretend suffering is pleasant or to deny the reality of pain. He's inviting us to look beyond the immediate to the eternal. What is this trial producing in you? Perseverance. Character. Mature faith. These are treasures that can only be forged in fire.

This perspective doesn't minimize the pain—it gives it meaning. Your struggle isn't wasted. Your suffering serves a purpose. The very thing that feels like destruction is actually construction. God is building something in you through what you're walking through.

Can you thank God not for the trial itself, but for what He's producing through it? Can you trust that the Refiner's fire is making you more like gold? This is advanced gratitude, and it doesn't come overnight. But as you practice it, you'll find that suffering loses some of its power to steal your joy.`,
      reflection_questions: [
        'Can you identify ways that past trials have produced growth in your life?',
        'What current difficulty might God be using to develop perseverance or character in you?',
        'What\'s the difference between being thankful FOR suffering and being thankful IN suffering?'
      ],
      prayer_focus: 'Father, this is hard. I don\'t naturally give thanks when I\'m hurting. But I trust You\'re working. I thank You not for the pain, but for what You\'re producing through it. Make me more like Jesus. Let nothing be wasted. Give me eyes to see purpose in my trials. Amen.'
    },
    {
      day_number: 4,
      title: 'Thanksgiving and Contentment',
      scripture_refs: [
        { book: 'Philippians', chapter: 4, verseStart: 11, verseEnd: 13 }
      ],
      content: `"I have learned the secret of being content in any and every situation, whether well fed or hungry, whether living in plenty or in want."

Paul wrote these words from prison. Not from a comfortable house or a successful ministry tour—from a Roman jail cell. And yet he speaks of contentment as a "secret" he has discovered.

Contentment and gratitude are deeply connected. When we focus on what we lack, contentment is impossible. When we cultivate thankfulness for what we have, contentment grows naturally.

Notice Paul says he "learned" this. Contentment isn't a personality trait some lucky people are born with. It's a skill that develops through practice. And the practice is gratitude—choosing to focus on blessings rather than deficits, on what's present rather than what's absent.

The secret Paul discovered? "I can do all things through Christ who strengthens me." Contentment isn't about circumstances being perfect; it's about finding your strength and satisfaction in Christ regardless of circumstances.

What's the gap between your expectations and your reality today? Gratitude can bridge that gap and lead you to contentment.`,
      reflection_questions: [
        'Where are you most discontent right now? What expectations are driving that?',
        'How might intentional gratitude for what you have change your perspective?',
        'What does it practically look like to find your satisfaction in Christ rather than circumstances?'
      ],
      prayer_focus: 'Lord, I confess that I\'ve been focused on what I don\'t have instead of what I do. I\'ve let unmet expectations steal my contentment. Today I thank You for [list specific blessings]. Teach me the secret of contentment. Be my strength and satisfaction. Amen.'
    },
    {
      day_number: 5,
      title: 'A Sacrifice of Praise',
      scripture_refs: [
        { book: 'Hebrews', chapter: 13, verseStart: 15, verseEnd: 16 }
      ],
      content: `"Through Jesus, therefore, let us continually offer to God a sacrifice of praise—the fruit of lips that openly profess his name."

Why is praise called a "sacrifice"? Because sometimes it costs us something. When circumstances are good and feelings align, praise is easy. But when life is hard, when we're hurting, when we don't feel like it—that's when praise becomes a sacrifice.

The sacrifice of praise means choosing to worship when everything in you wants to complain. It means declaring God's goodness when your situation suggests otherwise. It means saying "You are still good" when you can't see how things could possibly work out.

This isn't pretending or denying reality. It's an act of faith—choosing to believe what you know about God over what you feel about your circumstances. And something powerful happens when we make this sacrifice: our hearts begin to align with our words. We start to believe what we're declaring.

David understood this. So many psalms begin with desperation but end with praise. The act of praising shifted something in his soul.

Today, offer God a sacrifice of praise. Choose gratitude when it's not easy. Speak His goodness even if you don't feel it. Watch what happens in your heart.`,
      reflection_questions: [
        'When has praising God felt like a sacrifice for you?',
        'How might choosing to praise in difficulty actually change how you feel about your situation?',
        'What is one thing about God\'s character you can declare today, regardless of how you feel?'
      ],
      prayer_focus: 'Lord, right now praise feels like a sacrifice. But I choose to offer it. You are good—even when life doesn\'t feel good. You are faithful—even when I can\'t see the way forward. You are worthy—regardless of my circumstances. Receive my sacrifice of praise today. Amen.'
    },
    {
      day_number: 6,
      title: 'Gratitude as a Witness',
      scripture_refs: [
        { book: 'Psalm', chapter: 100, verseStart: 1, verseEnd: 5 }
      ],
      content: `"Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name."

Grateful people stand out. In a world of complaints, criticism, and chronic dissatisfaction, a genuinely thankful person is like a light in darkness. Your gratitude isn't just for you—it's a witness to everyone around you.

When you remain grateful in difficulty, people notice. When you thank God publicly for His blessings, it points others to Him. When contentment marks your life rather than constant striving for more, it raises questions about the source of your peace.

Psalm 100 invites all the earth to worship. It's a call to recognize the Lord's goodness and enter His presence with thanksgiving. But notice the foundation: "The LORD is good and his love endures forever; his faithfulness continues through all generations."

Our gratitude is rooted in who God is. He IS good—not just does good things, but IS good in His very nature. His love IS enduring—not temporary or conditional. His faithfulness DOES continue—it doesn't expire or run out.

When you live in gratitude, you're proclaiming these truths to a watching world.`,
      reflection_questions: [
        'How might your gratitude (or lack thereof) affect how others perceive your faith?',
        'Who in your life models genuine thankfulness? What impact has it had on you?',
        'How can you make your gratitude more visible as a witness to God\'s goodness?'
      ],
      prayer_focus: 'Father, I want my gratitude to point others to You. Help me be a person marked by thankfulness—not because my life is perfect, but because You are good. Let my contentment and joy be a witness that draws others to Your grace. Amen.'
    },
    {
      day_number: 7,
      title: 'A Lifestyle of Thanksgiving',
      scripture_refs: [
        { book: 'Colossians', chapter: 3, verseStart: 15, verseEnd: 17 }
      ],
      content: `"And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him."

As we conclude this journey, Paul paints a picture of what a grateful life looks like. It's not just moments of thanksgiving sprinkled throughout a complaining life. It's a fundamental orientation where gratitude becomes the lens through which you see everything.

"Let the peace of Christ rule in your hearts." When peace rules, anxiety doesn't. "Be thankful." Simple. Direct. Non-negotiable. "Let the message of Christ dwell among you richly." Gratitude grows from knowing God's Word. "Sing psalms, hymns, and songs from the Spirit." Express your gratitude audibly, musically, joyfully.

And then the all-encompassing instruction: whatever you do—in word or deed—do it all in Jesus' name, giving thanks.

Eating breakfast? Give thanks. Commuting to work? Give thanks. Facing a difficult meeting? Give thanks. Enjoying time with family? Give thanks. Struggling with a health issue? Give thanks—not for the struggle, but in it.

This is the grateful life. Not perfection, but practice. Not constant happiness, but consistent thankfulness. Not denial of difficulty, but discovery of blessings within it.

Go forward as a grateful person. Let it mark your life.`,
      reflection_questions: [
        'What practical changes could you make to build gratitude into your daily routine?',
        'How has your perspective shifted over these seven days of focusing on thanksgiving?',
        'What commitment will you make going forward to cultivate ongoing gratitude?'
      ],
      prayer_focus: 'Lord, I want gratitude to be my lifestyle, not just an occasional practice. Help me see every moment as an opportunity for thanksgiving. Let my words and actions flow from a heart of gratitude. Thank You for this journey. May I never go back to taking Your blessings for granted. Amen.'
    }
  ]
};

// =====================================================
// FRUIT OF THE SPIRIT - 14 Day Series
// =====================================================
const FRUIT_OF_THE_SPIRIT = {
  series: {
    slug: 'fruit-of-the-spirit',
    title: 'Fruit of the Spirit',
    description: 'A 14-day journey through the nine fruits of the Spirit. Learn to cultivate love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control in your daily life.',
    total_days: 14,
    topics: ['fruit_spirit', 'character', 'holiness', 'love', 'self_control'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'The Source of the Fruit',
      scripture_refs: [
        { book: 'Galatians', chapter: 5, verseStart: 22, verseEnd: 26 },
        { book: 'John', chapter: 15, verseStart: 4, verseEnd: 5 }
      ],
      content: `Before we explore each fruit individually, we need to understand a crucial truth: this is fruit of the SPIRIT, not fruit of self-effort. You cannot manufacture love, joy, or peace through willpower. They grow naturally when you stay connected to the source.

Jesus said, "Remain in me, as I also remain in you. No branch can bear fruit by itself; it must remain in the vine. Neither can you bear fruit unless you remain in me."

A branch doesn't strain to produce grapes. It simply stays attached to the vine, receives nourishment, and fruit naturally appears. This is the picture of the Spirit-filled life. Your job isn't to try really hard to be loving or patient or kind. Your job is to stay connected to Jesus, and His Spirit produces the fruit through you.

This is liberating! You've probably tried and failed to change yourself through willpower. The fruit of the Spirit offers a different path: abide in Christ, walk by the Spirit, and transformation happens from the inside out.

As we journey through each fruit over the next two weeks, keep returning to this foundation: connection, not striving. Abiding, not achieving.`,
      reflection_questions: [
        'Have you tried to produce spiritual fruit through your own effort? How did that go?',
        'What does "abiding" or "remaining" in Christ practically look like for you?',
        'Which fruit of the Spirit do you feel least naturally inclined toward?'
      ],
      prayer_focus: 'Holy Spirit, I cannot produce this fruit on my own. I\'ve tried. Today I surrender my striving and choose instead to abide. Produce in me what I cannot produce myself. Let me stay so connected to Jesus that His character naturally flows through me. Amen.'
    },
    {
      day_number: 2,
      title: 'Love: The Foundation',
      scripture_refs: [
        { book: '1 Corinthians', chapter: 13, verseStart: 4, verseEnd: 8 },
        { book: '1 John', chapter: 4, verseStart: 7, verseEnd: 8 }
      ],
      content: `Love is listed first because it's foundational—all other fruits flow from it. Without love, Paul says, everything else is meaningless. We could have great faith, give away everything we own, even sacrifice our lives—but without love, it counts for nothing.

But what is love? Our culture has so diluted the word that we need to return to Scripture for definition. Love is patient and kind. Not envious or boastful. Not proud, rude, or self-seeking. Not easily angered. Keeps no record of wrongs. Protects, trusts, hopes, perseveres. Never fails.

Read that list again slowly. This isn't sentiment or attraction—this is action and character. Love is something you DO, not just something you feel.

And here's the source: "God is love." This isn't just saying God loves—it's identifying His very nature. Love flows from God because love IS God. As you abide in Him, His love—this patient, kind, persevering love—begins to characterize your life.

Who in your life needs this kind of love from you? Not warm feelings, but patient, kind, persevering action?`,
      reflection_questions: [
        'Which aspects of love from 1 Corinthians 13 are most challenging for you?',
        'How does understanding that God IS love change how you approach loving others?',
        'Who is God calling you to actively love this week—with patience, kindness, and perseverance?'
      ],
      prayer_focus: 'Father, You are love. Every true expression of love finds its source in You. Fill me so full of Your love that it overflows to everyone around me. Make me patient when I want to be irritable, kind when I want to be harsh, persevering when I want to give up. Let Your love flow through me. Amen.'
    },
    {
      day_number: 3,
      title: 'Joy: Beyond Happiness',
      scripture_refs: [
        { book: 'Nehemiah', chapter: 8, verseStart: 10, verseEnd: 10 },
        { book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 }
      ],
      content: `Joy is not happiness. Happiness depends on happenings—when circumstances are good, we're happy. When they turn bad, happiness disappears. But joy is different. Joy remains stable when life falls apart.

"The joy of the Lord is your strength." This joy comes from the Lord, not from circumstances. It's rooted in who God is and what He's done, not in what's happening around you. You can have joy even in suffering because your deepest reality—being loved by God, forgiven, secure in Christ—hasn't changed.

James says something counterintuitive: "Consider it pure joy when you face trials." Not because trials are pleasant, but because of what they produce. Joy can coexist with difficulty when we see the bigger picture.

This joy isn't a personality trait reserved for naturally optimistic people. It's a fruit of the Spirit, available to anyone who abides in Christ. It's not forced smiling through pain—it's deep assurance that God is working, that nothing is wasted, that the story isn't over.

Where do you need the joy of the Lord to be your strength today?`,
      reflection_questions: [
        'What\'s the difference between joy and happiness in your experience?',
        'Have you ever experienced genuine joy in the midst of difficult circumstances? What was that like?',
        'What circumstances are currently stealing your joy? How might shifting your focus to God change that?'
      ],
      prayer_focus: 'Lord, I want joy that doesn\'t depend on circumstances. Fill me with Your joy—the kind that remains when everything else shakes. Help me see beyond temporary troubles to eternal truths. Let the joy of the Lord be my strength today. Amen.'
    },
    {
      day_number: 4,
      title: 'Peace: Supernatural Calm',
      scripture_refs: [
        { book: 'John', chapter: 14, verseStart: 27, verseEnd: 27 },
        { book: 'Isaiah', chapter: 26, verseStart: 3, verseEnd: 3 }
      ],
      content: `"Peace I leave with you; my peace I give you. I do not give to you as the world gives."

Jesus makes clear: His peace is different from what the world offers. The world says peace comes from removing all threats, solving all problems, controlling all outcomes. But that kind of peace is fragile and impossible to maintain.

Jesus' peace exists in the midst of storms. It's the peace He had while sleeping in a boat tossed by waves. It's the calm He displayed facing hostile crowds. It's the surrender He modeled in Gethsemane. This peace isn't based on circumstances being under control—it's based on trusting the One who controls all circumstances.

Isaiah describes how to access this peace: "You will keep in perfect peace those whose minds are steadfast, because they trust in you." A steadfast mind—fixed on God, anchored in truth—leads to perfect peace. When your thoughts spiral to worst-case scenarios, peace flees. When they remain fixed on God's character and promises, peace remains.

This is Spirit-produced peace. It doesn't make sense when your situation is chaotic. But there it is—calm in the storm, rest in the trouble, stillness in the noise.`,
      reflection_questions: [
        'What currently disturbs your peace? What thoughts or worries steal your calm?',
        'How can you practice keeping your mind "steadfast" on God?',
        'What does Jesus\' peace in the storm teach you about handling your own storms?'
      ],
      prayer_focus: 'Jesus, I receive Your peace today—the peace that doesn\'t make sense, that remains in storms, that guards my heart. When anxiety rises, anchor my thoughts to Your truth. When chaos surrounds me, let Your calm fill me. Keep me in perfect peace. Amen.'
    },
    {
      day_number: 5,
      title: 'Patience: The Long View',
      scripture_refs: [
        { book: 'James', chapter: 5, verseStart: 7, verseEnd: 11 },
        { book: 'Romans', chapter: 12, verseStart: 12, verseEnd: 12 }
      ],
      content: `In Greek, the word for patience means "long-suffering"—the ability to endure for a long time. It's the opposite of the microwave mentality that demands everything instantly.

James points to farmers as an example: they plant, water, and wait. They can't rush the harvest. They must be patient for the autumn and spring rains, for the crop to mature in its time. "You too, be patient."

This patience operates in two directions. There's patience with circumstances—enduring difficulty, waiting for answered prayer, trusting God's timing when it seems slow. And there's patience with people—bearing with their faults, giving them time to grow, not demanding instant change.

Our culture hates waiting. We want fast food, same-day delivery, instant results. But spiritual growth doesn't work that way. Neither do relationships. Neither does God's unfolding plan for your life.

"Be joyful in hope, patient in affliction, faithful in prayer." These three go together. Hope gives you something to wait for. Prayer keeps you connected to God in the waiting. And patience is the grace to endure until hope becomes reality.`,
      reflection_questions: [
        'Where are you most impatient right now—with circumstances or with people?',
        'How does hoping in God\'s promises help you be more patient in the present?',
        'What is one situation where you need to adopt the farmer\'s long-view patience?'
      ],
      prayer_focus: 'Lord, I confess my impatience. I want things fixed now, people changed now, prayers answered now. Teach me to wait like a farmer waits—trusting the process, believing the harvest will come. Give me patience with difficult people and difficult circumstances. Amen.'
    },
    {
      day_number: 6,
      title: 'Kindness: Tender Strength',
      scripture_refs: [
        { book: 'Ephesians', chapter: 4, verseStart: 32, verseEnd: 32 },
        { book: 'Luke', chapter: 6, verseStart: 35, verseEnd: 36 }
      ],
      content: `"Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you."

Kindness isn't weakness—it's strength under control. It's choosing soft words when harsh ones want to come out. It's looking for ways to bless rather than waiting for reasons to criticize. It's giving others the benefit of the doubt.

God Himself is kind, even to the ungrateful and wicked. His kindness is meant to lead us to repentance—not His judgment or His condemnation, but His kindness. When we experience undeserved kindness, our hearts soften.

This is what we're called to extend to others. Not just to people who are kind to us—that's easy. But to the difficult ones, the ungrateful ones, the ones who don't deserve it. "Love your enemies, do good to them, and lend to them without expecting to get anything back."

Small kindnesses matter more than we realize. A word of encouragement. A thoughtful gesture. Remembering someone's struggle. Giving a compliment. These are not trivial—they are Spirit-produced evidences of God's presence in your life.

Today, look for opportunities to be kind—especially to people who might not expect it.`,
      reflection_questions: [
        'Who in your life could use an unexpected act of kindness today?',
        'How has God\'s kindness toward you affected your heart?',
        'Is there someone you\'ve been harsh toward who needs to experience kindness from you?'
      ],
      prayer_focus: 'Father, Your kindness led me to You. Help me extend that same undeserved kindness to others. Open my eyes to opportunities today—a word I can speak, a gesture I can make, a blessing I can give. Make me kind, tenderhearted, forgiving. Amen.'
    },
    {
      day_number: 7,
      title: 'Goodness: Living Generously',
      scripture_refs: [
        { book: 'Galatians', chapter: 6, verseStart: 9, verseEnd: 10 },
        { book: 'Psalm', chapter: 34, verseStart: 8, verseEnd: 8 }
      ],
      content: `Goodness is related to kindness but takes it further. If kindness is the disposition, goodness is the action. It's actively doing good, seeking the welfare of others, living generously in a selfish world.

"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."

Doing good can be exhausting. You serve, and people take advantage. You give, and people expect more. You help, and it goes unnoticed. Weariness sets in. You're tempted to quit, to stop caring, to look out for yourself.

But Paul encourages: don't give up. There's a harvest coming. Your good deeds aren't wasted even when they seem unappreciated. God sees. God rewards. And the fruit is growing even when you can't see it.

"As we have opportunity, let us do good to all people." This isn't selective goodness—just for those who deserve it or those who can reciprocate. It's radical generosity toward everyone, especially fellow believers.

"Taste and see that the Lord is good." When you experience God's goodness, it naturally overflows into doing good for others. You give because you've received. You bless because you've been blessed.`,
      reflection_questions: [
        'Have you grown weary in doing good? What caused that?',
        'How has tasting God\'s goodness motivated you to do good for others?',
        'What opportunity for doing good might God be presenting to you today?'
      ],
      prayer_focus: 'Lord, renew my strength for doing good. When I\'m tempted to give up, remind me of the harvest coming. Help me see opportunities today to bless others—not for recognition, but because Your goodness overflows through me. Amen.'
    },
    {
      day_number: 8,
      title: 'Faithfulness: Reliable Consistency',
      scripture_refs: [
        { book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 },
        { book: 'Matthew', chapter: 25, verseStart: 21, verseEnd: 21 }
      ],
      content: `"Great is your faithfulness." These words come from the book of Lamentations—a book about suffering, loss, and despair. Even in the darkest moment, Jeremiah recognized God's unchanging faithfulness.

Faithfulness means showing up. Day after day, year after year. Not just when it's exciting or convenient, but when it's mundane and difficult. It's the opposite of our fickle culture that chases the newest thing and abandons commitments when they get hard.

In Jesus' parable of the talents, the faithful servant wasn't praised for spectacular achievement. He was praised for being faithful: "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things."

This should encourage you. God isn't looking for impressive. He's looking for faithful. Show up when no one notices. Keep your promises when it costs you. Stay committed when feelings fade. This is the fruit of faithfulness.

Where has God placed you? Your marriage, your job, your church, your friendships—these are the arenas where faithfulness is tested. Not by doing something great, but by consistently doing small things with great love.`,
      reflection_questions: [
        'In what areas of life is it hardest for you to be consistently faithful?',
        'How does God\'s faithfulness to you inspire your faithfulness to others?',
        'What "few things" is God asking you to be faithful with right now?'
      ],
      prayer_focus: 'Father, Your faithfulness is new every morning. Even when I fail, You don\'t. Help me be faithful in the small things—the daily commitments, the unglamorous responsibilities. I want to hear "well done, faithful servant" someday. Amen.'
    },
    {
      day_number: 9,
      title: 'Gentleness: Controlled Power',
      scripture_refs: [
        { book: 'Matthew', chapter: 11, verseStart: 28, verseEnd: 30 },
        { book: '1 Peter', chapter: 3, verseStart: 15, verseEnd: 15 }
      ],
      content: `"I am gentle and humble in heart, and you will find rest for your souls."

Jesus describes Himself as gentle. This is remarkable—the most powerful being in the universe describes Himself with a word that often suggests weakness. But gentleness isn't weakness. It's strength under control.

Think of a powerful horse that has been trained to respond to the gentle touch of its rider. The power is still there, but it's submitted, controlled, directed. That's biblical gentleness—the ability to be forceful but choosing restraint; the capability to assert yourself but choosing to yield.

Peter applies this to how we share our faith: "Always be prepared to give an answer... but do this with gentleness and respect." We can be right without being harsh. We can speak truth without being unkind. We can correct without crushing.

Where do you need gentleness? Perhaps in how you speak to your children when you're frustrated. How you respond when you're proven right. How you treat people who disagree with you. Gentleness doesn't mean you have no power—it means your power is submitted to the Spirit's control.`,
      reflection_questions: [
        'In what situations do you tend to respond with harshness instead of gentleness?',
        'How does Jesus\' gentleness challenge your understanding of strength?',
        'Who in your life needs to experience more gentleness from you?'
      ],
      prayer_focus: 'Jesus, You are gentle and humble. So often I am harsh and proud. Teach me to hold my strength loosely, to speak truth kindly, to correct gently. Let people find rest in my presence like they did in Yours. Amen.'
    },
    {
      day_number: 10,
      title: 'Self-Control: Mastering Yourself',
      scripture_refs: [
        { book: 'Proverbs', chapter: 25, verseStart: 28, verseEnd: 28 },
        { book: '1 Corinthians', chapter: 9, verseStart: 25, verseEnd: 27 }
      ],
      content: `"Like a city whose walls are broken through is a person who lacks self-control."

In ancient times, city walls were the primary defense. Without them, enemies could walk right in. Solomon compares a person without self-control to that defenseless city—vulnerable to every attack, unable to resist any invader.

Self-control is the discipline to say no to desires that would harm you and yes to habits that would help you. It's managing your emotions instead of being managed by them. It's choosing long-term flourishing over short-term pleasure.

Paul uses the image of an athlete in training: "Everyone who competes in the games goes into strict training." Athletes don't indulge every appetite—they discipline their bodies for the goal of winning. We have a far greater prize to pursue.

Here's the freeing truth: self-control is a fruit of the Spirit. You're not meant to manufacture this through sheer willpower. As you abide in Christ, the Spirit produces the self-control you need. You cooperate, but He enables.

Where do you need more self-control? Your words? Your appetites? Your spending? Your screen time? Bring that area to the Spirit and let Him strengthen your walls.`,
      reflection_questions: [
        'Where are the walls broken in your life—what areas lack self-control?',
        'How might viewing self-control as a fruit of the Spirit (rather than pure willpower) change your approach?',
        'What practical steps can you take to cooperate with the Spirit\'s work of self-control?'
      ],
      prayer_focus: 'Holy Spirit, I need self-control that I cannot produce myself. Strengthen my walls. Give me power over the areas where I\'ve been powerless. Help me say no to what harms me and yes to what helps me. I want to be disciplined for Your glory. Amen.'
    },
    {
      day_number: 11,
      title: 'Walking by the Spirit',
      scripture_refs: [
        { book: 'Galatians', chapter: 5, verseStart: 16, verseEnd: 18 },
        { book: 'Romans', chapter: 8, verseStart: 5, verseEnd: 6 }
      ],
      content: `"Walk by the Spirit, and you will not gratify the desires of the flesh."

Notice the order: walk by the Spirit first, and not gratifying the flesh follows. We often flip this—trying to stop bad behaviors through willpower, hoping spiritual growth will eventually come. But Paul says the fruit comes from the walking, not the striving.

What does it mean to walk by the Spirit? It means living with moment-by-moment awareness of His presence. Listening for His promptings. Following His lead rather than your impulses. Depending on His power rather than your own.

"Those who live according to the flesh have their minds set on what the flesh desires; but those who live in accordance with the Spirit have their minds set on what the Spirit desires."

This is about where you direct your attention. When your mind is set on the flesh—constantly thinking about what you want, what feels good, what satisfies your appetites—you'll walk according to the flesh. When your mind is set on the Spirit—thinking about what pleases God, what builds His kingdom, what reflects His character—you'll walk according to the Spirit.

The fruit grows as you walk. Keep walking.`,
      reflection_questions: [
        'What does "walking by the Spirit" look like practically in your daily life?',
        'What do you tend to set your mind on—the desires of the flesh or the desires of the Spirit?',
        'How can you become more aware of the Spirit\'s presence and promptings throughout your day?'
      ],
      prayer_focus: 'Spirit of God, I want to walk with You today. Help me sense Your presence in every moment. Prompt me when I\'m veering off course. Set my mind on the things that please You. I can\'t produce fruit on my own, but as I walk with You, Your fruit grows. Amen.'
    },
    {
      day_number: 12,
      title: 'Against Such Things',
      scripture_refs: [
        { book: 'Galatians', chapter: 5, verseStart: 22, verseEnd: 23 }
      ],
      content: `"Against such things there is no law."

What a profound statement tucked at the end of Paul's fruit list! When you're loving, joyful, peaceful, patient, kind, good, faithful, gentle, and self-controlled—no law can condemn you. You're not just avoiding bad behavior; you're embodying the fulfillment of everything the law was pointing toward.

The Pharisees focused on external compliance with rules. But the Spirit produces internal transformation that exceeds any legal requirement. You don't just avoid murder—you genuinely love your enemies. You don't just avoid adultery—you have a pure heart. You don't just avoid lying—you're faithful in the small things.

This is the Christian life at its best—not straining under a list of don'ts, but overflowing with spiritual fruit. When these qualities characterize your life, you're not under law because you've transcended what law could ever demand or produce.

This doesn't mean anything goes. It means you've moved beyond external compliance to internal transformation. The Spirit has written the law on your heart, and now righteousness flows naturally, like fruit from a healthy tree.`,
      reflection_questions: [
        'How does focusing on cultivating fruit differ from focusing on avoiding sin?',
        'In what ways has the Spirit\'s work moved you beyond external rule-keeping to internal transformation?',
        'What would change if you focused more on growing fruit and less on managing behavior?'
      ],
      prayer_focus: 'Lord, I don\'t want to live under the burden of law-keeping. I want the freedom of Spirit-walking. Transform me from the inside out. Let Your fruit be so abundant in my life that I fulfill the law\'s requirements not through striving but through overflow. Amen.'
    },
    {
      day_number: 13,
      title: 'Pruning for More Fruit',
      scripture_refs: [
        { book: 'John', chapter: 15, verseStart: 1, verseEnd: 8 }
      ],
      content: `"He cuts off every branch in me that bears no fruit, while every branch that does bear fruit he prunes so that it will be even more fruitful."

Pruning is painful. It feels like loss. But the Gardener knows that pruning produces more fruit. Branches that could drain energy are cut away. Healthy branches are trimmed so resources go to the best fruit.

God prunes your life. Sometimes He removes things—relationships, opportunities, activities—that seemed good but were keeping you from your best. Other times He cuts back areas that are growing wild, refocusing you on what matters most.

This pruning often comes through difficulty. The loss, the disappointment, the closed door—these can be the Gardener's shears. He's not punishing you; He's preparing you for greater fruitfulness.

"I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing."

The goal of pruning is more fruit—much fruit. God doesn't prune to diminish you but to increase you. The painful cutting back leads to abundant growth. Trust the Gardener. He knows what He's doing.`,
      reflection_questions: [
        'Can you identify times when God has "pruned" your life? What was removed? What fruit came?',
        'Is there anything currently in your life that might need to be pruned for greater fruitfulness?',
        'How does trusting God as the good Gardener help you accept painful pruning?'
      ],
      prayer_focus: 'Father, You are the Gardener, and You know what I need. Give me grace to accept Your pruning, even when it hurts. I trust that You\'re not diminishing me but preparing me for greater fruitfulness. Cut away what needs to go. I want to bear much fruit. Amen.'
    },
    {
      day_number: 14,
      title: 'Bearing Lasting Fruit',
      scripture_refs: [
        { book: 'John', chapter: 15, verseStart: 16, verseEnd: 17 },
        { book: 'Colossians', chapter: 1, verseStart: 10, verseEnd: 10 }
      ],
      content: `"You did not choose me, but I chose you and appointed you so that you might go and bear fruit—fruit that will last."

As we conclude this journey, Jesus reminds us: this was always the plan. He chose you. He appointed you. And He has a purpose: fruit that lasts beyond your lifetime, beyond this world, into eternity.

The fruit of the Spirit isn't just for your personal development. It's meant to spread. When you love, you teach others to love. When you're patient, you create space for others to grow. When you're faithful, you build trust that impacts generations.

Paul prays that we would "live a life worthy of the Lord and please him in every way: bearing fruit in every good work." Every good work. Not just some. Not just the big, noticeable ones. Every act of love, every moment of patience, every exercise of self-control—all of it is fruit-bearing.

You've spent two weeks learning about the fruit of the Spirit. But learning isn't the goal—bearing fruit is. As you go from here, keep abiding. Keep walking by the Spirit. Let Him continue producing in you love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. And watch as lasting fruit comes from your life.`,
      reflection_questions: [
        'Which fruit of the Spirit has grown most in you over these two weeks?',
        'How can the fruit in your life impact others and leave a lasting legacy?',
        'What commitment will you make to continue cultivating the fruit of the Spirit?'
      ],
      prayer_focus: 'Lord Jesus, thank You for choosing me and appointing me to bear fruit—lasting fruit. I don\'t want to just learn about these qualities; I want to live them. Continue Your transforming work in me. May love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control mark my life and leave a legacy that outlasts me. For Your glory. Amen.'
    }
  ]
};

// =====================================================
// TRUSTING GOD'S TIMING - 10 Day Series
// =====================================================
const TRUSTING_GODS_TIMING = {
  series: {
    slug: 'trusting-gods-timing',
    title: 'Trusting God\'s Timing',
    description: 'A 10-day journey to embrace God\'s perfect timing in your life. Learn patience and trust when answers seem delayed, doors remain closed, or waiting feels endless.',
    total_days: 10,
    topics: ['patience', 'trust', 'waiting', 'faith', 'sovereignty'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'His Timing, Not Ours',
      scripture_refs: [
        { book: 'Ecclesiastes', chapter: 3, verseStart: 1, verseEnd: 8 },
        { book: 'Isaiah', chapter: 55, verseStart: 8, verseEnd: 9 }
      ],
      content: `"There is a time for everything, and a season for every activity under the heavens."

Solomon's famous words remind us that life moves in seasons, and each season has its purpose. But here's where we struggle: we don't get to choose the season. We don't control when things begin or end, when doors open or close, when waiting ends or continues.

God's timing rarely matches our preferences. We want answers now; He often says wait. We want doors opened; He sometimes keeps them closed for longer than we'd like. We want the next season to begin; He seems content to let the current one continue.

"For my thoughts are not your thoughts, neither are your ways my ways."

This is both humbling and comforting. Humbling because we're reminded we're not in control. Comforting because the One who IS in control sees what we can't see, knows what we don't know, and loves us more than we love ourselves.

Today, instead of fighting against God's timing, can you surrender to it? Instead of demanding your timeline, can you trust His?`,
      reflection_questions: [
        'What season are you currently in, and are you fighting against it or embracing it?',
        'How does acknowledging that God\'s thoughts are higher than yours affect your waiting?',
        'What might God be doing in this season that you haven\'t considered?'
      ],
      prayer_focus: 'Father, Your timing is not my timing, and Your ways are higher than mine. Forgive me for demanding my schedule be Yours. Help me trust that You see the bigger picture and that Your timing is perfect. Give me grace for this season. Amen.'
    },
    {
      day_number: 2,
      title: 'The Purpose of Waiting',
      scripture_refs: [
        { book: 'Isaiah', chapter: 40, verseStart: 31, verseEnd: 31 },
        { book: 'Psalm', chapter: 27, verseStart: 14, verseEnd: 14 }
      ],
      content: `"But those who wait on the LORD shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint."

Waiting isn't wasted time. In God's economy, waiting is one of the primary ways He works in us. While we're focused on when things will change, God is focused on what He's changing in us.

The Hebrew word for "wait" here means to bind together, like twisting strands into a rope. As you wait on the Lord, you're being woven more tightly to Him. Your trust deepens. Your dependence grows. Your faith is strengthened.

And the promise? Renewed strength. Not just enough to survive, but enough to soar like eagles. To run without growing weary. To walk without fainting. This strength doesn't come despite the waiting—it comes through it.

"Wait for the LORD; be strong and take heart and wait for the LORD."

Notice it's repeated: wait. The psalmist knew our tendency to give up, to take matters into our own hands, to stop trusting. And so the instruction comes twice: wait. Keep waiting. Don't stop.

What is the waiting producing in you?`,
      reflection_questions: [
        'How has previous waiting deepened your relationship with God?',
        'Are you viewing your current waiting as wasted time or as productive spiritual work?',
        'What might God be weaving in you during this season that couldn\'t happen otherwise?'
      ],
      prayer_focus: 'Lord, help me see waiting differently. Instead of wasted time, let me see it as sacred time with You. Renew my strength as I wait. Weave me more tightly to You. Produce in me what couldn\'t come any other way. I choose to wait on You. Amen.'
    },
    {
      day_number: 3,
      title: 'When God Seems Slow',
      scripture_refs: [
        { book: '2 Peter', chapter: 3, verseStart: 8, verseEnd: 9 },
        { book: 'Habakkuk', chapter: 2, verseStart: 3, verseEnd: 3 }
      ],
      content: `"With the Lord a day is like a thousand years, and a thousand years are like a day."

God operates on a different timescale than we do. What feels agonizingly slow to us is not delay to Him. What seems like centuries of waiting is but a moment in His eternal perspective.

This doesn't mean your pain doesn't matter to Him. It means He sees things you can't see. He's working in ways you can't perceive. What looks like inaction is often preparation.

"For the revelation awaits an appointed time; it speaks of the end and will not prove false. Though it linger, wait for it; it will certainly come and will not delay."

There's an appointed time—a perfect moment when God's plan will unfold. It won't be early and it won't be late. From your perspective it may seem to linger, but God promises it will certainly come.

The question isn't whether God will fulfill His promises—He always does. The question is whether you'll trust Him in the meantime. Will you believe that the One who holds eternity can be trusted with your timeline?`,
      reflection_questions: [
        'How does God\'s eternal perspective challenge your sense of urgency?',
        'What promises of God are you waiting to see fulfilled?',
        'How can believing "it will certainly come" change how you experience waiting?'
      ],
      prayer_focus: 'Eternal God, Your timeline is not mine, and Your perspective spans all of history. When I feel forgotten or overlooked, remind me that You are always at work. Help me trust that Your appointed time will come—not early, not late, but perfect. Amen.'
    },
    {
      day_number: 4,
      title: 'Learning from Those Who Waited',
      scripture_refs: [
        { book: 'Hebrews', chapter: 11, verseStart: 8, verseEnd: 12 },
        { book: 'Romans', chapter: 4, verseStart: 18, verseEnd: 21 }
      ],
      content: `Abraham waited twenty-five years from the promise of a son to Isaac's birth. Twenty-five years of hoping, doubting, making mistakes, and continuing to believe.

By the time Isaac was born, Abraham was nearly 100 years old, and Sarah was 90. From a human perspective, the dream was dead. But "against all hope, Abraham in hope believed."

Here's what Abraham's story teaches us: God's promises don't have expiration dates. Just because it seems too late, just because circumstances suggest it's impossible, just because everyone else has given up—God is still able.

Abraham "did not waver through unbelief regarding the promise of God, but was strengthened in his faith and gave glory to God, being fully persuaded that God had power to do what he had promised."

Fully persuaded. Not fully understanding—Abraham didn't understand God's timing. But fully trusting that God could and would do what He said.

Your waiting may feel long. But it's likely not twenty-five years. And even if it is, Abraham's story proves: God is faithful. He keeps His promises. Trust Him.`,
      reflection_questions: [
        'What can you learn from Abraham\'s long wait that applies to your situation?',
        'Have you been tempted to think it\'s "too late" for God to work? How does Abraham\'s story challenge that?',
        'What would it look like for you to be "fully persuaded" that God will do what He promised?'
      ],
      prayer_focus: 'Father, like Abraham, I sometimes struggle to believe when time keeps passing. Strengthen my faith. Help me be fully persuaded that You can do what You\'ve promised, regardless of how long it takes. May my waiting glorify You. Amen.'
    },
    {
      day_number: 5,
      title: 'Active Waiting',
      scripture_refs: [
        { book: 'Micah', chapter: 7, verseStart: 7, verseEnd: 7 },
        { book: 'Psalm', chapter: 37, verseStart: 3, verseEnd: 7 }
      ],
      content: `"But as for me, I watch in hope for the LORD, I wait for God my Savior; my God will hear me."

Waiting on God isn't passive resignation. It's active hope. Micah "watches"—his eyes are open, expectant, looking for what God will do. He waits—not with crossed arms and impatience, but with confident expectation.

Psalm 37 gives practical instructions for active waiting: "Trust in the LORD and do good; dwell in the land and enjoy safe pasture. Delight yourself in the LORD, and he will give you the desires of your heart."

While you wait:
- Trust—Keep choosing to believe God is good and His plans are good.
- Do good—Don't let waiting become an excuse for inactivity. Serve, love, obey.
- Dwell—Stay planted where God has you. Don't run from the current season.
- Enjoy—Find contentment in the present, even while hoping for the future.
- Delight—Let your relationship with God be your source of joy, not just His gifts.

"Commit your way to the LORD; trust in him and he will do this."

Commitment. Trust. Then let Him work. This is active waiting—engaged, hopeful, obedient, while leaving the timing to God.`,
      reflection_questions: [
        'How can you practice "active waiting" rather than passive frustration?',
        'What does it look like to "delight in the Lord" even when you\'re waiting for something else?',
        'What good work can you do in this current season while you wait?'
      ],
      prayer_focus: 'Lord, I don\'t want to waste this season in frustration. Help me actively wait—trusting, doing good, dwelling contentedly, delighting in You. While I wait for what\'s next, use me where I am. I commit my way to You. Amen.'
    },
    {
      day_number: 6,
      title: 'When Others Move Ahead',
      scripture_refs: [
        { book: 'Psalm', chapter: 73, verseStart: 2, verseEnd: 3 },
        { book: 'Psalm', chapter: 73, verseStart: 16, verseEnd: 17 },
        { book: 'Psalm', chapter: 73, verseStart: 25, verseEnd: 26 }
      ],
      content: `"But as for me, my feet had almost slipped... For I envied the arrogant when I saw the prosperity of the wicked."

One of the hardest parts of waiting is watching others move ahead. They get the job you wanted. They find the relationship you've prayed for. Their prayers seem answered while yours go unheard. And comparison creeps in, followed closely by bitterness.

Asaph was honest about this struggle: "When I tried to understand all this, it troubled me deeply." Comparison is exhausting. It steals joy and breeds resentment. And it totally distorts our perspective.

Here's the turning point: "till I entered the sanctuary of God; then I understood."

Coming into God's presence changed everything. Suddenly the comparison that seemed so important faded. Suddenly his own relationship with God took center stage.

"Whom have I in heaven but you? And earth has nothing I desire besides you. My flesh and my heart may fail, but God is the strength of my heart and my portion forever."

When you're tempted to compare, come into the sanctuary. Let God's presence recalibrate your heart. Remember that He is your portion—and that's enough.`,
      reflection_questions: [
        'Whose success or progress are you most tempted to envy?',
        'How might entering God\'s presence change your perspective on comparison?',
        'What would it mean for God to truly be your "portion"—enough for you?'
      ],
      prayer_focus: 'Lord, forgive me for the comparisons that steal my peace. Forgive the envy that poisons my heart. When others move ahead and I feel left behind, draw me into Your presence. You are my portion. You are enough. Help me believe it. Amen.'
    },
    {
      day_number: 7,
      title: 'God\'s Timing Is Perfect',
      scripture_refs: [
        { book: 'Galatians', chapter: 4, verseStart: 4, verseEnd: 5 },
        { book: 'Acts', chapter: 1, verseStart: 7, verseEnd: 8 }
      ],
      content: `"But when the set time had fully come, God sent his Son."

For centuries, Israel waited for the Messiah. Generation after generation hoped He would come in their lifetime. Prophets spoke, silence fell, and still the waiting continued.

Then, at exactly the right moment—when Roman roads connected the world, when Greek was a common language, when the world was uniquely prepared—Jesus came. Not randomly. Not late. At the set time.

God's timing is never accidental. He weaves together thousands of factors we can't see, preparing circumstances, positioning people, aligning details. What feels like delay is often preparation.

When the disciples asked about timing before Jesus' ascension, He redirected them: "It is not for you to know the times or dates the Father has set by his own authority. But you will receive power..."

Don't obsess over when. Focus on what God has given you for now. Trust that the same God who timed Jesus' coming perfectly is timing your life perfectly too.`,
      reflection_questions: [
        'How does Jesus\' coming at "the set time" encourage your trust in God\'s timing?',
        'What might God be preparing while you wait that you can\'t currently see?',
        'How can you shift focus from "when will this happen" to "what should I do now"?'
      ],
      prayer_focus: 'Father, You sent Jesus at exactly the right time. Not a moment too early, not a moment too late. Help me trust that You\'re orchestrating my life with the same precision. When I don\'t understand the timing, help me trust the Timer. Amen.'
    },
    {
      day_number: 8,
      title: 'Patience Is Developed',
      scripture_refs: [
        { book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 },
        { book: 'Romans', chapter: 5, verseStart: 3, verseEnd: 5 }
      ],
      content: `"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."

No one naturally excels at waiting. Patience isn't a personality trait some people are born with—it's a spiritual muscle developed through exercise. And the exercise that builds patience is... waiting.

This creates an interesting reality: you can't become patient without facing situations that require patience. The very experience you want to escape is the one developing the quality you need.

"Suffering produces perseverance; perseverance, character; and character, hope."

There's a progression here. Suffering (including the suffering of waiting) produces perseverance. Perseverance builds character. Character creates hope. You can't skip steps.

This reframes waiting entirely. It's not wasted time—it's training time. Each day of trusting, each moment of not giving up, each choice to hope despite delay—these are building something in you that couldn't come any other way.

What if you thanked God for the patience training He's providing through this season?`,
      reflection_questions: [
        'How has your patience grown through previous seasons of waiting?',
        'Can you see the progression Paul describes (suffering to perseverance to character to hope) in your own life?',
        'How might viewing waiting as "training" change your attitude toward it?'
      ],
      prayer_focus: 'Lord, I confess I want patience without the process that develops it. Help me embrace this training ground. Use the waiting to build perseverance, character, and hope in me. Don\'t waste a moment of this season. Amen.'
    },
    {
      day_number: 9,
      title: 'The Danger of Running Ahead',
      scripture_refs: [
        { book: 'Genesis', chapter: 16, verseStart: 1, verseEnd: 4 },
        { book: 'Proverbs', chapter: 19, verseStart: 2, verseEnd: 2 }
      ],
      content: `Sarai was tired of waiting. God had promised a son, but years passed with no baby. So she took matters into her own hands: "Go, sleep with my slave; perhaps I can build a family through her."

The result of running ahead of God's timing? Ishmael—and centuries of conflict that continues to this day. What seemed like a reasonable solution created problems far beyond what Sarai could have imagined.

"It is not good to have zeal without knowledge, nor to be hasty and miss the way."

When we grow impatient with God's timing, we're tempted to engineer our own solutions. We force doors open that God intended to remain closed. We create with our hands what God planned to create through His power. And the results are never quite what God had in mind.

The things you accomplish through running ahead may look like success initially. But they won't carry the blessing that comes from God's perfect timing. You may get what you want—but miss what God wanted to give you.

What are you tempted to force? Where are you pushing ahead of God?`,
      reflection_questions: [
        'Can you identify times when running ahead of God created problems?',
        'What are you currently tempted to "make happen" instead of waiting for God?',
        'How can you discern between taking appropriate action and running ahead of God?'
      ],
      prayer_focus: 'Father, forgive me for the times I\'ve run ahead, forced doors, and tried to make things happen in my own timing. Give me wisdom to know when to act and when to wait. Guard me from creating Ishmaels when You want to give me Isaacs. Amen.'
    },
    {
      day_number: 10,
      title: 'He Is Worth the Wait',
      scripture_refs: [
        { book: 'Psalm', chapter: 130, verseStart: 5, verseEnd: 7 },
        { book: 'Lamentations', chapter: 3, verseStart: 25, verseEnd: 26 }
      ],
      content: `"I wait for the LORD, my whole being waits, and in his word I put my hope."

As we conclude this journey, here's the foundational truth: God is worth waiting for. Not just His gifts—HIM. Not just His answers—HIS PRESENCE. Not just His timing—HIS FAITHFULNESS.

"The LORD is good to those whose hope is in him, to the one who seeks him; it is good to wait quietly for the salvation of the LORD."

It is GOOD to wait. Not just necessary, not just tolerable—good. Because in the waiting, we learn to value the Giver more than the gifts. We discover that His presence is what we truly need. We find that He is enough even when circumstances haven't changed.

"Put your hope in the LORD, for with the LORD is unfailing love and with him is full redemption."

Whatever you're waiting for—healing, breakthrough, relationship, opportunity, answers—keep your hope in the Lord Himself. His love never fails. His redemption is complete. And one day, whether in this life or the next, every wait will end in His presence, and it will all have been worth it.

He is worth the wait.`,
      reflection_questions: [
        'Has your waiting drawn you closer to God Himself, or just made you more desperate for His gifts?',
        'How has this study changed your perspective on trusting God\'s timing?',
        'What commitment will you make as you continue waiting?'
      ],
      prayer_focus: 'Lord, You are worth waiting for. Not just Your answers or Your gifts—You. Help me treasure Your presence more than my timeline. Keep my hope in You, not in circumstances changing. Whatever comes, whenever it comes, I will trust You. You are enough. Amen.'
    }
  ]
};

// =====================================================
// ARMOR OF GOD - 10 Day Series
// =====================================================
const ARMOR_OF_GOD = {
  series: {
    slug: 'armor-of-god',
    title: 'The Armor of God',
    description: 'A 10-day intensive study on spiritual warfare. Learn to stand firm against the enemy by putting on the full armor of God: belt of truth, breastplate of righteousness, shoes of peace, shield of faith, helmet of salvation, and sword of the Spirit.',
    total_days: 10,
    topics: ['spiritual_warfare', 'armor', 'protection', 'victory', 'faith'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  days: [
    {
      day_number: 1,
      title: 'The Battle Is Real',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 10, verseEnd: 12 }
      ],
      content: `"For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms."

Before we can put on armor, we need to recognize why we need it. There's a battle happening—not primarily against people, politics, or circumstances, but against unseen spiritual forces. This isn't superstition; it's biblical reality.

Many Christians live as practical atheists when it comes to spiritual warfare. We acknowledge demons exist, but we don't actually believe they influence our lives. The result? We're unprepared, unguarded, and frequently defeated by forces we refuse to recognize.

Paul's language is militaristic and intense: struggle, rulers, authorities, powers, forces of evil. This isn't a playground disagreement—it's real warfare with real enemies who want real harm.

But notice how the passage begins: "Be strong in the Lord and in his mighty power." The battle is real, but we're not fighting alone or in our own strength. Victory has already been secured at the cross. Our job is to stand in that victory, clothed in God's armor.

Are you taking the spiritual battle seriously?`,
      reflection_questions: [
        'Have you been living as if the spiritual battle isn\'t real? What evidence suggests this?',
        'Where in your life do you sense spiritual opposition—not just human difficulty?',
        'How does knowing the battle is "not against flesh and blood" change how you view your conflicts?'
      ],
      prayer_focus: 'Lord, open my eyes to the spiritual reality around me. I confess I\'ve often ignored the battle or tried to fight in my own strength. Strengthen me in Your mighty power. Help me stand firm against forces I cannot see. Amen.'
    },
    {
      day_number: 2,
      title: 'Stand Your Ground',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 13, verseEnd: 14 }
      ],
      content: `"Therefore put on the full armor of God, so that when the day of evil comes, you may be able to stand your ground, and after you have done everything, to stand."

Three times in this passage, Paul uses the word "stand." Not advance, attack, or conquer—but stand. This reveals something crucial about spiritual warfare: the primary posture is defensive, not offensive.

Jesus has already won the war. At the cross, He defeated Satan, sin, and death. The enemy is already conquered; he just hasn't accepted his defeat. Your job isn't to win the victory—it's to hold the ground Christ has already taken.

"When the day of evil comes"—notice it's not "if" but "when." Evil days will come. Attacks will happen. Temptations will intensify. Opposition will rise. The question is whether you'll be prepared.

The armor is comprehensive—"full armor." You don't get to choose which pieces to wear. A soldier missing his helmet or lacking his shield is vulnerable. Partial armor means partial protection.

Today, commit to putting on ALL the armor, not just the pieces that feel comfortable. The day of evil doesn't give advance notice. Be ready.`,
      reflection_questions: [
        'Which "days of evil" have caught you unprepared? What was the result?',
        'How does understanding your role as "standing" rather than "conquering" change your approach?',
        'What pieces of spiritual armor have you been neglecting?'
      ],
      prayer_focus: 'Lord, help me stand. When the day of evil comes—and it will come—I want to be ready. Show me where I\'m vulnerable, where my armor is incomplete. I want to hold the ground You\'ve already won. Amen.'
    },
    {
      day_number: 3,
      title: 'The Belt of Truth',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 14, verseEnd: 14 },
        { book: 'John', chapter: 8, verseStart: 31, verseEnd: 32 }
      ],
      content: `"Stand firm then, with the belt of truth buckled around your waist."

A Roman soldier's belt was foundational—it held the rest of the armor together and tucked in the tunic so the soldier could move freely. Without it, everything else was compromised.

Truth is foundational to spiritual warfare. Satan is called "the father of lies." His primary strategy is deception: distorting God's character, twisting Scripture, whispering lies about your identity, creating confusion about what's right.

"You will know the truth, and the truth will set you free."

Freedom comes through truth. When lies have been exposed and replaced with God's truth, the enemy loses his grip. His accusations fall flat. His distortions are recognized. His traps are avoided.

Putting on the belt of truth means saturating yourself in Scripture—knowing it, believing it, living it. It means being honest with yourself about your own sin instead of hiding. It means rejecting lies about God's character and your identity in Christ.

What lies have you been believing? What truths need to replace them?`,
      reflection_questions: [
        'What lies do you most commonly believe about God, yourself, or your situation?',
        'How well do you know God\'s Word—well enough to recognize distortions?',
        'What specific truths from Scripture need to become your belt today?'
      ],
      prayer_focus: 'Father of truth, expose the lies I\'ve been believing. Replace every distortion with Your reality. Help me know Your Word so well that deception is instantly recognizable. Buckle the belt of truth around me. Amen.'
    },
    {
      day_number: 4,
      title: 'The Breastplate of Righteousness',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 14, verseEnd: 14 },
        { book: '2 Corinthians', chapter: 5, verseStart: 21, verseEnd: 21 }
      ],
      content: `"...with the breastplate of righteousness in place."

The breastplate protected the soldier's heart and vital organs—the most vulnerable, life-sustaining parts of the body. A wound to the heart meant death.

Satan loves to attack your heart. He accuses you of being unworthy, unforgiven, disqualified. He reminds you of past failures, whispers that you'll never change, suggests God is disappointed in you. And if these accusations land, they wound your spiritual vitality.

But here's the glorious truth: "God made him who had no sin to be sin for us, so that in him we might become the righteousness of God."

Your breastplate isn't your own righteousness—it's Christ's. You're not protected by your own performance but by His perfection credited to your account. When Satan accuses, you don't defend yourself by pointing to your good works. You point to the cross.

This is why confession and maintaining a clear conscience matter. Not to earn righteousness—Christ has already done that—but to keep the breastplate firmly in place. Unconfessed sin creates gaps in your armor.

Are you standing in Christ's righteousness or trying to prove your own?`,
      reflection_questions: [
        'When Satan accuses you, what do you typically do—defend yourself or point to Christ?',
        'Is there unconfessed sin creating a gap in your breastplate?',
        'How does knowing you have Christ\'s righteousness change how you face accusation?'
      ],
      prayer_focus: 'Lord Jesus, thank You for making me righteous through Your sacrifice. When the accuser attacks my heart, help me stand in Your righteousness, not my own. Cover my heart with Your breastplate. Amen.'
    },
    {
      day_number: 5,
      title: 'Shoes of Peace',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 15, verseEnd: 15 },
        { book: 'Romans', chapter: 5, verseStart: 1, verseEnd: 2 }
      ],
      content: `"...and with your feet fitted with the readiness that comes from the gospel of peace."

Roman soldiers wore sandals with metal studs that gripped the ground, giving them stable footing in battle. Without secure footing, a soldier couldn't stand against assault.

Your spiritual footing comes from the gospel of peace. "Since we have been justified through faith, we have peace with God through our Lord Jesus Christ."

This peace isn't just a feeling—it's an objective reality. The war between you and God is over. You're reconciled. No matter what happens in the spiritual battle, your relationship with God is secure.

Satan wants to destabilize you. He wants you constantly unsure of your standing with God, always wondering if you're truly saved, perpetually anxious about your eternal destiny. But when your feet are fitted with gospel peace, you have solid ground to stand on.

"Readiness" suggests preparation—being ready to share this peace with others and ready to stand firm when attacks come. You can move confidently because you know where you stand with God.

Is your footing secure in the gospel, or are you slipping on uncertainty?`,
      reflection_questions: [
        'Do you have settled peace about your relationship with God, or are you often uncertain?',
        'How does peace with God prepare you for spiritual battle?',
        'In what ways can you be more "ready" to share the gospel of peace?'
      ],
      prayer_focus: 'God of peace, thank You that I have peace with You through Jesus. Secure my footing in this truth. When the enemy tries to destabilize me with doubt, let me stand firm on the solid ground of Your gospel. Amen.'
    },
    {
      day_number: 6,
      title: 'The Shield of Faith',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 16, verseEnd: 16 },
        { book: 'Hebrews', chapter: 11, verseStart: 1, verseEnd: 1 }
      ],
      content: `"In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one."

Roman soldiers used large shields—about four feet tall—that could protect the entire body and interlock with other soldiers' shields to form a wall. These shields were often made of wood covered with leather, soaked in water to extinguish flaming arrows.

Faith is your shield. Doubt, fear, anxiety, lust, anger, despair—these are the enemy's flaming arrows. They come fast. They come hot. And without a shield, they find their mark.

But faith extinguishes them ALL. "Faith is confidence in what we hope for and assurance about what we do not see." It's believing God's truth when feelings suggest otherwise. It's trusting His promises when circumstances contradict them. It's holding onto His character when you can't see His hand.

Notice faith is something you "take up"—an active choice, not a passive feeling. When flaming arrows fly, you deliberately raise the shield. You actively choose to believe. You consciously reject the lie and embrace the truth.

What arrows are flying at you right now? Are you raising your shield?`,
      reflection_questions: [
        'What "flaming arrows" do you most frequently face—doubt, fear, lust, discouragement?',
        'How can you more actively raise the shield of faith when attacks come?',
        'In what ways can believers link shields to protect each other?'
      ],
      prayer_focus: 'Lord, give me faith that extinguishes the enemy\'s arrows. When doubt flies, let faith rise. When fear attacks, let trust be my shield. I choose to believe You, especially when I don\'t feel it. Strengthen my shield. Amen.'
    },
    {
      day_number: 7,
      title: 'The Helmet of Salvation',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 17, verseEnd: 17 },
        { book: 'Romans', chapter: 12, verseStart: 2, verseEnd: 2 }
      ],
      content: `"Take the helmet of salvation."

The helmet protected the soldier's head—his mind. And that's precisely where many spiritual battles are won or lost.

Satan attacks the mind: planting thoughts, suggesting doubts, replaying failures, projecting fears, distorting truth. If he can control your thought life, he can control you.

The helmet of salvation protects your mind by reminding you WHO YOU ARE. You are saved—past, present, and future. You are forgiven. You are adopted. You are sealed by the Spirit. You are secure in Christ. When the enemy whispers lies about your identity, the helmet of salvation declares: "I belong to Jesus."

"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."

Putting on the helmet means actively renewing your mind with truth. It means rejecting thoughts that contradict your identity in Christ. It means capturing every thought and making it obedient to Him.

What thoughts need to be captured today? What lies about your identity need to be replaced with the truth of your salvation?`,
      reflection_questions: [
        'What recurring negative thoughts attack your mind? What do they suggest about your identity?',
        'How does remembering your salvation protect you from mental attack?',
        'What practical steps can you take to "renew your mind" daily?'
      ],
      prayer_focus: 'Lord, protect my mind. When the enemy attacks my thoughts, remind me of who I am in You. I am saved, forgiven, loved, secure. Let the helmet of salvation guard my thinking. Help me take every thought captive. Amen.'
    },
    {
      day_number: 8,
      title: 'The Sword of the Spirit',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 17, verseEnd: 17 },
        { book: 'Hebrews', chapter: 4, verseStart: 12, verseEnd: 12 },
        { book: 'Matthew', chapter: 4, verseStart: 1, verseEnd: 11 }
      ],
      content: `"...and the sword of the Spirit, which is the word of God."

The sword is the only offensive weapon in the armor list. Everything else is defensive—protecting, guarding, standing. But the sword advances, strikes, defeats.

"The word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart."

When Jesus faced temptation in the wilderness, He wielded this sword. Every attack met with "It is written..." He didn't debate, negotiate, or try to reason with Satan. He spoke Scripture, and the enemy fled.

This is your model. When temptation whispers, answer with Scripture. When doubt accuses, respond with truth. When fear threatens, declare God's promises. The enemy cannot stand against the Word of God rightly wielded.

But here's the challenge: you can't wield a sword you don't have. Knowing Scripture—memorizing it, understanding it, being ready to use it—is essential. A soldier who leaves his sword in the barracks is helpless in battle.

Is your sword sharp and ready?`,
      reflection_questions: [
        'How well do you know Scripture—enough to use it as a weapon?',
        'What specific verses could you memorize to counter your most common temptations?',
        'How does Jesus\' example in the wilderness shape how you fight spiritual battles?'
      ],
      prayer_focus: 'Lord, make Your Word my weapon. Help me know it deeply, believe it firmly, and wield it skillfully. When the enemy attacks, let Scripture be on my lips. Sharpen my sword. Amen.'
    },
    {
      day_number: 9,
      title: 'Praying in the Spirit',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 18, verseEnd: 20 }
      ],
      content: `"And pray in the Spirit on all occasions with all kinds of prayers and requests. With this in mind, be alert and always keep on praying for all the Lord's people."

After describing the armor, Paul adds one more essential element: prayer. This isn't just a footnote—it's what activates everything else. Armor without prayer is like a car without fuel. It might look impressive, but it won't go anywhere.

"Pray in the Spirit"—prayer empowered, guided, and energized by the Holy Spirit. Not just reciting words, but genuinely connecting with God. "On all occasions"—not just in crisis, but continually. "All kinds of prayers"—praise, confession, petition, intercession, thanksgiving.

"Be alert and always keep on praying for all the Lord's people."

Spiritual warfare isn't just individual—it's corporate. We fight together. We pray for each other. When a brother or sister is under attack, we intercede. When we're weak, others lift us up.

Paul even asks for prayer for himself: "Pray also for me, that whenever I speak, words may be given me." Even the great apostle needed prayer covering. How much more do we?

Are you praying—for yourself, for others, in the Spirit?`,
      reflection_questions: [
        'How consistent is your prayer life? How might it be strengthened?',
        'Who in your life needs you to pray for them in spiritual battle?',
        'What does it mean practically to "pray in the Spirit"?'
      ],
      prayer_focus: 'Holy Spirit, teach me to pray. Make prayer as natural as breathing. Help me be alert to the needs around me and faithful to intercede. Connect me with others who will fight alongside me. Amen.'
    },
    {
      day_number: 10,
      title: 'Standing in Victory',
      scripture_refs: [
        { book: 'Colossians', chapter: 2, verseStart: 15, verseEnd: 15 },
        { book: 'Romans', chapter: 8, verseStart: 37, verseEnd: 39 }
      ],
      content: `"And having disarmed the powers and authorities, he made a public spectacle of them, triumphing over them by the cross."

As we conclude this study, remember this: THE BATTLE IS ALREADY WON. At the cross, Jesus disarmed and defeated the enemy. Satan is a conquered foe, stripped of his ultimate power, made a public spectacle. He fights on, but he fights as one who has already lost.

"We are more than conquerors through him who loved us."

More than conquerors. Not barely surviving, not just hanging on, not fighting for a victory that might or might not come—but MORE than conquerors. The outcome is certain. Christ has won, and in Him, so have you.

Nothing can separate you from God's love—not trouble or hardship or persecution, not angels or demons, not the present or the future, not any powers, not height or depth—NOTHING.

So put on your armor. Stand firm. Fight the good fight. Pray without ceasing. And remember: you're not fighting FOR victory—you're fighting FROM victory. The cross has already settled the matter. Now live like it.`,
      reflection_questions: [
        'How does knowing Christ has already won change how you approach spiritual battle?',
        'What does it mean practically to fight FROM victory rather than FOR victory?',
        'What commitment will you make going forward regarding spiritual warfare?'
      ],
      prayer_focus: 'Victorious King, thank You that the battle is already won. Thank You that I fight from victory, not for it. Help me live as more than a conqueror. Give me courage to stand, wisdom to fight, and faith to believe that nothing can separate me from Your love. In Jesus\' name, Amen.'
    }
  ]
};

// =====================================================
// VICTORY OVER TEMPTATION & SIN - 14 Day Series
// =====================================================
const VICTORY_OVER_TEMPTATION = {
  series: {
    slug: 'victory-temptation',
    title: 'Victory Over Temptation & Sin',
    description: 'A 14-day battle plan for overcoming temptation and walking in freedom. Discover practical biblical strategies for resisting the enemy and living in the victory Christ has already won.',
    total_days: 14,
    topics: ['temptation', 'sin', 'victory', 'holiness', 'spiritual_warfare'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  days: [
    {
      day_number: 1,
      title: 'Understanding the Battle',
      scripture_refs: [
        { book: '1 Corinthians', chapter: 10, verseStart: 13, verseEnd: 13 }
      ],
      content: `"No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it."

This single verse contains some of the most liberating truths for anyone battling temptation:

First, your temptation is "common to mankind." You're not uniquely broken. You're not facing something no one else has faced. The enemy wants you to believe you're the only one struggling, that your sin is too shameful to confess. That's a lie. Others have faced what you face—and overcome.

Second, God is faithful. When everything else feels uncertain, when your willpower fails, when you've fallen again—God remains faithful. His faithfulness isn't dependent on yours.

Third, He will not let you be tempted beyond what you can bear. This means every temptation you face is one you CAN resist. There's no such thing as irresistible temptation for the believer. If you fell, it wasn't because you couldn't stand—it was because you chose not to use the strength God provided.

Fourth, He provides a way out. Not after you've proven yourself, not sometimes, but with every temptation. Your job is to look for the exit and take it.

Victory is possible. That's not wishful thinking—it's a promise from a faithful God.`,
      reflection_questions: [
        'What temptation have you believed was unique to you or too shameful to share?',
        'How does knowing God limits temptation to what you can bear change your perspective?',
        'When you last fell to temptation, was there a way out you ignored?'
      ],
      prayer_focus: 'Father, thank You that victory is possible. Thank You for limiting temptation and always providing a way out. Open my eyes to see the exits You provide. Strengthen me to take them. I believe I can overcome through Your faithfulness. Amen.'
    },
    {
      day_number: 2,
      title: 'The Anatomy of Temptation',
      scripture_refs: [
        { book: 'James', chapter: 1, verseStart: 13, verseEnd: 15 }
      ],
      content: `"When tempted, no one should say, 'God is tempting me.' For God cannot be tempted by evil, nor does he tempt anyone; but each person is tempted when they are dragged away by their own evil desire and enticed. Then, after desire has conceived, it gives birth to sin; and sin, when it is full-grown, gives birth to death."

James pulls back the curtain on how temptation actually works. Understanding this process is crucial for victory.

It starts with DESIRE—not external circumstances, but something inside you. You're "dragged away" by your OWN evil desire. This is uncomfortable truth: the problem isn't just out there—it's in here. We can't simply blame our environment.

Then comes ENTICEMENT—the desire is baited, made attractive, presented as satisfying. The enemy knows what appeals to you. He customizes the lure.

When desire and enticement meet, CONCEPTION occurs. You begin to entertain the thought, to plan, to justify. At this stage, you haven't acted yet—but the pregnancy has begun.

Finally, sin is BORN—the action happens. And when sin matures, it produces DEATH—broken relationships, destroyed trust, spiritual emptiness, sometimes physical consequences.

The key insight? The battle is won or lost long before the action. It's won at the desire stage, at the enticement stage, at the conception stage. Once sin is full-term, delivery is nearly inevitable.

Where do you need to intervene earlier in the process?`,
      reflection_questions: [
        'At what stage do you typically try to fight temptation? Is it early enough?',
        'What specific desires in your heart make you vulnerable to certain temptations?',
        'How can you intervene earlier in the conception stage—before sin is born?'
      ],
      prayer_focus: 'Lord, show me the desires in my heart that make me vulnerable. Help me fight earlier—not waiting until sin is about to be born, but intervening when desire first stirs. Transform my desires to align with Yours. Amen.'
    },
    {
      day_number: 3,
      title: 'Know Your Enemy',
      scripture_refs: [
        { book: '1 Peter', chapter: 5, verseStart: 8, verseEnd: 9 }
      ],
      content: `"Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith, because you know that the family of believers throughout the world is undergoing the same kind of sufferings."

You have an enemy. This isn't figurative language or ancient mythology—it's spiritual reality. And ignoring an enemy doesn't make him go away; it just makes you vulnerable.

The devil PROWLS—he's active, strategic, watching for opportunity. He studies your patterns, knows your weaknesses, and waits for the right moment to attack. He's not lazy or random; he's intentional.

He's like a ROARING LION—seeking to intimidate, frighten, and devour. But notice: Peter says he prowls "like" a lion. He's an imposter, a defeated foe who masquerades as more powerful than he is. The true Lion is the Lion of Judah.

He's LOOKING FOR SOMEONE—he seeks out the vulnerable, the isolated, the careless. Those who are alert and sober-minded are less appealing targets. Those who are spiritually drowsy or intoxicated by worldliness are easy prey.

Our response? RESIST. Standing firm. In the faith. This is active, not passive. You don't defeat temptation by ignoring it but by resisting it.

And you're not alone—believers worldwide face the same battles. This fight is common and communal.`,
      reflection_questions: [
        'Have you been living as if you have no enemy? How has this affected your vulnerability?',
        'When do you tend to be spiritually drowsy or less alert? How can you guard these times?',
        'What would it look like to actively resist rather than passively hope temptation goes away?'
      ],
      prayer_focus: 'Lord, help me be alert and sober-minded. I acknowledge I have a real enemy who wants to devour me. Give me wisdom to see his schemes and courage to resist. May I stand firm in faith, not in my own strength. Amen.'
    },
    {
      day_number: 4,
      title: 'The Power of the Word',
      scripture_refs: [
        { book: 'Matthew', chapter: 4, verseStart: 1, verseEnd: 11 }
      ],
      content: `When Jesus faced temptation in the wilderness, He gave us the ultimate model for resistance. Three times the devil attacked. Three times Jesus responded the same way: "It is written..."

Not "I feel like..." Not "I think..." Not "My opinion is..." But "IT IS WRITTEN."

Jesus knew Scripture. He didn't have to look it up. He didn't need to think about it. The Word was hidden in His heart, ready to be wielded like a sword.

Notice how precise His responses were. When tempted to turn stones to bread, He quoted Deuteronomy about living by God's Word. When tempted to test God, He quoted about not putting God to the test. When offered worldly kingdoms, He quoted about worshiping God alone. Each verse was perfectly matched to the specific temptation.

The enemy even tried to use Scripture himself—misquoting and misapplying it. But Jesus knew the Word well enough to recognize the distortion.

This is your model. When temptation whispers, Scripture speaks. When lies accuse, truth answers. When desire entices, the Word cuts through.

But you can't quote what you don't know. You can't wield a sword you've never picked up.

How well do you know the Scriptures that address YOUR temptations?`,
      reflection_questions: [
        'Do you have Scripture memorized that specifically addresses your areas of temptation?',
        'How did Jesus\' precision in using Scripture contribute to His victory?',
        'What three verses could you memorize this week to fight your most common temptations?'
      ],
      prayer_focus: 'Lord Jesus, You showed me how to fight. Help me hide Your Word in my heart so deeply that it rises automatically when temptation comes. Show me the specific Scriptures I need for my specific battles. Amen.'
    },
    {
      day_number: 5,
      title: 'Flee or Fight',
      scripture_refs: [
        { book: '2 Timothy', chapter: 2, verseStart: 22, verseEnd: 22 },
        { book: 'James', chapter: 4, verseStart: 7, verseEnd: 7 }
      ],
      content: `"Flee the evil desires of youth and pursue righteousness, faith, love and peace, along with those who call on the Lord out of a pure heart."

"Submit yourselves, then, to God. Resist the devil, and he will flee from you."

Here we have two commands that seem opposite: FLEE and RESIST. Which is it?

The answer is both—depending on the temptation.

Some temptations require flight. Joseph didn't stay to debate with Potiphar's wife—he ran. Literally left his coat behind. There are situations where the only victory is getting out. Staying to "prove your strength" is often pride in disguise.

Flee evil desires. Don't entertain them. Don't negotiate. Don't linger. Run.

But other temptations require resistance. You can't flee the devil—he'll follow you. You must submit to God and resist. And when you do, HE flees. The order matters: submit first, then resist. Without submission, resistance is just willpower, and willpower runs out.

Wisdom knows which response each situation requires. Some battles are won by fighting, others by fleeing. The foolish man fights when he should flee and flees when he should fight.

Know your temptations. Know which require flight (usually those involving physical sin) and which require resistance (usually those involving mental/spiritual attack). Respond accordingly.`,
      reflection_questions: [
        'What temptations in your life require fleeing—removing yourself from the situation entirely?',
        'What temptations require standing and resisting?',
        'Have you been fighting when you should flee, or fleeing when you should fight?'
      ],
      prayer_focus: 'Father, give me wisdom to know when to flee and when to fight. Give me humility to run when staying would be foolish. Give me courage to stand when running would be cowardice. I submit myself to You. Amen.'
    },
    {
      day_number: 6,
      title: 'The Power of Confession',
      scripture_refs: [
        { book: 'James', chapter: 5, verseStart: 16, verseEnd: 16 },
        { book: '1 John', chapter: 1, verseStart: 9, verseEnd: 9 }
      ],
      content: `"Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective."

"If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness."

Sin grows in darkness. It thrives on secrecy. The enemy's strategy is to keep you isolated, convinced that no one can know, that confession would bring only shame and rejection.

But confession breaks sin's power.

When you confess to God, He forgives and purifies. Not because you've earned it through confession, but because He is "faithful and just." The blood of Christ covers completely.

When you confess to trusted believers, something supernatural happens—healing. Not just forgiveness, but healing. The shame loses its grip. The isolation ends. Others can pray for you, strengthen you, hold you accountable.

This is terrifying. We'd rather keep our struggles hidden. But hidden struggles stay struggles. Exposed struggles can become testimonies.

Find someone trustworthy—a pastor, mentor, small group member, mature friend—and bring your battle into the light. The very thing that feels most shameful often becomes the pathway to freedom.

You are only as sick as your secrets.`,
      reflection_questions: [
        'What sins have you kept hidden that need to be brought into the light?',
        'Who in your life is trustworthy enough for confession and accountability?',
        'What has keeping secrets cost you? What might confession free you from?'
      ],
      prayer_focus: 'Lord, I confess [name your struggle]. Forgive me and purify me. Give me courage to confess to a trusted brother or sister. Break the power of secrecy. Bring my darkness into Your light. Amen.'
    },
    {
      day_number: 7,
      title: 'Renewing Your Mind',
      scripture_refs: [
        { book: 'Romans', chapter: 12, verseStart: 1, verseEnd: 2 }
      ],
      content: `"Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship. Do not conform to the pattern of this world, but be transformed by the renewing of your mind."

Victory over temptation isn't just about behavior modification—it's about transformation. And transformation happens through the mind.

The world constantly patterns your thinking: through media, culture, conversations, advertisements. You're being discipled every day by whatever you allow into your mind. The question is who's doing the discipling.

"Be transformed"—this is passive. You don't transform yourself; you are transformed. But there's a condition: "by the renewing of your mind." You participate by choosing what renews you.

What you feed grows. What you starve dies. If you're feeding lustful thoughts with images and entertainment, lust will grow. If you're feeding anxiety with worst-case scenarios, anxiety will grow. If you're feeding your mind with Scripture, worship, and truth—transformation will come.

This is a daily discipline. The mind doesn't stay renewed from one dose of Scripture. It requires continuous renewal because the world continuously patterns.

Practical question: What's your mind-diet? What are you consuming daily? Is it producing transformation or conformity?`,
      reflection_questions: [
        'What patterns of the world have shaped your thinking without you realizing it?',
        'What do you feed your mind most consistently—and what is it producing?',
        'What specific changes to your media/content consumption would help renew your mind?'
      ],
      prayer_focus: 'Lord, transform me from the inside out. Show me where I\'ve been conformed to worldly patterns without realizing it. Help me guard what enters my mind and actively choose renewal. Make me a living sacrifice. Amen.'
    },
    {
      day_number: 8,
      title: 'Guarding Your Heart',
      scripture_refs: [
        { book: 'Proverbs', chapter: 4, verseStart: 23, verseEnd: 27 }
      ],
      content: `"Above all else, guard your heart, for everything you do flows from it. Keep your mouth free of perversity; keep corrupt talk far from your lips. Let your eyes look straight ahead; fix your gaze directly before you. Give careful thought to the paths for your feet and be steadfast in all your ways. Do not turn to the right or the left; keep your foot from evil."

"Above all else"—this is priority language. More important than guarding your reputation, your money, your time—guard your heart. Why? Because everything else flows FROM it. Your actions, words, thoughts, and choices all originate in the heart.

This passage gives practical guardrails:

MOUTH—Keep it free of perversity. What you speak shapes what you believe. If you talk like the world, you'll think like the world.

EYES—Look straight ahead. Don't let your gaze wander to things that will entice. The second look is where trouble begins.

FEET—Think carefully about your paths. Don't wander into tempting situations. The road you walk determines the destination you reach.

Don't turn right or left. Stay on course. Detours into sin always promise shortcuts but deliver dead ends.

The heart is the command center. If the enemy captures your heart, he controls everything. But if your heart is guarded by God's truth and protected by intentional choices—you can stand.`,
      reflection_questions: [
        'What specifically threatens your heart—what gets in most easily?',
        'Which guardrail needs strengthening: your mouth, your eyes, or your feet?',
        'What "paths" do you walk that consistently lead you toward temptation?'
      ],
      prayer_focus: 'Father, help me guard my heart above all else. Put a watch over my mouth, discipline my eyes, and direct my feet. Show me the detours I take that lead to sin, and give me strength to stay on course. Amen.'
    },
    {
      day_number: 9,
      title: 'The Danger of Isolation',
      scripture_refs: [
        { book: 'Ecclesiastes', chapter: 4, verseStart: 9, verseEnd: 12 },
        { book: 'Hebrews', chapter: 10, verseStart: 24, verseEnd: 25 }
      ],
      content: `"Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up. But pity anyone who falls and has no one to help them up... Though one may be overpowered, two can defend themselves. A cord of three strands is not quickly broken."

"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another."

Lions hunt the isolated animal, the one separated from the herd. Your enemy does the same.

Isolation is dangerous. When you're alone in your struggle, shame grows louder. When no one knows your battle, accountability is absent. When you pull away from community, you lose the strength that comes from others.

Two can defend themselves. A cord of three strands is not quickly broken. There's protection in numbers—not because others fight for you, but because they fight WITH you.

"Spur one another on"—this implies close enough relationship to actually influence each other. "Encouraging one another"—this happens in community, not isolation.

Satan loves Christians who try to go it alone. They're easy targets. But believers linked arm-in-arm, honest about their struggles, praying for each other—that's a much harder target.

Are you in authentic community? Not just attending church, but truly known?`,
      reflection_questions: [
        'Are you truly known by other believers, or do you keep your real struggles hidden?',
        'Who in your life could be a "cord of three strands" with you?',
        'What keeps you from deeper community and accountability?'
      ],
      prayer_focus: 'Lord, forgive me for trying to fight alone. Lead me into authentic community where I can be known and strengthened. Give me courage to be vulnerable and humility to receive help. Amen.'
    },
    {
      day_number: 10,
      title: 'Grace After Failure',
      scripture_refs: [
        { book: 'Romans', chapter: 8, verseStart: 1, verseEnd: 2 },
        { book: 'Micah', chapter: 7, verseStart: 8, verseEnd: 8 }
      ],
      content: `"Therefore, there is now no condemnation for those who are in Christ Jesus, because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death."

"Do not gloat over me, my enemy! Though I have fallen, I will rise. Though I sit in darkness, the LORD will be my light."

You will fail. Not might—will. The question isn't if you'll fall but what you'll do after.

Satan's strategy after you sin is simple: condemnation. He'll whisper that you're hopeless, that you'll never change, that God is disgusted with you, that you might as well give up. And if you believe him, one failure becomes ten.

But hear the truth: "NO condemnation for those in Christ Jesus." None. Not a little less condemnation—no condemnation. Your failure doesn't disqualify you from grace; it qualifies you for it. Grace exists precisely because failure is real.

"Though I have fallen, I WILL rise." This is faith declaring what seems impossible. When you're face-down in failure, faith says, "I will get back up." Not because you're strong, but because the Lord is your light.

The enemy wants you to stay down. God wants you to rise. Whose voice will you believe?

Get up. Confess. Receive grace. Start again. As many times as it takes.`,
      reflection_questions: [
        'After failure, do you tend toward condemnation or grace? Why?',
        'How does knowing there\'s "no condemnation" change how you respond to your sin?',
        'What does it look like practically to get back up after falling?'
      ],
      prayer_focus: 'Father, thank You that my failures don\'t define me—Your grace does. When I fall, help me rise. When condemnation screams, let Your grace speak louder. I receive Your forgiveness and choose to keep fighting. Amen.'
    },
    {
      day_number: 11,
      title: 'Replacing, Not Just Removing',
      scripture_refs: [
        { book: 'Matthew', chapter: 12, verseStart: 43, verseEnd: 45 }
      ],
      content: `"When an impure spirit comes out of a person, it goes through arid places seeking rest and does not find it. Then it says, 'I will return to the house I left.' When it arrives, it finds the house unoccupied, swept clean and put in order. Then it goes and takes with it seven other spirits more wicked than itself, and they go in and live there. And the final condition of that person is worse than the first."

This parable reveals a crucial principle: empty houses get reoccupied.

It's not enough to remove sin—you must replace it. An empty space swept clean of one habit becomes a vacuum that pulls in something else. Sometimes something worse.

The man in the parable had his house cleaned, organized, put in order. But it was UNOCCUPIED. There was nothing living there. And when the enemy returned, he found the perfect vacancy.

What fills the space matters. If you stop watching pornography but don't fill your eyes with something better, they'll wander back. If you stop gossiping but don't fill your words with encouragement, criticism will return. If you stop scrolling but don't fill your time with purpose, distraction will creep back.

Replace lies with truth. Replace lust with love. Replace anxiety with worship. Replace criticism with gratitude. Replace sinful habits with spiritual disciplines.

Don't just stop the bad. Start something good.`,
      reflection_questions: [
        'What have you tried to remove without replacing? Did the old habit return?',
        'What positive pursuit could fill the space left by the sin you\'re fighting?',
        'How can spiritual disciplines (prayer, Scripture, worship, service) fill the vacuum?'
      ],
      prayer_focus: 'Lord, I don\'t want an empty house. Show me what should occupy the spaces where sin used to live. Fill me with Your Spirit, Your Word, Your purposes. Let there be no vacancy for the enemy to exploit. Amen.'
    },
    {
      day_number: 12,
      title: 'The Long Obedience',
      scripture_refs: [
        { book: 'Hebrews', chapter: 12, verseStart: 1, verseEnd: 3 }
      ],
      content: `"Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us, fixing our eyes on Jesus, the pioneer and perfecter of faith. For the joy set before him he endured the cross, scorning its shame, and sat down at the right hand of the throne of God. Consider him who endured such opposition from sinners, so that you will not grow weary and lose heart."

Victory over temptation isn't a sprint—it's a marathon. It requires what one author called "a long obedience in the same direction."

"Throw off everything that hinders"—some things aren't sin themselves but they slow you down. Legitimate activities can become hindrances. Not every opportunity is meant to be taken.

"The sin that so easily entangles"—you know what this is for you. The recurring temptation that trips you up every time. Name it. Deal with it. Don't pretend it's not there.

"Run with perseverance"—this will take time. There will be moments you want to quit. You'll get tired. You'll wonder if it's worth it. Persevere anyway.

"Fixing our eyes on Jesus"—here's the secret. Don't fix your eyes on the temptation you're avoiding or the sin you're fighting. Fix them on Jesus. He endured more than you ever will, and He sits now at God's right hand. Victory is possible because He achieved it first.

Don't grow weary. Don't lose heart. Keep running.`,
      reflection_questions: [
        'What hinders your spiritual race that you need to throw off—even if it\'s not sin itself?',
        'What is "the sin that so easily entangles" you? Have you honestly named it?',
        'How can you fix your eyes on Jesus when temptation demands your attention?'
      ],
      prayer_focus: 'Jesus, You endured the cross and are now victorious. Help me run this race with endurance. When I want to quit, remind me of what You endured. Help me throw off every hindrance and fix my eyes on You alone. Amen.'
    },
    {
      day_number: 13,
      title: 'Walking in the Spirit',
      scripture_refs: [
        { book: 'Galatians', chapter: 5, verseStart: 16, verseEnd: 18 }
      ],
      content: `"So I say, walk by the Spirit, and you will not gratify the desires of the flesh. For the flesh desires what is contrary to the Spirit, and the Spirit what is contrary to the flesh. They are in conflict with each other, so that you are not to do whatever you want. But if you are led by the Spirit, you are not under the law."

Here is the secret to victory: walking by the Spirit.

Notice Paul doesn't say "try really hard not to gratify the flesh." He says "walk by the Spirit, and you WILL NOT gratify the desires of the flesh." The focus isn't on avoiding sin but on following the Spirit. The result of walking in the Spirit is not gratifying the flesh.

There's a war inside you—flesh versus Spirit. They're in constant conflict. You can't satisfy both. You can't walk in both directions at once.

Many believers try to defeat the flesh through willpower, rules, accountability, and sheer determination. These have their place, but they're not the primary strategy. The primary strategy is walking in the Spirit.

What does this look like practically? Staying in communion with God throughout the day. Being sensitive to His promptings. Yielding to His leading. Choosing His agenda over yours. Responding to conviction quickly.

When you're walking in the Spirit—filled, led, empowered by Him—the flesh loses its grip. Not because you're fighting harder, but because you're following better.`,
      reflection_questions: [
        'Have you been trying to defeat the flesh through willpower instead of the Spirit? How\'s that working?',
        'What would "walking by the Spirit" look like in your daily routine?',
        'When do you most sense the Spirit\'s leading, and when do you most ignore it?'
      ],
      prayer_focus: 'Holy Spirit, I cannot defeat the flesh in my own strength. Teach me to walk in You—to be led, filled, and empowered by You. Take control of my steps. May Your presence be my victory. Amen.'
    },
    {
      day_number: 14,
      title: 'More Than Conquerors',
      scripture_refs: [
        { book: 'Romans', chapter: 8, verseStart: 37, verseEnd: 39 }
      ],
      content: `"No, in all these things we are more than conquerors through him who loved us. For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord."

As we conclude this journey, hold onto this truth: You are MORE than a conqueror.

Not barely surviving. Not just getting by. Not hoping maybe you'll make it. MORE than a conqueror. Through Him who loved you.

You're not fighting FOR victory—you're fighting FROM victory. Jesus has already won. Every temptation you face, He faced and conquered. Every sin that entangles, He defeated at the cross. Every accusation the enemy throws, Jesus silenced with His blood.

And NOTHING can separate you from His love. Not your past failures. Not your present struggles. Not your future falls. Not demons. Not your own flesh. NOTHING.

This doesn't mean the battle is over or that you can coast. But it means the outcome is secure. You fight from a position of victory, not toward it.

The same God who saved you will sanctify you. The same grace that found you will keep you. The same power that raised Christ from the dead is at work in you.

You are more than a conqueror. Now live like it.`,
      reflection_questions: [
        'What does it mean to fight FROM victory rather than FOR victory?',
        'How does knowing nothing can separate you from God\'s love change how you view your struggles?',
        'What commitment will you make going forward in your battle against temptation?'
      ],
      prayer_focus: 'Father, thank You that I am more than a conqueror through Christ. Thank You that nothing can separate me from Your love. I am Yours, and You are mine. Help me live in the victory Jesus has already won. For Your glory, Amen.'
    }
  ]
};

// =====================================================
// OVERCOMING FEAR - 7 Day Series
// =====================================================
const OVERCOMING_FEAR = {
  series: {
    slug: 'overcoming-fear',
    title: 'Overcoming Fear and Anxiety',
    description: 'A 7-day journey to conquer fear through faith. Discover God\'s perfect love that casts out all fear.',
    total_days: 7,
    topics: ['fear', 'anxiety', 'courage', 'faith', 'trust'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'Fear Not - God Is With You',
      scripture_refs: [
        { book: 'Isaiah', chapter: 41, verseStart: 10, verseEnd: 10 }
      ],
      content: `"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."

"Fear not" appears over 365 times in Scripture—one for every day of the year. God knows our tendency toward fear, and He meets us there with the same message: Do not be afraid.

But God doesn't just command us not to fear—He gives us the reason: "For I am with you." Fear often comes from feeling alone, abandoned, or vulnerable. But you are never alone. The Creator of the universe has promised His presence.

Three promises follow:
- "I will strengthen you" — When you feel weak
- "I will help you" — When you feel overwhelmed
- "I will uphold you" — When you feel like falling

His "righteous right hand" speaks of power, authority, and covenant faithfulness. The same hand that flung stars into space holds you secure.

What fear is gripping you today? Bring it to the One who promises to be with you, strengthen you, help you, and hold you up.`,
      reflection_questions: [
        'What specific fear has been dominating your thoughts lately?',
        'How does knowing God is WITH you change how you face that fear?',
        'Which of God\'s three promises (strengthen, help, uphold) do you most need today?'
      ],
      prayer_focus: 'Lord, I confess my fears to You. Thank You for promising to be with me, strengthen me, help me, and uphold me. When fear rises, help me remember Your presence and power. I choose to trust You. Amen.'
    },
    {
      day_number: 2,
      title: 'Perfect Love Casts Out Fear',
      scripture_refs: [
        { book: '1 John', chapter: 4, verseStart: 18, verseEnd: 18 }
      ],
      content: `"There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love."

Fear and love cannot coexist in the same space. Where perfect love resides, fear is driven out—expelled, cast away, evicted.

Many of our fears ultimately connect to punishment—fear of rejection (relational punishment), fear of failure (consequential punishment), fear of God's displeasure (spiritual punishment). But when we truly grasp that we are perfectly loved by God, these fears lose their grip.

"The one who fears is not made perfect in love." This isn't condemnation—it's diagnosis. If fear still dominates, it's a sign that God's love hasn't fully penetrated that area of your heart. The solution isn't to try harder not to fear. The solution is to receive more deeply the love that casts fear out.

You are not working toward God's love—you are living FROM it. You are not earning acceptance—you already have it. You are not avoiding punishment—Christ took it all.

Let His love flood the fearful places in your heart.`,
      reflection_questions: [
        'What fears in your life might be connected to fear of punishment or rejection?',
        'How has your understanding of God\'s love been incomplete or conditional?',
        'What would it look like to let God\'s love flood your most fearful places?'
      ],
      prayer_focus: 'Father, I want to know Your perfect love more deeply. Show me where fear has taken root because I haven\'t fully received Your love. Drive out my fear with Your presence. Perfect Your love in me. Amen.'
    },
    {
      day_number: 3,
      title: 'God Has Not Given Us a Spirit of Fear',
      scripture_refs: [
        { book: '2 Timothy', chapter: 1, verseStart: 7, verseEnd: 7 }
      ],
      content: `"For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline."

When fear grips you, here's a crucial question: Where is this coming from? Because it's not from God.

The Holy Spirit produces many things in believers—love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control. But fear? Timidity? That's not on the list.

If fear isn't from God's Spirit, where does it come from? Sometimes from our flesh, our fallen human nature prone to anxiety. Sometimes from the enemy, who uses fear as a weapon. Sometimes from circumstances that seem overwhelming.

But God has given you something different:
- POWER — The ability to face what seems impossible
- LOVE — Connection that overcomes isolation and vulnerability
- SELF-DISCIPLINE — A sound mind that can think clearly despite emotions

When fear screams, remember: this is not from God. Then actively receive what IS from Him—power to stand, love to secure you, and a sound mind to guide you.

You are not a helpless victim of your fears. You have the Spirit of the living God.`,
      reflection_questions: [
        'When fear arises, do you tend to accept it as normal or recognize it as not from God?',
        'Which do you most need right now: power, love, or a sound mind?',
        'How can you actively receive what God\'s Spirit offers when fear attacks?'
      ],
      prayer_focus: 'Holy Spirit, thank You that You don\'t give me fear. When timidity comes, remind me it\'s not from You. Fill me with Your power, Your love, and a sound mind. Help me walk in what You\'ve given me. Amen.'
    },
    {
      day_number: 4,
      title: 'When I Am Afraid, I Will Trust',
      scripture_refs: [
        { book: 'Psalm', chapter: 56, verseStart: 3, verseEnd: 4 }
      ],
      content: `"When I am afraid, I put my trust in you. In God, whose word I praise—in God I trust and am not afraid. What can mere mortals do to me?"

Notice David doesn't say "I never feel fear." He says "WHEN I am afraid." This is honest. Even the man after God's own heart experienced fear. You will too.

The question isn't whether fear will come—it's what you'll do when it does. David's answer: "I put my trust in you."

Trust is a choice, not a feeling. When fear shouts, trust whispers. When emotions overwhelm, trust anchors. You choose to trust even when everything in you wants to panic.

"In God, whose word I praise." David connects trust to God's Word. When fear attacks, he returns to what God has said. Truth counters feelings. Scripture grounds us when emotions would carry us away.

"What can mere mortals do to me?" This isn't naive. David had real enemies who wanted him dead. But he had perspective. Humans can harm the body, but they can't touch the soul. They can affect circumstances, but they can't separate us from God's love.

When fear comes, choose trust. Speak truth. Gain perspective.`,
      reflection_questions: [
        'What triggers fear in you most consistently?',
        'How can you practice choosing trust even when you feel afraid?',
        'What Scripture could you memorize to speak when fear attacks?'
      ],
      prayer_focus: 'Lord, I admit I am afraid sometimes. But in those moments, I choose to trust You. When fear rises, bring Your Word to my mind. Help me gain Your perspective on my circumstances. You are greater than anything I face. Amen.'
    },
    {
      day_number: 5,
      title: 'Do Not Be Anxious',
      scripture_refs: [
        { book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 }
      ],
      content: `"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."

"Do not be anxious about ANYTHING." That's comprehensive. Not "don't be anxious about big things" or "try to limit your anxiety." Anything.

But how? The answer isn't "try harder" or "just stop worrying." It's a replacement strategy:

PRAY about everything. What you're tempted to worry about, pray about instead. Worry is talking to yourself about your problems. Prayer is talking to God about them.

PETITION with specifics. God invites detailed requests. He wants to hear exactly what concerns you.

THANKSGIVING changes everything. Gratitude shifts focus from what might go wrong to what God has already done right. It's impossible to be anxious and genuinely thankful at the same time.

The result? "Peace of God" standing guard over your heart and mind. Not peace from understanding your circumstances—peace that transcends understanding. You can have peace without having answers.

What are you anxious about right now? Stop. Pray. Give thanks. Let peace come.`,
      reflection_questions: [
        'What are you tempted to worry about that you should pray about instead?',
        'How might adding thanksgiving change your prayers and your perspective?',
        'Have you ever experienced peace that didn\'t make logical sense? What was that like?'
      ],
      prayer_focus: 'Father, I bring my anxieties to You right now: [name them]. I thank You for [name blessings]. I ask for Your peace—the kind that doesn\'t require understanding. Guard my heart and mind. Amen.'
    },
    {
      day_number: 6,
      title: 'Fear of Man vs. Fear of the Lord',
      scripture_refs: [
        { book: 'Proverbs', chapter: 29, verseStart: 25, verseEnd: 25 },
        { book: 'Psalm', chapter: 118, verseStart: 6, verseEnd: 6 }
      ],
      content: `"Fear of man will prove to be a snare, but whoever trusts in the LORD is kept safe."

"The LORD is with me; I will not be afraid. What can mere mortals do to me?"

Fear of man is one of the most common—and most enslaving—forms of fear. It shapes decisions, compromises convictions, and keeps us trapped in people-pleasing.

What do they think of me? Will they approve? What if I disappoint them? What if they reject me?

This fear is a SNARE—a trap that captures and holds you. It makes you say yes when you should say no. It silences truth that needs to be spoken. It makes other people's opinions your master.

But whoever trusts in the LORD is kept safe. Safety comes from pleasing the right audience. When you fear God properly—revering Him, honoring Him, seeking His approval above all—human opinions lose their power.

The Psalmist asks the liberating question: "What can mere mortals do to me?" They can reject you, but God accepts you. They can criticize, but God approves you in Christ. They can abandon, but God never will.

Whose opinion matters most to you? Choose your audience wisely.`,
      reflection_questions: [
        'Whose opinion do you fear most? Why do they have that power over you?',
        'How has fear of man been a snare in your life—limiting you or compromising you?',
        'What would change if God\'s opinion was the only one that truly mattered?'
      ],
      prayer_focus: 'Lord, I confess I\'ve been enslaved to others\' opinions. I\'ve let fear of people determine my choices. Free me from this snare. Help me live for an audience of One. Your approval is enough. Amen.'
    },
    {
      day_number: 7,
      title: 'Courage to Live Unafraid',
      scripture_refs: [
        { book: 'Joshua', chapter: 1, verseStart: 9, verseEnd: 9 }
      ],
      content: `"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."

As we conclude this journey, hear God's command—not suggestion, COMMAND—to Joshua and to you: Be strong and courageous.

Courage isn't the absence of fear. It's moving forward despite fear. It's trusting God more than you trust your feelings. It's stepping into the unknown because you know WHO goes with you.

"Do not be afraid; do not be discouraged." These two often travel together. Fear about the future and discouragement about the present. But both are countered by the same truth: "The LORD your God will be with you WHEREVER you go."

Not just in safe places. Not only in familiar territory. WHEREVER. Into the new job. Through the diagnosis. Across the difficult conversation. Past the painful memory. Wherever life takes you, He goes with you.

You've spent these seven days learning truth about fear. Now it's time to live it. Not perfectly—but faithfully. When fear rises, speak truth. When anxiety whispers, pray. When courage fails, remember: He is with you.

Go forward. Unafraid.`,
      reflection_questions: [
        'What step of courage is God asking you to take?',
        'How has your understanding of fear changed over these seven days?',
        'What truth will you hold onto when fear tries to return?'
      ],
      prayer_focus: 'Lord, I receive Your command to be strong and courageous. I will not be afraid or discouraged because You are with me wherever I go. Help me live in this truth daily. I step forward in faith. Amen.'
    }
  ]
};

// =====================================================
// HEARING GOD'S VOICE (BEGINNER) - 7 Day Series
// =====================================================
const HEARING_GODS_VOICE_BEGINNER = {
  series: {
    slug: 'hearing-gods-voice-beginner',
    title: 'Hearing God\'s Voice',
    description: 'Learn the basics of discerning God\'s voice in 7 days. Discover how God speaks through Scripture, prayer, and daily life.',
    total_days: 7,
    topics: ['hearing_god', 'discernment', 'guidance', 'prayer', 'listening'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'God Still Speaks',
      scripture_refs: [
        { book: 'John', chapter: 10, verseStart: 27, verseEnd: 27 }
      ],
      content: `"My sheep listen to my voice; I know them, and they follow me."

The most foundational truth about hearing God: He speaks, and His sheep can hear Him.

This isn't reserved for super-spiritual people, pastors, or those with special gifts. If you belong to Jesus, you are His sheep. And His sheep hear His voice.

Notice the simplicity: sheep listen, Jesus speaks, they follow. It's relational, not complicated. A sheep doesn't need a theology degree to recognize its shepherd's voice—it needs familiarity. Time spent together. Relationship.

"I know them" — Jesus knows you intimately. He knows your struggles, your questions, your deepest needs. He's not a distant deity shouting from heaven; He's a shepherd who knows His sheep by name.

"They follow me" — Hearing leads to following. God doesn't speak just to inform us but to guide us. When we hear, we're called to respond.

The question isn't whether God speaks—it's whether we're listening. This week, we'll learn to recognize His voice. But first, believe this: He wants to speak to you. He already is.

Are you listening?`,
      reflection_questions: [
        'Do you believe God wants to speak to you personally? Why or why not?',
        'What might be keeping you from hearing God\'s voice?',
        'When in your life have you sensed God speaking to you?'
      ],
      prayer_focus: 'Good Shepherd, thank You that You speak and Your sheep hear. I am Yours, and I want to hear Your voice. Open my ears this week. Teach me to recognize You. Help me follow where You lead. Amen.'
    },
    {
      day_number: 2,
      title: 'God Speaks Through Scripture',
      scripture_refs: [
        { book: '2 Timothy', chapter: 3, verseStart: 16, verseEnd: 17 }
      ],
      content: `"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work."

The primary way God speaks is through His Word. Scripture is "God-breathed"—it carries His voice, His heart, His truth.

If you want to hear God, start here. Not because the Bible is a magic book, but because it IS God speaking. When you read Scripture, you're not just reading about God—you're hearing from Him.

The Bible is useful for:
- TEACHING — Showing you truth
- REBUKING — Correcting wrong beliefs or behavior
- CORRECTING — Getting you back on track
- TRAINING — Developing godly character

The goal? That you would be "thoroughly equipped." God's Word prepares you for everything He's called you to do.

Practically, this means: Read your Bible. Not as a religious duty, but as a conversation with God. Ask: "What are You saying to me today?" Read slowly. Read prayerfully. Read expectantly.

Many people want God to speak dramatically while ignoring the Bible on their nightstand. But He's already spoken 66 books worth. Start there.`,
      reflection_questions: [
        'How consistently are you reading Scripture? Is it a duty or a conversation?',
        'When was the last time a Bible passage felt like God speaking directly to you?',
        'How might you read Scripture differently, expecting to hear God?'
      ],
      prayer_focus: 'Lord, thank You for Your Word. Help me approach Scripture not as a task but as a conversation. Speak to me through what I read. Make it come alive. Let me hear Your voice in the pages. Amen.'
    },
    {
      day_number: 3,
      title: 'God Speaks Through Prayer',
      scripture_refs: [
        { book: 'Jeremiah', chapter: 33, verseStart: 3, verseEnd: 3 }
      ],
      content: `"Call to me and I will answer you and tell you great and unsearchable things you do not know."

Prayer is a conversation, not a monologue. God invites us to call to Him—and He promises to answer.

Many people treat prayer like leaving a voicemail: talk, talk, talk, then hang up. But what if you stayed on the line? What if you asked a question and then actually waited for a response?

"I will answer you" — This is a promise. God doesn't ignore His children. When you call, He responds.

"Tell you great and unsearchable things" — God has things to reveal that you couldn't discover on your own. Insight, wisdom, direction, encouragement—He wants to share these with you.

Practically, this means building silence into your prayer time. After you've spoken, be quiet. Ask questions and wait. "Lord, what do You want to say to me?" Then listen.

God's voice in prayer often comes as an impression, a thought, a Scripture that comes to mind, a sense of peace or conviction. It's usually quieter than we expect—not an audible voice, but an inner knowing.

Are you making space to listen?`,
      reflection_questions: [
        'In your prayer time, how much do you talk versus listen?',
        'Have you ever sensed God responding during prayer? What was that like?',
        'How could you create more space for listening in your prayer life?'
      ],
      prayer_focus: 'Father, I\'m calling to You. But today I also want to listen. [Pause and be silent for 2 minutes.] Speak, Lord. Tell me things I need to know. I\'m listening. Amen.'
    },
    {
      day_number: 4,
      title: 'The Still Small Voice',
      scripture_refs: [
        { book: '1 Kings', chapter: 19, verseStart: 11, verseEnd: 13 }
      ],
      content: `"The LORD said, 'Go out and stand on the mountain in the presence of the LORD, for the LORD is about to pass by.' Then a great and powerful wind tore the mountains apart... but the LORD was not in the wind. After the wind there was an earthquake, but the LORD was not in the earthquake. After the earthquake came a fire, but the LORD was not in the fire. And after the fire came a gentle whisper."

Elijah was looking for God in the spectacular—the wind, earthquake, fire. But God came in a gentle whisper. A still, small voice.

This is how God often speaks. Not in dramatic, unmistakable ways, but in the quiet. That's why we miss Him so often—we're looking for the earthquake while He's whispering.

Our lives are loud. Phones buzzing, notifications dinging, media streaming, thoughts racing. In all that noise, the gentle whisper gets drowned out.

Hearing God requires cultivating quiet. Not just external silence (though that helps), but internal stillness. Calming the anxious thoughts. Setting aside the endless to-do list. Being present with God.

Elijah had to go out to the mountain and wait. He had to let the wind, earthquake, and fire pass. Only then did he hear the whisper.

What would it take for you to create that kind of space?`,
      reflection_questions: [
        'Is your life too loud to hear a whisper? What creates the most noise?',
        'Have you been looking for God in the earthquake while He\'s been whispering?',
        'What practical steps could you take to create more quiet in your life?'
      ],
      prayer_focus: 'Lord, I confess my life is noisy. Help me cultivate quiet—external and internal. I want to hear Your whisper. Give me patience to wait and ears to hear the still, small voice. Amen.'
    },
    {
      day_number: 5,
      title: 'God Speaks Through Others',
      scripture_refs: [
        { book: 'Proverbs', chapter: 11, verseStart: 14, verseEnd: 14 },
        { book: 'Proverbs', chapter: 15, verseStart: 22, verseEnd: 22 }
      ],
      content: `"For lack of guidance a nation falls, but victory is won through many advisers."

"Plans fail for lack of counsel, but with many advisers they succeed."

God often speaks through other people. This doesn't replace hearing from Him directly, but it's one of His primary methods.

Godly friends, mentors, pastors, small group members—these are channels through which God's wisdom flows. They can see blind spots we miss. They can confirm what we're sensing. They can challenge us when we're off track.

This is why community matters. The lone-ranger Christian is vulnerable to deception. "Many advisers" bring safety, wisdom, and balance.

When seeking guidance:
- Ask godly people who know you well
- Look for patterns—is God saying similar things through multiple people?
- Weigh their counsel against Scripture
- Remember they're human—confirm what resonates with God's Word and Spirit

Of course, not all advice is from God. Evaluate it. Test it. But don't dismiss this vital channel of His voice.

Who are your "many advisers"? Are you in relationship close enough to receive counsel?`,
      reflection_questions: [
        'Do you have godly people in your life who can speak truth to you?',
        'When was the last time God used someone else to guide or correct you?',
        'Are you resistant to counsel, or do you welcome it?'
      ],
      prayer_focus: 'Lord, thank You for the gift of community. Give me humble ears to receive counsel from others. Bring wise people into my life. Help me discern Your voice through them. Protect me from pride that refuses input. Amen.'
    },
    {
      day_number: 6,
      title: 'Testing What You Hear',
      scripture_refs: [
        { book: '1 John', chapter: 4, verseStart: 1, verseEnd: 1 },
        { book: '1 Thessalonians', chapter: 5, verseStart: 19, verseEnd: 21 }
      ],
      content: `"Dear friends, do not believe every spirit, but test the spirits to see whether they are from God."

"Do not quench the Spirit. Do not treat prophecies with contempt but test them all; hold on to what is good."

Not every thought, impression, or message is from God. We have our own desires, the influence of culture, and an enemy who disguises himself as an angel of light. That's why testing is essential.

How do you test what you're hearing?

1. DOES IT ALIGN WITH SCRIPTURE? God never contradicts His Word. If what you're sensing goes against clear biblical teaching, it's not from Him.

2. DOES IT PRODUCE PEACE OR ANXIETY? God's voice brings peace, even when challenging. The enemy's voice brings fear, condemnation, and confusion.

3. DOES IT LEAD TOWARD HOLINESS? God's guidance always moves us toward Christlikeness, not away from it.

4. WHAT DO WISE BELIEVERS SAY? Share what you're sensing with mature Christians. Do they confirm it or have concerns?

5. IS THERE CONFIRMATION? God often confirms His word through multiple sources—Scripture, circumstances, counsel, inner witness.

Don't be gullible. Don't be cynical. Test everything, but don't quench the Spirit in the process.`,
      reflection_questions: [
        'Have you ever followed a prompting that wasn\'t actually from God? How did you know?',
        'Which testing criteria do you use most? Which do you neglect?',
        'How can you balance openness to God\'s voice with discernment?'
      ],
      prayer_focus: 'Father, give me discernment. Help me test what I hear without becoming cynical. May I hold fast to what is good and reject what isn\'t from You. Protect me from deception. Amen.'
    },
    {
      day_number: 7,
      title: 'Responding When God Speaks',
      scripture_refs: [
        { book: 'James', chapter: 1, verseStart: 22, verseEnd: 25 }
      ],
      content: `"Do not merely listen to the word, and so deceive yourselves. Do what it says. Anyone who listens to the word but does not do what it says is like someone who looks at his face in a mirror and, after looking at himself, goes away and immediately forgets what he looks like."

Hearing God's voice is not the end goal—obedience is. We can become very good at "hearing" while remaining unchanged. James calls this self-deception.

It's like looking in a mirror, seeing dirt on your face, and walking away without washing. What was the point of looking?

When God speaks, He expects response. Not perfection, but movement. Not complete understanding, but faithful steps.

The blessing comes in the doing: "Whoever looks intently into the perfect law that gives freedom, and continues in it—not forgetting what they have heard, but doing it—they will be blessed in what they do."

This week, you've learned how God speaks—through Scripture, prayer, His Spirit, others. But the question now is: What will you DO with what He's said?

Is there something God has been telling you that you've been avoiding? A relationship to mend? A sin to confess? A step to take? A change to make?

Don't just hear. Do.`,
      reflection_questions: [
        'What has God been speaking to you that you haven\'t acted on yet?',
        'What might be keeping you from obedience—fear, comfort, doubt?',
        'What one step of obedience will you take today in response to God\'s voice?'
      ],
      prayer_focus: 'Lord, I don\'t want to just hear—I want to obey. You\'ve spoken [name what He\'s said]. Give me courage to respond. I will not just look in the mirror and walk away unchanged. Help me do what You say. Amen.'
    }
  ]
};

// =====================================================
// TRUSTING GOD WITH FINANCES - 10 Day Series
// =====================================================
const TRUSTING_GOD_FINANCES = {
  series: {
    slug: 'trusting-god-finances',
    title: 'Trusting God with Finances',
    description: 'A 10-day study on biblical stewardship. Learn to honor God with your resources and trust Him as your provider.',
    total_days: 10,
    topics: ['finances', 'stewardship', 'trust', 'generosity', 'provision'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'Everything Belongs to God',
      scripture_refs: [
        { book: 'Psalm', chapter: 24, verseStart: 1, verseEnd: 2 }
      ],
      content: `"The earth is the LORD's, and everything in it, the world, and all who live in it; for he founded it on the seas and established it on the waters."

The foundation of biblical finance starts here: It all belongs to God. Every dollar, every asset, every resource you have—it's His.

This isn't bad news; it's liberating news. If it's all His, then you're not the owner but the manager. The pressure to provide, protect, and accumulate shifts from your shoulders to His. You're a steward, not a source.

Think about what this means:
- The money in your account? His.
- Your home, car, possessions? His.
- Your income potential and career? His.
- Even you? You belong to Him.

This changes everything about how we relate to money. We're not spending OUR money—we're managing HIS resources. We're not just making financial decisions—we're stewarding on behalf of the true Owner.

The question shifts from "What do I want to do with my money?" to "What does God want done with His money that's entrusted to me?"

This week, we'll explore what faithful stewardship looks like. But it all starts here: He owns it all.`,
      reflection_questions: [
        'Do you truly believe everything you have belongs to God? How does that belief show?',
        'How would your financial decisions change if you consistently remembered you\'re a manager, not an owner?',
        'What possessions or resources do you hold onto as if they\'re yours?'
      ],
      prayer_focus: 'Lord, I acknowledge that everything I have is Yours. My money, my possessions, my future—all Yours. Help me steward well what You\'ve entrusted to me. Shift my mindset from owner to manager. Amen.'
    },
    {
      day_number: 2,
      title: 'God Is Your Provider',
      scripture_refs: [
        { book: 'Philippians', chapter: 4, verseStart: 19, verseEnd: 19 }
      ],
      content: `"And my God will meet all your needs according to the riches of his glory in Christ Jesus."

God is your provider. Not your job. Not your savings. Not the economy. GOD.

This doesn't mean work doesn't matter or planning is unnecessary. But it means the ultimate source behind every provision is God Himself. Jobs can be lost. Savings can deplete. Economies can crash. But God remains the unchanging provider.

Notice the promise: "ALL your needs." Not some, not most—all. And not according to your resources, but "according to the riches of his glory." His supply isn't limited by your situation. It flows from His unlimited abundance.

"In Christ Jesus" reminds us that this promise is for those in relationship with Him. It's a family promise, from Father to child.

Does this mean you'll always have everything you want? No. But you'll have everything you need. God knows the difference even when we don't. He's committed to your provision, even when the path doesn't look like you expected.

Can you trust Him? He's never failed to provide for His children.`,
      reflection_questions: [
        'What do you actually look to as your provider—God, or something else?',
        'When has God provided for you in unexpected ways?',
        'Is there a financial need right now you\'re struggling to trust God with?'
      ],
      prayer_focus: 'Father, You are my provider. I confess I\'ve looked to other sources for security. Help me trust that You will meet all my needs according to Your glorious riches. I choose to depend on You. Amen.'
    },
    {
      day_number: 3,
      title: 'The Danger of Loving Money',
      scripture_refs: [
        { book: '1 Timothy', chapter: 6, verseStart: 9, verseEnd: 10 }
      ],
      content: `"Those who want to get rich fall into temptation and a trap and into many foolish and harmful desires that plunge people into ruin and destruction. For the love of money is a root of all kinds of evil. Some people, eager for money, have wandered from the faith and pierced themselves with many griefs."

Money itself isn't evil—but the LOVE of money is dangerous. It's not about how much you have; it's about how much it has you.

The warning is severe: wanting to get rich leads to temptation, traps, harmful desires, ruin, and destruction. Strong words. The pursuit of wealth can consume people, compromising integrity, destroying relationships, and ultimately leaving them empty.

"Some have wandered from the faith"—money can lead you away from God. When wealth becomes the goal, Jesus becomes an obstacle. When security is found in accounts rather than in Christ, faith erodes.

"Pierced themselves with many griefs"—the irony is painful. We pursue money hoping for joy and security, but the love of it brings grief.

This doesn't mean wealth is automatically wrong or that wanting financial stability is sinful. But it's a warning: watch your heart. Is money a tool or a god? Are you pursuing God's kingdom or building your own? Are you content or always craving more?`,
      reflection_questions: [
        'Be honest: Do you love money? How can you tell?',
        'Has the pursuit of money ever led you toward temptation or compromise?',
        'How can you guard your heart against letting money become a master?'
      ],
      prayer_focus: 'Lord, search my heart. Expose any love of money that has taken root. I want You to be my treasure, not wealth. Protect me from the traps that come with pursuing riches. Keep me close to You. Amen.'
    },
    {
      day_number: 4,
      title: 'Contentment Is Great Gain',
      scripture_refs: [
        { book: '1 Timothy', chapter: 6, verseStart: 6, verseEnd: 8 }
      ],
      content: `"But godliness with contentment is great gain. For we brought nothing into the world, and we can take nothing out of it. But if we have food and clothing, we will be content with that."

The world says gain comes from getting more. Scripture says great gain comes from contentment with what you have plus godliness in how you live.

Think about it: No matter how much you accumulate, you can't take it with you. You entered the world naked and you'll leave the same way. So what's the point of hoarding what you'll inevitably leave behind?

"If we have food and clothing, we will be content." That's a shockingly simple standard. In our culture of constant upgrading, this feels almost impossible. We're trained to want more, better, newer.

But contentment isn't resignation—it's freedom. It's being released from the endless treadmill of wanting. It's finding your satisfaction in God rather than in stuff.

This doesn't mean you can't have nice things or improve your situation. But it means your joy isn't dependent on having more. You can be genuinely content whether you have little or much, because your security is in Christ.

Are you content? Really?`,
      reflection_questions: [
        'What would true contentment look like in your current financial situation?',
        'What feeds your discontentment—advertising, comparison, social media?',
        'How would contentment change your financial decisions?'
      ],
      prayer_focus: 'Father, teach me contentment. I confess I always want more. But godliness with contentment is great gain. Help me find my satisfaction in You, not in acquiring more. Free me from the tyranny of wanting. Amen.'
    },
    {
      day_number: 5,
      title: 'Store Up Treasures in Heaven',
      scripture_refs: [
        { book: 'Matthew', chapter: 6, verseStart: 19, verseEnd: 21 }
      ],
      content: `"Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal. But store up for yourselves treasures in heaven, where moths and vermin do not destroy, and where thieves do not break in and steal. For where your treasure is, there your heart will be also."

Jesus contrasts two types of investments: earthly and heavenly. One is temporary and vulnerable; the other is eternal and secure.

Earthly treasures deteriorate. Markets crash. Possessions wear out. Thieves steal. No matter how carefully you protect your wealth, it's always at risk. It's building on sand.

Heavenly treasures last forever. When you invest in God's kingdom—through generosity, serving others, supporting the spread of the gospel, caring for the poor—you're depositing into an account that can never be touched by moths, rust, or thieves.

"Where your treasure is, there your heart will be." This is profound. Your heart follows your treasure. If you want to grow your heart for God's kingdom, start investing in it. If you want to care less about earthly things, stop storing up there.

What we do with our money reveals what we truly value. And it shapes what we'll continue to value. Invest wisely.`,
      reflection_questions: [
        'Honestly, where is most of your treasure currently stored—earth or heaven?',
        'How does your spending reflect your values?',
        'What would it look like to invest more in heavenly treasures?'
      ],
      prayer_focus: 'Jesus, I want my treasure in heaven, not on earth. Show me how to invest in Your kingdom. Redirect my heart toward eternal things. Help me hold earthly possessions loosely and kingdom priorities tightly. Amen.'
    },
    {
      day_number: 6,
      title: 'The Heart of Generosity',
      scripture_refs: [
        { book: '2 Corinthians', chapter: 9, verseStart: 6, verseEnd: 7 }
      ],
      content: `"Remember this: Whoever sows sparingly will also reap sparingly, and whoever sows generously will also reap generously. Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."

Generosity is central to faithful stewardship. Not because God needs our money, but because giving transforms our hearts.

There's a principle of sowing and reaping: sparse sowing yields sparse harvest; generous sowing yields generous harvest. This isn't a prosperity gospel guarantee, but a spiritual principle. Generosity opens channels of blessing—not always financial, but certainly in peace, joy, and spiritual growth.

Notice how giving should happen:
- "What you have decided in your heart"—thoughtful, intentional, not haphazard
- "Not reluctantly"—not dragging your feet, begrudging the gift
- "Not under compulsion"—not from guilt, pressure, or manipulation
- "Cheerfully"—with JOY

God loves cheerful givers. He's not impressed by large gifts given grudgingly. He's delighted by gifts—of any size—given joyfully.

This kind of giving only happens when we truly believe God is our provider and money isn't our security. Then releasing it becomes a joy, not a loss.`,
      reflection_questions: [
        'How would you describe your giving—cheerful, reluctant, or inconsistent?',
        'What holds you back from greater generosity?',
        'How might your giving become more joyful?'
      ],
      prayer_focus: 'Father, cultivate generosity in my heart. I want to give cheerfully, not reluctantly. Increase my faith to release resources joyfully. May my giving reflect trust in You as my provider. Amen.'
    },
    {
      day_number: 7,
      title: 'Tithing and Beyond',
      scripture_refs: [
        { book: 'Malachi', chapter: 3, verseStart: 10, verseEnd: 10 },
        { book: 'Matthew', chapter: 23, verseStart: 23, verseEnd: 23 }
      ],
      content: `"Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this," says the LORD Almighty, "and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it."

The tithe—giving 10% to God—is a biblical starting point for giving. In Malachi, God actually invites Israel to TEST Him in this. It's the only place in Scripture where God says to test Him. He's that confident in His provision.

But Jesus clarified something important: tithing isn't the ultimate goal. Speaking to religious leaders who meticulously tithed but neglected justice, mercy, and faithfulness, He said they should have practiced BOTH—the tithe AND the weightier matters.

The tithe isn't meant to be a ceiling (gave my 10%, done!), but a floor (here's where I start). For many, 10% is a faith step. For others who've grown in trust and abundance, generosity goes far beyond.

The question isn't really about percentage—it's about priority. Is God first in your finances? Does your giving reflect that He is your Lord, not just your Savior?

Tithing is a trust exercise. It's training your heart to put God first.`,
      reflection_questions: [
        'Are you currently tithing? If not, what holds you back?',
        'Has tithing been a ceiling or a floor for your giving?',
        'What would it look like to grow in generosity beyond the tithe?'
      ],
      prayer_focus: 'Lord, I want You first in my finances. Help me trust You enough to tithe—and beyond. I take You at Your word: test You in this. I want to experience Your faithfulness. Amen.'
    },
    {
      day_number: 8,
      title: 'Avoiding Debt\'s Burden',
      scripture_refs: [
        { book: 'Proverbs', chapter: 22, verseStart: 7, verseEnd: 7 },
        { book: 'Romans', chapter: 13, verseStart: 8, verseEnd: 8 }
      ],
      content: `"The rich rule over the poor, and the borrower is slave to the lender."

"Let no debt remain outstanding, except the continuing debt to love one another."

Debt creates bondage. The borrower becomes "slave to the lender." That's not metaphorical—it's the reality of owing money. Your options narrow. Your freedom shrinks. Your future labor is already spoken for.

This doesn't mean all borrowing is sinful. Scripture doesn't prohibit debt entirely. But it warns about its dangers and urges wisdom.

Consider:
- Debt often comes from spending money we don't have on things we don't need
- Interest compounds, making us pay far more than the original cost
- Debt adds stress and strain to marriages and families
- Debt limits our ability to give generously and respond to God's leading
- Debt can presume upon the future, which isn't ours to control

"Let no debt remain outstanding" suggests urgency to pay what we owe. The only debt we should carry indefinitely is the "debt to love one another."

If you're in debt, make a plan to get out. If you're debt-free, guard that freedom carefully. Live within your means. Delay gratification. Trust God's provision rather than credit's illusion.`,
      reflection_questions: [
        'What debt are you currently carrying? How does it affect you?',
        'What spending habits have contributed to debt?',
        'What steps could you take toward financial freedom?'
      ],
      prayer_focus: 'Father, I want to be free from financial bondage. Show me any spending or habits that lead to debt. Give me wisdom and discipline to live within my means. Help me become free to serve You fully. Amen.'
    },
    {
      day_number: 9,
      title: 'Working with Excellence',
      scripture_refs: [
        { book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 24 }
      ],
      content: `"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward. It is the Lord Christ you are serving."

Work is worship. When you work with excellence, you're serving Christ, not just your employer.

This transforms how we view our jobs. It's not just about the paycheck—it's about glorifying God. It's not just about pleasing the boss—it's about serving Jesus. Every email, every meeting, every task becomes an act of devotion.

"With all your heart"—not half-hearted, not just enough to get by. Excellence. Why? Because you're representing Christ in your workplace. Your work ethic is a testimony.

This also transforms how we view income. Earnings become resources for stewardship, not just personal consumption. Good work leads to provision, which leads to opportunities for generosity.

And there's future reward: "You will receive an inheritance from the Lord." Faithful work now echoes into eternity. God sees and remembers how you served Him through your job, even when bosses didn't notice or appreciate it.

Work hard. Work well. Work as if Jesus is your boss—because He is.`,
      reflection_questions: [
        'How does viewing your work as service to Christ change your perspective?',
        'Are there areas of your work where you\'ve been half-hearted?',
        'How can you honor God more fully through your work?'
      ],
      prayer_focus: 'Lord, help me work with all my heart as serving You. Whether anyone notices or appreciates it, I want to honor You through my work. May my work ethic testify to who You are. Amen.'
    },
    {
      day_number: 10,
      title: 'Seeking First the Kingdom',
      scripture_refs: [
        { book: 'Matthew', chapter: 6, verseStart: 31, verseEnd: 33 }
      ],
      content: `"So do not worry, saying, 'What shall we eat?' or 'What shall we drink?' or 'What shall we wear?' For the pagans run after all these things, and your heavenly Father knows that you need them. But seek first his kingdom and his righteousness, and all these things will be given to you as well."

As we conclude this journey, here's the key: seek FIRST God's kingdom.

The world runs after provision—food, drink, clothing, security. It's the natural human obsession. What will I eat? What will I wear? How will I survive?

But Jesus says don't worry about these things. Not because they don't matter, but because your Father knows you need them and He's committed to providing.

Instead, make God's kingdom your primary pursuit. His rule, His righteousness, His purposes—put these first. And "all these things" will be added.

This is the paradox of kingdom economics: prioritize the eternal and the temporal is handled. Seek God first and provision follows. But chase provision while neglecting God and you'll find neither lasting wealth nor lasting peace.

This isn't a formula for guaranteed prosperity. It's a promise of God's faithful care. He may not provide the way you expect, but He will provide what you need.

What does it look like to seek first God's kingdom in your finances? Generosity. Contentment. Trust. Excellence. Stewardship. Living as a manager of His resources for His purposes.

He's a good Father. Trust Him.`,
      reflection_questions: [
        'What have you been seeking first—provision or God\'s kingdom?',
        'How does worry about finances reveal misplaced priorities?',
        'What one change will you make to seek God\'s kingdom first in your finances?'
      ],
      prayer_focus: 'Father, I want to seek Your kingdom first. Forgive me for chasing provision instead of trusting You. I believe You know what I need. Help me steward well, give generously, and rest in Your faithful care. Amen.'
    }
  ]
};

// =====================================================
// GOD'S UNFAILING LOVE - 10 Day Series
// =====================================================
const GODS_UNFAILING_LOVE = {
  series: {
    slug: 'gods-unfailing-love',
    title: 'God\'s Unfailing Love',
    description: 'Experience the depths of God\'s steadfast love over 10 transformative days. Nothing can separate you from His love.',
    total_days: 10,
    topics: ['love', 'grace', 'identity', 'acceptance', 'belonging'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'Loved Before Time',
      scripture_refs: [
        { book: 'Ephesians', chapter: 1, verseStart: 4, verseEnd: 5 }
      ],
      content: `"For he chose us in him before the creation of the world to be holy and blameless in his sight. In love he predestined us for adoption to sonship through Jesus Christ, in accordance with his pleasure and will."

Before the universe existed, God loved you. Before time began, He chose you. Before you were born—before you could do anything right or wrong—you were loved.

"Before the creation of the world"—let this sink in. When there was nothing but God, He was already thinking of you. Already loving you. Already planning to adopt you into His family.

"In love he predestined us for adoption." Adoption wasn't plan B after creation went wrong. It was plan A before creation happened. God's love for you isn't a reaction to your performance; it's a decision made in eternity past.

"In accordance with his pleasure and will"—it pleased God to love you. It wasn't obligation or necessity. It brought Him joy to choose you, plan for you, and move through history to bring you into His family.

You are not an accident. Not an afterthought. Not a backup plan. You were loved before time, chosen before creation, destined for adoption from before the beginning.

That's how loved you are.`,
      reflection_questions: [
        'How does knowing God chose to love you before creation change how you see yourself?',
        'What does it mean to you that His love isn\'t based on your performance?',
        'How might you live differently if you truly believed you were chosen before time?'
      ],
      prayer_focus: 'Father, I can barely comprehend that You loved me before time began. Thank You for choosing me, not because of anything I did, but because it pleased You. Let this truth sink deep into my heart. Amen.'
    },
    {
      day_number: 2,
      title: 'The Cross Proves His Love',
      scripture_refs: [
        { book: 'Romans', chapter: 5, verseStart: 8, verseEnd: 8 }
      ],
      content: `"But God demonstrates his own love for us in this: While we were still sinners, Christ died for us."

How do you know God loves you? The cross proves it.

This isn't sentimental love or mere affection. This is love demonstrated—proven, displayed, made visible in the most costly sacrifice possible. Words can be cheap. Actions reveal truth. And the cross is God's ultimate action.

"While we were still sinners"—not after we cleaned up. Not once we proved ourselves worthy. While we were in active rebellion. At our absolute worst. THAT'S when Christ died.

Imagine giving your life for someone who hated you, rejected you, wanted nothing to do with you. That's what Jesus did. The cross wasn't for the lovable—it was for His enemies. For sinners. For you and me.

When you doubt God's love, look at the cross. When shame tells you you're unlovable, look at the cross. When circumstances feel like rejection, look at the cross.

The cross settles the question forever. God loves you. Not because you're lovable, but because He IS love. And He proved it with blood.`,
      reflection_questions: [
        'When you doubt God\'s love, what usually triggers that doubt?',
        'How does the cross answer those doubts?',
        'What does it mean that Christ died for you at your worst, not your best?'
      ],
      prayer_focus: 'Jesus, thank You for the cross. Thank You for dying while I was still a sinner. When I doubt Your love, bring me back to the cross. Your blood is proof enough. Amen.'
    },
    {
      day_number: 3,
      title: 'Nothing Can Separate Us',
      scripture_refs: [
        { book: 'Romans', chapter: 8, verseStart: 38, verseEnd: 39 }
      ],
      content: `"For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord."

Paul lists everything that might threaten to separate us from God's love. And then declares: NONE of it can.

Death? No.
Life (with all its struggles)? No.
Angels? No.
Demons? No.
The present (your current mess)? No.
The future (your worst fears)? No.
Any powers? No.
Height or depth? No.
ANYTHING else in all creation? No, no, no.

This is comprehensive. Paul thought of everything that could possibly threaten this love and concluded: nothing qualifies. The love of God in Christ Jesus is unbreakable, unstoppable, unfailing.

Your failures can't separate you. Your doubts can't separate you. Your past can't separate you. Your fears about the future can't separate you. Demonic attack can't separate you. Even death can't separate you.

You are that secure. Not because of your grip on God, but because of His grip on you. Nothing in all creation has the power to pry you out of His loving hands.

Rest in this.`,
      reflection_questions: [
        'What has made you feel separated from God\'s love? How does this passage address it?',
        'Which item on Paul\'s list most threatens to make you doubt God\'s love?',
        'How does knowing nothing can separate you change how you face each day?'
      ],
      prayer_focus: 'Father, I am convinced—nothing can separate me from Your love. Not my failures, not my fears, not anything in all creation. Help me live in the security of this truth. I am Yours forever. Amen.'
    },
    {
      day_number: 4,
      title: 'He Calls You Beloved',
      scripture_refs: [
        { book: '1 John', chapter: 3, verseStart: 1, verseEnd: 1 }
      ],
      content: `"See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!"

Stop and see. Marvel at this. The God of the universe calls you His child.

"What great love"—John invites us to actually look at it, examine it, be amazed by it. God's love isn't ordinary. It's GREAT love. Extraordinary love. Overwhelming love.

"Lavished on us"—not measured out carefully. Not given sparingly. LAVISHED. Poured out in abundance. More than we could ask, imagine, or deserve.

"That we should be called children of God"—this is our identity. Not servants, not slaves, not distant subjects—CHILDREN. With all the intimacy, access, and inheritance that implies.

"And that is what we are!"—John emphasizes: this isn't just a title. It's reality. You ARE God's child. Right now. Today. Not "trying to become" or "hoping to be"—you ARE.

The world may call you many things. Your failures may whisper other identities. But God calls you beloved child. And that's what you are.

Receive this identity. Live from it. Let "beloved" become the truest thing about you.`,
      reflection_questions: [
        'What does God lavishing love on you look like practically?',
        'How does being called "child of God" change your sense of identity?',
        'What other identities have you let define you instead of "beloved"?'
      ],
      prayer_focus: 'Abba, Father, thank You for calling me Your child—and meaning it. Help me receive this identity. When other labels compete, remind me that "beloved" is the truest thing about me. Amen.'
    },
    {
      day_number: 5,
      title: 'His Love Is Steadfast',
      scripture_refs: [
        { book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 }
      ],
      content: `"Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."

Jeremiah wrote these words in the midst of Jerusalem's destruction. His book is called Lamentations—it's literally a collection of grief. And yet, in the middle of ruins, he declares God's steadfast love.

"We are not consumed"—by rights, we should be. Our sin deserves judgment. Our wandering deserves abandonment. But God's great love restrains what we deserve.

"His compassions never fail"—not sometimes reliable, not occasionally available. NEVER fail. His compassion is as dependable as His existence.

"New every morning"—every day is a fresh start. Yesterday's failures don't exhaust His mercy. This morning, His compassion is as full as it's ever been. You can't deplete it with your mistakes.

"Great is your faithfulness"—the hymn that quotes this verse captures it perfectly. His love doesn't waver based on your performance. He is FAITHFUL even when you're not.

Whatever you're facing today, whatever failures marked yesterday, God's steadfast love is available fresh this morning. Come to Him again. His compassions await.`,
      reflection_questions: [
        'How does the context of suffering make this declaration of love more powerful?',
        'What does "new every morning" mean for the guilt you carry from yesterday?',
        'How have you experienced God\'s faithfulness even in difficult seasons?'
      ],
      prayer_focus: 'Lord, Your compassions never fail. They\'re new this morning. Thank You for not consuming me when I deserved it. Great is Your faithfulness. I receive Your fresh mercy today. Amen.'
    },
    {
      day_number: 6,
      title: 'Loved While Unlovable',
      scripture_refs: [
        { book: 'Romans', chapter: 5, verseStart: 6, verseEnd: 8 }
      ],
      content: `"You see, at just the right time, when we were still powerless, Christ died for the ungodly. Very rarely will anyone die for a righteous person, though for a good person someone might possibly dare to die. But God demonstrates his own love for us in this: While we were still sinners, Christ died for us."

Human love has limits. We might love someone lovable. We might sacrifice for someone worthy. But dying for the ungodly? That's uniquely divine.

"When we were still powerless"—we couldn't save ourselves. We couldn't earn His love. We were helpless.

"Christ died for the ungodly"—not for the righteous. Not for the good. For the ungodly. That's the kind of person Christ died for. That's the kind of person you were.

Human love usually responds to something desirable. God's love creates desirability where there was none. Human love often needs a reason. God's love IS the reason.

This is crucial for receiving God's love: you don't have to clean up first. You don't have to become lovable. He loved you when you were at your worst. He doesn't love you because you're wonderful—His love is what makes you wonderful.

Stop trying to earn what's already been given. Stop performing for a love that was freely offered. He loved you at your worst. He surely won't stop now.`,
      reflection_questions: [
        'Do you still try to earn God\'s love? How does that show up?',
        'How does knowing He loved you at your worst free you from performance?',
        'What would change if you stopped trying to become more lovable?'
      ],
      prayer_focus: 'Father, You loved me when I was ungodly, powerless, a sinner. I don\'t have to earn what You\'ve freely given. Help me rest in love I didn\'t deserve and can\'t lose. Amen.'
    },
    {
      day_number: 7,
      title: 'Accepted in the Beloved',
      scripture_refs: [
        { book: 'Ephesians', chapter: 1, verseStart: 6, verseEnd: 7 }
      ],
      content: `"To the praise of his glorious grace, which he has freely given us in the One he loves. In him we have redemption through his blood, the forgiveness of sins, in accordance with the riches of God's grace."

You are accepted. Not because you're acceptable, but because you're "in the One He loves"—Jesus.

When God looks at you, He sees you in Christ. All of Jesus' acceptability covers you. All of His righteousness clothes you. The Father's delight in the Son extends to all who are in Him.

"Freely given"—grace doesn't have a price tag. You can't buy acceptance. It's a gift.

"In him we have redemption"—Jesus bought you back. You were a slave to sin, and He paid the price for your freedom.

"The forgiveness of sins"—every sin, past present and future, covered by His blood. Not because your sins were small, but because His grace is vast.

"In accordance with the riches of God's grace"—your forgiveness isn't rationed. It flows from unlimited supply. There's always more grace than sin.

You belong. You're accepted. You're forgiven. Not because of anything you've done, but because of everything He's done. You are IN the Beloved—and that changes everything.`,
      reflection_questions: [
        'Do you feel accepted by God, or do you still feel like you\'re on the outside?',
        'How does being "in Christ" change your standing before God?',
        'What guilt are you carrying that the forgiveness of sins should lift?'
      ],
      prayer_focus: 'Father, thank You for accepting me in Christ. I don\'t have to earn my way in—I\'m already in. Help me live from acceptance, not for it. I receive Your grace today. Amen.'
    },
    {
      day_number: 8,
      title: 'The Father\'s Pursuing Love',
      scripture_refs: [
        { book: 'Luke', chapter: 15, verseStart: 20, verseEnd: 24 }
      ],
      content: `"So he got up and went to his father. But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him."

The prodigal son story reveals the Father's heart. The son had demanded his inheritance, squandered it, and hit rock bottom. He expected to return as a servant, hoping just to survive.

But watch the Father:

"While he was still a long way off"—the father was watching, waiting, hoping. He hadn't given up on his son.

"His father saw him"—he was looking. Day after day, scanning the horizon, hoping for a glimpse.

"Filled with compassion"—not anger, not "I told you so." Compassion.

"He ran"—Middle Eastern patriarchs didn't run. It was undignified. But this father ran. Dignity be damned—his son was coming home.

"Threw his arms around him and kissed him"—embrace and affection before any confession. Love wasn't waiting for explanation; love was rushing to meet its object.

This is your Father. Not angry. Not distant. Running toward you. Arms open. Ready to embrace. No matter how far you've wandered, He's watching for your return.

Come home. He's waiting.`,
      reflection_questions: [
        'Have you ever felt like you\'ve wandered too far for God to want you back?',
        'How does the father\'s running change your picture of God?',
        'Is there anything keeping you from coming home to the Father\'s embrace?'
      ],
      prayer_focus: 'Father, thank You for being a God who runs toward me, not away from me. I\'ve wandered, but You\'ve been watching. I come home today. Embrace me. Restore me. I am Yours. Amen.'
    },
    {
      day_number: 9,
      title: 'Love That Transforms',
      scripture_refs: [
        { book: 'Titus', chapter: 2, verseStart: 11, verseEnd: 14 }
      ],
      content: `"For the grace of God has appeared that offers salvation to all people. It teaches us to say 'No' to ungodliness and worldly passions, and to live self-controlled, upright and godly lives in this present age."

God's love doesn't just accept you as you are—it transforms you into who you're meant to be.

Some fear that emphasizing grace will lead to license. "If I'm loved unconditionally, why change?" But real grace has the opposite effect.

Grace "teaches us to say 'No' to ungodliness." The more we experience God's love, the less sin appeals. The more we understand His grace, the more we want to honor Him. Love transforms motivation from fear to gratitude.

Think about it: someone who feels constantly condemned tries harder out of fear and usually fails. Someone who feels deeply loved tries not because they have to, but because they want to please the One who loves them.

God's love doesn't leave you unchanged. It heals the brokenness that led to sin. It fills the emptiness that worldly passions tried to fill. It gives you something worth living for.

You don't become holy to earn God's love. God's love makes you holy.`,
      reflection_questions: [
        'How has experiencing God\'s love changed your behavior or desires?',
        'What\'s the difference between trying to change out of fear versus love?',
        'What areas of your life still need transformation by His love?'
      ],
      prayer_focus: 'Lord, let Your love transform me. Not guilt, not fear—Your love. Teach me to say no to sin because I love You, not because I\'m afraid of You. Make me more like Jesus through Your grace. Amen.'
    },
    {
      day_number: 10,
      title: 'Living Loved',
      scripture_refs: [
        { book: 'Jude', chapter: 1, verseStart: 21, verseEnd: 21 },
        { book: '1 John', chapter: 4, verseStart: 19, verseEnd: 19 }
      ],
      content: `"Keep yourselves in God's love as you wait for the mercy of our Lord Jesus Christ to bring you to eternal life."

"We love because he first loved us."

As we conclude this journey, here's your calling: LIVE LOVED.

"Keep yourselves in God's love"—not earn it, just stay in it. Position yourself to continually experience what's already yours. How? Through prayer, Scripture, community, worship—the practices that keep love flowing.

Living loved changes everything:
- You stop performing and start resting
- You stop fearing rejection and start risking love
- You stop hiding shame and start receiving grace
- You stop proving your worth and start living from it

"We love because he first loved us"—loved people become loving people. The love you've received wasn't meant to stop with you. It flows through you to others.

Over these ten days, you've encountered:
- Love that chose you before time
- Love proved at the cross
- Love that nothing can separate you from
- Love that calls you beloved
- Love that pursues and transforms

This isn't just information. It's invitation. Live from this love today. Tomorrow. Every day until you see Him face to face.

You are loved. Now go live like it.`,
      reflection_questions: [
        'What has impacted you most over these ten days?',
        'How will you "keep yourself in God\'s love" practically?',
        'Who in your life needs to receive the love that\'s been given to you?'
      ],
      prayer_focus: 'Father, I want to live loved. Thank You for these ten days of encountering Your unfailing love. Help me stay in it, rest in it, and share it. May my life overflow with the love I\'ve received. Amen.'
    }
  ]
};

// =====================================================
// BEAUTY FROM ASHES - 10 Day Series
// =====================================================
const BEAUTY_FROM_ASHES = {
  series: {
    slug: 'beauty-from-ashes',
    title: 'Beauty from Ashes: Healing and Hope',
    description: 'A 10-day journey from brokenness to wholeness. God turns your mourning into dancing.',
    total_days: 10,
    topics: ['women', 'healing', 'hope', 'restoration', 'redemption'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'Ashes to Beauty',
      scripture_refs: [
        { book: 'Isaiah', chapter: 61, verseStart: 1, verseEnd: 3 }
      ],
      content: `"The Spirit of the Sovereign LORD is on me, because the LORD has anointed me to proclaim good news to the poor. He has sent me to bind up the brokenhearted, to proclaim freedom for the captives... to bestow on them a crown of beauty instead of ashes, the oil of joy instead of mourning, and a garment of praise instead of a spirit of despair."

These words, first spoken by the prophet Isaiah, were read by Jesus as He launched His ministry. This is His mission: transforming ashes to beauty.

Ashes represent grief, loss, destruction—everything that life has burned down. We all carry ashes. Failed relationships. Lost dreams. Painful memories. Things that were and things that should have been but weren't.

But Jesus came to exchange ashes for beauty. Not to ignore the ashes or pretend they don't exist, but to transform them into something glorious.

This is the promise: your brokenness isn't the end of your story. What has been burned down can be rebuilt. What has been mourned can be danced over. What has caused despair can become praise.

Over these ten days, we'll walk through the journey from ashes to beauty. It's not instant. It's not painless. But it's possible. Because the One who promised is faithful.

What ashes are you carrying?`,
      reflection_questions: [
        'What "ashes" in your life do you long to see transformed?',
        'Do you believe God can bring beauty from your brokenness? Why or why not?',
        'What would "beauty" look like in your specific situation?'
      ],
      prayer_focus: 'Lord Jesus, You came to bring beauty from ashes. I bring You mine—[name them]. I believe You can transform what has been burned down. Begin this work in me. Amen.'
    },
    {
      day_number: 2,
      title: 'He Is Close to the Broken',
      scripture_refs: [
        { book: 'Psalm', chapter: 34, verseStart: 18, verseEnd: 18 }
      ],
      content: `"The LORD is close to the brokenhearted and saves those who are crushed in spirit."

When your heart is broken, God draws near. He doesn't stand at a distance watching you suffer. He moves CLOSE.

This is counter to how we often feel. In our pain, we might sense God is far away, silent, uncaring. But the truth is the opposite: He is CLOSE to the brokenhearted. Proximity increases with pain.

"Crushed in spirit"—this describes being flattened by life. When circumstances have stomped on your soul and left you wondering if you'll ever get up. God sees. And He saves.

This doesn't mean He instantly removes the pain. Being close doesn't always mean immediate rescue. But it means presence. It means you're not alone in your suffering. It means the Creator of the universe has drawn near to you in your lowest moment.

Sometimes the deepest healing begins with simply knowing you're not alone. Before the beauty comes, before the transformation happens, there's this: His presence with you in the ashes.

He is close. Right now. In this very moment of your brokenness.`,
      reflection_questions: [
        'In your brokenness, do you feel God is close or distant? What shapes that feeling?',
        'How might knowing He is near change how you experience your pain?',
        'What would it mean to receive His presence even before receiving healing?'
      ],
      prayer_focus: 'Father, I feel broken. But Your Word says You\'re close to me in this. Help me sense Your presence. I don\'t need all the answers right now—I need You. Draw near, Lord. Amen.'
    },
    {
      day_number: 3,
      title: 'Mourning Turns to Dancing',
      scripture_refs: [
        { book: 'Psalm', chapter: 30, verseStart: 11, verseEnd: 12 }
      ],
      content: `"You turned my wailing into dancing; you removed my sackcloth and clothed me with joy, that my heart may sing your praises and not be silent. LORD my God, I will praise you forever."

Wailing to dancing. Sackcloth to joy. This is the trajectory of redemption.

David wrote these words after experiencing God's deliverance. He had been in a place of grief so deep that all he could do was wail. But God didn't leave him there. He TURNED it—transformed it, redirected it, changed its nature entirely.

The shift isn't immediate. Notice David doesn't skip from wailing straight to dancing. There's a process: removal of sackcloth before the clothing of joy. Taking off the old before putting on the new.

This means the journey from ashes to beauty isn't instantaneous. There's grieving to be done. Sackcloth to be removed. But the promise is: it won't stay this way forever.

"That my heart may sing your praises"—the purpose of transformation isn't just your comfort. It's worship. When God brings beauty from ashes, it declares His glory. Your testimony becomes praise.

One day—maybe not today, maybe not soon, but ONE DAY—you will dance again. The God who turns mourning to dancing will do it for you too.`,
      reflection_questions: [
        'Can you imagine dancing again? What feels impossible about that?',
        'What "sackcloth" might need to be removed before joy can come?',
        'How could your eventual healing become a testimony of God\'s faithfulness?'
      ],
      prayer_focus: 'Lord, I can barely imagine dancing right now. But You are the God who transforms wailing to dancing. Do that work in me. In Your timing, clothe me with joy. Amen.'
    },
    {
      day_number: 4,
      title: 'Tears Are Seeds',
      scripture_refs: [
        { book: 'Psalm', chapter: 126, verseStart: 5, verseEnd: 6 }
      ],
      content: `"Those who sow with tears will reap with songs of joy. Those who go out weeping, carrying seed to sow, will return with songs of joy, carrying sheaves with them."

Your tears are not wasted. They're seeds.

In ancient agriculture, seed was precious—often the same grain that could feed your family. To sow it meant trusting it to the ground, believing it would multiply. Sometimes farmers literally wept as they sowed, sacrificing present sustenance for future harvest.

Your tears work the same way. The grief, the pain, the heartbreak—these aren't pointless. When surrendered to God, they become seeds of future joy.

"Will reap with songs of joy"—this is promise, not possibility. Those who sow in tears WILL reap in joy. The harvest is coming.

"Carrying sheaves"—more than what was sown. Abundance from ashes. Joy multiplied from grief.

This doesn't minimize your pain. Your tears are real. Your grief matters. But it won't be wasted. God has a way of using everything—even the worst things—and bringing something good from them.

Cry if you need to. But know this: you're planting something. And harvest is coming.`,
      reflection_questions: [
        'Does viewing your tears as seeds change how you experience grief?',
        'What "harvest" might God be growing through your current pain?',
        'How have you seen God bring good from previous seasons of sorrow?'
      ],
      prayer_focus: 'Father, I don\'t want my tears to be wasted. Use this grief. Plant something through it. I trust that harvest is coming, even when I can\'t see it. Amen.'
    },
    {
      day_number: 5,
      title: 'He Makes All Things New',
      scripture_refs: [
        { book: 'Revelation', chapter: 21, verseStart: 4, verseEnd: 5 }
      ],
      content: `"He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away. He who was seated on the throne said, 'I am making all things new!'"

The ultimate beauty from ashes is still coming. One day, God will wipe away every tear. Every single one.

No more death. No more mourning. No more crying. No more pain. The old order—the one where things break and people hurt and hearts shatter—will be gone forever.

"I am making ALL things new"—not some things. ALL things. Every broken piece. Every wounded heart. Every scarred memory. All of it—made new.

This doesn't mean your present pain doesn't matter. But it means this isn't forever. It means there's an ending to the ashes and a beginning to beauty that will never fade.

Right now, you live in the "already but not yet." Some beauty has already come. More is being worked. But the fullness waits for that day when He makes ALL things new.

Let this future hope strengthen your present endurance. What you're going through is temporary. What He's bringing is eternal.`,
      reflection_questions: [
        'How does knowing ultimate healing is coming affect how you face current pain?',
        'What are you most looking forward to God making new?',
        'How can eternal perspective help you endure present suffering?'
      ],
      prayer_focus: 'Lord, I long for the day when You wipe away every tear. Until then, help me hold onto hope. You are making all things new—including me. Come quickly, Lord Jesus. Amen.'
    },
    {
      day_number: 6,
      title: 'Scars Tell Stories',
      scripture_refs: [
        { book: 'John', chapter: 20, verseStart: 27, verseEnd: 28 }
      ],
      content: `"Then he said to Thomas, 'Put your finger here; see my hands. Reach out your hand and put it into my side. Stop doubting and believe.' Thomas said to him, 'My Lord and my God!'"

Jesus rose from the dead—but He kept His scars. The resurrected King still bears the marks of crucifixion.

This is profound. Jesus could have had a perfect, unmarked body. But He chose to keep the evidence of His wounds. Why?

Because scars tell stories. Jesus' scars tell the story of love that went to death for us. They're proof of what He endured and what He overcame. They're not ugly—they're beautiful.

Your scars are the same. The wounds you've received, once healed, become testimonies. They tell of what you've survived, what God has brought you through, what love has redeemed.

Scars are not shameful. They're evidence of survival. Evidence of healing. Evidence that you're still here despite what tried to destroy you.

Don't hide your scars. Don't be ashamed of them. As God brings beauty from your ashes, those healed wounds become part of your story—the part that declares His redemption.`,
      reflection_questions: [
        'What scars do you carry—physical, emotional, or spiritual?',
        'How might those scars become testimonies of God\'s healing?',
        'What does Jesus keeping His scars teach you about your own?'
      ],
      prayer_focus: 'Jesus, You kept Your scars. Help me see mine not as shame but as story. Heal my wounds and use the scars to testify of Your redemption. Let my scars point others to You. Amen.'
    },
    {
      day_number: 7,
      title: 'Strength in Weakness',
      scripture_refs: [
        { book: '2 Corinthians', chapter: 12, verseStart: 9, verseEnd: 10 }
      ],
      content: `"But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me. That is why, for Christ's sake, I delight in weaknesses... For when I am weak, then I am strong."

Paul asked God three times to remove his "thorn in the flesh." Three times, God said no. But He gave something better than removal: sufficiency.

"My grace is sufficient"—whatever you need, grace supplies. Not escape, but enablement. Not removal, but presence.

"My power is made perfect in weakness"—this flips human thinking. We want to be strong. God showcases His power through our weakness. When we're at the end of ourselves, we finally get out of His way.

Paul learned to BOAST in weakness. To DELIGHT in it. Because weakness positioned him to experience Christ's power in ways strength never could.

Your brokenness might feel like liability. But surrendered to God, it becomes the very place His power displays. The ashes you're embarrassed by become the stage for His beauty.

You don't have to be strong. You just have to be surrendered.`,
      reflection_questions: [
        'What weakness are you most embarrassed by?',
        'How might that weakness become a place for God\'s power to display?',
        'What would it look like to boast in your weakness rather than hide it?'
      ],
      prayer_focus: 'Lord, I\'m weak. But Your power is made perfect in weakness. Instead of hiding my brokenness, help me surrender it. Display Your strength through my weakness. Amen.'
    },
    {
      day_number: 8,
      title: 'The God Who Redeems',
      scripture_refs: [
        { book: 'Ruth', chapter: 4, verseStart: 13, verseEnd: 17 }
      ],
      content: `"So Boaz took Ruth and she became his wife... The women said to Naomi: 'Praise be to the LORD, who this day has not left you without a guardian-redeemer... He will renew your life and sustain you in your old age.'"

Ruth's story is a masterclass in beauty from ashes.

She lost her husband. Became a foreigner and a widow—among the most vulnerable people in ancient society. She clung to her mother-in-law Naomi, who was also devastated by loss.

Everything looked hopeless. Naomi even changed her name to "Mara" (bitter) because life had dealt her such grief.

But God was working. Through seeming coincidence and ordinary faithfulness, Ruth met Boaz—a "guardian-redeemer" who would restore everything. She married him, had a son, and became great-grandmother to King David... and an ancestor of Jesus Himself.

From devastation to the lineage of the Messiah. From bitter to blessed. From widow to wife, from empty to full.

This is your God: the Redeemer. He specializes in taking impossible situations and writing redemption stories. Your ashes are raw material for His glory.`,
      reflection_questions: [
        'What in your life feels beyond redemption?',
        'How does Ruth\'s story give you hope for your own?',
        'What ordinary faithfulness might God be asking of you during this season?'
      ],
      prayer_focus: 'Redeemer God, You took Ruth\'s ashes and made her ancestor to the Messiah. I bring You my impossible situation. Write a redemption story with my life. I trust You. Amen.'
    },
    {
      day_number: 9,
      title: 'Comfort to Give',
      scripture_refs: [
        { book: '2 Corinthians', chapter: 1, verseStart: 3, verseEnd: 4 }
      ],
      content: `"Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God."

Your pain has a purpose beyond you. The comfort you receive becomes comfort you give.

God doesn't waste suffering. What you're going through is preparing you to help someone else who will go through something similar. Your ashes, transformed to beauty, become a beacon for others still in ashes.

"So that we can comfort those"—there's a purpose clause here. We receive comfort SO THAT we can extend it. The chain continues: comforted people become comforters.

Think about who has ministered to you most effectively in your pain. Usually it's someone who's been there. Not someone with theories about suffering, but someone with scars from their own.

This gives meaning to pain. It's not pointless. Every bit of comfort you receive is being deposited into an account you'll one day share with someone else.

Your story isn't just for you. It's for everyone who will need to hear it.`,
      reflection_questions: [
        'Who has comforted you with comfort they received from their own pain?',
        'How might God use your current suffering to help someone in the future?',
        'What comfort have you received that you could share with others?'
      ],
      prayer_focus: 'Father of compassion, comfort me in my trouble. And use this pain for purpose. Prepare me to comfort others with the comfort I\'m receiving from You. May my story bless someone else. Amen.'
    },
    {
      day_number: 10,
      title: 'Hope Does Not Disappoint',
      scripture_refs: [
        { book: 'Romans', chapter: 5, verseStart: 3, verseEnd: 5 }
      ],
      content: `"Not only so, but we also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope. And hope does not put us to shame, because God's love has been poured out into our hearts through the Holy Spirit, who has been given to us."

As we conclude this journey, here is the chain that leads from ashes to beauty:

Suffering → Perseverance → Character → Hope

You're somewhere on this chain. Maybe still in suffering. Maybe developing perseverance. Maybe watching character form. Maybe beginning to hope.

Each stage is necessary. Each builds on what came before. And the destination—hope—does not disappoint. It doesn't put you to shame. It delivers.

Why can we be confident? "Because God's love has been poured out into our hearts." The same love that chose you before time, proved itself at the cross, and can never be separated from you—that love is IN you right now, through the Holy Spirit.

Beauty from ashes isn't wishful thinking. It's the character of God demonstrated throughout Scripture and promised to all who trust Him.

Your ashes will become beauty. Your mourning will become dancing. Your grief will become joy.

This is your God. This is His promise. This is your hope.`,
      reflection_questions: [
        'Where are you on the chain: suffering, perseverance, character, or hope?',
        'How has this journey changed your perspective on your pain?',
        'What hope are you taking with you from these ten days?'
      ],
      prayer_focus: 'Lord, thank You for the journey from ashes to beauty. Thank You for hope that does not disappoint. Continue the work You\'ve begun. I trust You to complete it. Your love is in me. Beauty is coming. Amen.'
    }
  ]
};

// =====================================================
// LEADING LIKE CHRIST - 10 Day Series
// =====================================================
const LEADING_LIKE_CHRIST = {
  series: {
    slug: 'leading-like-christ',
    title: 'Leading Like Christ',
    description: 'A 10-day guide for husbands, fathers, and leaders. Learn servant leadership from Jesus Himself.',
    total_days: 10,
    topics: ['men', 'leadership', 'servant_leadership', 'marriage', 'fatherhood'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'The Greatest Among You',
      scripture_refs: [
        { book: 'Matthew', chapter: 20, verseStart: 25, verseEnd: 28 }
      ],
      content: `"Jesus called them together and said, 'You know that the rulers of the Gentiles lord it over them, and their high officials exercise authority over them. Not so with you. Instead, whoever wants to become great among you must be your servant, and whoever wants to be first must be your slave—just as the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.'"

Jesus completely redefines leadership. The world's model: authority over others. Jesus' model: service to others.

"Not so with you"—followers of Christ operate by different rules. What works in corporate boardrooms or political arenas isn't the pattern for God's men. We don't lord over; we serve.

"Whoever wants to become great must be your servant"—the path to greatness is downward. Not climbing the ladder but descending it. Not accumulating power but distributing it.

And Jesus didn't just teach this; He lived it. "The Son of Man did not come to be served, but to serve, and to give his life." The King of the Universe came as a servant. The one with all authority laid it down.

This is your model for leadership—whether in your home, workplace, church, or community. Lead like Jesus: serve.`,
      reflection_questions: [
        'How does the world\'s leadership model differ from Jesus\'?',
        'Where are you tempted to "lord it over" rather than serve?',
        'What would servant leadership look like in your current roles?'
      ],
      prayer_focus: 'Lord Jesus, You came to serve, not to be served. Teach me this upside-down leadership. Humble me. Shape me. Help me lead by serving, like You did. Amen.'
    },
    {
      day_number: 2,
      title: 'Washing Feet',
      scripture_refs: [
        { book: 'John', chapter: 13, verseStart: 12, verseEnd: 17 }
      ],
      content: `"When he had finished washing their feet, he put on his clothes and returned to his place. 'Do you understand what I have done for you?' he asked them. 'You call me Teacher and Lord, and rightly so, for that is what I am. Now that I, your Lord and Teacher, have washed your feet, you also should wash one another's feet. I have set you an example that you should do as I have done for you.'"

The night before He died, Jesus wrapped a towel around His waist and did a slave's job. He washed dirty feet.

He was their Lord and Teacher—and He washed their feet. The one with highest authority performed the lowest task. This wasn't beneath Him; it defined Him.

"I have set you an example"—this wasn't a one-time act but a pattern for all who follow Him. If Jesus washed feet, no task is beneath His disciples.

For leaders—husbands, fathers, bosses—this is revolutionary. Leadership means getting your hands dirty serving those you lead. It means doing the unglamorous work. It means putting others' needs before your own comfort or position.

What "feet" need washing in your world? Whose needs could you meet today, even if it feels beneath your position? True leadership looks like this.`,
      reflection_questions: [
        'What "foot-washing" tasks do you resist because they feel beneath you?',
        'How did Jesus\' status make His service more significant, not less?',
        'What specific act of humble service could you do for someone you lead?'
      ],
      prayer_focus: 'Lord, You washed feet. Give me a towel and a basin. Show me whose feet need washing. Strip away my pride. Help me serve like You served. Amen.'
    },
    {
      day_number: 3,
      title: 'Loving Your Wife Like Christ',
      scripture_refs: [
        { book: 'Ephesians', chapter: 5, verseStart: 25, verseEnd: 28 }
      ],
      content: `"Husbands, love your wives, just as Christ loved the church and gave himself up for her to make her holy, cleansing her by the washing with water through the word, and to present her to himself as a radiant church, without stain or wrinkle or any other blemish, but holy and blameless."

This is the highest standard of love ever given to husbands: love like Christ loves the church. Sacrificially. Sanctifyingly. Completely.

"Gave himself up for her"—Christ's love wasn't just words; it was life laid down. Husbands, this is your model. Not demanding service, but offering sacrifice. Not your needs first, but hers.

"To make her holy"—Jesus' love has purpose: to bring out the best in His bride. Your love for your wife should do the same. Does she flourish because of your leadership? Does she become more fully who God made her to be?

"Without stain or wrinkle... holy and blameless"—Christ's goal is His bride's radiance. Your goal as a husband is to lead in a way that helps your wife shine.

This isn't about your wife serving you. It's about you laying down your life for her, as Christ did for you.`,
      reflection_questions: [
        'How does your love for your wife compare to Christ\'s love for the church?',
        'Does your wife flourish under your leadership? What evidence is there?',
        'What sacrifice could you make this week to love her more like Christ?'
      ],
      prayer_focus: 'Lord, I fall so short of this standard. Teach me to love my wife like You love the church. Help me sacrifice, serve, and lead her toward radiance. Amen.'
    },
    {
      day_number: 4,
      title: 'Fathers, Don\'t Exasperate',
      scripture_refs: [
        { book: 'Ephesians', chapter: 6, verseStart: 4, verseEnd: 4 },
        { book: 'Colossians', chapter: 3, verseStart: 21, verseEnd: 21 }
      ],
      content: `"Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord."

"Fathers, do not embitter your children, or they will become discouraged."

Two commands to fathers, both focusing on what NOT to do: don't exasperate, don't embitter. Why? Because fathers have enormous power to either build up or tear down their children.

Exasperate means to provoke to anger or frustration. This happens through: unreasonable expectations, inconsistent discipline, never being satisfied, comparing them to others, conditional love, neglect, harsh words, or broken promises.

Children who are exasperated become discouraged. They give up. They internalize the message that they can never be good enough.

Instead: "Bring them up in the training and instruction of the Lord." This is positive, intentional, spiritual leadership. Teaching them God's ways. Discipling them. Leading by example.

Your children are watching you, learning from you, shaped by you. What are they learning about leadership, about God, about themselves?`,
      reflection_questions: [
        'In what ways might you unintentionally exasperate or embitter your children?',
        'What does "training and instruction of the Lord" look like practically in your home?',
        'What message are your children receiving about their worth from your leadership?'
      ],
      prayer_focus: 'Father, help me father well. Show me where I\'ve exasperated or embittered my children. Teach me to train and instruct them in Your ways. Let my leadership build them up, not tear them down. Amen.'
    },
    {
      day_number: 5,
      title: 'Leading with Integrity',
      scripture_refs: [
        { book: 'Proverbs', chapter: 10, verseStart: 9, verseEnd: 9 },
        { book: 'Proverbs', chapter: 11, verseStart: 3, verseEnd: 3 }
      ],
      content: `"Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out."

"The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity."

Integrity means wholeness—being the same person in every context. The same man at home, at work, at church, and when no one is watching.

"Walks securely"—integrity provides stability. You don't have to remember which lies you told to whom. You don't fear exposure because there's nothing hidden. You can sleep at night.

"Takes crooked paths will be found out"—hidden sin doesn't stay hidden forever. What's done in darkness eventually comes to light. Leaders who lack integrity eventually fall—and the fall damages everyone who trusted them.

"Integrity guides"—when you're a person of integrity, decisions become clearer. You don't have to calculate what you can get away with. You simply do what's right.

Your family, your team, your organization can only rise to the level of your integrity. What you tolerate in yourself, you permit in those you lead.`,
      reflection_questions: [
        'Are you the same person in every context? Where is there inconsistency?',
        'What "crooked paths" might eventually be found out?',
        'How does your integrity (or lack of it) affect those you lead?'
      ],
      prayer_focus: 'Lord, I want to be a man of integrity. Expose the hidden places. Make me whole—the same man everywhere. Let integrity guide my decisions and my leadership. Amen.'
    },
    {
      day_number: 6,
      title: 'Slow to Anger',
      scripture_refs: [
        { book: 'James', chapter: 1, verseStart: 19, verseEnd: 20 },
        { book: 'Proverbs', chapter: 16, verseStart: 32, verseEnd: 32 }
      ],
      content: `"My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry, because human anger does not produce the righteousness that God desires."

"Better a patient man than a warrior, a man who controls his temper than one who takes a city."

Anger is a leadership killer. It destroys trust, wounds relationships, and models exactly what we don't want those we lead to become.

Quick to listen. Slow to speak. Slow to anger. Notice the order. Listening first. Speaking carefully. And anger? Slow. Very slow.

"Human anger does not produce the righteousness that God desires"—we justify our anger as righteous. But most of the time, it's just human—selfish, defensive, out of control. And it doesn't produce what we're actually after.

"Better a patient man than a warrior"—our culture celebrates warriors. But self-control is greater than conquest. Ruling your own spirit is harder than taking a city.

Your family experiences your anger. Your team experiences your anger. Is it producing righteousness? Or is it producing fear, resentment, and distance?`,
      reflection_questions: [
        'How would those you lead describe your temper?',
        'What triggers your anger? What\'s really going on beneath it?',
        'What would change if you became quicker to listen and slower to anger?'
      ],
      prayer_focus: 'Lord, I confess my anger has hurt people I lead. Give me patience. Make me quick to listen, slow to speak, slow to become angry. Produce Your righteousness, not my anger. Amen.'
    },
    {
      day_number: 7,
      title: 'Vision and Direction',
      scripture_refs: [
        { book: 'Proverbs', chapter: 29, verseStart: 18, verseEnd: 18 }
      ],
      content: `"Where there is no vision, the people perish: but he that keepeth the law, happy is he." (KJV)

Leaders provide vision. Without it, people drift, lose motivation, and eventually "perish"—not physically, but in purpose and direction.

A husband casts vision for his marriage: "Here's where we're heading. Here's what we're building together. Here's why it matters."

A father casts vision for his family: "This is who we are. This is what we value. This is our purpose as a family."

A leader casts vision for those following: "This is where we're going. This is why your contribution matters. This is what we're working toward."

Vision isn't just about goals—it's about meaning. People can handle hard work if they know WHY. They can endure sacrifice if they see the destination.

Are you casting vision? Or are those you lead just surviving day to day without direction? Part of leading like Christ is helping people see where they're going and why it's worth it.`,
      reflection_questions: [
        'What vision have you cast for your marriage? Your family? Your team?',
        'Do those you lead know where you\'re taking them and why?',
        'How could you better communicate vision and direction?'
      ],
      prayer_focus: 'Lord, give me vision for those I lead. Help me see where You\'re taking us and communicate it clearly. May my leadership provide direction and purpose. Amen.'
    },
    {
      day_number: 8,
      title: 'Developing Others',
      scripture_refs: [
        { book: '2 Timothy', chapter: 2, verseStart: 2, verseEnd: 2 }
      ],
      content: `"And the things you have heard me say in the presence of many witnesses entrust to reliable people who will also be qualified to teach others."

Great leaders don't just accomplish tasks—they develop people. The measure of your leadership isn't just what you achieve but who you raise up.

Paul invested in Timothy. Timothy was to invest in reliable people. Those people would invest in others. The chain continues. This is multiplication, not just addition.

A husband develops his wife, encouraging her gifts and helping her flourish.

A father develops his children, equipping them with character, skills, and faith to eventually lead their own families.

A leader develops those under them, raising up future leaders who will surpass them.

This requires humility—being willing to be exceeded by those you develop. It requires generosity—investing time and wisdom without expecting return. It requires intentionality—development doesn't happen by accident.

Who are you developing? What are you entrusting? What legacy of leadership will continue beyond you?`,
      reflection_questions: [
        'Who are you intentionally developing as a leader?',
        'What are you entrusting to others that they could pass on?',
        'How would your leadership change if you focused more on developing people?'
      ],
      prayer_focus: 'Lord, help me invest in others. Show me who I should be developing. Give me humility to raise up leaders who will surpass me. Let my leadership multiply. Amen.'
    },
    {
      day_number: 9,
      title: 'Courage Under Pressure',
      scripture_refs: [
        { book: 'Joshua', chapter: 1, verseStart: 9, verseEnd: 9 }
      ],
      content: `"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."

Leaders face situations that require courage. Hard conversations. Unpopular decisions. Standing for what's right when it's costly. Protecting those in your care.

Joshua was taking over from Moses, leading Israel into unknown territory against formidable enemies. God's command: Be strong. Be courageous. Do not fear.

This wasn't positive thinking or self-help motivation. The basis for courage was God's presence: "The LORD your God will be with you wherever you go."

Courage doesn't mean absence of fear. It means acting rightly despite fear—because you know God is with you.

Your family needs you to be courageous. To have the hard conversations. To lead when you don't know exactly what to do. To protect them from threats. To stand firm when it would be easier to compromise.

Where is courage required in your leadership right now?`,
      reflection_questions: [
        'What situation requiring courage have you been avoiding?',
        'How does knowing God is with you enable courage?',
        'What would courageous leadership look like in your current challenges?'
      ],
      prayer_focus: 'Lord, I need courage. I face situations that scare me. But You are with me wherever I go. Make me strong and courageous. Help me lead bravely. Amen.'
    },
    {
      day_number: 10,
      title: 'Finishing Well',
      scripture_refs: [
        { book: '2 Timothy', chapter: 4, verseStart: 7, verseEnd: 8 }
      ],
      content: `"I have fought the good fight, I have finished the race, I have kept the faith. Now there is in store for me the crown of righteousness, which the Lord, the righteous Judge, will award to me on that day—and not only to me, but also to all who have longed for his appearing."

Leadership is a marathon, not a sprint. What matters isn't just how you start but how you finish.

Paul, at the end of his life, could say three things:
- "I have fought the good fight"—engaged in what mattered
- "I have finished the race"—persevered to the end
- "I have kept the faith"—maintained integrity throughout

Many leaders start well but don't finish well. Moral failures. Burnout. Compromise. Distraction. The casualties along the way are heartbreaking.

But you can finish well. By God's grace, you can fight, finish, and keep the faith. You can receive the crown reserved for those who endure.

Your wife needs you to finish well. Your children need you to finish well. Those you lead need you to finish well.

What will you say at the end of your race?`,
      reflection_questions: [
        'If your leadership ended today, what would you say about how you finished?',
        'What threatens your ability to finish well?',
        'What do you need to do now to ensure you finish the race?'
      ],
      prayer_focus: 'Lord, I want to finish well. Help me fight the good fight, finish the race, and keep the faith. Protect me from what would derail me. Let me lead faithfully to the end. Amen.'
    }
  ]
};

// =====================================================
// STRENGTHENING MARRIAGE - 14 Day Series
// =====================================================
const STRENGTHENING_MARRIAGE = {
  series: {
    slug: 'strengthening-marriage',
    title: 'Strengthening Your Marriage',
    description: 'A 14-day journey to build a stronger, Christ-centered marriage. Biblical wisdom for lasting love.',
    total_days: 14,
    topics: ['marriage', 'relationships', 'love', 'communication', 'family'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'God\'s Design for Marriage', scripture_refs: [{ book: 'Genesis', chapter: 2, verseStart: 24, verseEnd: 25 }], content: `"That is why a man leaves his father and mother and is united to his wife, and they become one flesh."\n\nMarriage is God's idea. Before governments, before religions—God designed marriage. Understanding His original design helps us build marriages that flourish.\n\n"A man leaves"—marriage creates a new primary relationship. Parents are honored but a new family unit is formed.\n\n"United to his wife"—this is covenant language. Not just living together, but bound together.\n\n"One flesh"—two become one. Not just physically, but emotionally, spiritually, practically.`, reflection_questions: ['How does your marriage reflect God\'s original design?', 'What does "one flesh" mean practically?', 'Where has distance crept into your marriage?'], prayer_focus: 'Lord, You designed marriage. Show us how to align with Your design. Unite us more deeply. Amen.' },
    { day_number: 2, title: 'Love That Lasts', scripture_refs: [{ book: '1 Corinthians', chapter: 13, verseStart: 4, verseEnd: 7 }], content: `"Love is patient, love is kind. It does not envy, it does not boast..."\n\nThis is the love your marriage needs—not the Hollywood version, but the biblical version. Patient when they're slow to change. Kind in small daily actions. Not proud—willing to apologize first.\n\nThis kind of love isn't natural. It's supernatural. You need the Holy Spirit producing it in you.`, reflection_questions: ['Which description of love is hardest for you?', 'How might keeping record of wrongs be affecting your marriage?', 'What would it look like to love more supernaturally?'], prayer_focus: 'Lord, produce this love in me. Where I\'m impatient, make me patient. Help me love my spouse the way You love me. Amen.' },
    { day_number: 3, title: 'Communication That Connects', scripture_refs: [{ book: 'James', chapter: 1, verseStart: 19, verseEnd: 19 }], content: `"Everyone should be quick to listen, slow to speak and slow to become angry."\n\nMost marriage communication problems come down to this: we're quick to speak, slow to listen, and fast to become angry. Exactly backwards.\n\nQuick to listen—really hear what your spouse is saying. The heart behind the words.\n\nSlow to speak—think before responding. Will your words help or hurt?\n\nSlow to anger—your spouse is not your enemy. They're on your team.`, reflection_questions: ['Are you quick to listen or quick to speak?', 'What does your spouse need you to hear?', 'How does anger affect your communication?'], prayer_focus: 'Lord, teach me to listen—really listen. Slow my tongue. Calm my reactions. Help me understand before demanding to be understood. Amen.' },
    { day_number: 4, title: 'Fighting Fair', scripture_refs: [{ book: 'Ephesians', chapter: 4, verseStart: 26, verseEnd: 27 }], content: `"In your anger do not sin: Do not let the sun go down while you are still angry."\n\nConflict is inevitable in marriage. The question isn't whether you'll fight, but how.\n\nRules for fighting fair:\n- Attack the issue, not each other\n- No name-calling or character attacks\n- Stay on topic—don't bring up past grievances\n- Take breaks if emotions escalate\n- Seek resolution, not victory`, reflection_questions: ['What are your worst habits when conflict arises?', 'Do you resolve conflicts quickly or let them linger?', 'What rules could you establish for fighting fair?'], prayer_focus: 'Lord, help us fight fair. Protect our marriage from words spoken in anger. Help us resolve conflict quickly. Amen.' },
    { day_number: 5, title: 'The Power of Forgiveness', scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 13, verseEnd: 13 }], content: `"Forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you."\n\nMarriage requires constant forgiveness. You will hurt each other. You will disappoint each other. The question is: will you forgive?\n\nUnforgiveness is poison in marriage. It builds walls, kills intimacy, and turns partners into enemies. Forgiveness tears down walls and reminds you you're on the same team.`, reflection_questions: ['What grievances are you holding against your spouse?', 'How has God\'s forgiveness set the standard?', 'What walls has unforgiveness built?'], prayer_focus: 'Lord, help me forgive as You\'ve forgiven me. Soften my heart. Tear down walls of resentment. Amen.' },
    { day_number: 6, title: 'Serving One Another', scripture_refs: [{ book: 'Galatians', chapter: 5, verseStart: 13, verseEnd: 13 }], content: `"Serve one another humbly in love."\n\nMarriage isn't 50/50. It's 100/100. Both giving everything, both serving sacrificially.\n\nWhat if you stopped keeping score? What if you simply served?\n\nSmall acts compound: making coffee, handling tasks they hate, giving them time alone, speaking their love language. Service is love in action.`, reflection_questions: ['Are you keeping score in your marriage?', 'What would change if you focused on serving?', 'What acts of service would most bless your spouse?'], prayer_focus: 'Lord, give me a servant\'s heart toward my spouse. Help me stop keeping score. Show me how to serve them today. Amen.' },
    { day_number: 7, title: 'Intimacy and Connection', scripture_refs: [{ book: '1 Corinthians', chapter: 7, verseStart: 3, verseEnd: 5 }], content: `"Do not deprive each other except perhaps by mutual consent..."\n\nPhysical intimacy is not optional in marriage—it's essential. But notice the mutuality: both partners yield, both serve, both give.\n\nBeyond physical intimacy, emotional connection matters deeply. Time together. Deep conversations. Knowing and being known.\n\nKeep pursuing your spouse, even after years of marriage.`, reflection_questions: ['How would you rate intimacy—physical and emotional?', 'What has eroded connection over time?', 'What could you do to prioritize time together?'], prayer_focus: 'Lord, protect the intimacy in our marriage. Help us stay connected. Keep us pursuing each other. Amen.' },
    { day_number: 8, title: 'Honoring Differences', scripture_refs: [{ book: '1 Peter', chapter: 3, verseStart: 7, verseEnd: 7 }], content: `"Husbands, be considerate as you live with your wives..."\n\nYou married someone different from you. Different background. Different personality. Different ways of processing.\n\n"Be considerate"—literally, live with knowledge of your spouse. Study them. Learn how they're wired.\n\nInstead of trying to change your spouse into yourself, learn from them. Let their strengths cover your weaknesses.`, reflection_questions: ['What differences cause the most friction?', 'How might those differences strengthen your marriage?', 'How well do you really understand your spouse?'], prayer_focus: 'Lord, help me understand and honor my spouse\'s differences. Unite us in our diversity. Amen.' },
    { day_number: 9, title: 'Praying Together', scripture_refs: [{ book: 'Matthew', chapter: 18, verseStart: 19, verseEnd: 20 }], content: `"If two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven."\n\nOne of the most powerful things you can do for your marriage is pray together.\n\nPraying together builds intimacy. You hear each other's hearts. You're vulnerable before God together.\n\nStart simple. Pray briefly together each day. Share one thing you need prayer for.`, reflection_questions: ['How often do you pray together as a couple?', 'What makes praying together difficult?', 'How could you start or deepen prayer together?'], prayer_focus: 'Lord, help us pray together. Break down the barriers. Meet us as we come to You together. Amen.' },
    { day_number: 10, title: 'Managing Money Together', scripture_refs: [{ book: 'Luke', chapter: 16, verseStart: 10, verseEnd: 11 }], content: `"Whoever can be trusted with very little can also be trusted with much..."\n\nMoney is a leading cause of marriage conflict. But managed well, money becomes a tool for unity.\n\nGet on the same page. Agree on values and goals. Maintain transparency—no secret accounts. Budget together. Give together.`, reflection_questions: ['How is money causing stress in your marriage?', 'Are you completely transparent financially?', 'What would it look like to get fully aligned?'], prayer_focus: 'Lord, help us steward money in a way that unifies. Give us transparency and shared goals. Amen.' },
    { day_number: 11, title: 'In-Laws and Boundaries', scripture_refs: [{ book: 'Genesis', chapter: 2, verseStart: 24, verseEnd: 24 }], content: `"A man leaves his father and mother and is united to his wife..."\n\n"Leaving" creates space for "cleaving." Your marriage must become your primary family loyalty.\n\nHealthy boundaries honor both your spouse and your parents. You can love your parents deeply while making your marriage primary.`, reflection_questions: ['Have you fully "left" your family of origin emotionally?', 'Are there boundary issues affecting your marriage?', 'How can you honor parents while prioritizing your spouse?'], prayer_focus: 'Lord, help us establish healthy boundaries. Give us wisdom with extended family. Amen.' },
    { day_number: 12, title: 'Raising Children Together', scripture_refs: [{ book: 'Proverbs', chapter: 22, verseStart: 6, verseEnd: 6 }], content: `"Start children off on the way they should go..."\n\nIf you have children, you're parenting together. This requires unity—especially on matters of discipline, values, and faith.\n\nPresent a united front. Don't let parenting consume all your energy until your marriage withers.\n\nThe greatest gift you give your children is a strong marriage.`, reflection_questions: ['Are you united in parenting?', 'How has parenting affected your marriage?', 'What are your children learning by watching you?'], prayer_focus: 'Lord, help us parent as a unified team. Protect our marriage from being consumed by parenting. Amen.' },
    { day_number: 13, title: 'Through Hard Seasons', scripture_refs: [{ book: 'Ecclesiastes', chapter: 4, verseStart: 9, verseEnd: 12 }], content: `"Two are better than one... If either falls down, one can help the other up... A cord of three strands is not quickly broken."\n\nHard seasons come: job loss, illness, grief, conflict. The question isn't whether storms will come, but whether your marriage will survive them.\n\n"A cord of three strands"—marriage with God at the center has triple strength.\n\nWhen things get hard, run to your spouse, not from them.`, reflection_questions: ['How have hard seasons affected your marriage?', 'Do you turn toward or away from your spouse in difficulty?', 'How has God been the third strand?'], prayer_focus: 'Lord, be the third strand in our marriage. When hard seasons come, help us turn toward each other. Amen.' },
    { day_number: 14, title: 'Commitment for a Lifetime', scripture_refs: [{ book: 'Matthew', chapter: 19, verseStart: 4, verseEnd: 6 }], content: `"What God has joined together, let no one separate."\n\nMarriage is covenant, not contract. It's "till death do us part," not "until I'm unhappy."\n\nThis commitment changes everything. When divorce isn't an option, you work things out. When you can't leave, you learn to love.\n\nRenew your commitment today. Pursue each other for a lifetime.`, reflection_questions: ['Is divorce on your mental "options list"?', 'What does lifetime commitment mean practically?', 'How will you continue pursuing your spouse?'], prayer_focus: 'Lord, we commit our marriage to You for a lifetime. What You\'ve joined, we will not let anything separate. Amen.' }
  ]
};

// =====================================================
// POWER OF PRAYER - 14 Day Series
// =====================================================
const POWER_OF_PRAYER = {
  series: {
    slug: 'power-of-prayer',
    title: 'The Power of Prayer',
    description: 'A 14-day journey to transform your prayer life. Learn to commune with God and see prayers answered.',
    total_days: 14,
    topics: ['prayer', 'faith', 'spiritual_growth', 'intimacy_with_god'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'Why Prayer Matters', scripture_refs: [{ book: 'Jeremiah', chapter: 33, verseStart: 3, verseEnd: 3 }], content: `"Call to me and I will answer you and tell you great and unsearchable things you do not know."\n\nGod invites you to call to Him. And He promises to answer—not might, WILL.\n\nPrayer isn't just asking for things. It's communion. Conversation. Connection with the One who made you and loves you.`, reflection_questions: ['How would you describe your current prayer life?', 'Do you truly believe God answers prayer?', 'What might God want to show you?'], prayer_focus: 'Lord, I\'m calling to You. I believe You will answer. Teach me to pray. Transform my prayer life. Amen.' },
    { day_number: 2, title: 'Access to the Father', scripture_refs: [{ book: 'Hebrews', chapter: 4, verseStart: 16, verseEnd: 16 }], content: `"Let us approach God's throne of grace with confidence..."\n\nYou have access to God's throne room. Not tentative access—confident access. Jesus opened the way.\n\n"Throne of grace"—you find mercy, not judgment. Help in your time of need—exactly when you need it.`, reflection_questions: ['Do you approach God with confidence or hesitancy?', 'What has shaped your view of God\'s accessibility?', 'What "time of need" requires grace right now?'], prayer_focus: 'Father, thank You for access through Jesus. Help me approach with confidence, not fear. Amen.' },
    { day_number: 3, title: 'The Lord\'s Prayer: A Model', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 9, verseEnd: 13 }], content: `"This is how you should pray: 'Our Father in heaven...'\n\nJesus gave us a model prayer—not to recite mindlessly, but to structure our praying.\n\nRelationship, worship, alignment, petition, confession, protection. Try praying through each element today.`, reflection_questions: ['Which element do you emphasize most? Neglect most?', 'How might this model transform your prayer?', 'What does "your will be done" mean for your requests?'], prayer_focus: 'Our Father in heaven, hallowed be Your name. Your kingdom come, Your will be done. Give us daily bread. Forgive us as we forgive. Lead us not into temptation. Amen.' },
    { day_number: 4, title: 'Praying with Faith', scripture_refs: [{ book: 'Mark', chapter: 11, verseStart: 24, verseEnd: 24 }], content: `"Whatever you ask for in prayer, believe that you have received it, and it will be yours."\n\nFaith is essential to effective prayer. Not faith in your faith, but faith in God—confidence that He hears, cares, and can act.\n\nDoubt undermines prayer. It says, "God probably can't" or "He probably won't."`, reflection_questions: ['Do you pray expecting God to answer?', 'Where has doubt undermined your prayer life?', 'How can you grow in praying faith?'], prayer_focus: 'Lord, I want to pray with faith, not doubt. Grow my confidence in Your power and willingness. Amen.' },
    { day_number: 5, title: 'Praying God\'s Will', scripture_refs: [{ book: '1 John', chapter: 5, verseStart: 14, verseEnd: 15 }], content: `"If we ask anything according to his will, he hears us."\n\nPraying according to God's will means aligning with His purposes, not manipulating Him into ours.\n\nHow do you know His will? Scripture reveals it. The Spirit guides. Wisdom from counsel helps.`, reflection_questions: ['How confident are you that your prayers align with God\'s will?', 'What helps you discern God\'s will?', 'How has knowing Scripture shaped what you pray for?'], prayer_focus: 'Lord, I want to pray according to Your will. Align my desires with Yours. Amen.' },
    { day_number: 6, title: 'Persistence in Prayer', scripture_refs: [{ book: 'Luke', chapter: 18, verseStart: 1, verseEnd: 8 }], content: `"Jesus told his disciples a parable to show them that they should always pray and not give up..."\n\nSometimes answers take time. Don't interpret delay as denial. Keep asking. Keep seeking. Keep knocking.\n\nThe breakthrough may come suddenly after long persistence.`, reflection_questions: ['What prayers have you given up on?', 'How do you interpret delayed answers?', 'What does Jesus\' teaching on persistence mean for you?'], prayer_focus: 'Lord, help me persist. Prayers I\'ve abandoned—bring them back. Build my faith through persistence. Amen.' },
    { day_number: 7, title: 'The Prayer of Agreement', scripture_refs: [{ book: 'Matthew', chapter: 18, verseStart: 19, verseEnd: 20 }], content: `"If two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven."\n\nThere's power in praying together. When believers agree and bring unified requests to God, something shifts.\n\nFind someone to agree with you in prayer. Let their faith strengthen yours.`, reflection_questions: ['Who do you regularly pray with?', 'What requests need agreement prayer?', 'How could you increase praying with others?'], prayer_focus: 'Lord, bring me into agreement with other believers. Teach us to pray together with unified hearts. Amen.' },
    { day_number: 8, title: 'Praying in Jesus\' Name', scripture_refs: [{ book: 'John', chapter: 14, verseStart: 13, verseEnd: 14 }], content: `"I will do whatever you ask in my name, so that the Father may be glorified in the Son."\n\n"In Jesus' name" isn't a magic formula. It means coming through His access, representing His interests, carrying His authority.\n\nWhen we truly pray in Jesus' name—seeking what He would seek—we pray with His authority behind us.`, reflection_questions: ['What does praying "in Jesus\' name" mean to you?', 'Are your prayers aligned with what Jesus would pray?', 'How does seeking God\'s glory affect what you ask for?'], prayer_focus: 'Lord Jesus, I pray in Your name—representing You, aligned with You, for God\'s glory. Amen.' },
    { day_number: 9, title: 'When God Seems Silent', scripture_refs: [{ book: 'Psalm', chapter: 13, verseStart: 1, verseEnd: 3 }], content: `"How long, LORD? Will you forget me forever?"\n\nSometimes God seems silent. David knew this experience. He was honest with God about it.\n\nKeep praying anyway. Silence doesn't mean absence. Trust His character even when you don't understand what He's doing.`, reflection_questions: ['Have you experienced times when God seemed silent?', 'What might God be doing in seasons of silence?', 'How can you keep praying when answers don\'t come?'], prayer_focus: 'Lord, sometimes You seem silent. But I choose to trust You anyway. Even in silence, I believe You\'re working. Amen.' },
    { day_number: 10, title: 'Praying the Scriptures', scripture_refs: [{ book: 'Isaiah', chapter: 55, verseStart: 11, verseEnd: 11 }], content: `"My word will not return to me empty, but will accomplish what I desire..."\n\nWhen you pray Scripture back to God, you're praying His own words—words guaranteed to achieve their purpose.\n\nTake a Psalm or verse and pray it back to God, personalizing it.`, reflection_questions: ['Have you ever prayed Scripture?', 'What verses could become prayers for your needs?', 'How might praying Scripture transform your prayer life?'], prayer_focus: 'Lord, Your Word doesn\'t return empty. Teach me to pray Your Scriptures. Let Your words become my prayers. Amen.' },
    { day_number: 11, title: 'Intercession for Others', scripture_refs: [{ book: '1 Timothy', chapter: 2, verseStart: 1, verseEnd: 2 }], content: `"I urge that petitions, prayers, intercession and thanksgiving be made for all people..."\n\nIntercession is praying on behalf of others. Your prayers for others actually matter. They accomplish things.\n\nMake a list. Pray through it regularly. Your prayers can change lives you'll never directly touch.`, reflection_questions: ['How much of your prayer is for others versus yourself?', 'Who specifically needs your prayers right now?', 'Do you believe your prayers for others are effective?'], prayer_focus: 'Lord, burden me with prayer for others. [Pray for specific people by name.] Amen.' },
    { day_number: 12, title: 'Spiritual Warfare Prayer', scripture_refs: [{ book: 'Ephesians', chapter: 6, verseStart: 12, verseEnd: 12 }], content: `"Our struggle is not against flesh and blood, but against... spiritual forces of evil..."\n\nThere's a real spiritual battle. Behind visible circumstances, invisible forces are at work. Prayer engages this realm.\n\nDeclare Jesus' victory. Resist the enemy with Scripture. Break strongholds in Jesus' name.`, reflection_questions: ['Are you aware of spiritual forces in situations you\'re praying for?', 'How might spiritual warfare prayer change your approach?', 'What areas need you to "be alert" in prayer?'], prayer_focus: 'Lord, I recognize the real battle. In Jesus\' name, I resist the enemy. I declare Christ\'s victory. Amen.' },
    { day_number: 13, title: 'Thanksgiving and Praise', scripture_refs: [{ book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 6 }], content: `"In every situation, by prayer and petition, with thanksgiving, present your requests to God."\n\nThanksgiving and praise aren't optional—they're essential.\n\nThanksgiving changes perspective. Praise declares who God is regardless of circumstances. Try starting prayer with extended thanksgiving.`, reflection_questions: ['How much thanksgiving is part of your regular prayer?', 'What do you have to thank God for right now?', 'How does praising God affect your perspective?'], prayer_focus: 'Lord, I thank You for [list blessings]. You are [name His attributes]. I praise You for who You are. Amen.' },
    { day_number: 14, title: 'A Lifestyle of Prayer', scripture_refs: [{ book: '1 Thessalonians', chapter: 5, verseStart: 17, verseEnd: 17 }], content: `"Pray continually."\n\nPrayer isn't just an event—it's a lifestyle. Ongoing awareness of God's presence. Brief prayers throughout the day.\n\nScheduled times plus breath prayers plus praying in response to situations. Will prayer become not just something you do, but who you are?`, reflection_questions: ['What would a lifestyle of continual prayer look like?', 'What practical changes would help you pray more consistently?', 'What one commitment will you make from this series?'], prayer_focus: 'Lord, I want prayer to become my lifestyle. Help me pray continually—aware of You always. Transform me into a person of prayer. Amen.' }
  ]
};

// =====================================================
// FORGIVENESS AND HEALING - 14 Day Series
// =====================================================
const FORGIVENESS_HEALING = {
  series: {
    slug: 'forgiveness-healing',
    title: 'Forgiveness and Healing',
    description: 'A 14-day journey to freedom through forgiveness. Release the past and step into healing.',
    total_days: 14,
    topics: ['forgiveness', 'healing', 'freedom', 'grace', 'restoration'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'The Weight of Unforgiveness', scripture_refs: [{ book: 'Hebrews', chapter: 12, verseStart: 15, verseEnd: 15 }], content: `"See to it that no bitter root grows up to cause trouble and defile many."\n\nUnforgiveness is heavy. "Bitter root"—bitterness starts small but grows roots that go deep. It spreads and affects everyone around you.\n\nYou may have legitimate reasons for your bitterness. But carrying the weight is destroying you.`, reflection_questions: ['What bitter roots have you been carrying?', 'How has unforgiveness affected your life?', 'Are you ready to begin the journey toward freedom?'], prayer_focus: 'Lord, I\'ve been carrying bitterness. Show me how it has affected me. Give me courage to begin the journey toward forgiveness. Amen.' },
    { day_number: 2, title: 'How God Forgave You', scripture_refs: [{ book: 'Ephesians', chapter: 4, verseStart: 32, verseEnd: 32 }], content: `"Forgiving each other, just as in Christ God forgave you."\n\nHow did God forgive you? While you were still sinning. Completely. Without bringing it back up. At great cost. Not because you deserved it.\n\nThe more you experience God's forgiveness, the more naturally forgiveness flows from you.`, reflection_questions: ['How deeply do you understand your need for God\'s forgiveness?', 'How does remembering His forgiveness affect your willingness to forgive?', 'What aspect of how God forgave is hardest to extend?'], prayer_focus: 'Father, thank You for forgiving me completely. Help me remember my own need as I consider forgiving others. Amen.' },
    { day_number: 3, title: 'What Forgiveness Is and Isn\'t', scripture_refs: [{ book: 'Matthew', chapter: 18, verseStart: 21, verseEnd: 22 }], content: `"Seventy-seven times."\n\nForgiveness IS: a decision, releasing from your judgment, surrendering vengeance to God, a process.\n\nForgiveness IS NOT: saying it was okay, automatic trust, necessarily reconciliation, forgetting.\n\nYou can forgive and still have boundaries.`, reflection_questions: ['What misconceptions have held you back?', 'Does knowing forgiveness doesn\'t mean trust help you consider it?', 'What would releasing someone to God look like?'], prayer_focus: 'Lord, correct my understanding. Forgiving doesn\'t mean what they did was okay—it means I\'m releasing them to You. Amen.' },
    { day_number: 4, title: 'The Cost of Holding On', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 14, verseEnd: 15 }], content: `"If you do not forgive others their sins, your Father will not forgive your sins."\n\nThe cost of holding on: blocked communion with God, carrying toxic bitterness, replaying offenses, stress on your body, poisoned relationships.\n\n"Unforgiveness is like drinking poison and expecting the other person to die."`, reflection_questions: ['What has holding on cost you?', 'How does unforgiveness keep you stuck?', 'What would freedom from this weight feel like?'], prayer_focus: 'Lord, I\'ve been drinking poison. Show me the full cost of unforgiveness. Give me desire for freedom. Amen.' },
    { day_number: 5, title: 'Acknowledging the Pain', scripture_refs: [{ book: 'Psalm', chapter: 55, verseStart: 12, verseEnd: 14 }], content: `"It is you, my companion, my close friend..."\n\nDavid's pain was from a close friend. That cuts deepest. Before you can forgive, honestly acknowledge what happened and how much it hurt.\n\nWhat happened was real. And it hurt. Being honest about the wound is step one in healing it.`, reflection_questions: ['What specifically did they do that hurt you?', 'How has that wound affected you?', 'Have you minimized the pain?'], prayer_focus: 'Lord, I won\'t pretend it didn\'t hurt. Here\'s what they did and how it affected me. I bring all this pain to You. Amen.' },
    { day_number: 6, title: 'Releasing to God', scripture_refs: [{ book: 'Romans', chapter: 12, verseStart: 19, verseEnd: 19 }], content: `"Leave room for the wrath of God, for it is written: 'It is mine to avenge; I will repay.'"\n\nForgiveness is releasing them to God. Not letting them get away with it—trusting God to handle it.\n\nGod will address wrongs. He sees everything. He judges justly. Justice is His department.`, reflection_questions: ['Have you been trying to be judge and jury?', 'What would it mean to truly release them to God?', 'Can you trust God to deal with them justly?'], prayer_focus: 'Lord, I\'ve been holding onto this. I release them to You. I trust Your justice. Vengeance is Yours. I let go. Amen.' },
    { day_number: 7, title: 'The Choice to Forgive', scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 13, verseEnd: 13 }], content: `"Forgive as the Lord forgave you."\n\nForgiveness is a choice. Not waiting until you feel like it. Deciding today: I choose to forgive.\n\nSay it out loud. Write it down. Tell God. Make it concrete. Every time bitterness resurfaces, remind yourself: I've chosen to forgive.`, reflection_questions: ['Are you ready to make the choice?', 'If not, what is holding you back?', 'What specific person and offense do you need to address?'], prayer_focus: 'Lord, I choose to forgive [name] for [specific offenses]. This is my decision. Help me walk it out. Amen.' },
    { day_number: 8, title: 'Forgiving Yourself', scripture_refs: [{ book: '1 John', chapter: 1, verseStart: 9, verseEnd: 9 }], content: `"If we confess our sins, he is faithful and just to forgive us..."\n\nSometimes the hardest person to forgive is yourself. But if God has forgiven you, who are you to hold it against yourself?\n\n"No condemnation"—none. Receive His verdict. You are forgiven.`, reflection_questions: ['What do you hold against yourself?', 'How is refusing to forgive yourself disagreeing with God?', 'What would it mean to receive "no condemnation"?'], prayer_focus: 'Lord, I\'ve held this against myself. But You\'ve forgiven me. I release myself from my own condemnation. Amen.' },
    { day_number: 9, title: 'When Forgiving Is Hard', scripture_refs: [{ book: 'Luke', chapter: 23, verseStart: 34, verseEnd: 34 }], content: `"Father, forgive them, for they do not know what they are doing."\n\nJesus forgave while hanging on the cross. Some offenses are harder to forgive—abuse, betrayal, violence.\n\nYou don't have to manufacture feeling—start with willing. Ask God for supernatural help.`, reflection_questions: ['What makes forgiveness feel impossible?', 'How does Jesus\' example speak to your situation?', 'What supernatural help do you need?'], prayer_focus: 'Lord, this is hard. I can\'t do this in my own strength. Give me supernatural ability to forgive. Amen.' },
    { day_number: 10, title: 'Forgiveness and Boundaries', scripture_refs: [{ book: 'Proverbs', chapter: 4, verseStart: 23, verseEnd: 23 }], content: `"Above all else, guard your heart..."\n\nForgiveness doesn't mean becoming a victim again. You can forgive and still have healthy boundaries.\n\nYou can say: "I forgive you, but I won't be in relationship with you." Forgiveness releases the past. Boundaries protect the future.`, reflection_questions: ['Have you confused forgiveness with removing all boundaries?', 'What healthy boundaries do you need?', 'How can you be both forgiving and wise?'], prayer_focus: 'Lord, help me forgive without being foolish. Show me what boundaries are necessary. Amen.' },
    { day_number: 11, title: 'The Question of Reconciliation', scripture_refs: [{ book: 'Romans', chapter: 12, verseStart: 18, verseEnd: 18 }], content: `"If it is possible, as far as it depends on you, live at peace with everyone."\n\nForgiveness is required. Reconciliation isn't always possible. It requires acknowledgment, repentance, changed behavior, and willingness from both parties.\n\nYour healing doesn't depend on their response.`, reflection_questions: ['Is reconciliation possible in your situation?', 'What would need to happen for reconciliation?', 'Can you accept that your freedom doesn\'t depend on them?'], prayer_focus: 'Lord, I want peace if it\'s possible. Show me what depends on me. But free me from needing their response. Amen.' },
    { day_number: 12, title: 'Healing the Wounds', scripture_refs: [{ book: 'Psalm', chapter: 147, verseStart: 3, verseEnd: 3 }], content: `"He heals the brokenhearted and binds up their wounds."\n\nForgiveness opens the door to healing. But healing takes time, like a physical wound.\n\nBring your pain to God regularly. Replace lies with truth. Let healthy relationships bring healing. Some wounds may need professional help.`, reflection_questions: ['What wounds still need healing?', 'How can you actively invite God into healing?', 'Do you need additional help for deep wounds?'], prayer_focus: 'Lord, I\'ve chosen to forgive. Now heal my wounds. Replace lies with truth. Bring beauty from ashes. Amen.' },
    { day_number: 13, title: 'When Memories Return', scripture_refs: [{ book: 'Isaiah', chapter: 43, verseStart: 18, verseEnd: 19 }], content: `"Do not dwell on the past. See, I am doing a new thing!"\n\nMemories will return. This doesn't mean forgiveness failed. There's a difference between remembering and dwelling.\n\nEach time you choose not to dwell, the power weakens. Look for the new thing God is doing.`, reflection_questions: ['How do you respond when painful memories return?', 'What\'s the difference between remembering and dwelling?', 'What "new thing" might God be doing?'], prayer_focus: 'Lord, when memories return, help me not dwell. Help me see the new thing You\'re doing. Amen.' },
    { day_number: 14, title: 'Living in Freedom', scripture_refs: [{ book: 'Galatians', chapter: 5, verseStart: 1, verseEnd: 1 }], content: `"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again."\n\nFreedom. No longer enslaved to bitterness. No longer chained to the past.\n\n"Stand firm"—freedom requires vigilance. Refuse to be re-enslaved. You are free indeed.`, reflection_questions: ['What does freedom feel like after this journey?', 'How will you stand firm and not be burdened again?', 'How might your journey help someone else?'], prayer_focus: 'Lord, thank You for freedom. I stand firm. I will not be enslaved again. May my story help others find the same. Amen.' }
  ]
};

// =====================================================
// MAN OF VALOR - 14 Day Series
// =====================================================
const MAN_OF_VALOR = {
  series: {
    slug: 'man-of-valor',
    title: 'Man of Valor: Called to Courage',
    description: 'A 14-day journey for men to discover their God-given calling. Strength, courage, and character.',
    total_days: 14,
    topics: ['men', 'courage', 'character', 'leadership', 'identity'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'Called to Be Strong', scripture_refs: [{ book: 'Joshua', chapter: 1, verseStart: 9, verseEnd: 9 }], content: `"Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."\n\nGod is calling you to strength and courage. Not optional—a command.\n\nStrength doesn't come from pretending you're not scared. It comes from knowing who is with you.`, reflection_questions: ['What battles are you facing that require courage?', 'How does knowing God is with you change how you face them?', 'Are you ready to step into the strength God is calling you to?'], prayer_focus: 'Lord, I hear Your command to be strong and courageous. Give me the strength I need for the battles ahead. Amen.' },
    { day_number: 2, title: 'Identity in Christ', scripture_refs: [{ book: '2 Corinthians', chapter: 5, verseStart: 17, verseEnd: 17 }], content: `"If anyone is in Christ, the new creation has come: The old has gone, the new is here!"\n\nYour truest identity is found in Him. You are IN Christ. United to Him. You're not just improved—you're remade.\n\nYou are: Forgiven. Accepted. Chosen. Loved unconditionally. Equipped.`, reflection_questions: ['Where have you been finding your identity outside of Christ?', 'What does it mean practically that you\'re a new creation?', 'How would living from this identity change your daily life?'], prayer_focus: 'Father, I am a new creation in Christ. Help me live from this identity, not from performance or past failures. Amen.' },
    { day_number: 3, title: 'Integrity: The Foundation', scripture_refs: [{ book: 'Proverbs', chapter: 11, verseStart: 3, verseEnd: 3 }], content: `"The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity."\n\nIntegrity means being the same man in every context. What you are in public matches what you are in private.\n\nWho are you when no one is watching?`, reflection_questions: ['Is there any area lacking integrity?', 'What small compromises might be leading somewhere dangerous?', 'Who are you when no one is watching?'], prayer_focus: 'Lord, make me a man of integrity. Close the gap between my public and private life. Amen.' },
    { day_number: 4, title: 'Purity: Guarding Your Heart', scripture_refs: [{ book: 'Job', chapter: 31, verseStart: 1, verseEnd: 1 }], content: `"I made a covenant with my eyes not to look lustfully at a young woman."\n\nThe battle for purity is real. Job made a covenant with his eyes before temptation had a chance.\n\nSet up accountability. Use safeguards. Fill your mind with Scripture instead.`, reflection_questions: ['Have you made a covenant with your eyes?', 'What accountability do you have for purity?', 'What practical steps could you take?'], prayer_focus: 'Lord, I make a covenant with my eyes. Purify my heart. Give me hatred for lust and love for holiness. Amen.' },
    { day_number: 5, title: 'Provider and Protector', scripture_refs: [{ book: '1 Timothy', chapter: 5, verseStart: 8, verseEnd: 8 }], content: `"Anyone who does not provide for their own household has denied the faith..."\n\nProviding includes: financial, emotional, spiritual provision, and physical protection.\n\nWhat does your family need from you that money can't buy?`, reflection_questions: ['In what ways are you faithfully providing?', 'What kinds of provision have you neglected?', 'What does your family need beyond financial support?'], prayer_focus: 'Lord, help me provide for my family in every way. Show me what they need. Help me be present, not just productive. Amen.' },
    { day_number: 6, title: 'Loving Your Wife', scripture_refs: [{ book: 'Ephesians', chapter: 5, verseStart: 25, verseEnd: 25 }], content: `"Husbands, love your wives, just as Christ loved the church and gave himself up for her."\n\nThis is the highest standard—not "as she deserves" but "as Christ loved the church." Sacrificially.\n\nIs your wife flourishing under your leadership?`, reflection_questions: ['How does your love compare to Christ\'s love for the church?', 'What sacrifice is your wife needing from you?', 'Is your wife flourishing under your love?'], prayer_focus: 'Lord, teach me to love my wife like You love the church. Help me lead in sacrificial love. Amen.' },
    { day_number: 7, title: 'Fathering Well', scripture_refs: [{ book: 'Ephesians', chapter: 6, verseStart: 4, verseEnd: 4 }], content: `"Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord."\n\nFathers have enormous power—to build up or tear down. Your children are watching, learning, being shaped by you.\n\nWhat will your children remember about you?`, reflection_questions: ['How might you be exasperating your children?', 'Are you intentionally discipling them spiritually?', 'What will your children remember about you?'], prayer_focus: 'Father, help me father well. Let my children see You in me. Amen.' },
    { day_number: 8, title: 'Working with Purpose', scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 24 }], content: `"Whatever you do, work at it with all your heart, as working for the Lord..."\n\nWork is worship. You're representing Jesus in your workplace. Every task becomes an opportunity to honor Him.\n\nWhatever your job—do it excellently for Jesus.`, reflection_questions: ['How would viewing your work as service to Christ change your approach?', 'Are there areas where you\'ve been half-hearted?', 'How might your workplace be a platform for representing Jesus?'], prayer_focus: 'Lord, help me see my work as worship. Use my workplace for Your purposes. Amen.' },
    { day_number: 9, title: 'Managing Anger', scripture_refs: [{ book: 'James', chapter: 1, verseStart: 19, verseEnd: 20 }], content: `"Everyone should be quick to listen, slow to speak and slow to become angry, because human anger does not produce the righteousness that God desires."\n\nAnger itself isn't sin. But quick, uncontrolled anger causes damage.\n\nYour family shouldn't fear your temper. They should feel safe with you.`, reflection_questions: ['How would those closest to you describe your temper?', 'What triggers your anger? What\'s underneath it?', 'What would help you become slower to anger?'], prayer_focus: 'Lord, give me self-control. Help me be slow to anger and quick to listen. Amen.' },
    { day_number: 10, title: 'The Power of Words', scripture_refs: [{ book: 'Proverbs', chapter: 18, verseStart: 21, verseEnd: 21 }], content: `"The tongue has the power of life and death..."\n\nYour words carry immense power. They can build up or tear down. Give life or bring death.\n\nYour children especially need your words. What life or death are your words bringing?`, reflection_questions: ['What words from your past have most shaped you?', 'What kind of words do you most often speak to your family?', 'Whose life could you speak into today?'], prayer_focus: 'Lord, set a guard over my mouth. Let my words bring life, not death. Amen.' },
    { day_number: 11, title: 'Standing Against Temptation', scripture_refs: [{ book: '1 Corinthians', chapter: 10, verseStart: 13, verseEnd: 13 }], content: `"God will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out..."\n\nEvery temptation you face is one you CAN resist. With every temptation, there's an escape.\n\nThe way out exists. Will you take it?`, reflection_questions: ['What temptations do you face most consistently?', 'Do you look for the "way out" when tempted?', 'What escape routes could you set up in advance?'], prayer_focus: 'Lord, help me see the escape and take it. Give me strength to stand. Amen.' },
    { day_number: 12, title: 'Brotherhood and Accountability', scripture_refs: [{ book: 'Proverbs', chapter: 27, verseStart: 17, verseEnd: 17 }], content: `"As iron sharpens iron, so one person sharpens another."\n\nYou weren't meant to do this alone. Men of valor need other men of valor.\n\nFind a band of brothers. Be honest with each other. Fight together.`, reflection_questions: ['Do you have real brotherhood—men who know your struggles?', 'Who sharpens you and whom do you sharpen?', 'What keeps you from deeper friendships?'], prayer_focus: 'Lord, I need brothers. Break through my isolation. Bring men into my life who will sharpen me. Amen.' },
    { day_number: 13, title: 'Finishing Strong', scripture_refs: [{ book: '2 Timothy', chapter: 4, verseStart: 7, verseEnd: 7 }], content: `"I have fought the good fight, I have finished the race, I have kept the faith."\n\nHow you start matters. How you finish matters more.\n\nGuard your finish. What you do now determines how you end.`, reflection_questions: ['If your race ended today, how would you assess your finish?', 'What threatens your ability to finish strong?', 'What do you need to do now to ensure you finish well?'], prayer_focus: 'Lord, I want to finish strong. Protect me from what would derail me. Help me run well to the end. Amen.' },
    { day_number: 14, title: 'Legacy: What Will You Leave?', scripture_refs: [{ book: 'Psalm', chapter: 78, verseStart: 4, verseEnd: 7 }], content: `"We will tell the next generation the praiseworthy deeds of the LORD... so the next generation would know them..."\n\nLegacy is what lives after you're gone. Your story of God's faithfulness becomes their foundation.\n\nNow live it. Be the man God has called you to be.`, reflection_questions: ['What legacy are you currently building?', 'What do you want your children to remember about you?', 'What one thing will you commit to from this series?'], prayer_focus: 'Lord, help me build a legacy of faith for the next generation. May my life point others to You. Amen.' }
  ]
};

// =====================================================
// WOMAN OF GRACE - 14 Day Series
// =====================================================
const WOMAN_OF_GRACE = {
  series: {
    slug: 'woman-of-grace',
    title: 'Woman of Grace: Rooted in Christ',
    description: 'A 14-day journey for women to discover their identity and calling. Strength through grace.',
    total_days: 14,
    topics: ['women', 'identity', 'grace', 'purpose', 'faith'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'Created with Purpose', scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 10, verseEnd: 10 }], content: `"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do."\n\nYou are God's handiwork—His masterpiece. Created intentionally. Formed with purpose. Prepared for good works.\n\nYou are not an accident or an afterthought.`, reflection_questions: ['Do you see yourself as God\'s handiwork?', 'What good works might God have prepared for you?', 'How does knowing you\'re His masterpiece change your self-view?'], prayer_focus: 'Lord, thank You for creating me with purpose. Help me see myself as Your handiwork and walk in the good works You\'ve prepared. Amen.' },
    { day_number: 2, title: 'Daughter of the King', scripture_refs: [{ book: '1 John', chapter: 3, verseStart: 1, verseEnd: 1 }], content: `"See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!"\n\nYou are a daughter of the King. Not striving to become—you already ARE. His love lavished on you.\n\nThis is your truest identity.`, reflection_questions: ['What other identities compete with "daughter of the King"?', 'How does being royalty change how you face life?', 'What would change if you lived from this identity daily?'], prayer_focus: 'Father, thank You for calling me Your daughter. Help me live from this identity. I am Yours. Amen.' },
    { day_number: 3, title: 'Grace Upon Grace', scripture_refs: [{ book: 'John', chapter: 1, verseStart: 16, verseEnd: 16 }], content: `"Out of his fullness we have all received grace in place of grace already given."\n\nGrace upon grace. Not earning, but receiving. Not performing, but resting.\n\nHis grace is sufficient for every situation, every failure, every need.`, reflection_questions: ['Where do you need to receive grace today?', 'How does grace differ from self-effort?', 'What would resting in grace look like practically?'], prayer_focus: 'Lord, I receive Your grace today—grace upon grace. Where I\'ve been striving, help me rest. Your grace is enough. Amen.' },
    { day_number: 4, title: 'Strength in Gentleness', scripture_refs: [{ book: '1 Peter', chapter: 3, verseStart: 3, verseEnd: 4 }], content: `"Your beauty should not come from outward adornment... Rather, it should be that of your inner self, the unfading beauty of a gentle and quiet spirit, which is of great worth in God's sight."\n\nTrue beauty is internal. A gentle and quiet spirit isn't weak—it's strength under control.\n\nThis beauty doesn't fade with age. It's of great worth to God.`, reflection_questions: ['Where does the world tell you to find your beauty?', 'What does a "gentle and quiet spirit" look like in your life?', 'How can you cultivate inner beauty?'], prayer_focus: 'Lord, give me unfading beauty—a gentle and quiet spirit. Let my worth come from within, not from outward appearance. Amen.' },
    { day_number: 5, title: 'Renewed Mind', scripture_refs: [{ book: 'Romans', chapter: 12, verseStart: 2, verseEnd: 2 }], content: `"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."\n\nThe world constantly patterns your thinking—through media, culture, comparison. But transformation comes through renewing your mind.\n\nWhat you feed grows. What you starve dies.`, reflection_questions: ['What patterns of the world have shaped your thinking?', 'What do you feed your mind most consistently?', 'What changes to your content consumption would help?'], prayer_focus: 'Lord, transform me by renewing my mind. Show me where I\'ve been conformed to worldly patterns. Fill my mind with Your truth. Amen.' },
    { day_number: 6, title: 'Rest for the Weary', scripture_refs: [{ book: 'Matthew', chapter: 11, verseStart: 28, verseEnd: 30 }], content: `"Come to me, all you who are weary and burdened, and I will give you rest."\n\nJesus invites the weary to rest—not work harder, rest. He offers to carry what you've been dragging.\n\nHis yoke is easy. His burden is light. Come.`, reflection_questions: ['What has made you weary?', 'What burdens are you carrying that Jesus wants to take?', 'What would it look like to truly rest in Him?'], prayer_focus: 'Jesus, I\'m weary. I bring my burdens to You. Teach me to rest in You. Your yoke is easy. Help me receive Your rest. Amen.' },
    { day_number: 7, title: 'Confident in Christ', scripture_refs: [{ book: 'Philippians', chapter: 1, verseStart: 6, verseEnd: 6 }], content: `"Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus."\n\nGod started something in you—and He'll finish it. Your sanctification isn't all on you.\n\nHe's not abandoning the project. He's committed to completing it.`, reflection_questions: ['What "good work" has God begun in you?', 'Where do you need confidence that He\'ll complete it?', 'How does knowing He finishes what He starts change your outlook?'], prayer_focus: 'Lord, You began a good work in me. I trust You to complete it. Give me confidence in Your faithfulness. Amen.' },
    { day_number: 8, title: 'Clothed in Strength', scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 25, verseEnd: 25 }], content: `"She is clothed with strength and dignity; she can laugh at the days to come."\n\nStrength and dignity aren't added—they're worn daily. They come from knowing who you are in Christ.\n\nFear of the future gives way to laughter when you know who holds it.`, reflection_questions: ['Do you face the future with fear or with laughter?', 'What does being clothed in strength and dignity look like?', 'How would confidence in God change your outlook?'], prayer_focus: 'Lord, clothe me with strength and dignity. Replace my fear of the future with confident trust in You. Amen.' },
    { day_number: 9, title: 'Speaking Life', scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 26, verseEnd: 26 }], content: `"She speaks with wisdom, and faithful instruction is on her tongue."\n\nYour words carry power. They can build up or tear down. Give life or bring death.\n\nSpeak wisdom. Offer faithful instruction. Let your words bring life to everyone around you.`, reflection_questions: ['What kind of words do you most often speak?', 'Who needs life-giving words from you?', 'How can you grow in speaking wisdom?'], prayer_focus: 'Lord, let wisdom be on my tongue. Help me speak life into every situation. May my words build up, not tear down. Amen.' },
    { day_number: 10, title: 'Serving with Joy', scripture_refs: [{ book: 'Galatians', chapter: 5, verseStart: 13, verseEnd: 13 }], content: `"Serve one another humbly in love."\n\nService isn't servitude—it's love in action. It's choosing others' good over your convenience.\n\nWhen done for Jesus, even mundane tasks become worship.`, reflection_questions: ['Does your service come from joy or obligation?', 'Who in your life needs your humble service?', 'How might viewing service as worship change your attitude?'], prayer_focus: 'Lord, give me joy in serving others. Help me see service as worship. May my humble love bless those around me. Amen.' },
    { day_number: 11, title: 'Community and Connection', scripture_refs: [{ book: 'Hebrews', chapter: 10, verseStart: 24, verseEnd: 25 }], content: `"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together..."\n\nYou weren't made to do this alone. You need community—to be encouraged and to encourage others.\n\nIsolation weakens. Connection strengthens.`, reflection_questions: ['Are you in authentic community with other believers?', 'Who spurs you on toward love and good deeds?', 'What keeps you from deeper connection?'], prayer_focus: 'Lord, bring me into deeper community. Help me both give and receive encouragement. Break through my isolation. Amen.' },
    { day_number: 12, title: 'Overcoming Comparison', scripture_refs: [{ book: 'Galatians', chapter: 6, verseStart: 4, verseEnd: 5 }], content: `"Each one should test their own actions. Then they can take pride in themselves alone, without comparing themselves to someone else..."\n\nComparison steals joy. It makes you feel either inferior or superior—both are traps.\n\nYou run your own race. Your calling is unique.`, reflection_questions: ['Where does comparison steal your joy most often?', 'What triggers comparison for you?', 'How can you focus on your own calling instead?'], prayer_focus: 'Lord, free me from comparison. Help me run my own race with joy. Give me eyes for my own calling, not others\' paths. Amen.' },
    { day_number: 13, title: 'Walking in Freedom', scripture_refs: [{ book: 'Galatians', chapter: 5, verseStart: 1, verseEnd: 1 }], content: `"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery."\n\nYou are free. Free from sin's power. Free from others' expectations. Free from your own condemnation.\n\nStand firm in this freedom.`, reflection_questions: ['What has tried to re-enslave you?', 'What does freedom in Christ look like practically?', 'How will you stand firm in your freedom?'], prayer_focus: 'Lord, thank You for freedom. Help me stand firm and not be burdened again. I am free in Christ. Amen.' },
    { day_number: 14, title: 'Living Your Calling', scripture_refs: [{ book: '1 Peter', chapter: 4, verseStart: 10, verseEnd: 10 }], content: `"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms."\n\nYou have gifts. God-given. For serving others. For displaying His grace.\n\nYou are a steward. What will you do with what you've been given?`, reflection_questions: ['What gifts has God given you?', 'How are you using them to serve others?', 'What one step will you take to live your calling more fully?'], prayer_focus: 'Lord, show me my gifts and how to use them. Make me a faithful steward of Your grace. Help me live my calling fully. Amen.' }
  ]
};

// =====================================================
// DEALING WITH GRIEF - 14 Day Series
// =====================================================
const DEALING_WITH_GRIEF = {
  series: {
    slug: 'dealing-grief',
    title: 'Walking Through Grief',
    description: 'A 14-day companion for those experiencing loss. Find comfort and hope in God\'s presence.',
    total_days: 14,
    topics: ['grief', 'loss', 'comfort', 'hope', 'healing'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'Permission to Grieve', scripture_refs: [{ book: 'Ecclesiastes', chapter: 3, verseStart: 4, verseEnd: 4 }], content: `"A time to weep and a time to laugh, a time to mourn and a time to dance."\n\nThere is a time to mourn. Grief is not weakness—it's appropriate response to loss. You don't have to be strong for everyone else.\n\nGive yourself permission to grieve.`, reflection_questions: ['Have you given yourself permission to fully grieve?', 'What expectations (your own or others\') are you placing on yourself?', 'What does it mean that there is "a time to mourn"?'], prayer_focus: 'Lord, I\'m grieving. Give me permission to mourn fully. Don\'t let me rush through this or stuff it down. Be with me in the tears. Amen.' },
    { day_number: 2, title: 'God Sees Your Tears', scripture_refs: [{ book: 'Psalm', chapter: 56, verseStart: 8, verseEnd: 8 }], content: `"You keep track of all my sorrows. You have collected all my tears in your bottle. You have recorded each one in your book."\n\nGod sees every tear. He collects them. He records them. Your grief matters to Him.\n\nYou are not alone in your sorrow.`, reflection_questions: ['Does knowing God collects your tears change how you grieve?', 'How does it feel to know your sorrow matters to God?', 'What do you most need God to see right now?'], prayer_focus: 'Lord, You see my tears. You know my sorrow. Thank You for caring about my grief. I\'m not alone. Amen.' },
    { day_number: 3, title: 'He Is Close to the Brokenhearted', scripture_refs: [{ book: 'Psalm', chapter: 34, verseStart: 18, verseEnd: 18 }], content: `"The LORD is close to the brokenhearted and saves those who are crushed in spirit."\n\nWhen your heart is broken, God draws near. He doesn't stand at a distance. He moves CLOSE.\n\nHis presence is available right now in your darkest moment.`, reflection_questions: ['Do you feel God is close or distant in your grief?', 'How might knowing He is near change how you experience this?', 'What would it mean to receive His presence right now?'], prayer_focus: 'Lord, my heart is broken. But You are close. I receive Your presence. Draw near to me. Don\'t let me feel alone. Amen.' },
    { day_number: 4, title: 'Jesus Understands', scripture_refs: [{ book: 'John', chapter: 11, verseStart: 35, verseEnd: 35 }], content: `"Jesus wept."\n\nThe shortest verse in the Bible, but among the most profound. Jesus—God incarnate—wept at the death of His friend.\n\nHe understands your grief. He's not distant from human pain. He entered into it Himself.`, reflection_questions: ['What does Jesus weeping tell you about how He sees your grief?', 'How does knowing He understands change how you approach Him?', 'What pain do you need Him to understand today?'], prayer_focus: 'Jesus, You wept. You understand. Weep with me now. Enter into my pain. I need to know You get it. Amen.' },
    { day_number: 5, title: 'Honest with God', scripture_refs: [{ book: 'Psalm', chapter: 13, verseStart: 1, verseEnd: 2 }], content: `"How long, LORD? Will you forget me forever? How long must I wrestle with my thoughts and day after day have sorrow in my heart?"\n\nDavid was brutally honest with God. He brought his questions, his frustration, his pain.\n\nYou can be honest too. God can handle your questions.`, reflection_questions: ['What honest questions or feelings have you been afraid to bring to God?', 'How does David\'s honesty give you permission for your own?', 'What do you need to tell God honestly today?'], prayer_focus: 'Lord, I\'m going to be honest: [tell Him everything]. I bring my real questions and feelings. I trust You can handle them. Amen.' },
    { day_number: 6, title: 'Comfort for the Mourning', scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 4, verseEnd: 4 }], content: `"Blessed are those who mourn, for they will be comforted."\n\nJesus promises comfort to those who mourn. Not that mourning will be avoided, but that comfort will come.\n\nBlessing waits on the other side of grief. But first, the mourning.`, reflection_questions: ['What does it mean that mourners are "blessed"?', 'Have you experienced God\'s comfort in grief?', 'What comfort are you most longing for?'], prayer_focus: 'Lord, I mourn. I claim Your promise of comfort. Let me experience Your comfort today. I need You. Amen.' },
    { day_number: 7, title: 'Grief Is Not Linear', scripture_refs: [{ book: 'Psalm', chapter: 77, verseStart: 2, verseEnd: 3 }], content: `"When I was in distress, I sought the Lord; at night I stretched out untiring hands, and I would not be comforted. I remembered you, God, and I groaned..."\n\nGrief isn't linear. It comes in waves. Good days and bad days. Progress and setbacks.\n\nThis is normal. Don't judge yourself for the waves.`, reflection_questions: ['Have you judged yourself for "bad days" in grief?', 'How have the waves of grief surprised you?', 'What would it mean to give yourself grace for the process?'], prayer_focus: 'Lord, grief comes in waves. When bad days come, help me not judge myself. Walk with me through every wave. Amen.' },
    { day_number: 8, title: 'The God of All Comfort', scripture_refs: [{ book: '2 Corinthians', chapter: 1, verseStart: 3, verseEnd: 4 }], content: `"Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles..."\n\nGod is the "God of all comfort." Not some comfort. ALL comfort. Every kind of comfort you need, He provides.\n\nHe is the Father of compassion.`, reflection_questions: ['Do you know God as the "God of all comfort"?', 'What kind of comfort do you most need right now?', 'How might receiving His comfort equip you to comfort others?'], prayer_focus: 'Father of compassion, be my Comforter. Give me the comfort I need today. Wrap me in Your care. Amen.' },
    { day_number: 9, title: 'Hope Beyond the Grave', scripture_refs: [{ book: '1 Thessalonians', chapter: 4, verseStart: 13, verseEnd: 14 }], content: `"Brothers and sisters, we do not want you to be uninformed about those who sleep in death, so that you do not grieve like the rest of mankind, who have no hope."\n\nWe grieve—but not without hope. For believers, death is not the end. Reunion is coming.\n\nThis hope doesn't eliminate grief, but it transforms it.`, reflection_questions: ['How does hope of resurrection affect how you grieve?', 'What reunion do you look forward to?', 'How can hope coexist with present grief?'], prayer_focus: 'Lord, I grieve but not without hope. Thank You for the promise of resurrection. Hold that hope before me in dark days. Amen.' },
    { day_number: 10, title: 'No More Tears', scripture_refs: [{ book: 'Revelation', chapter: 21, verseStart: 4, verseEnd: 4 }], content: `"He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain..."\n\nOne day, all tears will be wiped away. Death will be defeated. Mourning will end. Pain will cease.\n\nThis is where it's all heading. Hold on.`, reflection_questions: ['How does this future hope help you in present grief?', 'What are you most longing for in that day?', 'How can eternal perspective help you endure?'], prayer_focus: 'Lord, I long for that day—no more tears, no more death, no more pain. Help me hold onto hope until I see it. Amen.' },
    { day_number: 11, title: 'Carried by Community', scripture_refs: [{ book: 'Galatians', chapter: 6, verseStart: 2, verseEnd: 2 }], content: `"Carry each other's burdens, and in this way you will fulfill the law of Christ."\n\nYou weren't meant to grieve alone. Let others carry some of the weight. Let community hold you up.\n\nThis isn't weakness. This is wisdom.`, reflection_questions: ['Have you let others into your grief?', 'Who could help carry this burden?', 'What keeps you from accepting help?'], prayer_focus: 'Lord, help me not grieve alone. Show me who I can let in. Give me humility to receive help. Surround me with caring community. Amen.' },
    { day_number: 12, title: 'God Works in Loss', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 }], content: `"And we know that in all things God works for the good of those who love him..."\n\nEven in loss, God is working. This doesn't make the loss good, but it means God can bring good from it.\n\nHe wastes nothing. Even this grief.`, reflection_questions: ['How might God bring good from this loss—someday?', 'What feels impossible to redeem about your grief?', 'Can you trust God is working even when you can\'t see it?'], prayer_focus: 'Lord, I trust You are working even in this. I don\'t understand it, but I believe You can bring good. Don\'t waste this pain. Amen.' },
    { day_number: 13, title: 'Taking the Next Step', scripture_refs: [{ book: 'Psalm', chapter: 23, verseStart: 4, verseEnd: 4 }], content: `"Even though I walk through the darkest valley, I will fear no evil, for you are with me..."\n\nNote the verb: walk. You keep moving through the valley. You don't stay in one place forever.\n\nBut you're not alone. He is with you. One step at a time.`, reflection_questions: ['What does "walking through" look like for you right now?', 'What is the next small step you could take?', 'How does knowing He is with you give courage to keep moving?'], prayer_focus: 'Lord, I\'m walking through a dark valley. Go with me. Help me take the next step. I will fear no evil because You are with me. Amen.' },
    { day_number: 14, title: 'Joy Will Come', scripture_refs: [{ book: 'Psalm', chapter: 30, verseStart: 5, verseEnd: 5 }], content: `"Weeping may stay for the night, but rejoicing comes in the morning."\n\nThis night of weeping won't last forever. Morning is coming. Joy will return.\n\nNot today perhaps. Maybe not tomorrow. But it will come. Hold on.`, reflection_questions: ['Can you believe that joy will come again?', 'What glimpses of "morning" have you seen?', 'What will help you hold on until joy returns?'], prayer_focus: 'Lord, I believe weeping won\'t last forever. Help me hold on until joy comes. Bring the morning. Restore what grief has taken. Amen.' }
  ]
};

// =====================================================
// BIBLICAL PARENTING - 14 Day Series
// =====================================================
const BIBLICAL_PARENTING = {
  series: {
    slug: 'biblical-parenting',
    title: 'Biblical Parenting',
    description: 'A 14-day journey through Scripture to discover God\'s wisdom for raising children in faith, love, and truth.',
    total_days: 14,
    topics: ['parenting', 'family', 'children', 'discipline', 'love'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'The Sacred Trust', scripture_refs: [{ book: 'Psalm', chapter: 127, verseStart: 3, verseEnd: 5 }], content: `"Children are a heritage from the LORD, offspring a reward from him."\n\nYour children don't belong to you—they belong to God. He has entrusted them to your care for a season. This changes everything about how we parent.\n\nWhen we see children as our possessions, we try to mold them into our image. When we see them as God's heritage, we steward them toward His purposes.\n\nYou are not just raising a child. You are shaping an eternal soul. What a sacred, humbling responsibility.`, reflection_questions: ['How does viewing your children as "God\'s heritage" change your approach to parenting?', 'What does it mean to steward rather than possess your children?', 'How can you honor God in your parenting today?'], prayer_focus: 'Lord, thank You for entrusting these children to me. Help me remember they are Yours first. Give me wisdom to steward them well and point them toward You. Amen.' },
    { day_number: 2, title: 'Teaching Diligently', scripture_refs: [{ book: 'Deuteronomy', chapter: 6, verseStart: 6, verseEnd: 9 }], content: `"These commandments... Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up."\n\nFaith isn't taught in a single conversation—it's woven into the fabric of daily life. Every moment is a teaching moment.\n\nThe car ride. The dinner table. The bedtime routine. The walk to school. These ordinary moments become sacred when we intentionally point our children to God.\n\nYou don't need a seminary degree. You need presence, intentionality, and a heart that overflows with love for God.`, reflection_questions: ['What everyday moments could become opportunities to teach faith?', 'How naturally does faith come up in your daily conversations with your children?', 'What one thing could you do this week to be more intentional?'], prayer_focus: 'Father, help me see every moment as an opportunity to point my children to You. Give me words that stick, examples that inspire, and consistency that builds trust. Amen.' },
    { day_number: 3, title: 'Discipline with Love', scripture_refs: [{ book: 'Proverbs', chapter: 13, verseStart: 24, verseEnd: 24 }, { book: 'Ephesians', chapter: 6, verseStart: 4, verseEnd: 4 }], content: `"Whoever spares the rod hates their son, but the one who loves their children is careful to discipline them."\n\nDiscipline isn't about punishment—it's about discipleship. The word itself comes from "disciple." We're training followers of Christ.\n\nBut Paul adds crucial balance: "Fathers, do not exasperate your children." Discipline without love creates rebellion. Love without discipline creates chaos.\n\nThe goal isn't compliance—it's transformation. Not just changed behavior, but changed hearts.`, reflection_questions: ['What is your current approach to discipline? Is it balanced with love?', 'Have you ever exasperated your children? What happened?', 'How can you discipline in a way that points to grace?'], prayer_focus: 'Lord, give me wisdom to discipline with love, not anger. Help my correction point to Your grace. Let my children see You in how I guide them. Amen.' },
    { day_number: 4, title: 'Modeling Faith', scripture_refs: [{ book: '1 Corinthians', chapter: 11, verseStart: 1, verseEnd: 1 }], content: `"Follow my example, as I follow the example of Christ."\n\nChildren learn far more from what they see than what they hear. Your life is the loudest sermon you'll ever preach.\n\nDo they see you pray—really pray? Do they see you read Scripture? Do they see you repent when you're wrong? Do they see you trust God when things are hard?\n\nYou don't have to be perfect. In fact, letting them see you fail and get back up teaches them more about grace than any lecture ever could.`, reflection_questions: ['What does your life currently teach your children about faith?', 'Where might your actions contradict your words?', 'How can you model authentic, imperfect faith?'], prayer_focus: 'Father, let my life match my words. Where I fall short, give me humility to admit it. Let my children see real faith lived out, not just talked about. Amen.' },
    { day_number: 5, title: 'Words That Build', scripture_refs: [{ book: 'Proverbs', chapter: 18, verseStart: 21, verseEnd: 21 }, { book: 'Ephesians', chapter: 4, verseStart: 29, verseEnd: 29 }], content: `"The tongue has the power of life and death."\n\nYour words are shaping your child's identity. Every day, you're either building them up or tearing them down.\n\n"You're so stupid." "You'll never change." "Why can't you be more like your sibling?" These words wound for a lifetime.\n\nBut life-giving words heal: "I'm proud of you." "I believe in you." "God has a purpose for your life." "I love you no matter what."\n\nSpeak life. Speak truth. Speak blessing over your children.`, reflection_questions: ['What words do you speak most often to your children?', 'Are there any words you\'ve spoken that you need to address?', 'What blessing can you speak over your child today?'], prayer_focus: 'Lord, guard my tongue. Let every word I speak build up and never tear down. Help me bless my children with words of life and truth. Amen.' },
    { day_number: 6, title: 'Quality Time', scripture_refs: [{ book: 'Ecclesiastes', chapter: 3, verseStart: 1, verseEnd: 1 }, { book: 'Psalm', chapter: 90, verseStart: 12, verseEnd: 12 }], content: `"There is a time for everything, and a season for every activity under the heavens."\n\nChildhood is a season—and it passes faster than you think. The days are long, but the years are short.\n\nYour presence is the greatest gift you can give. Not presents. Presence. Undivided attention. Phone down. Eyes engaged. Heart connected.\n\nYou can't get these years back. The investment you make now pays dividends for eternity.`, reflection_questions: ['How much undivided attention do you give your children each day?', 'What distractions keep you from being fully present?', 'What is one way you can prioritize quality time this week?'], prayer_focus: 'Father, help me number my days and invest them wisely. Remind me that this season is precious and fleeting. Help me be present—really present—with my children. Amen.' },
    { day_number: 7, title: 'Praying for Your Children', scripture_refs: [{ book: 'Job', chapter: 1, verseStart: 5, verseEnd: 5 }, { book: '1 Samuel', chapter: 1, verseStart: 27, verseEnd: 28 }], content: `"Early in the morning [Job] would sacrifice a burnt offering for each of them... This was Job's regular custom."\n\nJob prayed for his children regularly, not occasionally. Hannah dedicated Samuel to God before he was even born.\n\nPrayer is the most powerful thing you can do for your children. It goes where you cannot go. It protects when you cannot protect. It works when you are helpless.\n\nPray for their salvation. Their character. Their future spouse. Their calling. Their protection. Pray without ceasing.`, reflection_questions: ['How regularly do you pray specifically for each of your children?', 'What specific things should you be praying for them?', 'How could you make prayer for your children a "regular custom"?'], prayer_focus: 'Lord, I lift my children to You. Protect them, guide them, save them, use them. May they know You and walk with You all their days. I entrust them to Your care. Amen.' },
    { day_number: 8, title: 'Forgiveness in the Home', scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 13, verseEnd: 13 }], content: `"Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you."\n\nFamilies hurt each other. It's inevitable when imperfect people live together. The question isn't whether there will be conflict—it's how you handle it.\n\nDo your children see you ask for forgiveness? Do they see you grant it freely? Are you quick to forgive or do you hold grudges?\n\nThe home should be the safest place to fail and the first place to experience grace.`, reflection_questions: ['Is your home characterized by forgiveness or grudge-holding?', 'When was the last time you asked your children for forgiveness?', 'How can you model "forgiving as the Lord forgave you"?'], prayer_focus: 'Father, make our home a place of grace. Help me be quick to forgive and quick to seek forgiveness. Let my children learn the freedom of forgiveness from our family. Amen.' },
    { day_number: 9, title: 'Setting Boundaries', scripture_refs: [{ book: 'Proverbs', chapter: 22, verseStart: 6, verseEnd: 6 }, { book: 'Proverbs', chapter: 29, verseStart: 17, verseEnd: 17 }], content: `"Start children off on the way they should go, and even when they are old they will not turn from it."\n\nBoundaries aren't restrictions—they're protection. A fence around a playground doesn't limit children; it frees them to play safely.\n\nClear, consistent boundaries teach children that actions have consequences. They learn self-control, respect for authority, and ultimately, how to set healthy boundaries in their own lives.\n\nSaying "no" is an act of love when it protects your child from harm.`, reflection_questions: ['Are the boundaries in your home clear and consistent?', 'Where might you need to establish or enforce better boundaries?', 'How do you explain the "why" behind your rules?'], prayer_focus: 'Lord, give me wisdom to set boundaries that protect and guide. Help me be consistent and clear. Let my children understand that boundaries come from love. Amen.' },
    { day_number: 10, title: 'Nurturing Their Gifts', scripture_refs: [{ book: '1 Peter', chapter: 4, verseStart: 10, verseEnd: 10 }, { book: 'Romans', chapter: 12, verseStart: 6, verseEnd: 8 }], content: `"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace."\n\nGod has given each of your children unique gifts, talents, and calling. Your job is to discover, nurture, and release those gifts.\n\nThis means watching carefully. What lights them up? Where do they thrive? What comes naturally? Don't force them into your mold—help them become who God designed them to be.\n\nYour dreams for them might not be God's dreams. Trust His design.`, reflection_questions: ['What unique gifts do you see in each of your children?', 'Are you nurturing their gifts or pushing your own agenda?', 'How can you help them discover their God-given purpose?'], prayer_focus: 'Father, open my eyes to see the gifts You\'ve placed in my children. Help me nurture, not stifle. Help me release, not control. May they fulfill Your purpose for their lives. Amen.' },
    { day_number: 11, title: 'Dealing with Anger', scripture_refs: [{ book: 'James', chapter: 1, verseStart: 19, verseEnd: 20 }, { book: 'Proverbs', chapter: 15, verseStart: 1, verseEnd: 1 }], content: `"Everyone should be quick to listen, slow to speak and slow to become angry, because human anger does not produce the righteousness that God desires."\n\nAnger is one of parenting's greatest enemies. In the heat of the moment, we say and do things we regret.\n\nBut notice: the verse doesn't say don't get angry. It says be slow to anger. Feel the emotion, but don't let it control you.\n\nWhen you feel anger rising, pause. Breathe. Pray. A gentle answer turns away wrath—both theirs and yours.`, reflection_questions: ['What triggers anger in your parenting?', 'How do you typically respond when angry with your children?', 'What strategies could help you be "slow to anger"?'], prayer_focus: 'Lord, forgive me for the times anger has controlled me. Help me be quick to listen, slow to speak, and slow to become angry. Let gentleness characterize my parenting. Amen.' },
    { day_number: 12, title: 'Building Their Faith', scripture_refs: [{ book: '2 Timothy', chapter: 1, verseStart: 5, verseEnd: 5 }, { book: '2 Timothy', chapter: 3, verseStart: 14, verseEnd: 15 }], content: `"I am reminded of your sincere faith, which first lived in your grandmother Lois and in your mother Eunice and, I am persuaded, now lives in you also."\n\nTimothy's faith was passed down through generations. His grandmother believed. His mother believed. And he believed.\n\nFaith is caught more than taught. When your children see your faith is real—not just Sunday behavior but daily reality—it becomes compelling.\n\nYou are building a legacy. What you do today echoes through generations.`, reflection_questions: ['What spiritual legacy are you building for your children?', 'Is your faith "sincere"—the same at home as in public?', 'How can you make your faith more visible and compelling to your children?'], prayer_focus: 'Father, let my faith be real enough to pass on. Build a legacy through my family that lasts for generations. May my children and their children know and love You. Amen.' },
    { day_number: 13, title: 'Letting Go', scripture_refs: [{ book: 'Genesis', chapter: 2, verseStart: 24, verseEnd: 24 }, { book: 'Ecclesiastes', chapter: 3, verseStart: 6, verseEnd: 6 }], content: `"A time to search and a time to give up, a time to keep and a time to throw away."\n\nThe goal of parenting is to work yourself out of a job. You're raising adults, not permanent children.\n\nThis requires gradually releasing control, giving more responsibility, allowing natural consequences, and eventually—letting go completely.\n\nIt's painful. But a parent who never lets go creates a child who never grows. Trust God with what you release.`, reflection_questions: ['Are you preparing your children for independence or dependence?', 'What areas are you holding too tightly?', 'How can you gradually release more responsibility to your children?'], prayer_focus: 'Lord, help me parent with the end in mind. Give me wisdom to know when to hold on and when to let go. I trust You with my children\'s futures. Amen.' },
    { day_number: 14, title: 'Grace Upon Grace', scripture_refs: [{ book: 'John', chapter: 1, verseStart: 16, verseEnd: 17 }, { book: 'Titus', chapter: 2, verseStart: 11, verseEnd: 12 }], content: `"From his fullness we have all received, grace upon grace."\n\nYou will fail as a parent. Not might—will. There will be moments you regret, words you wish you could take back, times you fall short.\n\nBut here's the good news: God's grace covers your parenting failures too. And that same grace empowers you to try again tomorrow.\n\nYour children don't need a perfect parent. They need a parent who knows where to find grace—and freely shares it.`, reflection_questions: ['Where do you need God\'s grace in your parenting right now?', 'How freely do you extend grace to yourself and your children?', 'What would it look like to parent from grace rather than guilt?'], prayer_focus: 'Father, thank You for grace that covers my failures. Help me receive it and extend it freely. Let grace—not guilt, not fear, not perfection—define my parenting. Amen.' }
  ]
};

// =====================================================
// WALKING IN GRACE & FORGIVENESS - 14 Day Series
// =====================================================
const WALKING_GRACE_FORGIVENESS = {
  series: {
    slug: 'walking-grace-forgiveness',
    title: 'Walking in Grace & Forgiveness',
    description: 'A 14-day journey to understand, receive, and extend the transforming grace and forgiveness of God.',
    total_days: 14,
    topics: ['grace', 'forgiveness', 'freedom', 'healing', 'mercy'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'What Is Grace?', scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 8, verseEnd: 9 }], content: `"For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast."\n\nGrace is getting what you don't deserve. It's God's unmerited favor poured out on undeserving people.\n\nYou can't earn it. You can't buy it. You can't be good enough for it. That's the whole point. Grace meets you in your mess and loves you anyway.\n\nThis is the foundation of everything. Until you grasp grace, you'll always be striving, always performing, always exhausted.`, reflection_questions: ['How would you define grace in your own words?', 'Do you tend to try to earn God\'s favor? Why?', 'What would change if you truly believed grace was free?'], prayer_focus: 'Lord, help me understand grace—really understand it. Not as a concept but as my reality. I receive Your undeserved favor today. Amen.' },
    { day_number: 2, title: 'Grace That Pursues', scripture_refs: [{ book: 'Luke', chapter: 15, verseStart: 4, verseEnd: 7 }], content: `"Suppose one of you has a hundred sheep and loses one of them. Doesn't he leave the ninety-nine in the open country and go after the lost sheep until he finds it?"\n\nGrace doesn't wait for you to find your way back. Grace comes looking for you.\n\nWhile you were still running, still hiding, still wandering—grace was pursuing. The Good Shepherd left comfort and safety to find you in your lostness.\n\nYou weren't rescued because you were valuable. You became valuable because you were rescued.`, reflection_questions: ['When have you felt God pursuing you?', 'Are there areas where you\'re still running or hiding from Him?', 'How does being pursued change how you see yourself?'], prayer_focus: 'Father, thank You for not giving up on me. Thank You for pursuing me when I was lost. Help me stop running and fall into Your grace. Amen.' },
    { day_number: 3, title: 'Forgiven to Forgive', scripture_refs: [{ book: 'Matthew', chapter: 18, verseStart: 21, verseEnd: 22 }, { book: 'Colossians', chapter: 3, verseStart: 13, verseEnd: 13 }], content: `"Then Peter came to Jesus and asked, 'Lord, how many times shall I forgive my brother or sister who sins against me? Up to seven times?' Jesus answered, 'I tell you, not seven times, but seventy-seven times.'"\n\nForgiveness isn't a one-time event—it's a lifestyle. And our ability to forgive flows directly from how much we've been forgiven.\n\nThe servant who was forgiven millions but couldn't forgive pennies? He never really grasped grace. When you truly understand how much you've been forgiven, forgiving others becomes not just possible—but necessary.`, reflection_questions: ['Who do you struggle to forgive right now?', 'How does remembering your own forgiveness help you forgive others?', 'Is there someone you need to forgive "seventy-seven times"?'], prayer_focus: 'Lord, I\'ve been forgiven so much. Help me extend that same forgiveness to others—not because they deserve it, but because You\'ve given it to me. Amen.' },
    { day_number: 4, title: 'The Weight of Unforgiveness', scripture_refs: [{ book: 'Hebrews', chapter: 12, verseStart: 15, verseEnd: 15 }, { book: 'Matthew', chapter: 6, verseStart: 14, verseEnd: 15 }], content: `"See to it that no one falls short of the grace of God and that no bitter root grows up to cause trouble and defile many."\n\nUnforgiveness is a prison—and you're the one locked inside. The person who hurt you walks free while you carry the weight of bitterness.\n\nBitterness starts small. A seed of hurt, watered by replaying the offense, grows into a root that poisons everything it touches. Your joy. Your relationships. Your health. Your walk with God.\n\nForgiveness isn't saying what they did was okay. It's releasing them—and yourself—from the debt.`, reflection_questions: ['Is there a "bitter root" growing in your heart?', 'How has unforgiveness affected your life?', 'What would freedom from bitterness look like for you?'], prayer_focus: 'Father, I don\'t want bitterness to take root in me. Show me where unforgiveness is poisoning my life. Give me grace to release it. Amen.' },
    { day_number: 5, title: 'Forgiving Yourself', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 1, verseEnd: 2 }, { book: '1 John', chapter: 1, verseStart: 9, verseEnd: 9 }], content: `"Therefore, there is now no condemnation for those who are in Christ Jesus."\n\nSometimes the hardest person to forgive is yourself. You replay your failures. You rehearse your shame. You punish yourself for sins God has already forgiven.\n\nBut if God says "no condemnation," who are you to condemn? If God says "forgiven," who are you to hold a grudge?\n\nSelf-forgiveness isn't letting yourself off the hook. It's agreeing with what God has already declared about you.`, reflection_questions: ['What do you struggle to forgive yourself for?', 'How does self-condemnation affect your relationship with God?', 'Can you receive God\'s "no condemnation" today?'], prayer_focus: 'Lord, I confess I\'ve condemned myself for things You\'ve forgiven. Help me receive Your verdict over my own. I choose to agree with Your grace. Amen.' },
    { day_number: 6, title: 'Grace for the Journey', scripture_refs: [{ book: '2 Corinthians', chapter: 12, verseStart: 9, verseEnd: 10 }], content: `"My grace is sufficient for you, for my power is made perfect in weakness."\n\nGrace isn't just for salvation—it's for every moment of every day. Grace for the struggle. Grace for the failure. Grace for the weakness.\n\nPaul begged God to remove his "thorn." God's answer? Not removal, but sufficiency. "My grace is enough." In your weakness, His power shows up.\n\nStop trying to be strong enough. Start depending on grace that's sufficient.`, reflection_questions: ['Where do you need God\'s grace to be sufficient today?', 'How does weakness become an opportunity for grace?', 'What would it look like to depend on grace instead of your own strength?'], prayer_focus: 'Father, Your grace is sufficient. In my weakness, be strong. Help me stop striving and start depending on Your more-than-enough grace. Amen.' },
    { day_number: 7, title: 'The Process of Forgiveness', scripture_refs: [{ book: 'Mark', chapter: 11, verseStart: 25, verseEnd: 25 }], content: `"And when you stand praying, if you hold anything against anyone, forgive them, so that your Father in heaven may forgive you your sins."\n\nForgiveness is a decision, but it's also a process. You may need to forgive the same person—for the same offense—many times as the pain resurfaces.\n\nThis isn't failure. It's normal. Each time the hurt comes up, you choose again to release it. Eventually, the grip loosens.\n\nForgiveness doesn't mean forgetting. It means refusing to let the offense define your future.`, reflection_questions: ['Have you had to forgive the same person multiple times?', 'What helps you in the process of forgiving?', 'How do you handle it when old hurts resurface?'], prayer_focus: 'Lord, forgiveness is hard. Help me choose it again and again until freedom comes. Give me patience with the process. Amen.' },
    { day_number: 8, title: 'When Forgiveness Seems Impossible', scripture_refs: [{ book: 'Matthew', chapter: 19, verseStart: 26, verseEnd: 26 }, { book: 'Philippians', chapter: 4, verseStart: 13, verseEnd: 13 }], content: `"With man this is impossible, but with God all things are possible."\n\nSome wounds are so deep that forgiveness seems impossible. Abuse. Betrayal. Loss caused by another's actions. How do you forgive the unforgivable?\n\nYou don't—not in your own strength. But with God, all things are possible. His grace empowers what your flesh cannot do.\n\nStart by being willing to be willing. Ask God to give you the desire to forgive. He'll meet you there.`, reflection_questions: ['Is there someone you feel you could never forgive?', 'Are you willing to ask God to make you willing?', 'How might holding onto this hurt be affecting you?'], prayer_focus: 'Father, this feels impossible. I can\'t forgive in my own strength. But I\'m willing to be willing. Give me Your supernatural grace to do what I cannot. Amen.' },
    { day_number: 9, title: 'Receiving Grace from Others', scripture_refs: [{ book: 'James', chapter: 5, verseStart: 16, verseEnd: 16 }], content: `"Therefore confess your sins to each other and pray for each other so that you may be healed."\n\nGrace isn't just vertical—it's horizontal too. We need to receive grace from others, not just from God.\n\nThis requires vulnerability. Confession. Letting people see your mess. It's terrifying. But there's healing in being fully known and still loved.\n\nFind safe people. Confess to them. Let them speak grace over you. This is how community heals.`, reflection_questions: ['Do you have people you can be fully honest with?', 'What keeps you from receiving grace from others?', 'Who could you confess to and receive prayer from?'], prayer_focus: 'Lord, help me be vulnerable enough to receive grace from others. Lead me to safe people. Break my pride and isolation. Amen.' },
    { day_number: 10, title: 'Extending Grace to Difficult People', scripture_refs: [{ book: 'Luke', chapter: 6, verseStart: 27, verseEnd: 28 }, { book: 'Romans', chapter: 12, verseStart: 20, verseEnd: 21 }], content: `"But I tell you, love your enemies, do good to those who hate you, bless those who curse you, pray for those who mistreat you."\n\nGrace for the lovable is easy. Grace for enemies? That's supernatural.\n\nJesus didn't just forgive those who crucified Him—He asked the Father to forgive them too. This is the radical nature of grace.\n\nYou may never feel like extending grace to difficult people. Do it anyway. Feelings follow actions.`, reflection_questions: ['Who is a "difficult person" in your life right now?', 'What would it look like to extend grace to them?', 'How can you bless someone who has cursed you?'], prayer_focus: 'Father, help me love my enemies. Give me grace for the difficult people in my life. Let me overcome evil with good. Amen.' },
    { day_number: 11, title: 'Grace and Boundaries', scripture_refs: [{ book: 'Matthew', chapter: 10, verseStart: 16, verseEnd: 16 }, { book: 'Proverbs', chapter: 22, verseStart: 3, verseEnd: 3 }], content: `"I am sending you out like sheep among wolves. Therefore be as shrewd as snakes and as innocent as doves."\n\nGrace doesn't mean being a doormat. Forgiveness doesn't require you to trust an untrustworthy person or stay in an abusive situation.\n\nYou can forgive someone and still have boundaries. You can release bitterness without inviting them back into your inner circle.\n\nGrace is wise, not naive. Jesus forgave everyone but didn't entrust Himself to everyone.`, reflection_questions: ['Do you confuse forgiveness with trust?', 'Where might you need healthier boundaries?', 'How can you extend grace while protecting yourself?'], prayer_focus: 'Lord, give me wisdom to know the difference between forgiveness and trust. Help me extend grace while maintaining healthy boundaries. Amen.' },
    { day_number: 12, title: 'Living in Daily Grace', scripture_refs: [{ book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 }], content: `"Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."\n\nGrace isn't just for your worst moments—it's for every moment. The mundane Tuesday. The frustrating meeting. The small failure no one else noticed.\n\nHis mercies are new every morning. Fresh grace for a fresh day. Yesterday's grace was for yesterday. Today you get a new supply.\n\nLive in daily dependence on daily grace.`, reflection_questions: ['How conscious are you of needing grace daily?', 'What would change if you started each morning receiving fresh mercy?', 'Where do you need grace right now—today?'], prayer_focus: 'Father, thank You for mercies that are new every morning. I receive today\'s grace for today\'s challenges. Great is Your faithfulness. Amen.' },
    { day_number: 13, title: 'Becoming a Grace-Giver', scripture_refs: [{ book: '1 Peter', chapter: 4, verseStart: 10, verseEnd: 10 }, { book: 'Ephesians', chapter: 4, verseStart: 29, verseEnd: 29 }], content: `"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms."\n\nYou've received grace not just for yourself, but to give away. You're meant to be a conduit, not a container.\n\nEvery interaction is an opportunity to extend grace. Your words. Your patience. Your generosity. Your forgiveness. You can be the tangible expression of God's grace to others.\n\nSteward grace well. Give it away freely.`, reflection_questions: ['How well do you steward the grace you\'ve received?', 'Who needs to experience God\'s grace through you?', 'What would it look like to be a "grace-giver" today?'], prayer_focus: 'Lord, let grace flow through me to others. Use my words, actions, and attitudes to show Your grace. Make me a faithful steward. Amen.' },
    { day_number: 14, title: 'Freedom in Grace', scripture_refs: [{ book: 'Galatians', chapter: 5, verseStart: 1, verseEnd: 1 }, { book: 'John', chapter: 8, verseStart: 36, verseEnd: 36 }], content: `"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery."\n\nGrace brings freedom. Freedom from guilt. Freedom from shame. Freedom from the exhausting cycle of trying to earn God's love.\n\nYou are free. Free to fail and get back up. Free to be honest about your struggles. Free to live without pretending. Free to extend the same grace you've received.\n\nDon't go back to slavery. Stand firm in grace.`, reflection_questions: ['What has grace set you free from?', 'Are there ways you\'ve gone back to "slavery"—trying to earn what\'s already given?', 'How will you stand firm in grace going forward?'], prayer_focus: 'Father, thank You for freedom. Help me never go back to slavery—to striving, performing, or earning. I stand firm in Your grace. Amen.' }
  ]
};

// =====================================================
// FAITH IN TRIALS - 14 Day Series
// =====================================================
const FAITH_IN_TRIALS = {
  series: {
    slug: 'faith-in-trials',
    title: 'Faith in Trials',
    description: 'A 14-day journey to strengthen your faith through life\'s storms and discover God\'s purposes in suffering.',
    total_days: 14,
    topics: ['trials', 'faith', 'perseverance', 'hope', 'suffering'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'When Trials Come', scripture_refs: [{ book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 }], content: `"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."\n\nNotice James doesn't say "if" you face trials—he says "when." Trials aren't optional in the Christian life. They're guaranteed.\n\nBut here's the radical instruction: consider it joy. Not fake happiness. Not denial. But a deep-rooted joy that comes from knowing God is at work even in the hardest moments.\n\nTrials test your faith—and tested faith grows stronger.`, reflection_questions: ['What trial are you currently facing?', 'How do you typically respond when difficulties come?', 'What would it look like to "consider it joy" in your current situation?'], prayer_focus: 'Lord, I don\'t feel joyful about this trial. But I trust You\'re working. Help me see beyond the pain to Your purposes. Strengthen my faith through this testing. Amen.' },
    { day_number: 2, title: 'God\'s Presence in the Storm', scripture_refs: [{ book: 'Isaiah', chapter: 43, verseStart: 2, verseEnd: 3 }], content: `"When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you."\n\nGod doesn't promise to remove the storm. He promises to be with you in it.\n\nThe three Hebrew boys weren't kept out of the fire—but there was a fourth figure walking with them in the flames. Daniel wasn't spared the lions' den—but God shut their mouths.\n\nYou are not alone in your trial. Emmanuel—God with us—is right there beside you.`, reflection_questions: ['Have you sensed God\'s presence in your current trial?', 'What makes it hard to feel His presence when you\'re suffering?', 'How can you remind yourself He is with you?'], prayer_focus: 'Father, I know You promised never to leave me. Help me sense Your presence in this storm. Walk with me through the fire and the flood. Amen.' },
    { day_number: 3, title: 'The Purpose of Pain', scripture_refs: [{ book: 'Romans', chapter: 5, verseStart: 3, verseEnd: 5 }], content: `"We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope."\n\nSuffering isn't meaningless. There's a progression at work: suffering → perseverance → character → hope.\n\nGod wastes nothing. The very thing that feels like it's destroying you is actually developing something in you that couldn't come any other way.\n\nThis doesn't make the pain less real. But it does make it less pointless.`, reflection_questions: ['Can you see any purpose in your current suffering?', 'How has past suffering developed your character?', 'What might God be producing in you through this trial?'], prayer_focus: 'Lord, I don\'t understand why this is happening. But I trust You\'re producing something good in me. Don\'t waste this pain. Use it to build perseverance, character, and hope. Amen.' },
    { day_number: 4, title: 'When Faith Feels Weak', scripture_refs: [{ book: 'Mark', chapter: 9, verseStart: 24, verseEnd: 24 }, { book: 'Matthew', chapter: 17, verseStart: 20, verseEnd: 20 }], content: `"I do believe; help me overcome my unbelief!"\n\nThis desperate father's prayer is one of the most honest in Scripture. He believed—but doubt was mixed in. And Jesus still responded.\n\nYou don't need perfect faith. You don't need doubt-free faith. You need mustard seed faith—small, imperfect, but directed at the right object.\n\nIt's not the size of your faith that matters. It's the size of your God.`, reflection_questions: ['Where does doubt creep into your faith during trials?', 'Can you pray this father\'s honest prayer?', 'How does knowing God responds to imperfect faith encourage you?'], prayer_focus: 'Lord, I believe—help my unbelief! My faith feels small and weak right now. But I direct it toward You. Meet me in my doubt. Amen.' },
    { day_number: 5, title: 'The Refiner\'s Fire', scripture_refs: [{ book: '1 Peter', chapter: 1, verseStart: 6, verseEnd: 7 }, { book: 'Malachi', chapter: 3, verseStart: 3, verseEnd: 3 }], content: `"These have come so that the proven genuineness of your faith—of greater worth than gold, which perishes even though refined by fire—may result in praise, glory and honor when Jesus Christ is revealed."\n\nGold is refined by fire. The heat doesn't destroy it—it purifies it, burning away impurities and leaving something more valuable.\n\nYour faith is being refined. The heat is uncomfortable, even painful. But what's emerging is genuine, proven, pure—more valuable than gold.`, reflection_questions: ['What "impurities" might God be burning away through this trial?', 'How has your faith been refined by past difficulties?', 'Can you trust the Refiner\'s purpose even when the fire is hot?'], prayer_focus: 'Father, I submit to Your refining fire. Burn away what doesn\'t belong. Purify my faith until it shines. I trust the Refiner\'s hand. Amen.' },
    { day_number: 6, title: 'Crying Out to God', scripture_refs: [{ book: 'Psalm', chapter: 34, verseStart: 17, verseEnd: 18 }], content: `"The righteous cry out, and the LORD hears them; he delivers them from all their troubles. The LORD is close to the brokenhearted and saves those who are crushed in spirit."\n\nGod isn't distant when you're suffering. He draws near. He's especially close to the brokenhearted.\n\nCry out to Him. Scream if you need to. Pour out your complaint. He can handle your raw honesty. The Psalms are full of desperate, angry, confused prayers—and God included them in His Word.\n\nYour tears are not wasted on Him.`, reflection_questions: ['Do you feel free to cry out honestly to God?', 'What would you say to Him right now if you held nothing back?', 'How does knowing He\'s close to the brokenhearted comfort you?'], prayer_focus: 'Lord, I\'m crying out to You. My heart is broken and my spirit is crushed. Draw near to me. Hear my desperate prayer. Save me. Amen.' },
    { day_number: 7, title: 'Trusting When You Can\'t See', scripture_refs: [{ book: '2 Corinthians', chapter: 5, verseStart: 7, verseEnd: 7 }, { book: 'Hebrews', chapter: 11, verseStart: 1, verseEnd: 1 }], content: `"For we live by faith, not by sight."\n\nFaith is believing what you cannot see. It's trusting God's character when you can't trace His hand.\n\nAbraham left his home not knowing where he was going. Moses led Israel toward a sea with an army behind them. The disciples followed Jesus into uncertainty again and again.\n\nFaith doesn't require understanding. It requires trust in the One who does understand.`, reflection_questions: ['What are you struggling to trust God with right now?', 'How do you handle the "not knowing"?', 'What do you know about God\'s character that helps you trust Him?'], prayer_focus: 'Father, I can\'t see the way forward. But I trust You can. Help me walk by faith, not by sight. I choose to trust Your character when I can\'t understand Your plan. Amen.' },
    { day_number: 8, title: 'The Fellowship of Suffering', scripture_refs: [{ book: 'Philippians', chapter: 3, verseStart: 10, verseEnd: 11 }, { book: '2 Corinthians', chapter: 1, verseStart: 5, verseEnd: 5 }], content: `"I want to know Christ—yes, to know the power of his resurrection and participation in his sufferings, becoming like him in his death."\n\nThere's a fellowship in suffering—a knowing of Christ that comes no other way. When you suffer, you enter into something Jesus Himself experienced.\n\nHe was rejected, betrayed, abandoned, mocked, beaten, killed. He knows your pain from the inside.\n\nSuffering isn't just something to endure. It's an invitation to deeper intimacy with Christ.`, reflection_questions: ['How might your suffering be an invitation to know Christ more deeply?', 'Does it help to know Jesus understands your pain personally?', 'What might "fellowship with His sufferings" look like for you?'], prayer_focus: 'Jesus, You know suffering. You\'ve walked this path before me. Draw me into deeper fellowship with You through this trial. Let me know You more. Amen.' },
    { day_number: 9, title: 'Strength in Weakness', scripture_refs: [{ book: '2 Corinthians', chapter: 12, verseStart: 9, verseEnd: 10 }], content: `"But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me."\n\nPaul begged God three times to remove his "thorn." God said no—but offered something better: sufficient grace and perfected power.\n\nYour weakness isn't a liability. It's an opportunity for God's strength to show up. When you're at the end of yourself, you're at the beginning of experiencing His power.\n\nStop fighting your weakness. Let it become the canvas for His strength.`, reflection_questions: ['Where do you feel weakest right now?', 'How might God\'s power be made perfect in your weakness?', 'Can you thank God for your weakness?'], prayer_focus: 'Lord, I\'m weak. I\'ve tried to be strong and I can\'t. Let Your power be made perfect in my weakness. Your grace is enough. Amen.' },
    { day_number: 10, title: 'Hope That Anchors', scripture_refs: [{ book: 'Hebrews', chapter: 6, verseStart: 19, verseEnd: 19 }, { book: 'Romans', chapter: 15, verseStart: 13, verseEnd: 13 }], content: `"We have this hope as an anchor for the soul, firm and secure."\n\nAn anchor doesn't stop the storm. It keeps the ship from drifting while the storm rages.\n\nHope in God is your anchor. Not hope that things will work out the way you want—but hope in His character, His promises, His presence, His ultimate victory.\n\nWhen everything else is shaking, this anchor holds.`, reflection_questions: ['What is your hope anchored in right now?', 'How does eternal perspective change how you view your current trial?', 'What promises of God can you anchor yourself to?'], prayer_focus: 'Father, anchor my soul in hope. When waves crash and winds blow, keep me secure in Your promises. You are my firm foundation. Amen.' },
    { day_number: 11, title: 'Don\'t Waste Your Suffering', scripture_refs: [{ book: '2 Corinthians', chapter: 1, verseStart: 3, verseEnd: 4 }], content: `"...the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God."\n\nYour suffering has a purpose beyond yourself. The comfort you receive becomes comfort you can give.\n\nNo one can minister to a grieving person like someone who has grieved. No one understands addiction like someone who has battled it. Your deepest wounds can become your greatest ministry.\n\nDon't waste your suffering. Let it become a gift to others.`, reflection_questions: ['How has someone who\'s suffered similarly comforted you?', 'Who might God want you to comfort with what you\'ve learned?', 'How can your pain become a gift to others?'], prayer_focus: 'Lord, don\'t let this suffering be wasted. Use what I\'m learning to comfort others. Turn my pain into ministry. Redeem my story for Your glory. Amen.' },
    { day_number: 12, title: 'Praise in the Pain', scripture_refs: [{ book: 'Acts', chapter: 16, verseStart: 25, verseEnd: 26 }, { book: 'Habakkuk', chapter: 3, verseStart: 17, verseEnd: 18 }], content: `"About midnight Paul and Silas were praying and singing hymns to God, and the other prisoners were listening to them."\n\nBeaten and imprisoned, Paul and Silas sang. Not after deliverance—before it. In the darkness, in the chains, in the pain—they worshipped.\n\nPraise in the pain is the ultimate declaration of faith. It says, "God, You're worthy regardless of my circumstances. I choose to worship even when I don't feel like it."\n\nThis kind of praise shakes prison doors.`, reflection_questions: ['Is it possible for you to praise God in your current pain?', 'What would a sacrifice of praise look like for you right now?', 'How might praise change your perspective on your trial?'], prayer_focus: 'Lord, I choose to praise You. Not because I feel like it, but because You\'re worthy. Receive my sacrifice of praise from this prison. I worship You in the pain. Amen.' },
    { day_number: 13, title: 'The Promise of Restoration', scripture_refs: [{ book: '1 Peter', chapter: 5, verseStart: 10, verseEnd: 10 }, { book: 'Joel', chapter: 2, verseStart: 25, verseEnd: 25 }], content: `"And the God of all grace, who called you to his eternal glory in Christ, after you have suffered a little while, will himself restore you and make you strong, firm and steadfast."\n\nThis suffering is temporary. "A little while"—that's how Peter describes it compared to eternity.\n\nAnd after? God Himself will restore you. Make you strong. Firm. Steadfast. Not weakened by the trial, but strengthened through it.\n\nHold on. Restoration is coming.`, reflection_questions: ['Can you believe restoration is coming?', 'How does eternal perspective change how you view "a little while"?', 'What would it look like to be "strong, firm and steadfast" on the other side?'], prayer_focus: 'Father, I hold onto Your promise of restoration. After this suffering, make me strong, firm, and steadfast. I trust that this is temporary and Your restoration is coming. Amen.' },
    { day_number: 14, title: 'More Than Conquerors', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 37, verseEnd: 39 }], content: `"No, in all these things we are more than conquerors through him who loved us. For I am convinced that neither death nor life... nor anything else in all creation, will be able to separate us from the love of God."\n\nYou're not just surviving. You're not barely making it. You are MORE than a conqueror.\n\nNot because you're strong. Not because you have it figured out. Through Him who loved you—that's how you conquer.\n\nAnd nothing—absolutely nothing—can separate you from His love. Not this trial. Not any trial. Nothing.`, reflection_questions: ['Do you see yourself as "more than a conqueror"?', 'How does being anchored in God\'s love change how you face trials?', 'What has this journey through trials taught you about faith?'], prayer_focus: 'Lord, I am more than a conqueror through You. Nothing can separate me from Your love. I face this trial and every trial confident in Your unfailing love and victory. Amen.' }
  ]
};

// =====================================================
// DAILY GRATITUDE - 14 Day Series
// =====================================================
const DAILY_GRATITUDE = {
  series: {
    slug: 'daily-gratitude',
    title: 'Daily Gratitude',
    description: 'A 14-day journey to develop a heart of thankfulness and discover the transformative power of gratitude.',
    total_days: 14,
    topics: ['gratitude', 'thankfulness', 'joy', 'perspective', 'praise'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    { day_number: 1, title: 'The Command to Give Thanks', scripture_refs: [{ book: '1 Thessalonians', chapter: 5, verseStart: 18, verseEnd: 18 }], content: `"Give thanks in all circumstances; for this is God's will for you in Christ Jesus."\n\nGratitude isn't just a nice idea—it's a command. Not give thanks FOR all circumstances, but IN all circumstances.\n\nThis means gratitude isn't dependent on your situation. It's a choice you make regardless of what's happening around you.\n\nWhen you choose gratitude, you're not denying reality. You're declaring that God is bigger than your circumstances.`, reflection_questions: ['Why do you think gratitude is commanded, not just suggested?', 'What circumstances make gratitude difficult for you?', 'How might choosing gratitude change your perspective today?'], prayer_focus: 'Lord, I choose to give thanks today—not because everything is perfect, but because You are good. Help me develop a grateful heart in all circumstances. Amen.' },
    { day_number: 2, title: 'Gratitude as a Gateway', scripture_refs: [{ book: 'Psalm', chapter: 100, verseStart: 4, verseEnd: 5 }], content: `"Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name."\n\nThanksgiving is the gateway to God's presence. It's how we enter in.\n\nWhen you begin with gratitude, everything shifts. Your focus moves from what's wrong to what's right. From what you lack to what you have. From your problems to your Provider.\n\nGratitude opens doors that complaint keeps locked.`, reflection_questions: ['How does starting with gratitude change your time with God?', 'What "gates" might gratitude open in your life?', 'Try entering God\'s presence right now with thanksgiving. What happens?'], prayer_focus: 'Father, I enter Your gates with thanksgiving today. Thank You for Your goodness. Thank You for Your faithful love. I come into Your presence with a grateful heart. Amen.' },
    { day_number: 3, title: 'Counting Your Blessings', scripture_refs: [{ book: 'Psalm', chapter: 103, verseStart: 2, verseEnd: 5 }], content: `"Praise the LORD, my soul, and forget not all his benefits."\n\nWe're prone to forget. The blessings of yesterday fade quickly when today's problems arise.\n\nThat's why the Psalmist has to remind his own soul: "Forget not all his benefits." Don't let the gifts slip from memory.\n\nCounting your blessings isn't cliché—it's spiritual discipline. When you intentionally remember what God has done, gratitude grows.`, reflection_questions: ['What benefits from God have you forgotten lately?', 'What are 10 specific blessings you can thank God for right now?', 'How could you build "counting blessings" into your daily routine?'], prayer_focus: 'Lord, I don\'t want to forget Your benefits. Forgive me for taking Your blessings for granted. Help me count them, remember them, and thank You for them. Amen.' },
    { day_number: 4, title: 'Gratitude in Difficulty', scripture_refs: [{ book: 'Habakkuk', chapter: 3, verseStart: 17, verseEnd: 18 }], content: `"Though the fig tree does not bud and there are no grapes on the vines... yet I will rejoice in the LORD, I will be joyful in God my Savior."\n\nHabakkuk describes total disaster—crop failure, empty fields, no livestock. Everything gone.\n\nAnd yet. YET. "I will rejoice in the LORD."\n\nThis is gratitude that transcends circumstances. It's rooted not in what you have, but in WHO you have. Even when everything is stripped away, God remains.`, reflection_questions: ['What would be your "though the fig tree does not bud" situation?', 'Can you say "yet I will rejoice" in that circumstance?', 'What remains to be grateful for even in your hardest times?'], prayer_focus: 'Lord, even if everything falls apart, You remain. Help me find gratitude not in my circumstances but in You. You are enough. Amen.' },
    { day_number: 5, title: 'The Grateful Heart Sees More', scripture_refs: [{ book: 'Psalm', chapter: 34, verseStart: 8, verseEnd: 8 }, { book: 'Psalm', chapter: 119, verseStart: 18, verseEnd: 18 }], content: `"Taste and see that the LORD is good; blessed is the one who takes refuge in him."\n\nGratitude sharpens your vision. The more thankful you become, the more you notice God's goodness everywhere.\n\nAn ungrateful heart sees lack. A grateful heart sees abundance. Same circumstances—completely different perspective.\n\nWhen you practice gratitude, you train your eyes to see blessings you've been walking past.`, reflection_questions: ['What blessings might you be walking past without noticing?', 'How has gratitude changed what you see in the past?', 'Ask God to open your eyes today. What do you notice?'], prayer_focus: 'Father, open my eyes to see Your goodness. I\'ve been blind to so many blessings. Train my heart to notice, to taste, to see that You are good. Amen.' },
    { day_number: 6, title: 'Gratitude Defeats Complaining', scripture_refs: [{ book: 'Philippians', chapter: 2, verseStart: 14, verseEnd: 15 }], content: `"Do everything without grumbling or arguing, so that you may become blameless and pure."\n\nComplaining comes naturally. Gratitude takes effort.\n\nBut here's the thing: gratitude and complaining can't coexist. When you fill your mouth with thanksgiving, there's no room for grumbling.\n\nEvery time you catch yourself complaining, replace it with gratitude. Not denial—replacement. "Yes, this is hard, AND I'm grateful for..."\n\nGratitude is the antidote to a complaining spirit.`, reflection_questions: ['How much of your speech is complaining versus thanksgiving?', 'What do you tend to complain about most?', 'What gratitude could replace your most common complaint?'], prayer_focus: 'Lord, forgive my complaining spirit. Help me catch myself and replace grumbling with gratitude. Fill my mouth with thanksgiving instead of complaints. Amen.' },
    { day_number: 7, title: 'Gratitude for People', scripture_refs: [{ book: 'Philippians', chapter: 1, verseStart: 3, verseEnd: 5 }, { book: '1 Thessalonians', chapter: 1, verseStart: 2, verseEnd: 3 }], content: `"I thank my God every time I remember you."\n\nPaul's letters overflow with gratitude for people. Not just God's blessings in general—specific people who enriched his life.\n\nWho are the people you're grateful for? Family, friends, mentors, even strangers who've shown kindness?\n\nGratitude isn't complete until it's expressed. Tell someone today how thankful you are for them.`, reflection_questions: ['Who are you most grateful for in your life?', 'When did you last tell them?', 'Who could you thank today—in person, by call, or in writing?'], prayer_focus: 'Father, thank You for the people You\'ve placed in my life. Help me not take them for granted. Give me words to express my gratitude to them. Amen.' },
    { day_number: 8, title: 'Gratitude for the Ordinary', scripture_refs: [{ book: 'Psalm', chapter: 68, verseStart: 19, verseEnd: 19 }, { book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 }], content: `"Praise be to the Lord, to God our Savior, who daily bears our burdens."\n\nWe wait for big blessings while ignoring daily mercies. The breath in your lungs. Running water. A bed to sleep in. Food on the table.\n\nThese "ordinary" blessings are actually extraordinary—we've just become blind to them.\n\nWhat if you lost something for a week and got it back? You'd be overwhelmed with gratitude. Why wait for loss to appreciate what you have?`, reflection_questions: ['What ordinary blessings have you stopped noticing?', 'What would you miss most if it was gone?', 'How can you cultivate gratitude for everyday mercies?'], prayer_focus: 'Lord, open my eyes to ordinary blessings I take for granted. Thank You for daily mercies I barely notice. Help me see the extraordinary in the everyday. Amen.' },
    { day_number: 9, title: 'Gratitude Transforms Perspective', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 }], content: `"And we know that in all things God works for the good of those who love him."\n\nGratitude doesn't change your circumstances—it changes how you see them.\n\nThe same situation can be a crisis or an opportunity. A punishment or training. An ending or a new beginning. Gratitude shifts the lens.\n\nWhen you believe God works all things for good, you can find something to be grateful for in everything—even the hard things.`, reflection_questions: ['How has gratitude changed your perspective on a difficult situation?', 'What current challenge might look different through grateful eyes?', 'Can you find something to thank God for in your hardest circumstance?'], prayer_focus: 'Father, transform my perspective through gratitude. Help me see Your hand at work even in difficulty. I trust You\'re working all things for good. Amen.' },
    { day_number: 10, title: 'Gratitude and Contentment', scripture_refs: [{ book: 'Philippians', chapter: 4, verseStart: 11, verseEnd: 13 }, { book: '1 Timothy', chapter: 6, verseStart: 6, verseEnd: 8 }], content: `"I have learned to be content whatever the circumstances... I can do all this through him who gives me strength."\n\nContentment isn't having everything you want. It's wanting what you have.\n\nGratitude and contentment are twins. When you're truly grateful, you're not constantly grasping for more. What you have is enough because God is enough.\n\nThis isn't settling—it's freedom from the endless chase for "more."`, reflection_questions: ['Where does discontentment steal your joy?', 'What would contentment look like in your current circumstances?', 'How does gratitude lead to contentment?'], prayer_focus: 'Lord, teach me contentment. Free me from always wanting more. Help me find deep satisfaction in what I have and in who You are. Amen.' },
    { day_number: 11, title: 'Gratitude as Worship', scripture_refs: [{ book: 'Psalm', chapter: 95, verseStart: 2, verseEnd: 3 }, { book: 'Hebrews', chapter: 12, verseStart: 28, verseEnd: 28 }], content: `"Let us come before him with thanksgiving and extol him with music and song. For the LORD is the great God."\n\nGratitude isn't just good for you—it glorifies God. When you thank Him, you acknowledge His goodness, His provision, His faithfulness.\n\nEvery "thank you" to God is an act of worship. It declares His worth. It magnifies His name.\n\nGratitude turns ordinary moments into sacred offerings.`, reflection_questions: ['How is gratitude an act of worship?', 'How does your gratitude glorify God?', 'What would it look like to turn your thanksgiving into worship today?'], prayer_focus: 'Father, receive my gratitude as worship. You are worthy of all thanks and praise. I magnify Your name for Your goodness to me. Amen.' },
    { day_number: 12, title: 'Gratitude and Generosity', scripture_refs: [{ book: '2 Corinthians', chapter: 9, verseStart: 11, verseEnd: 12 }], content: `"You will be enriched in every way so that you can be generous on every occasion, and through us your generosity will result in thanksgiving to God."\n\nGrateful people are generous people. When you recognize everything as a gift, you hold it loosely and share it freely.\n\nIngratitude hoards. Gratitude gives. The more thankful you are for what you've received, the more naturally you give it away.\n\nGenerosity completes the cycle of gratitude.`, reflection_questions: ['How does gratitude fuel your generosity?', 'What has God given you that you could share with others?', 'How might increased gratitude increase your generosity?'], prayer_focus: 'Lord, make me generous because I\'m grateful. Everything I have is from You. Help me hold it loosely and give it freely. Amen.' },
    { day_number: 13, title: 'A Lifestyle of Gratitude', scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 15, verseEnd: 17 }], content: `"And be thankful... And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him."\n\nGratitude isn't an occasional practice—it's a way of life. Whatever you do. In word or deed. All of it wrapped in thanksgiving.\n\nThis means gratitude becomes the atmosphere you live in. Not just morning devotions or meal prayers—but a constant posture of thankfulness throughout your day.`, reflection_questions: ['How close are you to gratitude being a lifestyle?', 'What would it look like to do "whatever you do" with thanksgiving?', 'How can you carry gratitude into every part of your day?'], prayer_focus: 'Father, make gratitude my lifestyle, not just a practice. Let thanksgiving saturate everything I do, say, and think. Help me live in constant awareness of Your goodness. Amen.' },
    { day_number: 14, title: 'Overflowing with Gratitude', scripture_refs: [{ book: 'Colossians', chapter: 2, verseStart: 6, verseEnd: 7 }], content: `"So then, just as you received Christ Jesus as Lord, continue to live your lives in him, rooted and built up in him, strengthened in the faith as you were taught, and overflowing with thankfulness."\n\nOverflowing. Not just a trickle of gratitude—a flood. So much thankfulness it spills over onto everyone around you.\n\nThis is the goal: a heart so full of gratitude it can't help but overflow. Gratitude that's infectious. Thanksgiving that changes the atmosphere.\n\nYou've started a gratitude journey. Don't stop here. Let it overflow.`, reflection_questions: ['What has this gratitude journey taught you?', 'How will you continue cultivating gratitude after today?', 'What would "overflowing with thankfulness" look like in your life?'], prayer_focus: 'Lord, I don\'t want a trickle—I want to overflow with gratitude. Fill me so full that thankfulness spills onto everyone I meet. Let this be just the beginning. Amen.' }
  ]
};

// =====================================================
// HEARING GOD'S VOICE (Intermediate) - 14 Day Series
// =====================================================
const HEARING_GODS_VOICE = {
  series: {
    slug: 'hearing-gods-voice',
    title: 'Hearing God\'s Voice',
    description: 'A 14-day deeper journey into discerning and responding to God\'s voice in your daily life.',
    total_days: 14,
    topics: ['hearing God', 'discernment', 'guidance', 'Holy Spirit', 'obedience'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'God Still Speaks', scripture_refs: [{ book: 'Hebrews', chapter: 1, verseStart: 1, verseEnd: 2 }, { book: 'John', chapter: 10, verseStart: 27, verseEnd: 27 }], content: `"In the past God spoke to our ancestors through the prophets at many times and in various ways, but in these last days he has spoken to us by his Son."\n\nGod is not silent. He has always been a speaking God—and He still speaks today.\n\nThe question isn't whether God speaks. It's whether we're positioned to hear. Through His Word, His Spirit, His people, and His creation, God is constantly communicating.\n\nYour journey to hear Him better begins with believing He wants to be heard.`, reflection_questions: ['Do you believe God wants to speak to you personally?', 'What might be keeping you from hearing His voice?', 'How has God spoken to you in the past?'], prayer_focus: 'Lord, I believe You still speak. Open my ears to hear You. Remove anything that blocks Your voice. I want to know what You\'re saying to me. Amen.' },
    { day_number: 2, title: 'The Primary Voice: Scripture', scripture_refs: [{ book: '2 Timothy', chapter: 3, verseStart: 16, verseEnd: 17 }, { book: 'Psalm', chapter: 119, verseStart: 105, verseEnd: 105 }], content: `"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness."\n\nGod's primary voice is His Word. Everything else we think we hear must be measured against Scripture.\n\nThe Bible isn't just an ancient book—it's living and active. When you read it prayerfully, the Holy Spirit illuminates truth and speaks directly to your situation.\n\nIf you want to hear God, start by opening His book.`, reflection_questions: ['How consistently do you read Scripture?', 'Have you experienced God speaking to you through His Word?', 'How can you create more space for Bible reading in your life?'], prayer_focus: 'Father, Your Word is a lamp to my feet. Help me prioritize Scripture. Speak to me through its pages. Let Your Word come alive as I read. Amen.' },
    { day_number: 3, title: 'The Still Small Voice', scripture_refs: [{ book: '1 Kings', chapter: 19, verseStart: 11, verseEnd: 13 }], content: `"After the earthquake came a fire, but the LORD was not in the fire. And after the fire came a gentle whisper."\n\nElijah expected God in the dramatic—wind, earthquake, fire. But God came in the gentle whisper.\n\nWe often miss God's voice because we're looking for the spectacular. Meanwhile, He's speaking quietly, persistently, gently.\n\nTo hear the whisper, you have to get quiet. Slow down. Turn off the noise. Create space for stillness.`, reflection_questions: ['Is your life too noisy to hear God\'s whisper?', 'When do you experience the most stillness?', 'What would you need to change to create more quiet space?'], prayer_focus: 'Lord, help me slow down and get quiet. I don\'t want to miss Your gentle whisper. Teach me to listen in the stillness. Speak, for Your servant is listening. Amen.' },
    { day_number: 4, title: 'The Voice of the Holy Spirit', scripture_refs: [{ book: 'John', chapter: 16, verseStart: 13, verseEnd: 14 }, { book: 'Romans', chapter: 8, verseStart: 14, verseEnd: 14 }], content: `"But when he, the Spirit of truth, comes, he will guide you into all the truth."\n\nThe Holy Spirit is your internal guide. Jesus sent Him specifically to lead you into truth and remind you of Jesus' words.\n\nThe Spirit speaks through impressions, convictions, promptings, and peace (or lack of peace). He confirms, warns, directs, and comforts.\n\nLearning to recognize the Spirit's voice is essential to hearing God.`, reflection_questions: ['How do you experience the Holy Spirit\'s guidance?', 'Can you recall a time when you sensed the Spirit prompting you?', 'How can you become more sensitive to the Spirit\'s voice?'], prayer_focus: 'Holy Spirit, guide me into all truth. Help me recognize Your voice—Your promptings, Your peace, Your warnings. I want to be led by You. Amen.' },
    { day_number: 5, title: 'Testing What You Hear', scripture_refs: [{ book: '1 John', chapter: 4, verseStart: 1, verseEnd: 1 }, { book: '1 Thessalonians', chapter: 5, verseStart: 20, verseEnd: 21 }], content: `"Dear friends, do not believe every spirit, but test the spirits to see whether they are from God."\n\nNot every voice is God's voice. The enemy whispers lies. Our own desires speak loudly. Culture has its opinions.\n\nThat's why we test what we hear. Does it align with Scripture? Does it lead toward Christ or away? Does it produce the Spirit's fruit? Do mature believers confirm it?\n\nDiscernment is essential to hearing God accurately.`, reflection_questions: ['How do you currently test what you think God is saying?', 'Have you ever mistaken another voice for God\'s?', 'Who are the wise believers you can process things with?'], prayer_focus: 'Lord, give me discernment. Help me test what I hear against Your Word and Your character. Protect me from deception. Lead me into truth. Amen.' },
    { day_number: 6, title: 'God Speaks Through Others', scripture_refs: [{ book: 'Proverbs', chapter: 11, verseStart: 14, verseEnd: 14 }, { book: 'Proverbs', chapter: 27, verseStart: 17, verseEnd: 17 }], content: `"For lack of guidance a nation falls, but victory is won through many advisers."\n\nGod often speaks through other people—counselors, pastors, friends, even strangers. He uses community to confirm, correct, and direct.\n\nThis requires humility. We'd rather hear God directly than through someone else. But wise counsel is one of God's primary means of guidance.\n\nAre you positioned to receive what God might say through others?`, reflection_questions: ['Do you have trusted advisers who speak into your life?', 'Are you open to God speaking through others?', 'Has God ever used an unexpected person to speak to you?'], prayer_focus: 'Father, I humble myself to hear You through others. Bring wise counselors into my life. Help me receive what You say through them. Amen.' },
    { day_number: 7, title: 'Hindrances to Hearing', scripture_refs: [{ book: 'Isaiah', chapter: 59, verseStart: 1, verseEnd: 2 }, { book: 'James', chapter: 1, verseStart: 22, verseEnd: 22 }], content: `"But your iniquities have separated you from your God; your sins have hidden his face from you, so that he will not hear."\n\nSometimes we don't hear God because something is blocking the signal. Unconfessed sin. Unforgiveness. Disobedience to what He's already said.\n\nGod rarely gives new instructions when we haven't followed the old ones. He doesn't speak louder—He waits for obedience.\n\nIf you're not hearing God, ask if there's something blocking the way.`, reflection_questions: ['Is there unconfessed sin blocking your hearing?', 'Have you obeyed what God has already told you?', 'What might be hindering your ability to hear God?'], prayer_focus: 'Lord, search me and reveal anything blocking Your voice. I confess my sin and choose obedience. Clear the way between us. Amen.' },
    { day_number: 8, title: 'Hearing in Prayer', scripture_refs: [{ book: 'Jeremiah', chapter: 33, verseStart: 3, verseEnd: 3 }, { book: 'Psalm', chapter: 46, verseStart: 10, verseEnd: 10 }], content: `"Call to me and I will answer you and tell you great and unsearchable things you do not know."\n\nPrayer is two-way communication. We speak to God—but we also listen.\n\nMost of us are better at talking than listening in prayer. We bring our requests, say amen, and leave. But what if we stayed? What if we asked and then waited for a response?\n\nGod promises to answer when we call. Are we giving Him space to speak?`, reflection_questions: ['How much of your prayer time is listening versus talking?', 'What would it look like to wait on God in prayer?', 'Try asking God a question and then sitting in silence. What happens?'], prayer_focus: 'Lord, teach me to listen in prayer. I don\'t want to do all the talking. I ask—and now I wait. Speak to me. I\'m listening. Amen.' },
    { day_number: 9, title: 'Hearing Through Circumstances', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 }, { book: 'Proverbs', chapter: 16, verseStart: 9, verseEnd: 9 }], content: `"In their hearts humans plan their course, but the LORD establishes their steps."\n\nGod sometimes speaks through circumstances—open doors, closed doors, providential timing, unexpected opportunities.\n\nThis doesn't mean every circumstance is God's voice. But when circumstances align with Scripture and the Spirit's prompting, pay attention.\n\nGod is sovereign over your situation. He can use anything to guide you.`, reflection_questions: ['How do you discern God\'s voice in circumstances?', 'Can you recall a time when circumstances confirmed God\'s direction?', 'What circumstances might God be using to speak to you now?'], prayer_focus: 'Father, You are sovereign over my circumstances. Help me discern Your voice in open and closed doors. Guide my steps according to Your will. Amen.' },
    { day_number: 10, title: 'When God Seems Silent', scripture_refs: [{ book: 'Psalm', chapter: 13, verseStart: 1, verseEnd: 2 }, { book: 'Isaiah', chapter: 30, verseStart: 21, verseEnd: 21 }], content: `"How long, LORD? Will you forget me forever? How long will you hide your face from me?"\n\nSometimes God seems silent. You pray. You listen. Nothing.\n\nSilence doesn't mean absence. God may be testing your faith, developing patience, or waiting for the right timing. Sometimes silence means "keep doing what you're doing."\n\nIn the silence, keep seeking. Keep obeying what you last heard. Trust that He's still there.`, reflection_questions: ['Have you experienced seasons of God\'s silence?', 'How do you respond when God seems quiet?', 'What might God be doing in the silence?'], prayer_focus: 'Lord, even when You seem silent, I trust You\'re there. Help me persevere in seeking You. Give me patience to wait for Your voice. Amen.' },
    { day_number: 11, title: 'Obedience Unlocks More', scripture_refs: [{ book: 'John', chapter: 14, verseStart: 21, verseEnd: 21 }, { book: 'John', chapter: 7, verseStart: 17, verseEnd: 17 }], content: `"Whoever has my commands and keeps them is the one who loves me. The one who loves me will be loved by my Father, and I too will love them and show myself to them."\n\nObedience unlocks revelation. When you act on what God has shown you, He shows you more.\n\nThis is why some people seem to hear God clearly and others struggle. It's not favoritism—it's faithfulness. Those who obey the little receive more.\n\nWhat has God already told you that you haven't done?`, reflection_questions: ['Is there something God told you that you haven\'t obeyed?', 'How does obedience relate to hearing more from God?', 'What step of obedience could you take today?'], prayer_focus: 'Lord, forgive me for delayed obedience. I will act on what You\'ve shown me. Help me be faithful with the little so You can trust me with more. Amen.' },
    { day_number: 12, title: 'Cultivating a Listening Life', scripture_refs: [{ book: '1 Samuel', chapter: 3, verseStart: 10, verseEnd: 10 }, { book: 'Luke', chapter: 10, verseStart: 39, verseEnd: 42 }], content: `"Speak, LORD, for your servant is listening."\n\nHearing God isn't just a skill—it's a lifestyle. It requires cultivating habits that position you to listen.\n\nSolitude. Silence. Scripture. Sabbath. These practices create space for God's voice.\n\nSamuel's response should be our daily posture: "Speak, LORD, for your servant is listening." Not occasionally—continually.`, reflection_questions: ['What habits help you hear God?', 'What practices could you add to cultivate a listening life?', 'How can you make "Speak, Lord" your daily posture?'], prayer_focus: 'Father, I want a lifestyle of listening. Help me build habits that position me to hear You. Speak, Lord—Your servant is listening. Amen.' },
    { day_number: 13, title: 'Acting on What You Hear', scripture_refs: [{ book: 'James', chapter: 1, verseStart: 22, verseEnd: 25 }], content: `"Do not merely listen to the word, and so deceive yourselves. Do what it says."\n\nHearing without doing is self-deception. It's worse than not hearing at all.\n\nThe goal isn't just to hear God—it's to obey Him. Every revelation comes with responsibility. What He speaks, He expects you to act on.\n\nFaith without works is dead. Hearing without doing is useless.`, reflection_questions: ['Do you act on what you hear from God?', 'What has God recently spoken that requires action?', 'What keeps you from acting on what you hear?'], prayer_focus: 'Lord, I don\'t want to be a hearer only. Help me be a doer of Your word. Give me courage to act on what You speak. Amen.' },
    { day_number: 14, title: 'A Lifetime of Listening', scripture_refs: [{ book: 'Revelation', chapter: 2, verseStart: 7, verseEnd: 7 }, { book: 'Proverbs', chapter: 8, verseStart: 34, verseEnd: 35 }], content: `"Whoever has ears, let them hear what the Spirit says to the churches."\n\nHearing God is a lifetime journey. You never fully arrive. There's always more to learn, deeper levels of listening, greater sensitivity to develop.\n\nThe Spirit is always speaking. The question is whether you have ears to hear.\n\nCommit to being a lifelong listener. Keep seeking. Keep listening. Keep obeying. His voice is worth pursuing.`, reflection_questions: ['What has this journey taught you about hearing God?', 'How will you continue developing your ability to hear Him?', 'What\'s one commitment you\'ll make to keep listening?'], prayer_focus: 'Lord, I commit to a lifetime of listening. Continue to sharpen my ears. Deepen my sensitivity to Your voice. I want to hear You more clearly every day. Amen.' }
  ]
};

// =====================================================
// GOD'S PROMISES FOR FAMILIES - 14 Day Series
// =====================================================
const GODS_PROMISES_FAMILIES = {
  series: {
    slug: 'gods-promises-families',
    title: 'God\'s Promises for Families',
    description: 'A 14-day journey discovering and claiming God\'s powerful promises for your family.',
    total_days: 14,
    topics: ['family', 'promises', 'blessing', 'generational', 'faith'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'The Promise of Blessing', scripture_refs: [{ book: 'Genesis', chapter: 12, verseStart: 2, verseEnd: 3 }, { book: 'Acts', chapter: 2, verseStart: 39, verseEnd: 39 }], content: `"I will bless you... and you will be a blessing... and all peoples on earth will be blessed through you."\n\nGod is a God of generational blessing. The promise to Abraham wasn't just for him—it was for his descendants and through them, the whole earth.\n\nThe same is true for your family. God's promises extend to you and your children. Your family isn't just meant to be blessed—it's meant to be a blessing.\n\nWhat God started, He intends to continue through generations.`, reflection_questions: ['How have you seen God\'s blessing in your family line?', 'What does it mean for your family to be "a blessing"?', 'How can you position your family to receive and extend God\'s promises?'], prayer_focus: 'Lord, thank You for Your promises that extend to my family. Bless us so we can be a blessing. Let Your purposes flow through our generations. Amen.' },
    { day_number: 2, title: 'The Promise of Salvation', scripture_refs: [{ book: 'Acts', chapter: 16, verseStart: 31, verseEnd: 31 }, { book: 'Joshua', chapter: 24, verseStart: 15, verseEnd: 15 }], content: `"Believe in the Lord Jesus, and you will be saved—you and your household."\n\nGod's heart is for whole families to come to faith. When the Philippian jailer believed, the promise extended to his household.\n\nThis isn't automatic—each person must choose. But there's a promise here: your faith creates an atmosphere where your family encounters God.\n\n"As for me and my household, we will serve the LORD." This declaration claims the promise.`, reflection_questions: ['Are there family members you\'re praying to come to faith?', 'How does your faith create an atmosphere for your household?', 'Can you declare Joshua 24:15 over your family today?'], prayer_focus: 'Father, I believe—save my household! Let my faith open doors for my family to encounter You. I claim Your promise of salvation for my family. Amen.' },
    { day_number: 3, title: 'The Promise of Provision', scripture_refs: [{ book: 'Philippians', chapter: 4, verseStart: 19, verseEnd: 19 }, { book: 'Psalm', chapter: 37, verseStart: 25, verseEnd: 25 }], content: `"And my God will meet all your needs according to the riches of his glory in Christ Jesus."\n\nGod promises to provide for your family's needs. Not wants—needs. But His provision is according to His riches, which are limitless.\n\nThe Psalmist testifies: "I was young and now I am old, yet I have never seen the righteous forsaken or their children begging bread."\n\nGod is faithful to provide. Trust Him with your family's needs.`, reflection_questions: ['How has God provided for your family in the past?', 'What needs are you trusting Him for now?', 'How does trusting God\'s provision reduce anxiety about your family\'s future?'], prayer_focus: 'Lord, You promise to meet all our needs. I trust You to provide for my family. Help us seek Your kingdom first, knowing everything else will be added. Amen.' },
    { day_number: 4, title: 'The Promise of Protection', scripture_refs: [{ book: 'Psalm', chapter: 91, verseStart: 9, verseEnd: 11 }, { book: 'Proverbs', chapter: 18, verseStart: 10, verseEnd: 10 }], content: `"If you say, 'The LORD is my refuge,' and you make the Most High your dwelling, no harm will overtake you, no disaster will come near your tent."\n\nGod promises protection for those who dwell in Him. Your family finds safety under His wings.\n\nThis doesn't mean nothing difficult will ever happen. But it means you're covered. Angels guard. The name of the Lord is a strong tower.\n\nMake the Lord your family's dwelling place, and rest in His protection.`, reflection_questions: ['How do you see God as your family\'s protector?', 'What fears for your family can you entrust to Him?', 'How can you "make the Most High your dwelling" as a family?'], prayer_focus: 'Father, be our refuge and strong tower. I place my family under Your protection. Guard us from harm. We dwell in the shelter of the Most High. Amen.' },
    { day_number: 5, title: 'The Promise of Wisdom', scripture_refs: [{ book: 'James', chapter: 1, verseStart: 5, verseEnd: 5 }, { book: 'Proverbs', chapter: 2, verseStart: 6, verseEnd: 6 }], content: `"If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you."\n\nParenting is hard. Marriage is complex. Family decisions are weighty. You need wisdom—and God promises to give it generously.\n\nNo question is too small. No situation too complicated. Ask, and He gives. Without finding fault for not knowing. Without hesitation.\n\nGod wants your family to have wisdom even more than you want it.`, reflection_questions: ['What family situation do you need wisdom for right now?', 'Have you specifically asked God for wisdom?', 'How can you create a habit of seeking God\'s wisdom for family decisions?'], prayer_focus: 'Lord, I need wisdom for my family. You promise to give generously—I ask. Guide our decisions. Show us the right path. Give us wisdom from above. Amen.' },
    { day_number: 6, title: 'The Promise of Peace', scripture_refs: [{ book: 'John', chapter: 14, verseStart: 27, verseEnd: 27 }, { book: 'Isaiah', chapter: 26, verseStart: 3, verseEnd: 3 }], content: `"Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid."\n\nJesus promised peace—not circumstantial peace, but His peace. A peace that doesn't depend on everything going smoothly.\n\nYour family can have this peace. In the chaos of schedules, in the tension of disagreements, in the uncertainty of the future—His peace is available.\n\nDon't let your hearts be troubled. Receive His peace.`, reflection_questions: ['Is your home characterized by peace or anxiety?', 'How can you bring Christ\'s peace into your family atmosphere?', 'What troubles are you releasing to receive His peace?'], prayer_focus: 'Jesus, we receive Your peace. Not as the world gives, but Your supernatural peace. Guard our hearts and minds. Let peace rule in our home. Amen.' },
    { day_number: 7, title: 'The Promise of Presence', scripture_refs: [{ book: 'Matthew', chapter: 28, verseStart: 20, verseEnd: 20 }, { book: 'Deuteronomy', chapter: 31, verseStart: 6, verseEnd: 6 }], content: `"And surely I am with you always, to the very end of the age."\n\nThe greatest promise for your family is God's presence. He is with you—always. In every season, every challenge, every celebration.\n\nYour children may leave home, but they can't leave God's presence. Your family faces unknowns, but God is already there.\n\n"Never will I leave you; never will I forsake you." That's a promise for your family.`, reflection_questions: ['How conscious is your family of God\'s presence?', 'How can you cultivate awareness of His presence in your home?', 'How does His presence change how you face family challenges?'], prayer_focus: 'Father, thank You for Your promise to be with us always. Help our family live aware of Your presence. You never leave us. You never forsake us. Amen.' },
    { day_number: 8, title: 'The Promise of Guidance', scripture_refs: [{ book: 'Proverbs', chapter: 3, verseStart: 5, verseEnd: 6 }, { book: 'Psalm', chapter: 32, verseStart: 8, verseEnd: 8 }], content: `"Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."\n\nGod promises to guide your family. Not maybe—He will. The condition is trust and submission.\n\nFamily decisions can be overwhelming. Career moves. Education choices. Where to live. How to spend resources. But God promises to make your paths straight.\n\nTrust Him. Submit your ways to Him. He'll guide.`, reflection_questions: ['What decisions is your family facing that need guidance?', 'Are you trusting God or leaning on your own understanding?', 'How can your family submit your ways to Him together?'], prayer_focus: 'Lord, we trust You with our whole hearts. Guide our family. Make our paths straight. We submit our ways to You. Lead us in Your perfect will. Amen.' },
    { day_number: 9, title: 'The Promise of Restoration', scripture_refs: [{ book: 'Joel', chapter: 2, verseStart: 25, verseEnd: 26 }, { book: 'Malachi', chapter: 4, verseStart: 6, verseEnd: 6 }], content: `"I will repay you for the years the locusts have eaten... He will turn the hearts of the parents to their children, and the hearts of the children to their parents."\n\nGod is a God of restoration. Whatever has been lost, stolen, or broken in your family—He can restore.\n\nEstranged relationships can be healed. Lost years can be redeemed. Broken trust can be rebuilt. Hearts can turn toward each other again.\n\nDon't give up on your family. God's restoration power is at work.`, reflection_questions: ['What has been "lost to the locusts" in your family?', 'Do you believe God can restore what\'s been broken?', 'What hearts need to turn in your family?'], prayer_focus: 'Father, restore what the locusts have eaten. Turn hearts in our family toward each other. Heal what\'s broken. Redeem what\'s been lost. We believe in Your restoration. Amen.' },
    { day_number: 10, title: 'The Promise of Strength', scripture_refs: [{ book: 'Isaiah', chapter: 40, verseStart: 29, verseEnd: 31 }, { book: 'Philippians', chapter: 4, verseStart: 13, verseEnd: 13 }], content: `"He gives strength to the weary and increases the power of the weak... those who hope in the LORD will renew their strength."\n\nFamily life is exhausting. Parenting drains you. Marriage takes work. Caring for aging parents is hard.\n\nBut God promises strength for the weary. When you're running on empty, He refills. When you can't go on, He carries.\n\nHope in the Lord. He'll renew your strength to do what family requires.`, reflection_questions: ['Where do you feel most weary in family life?', 'Are you trying to operate in your own strength?', 'How can you tap into God\'s strength for your family?'], prayer_focus: 'Lord, I\'m weary. Family takes everything I have. Renew my strength. Help me mount up with wings like eagles. I can do all things through Christ who strengthens me. Amen.' },
    { day_number: 11, title: 'The Promise of Fruitfulness', scripture_refs: [{ book: 'Psalm', chapter: 128, verseStart: 3, verseEnd: 4 }, { book: 'Psalm', chapter: 127, verseStart: 3, verseEnd: 5 }], content: `"Your wife will be like a fruitful vine within your house; your children will be like olive shoots around your table. Yes, this will be the blessing for the man who fears the LORD."\n\nGod promises fruitfulness to families who fear Him. Not just biological fruitfulness—but spiritual abundance.\n\nA fruitful family produces disciples. Olive shoots become trees. Children become parents who pass on faith.\n\nFear the Lord, and watch your family flourish.`, reflection_questions: ['What does a "fruitful" family look like to you?', 'How is your family producing spiritual fruit?', 'What would flourishing look like for your family?'], prayer_focus: 'Father, let our family be fruitful. May our home produce disciples. Let our children become mighty oaks of righteousness. We want to flourish for Your glory. Amen.' },
    { day_number: 12, title: 'The Promise of Legacy', scripture_refs: [{ book: 'Psalm', chapter: 78, verseStart: 4, verseEnd: 7 }, { book: 'Deuteronomy', chapter: 6, verseStart: 6, verseEnd: 7 }], content: `"We will not hide them from their descendants; we will tell the next generation the praiseworthy deeds of the LORD... so the next generation would know them... and they in turn would tell their children."\n\nGod's promise isn't just for your generation—it's for generations to come. Your faith creates a legacy that outlives you.\n\nTell the stories. Pass on the faith. Let your children tell their children. This is how legacy works—generation by generation, promise by promise.`, reflection_questions: ['What spiritual legacy are you building?', 'How are you passing faith to the next generation?', 'What stories of God\'s faithfulness does your family need to keep telling?'], prayer_focus: 'Lord, let our faith become a legacy. Help us tell the next generation about Your goodness. May our children\'s children know and serve You. Amen.' },
    { day_number: 13, title: 'The Promise of Victory', scripture_refs: [{ book: '1 John', chapter: 5, verseStart: 4, verseEnd: 5 }, { book: 'Romans', chapter: 8, verseStart: 37, verseEnd: 37 }], content: `"For everyone born of God overcomes the world. This is the victory that has overcome the world, even our faith."\n\nYour family can overcome. Whatever battles you face—financial stress, health challenges, relational conflict, spiritual attack—victory is promised.\n\nNot because you're strong enough, but because you're born of God. Faith is the victory that overcomes.\n\nYour family is more than a conqueror through Christ.`, reflection_questions: ['What battles is your family currently facing?', 'Do you believe victory is possible?', 'How can your family fight together in faith?'], prayer_focus: 'Father, we claim victory for our family. Whatever we face, we overcome through faith in You. We are more than conquerors through Christ. Amen.' },
    { day_number: 14, title: 'Claiming the Promises', scripture_refs: [{ book: '2 Corinthians', chapter: 1, verseStart: 20, verseEnd: 20 }, { book: '2 Peter', chapter: 1, verseStart: 4, verseEnd: 4 }], content: `"For no matter how many promises God has made, they are 'Yes' in Christ. And so through him the 'Amen' is spoken by us to the glory of God."\n\nEvery promise of God is YES in Christ. They're not maybes or possibilities—they're certainties in Jesus.\n\nYour job is to say "Amen"—so be it. To claim, believe, stand on, and live out these promises for your family.\n\nGod's promises are your inheritance. Claim them. Live them. Pass them on.`, reflection_questions: ['Which promise from this series does your family need most?', 'How will you claim and act on God\'s promises?', 'What "Amen" is your family declaring today?'], prayer_focus: 'Lord, every promise is YES in Christ. We say AMEN—so be it for our family. We claim Your promises. We stand on Your Word. Let it be according to Your promises. Amen.' }
  ]
};

// =====================================================
// EASTER TRIUMPH - 14 Day Series
// =====================================================
const EASTER_TRIUMPH = {
  series: {
    slug: 'easter-triumph',
    title: 'Easter Triumph: Resurrection Hope',
    description: 'A 14-day journey from the cross to the empty tomb, celebrating the victory of Christ\'s resurrection.',
    total_days: 14,
    topics: ['Easter', 'resurrection', 'hope', 'victory', 'salvation'],
    is_seasonal: true,
    difficulty_level: 'beginner',
  },
  days: [
    { day_number: 1, title: 'The Road to the Cross', scripture_refs: [{ book: 'Isaiah', chapter: 53, verseStart: 3, verseEnd: 5 }], content: `"He was despised and rejected by mankind, a man of suffering, and familiar with pain... But he was pierced for our transgressions, he was crushed for our iniquities."\n\nBefore we celebrate the resurrection, we must understand why the cross was necessary. Jesus didn't stumble into crucifixion—He walked deliberately toward it.\n\nIsaiah prophesied it 700 years earlier: a suffering servant, despised, rejected, pierced for us. This was always the plan.\n\nThe road to Easter glory goes through Good Friday darkness.`, reflection_questions: ['Why do you think Jesus willingly chose the cross?', 'What does it mean to you that He was "pierced for your transgressions"?', 'How does the cross reveal God\'s love for you?'], prayer_focus: 'Lord Jesus, You chose the cross for me. You were despised and rejected so I could be accepted. Help me grasp the depth of Your sacrifice. Amen.' },
    { day_number: 2, title: 'The Weight of Our Sin', scripture_refs: [{ book: '2 Corinthians', chapter: 5, verseStart: 21, verseEnd: 21 }, { book: 'Romans', chapter: 6, verseStart: 23, verseEnd: 23 }], content: `"God made him who had no sin to be sin for us, so that in him we might become the righteousness of God."\n\nThe cross wasn't just physical torture—it was cosmic exchange. Jesus, who knew no sin, became sin. He absorbed the full weight of human rebellion.\n\nThe wages of sin is death. Someone had to pay. Jesus stepped in and paid it all.\n\nThis is what made the cross necessary. Not Roman politics. Not Jewish jealousy. Our sin demanded a sacrifice.`, reflection_questions: ['What does it mean that Jesus "became sin" for you?', 'How does understanding the weight of sin deepen your gratitude?', 'What sins has Jesus specifically paid for in your life?'], prayer_focus: 'Father, I confess my sin has weight. It demanded payment. Thank You for sending Jesus to pay what I could never pay. I receive His righteousness. Amen.' },
    { day_number: 3, title: 'It Is Finished', scripture_refs: [{ book: 'John', chapter: 19, verseStart: 28, verseEnd: 30 }], content: `"When he had received the drink, Jesus said, 'It is finished.' With that, he bowed his head and gave up his spirit."\n\nTetelestai. It is finished. Paid in full. Complete. Done.\n\nThis wasn't a cry of defeat—it was a shout of victory. Everything required for salvation was accomplished. Nothing left to add. Nothing more to do.\n\nYour salvation doesn't depend on your performance. It depends on His finished work. It is finished.`, reflection_questions: ['What does "it is finished" mean for your striving to earn God\'s favor?', 'Are there areas where you act like the work isn\'t finished?', 'How does this declaration bring you peace?'], prayer_focus: 'Jesus, it is finished. You completed everything. I stop striving and rest in Your finished work. Nothing I do can add to what You\'ve done. Thank You. Amen.' },
    { day_number: 4, title: 'The Darkest Day', scripture_refs: [{ book: 'Matthew', chapter: 27, verseStart: 45, verseEnd: 46 }, { book: 'Luke', chapter: 23, verseStart: 44, verseEnd: 46 }], content: `"From noon until three in the afternoon darkness came over all the land. About three in the afternoon Jesus cried out in a loud voice, 'My God, my God, why have you forsaken me?'"\n\nFor three hours, darkness covered the earth. The Son experienced separation from the Father—the only time in eternity.\n\nThis is what our sin deserved. This is what Jesus endured. Abandoned. Forsaken. Alone.\n\nHe was forsaken so you would never be. He experienced darkness so you could walk in light.`, reflection_questions: ['What does Jesus\' cry of abandonment reveal about what He endured?', 'How does knowing He was forsaken for you affect your relationship with Him?', 'Have you ever felt God-forsaken? How does the cross speak to that?'], prayer_focus: 'Lord, You were forsaken so I never would be. You entered darkness so I could have light. Thank You for enduring what I deserved. Amen.' },
    { day_number: 5, title: 'The Torn Veil', scripture_refs: [{ book: 'Matthew', chapter: 27, verseStart: 51, verseEnd: 51 }, { book: 'Hebrews', chapter: 10, verseStart: 19, verseEnd: 22 }], content: `"At that moment the curtain of the temple was torn in two from top to bottom."\n\nThe veil separated people from God's presence. Only the high priest could enter, once a year, with blood sacrifice.\n\nBut when Jesus died, the veil ripped—from top to bottom. God tore it Himself. The barrier was removed. Access granted.\n\nBecause of Jesus, you can approach God directly. Boldly. Confidently. The way is open.`, reflection_questions: ['What barriers between you and God has Jesus removed?', 'Do you approach God boldly or timidly?', 'How does the torn veil change your prayer life?'], prayer_focus: 'Father, the veil is torn. I have access to You through Jesus. Help me approach boldly, not cowering in fear. The way is open—I come. Amen.' },
    { day_number: 6, title: 'The Silent Saturday', scripture_refs: [{ book: 'Matthew', chapter: 27, verseStart: 62, verseEnd: 66 }, { book: 'Luke', chapter: 23, verseStart: 56, verseEnd: 56 }], content: `"Then they went home and prepared spices and perfumes. But they rested on the Sabbath in obedience to the commandment."\n\nSaturday. The day between. Jesus in the tomb. Disciples hiding. Hope seemingly dead.\n\nThis is the day we often forget—the day when nothing seemed to be happening. The waiting. The grief. The confusion.\n\nSometimes we live in Saturday. Between the promise and fulfillment. Between death and resurrection. But Sunday is coming.`, reflection_questions: ['Have you experienced "Saturday" seasons—waiting between crucifixion and resurrection?', 'How do you handle the silence when God seems inactive?', 'What gives you hope in the waiting?'], prayer_focus: 'Lord, help me trust You in the Saturday seasons. When nothing seems to be happening, You\'re still working. Sunday is coming. I will wait with hope. Amen.' },
    { day_number: 7, title: 'The Empty Tomb', scripture_refs: [{ book: 'Matthew', chapter: 28, verseStart: 5, verseEnd: 6 }, { book: 'Luke', chapter: 24, verseStart: 1, verseEnd: 6 }], content: `"The angel said to the women, 'Do not be afraid, for I know that you are looking for Jesus, who was crucified. He is not here; he has risen, just as he said.'"\n\nHe is not here. He has risen. The tomb is empty. Death couldn't hold Him.\n\nThis changes everything. If Jesus stayed dead, we're still in our sins. But He rose—and His resurrection guarantees ours.\n\nThe stone rolled away. The grave clothes folded. The body gone. He is risen indeed!`, reflection_questions: ['What does the empty tomb mean for your life?', 'How does resurrection change how you face death?', 'What "graves" in your life need resurrection power?'], prayer_focus: 'Lord Jesus, You are risen! The tomb is empty. Death is defeated. Fill me with resurrection hope. Bring Your resurrection power into every dead area of my life. Amen.' },
    { day_number: 8, title: 'Death Defeated', scripture_refs: [{ book: '1 Corinthians', chapter: 15, verseStart: 55, verseEnd: 57 }], content: `"Where, O death, is your victory? Where, O death, is your sting? The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ."\n\nDeath has been mocked. The grave has been robbed. The enemy has been defeated.\n\nFor thousands of years, death was undefeated. Everyone who went in stayed in. Until Jesus. He went in—and walked out.\n\nNow death is a doorway, not a dead end. Victory is ours through Jesus Christ.`, reflection_questions: ['How does Jesus\' victory over death change your fear of dying?', 'What does it mean to have victory over death now?', 'How does resurrection hope affect how you live today?'], prayer_focus: 'Lord, death is defeated! I don\'t have to fear the grave because You conquered it. Thank You for the victory. Help me live in resurrection power today. Amen.' },
    { day_number: 9, title: 'Resurrection Appearances', scripture_refs: [{ book: '1 Corinthians', chapter: 15, verseStart: 3, verseEnd: 8 }, { book: 'John', chapter: 20, verseStart: 19, verseEnd: 20 }], content: `"He appeared to Cephas, and then to the Twelve. After that, he appeared to more than five hundred of the brothers and sisters at the same time."\n\nThe resurrection isn't a myth or hallucination. Jesus appeared physically to hundreds of people over forty days.\n\nHe ate fish. They touched His wounds. He taught them. Walked with them. Commissioned them. This was no ghost—this was the risen Lord.\n\nThe evidence is overwhelming. He is alive.`, reflection_questions: ['Why do the resurrection appearances matter?', 'How does the historical evidence strengthen your faith?', 'Have you encountered the risen Jesus personally?'], prayer_focus: 'Jesus, You appeared to many. You are alive. Open my eyes to see You. Let me encounter You—not just know about You, but know You. Amen.' },
    { day_number: 10, title: 'New Creation', scripture_refs: [{ book: '2 Corinthians', chapter: 5, verseStart: 17, verseEnd: 17 }, { book: 'Romans', chapter: 6, verseStart: 4, verseEnd: 4 }], content: `"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"\n\nThe resurrection doesn't just mean Jesus got a new life—it means you do too. In Christ, you are a new creation.\n\nThe old has gone. Your old identity, your old record, your old bondage—gone. The new has come. New identity. New freedom. New life.\n\nEaster isn't just about Jesus rising. It's about you rising with Him.`, reflection_questions: ['What does it mean to be a "new creation"?', 'What "old things" have passed away in your life?', 'Where do you need to embrace your new creation identity?'], prayer_focus: 'Lord, I am a new creation in Christ! The old is gone. Help me live in the newness You\'ve given. I am not who I used to be. I am risen with Jesus. Amen.' },
    { day_number: 11, title: 'Living Hope', scripture_refs: [{ book: '1 Peter', chapter: 1, verseStart: 3, verseEnd: 4 }], content: `"Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead."\n\nNot dead hope. Not wishful thinking. Living hope—active, powerful, certain—through resurrection.\n\nThis hope is based on historical fact. Jesus died. Jesus rose. Jesus lives. And because He lives, you can face tomorrow.\n\nResurrection creates unshakeable hope.`, reflection_questions: ['What is "living hope" and how is it different from wishful thinking?', 'How does the resurrection give you hope for tomorrow?', 'Where do you need living hope injected into your life?'], prayer_focus: 'Father, thank You for living hope! Because Jesus rose, I can face anything. Fill me with resurrection hope that cannot be shaken. Amen.' },
    { day_number: 12, title: 'Resurrection Power', scripture_refs: [{ book: 'Ephesians', chapter: 1, verseStart: 19, verseEnd: 20 }, { book: 'Philippians', chapter: 3, verseStart: 10, verseEnd: 10 }], content: `"...his incomparably great power for us who believe. That power is the same as the mighty strength he exerted when he raised Christ from the dead."\n\nThe same power that raised Jesus from the dead is available to you. Let that sink in.\n\nNot similar power. Not lesser power. The same power. Resurrection power lives in you through the Holy Spirit.\n\nYou're not operating on your own strength. You have access to the power that conquered death.`, reflection_questions: ['Do you live like you have resurrection power?', 'Where do you need this power at work in your life?', 'How does knowing this power is in you change your confidence?'], prayer_focus: 'Lord, resurrection power lives in me! The same power that raised Jesus is available. Activate it in my life. Help me live in Your mighty strength. Amen.' },
    { day_number: 13, title: 'Resurrection Promise', scripture_refs: [{ book: 'John', chapter: 11, verseStart: 25, verseEnd: 26 }, { book: '1 Corinthians', chapter: 15, verseStart: 20, verseEnd: 22 }], content: `"Jesus said to her, 'I am the resurrection and the life. The one who believes in me will live, even though they die; and whoever lives by believing in me will never die.'"\n\nJesus didn't just demonstrate resurrection—He declared it: "I AM the resurrection." It's not just what He does. It's who He is.\n\nAnd His resurrection guarantees yours. Because He rose, you will rise. Death is temporary. Life is eternal.\n\nDo you believe this?`, reflection_questions: ['Do you believe Jesus\' promise of resurrection for yourself?', 'How does the certainty of your resurrection affect how you live now?', 'How does this promise comfort you regarding loved ones who have died in Christ?'], prayer_focus: 'Jesus, You are the resurrection and the life. I believe! Because You rose, I will rise. I will live forever because of You. Thank You for eternal life. Amen.' },
    { day_number: 14, title: 'Living the Resurrection', scripture_refs: [{ book: 'Romans', chapter: 6, verseStart: 8, verseEnd: 11 }, { book: 'Colossians', chapter: 3, verseStart: 1, verseEnd: 4 }], content: `"Now if we died with Christ, we believe that we will also live with him... Count yourselves dead to sin but alive to God in Christ Jesus."\n\nEaster isn't just a holiday—it's a lifestyle. You died with Christ. You rose with Christ. Now live like it.\n\nDead to sin. Alive to God. Setting your mind on things above. Living in resurrection power every day.\n\nThe Easter story doesn't end at the empty tomb. It continues in how you live. He is risen—and so are you.`, reflection_questions: ['What does it mean to "count yourself dead to sin"?', 'How can you live the resurrection daily, not just celebrate it annually?', 'What will you do differently because of Easter?'], prayer_focus: 'Lord, I am risen with Christ! Help me live the resurrection life. Dead to sin, alive to God. Let Easter be my daily reality, not just a holiday. He is risen—and so am I! Amen.' }
  ]
};

// =====================================================
// TEEN IDENTITY IN CHRIST - 14 Day Series
// =====================================================
const TEEN_IDENTITY_CHRIST = {
  series: {
    slug: 'teen-identity-christ',
    title: 'Identity in Christ',
    description: 'A 14-day journey for teens to discover who they really are in Jesus and break free from the lies the world tells them.',
    total_days: 14,
    topics: ['identity', 'teens', 'self-worth', 'purpose', 'truth'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    { day_number: 1, title: 'Who Defines You?', scripture_refs: [{ book: 'Jeremiah', chapter: 1, verseStart: 5, verseEnd: 5 }], content: `"Before I formed you in the womb I knew you, before you were born I set you apart."\n\nEveryone's trying to tell you who you are. Social media. Friends. Advertisers. Maybe even your own negative thoughts.\n\nBut here's the truth bomb: God knew you before you were born. He defined you before anyone else got a say. Your identity isn't up for debate—it was settled by your Creator.\n\nWho do you let define you?`, reflection_questions: ['What voices are you letting define who you are?', 'How does knowing God "knew you" before birth change things?', 'What lies about yourself do you need to stop believing?'], prayer_focus: 'God, You knew me before I was born. Help me let Your voice be louder than all the others. Show me who I really am—not who the world says I am. Amen.' },
    { day_number: 2, title: 'You Are Not a Mistake', scripture_refs: [{ book: 'Psalm', chapter: 139, verseStart: 13, verseEnd: 14 }], content: `"For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made."\n\nMaybe you've felt like an accident. Like you don't fit. Like something's wrong with you.\n\nLie detected. God knit you together. Carefully. Intentionally. You are fearfully and wonderfully made—not sloppily or randomly.\n\nYour height, your personality, your quirks—all designed. You are not a mistake. You are a masterpiece.`, reflection_questions: ['What parts of yourself do you struggle to accept?', 'How does "fearfully and wonderfully made" apply to those things?', 'Can you thank God for how He made you?'], prayer_focus: 'Father, sometimes I hate how You made me. Help me see myself as a masterpiece, not a mistake. I am fearfully and wonderfully made. Help me believe it. Amen.' },
    { day_number: 3, title: 'Chosen, Not Random', scripture_refs: [{ book: 'Ephesians', chapter: 1, verseStart: 4, verseEnd: 5 }, { book: '1 Peter', chapter: 2, verseStart: 9, verseEnd: 9 }], content: `"For he chose us in him before the creation of the world... he predestined us for adoption to sonship through Jesus Christ."\n\nYou weren't an afterthought. Before the universe existed, God chose you. Picked you. Wanted you.\n\nYou are "a chosen people, a royal priesthood." Not because of what you do, but because of what He did. You belong. You matter. You were selected.\n\nStop feeling like you're on the outside. You're chosen.`, reflection_questions: ['Do you feel chosen or forgotten?', 'How does knowing you were chosen "before creation" affect you?', 'What does it mean to be "royal priesthood" as a teen?'], prayer_focus: 'Lord, thank You for choosing me. When I feel forgotten or left out, remind me I was picked by the King of the universe. I am chosen. Amen.' },
    { day_number: 4, title: 'Loved No Matter What', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 38, verseEnd: 39 }], content: `"For I am convinced that neither death nor life... nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord."\n\nNothing can separate you from God's love. Not your worst day. Not your biggest failure. Not your secret shame. Nothing.\n\nYou don't have to earn it. You can't lose it. It's not based on your grades, your looks, your popularity, or your performance.\n\nGod's love is unconditional. Period.`, reflection_questions: ['What do you fear could make God stop loving you?', 'How does "nothing can separate" speak to that fear?', 'How would you live differently if you fully believed this?'], prayer_focus: 'God, I mess up a lot. But nothing can separate me from Your love. Help me stop trying to earn what You freely give. I am loved. Amen.' },
    { day_number: 5, title: 'Forgiven Completely', scripture_refs: [{ book: '1 John', chapter: 1, verseStart: 9, verseEnd: 9 }, { book: 'Psalm', chapter: 103, verseStart: 12, verseEnd: 12 }], content: `"If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness."\n\nThat thing you did? That thing you keep replaying in your head? That thing you're terrified someone will find out? It's forgivable.\n\nConfess it. Receive forgiveness. Move on.\n\nGod removes your sin "as far as the east is from the west." He doesn't bring it up again. You shouldn't either.`, reflection_questions: ['Is there something you haven\'t forgiven yourself for?', 'Have you confessed it to God and received His forgiveness?', 'What would it look like to actually let it go?'], prayer_focus: 'Lord, I confess my sins to You. Thank You for forgiving completely. Help me receive Your forgiveness and stop punishing myself. I am forgiven. Amen.' },
    { day_number: 6, title: 'New Creation', scripture_refs: [{ book: '2 Corinthians', chapter: 5, verseStart: 17, verseEnd: 17 }], content: `"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"\n\nYou are not your past. You are not your mistakes. In Christ, you are brand new.\n\nThat reputation you hate? New. That label people gave you? Doesn't apply anymore. That version of yourself you're ashamed of? Gone.\n\nThe old has passed away. Stop living in it. You're a new creation.`, reflection_questions: ['What "old" things do you need to let go of?', 'What does being a "new creation" mean for your everyday life?', 'How can you start living in your new identity?'], prayer_focus: 'Jesus, I am a new creation in You. The old is gone. Help me stop going back to who I used to be and start living in who I am now. Amen.' },
    { day_number: 7, title: 'Child of God', scripture_refs: [{ book: 'John', chapter: 1, verseStart: 12, verseEnd: 12 }, { book: 'Galatians', chapter: 4, verseStart: 6, verseEnd: 7 }], content: `"Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God."\n\nYou're not just a fan of God. Not just a follower. You're a child. Part of the family. You can call the Creator of the universe "Dad."\n\n"Because you are his sons, God sent the Spirit of his Son into our hearts, the Spirit who calls out, 'Abba, Father.'"\n\nYou belong in God's family. You have a seat at His table.`, reflection_questions: ['How does being a "child of God" differ from just believing in God?', 'What does it mean to call God "Abba" (Daddy)?', 'How does being in God\'s family change your sense of belonging?'], prayer_focus: 'Father—Daddy—thank You for adopting me into Your family. I\'m not an outsider. I belong. I am Your child. Amen.' },
    { day_number: 8, title: 'More Than Your Feelings', scripture_refs: [{ book: 'Jeremiah', chapter: 17, verseStart: 9, verseEnd: 9 }, { book: '2 Corinthians', chapter: 5, verseStart: 7, verseEnd: 7 }], content: `"The heart is deceitful above all things... We live by faith, not by sight."\n\nYour feelings lie to you. That voice saying you're worthless? Lying. The feeling that nobody cares? Deception. The thought that you'll never be enough? Fake news.\n\nYour identity is based on truth, not feelings. Feelings change daily—truth doesn't.\n\nLive by faith in what God says, not by feelings that constantly shift.`, reflection_questions: ['What negative feelings do you struggle with most?', 'How can you fight lying feelings with truth?', 'What truths about your identity can you declare when feelings lie?'], prayer_focus: 'Lord, my feelings lie to me. Help me live by faith in Your truth, not by my shifting emotions. Your Word is more real than my feelings. Amen.' },
    { day_number: 9, title: 'Purpose Designed', scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 10, verseEnd: 10 }, { book: 'Jeremiah', chapter: 29, verseStart: 11, verseEnd: 11 }], content: `"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do."\n\nYou're not wandering aimlessly. God has a purpose for you—good works He prepared before you were born.\n\nYou're His "handiwork"—a work of art with a specific design and function. Your life has meaning. There are things only you can do.\n\n"I know the plans I have for you," God says. He's got a blueprint. Trust it.`, reflection_questions: ['Do you feel like your life has purpose?', 'What might be the "good works" God prepared for you?', 'How can you start walking in your purpose now?'], prayer_focus: 'God, I want to live with purpose. Show me the good works You\'ve prepared for me. Help me walk in Your plans, not just drift through life. Amen.' },
    { day_number: 10, title: 'Valuable Beyond Measure', scripture_refs: [{ book: 'Matthew', chapter: 10, verseStart: 29, verseEnd: 31 }, { book: 'Luke', chapter: 12, verseStart: 7, verseEnd: 7 }], content: `"So don't be afraid; you are worth more than many sparrows."\n\nGod notices when a sparrow falls. But you? You're worth more than many sparrows. The hairs on your head are numbered.\n\nYour value isn't determined by likes, followers, or popularity. It's not based on your talents, grades, or appearance.\n\nYou're valuable because God says so. End of discussion.`, reflection_questions: ['Where do you look for your sense of value?', 'How would you act differently if you truly believed you were valuable?', 'What would change if you stopped comparing yourself to others?'], prayer_focus: 'Father, I\'m worth more than sparrows. Help me stop looking for value in the wrong places. I am valuable because You say I am. Amen.' },
    { day_number: 11, title: 'Equipped and Empowered', scripture_refs: [{ book: '2 Timothy', chapter: 1, verseStart: 7, verseEnd: 7 }, { book: 'Philippians', chapter: 4, verseStart: 13, verseEnd: 13 }], content: `"For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline."\n\nYou're not weak. You're not helpless. God's Spirit in you gives power, love, and self-control.\n\nThat hard thing you're facing? You can do it through Christ who gives you strength. Not in your own power—in His.\n\nStop feeling incapable. You're equipped. You're empowered.`, reflection_questions: ['Where do you feel weak or incapable?', 'How can you tap into the Spirit\'s power in those areas?', 'What becomes possible if you truly believe "I can do all things through Christ"?'], prayer_focus: 'Lord, give me power, love, and self-control. I can do all things through Christ who strengthens me. Help me live empowered, not defeated. Amen.' },
    { day_number: 12, title: 'Made to Stand Out', scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 14, verseEnd: 16 }, { book: '1 Peter', chapter: 2, verseStart: 9, verseEnd: 9 }], content: `"You are the light of the world. A town built on a hill cannot be hidden."\n\nYou're not called to blend in. You're light in darkness. A city on a hill. Meant to be seen.\n\nSometimes that's hard. Being different gets you mocked. Standing out feels risky.\n\nBut God didn't design you to be a copy. You're an original. Let your light shine.`, reflection_questions: ['Do you try to fit in or stand out for your faith?', 'What does it mean to be "light" in your school/community?', 'How can you let your light shine without being preachy?'], prayer_focus: 'Jesus, help me shine. I don\'t want to hide who I am in You just to fit in. Give me courage to stand out. I am light. Amen.' },
    { day_number: 13, title: 'Defeating Comparison', scripture_refs: [{ book: 'Galatians', chapter: 6, verseStart: 4, verseEnd: 5 }, { book: '2 Corinthians', chapter: 10, verseStart: 12, verseEnd: 12 }], content: `"Each one should test their own actions. Then they can take pride in themselves alone, without comparing themselves to someone else."\n\nComparison is a joy killer. There's always someone smarter, prettier, more talented, more popular.\n\nBut comparing is unwise. You're not them. They're not you. You have a unique lane to run in.\n\nStop scrolling through highlight reels and feeling bad about your real life. Run your race.`, reflection_questions: ['Who do you compare yourself to most?', 'How does comparison affect your mood and confidence?', 'What would it look like to run your own race?'], prayer_focus: 'Lord, free me from comparison. Help me focus on my own lane, not everyone else\'s highlight reel. I am me—and that\'s enough. Amen.' },
    { day_number: 14, title: 'Living Your True Identity', scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 3, verseEnd: 4 }, { book: 'Romans', chapter: 12, verseStart: 2, verseEnd: 2 }], content: `"For you died, and your life is now hidden with Christ in God. When Christ, who is your life, appears, then you also will appear with him in glory."\n\nYour identity is hidden in Christ. Not in your achievements, your appearance, your reputation, or your failures.\n\nDon't let the world squeeze you into its mold. Be transformed by renewing your mind—thinking what God thinks about you.\n\nYou know who you are now. Live it.`, reflection_questions: ['What have you learned about your identity these past 14 days?', 'What lies will you need to keep fighting?', 'How will you live differently knowing who you are in Christ?'], prayer_focus: 'Father, my life is hidden in Christ. Help me live from my true identity every day. When lies come, remind me of the truth. I know who I am. Amen.' }
  ]
};

// =====================================================
// TEEN FAITH OVER FEAR - 7 Day Series
// =====================================================
const TEEN_FAITH_OVER_FEAR = {
  series: {
    slug: 'teen-faith-over-fear',
    title: 'Faith Over Fear',
    description: 'A 7-day journey for teens to conquer fear with faith and discover the courage God offers.',
    total_days: 7,
    topics: ['fear', 'faith', 'courage', 'teens', 'anxiety'],
    is_seasonal: false,
    difficulty_level: 'beginner',
  },
  days: [
    { day_number: 1, title: 'Fear Is Real—But So Is God', scripture_refs: [{ book: 'Psalm', chapter: 56, verseStart: 3, verseEnd: 4 }], content: `"When I am afraid, I put my trust in you. In God, whose word I praise—in God I trust and am not afraid."\n\nLet's get real: fear is normal. Everyone feels it. Tests. Social situations. The future. Family drama. The world is scary.\n\nBut notice what David says: "When I am afraid"—not if, when. He felt fear too. But then? "I put my trust in you."\n\nFear doesn't disqualify you from faith. It's the setup for faith to show up.`, reflection_questions: ['What are you most afraid of right now?', 'How does knowing David felt fear too encourage you?', 'What would it look like to "put your trust in God" with that fear?'], prayer_focus: 'God, I\'m afraid sometimes. But I choose to trust You. When fear shows up, help my faith show up bigger. Amen.' },
    { day_number: 2, title: 'Do Not Fear—365 Times', scripture_refs: [{ book: 'Isaiah', chapter: 41, verseStart: 10, verseEnd: 10 }], content: `"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."\n\nDid you know "do not fear" appears 365 times in the Bible? One for every day of the year. That's not a coincidence.\n\nGod knows we need constant reminding: Don't be afraid. I'm with you. I'll strengthen you. I've got you.\n\nFear says you're alone. God says He's right there.`, reflection_questions: ['Does fear make you feel alone?', 'How does "I am with you" speak to that loneliness?', 'What changes if you believe God is truly with you in scary situations?'], prayer_focus: 'Lord, You are with me. When fear says I\'m alone, remind me You\'re right here. Strengthen me. Hold me up. I trust You. Amen.' },
    { day_number: 3, title: 'Fear of People', scripture_refs: [{ book: 'Proverbs', chapter: 29, verseStart: 25, verseEnd: 25 }, { book: 'Galatians', chapter: 1, verseStart: 10, verseEnd: 10 }], content: `"Fear of man will prove to be a snare, but whoever trusts in the LORD is kept safe."\n\nSo much teen fear is about people. What will they think? Will they accept me? What if they laugh? What if I'm rejected?\n\nBut fear of people is a trap. It controls you. Changes who you are. Makes you do things you don't want to do.\n\nWhen you fear God more than people, you're free. Their opinion loses its power.`, reflection_questions: ['Whose opinion do you fear most?', 'How has fear of people changed your behavior?', 'What would you do differently if you weren\'t afraid of what people thought?'], prayer_focus: 'God, free me from fear of people. Their opinion isn\'t ultimate—Yours is. Help me care more about what You think than what they think. Amen.' },
    { day_number: 4, title: 'Fear of the Future', scripture_refs: [{ book: 'Jeremiah', chapter: 29, verseStart: 11, verseEnd: 11 }, { book: 'Matthew', chapter: 6, verseStart: 34, verseEnd: 34 }], content: `"'For I know the plans I have for you,' declares the LORD, 'plans to prosper you and not to harm you, plans to give you hope and a future.'"\n\nCollege. Career. Relationships. Life. The future is unknown, and the unknown is terrifying.\n\nBut God knows your future. He has plans. Good plans. And He tells you not to worry about tomorrow—today has enough to deal with.\n\nYou don't have to have it all figured out. He does.`, reflection_questions: ['What about the future scares you most?', 'How does knowing God has plans change your fear?', 'What can you focus on today instead of worrying about tomorrow?'], prayer_focus: 'Lord, You know my future even when I don\'t. I trust Your plans are good. Help me focus on today and leave tomorrow to You. Amen.' },
    { day_number: 5, title: 'Courage Isn\'t Fearless', scripture_refs: [{ book: 'Joshua', chapter: 1, verseStart: 9, verseEnd: 9 }], content: `"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."\n\nCourage isn't the absence of fear. It's action despite fear.\n\nGod told Joshua to be courageous because he was about to do something scary. The command implies he might be tempted to fear.\n\nCourage is feeling the fear and trusting God anyway. Moving forward even when you're scared.`, reflection_questions: ['What is something you need courage to do?', 'How does knowing courage includes fear change your expectation?', 'What step could you take even though you are afraid?'], prayer_focus: 'God, give me courage—not to be fearless, but to trust You despite fear. Help me take the next step even when I\'m scared. Amen.' },
    { day_number: 6, title: 'Perfect Love Casts Out Fear', scripture_refs: [{ book: '1 John', chapter: 4, verseStart: 18, verseEnd: 18 }], content: `"There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love."\n\nFear and love can't fully coexist. The more you experience God's perfect love, the less power fear has.\n\nWhen you know you're loved unconditionally—nothing to prove, nothing to lose—fear loses its grip.\n\nGod's love is the antidote to fear. Let it sink deep.`, reflection_questions: ['How does knowing you\'re loved affect your fear?', 'What fears might shrink if you truly believed God\'s love?', 'How can you experience God\'s love more deeply?'], prayer_focus: 'Father, let Your perfect love drive out my fears. Help me know how loved I am. When fear rises, remind me of Your love. Amen.' },
    { day_number: 7, title: 'Faith Over Fear—The Choice', scripture_refs: [{ book: 'Mark', chapter: 5, verseStart: 36, verseEnd: 36 }, { book: 'Hebrews', chapter: 11, verseStart: 1, verseEnd: 1 }], content: `"Jesus told him, 'Don't be afraid; just believe.'"\n\nFaith over fear is a choice you make every day. Fear will show up. The question is: will you let it win?\n\nJesus' words are simple: "Don't be afraid; just believe." Not complicated. Not a formula. Just trust.\n\nWhen fear knocks, let faith answer the door. You've got this—because God's got you.`, reflection_questions: ['What have you learned this week about fear and faith?', 'How will you choose faith over fear going forward?', 'What truth will you hold onto when fear comes?'], prayer_focus: 'Jesus, I choose faith over fear. When fear knocks, I\'ll let faith answer. Thank You for being bigger than anything I\'m afraid of. Amen.' }
  ]
};

// =====================================================
// NAMES AND ATTRIBUTES OF JESUS - 21 Day Series
// =====================================================
const NAMES_ATTRIBUTES_JESUS = {
  series: {
    slug: 'names-attributes-jesus',
    title: 'Names and Attributes of Jesus',
    description: 'Discover the power and meaning behind the many names of Jesus Christ and grow in your understanding of who He is.',
    total_days: 21,
    topics: ['Jesus', 'Names of God', 'Christology', 'Identity'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'The Word (Logos)',
      scripture_refs: [{ book: 'John', chapter: 1, verseStart: 1, verseEnd: 14 }],
      content: `"In the beginning was the Word, and the Word was with God, and the Word was God." Jesus is the eternal Word—the Logos—through whom all things were created. This name reveals that Jesus is the very expression of God, the divine communication to humanity.

Just as words reveal thoughts, Jesus reveals the Father. He is not merely a messenger but the message itself. In Jesus, God speaks His final and complete word to us. Everything God wants to say to humanity is embodied in Christ.

The Word became flesh and dwelt among us. This is the miracle of the incarnation—the eternal entering time, the infinite becoming finite, the Creator becoming creature. Jesus bridges the gap between heaven and earth, between God and humanity.

When you feel distant from God, remember that Jesus is the Word who makes God known. He is not silent but has spoken clearly through His life, death, and resurrection. In Jesus, you hear the Father's heart.`,
      reflection_questions: [
        'What does it mean to you that Jesus is the Word of God?',
        'How does Jesus reveal the Father to you?',
        'In what ways has God spoken to you through Christ?'
      ],
      prayer_focus: 'Thank Jesus for being the Word who reveals God to you. Ask Him to help you know the Father more deeply through Him.'
    },
    {
      day_number: 2,
      title: 'Immanuel - God With Us',
      scripture_refs: [{ book: 'Matthew', chapter: 1, verseStart: 22, verseEnd: 23 }],
      content: `"Behold, the virgin shall conceive and bear a son, and they shall call his name Immanuel, which means, God with us." This name captures the stunning reality of the incarnation—God Himself has come to dwell among us.

Immanuel speaks to the nearness of God. He is not a distant deity, uninvolved with human affairs. In Jesus, God entered into the full human experience—the joys and sorrows, the temptations and struggles, the limitations of flesh. He knows what it is to be human.

This name offers profound comfort. Whatever you face, you do not face it alone. God is with you—not in some abstract spiritual sense, but in the person of Jesus who walked this earth and now lives within believers through His Spirit.

The promise of Immanuel extends to the end of the age. Jesus said, "I am with you always." His presence is your constant companion, your ever-present help in trouble, your faithful friend who will never leave nor forsake you.`,
      reflection_questions: [
        'How does knowing God is with you change how you face challenges?',
        'When have you most powerfully experienced the presence of Jesus?',
        'What situations in your life need the comfort of Immanuel today?'
      ],
      prayer_focus: 'Praise Jesus for being Immanuel, God with you. Invite His presence into every area of your life today.'
    },
    {
      day_number: 3,
      title: 'Lamb of God',
      scripture_refs: [{ book: 'John', chapter: 1, verseStart: 29, verseEnd: 36 }],
      content: `"Behold, the Lamb of God, who takes away the sin of the world!" When John the Baptist spoke these words, he identified Jesus as the ultimate sacrifice for sin. This name connects Jesus to the entire sacrificial system of the Old Testament.

In ancient Israel, lambs were offered daily for the sins of the people. Each sacrifice pointed forward to a greater sacrifice to come. Jesus is that perfect Lamb—without blemish, without spot—who would take away not just the sins of Israel but the sins of the whole world.

The imagery of the lamb also speaks of gentleness and submission. Jesus did not come with armies and violence but with meekness and surrender to the Father's will. Like a lamb led to slaughter, He went silently to the cross, bearing our sins in His body.

Because Jesus is the Lamb of God, the work of atonement is complete. No more sacrifices are needed. His blood is sufficient to cleanse all sin, for all people, for all time. In Him, you find complete forgiveness and perfect peace with God.`,
      reflection_questions: [
        'What does the sacrifice of Jesus mean for your daily life?',
        'How should the Lamb of God gentleness shape your character?',
        'How can you live in the freedom that His sacrifice provides?'
      ],
      prayer_focus: 'Thank Jesus for being the Lamb of God who takes away your sin. Rest in the completeness of His sacrifice for you.'
    },
    {
      day_number: 4,
      title: 'Light of the World',
      scripture_refs: [{ book: 'John', chapter: 8, verseStart: 12, verseEnd: 12 }, { book: 'John', chapter: 9, verseStart: 5, verseEnd: 5 }],
      content: `"I am the light of the world. Whoever follows me will not walk in darkness, but will have the light of life." In a world filled with darkness—moral darkness, spiritual darkness, the darkness of confusion and despair—Jesus shines as the light.

Light reveals what is hidden. Jesus exposes sin, but not to condemn—rather to heal. In His light, we see ourselves truly, and we see God clearly. The darkness of deception and self-delusion cannot survive in His presence.

Light also guides. Without light, we stumble and lose our way. Jesus illuminates the path before us, showing us how to live, where to go, what to choose. Following Him means walking in light, step by step, day by day.

As His followers, we are called to reflect His light to others. "You are the light of the world," Jesus told His disciples. The light we receive from Him is meant to shine through us, bringing hope and truth to those still in darkness.`,
      reflection_questions: [
        'What areas of darkness in your life need the light of Jesus?',
        'How has Jesus guided you out of confusion into clarity?',
        'How can you reflect His light to others today?'
      ],
      prayer_focus: 'Ask Jesus to shine His light into every dark corner of your heart. Pray for boldness to reflect His light to others.'
    },
    {
      day_number: 5,
      title: 'Bread of Life',
      scripture_refs: [{ book: 'John', chapter: 6, verseStart: 35, verseEnd: 51 }],
      content: `"I am the bread of life; whoever comes to me shall not hunger, and whoever believes in me shall never thirst." Just as bread sustains physical life, Jesus sustains spiritual life. He is the essential nourishment for our souls.

This name recalls the manna that sustained Israel in the wilderness. That bread came from heaven daily, and the people depended on it completely. Jesus is the true bread from heaven—not temporary sustenance but eternal life. He satisfies the deepest hunger of the human heart.

The world offers many substitutes for this bread—pleasure, success, possessions, relationships. But these can never truly satisfy. Only Jesus can fill the void in the human soul. Only He provides the nourishment that leads to eternal life.

To receive this bread, we must come to Jesus and believe in Him. We must feed on Him daily through His Word, through prayer, through worship. As we partake of the Bread of Life, we find our souls satisfied and strengthened.`,
      reflection_questions: [
        'What are you hungry for that only Jesus can satisfy?',
        'How do you feed on the Bread of Life daily?',
        'What substitutes have you tried that have left you empty?'
      ],
      prayer_focus: 'Come to Jesus as the Bread of Life. Ask Him to satisfy your deepest hunger and nourish your soul today.'
    },
    {
      day_number: 6,
      title: 'Good Shepherd',
      scripture_refs: [{ book: 'John', chapter: 10, verseStart: 11, verseEnd: 18 }],
      content: `"I am the good shepherd. The good shepherd lays down his life for the sheep." This beloved image of Jesus reveals His tender care, His protective love, and His sacrificial commitment to His people.

Unlike hired hands who flee when danger comes, the Good Shepherd stays. He faces the wolves, protects the flock, and willingly gives His life for the sheep. Jesus did exactly this at the cross—He did not run from death but embraced it for our sake.

The Good Shepherd knows His sheep by name. He calls us individually, leads us personally, cares for us specifically. We are not numbers to Him but beloved children, each precious in His sight.

As sheep, our role is to hear His voice and follow. Sheep are not known for their intelligence or strength but for their dependence on the shepherd. This is our calling too—not to figure everything out ourselves but to trust the One who leads us beside still waters and through dark valleys.`,
      reflection_questions: [
        'How have you experienced the care of the Good Shepherd?',
        'In what ways do you need to trust His leading more fully?',
        'How does knowing He laid down His life for you affect your love for Him?'
      ],
      prayer_focus: 'Thank Jesus for being your Good Shepherd. Ask Him to help you hear His voice and follow Him more closely.'
    },
    {
      day_number: 7,
      title: 'The Way, Truth, and Life',
      scripture_refs: [{ book: 'John', chapter: 14, verseStart: 6, verseEnd: 7 }],
      content: `"I am the way, and the truth, and the life. No one comes to the Father except through me." In one powerful statement, Jesus makes an exclusive claim—He alone is the path to God, the reality of God, the life of God.

Jesus is the Way. Not a way among many but the only way. Humanity had lost its way to God through sin, but Jesus is the bridge, the door, the path that leads home. Through Him, we have access to the Father.

Jesus is the Truth. In an age of relativism and deception, He stands as absolute reality. All truth finds its source and meaning in Him. To know Jesus is to know truth personified.

Jesus is the Life. True life—abundant, eternal, meaningful life—is found only in Him. Apart from Christ, we are spiritually dead. In Him, we pass from death to life, from existence to truly living.`,
      reflection_questions: [
        'How has Jesus been the Way for you to know God?',
        'In what areas do you need to embrace Him as Truth?',
        'What does it mean for Jesus to be your Life?'
      ],
      prayer_focus: 'Worship Jesus as the Way, Truth, and Life. Commit to following His way, believing His truth, and living His life.'
    },
    {
      day_number: 8,
      title: 'The Resurrection and the Life',
      scripture_refs: [{ book: 'John', chapter: 11, verseStart: 25, verseEnd: 26 }],
      content: `"I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live." Standing before the tomb of His friend Lazarus, Jesus made this stunning declaration. He is not just one who gives resurrection—He is resurrection itself.

Death is humanity's greatest enemy, the inevitable end that haunts every life. But Jesus has conquered death. He entered the grave and came out victorious. Because He lives, all who believe in Him will also live.

This promise transforms how we view death. For the believer, death is not the end but a doorway. It is not defeat but transition. Physical death cannot separate us from the love of Christ or the life He gives.

But resurrection life is not only future—it is present. Jesus gives spiritual resurrection now. Those who were dead in sin are made alive in Christ. The same power that raised Jesus from the dead works in believers today, bringing new life, new hope, new possibilities.`,
      reflection_questions: [
        'How does the resurrection of Jesus give you hope?',
        'In what ways have you experienced resurrection life now?',
        'How should this truth affect your fear of death?'
      ],
      prayer_focus: 'Thank Jesus for conquering death. Ask Him to fill you with resurrection power and hope today.'
    },
    {
      day_number: 9,
      title: 'The True Vine',
      scripture_refs: [{ book: 'John', chapter: 15, verseStart: 1, verseEnd: 8 }],
      content: `"I am the true vine, and my Father is the vinedresser." With this image, Jesus describes the vital connection between Himself and His followers. He is the source of life; we are the branches that bear fruit through Him.

A branch has no life of its own. Cut off from the vine, it withers and dies. This is the reality of our relationship with Christ—apart from Him, we can do nothing. Our fruitfulness, our spiritual vitality, our very life flows from remaining connected to Jesus.

The Father is the vinedresser who tends the vine. He prunes branches to make them more fruitful. Pruning is painful but purposeful. God cuts away what hinders growth so that we might bear more fruit for His glory.

To abide in Christ is to remain connected, to draw life from Him constantly. This happens through His Word dwelling in us, through prayer, through obedience. As we abide, fruit naturally grows—love, joy, peace, and all the character of Christ.`,
      reflection_questions: [
        'What does it look like for you to abide in Christ daily?',
        'How have you experienced the pruning of the Father in your life?',
        'What fruit is growing in your life through your connection to Jesus?'
      ],
      prayer_focus: 'Ask Jesus to help you abide in Him more deeply. Surrender to the pruning work of the Father in your life.'
    },
    {
      day_number: 10,
      title: 'King of Kings',
      scripture_refs: [{ book: 'Revelation', chapter: 19, verseStart: 11, verseEnd: 16 }],
      content: `"On his robe and on his thigh he has a name written, King of kings and Lord of lords." This majestic title reveals Jesus in His glory—the sovereign ruler over all creation, before whom every knee will bow.

Throughout history, empires have risen and fallen, kings have reigned and perished. But Jesus reigns eternally. His kingdom has no end. All earthly authority is subordinate to His supreme rule.

Yet this King of kings chose to serve. He washed His disciples' feet. He associated with outcasts. He died a criminal's death. His kingship is unlike any earthly monarchy—it is characterized by sacrificial love and humble service.

One day, this King will return in glory. The rider on the white horse will come to judge the nations and establish His eternal kingdom. Every wrong will be made right. Every tear will be wiped away. The King of kings will reign forever and ever.`,
      reflection_questions: [
        'How should the kingship of Jesus affect your daily decisions?',
        'In what areas of your life have you not yet submitted to His rule?',
        'How does the promise of His return give you hope?'
      ],
      prayer_focus: 'Bow before Jesus as your King. Submit every area of your life to His loving rule and reign.'
    },
    {
      day_number: 11,
      title: 'Prince of Peace',
      scripture_refs: [{ book: 'Isaiah', chapter: 9, verseStart: 6, verseEnd: 7 }],
      content: `"For to us a child is born, to us a son is given...and his name shall be called...Prince of Peace." In a world torn by conflict—between nations, within communities, inside our own hearts—Jesus comes as the Prince of Peace.

The peace Jesus brings is not merely the absence of conflict but the presence of wholeness. The Hebrew word shalom encompasses well-being, completeness, harmony with God, others, and oneself. This is what Jesus offers.

He made peace through the blood of His cross. The enmity between God and humanity, caused by sin, has been removed. We who were enemies are now reconciled, at peace with our Creator.

This peace guards our hearts and minds. It does not depend on circumstances but on the One who is our peace. In the midst of storms, the Prince of Peace speaks: "Peace, be still." His presence is our peace.`,
      reflection_questions: [
        'Where in your life do you most need the peace of Jesus?',
        'How has He reconciled you to God and given you peace?',
        'How can you be a peacemaker, reflecting the Prince of Peace?'
      ],
      prayer_focus: 'Receive the peace of Jesus today. Ask Him to calm your anxious heart and make you an instrument of His peace.'
    },
    {
      day_number: 12,
      title: 'Wonderful Counselor',
      scripture_refs: [{ book: 'Isaiah', chapter: 9, verseStart: 6, verseEnd: 6 }, { book: 'Isaiah', chapter: 11, verseStart: 2, verseEnd: 3 }],
      content: `"His name shall be called Wonderful Counselor..." Jesus possesses perfect wisdom and offers divine guidance to all who seek Him. He is the counselor whose advice is always right, whose wisdom never fails.

In a world of conflicting voices and confusing choices, we desperately need a wise counselor. Jesus offers wisdom that comes from above—pure, peaceable, gentle, full of mercy and good fruits. His counsel leads to life.

The Spirit of wisdom and understanding rests upon Him. When we face decisions, He is available to guide. When we struggle with problems, His wisdom is accessible. James tells us: if anyone lacks wisdom, ask God who gives generously.

Jesus does not counsel from a distance. He is the Wonderful Counselor who enters into our situations, understands our struggles, and walks with us through every decision. His guidance is personal, practical, and powerful.`,
      reflection_questions: [
        'What decision in your life needs the wisdom of the Wonderful Counselor?',
        'How do you seek His counsel in daily life?',
        'When has His guidance proven wonderful in your experience?'
      ],
      prayer_focus: 'Bring your decisions and struggles to the Wonderful Counselor. Ask for His wisdom and commit to following His guidance.'
    },
    {
      day_number: 13,
      title: 'Mighty God',
      scripture_refs: [{ book: 'Isaiah', chapter: 9, verseStart: 6, verseEnd: 6 }, { book: 'Colossians', chapter: 2, verseStart: 9, verseEnd: 10 }],
      content: `"His name shall be called...Mighty God." This title declares the full deity of Jesus Christ. He is not merely a good teacher or a great prophet—He is God Almighty in human flesh.

In Christ, all the fullness of the Godhead dwells bodily. He created the universe with a word. He calmed storms with a command. He raised the dead with His voice. His power is unlimited, His might unmatched.

Yet this Mighty God uses His power in service of love. He healed the sick, freed the oppressed, comforted the broken. His might is not displayed in domination but in redemption. He is mighty to save.

Whatever giants you face—sin, fear, addiction, circumstances—the Mighty God is mightier. Nothing is too hard for Him. No enemy is too strong. No situation is beyond His power. The same might that conquered death is available to you.`,
      reflection_questions: [
        'What challenges in your life need the power of the Mighty God?',
        'How does recognizing Jesus as Mighty God affect your faith?',
        'In what ways have you experienced His mighty power?'
      ],
      prayer_focus: 'Worship Jesus as the Mighty God. Bring your impossible situations to Him and trust in His unlimited power.'
    },
    {
      day_number: 14,
      title: 'Everlasting Father',
      scripture_refs: [{ book: 'Isaiah', chapter: 9, verseStart: 6, verseEnd: 6 }, { book: 'John', chapter: 14, verseStart: 8, verseEnd: 11 }],
      content: `"His name shall be called...Everlasting Father." This does not confuse Jesus with God the Father but reveals His tender, fatherly care for His people. He is the eternal provider, protector, and parent of those who trust Him.

As Everlasting Father, Jesus cares for us eternally. His love is not temporary. His protection is not limited. His provision is not seasonal. He is the father who will never leave, never abandon, never fail His children.

Many people have experienced absent, abusive, or disappointing earthly fathers. Jesus redeems the very concept of fatherhood. In Him, we see what a perfect father looks like—patient, kind, present, protective, providing.

The father-heart of Jesus draws us close. He delights in His children. He disciplines for our good. He gives good gifts. He welcomes us home when we stray. In Him, we find the fatherly love every heart craves.`,
      reflection_questions: [
        'How has your earthly father experience affected your view of God?',
        'In what ways has Jesus shown you fatherly care?',
        'How does the eternality of His fatherly love comfort you?'
      ],
      prayer_focus: 'Thank Jesus for His everlasting fatherly care. Allow Him to heal any wounds from earthly father relationships.'
    },
    {
      day_number: 15,
      title: 'Alpha and Omega',
      scripture_refs: [{ book: 'Revelation', chapter: 22, verseStart: 13, verseEnd: 13 }, { book: 'Revelation', chapter: 1, verseStart: 8, verseEnd: 8 }],
      content: `"I am the Alpha and the Omega, the first and the last, the beginning and the end." Jesus encompasses all of history. He was there at creation; He will be there at consummation. Everything in between is under His sovereign control.

Alpha and Omega are the first and last letters of the Greek alphabet. Jesus is the A to Z, the entire alphabet of existence. All meaning, all purpose, all significance is found in Him. He is the beginning from which everything flows and the end toward which everything moves.

This title assures us that Jesus knows the end from the beginning. Nothing surprises Him. No twist in history catches Him off guard. He who started the good work will complete it. He who began creation will bring it to its glorious conclusion.

Your story is held in His hands—the Author and Finisher. He who began a good work in you will be faithful to complete it. From your first breath to your last, from eternity past to eternity future, Jesus is Lord.`,
      reflection_questions: [
        'How does knowing Jesus is the beginning and end give you confidence?',
        'What unfinished areas of your life do you need to trust to Him?',
        'How does this eternal perspective change how you view daily problems?'
      ],
      prayer_focus: 'Praise Jesus as the Alpha and Omega. Trust Him with your past, present, and future.'
    },
    {
      day_number: 16,
      title: 'Lion of Judah',
      scripture_refs: [{ book: 'Revelation', chapter: 5, verseStart: 5, verseEnd: 6 }, { book: 'Genesis', chapter: 49, verseStart: 9, verseEnd: 10 }],
      content: `"Behold, the Lion of the tribe of Judah, the Root of David, has conquered." This powerful title presents Jesus as the conquering King, the mighty warrior, the One who has overcome all enemies.

The lion represents strength, courage, and royal authority. Jesus is no weak Savior but a mighty conqueror. He has defeated sin, death, and Satan. He has triumphed over every enemy. He reigns victorious.

Yet when John looked to see the Lion, he saw a Lamb. This is the beautiful paradox of Jesus—the Lion who conquers through sacrifice, the King who wins through surrender, the Mighty One who demonstrates strength through apparent weakness.

The Lion of Judah fights for you. When you are weak, He is strong. When enemies surround you, He defends. When darkness threatens, the Lion roars. You can face any battle with confidence because the Lion of Judah is on your side.`,
      reflection_questions: [
        'How do you balance seeing Jesus as both Lion and Lamb?',
        'What battles in your life need the victory of the Lion?',
        'How does His conquering power give you courage?'
      ],
      prayer_focus: 'Worship Jesus as the Lion of Judah who has conquered. Ask Him to fight your battles and give you victory.'
    },
    {
      day_number: 17,
      title: 'The Door',
      scripture_refs: [{ book: 'John', chapter: 10, verseStart: 7, verseEnd: 10 }],
      content: `"I am the door. If anyone enters by me, he will be saved and will go in and out and find pasture." Jesus is the access point, the entryway, the only door to salvation and abundant life.

In ancient times, shepherds would lie across the opening of the sheepfold, literally becoming the door. Nothing could harm the sheep without going through the shepherd. Jesus is our door—our protection, our access, our way in.

Through this door, we find salvation. There is no other entrance to God's family, no other way to eternal life. Every other door leads to dead ends. Only Jesus opens the way to the Father.

Through this door, we also find abundant life—full, rich, meaningful existence. We go in and out and find pasture. We find nourishment, freedom, and flourishing. Jesus does not just get us in; He gives us life to the full.`,
      reflection_questions: [
        'How did you enter through the door of Jesus?',
        'What does abundant life look like for you?',
        'How has Jesus protected you as your door?'
      ],
      prayer_focus: 'Thank Jesus for being the door to salvation. Ask Him to lead you into the abundance He promises.'
    },
    {
      day_number: 18,
      title: 'Faithful and True',
      scripture_refs: [{ book: 'Revelation', chapter: 19, verseStart: 11, verseEnd: 13 }, { book: 'Revelation', chapter: 3, verseStart: 14, verseEnd: 14 }],
      content: `"Then I saw heaven opened, and behold, a white horse! The one sitting on it is called Faithful and True." In a world of broken promises and false claims, Jesus stands as the perfectly faithful and absolutely true One.

Faithful means He keeps His promises. Every word He has spoken, He will fulfill. He does not forget His commitments. He does not change His mind out of fickleness. What He has said, He will do. His faithfulness is great.

True means He is the reality behind all truth. There is no deception in Him, no shadow of turning. He is the genuine article, the real thing. In Jesus, what you see is what you get—pure, unfiltered truth.

When others fail you, Jesus remains faithful. When the world deals in lies, Jesus speaks truth. You can trust Him completely because His very nature is faithfulness and truth. He cannot be anything else.`,
      reflection_questions: [
        'How has Jesus proven faithful in your life?',
        'What promises of His do you need to trust today?',
        'How does His truthfulness affect how you live?'
      ],
      prayer_focus: 'Thank Jesus for being Faithful and True. Ask Him to increase your trust in His perfect faithfulness.'
    },
    {
      day_number: 19,
      title: 'The Bright Morning Star',
      scripture_refs: [{ book: 'Revelation', chapter: 22, verseStart: 16, verseEnd: 16 }, { book: '2 Peter', chapter: 1, verseStart: 19, verseEnd: 19 }],
      content: `"I am the root and the descendant of David, the bright morning star." The morning star appears just before dawn, announcing that the night is over and a new day is coming. Jesus is that star—the herald of hope, the promise of a new day.

After the darkest part of night comes the morning star, and then the sunrise. Jesus is the promise that no matter how dark things get, the dawn is coming. He is the hope that outlasts the longest night.

This title also speaks of His beauty and glory. The morning star outshines all others. Jesus is the brightest reality in the universe, the most beautiful person, the most glorious being. All other lights pale in comparison.

As we await His return, Jesus is our morning star, shining in our hearts. We look for His appearing like watchmen wait for the morning. And we know that when He comes, the eternal day will dawn and darkness will be no more forever.`,
      reflection_questions: [
        'How has Jesus been a morning star in your dark times?',
        'What night in your life needs the hope of coming dawn?',
        'How are you watching for His return?'
      ],
      prayer_focus: 'Praise Jesus as the Bright Morning Star. Ask Him to fill your heart with hope as you await His coming.'
    },
    {
      day_number: 20,
      title: 'Author and Perfecter of Faith',
      scripture_refs: [{ book: 'Hebrews', chapter: 12, verseStart: 1, verseEnd: 3 }],
      content: `"Looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before him endured the cross." Jesus is both the source and the completer of our faith. He starts it and He finishes it.

As the Author (or founder) of faith, Jesus originated true faith. He pioneered the path of faith through His earthly life. He walked by faith Himself, trusting the Father perfectly. He blazed the trail we now follow.

As the Perfecter of faith, Jesus completes what He begins. Our faith may waver, but He strengthens it. Our faith may be weak, but He grows it. He takes the seed of faith and brings it to full flower. He who began a good work is faithful to complete it.

We are called to look to Jesus—to fix our eyes on Him, to focus on Him, to keep Him central. As we look to the Author and Perfecter, our faith grows. He is both the example and the enabler of our faith.`,
      reflection_questions: [
        'How has Jesus grown your faith over time?',
        'What does it mean for you to look to Jesus?',
        'What aspects of faith do you need Him to perfect in you?'
      ],
      prayer_focus: 'Thank Jesus for authoring your faith. Ask Him to perfect and complete what He has begun in you.'
    },
    {
      day_number: 21,
      title: 'Name Above All Names',
      scripture_refs: [{ book: 'Philippians', chapter: 2, verseStart: 9, verseEnd: 11 }, { book: 'Acts', chapter: 4, verseStart: 12, verseEnd: 12 }],
      content: `"Therefore God has highly exalted him and bestowed on him the name that is above every name, so that at the name of Jesus every knee should bow." The name of Jesus stands supreme over every other name in heaven and on earth.

We have explored many names of Jesus over these 21 days—each one revealing another facet of His inexhaustible glory. Yet all these names point to one central truth: Jesus Christ is Lord. He is supreme. He is sufficient. He is everything.

There is no other name by which we must be saved. There is no other name with power over demons. There is no other name that opens heaven's doors. The name of Jesus is our authority, our identity, our hope.

One day, every knee will bow and every tongue confess that Jesus Christ is Lord. This is not a threat but a promise—the universe will acknowledge what is already true. And those who have loved His name will worship Him forever.`,
      reflection_questions: [
        'Which name of Jesus has meant the most to you?',
        'How has your understanding of Jesus grown through this study?',
        'How will you continue to explore and honor His name?'
      ],
      prayer_focus: 'Worship Jesus by His many names. Commit to honoring His name above all names in your life.'
    },
  ]
};

// =====================================================
// RENEWING YOUR MIND - 21 Day Series
// =====================================================
const RENEWING_YOUR_MIND = {
  series: {
    slug: 'renewing-your-mind',
    title: 'Renewing Your Mind',
    description: 'Transform your thought life through the power of Scripture and the Holy Spirit over 21 days.',
    total_days: 21,
    topics: ['mind', 'thoughts', 'transformation', 'truth', 'spiritual growth'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'The Battlefield of the Mind',
      scripture_refs: [{ book: 'Romans', chapter: 12, verseStart: 2, verseEnd: 2 }],
      content: `"Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will."

The mind is a battlefield. Every day, thoughts compete for your attention—some from God, some from the world, some from the enemy.

Transformation does not happen automatically. It requires intentional renewal. The patterns of this world constantly pull at us, but God offers a different way: renewal that leads to transformation.

This 21-day journey will help you take every thought captive and align your mind with God's truth. The battle is real, but victory is possible.`,
      reflection_questions: [
        'What patterns of worldly thinking have shaped your mind?',
        'Why is the mind such an important battleground?',
        'What would transformation look like in your thought life?'
      ],
      prayer_focus: 'Father, I surrender my mind to You. Begin the work of renewal and transformation. Help me recognize thoughts that do not align with Your truth. Amen.'
    },
    {
      day_number: 2,
      title: 'You Are What You Think',
      scripture_refs: [{ book: 'Proverbs', chapter: 23, verseStart: 7, verseEnd: 7 }],
      content: `"For as he thinks in his heart, so is he."

Your thoughts shape your reality. What you dwell on determines who you become. Negative thoughts produce negative outcomes; faith-filled thoughts produce fruit.

This is not positive thinking philosophy—it is biblical truth. The heart-mind connection is powerful. What occupies your thoughts eventually occupies your life.

If you want to change your life, start with your thoughts. What you feed grows. What you starve dies. Choose carefully what you allow into your mind.`,
      reflection_questions: [
        'What thoughts have you been feeding lately?',
        'How have your thoughts shaped your emotions and actions?',
        'What would change if you thought differently?'
      ],
      prayer_focus: 'Lord, show me the connection between my thoughts and my life. Help me starve negative thoughts and feed on Your truth. Change my thinking to change my life. Amen.'
    },
    {
      day_number: 3,
      title: 'Taking Every Thought Captive',
      scripture_refs: [{ book: '2 Corinthians', chapter: 10, verseStart: 4, verseEnd: 5 }],
      content: `"We demolish arguments and every pretension that sets itself up against the knowledge of God, and we take captive every thought to make it obedient to Christ."

Not every thought that enters your mind deserves to stay. You have the power to take thoughts captive—to examine them, evaluate them, and reject those that contradict God's truth.

Thoughts are like visitors. You cannot always control who knocks, but you can control who enters and stays. When a thought contradicts Scripture, do not entertain it—capture it and make it bow to Christ.

This is active, not passive. It requires vigilance, discipline, and knowledge of God's Word.`,
      reflection_questions: [
        'What thoughts have you been entertaining that contradict the truth of God?',
        'How can you practically "take a thought captive"?',
        'What thoughts need to be evicted from your mind today?'
      ],
      prayer_focus: 'Jesus, help me take every thought captive. Give me discernment to recognize lies and strength to reject them. My thoughts will obey You. Amen.'
    },
    {
      day_number: 4,
      title: 'The Truth Sets You Free',
      scripture_refs: [{ book: 'John', chapter: 8, verseStart: 31, verseEnd: 32 }],
      content: `"If you hold to my teaching, you are really my disciples. Then you will know the truth, and the truth will set you free."

Freedom comes through truth. Every lie that occupies your mind creates bondage. Every truth that replaces it brings freedom.

The enemy's strategy is deception—to make you believe things about God, yourself, and life that are not true. His lies create chains. But truth breaks them.

Knowing the truth is not enough—you must hold to it, abide in it, live by it. Then freedom comes.`,
      reflection_questions: [
        'What lies have been holding you in bondage?',
        'What truths from Scripture directly counter those lies?',
        'How can you hold to the teaching of God more consistently?'
      ],
      prayer_focus: 'Father, reveal the lies I have believed. Replace every deception with Your truth. Let Your truth set me free. I choose to hold to Your teaching. Amen.'
    },
    {
      day_number: 5,
      title: 'Guarding Your Mind',
      scripture_refs: [{ book: 'Philippians', chapter: 4, verseStart: 7, verseEnd: 8 }],
      content: `"And the peace of God, which transcends all understanding, will guard your hearts and minds in Christ Jesus."

God offers a supernatural guard for your mind—His peace. When anxiety, fear, and worry assault you, His peace stands guard.

But notice verse 8: you have a role too. Focus on what is true, noble, right, pure, lovely, admirable, excellent, and praiseworthy. What you focus on matters.

Guard your inputs. What you watch, read, listen to, and dwell on shapes your mind. Fill it with good things, and God's peace will stand watch.`,
      reflection_questions: [
        'How well are you guarding what enters your mind?',
        'What inputs might be undermining your peace?',
        'How can you better focus on Philippians 4:8 qualities?'
      ],
      prayer_focus: 'Lord, guard my mind with Your peace. Help me be intentional about what I allow into my thoughts. I want to think on things that honor You. Amen.'
    },
    {
      day_number: 6,
      title: 'Defeating Anxious Thoughts',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 25, verseEnd: 34 }],
      content: `"Therefore I tell you, do not worry about your life... But seek first his kingdom and his righteousness, and all these things will be given to you as well."

Worry is a thief. It steals your peace, your joy, and your present moment by obsessing over the future.

Jesus addresses anxious thoughts directly: Look at the birds. Consider the lilies. Your Father knows what you need. Worry adds nothing to your life.

The antidote? Seek first God's kingdom. Replace anxious thoughts with kingdom focus. Trust your Father to provide.`,
      reflection_questions: [
        'What do you worry about most?',
        'How does worry affect your daily life?',
        'What does it mean practically to "seek first the kingdom"?'
      ],
      prayer_focus: 'Father, I give You my worries. You know what I need before I ask. Help me trust You instead of being anxious. I seek Your kingdom first. Amen.'
    },
    {
      day_number: 7,
      title: 'Overcoming Negative Self-Talk',
      scripture_refs: [{ book: 'Psalm', chapter: 139, verseStart: 13, verseEnd: 14 }],
      content: `"For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made."

How do you talk to yourself? For many, the inner voice is cruel: You are not good enough. You will fail. You are worthless.

But what does God say? You are fearfully and wonderfully made. Created with intention. Known intimately. Loved completely.

Your self-talk should align with God's talk about you. Replace the inner critic with the Father's voice of love and truth.`,
      reflection_questions: [
        'What does your inner voice typically say about you?',
        'How does that compare to what God says about you?',
        'What specific truths can replace your negative self-talk?'
      ],
      prayer_focus: 'Father, change my self-talk to match Your voice. Help me see myself as You see me—loved, valued, wonderfully made. Silence the inner critic with Your truth. Amen.'
    },
    {
      day_number: 8,
      title: 'The Mind of Christ',
      scripture_refs: [{ book: '1 Corinthians', chapter: 2, verseStart: 16, verseEnd: 16 }, { book: 'Philippians', chapter: 2, verseStart: 5, verseEnd: 5 }],
      content: `"We have the mind of Christ... In your relationships with one another, have the same mindset as Christ Jesus."

As a believer, you have access to something remarkable: the mind of Christ. The Holy Spirit within you enables you to think as Jesus thinks.

This is not automatic—it requires cultivation. You must intentionally align your thinking with Christ's thinking, adopt His perspective, embrace His values.

What would Jesus think about your situation? That question unlocks the mind of Christ.`,
      reflection_questions: [
        'What does it mean to have "the mind of Christ"?',
        'In what situation do you need His perspective right now?',
        'How can you cultivate Christ-like thinking?'
      ],
      prayer_focus: 'Jesus, I have Your mind—help me access it. Show me how You see my situation. Let me think as You think, value what You value. Amen.'
    },
    {
      day_number: 9,
      title: 'Renewing Through Scripture',
      scripture_refs: [{ book: 'Psalm', chapter: 119, verseStart: 11, verseEnd: 11 }, { book: 'Joshua', chapter: 1, verseStart: 8, verseEnd: 8 }],
      content: `"I have hidden your word in my heart that I might not sin against you... Keep this Book of the Law always on your lips; meditate on it day and night."

Scripture is the primary tool for renewing your mind. It is living, active, and sharper than any two-edged sword. It discerns the thoughts of your heart.

Hiding God's Word in your heart means memorizing it, meditating on it, letting it sink deep. When lies come, you have truth ready to counter them.

Meditation is not emptying your mind—it is filling it with Scripture, turning it over, letting it transform you.`,
      reflection_questions: [
        'How much of the Word of God is hidden in your heart?',
        'What practice of Scripture meditation could you develop?',
        'What verses address your specific thought struggles?'
      ],
      prayer_focus: 'Lord, help me hide Your Word in my heart. Give me discipline to meditate on it day and night. Let Scripture transform my thinking. Amen.'
    },
    {
      day_number: 10,
      title: 'Breaking Strongholds',
      scripture_refs: [{ book: '2 Corinthians', chapter: 10, verseStart: 4, verseEnd: 4 }],
      content: `"The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds."

A stronghold is a fortified pattern of thinking—lies you have believed for so long they seem like truth. They are mental fortresses that resist change.

But God has given you weapons with divine power to demolish them. Prayer, Scripture, the name of Jesus, the power of the Holy Spirit—these are your weapons.

Strongholds can come down. No pattern of thinking is too entrenched for God's power.`,
      reflection_questions: [
        'What strongholds of wrong thinking exist in your mind?',
        'How long have these patterns been in place?',
        'Which spiritual weapons will you use to demolish them?'
      ],
      prayer_focus: 'Father, reveal the strongholds in my mind. I take up divine weapons to demolish them. No lie will remain fortified against Your truth. Amen.'
    },
    {
      day_number: 11,
      title: 'Thoughts About God',
      scripture_refs: [{ book: 'Isaiah', chapter: 55, verseStart: 8, verseEnd: 9 }],
      content: `"For my thoughts are not your thoughts, neither are your ways my ways, declares the LORD. As the heavens are higher than the earth, so are my ways higher than your ways and my thoughts than your thoughts."

What you think about God shapes everything. A distorted view of God leads to distorted thinking about everything else.

Many carry wrong thoughts about God: He is angry. He is distant. He is disappointed. He is unfair. These must be corrected by Scripture.

God's thoughts are higher than ours. We must let His self-revelation in Scripture correct our assumptions about Him.`,
      reflection_questions: [
        'What are your honest thoughts about God?',
        'Where might your view of God need correction?',
        'How does your view of God affect your other thoughts?'
      ],
      prayer_focus: 'Father, correct my thoughts about You. Where I have believed wrong things, show me the truth. Let my view of You align with Your revelation. Amen.'
    },
    {
      day_number: 12,
      title: 'Thoughts About Yourself',
      scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 10, verseEnd: 10 }, { book: '2 Corinthians', chapter: 5, verseStart: 17, verseEnd: 17 }],
      content: `"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do... If anyone is in Christ, the new creation has come: The old has gone, the new is here!"

In Christ, your identity has fundamentally changed. You are not who you used to be. You are a new creation, God's masterpiece, created for purpose.

But often we still think old thoughts about ourselves. We identify with our failures, our past, our weaknesses. We forget who we now are in Christ.

Renewing your mind about yourself means thinking about you the way God does—as a beloved, redeemed, purposeful new creation.`,
      reflection_questions: [
        'How do you typically think about yourself?',
        'What old identity thoughts still linger?',
        'What does being the handiwork of God mean for your self-image?'
      ],
      prayer_focus: 'Father, help me think about myself the way You do. I am Your handiwork, a new creation. Let my self-understanding align with my new identity in Christ. Amen.'
    },
    {
      day_number: 13,
      title: 'Thoughts About Others',
      scripture_refs: [{ book: 'Philippians', chapter: 2, verseStart: 3, verseEnd: 4 }, { book: '1 Corinthians', chapter: 13, verseStart: 7, verseEnd: 7 }],
      content: `"Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves... Love always protects, always trusts, always hopes, always perseveres."

How do you think about other people? With judgment or grace? With suspicion or trust? With selfishness or humility?

Our thoughts about others often reveal our hearts. Criticism, comparison, and contempt are common patterns. But love thinks differently—it protects, trusts, hopes, and perseveres.

Renewing your mind includes transforming how you think about the people in your life—even the difficult ones.`,
      reflection_questions: [
        'What patterns characterize your thoughts about others?',
        'Who do you think about negatively that you could view with grace?',
        'How would love change your thoughts about difficult people?'
      ],
      prayer_focus: 'Lord, transform how I think about others. Replace judgment with grace, criticism with compassion. Help me value others above myself. Amen.'
    },
    {
      day_number: 14,
      title: 'Thoughts About Circumstances',
      scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 }, { book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 }],
      content: `"And we know that in all things God works for the good of those who love him... Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds."

How you think about your circumstances matters. The same situation can produce despair or growth depending on your perspective.

This is not pretending bad things are good. It is trusting that God works in all things—even painful ones—for good. It is counting trials as joy because of what they produce.

Renewed thinking about circumstances sees God at work even in difficulty.`,
      reflection_questions: [
        'How do you typically think about difficult circumstances?',
        'Can you identify good that came from past trials?',
        'How can you view current challenges through the lens of Romans 8:28?'
      ],
      prayer_focus: 'Father, change how I think about my circumstances. Help me trust that You work in all things. Give me eyes to see Your purpose in difficulty. Amen.'
    },
    {
      day_number: 15,
      title: 'Casting Down Imaginations',
      scripture_refs: [{ book: '2 Corinthians', chapter: 10, verseStart: 5, verseEnd: 5 }],
      content: `"Casting down imaginations, and every high thing that exalteth itself against the knowledge of God." (KJV)

Your imagination can be a gift or a weapon against you. Worry is imagination misused—picturing worst-case scenarios. Fear imagines dangers that may never come.

But imaginations that exalt themselves against God's truth must be cast down. When your mind creates scenarios that contradict His Word, reject them.

Guard your imagination. Use it to envision God's promises, not to create anxiety through worst-case thinking.`,
      reflection_questions: [
        'How do you tend to use your imagination?',
        'What negative scenarios do you imagine that contradict the truth of God?',
        'How can you redirect your imagination toward faith?'
      ],
      prayer_focus: 'Lord, I cast down imaginations that exalt themselves against Your truth. Guard my imagination. Help me envision Your promises, not my fears. Amen.'
    },
    {
      day_number: 16,
      title: 'Renewing Through Worship',
      scripture_refs: [{ book: 'Psalm', chapter: 22, verseStart: 3, verseEnd: 3 }, { book: 'Psalm', chapter: 73, verseStart: 16, verseEnd: 17 }],
      content: `"Yet you are enthroned as the Holy One; you are the one Israel praises... When I tried to understand all this, it troubled me deeply till I entered the sanctuary of God."

Worship renews the mind like nothing else. When Asaph was troubled by his thoughts, it was entering God's presence that brought clarity.

Worship shifts our focus from problems to the Problem-Solver, from circumstances to the Creator. In His presence, perspective changes. Lies lose their power. Truth becomes clear.

Make worship a daily discipline for mental renewal.`,
      reflection_questions: [
        'How does worship affect your thought patterns?',
        'When has entering the presence of God changed your perspective?',
        'How can you incorporate more worship into your mental renewal?'
      ],
      prayer_focus: 'Father, I worship You. Enthroned above all my problems, greater than all my fears. As I praise You, renew my mind. Let Your presence bring clarity. Amen.'
    },
    {
      day_number: 17,
      title: 'The Spirit of a Sound Mind',
      scripture_refs: [{ book: '2 Timothy', chapter: 1, verseStart: 7, verseEnd: 7 }],
      content: `"For God has not given us a spirit of fear, but of power, love, and a sound mind." (NKJV)

God gives you a sound mind. Fear, anxiety, and chaotic thinking are not from Him. He gives power, love, and self-discipline (or soundness of mind).

A sound mind is stable, clear, and anchored. It is not tossed about by every thought or emotion. It is grounded in truth and controlled by the Spirit.

This is available to you. Not through human effort alone, but through the Spirit's power working in you.`,
      reflection_questions: [
        'What does a "sound mind" look like to you?',
        'Where does your mind lack soundness?',
        'How can you access the power, love, and soundness God provides?'
      ],
      prayer_focus: 'Father, You have given me a spirit of power, love, and a sound mind. Not fear. I claim the sound mind You provide. Stabilize my thoughts through Your Spirit. Amen.'
    },
    {
      day_number: 18,
      title: 'Setting Your Mind on Things Above',
      scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 1, verseEnd: 2 }],
      content: `"Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God. Set your minds on things above, not on earthly things."

Where is your mind set? On earthly concerns or heavenly realities? On temporary problems or eternal truths?

Setting your mind is intentional. It means choosing what to focus on, directing your attention, placing your thoughts on higher things.

Things above—Christ's reign, eternal life, God's purposes—provide perspective that transforms how you see everything below.`,
      reflection_questions: [
        'What typically occupies your mind?',
        'What does it mean practically to set your mind on things above?',
        'How would an eternal perspective change your current concerns?'
      ],
      prayer_focus: 'Lord, I set my mind on things above. Lift my thoughts beyond earthly concerns to eternal realities. Let the perspective of heaven transform how I see today. Amen.'
    },
    {
      day_number: 19,
      title: 'Renewing Daily',
      scripture_refs: [{ book: '2 Corinthians', chapter: 4, verseStart: 16, verseEnd: 16 }, { book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 }],
      content: `"Therefore we do not lose heart. Though outwardly we are wasting away, yet inwardly we are being renewed day by day... His compassions never fail. They are new every morning."

Renewal is not a one-time event—it is a daily process. Every morning brings fresh mercies and new opportunity for mental renewal.

This is why we do not lose heart. Even as the outer person weakens, the inner person can be renewed daily. Yesterday's lies can be replaced with today's truth.

Commit to daily renewal. Every day, bring your mind to God for refreshing.`,
      reflection_questions: [
        'How consistent is your daily renewal practice?',
        'What morning routine could support mental renewal?',
        'How does knowing renewal is daily affect your hope?'
      ],
      prayer_focus: 'Father, renew me today. Your mercies are new this morning. Let this be a day of inner renewal, no matter what the outer circumstances. I will not lose heart. Amen.'
    },
    {
      day_number: 20,
      title: 'Community and Accountability',
      scripture_refs: [{ book: 'Proverbs', chapter: 27, verseStart: 17, verseEnd: 17 }, { book: 'Hebrews', chapter: 3, verseStart: 13, verseEnd: 13 }],
      content: `"As iron sharpens iron, so one person sharpens another... Encourage one another daily, as long as it is called 'Today,' so that none of you may be hardened by sin's deceitfulness."

Renewing your mind is not a solo project. You need others to sharpen you, encourage you, and speak truth when you believe lies.

Sin is deceitful. Wrong thinking can seem right to you. This is why you need community—people who know you, love you, and will tell you the truth.

Vulnerability about your thought struggles invites help for your mental renewal.`,
      reflection_questions: [
        'Who speaks truth into your thought life?',
        'Are you vulnerable about your mental struggles?',
        'How could community help your renewal process?'
      ],
      prayer_focus: 'Father, give me people who sharpen me. Help me be vulnerable about my thought struggles. Use community to aid my renewal. Protect me from deception. Amen.'
    },
    {
      day_number: 21,
      title: 'A Renewed Mind for Life',
      scripture_refs: [{ book: 'Romans', chapter: 12, verseStart: 2, verseEnd: 2 }, { book: 'Philippians', chapter: 1, verseStart: 6, verseEnd: 6 }],
      content: `"Be transformed by the renewing of your mind... He who began a good work in you will carry it on to completion until the day of Christ Jesus."

This 21-day journey is not the end—it is a foundation. Mental renewal is a lifelong process. The patterns of this world constantly press in. Daily renewal is always needed.

But take heart: God who began this work will complete it. He is committed to your transformation. He will not give up on you.

Keep renewing. Keep taking thoughts captive. Keep filling your mind with truth. The transformation continues.`,
      reflection_questions: [
        'What have you learned over these 21 days?',
        'What practices will you continue?',
        'How has your thinking already begun to change?'
      ],
      prayer_focus: 'Father, thank You for what You have begun. Complete the work of renewing my mind. I commit to lifelong transformation. My mind belongs to You. Amen.'
    },
  ]
};

// =====================================================
// ATTRIBUTES OF GOD - 21 Day Series
// =====================================================
const ATTRIBUTES_OF_GOD = {
  series: {
    slug: 'attributes-of-god',
    title: 'Attributes of God',
    description: 'Explore the character and nature of God over 21 days to deepen your worship and transform your understanding of who He is.',
    total_days: 21,
    topics: ['God', 'character', 'attributes', 'theology', 'worship'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  days: [
    {
      day_number: 1,
      title: 'God Is Holy',
      scripture_refs: [{ book: 'Isaiah', chapter: 6, verseStart: 1, verseEnd: 8 }, { book: 'Revelation', chapter: 4, verseStart: 8, verseEnd: 8 }],
      content: `"Holy, holy, holy is the Lord Almighty; the whole earth is full of his glory." The seraphim cry this without ceasing around the throne of God.

Holiness is the attribute that sets God apart from all creation. He is completely pure, utterly perfect, absolutely separate from sin. There is no darkness in Him at all. His holiness is so intense that even angels cover their faces in His presence.

When Isaiah encountered God's holiness, he was undone. He saw himself as he truly was—a sinner in the presence of perfect purity. Yet this holy God did not destroy him but cleansed him and commissioned him.

This is the God you worship: infinitely holy, yet willing to make you holy through His Son. His holiness is not meant to frighten you away but to draw you into reverent awe and life-transforming worship.`,
      reflection_questions: [
        'How does encountering the holiness of God make you feel?',
        'What does it mean to be called to holiness?',
        'How should the holiness of God affect your worship?'
      ],
      prayer_focus: 'Holy, holy, holy Lord! I worship You in the beauty of Your holiness. Cleanse me and make me holy as You are holy. I stand in awe of who You are. Amen.'
    },
    {
      day_number: 2,
      title: 'God Is Sovereign',
      scripture_refs: [{ book: 'Psalm', chapter: 115, verseStart: 3, verseEnd: 3 }, { book: 'Daniel', chapter: 4, verseStart: 35, verseEnd: 35 }],
      content: `"Our God is in heaven; he does whatever pleases him." "He does as he pleases with the powers of heaven and the peoples of the earth. No one can hold back his hand or say to him: 'What have you done?'"

God is absolutely sovereign. He rules over all creation with complete authority. Nothing happens outside His control or beyond His power. He is not wringing His hands over world events—He reigns supreme.

Sovereignty means God is never surprised, never outmaneuvered, never defeated. His plans cannot be thwarted. His purposes will stand. Every knee will bow—willingly or unwillingly—to His ultimate rule.

Yet God's sovereignty is not tyranny. He is the perfectly good King whose rule is righteous. You can trust His sovereign hand even when you do not understand His ways. His sovereignty is your security.`,
      reflection_questions: [
        'How does the sovereignty of God comfort you in uncertain times?',
        'Where do you struggle to trust His sovereign control?',
        'How should the sovereignty of God affect your response to difficult circumstances?'
      ],
      prayer_focus: 'Sovereign Lord, You reign over all. I submit to Your authority and trust Your plan even when I do not understand. Your will be done in my life. Amen.'
    },
    {
      day_number: 3,
      title: 'God Is Omniscient',
      scripture_refs: [{ book: 'Psalm', chapter: 139, verseStart: 1, verseEnd: 6 }, { book: 'Hebrews', chapter: 4, verseStart: 13, verseEnd: 13 }],
      content: `"You have searched me, LORD, and you know me. You know when I sit and when I rise; you perceive my thoughts from afar... Such knowledge is too wonderful for me, too lofty for me to attain."

God knows everything—past, present, and future. He knows every thought before you think it, every word before you speak it, every action before you take it. Nothing is hidden from His sight.

His knowledge is exhaustive and immediate. He does not learn or forget. He needs no advisors or information gathering. All things are laid bare before Him—the depths of your heart, the secrets of the universe, the end from the beginning.

This omniscience could be terrifying—a God who sees all your failures. But for those in Christ, it is comforting: He knows you fully and loves you completely. No sin surprises Him. No struggle catches Him off guard.`,
      reflection_questions: [
        'How does knowing God sees everything affect how you live?',
        'Is the omniscience of God comforting or convicting to you? Why?',
        'What does it mean that He knows you fully and still loves you?'
      ],
      prayer_focus: 'All-knowing God, You see everything—my thoughts, my heart, my life. Thank You that You know me completely and love me anyway. Let Your knowledge of me lead me to transparency before You. Amen.'
    },
    {
      day_number: 4,
      title: 'God Is Omnipresent',
      scripture_refs: [{ book: 'Psalm', chapter: 139, verseStart: 7, verseEnd: 12 }, { book: 'Jeremiah', chapter: 23, verseStart: 23, verseEnd: 24 }],
      content: `"Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there."

God is everywhere present at the same time. He is not spread thin across the universe but fully present in every place. There is nowhere you can go that He is not already there.

This attribute destroys the myth of a distant God. He is not far away in heaven, uninvolved with earth. He fills heaven and earth. He is closer than your next breath, more present than the air around you.

For the believer, omnipresence means you are never alone. In the darkest valley, He is there. In the hospital room, the broken relationship, the sleepless night—He is present. You cannot outrun His love or His presence.`,
      reflection_questions: [
        'When have you most needed the reality of the presence of God?',
        'How should His omnipresence affect your daily awareness?',
        'What does it mean that you can never be separated from Him?'
      ],
      prayer_focus: 'Ever-present God, You are with me always. I cannot flee from You. Help me be conscious of Your presence in every moment, every place. You are here. Amen.'
    },
    {
      day_number: 5,
      title: 'God Is Omnipotent',
      scripture_refs: [{ book: 'Jeremiah', chapter: 32, verseStart: 17, verseEnd: 17 }, { book: 'Matthew', chapter: 19, verseStart: 26, verseEnd: 26 }],
      content: `"Ah, Sovereign LORD, you have made the heavens and the earth by your great power and outstretched arm. Nothing is too hard for you." "With God all things are possible."

God is all-powerful. His might is unlimited, His strength inexhaustible. He spoke the universe into existence. He holds galaxies in place. He raises the dead.

Nothing is too difficult for Him—no enemy too strong, no situation too impossible, no sickness too severe, no sin too great. His power exceeds our comprehension. What is impossible for us is effortless for Him.

Yet God's power is always exercised according to His wisdom and goodness. He does not use His might arbitrarily. His omnipotence is in service of His perfect will. You can trust His power because you can trust His character.`,
      reflection_questions: [
        'What impossible situation do you need the power of God for?',
        'How does His omnipotence encourage your faith?',
        'Why is it significant that His power is guided by His wisdom?'
      ],
      prayer_focus: 'Almighty God, nothing is too hard for You. I bring my impossible situations before Your unlimited power. You are able. Help me trust Your might. Amen.'
    },
    {
      day_number: 6,
      title: 'God Is Eternal',
      scripture_refs: [{ book: 'Psalm', chapter: 90, verseStart: 1, verseEnd: 2 }, { book: 'Revelation', chapter: 1, verseStart: 8, verseEnd: 8 }],
      content: `"Before the mountains were born or you brought forth the whole world, from everlasting to everlasting you are God." "I am the Alpha and the Omega, who is, and who was, and who is to come, the Almighty."

God has no beginning and no end. He did not come into existence—He has always been. He will never cease to be. Time itself is His creation; He exists outside and above it.

While we are bound by time, God sees all of history at once. A thousand years are like a day to Him. He is the same yesterday, today, and forever—unchanging through all ages.

His eternality gives us hope. The eternal God offers eternal life. He who has always existed invites you to exist forever with Him. Your brief life is caught up in His eternal purposes.`,
      reflection_questions: [
        'How does the eternality of God put your temporary problems in perspective?',
        'What does it mean that the eternal God knows your name?',
        'How should His unchanging nature affect your trust in Him?'
      ],
      prayer_focus: 'Eternal God, from everlasting to everlasting, You are God. My life is brief, but You invite me into eternity. Anchor my heart in Your unchanging nature. Amen.'
    },
    {
      day_number: 7,
      title: 'God Is Immutable',
      scripture_refs: [{ book: 'Malachi', chapter: 3, verseStart: 6, verseEnd: 6 }, { book: 'James', chapter: 1, verseStart: 17, verseEnd: 17 }],
      content: `"I the LORD do not change." "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows."

God is unchanging. His character, His purposes, His promises—none of them shift. He does not grow, improve, decline, or evolve. He is perfectly and eternally who He is.

In a world of constant change, this is anchor for the soul. People change, circumstances change, feelings change—but God remains the same. The God who parted the Red Sea is the same God you worship today. His faithfulness to Abraham is His faithfulness to you.

His immutability guarantees His promises. What He said, He will do. What He began, He will finish. You can stake your life on a God who cannot change.`,
      reflection_questions: [
        'How does the unchanging nature of God provide stability for you?',
        'What promises of God do you need to trust today?',
        'How does His immutability differ from human reliability?'
      ],
      prayer_focus: 'Unchanging God, You are the same yesterday, today, and forever. In a changing world, You are my anchor. I trust Your unchanging character and promises. Amen.'
    },
    {
      day_number: 8,
      title: 'God Is Love',
      scripture_refs: [{ book: '1 John', chapter: 4, verseStart: 8, verseEnd: 10 }, { book: 'Romans', chapter: 5, verseStart: 8, verseEnd: 8 }],
      content: `"God is love... This is love: not that we loved God, but that he loved us and sent his Son as an atoning sacrifice for our sins." "God demonstrates his own love for us in this: While we were still sinners, Christ died for us."

Love is not just what God does—it is who He is. He is the source, definition, and perfect expression of love. All true love flows from Him.

His love is not based on our worthiness. He loved us while we were sinners, enemies, rebels. His love is unconditional, sacrificial, and pursuing. He loved us enough to send His Son to die for us.

This love is not weak sentiment but fierce commitment. It is the love of a Father who disciplines, a Shepherd who protects, a Savior who dies. God's love is the most powerful force in the universe—and it is for you.`,
      reflection_questions: [
        'How have you experienced the love of God personally?',
        'What does it mean that God loved you while you were His enemy?',
        'How should His love for you affect how you love others?'
      ],
      prayer_focus: 'Loving Father, Your love is beyond comprehension. You loved me at my worst. Help me receive Your love more deeply and extend it to others. Your love changes everything. Amen.'
    },
    {
      day_number: 9,
      title: 'God Is Just',
      scripture_refs: [{ book: 'Deuteronomy', chapter: 32, verseStart: 4, verseEnd: 4 }, { book: 'Romans', chapter: 3, verseStart: 25, verseEnd: 26 }],
      content: `"He is the Rock, his works are perfect, and all his ways are just. A faithful God who does no wrong, upright and just is he."

God is perfectly just. He always does what is right. He never overlooks sin or punishes unfairly. His judgments are true and His verdicts final.

Justice can seem severe—until we understand the cross. There, God's justice and mercy met. Sin was punished (justice) but we were forgiven (mercy). Jesus bore the just penalty so we could receive grace.

In a world of injustice, God's justice is hope. Every wrong will be made right. Every victim will be vindicated. Every evil will be judged. God keeps perfect accounts, and justice will be done.`,
      reflection_questions: [
        'How do you reconcile the justice of God with His mercy?',
        'Where do you long for divine justice to be done?',
        'How does the cross demonstrate both the justice and love of God?'
      ],
      prayer_focus: 'Just God, all Your ways are right. Thank You that justice and mercy met at the cross. Help me trust Your justice even when I do not see it now. You will make all things right. Amen.'
    },
    {
      day_number: 10,
      title: 'God Is Merciful',
      scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 4, verseEnd: 5 }, { book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 }],
      content: `"But because of his great love for us, God, who is rich in mercy, made us alive with Christ even when we were dead in transgressions." "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning."

God is rich in mercy. Not stingy, not reluctant—abundantly merciful. He withholds the punishment we deserve and offers grace we could never earn.

His mercies are new every morning. No matter how many times you fail, there is fresh mercy waiting. His compassion does not run out. His patience does not expire.

Mercy is God's response to our misery. When we are helpless, He helps. When we are guilty, He forgives. When we are lost, He finds. His mercy is your lifeline—grab hold of it daily.`,
      reflection_questions: [
        'Where do you need fresh mercy today?',
        'How has God shown you mercy in the past?',
        'How should receiving mercy affect how you treat others?'
      ],
      prayer_focus: 'Merciful Father, I need Your mercy today. Thank You that Your compassions never fail and are new every morning. Let me receive and extend the mercy You offer. Amen.'
    },
    {
      day_number: 11,
      title: 'God Is Faithful',
      scripture_refs: [{ book: '1 Corinthians', chapter: 1, verseStart: 9, verseEnd: 9 }, { book: '2 Timothy', chapter: 2, verseStart: 13, verseEnd: 13 }],
      content: `"God is faithful, who has called you into fellowship with his Son." "If we are faithless, he remains faithful, for he cannot disown himself."

God is utterly faithful. He keeps every promise. He finishes what He starts. He cannot lie or fail. His faithfulness is not dependent on ours—even when we are faithless, He remains faithful.

Throughout history, God has proven faithful. To Abraham, to Israel, to David, to the church—generation after generation, His faithfulness stands. Not one word of His promises has failed.

You can trust Him. When people let you down, He remains faithful. When circumstances shake you, His faithfulness stands firm. He who promised is faithful, and He will do it.`,
      reflection_questions: [
        'How has God proven faithful to you?',
        'What promises are you trusting Him to keep?',
        'How does His faithfulness encourage you when others fail you?'
      ],
      prayer_focus: 'Faithful God, You keep every promise. Even when I am faithless, You remain faithful. I trust You because You cannot fail. Thank You for Your unwavering faithfulness. Amen.'
    },
    {
      day_number: 12,
      title: 'God Is Good',
      scripture_refs: [{ book: 'Psalm', chapter: 34, verseStart: 8, verseEnd: 8 }, { book: 'Nahum', chapter: 1, verseStart: 7, verseEnd: 7 }],
      content: `"Taste and see that the Lord is good; blessed is the one who takes refuge in him." "The Lord is good, a refuge in times of trouble. He cares for those who trust in him."

God is good. Not just occasionally kind, but essentially, eternally, unchangingly good. Everything He does flows from His goodness. He cannot be otherwise.

His goodness is your refuge. In times of trouble, you flee to a good God. He does not wish you harm but your flourishing. His plans for you are good because He Himself is good.

Taste and see—experience His goodness personally. Do not just believe it theoretically. Let His goodness become real to you through relationship, through worship, through the evidence of your life.`,
      reflection_questions: [
        'Where have you tasted the goodness of God?',
        'How does trusting His goodness help in difficult times?',
        'What would change if you fully believed God is good?'
      ],
      prayer_focus: 'Good Father, You are good and everything You do is good. Help me taste and see Your goodness. I take refuge in Your goodness today. Amen.'
    },
    {
      day_number: 13,
      title: 'God Is Gracious',
      scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 8, verseEnd: 9 }, { book: 'Titus', chapter: 2, verseStart: 11, verseEnd: 11 }],
      content: `"For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast." "For the grace of God has appeared that offers salvation to all people."

Grace is God's unmerited favor—His goodness to those who deserve judgment. We cannot earn it, deserve it, or repay it. Grace is pure gift.

This is what sets Christianity apart: we are saved by grace, not works. Religion says do; grace says done. Religion says earn; grace says receive. Religion says try harder; grace says trust Jesus.

Grace appeared in Jesus Christ. In Him, all the grace of God became visible, tangible, accessible. The gracious God invites you to receive what you could never achieve.`,
      reflection_questions: [
        'How have you tried to earn what God offers freely by grace?',
        'What does grace mean for your daily life?',
        'How can you extend grace to others as you have received it?'
      ],
      prayer_focus: 'Gracious God, thank You for the gift of grace. I could never earn what You freely give. Help me live in grace and extend grace to others. Amen.'
    },
    {
      day_number: 14,
      title: 'God Is Patient',
      scripture_refs: [{ book: '2 Peter', chapter: 3, verseStart: 9, verseEnd: 9 }, { book: 'Romans', chapter: 2, verseStart: 4, verseEnd: 4 }],
      content: `"The Lord is not slow in keeping his promise, as some understand slowness. Instead he is patient with you, not wanting anyone to perish, but everyone to come to repentance." "Do you show contempt for the riches of his kindness, forbearance and patience, not realizing that God's kindness is intended to lead you to repentance?"

God is patient—slow to anger, rich in forbearance. He does not strike quickly or destroy hastily. His patience gives space for repentance.

Why has God not judged the world yet? Patience. He waits for more to come to salvation. His patience with human rebellion is remarkable, His forbearance with your repeated failures astonishing.

Do not mistake patience for approval or delay for indifference. His patience leads to repentance. It is kindness extended so you might turn to Him.`,
      reflection_questions: [
        'Where has God been patient with you?',
        'How does His patience lead you to repentance?',
        'How can you reflect His patience to others?'
      ],
      prayer_focus: 'Patient God, You are slow to anger and rich in patience. Thank You for not treating me as my sins deserve. Let Your patience lead me to deeper repentance. Amen.'
    },
    {
      day_number: 15,
      title: 'God Is Wise',
      scripture_refs: [{ book: 'Romans', chapter: 11, verseStart: 33, verseEnd: 34 }, { book: 'Isaiah', chapter: 55, verseStart: 8, verseEnd: 9 }],
      content: `"Oh, the depth of the riches of the wisdom and knowledge of God! How unsearchable his judgments, and his paths beyond tracing out! Who has known the mind of the Lord? Or who has been his counselor?"

God's wisdom is infinite. He always knows the best end and the best means to that end. He makes no mistakes, needs no advice, and has no regrets.

His wisdom is beyond our tracing. We see fragments; He sees the whole picture. We understand moments; He comprehends eternity. His ways are higher than our ways—not just different, but infinitely better.

When life makes no sense, God's wisdom has not failed. When you cannot understand His ways, trust His wisdom. The wisest thing you can do is trust the infinitely wise God.`,
      reflection_questions: [
        'Where do you need to trust divine wisdom over your understanding?',
        'How have you seen His wisdom in past situations?',
        'What does it mean to fear the Lord as the beginning of wisdom?'
      ],
      prayer_focus: 'All-wise God, Your wisdom is unsearchable. When I do not understand, help me trust that You do. Your ways are higher. Guide me by Your perfect wisdom. Amen.'
    },
    {
      day_number: 16,
      title: 'God Is Jealous',
      scripture_refs: [{ book: 'Exodus', chapter: 34, verseStart: 14, verseEnd: 14 }, { book: 'James', chapter: 4, verseStart: 5, verseEnd: 5 }],
      content: `"Do not worship any other god, for the LORD, whose name is Jealous, is a jealous God." "The spirit he caused to dwell in us envies intensely."

God is jealous—and this is good. His jealousy is not petty insecurity but fierce love. He will not share His glory with idols or His people with rivals.

Human jealousy is often sinful because we are jealous for things we have no right to. But God has every right to our exclusive worship. He made us, saved us, and deserves our all.

His jealousy protects you. He knows that idols destroy, that false gods disappoint, that divided loyalty leads to ruin. His jealousy is for your good. He wants all of you because He is all you need.`,
      reflection_questions: [
        'What rivals compete with God for your devotion?',
        'How is divine jealousy different from sinful human jealousy?',
        'How does His jealousy demonstrate His love for you?'
      ],
      prayer_focus: 'Jealous God, You deserve my undivided worship. Forgive me for the idols that compete for my heart. You are all I need. I give You all of me. Amen.'
    },
    {
      day_number: 17,
      title: 'God Is Wrathful',
      scripture_refs: [{ book: 'Romans', chapter: 1, verseStart: 18, verseEnd: 18 }, { book: 'John', chapter: 3, verseStart: 36, verseEnd: 36 }],
      content: `"The wrath of God is being revealed from heaven against all the godlessness and wickedness of people." "Whoever believes in the Son has eternal life, but whoever rejects the Son will not see life, for God's wrath remains on them."

God has wrath. This is not popular, but it is true. His wrath is His holy response to sin, His righteous anger against evil. A God who did not hate evil would not be good.

Divine wrath is not capricious rage. It is measured, just, and deserved. It is the necessary consequence of rebelling against a holy God. To remove wrath from God would be to remove His holiness and justice.

But here is the gospel: Jesus bore God's wrath so we do not have to. At the cross, the wrath we deserved was poured out on Him. For those in Christ, there is no condemnation.`,
      reflection_questions: [
        'How do you reconcile divine wrath with divine love?',
        'Why is the wrath of God a necessary attribute?',
        'How does the cross demonstrate both wrath and love together?'
      ],
      prayer_focus: 'Righteous God, Your wrath against sin is just. Thank You that Jesus bore Your wrath for me. I hide in Christ, free from condemnation, grateful for the cross. Amen.'
    },
    {
      day_number: 18,
      title: 'God Is Triune',
      scripture_refs: [{ book: 'Matthew', chapter: 28, verseStart: 19, verseEnd: 19 }, { book: '2 Corinthians', chapter: 13, verseStart: 14, verseEnd: 14 }],
      content: `"Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." "May the grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you all."

God is one God in three persons—Father, Son, and Holy Spirit. This is the mystery of the Trinity: not three gods, but one God in three eternal, co-equal persons.

The Trinity has existed in eternal fellowship—perfect love between Father, Son, and Spirit from before time began. God did not create because He was lonely; He has always had community within Himself.

The Trinity is essential to salvation. The Father planned it, the Son accomplished it, the Spirit applies it. All three persons work together for your redemption.`,
      reflection_questions: [
        'How do you relate to each person of the Trinity?',
        'What does the eternal fellowship of the Trinity teach about community?',
        'How do Father, Son, and Spirit work together in your salvation?'
      ],
      prayer_focus: 'Triune God—Father, Son, and Holy Spirit—I worship You. Three persons, one God, in perfect unity. Thank You for working together for my salvation. Amen.'
    },
    {
      day_number: 19,
      title: 'God Is Self-Sufficient',
      scripture_refs: [{ book: 'Acts', chapter: 17, verseStart: 24, verseEnd: 25 }, { book: 'Job', chapter: 41, verseStart: 11, verseEnd: 11 }],
      content: `"The God who made the world and everything in it... does not live in temples built by human hands. And he is not served by human hands, as if he needed anything. Rather, he himself gives everyone life and breath and everything else."

God needs nothing. He is completely self-sufficient, lacking nothing, dependent on no one. He was not lonely before creation or incomplete without you.

This is actually good news. Your relationship with God is not based on what you can do for Him. He does not need your worship, your service, or your praise—He invites it. He wants it. But He is not diminished without it.

Because He needs nothing, His love is pure. He does not love you to get something from you. He loves you because He chooses to, because that is His nature.`,
      reflection_questions: [
        'How does knowing God needs nothing change how you serve Him?',
        'Why is it significant that His love for you is not based on need?',
        'How does His self-sufficiency affect your worship?'
      ],
      prayer_focus: 'Self-sufficient God, You need nothing from me, yet You want relationship with me. I am humbled that You chose to love me. I worship You not out of Your need, but Your worth. Amen.'
    },
    {
      day_number: 20,
      title: 'God Is Near',
      scripture_refs: [{ book: 'Psalm', chapter: 145, verseStart: 18, verseEnd: 18 }, { book: 'Acts', chapter: 17, verseStart: 27, verseEnd: 28 }],
      content: `"The Lord is near to all who call on him, to all who call on him in truth." "God did this so that they would seek him and perhaps reach out for him and find him, though he is not far from any one of us. For in him we live and move and have our being."

Though God is infinite and transcendent, He draws near to His people. He is not a distant deity but an intimate Father. He is closer than you think, more accessible than you imagine.

He is near to all who call on Him. This is invitation. He wants you to call. He promises to be found by those who seek Him. His nearness is available—you just have to reach for Him.

In Him you live and move and have your being. He is not far away. He is the atmosphere of your existence, the ground of your being. Draw near to God, and He will draw near to you.`,
      reflection_questions: [
        'Do you experience God as near or far?',
        'What prevents you from calling on Him?',
        'How can you cultivate awareness of His nearness?'
      ],
      prayer_focus: 'Near God, You are closer than I often realize. I draw near to You today. Help me experience Your presence, live in Your nearness, and call on You in truth. Amen.'
    },
    {
      day_number: 21,
      title: 'Responding to Who God Is',
      scripture_refs: [{ book: 'Psalm', chapter: 95, verseStart: 6, verseEnd: 7 }, { book: 'Romans', chapter: 12, verseStart: 1, verseEnd: 1 }],
      content: `"Come, let us bow down in worship, let us kneel before the Lord our Maker; for he is our God and we are the people of his pasture." "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship."

You have spent 21 days exploring who God is. Now the question is: how will you respond?

Knowing God's attributes is not an academic exercise. It should lead to worship—bowing before the holy, sovereign, omniscient, omnipresent, omnipotent, eternal, immutable, loving, just, merciful, faithful, good, gracious, patient, wise, jealous, triune, self-sufficient, near God.

Let knowledge of God transform how you live. In view of His mercy, offer yourself as a living sacrifice. Let every attribute you have studied shape your worship, your trust, your obedience.`,
      reflection_questions: [
        'Which attribute of God has impacted you most?',
        'How will your life be different after this study?',
        'What does it mean to offer yourself as a living sacrifice?'
      ],
      prayer_focus: 'Awesome God, I have seen glimpses of who You are. I bow in worship. Take my life as a living sacrifice. Let knowing You transform everything about how I live. Amen.'
    },
  ]
};

// =====================================================
// DEEPENING PRAYER - 21 Day Series
// =====================================================
const DEEPENING_PRAYER = {
  series: {
    slug: 'deepening-prayer',
    title: 'Deepening Your Prayer Life',
    description: 'A 21-day journey to develop a richer, more intimate prayer life with God.',
    total_days: 21,
    topics: ['prayer', 'intimacy', 'spiritual growth', 'communication', 'discipline'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    { day_number: 1, title: 'Prayer as Relationship', scripture_refs: [{ book: 'Jeremiah', chapter: 33, verseStart: 3, verseEnd: 3 }], content: `"Call to me and I will answer you and tell you great and unsearchable things you do not know."\n\nPrayer is not a religious ritual—it is relationship. It is conversation with the God who made you and loves you.\n\nGod invites you: Call to me. He promises: I will answer. He offers: great and unsearchable things.\n\nThis is the foundation: prayer is access to the Creator of the universe. Not an obligation. A privilege.`, reflection_questions: ['How do you currently view prayer—duty or relationship?', 'What would change if you saw prayer as conversation with a loving Father?', 'What "great and unsearchable things" might God want to show you?'], prayer_focus: 'Father, I want to know You through prayer, not just talk at You. Teach me to pray as relationship, not ritual. I am calling—please answer. Amen.' },
    { day_number: 2, title: 'The Priority of Prayer', scripture_refs: [{ book: 'Mark', chapter: 1, verseStart: 35, verseEnd: 35 }, { book: 'Luke', chapter: 5, verseStart: 16, verseEnd: 16 }], content: `"Very early in the morning, while it was still dark, Jesus got up, left the house and went off to a solitary place, where he prayed."\n\nIf Jesus—the Son of God—prioritized prayer, how much more do we need it?\n\nHe withdrew regularly. He got up early. He found solitary places. Prayer was not optional for Him. It was essential.\n\nWhat we prioritize reveals what we value. Where does prayer fall on your list?`, reflection_questions: ['What does your prayer schedule reveal about your priorities?', 'What keeps you from prioritizing prayer?', 'When and where could you create regular time for prayer?'], prayer_focus: 'Lord, forgive me for making prayer optional. Help me prioritize time with You like Jesus did. Show me when and where to meet with You consistently. Amen.' },
    { day_number: 3, title: 'Coming Boldly', scripture_refs: [{ book: 'Hebrews', chapter: 4, verseStart: 16, verseEnd: 16 }], content: `"Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need."\n\nYou are invited to approach boldly. Not cowering in fear. Not held back by shame. Confident, because Jesus made the way.\n\nThis is a throne of grace, not judgment. You come to receive mercy, not condemnation. Help is available in your time of need.\n\nDon not let anything hold you back from bold access to God.`, reflection_questions: ['Do you approach God with confidence or hesitation?', 'What makes you feel unworthy to pray?', 'How does knowing it is a "throne of grace" change your approach?'], prayer_focus: 'Father, I come boldly to Your throne. Not because I deserve it, but because Jesus opened the way. I need Your mercy and grace. Thank You for access. Amen.' },
    { day_number: 4, title: 'The Lords Prayer: Our Father', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 9, verseEnd: 9 }], content: `"This, then, is how you should pray: 'Our Father in heaven, hallowed be your name.'"\n\nJesus taught us to begin with "Our Father." Not distant deity. Not impersonal force. Father.\n\nThis establishes relationship. We are children approaching a loving parent. Intimate yet reverent—"hallowed be your name."\n\nPrayer begins with recognizing who God is and who we are to Him.`, reflection_questions: ['How does calling God "Father" affect how you pray?', 'What does "hallowed be your name" mean to you?', 'How can you balance intimacy and reverence in prayer?'], prayer_focus: 'Our Father in heaven, hallowed be Your name. You are my loving Father and the holy God. I honor You as I come to You. Amen.' },
    { day_number: 5, title: 'Your Kingdom Come', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 10, verseEnd: 10 }], content: `"Your kingdom come, your will be done, on earth as it is in heaven."\n\nThis prayer aligns us with God purposes. Not my kingdom—Your kingdom. Not my will—Your will.\n\nWe pray for heaven realities to invade earth. God rule, God ways, God values—here and now.\n\nPrayer is not about getting God to do our will. It is about aligning with His.`, reflection_questions: ['Are your prayers mostly about your kingdom or Gods kingdom?', 'What would it look like for Gods will to be done in your life today?', 'How can you pray more kingdom-focused prayers?'], prayer_focus: 'Father, Your kingdom come, Your will be done. I surrender my agenda to Yours. Let heaven invade my life today. Not my will, but Yours. Amen.' },
    { day_number: 6, title: 'Daily Bread', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 11, verseEnd: 11 }], content: `"Give us today our daily bread."\n\nGod invites us to bring our daily needs to Him. Not just spiritual needs—practical ones. Food, provision, the stuff of everyday life.\n\nNotice: daily bread. Not a years supply. This keeps us dependent, returning to Him each day for what we need.\n\nNo need is too small for God attention.`, reflection_questions: ['Do you bring your practical daily needs to God?', 'Why do you think Jesus taught us to ask for "daily" rather than weekly or yearly bread?', 'What daily needs can you trust God with today?'], prayer_focus: 'Father, give me today my daily bread. I need Your provision for today. Help me trust You day by day for everything I need. Amen.' },
    { day_number: 7, title: 'Forgiveness in Prayer', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 12, verseEnd: 12 }, { book: 'Matthew', chapter: 6, verseStart: 14, verseEnd: 15 }], content: `"And forgive us our debts, as we also have forgiven our debtors."\n\nPrayer includes confession. We need forgiveness daily—and we need to extend it.\n\nJesus links these: our forgiveness and forgiving others. Unforgiveness blocks our prayers and our relationship with God.\n\nRegular confession keeps the lines of communication clear.`, reflection_questions: ['Is there anything you need to confess to God right now?', 'Is there anyone you need to forgive?', 'How does unforgiveness affect your prayer life?'], prayer_focus: 'Father, forgive my sins. Search my heart and show me what I need to confess. Help me forgive those who have wronged me. Clear any blockages between us. Amen.' },
    { day_number: 8, title: 'Protection from Evil', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 13, verseEnd: 13 }], content: `"And lead us not into temptation, but deliver us from the evil one."\n\nWe need divine protection. Temptation is real. The enemy is real. We are not strong enough on our own.\n\nThis prayer acknowledges our weakness and Gods strength. We ask Him to guide us away from traps and rescue us from evil.\n\nSpiritual warfare is real—prayer is essential armor.`, reflection_questions: ['Do you regularly pray for protection from temptation and evil?', 'Where are you most vulnerable to temptation?', 'How can you incorporate spiritual warfare into your prayers?'], prayer_focus: 'Father, lead me away from temptation. Deliver me from the evil one. Protect me from the enemy traps. I am weak, but You are strong. Guard me today. Amen.' },
    { day_number: 9, title: 'Praying with Faith', scripture_refs: [{ book: 'Mark', chapter: 11, verseStart: 24, verseEnd: 24 }, { book: 'James', chapter: 1, verseStart: 6, verseEnd: 7 }], content: `"Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours."\n\nFaith is essential to prayer. We must believe God hears, God cares, and God acts.\n\nThis is not magical thinking. It is trust in God character and promises. Doubt-filled prayers are weak prayers.\n\nPray believing. God is who He says He is. He does what He says He will do.`, reflection_questions: ['How much faith do you bring to your prayers?', 'What causes you to doubt when you pray?', 'How can you grow in faith-filled prayer?'], prayer_focus: 'Lord, I believe—help my unbelief! Increase my faith as I pray. I trust Your character and Your promises. Hear my prayer and act according to Your will. Amen.' },
    { day_number: 10, title: 'Persistent Prayer', scripture_refs: [{ book: 'Luke', chapter: 18, verseStart: 1, verseEnd: 8 }], content: `"Then Jesus told his disciples a parable to show them that they should always pray and not give up."\n\nSome prayers require persistence. The widow kept coming to the unjust judge until he gave her justice.\n\nGod is not unjust—but He often wants us to persevere. Persistence reveals the depth of our desire and strengthens our faith.\n\nDo not give up. Keep praying.`, reflection_questions: ['What prayers have you given up on?', 'Why do you think God sometimes delays answering?', 'How can you develop more persistence in prayer?'], prayer_focus: 'Father, teach me to persist in prayer. When I am tempted to give up, remind me of Your faithfulness. I will keep praying until You answer. Amen.' },
    { day_number: 11, title: 'Praying in Jesus Name', scripture_refs: [{ book: 'John', chapter: 14, verseStart: 13, verseEnd: 14 }], content: `"And I will do whatever you ask in my name, so that the Father may be glorified in the Son."\n\nPraying "in Jesus name" is not a magic formula to end prayers. It means praying according to His character, His will, His authority.\n\nWe come to the Father through Jesus. His name gives us access. His righteousness is our credential.\n\nPray as Jesus would pray—for God glory.`, reflection_questions: ['What does praying "in Jesus name" really mean?', 'How does Jesus being your access point change your confidence in prayer?', 'Are your prayers aimed at God glory?'], prayer_focus: 'Father, I come in Jesus name—not my merit, but His. Let my prayers align with His character and bring You glory. Thank You for access through Your Son. Amen.' },
    { day_number: 12, title: 'The Holy Spirit Helps', scripture_refs: [{ book: 'Romans', chapter: 8, verseStart: 26, verseEnd: 27 }], content: `"In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us."\n\nYou are not alone in prayer. The Holy Spirit helps you pray, even when you do not know what to say.\n\nHe intercedes with groans that words cannot express. He prays perfectly when your prayers feel inadequate.\n\nInvite the Spirit into your prayer life.`, reflection_questions: ['Have you experienced the Holy Spirit helping you pray?', 'How does knowing the Spirit intercedes encourage you?', 'How can you be more dependent on the Spirit in prayer?'], prayer_focus: 'Holy Spirit, help me pray. I do not always know what to ask for. Intercede for me. Pray through me. Guide my prayers according to God will. Amen.' },
    { day_number: 13, title: 'Listening Prayer', scripture_refs: [{ book: '1 Samuel', chapter: 3, verseStart: 10, verseEnd: 10 }, { book: 'Psalm', chapter: 46, verseStart: 10, verseEnd: 10 }], content: `"Speak, LORD, for your servant is listening."\n\nPrayer is two-way conversation. We speak to God—but do we listen?\n\nMuch of our prayer is talking. But God wants to speak too. Silence creates space for His voice.\n\nBe still. Listen. Wait. God has things to say to you.`, reflection_questions: ['How much of your prayer time is spent listening?', 'What makes it hard to be quiet before God?', 'Try spending five minutes in silence. What do you hear?'], prayer_focus: 'Speak, Lord, for Your servant is listening. Quiet my mind. Still my heart. I want to hear Your voice. I will wait for You to speak. Amen.' },
    { day_number: 14, title: 'Praying Scripture', scripture_refs: [{ book: 'Psalm', chapter: 119, verseStart: 105, verseEnd: 105 }, { book: 'John', chapter: 15, verseStart: 7, verseEnd: 7 }], content: `"If you remain in me and my words remain in you, ask whatever you wish, and it will be done for you."\n\nPraying Scripture supercharges your prayer life. You pray God own words back to Him.\n\nWhen His words remain in you, your prayers align with His will. You pray with confidence because you pray His promises.\n\nTurn verses into prayers. Let Scripture shape how you talk to God.`, reflection_questions: ['Have you tried praying Scripture?', 'What verse could you turn into a prayer today?', 'How does praying Gods words increase your confidence?'], prayer_focus: 'Father, let Your Word remain in me. Teach me to pray Scripture. Shape my prayers by Your promises. Let Your Word become my prayer vocabulary. Amen.' },
    { day_number: 15, title: 'Prayer and Fasting', scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 16, verseEnd: 18 }, { book: 'Acts', chapter: 13, verseStart: 2, verseEnd: 3 }], content: `"While they were worshiping the Lord and fasting, the Holy Spirit said..."\n\nFasting intensifies prayer. It clears away distractions and sharpens spiritual sensitivity.\n\nJesus expected His followers to fast—"when you fast," not "if." The early church fasted at crucial moments.\n\nFasting says: God, I am serious about seeking You. I am putting aside even legitimate needs to focus on You.`, reflection_questions: ['Have you practiced fasting with prayer?', 'What might be holding you back from fasting?', 'How could fasting deepen your prayer life?'], prayer_focus: 'Father, teach me about fasting. Show me when and how to fast. I want to seek You with my whole heart. Use fasting to deepen my prayer life. Amen.' },
    { day_number: 16, title: 'Praying for Others', scripture_refs: [{ book: '1 Timothy', chapter: 2, verseStart: 1, verseEnd: 2 }, { book: 'James', chapter: 5, verseStart: 16, verseEnd: 16 }], content: `"I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people."\n\nIntercessory prayer is powerful. When you pray for others, you partner with God in their lives.\n\nThe prayer of a righteous person is powerful and effective. Your prayers for others matter more than you know.\n\nWho needs your prayers today?`, reflection_questions: ['Who do you regularly pray for?', 'How could you be more intentional about interceding for others?', 'Make a list of people to pray for this week.'], prayer_focus: 'Father, show me who needs my prayers. Give me a heart for intercession. Let my prayers make a difference in the lives of others. I lift up [names] to You now. Amen.' },
    { day_number: 17, title: 'Praying Specifically', scripture_refs: [{ book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 6 }, { book: 'Matthew', chapter: 7, verseStart: 7, verseEnd: 8 }], content: `"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."\n\nVague prayers get vague answers. Specific prayers build faith when God specifically answers.\n\nPresent your requests—plural, specific, detailed. God invites you to ask for what you actually need.\n\nBe specific. Then watch God specifically respond.`, reflection_questions: ['Are your prayers specific or general?', 'What specific request do you need to bring to God?', 'How does specific prayer build faith?'], prayer_focus: 'Father, here are my specific requests: [list them]. I bring these detailed needs to You. Help me see Your specific answers. Amen.' },
    { day_number: 18, title: 'Prayer in Community', scripture_refs: [{ book: 'Matthew', chapter: 18, verseStart: 19, verseEnd: 20 }, { book: 'Acts', chapter: 2, verseStart: 42, verseEnd: 42 }], content: `"Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven."\n\nThere is power in praying together. Agreement amplifies prayers. Jesus promised His presence when two or three gather.\n\nThe early church devoted themselves to prayer together. They prayed and walls shook, chains fell, and the Spirit moved.\n\nDo not pray alone all the time. Pray with others.`, reflection_questions: ['Do you have people you pray with regularly?', 'What might be the benefits of praying in community?', 'Who could you invite to pray with you?'], prayer_focus: 'Father, help me find prayer partners. Show me who to pray with. Let us experience the power of agreement in prayer. Be present when we gather to seek You. Amen.' },
    { day_number: 19, title: 'When God Says No', scripture_refs: [{ book: '2 Corinthians', chapter: 12, verseStart: 8, verseEnd: 9 }], content: `"Three times I pleaded with the Lord to take it away from me. But he said to me, 'My grace is sufficient for you.'"\n\nSometimes God says no. Paul prayed three times; God answer was no—but with grace.\n\nNo is still an answer. God sees what we cannot see. His no often protects, redirects, or builds faith.\n\nTrust God even when the answer is not what you wanted.`, reflection_questions: ['How do you respond when God says no?', 'Can you look back and see wisdom in a past "no"?', 'How can you trust God even when He does not give what you ask?'], prayer_focus: 'Father, I trust You even when You say no. Your grace is sufficient. Help me accept Your answers, even when they are not what I hoped for. Your will is best. Amen.' },
    { day_number: 20, title: 'Developing a Prayer Rhythm', scripture_refs: [{ book: 'Daniel', chapter: 6, verseStart: 10, verseEnd: 10 }, { book: 'Psalm', chapter: 55, verseStart: 17, verseEnd: 17 }], content: `"Three times a day [Daniel] got down on his knees and prayed, giving thanks to his God, just as he had done before."\n\nDaniel had a prayer rhythm—three times daily. David mentions evening, morning, and noon.\n\nRhythms create consistency. They build prayer into the fabric of your day rather than leaving it to chance.\n\nWhat rhythm works for your life?`, reflection_questions: ['Do you have a consistent prayer rhythm?', 'What times of day could you dedicate to prayer?', 'How can you build prayer into your daily routine?'], prayer_focus: 'Father, help me establish a prayer rhythm. Show me the best times to meet with You daily. Make prayer as natural as breathing. Build consistency into my prayer life. Amen.' },
    { day_number: 21, title: 'A Lifestyle of Prayer', scripture_refs: [{ book: '1 Thessalonians', chapter: 5, verseStart: 17, verseEnd: 18 }, { book: 'Ephesians', chapter: 6, verseStart: 18, verseEnd: 18 }], content: `"Pray continually, give thanks in all circumstances; for this is God will for you in Christ Jesus."\n\nPrayer is not just an activity—it is a lifestyle. Praying continually means maintaining constant connection with God.\n\nEvery moment can be a prayer moment. Walking, working, waiting—you can be in conversation with God.\n\nThis 21-day journey is not the end. It is the beginning of a lifetime of deepening prayer.`, reflection_questions: ['What have you learned about prayer in these 21 days?', 'How has your prayer life changed?', 'What will you commit to going forward?'], prayer_focus: 'Father, make prayer my lifestyle, not just my activity. Help me pray continually, staying connected to You moment by moment. This is just the beginning. Deepen my prayer life for the rest of my days. Amen.' }
  ]
};

// =====================================================
// STRENGTH IN THE LORD - 21 Days (For Men)
// =====================================================
const STRENGTH_IN_LORD = {
  series: {
    slug: 'strength-in-lord',
    title: 'Strength in the Lord',
    description: 'A 21-day journey for men to discover true strength through dependence on God.',
    total_days: 21,
    topics: ['strength', 'masculinity', 'faith', 'leadership', 'courage'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'True Strength Defined',
      scripture_refs: [{ book: 'Ephesians', chapter: 6, verseStart: 10, verseEnd: 10 }, { book: '2 Corinthians', chapter: 12, verseStart: 9, verseEnd: 10 }],
      content: `"Finally, be strong in the Lord and in his mighty power." "My grace is sufficient for you, for my power is made perfect in weakness."

The world defines strength by muscle, money, and might. God defines it differently.

True strength is not self-reliance but God-dependence. It is not pretending to have it all together but admitting weakness and finding power in Christ.

Paul boasted in weakness because that is where divine power showed up. The strongest man is the one who knows he needs God.`,
      reflection_questions: [
        'How has the world shaped your definition of strength?',
        'Where are you trying to be strong in your own power?',
        'How might admitting weakness actually make you stronger?'
      ],
      prayer_focus: 'Lord, redefine strength for me. I am tired of pretending. I admit my weakness. Be strong in me and through me. Let Your power be perfected in my limitations. Amen.'
    },
    {
      day_number: 2,
      title: 'Strength Through Surrender',
      scripture_refs: [{ book: 'James', chapter: 4, verseStart: 7, verseEnd: 10 }, { book: 'Proverbs', chapter: 3, verseStart: 5, verseEnd: 6 }],
      content: `"Submit yourselves, then, to God. Resist the devil, and he will flee from you." "Trust in the Lord with all your heart and lean not on your own understanding."

Surrender sounds like defeat. But in the kingdom, surrender is victory.

Submitting to God positions you for power. When you stop leaning on your own understanding and trust His wisdom, you access strength beyond your own.

The man who surrenders to God becomes dangerous to the enemy.`,
      reflection_questions: [
        'What areas of your life have you not fully surrendered to God?',
        'Why is surrender difficult for men in our culture?',
        'How could full surrender to God actually strengthen you?'
      ],
      prayer_focus: 'Father, I surrender. I stop trying to figure everything out myself. I submit to Your authority and trust Your wisdom. Make me strong through surrender. Amen.'
    },
    {
      day_number: 3,
      title: 'The Courage to Be Vulnerable',
      scripture_refs: [{ book: 'Psalm', chapter: 62, verseStart: 8, verseEnd: 8 }, { book: 'James', chapter: 5, verseStart: 16, verseEnd: 16 }],
      content: `"Trust in him at all times, you people; pour out your hearts to him, for God is our refuge." "Confess your sins to each other and pray for each other so that you may be healed."

Real men are vulnerable. Fake strength hides and pretends. Real strength admits need.

Pouring out your heart to God requires vulnerability. Confessing to brothers requires even more. But this is where healing happens.

The man who cannot be vulnerable is actually the weak one—enslaved to an image he must constantly maintain.`,
      reflection_questions: [
        'Who knows your real struggles?',
        'What fear keeps you from being vulnerable?',
        'How could vulnerability with God and others strengthen you?'
      ],
      prayer_focus: 'Lord, give me courage to be vulnerable. I pour out my heart to You now. Help me find brothers I can be real with. Break the chains of pretending. Amen.'
    },
    {
      day_number: 4,
      title: 'Strength for the Battle',
      scripture_refs: [{ book: 'Ephesians', chapter: 6, verseStart: 11, verseEnd: 13 }, { book: '2 Timothy', chapter: 2, verseStart: 3, verseEnd: 4 }],
      content: `"Put on the full armor of God, so that you can take your stand against the devil's schemes." "Join with me in suffering, like a good soldier of Christ Jesus."

You are in a battle. Like it or not, you have an enemy who wants to destroy you, your family, and your faith.

Soldiers prepare for battle. They train, they arm themselves, they stay alert. Passive men are easy targets.

God has given you armor. Use it. Stand firm. Fight.`,
      reflection_questions: [
        'Do you live with an awareness that you are in spiritual battle?',
        'Where has the enemy been attacking you lately?',
        'How can you be more prepared for spiritual warfare?'
      ],
      prayer_focus: 'Lord, wake me up to the battle I am in. Help me put on Your armor daily. Make me a good soldier who stands firm against the enemy. Amen.'
    },
    {
      day_number: 5,
      title: 'Strength in the Word',
      scripture_refs: [{ book: 'Psalm', chapter: 119, verseStart: 9, verseEnd: 11 }, { book: 'Joshua', chapter: 1, verseStart: 8, verseEnd: 8 }],
      content: `"How can a young man keep his way pure? By living according to your word. I have hidden your word in my heart that I might not sin against you."

The Word of God is your weapon. It is how Jesus defeated temptation in the wilderness—"It is written."

A man who does not know Scripture is unarmed in battle. Meditation on the Word brings success, strength, and purity.

Do not just read the Bible. Let it read you. Hide it in your heart.`,
      reflection_questions: [
        'How consistent are you in reading and studying Scripture?',
        'What verses have you memorized that strengthen you in temptation?',
        'How can you go deeper in the Word this week?'
      ],
      prayer_focus: 'Father, give me hunger for Your Word. Help me hide Scripture in my heart. Let Your Word be the sword I wield against every temptation. Amen.'
    },
    {
      day_number: 6,
      title: 'Strength in Prayer',
      scripture_refs: [{ book: 'Ephesians', chapter: 6, verseStart: 18, verseEnd: 18 }, { book: 'Mark', chapter: 14, verseStart: 38, verseEnd: 38 }],
      content: `"And pray in the Spirit on all occasions with all kinds of prayers and requests." "Watch and pray so that you will not fall into temptation. The spirit is willing, but the flesh is weak."

Prayerless men are powerless men. Jesus said to watch and pray—or fall to temptation.

Prayer is not passive; it is war. Through prayer you access heaven's power, discern enemy attacks, and strengthen your spirit against weak flesh.

The man who prays is the man who stands.`,
      reflection_questions: [
        'How would you honestly describe your prayer life?',
        'What keeps you from praying more consistently?',
        'How can prayer become more of a priority?'
      ],
      prayer_focus: 'Lord, forgive my prayerlessness. Teach me to pray on all occasions. Wake me up to watch and pray. Make me a man of prayer. Amen.'
    },
    {
      day_number: 7,
      title: 'Strength Through Brotherhood',
      scripture_refs: [{ book: 'Ecclesiastes', chapter: 4, verseStart: 9, verseEnd: 12 }, { book: 'Proverbs', chapter: 27, verseStart: 17, verseEnd: 17 }],
      content: `"Two are better than one... If either of them falls down, one can help the other up. But pity anyone who falls and has no one to help them up!" "As iron sharpens iron, so one person sharpens another."

Lone rangers are easy targets. Men were made for brotherhood.

You need men who will pick you up when you fall, sharpen you when you get dull, and fight alongside you in battle.

Isolation is the enemy's strategy. Do not play into it.`,
      reflection_questions: [
        'Do you have brothers who truly know you?',
        'What keeps you from deeper friendships with other men?',
        'Who is sharpening you, and who are you sharpening?'
      ],
      prayer_focus: 'Father, bring men into my life who will sharpen me. Help me be vulnerable and pursue real brotherhood. Protect me from isolation. Amen.'
    },
    {
      day_number: 8,
      title: 'Strength to Lead',
      scripture_refs: [{ book: 'Joshua', chapter: 24, verseStart: 15, verseEnd: 15 }, { book: 'Ephesians', chapter: 5, verseStart: 25, verseEnd: 25 }],
      content: `"But as for me and my household, we will serve the Lord." "Husbands, love your wives, just as Christ loved the church and gave himself up for her."

Leadership is not about control. It is about sacrifice. It is going first—into danger, into service, into humility.

Joshua declared his leadership: my house will serve the Lord. He did not wait for his family to lead him. He led.

Christ-like leadership means loving sacrificially. Giving yourself. Serving those you lead.`,
      reflection_questions: [
        'Where has God placed you in leadership—home, work, church?',
        'Are you leading or just existing in those roles?',
        'What would it look like to lead more sacrificially?'
      ],
      prayer_focus: 'Lord, make me a leader who serves. Help me lead my household to follow You. Give me the courage to go first and the humility to serve. Amen.'
    },
    {
      day_number: 9,
      title: 'Strength in Self-Control',
      scripture_refs: [{ book: 'Proverbs', chapter: 25, verseStart: 28, verseEnd: 28 }, { book: 'Galatians', chapter: 5, verseStart: 22, verseEnd: 23 }],
      content: `"Like a city whose walls are broken through is a person who lacks self-control." "But the fruit of the Spirit is... self-control."

A man without self-control is defenseless. His walls are down. Any enemy can walk in.

Self-control over anger, lust, appetite, and words—this is Spirit-produced strength. It is not white-knuckle effort; it is the fruit of walking with God.

Master yourself, or something else will master you.`,
      reflection_questions: [
        'Where do you struggle most with self-control?',
        'What are the consequences of that lack of control?',
        'How can you cooperate with the Spirit to grow in self-control?'
      ],
      prayer_focus: 'Holy Spirit, produce self-control in me. Rebuild the walls that have been broken. Help me master my anger, my eyes, my appetites, my tongue. Amen.'
    },
    {
      day_number: 10,
      title: 'Strength to Resist Temptation',
      scripture_refs: [{ book: '1 Corinthians', chapter: 10, verseStart: 13, verseEnd: 13 }, { book: 'James', chapter: 4, verseStart: 7, verseEnd: 7 }],
      content: `"No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it."

Every temptation has an exit. God is faithful to provide it.

Your temptations are not unique. Other men have faced them and won. You can too.

Resist the devil and he will flee. This is a promise. Stand firm, use the way out, and watch the enemy run.`,
      reflection_questions: [
        'What temptations do you face most regularly?',
        'Do you look for the way out, or do you linger near temptation?',
        'How can you better prepare for moments of temptation?'
      ],
      prayer_focus: 'Lord, thank You that You always provide a way out. Help me see the escape routes and take them. Give me strength to resist and watch the enemy flee. Amen.'
    },
    {
      day_number: 11,
      title: 'Strength to Forgive',
      scripture_refs: [{ book: 'Ephesians', chapter: 4, verseStart: 31, verseEnd: 32 }, { book: 'Matthew', chapter: 6, verseStart: 14, verseEnd: 15 }],
      content: `"Get rid of all bitterness, rage and anger... Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you."

Unforgiveness feels like strength. I will not let them off the hook. But it is actually bondage.

Bitterness poisons you, not them. Holding grudges takes energy that could fuel something better.

Forgiving is not weakness. It takes more strength to forgive than to stay angry. It is the powerful choice.`,
      reflection_questions: [
        'Who do you need to forgive?',
        'What bitterness are you holding onto?',
        'How has unforgiveness affected you?'
      ],
      prayer_focus: 'Father, You forgave me everything. Help me forgive [name]. I release them. I let go of bitterness. Free me through the strength to forgive. Amen.'
    },
    {
      day_number: 12,
      title: 'Strength in Work',
      scripture_refs: [{ book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 24 }, { book: 'Proverbs', chapter: 14, verseStart: 23, verseEnd: 23 }],
      content: `"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." "All hard work brings a profit, but mere talk leads only to poverty."

Work is worship. Whatever you do—at the office, on the job site, in your home—do it as unto the Lord.

Men were made to work. It is not the curse; the curse made work painful. But meaningful work is part of how you reflect God.

Work hard. Work with excellence. Work as if Jesus is your boss—because He is.`,
      reflection_questions: [
        'Do you see your work as worship?',
        'How could viewing your boss as Jesus change your work ethic?',
        'Where do you need to bring more excellence to your work?'
      ],
      prayer_focus: 'Lord, I offer my work as worship. Help me work with all my heart, as unto You. Let my work reflect Your excellence and bring You glory. Amen.'
    },
    {
      day_number: 13,
      title: 'Strength with Words',
      scripture_refs: [{ book: 'Proverbs', chapter: 18, verseStart: 21, verseEnd: 21 }, { book: 'James', chapter: 3, verseStart: 5, verseEnd: 6 }],
      content: `"The tongue has the power of life and death." "The tongue is a small part of the body, but it makes great boasts... It corrupts the whole body."

Your words have power. Life and death are in your tongue.

What are you speaking over your wife? Your kids? Yourself? Blessing or cursing? Building up or tearing down?

A strong man controls his tongue. He speaks life, encouragement, and truth.`,
      reflection_questions: [
        'What kind of words characterize your speech?',
        'Who have you hurt with your words recently?',
        'How can you use your words to build up those around you?'
      ],
      prayer_focus: 'Lord, set a guard over my mouth. Help me speak life, not death. Let my words build up my family and encourage others. Control my tongue. Amen.'
    },
    {
      day_number: 14,
      title: 'Strength to Protect',
      scripture_refs: [{ book: 'Nehemiah', chapter: 4, verseStart: 14, verseEnd: 14 }, { book: 'John', chapter: 10, verseStart: 11, verseEnd: 12 }],
      content: `"Don't be afraid of them. Remember the Lord, who is great and awesome, and fight for your families, your sons and your daughters, your wives and your homes."

Men are called to protect. Your family, your home, your community—these are your responsibility.

Nehemiah rallied the men to fight for their families. The good shepherd protects the sheep from wolves.

Protection is not just physical. Protect your home spiritually, emotionally, relationally. Stand guard.`,
      reflection_questions: [
        'What are you protecting your family from?',
        'Are there threats—spiritual, digital, relational—that you have ignored?',
        'How can you be a better protector of those God has entrusted to you?'
      ],
      prayer_focus: 'Lord, help me protect my family. Open my eyes to threats I have ignored. Give me courage to fight for my home. Make me a guardian of those I love. Amen.'
    },
    {
      day_number: 15,
      title: 'Strength to Provide',
      scripture_refs: [{ book: '1 Timothy', chapter: 5, verseStart: 8, verseEnd: 8 }, { book: 'Proverbs', chapter: 6, verseStart: 6, verseEnd: 8 }],
      content: `"Anyone who does not provide for their relatives, and especially for their own household, has denied the faith and is worse than an unbeliever."

Provision is not optional. Scripture is blunt—failing to provide is a denial of faith.

This does not mean you must be wealthy. It means you work, you plan, you sacrifice for your family. Like the ant, you prepare.

A strong man takes responsibility for the physical and financial needs of his household.`,
      reflection_questions: [
        'Are you faithfully providing for those who depend on you?',
        'Where do you need to be more responsible with finances?',
        'How can you better prepare for your familys future?'
      ],
      prayer_focus: 'Father, help me be a faithful provider. Give me wisdom with finances. Help me work diligently and plan wisely. I take responsibility for my household. Amen.'
    },
    {
      day_number: 16,
      title: 'Strength in Suffering',
      scripture_refs: [{ book: 'Romans', chapter: 5, verseStart: 3, verseEnd: 5 }, { book: '1 Peter', chapter: 5, verseStart: 10, verseEnd: 10 }],
      content: `"We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope." "After you have suffered a little while, [God] will himself restore you and make you strong, firm and steadfast."

Suffering is not the enemy of strength. It is the forge that produces it.

Every trial you endure without quitting builds perseverance. Perseverance builds character. Character builds hope.

Do not waste your suffering. Let it strengthen you.`,
      reflection_questions: [
        'What suffering are you facing right now?',
        'How have past trials made you stronger?',
        'How can you approach current suffering with a different perspective?'
      ],
      prayer_focus: 'Lord, I do not choose suffering, but I will not waste it. Use this trial to build perseverance, character, and hope in me. Make me stronger through it. Amen.'
    },
    {
      day_number: 17,
      title: 'Strength to Pursue Purity',
      scripture_refs: [{ book: '1 Thessalonians', chapter: 4, verseStart: 3, verseEnd: 5 }, { book: 'Job', chapter: 31, verseStart: 1, verseEnd: 1 }],
      content: `"It is God's will that you should be sanctified: that you should avoid sexual immorality; that each of you should learn to control your own body in a way that is holy and honorable."

Sexual purity is a battle. But it is a battle worth fighting.

Job made a covenant with his eyes not to look lustfully. That kind of intentionality is required today more than ever.

Your purity protects your marriage, your witness, and your soul. Fight for it.`,
      reflection_questions: [
        'Where are you vulnerable to sexual temptation?',
        'What boundaries do you have in place to guard your purity?',
        'Who can you be accountable to in this area?'
      ],
      prayer_focus: 'Lord, I commit to purity. Guard my eyes, my mind, my heart. Help me flee temptation and honor You with my body. Give me strength to stay pure. Amen.'
    },
    {
      day_number: 18,
      title: 'Strength to Pursue Wisdom',
      scripture_refs: [{ book: 'Proverbs', chapter: 4, verseStart: 5, verseEnd: 7 }, { book: 'James', chapter: 1, verseStart: 5, verseEnd: 5 }],
      content: `"Get wisdom, get understanding... Wisdom is supreme; therefore get wisdom. Though it cost all you have, get understanding."

Strong men are wise men. Muscle without wisdom is dangerous.

Wisdom is the skill to navigate life well. It comes from fearing God, studying Scripture, and learning from wise counsel.

Pursue wisdom like treasure. It is worth more than gold.`,
      reflection_questions: [
        'How are you actively pursuing wisdom?',
        'Who are the wise men speaking into your life?',
        'What decisions do you need wisdom for right now?'
      ],
      prayer_focus: 'Father, give me wisdom. I need it for decisions, for leadership, for life. Help me pursue it relentlessly. Make me a wise man. Amen.'
    },
    {
      day_number: 19,
      title: 'Strength in Humility',
      scripture_refs: [{ book: 'Philippians', chapter: 2, verseStart: 3, verseEnd: 8 }, { book: '1 Peter', chapter: 5, verseStart: 5, verseEnd: 6 }],
      content: `"In humility value others above yourselves... Have the same mindset as Christ Jesus: Who, being in very nature God, did not consider equality with God something to be used to his own advantage; rather, he made himself nothing."

Humility is not weakness. It is strength under control.

Jesus—the most powerful person who ever lived—humbled Himself. He served. He washed feet. He made Himself nothing.

The humble will be exalted. Pride goes before destruction.`,
      reflection_questions: [
        'Where does pride show up in your life?',
        'What would it look like to value others above yourself today?',
        'How can you follow the example of Jesus in humility?'
      ],
      prayer_focus: 'Lord, humble me. Root out pride. Help me value others above myself. Give me the strength to serve without needing recognition. Amen.'
    },
    {
      day_number: 20,
      title: 'Strength for the Long Haul',
      scripture_refs: [{ book: 'Galatians', chapter: 6, verseStart: 9, verseEnd: 9 }, { book: 'Hebrews', chapter: 12, verseStart: 1, verseEnd: 2 }],
      content: `"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." "Let us run with perseverance the race marked out for us, fixing our eyes on Jesus."

Following Jesus is a marathon, not a sprint. Many start well but do not finish.

Perseverance matters. Do not grow weary. Do not give up. Keep your eyes on Jesus and keep running.

Finish strong. That is the goal.`,
      reflection_questions: [
        'Where are you tempted to give up?',
        'What helps you persevere when you want to quit?',
        'What does finishing strong look like for you?'
      ],
      prayer_focus: 'Lord, I want to finish well. Give me strength for the long haul. When I am weary, renew my strength. Help me keep my eyes on Jesus and never give up. Amen.'
    },
    {
      day_number: 21,
      title: 'Your Strength Is in the Lord',
      scripture_refs: [{ book: 'Isaiah', chapter: 40, verseStart: 28, verseEnd: 31 }, { book: 'Philippians', chapter: 4, verseStart: 13, verseEnd: 13 }],
      content: `"He gives strength to the weary and increases the power of the weak... Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."

Here is the summary of 21 days: your strength is in the Lord.

Not in yourself. Not in your effort. Not in your willpower. In Him.

When you are weary, He gives strength. When you are weak, He increases power. Hope in Him, and your strength will be renewed.

You can do all things through Christ who strengthens you.`,
      reflection_questions: [
        'What have you learned about strength over these 21 days?',
        'Where do you still try to rely on your own strength?',
        'How will you continue to find strength in the Lord going forward?'
      ],
      prayer_focus: 'Lord, my strength is in You alone. I hope in You. Renew my strength. Help me soar, run, and walk without fainting. I can do all things through You. Amen.'
    }
  ]
};

// =====================================================
// PROVERBS 31 HEART - 21 Days (For Women)
// =====================================================
const PROVERBS_31_HEART = {
  series: {
    slug: 'proverbs-31-heart',
    title: 'A Proverbs 31 Heart',
    description: 'A 21-day journey for women to cultivate the heart qualities of the virtuous woman.',
    total_days: 21,
    topics: ['virtue', 'femininity', 'wisdom', 'character', 'faith'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'More Than a Checklist',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 10, verseEnd: 12 }],
      content: `"A wife of noble character who can find? She is worth far more than rubies. Her husband has full confidence in her and lacks nothing of value. She brings him good, not harm, all the days of her life."

The Proverbs 31 woman is not a checklist to achieve. She is a portrait of character to aspire to.

This passage was never meant to overwhelm you with impossible standards. It is meant to inspire you with a vision of what a woman devoted to God can become over a lifetime.

Her value is not in perfection but in character. Not in doing everything, but in having a heart fully devoted to the Lord.`,
      reflection_questions: [
        'Have you ever felt overwhelmed by the Proverbs 31 woman?',
        'What if you viewed this passage as inspiration rather than expectation?',
        'What character quality from this woman do you most admire?'
      ],
      prayer_focus: 'Lord, help me see Proverbs 31 with fresh eyes. Not as a burden but as a vision. Shape my heart before You shape my schedule. I want noble character, not just a perfect checklist. Amen.'
    },
    {
      day_number: 2,
      title: 'The Fear of the Lord',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 30, verseEnd: 31 }, { book: 'Proverbs', chapter: 9, verseStart: 10, verseEnd: 10 }],
      content: `"Charm is deceptive, and beauty is fleeting; but a woman who fears the LORD is to be praised."

Here is the secret to the Proverbs 31 woman: she fears the Lord.

All her industry, wisdom, and virtue flow from this source. The fear of the Lord is the beginning of wisdom—and it is the foundation of her life.

Charm fades. Beauty changes. But reverence for God produces lasting praise.`,
      reflection_questions: [
        'What does it mean to fear the Lord in your daily life?',
        'How does our culture value charm and beauty over character?',
        'How can you grow in the fear of the Lord?'
      ],
      prayer_focus: 'Father, teach me to fear You. Not terror, but reverence. Let my life flow from awe of who You are. Make me a woman whose worth is found in You, not in fleeting things. Amen.'
    },
    {
      day_number: 3,
      title: 'A Trustworthy Heart',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 11, verseEnd: 11 }, { book: 'Proverbs', chapter: 11, verseStart: 13, verseEnd: 13 }],
      content: `"Her husband has full confidence in her and lacks nothing of value."

Trustworthiness is foundational to the Proverbs 31 woman. Her husband can rely on her completely.

This extends beyond marriage. Are you trustworthy? Can others confide in you without fear of gossip? Do you keep your word? Are you reliable?

A trustworthy woman is rare and valuable. Her integrity speaks louder than her words.`,
      reflection_questions: [
        'Would others describe you as trustworthy?',
        'Are you faithful with confidential information?',
        'Where do you need to grow in reliability?'
      ],
      prayer_focus: 'Lord, make me trustworthy. Help me keep confidences, keep my word, and be someone others can rely on. Let my integrity be unquestionable. Amen.'
    },
    {
      day_number: 4,
      title: 'Doing Good, Not Harm',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 12, verseEnd: 12 }, { book: 'Romans', chapter: 12, verseStart: 21, verseEnd: 21 }],
      content: `"She brings him good, not harm, all the days of her life."

All the days of her life. This is not occasional goodness but consistent character.

Do your words build up or tear down? Does your presence bring peace or anxiety? Are you a source of good in the lives of those around you?

Commit to being a force for good—in your home, your relationships, your community.`,
      reflection_questions: [
        'Do you consistently bring good to those closest to you?',
        'Are there relationships where you sometimes bring harm instead of good?',
        'How can you be more intentional about doing good today?'
      ],
      prayer_focus: 'Father, help me bring good, not harm, all the days of my life. Guard my tongue, my attitudes, and my actions. Make me a consistent blessing to those around me. Amen.'
    },
    {
      day_number: 5,
      title: 'Eager Hands',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 13, verseEnd: 13 }, { book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 23 }],
      content: `"She selects wool and flax and works with eager hands."

Notice: eager hands. Not reluctant hands. Not resentful hands. Eager.

She finds joy in her work. Whatever her hands find to do, she does it with energy and willingness.

Your attitude toward work matters as much as the work itself. Eagerness transforms mundane tasks into worship.`,
      reflection_questions: [
        'Are your hands eager or reluctant in your work?',
        'What tasks do you resent doing?',
        'How can you shift from obligation to eagerness?'
      ],
      prayer_focus: 'Lord, give me eager hands. Transform my attitude toward work. Help me see every task as an opportunity to serve You. Replace resentment with willingness. Amen.'
    },
    {
      day_number: 6,
      title: 'Providing for Her Household',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 14, verseEnd: 15 }],
      content: `"She is like the merchant ships, bringing her food from afar. She gets up while it is still night; she provides food for her family and portions for her female servants."

The Proverbs 31 woman is resourceful. She thinks ahead, plans, and provides.

This is not about being superwoman. It is about being thoughtful—anticipating needs, managing resources, caring for those in your sphere.

She rises early because her family matters. Sacrifice flows from love.`,
      reflection_questions: [
        'Are you thoughtful about providing for your household?',
        'Where could you be more resourceful?',
        'What sacrifices of time or comfort do you make for those you love?'
      ],
      prayer_focus: 'Father, help me be thoughtful and resourceful. Give me wisdom to plan and provide. Let my sacrifices flow from love, not obligation. Amen.'
    },
    {
      day_number: 7,
      title: 'Wise Investments',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 16, verseEnd: 16 }, { book: 'Luke', chapter: 16, verseStart: 10, verseEnd: 10 }],
      content: `"She considers a field and buys it; out of her earnings she plants a vineyard."

She considers—she is thoughtful, not impulsive. She invests wisely, thinking of the future.

This woman is not afraid of business, finances, or making wise decisions. She uses her resources strategically.

Whether you manage a large budget or a small one, wisdom in finances reflects wisdom in character.`,
      reflection_questions: [
        'Are you thoughtful with financial decisions?',
        'Do you tend toward impulsive spending or wise investing?',
        'How can you be a better steward of your resources?'
      ],
      prayer_focus: 'Lord, give me wisdom with money and resources. Help me consider carefully before acting. Make me a faithful steward of what You have entrusted to me. Amen.'
    },
    {
      day_number: 8,
      title: 'Strength and Dignity',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 17, verseEnd: 17 }, { book: 'Proverbs', chapter: 31, verseStart: 25, verseEnd: 25 }],
      content: `"She sets about her work vigorously; her arms are strong for her tasks." "She is clothed with strength and dignity; she can laugh at the days to come."

Strength is not unfeminine. The Proverbs 31 woman is strong—physically, emotionally, spiritually.

And she has dignity. Not arrogance, but a quiet confidence that comes from knowing who she is and whose she is.

She laughs at the future because her security is in God, not circumstances.`,
      reflection_questions: [
        'What does feminine strength look like to you?',
        'Do you face the future with fear or confidence?',
        'Where does your dignity come from?'
      ],
      prayer_focus: 'Father, clothe me with strength and dignity. Build my confidence not in myself but in You. Help me face the future with laughter, knowing You hold it all. Amen.'
    },
    {
      day_number: 9,
      title: 'Open Hands to the Poor',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 20, verseEnd: 20 }, { book: 'Matthew', chapter: 25, verseStart: 40, verseEnd: 40 }],
      content: `"She opens her arms to the poor and extends her hands to the needy."

Her hands work hard for her household—and they reach out to help others.

Generosity is a mark of the godly woman. She does not hoard her resources but shares them. She sees need and responds.

Open hands cannot hold too tightly to possessions.`,
      reflection_questions: [
        'How do you respond to the poor and needy?',
        'Are your hands open or closed?',
        'What practical steps can you take to be more generous?'
      ],
      prayer_focus: 'Lord, open my hands. Help me see need around me and respond with generosity. Break any grip of greed. Make me a channel of Your provision to others. Amen.'
    },
    {
      day_number: 10,
      title: 'Wisdom on Her Tongue',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 26, verseEnd: 26 }, { book: 'Ephesians', chapter: 4, verseStart: 29, verseEnd: 29 }],
      content: `"She speaks with wisdom, and faithful instruction is on her tongue."

Her words are marked by wisdom. Not gossip, not criticism, not empty chatter—wisdom.

And faithful instruction. She teaches. She builds up. She speaks truth with love.

Your tongue can bring life or death. The Proverbs 31 woman chooses life.`,
      reflection_questions: [
        'What typically characterizes your speech?',
        'Do others seek your counsel because you speak wisdom?',
        'What needs to change about your words?'
      ],
      prayer_focus: 'Father, put wisdom on my tongue. Help me speak words that build up, not tear down. Let faithful instruction flow from my lips. Guard my mouth from gossip and criticism. Amen.'
    },
    {
      day_number: 11,
      title: 'Watching Over Her Household',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 27, verseEnd: 27 }, { book: 'Titus', chapter: 2, verseStart: 4, verseEnd: 5 }],
      content: `"She watches over the affairs of her household and does not eat the bread of idleness."

She is attentive. She pays attention to what is happening in her home, her relationships, her responsibilities.

This is not anxious micromanaging. It is faithful stewardship. She does not ignore problems or drift into laziness.

Vigilance and diligence protect what matters most.`,
      reflection_questions: [
        'Are you attentive to the affairs of your household?',
        'Is there anywhere you have drifted into neglect or idleness?',
        'What needs your watchful attention right now?'
      ],
      prayer_focus: 'Lord, help me be vigilant over my household. Open my eyes to see what needs attention. Protect me from laziness and neglect. Make me a faithful steward of my home. Amen.'
    },
    {
      day_number: 12,
      title: 'A Heart of Kindness',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 26, verseEnd: 26 }, { book: 'Colossians', chapter: 3, verseStart: 12, verseEnd: 12 }],
      content: `"...faithful instruction is on her tongue." The Hebrew word here can also be translated as "kindness" — the teaching of kindness.

Kindness is a choice. It is how we treat people, especially those who cannot benefit us.

The Proverbs 31 woman is not harsh or demanding. She is kind. Her strength is wrapped in gentleness.

Kindness is never weakness. It takes strength to be consistently kind.`,
      reflection_questions: [
        'Are you known for kindness?',
        'Who in your life needs more kindness from you?',
        'How can you show unexpected kindness today?'
      ],
      prayer_focus: 'Father, clothe me with kindness. Help me be gentle, not harsh. Let kindness mark my words and actions. Give me strength to be consistently kind. Amen.'
    },
    {
      day_number: 13,
      title: 'Beautiful Character',
      scripture_refs: [{ book: '1 Peter', chapter: 3, verseStart: 3, verseEnd: 4 }, { book: 'Proverbs', chapter: 31, verseStart: 30, verseEnd: 30 }],
      content: `"Your beauty should not come from outward adornment... Rather, it should be that of your inner self, the unfading beauty of a gentle and quiet spirit, which is of great worth in God sight."

The world focuses on external beauty. God focuses on the heart.

This does not mean neglecting your appearance. It means prioritizing what truly matters. A gentle and quiet spirit is unfading—it does not wrinkle or gray.

Invest in the beauty that lasts.`,
      reflection_questions: [
        'Where do you spend more time—on outer or inner beauty?',
        'What does a gentle and quiet spirit look like practically?',
        'How can you invest in unfading beauty?'
      ],
      prayer_focus: 'Lord, help me invest in inner beauty. Develop in me a gentle and quiet spirit. Let my character be more beautiful than my appearance. Shape my heart to be beautiful to You. Amen.'
    },
    {
      day_number: 14,
      title: 'A Blessed Legacy',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 28, verseEnd: 28 }, { book: 'Psalm', chapter: 112, verseStart: 1, verseEnd: 2 }],
      content: `"Her children arise and call her blessed; her husband also, and he praises her."

What kind of legacy are you building? What will your children say about you? What would your husband praise?

This legacy is not built in a day. It is the accumulation of thousands of small faithful choices over years.

The praise at the end reflects the life that preceded it.`,
      reflection_questions: [
        'What legacy are you building?',
        'What would you want your children to say about you?',
        'What small faithful choices are you making today that build your legacy?'
      ],
      prayer_focus: 'Father, help me build a blessed legacy. Let my daily choices reflect who I want to become. May my children and those I love see Your faithfulness in my life. Amen.'
    },
    {
      day_number: 15,
      title: 'Excellence Without Perfection',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 29, verseEnd: 29 }, { book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 24 }],
      content: `"Many women do noble things, but you surpass them all."

Excellence is not perfection. It is doing your best with what you have, where you are.

The Proverbs 31 woman pursued excellence, not flawlessness. She gave her best to her work, her family, her God.

Release the burden of perfection. Embrace the call to excellence.`,
      reflection_questions: [
        'Do you confuse excellence with perfection?',
        'Where does perfectionism hold you back?',
        'What would excellence look like in your current season?'
      ],
      prayer_focus: 'Lord, free me from perfectionism. Help me pursue excellence instead—giving my best without demanding flawlessness. Let my work be worship, not a performance. Amen.'
    },
    {
      day_number: 16,
      title: 'Managing Your Time',
      scripture_refs: [{ book: 'Ephesians', chapter: 5, verseStart: 15, verseEnd: 16 }, { book: 'Psalm', chapter: 90, verseStart: 12, verseEnd: 12 }],
      content: `"Be very careful, then, how you live—not as unwise but as wise, making the most of every opportunity."

The Proverbs 31 woman was productive because she was intentional with her time. She rose early. She planned. She prioritized.

Time is your most finite resource. You cannot make more of it. You can only steward what you have.

How you spend your time reveals what you truly value.`,
      reflection_questions: [
        'Are you intentional with your time?',
        'What time-wasters do you need to eliminate?',
        'How can you make the most of your opportunities?'
      ],
      prayer_focus: 'Father, teach me to number my days. Help me be wise with my time. Show me what to prioritize and what to release. Make me intentional, not accidental, with my hours. Amen.'
    },
    {
      day_number: 17,
      title: 'Embracing Your Season',
      scripture_refs: [{ book: 'Ecclesiastes', chapter: 3, verseStart: 1, verseEnd: 1 }, { book: 'Galatians', chapter: 6, verseStart: 9, verseEnd: 9 }],
      content: `"There is a time for everything, and a season for every activity under the heavens."

The Proverbs 31 woman did not do everything at once. The passage describes a lifetime of faithfulness, not a single overwhelming day.

Embrace your current season. A mother of young children has different rhythms than an empty nester. A working woman has different constraints than a stay-at-home mom.

Be faithful in your season.`,
      reflection_questions: [
        'What season of life are you in right now?',
        'Are you trying to do things that belong to a different season?',
        'What does faithfulness look like in your current season?'
      ],
      prayer_focus: 'Lord, help me embrace my season. Keep me from comparing myself to women in different seasons. Show me what faithfulness looks like right now. Give me peace in the present. Amen.'
    },
    {
      day_number: 18,
      title: 'Creativity and Skill',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 19, verseEnd: 19 }, { book: 'Exodus', chapter: 35, verseStart: 25, verseEnd: 26 }],
      content: `"In her hand she holds the distaff and grasps the spindle with her fingers."

She has skills. She has developed abilities. She creates with her hands.

What skills has God given you? What abilities can you develop? Creativity and craftsmanship are expressions of being made in the image of the Creator.

Do not bury your talents. Use them.`,
      reflection_questions: [
        'What skills has God given you?',
        'Are you developing your abilities or letting them lie dormant?',
        'How can you use your creativity to serve others?'
      ],
      prayer_focus: 'Father, thank You for the skills and creativity You have given me. Help me develop my abilities and use them for Your glory. Let me create as one made in Your image. Amen.'
    },
    {
      day_number: 19,
      title: 'Serving Without Recognition',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 1, verseEnd: 4 }, { book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 24 }],
      content: `"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."

Much of what the Proverbs 31 woman did was unseen. Cooking meals, managing a household, caring for family—these are often unnoticed.

But God sees. When you serve without recognition, you serve Him. Your audience is the One who sees in secret.

Faithfulness in the unseen matters most.`,
      reflection_questions: [
        'Do you struggle when your work goes unnoticed?',
        'How does serving for God rather than human recognition change your attitude?',
        'What unseen work are you doing that God sees?'
      ],
      prayer_focus: 'Lord, help me serve without needing recognition. You see what others miss. Let my audience be You alone. Free me from the need for applause and approval. Amen.'
    },
    {
      day_number: 20,
      title: 'Rest and Renewal',
      scripture_refs: [{ book: 'Mark', chapter: 6, verseStart: 31, verseEnd: 31 }, { book: 'Psalm', chapter: 23, verseStart: 2, verseEnd: 3 }],
      content: `"Come with me by yourselves to a quiet place and get some rest."

The Proverbs 31 woman was diligent, but she was not a machine. Even Jesus invited His disciples to rest.

Rest is not laziness. It is wisdom. It is trust. It is acknowledging that you are not God and cannot keep going forever.

Renewal is essential to sustained faithfulness.`,
      reflection_questions: [
        'Do you get adequate rest?',
        'Is busyness a badge of honor for you?',
        'How can you build rest and renewal into your rhythms?'
      ],
      prayer_focus: 'Father, teach me to rest. Forgive me for trying to do what only You can do. Renew my strength. Give me the wisdom to pause and the trust to stop. Amen.'
    },
    {
      day_number: 21,
      title: 'Praised by Her Works',
      scripture_refs: [{ book: 'Proverbs', chapter: 31, verseStart: 31, verseEnd: 31 }, { book: 'Matthew', chapter: 25, verseStart: 21, verseEnd: 21 }],
      content: `"Honor her for all that her hands have done, and let her works bring her praise at the city gate."

In the end, her works speak for themselves. Not her words, not her intentions—her works.

This is not works-based salvation. It is faith expressed in action. A life lived for God leaves evidence.

What will your works say about you?`,
      reflection_questions: [
        'What do your works say about you right now?',
        'What has changed in your heart through these 21 days?',
        'What one thing will you commit to going forward?'
      ],
      prayer_focus: 'Lord, let my works praise You. May my life leave evidence of Your work in me. As I close these 21 days, continue shaping my heart. Make me a woman after Your own heart. Amen.'
    }
  ]
};

// =====================================================
// FAMILY FAITH BUILDERS - 21 Days
// =====================================================
const FAMILY_FAITH_BUILDERS = {
  series: {
    slug: 'family-faith-builders',
    title: 'Family Faith Builders',
    description: 'A 21-day journey to strengthen your family faith and create a Christ-centered home.',
    total_days: 21,
    topics: ['family', 'parenting', 'marriage', 'discipleship', 'home'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'Building on the Rock',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 24, verseEnd: 27 }],
      content: `"Everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock. The rain came down, the streams rose, and the winds blew and beat against that house; yet it did not fall, because it had its foundation on the rock."

Every family faces storms—financial pressure, health crises, relational conflict, external temptations. The question is not if storms will come, but what foundation your home is built on.

A family built on Christ stands. Not because the storms are less severe, but because the foundation is unshakeable.

These 21 days will help you build—or rebuild—your family on the rock.`,
      reflection_questions: [
        'What foundation is your family currently built on?',
        'What storms has your family faced recently?',
        'What would it look like to build more intentionally on Christ?'
      ],
      prayer_focus: 'Lord, we want our family built on the rock. Show us where our foundation is weak. Help us hear Your words and put them into practice. Make our home storm-proof through You. Amen.'
    },
    {
      day_number: 2,
      title: 'Making Faith the Priority',
      scripture_refs: [{ book: 'Deuteronomy', chapter: 6, verseStart: 4, verseEnd: 9 }],
      content: `"These commandments that I give you today are to be on your hearts. Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up."

Faith is not a compartment of family life—it is meant to permeate everything.

When you sit at home. When you walk along the road. When you lie down. When you get up. Every ordinary moment is an opportunity to impress faith on your children.

This does not mean constant preaching. It means making God part of normal conversation, weaving faith into everyday life.`,
      reflection_questions: [
        'How naturally does faith come up in your family conversations?',
        'What ordinary moments could become faith-building opportunities?',
        'Is faith compartmentalized or integrated in your home?'
      ],
      prayer_focus: 'Father, help us make faith natural in our home. Open our eyes to everyday opportunities. Give us words to share You in ordinary moments. Make You the center of our family life. Amen.'
    },
    {
      day_number: 3,
      title: 'The Power of Family Worship',
      scripture_refs: [{ book: 'Joshua', chapter: 24, verseStart: 15, verseEnd: 15 }, { book: 'Psalm', chapter: 78, verseStart: 4, verseEnd: 7 }],
      content: `"But as for me and my household, we will serve the Lord."

Family worship does not require perfection. It requires intentionality.

It can be as simple as reading a Bible passage together, praying before bed, singing a song of praise, or discussing what God is teaching each person.

The goal is not religious performance. It is creating rhythms where your family encounters God together. Start small. Be consistent.`,
      reflection_questions: [
        'Does your family have any worship rhythms together?',
        'What simple practice could you start this week?',
        'What obstacles keep you from family worship?'
      ],
      prayer_focus: 'Lord, help us worship You as a family. Give us creative ideas that fit our season of life. Overcome our obstacles. Let our home be filled with praise. Amen.'
    },
    {
      day_number: 4,
      title: 'Praying as a Family',
      scripture_refs: [{ book: 'Matthew', chapter: 18, verseStart: 19, verseEnd: 20 }, { book: 'Acts', chapter: 1, verseStart: 14, verseEnd: 14 }],
      content: `"Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven. For where two or three gather in my name, there am I with them."

When your family prays together, Jesus is present in a special way.

Family prayer teaches children that God is real, that He hears, that He acts. It creates a culture of dependence on God rather than self-reliance.

Pray together at meals. Pray at bedtime. Pray when problems arise. Let your children hear you pray—and hear them pray.`,
      reflection_questions: [
        'How often does your family pray together?',
        'Do your children hear you pray?',
        'What situations could become family prayer opportunities?'
      ],
      prayer_focus: 'Father, make us a praying family. Help us bring everything to You together. Let our children learn to pray by hearing us pray. Be present when we gather in Your name. Amen.'
    },
    {
      day_number: 5,
      title: 'Grace in the Home',
      scripture_refs: [{ book: 'Ephesians', chapter: 4, verseStart: 32, verseEnd: 32 }, { book: 'Colossians', chapter: 3, verseStart: 13, verseEnd: 13 }],
      content: `"Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you."

Grace must be practiced at home. It is easy to extend grace to strangers while being harsh with family.

Your home should be the safest place to fail—a place where confession is met with forgiveness, where mistakes are covered with love, where no one has to be perfect.

Children who experience grace at home understand the grace of God.`,
      reflection_questions: [
        'Is your home a place of grace or judgment?',
        'How do you respond when family members fail?',
        'What would a more grace-filled home look like?'
      ],
      prayer_focus: 'Lord, fill our home with grace. Help us forgive quickly. Let our children experience grace through us so they understand Your grace. Make our home safe for imperfection. Amen.'
    },
    {
      day_number: 6,
      title: 'Speaking Words of Life',
      scripture_refs: [{ book: 'Proverbs', chapter: 18, verseStart: 21, verseEnd: 21 }, { book: 'Ephesians', chapter: 4, verseStart: 29, verseEnd: 29 }],
      content: `"The tongue has the power of life and death." "Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up according to their needs."

Words shape families. The words spoken in your home either build up or tear down.

Speak words of encouragement, affirmation, and blessing. Tell your spouse you love them. Tell your children you are proud of them. Speak life.

What you say—and how you say it—forms the atmosphere of your home.`,
      reflection_questions: [
        'What words characterize your home?',
        'Do your family members feel built up by your words?',
        'What would you like to hear more in your home?'
      ],
      prayer_focus: 'Father, guard our tongues. Help us speak life, not death. Fill our home with encouraging words. Let our children grow up hearing affirmation and blessing. Amen.'
    },
    {
      day_number: 7,
      title: 'Discipline with Love',
      scripture_refs: [{ book: 'Proverbs', chapter: 22, verseStart: 6, verseEnd: 6 }, { book: 'Ephesians', chapter: 6, verseStart: 4, verseEnd: 4 }],
      content: `"Start children off on the way they should go, and even when they are old they will not turn from it." "Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord."

Discipline is an act of love. Children need boundaries, correction, and training.

But discipline without love produces rebellion. The goal is not control but formation—shaping hearts, not just behavior.

Bring them up in the training and instruction of the Lord. Point to God, not just rules.`,
      reflection_questions: [
        'Is your discipline motivated by love or frustration?',
        'Do you focus on behavior modification or heart formation?',
        'How can you connect discipline to the gospel?'
      ],
      prayer_focus: 'Lord, give us wisdom to discipline well. Help us train hearts, not just control behavior. Let our correction point our children to You. Amen.'
    },
    {
      day_number: 8,
      title: 'The Marriage Foundation',
      scripture_refs: [{ book: 'Ephesians', chapter: 5, verseStart: 25, verseEnd: 28 }, { book: 'Proverbs', chapter: 5, verseStart: 18, verseEnd: 19 }],
      content: `"Husbands, love your wives, just as Christ loved the church and gave himself up for her."

If you are married, your marriage is the foundation of your family. Children are more secure when parents love each other well.

Your marriage is also the primary model of love your children will see. How you treat your spouse teaches them about relationships.

Invest in your marriage. It is one of the best things you can do for your children.`,
      reflection_questions: [
        'How is the health of your marriage affecting your family?',
        'What are your children learning about love from watching you?',
        'What investment does your marriage need right now?'
      ],
      prayer_focus: 'Lord, strengthen our marriage. Help us love each other well. Let our children see a healthy example of love. Protect what You have joined together. Amen.'
    },
    {
      day_number: 9,
      title: 'Time Together',
      scripture_refs: [{ book: 'Ecclesiastes', chapter: 3, verseStart: 1, verseEnd: 1 }, { book: 'Psalm', chapter: 127, verseStart: 3, verseEnd: 5 }],
      content: `"There is a time for everything, and a season for every activity under the heavens." "Children are a heritage from the LORD, offspring a reward from him."

Quantity of time matters. You cannot build deep relationships in the margins.

The world will pull your family in a thousand directions. Sports, activities, work, screens—all competing for your time together.

Guard family time fiercely. Say no to good things so you can say yes to the best thing.`,
      reflection_questions: [
        'How much unhurried time do you spend together as a family?',
        'What is stealing time from your family?',
        'What activities might you need to cut to protect family time?'
      ],
      prayer_focus: 'Father, help us protect time together. Give us wisdom to say no to lesser things. Show us what to cut. Make our time together count. Amen.'
    },
    {
      day_number: 10,
      title: 'Technology Boundaries',
      scripture_refs: [{ book: 'Proverbs', chapter: 4, verseStart: 23, verseEnd: 23 }, { book: 'Philippians', chapter: 4, verseStart: 8, verseEnd: 8 }],
      content: `"Above all else, guard your heart, for everything you do flows from it."

Technology is a powerful tool that can connect or divide your family. Without intentional boundaries, screens steal presence and expose hearts to harm.

What is coming into your home through devices? What conversations are not happening because everyone is looking at a screen?

Set boundaries. Create screen-free times. Monitor content. Model healthy technology use.`,
      reflection_questions: [
        'How is technology affecting your family connections?',
        'What boundaries exist for screens in your home?',
        'What changes would help your family be more present with each other?'
      ],
      prayer_focus: 'Lord, give us wisdom with technology. Help us set healthy boundaries. Protect our hearts and our childrens hearts from harmful content. Restore presence in our home. Amen.'
    },
    {
      day_number: 11,
      title: 'Teaching Values',
      scripture_refs: [{ book: 'Proverbs', chapter: 2, verseStart: 1, verseEnd: 5 }, { book: 'Isaiah', chapter: 54, verseStart: 13, verseEnd: 13 }],
      content: `"My son, if you accept my words and store up my commands within you... then you will understand the fear of the LORD and find the knowledge of God."

Values are caught more than taught. But they are also taught.

Intentionally teach your children what you believe and why. Explain the reasoning behind your family rules. Discuss moral issues. Let them see you wrestle with ethical decisions.

Do not outsource their moral education to the culture. Proactively shape their values.`,
      reflection_questions: [
        'What values are you intentionally teaching your children?',
        'Do your children know WHY you believe what you believe?',
        'What value conversations need to happen in your home?'
      ],
      prayer_focus: 'Father, help us teach Your values intentionally. Give us wisdom to explain our beliefs. Let our children understand the fear of the Lord and find knowledge of You. Amen.'
    },
    {
      day_number: 12,
      title: 'Serving Together',
      scripture_refs: [{ book: 'Galatians', chapter: 5, verseStart: 13, verseEnd: 14 }, { book: 'Matthew', chapter: 20, verseStart: 26, verseEnd: 28 }],
      content: `"Serve one another humbly in love." "Whoever wants to become great among you must be your servant."

Families that serve together grow together. Service breaks the pattern of self-focus and teaches children to look beyond themselves.

Find ways to serve as a family—help a neighbor, volunteer together, sponsor a child, visit the elderly. Make generosity a family value.

Service done together creates shared purpose and lasting memories.`,
      reflection_questions: [
        'How does your family serve others together?',
        'What service opportunity could you try as a family?',
        'Are your children learning to look beyond themselves?'
      ],
      prayer_focus: 'Lord, make us a serving family. Open our eyes to needs around us. Help us serve together and find joy in generosity. Build servant hearts in our children. Amen.'
    },
    {
      day_number: 13,
      title: 'Handling Conflict Well',
      scripture_refs: [{ book: 'James', chapter: 1, verseStart: 19, verseEnd: 20 }, { book: 'Ephesians', chapter: 4, verseStart: 26, verseEnd: 27 }],
      content: `"Everyone should be quick to listen, slow to speak and slow to become angry, because human anger does not produce the righteousness that God desires."

Conflict is inevitable in families. How you handle it determines whether it destroys or strengthens relationships.

Quick to listen. Slow to speak. Slow to anger. This is the pathway to healthy conflict resolution.

Do not let the sun go down on your anger. Resolve issues quickly. Model reconciliation for your children.`,
      reflection_questions: [
        'How does your family typically handle conflict?',
        'What patterns of conflict need to change?',
        'Are you modeling healthy conflict resolution for your children?'
      ],
      prayer_focus: 'Father, teach us to handle conflict well. Help us listen more than we speak. Keep us from destructive anger. Let our children see reconciliation modeled. Amen.'
    },
    {
      day_number: 14,
      title: 'Building Family Traditions',
      scripture_refs: [{ book: 'Exodus', chapter: 12, verseStart: 26, verseEnd: 27 }, { book: 'Deuteronomy', chapter: 6, verseStart: 20, verseEnd: 21 }],
      content: `"And when your children ask you, 'What does this ceremony mean to you?' then tell them..."

God gave Israel traditions—Passover, feasts, festivals—as teaching tools. When children asked what they meant, parents told the story of faith.

What traditions mark your family? Holidays, birthdays, weekly rhythms, annual events—these create memory and meaning.

Build traditions that point to faith. Create moments your children will remember and pass on.`,
      reflection_questions: [
        'What traditions does your family have?',
        'Do any of your traditions intentionally point to faith?',
        'What new tradition could you create?'
      ],
      prayer_focus: 'Lord, help us build meaningful traditions. Give us creativity to create moments that point to You. Let these become stories of faith passed to the next generation. Amen.'
    },
    {
      day_number: 15,
      title: 'Faith in Difficult Times',
      scripture_refs: [{ book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 }, { book: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 }],
      content: `"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."

Difficult times are faith-building times. How your family responds to trials shapes your childrens understanding of faith.

Do not hide struggle from your children. Let them see you trust God in difficulty. Let them hear you pray when things are hard. Process pain together through the lens of faith.

Trials either strengthen or weaken family faith. Choose to let them strengthen.`,
      reflection_questions: [
        'How has your family responded to recent difficulties?',
        'Do your children see you trust God in trials?',
        'What trial could become a faith-building opportunity?'
      ],
      prayer_focus: 'Father, help us glorify You in difficult times. Let our children see authentic faith under pressure. Use our trials to strengthen our family. Amen.'
    },
    {
      day_number: 16,
      title: 'Extended Family Witness',
      scripture_refs: [{ book: 'Acts', chapter: 16, verseStart: 31, verseEnd: 31 }, { book: '1 Timothy', chapter: 5, verseStart: 8, verseEnd: 8 }],
      content: `"Believe in the Lord Jesus, and you will be saved—you and your household."

Your faith can influence your extended family—grandparents, siblings, cousins, in-laws.

This does not mean preaching at every gathering. It means living authentically, loving well, and being available when questions arise.

Pray for unsaved family members. Love them consistently. Let your life and family be a witness.`,
      reflection_questions: [
        'How does your extended family view your faith?',
        'Which family members need prayer for salvation?',
        'How can you be a better witness to your relatives?'
      ],
      prayer_focus: 'Lord, use our family as a witness to our extended family. Save those who do not yet know You. Give us wisdom to love without preaching. Let our life point them to You. Amen.'
    },
    {
      day_number: 17,
      title: 'Church Involvement',
      scripture_refs: [{ book: 'Hebrews', chapter: 10, verseStart: 24, verseEnd: 25 }, { book: 'Acts', chapter: 2, verseStart: 42, verseEnd: 42 }],
      content: `"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing."

Your family needs the church, and the church needs your family.

Being connected to a church body provides community, accountability, teaching, and support. Children need to see faith lived out by more than just their parents.

Make church involvement a priority, not an option.`,
      reflection_questions: [
        'How connected is your family to a local church?',
        'Are you giving to the church, not just receiving?',
        'What would deeper church involvement look like for your family?'
      ],
      prayer_focus: 'Father, connect our family deeply to Your church. Help us contribute, not just consume. Let our children see faith lived out in community. Amen.'
    },
    {
      day_number: 18,
      title: 'Teaching Biblical Literacy',
      scripture_refs: [{ book: '2 Timothy', chapter: 3, verseStart: 14, verseEnd: 17 }, { book: 'Psalm', chapter: 119, verseStart: 105, verseEnd: 105 }],
      content: `"From infancy you have known the Holy Scriptures, which are able to make you wise for salvation through faith in Christ Jesus."

Timothy knew Scripture from infancy because someone taught him. That is your role with your children.

Read the Bible together. Tell the stories. Memorize verses. Help them navigate Scripture for themselves. Create biblical literacy that will guide them for life.

The Bible in your home is not enough. The Bible in their hearts is what counts.`,
      reflection_questions: [
        'How biblically literate are your children?',
        'Are you actively teaching them Scripture?',
        'What step can you take to increase biblical literacy in your home?'
      ],
      prayer_focus: 'Lord, help us teach our children the Scriptures. Make Your Word come alive in our home. Let the Bible shape their hearts from childhood. Amen.'
    },
    {
      day_number: 19,
      title: 'Praying for Your Children',
      scripture_refs: [{ book: 'Job', chapter: 1, verseStart: 5, verseEnd: 5 }, { book: 'Colossians', chapter: 1, verseStart: 9, verseEnd: 12 }],
      content: `"Early in the morning [Job] would sacrifice a burnt offering for each of [his children], thinking, 'Perhaps my children have sinned.' This was Job regular custom."

Job prayed regularly for his children—a spiritual covering over their lives.

Pray daily for your children. Pray for their salvation, their character, their future spouse, their calling, their protection. Wage spiritual warfare on their behalf.

Your prayers for your children may be the most powerful thing you do for them.`,
      reflection_questions: [
        'How consistently do you pray for your children?',
        'What specific things are you praying for each child?',
        'How can you make praying for your children a stronger habit?'
      ],
      prayer_focus: 'Father, I lift up my children to You. [Pray specifically for each child.] Protect them, guide them, draw them to Yourself. Let my prayers cover them all their days. Amen.'
    },
    {
      day_number: 20,
      title: 'Leaving a Legacy',
      scripture_refs: [{ book: 'Psalm', chapter: 78, verseStart: 4, verseEnd: 7 }, { book: 'Proverbs', chapter: 13, verseStart: 22, verseEnd: 22 }],
      content: `"We will tell the next generation the praiseworthy deeds of the LORD... so the next generation would know them, even the children yet to be born, and they in turn would tell their children."

Your faith is not just for you. It is meant to be passed on—to your children, your grandchildren, and generations beyond.

What legacy are you building? Not just financial, but spiritual. What stories of faith will be told after you are gone?

Think generationally. Build what will last.`,
      reflection_questions: [
        'What spiritual legacy are you building?',
        'What stories of faith do you want passed down?',
        'How are you thinking generationally about your faith?'
      ],
      prayer_focus: 'Lord, help us think beyond ourselves. Let our faith impact generations we will never meet. Build a legacy of faithfulness through our family. Amen.'
    },
    {
      day_number: 21,
      title: 'Starting Today',
      scripture_refs: [{ book: 'Hebrews', chapter: 3, verseStart: 13, verseEnd: 13 }, { book: 'James', chapter: 1, verseStart: 22, verseEnd: 22 }],
      content: `"But encourage one another daily, as long as it is called 'Today.'" "Do not merely listen to the word, and so deceive yourselves. Do what it says."

You have spent 21 days building a vision for family faith. Now it is time to act.

Do not let these truths remain ideas. Put them into practice. Start today. Start small. But start.

Your family is worth the investment. The next generation is counting on you. Build wisely. Build now.`,
      reflection_questions: [
        'What is the most important thing you have learned in these 21 days?',
        'What one step will you take this week?',
        'How will you stay accountable to build on what you have learned?'
      ],
      prayer_focus: 'Father, help us not just hear but do. We commit to building our family on You. Guide our next steps. Give us perseverance for the long journey. We dedicate our family to You. Amen.'
    }
  ]
};

// =====================================================
// ADVENT: WAITING IN HOPE - 25 Days (Seasonal)
// =====================================================
const ADVENT_WAITING_HOPE = {
  series: {
    slug: 'advent-waiting-hope',
    title: 'Advent: Waiting in Hope',
    description: 'A 25-day Advent journey preparing your heart for the celebration of Christ coming. Walk through the prophecies, the waiting, and the glorious fulfillment of the Incarnation.',
    total_days: 25,
    topics: ['advent', 'Christmas', 'hope', 'waiting', 'incarnation'],
    is_seasonal: true,
    season_start_month: 12,
    season_start_day: 1,
    difficulty_level: 'beginner',
  },
  days: [
    {
      day_number: 1,
      title: 'The Long-Awaited Promise',
      scripture_refs: [{ book: 'Isaiah', chapter: 9, verseStart: 6, verseEnd: 7 }],
      content: `"For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace."

Seven hundred years before Bethlehem, Isaiah spoke these words. A promise. A hope. A child who would change everything.

The people who first heard this prophecy lived in darkness—political turmoil, spiritual wandering, uncertain futures. Sound familiar? Into their darkness, God spoke light. Into their despair, He planted hope.

This Advent season, we join a story centuries in the making. We wait, as they waited. We hope, as they hoped. But we wait with knowledge they did not have—the promise has been kept.`,
      reflection_questions: [
        'What are you waiting for this season?',
        'How does ancient prophecy strengthen your faith today?',
        'Which name of Christ speaks most to your current situation?'
      ],
      prayer_focus: 'Lord, as I begin this Advent journey, prepare my heart to receive You anew. Help me wait with expectation. Let the ancient promises become fresh to my soul. Amen.'
    },
    {
      day_number: 2,
      title: 'A People in Darkness',
      scripture_refs: [{ book: 'Isaiah', chapter: 9, verseStart: 2, verseEnd: 2 }, { book: 'Matthew', chapter: 4, verseStart: 16, verseEnd: 16 }],
      content: `"The people walking in darkness have seen a great light; on those living in the land of deep darkness a light has dawned."

Darkness is more than absence of light. It is confusion, fear, lostness. The people of Israel knew this darkness intimately—exile, oppression, silence from heaven.

Matthew quotes Isaiah when describing where Jesus began His ministry. The same region that knew such darkness became the first to see the Light.

Advent acknowledges our darkness. We do not pretend everything is fine. We admit our need. And in admitting our need, we position ourselves to receive the Light that shatters every shadow.`,
      reflection_questions: [
        'What kind of darkness are you experiencing right now?',
        'How does admitting darkness prepare us for light?',
        'Where have you seen light break through in your life?'
      ],
      prayer_focus: 'Father, I acknowledge the darkness in and around me. I do not hide from it. Instead, I turn toward Your light. Dawn in my heart this season. Amen.'
    },
    {
      day_number: 3,
      title: 'The Prophets Spoke',
      scripture_refs: [{ book: 'Hebrews', chapter: 1, verseStart: 1, verseEnd: 2 }],
      content: `"In the past God spoke to our ancestors through the prophets at many times and in various ways, but in these last days he has spoken to us by his Son."

Before the Word became flesh, the Word came through prophets. Moses, Isaiah, Jeremiah, Micah—God spoke through imperfect messengers to reveal His perfect plan.

Each prophet added a piece to the puzzle. A suffering servant. A king from David line. Born in Bethlehem. Called out of Egypt. Betrayed for thirty silver pieces. The prophets painted a portrait centuries before the subject was born.

Advent invites us to trace the prophetic thread—to see how God weaves His story through generations.`,
      reflection_questions: [
        'How does fulfilled prophecy strengthen your trust in Scripture?',
        'What do the prophets teach us about how God works?',
        'How is God speaking to you in this season?'
      ],
      prayer_focus: 'Lord, You have always been speaking. Open my ears to hear Your voice today. Thank You for the prophets who prepared the way. Amen.'
    },
    {
      day_number: 4,
      title: 'The Line of David',
      scripture_refs: [{ book: '2 Samuel', chapter: 7, verseStart: 12, verseEnd: 13 }, { book: 'Matthew', chapter: 1, verseStart: 1, verseEnd: 1 }],
      content: `"I will raise up your offspring to succeed you... and I will establish the throne of his kingdom forever."

God made a covenant with David: his line would rule forever. At times this seemed impossible. The kingdom split. Exile came. The throne sat empty for centuries.

But God keeps His promises. Matthew opens his Gospel with genealogy—tracing Jesus through David, all the way to Abraham. The legal right to the throne passed through Joseph. The blood of David flowed through Mary.

Every name in that genealogy represents a life, a choice, a link in the chain. Some were faithful, others deeply flawed. Yet God worked through them all.`,
      reflection_questions: [
        'How does the genealogy of Jesus encourage you about your own story?',
        'What does it mean that God works through flawed people?',
        'How are you part of the chain passing faith to the next generation?'
      ],
      prayer_focus: 'Father, You are faithful through generations. You kept Your promise to David. Help me trust You with the long-term story of my life. Amen.'
    },
    {
      day_number: 5,
      title: 'The Unlikely Town',
      scripture_refs: [{ book: 'Micah', chapter: 5, verseStart: 2, verseEnd: 2 }],
      content: `"But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel, whose origins are from of old, from ancient times."

Bethlehem. Not Jerusalem. Not Rome. A tiny village so insignificant it barely registered on ancient maps.

God consistently chooses the small, the overlooked, the unlikely. He bypasses the obvious to do something only He could do. A virgin. A carpenter. A manger. A small town.

If you feel small or insignificant, take heart. God specializes in using what the world overlooks. Bethlehem teaches us that geography does not limit God—and neither does our smallness.`,
      reflection_questions: [
        'Why do you think God chose Bethlehem?',
        'Where do you feel small or overlooked?',
        'How might God be at work in the small places of your life?'
      ],
      prayer_focus: 'Lord, You chose the small and overlooked. You see me in my smallness. Use me in ways only You could accomplish. I trust Your unusual methods. Amen.'
    },
    {
      day_number: 6,
      title: 'A Virgin Shall Conceive',
      scripture_refs: [{ book: 'Isaiah', chapter: 7, verseStart: 14, verseEnd: 14 }, { book: 'Matthew', chapter: 1, verseStart: 22, verseEnd: 23 }],
      content: `"The virgin will conceive and give birth to a son, and will call him Immanuel."

Immanuel. God with us. Not God above us or God against us—God with us.

The virgin birth is miraculous and mysterious. It signals that what is about to happen cannot be accomplished by human effort. This child is not the result of human striving or planning. He is pure gift, pure grace, pure God.

Mary received what she could never produce. She carried what she could never create. This is the gospel in miniature—God doing for us what we cannot do for ourselves.`,
      reflection_questions: [
        'What does Immanuel—God with us—mean to you personally?',
        'How does the virgin birth point to salvation by grace?',
        'Where do you need to receive rather than produce?'
      ],
      prayer_focus: 'God, You came to be with us. Not distant, not removed—with us. Let that truth transform how I see every circumstance today. Amen.'
    },
    {
      day_number: 7,
      title: 'The Silence Between',
      scripture_refs: [{ book: 'Amos', chapter: 8, verseStart: 11, verseEnd: 12 }],
      content: `"The days are coming... when I will send a famine through the land—not a famine of food or a thirst for water, but a famine of hearing the words of the LORD."

Between Malachi and Matthew—four hundred years of silence. No prophets. No new Scripture. Just waiting.

Those centuries must have felt endless. Had God forgotten His promises? Was the hope of the Messiah just a fading dream?

But silence is not absence. God was working in the silence, setting the stage, moving pieces into place. Roman roads for the gospel to travel. Greek language for Scripture to spread. A Jewish diaspora creating synagogues in every city.

When God seems silent, He is often most active.`,
      reflection_questions: [
        'Have you experienced seasons of spiritual silence?',
        'What might God be doing in what feels like waiting?',
        'How can silence deepen faith rather than destroy it?'
      ],
      prayer_focus: 'Lord, in the silent seasons, help me trust. You were working for four hundred years. You are working now. Give me patience to wait. Amen.'
    },
    {
      day_number: 8,
      title: 'The Forerunner Announced',
      scripture_refs: [{ book: 'Luke', chapter: 1, verseStart: 11, verseEnd: 17 }],
      content: `"Do not be afraid, Zechariah; your prayer has been heard. Your wife Elizabeth will bear you a son, and you are to call him John."

The silence broke in an unexpected place—not the royal court but the temple, to an elderly priest whose wife was barren.

Zechariah and Elizabeth had stopped praying for a child. They had accepted their situation. Then Gabriel appeared with news: not just a son, but the one who would prepare the way for the Messiah.

Sometimes our waiting ends when we least expect it. Sometimes the answer comes to prayers we stopped praying years ago. God is never late, but He is rarely early.`,
      reflection_questions: [
        'What prayers have you stopped praying?',
        'How does the announcement to Zechariah encourage your waiting?',
        'What might it look like for God to answer old prayers in new ways?'
      ],
      prayer_focus: 'Father, You hear prayers I have forgotten. You remember what I have given up on. Renew my hope in Your timing. Amen.'
    },
    {
      day_number: 9,
      title: 'The Annunciation',
      scripture_refs: [{ book: 'Luke', chapter: 1, verseStart: 26, verseEnd: 38 }],
      content: `"Do not be afraid, Mary; you have found favor with God. You will conceive and give birth to a son, and you are to call him Jesus."

A teenage girl in a backwater town receives the most important message in human history. The angel does not ask if she is willing. He simply announces what God will do.

But he waits for her response.

Mary says yes to confusion, scandal, danger, and wonder. She says yes without knowing how or when or what it would cost. This is faith—saying yes to God before understanding the full picture.

"I am the Lord servant. May your word to me be fulfilled."`,
      reflection_questions: [
        'What is God asking you to say yes to?',
        'How do you respond when you do not understand the full plan?',
        'What does it mean to be a servant of the Lord?'
      ],
      prayer_focus: 'Lord, like Mary, I want to say yes. Even when I do not understand. Even when it costs. I am Your servant. May Your word be fulfilled in me. Amen.'
    },
    {
      day_number: 10,
      title: 'The Magnificat',
      scripture_refs: [{ book: 'Luke', chapter: 1, verseStart: 46, verseEnd: 55 }],
      content: `"My soul glorifies the Lord and my spirit rejoices in God my Savior."

Mary response to impossible news is worship. Not complaint. Not bargaining. Worship.

Her song—the Magnificat—echoes Hannah, the psalms, and the prophets. Mary knows her Scripture. She interprets her experience through the lens of what God has done before.

The Magnificat is revolutionary. God scatters the proud, brings down rulers, lifts the humble, fills the hungry. The baby in Mary womb will turn the world upside down.

Advent is not passive waiting. It is expectant worship, trusting that God is about to do what only He can do.`,
      reflection_questions: [
        'How does worship help you process unexpected circumstances?',
        'What themes in the Magnificat speak to your situation?',
        'How is knowing Scripture shaping how you interpret life?'
      ],
      prayer_focus: 'My soul glorifies You, Lord. Even in uncertainty, I choose to worship. You have done great things. You will do great things still. Amen.'
    },
    {
      day_number: 11,
      title: 'Joseph the Righteous',
      scripture_refs: [{ book: 'Matthew', chapter: 1, verseStart: 18, verseEnd: 25 }],
      content: `"Because Joseph her husband was faithful to the law, and yet did not want to expose her to public disgrace, he had in mind to divorce her quietly."

Joseph faced an impossible situation. His betrothed was pregnant, and he knew the child was not his. The law gave him grounds for public accusation. Mercy moved him toward quiet divorce.

Then the angel came: "Do not be afraid to take Mary home as your wife. What is conceived in her is from the Holy Spirit."

Joseph obeyed. He protected Mary, raised Jesus as his own, and modeled quiet faithfulness. Sometimes obedience means taking on burdens you did not create for purposes you do not fully understand.`,
      reflection_questions: [
        'How do you balance righteousness and mercy?',
        'What burdens are you carrying that you did not create?',
        'What does Joseph teach us about quiet obedience?'
      ],
      prayer_focus: 'Lord, give me Joseph courage—to obey when it is costly, to show mercy when I could demand justice, to trust when I do not understand. Amen.'
    },
    {
      day_number: 12,
      title: 'The Journey to Bethlehem',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 1, verseEnd: 5 }],
      content: `"In those days Caesar Augustus issued a decree that a census should be taken of the entire Roman world... So Joseph also went up from the town of Nazareth in Galilee to Judea, to Bethlehem."

Caesar thought he was moving the world. He was actually moving a pregnant teenager to fulfill a seven-hundred-year-old prophecy.

The ninety-mile journey from Nazareth to Bethlehem was grueling—especially for a woman near delivery. But God used even pagan emperors to accomplish His purposes.

Nothing in your life is outside God sovereignty. The inconveniences, the disruptions, the forced detours—God can use them all. What feels like chaos may be providence in disguise.`,
      reflection_questions: [
        'What disruptions in your life might God be using for His purposes?',
        'How does this story shape your view of world events?',
        'Where do you need to see providence in apparent chaos?'
      ],
      prayer_focus: 'Sovereign Lord, You move empires and individuals. Help me see Your hand in the disruptions of my life. Nothing surprises You. Amen.'
    },
    {
      day_number: 13,
      title: 'No Room',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 6, verseEnd: 7 }],
      content: `"While they were there, the time came for the baby to be born. She gave birth to her firstborn, a son. She wrapped him in cloths and placed him in a manger, because there was no guest room available for them."

No room. The King of the universe arrived to a world that had no space for Him.

The manger was a feeding trough for animals. The cloths were burial wrappings. From His first breath, Jesus identified with the lowest, the displaced, the unwelcome.

This was intentional. God did not accidentally end up in a stable. He chose it. He chose to enter our world at its most vulnerable point, to meet us where we actually are—not where we pretend to be.`,
      reflection_questions: [
        'What does Jesus birth in a stable tell you about His character?',
        'Where are you making room for Him this season?',
        'How does He meet you in your lowest places?'
      ],
      prayer_focus: 'Jesus, You had no room, yet You made room for me. Clear space in my crowded heart. I want to welcome You fully. Amen.'
    },
    {
      day_number: 14,
      title: 'Shepherds in the Night',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 8, verseEnd: 14 }],
      content: `"And there were shepherds living out in the fields nearby, keeping watch over their flocks at night. An angel of the Lord appeared to them."

Shepherds were outsiders—ritually unclean, unable to keep religious observances, their testimony inadmissible in court. They were the last people you would choose to announce a king.

But God chose them first.

Before the religious elite, before the powerful, before the educated—the good news came to working-class nobodies watching sheep in the dark. The gospel always starts at the margins and works inward.`,
      reflection_questions: [
        'Why do you think God chose shepherds as the first witnesses?',
        'Where do you see yourself in this story?',
        'How does Jesus coming to outsiders first shape your understanding of the gospel?'
      ],
      prayer_focus: 'Lord, You came to shepherds first. You come to the overlooked and outcast. Thank You for including me. Help me carry this good news to others. Amen.'
    },
    {
      day_number: 15,
      title: 'Glory to God',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 13, verseEnd: 14 }],
      content: `"Suddenly a great company of the heavenly host appeared with the angel, praising God and saying, 'Glory to God in the highest heaven, and on earth peace to those on whom his favor rests.'"

The sky tore open. The veil between heaven and earth grew thin. A multitude of angels could no longer contain their praise.

Heaven had been watching, waiting, anticipating this moment. When Jesus drew His first breath, all of heaven erupted. The hope of ages had arrived. The promise was flesh and blood.

This is what we celebrate. Not sentiment or tradition—the invasion of heaven into earth. God taking on skin.`,
      reflection_questions: [
        'What does it mean that heaven rejoiced at Jesus birth?',
        'How can your worship reflect heaven worship this season?',
        'Where do you need peace that only God favor can bring?'
      ],
      prayer_focus: 'Glory to You, God, in the highest! Let my life echo heaven song. Bring Your peace to my restless heart. Amen.'
    },
    {
      day_number: 16,
      title: 'They Went and Saw',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 15, verseEnd: 20 }],
      content: `"When the angels had left them and gone into heaven, the shepherds said to one another, 'Let us go to Bethlehem and see this thing that has happened, which the Lord has told us about.'"

The shepherds did not debate. They did not delay. They went.

They found everything exactly as the angel said—a baby wrapped in cloths, lying in a manger. Then they spread the word. They could not keep silent.

Encounter leads to action. Those who truly see Jesus cannot stay the same. They go, they see, they tell. The sequence matters: first we come, then we behold, then we share.`,
      reflection_questions: [
        'What is keeping you from going to Jesus?',
        'When did you last truly behold Him?',
        'Who needs to hear what you have seen?'
      ],
      prayer_focus: 'Lord, I want to go and see. Remove my delays and excuses. Let me behold You freshly and share freely. Amen.'
    },
    {
      day_number: 17,
      title: 'Mary Treasured',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 19, verseEnd: 19 }],
      content: `"But Mary treasured up all these things and pondered them in her heart."

Shepherds burst in with wild stories. Angels sang in the sky. Her son lay in a feeding trough. Mary response? She treasured. She pondered.

Not everything needs immediate interpretation. Some things must simply be held, turned over, allowed to deepen. Mary practiced sacred silence in the midst of holy chaos.

Advent invites us to the same posture. Not every question needs answering today. Some mysteries are meant to be treasured, not solved.`,
      reflection_questions: [
        'What are you treasuring and pondering this season?',
        'How can you create space for sacred silence?',
        'What mysteries are you holding without needing immediate answers?'
      ],
      prayer_focus: 'Lord, teach me to treasure and ponder. Give me Mary patience with mystery. Let me hold what I cannot yet understand. Amen.'
    },
    {
      day_number: 18,
      title: 'Simeon Waited',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 25, verseEnd: 32 }],
      content: `"Now there was a man in Jerusalem called Simeon, who was righteous and devout. He was waiting for the consolation of Israel, and the Holy Spirit was on him."

Simeon spent his life waiting. The Spirit had promised he would not die before seeing the Messiah. Day after day, year after year, he waited.

Then Mary and Joseph walked into the temple with a forty-day-old baby. Simeon knew. He took Jesus in his arms and blessed God: "My eyes have seen your salvation."

A lifetime of waiting fulfilled in one moment. This is the reward of patient hope—to hold the promise in your arms.`,
      reflection_questions: [
        'What promises are you waiting to see fulfilled?',
        'How does Simeon patience encourage your waiting?',
        'What would it mean to hold the salvation of God?'
      ],
      prayer_focus: 'Lord, like Simeon, I wait. Sustain my hope. Let me see Your salvation. I trust Your timing. Amen.'
    },
    {
      day_number: 19,
      title: 'Anna Never Left',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 36, verseEnd: 38 }],
      content: `"There was also a prophet, Anna... She was very old... She never left the temple but worshiped night and day, fasting and praying."

Anna was eighty-four, a widow for most of her life. She could have grown bitter. Instead, she grew devoted. The temple became her home, prayer her occupation, worship her lifestyle.

When she saw Jesus, she immediately gave thanks and spoke about Him to everyone waiting for redemption.

Faithful presence over decades prepared her for a moment of recognition. She saw what others missed because she had practiced seeing God her whole life.`,
      reflection_questions: [
        'What does Anna example teach about long-term faithfulness?',
        'How might consistent spiritual practices prepare you to recognize Jesus?',
        'Who needs to hear about the redemption you have found?'
      ],
      prayer_focus: 'Lord, give me Anna devotion. Let worship become my lifestyle. Prepare me through faithful presence to recognize You when You move. Amen.'
    },
    {
      day_number: 20,
      title: 'The Wise Men Journey',
      scripture_refs: [{ book: 'Matthew', chapter: 2, verseStart: 1, verseEnd: 2 }],
      content: `"After Jesus was born in Bethlehem in Judea, during the time of King Herod, Magi from the east came to Jerusalem and asked, 'Where is the one who has been born king of the Jews? We saw his star when it rose and have come to worship him.'"

Gentile scholars traveled hundreds of miles because they saw a star. They left comfort, risked danger, invested treasure—all to worship a king they had never met.

While Israel religious leaders could quote the prophecy about Bethlehem, they did not bother making the five-mile journey. Knowledge without pursuit is worthless.

The Wise Men remind us that seeking Jesus is worth any cost.`,
      reflection_questions: [
        'What has your pursuit of Jesus cost you?',
        'Where is the gap between knowing about Him and pursuing Him?',
        'What journey is He calling you to take?'
      ],
      prayer_focus: 'Lord, I want to be a seeker like the Magi. Make me willing to journey, to sacrifice, to pursue You at any cost. Amen.'
    },
    {
      day_number: 21,
      title: 'Gifts for a King',
      scripture_refs: [{ book: 'Matthew', chapter: 2, verseStart: 10, verseEnd: 11 }],
      content: `"When they saw the star, they were overjoyed. On coming to the house, they saw the child with his mother Mary, and they bowed down and worshiped him. Then they opened their treasures and presented him with gifts of gold, frankincense and myrrh."

Gold for a king. Frankincense for deity. Myrrh for burial. The gifts prophetically declared who Jesus is and what He came to do.

True worship involves giving. Not because God needs anything, but because giving expresses value. What we treasure reveals who we worship. The Magi gave their best to the one they recognized as Best.`,
      reflection_questions: [
        'What gifts are you bringing to Jesus this season?',
        'What do your treasures reveal about your worship?',
        'How can you give your best to Him?'
      ],
      prayer_focus: 'Lord, I bring You my gifts—my time, my resources, my heart. You are worthy of my best. Receive my worship. Amen.'
    },
    {
      day_number: 22,
      title: 'The Light Shines',
      scripture_refs: [{ book: 'John', chapter: 1, verseStart: 4, verseEnd: 5 }],
      content: `"In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it."

John Gospel does not begin in Bethlehem. It begins before time, in eternity, with the Word who was with God and was God.

This Word became flesh. The eternal entered time. The Creator became creature. Light invaded darkness—and darkness could not overcome it.

No matter how dark your world seems, the light has already won. Darkness is temporary. Light is eternal. This is the message of Advent.`,
      reflection_questions: [
        'What darkness are you trusting the light to overcome?',
        'How does the eternal nature of Jesus change how you see your temporary struggles?',
        'Where do you need to let His light shine?'
      ],
      prayer_focus: 'Light of the world, shine in my darkness. You have already won. Help me live in the victory that is already accomplished. Amen.'
    },
    {
      day_number: 23,
      title: 'Grace and Truth',
      scripture_refs: [{ book: 'John', chapter: 1, verseStart: 14, verseEnd: 14 }, { book: 'John', chapter: 1, verseStart: 17, verseEnd: 17 }],
      content: `"The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth."

Grace without truth is sentimentality. Truth without grace is cruelty. Jesus brings both in perfect balance.

He dwelt among us—the Greek word is tabernacled, like God presence in the wilderness tent. The glory that once filled the Holy of Holies now walked the streets, touched lepers, and wept at tombs.

This is the miracle of the Incarnation: the untouchable made Himself touchable. The invisible became visible. The Word became flesh.`,
      reflection_questions: [
        'How do you need both grace and truth in your life right now?',
        'What does it mean that God dwelt among us?',
        'Where have you seen His glory?'
      ],
      prayer_focus: 'Lord, You are full of grace and truth. Fill me with both. Let me see Your glory and reflect it to others. Amen.'
    },
    {
      day_number: 24,
      title: 'Christmas Eve: The Night Before',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 1, verseEnd: 7 }],
      content: `"And she gave birth to her firstborn son and wrapped him in swaddling cloths and laid him in a manger, because there was no place for them in the inn."

Tonight, two thousand years collapse into one moment. We stand with shepherds in the darkness. We wait with Mary through her labor. We watch with Joseph, helpless and hoping.

The wait is almost over.

Tomorrow we celebrate the hinge of history—the night God became a baby, the moment heaven touched earth, the fulfillment of every prophecy.

Take this night to be still. To remember. To prepare your heart for the morning celebration.`,
      reflection_questions: [
        'What is stirring in your heart this Christmas Eve?',
        'How has this Advent season prepared you for tomorrow?',
        'What will you carry from this journey into the new year?'
      ],
      prayer_focus: 'Lord, on this holy night, I wait. I remember. I prepare. Come, Lord Jesus. My heart is ready. Amen.'
    },
    {
      day_number: 25,
      title: 'Christmas Day: Joy to the World',
      scripture_refs: [{ book: 'Luke', chapter: 2, verseStart: 10, verseEnd: 11 }, { book: 'John', chapter: 3, verseStart: 16, verseEnd: 16 }],
      content: `"Do not be afraid. I bring you good news that will cause great joy for all the people. Today in the town of David a Savior has been born to you; he is the Messiah, the Lord."

Today is the day.

The waiting is over. The promise is fulfilled. The Savior has come. Jesus Christ—Messiah, Lord, Son of God, Son of Mary—is here.

This is not a baby to be merely admired. This is a King to be worshiped. This is God to be received. "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."

Joy to the world! The Lord has come!`,
      reflection_questions: [
        'What does Christmas mean to you today, at the end of this journey?',
        'How will you worship the King who has come?',
        'What is your response to such great love?'
      ],
      prayer_focus: 'Lord Jesus, You came. You really came. For me. For us. For all. I worship You today and forever. Joy to the world—You have come! Amen.'
    }
  ]
};

// =====================================================
// LENT: JOURNEY TO THE CROSS - 40 Days (Seasonal)
// =====================================================
const LENT_JOURNEY_CROSS = {
  series: {
    slug: 'lent-journey-cross',
    title: 'Lent: Journey to the Cross',
    description: 'A 40-day Lenten journey walking with Jesus from the wilderness to the empty tomb. Prepare your heart through reflection, repentance, and renewal.',
    total_days: 40,
    topics: ['Lent', 'Easter', 'cross', 'repentance', 'sacrifice'],
    is_seasonal: true,
    season_start_month: 2,
    season_start_day: 14,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'Ash Wednesday: Remember You Are Dust',
      scripture_refs: [{ book: 'Genesis', chapter: 3, verseStart: 19, verseEnd: 19 }, { book: 'Psalm', chapter: 103, verseStart: 14, verseEnd: 14 }],
      content: `"For dust you are and to dust you will return."

Lent begins with ashes—a stark reminder of our mortality. We are finite, fragile, dependent creatures. This is not morbid; it is honest.

When we acknowledge our dust, we make room for God. Pride insists we are self-sufficient. Humility admits we need a Savior.

For forty days, we will walk with Jesus toward Jerusalem, toward the cross, toward the tomb. The journey requires honesty about who we are—and hope in who He is.

You are dust. But you are dust that God loves enough to save.`,
      reflection_questions: [
        'What does remembering your mortality do to your priorities?',
        'Where has pride made you forget your dependence on God?',
        'What are you hoping God will do in your heart during these forty days?'
      ],
      prayer_focus: 'Lord, I am dust. I confess my mortality, my weakness, my need. Meet me in this season. Shape me as You shaped Adam from the earth. Amen.'
    },
    {
      day_number: 2,
      title: 'Into the Wilderness',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 1, verseEnd: 2 }],
      content: `"Then Jesus was led by the Spirit into the wilderness to be tempted by the devil. After fasting forty days and forty nights, he was hungry."

The Spirit led Jesus into the wilderness. Not away from difficulty but into it. The wilderness was preparation, not punishment.

Lent is our wilderness. We voluntarily enter a season of simplicity, fasting, and focused attention. We strip away distractions to hear God more clearly.

The wilderness is uncomfortable. But it is where Jesus was formed for ministry. It can form us too.`,
      reflection_questions: [
        'What is the Spirit leading you to give up or take on during Lent?',
        'How might discomfort be part of spiritual formation?',
        'What distractions need to be stripped away?'
      ],
      prayer_focus: 'Spirit, lead me into my wilderness. I trust that what seems barren can become fruitful. Form me for the work You have prepared. Amen.'
    },
    {
      day_number: 3,
      title: 'The Temptation of Bread',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 3, verseEnd: 4 }],
      content: `"The tempter came to him and said, 'If you are the Son of God, tell these stones to become bread.' Jesus answered, 'Man shall not live on bread alone, but on every word that comes from the mouth of God.'"

Satan attacked Jesus at His point of greatest physical need—hunger. The temptation was not merely about bread but about using divine power for personal comfort.

We face the same temptation daily. Will we meet our needs in our way, or trust God to provide in His way?

Jesus chose the Word over bread. He chose obedience over immediate satisfaction. This is the path of Lent.`,
      reflection_questions: [
        'What legitimate needs are you tempted to meet in illegitimate ways?',
        'How does Scripture become daily bread for you?',
        'Where is God asking you to trust His provision?'
      ],
      prayer_focus: 'Father, I am hungry for many things. Teach me that Your Word satisfies more deeply than any earthly bread. I choose to feast on You. Amen.'
    },
    {
      day_number: 4,
      title: 'The Temptation of Spectacle',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 5, verseEnd: 7 }],
      content: `"Then the devil took him to the holy city and had him stand on the highest point of the temple. 'If you are the Son of God,' he said, 'throw yourself down.'"

Satan quoted Scripture to manipulate. He invited Jesus to force God hand, to make a spectacle of divine protection.

We are tempted to test God too—to put ourselves in danger expecting rescue, to demand signs before we obey, to make our faith about what God does for us rather than who He is.

Jesus refused to test His Father. True faith trusts without demanding proof.`,
      reflection_questions: [
        'How have you been tempted to test God?',
        'What is the difference between trusting God and testing God?',
        'Where do you demand signs instead of simply obeying?'
      ],
      prayer_focus: 'Lord, I will not test You. I choose to trust without demanding proof. Your character is enough. Your Word is sufficient. Amen.'
    },
    {
      day_number: 5,
      title: 'The Temptation of Kingdoms',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 8, verseEnd: 10 }],
      content: `"Again, the devil took him to a very high mountain and showed him all the kingdoms of the world and their splendor. 'All this I will give you,' he said, 'if you will bow down and worship me.'"

Satan offered a shortcut—kingdoms without a cross. Power without suffering. Glory without sacrifice.

Jesus came to reclaim the kingdoms of this world, but not through compromise. The path to His throne went through Calvary, not around it.

We face the same temptation. Success without integrity. Influence without character. We can have it all—if we just bow to the wrong master.`,
      reflection_questions: [
        'What shortcuts tempt you away from faithful obedience?',
        'Where have you been offered success at the cost of your soul?',
        'What would it mean to worship God alone in your ambitions?'
      ],
      prayer_focus: 'God, You alone are worthy of worship. I reject every shortcut that compromises my allegiance. Your kingdom come, Your way, in Your time. Amen.'
    },
    {
      day_number: 6,
      title: 'Angels Attended Him',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 11, verseEnd: 11 }],
      content: `"Then the devil left him, and angels came and attended him."

After the battle, rest. After temptation, ministry. The wilderness ended with angelic care.

Jesus did not fight alone—and neither do we. When we resist temptation, heaven responds. The spiritual forces aligned against us are real, but so are those for us.

Sometimes the victory feels lonely. But it is not. Unseen help surrounds every faithful choice. Angels attend those who resist.`,
      reflection_questions: [
        'How does knowing angels attended Jesus encourage your resistance?',
        'What help has come after your moments of faithfulness?',
        'How might you be more aware of heavenly support?'
      ],
      prayer_focus: 'Lord, thank You for the help I cannot see. Open my eyes to Your angels. Strengthen me to resist, knowing I am not alone. Amen.'
    },
    {
      day_number: 7,
      title: 'The First Sunday: Repentance',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 17, verseEnd: 17 }, { book: 'Joel', chapter: 2, verseStart: 12, verseEnd: 13 }],
      content: `"From that time on Jesus began to preach, 'Repent, for the kingdom of heaven has come near.'"

Repentance is not merely feeling sorry. It is turning around—changing direction, changing allegiance, changing everything.

The kingdom of heaven has come near. This is good news that demands response. We cannot welcome the King while facing the wrong direction.

Lent is a season of turning. Away from sin. Away from self. Toward Christ. Toward cross. Toward resurrection.`,
      reflection_questions: [
        'What direction have you been facing?',
        'What specific areas need turning in your life?',
        'How is repentance good news rather than bad news?'
      ],
      prayer_focus: 'Lord, I turn. From sin to You. From self to service. From death to life. Help me keep turning, keep facing You. Amen.'
    },
    {
      day_number: 8,
      title: 'Follow Me',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 18, verseEnd: 20 }],
      content: `"'Come, follow me,' Jesus said, 'and I will send you out to fish for people.' At once they left their nets and followed him."

Two words changed everything: Follow me. Not "believe this doctrine" or "keep these rules." Follow me. Relationship. Movement. Life.

The disciples dropped their nets immediately. They did not negotiate or delay. When Jesus calls, hesitation is disobedience.

Lent asks us to examine our following. Are we still following, or have we settled down? Are we moving with Jesus, or just studying Him from a distance?`,
      reflection_questions: [
        'What nets have you been holding onto?',
        'Is your faith about following Jesus or just believing in Him?',
        'Where is Jesus inviting you to move?'
      ],
      prayer_focus: 'Jesus, I want to follow—not just believe. Show me what I need to leave behind. I will move where You lead. Amen.'
    },
    {
      day_number: 9,
      title: 'Blessed Are the Poor in Spirit',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 3, verseEnd: 3 }],
      content: `"Blessed are the poor in spirit, for theirs is the kingdom of heaven."

The Beatitudes turn everything upside down. The first blessing goes to the spiritually bankrupt—those who know they have nothing to offer God.

We prefer to come to God with something in our hands—good works, correct beliefs, moral achievements. But the kingdom belongs to empty hands.

Lent strips away our pretense of spiritual wealth. It reveals our poverty. And there, in our emptiness, we find the kingdom.`,
      reflection_questions: [
        'What spiritual wealth do you present to God?',
        'How does acknowledging spiritual poverty open you to grace?',
        'Where have you been proud instead of poor in spirit?'
      ],
      prayer_focus: 'Lord, I come with nothing. My hands are empty. Fill them with Your kingdom. Amen.'
    },
    {
      day_number: 10,
      title: 'Blessed Are Those Who Mourn',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 4, verseEnd: 4 }],
      content: `"Blessed are those who mourn, for they will be comforted."

Lent is a season for mourning—not despair, but honest grief over sin. We mourn what our sin has cost, what our rebellion has broken, what our selfishness has destroyed.

The world tells us to suppress negative emotions. Jesus blesses those who feel them fully. Mourning over sin is not weakness; it is the first step toward healing.

Those who mourn will be comforted. The grief is not permanent. Resurrection follows crucifixion.`,
      reflection_questions: [
        'What do you need to mourn during this season?',
        'How do you typically handle grief—suppress it or feel it?',
        'Where do you need the comfort only God can give?'
      ],
      prayer_focus: 'Lord, I mourn. Over my sin, my brokenness, the pain I have caused. Meet me in my grief. Bring the comfort You have promised. Amen.'
    },
    {
      day_number: 11,
      title: 'Blessed Are the Meek',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 5, verseEnd: 5 }],
      content: `"Blessed are the meek, for they will inherit the earth."

Meekness is not weakness. It is strength under control. Jesus was meek—and He overturned tables.

The meek do not grasp, grab, or fight for their rights. They trust that God will vindicate them. They know the earth is the Lord, and He gives it to whom He chooses.

In a world of aggressive self-promotion, meekness is revolutionary. It trusts God to lift up at the right time.`,
      reflection_questions: [
        'Where do you struggle to release control?',
        'What is the difference between meekness and weakness?',
        'How might trusting God vindication change how you respond to injustice?'
      ],
      prayer_focus: 'Lord, I release my grip. I trust You to vindicate, to promote, to give what is right. Make me meek like Jesus. Amen.'
    },
    {
      day_number: 12,
      title: 'Blessed Are Those Who Hunger',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 6, verseEnd: 6 }],
      content: `"Blessed are those who hunger and thirst for righteousness, for they will be filled."

Hunger is uncomfortable. Thirst is desperate. Jesus blesses those who feel this way about righteousness.

We often hunger for comfort, success, approval—anything but righteousness. But God responds to spiritual appetite. Those who truly want to be right with God will be satisfied.

Lent creates hunger. We fast from other things to awaken our appetite for the only thing that truly satisfies.`,
      reflection_questions: [
        'What do you most hunger for?',
        'How has fasting (from food or other things) affected your spiritual appetite?',
        'What would it look like to be desperately hungry for righteousness?'
      ],
      prayer_focus: 'Lord, I am hungry for the wrong things. Redirect my appetite. Make me desperate for righteousness. Fill me with Yourself. Amen.'
    },
    {
      day_number: 13,
      title: 'Blessed Are the Merciful',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 7, verseEnd: 7 }],
      content: `"Blessed are the merciful, for they will be shown mercy."

The measure we use will be measured to us. If we want mercy, we must give it.

Mercy is not ignoring wrong. It is choosing compassion over condemnation. It is remembering our own need for grace while dealing with those who have wronged us.

Jesus went to the cross not because we deserved it but because He is merciful. Lent reminds us of the mercy we have received—and calls us to extend it to others.`,
      reflection_questions: [
        'Who needs your mercy right now?',
        'Where have you been demanding justice when you should extend grace?',
        'How does receiving mercy enable giving mercy?'
      ],
      prayer_focus: 'Lord, I have received such mercy. Help me give what I have been given. Make me merciful as You are merciful. Amen.'
    },
    {
      day_number: 14,
      title: 'The Second Sunday: Purification',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 8, verseEnd: 8 }, { book: 'Psalm', chapter: 51, verseStart: 10, verseEnd: 10 }],
      content: `"Blessed are the pure in heart, for they will see God."

The pure in heart have undivided loyalties. They are not perfect but focused. Their desire is singular—to see God.

Sin clouds our vision. It creates cataracts on the soul. The more we indulge impurity, the less we see God.

Lent is purification. We remove what clouds our vision. We simplify our desires. We long for one thing: to see God face to face.`,
      reflection_questions: [
        'What divides your heart?',
        'How has sin affected your ability to see God?',
        'What needs to be purified in this season?'
      ],
      prayer_focus: 'Create in me a clean heart, O God. Remove the impurities that cloud my vision. I want to see You. Amen.'
    },
    {
      day_number: 15,
      title: 'Blessed Are the Peacemakers',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 9, verseEnd: 9 }],
      content: `"Blessed are the peacemakers, for they will be called children of God."

Peace is not passive. Peacemakers are active reconcilers. They enter conflict with the gospel of peace.

Jesus made peace through the cross. He reconciled enemies to God and to each other. When we make peace, we demonstrate our family resemblance.

Lent reveals where we have been war-makers instead of peacemakers. It exposes our conflicts and calls us to reconciliation.`,
      reflection_questions: [
        'Where have you been a war-maker?',
        'What relationship needs reconciliation?',
        'How is Jesus model of peacemaking different from mere conflict avoidance?'
      ],
      prayer_focus: 'Prince of Peace, make me a peacemaker. Show me where I have fueled conflict. Give me courage to reconcile. Amen.'
    },
    {
      day_number: 16,
      title: 'Blessed When Persecuted',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 10, verseEnd: 12 }],
      content: `"Blessed are those who are persecuted because of righteousness, for theirs is the kingdom of heaven."

The final beatitude is the hardest. Blessing comes through persecution. Joy comes through suffering.

Jesus did not promise His followers comfort. He promised them trouble—and the kingdom. The path of the disciple follows the path of the Master, through opposition to glory.

If we are never opposed, we may not be living distinctly enough. Persecution proves our difference.`,
      reflection_questions: [
        'Have you experienced opposition for your faith?',
        'Why might persecution be a sign of blessing?',
        'How does this beatitude change your view of difficulty?'
      ],
      prayer_focus: 'Lord, I do not seek persecution, but I will not avoid it. Give me courage to live distinctly, whatever the cost. Amen.'
    },
    {
      day_number: 17,
      title: 'Salt and Light',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 13, verseEnd: 16 }],
      content: `"You are the salt of the earth... You are the light of the world."

Jesus did not say we should be salt and light. He said we are. The question is whether we are being who we are.

Salt preserves and flavors. Light illuminates and guides. Both require contact—salt must touch food, light must shine out.

Lent examines our saltiness and brightness. Have we lost our flavor? Have we hidden our light? The world needs what we carry.`,
      reflection_questions: [
        'How are you being salt in your environment?',
        'Where has your light been hidden?',
        'What would it look like to be fully who Jesus says you are?'
      ],
      prayer_focus: 'Lord, I am salt and light because You made me so. Help me be who I am. Preserve, flavor, illuminate through me. Amen.'
    },
    {
      day_number: 18,
      title: 'Exceeding Righteousness',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 20, verseEnd: 20 }],
      content: `"For I tell you that unless your righteousness surpasses that of the Pharisees and the teachers of the law, you will certainly not enter the kingdom of heaven."

This is alarming. The Pharisees were the most righteous people around. How could anyone exceed them?

The answer is not more rules but deeper transformation. The Pharisees had external compliance but internal corruption. Jesus demands heart change.

Lent is not about doing more religious activities. It is about becoming different people. External practices serve internal transformation.`,
      reflection_questions: [
        'Where has your righteousness been merely external?',
        'What internal transformation does Jesus demand?',
        'How do Lenten practices serve heart change?'
      ],
      prayer_focus: 'Lord, I do not want surface righteousness. Transform my heart. Change me from the inside out. Amen.'
    },
    {
      day_number: 19,
      title: 'The Heart of Murder',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 21, verseEnd: 24 }],
      content: `"You have heard that it was said to the people long ago, 'You shall not murder'... But I tell you that anyone who is angry with a brother or sister will be subject to judgment."

Jesus goes to the root. Murder is just the fruit of anger. Address the root, and the fruit withers.

We congratulate ourselves for not committing physical violence while harboring hatred in our hearts. Jesus exposes our self-deception.

Lent examines our anger. Who have we written off? Who have we murdered in our thoughts while keeping our hands clean?`,
      reflection_questions: [
        'Who are you angry with?',
        'How does Jesus teaching change your view of your own innocence?',
        'What reconciliation does Jesus demand before worship?'
      ],
      prayer_focus: 'Lord, search my heart for anger. I confess my secret hatred. Help me reconcile before I worship. Amen.'
    },
    {
      day_number: 20,
      title: 'The Heart of Adultery',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 27, verseEnd: 30 }],
      content: `"You have heard that it was said, 'You shall not commit adultery.' But I tell you that anyone who looks at a woman lustfully has already committed adultery with her in his heart."

Again, Jesus goes to the heart. The act begins with the look. Guard the eyes, and you guard the body.

Jesus uses hyperbole—cut off your hand, gouge out your eye—to show how seriously we should take internal sin. Better to lose anything than to lose everything.

Lent invites radical honesty about our thought life. What do we harbor in private that we would never act on in public?`,
      reflection_questions: [
        'What do you need to cut off to protect your purity?',
        'How seriously do you take internal sin?',
        'Where have you been publicly pure but privately impure?'
      ],
      prayer_focus: 'Lord, I confess what I have harbored in secret. Give me radical willingness to cut off whatever leads me astray. Amen.'
    },
    {
      day_number: 21,
      title: 'The Third Sunday: Integrity',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 33, verseEnd: 37 }],
      content: `"All you need to say is simply 'Yes' or 'No'; anything beyond this comes from the evil one."

The Pharisees had elaborate systems for which oaths were binding. Jesus simplifies: just tell the truth. Always.

Integrity means our yes means yes. No qualifications. No hidden escape clauses. Our word is our bond because we live under God eye.

Lent examines our truthfulness. Where have we been deceptive? Where have we said yes when we meant no?`,
      reflection_questions: [
        'How reliable is your word?',
        'Where have you been less than fully honest?',
        'What would it look like to have complete integrity in speech?'
      ],
      prayer_focus: 'Lord, make my yes mean yes. Expose my deceptions. Build integrity in my speech and my heart. Amen.'
    },
    {
      day_number: 22,
      title: 'Turn the Other Cheek',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 38, verseEnd: 42 }],
      content: `"But I tell you, do not resist an evil person. If anyone slaps you on the right cheek, turn to them the other cheek also."

This is not weakness. It is a radical refusal to play by the world rules. When slapped, we refuse to retaliate.

Jesus modeled this on the cross. "When they hurled their insults at him, he did not retaliate." He absorbed the evil rather than returning it.

Lent asks: Can we absorb offense without returning it? Can we break the cycle of retaliation?`,
      reflection_questions: [
        'How do you typically respond to offense?',
        'What does turning the other cheek look like in your life?',
        'How did Jesus example challenge your understanding of strength?'
      ],
      prayer_focus: 'Lord, give me strength to absorb evil without returning it. Help me break the cycle. Make me like Jesus. Amen.'
    },
    {
      day_number: 23,
      title: 'Love Your Enemies',
      scripture_refs: [{ book: 'Matthew', chapter: 5, verseStart: 43, verseEnd: 48 }],
      content: `"But I tell you, love your enemies and pray for those who persecute you."

This is the impossible command. Love those who hate us. Pray for those who hurt us. Be perfect as the Father is perfect.

Jesus did not just teach this; He lived it. On the cross, He prayed for His executioners. He loved His enemies to death.

Lent confronts our hatred. Who is our enemy? Are we praying for them or against them?`,
      reflection_questions: [
        'Who are your enemies?',
        'What would it look like to genuinely pray for their good?',
        'How does the cross demonstrate enemy love?'
      ],
      prayer_focus: 'Lord, I name my enemies. [Pause.] I pray for them. Bless them. Draw them to You. Help me love as You love. Amen.'
    },
    {
      day_number: 24,
      title: 'Giving in Secret',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 1, verseEnd: 4 }],
      content: `"Be careful not to practice your righteousness in front of others to be seen by them... When you give to the needy, do not let your left hand know what your right hand is doing."

The audience of our obedience matters. Are we performing for people or for God?

Jesus assumes we will give. The question is motive. Secret giving proves our hearts are right—we do not need human applause.

Lent examines our motives. How much of our religion is performance? How much is genuine devotion?`,
      reflection_questions: [
        'Who is the audience of your obedience?',
        'What spiritual practices do you do in secret?',
        'How would your giving change if no one ever knew?'
      ],
      prayer_focus: 'Father, I want to live for Your eyes alone. Purify my motives. Let me serve You in secret, trusting You see. Amen.'
    },
    {
      day_number: 25,
      title: 'Praying in Secret',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 5, verseEnd: 8 }],
      content: `"But when you pray, go into your room, close the door and pray to your Father, who is unseen."

Prayer is not performance. It is private conversation with the Father who sees in secret.

The Pharisees prayed publicly for reputation. Jesus prayed privately for relationship. The closet prayer proves the genuineness of our devotion.

Lent calls us to the secret place. What happens there—away from any audience—reveals who we really are.`,
      reflection_questions: [
        'What is your private prayer life like?',
        'How is secret prayer different from public prayer?',
        'What does your closet time reveal about your relationship with God?'
      ],
      prayer_focus: 'Father, I come to the secret place. Here there is no audience but You. Hear me. Know me. Speak to me. Amen.'
    },
    {
      day_number: 26,
      title: 'The Lord Prayer: Part One',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 9, verseEnd: 10 }],
      content: `"Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven."

Jesus taught us to pray by starting with God—His name, His kingdom, His will. Before we bring our needs, we align our hearts.

"Our Father" establishes relationship. "In heaven" establishes reverence. We come as children to a holy King.

Lent reorients our prayer. Do we come to God with a list of demands, or do we come to worship first?`,
      reflection_questions: [
        'How does beginning with God glory change your prayers?',
        'What does it mean to hallow the name of God?',
        'Where do you need His will to be done instead of yours?'
      ],
      prayer_focus: 'Our Father in heaven, hallowed be Your name. Your kingdom come. Your will be done. I start with You, not me. Amen.'
    },
    {
      day_number: 27,
      title: 'The Lord Prayer: Part Two',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 11, verseEnd: 13 }],
      content: `"Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one."

After aligning with God priorities, we bring our needs. Daily provision. Forgiveness. Protection from evil.

Notice "us" not "me." Prayer is communal. We are connected to others who need bread, forgiveness, and protection.

Lent reminds us of dependence. Every day we need provision. Every day we need forgiveness. Every day we need deliverance.`,
      reflection_questions: [
        'What daily bread do you need?',
        'Who do you need to forgive to receive forgiveness?',
        'Where do you need deliverance from temptation?'
      ],
      prayer_focus: 'Lord, give us bread. Forgive us as we forgive. Lead us away from evil. We depend on You for everything. Amen.'
    },
    {
      day_number: 28,
      title: 'The Fourth Sunday: Fasting',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 16, verseEnd: 18 }],
      content: `"When you fast, do not look somber as the hypocrites do... But when you fast, put oil on your head and wash your face."

Jesus says "when" not "if." He assumes we will fast. The question is how.

Fasting is not about looking spiritual. It is about creating space for God. We say no to food (or something else) to say yes to deeper dependence.

Lent is traditionally a season of fasting. What are you fasting from? What are you fasting toward?`,
      reflection_questions: [
        'What is your experience with fasting?',
        'How can fasting be done without performance?',
        'What should you fast from to create space for God?'
      ],
      prayer_focus: 'Lord, teach me to fast. Not for performance but for presence. Create space in my life for more of You. Amen.'
    },
    {
      day_number: 29,
      title: 'Treasure in Heaven',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 19, verseEnd: 21 }],
      content: `"Do not store up for yourselves treasures on earth... But store up for yourselves treasures in heaven... For where your treasure is, there your heart will be also."

We invest where we value. Our bank statements reveal our hearts.

Jesus does not forbid having things. He forbids having our hearts captured by things. The test is not ownership but attachment.

Lent examines our treasures. What do we grip tightly? What would we struggle to release?`,
      reflection_questions: [
        'Where is your treasure?',
        'What reveals your heart priorities?',
        'How can you store treasure in heaven during Lent?'
      ],
      prayer_focus: 'Lord, my heart follows my treasure. Help me invest in what lasts. Loosen my grip on what fades. Amen.'
    },
    {
      day_number: 30,
      title: 'The Eye Is the Lamp',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 22, verseEnd: 23 }],
      content: `"The eye is the lamp of the body. If your eyes are healthy, your whole body will be full of light."

What we focus on shapes who we become. Healthy eyes—focused on God—fill us with light. Bad eyes—distracted by the world—fill us with darkness.

We are constantly choosing what to look at. Every glance is a decision. Every focus shapes our souls.

Lent asks: What are you looking at? What are you allowing into your eyes?`,
      reflection_questions: [
        'What do your eyes typically focus on?',
        'How does what you look at affect who you are becoming?',
        'What do you need to stop looking at?'
      ],
      prayer_focus: 'Lord, heal my eyes. Focus my vision on You. Fill my body with light by directing my gaze toward what is true and good. Amen.'
    },
    {
      day_number: 31,
      title: 'You Cannot Serve Two Masters',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 24, verseEnd: 24 }],
      content: `"No one can serve two masters. Either you will hate the one and love the other, or you will be devoted to the one and despise the other. You cannot serve both God and money."

We try to have it both ways. We want God and wealth. We attempt dual citizenship in heaven and earth.

Jesus says it cannot be done. Divided loyalty is no loyalty. At some point, we must choose.

Lent forces the question. Which master am I actually serving?`,
      reflection_questions: [
        'Who or what competes with God for your loyalty?',
        'Where have you tried to serve two masters?',
        'What would it look like to serve God alone?'
      ],
      prayer_focus: 'Lord, I choose You. I renounce every competing master. You alone are my Lord. Help me live that truth. Amen.'
    },
    {
      day_number: 32,
      title: 'Do Not Worry',
      scripture_refs: [{ book: 'Matthew', chapter: 6, verseStart: 25, verseEnd: 34 }],
      content: `"Therefore I tell you, do not worry about your life, what you will eat or drink; or about your body, what you will wear... But seek first his kingdom and his righteousness, and all these things will be given to you as well."

Worry is practical atheism. It acts as if God cannot or will not provide.

Jesus points to birds and flowers—provided for without anxiety. Are we not more valuable than they?

The antidote to worry is priority. Seek first the kingdom. When that is settled, everything else finds its place.`,
      reflection_questions: [
        'What are you worrying about?',
        'How does worry reveal misplaced trust?',
        'What would it look like to seek first the kingdom?'
      ],
      prayer_focus: 'Lord, I give You my worries. I choose to seek Your kingdom first. I trust You to provide what I need. Amen.'
    },
    {
      day_number: 33,
      title: 'Do Not Judge',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 1, verseEnd: 5 }],
      content: `"Do not judge, or you too will be judged... Why do you look at the speck of sawdust in your brother eye and pay no attention to the plank in your own eye?"

We are experts at seeing others faults and blind to our own. Jesus calls us hypocrites for this.

This does not forbid discernment. It forbids the arrogance of judging others while ignoring our own sin.

Lent turns the spotlight inward. Before examining anyone else, we examine ourselves.`,
      reflection_questions: [
        'Who have you been judging?',
        'What planks are in your own eye?',
        'How does self-examination change how you see others?'
      ],
      prayer_focus: 'Lord, I confess my judgmentalism. Show me my own planks. Help me address my sin before critiquing others. Amen.'
    },
    {
      day_number: 34,
      title: 'Ask, Seek, Knock',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 7, verseEnd: 11 }],
      content: `"Ask and it will be given to you; seek and you will find; knock and the door will be opened to you."

God invites persistence. Ask, seek, knock—present tense, continuous action. Keep asking. Keep seeking. Keep knocking.

This is not manipulation but relationship. A good Father responds to His children requests. How much more will our heavenly Father give good gifts?

Lent is a season of intensified asking. What do you need from God?`,
      reflection_questions: [
        'What have you stopped asking for?',
        'How does knowing God as Father affect your asking?',
        'What doors need your persistent knocking?'
      ],
      prayer_focus: 'Father, I ask. I seek. I knock. You are good, and You give good gifts. I trust Your response. Amen.'
    },
    {
      day_number: 35,
      title: 'The Fifth Sunday: The Narrow Gate',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 13, verseEnd: 14 }],
      content: `"Enter through the narrow gate. For wide is the gate and broad is the road that leads to destruction, and many enter through it. But small is the gate and narrow the road that leads to life, and only a few find it."

Two gates. Two roads. Two destinations. The easy path leads to destruction. The difficult path leads to life.

Lent is practice for the narrow road. We say no to comfort and ease. We choose discipline over indulgence.

Few find the narrow gate because few are willing to be constricted. But life—real life—lies on the other side.`,
      reflection_questions: [
        'Which road are you on?',
        'What does the narrow gate look like in your life?',
        'Why is the narrow way worth it?'
      ],
      prayer_focus: 'Lord, I choose the narrow gate. It is hard, but it leads to life. Give me strength to stay on the difficult path. Amen.'
    },
    {
      day_number: 36,
      title: 'By Their Fruit',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 15, verseEnd: 20 }],
      content: `"By their fruit you will recognize them. Do people pick grapes from thornbushes, or figs from thistles?"

Trees are known by their fruit. So are people. What we produce reveals what we are.

This is not about perfection but direction. What patterns mark our lives? What grows from our presence?

Lent examines our fruit. Not just our beliefs or intentions—our actual fruit. What has our life produced?`,
      reflection_questions: [
        'What fruit has your life produced?',
        'How do you evaluate your own tree?',
        'What fruit do you want to produce going forward?'
      ],
      prayer_focus: 'Lord, make me a good tree. Let my life produce fruit that honors You. Prune what is unfruitful. Cultivate what is good. Amen.'
    },
    {
      day_number: 37,
      title: 'Lord, Lord',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 21, verseEnd: 23 }],
      content: `"Not everyone who says to me, 'Lord, Lord,' will enter the kingdom of heaven, but only the one who does the will of my Father who is in heaven."

This is sobering. Religious words are not enough. Even miracles are not enough. What matters is doing the Father will.

Many will be surprised on judgment day. They thought they knew Jesus. He will say, "I never knew you."

Lent asks the terrifying question: Does Jesus know me? Not do I know about Him—does He know me?`,
      reflection_questions: [
        'Is your faith about words or actions?',
        'What is the difference between knowing about Jesus and being known by Him?',
        'What is the Father will that you need to do?'
      ],
      prayer_focus: 'Lord, I do not want to be surprised. Search me. Know me. Show me if my faith is real. I want to do Your will. Amen.'
    },
    {
      day_number: 38,
      title: 'The Wise and Foolish Builders',
      scripture_refs: [{ book: 'Matthew', chapter: 7, verseStart: 24, verseEnd: 27 }],
      content: `"Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock."

Hearing is not enough. The fool hears and does nothing. The wise person hears and builds on what they have heard.

Both houses faced the same storm. The difference was the foundation. When the storm came, only the rock stood.

Lent is building season. We hear Jesus words. Now we must put them into practice.`,
      reflection_questions: [
        'What words of Jesus have you heard but not practiced?',
        'What is the foundation of your life?',
        'What storms are testing your foundation?'
      ],
      prayer_focus: 'Lord, I want to be wise. Help me not just hear Your words but build on them. Make my foundation rock-solid. Amen.'
    },
    {
      day_number: 39,
      title: 'Holy Week Begins: Triumphal Entry',
      scripture_refs: [{ book: 'Matthew', chapter: 21, verseStart: 1, verseEnd: 11 }],
      content: `"The crowds that went ahead of him and those that followed shouted, 'Hosanna to the Son of David! Blessed is he who comes in the name of the Lord!'"

Jesus entered Jerusalem to crowds shouting Hosanna. They thought He came to conquer Rome. He came to conquer death.

The same crowds would shout "Crucify!" within days. Adoration turned to accusation. The triumphal entry led to the tomb.

Holy Week compresses the journey. In days, we move from hosanna to crucify to "He is risen!" Enter the story. Feel its weight.`,
      reflection_questions: [
        'How do you respond to Jesus as King?',
        'What does the crowd fickleness teach you about human nature?',
        'How will you walk with Jesus through Holy Week?'
      ],
      prayer_focus: 'Hosanna! Blessed is He who comes in the name of the Lord! Jesus, I receive You as my King—not for what You do for me, but for who You are. Amen.'
    },
    {
      day_number: 40,
      title: 'Into the Darkness',
      scripture_refs: [{ book: 'Matthew', chapter: 27, verseStart: 45, verseEnd: 46 }, { book: 'Matthew', chapter: 27, verseStart: 50, verseEnd: 51 }],
      content: `"From noon until three in the afternoon darkness came over all the land. About three in the afternoon Jesus cried out in a loud voice, 'My God, my God, why have you forsaken me?'"

Darkness fell. The Son experienced separation from the Father. The weight of the world sin crushed Him.

This is where the journey leads—to the cross, to the darkness, to the cry of abandonment. Before resurrection comes death. Before glory comes suffering.

Lent has brought us here. We watch. We wait. We mourn. Tomorrow, we will celebrate. But today, we sit in the darkness with our Lord.`,
      reflection_questions: [
        'What does Jesus cry of abandonment mean for your salvation?',
        'How does sitting in the darkness of Friday prepare you for Sunday?',
        'What has this Lenten journey taught you?'
      ],
      prayer_focus: 'Lord Jesus, You entered darkness for me. You were forsaken so I would never be. I wait in the darkness, trusting the light will come. Thank You. Amen.'
    }
  ]
};

// =====================================================
// DISCIPLESHIP & OBEDIENCE - 30 Days (Advanced)
// =====================================================
const DISCIPLESHIP_OBEDIENCE = {
  series: {
    slug: 'discipleship-obedience',
    title: 'Discipleship: The Cost of Following',
    description: 'A 30-day deep dive into what it truly means to follow Jesus. Explore the cost, the commitment, and the joy of radical obedience.',
    total_days: 30,
    topics: ['discipleship', 'obedience', 'commitment', 'following Jesus', 'surrender'],
    is_seasonal: false,
    difficulty_level: 'advanced',
  },
  days: [
    {
      day_number: 1,
      title: 'The Call to Follow',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 19, verseEnd: 20 }],
      content: `"Come, follow me," Jesus said, "and I will send you out to fish for people." At once they left their nets and followed him.

Jesus did not invite the disciples to a seminar. He did not ask them to subscribe to a newsletter or sign a doctrinal statement. He said, "Follow me."

Following is active. It requires movement. It means going where Jesus goes, even when we do not know the destination. The disciples did not ask for a map or a job description. They simply followed.

For the next thirty days, we will explore what it means to follow Jesus—the cost, the commitment, the transformation, and the joy.`,
      reflection_questions: [
        'What did you leave behind when you began following Jesus?',
        'Is your Christianity more about believing doctrines or following a person?',
        'What would it mean to follow Jesus today—literally, practically?'
      ],
      prayer_focus: 'Lord Jesus, I want to follow You—not just believe in You from a distance. Show me what following means today. I am ready to move. Amen.'
    },
    {
      day_number: 2,
      title: 'Counting the Cost',
      scripture_refs: [{ book: 'Luke', chapter: 14, verseStart: 28, verseEnd: 33 }],
      content: `"Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost to see if you have enough money to complete it?"

Jesus did not want impulsive followers who would quit when things got hard. He wanted people who understood what they were signing up for.

Discipleship is costly. It costs our preferences, our comfort, our autonomy, potentially our relationships, career, reputation—sometimes our very lives. Jesus laid this out clearly. He was not running a recruitment campaign promising easy benefits.

Have you counted the cost? Do you know what following Jesus will require?`,
      reflection_questions: [
        'What has following Jesus cost you so far?',
        'What might it cost you in the future that you have been avoiding?',
        'Why did Jesus want followers to count the cost before committing?'
      ],
      prayer_focus: 'Lord, I count the cost—and I choose You anyway. Whatever following requires, I say yes in advance. Help me not turn back. Amen.'
    },
    {
      day_number: 3,
      title: 'Deny Yourself',
      scripture_refs: [{ book: 'Matthew', chapter: 16, verseStart: 24, verseEnd: 25 }],
      content: `"Whoever wants to be my disciple must deny themselves and take up their cross and follow me. For whoever wants to save their life will lose it, but whoever loses their life for me will find it."

Self-denial is not popular. We live in a culture of self-actualization, self-care, self-expression. Denying yourself sounds like psychological damage.

But Jesus knew something: the self we cling to is not our truest self. When we deny the false self—the one built on ego, fear, and selfish ambition—we discover the self God designed us to be.

Losing your life for Jesus is not destruction. It is liberation.`,
      reflection_questions: [
        'What does self-denial look like in your daily life?',
        'What part of yourself are you most reluctant to deny?',
        'How is losing your life actually finding it?'
      ],
      prayer_focus: 'Lord, I deny myself. I lay down my agenda, my rights, my demands. Show me my true self—the one hidden in You. Amen.'
    },
    {
      day_number: 4,
      title: 'Take Up Your Cross',
      scripture_refs: [{ book: 'Luke', chapter: 9, verseStart: 23, verseEnd: 23 }],
      content: `"Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me."

The cross was not jewelry in the first century. It was an instrument of execution. To take up your cross meant walking to your own death.

Jesus calls us to daily death—death to self, death to sin, death to the world approval. This is not morbid; it is the only path to resurrection life.

What cross is Jesus asking you to carry today?`,
      reflection_questions: [
        'What does taking up your cross look like daily?',
        'Where do you need to die to self today?',
        'How does daily cross-bearing lead to resurrection life?'
      ],
      prayer_focus: 'Lord, I take up my cross today. I choose death to self so I can experience resurrection power. Make me a daily cross-bearer. Amen.'
    },
    {
      day_number: 5,
      title: 'First Allegiance',
      scripture_refs: [{ book: 'Luke', chapter: 14, verseStart: 26, verseEnd: 27 }],
      content: `"If anyone comes to me and does not hate father and mother, wife and children, brothers and sisters—yes, even their own life—such a person cannot be my disciple."

This is hard teaching. Jesus used the word "hate" to make His point unmistakable: He must be first. Not second to family. Not equal with loved ones. First.

This does not mean we stop loving our families. It means that when loyalty conflicts arise, Jesus wins. Always. No relationship, however precious, can take the place that belongs to Him alone.

Where does Jesus rank in your actual allegiance—not your stated beliefs, but your lived priorities?`,
      reflection_questions: [
        'Who or what competes with Jesus for your primary allegiance?',
        'How have you compromised obedience to Jesus for the sake of family expectations?',
        'What would first allegiance to Jesus look like in your specific situation?'
      ],
      prayer_focus: 'Lord Jesus, I give You first place. Above family, above my own life. I love them because I love You first. Amen.'
    },
    {
      day_number: 6,
      title: 'Leave Everything',
      scripture_refs: [{ book: 'Luke', chapter: 5, verseStart: 11, verseEnd: 11 }, { book: 'Luke', chapter: 5, verseStart: 28, verseEnd: 28 }],
      content: `"So they pulled their boats up on shore, left everything and followed him."

"And Levi got up, left everything and followed him."

The pattern is consistent. Following Jesus requires leaving. Leaving nets, boats, tax booths, old identities, comfortable arrangements.

Not everyone is called to literal poverty. But everyone is called to hold everything loosely. Nothing can be so precious that we would not release it if Jesus asked.

What are you holding too tightly?`,
      reflection_questions: [
        'What have you left to follow Jesus?',
        'What are you holding so tightly that you could not release it if asked?',
        'How does leaving everything demonstrate trust?'
      ],
      prayer_focus: 'Lord, I leave everything. My hands are open. Whatever You ask me to release, I will. You are worth more than anything I hold. Amen.'
    },
    {
      day_number: 7,
      title: 'Week One Reflection: The Cost',
      scripture_refs: [{ book: 'Philippians', chapter: 3, verseStart: 7, verseEnd: 8 }],
      content: `"But whatever were gains to me I now consider loss for the sake of Christ. What is more, I consider everything a loss because of the surpassing worth of knowing Christ Jesus my Lord."

Paul counted everything loss—his religious credentials, his social standing, his accomplishments. Not because he had to, but because knowing Christ was worth more.

This is the secret of joyful discipleship. When we see the surpassing worth of Jesus, the cost stops feeling like loss. It feels like gain.

Have you discovered the surpassing worth of knowing Christ?`,
      reflection_questions: [
        'What have you gained that now feels like loss compared to knowing Christ?',
        'How does seeing Jesus worth change your perspective on the cost?',
        'What is the surpassing worth of knowing Christ Jesus your Lord?'
      ],
      prayer_focus: 'Lord, You are worth everything. What I have given up is nothing compared to what I have gained. You are my surpassing treasure. Amen.'
    },
    {
      day_number: 8,
      title: 'Obedience Over Sacrifice',
      scripture_refs: [{ book: '1 Samuel', chapter: 15, verseStart: 22, verseEnd: 23 }],
      content: `"Does the LORD delight in burnt offerings and sacrifices as much as in obeying the LORD? To obey is better than sacrifice, and to heed is better than the fat of rams."

Saul thought he could substitute religious activity for direct obedience. He kept the best animals alive for sacrifice instead of destroying them as commanded. Surely God would appreciate extra offerings?

God did not appreciate it. He rejected Saul kingdom.

We make the same mistake. We substitute church attendance, Bible reading, even generosity for the specific obedience God requires. But nothing replaces doing what God said.`,
      reflection_questions: [
        'Where have you substituted religious activity for direct obedience?',
        'What specific command are you avoiding while doing other good things?',
        'Why is obedience better than sacrifice?'
      ],
      prayer_focus: 'Lord, I want to obey, not just sacrifice. Show me where I have substituted activity for obedience. I will do what You say. Amen.'
    },
    {
      day_number: 9,
      title: 'Immediate Obedience',
      scripture_refs: [{ book: 'Matthew', chapter: 4, verseStart: 20, verseEnd: 22 }],
      content: `"At once they left their nets and followed him... and immediately they left the boat and their father and followed him."

Notice the speed. At once. Immediately. The disciples did not ask for time to think about it, consult with others, or finish their current project. They obeyed immediately.

Delayed obedience is disobedience. When God speaks, He expects prompt response. Not "I will when I finish this." Not "Let me pray about it" (when we already know the answer). Now.

Where is God waiting for your immediate obedience?`,
      reflection_questions: [
        'What has God clearly told you that you have been delaying?',
        'Why do we struggle with immediate obedience?',
        'What would change if you obeyed God immediately instead of eventually?'
      ],
      prayer_focus: 'Lord, I will not delay. What You have shown me clearly, I will do today. No more waiting. Immediate obedience starts now. Amen.'
    },
    {
      day_number: 10,
      title: 'Complete Obedience',
      scripture_refs: [{ book: '1 Samuel', chapter: 15, verseStart: 3, verseEnd: 9 }],
      content: `"Now go, attack the Amalekites and totally destroy all that belongs to them." But Saul and the army spared Agag and the best of the sheep and cattle.

Saul obeyed—mostly. He attacked the Amalekites. He killed most of the people. He destroyed most of the livestock. But he kept the best for himself and spared the enemy king.

Partial obedience is disobedience. God does not grade on a curve. He does not say "good enough." He says, "Do all that I command."

Where is your obedience partial?`,
      reflection_questions: [
        'Where have you obeyed God mostly but not completely?',
        'What have you kept back while claiming obedience?',
        'Why is partial obedience still disobedience?'
      ],
      prayer_focus: 'Lord, I confess my partial obedience. I have done most of what You asked while keeping back what I wanted. I choose complete obedience. Amen.'
    },
    {
      day_number: 11,
      title: 'Costly Obedience',
      scripture_refs: [{ book: '2 Samuel', chapter: 24, verseStart: 24, verseEnd: 24 }],
      content: `"But the king replied to Araunah, 'No, I insist on paying you for it. I will not sacrifice to the LORD my God burnt offerings that cost me nothing.'"

David could have accepted the free offering. Araunah offered his threshing floor, oxen, and wood at no cost. But David understood: sacrifice that costs nothing is worth nothing.

Real obedience costs. If your discipleship has not cost you anything, you may not be truly following. Cheap grace produces no transformation.

What has your obedience cost you?`,
      reflection_questions: [
        'What has your obedience to God cost you recently?',
        'Where have you settled for costless Christianity?',
        'Why does sacrifice that costs nothing mean nothing?'
      ],
      prayer_focus: 'Lord, I will not offer You what costs me nothing. My obedience will be costly because You are worth the cost. Amen.'
    },
    {
      day_number: 12,
      title: 'Obedience in Small Things',
      scripture_refs: [{ book: 'Luke', chapter: 16, verseStart: 10, verseEnd: 10 }],
      content: `"Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much."

We want big assignments. Grand callings. Significant ministry. But God tests us in small things first.

Are you faithful with your time when no one is watching? Honest in minor financial matters? Kind in small interactions? Obedient in daily disciplines?

Small obedience leads to greater responsibility. Small disobedience disqualifies us from more.`,
      reflection_questions: [
        'How faithful are you in small daily obedience?',
        'What small areas of disobedience have you dismissed as unimportant?',
        'How does faithfulness in little prepare you for much?'
      ],
      prayer_focus: 'Lord, I will be faithful in small things. I will not despise the little obediences. Train me in the small before the large. Amen.'
    },
    {
      day_number: 13,
      title: 'Obedience Without Understanding',
      scripture_refs: [{ book: 'Genesis', chapter: 22, verseStart: 2, verseEnd: 3 }],
      content: `"Then God said, 'Take your son, your only son, whom you love—Isaac—and go to the region of Moriah. Sacrifice him there as a burnt offering.' Early the next morning Abraham got up..."

Abraham did not understand. This command contradicted everything God had promised. Yet Abraham obeyed—early the next morning. No delay despite confusion.

Sometimes God asks things that make no sense. We do not see the outcome. We cannot understand the purpose. Will we obey anyway?

Abraham discovered that God provides when we obey without understanding.`,
      reflection_questions: [
        'Has God ever asked you to do something you did not understand?',
        'How did you respond to confusing commands?',
        'What does Abraham example teach about obedience without understanding?'
      ],
      prayer_focus: 'Lord, I will obey even when I do not understand. You see what I cannot. I trust Your commands even when they confuse me. Amen.'
    },
    {
      day_number: 14,
      title: 'Week Two Reflection: The Pattern of Obedience',
      scripture_refs: [{ book: 'John', chapter: 14, verseStart: 15, verseEnd: 15 }, { book: 'John', chapter: 14, verseStart: 23, verseEnd: 24 }],
      content: `"If you love me, keep my commands." "Anyone who loves me will obey my teaching. My Father will love them, and we will come to them and make our home with them."

Jesus makes the connection explicit: love and obedience are inseparable. We cannot claim to love Jesus while ignoring what He says. Obedience is not the opposite of relationship; it is the evidence of it.

When we obey, something amazing happens: the Father and Son make their home with us. Obedience opens the door to deeper intimacy.`,
      reflection_questions: [
        'How does obedience demonstrate love?',
        'Where has disobedience created distance in your relationship with God?',
        'What does it mean for the Father and Son to make their home with you?'
      ],
      prayer_focus: 'Lord, I love You—and I will prove it by obeying. Come make Your home with me. My obedience opens the door. Amen.'
    },
    {
      day_number: 15,
      title: 'Learning from Jesus',
      scripture_refs: [{ book: 'Matthew', chapter: 11, verseStart: 29, verseEnd: 30 }],
      content: `"Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls. For my yoke is easy and my burden is light."

A yoke joins two animals together. When we take Jesus yoke, we are joined to Him in work. We go where He goes. We pull what He pulls. We learn by walking alongside Him.

Disciples are learners. We never graduate from Jesus school. We never stop needing His teaching, correction, and guidance.

Are you still learning from Jesus, or have you stopped growing?`,
      reflection_questions: [
        'What has Jesus taught you recently?',
        'Where have you stopped learning and started coasting?',
        'How does being yoked to Jesus make the burden light?'
      ],
      prayer_focus: 'Lord, I take Your yoke. I want to learn from You—not just about You. Make me a lifelong learner in Your school. Amen.'
    },
    {
      day_number: 16,
      title: 'Abiding in Christ',
      scripture_refs: [{ book: 'John', chapter: 15, verseStart: 4, verseEnd: 5 }],
      content: `"Remain in me, as I also remain in you. No branch can bear fruit by itself; it must remain in the vine. Neither can you bear fruit unless you remain in me."

Abiding is not visiting. It is making your home. It is constant connection, not occasional contact. The branch does not work to produce fruit; it simply stays connected to the vine.

Much of our striving comes from disconnection. We try to manufacture in our effort what only comes through abiding. Fruitfulness flows from intimacy, not activity.`,
      reflection_questions: [
        'What does abiding in Christ look like practically for you?',
        'Where have you been striving instead of abiding?',
        'How does connection to the vine produce fruit?'
      ],
      prayer_focus: 'Lord, I abide in You. Not visiting occasionally but making my home in Your presence. Bear fruit through my connection to You. Amen.'
    },
    {
      day_number: 17,
      title: 'Pruning for Fruitfulness',
      scripture_refs: [{ book: 'John', chapter: 15, verseStart: 2, verseEnd: 2 }],
      content: `"He cuts off every branch in me that bears no fruit, while every branch that does bear fruit he prunes so that it will be even more fruitful."

Pruning hurts. God cuts away what seems valuable—opportunities, relationships, activities—to make us more fruitful. We do not always understand His cuts.

But the Gardener knows what He is doing. He is not punishing; He is preparing. Every cut has a purpose. Every loss leads to greater gain.

What is God pruning from your life right now?`,
      reflection_questions: [
        'What has God pruned from your life?',
        'How did painful cutting lead to greater fruitfulness?',
        'What might God be preparing to prune next?'
      ],
      prayer_focus: 'Lord, I trust Your pruning. Cut away what hinders fruitfulness. I will not resist Your shears. Make me more fruitful. Amen.'
    },
    {
      day_number: 18,
      title: 'Bearing Much Fruit',
      scripture_refs: [{ book: 'John', chapter: 15, verseStart: 8, verseEnd: 8 }],
      content: `"This is to my Father glory, that you bear much fruit, showing yourselves to be my disciples."

Disciples produce. Not through straining and striving, but through abiding. The fruit proves the connection. The harvest glorifies the Gardener.

What fruit should we expect? Galatians tells us: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control. These are the evidence of discipleship.

Is your life producing fruit that glorifies the Father?`,
      reflection_questions: [
        'What fruit is your life producing?',
        'Which fruit of the Spirit is most evident? Least?',
        'How does your fruitfulness glorify the Father?'
      ],
      prayer_focus: 'Father, bear much fruit through me. Not for my reputation but for Your glory. Let my life prove I am Your disciple. Amen.'
    },
    {
      day_number: 19,
      title: 'Sent as He Was Sent',
      scripture_refs: [{ book: 'John', chapter: 20, verseStart: 21, verseEnd: 21 }],
      content: `"Again Jesus said, 'Peace be with you! As the Father has sent me, I am sending you.'"

Disciples are not just learners; they are sent ones. Jesus did not gather followers to keep them in a holy huddle. He trained them to be deployed.

How was Jesus sent? With purpose. With power. With sacrifice. With love. We are sent the same way—not to build our platforms but to extend His kingdom.

Where is Jesus sending you?`,
      reflection_questions: [
        'Where has Jesus sent you?',
        'How does being sent change your understanding of discipleship?',
        'What does it mean to be sent as Jesus was sent?'
      ],
      prayer_focus: 'Lord, send me. I am not here to be comfortable but to be deployed. Show me my mission. I am ready to go. Amen.'
    },
    {
      day_number: 20,
      title: 'Making Disciples',
      scripture_refs: [{ book: 'Matthew', chapter: 28, verseStart: 19, verseEnd: 20 }],
      content: `"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you."

The Great Commission is not make converts but make disciples. There is a difference. Converts believe; disciples follow. Converts pray a prayer; disciples embark on a journey.

Disciples make disciples. We are not meant to be the end of the chain but a link in it. Who are you discipling?`,
      reflection_questions: [
        'Who is discipling you?',
        'Who are you discipling?',
        'What is the difference between making converts and making disciples?'
      ],
      prayer_focus: 'Lord, make me a disciple-maker. Give me someone to invest in. Let the chain continue through me. Amen.'
    },
    {
      day_number: 21,
      title: 'Week Three Reflection: Connected and Sent',
      scripture_refs: [{ book: 'John', chapter: 17, verseStart: 18, verseEnd: 18 }],
      content: `"As you sent me into the world, I have sent them into the world."

Jesus prayed this over His disciples—and over us. We are sent ones. Not tourists visiting the world but missionaries deployed into it.

But we are not sent alone. We go connected to the vine, empowered by the Spirit, backed by the throne of heaven. We go as Jesus went—with all authority given to us.

You are sent. Live like it.`,
      reflection_questions: [
        'How does knowing you are sent change your daily life?',
        'What has kept you from living as a sent one?',
        'How does connection to Jesus empower your mission?'
      ],
      prayer_focus: 'Lord, I am sent. Remind me daily that I am on mission. Help me live as a sent one, connected to You and deployed for Your purposes. Amen.'
    },
    {
      day_number: 22,
      title: 'Suffering for His Name',
      scripture_refs: [{ book: 'Acts', chapter: 5, verseStart: 41, verseEnd: 41 }],
      content: `"The apostles left the Sanhedrin, rejoicing because they had been counted worthy of suffering disgrace for the Name."

The apostles were beaten for preaching Jesus. Their response? Joy. They considered suffering an honor—proof that they were real disciples.

We avoid suffering at all costs. They rejoiced in it. This is the upside-down kingdom where loss is gain, death is life, and suffering is privilege.

Are you willing to suffer for His name?`,
      reflection_questions: [
        'Have you ever suffered for being a Christian?',
        'How did you respond to opposition?',
        'What would it mean to count suffering an honor?'
      ],
      prayer_focus: 'Lord, if suffering comes, help me rejoice. Count me worthy of bearing Your disgrace. I will not shrink from the cost. Amen.'
    },
    {
      day_number: 23,
      title: 'Persevering Under Trial',
      scripture_refs: [{ book: 'James', chapter: 1, verseStart: 2, verseEnd: 4 }],
      content: `"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."

Trials test our faith. They reveal whether we truly believe what we say we believe. They expose weak foundations and strengthen genuine ones.

Perseverance does not come without resistance. Muscles grow under load. Faith grows under trial. The testing produces something we cannot get any other way.`,
      reflection_questions: [
        'What trial is currently testing your faith?',
        'How has perseverance through difficulty strengthened you?',
        'Why can we consider trials joy?'
      ],
      prayer_focus: 'Lord, I choose joy in trial. Use this testing to produce perseverance. Finish the work You started in me. Amen.'
    },
    {
      day_number: 24,
      title: 'Enduring to the End',
      scripture_refs: [{ book: 'Matthew', chapter: 24, verseStart: 13, verseEnd: 13 }],
      content: `"But the one who stands firm to the end will be saved."

Discipleship is not a sprint; it is a marathon. Starting well matters, but finishing matters more. Many begin the journey; fewer complete it.

Standing firm means not quitting when it gets hard. Not drifting when you get bored. Not compromising when the pressure mounts. Endurance is the mark of true disciples.

Will you stand firm to the end?`,
      reflection_questions: [
        'What tempts you to quit following Jesus?',
        'How do you maintain endurance over the long haul?',
        'What does standing firm look like in your current season?'
      ],
      prayer_focus: 'Lord, help me stand firm to the end. I will not quit, drift, or compromise. Strengthen me for the long obedience. Amen.'
    },
    {
      day_number: 25,
      title: 'Running the Race',
      scripture_refs: [{ book: 'Hebrews', chapter: 12, verseStart: 1, verseEnd: 2 }],
      content: `"Let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us, fixing our eyes on Jesus."

Running requires stripping down. Everything that hinders—even good things—must go. Sin that entangles must be thrown off, not managed.

But we do not run by willpower alone. We fix our eyes on Jesus. He ran His race to the finish. He endured the cross. He sits at the right hand. Looking at Him, we find strength to run.`,
      reflection_questions: [
        'What is hindering your race?',
        'What sin easily entangles you?',
        'How does fixing your eyes on Jesus give you strength?'
      ],
      prayer_focus: 'Lord, I throw off every hindrance. I strip down to run free. I fix my eyes on You—pioneer and perfecter of my faith. Amen.'
    },
    {
      day_number: 26,
      title: 'The Fellowship of Suffering',
      scripture_refs: [{ book: 'Philippians', chapter: 3, verseStart: 10, verseEnd: 11 }],
      content: `"I want to know Christ—yes, to know the power of his resurrection and participation in his sufferings, becoming like him in his death."

Paul wanted resurrection power—but he understood it came through participation in suffering. You cannot have the power without the path.

Fellowship with Christ includes fellowship in His suffering. When we suffer for Him, with Him, we enter a deeper knowing. Pain becomes pathway to intimacy.`,
      reflection_questions: [
        'Have you experienced fellowship with Christ through suffering?',
        'Why does Paul connect resurrection power with suffering?',
        'What does becoming like Him in His death mean to you?'
      ],
      prayer_focus: 'Lord, I want to know You—including through suffering. Give me fellowship in Your sufferings. Lead me through death to resurrection. Amen.'
    },
    {
      day_number: 27,
      title: 'Not Ashamed',
      scripture_refs: [{ book: 'Romans', chapter: 1, verseStart: 16, verseEnd: 16 }],
      content: `"For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes."

Shame silences disciples. Fear of what others think keeps us quiet. Concern for reputation makes us blend in.

But Paul was not ashamed. The gospel that seemed foolish to Greeks and offensive to Jews was his glory. He proclaimed it boldly because he knew its power.

Are you ashamed of the gospel?`,
      reflection_questions: [
        'When have you been tempted to hide your faith?',
        'What causes you shame about the gospel?',
        'How does knowing the gospel power overcome shame?'
      ],
      prayer_focus: 'Lord, I am not ashamed. The gospel is Your power. Give me boldness to proclaim it without apology. Amen.'
    },
    {
      day_number: 28,
      title: 'Week Four Reflection: Enduring Faith',
      scripture_refs: [{ book: '2 Timothy', chapter: 4, verseStart: 7, verseEnd: 8 }],
      content: `"I have fought the good fight, I have finished the race, I have kept the faith. Now there is in store for me the crown of righteousness."

Paul wrote this near the end of his life. No regrets. No looking back. He had fought, finished, and kept faith.

This is the goal of discipleship: to finish well. Not just start with enthusiasm but end with faithfulness. To hear, "Well done, good and faithful servant."

How do you want your race to end?`,
      reflection_questions: [
        'If your race ended today, how would it be remembered?',
        'What changes would help you finish well?',
        'What does keeping the faith mean to you?'
      ],
      prayer_focus: 'Lord, I want to finish well. Help me fight the good fight, complete the race, keep the faith. The crown awaits. Amen.'
    },
    {
      day_number: 29,
      title: 'The Joy Set Before Us',
      scripture_refs: [{ book: 'Hebrews', chapter: 12, verseStart: 2, verseEnd: 2 }],
      content: `"For the joy set before him he endured the cross, scorning its shame, and sat down at the right hand of the throne of God."

Jesus endured the cross for joy. Not joyless obligation but joyful anticipation. He saw beyond the suffering to the glory.

Discipleship is not drudgery. The cost is real, but so is the reward. There is joy set before us—the joy of His presence, His approval, His eternal kingdom.

Keep your eyes on the joy.`,
      reflection_questions: [
        'What joy is set before you?',
        'How does anticipating future joy help you endure present difficulty?',
        'What does Jesus reward look like to you?'
      ],
      prayer_focus: 'Lord, I see the joy ahead. It makes the cost worth bearing. I endure for the glory to come. Thank You for the joy set before me. Amen.'
    },
    {
      day_number: 30,
      title: 'Final Reflection: Worthy of the Calling',
      scripture_refs: [{ book: 'Ephesians', chapter: 4, verseStart: 1, verseEnd: 3 }],
      content: `"I urge you to live a life worthy of the calling you have received. Be completely humble and gentle; be patient, bearing with one another in love. Make every effort to keep the unity of the Spirit through the bond of peace."

We have been called to something magnificent—to follow Jesus, to bear His name, to continue His mission. This calling demands a worthy response.

Living worthy is not earning the calling; it is honoring it. We received grace; now we walk in a manner fitting the gift.

After thirty days of studying discipleship, the question remains: Will you live worthy of the calling?`,
      reflection_questions: [
        'What does living worthy of your calling look like?',
        'What has this 30-day journey taught you about discipleship?',
        'What one thing will you commit to as you move forward?'
      ],
      prayer_focus: 'Lord, I want to live worthy of Your calling. Not to earn it—I cannot—but to honor it. Help me walk in a manner fitting the grace I have received. I am Your disciple. Amen.'
    }
  ]
};

// =====================================================
// KNOWING GOD'S CHARACTER - 30 Days (Intermediate)
// =====================================================
const KNOWING_GODS_CHARACTER = {
  series: {
    slug: 'knowing-gods-character',
    title: 'Knowing God: His Character Revealed',
    description: 'A 30-day journey to know God more deeply through His character. Discover who God truly is—not just what He does, but who He is at His core.',
    total_days: 30,
    topics: ['God character', 'knowing God', 'theology', 'attributes', 'worship'],
    is_seasonal: false,
    difficulty_level: 'intermediate',
  },
  days: [
    {
      day_number: 1,
      title: 'The Invitation to Know God',
      scripture_refs: [{ book: 'Jeremiah', chapter: 9, verseStart: 23, verseEnd: 24 }],
      content: `"Let the one who boasts boast about this: that they have the understanding to know me, that I am the LORD, who exercises kindness, justice and righteousness on earth, for in these I delight."

What is your greatest boast? Your accomplishments? Your wisdom? Your connections?

God says the only worthy boast is knowing Him. Not knowing about Him—knowing Him. This is the highest pursuit of human life.

For the next thirty days, we will pursue the knowledge of God. Not abstract theology, but intimate knowledge of His character. This is what brings Him delight. This is what transforms us.`,
      reflection_questions: [
        'What do you tend to boast about?',
        'What is the difference between knowing about God and knowing God?',
        'What do you hope to discover about God in this journey?'
      ],
      prayer_focus: 'Lord, I want to know You—not just facts about You, but You. Open my heart to understand who You are. Let knowing You become my greatest pursuit. Amen.'
    },
    {
      day_number: 2,
      title: 'God Is Holy',
      scripture_refs: [{ book: 'Isaiah', chapter: 6, verseStart: 1, verseEnd: 5 }],
      content: `"Holy, holy, holy is the LORD Almighty; the whole earth is full of his glory."

Holiness is the only attribute of God repeated three times for emphasis. Not love, love, love. Not power, power, power. Holy, holy, holy.

Holiness means set apart, other, utterly unique. God is not a bigger version of us. He is categorically different. When Isaiah saw His holiness, he was undone—aware of his own unworthiness.

We have lost our sense of the holy. We approach God casually, as a buddy rather than the blazing, transcendent, awe-inspiring Holy One.`,
      reflection_questions: [
        'When did you last feel overwhelmed by God holiness?',
        'How has casual familiarity replaced holy awe in your worship?',
        'What does it mean that God is utterly other?'
      ],
      prayer_focus: 'Holy, holy, holy Lord, I approach You with reverence. You are not like me—You are infinitely higher, purer, greater. Restore my sense of Your holiness. Amen.'
    },
    {
      day_number: 3,
      title: 'God Is Love',
      scripture_refs: [{ book: '1 John', chapter: 4, verseStart: 8, verseEnd: 10 }],
      content: `"Whoever does not love does not know God, because God is love."

This is not saying God loves—though He does. It says God is love. Love is not just what He does; it is who He is. Every action flows from His loving nature.

But God love is not sentimental affection. It is holy love that pursues our good even when it hurts. It is sacrificial love that gave His Son. It is covenant love that will not let us go.

Knowing God means being transformed by love—receiving it and giving it.`,
      reflection_questions: [
        'How is God love different from human love?',
        'Where have you experienced God pursuing love?',
        'How does knowing God is love change how you approach Him?'
      ],
      prayer_focus: 'God, You are love. Not just loving—love itself. Let Your love penetrate my heart and transform how I relate to You and others. Amen.'
    },
    {
      day_number: 4,
      title: 'God Is Sovereign',
      scripture_refs: [{ book: 'Isaiah', chapter: 46, verseStart: 9, verseEnd: 10 }],
      content: `"I am God, and there is no other; I am God, and there is none like me. I make known the end from the beginning, from ancient times, what is still to come."

Sovereignty means God rules. Not just over some things, but over all things. Not just in heaven, but on earth. Not just in theory, but in fact.

This is both comforting and challenging. Comforting because nothing is out of His control. Challenging because we want to be in control ourselves.

Knowing God sovereignty means trusting that even what seems chaotic serves His purposes.`,
      reflection_questions: [
        'What areas of life are hardest to trust to God sovereignty?',
        'How does God ruling over all things comfort you?',
        'How does it challenge you?'
      ],
      prayer_focus: 'Sovereign Lord, You rule over all. I surrender my desire for control. Help me trust that Your purposes will prevail. Amen.'
    },
    {
      day_number: 5,
      title: 'God Is Faithful',
      scripture_refs: [{ book: 'Lamentations', chapter: 3, verseStart: 22, verseEnd: 23 }],
      content: `"Because of the LORD great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."

These words were written in the midst of disaster—Jerusalem destroyed, the temple burned, the people in exile. Yet Jeremiah could say: great is Your faithfulness.

God faithfulness does not depend on our circumstances. It is rooted in His character. He cannot be unfaithful because He cannot deny Himself.

Every morning is evidence: we are still here. His mercies are new. He has not given up on us.`,
      reflection_questions: [
        'How have you experienced God faithfulness?',
        'What makes it hard to believe in His faithfulness during difficulty?',
        'What would change if you truly trusted His faithfulness?'
      ],
      prayer_focus: 'Faithful God, Your mercies are new every morning. Thank You for not giving up on me. Help me trust Your faithfulness today. Amen.'
    },
    {
      day_number: 6,
      title: 'God Is Just',
      scripture_refs: [{ book: 'Deuteronomy', chapter: 32, verseStart: 4, verseEnd: 4 }],
      content: `"He is the Rock, his works are perfect, and all his ways are just. A faithful God who does no wrong, upright and just is he."

Justice is not popular when it applies to us. We prefer mercy for ourselves and justice for others. But God is perfectly just—He always does what is right.

This means we can trust His judgments. When life seems unfair, we can appeal to the Judge who sees all and wrongs no one.

It also means we need a Savior. We cannot stand before perfect justice on our own merit.`,
      reflection_questions: [
        'How do you respond to God justice—with comfort or fear?',
        'Where do you struggle with God justice in your life?',
        'How does the cross satisfy both justice and mercy?'
      ],
      prayer_focus: 'Just God, Your judgments are right and true. I cannot stand before You on my own. Thank You for providing a way through Jesus. Amen.'
    },
    {
      day_number: 7,
      title: 'Week One Reflection: The God We Worship',
      scripture_refs: [{ book: 'Psalm', chapter: 145, verseStart: 3, verseEnd: 3 }],
      content: `"Great is the LORD and most worthy of praise; his greatness no one can fathom."

This week we have glimpsed God holiness, love, sovereignty, faithfulness, and justice. We have barely scratched the surface—His greatness is unfathomable.

But we have learned enough to worship. When we know who God is, praise becomes inevitable. We worship not because we should but because we must. Encounter leads to adoration.

Let the God you are coming to know reshape your worship.`,
      reflection_questions: [
        'Which attribute of God spoke most powerfully to you this week?',
        'How has your understanding of God changed?',
        'How should knowing God character affect your worship?'
      ],
      prayer_focus: 'Lord, You are great and worthy of praise. What I have learned about You compels me to worship. You are beyond what I can fathom—and I adore You. Amen.'
    },
    {
      day_number: 8,
      title: 'God Is Merciful',
      scripture_refs: [{ book: 'Ephesians', chapter: 2, verseStart: 4, verseEnd: 5 }],
      content: `"But because of his great love for us, God, who is rich in mercy, made us alive with Christ even when we were dead in transgressions."

Mercy is not getting what we deserve. We deserved death; we received life. We deserved condemnation; we received adoption.

God is rich in mercy—not poor, not limited, but abundantly wealthy in compassion. He does not dole out mercy reluctantly. He lavishes it freely.

This is the character of our God: while we were dead, He made us alive.`,
      reflection_questions: [
        'What did you deserve that God mercy spared you from?',
        'How does being "rich in mercy" shape how you see God?',
        'Who needs you to extend the mercy you have received?'
      ],
      prayer_focus: 'Merciful Father, You gave me life when I deserved death. I receive Your rich mercy and ask for grace to show it to others. Amen.'
    },
    {
      day_number: 9,
      title: 'God Is Gracious',
      scripture_refs: [{ book: 'Exodus', chapter: 34, verseStart: 6, verseEnd: 7 }],
      content: `"The LORD, the LORD, the compassionate and gracious God, slow to anger, abounding in love and faithfulness."

When God revealed His name to Moses, these were the first words: compassionate and gracious. This is His self-description. This is who He wants us to know Him as.

Grace is getting what we do not deserve. We did not earn God favor; we received it freely. We cannot repay it; we can only receive it.

Knowing God as gracious changes everything—from striving to resting, from performing to receiving.`,
      reflection_questions: [
        'What grace have you received that you could never earn?',
        'How does knowing God is gracious affect how you approach Him?',
        'Where are you still trying to earn what God gives freely?'
      ],
      prayer_focus: 'Gracious God, You gave what I could never earn. Help me stop striving and start receiving. Let Your grace transform how I live. Amen.'
    },
    {
      day_number: 10,
      title: 'God Is Patient',
      scripture_refs: [{ book: '2 Peter', chapter: 3, verseStart: 9, verseEnd: 9 }],
      content: `"The Lord is not slow in keeping his promise, as some understand slowness. Instead he is patient with you, not wanting anyone to perish, but everyone to come to repentance."

God patience is not weakness or indecision. It is purposeful waiting. He delays judgment to extend opportunity.

Think of His patience with you—every time you stumbled, every time you wandered, every time you delayed obedience. He waited. He gave you another chance.

His patience is driven by love. He wants repentance, not destruction.`,
      reflection_questions: [
        'Where has God been patient with you?',
        'How might you have misunderstood His patience as indifference?',
        'Who needs your patience as God has been patient with you?'
      ],
      prayer_focus: 'Patient Lord, You have waited for me so many times. Thank You for not giving up. Help me extend to others the patience You show me. Amen.'
    },
    {
      day_number: 11,
      title: 'God Is Good',
      scripture_refs: [{ book: 'Psalm', chapter: 34, verseStart: 8, verseEnd: 8 }],
      content: `"Taste and see that the LORD is good; blessed is the one who takes refuge in him."

Goodness is not just what God does; it is what He is. He cannot do anything that is not good because goodness is His nature.

This does not mean everything feels good. Sometimes God goodness includes discipline, pruning, correction. But even these flow from His good intentions for us.

Tasting His goodness requires experience, not just study. We must take refuge in Him to know His goodness personally.`,
      reflection_questions: [
        'How have you tasted and seen that God is good?',
        'Where do you struggle to believe in His goodness?',
        'What would it look like to take deeper refuge in Him?'
      ],
      prayer_focus: 'Good Father, I have tasted Your goodness. Even when I do not understand, I trust You are good. Deepen my refuge in You. Amen.'
    },
    {
      day_number: 12,
      title: 'God Is Wise',
      scripture_refs: [{ book: 'Romans', chapter: 11, verseStart: 33, verseEnd: 34 }],
      content: `"Oh, the depth of the riches of the wisdom and knowledge of God! How unsearchable his judgments, and his paths beyond tracing out! Who has known the mind of the Lord? Or who has been his counselor?"

Human wisdom is limited. We see partially, understand incompletely, plan imperfectly. God wisdom is infinite. He sees all, knows all, and works all things according to His perfect plan.

When life confuses us, we can trust His wisdom. He is not making it up as He goes. He knows exactly what He is doing—even when we do not.`,
      reflection_questions: [
        'Where do you need to trust God wisdom instead of your understanding?',
        'How does God infinite wisdom comfort you in confusing times?',
        'What would it look like to seek His wisdom more intentionally?'
      ],
      prayer_focus: 'Wise God, Your understanding is beyond my comprehension. I trust Your wisdom when I cannot trace Your path. Guide me by Your infinite knowledge. Amen.'
    },
    {
      day_number: 13,
      title: 'God Is Powerful',
      scripture_refs: [{ book: 'Jeremiah', chapter: 32, verseStart: 17, verseEnd: 17 }],
      content: `"Ah, Sovereign LORD, you have made the heavens and the earth by your great power and outstretched arm. Nothing is too hard for you."

God spoke the universe into existence. He parted seas, stopped suns, raised the dead. Nothing is too hard for Him.

This is not just theological fact; it is personal promise. The God of infinite power is for you. The same power that created galaxies is available for your situation.

Whatever you face today, it is not too hard for Him.`,
      reflection_questions: [
        'What situation feels too hard right now?',
        'How does believing in God power change how you approach it?',
        'Where have you seen God power at work in your life?'
      ],
      prayer_focus: 'Almighty God, nothing is too hard for You. I bring my impossible situation to Your infinite power. Work mightily in ways I cannot imagine. Amen.'
    },
    {
      day_number: 14,
      title: 'Week Two Reflection: The God Who Acts',
      scripture_refs: [{ book: 'Psalm', chapter: 103, verseStart: 8, verseEnd: 8 }],
      content: `"The LORD is compassionate and gracious, slow to anger, abounding in love."

This week we have seen God in action—merciful, gracious, patient, good, wise, powerful. These are not abstract qualities but active attributes. God uses them on our behalf every day.

The God we are coming to know is not distant or passive. He is engaged, involved, working. His character shapes His actions, and His actions reveal His character.

This is the God who loves you.`,
      reflection_questions: [
        'Which attribute of God have you experienced most recently?',
        'How does seeing God as actively involved change your faith?',
        'How should His character shape your actions?'
      ],
      prayer_focus: 'Lord, You are not distant or passive. You act with compassion, grace, and power. Thank You for engaging in my life. Help me reflect Your character. Amen.'
    },
    {
      day_number: 15,
      title: 'God Is Present',
      scripture_refs: [{ book: 'Psalm', chapter: 139, verseStart: 7, verseEnd: 10 }],
      content: `"Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there."

God omnipresence means He is everywhere, always. Not just watching from afar but present with us. There is nowhere we can go—heights or depths, light or darkness—where He is not.

This truth comforts and convicts. Comforts because we are never alone. Convicts because nothing is hidden from His sight.

You are in His presence right now. Live accordingly.`,
      reflection_questions: [
        'When do you most need to remember God presence?',
        'How does His presence both comfort and challenge you?',
        'What would change if you lived constantly aware of His presence?'
      ],
      prayer_focus: 'Ever-present God, You are with me always—in the heights and depths. Help me live aware of Your presence every moment. Amen.'
    },
    {
      day_number: 16,
      title: 'God Is Near',
      scripture_refs: [{ book: 'James', chapter: 4, verseStart: 8, verseEnd: 8 }],
      content: `"Come near to God and he will come near to you."

God is not only everywhere; He chooses to be near. He draws close to those who draw close to Him. Intimacy with God is not a mystical impossibility—it is an invitation.

The distance we feel from God is never His doing. He is always reaching toward us. When we reach back, we find Him closer than we imagined.

God wants nearness with you. Do you want it with Him?`,
      reflection_questions: [
        'What creates distance between you and God?',
        'How do you draw near to Him?',
        'What does nearness to God feel like in your experience?'
      ],
      prayer_focus: 'Lord, I draw near to You. Remove whatever creates distance. Let me experience the nearness You offer. I want intimacy with You. Amen.'
    },
    {
      day_number: 17,
      title: 'God Knows',
      scripture_refs: [{ book: 'Psalm', chapter: 139, verseStart: 1, verseEnd: 4 }],
      content: `"You have searched me, LORD, and you know me. You know when I sit and when I rise; you perceive my thoughts from afar."

God knows everything—past, present, future. But more personally, He knows you. Not just facts about you, but you. Your thoughts before you think them. Your words before you speak them.

This total knowledge could be terrifying, but combined with His love, it becomes comforting. He knows the worst about you and loves you still.`,
      reflection_questions: [
        'How do you feel about God knowing everything about you?',
        'What thoughts or secrets are you glad He knows?',
        'How does being fully known by God who loves you change things?'
      ],
      prayer_focus: 'Lord, You know me completely—and You love me still. Thank You for knowing my thoughts and not abandoning me. I have nothing to hide from You. Amen.'
    },
    {
      day_number: 18,
      title: 'God Sees',
      scripture_refs: [{ book: 'Genesis', chapter: 16, verseStart: 13, verseEnd: 13 }],
      content: `"She gave this name to the LORD who spoke to her: 'You are the God who sees me,' for she said, 'I have now seen the One who sees me.'"

Hagar was a slave, pregnant, abandoned in the wilderness. She was invisible to the world. But not to God. He saw her.

El Roi—the God who sees. He sees the overlooked, the marginalized, the forgotten. He sees your struggles, your tears, your silent suffering. You are not invisible to Him.

When no one else sees, God does.`,
      reflection_questions: [
        'When have you felt invisible?',
        'How does knowing God sees you change your perspective?',
        'Who around you needs to know they are seen?'
      ],
      prayer_focus: 'El Roi, You see me. When I feel invisible, You notice. Thank You for seeing what no one else sees. Help me see others as You see them. Amen.'
    },
    {
      day_number: 19,
      title: 'God Hears',
      scripture_refs: [{ book: 'Psalm', chapter: 34, verseStart: 17, verseEnd: 18 }],
      content: `"The righteous cry out, and the LORD hears them; he delivers them from all their troubles. The LORD is close to the brokenhearted and saves those who are crushed in spirit."

God is not too busy to listen. He hears the cry of the righteous. He is close to the brokenhearted. He saves the crushed in spirit.

Your prayers do not bounce off the ceiling. They reach the throne of heaven. The God of the universe stops to hear you.

When you cry out, He listens.`,
      reflection_questions: [
        'What do you need God to hear today?',
        'How does knowing He hears affect how you pray?',
        'Where have you seen evidence that God heard your cry?'
      ],
      prayer_focus: 'Lord, You hear me. You are close when I am broken. Thank You for listening to my cries. I pour out my heart to You, knowing You care. Amen.'
    },
    {
      day_number: 20,
      title: 'God Speaks',
      scripture_refs: [{ book: 'Hebrews', chapter: 1, verseStart: 1, verseEnd: 2 }],
      content: `"In the past God spoke to our ancestors through the prophets at many times and in various ways, but in these last days he has spoken to us by his Son."

God is not silent. He has spoken—through creation, through prophets, through Scripture, and supremely through Jesus. He is a communicating God who wants to be known.

We often complain that God does not speak. But have we listened to what He has already said? Scripture is His voice. Jesus is His Word.`,
      reflection_questions: [
        'How does God speak to you most clearly?',
        'What has He said that you have been ignoring?',
        'How can you listen more attentively to His voice?'
      ],
      prayer_focus: 'Speaking God, You are not silent. Help me hear what You have already said. Open my ears to Your voice in Scripture and in Jesus. Amen.'
    },
    {
      day_number: 21,
      title: 'Week Three Reflection: The God Who Relates',
      scripture_refs: [{ book: 'Psalm', chapter: 145, verseStart: 18, verseEnd: 18 }],
      content: `"The LORD is near to all who call on him, to all who call on him in truth."

This week we have discovered a relational God—present, near, knowing, seeing, hearing, speaking. He is not distant or uninvolved. He pursues relationship with His creation.

This changes everything. The infinite God wants to be known by finite beings. The Creator seeks communion with creatures. The Holy One draws near to sinners.

This is grace. This is wonder. This is our God.`,
      reflection_questions: [
        'How has your view of God changed this week?',
        'What aspect of His relational nature means most to you?',
        'How will you pursue deeper relationship with Him?'
      ],
      prayer_focus: 'Lord, You want relationship with me. The wonder of this staggers me. Draw me closer. Help me know You more. I want all of You that I can have. Amen.'
    },
    {
      day_number: 22,
      title: 'God Is Jealous',
      scripture_refs: [{ book: 'Exodus', chapter: 34, verseStart: 14, verseEnd: 14 }],
      content: `"Do not worship any other god, for the LORD, whose name is Jealous, is a jealous God."

Jealousy seems like a negative trait. But God jealousy is holy—it flows from His love. He is jealous for our wholehearted devotion because He knows nothing else satisfies.

When we give our hearts to lesser gods—money, success, approval—God is jealous. Not because He needs our worship, but because we need to worship Him.

His jealousy protects us from settling for substitutes.`,
      reflection_questions: [
        'What competes with God for your worship?',
        'How is God jealousy different from human jealousy?',
        'What does His jealousy reveal about His love?'
      ],
      prayer_focus: 'Jealous God, forgive me for divided loyalties. You alone deserve my whole heart. Remove the rivals and receive my undivided worship. Amen.'
    },
    {
      day_number: 23,
      title: 'God Is Wrathful',
      scripture_refs: [{ book: 'Romans', chapter: 1, verseStart: 18, verseEnd: 18 }],
      content: `"The wrath of God is being revealed from heaven against all the godlessness and wickedness of people who suppress the truth by their wickedness."

God wrath makes us uncomfortable. We prefer to focus on His love. But love without wrath is not truly love.

God holy anger burns against sin because sin destroys what He loves. His wrath is not petty rage but righteous response to evil. He cannot be indifferent to what devastates His creation.

The cross shows both His wrath and His love—wrath absorbed so love could be extended.`,
      reflection_questions: [
        'How do you reconcile God wrath with His love?',
        'Why must a loving God be angry at sin?',
        'How does the cross satisfy both wrath and love?'
      ],
      prayer_focus: 'Holy God, Your wrath against sin is right and just. Thank You for absorbing that wrath in Jesus. Help me hate what You hate and love what You love. Amen.'
    },
    {
      day_number: 24,
      title: 'God Is Unchanging',
      scripture_refs: [{ book: 'Malachi', chapter: 3, verseStart: 6, verseEnd: 6 }, { book: 'Hebrews', chapter: 13, verseStart: 8, verseEnd: 8 }],
      content: `"I the LORD do not change." "Jesus Christ is the same yesterday and today and forever."

In a world of constant change, God remains the same. His character is fixed. His promises are certain. His nature is unchanging.

What He was, He is. What He is, He will be. The God of Abraham, Isaac, and Jacob is your God. The Jesus who healed lepers and raised the dead is your Jesus.

You can build your life on His unchanging nature.`,
      reflection_questions: [
        'What changes in your life make you crave stability?',
        'How does God unchanging nature provide security?',
        'What promises of God can you trust because He does not change?'
      ],
      prayer_focus: 'Unchanging God, You are the same forever. In a shifting world, You are my rock. I build my life on Your unchanging character. Amen.'
    },
    {
      day_number: 25,
      title: 'God Is Eternal',
      scripture_refs: [{ book: 'Psalm', chapter: 90, verseStart: 2, verseEnd: 2 }],
      content: `"Before the mountains were born or you brought forth the whole world, from everlasting to everlasting you are God."

God has no beginning and no end. Before anything was, He was. When everything else passes, He remains. He exists outside time while working within it.

Our lives are brief. His existence is eternal. This puts everything in perspective. What seems urgent to us is a moment to Him. What feels overwhelming to us is nothing to Him.

The eternal God holds our momentary lives in His everlasting hands.`,
      reflection_questions: [
        'How does God eternal nature put your problems in perspective?',
        'What does it mean to trust an everlasting God with your brief life?',
        'How should eternity shape how you live today?'
      ],
      prayer_focus: 'Eternal God, You exist beyond time. My brief life is held in Your everlasting hands. Help me live in light of eternity. Amen.'
    },
    {
      day_number: 26,
      title: 'God Is Self-Sufficient',
      scripture_refs: [{ book: 'Acts', chapter: 17, verseStart: 24, verseEnd: 25 }],
      content: `"The God who made the world and everything in it is the Lord of heaven and earth and does not live in temples built by human hands. And he is not served by human hands, as if he needed anything."

God does not need us. He is completely self-sufficient. Before creation, He was fulfilled in the Trinity—Father, Son, and Spirit in perfect relationship.

He does not need our worship, service, or devotion. He wants them—but not out of lack. His choice to create and relate to us flows from abundance, not need.

This makes His love even more remarkable: He does not need us, yet He wants us.`,
      reflection_questions: [
        'How does knowing God does not need you affect your understanding of relationship with Him?',
        'What does it say about His love that He chose you without needing you?',
        'How does His self-sufficiency give you security?'
      ],
      prayer_focus: 'Self-sufficient God, You do not need me—yet You want me. This amazes me. Thank You for choosing relationship out of love, not lack. Amen.'
    },
    {
      day_number: 27,
      title: 'God Is Triune',
      scripture_refs: [{ book: 'Matthew', chapter: 28, verseStart: 19, verseEnd: 19 }, { book: '2 Corinthians', chapter: 13, verseStart: 14, verseEnd: 14 }],
      content: `"Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."

One God in three persons—Father, Son, and Holy Spirit. This is mystery beyond full comprehension, yet at the heart of who God is.

The Trinity means God is relational in His very nature. Before creation, there was love, fellowship, and communication within the Godhead. We are invited into this divine relationship.

The Father creates, the Son redeems, the Spirit empowers—one God working in perfect unity.`,
      reflection_questions: [
        'How do you relate differently to Father, Son, and Spirit?',
        'What does the Trinity teach about God relational nature?',
        'How does the unity of the Trinity model community?'
      ],
      prayer_focus: 'Triune God—Father, Son, and Spirit—I worship You as one God in three persons. Draw me into Your divine community of love. Amen.'
    },
    {
      day_number: 28,
      title: 'Week Four Reflection: The God Beyond Us',
      scripture_refs: [{ book: 'Isaiah', chapter: 55, verseStart: 8, verseEnd: 9 }],
      content: `"For my thoughts are not your thoughts, neither are your ways my ways. As the heavens are higher than the earth, so are my ways higher than your ways and my thoughts than your thoughts."

This week we have encountered aspects of God that stretch our understanding—His jealousy, wrath, unchanging nature, eternity, self-sufficiency, and Trinity.

These attributes remind us that God is beyond us. He cannot be fully comprehended, only worshiped. We will spend eternity learning His depths.

What we cannot fully understand, we can still fully trust.`,
      reflection_questions: [
        'Which attribute of God is hardest for you to understand?',
        'How do you worship what you cannot fully comprehend?',
        'What is the difference between understanding God and trusting Him?'
      ],
      prayer_focus: 'Lord, You are beyond my full understanding. Yet I trust You. Help me worship what I cannot comprehend. Expand my capacity to know You more. Amen.'
    },
    {
      day_number: 29,
      title: 'Becoming Like What We Worship',
      scripture_refs: [{ book: 'Psalm', chapter: 115, verseStart: 4, verseEnd: 8 }],
      content: `"But their idols are silver and gold, made by human hands... Those who make them will be like them, and so will all who trust in them."

We become like what we worship. Those who worship lifeless idols become spiritually dead. Those who worship the living God become spiritually alive.

As we spend time beholding God character, we are transformed into His image. We grow in holiness, love, faithfulness, and every attribute we have studied.

Knowing God is not just intellectual exercise—it is transformational encounter.`,
      reflection_questions: [
        'What do you worship, and what are you becoming?',
        'Which aspect of God character do you most need to reflect?',
        'How has knowing God this month changed you?'
      ],
      prayer_focus: 'Lord, I want to become like You. Transform me through worship. Let Your character become mine as I behold Your glory. Amen.'
    },
    {
      day_number: 30,
      title: 'Final Reflection: Knowing and Being Known',
      scripture_refs: [{ book: 'Galatians', chapter: 4, verseStart: 9, verseEnd: 9 }],
      content: `"But now that you know God—or rather are known by God—how is it that you are turning back to those weak and miserable forces?"

The deepest truth is not that we know God but that we are known by Him. Our pursuit of knowing Him is possible only because He first knew us.

After thirty days of exploring God character, what remains? A lifetime of discovery awaits. We have barely begun. The God we have glimpsed is infinite—eternally knowable, never fully known.

May this journey be a beginning, not an end. May knowing God become your life pursuit.`,
      reflection_questions: [
        'What has knowing God taught you about being known by Him?',
        'How will you continue pursuing knowledge of God after this series?',
        'What is the most important thing you have learned about God character?'
      ],
      prayer_focus: 'Lord, I have barely begun to know You—yet You have always known me. Thank You for this journey. Let it continue for the rest of my life. I want to know You more. Amen.'
    }
  ]
};

// =====================================================
// ALL SERIES TO SEED
// =====================================================
const ALL_DEVOTIONAL_CONTENT = [
  WALKING_IN_LOVE,
  OVERCOMING_ANXIETY_CONDENSED,
  CULTIVATING_GRATITUDE,
  FRUIT_OF_THE_SPIRIT,
  TRUSTING_GODS_TIMING,
  ARMOR_OF_GOD,
  VICTORY_OVER_TEMPTATION,
  OVERCOMING_FEAR,
  HEARING_GODS_VOICE_BEGINNER,
  TRUSTING_GOD_FINANCES,
  GODS_UNFAILING_LOVE,
  BEAUTY_FROM_ASHES,
  LEADING_LIKE_CHRIST,
  STRENGTHENING_MARRIAGE,
  POWER_OF_PRAYER,
  FORGIVENESS_HEALING,
  MAN_OF_VALOR,
  WOMAN_OF_GRACE,
  DEALING_WITH_GRIEF,
  BIBLICAL_PARENTING,
  WALKING_GRACE_FORGIVENESS,
  FAITH_IN_TRIALS,
  DAILY_GRATITUDE,
  HEARING_GODS_VOICE,
  GODS_PROMISES_FAMILIES,
  EASTER_TRIUMPH,
  TEEN_IDENTITY_CHRIST,
  TEEN_FAITH_OVER_FEAR,
  DEEPENING_PRAYER,
  NAMES_ATTRIBUTES_JESUS,
  RENEWING_YOUR_MIND,
  ATTRIBUTES_OF_GOD,
  STRENGTH_IN_LORD,
  PROVERBS_31_HEART,
  FAMILY_FAITH_BUILDERS,
  ADVENT_WAITING_HOPE,
  LENT_JOURNEY_CROSS,
  DISCIPLESHIP_OBEDIENCE,
  KNOWING_GODS_CHARACTER,
];

// =====================================================
// MAIN SEED FUNCTION
// =====================================================
async function seedDevotionalContent() {
  console.log('Starting devotional content seed...\n');
  console.log(`Seeding ${ALL_DEVOTIONAL_CONTENT.length} series with full content\n`);

  for (const devotional of ALL_DEVOTIONAL_CONTENT) {
    console.log(`\nSeeding: ${devotional.series.title}`);
    console.log(`  Days: ${devotional.series.total_days}`);

    try {
      // Upsert the series
      const { data: series, error: seriesError } = await supabase
        .from('devotional_series')
        .upsert(devotional.series, { onConflict: 'slug' })
        .select()
        .single();

      if (seriesError) {
        console.error(`  Error upserting series: ${seriesError.message}`);
        continue;
      }

      console.log(`  Series ID: ${series.id}`);

      // Upsert each day
      let successCount = 0;
      for (const day of devotional.days) {
        const dayData = {
          series_id: series.id,
          day_number: day.day_number,
          title: day.title,
          scripture_refs: day.scripture_refs,
          content_prompt: day.content,
          reflection_questions: day.reflection_questions,
          prayer_focus: day.prayer_focus,
        };

        const { error: dayError } = await supabase
          .from('devotional_days')
          .upsert(dayData, { onConflict: 'series_id,day_number' });

        if (dayError) {
          console.error(`  Error upserting day ${day.day_number}: ${dayError.message}`);
        } else {
          successCount++;
        }
      }

      console.log(`  Successfully seeded ${successCount}/${devotional.days.length} days`);
    } catch (error) {
      console.error(`  Unexpected error: ${error.message}`);
    }
  }

  console.log('\n\nDevotional content seed complete!');
  console.log('Note: The content is stored in "content_prompt" field for now.');
  console.log('In the app, this field serves as the main devotional content.\n');
}

// Run the seed
seedDevotionalContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
