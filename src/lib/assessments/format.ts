import type { AssessmentLog } from "@/lib/assessments/types";
import { ASSESSMENT_META, type AssessmentType } from "@/lib/constants/assessments";

export function pctBodyWeight(bodyKg: number | null, resistanceKg: number | null): number | null {
  if (bodyKg == null || bodyKg <= 0 || resistanceKg == null) return null;
  return Math.round(((bodyKg + resistanceKg) / bodyKg) * 1000) / 10;
}

export function pctHeight(distanceCm: number | null, heightCm: number | null): number | null {
  if (distanceCm == null || heightCm == null || heightCm <= 0) return null;
  return Math.round((distanceCm / heightCm) * 1000) / 10;
}

export function formatResistance(kg: number | null): string {
  if (kg == null) return "—";
  const sign = kg >= 0 ? "+" : "";
  return `${sign}${kg} kg`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "0 s";
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface AssessmentCardSummary {
  metric1: string;
  metric2: string;
  metric1Muted: boolean;
  metric2Muted: boolean;
  lastCompleted: string | null;
  hasLogs: boolean;
}

export function summarizeForCard(
  type: AssessmentType,
  latest: AssessmentLog | null,
  heightCm: number | null
): AssessmentCardSummary {
  if (!latest) {
    return {
      metric1: type === "power_endurance" ? "0 s" : type === "hip_flexibility" ? "0 cm" : "0 kg",
      metric2:
        type === "power_endurance"
          ? "0 s"
          : type === "hip_flexibility"
            ? "0 %"
            : "0 %",
      metric1Muted: true,
      metric2Muted: true,
      lastCompleted: null,
      hasLogs: false,
    };
  }

  switch (type) {
    case "finger_strength":
    case "weighted_pullup": {
      const pct = pctBodyWeight(latest.body_weight_kg, latest.resistance_kg);
      return {
        metric1: formatResistance(latest.resistance_kg),
        metric2: pct != null ? `${pct} %` : "—",
        metric1Muted: false,
        metric2Muted: false,
        lastCompleted: latest.recorded_at,
        hasLogs: true,
      };
    }
    case "power_endurance":
      return {
        metric1: formatDuration(latest.time_under_tension_s),
        metric2: formatDuration(latest.total_duration_s),
        metric1Muted: false,
        metric2Muted: false,
        lastCompleted: latest.recorded_at,
        hasLogs: true,
      };
    case "hip_flexibility": {
      const pct = pctHeight(latest.distance_cm, heightCm);
      return {
        metric1: latest.distance_cm != null ? `${latest.distance_cm} cm` : "—",
        metric2: pct != null ? `${pct} %` : "—",
        metric1Muted: false,
        metric2Muted: false,
        lastCompleted: latest.recorded_at,
        hasLogs: true,
      };
    }
    default:
      return {
        metric1: "—",
        metric2: "—",
        metric1Muted: true,
        metric2Muted: true,
        lastCompleted: null,
        hasLogs: false,
      };
  }
}

export function chartValue(log: AssessmentLog, type: AssessmentType): number | null {
  const key = ASSESSMENT_META[type].chartMetric;
  const v = log[key];
  return v != null ? Number(v) : null;
}
