/**
 * Draw Near Verses Collection
 *
 * Curated verses focused EXCLUSIVELY on drawing nearer to God.
 * These verses emphasize intimacy, seeking, presence, and abiding with the Lord.
 *
 * Philosophy: "We are not God, only helping others find HIM"
 */

export interface DrawNearVerse {
  reference: string;
  text: string;
  theme: 'intimacy' | 'seeking' | 'presence' | 'abiding' | 'nearness';
}

export const DRAW_NEAR_VERSES: DrawNearVerse[] = [
  // Core "Draw Near" Verses
  {
    reference: 'James 4:8',
    text: 'Draw nigh to God, and he will draw nigh to you.',
    theme: 'nearness',
  },
  {
    reference: 'Psalm 73:28',
    text: 'But it is good for me to draw near to God: I have put my trust in the Lord GOD.',
    theme: 'nearness',
  },
  {
    reference: 'Hebrews 10:22',
    text: 'Let us draw near with a true heart in full assurance of faith.',
    theme: 'nearness',
  },

  // Seeking God
  {
    reference: 'Psalm 63:1',
    text: 'O God, thou art my God; early will I seek thee: my soul thirsteth for thee.',
    theme: 'seeking',
  },
  {
    reference: 'Psalm 27:4',
    text: 'One thing have I desired of the LORD, that will I seek after; that I may dwell in the house of the LORD all the days of my life.',
    theme: 'seeking',
  },
  {
    reference: 'Psalm 42:1-2',
    text: 'As the hart panteth after the water brooks, so panteth my soul after thee, O God. My soul thirsteth for God, for the living God.',
    theme: 'seeking',
  },
  {
    reference: 'Jeremiah 29:13',
    text: 'And ye shall seek me, and find me, when ye shall search for me with all your heart.',
    theme: 'seeking',
  },
  {
    reference: 'Isaiah 55:6',
    text: 'Seek ye the LORD while he may be found, call ye upon him while he is near.',
    theme: 'seeking',
  },
  {
    reference: 'Matthew 6:33',
    text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
    theme: 'seeking',
  },

  // God's Presence
  {
    reference: 'Psalm 16:11',
    text: 'Thou wilt shew me the path of life: in thy presence is fulness of joy; at thy right hand there are pleasures for evermore.',
    theme: 'presence',
  },
  {
    reference: 'Psalm 84:10',
    text: 'For a day in thy courts is better than a thousand. I had rather be a doorkeeper in the house of my God, than to dwell in the tents of wickedness.',
    theme: 'presence',
  },
  {
    reference: 'Exodus 33:14',
    text: 'And he said, My presence shall go with thee, and I will give thee rest.',
    theme: 'presence',
  },
  {
    reference: 'Psalm 139:7-8',
    text: 'Whither shall I go from thy spirit? or whither shall I flee from thy presence? If I ascend up into heaven, thou art there.',
    theme: 'presence',
  },
  {
    reference: 'Psalm 145:18',
    text: 'The LORD is nigh unto all them that call upon him, to all that call upon him in truth.',
    theme: 'presence',
  },
  {
    reference: 'Deuteronomy 4:7',
    text: 'For what nation is there so great, who hath God so nigh unto them, as the LORD our God is in all things that we call upon him for?',
    theme: 'presence',
  },

  // Abiding in Christ
  {
    reference: 'John 15:4',
    text: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.',
    theme: 'abiding',
  },
  {
    reference: 'John 15:5',
    text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
    theme: 'abiding',
  },
  {
    reference: 'Colossians 3:1-2',
    text: 'If ye then be risen with Christ, seek those things which are above. Set your affection on things above, not on things on the earth.',
    theme: 'abiding',
  },

  // Intimacy with God
  {
    reference: 'Revelation 3:20',
    text: 'Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.',
    theme: 'intimacy',
  },
  {
    reference: 'Psalm 34:18',
    text: 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.',
    theme: 'intimacy',
  },
  {
    reference: 'Romans 8:38-39',
    text: 'For I am persuaded, that neither death, nor life... shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
    theme: 'intimacy',
  },
  {
    reference: 'Psalm 27:8',
    text: 'When thou saidst, Seek ye my face; my heart said unto thee, Thy face, LORD, will I seek.',
    theme: 'intimacy',
  },
  {
    reference: 'Psalm 105:4',
    text: 'Seek the LORD, and his strength: seek his face evermore.',
    theme: 'intimacy',
  },
  {
    reference: 'Zephaniah 3:17',
    text: 'The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love.',
    theme: 'intimacy',
  },
];

/**
 * Get the verse for today based on day of year.
 * Same verse shown all day, different verse each day.
 */
export function getTodaysDrawNearVerse(): DrawNearVerse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const verseIndex = dayOfYear % DRAW_NEAR_VERSES.length;
  return DRAW_NEAR_VERSES[verseIndex];
}

/**
 * Get a specific verse by reference
 */
export function getDrawNearVerseByReference(reference: string): DrawNearVerse | undefined {
  return DRAW_NEAR_VERSES.find(v => v.reference === reference);
}

/**
 * Get verses by theme
 */
export function getDrawNearVersesByTheme(theme: DrawNearVerse['theme']): DrawNearVerse[] {
  return DRAW_NEAR_VERSES.filter(v => v.theme === theme);
}
