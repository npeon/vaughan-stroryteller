
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ad_banners: {
        Row: {
          click_count: number | null
          created_at: string | null
          created_by: string
          cta_link: string
          current_impressions: number | null
          description: string
          display_priority: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_impressions: number | null
          start_date: string | null
          target_audience: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          created_by: string
          cta_link: string
          current_impressions?: number | null
          description: string
          display_priority?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_impressions?: number | null
          start_date?: string | null
          target_audience?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          created_by?: string
          cta_link?: string
          current_impressions?: number | null
          description?: string
          display_priority?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_impressions?: number | null
          start_date?: string | null
          target_audience?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      api_health_checks: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          error_code: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          response_time: number | null
          service_name: string
          status: string
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time?: number | null
          service_name: string
          status: string
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time?: number | null
          service_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_health_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_health_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cefr_level: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_active: string | null
          preferences: Json | null
          role: string
          stories_completed: number | null
          streak_days: number | null
          updated_at: string | null
          vocabulary_mastered: number | null
        }
        Insert: {
          avatar_url?: string | null
          cefr_level?: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_active?: string | null
          preferences?: Json | null
          role?: string
          stories_completed?: number | null
          streak_days?: number | null
          updated_at?: string | null
          vocabulary_mastered?: number | null
        }
        Update: {
          avatar_url?: string | null
          cefr_level?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          preferences?: Json | null
          role?: string
          stories_completed?: number | null
          streak_days?: number | null
          updated_at?: string | null
          vocabulary_mastered?: number | null
        }
        Relationships: []
      }
      storage_metadata: {
        Row: {
          access_count: number | null
          bucket_id: string
          content_type: string
          created_at: string | null
          educational_context: string | null
          file_size: number | null
          id: string
          last_accessed: string | null
          metadata: Json | null
          original_name: string | null
          storage_path: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          bucket_id: string
          content_type: string
          created_at?: string | null
          educational_context?: string | null
          file_size?: number | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          original_name?: string | null
          storage_path: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          bucket_id?: string
          content_type?: string
          created_at?: string | null
          educational_context?: string | null
          file_size?: number | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          original_name?: string | null
          storage_path?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audio_generated: boolean | null
          audio_url: string | null
          cefr_level: string
          completed_at: string | null
          content: string
          created_at: string | null
          estimated_read_time: number | null
          generation_cost: number | null
          genre: string
          id: string
          image_generated_at: string | null
          image_generation_prompt: string | null
          image_model_used: string | null
          image_storage_path: string | null
          image_style: string | null
          image_url: string | null
          is_favorite: boolean | null
          model_used: string | null
          reading_progress: number | null
          title: string
          updated_at: string | null
          user_id: string
          vocabulary_words: string[] | null
          word_count: number | null
        }
        Insert: {
          audio_generated?: boolean | null
          audio_url?: string | null
          cefr_level: string
          completed_at?: string | null
          content: string
          created_at?: string | null
          estimated_read_time?: number | null
          generation_cost?: number | null
          genre: string
          id?: string
          image_generated_at?: string | null
          image_generation_prompt?: string | null
          image_model_used?: string | null
          image_storage_path?: string | null
          image_style?: string | null
          image_url?: string | null
          is_favorite?: boolean | null
          model_used?: string | null
          reading_progress?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          vocabulary_words?: string[] | null
          word_count?: number | null
        }
        Update: {
          audio_generated?: boolean | null
          audio_url?: string | null
          cefr_level?: string
          completed_at?: string | null
          content?: string
          created_at?: string | null
          estimated_read_time?: number | null
          generation_cost?: number | null
          genre?: string
          id?: string
          image_generated_at?: string | null
          image_generation_prompt?: string | null
          image_model_used?: string | null
          image_storage_path?: string | null
          image_style?: string | null
          image_url?: string | null
          is_favorite?: boolean | null
          model_used?: string | null
          reading_progress?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vocabulary_words?: string[] | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      story_progress: {
        Row: {
          bookmarks: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_position: number | null
          notes: string | null
          progress_percentage: number | null
          reading_time_seconds: number | null
          story_id: string
          updated_at: string | null
          user_id: string
          words_clicked: string[] | null
        }
        Insert: {
          bookmarks?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position?: number | null
          notes?: string | null
          progress_percentage?: number | null
          reading_time_seconds?: number | null
          story_id: string
          updated_at?: string | null
          user_id: string
          words_clicked?: string[] | null
        }
        Update: {
          bookmarks?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position?: number | null
          notes?: string | null
          progress_percentage?: number | null
          reading_time_seconds?: number | null
          story_id?: string
          updated_at?: string | null
          user_id?: string
          words_clicked?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "story_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      usage_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_limits: {
        Row: {
          created_at: string | null
          current_audio_generations: number | null
          current_stories: number | null
          id: string
          is_premium: boolean | null
          max_audio_generations: number | null
          max_stories: number | null
          notes: string | null
          reset_date: string | null
          reset_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_audio_generations?: number | null
          current_stories?: number | null
          id?: string
          is_premium?: boolean | null
          max_audio_generations?: number | null
          max_stories?: number | null
          notes?: string | null
          reset_date?: string | null
          reset_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_audio_generations?: number | null
          current_stories?: number | null
          id?: string
          is_premium?: boolean | null
          max_audio_generations?: number | null
          max_stories?: number | null
          notes?: string | null
          reset_date?: string | null
          reset_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_words: {
        Row: {
          context: string | null
          created_at: string | null
          definition: string
          difficulty: number | null
          ease_factor: number | null
          etymology: string | null
          id: string
          interval_days: number | null
          last_reviewed: string | null
          mastery_level: string | null
          next_review: string | null
          pronunciation: string | null
          review_count: number | null
          story_id: string | null
          success_count: number | null
          success_rate: number | null
          synonyms: string[] | null
          updated_at: string | null
          user_id: string
          word: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          definition: string
          difficulty?: number | null
          ease_factor?: number | null
          etymology?: string | null
          id?: string
          interval_days?: number | null
          last_reviewed?: string | null
          mastery_level?: string | null
          next_review?: string | null
          pronunciation?: string | null
          review_count?: number | null
          story_id?: string | null
          success_count?: number | null
          success_rate?: number | null
          synonyms?: string[] | null
          updated_at?: string | null
          user_id: string
          word: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          definition?: string
          difficulty?: number | null
          ease_factor?: number | null
          etymology?: string | null
          id?: string
          interval_days?: number | null
          last_reviewed?: string | null
          mastery_level?: string | null
          next_review?: string | null
          pronunciation?: string | null
          review_count?: number | null
          story_id?: string | null
          success_count?: number | null
          success_rate?: number | null
          synonyms?: string[] | null
          updated_at?: string | null
          user_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_words_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_banners: {
        Row: {
          click_count: number | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          cta_link: string | null
          current_impressions: number | null
          description: string | null
          display_priority: number | null
          end_date: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          max_impressions: number | null
          start_date: string | null
          target_audience: Json | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      api_health_summary: {
        Row: {
          checked_at: string | null
          error_message: string | null
          response_time: number | null
          service_name: string | null
          status: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          avg_reading_progress: number | null
          cefr_level: string | null
          completed_stories: number | null
          current_stories: number | null
          email: string | null
          full_name: string | null
          id: string | null
          is_premium: boolean | null
          last_active: string | null
          max_stories: number | null
          role: string | null
          stories_completed: number | null
          streak_days: number | null
          total_stories: number | null
          total_vocabulary: number | null
          vocabulary_mastered: number | null
        }
        Relationships: []
      }
      vocabulary_due_for_review: {
        Row: {
          context: string | null
          created_at: string | null
          definition: string | null
          difficulty: number | null
          ease_factor: number | null
          etymology: string | null
          id: string | null
          interval_days: number | null
          last_reviewed: string | null
          mastery_level: string | null
          next_review: string | null
          pronunciation: string | null
          review_count: number | null
          story_id: string | null
          success_count: number | null
          success_rate: number | null
          synonyms: string[] | null
          updated_at: string | null
          user_cefr_level: string | null
          user_id: string | null
          user_name: string | null
          word: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_words_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_orphaned_files: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_orphaned_story_images: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_default_user_limits: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_user_storage_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
