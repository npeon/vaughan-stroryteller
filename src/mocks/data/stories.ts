// Sample stories data for testing MSW handlers
import type { CEFRLevel, StoryGenre } from '../../types/openrouter';

export interface SampleStory {
  title: string;
  content: string;
  level: CEFRLevel;
  genre: StoryGenre;
  wordCount: number;
  readingTime: number;
  vocabulary: string[];
}

export const SAMPLE_STORIES: Record<CEFRLevel, Record<StoryGenre, SampleStory[]>> = {
  A1: {
    adventure: [
      {
        title: 'The Mysterious Key',
        content: 'Tom finds a mysterious key in his garden. He wonders what it opens. Tom looks everywhere in his house. Finally, he finds a small wooden box in the attic. The key opens the box. Inside, there are old photos of his grandfather as a young man.',
        level: 'A1',
        genre: 'adventure',
        wordCount: 50,
        readingTime: 1,
        vocabulary: ['mysterious', 'garden', 'wonders', 'attic', 'wooden', 'grandfather'],
      },
      {
        title: 'Sara\'s First Camping Trip',
        content: 'Sara goes on her first camping trip with her family. They pack their tent and food. At night, Sara sees many bright stars. She makes a wish on a shooting star. The next morning, she finds a beautiful feather near their tent.',
        level: 'A1',
        genre: 'adventure',
        wordCount: 45,
        readingTime: 1,
        vocabulary: ['camping', 'pack', 'tent', 'bright', 'shooting', 'feather'],
      }
    ],
    mystery: [
      {
        title: 'The Moving Books',
        content: 'The library books keep moving by themselves. Every morning, the librarian finds them in different places. One night, she decides to stay and watch. At midnight, she sees a small cat walking between the shelves. The cat has been living in the library for months!',
        level: 'A1',
        genre: 'mystery',
        wordCount: 48,
        readingTime: 1,
        vocabulary: ['library', 'librarian', 'midnight', 'shelves', 'living'],
      }
    ],
    romance: [
      {
        title: 'Coffee Shop Love',
        content: 'Anna works in a coffee shop. Every day, a man comes to buy coffee. He always smiles at Anna but never talks. One rainy day, he forgets his umbrella. Anna runs after him with the umbrella. That\'s how they meet and start talking.',
        level: 'A1',
        genre: 'romance',
        wordCount: 45,
        readingTime: 1,
        vocabulary: ['coffee', 'smiles', 'rainy', 'umbrella', 'talking'],
      }
    ],
    science_fiction: [
      {
        title: 'The Strange Phone Call',
        content: 'Emma finds a strange phone in the park. When it rings, she answers it. The voice says it\'s calling from the year 2124. The person warns Emma about something that will happen tomorrow. Emma doesn\'t believe it until the next day.',
        level: 'A1',
        genre: 'science_fiction',
        wordCount: 43,
        readingTime: 1,
        vocabulary: ['strange', 'rings', 'voice', 'warns', 'believe'],
      }
    ],
    fantasy: [
      {
        title: 'The Fairy in the Tree',
        content: 'In the old tree in Ben\'s yard, there lives a tiny fairy. Only Ben can see her. The fairy tells Ben that the tree is magical. If Ben makes a wish and waters the tree, his wish might come true. Ben decides to try it.',
        level: 'A1',
        genre: 'fantasy',
        wordCount: 47,
        readingTime: 1,
        vocabulary: ['fairy', 'tiny', 'magical', 'waters', 'decides'],
      }
    ],
    thriller: [
      {
        title: 'The Nightly Phone Call',
        content: 'Liam gets the same phone call every night at exactly 9 PM. Nobody talks, but he can hear breathing. One night, Liam follows the sound outside. He discovers his neighbor has been trying to ask for help but can\'t speak clearly.',
        level: 'A1',
        genre: 'thriller',
        wordCount: 44,
        readingTime: 1,
        vocabulary: ['exactly', 'breathing', 'follows', 'neighbor', 'clearly'],
      }
    ],
    comedy: [
      {
        title: 'Max\'s Cooking Disaster',
        content: 'Max tries to cook dinner for his girlfriend. He burns the pasta, drops the sauce, and the smoke alarm goes off. When she arrives, the kitchen is a mess. She laughs and says, "Let\'s order pizza instead!" They have the best evening together.',
        level: 'A1',
        genre: 'comedy',
        wordCount: 46,
        readingTime: 1,
        vocabulary: ['burns', 'pasta', 'sauce', 'alarm', 'mess', 'pizza'],
      }
    ],
    drama: [
      {
        title: 'The Old Man and the Birds',
        content: 'An old man sits in the park every day, feeding birds. A young girl notices him and starts bringing bread for the birds too. They become friends. The girl learns that the man misses his granddaughter who lives far away.',
        level: 'A1',
        genre: 'drama',
        wordCount: 44,
        readingTime: 1,
        vocabulary: ['feeding', 'notices', 'bread', 'misses', 'granddaughter'],
      }
    ],
    historical: [
      {
        title: 'Moon Landing Dreams',
        content: 'In 1969, young Maria watches the moon landing on TV with her family. She dreams of becoming an astronaut. Years later, she becomes a science teacher and shows the same video to her students, inspiring them to reach for the stars.',
        level: 'A1',
        genre: 'historical',
        wordCount: 42,
        readingTime: 1,
        vocabulary: ['landing', 'astronaut', 'science', 'inspiring', 'stars'],
      }
    ],
    biography: [
      {
        title: 'Helen Keller\'s Story',
        content: 'Helen Keller could not see or hear, but she learned to communicate. Her teacher, Annie Sullivan, helped her understand words by spelling them on her hand. Helen became the first deaf-blind person to earn a college degree.',
        level: 'A1',
        genre: 'biography',
        wordCount: 40,
        readingTime: 1,
        vocabulary: ['communicate', 'spelling', 'deaf-blind', 'college', 'degree'],
      }
    ]
  },
  // Add more levels as needed for comprehensive testing
  B1: {
    adventure: [
      {
        title: 'The Lighthouse Mystery',
        content: 'Jake is exploring an old lighthouse when he discovers a hidden room behind a bookshelf. Inside, he finds a captain\'s journal from 1823 describing buried treasure on a nearby island. Jake convinces his best friend Mike to help him search for it. They rent a small boat and follow the journal\'s clues, but the weather turns stormy and they must make difficult decisions about whether to continue their quest.',
        level: 'B1',
        genre: 'adventure',
        wordCount: 72,
        readingTime: 2,
        vocabulary: ['exploring', 'lighthouse', 'discovers', 'bookshelf', 'captain', 'journal', 'treasure', 'convinces', 'stormy', 'decisions', 'continue', 'quest'],
      }
    ],
    mystery: [
      {
        title: 'The Missing Pets',
        content: 'Detective Sarah notices that several pets have gone missing in her neighborhood over the past month. The owners are worried and the police seem uninterested. Sarah decides to investigate on her own, following mysterious footprints and interviewing witnesses. What she discovers is not what anyone expected, and it changes how the whole community thinks about their quiet suburban street.',
        level: 'B1',
        genre: 'mystery',
        wordCount: 67,
        readingTime: 2,
        vocabulary: ['detective', 'neighborhood', 'uninterested', 'investigate', 'mysterious', 'footprints', 'witnesses', 'expected', 'community', 'suburban'],
      }
    ],
    romance: [
      {
        title: 'Letters to David',
        content: 'Maria has been writing letters to her pen pal David for two years, but they have never met in person. When David announces he\'s moving to Maria\'s city for work, she becomes nervous about meeting face to face. Will their friendship survive the transition from letters to reality? Their first meeting at the train station doesn\'t go as planned.',
        level: 'B1',
        genre: 'romance',
        wordCount: 65,
        readingTime: 2,
        vocabulary: ['pen pal', 'announces', 'nervous', 'friendship', 'survive', 'transition', 'reality', 'station', 'planned'],
      }
    ],
    science_fiction: [
      {
        title: 'Underwater Cities',
        content: 'In 2045, climate change has made many cities underwater. Elena works as a marine archaeologist exploring the flooded ruins of New York. During one dive, she discovers something that suggests humans aren\'t the first intelligent species to live on Earth. Her discovery could change everything we know about our planet\'s history.',
        level: 'B1',
        genre: 'science_fiction',
        wordCount: 56,
        readingTime: 2,
        vocabulary: ['climate change', 'underwater', 'archaeologist', 'flooded', 'ruins', 'intelligent', 'species', 'discovery', 'planet'],
      }
    ],
    fantasy: [
      {
        title: 'The Magical Antique Shop',
        content: 'When sixteen-year-old Marcus inherits his grandmother\'s antique shop, he discovers that some of the objects are magical. A mirror shows the future, a music box plays memories, and an old compass points to lost things. But using magic always comes with a price, and Marcus must learn to use these gifts wisely.',
        level: 'B1',
        genre: 'fantasy',
        wordCount: 59,
        readingTime: 2,
        vocabulary: ['inherits', 'antique', 'magical', 'mirror', 'compass', 'price', 'gifts', 'wisely'],
      }
    ],
    thriller: [
      {
        title: 'Messages from the Future',
        content: 'Rachel starts receiving text messages from her own phone number, warning her about events that haven\'t happened yet. At first she thinks it\'s a prank, but the messages keep coming true. Someone or something is trying to help her, but why? And what do they want in return for this information about the future?',
        level: 'B1',
        genre: 'thriller',
        wordCount: 60,
        readingTime: 2,
        vocabulary: ['receiving', 'warning', 'events', 'prank', 'messages', 'information', 'future'],
      }
    ],
    comedy: [
      {
        title: 'Cooking Competition Mix-up',
        content: 'When Dave accidentally signs up for a cooking competition instead of a book club, he\'s too embarrassed to admit his mistake. Despite being a terrible cook, he decides to compete anyway. With help from his food-loving neighbor Mrs. Chen, Dave attempts to survive three rounds of increasingly difficult culinary challenges.',
        level: 'B1',
        genre: 'comedy',
        wordCount: 58,
        readingTime: 2,
        vocabulary: ['accidentally', 'competition', 'embarrassed', 'mistake', 'terrible', 'compete', 'neighbor', 'culinary', 'challenges'],
      }
    ],
    drama: [
      {
        title: 'Dancing Dreams',
        content: 'After losing her job, 45-year-old teacher Susan decides to pursue her childhood dream of becoming a professional dancer. Her teenage daughter is embarrassed, her friends think she\'s having a midlife crisis, but Susan is determined to prove that it\'s never too late to follow your passion, even when everyone thinks you\'re too old.',
        level: 'B1',
        genre: 'drama',
        wordCount: 61,
        readingTime: 2,
        vocabulary: ['pursue', 'childhood', 'professional', 'embarrassed', 'midlife crisis', 'determined', 'passion'],
      }
    ],
    historical: [
      {
        title: 'London During the Blitz',
        content: 'During World War II, young nurse Catherine volunteers to work in London during the Blitz. Every night, bombs fall on the city while she helps injured civilians in underground shelters. Through her letters home, we see how ordinary people showed extraordinary courage during one of history\'s darkest periods.',
        level: 'B1',
        genre: 'historical',
        wordCount: 57,
        readingTime: 2,
        vocabulary: ['volunteers', 'Blitz', 'bombs', 'injured', 'civilians', 'shelters', 'extraordinary', 'courage', 'periods'],
      }
    ],
    biography: [
      {
        title: 'Marie Curie: Pioneer Scientist',
        content: 'Marie Curie was the first woman to win a Nobel Prize and the only person to win Nobel Prizes in two different sciences. Born in Poland when women couldn\'t attend university there, she moved to Paris to study. Despite facing discrimination as a woman in science, her discoveries about radioactivity changed modern medicine and physics forever.',
        level: 'B1',
        genre: 'biography',
        wordCount: 64,
        readingTime: 2,
        vocabulary: ['Nobel Prize', 'sciences', 'university', 'discrimination', 'discoveries', 'radioactivity', 'medicine', 'physics'],
      }
    ]
  },
  // Other levels can be added as needed
  A2: {
    adventure: [], mystery: [], romance: [], science_fiction: [], fantasy: [], thriller: [], comedy: [], drama: [], historical: [], biography: []
  },
  B2: {
    adventure: [], mystery: [], romance: [], science_fiction: [], fantasy: [], thriller: [], comedy: [], drama: [], historical: [], biography: []
  },
  C1: {
    adventure: [], mystery: [], romance: [], science_fiction: [], fantasy: [], thriller: [], comedy: [], drama: [], historical: [], biography: []
  },
  C2: {
    adventure: [], mystery: [], romance: [], science_fiction: [], fantasy: [], thriller: [], comedy: [], drama: [], historical: [], biography: []
  }
};

// Utility functions for story selection
export const storyUtils = {
  /**
   * Get a random story for a specific level and genre
   */
  getRandomStory(level: CEFRLevel, genre: StoryGenre): SampleStory | null {
    const stories = SAMPLE_STORIES[level]?.[genre];
    if (!stories || stories.length === 0) {
      return null;
    }
    return stories[Math.floor(Math.random() * stories.length)] ?? null;
  },

  /**
   * Get all stories for a specific level
   */
  getStoriesForLevel(level: CEFRLevel): SampleStory[] {
    const levelStories = SAMPLE_STORIES[level];
    const allStories: SampleStory[] = [];
    
    Object.values(levelStories).forEach(genreStories => {
      allStories.push(...genreStories);
    });
    
    return allStories;
  },

  /**
   * Get stories by word count range
   */
  getStoriesByWordCount(minWords: number, maxWords: number): SampleStory[] {
    const allStories: SampleStory[] = [];
    
    Object.values(SAMPLE_STORIES).forEach(levelStories => {
      Object.values(levelStories).forEach(genreStories => {
        allStories.push(...genreStories);
      });
    });
    
    return allStories.filter(story => 
      story.wordCount >= minWords && story.wordCount <= maxWords
    );
  },

  /**
   * Generate a story title based on genre
   */
  generateTitle(genre: StoryGenre): string {
    const titleTemplates: Record<StoryGenre, string[]> = {
      adventure: ['The Lost Treasure', 'Journey to the Unknown', 'The Great Quest', 'Adventure Awaits'],
      mystery: ['The Missing Clue', 'A Strange Discovery', 'The Mysterious Case', 'Secrets Revealed'],
      romance: ['Love Letters', 'A Chance Meeting', 'The Perfect Match', 'Hearts Connected'],
      science_fiction: ['Future World', 'Space Journey', 'The Time Machine', 'Robot Friends'],
      fantasy: ['The Magic Kingdom', 'Enchanted Forest', 'Dragon\'s Tale', 'Magical Powers'],
      thriller: ['The Chase', 'Dangerous Game', 'Hidden Truth', 'Race Against Time'],
      comedy: ['Funny Mistakes', 'Laugh Out Loud', 'Comedy of Errors', 'Silly Adventures'],
      drama: ['Life Changes', 'Family Matters', 'Emotional Journey', 'Real Stories'],
      historical: ['Ancient Times', 'Historical Heroes', 'Past Events', 'Time in History'],
      biography: ['Life Story', 'Famous People', 'Real Heroes', 'Inspiring Lives']
    };
    
    const templates = titleTemplates[genre] || titleTemplates.adventure;
    return templates[Math.floor(Math.random() * templates.length)] || 'Adventure Story';
  }
};