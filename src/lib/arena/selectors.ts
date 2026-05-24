import {
  ARENA_CATEGORY_META,
  ARENA_CATEGORY_ORDER,
} from "@/lib/arena/categories";
import type {
  ArenaAthlete,
  ArenaCategory,
  ArenaMetric,
  ArenaTimeframe,
  ArenaWorkout,
  CategorySlice,
  RankedAthlete,
  WeeklyStackRow,
} from "@/lib/arena/types";

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function timeframeStart(tf: ArenaTimeframe, now = new Date()): Date {
  const d = new Date(now);
  switch (tf) {
    case "7d":
      d.setDate(d.getDate() - 7);
      return d;
    case "4w":
      d.setDate(d.getDate() - 28);
      return d;
    case "12w":
      d.setDate(d.getDate() - 84);
      return d;
    case "ytd":
      return new Date(d.getFullYear(), 0, 1);
    default:
      return d;
  }
}

export function filterWorkouts(
  workouts: ArenaWorkout[],
  tf: ArenaTimeframe,
  now = new Date()
): ArenaWorkout[] {
  const start = timeframeStart(tf, now).getTime();
  return workouts.filter((w) => new Date(w.recordedAt).getTime() >= start);
}

export function buildBreakdown(workouts: ArenaWorkout[]): CategorySlice[] {
  const totals = new Map<ArenaCategory, { count: number; hours: number; vPoints: number }>();

  for (const cat of ARENA_CATEGORY_ORDER) {
    totals.set(cat, { count: 0, hours: 0, vPoints: 0 });
  }

  for (const w of workouts) {
    const t = totals.get(w.category)!;
    t.count += 1;
    t.hours += w.durationMinutes / 60;
    t.vPoints += w.vPoints;
  }

  return ARENA_CATEGORY_ORDER.map((category) => {
    const t = totals.get(category)!;
    const meta = ARENA_CATEGORY_META[category];
    return {
      category,
      count: t.count,
      hours: Math.round(t.hours * 10) / 10,
      vPoints: t.vPoints,
      color: meta.color,
      label: meta.label,
    };
  }).filter((s) => s.count > 0);
}

export function metricValue(
  workouts: ArenaWorkout[],
  metric: ArenaMetric
): number {
  if (metric === "workouts") return workouts.length;
  if (metric === "volume") {
    const mins = workouts.reduce((s, w) => s + w.durationMinutes, 0);
    return Math.round((mins / 60) * 10) / 10;
  }
  return workouts.reduce((s, w) => s + w.vPoints, 0);
}

export function metricLabel(metric: ArenaMetric, value: number): string {
  if (metric === "workouts") return `${value} workouts`;
  if (metric === "volume") return `${value}h`;
  return `${value} V-pts`;
}

export function dominantSlice(breakdown: CategorySlice[]): {
  category: ArenaCategory;
  pct: number;
} {
  const total = breakdown.reduce((s, b) => s + b.count, 0);
  if (total === 0) {
    return { category: "boardClimbing", pct: 0 };
  }
  const top = [...breakdown].sort((a, b) => b.count - a.count)[0]!;
  return {
    category: top.category,
    pct: Math.round((top.count / total) * 100),
  };
}

export function buildWeeklyStacks(
  workouts: ArenaWorkout[],
  weeks = 12,
  now = new Date()
): WeeklyStackRow[] {
  const rows: WeeklyStackRow[] = [];
  const endWeek = startOfWeek(now);

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(endWeek);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const row: WeeklyStackRow = {
      weekKey: weekStart.toISOString(),
      weekLabel: weekStart.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      fingerboard: 0,
      boardClimbing: 0,
      conditioning: 0,
      flexibility: 0,
      endurance: 0,
      total: 0,
    };

    for (const w of workouts) {
      const t = new Date(w.recordedAt).getTime();
      if (t >= weekStart.getTime() && t < weekEnd.getTime()) {
        row[w.category] += 1;
        row.total += 1;
      }
    }

    rows.push(row);
  }

  return rows;
}

export function rankAthletes(
  athletes: ArenaAthlete[],
  metric: ArenaMetric,
  timeframe: ArenaTimeframe,
  now = new Date()
): RankedAthlete[] {
  const ranked = athletes
    .map((athlete) => {
      const inRange = filterWorkouts(athlete.workouts, timeframe, now);
      const breakdown = buildBreakdown(inRange);
      const value = metricValue(inRange, metric);
      const dom = dominantSlice(
        breakdown.length ? breakdown : buildBreakdown(athlete.workouts)
      );

      return {
        athlete,
        rank: 0,
        metricValue: value,
        metricLabel: metricLabel(metric, value),
        breakdown,
        dominantCategory: dom.category,
        dominantPct: dom.pct,
        weeklyStacks: buildWeeklyStacks(
          filterWorkouts(athlete.workouts, "12w", now),
          12,
          now
        ),
        workoutsInRange: inRange.length,
      };
    })
    .sort((a, b) => b.metricValue - a.metricValue);

  return ranked.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function avgWorkoutsPerWeek(stacks: WeeklyStackRow[]): number {
  const active = stacks.filter((w) => w.total > 0);
  if (!active.length) return 0;
  const sum = active.reduce((s, w) => s + w.total, 0);
  return Math.round((sum / active.length) * 10) / 10;
}
