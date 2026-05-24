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
          height_cm: number | null;
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
          height_cm?: number | null;
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
          height_cm?: number | null;
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
          notes: string | null;
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
          notes?: string | null;
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
          notes?: string | null;
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
          banner_url: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          location?: string | null;
          banner_url?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          location?: string | null;
          banner_url?: string | null;
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
      body_metric_logs: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string;
          value_kg: number;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: string;
          value_kg: number;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: string;
          value_kg?: number;
          recorded_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "body_metric_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_logs: {
        Row: {
          id: string;
          user_id: string;
          assessment_type: string;
          recorded_at: string;
          body_weight_kg: number | null;
          resistance_kg: number | null;
          time_under_tension_s: number | null;
          total_duration_s: number | null;
          distance_cm: number | null;
          sets: number | null;
          reps: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_type: string;
          recorded_at?: string;
          body_weight_kg?: number | null;
          resistance_kg?: number | null;
          time_under_tension_s?: number | null;
          total_duration_s?: number | null;
          distance_cm?: number | null;
          sets?: number | null;
          reps?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_type?: string;
          recorded_at?: string;
          body_weight_kg?: number | null;
          resistance_kg?: number | null;
          time_under_tension_s?: number | null;
          total_duration_s?: number | null;
          distance_cm?: number | null;
          sets?: number | null;
          reps?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      moonboard_connections: {
        Row: {
          user_id: string;
          moon_username: string;
          session_cookies: string;
          last_sync_at: string | null;
          last_sync_status: string;
          last_sync_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          moon_username: string;
          session_cookies: string;
          last_sync_at?: string | null;
          last_sync_status?: string;
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          moon_username?: string;
          session_cookies?: string;
          last_sync_at?: string | null;
          last_sync_status?: string;
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moonboard_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      moonboard_ascents: {
        Row: {
          id: string;
          user_id: string;
          external_key: string;
          board_key: string;
          angle: number | null;
          climb_name: string;
          climbed_at: string;
          grade_display: string | null;
          grade_logged: string | null;
          tries: string | null;
          is_benchmark: boolean;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          external_key: string;
          board_key: string;
          angle?: number | null;
          climb_name: string;
          climbed_at: string;
          grade_display?: string | null;
          grade_logged?: string | null;
          tries?: string | null;
          is_benchmark?: boolean;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          external_key?: string;
          board_key?: string;
          angle?: number | null;
          climb_name?: string;
          climbed_at?: string;
          grade_display?: string | null;
          grade_logged?: string | null;
          tries?: string | null;
          is_benchmark?: boolean;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moonboard_ascents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crags27_connections: {
        Row: {
          user_id: string;
          login_username: string;
          profile_slug: string;
          session_cookies: string;
          last_sync_at: string | null;
          last_sync_status: string;
          last_sync_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          login_username: string;
          profile_slug: string;
          session_cookies: string;
          last_sync_at?: string | null;
          last_sync_status?: string;
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          login_username?: string;
          profile_slug?: string;
          session_cookies?: string;
          last_sync_at?: string | null;
          last_sync_status?: string;
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crags27_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crags27_ascent_tree: {
        Row: {
          user_id: string;
          grade: string;
          total: number;
          onsight: number;
          flash: number;
          redpoint: number;
          toprope: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          grade: string;
          total?: number;
          onsight?: number;
          flash?: number;
          redpoint?: number;
          toprope?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          grade?: string;
          total?: number;
          onsight?: number;
          flash?: number;
          redpoint?: number;
          toprope?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crags27_ascent_tree_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      crags27_ascents: {
        Row: {
          id: string;
          user_id: string;
          external_key: string;
          climb_name: string;
          climbed_at: string;
          grade_display: string | null;
          ascent_style: string | null;
          crag_name: string | null;
          route_type: string | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          external_key: string;
          climb_name: string;
          climbed_at: string;
          grade_display?: string | null;
          ascent_style?: string | null;
          crag_name?: string | null;
          route_type?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          external_key?: string;
          climb_name?: string;
          climbed_at?: string;
          grade_display?: string | null;
          ascent_style?: string | null;
          crag_name?: string | null;
          route_type?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crags27_ascents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      eighta_connections: {
        Row: {
          user_id: string;
          profile_slug: string;
          login_username: string;
          session_cookies: string;
          last_sync_at: string | null;
          last_sync_status: string;
          last_sync_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          profile_slug: string;
          login_username: string;
          session_cookies?: string;
          last_sync_at?: string | null;
          last_sync_status?: string;
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          profile_slug?: string;
          login_username?: string;
          session_cookies?: string;
          last_sync_at?: string | null;
          last_sync_status?: string;
          last_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eighta_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      eighta_ascents: {
        Row: {
          id: string;
          user_id: string;
          external_key: string;
          category: string;
          climb_name: string;
          climbed_at: string;
          grade_display: string | null;
          ascent_style: string | null;
          crag_name: string | null;
          area_name: string | null;
          comment: string | null;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          external_key: string;
          category: string;
          climb_name: string;
          climbed_at: string;
          grade_display?: string | null;
          ascent_style?: string | null;
          crag_name?: string | null;
          area_name?: string | null;
          comment?: string | null;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          external_key?: string;
          category?: string;
          climb_name?: string;
          climbed_at?: string;
          grade_display?: string | null;
          ascent_style?: string | null;
          crag_name?: string | null;
          area_name?: string | null;
          comment?: string | null;
          rating?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eighta_ascents_user_id_fkey";
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
      leave_crew: { Args: { p_crew_id: string }; Returns: undefined };
      delete_crew: { Args: { p_crew_id: string }; Returns: undefined };
      regenerate_invite_code: { Args: { p_crew_id: string }; Returns: string };
      challenge_crew_battle: {
        Args: {
          p_crew_id: string;
          p_opponent_code: string;
          p_duration_days?: number;
        };
        Returns: Json;
      };
      accept_crew_battle: { Args: { p_battle_id: string }; Returns: Json };
      decline_crew_battle: { Args: { p_battle_id: string }; Returns: undefined };
      compute_battle_scores: { Args: { p_battle_id: string }; Returns: Json };
      finalize_expired_battles: { Args: Record<string, never>; Returns: undefined };
      update_crew_location: {
        Args: { p_crew_id: string; p_location: string };
        Returns: undefined;
      };
      update_crew_banner_url: {
        Args: { p_crew_id: string; p_url: string };
        Returns: undefined;
      };
      list_public_crews: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          name: string;
          location: string | null;
          banner_url: string | null;
          member_count: number;
          created_at: string;
        }[];
      };
      get_public_crew_detail: { Args: { p_crew_id: string }; Returns: Json };
      get_my_crew_memberships: { Args: Record<string, never>; Returns: Json };
      delete_my_account: { Args: Record<string, never>; Returns: undefined };
      get_inactivity_nudge_candidates: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_platform_activity_summary: {
        Args: { p_hours?: number };
        Returns: Json;
      };
      mark_inactivity_email_sent_system: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
