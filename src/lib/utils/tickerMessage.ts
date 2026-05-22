import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { formatDuration } from "@/lib/utils/dates";
import type { IntensityLevel } from "@/types/app";

export function buildTickerMessage(
  username: string,
  durationMinutes: number,
  intensityLevel: IntensityLevel
): string {
  const duration = formatDuration(durationMinutes);
  const pump = INTENSITY_SHORT[intensityLevel];
  return `WARNING: ${username} just built massive forearms (${duration}, Level ${intensityLevel} ${pump})! What are you doing with your life right now?`;
}
