export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  title: string;
  current_pump_score: number;
  last_logged_at: string | null;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  duration_minutes: number;
  intensity_level: IntensityLevel;
  total_points: number;
  created_at: string;
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

export interface WorkoutLogWithProfile extends WorkoutLog {
  profiles: Pick<Profile, "username" | "avatar_url">;
}
