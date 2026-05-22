import {
  GRADE_BONUS,
  type FontGrade,
} from "@/lib/constants/fontGrades";
import {
  CLIMB_BONUS_META,
  type ClimbBonus,
  type SessionType,
} from "@/lib/constants/sessionTypes";
import type { IntensityLevel } from "@/types/app";

export interface PumpPointInput {
  durationMinutes: number;
  intensityLevel: IntensityLevel;
  sessionType: SessionType;
  climbBonus?: ClimbBonus;
  hardestGrade?: FontGrade | null;
}

function basePoints(durationMinutes: number, intensityLevel: IntensityLevel): number {
  return Math.round((durationMinutes / 30) * intensityLevel * 10);
}

export function calcPumpPoints(input: PumpPointInput): number {
  const { durationMinutes, intensityLevel, sessionType } = input;

  if (sessionType === "stretching") {
    return -Math.max(
      5,
      Math.round((durationMinutes / 30) * intensityLevel * 6)
    );
  }

  const base = basePoints(durationMinutes, intensityLevel);

  if (sessionType === "hangboard") {
    return base + 15;
  }

  if (sessionType === "gym") {
    return Math.max(5, Math.round(base * 0.75));
  }

  if (sessionType === "climbing") {
    const bonus = input.climbBonus ?? "none";
    const climbExtra =
      bonus === "board"
        ? CLIMB_BONUS_META.board.points
        : bonus === "outdoors"
          ? CLIMB_BONUS_META.outdoors.points
          : 0;
    const grade =
      input.hardestGrade && input.hardestGrade in GRADE_BONUS
        ? GRADE_BONUS[input.hardestGrade]
        : 0;
    return base + climbExtra + grade;
  }

  return base;
}

export function climbBonusToFlags(bonus: ClimbBonus): {
  is_moonboard: boolean;
  is_outdoors: boolean;
} {
  return {
    is_moonboard: bonus === "board",
    is_outdoors: bonus === "outdoors",
  };
}
