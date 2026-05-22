export const SESSION_TYPES = [
  "climbing",
  "hangboard",
  "gym",
  "stretching",
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_META: Record<
  SessionType,
  {
    label: string;
    emoji: string;
    description: string;
    chartColor: string;
    badgeClass: string;
  }
> = {
  climbing: {
    label: "Climbing",
    emoji: "🧗",
    description: "Bouldering / routes — add board or outdoors bonus",
    chartColor: "#f97316",
    badgeClass: "bg-orange-500/25 text-orange-200 border-orange-500/40",
  },
  hangboard: {
    label: "Hangboard",
    emoji: "🖐️",
    description: "Finger torture — solid pump points",
    chartColor: "#a855f7",
    badgeClass: "bg-violet-500/25 text-violet-200 border-violet-500/40",
  },
  gym: {
    label: "Gym",
    emoji: "🏋️",
    description: "General gym work — lighter points",
    chartColor: "#3b82f6",
    badgeClass: "bg-blue-500/25 text-blue-200 border-blue-500/40",
  },
  stretching: {
    label: "Stretching",
    emoji: "🧘",
    description: "Recovery — costs you points (shame tax)",
    chartColor: "#22c55e",
    badgeClass: "bg-emerald-500/25 text-emerald-200 border-emerald-500/40",
  },
};

export type ClimbBonus = "none" | "board" | "outdoors";

export const CLIMB_BONUS_META: Record<
  ClimbBonus,
  { label: string; points: number }
> = {
  none: { label: "Gym wall", points: 0 },
  board: { label: "Board", points: 25 },
  outdoors: { label: "Outdoors", points: 30 },
};
