import { SESSION_TYPE_META } from "@/lib/constants/sessionTypes";
import type { WorkoutLog } from "@/types/app";

/** Chart buckets — climbing split into gym wall, board, outdoors. */
export const CHART_CATEGORIES = [
  "climbing_gym",
  "climbing_board",
  "climbing_outdoors",
  "hangboard",
  "gym",
  "stretching",
] as const;

export type WorkoutChartCategory = (typeof CHART_CATEGORIES)[number];

export const CHART_CATEGORY_META: Record<
  WorkoutChartCategory,
  { label: string; chartColor: string; emoji: string }
> = {
  climbing_gym: {
    label: "Gym climb",
    chartColor: "#f97316",
    emoji: "🧗",
  },
  climbing_board: {
    label: "Board",
    chartColor: "#6366f1",
    emoji: "🎯",
  },
  climbing_outdoors: {
    label: "Outdoors",
    chartColor: "#10b981",
    emoji: "🏔",
  },
  hangboard: {
    label: SESSION_TYPE_META.hangboard.label,
    chartColor: SESSION_TYPE_META.hangboard.chartColor,
    emoji: SESSION_TYPE_META.hangboard.emoji,
  },
  gym: {
    label: SESSION_TYPE_META.gym.label,
    chartColor: SESSION_TYPE_META.gym.chartColor,
    emoji: SESSION_TYPE_META.gym.emoji,
  },
  stretching: {
    label: SESSION_TYPE_META.stretching.label,
    chartColor: SESSION_TYPE_META.stretching.chartColor,
    emoji: SESSION_TYPE_META.stretching.emoji,
  },
};

export function getWorkoutChartCategory(log: WorkoutLog): WorkoutChartCategory {
  if (log.session_type === "climbing") {
    if (log.is_moonboard) return "climbing_board";
    if (log.is_outdoors) return "climbing_outdoors";
    return "climbing_gym";
  }
  if (log.session_type === "hangboard") return "hangboard";
  if (log.session_type === "gym") return "gym";
  if (log.session_type === "stretching") return "stretching";
  return "climbing_gym";
}

export function chartCategoryLabel(log: WorkoutLog): string {
  return CHART_CATEGORY_META[getWorkoutChartCategory(log)].label;
}

export function chartCategoryColor(log: WorkoutLog): string {
  return CHART_CATEGORY_META[getWorkoutChartCategory(log)].chartColor;
}
