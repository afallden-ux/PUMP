/** Mirrors Supabase profiles + workout_logs — arena-only fields for mock UI. */

export type ArenaCategory =
  | "fingerboard"
  | "boardClimbing"
  | "conditioning"
  | "flexibility"
  | "endurance";

export type ArenaTimeframe = "7d" | "4w" | "12w" | "ytd";

export type ArenaMetric = "volume" | "workouts" | "vpoints";

export interface BaselineTests {
  fingerStrengthPctBw: number;
  flexibilityScore: number;
  enduranceMinutes: number;
  recordedAt: string;
}

export interface BaselineProgress {
  fingerStrengthPctBw: number;
  flexibilityScore: number;
  enduranceMinutes: number;
  /** 0–100 composite improvement vs initial baseline */
  improvementPct: number;
}

export interface ArenaWorkout {
  id: string;
  userId: string;
  recordedAt: string;
  category: ArenaCategory;
  durationMinutes: number;
  vPoints: number;
  isMoonboard?: boolean;
}

export interface ArenaAthlete {
  id: string;
  username: string;
  avatarUrl: string | null;
  isMe: boolean;
  heightCm: number;
  weightKg: number;
  climbingAvatarLevel: number;
  climbingAvatarTitle: string;
  lifetimePumpScore: number;
  initialBaseline: BaselineTests;
  currentBaseline: BaselineProgress;
  workouts: ArenaWorkout[];
}

export interface CategorySlice {
  category: ArenaCategory;
  count: number;
  hours: number;
  vPoints: number;
  color: string;
  label: string;
}

export interface WeeklyStackRow {
  weekKey: string;
  weekLabel: string;
  fingerboard: number;
  boardClimbing: number;
  conditioning: number;
  flexibility: number;
  endurance: number;
  total: number;
}

export interface RankedAthlete {
  athlete: ArenaAthlete;
  rank: number;
  metricValue: number;
  metricLabel: string;
  breakdown: CategorySlice[];
  dominantCategory: ArenaCategory;
  dominantPct: number;
  weeklyStacks: WeeklyStackRow[];
  workoutsInRange: number;
}
