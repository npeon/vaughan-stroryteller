/**
 * Audio Storage Service for The Vaughan Storyteller
 * Servicio especializado para gestión de archivos de audio educativos
 * Integración con ElevenLabs TTS y grabaciones de usuario
 */

import { SupabaseStorageService } from './SupabaseStorageService';
import type {
  AudioUploadOptions,
  AudioMetadata,
  StorageMetadata
} from '../../types/storage';

export interface TTSAudioOptions {
  storyId: string;
  chapterId?: string;
  text: string;
  voice: string;
  language: string;
  model?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface RecordingOptions {
  userId: string;
  type: 'pronunciation' | 'assessment' | 'portfolio';
  exerciseId?: string;
  wordId?: string;
  expectedText?: string;
  metadata?: Record<string, unknown>;
}

export interface AudioProcessingResult {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  size?: number;
  format?: string;
  error?: string;
  metadata?: StorageMetadata;
}

export class AudioStorageService extends SupabaseStorageService {
  private readonly AUDIO_FORMATS = {
    TTS_PRIMARY: 'audio/mpeg',    // MP3 para TTS (compatibilidad)
    TTS_FALLBACK: 'audio/ogg',    // OGG para navegadores modernos
    RECORDING_PRIMARY: 'audio/webm', // WebM para grabaciones (nativo)
    RECORDING_FALLBACK: 'audio/wav'  // WAV como fallback
  };

  private readonly QUALITY_SETTINGS = {
    HIGH: { bitrate: 128, quality: 0.9 },
    MEDIUM: { bitrate: 96, quality: 0.7 },
    LOW: { bitrate: 64, quality: 0.5 }
  };

  // ============================================================================
  // TTS AUDIO MANAGEMENT
  // ============================================================================

  /**
   * Almacena audio TTS generado por ElevenLabs
   */
  async storeTTSAudio(
    audioBlob: Blob,
    options: TTSAudioOptions
  ): Promise<AudioProcessingResult> {
    try {
      // Generar nombre de archivo único
      const fileName = this.generateTTSFileName(options);
      
      // Crear archivo desde blob
      const audioFile = new File([audioBlob], fileName, { 
        type: this.AUDIO_FORMATS.TTS_PRIMARY 
      });

      // Obtener metadata del audio
      const audioMetadata = await this.extractAudioMetadata(audioFile, {
        voice: options.voice,
        language: options.language,
        story_id: options.storyId,
        chapter_id: options.chapterId,
        model: options.model,
        tts_settings: {
          stability: options.stability,
          similarity_boost: options.similarity_boost,
          style: options.style,
          use_speaker_boost: options.use_speaker_boost
        },
        generated_at: new Date().toISOString(),
        text_preview: options.text.substring(0, 100) + (options.text.length > 100 ? '...' : '')
      });

      // Preparar opciones de upload
      const uploadOptions: AudioUploadOptions = {
        bucket: 'story-assets',
        path: `audio/tts/${fileName}`,
        file: audioFile,
        educationalContext: 'tts',
        audioMetadata,
        metadata: {
          story_id: options.storyId,
          chapter_id: options.chapterId,
          voice: options.voice,
          language: options.language,
          text_hash: await this.calculateTextHash(options.text),
          is_tts_generated: true,
          cache_until: this.calculateCacheExpiry('tts')
        },
        options: {
          cacheControl: 'public, max-age=31536000', // 1 año para TTS
          upsert: true // Permitir sobrescribir si ya existe
        }
      };

      // Realizar upload
      const result = await this.upload(uploadOptions);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to upload TTS audio'
        };
      }

      // Actualizar metadata con información específica de TTS
      await this.updateTTSMetadata(result.data.path, options, audioMetadata);

      return {
        success: true,
        audioUrl: result.data.publicUrl || result.data.signedUrl || '',
        duration: audioMetadata.duration || 0,
        size: audioFile.size,
        format: audioFile.type,
        metadata: result.data.metadata
      };

    } catch (error) {
      console.error('TTS audio storage failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS storage failed'
      };
    }
  }

  /**
   * Obtiene audio TTS desde cache o genera nuevo
   */
  async getTTSAudio(options: TTSAudioOptions): Promise<string | null> {
    try {
      // Buscar audio existente por hash de texto y configuración
      const textHash = await this.calculateTextHash(options.text);
      const cacheKey = this.generateTTSCacheKey(options, textHash);
      
      // Buscar en metadata
      const existingAudio = await this.findCachedTTSAudio(cacheKey, options);
      
      if (existingAudio) {
        // Actualizar contador de acceso
        await this.updateAccessCount(existingAudio.storage_path);
        
        // Retornar URL
        return this.getPublicUrl('story-assets', existingAudio.storage_path);
      }

      return null; // No encontrado, debe generarse nuevo

    } catch (error) {
      console.error('Failed to get TTS audio:', error);
      return null;
    }
  }

  // ============================================================================
  // USER RECORDING MANAGEMENT
  // ============================================================================

  /**
   * Almacena grabación de usuario (pronunciación, assessment)
   */
  async storeUserRecording(
    audioBlob: Blob,
    options: RecordingOptions
  ): Promise<AudioProcessingResult> {
    try {
      // Generar nombre de archivo único
      const fileName = this.generateRecordingFileName(options);
      
      // Crear archivo desde blob
      const audioFile = new File([audioBlob], fileName, { 
        type: this.AUDIO_FORMATS.RECORDING_PRIMARY 
      });

      // Validar tamaño de archivo
      const maxRecordingSize = 10485760; // 10MB
      if (audioFile.size > maxRecordingSize) {
        return {
          success: false,
          error: `Recording too large: ${this.formatBytes(audioFile.size)}. Max allowed: ${this.formatBytes(maxRecordingSize)}`
        };
      }

      // Extraer metadata del audio
      const audioMetadata = await this.extractAudioMetadata(audioFile, {
        recording_type: options.type,
        exercise_id: options.exerciseId,
        word_id: options.wordId,
        expected_text: options.expectedText,
        recorded_at: new Date().toISOString()
      });

      // Preparar opciones de upload
      const uploadOptions: AudioUploadOptions = {
        bucket: 'user-content',
        path: `${options.userId}/recordings/${fileName}`,
        file: audioFile,
        educationalContext: 'recording',
        userId: options.userId,
        audioMetadata,
        metadata: {
          ...options.metadata,
          recording_type: options.type,
          exercise_id: options.exerciseId,
          word_id: options.wordId,
          is_user_generated: true,
          auto_delete_after: this.calculateAutoDeleteDate()
        },
        options: {
          cacheControl: 'private, max-age=86400' // 1 día para grabaciones
        }
      };

      // Realizar upload
      const result = await this.upload(uploadOptions);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to upload recording'
        };
      }

      return {
        success: true,
        audioUrl: result.data.signedUrl || result.data.publicUrl || '',
        duration: audioMetadata.duration || 0,
        size: audioFile.size,
        format: audioFile.type,
        metadata: result.data.metadata
      };

    } catch (error) {
      console.error('Recording storage failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Recording storage failed'
      };
    }
  }

  /**
   * Lista grabaciones del usuario
   */
  async getUserRecordings(
    userId: string,
    type?: 'pronunciation' | 'assessment' | 'portfolio',
    limit: number = 50
  ): Promise<StorageMetadata[]> {
    try {
      let query = this.supabase
        .from('storage_metadata')
        .select('*')
        .eq('user_id', userId)
        .eq('educational_context', 'recording')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('metadata->recording_type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get user recordings:', error);
        return [];
      }

      return data as StorageMetadata[];

    } catch (error) {
      console.error('Failed to get user recordings:', error);
      return [];
    }
  }

  // ============================================================================
  // AUDIO PROCESSING UTILITIES
  // ============================================================================

  /**
   * Extrae metadata de archivo de audio
   */
  private async extractAudioMetadata(file: File, additionalMeta?: Record<string, unknown>): Promise<AudioMetadata> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        audio.removeEventListener('loadedmetadata', onLoad);
        audio.removeEventListener('error', onError);
      };

      const onLoad = () => {
        const metadata: AudioMetadata = {
          duration: Math.round(audio.duration || 0),
          bitrate: this.estimateBitrate(file.size, audio.duration || 0),
          sampleRate: 44100, // Default, real detection requires Web Audio API
          channels: 2, // Default stereo
          ...additionalMeta
        };
        
        cleanup();
        resolve(metadata);
      };

      const onError = () => {
        const metadata: AudioMetadata = {
          duration: 0,
          bitrate: 0,
          ...additionalMeta
        };
        
        cleanup();
        resolve(metadata);
      };

      audio.addEventListener('loadedmetadata', onLoad);
      audio.addEventListener('error', onError);
      
      audio.src = objectUrl;
      
      // Timeout después de 5 segundos
      setTimeout(() => {
        if (!audio.duration) {
          onError();
        }
      }, 5000);
    });
  }

  /**
   * Genera nombre de archivo único para TTS
   */
  private generateTTSFileName(options: TTSAudioOptions): string {
    const timestamp = Date.now();
    const voice = options.voice.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lang = options.language.toLowerCase().replace(/[^a-z0-9]/g, '');
    const storySlug = options.storyId.substring(0, 8);
    const chapterSlug = options.chapterId ? `-${options.chapterId.substring(0, 8)}` : '';
    
    return `tts-${voice}-${lang}-${storySlug}${chapterSlug}-${timestamp}.mp3`;
  }

  /**
   * Genera nombre de archivo único para grabaciones
   */
  private generateRecordingFileName(options: RecordingOptions): string {
    const timestamp = Date.now();
    const type = options.type;
    const randomId = Math.random().toString(36).substring(2, 8);
    const exerciseSlug = options.exerciseId ? `-${options.exerciseId.substring(0, 8)}` : '';
    
    return `${type}-${timestamp}-${randomId}${exerciseSlug}.webm`;
  }

  /**
   * Calcula hash de texto para cache de TTS
   */
  private async calculateTextHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  /**
   * Genera clave de cache para TTS
   */
  private generateTTSCacheKey(options: TTSAudioOptions, textHash: string): string {
    const settings = [
      options.voice,
      options.language,
      options.model || 'default',
      options.stability || 0.5,
      options.similarity_boost || 0.5
    ].join('-');
    
    return `${textHash}-${settings}`;
  }

  /**
   * Busca audio TTS en cache
   */
  private async findCachedTTSAudio(cacheKey: string, options: TTSAudioOptions): Promise<StorageMetadata | null> {
    try {
      const { data, error } = await this.supabase
        .from('storage_metadata')
        .select('*')
        .eq('bucket_id', 'story-assets')
        .eq('educational_context', 'tts')
        .eq('metadata->cache_key', cacheKey)
        .eq('metadata->voice', options.voice)
        .eq('metadata->language', options.language)
        .gte('metadata->cache_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return error ? null : (data as StorageMetadata);
    } catch {
      return null;
    }
  }

  /**
   * Actualiza metadata específica de TTS
   */
  private async updateTTSMetadata(path: string, options: TTSAudioOptions, audioMeta: AudioMetadata): Promise<void> {
    const metadata = {
      cache_key: this.generateTTSCacheKey(options, await this.calculateTextHash(options.text)),
      last_played: null,
      play_count: 0,
      audio_quality: this.calculateAudioQuality(audioMeta),
      generation_cost: this.estimateTTSCost(options.text.length),
      optimization_applied: false
    };

    await this.updateMetadata('story-assets', path, { metadata });
  }

  /**
   * Actualiza contador de acceso
   */
  private async updateAccessCount(path: string): Promise<void> {
    await this.supabase
      .from('storage_metadata')
      .update({
        access_count: this.supabase.sql`access_count + 1`,
        last_accessed: new Date().toISOString()
      })
      .eq('storage_path', path);
  }

  /**
   * Utilidades de cálculo
   */
  private estimateBitrate(fileSize: number, duration: number): number {
    if (duration === 0) return 0;
    return Math.round((fileSize * 8) / duration / 1000); // kbps
  }

  private calculateAudioQuality(metadata: AudioMetadata): 'low' | 'medium' | 'high' {
    const bitrate = metadata.bitrate || 0;
    if (bitrate < 64) return 'low';
    if (bitrate < 128) return 'medium';
    return 'high';
  }

  private estimateTTSCost(textLength: number): number {
    // Estimación basada en pricing típico de ElevenLabs
    const costPerCharacter = 0.0001; // $0.0001 por caracter (ejemplo)
    return textLength * costPerCharacter;
  }

  private calculateCacheExpiry(type: 'tts' | 'recording'): string {
    const now = new Date();
    const expiry = new Date(now);
    
    if (type === 'tts') {
      expiry.setFullYear(now.getFullYear() + 1); // 1 año para TTS
    } else {
      expiry.setMonth(now.getMonth() + 3); // 3 meses para grabaciones
    }
    
    return expiry.toISOString();
  }

  private calculateAutoDeleteDate(): string {
    const now = new Date();
    const deleteDate = new Date(now);
    deleteDate.setMonth(now.getMonth() + 6); // 6 meses para auto-eliminación
    return deleteDate.toISOString();
  }

  override formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Getter para supabase client
  private get supabase() {
    // Import dinámico para evitar dependencias circulares
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../supabase/client');
    return supabase;
  }
}

// Singleton instance
export const audioStorageService = new AudioStorageService();