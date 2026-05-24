import type { CompareWinner } from "@/lib/compare/types";

export function winnerHigher(
  left: number | null,
  right: number | null
): CompareWinner {
  if (left == null && right == null) return "none";
  if (left == null) return "right";
  if (right == null) return "left";
  if (left === right) return "tie";
  return left > right ? "left" : "right";
}
