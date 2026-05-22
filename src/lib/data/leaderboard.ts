import { getWeeklyRankTitle } from "@/lib/constants/rankTitles";
import type { LeaderboardEntry } from "@/types/app";
import type { Database } from "@/types/database";

type LeaderboardRow = Database["public"]["Views"]["leaderboard_7d"]["Row"];

function filterRows(rows: LeaderboardRow[], memberIds?: string[]) {
  if (!memberIds?.length) return rows;
  const idSet = new Set(memberIds);
  return rows.filter((row) => idSet.has(row.id));
}

export function mapLeaderboardRows(
  rows: LeaderboardRow[],
  memberIds?: string[]
): LeaderboardEntry[] {
  const filtered = filterRows(rows, memberIds);
  const sorted = [...filtered].sort(
    (a, b) => b.points_7d - a.points_7d || b.sessions_7d - a.sessions_7d
  );
  const total = sorted.length;
  return sorted.map((row, index) => {
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

export function mapLifetimeLeaderboard(
  rows: LeaderboardRow[],
  memberIds?: string[]
): LeaderboardEntry[] {
  const filtered = filterRows(rows, memberIds);
  const sorted = [...filtered].sort(
    (a, b) => b.current_pump_score - a.current_pump_score
  );
  const total = sorted.length;
  return sorted.map((row, index) => {
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
      rank_title:
        rank === 1 && total > 1
          ? "Lifetime legend"
          : rank === 1
            ? "Solo legend"
            : `Lifetime #${rank}`,
    };
  });
}
