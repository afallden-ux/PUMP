import type { FontGrade } from "@/lib/constants/fontGrades";

export const CRAGS27_HOST = "https://thetopo.com";

/** One row of the 27crags ascent tree (grade × style counts). */
export interface Crags27TreeRow {
  grade: string;
  total: number;
  onsight: number;
  flash: number;
  redpoint: number;
  toprope: number;
}

export interface Crags27Summary {
  connected: boolean;
  profileSlug: string | null;
  loginUsername: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
  totalAscents: number;
  hardestGrade: FontGrade | null;
  hardestGradeDisplay: string | null;
  tree: Crags27TreeRow[];
}
