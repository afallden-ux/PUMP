import type { WorkoutLog } from "@/types/app";

export type HoursRange = "week" | "month" | "year";

export interface HoursSeriesPoint {
  label: string;
  key: string;
  [userId: string]: string | number;
}

const RANGE_CONFIG: Record<
  HoursRange,
  { days: number; bucket: (d: Date) => string; label: (d: Date) => string }
> = {
  week: {
    days: 84,
    bucket: (d) => {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const day = start.getDay();
      const diff = (day + 6) % 7;
      start.setDate(start.getDate() - diff);
      return start.toISOString().slice(0, 10);
    },
    label: (d) =>
      `W/C ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
  },
  month: {
    days: 365,
    bucket: (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: (d) => d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
  },
  year: {
    days: 365 * 3,
    bucket: (d) => String(d.getFullYear()),
    label: (d) => String(d.getFullYear()),
  },
};

export function buildHoursComparisonSeries(
  logsByUser: Record<string, WorkoutLog[]>,
  usernames: Record<string, string>,
  range: HoursRange
): { data: HoursSeriesPoint[]; userIds: string[] } {
  const config = RANGE_CONFIG[range];
  const cutoff = Date.now() - config.days * 24 * 60 * 60 * 1000;
  const userIds = Object.keys(logsByUser);
  const bucketKeys = new Set<string>();
  const bucketLabels = new Map<string, string>();

  const acc: Record<string, Record<string, number>> = {};

  for (const userId of userIds) {
    for (const log of logsByUser[userId] ?? []) {
      const t = new Date(log.created_at).getTime();
      if (t < cutoff) continue;
      const d = new Date(log.created_at);
      const key = config.bucket(d);
      bucketKeys.add(key);
      bucketLabels.set(key, config.label(d));
      if (!acc[key]) acc[key] = {};
      acc[key][userId] = (acc[key][userId] ?? 0) + log.duration_minutes / 60;
    }
  }

  const sortedKeys = [...bucketKeys].sort();

  const data: HoursSeriesPoint[] = sortedKeys.map((key) => {
    const point: HoursSeriesPoint = {
      key,
      label: bucketLabels.get(key) ?? key,
    };
    for (const userId of userIds) {
      const hours = acc[key]?.[userId] ?? 0;
      point[userId] = Math.round(hours * 10) / 10;
    }
    return point;
  });

  return { data, userIds };
}

export const COMPARISON_COLORS = [
  "#f97316",
  "#38bdf8",
  "#a78bfa",
  "#4ade80",
  "#f472b6",
  "#facc15",
  "#fb7185",
  "#2dd4bf",
];
