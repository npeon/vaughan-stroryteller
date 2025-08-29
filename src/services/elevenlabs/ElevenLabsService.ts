/**
 * ElevenLabs TTS Service with Storage Integration
 * Servicio para generar audio TTS y almacenarlo automáticamente en Supabase Storage
 */

import { audioStorageService } from '../storage/AudioStorageService';
import type {
  ElevenLabsVoice,
  ElevenLabsVoicesResponse,
  AudioGenerationRequest,
  ElevenLabsVoiceId,
  ElevenLabsModelId,
} from '../../types/elevenlabs';
import type { TTSAudioOptions, AudioProcessingResult } from '../storage/AudioStorageService';

export interface TTSGenerationOptions {
  storyId: string;
  chapterId?: string;
  useCache?: boolean;
  quality?: 'low' | 'medium' | 'high';
  forceRegenerate?: boolean;
}

export class ElevenLabsService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';
  private readonly apiKey: string;

  // Voice presets para diferentes tipos de contenido educativo
  private readonly voicePresets = {
    STORY_NARRATION: {
      voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - Soft female
      settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.4,
        use_speaker_boost: true,
      },
    },
    VOCABULARY_PRACTICE: {
      voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel - Clear pronunciation
      settings: {
        stability: 0.8,
        similarity_boost: 0.4,
        style: 0.2,
        use_speaker_boost: false,
      },
    },
    INSTRUCTIONS: {
      voice_id: 'pFZP5JQG7iQjIQuC4Bku', // Lily - Warm, middle-aged
      settings: {
        stability: 0.7,
        similarity_boost: 0.5,
        style: 0.3,
        use_speaker_boost: true,
      },
    },
  };

  private readonly modelPresets = {
    high: 'eleven_multilingual_v2',
    medium: 'eleven_multilingual_v1',
    low: 'eleven_turbo_v2',
    flash: 'eleven_flash_v2',
  };

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';

    if (!this.apiKey) {
      console.warn('ElevenLabs API key not configured. TTS functionality will be limited.');
    }
  }
  // ============================================================================
  // ENVIRONMENT CONFIGURATION METHODS
  // ============================================================================

  /**
   * Resuelve voice ID desde variables de entorno
   */
  resolveVoiceId(): string {
    return process.env.ELEVENLABS_VOICE_ID || this.getDefaultVoiceId();
  }

  /**
   * Mapea nombre de voz a voice ID
   */
  resolveVoiceIdFromName(voiceName: string): string {
    const voiceMapping: Record<string, string> = {
      'Theo Hartwell': process.env.ELEVENLABS_VOICE_ID || 'yZggGmu2XJkoy1aHe3fg',
      'Rachel': '21m00Tcm4TlvDq8ikWAM',
      'Bella': 'EXAVITQu4vr4xnSDxMaL',
      'Lily': 'pFZP5JQG7iQjIQuC4Bku'
    };

    return voiceMapping[voiceName] || this.getDefaultVoiceId();
  }

  /**
   * Obtiene voice ID válido con fallback
   */
  async getValidVoiceId(): Promise<string> {
    const envVoiceId = this.resolveVoiceId();
    
    // En desarrollo, usar el voice ID de ENV sin validación
    if (process.env.NODE_ENV === 'development') {
      return envVoiceId;
    }

    // En producción, validar que el voice ID existe
    try {
      const voices = await this.getVoices();
      const voiceExists = voices.some(voice => voice.voice_id === envVoiceId);
      
      if (voiceExists) {
        return envVoiceId;
      }
    } catch (error) {
      console.warn('Failed to validate voice ID:', error);
    }

    // Fallback a Rachel
    return '21m00Tcm4TlvDq8ikWAM';
  }

  /**
   * Obtiene modelo desde variables de entorno
   */
  getModelFromEnv(): string {
    return process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
  }

  /**
   * Verifica compatibilidad de modelo con calidad
   */
  isModelCompatible(model: string, quality: string): boolean {
    const compatibilityMatrix: Record<string, string[]> = {
      'eleven_flash_v2': ['high', 'medium', 'low'],
      'eleven_multilingual_v2': ['high', 'medium', 'low'],
      'eleven_multilingual_v1': ['medium', 'low'],
      'eleven_turbo_v2': ['low']
    };

    return compatibilityMatrix[model]?.includes(quality) || false;
  }

  /**
   * Obtiene configuración efectiva del servicio
   */
  getEffectiveConfig(): {
    voiceId: string;
    voiceName: string;
    model: string;
    apiKey: string;
  } {
    const voiceId = this.resolveVoiceId();
    const voiceName = process.env.DEFAULT_TTS_VOICE || 'Default Voice';
    const model = this.getModelFromEnv();

    return {
      voiceId,
      voiceName,
      model,
      apiKey: this.apiKey
    };
  }

  /**
   * Obtiene voice ID por defecto
   */
  private getDefaultVoiceId(): string {
    return '21m00Tcm4TlvDq8ikWAM'; // Rachel como fallback
  }

  // ============================================================================
  // STORY NARRATION GENERATION
  // ============================================================================

  /**
   * Genera audio TTS para narración de historias con integración automática a Storage
   */
  async generateStoryNarration(
    text: string,
    options: TTSGenerationOptions,
    voicePreset: 'STORY_NARRATION' | 'VOCABULARY_PRACTICE' | 'INSTRUCTIONS' = 'STORY_NARRATION',
    onProgress?: (progress: number) => void,
  ): Promise<AudioProcessingResult> {
    try {
      const preset = this.voicePresets[voicePreset];
      
      // Usar configuración dinámica si está disponible
      const effectiveConfig = this.getEffectiveConfig();
      const voiceToUse = effectiveConfig.voiceId !== this.getDefaultVoiceId() 
        ? effectiveConfig.voiceId 
        : preset.voice_id;
      
      const modelToUse = this.getModelFromEnv();
      
      // Verificar compatibilidad del modelo con la calidad
      const quality = options.quality || 'medium';
      const finalModel = this.isModelCompatible(modelToUse, quality) 
        ? modelToUse 
        : this.modelPresets[quality];

      // Preparar opciones TTS
      const ttsOptions: TTSAudioOptions = {
        storyId: options.storyId,
        ...(options.chapterId && { chapterId: options.chapterId }),
        text: text,
        voice: voiceToUse,
        language: 'en-GB',
        model: finalModel,
        stability: preset.settings.stability,
        similarity_boost: preset.settings.similarity_boost,
        style: preset.settings.style,
        use_speaker_boost: preset.settings.use_speaker_boost,
      };

      // Verificar cache si está habilitado
      if (options.useCache !== false && !options.forceRegenerate) {
        const cachedUrl = await audioStorageService.getTTSAudio(ttsOptions);
        if (cachedUrl) {
          onProgress?.(100);
          const metadata = await audioStorageService.getMetadata(
            'story-assets',
            cachedUrl.split('/').pop() || '',
          );
          return {
            success: true,
            audioUrl: cachedUrl,
            ...(metadata && { metadata }),
          };
        }
      }

      onProgress?.(10);

      // Generar audio con ElevenLabs
      const audioBlob = await this.generateTTSAudio({
        text: text,
        voice_id: voiceToUse as ElevenLabsVoiceId,
        model_id: finalModel as ElevenLabsModelId,
        voice_settings: preset.settings,
        story_id: options.storyId,
        ...(options.chapterId && { chunk_id: options.chapterId }),
      });

      onProgress?.(70);

      if (!audioBlob) {
        throw new Error('Failed to generate TTS audio');
      }

      // Almacenar en Storage
      const result = await audioStorageService.storeTTSAudio(
        audioBlob,
        ttsOptions
      );

      onProgress?.(100);

      return result;
    } catch (error) {
      console.error('Story narration generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS generation failed',
      };
    }
  }

  /**
   * Genera audio para práctica de vocabulario (pronunciación clara)
   */
  async generateVocabularyAudio(
    word: string,
    definition: string,
    storyId?: string,
  ): Promise<AudioProcessingResult> {
    const fullText = `${word}. ${definition}`;

    return this.generateStoryNarration(
      fullText,
      {
        storyId: storyId || 'vocabulary',
        chapterId: `word-${word.toLowerCase()}`,
        useCache: true,
        quality: 'high',
      },
      'VOCABULARY_PRACTICE',
    );
  }

  /**
   * Genera audio para instrucciones del sistema
   */
  async generateInstructionAudio(
    instruction: string,
    contextId?: string,
  ): Promise<AudioProcessingResult> {
    return this.generateStoryNarration(
      instruction,
      {
        storyId: contextId || 'instructions',
        chapterId: `instruction-${Date.now()}`,
        useCache: true,
        quality: 'medium',
      },
      'INSTRUCTIONS',
    );
  }

  // ============================================================================
  // CORE TTS OPERATIONS
  // ============================================================================

  /**
   * Genera audio TTS directamente con ElevenLabs API
   */
  private async generateTTSAudio(request: AudioGenerationRequest): Promise<Blob | null> {
    try {
      if (!this.apiKey) {
        // En desarrollo, usar mock data
        if (process.env.NODE_ENV === 'development') {
          return this.generateMockAudio(request.text);
        }
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/text-to-speech/${request.voice_id}`, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model_id || 'eleven_multilingual_v2',
          voice_settings: request.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorData.detail?.message || 'Unknown error'}`,
        );
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('TTS generation failed:', error);

      // Fallback a audio mock en caso de error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock audio due to TTS error');
        return this.generateMockAudio(request.text);
      }

      return null;
    }
  }

  /**
   * Obtiene lista de voces disponibles
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      if (!this.apiKey) {
        return this.getMockVoices();
      }

      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get voices: ${response.status}`);
      }

      const data: ElevenLabsVoicesResponse = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Failed to get voices:', error);
      return this.getMockVoices();
    }
  }

  /**
   * Obtiene información de uso de API
   */
  async getUsageStats(): Promise<{
    character_count: number;
    character_limit: number;
    can_extend_character_limit: boolean;
    allowed_to_extend_character_limit: boolean;
    next_character_count_reset_unix: number;
  } | null> {
    try {
      if (!this.apiKey) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get usage stats: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return null;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // splitTextForTTS function removed - deprecated and unused

  /**
   * Calcula costo estimado de generación
   */
  estimateGenerationCost(
    text: string,
    model: 'high' | 'medium' | 'low' = 'medium',
  ): {
    characters: number;
    estimatedCost: number;
    currency: string;
  } {
    const characters = text.length;

    // Precios aproximados por caracter (actualizar según pricing real)
    const pricing = {
      high: 0.00003, // Multilingual v2
      medium: 0.00002, // Multilingual v1
      low: 0.00001, // Turbo v2
    };

    const costPerChar = pricing[model];
    const estimatedCost = characters * costPerChar;

    return {
      characters,
      estimatedCost: Math.round(estimatedCost * 100) / 100, // Redondear a centavos
      currency: 'USD',
    };
  }

  /**
   * Verifica si el servicio está disponible
   */
  async healthCheck(): Promise<{
    available: boolean;
    apiKey: boolean;
    usage?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return {
          available: false,
          apiKey: false,
          error: 'API key not configured',
        };
      }

      const usage = await this.getUsageStats();

      return {
        available: true,
        apiKey: true,
        usage,
      };
    } catch (error) {
      return {
        available: false,
        apiKey: !!this.apiKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // MOCK DATA (Para desarrollo)
  // ============================================================================

  private generateMockAudio(text: string): Promise<Blob> {
    // Generar audio silencioso de duración proporcional al texto
    const duration = Math.max(text.length * 0.05, 1); // ~50ms por caracter, mín 1s
    const sampleRate = 44100;
    const samples = Math.floor(duration * sampleRate);

    // Crear buffer de audio silencioso
    const buffer = new ArrayBuffer(44 + samples * 2); // WAV header + 16-bit samples
    const view = new DataView(buffer);

    // WAV header simplificado
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);

    // Audio silencioso (samples ya son 0)
    for (let i = 0; i < samples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }

    return Promise.resolve(new Blob([buffer], { type: 'audio/wav' }));
  }

  private getMockVoices(): ElevenLabsVoice[] {
    return Object.entries({
      RACHEL: '21m00Tcm4TlvDq8ikWAM',
      BELLA: 'EXAVITQu4vr4xnSDxMaL',
      LILY: 'pFZP5JQG7iQjIQuC4Bku',
    }).map(([name, id]) => ({
      voice_id: id,
      name: name,
      samples: null,
      category: 'premade',
      fine_tuning: {
        model_id: null,
        is_allowed_to_fine_tune: false,
        state: 'not_started' as const,
        verification_failures: [],
        verification_attempts_count: 0,
        manual_verification_requested: false,
      },
      labels: {},
      description: `${name} - Educational voice for language learning`,
      preview_url: '',
      available_for_tiers: ['free', 'starter', 'creator'],
      settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.3,
        use_speaker_boost: true,
      },
      sharing: {
        status: 'disabled' as const,
        history_item_sample_id: '',
        original_voice_id: '',
        public_owner_id: '',
        liked_by_count: 0,
        cloned_by_count: 0,
      },
      high_quality_base_model_ids: ['eleven_multilingual_v2'],
    }));
  }
}

// Singleton instance
export const elevenLabsService = new ElevenLabsService();
