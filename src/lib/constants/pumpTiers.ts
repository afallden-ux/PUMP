export type PumpTier = "chalky" | "warming" | "jacked" | "elite";

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
      tier: "elite",
      label: "CC Elite",
      forearmScale: 1.85,
      frameScale: 1.15,
      glow: "0 0 40px rgba(13, 148, 136, 0.55)",
    };
  }
  if (lifetimeScore >= 300) {
    return {
      tier: "jacked",
      label: "Strong send",
      forearmScale: 1.45,
      frameScale: 1.08,
      glow: "0 0 24px rgba(20, 184, 166, 0.45)",
    };
  }
  if (lifetimeScore >= 100) {
    return {
      tier: "warming",
      label: "Warming up",
      forearmScale: 1.2,
      frameScale: 1.04,
      glow: "0 0 12px rgba(45, 212, 191, 0.35)",
    };
  }
  return {
    tier: "chalky",
    label: "Fresh chalk",
    forearmScale: 1,
    frameScale: 1,
    glow: "none",
  };
}

/** Couch of Shame: no session in 96 hours */
export const SHAME_IDLE_MS = 96 * 60 * 60 * 1000;
