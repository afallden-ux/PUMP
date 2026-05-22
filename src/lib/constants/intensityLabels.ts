import type { IntensityLevel } from "@/types/app";

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  1: "Mostly drinking coffee",
  2: "Warm-up vibes only",
  3: "Solid friction",
  4: "Forearms entering beast mode",
  5: "Can't open my car door afterwards",
};

export const INTENSITY_SHORT: Record<IntensityLevel, string> = {
  1: "Coffee",
  2: "Warm-up",
  3: "Friction",
  4: "Beast",
  5: "Door-locked",
};
