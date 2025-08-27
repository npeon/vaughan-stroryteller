import { http, HttpResponse } from 'msw';
import type { 
  WordsApiWord,
  WordsApiError,
  WordsApiDefinitionsResponse,
  WordsApiPronunciationResponse,
  WordsApiSynonymsResponse,
  WordsApiAntonymsResponse,
  WordsApiExamplesResponse,
  WordsApiFrequencyResponse,
} from '../../types/wordsapi';

// Mock dictionary data for common English words
const MOCK_DICTIONARY: Record<string, WordsApiWord> = {
  'adventure': {
    word: 'adventure',
    results: [
      {
        definition: 'An exciting or very unusual experience',
        partOfSpeech: 'noun',
        synonyms: ['journey', 'expedition', 'quest', 'voyage'],
        examples: ['They went on an adventure in the mountains', 'Life is an adventure'],
        typeOf: ['experience', 'undertaking'],
      },
      {
        definition: 'To take part in a risky undertaking',
        partOfSpeech: 'verb',
        synonyms: ['venture', 'dare', 'risk'],
        examples: ['He decided to adventure into the unknown'],
        entails: ['risk', 'explore'],
      }
    ],
    syllables: {
      count: 3,
      list: ['ad', 'ven', 'ture']
    },
    pronunciation: {
      all: 'ədˈventʃər',
      noun: 'ədˈventʃər',
      verb: 'ədˈventʃər'
    },
    frequency: 7.2,
  },
  'mystery': {
    word: 'mystery',
    results: [
      {
        definition: 'Something that is difficult or impossible to understand or explain',
        partOfSpeech: 'noun',
        synonyms: ['puzzle', 'enigma', 'riddle', 'secret'],
        examples: ['The disappearance remains a mystery', 'She loves reading mystery novels'],
        typeOf: ['perplexity', 'problem'],
      }
    ],
    syllables: {
      count: 3,
      list: ['mys', 'ter', 'y']
    },
    pronunciation: {
      all: 'ˈmɪstəri'
    },
    frequency: 6.8,
  },
  'beautiful': {
    word: 'beautiful',
    results: [
      {
        definition: 'Pleasing the senses or mind aesthetically',
        partOfSpeech: 'adjective',
        synonyms: ['lovely', 'attractive', 'gorgeous', 'stunning'],
        antonyms: ['ugly', 'hideous', 'unattractive'],
        examples: ['She looked beautiful in her dress', 'The sunset was beautiful'],
        attribute: ['beauty'],
      }
    ],
    syllables: {
      count: 3,
      list: ['beau', 'ti', 'ful']
    },
    pronunciation: {
      all: 'ˈbjuːtɪfʊl'
    },
    frequency: 8.9,
  },
  'understand': {
    word: 'understand',
    results: [
      {
        definition: 'Perceive the intended meaning of words, language, or a speaker',
        partOfSpeech: 'verb',
        synonyms: ['comprehend', 'grasp', 'realize', 'appreciate'],
        antonyms: ['misunderstand', 'confuse'],
        examples: ['I understand what you mean', 'Do you understand the instructions?'],
        entails: ['perceive', 'know'],
      },
      {
        definition: 'Interpret or view in a particular way',
        partOfSpeech: 'verb',
        synonyms: ['interpret', 'construe', 'take'],
        examples: ['I understand this to mean that we should wait'],
      }
    ],
    syllables: {
      count: 3,
      list: ['un', 'der', 'stand']
    },
    pronunciation: {
      all: 'ˌʌndərˈstænd'
    },
    frequency: 9.5,
  },
  'challenge': {
    word: 'challenge',
    results: [
      {
        definition: 'A call to take part in a contest or competition',
        partOfSpeech: 'noun',
        synonyms: ['contest', 'competition', 'trial', 'test'],
        examples: ['She accepted the challenge', 'This job is a real challenge'],
        typeOf: ['contest', 'competition'],
      },
      {
        definition: 'Invite someone to engage in a contest',
        partOfSpeech: 'verb',
        synonyms: ['dare', 'provoke', 'confront'],
        examples: ['He challenged me to a game of chess'],
        entails: ['invite', 'provoke'],
      }
    ],
    syllables: {
      count: 2,
      list: ['chal', 'lenge']
    },
    pronunciation: {
      all: 'ˈtʃælɪndʒ'
    },
    frequency: 7.8,
  },
  'library': {
    word: 'library',
    results: [
      {
        definition: 'A building or room containing collections of books for reading or borrowing',
        partOfSpeech: 'noun',
        synonyms: ['archive', 'repository', 'collection'],
        examples: ['I borrowed this book from the library', 'She works at the university library'],
        typeOf: ['building', 'room', 'institution'],
        hasParts: ['books', 'shelves', 'reading room'],
      }
    ],
    syllables: {
      count: 3,
      list: ['li', 'brar', 'y']
    },
    pronunciation: {
      all: 'ˈlaɪbrəri'
    },
    frequency: 6.2,
  },
  'discover': {
    word: 'discover',
    results: [
      {
        definition: 'Find something or someone unexpectedly or in the course of a search',
        partOfSpeech: 'verb',
        synonyms: ['find', 'uncover', 'detect', 'reveal'],
        antonyms: ['lose', 'hide', 'conceal'],
        examples: ['Scientists discovered a new species', 'I discovered the truth about what happened'],
        entails: ['find', 'learn'],
      }
    ],
    syllables: {
      count: 3,
      list: ['dis', 'cov', 'er']
    },
    pronunciation: {
      all: 'dɪˈskʌvər'
    },
    frequency: 8.1,
  },
  'friendship': {
    word: 'friendship',
    results: [
      {
        definition: 'The emotions or conduct of friends; the state of being friends',
        partOfSpeech: 'noun',
        synonyms: ['companionship', 'fellowship', 'camaraderie', 'bond'],
        antonyms: ['enmity', 'hostility'],
        examples: ['Their friendship lasted for decades', 'True friendship is precious'],
        typeOf: ['relationship', 'affection'],
      }
    ],
    syllables: {
      count: 2,
      list: ['friend', 'ship']
    },
    pronunciation: {
      all: 'ˈfrendʃɪp'
    },
    frequency: 6.5,
  },
  'example': {
    word: 'example',
    results: [
      {
        definition: 'A thing characteristic of its kind or illustrating a general rule',
        partOfSpeech: 'noun',
        synonyms: ['instance', 'illustration', 'case', 'sample'],
        examples: ['This is a good example of modern art', 'Can you give me an example?'],
        typeOf: ['information', 'representative'],
      }
    ],
    syllables: {
      count: 3,
      list: ['ex', 'am', 'ple']
    },
    pronunciation: {
      all: 'ɪɡˈzæmpəl'
    },
    frequency: 9.2,
  },
};

// Common words that might not be found
const NOT_FOUND_WORDS = ['asdfgh', 'qwerty', 'xyzabc', 'nonexistentword'];

export const wordsApiHandlers = [
  // Main word lookup endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    
    // Simulate rate limiting (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: 'Rate limit exceeded. Please wait before making another request.',
        },
        { status: 429 }
      );
    }

    // Check if word is in not-found list
    if (NOT_FOUND_WORDS.includes(word)) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No word found with the word '${word}'`,
        },
        { status: 404 }
      );
    }

    // Get word data from mock dictionary
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData) {
      // For unknown words, generate a basic response
      const basicResponse: WordsApiWord = {
        word: word,
        results: [
          {
            definition: `Definition for "${word}" not available in mock data`,
            partOfSpeech: 'noun',
            examples: [`This is an example sentence with ${word}`],
          }
        ],
        frequency: Math.random() * 10,
      };
      
      // Simulate network delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(HttpResponse.json(basicResponse));
        }, Math.random() * 1500 + 300);
      });
    }

    // Simulate network delay for real words
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json(wordData));
      }, Math.random() * 1000 + 200);
    });
  }),

  // Specific definitions endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/definitions', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No definitions found for '${word}'`,
        },
        { status: 404 }
      );
    }

    const definitions = wordData.results?.map(result => ({
      partOfSpeech: result.partOfSpeech,
      definition: result.definition,
    })) || [];

    const response: WordsApiDefinitionsResponse = {
      word: word,
      definitions: definitions,
    };

    return HttpResponse.json(response);
  }),

  // Pronunciation endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/pronunciation', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData || !wordData.pronunciation) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No pronunciation found for '${word}'`,
        },
        { status: 404 }
      );
    }

    const response: WordsApiPronunciationResponse = {
      word: word,
      pronunciation: wordData.pronunciation,
    };

    return HttpResponse.json(response);
  }),

  // Synonyms endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/synonyms', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No synonyms found for '${word}'`,
        },
        { status: 404 }
      );
    }

    // Collect all synonyms from all results
    const allSynonyms = wordData.results?.reduce((acc: string[], result) => {
      if (result.synonyms) {
        acc.push(...result.synonyms);
      }
      return acc;
    }, []) || [];

    const response: WordsApiSynonymsResponse = {
      word: word,
      synonyms: [...new Set(allSynonyms)], // Remove duplicates
    };

    return HttpResponse.json(response);
  }),

  // Antonyms endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/antonyms', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No antonyms found for '${word}'`,
        },
        { status: 404 }
      );
    }

    // Collect all antonyms from all results
    const allAntonyms = wordData.results?.reduce((acc: string[], result) => {
      if (result.antonyms) {
        acc.push(...result.antonyms);
      }
      return acc;
    }, []) || [];

    if (allAntonyms.length === 0) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No antonyms found for '${word}'`,
        },
        { status: 404 }
      );
    }

    const response: WordsApiAntonymsResponse = {
      word: word,
      antonyms: [...new Set(allAntonyms)], // Remove duplicates
    };

    return HttpResponse.json(response);
  }),

  // Examples endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/examples', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No examples found for '${word}'`,
        },
        { status: 404 }
      );
    }

    // Collect all examples from all results
    const allExamples = wordData.results?.reduce((acc: string[], result) => {
      if (result.examples) {
        acc.push(...result.examples);
      }
      return acc;
    }, []) || [];

    const response: WordsApiExamplesResponse = {
      word: word,
      examples: allExamples,
    };

    return HttpResponse.json(response);
  }),

  // Frequency endpoint
  http.get('https://wordsapiv1.p.rapidapi.com/words/:word/frequency', ({ params }) => {
    const word = (params.word as string).toLowerCase();
    const wordData = MOCK_DICTIONARY[word];
    
    if (!wordData || wordData.frequency === undefined) {
      return HttpResponse.json<WordsApiError>(
        {
          success: false,
          message: `No frequency data found for '${word}'`,
        },
        { status: 404 }
      );
    }

    // Convert our simple frequency to Zipf-like metrics
    const baseFreq = wordData.frequency;
    const response: WordsApiFrequencyResponse = {
      word: word,
      frequency: {
        zipf: baseFreq,
        perMillion: Math.round(Math.pow(10, baseFreq - 3)),
        diversity: Math.round((baseFreq / 10) * 100) / 100,
      },
    };

    return HttpResponse.json(response);
  }),

  // Random word endpoint (useful for testing)
  http.get('https://wordsapiv1.p.rapidapi.com/words/', ({ request }) => {
    const url = new URL(request.url);
    const random = url.searchParams.get('random');
    
    if (random === 'true') {
      // Return a random word from our dictionary
      const words = Object.keys(MOCK_DICTIONARY);
      const randomWord = words[Math.floor(Math.random() * words.length)] || words[0] || 'hello';
      const wordData = MOCK_DICTIONARY[randomWord];
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(HttpResponse.json(wordData));
        }, Math.random() * 800 + 200);
      });
    }

    return HttpResponse.json<WordsApiError>(
      {
        success: false,
        message: 'Please specify a word or use random=true parameter',
      },
      { status: 400 }
    );
  }),
];