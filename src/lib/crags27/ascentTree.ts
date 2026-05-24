import { FONT_GRADES, type FontGrade } from "@/lib/constants/fontGrades";
import type { Crags27TreeRow } from "@/lib/crags27/types";

/** Boulder / Font grades low → high (includes grades below CC font scale). */
export const CRAGS27_GRADE_ORDER = [
  "3",
  "3+",
  "4",
  "4+",
  "5",
  "5+",
  "6A",
  "6A+",
  "6B",
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

export type Crags27GradeLabel = (typeof CRAGS27_GRADE_ORDER)[number];

export function normalizeCrags27Grade(raw: string): string {
  const s = raw.trim().replace(/\s+/g, "");
  if (!s) return "";
  const upper = s.toUpperCase();
  const direct = CRAGS27_GRADE_ORDER.find((g) => g.toUpperCase() === upper);
  if (direct) return direct;
  const plus = upper.match(/^(\d)(\+)?$/);
  if (plus) return plus[2] ? `${plus[1]}+` : plus[1];
  return upper;
}

export function gradeSortIndex(grade: string): number {
  const n = normalizeCrags27Grade(grade);
  const idx = CRAGS27_GRADE_ORDER.findIndex((g) => g === n);
  return idx >= 0 ? idx : -1;
}

export function statsFromTreeRows(rows: Crags27TreeRow[]): {
  totalAscents: number;
  hardestGrade: FontGrade | null;
  hardestGradeDisplay: string | null;
} {
  let totalAscents = 0;
  let bestIdx = -1;
  let hardestGradeDisplay: string | null = null;

  for (const row of rows) {
    if (row.total <= 0) continue;
    totalAscents += row.total;
    const idx = gradeSortIndex(row.grade);
    if (idx > bestIdx) {
      bestIdx = idx;
      hardestGradeDisplay = row.grade;
    }
  }

  let hardestGrade: FontGrade | null = null;
  if (hardestGradeDisplay) {
    const asFont = hardestGradeDisplay as FontGrade;
    if (FONT_GRADES.includes(asFont)) {
      hardestGrade = asFont;
    }
  }

  return { totalAscents, hardestGrade, hardestGradeDisplay };
}

/** Rows sorted high grade first (like 27crags UI). */
export function sortTreeRowsDesc(rows: Crags27TreeRow[]): Crags27TreeRow[] {
  return [...rows].sort((a, b) => gradeSortIndex(b.grade) - gradeSortIndex(a.grade));
}
