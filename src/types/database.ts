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
          home_crag: string | null;
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
          home_crag?: string | null;
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
          home_crag?: string | null;
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
          photo_url: string | null;
          session_type: string;
          is_moonboard: boolean;
          is_outdoors: boolean;
          hardest_grade: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type?: string;
          duration_minutes: number;
          intensity_level: number;
          total_points: number;
          photo_url?: string | null;
          is_moonboard?: boolean;
          is_outdoors?: boolean;
          hardest_grade?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string;
          duration_minutes?: number;
          intensity_level?: number;
          total_points?: number;
          photo_url?: string | null;
          is_moonboard?: boolean;
          is_outdoors?: boolean;
          hardest_grade?: string | null;
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
      session_comments: {
        Row: {
          id: string;
          workout_log_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_log_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_log_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_comments_workout_log_id_fkey";
            columns: ["workout_log_id"];
            isOneToOne: false;
            referencedRelation: "workout_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crews: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          location: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          location?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          location?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      crew_members: {
        Row: {
          crew_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          crew_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          crew_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey";
            columns: ["crew_id"];
            isOneToOne: false;
            referencedRelation: "crews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crew_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crew_battles: {
        Row: {
          id: string;
          challenger_crew_id: string;
          opponent_crew_id: string;
          status: string;
          duration_days: number;
          starts_at: string | null;
          ends_at: string | null;
          winner_crew_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenger_crew_id: string;
          opponent_crew_id: string;
          status?: string;
          duration_days?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          winner_crew_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenger_crew_id?: string;
          opponent_crew_id?: string;
          status?: string;
          duration_days?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          winner_crew_id?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      session_kudos: {
        Row: {
          id: string;
          workout_log_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_log_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_log_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_kudos_workout_log_id_fkey";
            columns: ["workout_log_id"];
            isOneToOne: false;
            referencedRelation: "workout_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_kudos_user_id_fkey";
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
          p_session_type?: string;
          p_is_moonboard?: boolean;
          p_is_outdoors?: boolean;
          p_hardest_grade?: string | null;
        };
        Returns: number;
      };
      create_crew: { Args: { p_name: string }; Returns: Json };
      join_crew_by_code: { Args: { p_code: string }; Returns: Json };
      leave_crew: { Args: Record<string, never>; Returns: undefined };
      delete_crew: { Args: Record<string, never>; Returns: undefined };
      regenerate_invite_code: { Args: Record<string, never>; Returns: string };
      challenge_crew_battle: {
        Args: { p_opponent_code: string; p_duration_days?: number };
        Returns: Json;
      };
      accept_crew_battle: { Args: { p_battle_id: string }; Returns: Json };
      decline_crew_battle: { Args: { p_battle_id: string }; Returns: undefined };
      compute_battle_scores: { Args: { p_battle_id: string }; Returns: Json };
      finalize_expired_battles: { Args: Record<string, never>; Returns: undefined };
      update_crew_location: { Args: { p_location: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
