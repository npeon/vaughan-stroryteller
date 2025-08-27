// ElevenLabs API Types
// https://docs.elevenlabs.io/api-reference

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples: null;
  category: string;
  fine_tuning: {
    model_id: string | null;
    is_allowed_to_fine_tune: boolean;
    state: 'not_started' | 'is_fine_tuning' | 'fine_tuned';
    verification_failures: string[];
    verification_attempts_count: number;
    manual_verification_requested: boolean;
  };
  labels: { [key: string]: string };
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  sharing: {
    status: 'enabled' | 'disabled';
    history_item_sample_id: string;
    original_voice_id: string;
    public_owner_id: string;
    liked_by_count: number;
    cloned_by_count: number;
  };
  high_quality_base_model_ids: string[];
}

export interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
}

export interface ElevenLabsTTSRequest {
  text: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsTTSResponse {
  audio_url: string;
  audio_duration_seconds: number;
  characters_used: number;
  voice_id: string;
  model_id: string;
}

export interface ElevenLabsError {
  detail: {
    status: string;
    message: string;
  };
}

// Pre-built voice IDs for different story types
export const ELEVENLABS_VOICES = {
  // Professional English voices
  RACHEL: '21m00Tcm4TlvDq8ikWAM', // Calm, young adult female
  DREW: '29vD33N1CtxCmqQRPOHJ', // Well-rounded, middle-aged male
  CLYDE: '2EiwWnXFnvU5JabPnv8n', // War veteran, elderly male
  PAUL: '5Q0t7uMcjvnagumLfvZi', // Ground reporter, mature male
  DOMI: 'AZnzlk1XvdvUeBnXmlld', // Strong, young adult female
  DAVE: 'CYw3kZ02Hs0563khs1Fj', // Conversational, young adult male
  ANTONI: 'ErXwobaYiN019PkySvjV', // Well-rounded, young adult male
  THOMAS: 'GBv7mTt0atIp3BR8iCqE', // Calm, mature male
  CHARLIE: 'IKne3meq5aSn9XLyUdCD', // Casual, middle-aged male
  GEORGE: 'JBFqnCBsd6RMkjVDRZzb', // Warm, middle-aged male
  CALLUM: 'N2lVS1w4EtoT3dr4eOWO', // Intense, young adult male
  BELLA: 'EXAVITQu4vr4xnSDxMaL', // Soft, young adult female
  ALICE: 'Xb7hH8MSUJpSbSDYk0k2', // Confident, young adult female
  LILY: 'pFZP5JQG7iQjIQuC4Bku', // Warm, middle-aged female
  SARAH: 'EXAVITQu4vr4xnSDxMaL', // British, soft female
} as const;

export type ElevenLabsVoiceId = typeof ELEVENLABS_VOICES[keyof typeof ELEVENLABS_VOICES];

// Voice settings presets
export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export const VOICE_SETTINGS_PRESETS: Record<string, VoiceSettings> = {
  CLEAR_NARRATION: {
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.3,
    use_speaker_boost: true,
  },
  EXPRESSIVE_READING: {
    stability: 0.3,
    similarity_boost: 0.7,
    style: 0.6,
    use_speaker_boost: true,
  },
  CALM_TEACHING: {
    stability: 0.8,
    similarity_boost: 0.4,
    style: 0.2,
    use_speaker_boost: false,
  },
};

// TTS models available
export const ELEVENLABS_MODELS = {
  ELEVEN_MONOLINGUAL_V1: 'eleven_monolingual_v1',
  ELEVEN_MULTILINGUAL_V1: 'eleven_multilingual_v1',
  ELEVEN_MULTILINGUAL_V2: 'eleven_multilingual_v2',
  ELEVEN_TURBO_V2: 'eleven_turbo_v2',
} as const;

export type ElevenLabsModelId = typeof ELEVENLABS_MODELS[keyof typeof ELEVENLABS_MODELS];

// Audio generation request for story narration
export interface AudioGenerationRequest {
  text: string;
  voice_id: ElevenLabsVoiceId;
  model_id?: ElevenLabsModelId;
  voice_settings?: VoiceSettings;
  story_id?: string;
  chunk_id?: string; // For splitting long stories
}

// Audio generation response
export interface AudioGenerationResponse {
  audio_url: string;
  audio_duration_seconds: number;
  characters_used: number;
  voice_id: string;
  model_id: string;
  story_id?: string;
  chunk_id?: string;
  generated_at: string;
}