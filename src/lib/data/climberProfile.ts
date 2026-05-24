import { createClient } from "@/lib/supabase/client";
import { getWeeklyRankTitle } from "@/lib/constants/rankTitles";
import type { FontGrade } from "@/lib/constants/fontGrades";
import {
  aggregateSessionCounts,
  type SessionCounts,
} from "@/lib/data/sessionBadges";
import { maxHardestGrade } from "@/lib/utils/hardestGrade";
import {
  computeWeeklyPodiumTally,
  type WeeklyPodiumTally,
} from "@/lib/utils/weeklyPodiumTally";
import type { Profile } from "@/types/app";

const PODIUM_LOOKBACK_WEEKS = 52;

export interface ClimberProfileStats {
  profile: Profile;
  sessionCounts: SessionCounts;
  hardestGrade: FontGrade | null;
  totalLogs: number;
  weeklyRank: number | null;
  weeklyPoints: number;
  weeklySessions: number;
  weeklyTitle: string | null;
  podium: WeeklyPodiumTally;
}

export async function fetchClimberProfileStats(
  userId: string
): Promise<ClimberProfileStats | null> {
  const supabase = createClient();

  const since = new Date();
  since.setDate(since.getDate() - PODIUM_LOOKBACK_WEEKS * 7);

  const [
    profileRes,
    logsRes,
    gradesRes,
    countRes,
    leaderboardRes,
    podiumLogsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, title, home_crag, height_cm, current_pump_score, last_logged_at"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("workout_logs")
      .select("session_type, is_moonboard, is_outdoors")
      .eq("user_id", userId),
    supabase
      .from("workout_logs")
      .select("hardest_grade")
      .eq("user_id", userId)
      .not("hardest_grade", "is", null),
    supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("leaderboard_7d").select("*").order("points_7d", {
      ascending: false,
    }),
    supabase
      .from("workout_logs")
      .select("user_id, created_at, total_points")
      .gte("created_at", since.toISOString()),
  ]);

  if (profileRes.error || !profileRes.data) return null;

  const sessionCounts = aggregateSessionCounts(logsRes.data ?? []);
  const hardestGrade = maxHardestGrade(
    (gradesRes.data ?? []).map((r) => r.hardest_grade)
  );

  const leaderboard = leaderboardRes.data ?? [];
  const weeklyIdx = leaderboard.findIndex((r) => r.id === userId);
  const weeklyRow = weeklyIdx >= 0 ? leaderboard[weeklyIdx] : null;
  const weeklyRank = weeklyIdx >= 0 ? weeklyIdx + 1 : null;
  const weeklyTitle =
    weeklyRank !== null
      ? getWeeklyRankTitle(weeklyRank, leaderboard.length)
      : null;

  const podium = computeWeeklyPodiumTally(podiumLogsRes.data ?? [], userId);

  return {
    profile: profileRes.data as Profile,
    sessionCounts,
    hardestGrade,
    totalLogs: countRes.count ?? sessionCounts.total,
    weeklyRank,
    weeklyPoints: weeklyRow?.points_7d ?? 0,
    weeklySessions: weeklyRow?.sessions_7d ?? 0,
    weeklyTitle,
    podium,
  };
}
