// Mock audio URLs for ElevenLabs TTS testing
// In a real implementation, these would be generated audio files

export const MOCK_AUDIO_URLS = [
  'https://mock-elevenlabs-storage.com/audio/story-1-rachel.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-2-drew.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-3-bella.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-4-antoni.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-5-thomas.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-6-charlie.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-7-george.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-8-callum.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-9-alice.mp3',
  'https://mock-elevenlabs-storage.com/audio/story-10-lily.mp3',
];

// Audio URLs by voice type for more realistic responses
export const AUDIO_URLS_BY_VOICE: Record<string, string[]> = {
  // Female voices
  'rachel': [
    'https://mock-elevenlabs-storage.com/rachel/calm-narration-1.mp3',
    'https://mock-elevenlabs-storage.com/rachel/calm-narration-2.mp3',
    'https://mock-elevenlabs-storage.com/rachel/calm-narration-3.mp3',
  ],
  'bella': [
    'https://mock-elevenlabs-storage.com/bella/soft-british-1.mp3',
    'https://mock-elevenlabs-storage.com/bella/soft-british-2.mp3',
    'https://mock-elevenlabs-storage.com/bella/soft-british-3.mp3',
  ],
  'alice': [
    'https://mock-elevenlabs-storage.com/alice/confident-voice-1.mp3',
    'https://mock-elevenlabs-storage.com/alice/confident-voice-2.mp3',
  ],
  'lily': [
    'https://mock-elevenlabs-storage.com/lily/warm-middle-aged-1.mp3',
    'https://mock-elevenlabs-storage.com/lily/warm-middle-aged-2.mp3',
  ],
  'domi': [
    'https://mock-elevenlabs-storage.com/domi/strong-female-1.mp3',
    'https://mock-elevenlabs-storage.com/domi/strong-female-2.mp3',
  ],

  // Male voices
  'drew': [
    'https://mock-elevenlabs-storage.com/drew/well-rounded-male-1.mp3',
    'https://mock-elevenlabs-storage.com/drew/well-rounded-male-2.mp3',
    'https://mock-elevenlabs-storage.com/drew/well-rounded-male-3.mp3',
  ],
  'antoni': [
    'https://mock-elevenlabs-storage.com/antoni/young-adult-male-1.mp3',
    'https://mock-elevenlabs-storage.com/antoni/young-adult-male-2.mp3',
  ],
  'thomas': [
    'https://mock-elevenlabs-storage.com/thomas/calm-mature-1.mp3',
    'https://mock-elevenlabs-storage.com/thomas/calm-mature-2.mp3',
  ],
  'charlie': [
    'https://mock-elevenlabs-storage.com/charlie/casual-middle-aged-1.mp3',
    'https://mock-elevenlabs-storage.com/charlie/casual-middle-aged-2.mp3',
  ],
  'george': [
    'https://mock-elevenlabs-storage.com/george/warm-middle-aged-1.mp3',
    'https://mock-elevenlabs-storage.com/george/warm-middle-aged-2.mp3',
  ],
  'callum': [
    'https://mock-elevenlabs-storage.com/callum/intense-young-1.mp3',
    'https://mock-elevenlabs-storage.com/callum/intense-young-2.mp3',
  ],
  'dave': [
    'https://mock-elevenlabs-storage.com/dave/conversational-1.mp3',
    'https://mock-elevenlabs-storage.com/dave/conversational-2.mp3',
  ],
  'paul': [
    'https://mock-elevenlabs-storage.com/paul/reporter-voice-1.mp3',
    'https://mock-elevenlabs-storage.com/paul/reporter-voice-2.mp3',
  ],
  'clyde': [
    'https://mock-elevenlabs-storage.com/clyde/elderly-veteran-1.mp3',
    'https://mock-elevenlabs-storage.com/clyde/elderly-veteran-2.mp3',
  ],
};

// Audio URLs by content type
export const AUDIO_URLS_BY_CONTENT: Record<string, string[]> = {
  story: [
    'https://mock-elevenlabs-storage.com/content/story-adventure-1.mp3',
    'https://mock-elevenlabs-storage.com/content/story-mystery-1.mp3',
    'https://mock-elevenlabs-storage.com/content/story-romance-1.mp3',
    'https://mock-elevenlabs-storage.com/content/story-scifi-1.mp3',
    'https://mock-elevenlabs-storage.com/content/story-fantasy-1.mp3',
  ],
  vocabulary: [
    'https://mock-elevenlabs-storage.com/content/vocab-word-1.mp3',
    'https://mock-elevenlabs-storage.com/content/vocab-word-2.mp3',
    'https://mock-elevenlabs-storage.com/content/vocab-word-3.mp3',
  ],
  sentence: [
    'https://mock-elevenlabs-storage.com/content/example-sentence-1.mp3',
    'https://mock-elevenlabs-storage.com/content/example-sentence-2.mp3',
  ],
  definition: [
    'https://mock-elevenlabs-storage.com/content/definition-1.mp3',
    'https://mock-elevenlabs-storage.com/content/definition-2.mp3',
  ],
};

// Utility functions for audio URL generation
export const audioUrlUtils = {
  /**
   * Get a random audio URL from the general pool
   */
  getRandomAudioUrl(): string {
    return MOCK_AUDIO_URLS[Math.floor(Math.random() * MOCK_AUDIO_URLS.length)] || MOCK_AUDIO_URLS[0] || 'https://mock-audio-default.mp3';
  },

  /**
   * Get an audio URL for a specific voice
   */
  getAudioUrlForVoice(voiceId: string): string {
    const voiceName = extractVoiceName(voiceId);
    const voiceUrls = AUDIO_URLS_BY_VOICE[voiceName.toLowerCase()];
    
    if (voiceUrls && voiceUrls.length > 0) {
      return voiceUrls[Math.floor(Math.random() * voiceUrls.length)] || voiceUrls[0] || 'https://mock-audio-voice.mp3';
    }
    
    return audioUrlUtils.getRandomAudioUrl();
  },

  /**
   * Get an audio URL for specific content type
   */
  getAudioUrlForContent(contentType: 'story' | 'vocabulary' | 'sentence' | 'definition'): string {
    const contentUrls = AUDIO_URLS_BY_CONTENT[contentType];
    
    if (contentUrls && contentUrls.length > 0) {
      return contentUrls[Math.floor(Math.random() * contentUrls.length)] || contentUrls[0] || 'https://mock-audio-content.mp3';
    }
    
    return audioUrlUtils.getRandomAudioUrl();
  },

  /**
   * Generate a realistic audio URL based on voice and content
   */
  generateAudioUrl(voiceId: string, contentType?: string, textLength?: number): string {
    const voiceName = extractVoiceName(voiceId);
    const timestamp = Date.now();
    const hash = Math.random().toString(36).substring(2, 8);
    
    // Generate URL based on text length for more realistic file names
    let sizeIndicator = 'short';
    if (textLength) {
      if (textLength > 500) sizeIndicator = 'long';
      else if (textLength > 200) sizeIndicator = 'medium';
    }
    
    const contentPrefix = contentType || 'audio';
    
    return `https://mock-elevenlabs-storage.com/${voiceName}/${contentPrefix}-${sizeIndicator}-${timestamp}-${hash}.mp3`;
  },

  /**
   * Estimate audio duration based on text length
   * Assumes ~150 words per minute reading speed
   */
  estimateAudioDuration(text: string): number {
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 150;
    const durationMinutes = words / wordsPerMinute;
    const durationSeconds = Math.max(Math.round(durationMinutes * 60), 1);
    
    return durationSeconds;
  },

  /**
   * Calculate characters used (including spaces and punctuation)
   */
  calculateCharactersUsed(text: string): number {
    return text.length;
  },
};

/**
 * Extract voice name from ElevenLabs voice ID
 * Maps voice IDs to readable names
 */
function extractVoiceName(voiceId: string): string {
  const voiceIdToName: Record<string, string> = {
    '21m00Tcm4TlvDq8ikWAM': 'rachel',
    '29vD33N1CtxCmqQRPOHJ': 'drew',
    '2EiwWnXFnvU5JabPnv8n': 'clyde',
    '5Q0t7uMcjvnagumLfvZi': 'paul',
    'AZnzlk1XvdvUeBnXmlld': 'domi',
    'CYw3kZ02Hs0563khs1Fj': 'dave',
    'ErXwobaYiN019PkySvjV': 'antoni',
    'GBv7mTt0atIp3BR8iCqE': 'thomas',
    'IKne3meq5aSn9XLyUdCD': 'charlie',
    'JBFqnCBsd6RMkjVDRZzb': 'george',
    'N2lVS1w4EtoT3dr4eOWO': 'callum',
    'EXAVITQu4vr4xnSDxMaL': 'bella',
    'Xb7hH8MSUJpSbSDYk0k2': 'alice',
    'pFZP5JQG7iQjIQuC4Bku': 'lily',
  };

  return voiceIdToName[voiceId] || 'unknown';
}