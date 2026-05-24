import { FONT_GRADES, type FontGrade } from "@/lib/constants/fontGrades";

export interface MoonboardLogbookRow {
  grade: string;
  flashed: number;
  secondTry: number;
  thirdTry: number;
  moreTries: number;
  total: number;
}

/** Grades shown on the MoonBoard logbook chart (low → high). */
export const MOONBOARD_LOG_GRADES = [
  "6B+",
  "6C",
  "6C+",
  "7A",
  "7A+",
  "7B",
  "7B+",
  "7C",
  "7C+",
  "8A",
  "8A+",
  "8B",
  "8B+",
  "8C",
  "8C+",
  "9A",
] as const;

export function normalizeMoonboardGrade(raw: string): string {
  const s = raw.trim().replace(/\s+/g, "").toUpperCase();
  const direct = MOONBOARD_LOG_GRADES.find((g) => g.toUpperCase() === s);
  if (direct) return direct;
  const m = s.match(/^(\d)([ABC]?)(\+)?$/);
  if (m) {
    const base = `${m[1]}${m[2] ?? ""}${m[3] ? "+" : ""}`;
    const hit = MOONBOARD_LOG_GRADES.find((g) => g.toUpperCase() === base.toUpperCase());
    if (hit) return hit;
  }
  return s;
}

export function gradeSortIndex(grade: string): number {
  const n = normalizeMoonboardGrade(grade);
  const idx = MOONBOARD_LOG_GRADES.findIndex((g) => g === n);
  return idx >= 0 ? idx : -1;
}

export function rowTotal(row: Pick<
  MoonboardLogbookRow,
  "flashed" | "secondTry" | "thirdTry" | "moreTries"
>): number {
  return row.flashed + row.secondTry + row.thirdTry + row.moreTries;
}

export function statsFromLogbookRows(rows: MoonboardLogbookRow[]): {
  totalProblems: number;
  hardestGrade: FontGrade | null;
  hardestGradeDisplay: string | null;
  gradeBands: number;
} {
  let totalProblems = 0;
  let bestIdx = -1;
  let hardestGradeDisplay: string | null = null;
  let gradeBands = 0;

  for (const row of rows) {
    const t = row.total > 0 ? row.total : rowTotal(row);
    if (t <= 0) continue;
    totalProblems += t;
    gradeBands += 1;
    const idx = gradeSortIndex(row.grade);
    if (idx > bestIdx) {
      bestIdx = idx;
      hardestGradeDisplay = row.grade;
    }
  }

  let hardestGrade: FontGrade | null = null;
  if (hardestGradeDisplay) {
    const asFont = hardestGradeDisplay as FontGrade;
    if (FONT_GRADES.includes(asFont)) hardestGrade = asFont;
  }

  return { totalProblems, hardestGrade, hardestGradeDisplay, gradeBands };
}

export function sortLogbookRowsDesc(rows: MoonboardLogbookRow[]): MoonboardLogbookRow[] {
  return [...rows].sort((a, b) => gradeSortIndex(b.grade) - gradeSortIndex(a.grade));
}

export function emptyLogbookTemplate(): MoonboardLogbookRow[] {
  return MOONBOARD_LOG_GRADES.map((grade) => ({
    grade,
    flashed: 0,
    secondTry: 0,
    thirdTry: 0,
    moreTries: 0,
    total: 0,
  }));
}

export function mergeLogbookRows(
  existing: MoonboardLogbookRow[],
  incoming: MoonboardLogbookRow[]
): MoonboardLogbookRow[] {
  const map = new Map<string, MoonboardLogbookRow>();
  for (const row of existing) {
    map.set(normalizeMoonboardGrade(row.grade), row);
  }
  for (const row of incoming) {
    const grade = normalizeMoonboardGrade(row.grade);
    if (!grade) continue;
    const total = row.total > 0 ? row.total : rowTotal(row);
    map.set(grade, {
      grade,
      flashed: row.flashed,
      secondTry: row.secondTry,
      thirdTry: row.thirdTry,
      moreTries: row.moreTries,
      total,
    });
  }
  return sortLogbookRowsDesc([...map.values()]);
}
