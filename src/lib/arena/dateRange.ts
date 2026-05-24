import type { ArenaTimeframe } from "@/lib/arena/types";

export function timeframeDateRangeLabel(tf: ArenaTimeframe, now = new Date()): string {
  const end = new Date(now);
  const start = new Date(now);

  switch (tf) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "4w":
      start.setDate(start.getDate() - 28);
      break;
    case "12w":
      start.setDate(start.getDate() - 84);
      break;
    case "ytd":
      start.setMonth(0, 1);
      break;
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return `${fmt(start)} – ${fmt(end)}`;
}
