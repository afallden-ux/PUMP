import { FONT_GRADES, type FontGrade } from "@/lib/constants/fontGrades";

export function maxHardestGrade(grades: (string | null | undefined)[]): FontGrade | null {
  let best: FontGrade | null = null;
  let bestIdx = -1;

  for (const raw of grades) {
    if (!raw) continue;
    const grade = raw as FontGrade;
    const idx = FONT_GRADES.indexOf(grade);
    if (idx > bestIdx) {
      bestIdx = idx;
      best = grade;
    }
  }

  return best;
}
