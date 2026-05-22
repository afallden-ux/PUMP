export const SESSION_TYPES = [
  "climbing",
  "hangboard",
  "gym",
  "stretching",
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_META: Record<
  SessionType,
  { label: string; emoji: string; description: string }
> = {
  climbing: {
    label: "Climbing",
    emoji: "🧗",
    description: "Bouldering / routes — add board or outdoors bonus",
  },
  hangboard: {
    label: "Hangboard",
    emoji: "🖐️",
    description: "Finger torture — solid pump points",
  },
  gym: {
    label: "Gym",
    emoji: "🏋️",
    description: "General gym work — lighter points",
  },
  stretching: {
    label: "Stretching",
    emoji: "🧘",
    description: "Recovery — costs you points (shame tax)",
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
