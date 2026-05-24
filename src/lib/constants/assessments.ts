import type { LucideIcon } from "lucide-react";
import { Flame, Hand, PersonStanding, Dumbbell } from "lucide-react";

export const ASSESSMENT_TYPES = [
  "finger_strength",
  "power_endurance",
  "weighted_pullup",
  "hip_flexibility",
] as const;

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export interface AssessmentMeta {
  type: AssessmentType;
  title: string;
  shortTitle: string;
  description: string;
  testLinkLabel: string;
  icon: LucideIcon;
  iconClass: string;
  metric1Label: string;
  metric2Label: string;
  chartMetric: "resistance_kg" | "time_under_tension_s" | "distance_cm";
  chartLabel: string;
  exerciseLabel: string;
}

export const ASSESSMENT_META: Record<AssessmentType, AssessmentMeta> = {
  finger_strength: {
    type: "finger_strength",
    title: "Finger Strength Test",
    shortTitle: "Finger strength",
    description: "Max hang testing session to measure finger strength relative to body weight.",
    testLinkLabel: "View Assessment Test",
    icon: Hand,
    iconClass: "bg-red-500 text-white",
    metric1Label: "Resistance +/-",
    metric2Label: "% of Body Weight",
    chartMetric: "resistance_kg",
    chartLabel: "Resistance (kg)",
    exerciseLabel: "Max hang",
  },
  power_endurance: {
    type: "power_endurance",
    title: "Power Endurance Test — 60%",
    shortTitle: "Power endurance",
    description: "Power endurance block at 60% — track time under tension and total duration.",
    testLinkLabel: "View Assessment Test",
    icon: Flame,
    iconClass: "bg-slate-800 text-white",
    metric1Label: "Time Under Tension",
    metric2Label: "Total Duration",
    chartMetric: "time_under_tension_s",
    chartLabel: "Time under tension (s)",
    exerciseLabel: "Power endurance",
  },
  weighted_pullup: {
    type: "weighted_pullup",
    title: "Weighted Pull-up Test",
    shortTitle: "Weighted pull-up",
    description: "Weighted pull-up testing session to estimate 2RM and track added load.",
    testLinkLabel: "View Assessment Test",
    icon: Dumbbell,
    iconClass: "bg-amber-500 text-white",
    metric1Label: "Resistance +/-",
    metric2Label: "% of Body Weight",
    chartMetric: "resistance_kg",
    chartLabel: "Resistance (kg)",
    exerciseLabel: "Pull-up",
  },
  hip_flexibility: {
    type: "hip_flexibility",
    title: "Hip Flexibility Test",
    shortTitle: "Hip flexibility",
    description: "Hip flexibility assessment — reach distance relative to your height.",
    testLinkLabel: "View Assessment Test",
    icon: PersonStanding,
    iconClass: "bg-amber-500 text-white",
    metric1Label: "Distance",
    metric2Label: "% of Height",
    chartMetric: "distance_cm",
    chartLabel: "Distance (cm)",
    exerciseLabel: "Hip flexibility",
  },
};

export function isAssessmentType(value: string): value is AssessmentType {
  return (ASSESSMENT_TYPES as readonly string[]).includes(value);
}
