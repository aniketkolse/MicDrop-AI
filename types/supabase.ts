export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      podcasts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          original_prompt: string | null;
          source_type: string | null;
          source_document_path: string | null;
          language: string | null;
          duration_seconds: number | null;
          conversation_style: string | null;
          target_audience: string | null;
          status: string;
          script: Json | null;
          audio_path: string | null;
          audio_format: string | null;
          audio_duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          original_prompt?: string;
          source_type?: string;
          source_document_path?: string;
          language?: string;
          duration_seconds?: number;
          conversation_style?: string;
          target_audience?: string;
          status?: string;
          script?: Json;
          audio_path?: string;
          audio_format?: string;
          audio_duration_seconds?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          original_prompt?: string;
          source_type?: string;
          source_document_path?: string;
          language?: string;
          duration_seconds?: number;
          conversation_style?: string;
          target_audience?: string;
          status?: string;
          script?: Json;
          audio_path?: string;
          audio_format?: string;
          audio_duration_seconds?: number;
        };
      };
      podcast_speakers: {
        Row: {
          id: string;
          podcast_id: string;
          user_id: string;
          speaker_name: string;
          speaker_role: string | null;
          voice_id: string | null;
          language: string | null;
          speaking_rate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          user_id: string;
          speaker_name: string;
          speaker_role?: string;
          voice_id?: string;
          language?: string;
          speaking_rate?: number;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          user_id?: string;
          speaker_name?: string;
          speaker_role?: string;
          voice_id?: string;
          language?: string;
          speaking_rate?: number;
        };
      };
      podcast_segments: {
        Row: {
          id: string;
          podcast_id: string;
          speaker_id: string | null;
          user_id: string;
          sequence_number: number;
          heading: string | null;
          dialogue: string | null;
          audio_path: string | null;
          status: string;
          duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          podcast_id: string;
          speaker_id?: string;
          user_id: string;
          sequence_number: number;
          heading?: string;
          dialogue?: string;
          audio_path?: string;
          status?: string;
          duration_seconds?: number;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          speaker_id?: string;
          user_id?: string;
          sequence_number?: number;
          heading?: string;
          dialogue?: string;
          audio_path?: string;
          status?: string;
          duration_seconds?: number;
        };
      };
      generation_jobs: {
        Row: {
          id: string;
          podcast_id: string | null;
          user_id: string;
          job_type: string;
          status: string;
          progress: number;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          podcast_id?: string;
          user_id: string;
          job_type: string;
          status?: string;
          progress?: number;
          error_message?: string;
          started_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          podcast_id?: string;
          user_id?: string;
          job_type?: string;
          status?: string;
          progress?: number;
          error_message?: string;
          started_at?: string;
          completed_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          default_language: string | null;
          default_voice: string | null;
          default_podcast_style: string | null;
          preferred_theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_language?: string;
          default_voice?: string;
          default_podcast_style?: string;
          preferred_theme?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_language?: string;
          default_voice?: string;
          default_podcast_style?: string;
          preferred_theme?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: any;
      };
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: any;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Tables<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"],
  TableName extends PublicTableNameOrOptions = PublicTableNameOrOptions,
> = Database["public"]["Tables"][TableName];
