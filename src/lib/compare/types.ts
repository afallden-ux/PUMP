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
}
