/**
 * "Start Here" — The default 7-day reading plan for new believers
 * and anyone wanting a guided introduction to Scripture.
 */

export interface PlanDay {
  day: number;
  reference: string;
  title: string;
  intro: string;
  reflectionQuestion: string;
}

export interface ReadingPlanData {
  slug: string;
  title: string;
  description: string;
  totalDays: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  days: PlanDay[];
}

export const startHerePlan: ReadingPlanData = {
  slug: 'start-here',
  title: 'Start Here',
  description:
    'New to the Bible? Start with seven hand-picked passages that introduce you to God\'s story — from creation to the hope of eternity.',
  totalDays: 7,
  difficulty: 'beginner',
  tags: ['new believer', 'essentials', 'introduction'],
  days: [
    {
      day: 1,
      reference: 'John 1',
      title: 'In the Beginning',
      intro:
        'The Gospel of John opens with a cosmic declaration: the Word was with God, and the Word was God. This chapter introduces you to Jesus — not just as a teacher, but as the light of the world who existed before time began.',
      reflectionQuestion:
        'What does it mean to you that Jesus is described as "the Word" and "the Light"?',
    },
    {
      day: 2,
      reference: 'Psalm 23',
      title: 'The Good Shepherd',
      intro:
        'Perhaps the most beloved poem in all of Scripture, Psalm 23 paints a picture of God as a caring shepherd. In just six verses, David captures the comfort, provision, and protection that come from trusting God completely.',
      reflectionQuestion:
        'Where in your life right now do you need the comfort of a shepherd who leads you beside still waters?',
    },
    {
      day: 3,
      reference: 'Romans 8',
      title: 'More Than Conquerors',
      intro:
        'Romans 8 is the mountaintop of Paul\'s letter — a sweeping declaration that nothing can separate us from God\'s love. It moves from the freedom we have in Christ to the glorious future that awaits, reminding us that we are more than conquerors.',
      reflectionQuestion:
        'What fears or struggles feel overwhelming right now? How does knowing "nothing can separate you from God\'s love" change your perspective?',
    },
    {
      day: 4,
      reference: 'Genesis 1',
      title: 'Creation',
      intro:
        'It all starts here. Genesis 1 reveals a God of breathtaking power and intentional design — speaking light into darkness, shaping land and sea, and creating humanity in His own image. This is where the story of everything begins.',
      reflectionQuestion:
        'What does it tell you about God that He called His creation "very good"? What does it tell you about yourself?',
    },
    {
      day: 5,
      reference: 'Matthew 5',
      title: 'Sermon on the Mount',
      intro:
        'Jesus sits down on a hillside and turns the world\'s values upside down. The Beatitudes and teachings in Matthew 5 reveal what the Kingdom of God actually looks like — and it\'s radically different from anything the crowd expected.',
      reflectionQuestion:
        'Which of the Beatitudes surprises you the most? Why?',
    },
    {
      day: 6,
      reference: 'Philippians 4',
      title: 'Rejoice Always',
      intro:
        'Writing from a prison cell, Paul pens some of the most joyful words in the Bible. Philippians 4 teaches us to find peace through prayer, to focus on what is good and true, and to discover that we can do all things through Christ who strengthens us.',
      reflectionQuestion:
        'Paul found joy in prison. What circumstances in your life feel confining, and how might gratitude shift your experience?',
    },
    {
      day: 7,
      reference: 'Revelation 21',
      title: 'All Things New',
      intro:
        'The Bible ends not with destruction but with renewal. Revelation 21 unveils a breathtaking vision of the new heaven and new earth — where God dwells with His people, every tear is wiped away, and all things are made new.',
      reflectionQuestion:
        'How does the promise of "all things made new" give you hope for what you\'re walking through today?',
    },
  ],
};
