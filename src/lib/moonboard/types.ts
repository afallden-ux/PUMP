import type { FontGrade } from "@/lib/constants/fontGrades";

export const MOONBOARD_HOST = "https://www.moonboard.com";

export const MOONBOARD_BOARDS = {
  moon2016: { id: 1, label: "MoonBoard 2016" },
  moon2017: { id: 15, label: "MoonBoard 2017" },
  moon2019: { id: 17, label: "MoonBoard 2019" },
  moon2020: { id: 19, label: "MoonBoard 2020" },
  moon2024: { id: 21, label: "MoonBoard 2024" },
} as const;

export type MoonboardBoardKey = keyof typeof MOONBOARD_BOARDS;

export const MOONBOARD_BOARD_KEYS = Object.keys(
  MOONBOARD_BOARDS
) as MoonboardBoardKey[];

/** Angle id → degrees (per board). */
export const MOONBOARD_ANGLE_MAP: Record<
  MoonboardBoardKey,
  Record<number, number>
> = {
  moon2016: { 3: 40 },
  moon2017: { 2: 25, 1: 40 },
  moon2019: { 2: 25, 1: 40 },
  moon2020: { 1: 40 },
  moon2024: { 2: 25, 3: 40 },
};

export interface MoonboardCookie {
  name: string;
  value: string;
}

export interface MoonboardAscent {
  externalKey: string;
  boardKey: MoonboardBoardKey;
  angle: number | null;
  climbName: string;
  climbedAt: string;
  gradeDisplay: string | null;
  gradeLogged: string | null;
  tries: string | null;
  isBenchmark: boolean;
  comment: string | null;
}

export interface MoonboardSummary {
  connected: boolean;
  moonUsername: string | null;
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
    boardKey: string;
  } | null;
}
