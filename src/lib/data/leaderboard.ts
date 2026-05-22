import { getWeeklyRankTitle } from "@/lib/constants/rankTitles";
import type { LeaderboardEntry } from "@/types/app";
import type { Database } from "@/types/database";

type LeaderboardRow = Database["public"]["Views"]["leaderboard_7d"]["Row"];

export function mapLeaderboardRows(rows: LeaderboardRow[]): LeaderboardEntry[] {
  const total = rows.length;
  return rows.map((row, index) => {
    const rank = index + 1;
    return {
      id: row.id,
      username: row.username,
      avatar_url: row.avatar_url,
      title: row.title,
      current_pump_score: row.current_pump_score,
      last_logged_at: row.last_logged_at,
      points_7d: row.points_7d,
      sessions_7d: row.sessions_7d,
      rank,
      rank_title: getWeeklyRankTitle(rank, total),
    };
  });
}
