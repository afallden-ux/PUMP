export type PumpTier = "chalky" | "warming" | "jacked" | "popeye";

export interface PumpTierConfig {
  tier: PumpTier;
  label: string;
  forearmScale: number;
  frameScale: number;
  glow: string;
}

export function getPumpTier(lifetimeScore: number): PumpTierConfig {
  if (lifetimeScore >= 600) {
    return {
      tier: "popeye",
      label: "Popeye Protocol",
      forearmScale: 1.85,
      frameScale: 1.15,
      glow: "0 0 40px rgba(251, 146, 60, 0.8)",
    };
  }
  if (lifetimeScore >= 300) {
    return {
      tier: "jacked",
      label: "Jacked",
      forearmScale: 1.45,
      frameScale: 1.08,
      glow: "0 0 24px rgba(249, 115, 22, 0.5)",
    };
  }
  if (lifetimeScore >= 100) {
    return {
      tier: "warming",
      label: "Warming Up",
      forearmScale: 1.2,
      frameScale: 1.04,
      glow: "0 0 12px rgba(234, 88, 12, 0.35)",
    };
  }
  return {
    tier: "chalky",
    label: "Fresh Chalk",
    forearmScale: 1,
    frameScale: 1,
    glow: "none",
  };
}

/** Couch of Shame: no session in 96 hours */
export const SHAME_IDLE_MS = 96 * 60 * 60 * 1000;
