export type CompareWinner = "left" | "right" | "tie" | "none";

import type { AssessmentType } from "@/lib/constants/assessments";
import type { FontGrade } from "@/lib/constants/fontGrades";
import type { AssessmentLog } from "@/lib/assessments/types";
import type { Profile } from "@/types/app";

/** Unified metrics for side-by-side compare UI. */
export interface CompareSnapshot {
  profile: Profile;
  heightCm: number | null;
  bodyWeightKg: number | null;
  fingerStrengthKg: number | null;
  fingerStrengthPctBw: number | null;
  weightedPullupKg: number | null;
  weightedPullupPctBw: number | null;
  powerEnduranceTutS: number | null;
  powerEnduranceTotalS: number | null;
  hipFlexibilityCm: number | null;
  hipFlexibilityPctHeight: number | null;
  hardestGrade: FontGrade | null;
  totalLogs: number;
  lifetimeScore: number;
  weeklyPoints: number;
  weeklyRank: number | null;
  latestByAssessment: Record<AssessmentType, AssessmentLog | null>;
  moonboardTotalAscents: number;
  moonboardAscents30d: number;
  moonboardHardestGrade: FontGrade | null;
  moonboardLatestClimb: string | null;
  crags27TotalAscents: number;
  crags27Ascents30d: number;
  crags27HardestGrade: FontGrade | null;
  crags27LatestClimb: string | null;
  eightaTotalAscents: number;
  eightaAscents30d: number;
  eightaHardestGrade: FontGrade | null;
  eightaLatestClimb: string | null;
}
