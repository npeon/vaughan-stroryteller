// Mock vocabulary data for WordsAPI testing
import type { EnhancedWordData, PartOfSpeech } from '../../types/wordsapi';

// Common vocabulary words with detailed mock data
export const MOCK_VOCABULARY: Record<string, EnhancedWordData> = {
  'adventure': {
    word: 'adventure',
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'An exciting or very unusual experience',
        examples: [
          'They went on an adventure in the mountains',
          'Life is an adventure',
          'The book tells of his adventures in Africa'
        ]
      },
      {
        partOfSpeech: 'verb',
        definition: 'To take part in a risky undertaking',
        examples: [
          'He decided to adventure into the unknown',
          'She adventured across the desert'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ədˈventʃər',
      audio_url: 'https://mock-wordsapi-audio.com/adventure.mp3'
    },
    synonyms: ['journey', 'expedition', 'quest', 'voyage', 'excursion'],
    antonyms: ['routine', 'boredom', 'monotony'],
    difficulty_level: 'B1',
    frequency_score: 7.2,
    syllable_count: 3,
    etymology: 'Middle English: from Old French aventure, from Latin adventura',
    common_phrases: ['go on an adventure', 'adventure story', 'sense of adventure'],
    learning_tips: 'Remember: Adventure = exciting experience or journey',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'mystery': {
    word: 'mystery',
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'Something that is difficult or impossible to understand or explain',
        examples: [
          'The disappearance remains a mystery',
          'She loves reading mystery novels',
          'The mystery was finally solved'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ˈmɪstəri',
      audio_url: 'https://mock-wordsapi-audio.com/mystery.mp3'
    },
    synonyms: ['puzzle', 'enigma', 'riddle', 'secret', 'conundrum'],
    difficulty_level: 'A2',
    frequency_score: 6.8,
    syllable_count: 3,
    etymology: 'Latin mysterium, from Greek mustērion',
    common_phrases: ['solve a mystery', 'mystery novel', 'remain a mystery'],
    learning_tips: 'Think: Something mysterious = hard to understand',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'beautiful': {
    word: 'beautiful',
    definitions: [
      {
        partOfSpeech: 'adjective',
        definition: 'Pleasing the senses or mind aesthetically',
        examples: [
          'She looked beautiful in her dress',
          'The sunset was beautiful',
          'What a beautiful piece of music'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ˈbjuːtɪfʊl',
      audio_url: 'https://mock-wordsapi-audio.com/beautiful.mp3'
    },
    synonyms: ['lovely', 'attractive', 'gorgeous', 'stunning', 'pretty'],
    antonyms: ['ugly', 'hideous', 'unattractive', 'repulsive'],
    difficulty_level: 'A1',
    frequency_score: 8.9,
    syllable_count: 3,
    etymology: 'Middle English: from Old French bel, beau + -ful',
    common_phrases: ['beautiful woman', 'beautiful day', 'beautiful view'],
    learning_tips: 'Beauty-ful = full of beauty. Notice the spelling: beau-ti-ful',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'understand': {
    word: 'understand',
    definitions: [
      {
        partOfSpeech: 'verb',
        definition: 'Perceive the intended meaning of words, language, or a speaker',
        examples: [
          'I understand what you mean',
          'Do you understand the instructions?',
          'She understands three languages'
        ]
      },
      {
        partOfSpeech: 'verb',
        definition: 'Interpret or view in a particular way',
        examples: [
          'I understand this to mean that we should wait',
          'How do you understand this situation?'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ˌʌndərˈstænd',
      audio_url: 'https://mock-wordsapi-audio.com/understand.mp3'
    },
    synonyms: ['comprehend', 'grasp', 'realize', 'appreciate', 'perceive'],
    antonyms: ['misunderstand', 'confuse', 'misinterpret'],
    difficulty_level: 'A2',
    frequency_score: 9.5,
    syllable_count: 3,
    etymology: 'Old English understandan',
    common_phrases: ['understand completely', 'make understand', 'easy to understand'],
    learning_tips: 'Under-stand = stand under something to grasp it',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'challenge': {
    word: 'challenge',
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'A call to take part in a contest or competition',
        examples: [
          'She accepted the challenge',
          'This job is a real challenge',
          'The challenge of learning a new language'
        ]
      },
      {
        partOfSpeech: 'verb',
        definition: 'Invite someone to engage in a contest',
        examples: [
          'He challenged me to a game of chess',
          'The teacher challenged her students to think critically'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ˈtʃælɪndʒ',
      audio_url: 'https://mock-wordsapi-audio.com/challenge.mp3'
    },
    synonyms: ['contest', 'competition', 'trial', 'test', 'dare'],
    difficulty_level: 'B1',
    frequency_score: 7.8,
    syllable_count: 2,
    etymology: 'Middle English: from Old French chalenge',
    common_phrases: ['accept a challenge', 'face a challenge', 'challenge yourself'],
    learning_tips: 'Challenge = something that tests your abilities',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'discover': {
    word: 'discover',
    definitions: [
      {
        partOfSpeech: 'verb',
        definition: 'Find something or someone unexpectedly or in the course of a search',
        examples: [
          'Scientists discovered a new species',
          'I discovered the truth about what happened',
          'Columbus discovered America in 1492'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'dɪˈskʌvər',
      audio_url: 'https://mock-wordsapi-audio.com/discover.mp3'
    },
    synonyms: ['find', 'uncover', 'detect', 'reveal', 'locate'],
    antonyms: ['lose', 'hide', 'conceal', 'cover'],
    difficulty_level: 'B1',
    frequency_score: 8.1,
    syllable_count: 3,
    etymology: 'Latin dis- + cooperire (to cover)',
    common_phrases: ['discover something new', 'discover by accident', 'great discovery'],
    learning_tips: 'Dis-cover = remove the cover to find something hidden',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'friendship': {
    word: 'friendship',
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'The emotions or conduct of friends; the state of being friends',
        examples: [
          'Their friendship lasted for decades',
          'True friendship is precious',
          'She values friendship above all else'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ˈfrendʃɪp',
      audio_url: 'https://mock-wordsapi-audio.com/friendship.mp3'
    },
    synonyms: ['companionship', 'fellowship', 'camaraderie', 'bond', 'alliance'],
    antonyms: ['enmity', 'hostility', 'animosity'],
    difficulty_level: 'A2',
    frequency_score: 6.5,
    syllable_count: 2,
    etymology: 'Friend + -ship (suffix meaning state or quality)',
    common_phrases: ['close friendship', 'lasting friendship', 'friendship bracelet'],
    learning_tips: 'Friend-ship = the state of being friends',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'important': {
    word: 'important',
    definitions: [
      {
        partOfSpeech: 'adjective',
        definition: 'Of great significance or value; likely to have a profound effect',
        examples: [
          'This is an important decision',
          'Education is important for everyone',
          'She plays an important role in the company'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ɪmˈpɔːtənt',
      audio_url: 'https://mock-wordsapi-audio.com/important.mp3'
    },
    synonyms: ['significant', 'crucial', 'vital', 'essential', 'major'],
    antonyms: ['unimportant', 'trivial', 'insignificant', 'minor'],
    difficulty_level: 'A2',
    frequency_score: 9.0,
    syllable_count: 3,
    etymology: 'Latin importare (to bring in, to matter)',
    common_phrases: ['very important', 'important decision', 'important person'],
    learning_tips: 'Import-ant = something that matters and should be brought to attention',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'knowledge': {
    word: 'knowledge',
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'Facts, information, and skills acquired through experience or education',
        examples: [
          'She has extensive knowledge of art history',
          'Knowledge is power',
          'He shared his knowledge with the students'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ˈnɒlɪdʒ',
      audio_url: 'https://mock-wordsapi-audio.com/knowledge.mp3'
    },
    synonyms: ['information', 'learning', 'wisdom', 'understanding', 'expertise'],
    difficulty_level: 'B1',
    frequency_score: 8.3,
    syllable_count: 2,
    etymology: 'Middle English: from acknowledge',
    common_phrases: ['general knowledge', 'knowledge base', 'to my knowledge'],
    learning_tips: 'Know-ledge = what you know or have learned',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  },

  'experience': {
    word: 'experience',
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'Practical contact with and observation of facts or events',
        examples: [
          'She has 10 years of experience in marketing',
          'That was a terrible experience',
          'Experience is the best teacher'
        ]
      },
      {
        partOfSpeech: 'verb',
        definition: 'Encounter or undergo an event or occurrence',
        examples: [
          'Did you experience any problems?',
          'We experienced heavy rain during our trip'
        ]
      }
    ],
    pronunciation: {
      phonetic: 'ɪkˈspɪəriəns',
      audio_url: 'https://mock-wordsapi-audio.com/experience.mp3'
    },
    synonyms: ['encounter', 'undergo', 'knowledge', 'expertise', 'background'],
    difficulty_level: 'B1',
    frequency_score: 8.7,
    syllable_count: 4,
    etymology: 'Latin experientia (a trial, test)',
    common_phrases: ['work experience', 'life experience', 'bad experience'],
    learning_tips: 'Experience = what happens to you or what you learn by doing',
    created_at: '2024-08-27T10:00:00Z',
    updated_at: '2024-08-27T10:00:00Z'
  }
};

// Common words by CEFR level for testing
export const VOCABULARY_BY_LEVEL: Record<string, string[]> = {
  A1: [
    'hello', 'goodbye', 'please', 'thank you', 'yes', 'no', 'good', 'bad',
    'big', 'small', 'hot', 'cold', 'happy', 'sad', 'beautiful', 'ugly',
    'house', 'car', 'book', 'water', 'food', 'friend', 'family', 'work'
  ],
  A2: [
    'important', 'interesting', 'difficult', 'easy', 'expensive', 'cheap',
    'understand', 'remember', 'forget', 'learn', 'teach', 'study',
    'adventure', 'mystery', 'friendship', 'knowledge', 'experience'
  ],
  B1: [
    'challenge', 'discover', 'achieve', 'succeed', 'failure', 'opportunity',
    'responsibility', 'independence', 'confidence', 'development', 'progress'
  ],
  B2: [
    'significance', 'consequence', 'phenomenon', 'implementation', 'establishment',
    'accommodation', 'appreciation', 'determination', 'recommendation'
  ],
  C1: [
    'comprehensive', 'sophisticated', 'unprecedented', 'substantial', 'inevitable',
    'deteriorate', 'facilitate', 'accommodate', 'manipulate', 'collaborate'
  ],
  C2: [
    'contemporary', 'revolutionary', 'controversial', 'fundamental', 'unprecedented',
    'synthesize', 'differentiate', 'substantiate', 'conceptualize', 'contextualize'
  ]
};

// Parts of speech frequency data
export const PARTS_OF_SPEECH_DATA: Record<PartOfSpeech, { frequency: number; examples: string[] }> = {
  noun: {
    frequency: 0.35,
    examples: ['adventure', 'mystery', 'friendship', 'knowledge', 'experience', 'challenge']
  },
  verb: {
    frequency: 0.25,
    examples: ['understand', 'discover', 'challenge', 'experience', 'learn', 'teach']
  },
  adjective: {
    frequency: 0.20,
    examples: ['beautiful', 'important', 'difficult', 'interesting', 'expensive']
  },
  adverb: {
    frequency: 0.10,
    examples: ['quickly', 'carefully', 'completely', 'especially', 'probably']
  },
  pronoun: {
    frequency: 0.05,
    examples: ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that']
  },
  preposition: {
    frequency: 0.03,
    examples: ['in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'about']
  },
  conjunction: {
    frequency: 0.015,
    examples: ['and', 'but', 'or', 'because', 'although', 'while', 'since']
  },
  interjection: {
    frequency: 0.005,
    examples: ['oh', 'wow', 'hello', 'goodbye', 'please', 'thanks']
  },
  determiner: {
    frequency: 0.02,
    examples: ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your']
  },
  exclamation: {
    frequency: 0.005,
    examples: ['wow!', 'amazing!', 'fantastic!', 'incredible!']
  },
  abbreviation: {
    frequency: 0.01,
    examples: ['etc.', 'e.g.', 'i.e.', 'Mr.', 'Mrs.', 'Dr.']
  },
  particle: {
    frequency: 0.01,
    examples: ['up', 'down', 'in', 'out', 'on', 'off', 'over', 'under']
  }
};

// Utility functions for vocabulary testing
export const vocabularyUtils = {
  /**
   * Get mock word data by word
   */
  getMockWord(word: string): EnhancedWordData | null {
    return MOCK_VOCABULARY[word.toLowerCase()] || null;
  },

  /**
   * Get random words by CEFR level
   */
  getRandomWordsByLevel(level: string, count: number = 5): string[] {
    const words = VOCABULARY_BY_LEVEL[level.toUpperCase()] || VOCABULARY_BY_LEVEL.A1 || [];
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  /**
   * Generate mock definition for unknown words
   */
  generateMockDefinition(word: string, partOfSpeech: PartOfSpeech = 'noun'): EnhancedWordData {
    return {
      word: word.toLowerCase(),
      definitions: [
        {
          partOfSpeech,
          definition: `Mock definition for "${word}" (generated for testing)`,
          examples: [`This is an example sentence with ${word}.`]
        }
      ],
      difficulty_level: 'B1',
      frequency_score: Math.random() * 10,
      syllable_count: Math.max(1, Math.round(word.length / 3)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Check if word should return 404 (for testing error cases)
   */
  shouldReturnNotFound(word: string): boolean {
    const notFoundWords = ['asdfgh', 'qwerty', 'xyzabc', 'nonexistentword'];
    return notFoundWords.includes(word.toLowerCase());
  },

  /**
   * Get words by difficulty level
   */
  getWordsByDifficulty(difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): EnhancedWordData[] {
    return Object.values(MOCK_VOCABULARY).filter(word => word.difficulty_level === difficulty);
  },

  /**
   * Get words by part of speech
   */
  getWordsByPartOfSpeech(partOfSpeech: PartOfSpeech): EnhancedWordData[] {
    return Object.values(MOCK_VOCABULARY).filter(word => 
      word.definitions.some(def => def.partOfSpeech === partOfSpeech)
    );
  }
};