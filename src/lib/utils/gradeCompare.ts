import type { CompareWinner } from "@/lib/compare/types";
import type { FontGrade } from "@/lib/constants/fontGrades";
import { FONT_GRADES } from "@/lib/constants/fontGrades";

/** Higher Font grade index wins (harder climb). */
export function gradeCompareWinner(
  left: FontGrade | null,
  right: FontGrade | null
): CompareWinner {
  if (!left && !right) return "none";
  if (!left) return "right";
  if (!right) return "left";
  const li = FONT_GRADES.indexOf(left);
  const ri = FONT_GRADES.indexOf(right);
  if (li < 0 || ri < 0) return "none";
  if (li === ri) return "tie";
  return li > ri ? "left" : "right";
}
