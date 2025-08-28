// =============================================
// TIPOS TYPESCRIPT GENERADOS PARA SUPABASE
// Base: The Vaughan Storyteller Database Schema
// Fecha: 2025-08-28
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ad_banners: {
        Row: {
          id: string
          title: string
          description: string
          cta_link: string
          image_url: string | null
          target_audience: Json
          display_priority: number
          max_impressions: number
          current_impressions: number
          click_count: number
          is_active: boolean
          start_date: string
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          cta_link: string
          image_url?: string | null
          target_audience?: Json
          display_priority?: number
          max_impressions?: number
          current_impressions?: number
          click_count?: number
          is_active?: boolean
          start_date?: string
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          cta_link?: string
          image_url?: string | null
          target_audience?: Json
          display_priority?: number
          max_impressions?: number
          current_impressions?: number
          click_count?: number
          is_active?: boolean
          start_date?: string
          end_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_health_checks: {
        Row: {
          id: string
          service_name: 'openrouter' | 'elevenlabs' | 'wordsapi' | 'supabase' | 'vercel'
          status: 'connected' | 'error' | 'timeout' | 'rate_limited'
          response_time: number | null
          error_message: string | null
          error_code: string | null
          metadata: Json
          checked_by: string | null
          checked_at: string
        }
        Insert: {
          id?: string
          service_name: 'openrouter' | 'elevenlabs' | 'wordsapi' | 'supabase' | 'vercel'
          status: 'connected' | 'error' | 'timeout' | 'rate_limited'
          response_time?: number | null
          error_message?: string | null
          error_code?: string | null
          metadata?: Json
          checked_by?: string | null
          checked_at?: string
        }
        Update: {
          id?: string
          service_name?: 'openrouter' | 'elevenlabs' | 'wordsapi' | 'supabase' | 'vercel'
          status?: 'connected' | 'error' | 'timeout' | 'rate_limited'
          response_time?: number | null
          error_message?: string | null
          error_code?: string | null
          metadata?: Json
          checked_by?: string | null
          checked_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          preferences: Json
          role: 'user' | 'admin'
          stories_completed: number
          vocabulary_mastered: number
          streak_days: number
          last_active: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          preferences?: Json
          role?: 'user' | 'admin'
          stories_completed?: number
          vocabulary_mastered?: number
          streak_days?: number
          last_active?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          preferences?: Json
          role?: 'user' | 'admin'
          stories_completed?: number
          vocabulary_mastered?: number
          streak_days?: number
          last_active?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          genre: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          estimated_read_time: number | null
          word_count: number | null
          vocabulary_words: string[]
          audio_url: string | null
          reading_progress: number
          completed_at: string | null
          model_used: string
          generation_cost: number
          audio_generated: boolean
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          genre: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          estimated_read_time?: number | null
          word_count?: number | null
          vocabulary_words?: string[]
          audio_url?: string | null
          reading_progress?: number
          completed_at?: string | null
          model_used?: string
          generation_cost?: number
          audio_generated?: boolean
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          genre?: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          estimated_read_time?: number | null
          word_count?: number | null
          vocabulary_words?: string[]
          audio_url?: string | null
          reading_progress?: number
          completed_at?: string | null
          model_used?: string
          generation_cost?: number
          audio_generated?: boolean
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      story_progress: {
        Row: {
          id: string
          user_id: string
          story_id: string
          progress_percentage: number
          reading_time_seconds: number
          words_clicked: string[]
          bookmarks: Json
          notes: string | null
          last_position: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          progress_percentage?: number
          reading_time_seconds?: number
          words_clicked?: string[]
          bookmarks?: Json
          notes?: string | null
          last_position?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          progress_percentage?: number
          reading_time_seconds?: number
          words_clicked?: string[]
          bookmarks?: Json
          notes?: string | null
          last_position?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      system_config: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
      }
      usage_analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          page_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: Json
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          page_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          page_url?: string | null
          created_at?: string
        }
      }
      user_limits: {
        Row: {
          id: string
          user_id: string
          max_stories: number
          current_stories: number
          max_audio_generations: number
          current_audio_generations: number
          reset_date: string
          reset_frequency: 'daily' | 'weekly' | 'monthly'
          is_premium: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          max_stories?: number
          current_stories?: number
          max_audio_generations?: number
          current_audio_generations?: number
          reset_date?: string
          reset_frequency?: 'daily' | 'weekly' | 'monthly'
          is_premium?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          max_stories?: number
          current_stories?: number
          max_audio_generations?: number
          current_audio_generations?: number
          reset_date?: string
          reset_frequency?: 'daily' | 'weekly' | 'monthly'
          is_premium?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vocabulary_words: {
        Row: {
          id: string
          user_id: string
          word: string
          definition: string
          context: string | null
          story_id: string | null
          difficulty: number
          review_count: number
          success_count: number
          success_rate: number
          last_reviewed: string | null
          next_review: string
          mastery_level: 'new' | 'learning' | 'review' | 'mastered'
          ease_factor: number
          interval_days: number
          pronunciation: string | null
          etymology: string | null
          synonyms: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          definition: string
          context?: string | null
          story_id?: string | null
          difficulty?: number
          review_count?: number
          success_count?: number
          success_rate?: number
          last_reviewed?: string | null
          next_review?: string
          mastery_level?: 'new' | 'learning' | 'review' | 'mastered'
          ease_factor?: number
          interval_days?: number
          pronunciation?: string | null
          etymology?: string | null
          synonyms?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          definition?: string
          context?: string | null
          story_id?: string | null
          difficulty?: number
          review_count?: number
          success_count?: number
          success_rate?: number
          last_reviewed?: string | null
          next_review?: string
          mastery_level?: 'new' | 'learning' | 'review' | 'mastered'
          ease_factor?: number
          interval_days?: number
          pronunciation?: string | null
          etymology?: string | null
          synonyms?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      active_banners: {
        Row: {
          id: string
          title: string
          description: string
          cta_link: string
          image_url: string | null
          target_audience: Json
          display_priority: number
          max_impressions: number
          current_impressions: number
          click_count: number
          is_active: boolean
          start_date: string
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
          created_by_name: string | null
        }
        Insert: never
        Update: never
      }
      api_health_summary: {
        Row: {
          service_name: 'openrouter' | 'elevenlabs' | 'wordsapi' | 'supabase' | 'vercel'
          status: 'connected' | 'error' | 'timeout' | 'rate_limited'
          response_time: number | null
          error_message: string | null
          checked_at: string
        }
        Insert: never
        Update: never
      }
      user_stats: {
        Row: {
          id: string
          email: string
          full_name: string | null
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          role: 'user' | 'admin'
          stories_completed: number
          vocabulary_mastered: number
          streak_days: number
          last_active: string
          current_stories: number
          max_stories: number
          is_premium: boolean
          total_stories: number
          total_vocabulary: number
          completed_stories: number
          avg_reading_progress: number | null
        }
        Insert: never
        Update: never
      }
      vocabulary_due_for_review: {
        Row: {
          id: string
          user_id: string
          word: string
          definition: string
          context: string | null
          story_id: string | null
          difficulty: number
          review_count: number
          success_count: number
          success_rate: number
          last_reviewed: string | null
          next_review: string
          mastery_level: 'new' | 'learning' | 'review' | 'mastered'
          ease_factor: number
          interval_days: number
          pronunciation: string | null
          etymology: string | null
          synonyms: string[] | null
          created_at: string
          updated_at: string
          user_name: string | null
          user_cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
        }
        Insert: never
        Update: never
      }
    }
    Functions: {
      calculate_vocabulary_success_rate: {
        Args: {}
        Returns: undefined
      }
      check_user_limits: {
        Args: {}
        Returns: undefined
      }
      create_demo_admin: {
        Args: {}
        Returns: undefined
      }
      create_sample_data: {
        Args: {}
        Returns: undefined
      }
      get_user_role: {
        Args: {
          user_id?: string
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      is_authenticated: {
        Args: {}
        Returns: boolean
      }
      update_banner_stats: {
        Args: {}
        Returns: undefined
      }
      update_updated_at_column: {
        Args: {}
        Returns: undefined
      }
      update_user_stats: {
        Args: {}
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =============================================
// TIPOS DE UTILIDAD PARA EL FRONTEND
// =============================================

// Tipos para niveles CEFR
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// Tipos para roles de usuario
export type UserRole = 'user' | 'admin'

// Tipos para niveles de dominio de vocabulario
export type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered'

// Tipos para servicios de API
export type APIService = 'openrouter' | 'elevenlabs' | 'wordsapi' | 'supabase' | 'vercel'

// Tipos para estado de salud de API
export type APIStatus = 'connected' | 'error' | 'timeout' | 'rate_limited'

// Tipos para frecuencia de reset de límites
export type ResetFrequency = 'daily' | 'weekly' | 'monthly'

// Tipos específicos para el dominio de la aplicación
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type VocabularyWord = Database['public']['Tables']['vocabulary_words']['Row']
export type StoryProgress = Database['public']['Tables']['story_progress']['Row']
export type AdBanner = Database['public']['Tables']['ad_banners']['Row']
export type UserLimits = Database['public']['Tables']['user_limits']['Row']
export type APIHealthCheck = Database['public']['Tables']['api_health_checks']['Row']
export type UsageAnalytics = Database['public']['Tables']['usage_analytics']['Row']
export type SystemConfig = Database['public']['Tables']['system_config']['Row']

// Tipos para inserciones (útiles para formularios)
export type UserProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type VocabularyWordInsert = Database['public']['Tables']['vocabulary_words']['Insert']
export type StoryProgressInsert = Database['public']['Tables']['story_progress']['Insert']
export type AdBannerInsert = Database['public']['Tables']['ad_banners']['Insert']

// Tipos para actualizaciones (útiles para formularios de edición)
export type UserProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']
export type VocabularyWordUpdate = Database['public']['Tables']['vocabulary_words']['Update']

// Tipos para vistas optimizadas
export type UserStats = Database['public']['Views']['user_stats']['Row']
export type ActiveBanner = Database['public']['Views']['active_banners']['Row']
export type APIHealthSummary = Database['public']['Views']['api_health_summary']['Row']
export type VocabularyDueForReview = Database['public']['Views']['vocabulary_due_for_review']['Row']

// Tipos para respuestas de APIs externas
export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description: string
}

export interface WordsAPIResponse {
  word: string
  results?: Array<{
    definition: string
    partOfSpeech: string
    synonyms?: string[]
    examples?: string[]
  }>
  pronunciation?: {
    all: string
  }
  etymology?: string
}

// Tipos para configuración del sistema
export interface SpacedRepetitionConfig {
  intervals: number[]
  masteryThreshold: number
  easyInterval: number
  normalInterval: number
  hardInterval: number
  graduatingInterval: number
  multiplier: number
}

export interface StoryGenerationConfig {
  minWords: number
  maxWords: number
  supportedGenres: string[]
  defaultModel: string
  fallbackModels: string[]
}

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  totalStories: number
  apiUsage: {
    openrouter: { requests: number; cost: number }
    elevenlabs: { requests: number; cost: number }
    wordsapi: { requests: number; cost: number }
  }
  userLimits: {
    totalWithLimits: number
    averageLimit: number
  }
}

// Tipos para eventos de analytics
export type AnalyticsEventType = 
  | 'story_started'
  | 'story_completed' 
  | 'word_clicked'
  | 'vocabulary_reviewed'
  | 'banner_impression'
  | 'banner_click'
  | 'audio_played'
  | 'user_login'
  | 'user_signup'

export interface AnalyticsEvent {
  user_id?: string
  event_type: AnalyticsEventType
  event_data: Json
  session_id?: string
}