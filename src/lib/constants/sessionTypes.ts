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
    chartColor: "#14b8a6",
    badgeClass: "bg-teal-500/25 text-teal-800 border-teal-500/40",
  },
  hangboard: {
    label: "Hangboard",
    emoji: "🖐️",
    description: "Finger torture — solid pump points",
    chartColor: "#0d5c63",
    badgeClass: "bg-teal-900/15 text-teal-900 border-teal-800/30",
  },
  gym: {
    label: "Gym",
    emoji: "🏋️",
    description: "General gym work — lighter points",
    chartColor: "#38bdf8",
    badgeClass: "bg-sky-500/25 text-sky-800 border-sky-500/40",
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
