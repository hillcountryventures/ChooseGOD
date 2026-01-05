/**
 * Bible Seeding Script - LITE Version
 *
 * Seeds ~500 most important/commonly referenced verses for quick testing.
 * Cost: ~$0.01
 * Time: ~30 seconds
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... node seed-bible-lite.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const EMBEDDING_MODEL = 'text-embedding-3-small';

// Popular/important verses for initial seeding
const IMPORTANT_VERSES = [
  // Salvation & Gospel
  { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  { book: 'John', chapter: 3, verse: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
  { book: 'Romans', chapter: 3, verse: 23, text: 'For all have sinned, and come short of the glory of God;' },
  { book: 'Romans', chapter: 6, verse: 23, text: 'For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.' },
  { book: 'Romans', chapter: 5, verse: 8, text: 'But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.' },
  { book: 'Romans', chapter: 10, verse: 9, text: 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.' },
  { book: 'Romans', chapter: 10, verse: 10, text: 'For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.' },
  { book: 'Ephesians', chapter: 2, verse: 8, text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:' },
  { book: 'Ephesians', chapter: 2, verse: 9, text: 'Not of works, lest any man should boast.' },
  { book: 'Acts', chapter: 4, verse: 12, text: 'Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.' },
  { book: 'John', chapter: 14, verse: 6, text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.' },
  { book: 'Acts', chapter: 16, verse: 31, text: 'And they said, Believe on the Lord Jesus Christ, and thou shalt be saved, and thy house.' },

  // Trust & Faith
  { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
  { book: 'Proverbs', chapter: 3, verse: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
  { book: 'Hebrews', chapter: 11, verse: 1, text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { book: 'Hebrews', chapter: 11, verse: 6, text: 'But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.' },
  { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
  { book: 'Jeremiah', chapter: 29, verse: 11, text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
  { book: 'Isaiah', chapter: 41, verse: 10, text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
  { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through Christ which strengtheneth me.' },
  { book: '2 Timothy', chapter: 1, verse: 7, text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.' },
  { book: 'Joshua', chapter: 1, verse: 9, text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.' },

  // Peace & Comfort
  { book: 'Philippians', chapter: 4, verse: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
  { book: 'Philippians', chapter: 4, verse: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
  { book: 'John', chapter: 14, verse: 27, text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' },
  { book: 'Matthew', chapter: 11, verse: 28, text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
  { book: 'Matthew', chapter: 11, verse: 29, text: 'Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.' },
  { book: 'Matthew', chapter: 11, verse: 30, text: 'For my yoke is easy, and my burden is light.' },
  { book: 'Psalms', chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
  { book: 'Psalms', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
  { book: 'Psalms', chapter: 23, verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
  { book: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
  { book: 'Psalms', chapter: 23, verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
  { book: 'Psalms', chapter: 23, verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
  { book: 'Isaiah', chapter: 26, verse: 3, text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.' },
  { book: '2 Corinthians', chapter: 1, verse: 3, text: 'Blessed be God, even the Father of our Lord Jesus Christ, the Father of mercies, and the God of all comfort;' },
  { book: '2 Corinthians', chapter: 1, verse: 4, text: 'Who comforteth us in all our tribulation, that we may be able to comfort them which are in any trouble, by the comfort wherewith we ourselves are comforted of God.' },

  // Love
  { book: '1 Corinthians', chapter: 13, verse: 4, text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,' },
  { book: '1 Corinthians', chapter: 13, verse: 5, text: 'Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;' },
  { book: '1 Corinthians', chapter: 13, verse: 6, text: 'Rejoiceth not in iniquity, but rejoiceth in the truth;' },
  { book: '1 Corinthians', chapter: 13, verse: 7, text: 'Beareth all things, believeth all things, hopeth all things, endureth all things.' },
  { book: '1 Corinthians', chapter: 13, verse: 8, text: 'Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.' },
  { book: '1 Corinthians', chapter: 13, verse: 13, text: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.' },
  { book: '1 John', chapter: 4, verse: 7, text: 'Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.' },
  { book: '1 John', chapter: 4, verse: 8, text: 'He that loveth not knoweth not God; for God is love.' },
  { book: '1 John', chapter: 4, verse: 19, text: 'We love him, because he first loved us.' },
  { book: 'John', chapter: 13, verse: 34, text: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.' },
  { book: 'John', chapter: 13, verse: 35, text: 'By this shall all men know that ye are my disciples, if ye have love one to another.' },
  { book: 'Romans', chapter: 13, verse: 8, text: 'Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the law.' },

  // Prayer
  { book: 'Matthew', chapter: 6, verse: 9, text: 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.' },
  { book: 'Matthew', chapter: 6, verse: 10, text: 'Thy kingdom come. Thy will be done in earth, as it is in heaven.' },
  { book: 'Matthew', chapter: 6, verse: 11, text: 'Give us this day our daily bread.' },
  { book: 'Matthew', chapter: 6, verse: 12, text: 'And forgive us our debts, as we forgive our debtors.' },
  { book: 'Matthew', chapter: 6, verse: 13, text: 'And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.' },
  { book: 'Matthew', chapter: 7, verse: 7, text: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:' },
  { book: 'Matthew', chapter: 7, verse: 8, text: 'For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.' },
  { book: 'James', chapter: 5, verse: 16, text: 'Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much.' },
  { book: '1 John', chapter: 5, verse: 14, text: 'And this is the confidence that we have in him, that, if we ask any thing according to his will, he heareth us:' },
  { book: '1 John', chapter: 5, verse: 15, text: 'And if we know that he hear us, whatsoever we ask, we know that we have the petitions that we desired of him.' },
  { book: 'Jeremiah', chapter: 33, verse: 3, text: 'Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.' },
  { book: '1 Thessalonians', chapter: 5, verse: 17, text: 'Pray without ceasing.' },
  { book: '1 Thessalonians', chapter: 5, verse: 18, text: 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.' },

  // Forgiveness
  { book: '1 John', chapter: 1, verse: 9, text: 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.' },
  { book: 'Romans', chapter: 8, verse: 1, text: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.' },
  { book: 'Psalms', chapter: 103, verse: 12, text: 'As far as the east is from the west, so far hath he removed our transgressions from us.' },
  { book: 'Isaiah', chapter: 1, verse: 18, text: 'Come now, and let us reason together, saith the LORD: though your sins be as scarlet, they shall be as white as snow; though they be red like crimson, they shall be as wool.' },
  { book: 'Ephesians', chapter: 4, verse: 32, text: 'And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ\'s sake hath forgiven you.' },
  { book: 'Colossians', chapter: 3, verse: 13, text: 'Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.' },
  { book: 'Matthew', chapter: 6, verse: 14, text: 'For if ye forgive men their trespasses, your heavenly Father will also forgive you:' },
  { book: 'Matthew', chapter: 6, verse: 15, text: 'But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.' },

  // Strength & Courage
  { book: 'Psalms', chapter: 27, verse: 1, text: 'The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?' },
  { book: 'Psalms', chapter: 46, verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' },
  { book: 'Psalms', chapter: 46, verse: 10, text: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.' },
  { book: 'Isaiah', chapter: 40, verse: 31, text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.' },
  { book: 'Deuteronomy', chapter: 31, verse: 6, text: 'Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.' },
  { book: 'Psalms', chapter: 31, verse: 24, text: 'Be of good courage, and he shall strengthen your heart, all ye that hope in the LORD.' },
  { book: 'Nehemiah', chapter: 8, verse: 10, text: 'Then he said unto them, Go your way, eat the fat, and drink the sweet, and send portions unto them for whom nothing is prepared: for this day is holy unto our LORD: neither be ye sorry; for the joy of the LORD is your strength.' },

  // Wisdom & Guidance
  { book: 'James', chapter: 1, verse: 5, text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.' },
  { book: 'Proverbs', chapter: 1, verse: 7, text: 'The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.' },
  { book: 'Proverbs', chapter: 9, verse: 10, text: 'The fear of the LORD is the beginning of wisdom: and the knowledge of the holy is understanding.' },
  { book: 'Psalms', chapter: 119, verse: 105, text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
  { book: 'Psalms', chapter: 32, verse: 8, text: 'I will instruct thee and teach thee in the way which thou shalt go: I will guide thee with mine eye.' },
  { book: 'Isaiah', chapter: 30, verse: 21, text: 'And thine ears shall hear a word behind thee, saying, This is the way, walk ye in it, when ye turn to the right hand, and when ye turn to the left.' },
  { book: 'Colossians', chapter: 3, verse: 16, text: 'Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the Lord.' },

  // God's Character
  { book: 'Psalms', chapter: 100, verse: 5, text: 'For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.' },
  { book: 'Lamentations', chapter: 3, verse: 22, text: 'It is of the LORD\'s mercies that we are not consumed, because his compassions fail not.' },
  { book: 'Lamentations', chapter: 3, verse: 23, text: 'They are new every morning: great is thy faithfulness.' },
  { book: 'Numbers', chapter: 23, verse: 19, text: 'God is not a man, that he should lie; neither the son of man, that he should repent: hath he said, and shall he not do it? or hath he spoken, and shall he not make it good?' },
  { book: 'Malachi', chapter: 3, verse: 6, text: 'For I am the LORD, I change not; therefore ye sons of Jacob are not consumed.' },
  { book: 'Hebrews', chapter: 13, verse: 8, text: 'Jesus Christ the same yesterday, and to day, and for ever.' },
  { book: 'James', chapter: 1, verse: 17, text: 'Every good gift and every perfect gift is from above, and cometh down from the Father of lights, with whom is no variableness, neither shadow of turning.' },
  { book: 'Psalms', chapter: 145, verse: 9, text: 'The LORD is good to all: and his tender mercies are over all his works.' },
  { book: 'Psalms', chapter: 136, verse: 1, text: 'O give thanks unto the LORD; for he is good: for his mercy endureth for ever.' },

  // Spiritual Growth
  { book: 'Romans', chapter: 12, verse: 1, text: 'I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.' },
  { book: 'Romans', chapter: 12, verse: 2, text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.' },
  { book: '2 Corinthians', chapter: 5, verse: 17, text: 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.' },
  { book: 'Galatians', chapter: 5, verse: 22, text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,' },
  { book: 'Galatians', chapter: 5, verse: 23, text: 'Meekness, temperance: against such there is no law.' },
  { book: '2 Peter', chapter: 3, verse: 18, text: 'But grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ. To him be glory both now and for ever. Amen.' },
  { book: 'Philippians', chapter: 1, verse: 6, text: 'Being confident of this very thing, that he which hath begun a good work in you will perform it until the day of Jesus Christ:' },
  { book: 'Colossians', chapter: 3, verse: 1, text: 'If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God.' },
  { book: 'Colossians', chapter: 3, verse: 2, text: 'Set your affection on things above, not on things on the earth.' },

  // Obedience & Following God
  { book: 'Matthew', chapter: 22, verse: 37, text: 'Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind.' },
  { book: 'Matthew', chapter: 22, verse: 38, text: 'This is the first and great commandment.' },
  { book: 'Matthew', chapter: 22, verse: 39, text: 'And the second is like unto it, Thou shalt love thy neighbour as thyself.' },
  { book: 'John', chapter: 14, verse: 15, text: 'If ye love me, keep my commandments.' },
  { book: 'John', chapter: 14, verse: 21, text: 'He that hath my commandments, and keepeth them, he it is that loveth me: and he that loveth me shall be loved of my Father, and I will love him, and will manifest myself to him.' },
  { book: 'James', chapter: 1, verse: 22, text: 'But be ye doers of the word, and not hearers only, deceiving your own selves.' },
  { book: 'Micah', chapter: 6, verse: 8, text: 'He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?' },
  { book: '1 Samuel', chapter: 15, verse: 22, text: 'And Samuel said, Hath the LORD as great delight in burnt offerings and sacrifices, as in obeying the voice of the LORD? Behold, to obey is better than sacrifice, and to hearken than the fat of rams.' },

  // Great Commission & Evangelism
  { book: 'Matthew', chapter: 28, verse: 19, text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:' },
  { book: 'Matthew', chapter: 28, verse: 20, text: 'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world. Amen.' },
  { book: 'Mark', chapter: 16, verse: 15, text: 'And he said unto them, Go ye into all the world, and preach the gospel to every creature.' },
  { book: 'Acts', chapter: 1, verse: 8, text: 'But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.' },
  { book: 'Romans', chapter: 10, verse: 14, text: 'How then shall they call on him in whom they have not believed? and how shall they believe in him of whom they have not heard? and how shall they hear without a preacher?' },
  { book: 'Romans', chapter: 10, verse: 15, text: 'And how shall they preach, except they be sent? as it is written, How beautiful are the feet of them that preach the gospel of peace, and bring glad tidings of good things!' },

  // Anxiety & Worry
  { book: 'Matthew', chapter: 6, verse: 25, text: 'Therefore I say unto you, Take no thought for your life, what ye shall eat, or what ye shall drink; nor yet for your body, what ye shall put on. Is not the life more than meat, and the body than raiment?' },
  { book: 'Matthew', chapter: 6, verse: 26, text: 'Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them. Are ye not much better than they?' },
  { book: 'Matthew', chapter: 6, verse: 33, text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
  { book: 'Matthew', chapter: 6, verse: 34, text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.' },
  { book: '1 Peter', chapter: 5, verse: 7, text: 'Casting all your care upon him; for he careth for you.' },
  { book: 'Psalms', chapter: 55, verse: 22, text: 'Cast thy burden upon the LORD, and he shall sustain thee: he shall never suffer the righteous to be moved.' },

  // Trials & Suffering
  { book: 'James', chapter: 1, verse: 2, text: 'My brethren, count it all joy when ye fall into divers temptations;' },
  { book: 'James', chapter: 1, verse: 3, text: 'Knowing this, that the trying of your faith worketh patience.' },
  { book: 'James', chapter: 1, verse: 4, text: 'But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.' },
  { book: 'Romans', chapter: 5, verse: 3, text: 'And not only so, but we glory in tribulations also: knowing that tribulation worketh patience;' },
  { book: 'Romans', chapter: 5, verse: 4, text: 'And patience, experience; and experience, hope:' },
  { book: 'Romans', chapter: 5, verse: 5, text: 'And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us.' },
  { book: '2 Corinthians', chapter: 4, verse: 17, text: 'For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory;' },
  { book: '2 Corinthians', chapter: 4, verse: 18, text: 'While we look not at the things which are seen, but at the things which are not seen: for the things which are seen are temporal; but the things which are not seen are eternal.' },
  { book: '1 Peter', chapter: 4, verse: 12, text: 'Beloved, think it not strange concerning the fiery trial which is to try you, as though some strange thing happened unto you:' },
  { book: '1 Peter', chapter: 4, verse: 13, text: 'But rejoice, inasmuch as ye are partakers of Christ\'s sufferings; that, when his glory shall be revealed, ye may be glad also with exceeding joy.' },

  // Gratitude & Praise
  { book: 'Psalms', chapter: 100, verse: 1, text: 'Make a joyful noise unto the LORD, all ye lands.' },
  { book: 'Psalms', chapter: 100, verse: 2, text: 'Serve the LORD with gladness: come before his presence with singing.' },
  { book: 'Psalms', chapter: 100, verse: 3, text: 'Know ye that the LORD he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.' },
  { book: 'Psalms', chapter: 100, verse: 4, text: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.' },
  { book: 'Psalms', chapter: 107, verse: 1, text: 'O give thanks unto the LORD, for he is good: for his mercy endureth for ever.' },
  { book: 'Colossians', chapter: 3, verse: 17, text: 'And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.' },
  { book: 'Hebrews', chapter: 13, verse: 15, text: 'By him therefore let us offer the sacrifice of praise to God continually, that is, the fruit of our lips giving thanks to his name.' },

  // Hope & Future
  { book: 'Romans', chapter: 15, verse: 13, text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.' },
  { book: 'Revelation', chapter: 21, verse: 4, text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.' },
  { book: 'John', chapter: 14, verse: 1, text: 'Let not your heart be troubled: ye believe in God, believe also in me.' },
  { book: 'John', chapter: 14, verse: 2, text: 'In my Father\'s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.' },
  { book: 'John', chapter: 14, verse: 3, text: 'And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.' },
  { book: '1 Thessalonians', chapter: 4, verse: 16, text: 'For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first:' },
  { book: '1 Thessalonians', chapter: 4, verse: 17, text: 'Then we which are alive and remain shall be caught up together with them in the clouds, to meet the Lord in the air: and so shall we ever be with the Lord.' },
  { book: '1 Thessalonians', chapter: 4, verse: 18, text: 'Wherefore comfort one another with these words.' },

  // Jesus' Identity
  { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
  { book: 'John', chapter: 1, verse: 14, text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.' },
  { book: 'Colossians', chapter: 1, verse: 15, text: 'Who is the image of the invisible God, the firstborn of every creature:' },
  { book: 'Colossians', chapter: 1, verse: 16, text: 'For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him:' },
  { book: 'Colossians', chapter: 1, verse: 17, text: 'And he is before all things, and by him all things consist.' },
  { book: 'Hebrews', chapter: 1, verse: 3, text: 'Who being the brightness of his glory, and the express image of his person, and upholding all things by the word of his power, when he had by himself purged our sins, sat down on the right hand of the Majesty on high:' },
  { book: 'Philippians', chapter: 2, verse: 9, text: 'Wherefore God also hath highly exalted him, and given him a name which is above every name:' },
  { book: 'Philippians', chapter: 2, verse: 10, text: 'That at the name of Jesus every knee should bow, of things in heaven, and things in earth, and things under the earth;' },
  { book: 'Philippians', chapter: 2, verse: 11, text: 'And that every tongue should confess that Jesus Christ is Lord, to the glory of God the Father.' },

  // Ten Commandments context
  { book: 'Exodus', chapter: 20, verse: 3, text: 'Thou shalt have no other gods before me.' },
  { book: 'Exodus', chapter: 20, verse: 7, text: 'Thou shalt not take the name of the LORD thy God in vain; for the LORD will not hold him guiltless that taketh his name in vain.' },
  { book: 'Exodus', chapter: 20, verse: 8, text: 'Remember the sabbath day, to keep it holy.' },
  { book: 'Exodus', chapter: 20, verse: 12, text: 'Honour thy father and thy mother: that thy days may be long upon the land which the LORD thy God giveth thee.' },

  // Beatitudes
  { book: 'Matthew', chapter: 5, verse: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
  { book: 'Matthew', chapter: 5, verse: 4, text: 'Blessed are they that mourn: for they shall be comforted.' },
  { book: 'Matthew', chapter: 5, verse: 5, text: 'Blessed are the meek: for they shall inherit the earth.' },
  { book: 'Matthew', chapter: 5, verse: 6, text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.' },
  { book: 'Matthew', chapter: 5, verse: 7, text: 'Blessed are the merciful: for they shall obtain mercy.' },
  { book: 'Matthew', chapter: 5, verse: 8, text: 'Blessed are the pure in heart: for they shall see God.' },
  { book: 'Matthew', chapter: 5, verse: 9, text: 'Blessed are the peacemakers: for they shall be called the children of God.' },

  // Armor of God
  { book: 'Ephesians', chapter: 6, verse: 10, text: 'Finally, my brethren, be strong in the Lord, and in the power of his might.' },
  { book: 'Ephesians', chapter: 6, verse: 11, text: 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.' },
  { book: 'Ephesians', chapter: 6, verse: 12, text: 'For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places.' },
  { book: 'Ephesians', chapter: 6, verse: 13, text: 'Wherefore take unto you the whole armour of God, that ye may be able to withstand in the evil day, and having done all, to stand.' },
  { book: 'Ephesians', chapter: 6, verse: 14, text: 'Stand therefore, having your loins girt about with truth, and having on the breastplate of righteousness;' },
  { book: 'Ephesians', chapter: 6, verse: 15, text: 'And your feet shod with the preparation of the gospel of peace;' },
  { book: 'Ephesians', chapter: 6, verse: 16, text: 'Above all, taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked.' },
  { book: 'Ephesians', chapter: 6, verse: 17, text: 'And take the helmet of salvation, and the sword of the Spirit, which is the word of God:' },
  { book: 'Ephesians', chapter: 6, verse: 18, text: 'Praying always with all prayer and supplication in the Spirit, and watching thereunto with all perseverance and supplication for all saints;' },

  // Creation
  { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.' },
  { book: 'Genesis', chapter: 1, verse: 27, text: 'So God created man in his own image, in the image of God created he him; male and female created he them.' },
  { book: 'Psalms', chapter: 139, verse: 14, text: 'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.' },

  // Scripture
  { book: '2 Timothy', chapter: 3, verse: 16, text: 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:' },
  { book: '2 Timothy', chapter: 3, verse: 17, text: 'That the man of God may be perfect, throughly furnished unto all good works.' },
  { book: 'Hebrews', chapter: 4, verse: 12, text: 'For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.' },
  { book: 'Isaiah', chapter: 55, verse: 11, text: 'So shall my word be that goeth forth out of my mouth: it shall not return unto me void, but it shall accomplish that which I please, and it shall prosper in the thing whereto I sent it.' },

  // Confession verses
  { book: 'Psalms', chapter: 51, verse: 1, text: 'Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions.' },
  { book: 'Psalms', chapter: 51, verse: 2, text: 'Wash me throughly from mine iniquity, and cleanse me from my sin.' },
  { book: 'Psalms', chapter: 51, verse: 10, text: 'Create in me a clean heart, O God; and renew a right spirit within me.' },
  { book: 'Psalms', chapter: 139, verse: 23, text: 'Search me, O God, and know my heart: try me, and know my thoughts:' },
  { book: 'Psalms', chapter: 139, verse: 24, text: 'And see if there be any wicked way in me, and lead me in the way everlasting.' },
];

async function generateEmbeddings(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

async function insertVerses(verses) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(verses)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase insert error: ${response.status} - ${error}`);
  }
}

async function seedLite() {
  console.log('=== Bible Seeding Script (LITE) ===\n');
  console.log(`Seeding ${IMPORTANT_VERSES.length} important verses...`);

  const BATCH_SIZE = 50;
  let processedCount = 0;

  for (let i = 0; i < IMPORTANT_VERSES.length; i += BATCH_SIZE) {
    const batch = IMPORTANT_VERSES.slice(i, i + BATCH_SIZE);
    const texts = batch.map(v => `${v.book} ${v.chapter}:${v.verse} - ${v.text}`);

    try {
      const embeddings = await generateEmbeddings(texts);

      const versesWithEmbeddings = batch.map((verse, idx) => ({
        ...verse,
        translation: 'kjv',
        embedding: JSON.stringify(embeddings[idx])
      }));

      await insertVerses(versesWithEmbeddings);

      processedCount += batch.length;
      console.log(`Progress: ${processedCount}/${IMPORTANT_VERSES.length} verses`);

    } catch (error) {
      console.error(`Error at batch ${i}: ${error.message}`);
      throw error;
    }
  }

  console.log(`\nSeeding complete! ${processedCount} verses added.`);
  console.log('Run the full seed-bible.js script later for complete coverage.');
}

seedLite().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
