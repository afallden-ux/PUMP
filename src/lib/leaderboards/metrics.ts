import { FONT_GRADES, type FontGrade } from "@/lib/constants/fontGrades";
import type {
  LeaderboardAthlete,
  LeaderboardCategory,
  LeaderboardMetricDef,
} from "@/lib/leaderboards/types";

function gradeIndex(g: FontGrade | null): number | null {
  if (!g) return null;
  const i = FONT_GRADES.indexOf(g);
  return i >= 0 ? i : null;
}

export const LEADERBOARD_METRICS: LeaderboardMetricDef[] = [
  {
    id: "hang_kg",
    label: "Max hang load",
    description: "Latest finger-strength assessment — added resistance (kg)",
    category: "strength",
    higherIsBetter: true,
    unit: "kg",
    getValue: (a) => a.fingerStrengthKg,
    formatValue: (a) =>
      a.fingerStrengthKg != null ? `${a.fingerStrengthKg} kg` : "—",
  },
  {
    id: "hang_pct",
    label: "Max hang",
    description: "Added hang load as % of body weight",
    category: "strength",
    higherIsBetter: true,
    unit: "%",
    getValue: (a) => a.fingerStrengthPctBw,
    formatValue: (a) =>
      a.fingerStrengthPctBw != null ? `${a.fingerStrengthPctBw}%` : "—",
  },
  {
    id: "pull_kg",
    label: "Weighted pull-up",
    description: "Latest weighted pull-up — added load (kg)",
    category: "strength",
    higherIsBetter: true,
    unit: "kg",
    getValue: (a) => a.weightedPullupKg,
    formatValue: (a) =>
      a.weightedPullupKg != null ? `${a.weightedPullupKg} kg` : "—",
  },
  {
    id: "pull_pct",
    label: "Weighted pull-up",
    description: "Added pull-up load as % of body weight",
    category: "strength",
    higherIsBetter: true,
    unit: "%",
    getValue: (a) => a.weightedPullupPctBw,
    formatValue: (a) =>
      a.weightedPullupPctBw != null ? `${a.weightedPullupPctBw}%` : "—",
  },
  {
    id: "endurance",
    label: "Power endurance",
    description: "Time under tension from power-endurance assessment",
    category: "strength",
    higherIsBetter: true,
    unit: "s",
    getValue: (a) => a.powerEnduranceTutS,
    formatValue: (a) =>
      a.powerEnduranceTutS != null ? `${a.powerEnduranceTutS}s` : "—",
  },
  {
    id: "hip_cm",
    label: "Hip flexibility",
    description: "Reach distance from hip-flexibility assessment",
    category: "flex",
    higherIsBetter: true,
    unit: "cm",
    getValue: (a) => a.hipFlexibilityCm,
    formatValue: (a) =>
      a.hipFlexibilityCm != null ? `${a.hipFlexibilityCm} cm` : "—",
  },
  {
    id: "hip_pct",
    label: "Hip flexibility",
    description: "Reach as % of height",
    category: "flex",
    higherIsBetter: true,
    unit: "%",
    getValue: (a) => a.hipFlexibilityPctHeight,
    formatValue: (a) =>
      a.hipFlexibilityPctHeight != null ? `${a.hipFlexibilityPctHeight}%` : "—",
  },
  {
    id: "outdoor_grade",
    label: "Hardest outdoor send",
    description: "Best grade logged in CC session history",
    category: "outdoor",
    higherIsBetter: true,
    getValue: (a) => gradeIndex(a.hardestGradeOutdoor),
    formatValue: (a) => a.hardestGradeOutdoor ?? "—",
  },
  {
    id: "mb_grade",
    label: "Hardest MoonBoard",
    description: "Hardest grade in synced MoonBoard logbook",
    category: "moonboard",
    higherIsBetter: true,
    getValue: (a) => gradeIndex(a.moonboardHardestGrade),
    formatValue: (a) => a.moonboardHardestGrade ?? "—",
  },
  {
    id: "mb_total",
    label: "MoonBoard ascents",
    description: "Total ascents in synced MoonBoard logbook",
    category: "moonboard",
    higherIsBetter: true,
    getValue: (a) => (a.moonboardTotalAscents > 0 ? a.moonboardTotalAscents : null),
    formatValue: (a) => String(a.moonboardTotalAscents),
  },
  {
    id: "mb_30d",
    label: "MoonBoard (30d)",
    description: "MoonBoard ascents in the last 30 days",
    category: "moonboard",
    higherIsBetter: true,
    getValue: (a) => (a.moonboardAscents30d > 0 ? a.moonboardAscents30d : null),
    formatValue: (a) => String(a.moonboardAscents30d),
  },
  {
    id: "c27_grade",
    label: "Hardest 27crags",
    description: "Hardest grade in synced 27crags tick list",
    category: "crags27",
    higherIsBetter: true,
    getValue: (a) => gradeIndex(a.crags27HardestGrade),
    formatValue: (a) => a.crags27HardestGrade ?? "—",
  },
  {
    id: "c27_total",
    label: "27crags ascents",
    description: "Total ticks synced from 27crags",
    category: "crags27",
    higherIsBetter: true,
    getValue: (a) => (a.crags27TotalAscents > 0 ? a.crags27TotalAscents : null),
    formatValue: (a) => String(a.crags27TotalAscents),
  },
  {
    id: "c27_30d",
    label: "27crags (30d)",
    description: "27crags ticks in the last 30 days",
    category: "crags27",
    higherIsBetter: true,
    getValue: (a) => (a.crags27Ascents30d > 0 ? a.crags27Ascents30d : null),
    formatValue: (a) => String(a.crags27Ascents30d),
  },
  {
    id: "8a_grade",
    label: "Hardest 8a.nu",
    description: "Hardest grade in synced 8a.nu logbook",
    category: "eighta",
    higherIsBetter: true,
    getValue: (a) => gradeIndex(a.eightaHardestGrade),
    formatValue: (a) => a.eightaHardestGrade ?? "—",
  },
  {
    id: "8a_total",
    label: "8a.nu ascents",
    description: "Total ascents synced from 8a.nu",
    category: "eighta",
    higherIsBetter: true,
    getValue: (a) => (a.eightaTotalAscents > 0 ? a.eightaTotalAscents : null),
    formatValue: (a) => String(a.eightaTotalAscents),
  },
  {
    id: "8a_30d",
    label: "8a.nu (30d)",
    description: "8a.nu ascents in the last 30 days",
    category: "eighta",
    higherIsBetter: true,
    getValue: (a) => (a.eightaAscents30d > 0 ? a.eightaAscents30d : null),
    formatValue: (a) => String(a.eightaAscents30d),
  },
  {
    id: "weekly_pts",
    label: "CC points this week",
    description: "Platform points from the last 7 days",
    category: "activity",
    higherIsBetter: true,
    getValue: (a) => (a.weeklyPoints > 0 ? a.weeklyPoints : null),
    formatValue: (a) => a.weeklyPoints.toLocaleString(),
  },
  {
    id: "lifetime",
    label: "Lifetime CC",
    description: "All-time ClimbCompare score",
    category: "activity",
    higherIsBetter: true,
    getValue: (a) => (a.current_pump_score > 0 ? a.current_pump_score : null),
    formatValue: (a) => a.current_pump_score.toLocaleString(),
  },
  {
    id: "session_logs",
    label: "Session logs",
    description: "Total workouts logged on CC",
    category: "activity",
    higherIsBetter: true,
    getValue: (a) => (a.totalLogs > 0 ? a.totalLogs : null),
    formatValue: (a) => String(a.totalLogs),
  },
];

export function getMetricById(id: string): LeaderboardMetricDef | undefined {
  return LEADERBOARD_METRICS.find((m) => m.id === id);
}

export function metricsForCategory(
  category: LeaderboardCategory
): LeaderboardMetricDef[] {
  if (category === "all") return LEADERBOARD_METRICS;
  return LEADERBOARD_METRICS.filter((m) => m.category === category);
}

export const LEADERBOARD_CATEGORIES: {
  id: LeaderboardCategory;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "strength", label: "Strength" },
  { id: "flex", label: "Flexibility" },
  { id: "outdoor", label: "Outdoor" },
  { id: "moonboard", label: "MoonBoard" },
  { id: "crags27", label: "27crags" },
  { id: "eighta", label: "8a.nu" },
  { id: "activity", label: "Activity" },
];
