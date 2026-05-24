import { getMetricById } from "@/lib/leaderboards/metrics";
import type {
  LeaderboardAthlete,
  RankedLeaderboardRow,
} from "@/lib/leaderboards/types";

export function rankAthletesForMetric(
  athletes: LeaderboardAthlete[],
  metricId: string,
  currentUserId: string
): RankedLeaderboardRow[] {
  const def = getMetricById(metricId);
  if (!def) return [];

  const rows = athletes
    .map((athlete) => {
      const value = def.getValue(athlete);
      if (value == null || Number.isNaN(value)) return null;
      return {
        athlete,
        value,
        displayValue: def.formatValue(athlete),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);

  rows.sort((a, b) => {
    if (a.value === b.value) {
      return a.athlete.username.localeCompare(b.athlete.username);
    }
    return def.higherIsBetter ? b.value - a.value : a.value - b.value;
  });

  return rows.map((row, index) => ({
    rank: index + 1,
    athlete: row.athlete,
    value: row.value,
    displayValue: row.displayValue,
    isCurrentUser: row.athlete.id === currentUserId,
  }));
}

/** Normalized 0–100 for bar chart relative to leader. */
export function barWidthPct(
  value: number,
  leaderValue: number,
  higherIsBetter: boolean
): number {
  if (leaderValue <= 0) return 0;
  const ratio = value / leaderValue;
  return Math.min(100, Math.round((higherIsBetter ? ratio : 2 - ratio) * 100));
}
