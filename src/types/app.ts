import type { FontGrade } from "@/lib/constants/fontGrades";
import type { SessionType } from "@/lib/constants/sessionTypes";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  title: string;
  home_crag: string | null;
  current_pump_score: number;
  last_logged_at: string | null;
}

export interface Crew {
  id: string;
  name: string;
  invite_code: string;
  location: string | null;
  created_by: string;
  created_at: string;
}

export interface CrewMembership {
  crew: Crew;
  role: "owner" | "member";
  members: Profile[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  session_type: SessionType;
  duration_minutes: number;
  intensity_level: IntensityLevel;
  total_points: number;
  photo_url: string | null;
  is_moonboard: boolean;
  is_outdoors: boolean;
  hardest_grade: FontGrade | null;
  created_at: string;
}

export interface CrewBattle {
  id: string;
  challenger_crew_id: string;
  opponent_crew_id: string;
  status: "pending" | "active" | "completed" | "declined";
  duration_days: number;
  starts_at: string | null;
  ends_at: string | null;
  winner_crew_id: string | null;
  created_by: string;
  created_at: string;
  challenger_crew?: Crew;
  opponent_crew?: Crew;
  challenger_points?: number;
  opponent_points?: number;
}

export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  title: string;
  current_pump_score: number;
  last_logged_at: string | null;
  points_7d: number;
  sessions_7d: number;
  rank: number;
  rank_title: string;
}

export interface SessionComment {
  id: string;
  workout_log_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url">;
}

export interface SessionKudo {
  id: string;
  workout_log_id: string;
  user_id: string;
  created_at: string;
  profiles?: Pick<Profile, "username">;
}

export interface CrewFeedSession extends WorkoutLog {
  profiles: Pick<
    Profile,
    "id" | "username" | "avatar_url" | "current_pump_score" | "home_crag"
  >;
  session_comments: SessionComment[];
  session_kudos: SessionKudo[];
}

export interface WorkoutLogWithProfile extends WorkoutLog {
  profiles: Pick<Profile, "username" | "avatar_url">;
}
