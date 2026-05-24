import type { ArenaCategory } from "@/lib/arena/types";

export const ARENA_CATEGORY_META: Record<
  ArenaCategory,
  { label: string; shortLabel: string; color: string }
> = {
  fingerboard: { label: "Fingerboard", shortLabel: "Finger", color: "#2dd4bf" },
  boardClimbing: { label: "Board climbing", shortLabel: "Board", color: "#38bdf8" },
  conditioning: { label: "Conditioning", shortLabel: "Cond.", color: "#22c55e" },
  flexibility: { label: "Flexibility", shortLabel: "Flex", color: "#fbbf24" },
  endurance: { label: "Endurance", shortLabel: "Endur.", color: "#a855f7" },
};

export const ARENA_CATEGORY_ORDER: ArenaCategory[] = [
  "fingerboard",
  "boardClimbing",
  "conditioning",
  "flexibility",
  "endurance",
];
