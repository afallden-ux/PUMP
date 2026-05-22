export const FONT_GRADES = [
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

export type FontGrade = (typeof FONT_GRADES)[number];

export const GRADE_BONUS: Record<FontGrade, number> = {
  "6B+": 8,
  "6C": 12,
  "6C+": 16,
  "7A": 20,
  "7A+": 24,
  "7B": 28,
  "7B+": 32,
  "7C": 36,
  "7C+": 42,
  "8A": 48,
  "8A+": 54,
  "8B": 60,
  "8B+": 68,
  "8C": 76,
  "8C+": 84,
  "9A": 100,
};

export const MOONBOARD_BONUS = 25;
export const OUTDOORS_BONUS = 30;
