import type { CrewFeedSession } from "@/types/app";
import type { SessionType } from "@/lib/constants/sessionTypes";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { IntensityLevel } from "@/types/app";

/** Explicit columns so feed works even if PostgREST schema cache lags new columns. */
export const FEED_LOG_SELECT = `
  id,
  user_id,
  session_type,
  duration_minutes,
  intensity_level,
  total_points,
  photo_url,
  notes,
  is_moonboard,
  is_outdoors,
  hardest_grade,
  created_at,
  profiles ( id, username, avatar_url, current_pump_score, home_crag ),
  session_comments (
    id, workout_log_id, user_id, body, created_at,
    profiles ( username, avatar_url )
  ),
  session_kudos (
    id, workout_log_id, user_id, created_at,
    profiles ( username )
  )
`;

export function normalizeFeedSession(row: Record<string, unknown>): CrewFeedSession {
  const profile = row.profiles as CrewFeedSession["profiles"];
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    session_type: (row.session_type as SessionType) ?? "climbing",
    duration_minutes: row.duration_minutes as number,
    intensity_level: row.intensity_level as IntensityLevel,
    total_points: row.total_points as number,
    photo_url: (row.photo_url as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    is_moonboard: Boolean(row.is_moonboard),
    is_outdoors: Boolean(row.is_outdoors),
    hardest_grade: (row.hardest_grade as FontGrade | null) ?? null,
    created_at: row.created_at as string,
    profiles: profile,
    session_comments: (row.session_comments as CrewFeedSession["session_comments"]) ?? [],
    session_kudos: (row.session_kudos as CrewFeedSession["session_kudos"]) ?? [],
  };
}
