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

/** Top percentile (100 = best). */
export function rankPercentile(rank: number, total: number): number {
  if (total <= 0) return 0;
  if (total === 1) return 100;
  return Math.round(((total - rank) / (total - 1)) * 100);
}

/** Gap from leader as % of leader value (0 = tied for first). */
export function gapFromLeaderPct(
  value: number,
  leaderValue: number,
  higherIsBetter: boolean
): number {
  if (leaderValue <= 0) return 0;
  if (value === leaderValue) return 0;
  if (higherIsBetter) {
    return Math.round(((leaderValue - value) / leaderValue) * 100);
  }
  return Math.round(((value - leaderValue) / leaderValue) * 100);
}
