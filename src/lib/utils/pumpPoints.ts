import type { IntensityLevel } from "@/types/app";

export function calcPumpPoints(
  durationMinutes: number,
  intensityLevel: IntensityLevel
): number {
  return Math.round((durationMinutes / 30) * intensityLevel * 10);
}
