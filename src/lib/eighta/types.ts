import type { FontGrade } from "@/lib/constants/fontGrades";

export type EightaCategory = "sportclimbing" | "bouldering";

export const EIGHTA_CATEGORIES: EightaCategory[] = ["sportclimbing", "bouldering"];

export interface EightaAscent {
  externalKey: string;
  category: EightaCategory;
  climbName: string;
  climbedAt: string;
  gradeDisplay: string | null;
  ascentStyle: string | null;
  cragName: string | null;
  areaName: string | null;
  comment: string | null;
  rating: number | null;
}

export interface EightaSummary {
  connected: boolean;
  profileSlug: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
  totalAscents: number;
  ascentsLast30Days: number;
  hardestGrade: FontGrade | null;
  latestAscent: {
    climbName: string;
    grade: string | null;
    climbedAt: string;
    category: EightaCategory;
  } | null;
}
