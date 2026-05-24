import type { FontGrade } from "@/lib/constants/fontGrades";

export type LeaderboardCategory =
  | "all"
  | "strength"
  | "flex"
  | "outdoor"
  | "moonboard"
  | "crags27"
  | "eighta"
  | "activity";

/** One row of precomputed stats for ranking. */
export interface LeaderboardAthlete {
  id: string;
  username: string;
  avatar_url: string | null;
  title: string;
  current_pump_score: number;
  weeklyPoints: number;
  weeklySessions: number;
  totalLogs: number;
  fingerStrengthKg: number | null;
  fingerStrengthPctBw: number | null;
  weightedPullupKg: number | null;
  weightedPullupPctBw: number | null;
  powerEnduranceTutS: number | null;
  hipFlexibilityCm: number | null;
  hipFlexibilityPctHeight: number | null;
  hardestGradeOutdoor: FontGrade | null;
  moonboardHardestGrade: FontGrade | null;
  moonboardTotalAscents: number;
  moonboardAscents30d: number;
  crags27HardestGrade: FontGrade | null;
  crags27TotalAscents: number;
  crags27Ascents30d: number;
  eightaHardestGrade: FontGrade | null;
  eightaTotalAscents: number;
  eightaAscents30d: number;
}

export interface RankedLeaderboardRow {
  rank: number;
  athlete: LeaderboardAthlete;
  value: number;
  displayValue: string;
  isCurrentUser: boolean;
}

export interface LeaderboardMetricDef {
  id: string;
  label: string;
  description: string;
  category: Exclude<LeaderboardCategory, "all">;
  higherIsBetter: boolean;
  unit?: string;
  getValue: (a: LeaderboardAthlete) => number | null;
  formatValue: (a: LeaderboardAthlete) => string;
}
