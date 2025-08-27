import { http, HttpResponse } from 'msw';
import type { 
  ElevenLabsVoice,
  ElevenLabsVoicesResponse, 
  ElevenLabsTTSRequest,
  ElevenLabsTTSResponse,
  ElevenLabsError,
} from '../../types/elevenlabs';

// Mock voice data
const MOCK_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    samples: null,
    category: 'premade',
    fine_tuning: {
      model_id: null,
      is_allowed_to_fine_tune: false,
      state: 'not_started',
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
    },
    labels: { 
      accent: 'american',
      description: 'calm',
      age: 'young',
      gender: 'female',
      use_case: 'narration'
    },
    description: 'A calm, soothing voice perfect for storytelling and educational content.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3',
    available_for_tiers: ['free', 'starter', 'creator', 'pro'],
    settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.3,
      use_speaker_boost: true,
    },
    sharing: {
      status: 'enabled',
      history_item_sample_id: 'sample_123',
      original_voice_id: '21m00Tcm4TlvDq8ikWAM',
      public_owner_id: 'elevenlabs',
      liked_by_count: 1250,
      cloned_by_count: 89,
    },
    high_quality_base_model_ids: ['eleven_monolingual_v1', 'eleven_turbo_v2'],
  },
  {
    voice_id: '29vD33N1CtxCmqQRPOHJ',
    name: 'Drew',
    samples: null,
    category: 'premade',
    fine_tuning: {
      model_id: null,
      is_allowed_to_fine_tune: false,
      state: 'not_started',
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
    },
    labels: { 
      accent: 'american',
      description: 'well-rounded',
      age: 'middle_aged',
      gender: 'male',
      use_case: 'general'
    },
    description: 'A well-rounded male voice suitable for various applications.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/29vD33N1CtxCmqQRPOHJ/2bed208b-d51d-4e96-9bd4-8e5ab4a88056.mp3',
    available_for_tiers: ['free', 'starter', 'creator', 'pro'],
    settings: {
      stability: 0.6,
      similarity_boost: 0.4,
      style: 0.2,
      use_speaker_boost: false,
    },
    sharing: {
      status: 'enabled',
      history_item_sample_id: 'sample_456',
      original_voice_id: '29vD33N1CtxCmqQRPOHJ',
      public_owner_id: 'elevenlabs',
      liked_by_count: 890,
      cloned_by_count: 45,
    },
    high_quality_base_model_ids: ['eleven_monolingual_v1', 'eleven_multilingual_v1'],
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    samples: null,
    category: 'premade',
    fine_tuning: {
      model_id: null,
      is_allowed_to_fine_tune: false,
      state: 'not_started',
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
    },
    labels: { 
      accent: 'british',
      description: 'soft',
      age: 'young',
      gender: 'female',
      use_case: 'storytelling'
    },
    description: 'A soft, gentle British voice perfect for bedtime stories and calm narration.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/87a9d1d4-0c5b-4b9a-9f8a-3d2c1e4f5g6h.mp3',
    available_for_tiers: ['starter', 'creator', 'pro'],
    settings: {
      stability: 0.7,
      similarity_boost: 0.6,
      style: 0.4,
      use_speaker_boost: true,
    },
    sharing: {
      status: 'enabled',
      history_item_sample_id: 'sample_789',
      original_voice_id: 'EXAVITQu4vr4xnSDxMaL',
      public_owner_id: 'elevenlabs',
      liked_by_count: 2100,
      cloned_by_count: 156,
    },
    high_quality_base_model_ids: ['eleven_multilingual_v2', 'eleven_turbo_v2'],
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    samples: null,
    category: 'premade',
    fine_tuning: {
      model_id: null,
      is_allowed_to_fine_tune: false,
      state: 'not_started',
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
    },
    labels: { 
      accent: 'american',
      description: 'well-rounded',
      age: 'young',
      gender: 'male',
      use_case: 'versatile'
    },
    description: 'A versatile young adult male voice perfect for educational content.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/9c8d7e6f-4b5a-3c2d-1e9f-8g7h6i5j4k3l.mp3',
    available_for_tiers: ['free', 'starter', 'creator', 'pro'],
    settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.3,
      use_speaker_boost: true,
    },
    sharing: {
      status: 'enabled',
      history_item_sample_id: 'sample_012',
      original_voice_id: 'ErXwobaYiN019PkySvjV',
      public_owner_id: 'elevenlabs',
      liked_by_count: 1678,
      cloned_by_count: 203,
    },
    high_quality_base_model_ids: ['eleven_monolingual_v1', 'eleven_multilingual_v1', 'eleven_turbo_v2'],
  }
];

// Mock audio URLs (in real implementation, these would be generated audio files)
const MOCK_AUDIO_URLS = [
  'https://mock-audio-storage.com/generated-audio-1.mp3',
  'https://mock-audio-storage.com/generated-audio-2.mp3',
  'https://mock-audio-storage.com/generated-audio-3.mp3',
  'https://mock-audio-storage.com/generated-audio-4.mp3',
  'https://mock-audio-storage.com/generated-audio-5.mp3',
];

export const elevenLabsHandlers = [
  // Get all available voices
  http.get('https://api.elevenlabs.io/v1/voices', () => {
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        const response: ElevenLabsVoicesResponse = {
          voices: MOCK_VOICES,
        };
        resolve(HttpResponse.json(response));
      }, Math.random() * 1000 + 300);
    });
  }),

  // Get specific voice details
  http.get('https://api.elevenlabs.io/v1/voices/:voiceId', ({ params }) => {
    const { voiceId } = params;
    
    const voice = MOCK_VOICES.find(v => v.voice_id === voiceId);
    
    if (!voice) {
      return HttpResponse.json<ElevenLabsError>(
        {
          detail: {
            status: 'voice_not_found',
            message: `Voice with ID ${String(voiceId)} not found.`,
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(voice);
  }),

  // Text-to-speech endpoint
  http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', async ({ params, request }) => {
    const { voiceId } = params;
    
    try {
      const body = await request.json() as ElevenLabsTTSRequest;
      
      // Validate voice ID
      const voice = MOCK_VOICES.find(v => v.voice_id === voiceId);
      if (!voice) {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'voice_not_found',
              message: `Voice with ID ${String(voiceId)} not found.`,
            },
          },
          { status: 404 }
        );
      }

      // Validate text length
      if (!body.text || body.text.trim().length === 0) {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'invalid_text',
              message: 'Text cannot be empty.',
            },
          },
          { status: 400 }
        );
      }

      // Simulate rate limiting error (2% chance)
      if (Math.random() < 0.02) {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'rate_limit_exceeded',
              message: 'Rate limit exceeded. Please wait before making another request.',
            },
          },
          { status: 429 }
        );
      }

      // Simulate quota exceeded error (1% chance)
      if (Math.random() < 0.01) {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'quota_exceeded',
              message: 'Monthly character quota exceeded. Please upgrade your plan.',
            },
          },
          { status: 402 }
        );
      }

      // Calculate characters used (including spaces and punctuation)
      const charactersUsed = body.text.length;
      
      // Estimate audio duration (roughly 150 words per minute, average 5 characters per word)
      const estimatedWords = charactersUsed / 5;
      const audioDurationSeconds = Math.round((estimatedWords / 150) * 60);
      
      // Select a random mock audio URL
      const audioUrl = MOCK_AUDIO_URLS[Math.floor(Math.random() * MOCK_AUDIO_URLS.length)] || MOCK_AUDIO_URLS[0] || 'https://mock-elevenlabs-default.mp3';
      
      // Simulate processing time based on text length
      const processingTime = Math.min(charactersUsed * 10, 5000); // Max 5 seconds
      
      return new Promise(resolve => {
        setTimeout(() => {
          const response: ElevenLabsTTSResponse = {
            audio_url: audioUrl,
            audio_duration_seconds: Math.max(audioDurationSeconds, 1),
            characters_used: charactersUsed,
            voice_id: voiceId as string,
            model_id: body.model_id || 'eleven_monolingual_v1',
          };
          
          resolve(HttpResponse.json(response));
        }, processingTime);
      });

    } catch {
      return HttpResponse.json<ElevenLabsError>(
        {
          detail: {
            status: 'invalid_request',
            message: 'Invalid request format.',
          },
        },
        { status: 400 }
      );
    }
  }),

  // Alternative streaming endpoint (for completeness)
  http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId/stream', async ({ params, request }) => {
    const { voiceId } = params;
    
    try {
      await request.json() as ElevenLabsTTSRequest;
      
      // For streaming, we'll return a simple audio response
      // In a real implementation, this would return a streaming audio response
      const voice = MOCK_VOICES.find(v => v.voice_id === voiceId);
      if (!voice) {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'voice_not_found',
              message: `Voice with ID ${String(voiceId)} not found.`,
            },
          },
          { status: 404 }
        );
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      // Return mock audio data (in real implementation, this would be binary audio data)
      return new HttpResponse(
        'mock-audio-stream-data',
        {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
          },
        }
      );

    } catch {
      return HttpResponse.json<ElevenLabsError>(
        {
          detail: {
            status: 'invalid_request',
            message: 'Invalid request format.',
          },
        },
        { status: 400 }
      );
    }
  }),

  // User info endpoint (for quota checking)
  http.get('https://api.elevenlabs.io/v1/user', () => {
    return HttpResponse.json({
      subscription: {
        tier: 'free',
        character_count: 8543,
        character_limit: 10000,
        can_extend_character_limit: true,
        allowed_to_extend_character_limit: true,
        next_character_count_reset_unix: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        voice_limit: 3,
        professional_voice_limit: 1,
        can_use_instant_voice_cloning: false,
        available_models: ['eleven_monolingual_v1', 'eleven_turbo_v2'],
      },
      is_new_user: false,
      xi_api_key: 'mock_api_key_123',
    });
  }),

  // Models endpoint
  http.get('https://api.elevenlabs.io/v1/models', () => {
    return HttpResponse.json([
      {
        model_id: 'eleven_monolingual_v1',
        name: 'Eleven English v1',
        can_be_finetuned: true,
        can_do_text_to_speech: true,
        can_do_voice_conversion: true,
        can_use_style: true,
        can_use_speaker_boost: true,
        serves_pro_voices: false,
        language: {
          language_id: 'en',
          name: 'English',
        },
        description: 'Use our standard English language model to generate speech in a variety of voices, styles and moods.',
        requires_alpha_access: false,
        max_characters_request_free_user: 500,
        max_characters_request_subscribed_user: 5000,
      },
      {
        model_id: 'eleven_multilingual_v1',
        name: 'Eleven Multilingual v1',
        can_be_finetuned: true,
        can_do_text_to_speech: true,
        can_do_voice_conversion: true,
        can_use_style: false,
        can_use_speaker_boost: true,
        serves_pro_voices: false,
        language: null,
        description: 'Generate lifelike speech in multiple languages and create content that resonates with a broader audience.',
        requires_alpha_access: false,
        max_characters_request_free_user: 500,
        max_characters_request_subscribed_user: 5000,
      },
      {
        model_id: 'eleven_turbo_v2',
        name: 'Eleven Turbo v2',
        can_be_finetuned: false,
        can_do_text_to_speech: true,
        can_do_voice_conversion: false,
        can_use_style: true,
        can_use_speaker_boost: true,
        serves_pro_voices: false,
        language: {
          language_id: 'en',
          name: 'English',
        },
        description: 'Our fastest English language model, optimized for real-time applications.',
        requires_alpha_access: false,
        max_characters_request_free_user: 500,
        max_characters_request_subscribed_user: 2000,
      },
    ]);
  }),
];