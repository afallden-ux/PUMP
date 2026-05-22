export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          title: string;
          current_pump_score: number;
          last_logged_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          title?: string;
          current_pump_score?: number;
          last_logged_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          title?: string;
          current_pump_score?: number;
          last_logged_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          duration_minutes: number;
          intensity_level: number;
          total_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration_minutes: number;
          intensity_level: number;
          total_points: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          duration_minutes?: number;
          intensity_level?: number;
          total_points?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      leaderboard_7d: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          title: string;
          current_pump_score: number;
          last_logged_at: string | null;
          points_7d: number;
          sessions_7d: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      calc_pump_points: {
        Args: {
          p_duration_minutes: number;
          p_intensity_level: number;
        };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
