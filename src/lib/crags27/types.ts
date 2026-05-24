import type { FontGrade } from "@/lib/constants/fontGrades";

export const CRAGS27_HOST = "https://thetopo.com";

export interface Crags27Ascent {
  externalKey: string;
  climbName: string;
  climbedAt: string;
  gradeDisplay: string | null;
  ascentStyle: string | null;
  cragName: string | null;
  routeType: string | null;
  comment: string | null;
}

export interface Crags27Summary {
  connected: boolean;
  profileSlug: string | null;
  loginUsername: string | null;
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
  } | null;
}
