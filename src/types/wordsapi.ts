// WordsAPI Types
// https://www.wordsapi.com/docs/

export interface WordsApiWord {
  word: string;
  results?: WordsApiResult[];
  syllables?: {
    count: number;
    list: string[];
  };
  pronunciation?: {
    all?: string;
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  frequency?: number;
}

export interface WordsApiResult {
  definition: string;
  partOfSpeech: string;
  synonyms?: string[];
  antonyms?: string[];
  derivation?: string[];
  examples?: string[];
  typeOf?: string[];
  hasTypes?: string[];
  partOf?: string[];
  hasParts?: string[];
  instanceOf?: string[];
  hasInstances?: string[];
  also?: string[];
  entails?: string[];
  similar?: string[];
  attribute?: string[];
  pertainsTo?: string[];
  inCategory?: string[];
  hasCategories?: string[];
  usageOf?: string[];
  hasUsages?: string[];
  inRegion?: string[];
  regionOf?: string[];
  hasMembers?: string[];
  memberOf?: string[];
  hasSubstances?: string[];
  substanceOf?: string[];
}

export interface WordsApiError {
  success: boolean;
  message: string;
}

// Specific endpoints responses
export interface WordsApiDefinitionsResponse {
  word: string;
  definitions: {
    partOfSpeech: string;
    definition: string;
  }[];
}

export interface WordsApiPronunciationResponse {
  word: string;
  pronunciation: {
    all?: string;
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
}

export interface WordsApiSynonymsResponse {
  word: string;
  synonyms: string[];
}

export interface WordsApiAntonymsResponse {
  word: string;
  antonyms: string[];
}

export interface WordsApiExamplesResponse {
  word: string;
  examples: string[];
}

export interface WordsApiFrequencyResponse {
  word: string;
  frequency: {
    zipf: number;
    perMillion: number;
    diversity: number;
  };
}

// Supported parts of speech
export type PartOfSpeech = 
  | 'noun'
  | 'verb' 
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'determiner'
  | 'exclamation'
  | 'abbreviation'
  | 'particle';

// WordsAPI request parameters
export interface WordLookupRequest {
  word: string;
  include?: ('definitions' | 'pronunciation' | 'synonyms' | 'antonyms' | 'examples' | 'frequency')[];
}

// Enhanced word data for our application
export interface EnhancedWordData {
  word: string;
  definitions: {
    partOfSpeech: PartOfSpeech;
    definition: string;
    examples?: string[];
  }[];
  pronunciation?: {
    phonetic?: string;
    audio_url?: string;
  };
  synonyms?: string[];
  antonyms?: string[];
  difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  frequency_score?: number;
  syllable_count?: number;
  etymology?: string;
  common_phrases?: string[];
  learning_tips?: string;
  created_at: string;
  updated_at: string;
}

// Vocabulary learning context
export interface VocabularyContext {
  source_story_id?: string;
  source_sentence?: string;
  learning_session_id?: string;
  user_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  added_at: string;
  last_reviewed?: string;
  review_count: number;
  mastery_level: 'new' | 'learning' | 'familiar' | 'mastered';
}

// Combined word data for learning system
export interface VocabularyEntry extends EnhancedWordData {
  context: VocabularyContext;
  spaced_repetition: {
    next_review_date: string;
    interval_days: number;
    ease_factor: number;
    consecutive_correct: number;
  };
}