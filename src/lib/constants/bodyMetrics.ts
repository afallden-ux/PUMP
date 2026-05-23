export const BODY_METRIC_TYPES = ["weight", "max_hang", "max_pullup"] as const;

export type BodyMetricType = (typeof BODY_METRIC_TYPES)[number];

export const BODY_METRIC_META: Record<
  BodyMetricType,
  { label: string; shortLabel: string; emoji: string; step: number; max: number }
> = {
  weight: {
    label: "Body weight",
    shortLabel: "Weight",
    emoji: "⚖️",
    step: 0.1,
    max: 200,
  },
  max_hang: {
    label: "Max hang",
    shortLabel: "Hang",
    emoji: "🤙",
    step: 0.5,
    max: 150,
  },
  max_pullup: {
    label: "Max pull-up (1RM)",
    shortLabel: "Pull-up 1RM",
    emoji: "💪",
    step: 0.5,
    max: 200,
  },
};
