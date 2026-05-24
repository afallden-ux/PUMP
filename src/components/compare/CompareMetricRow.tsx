"use client";

import type { CompareWinner } from "@/lib/compare/types";
import { cn } from "@/lib/utils";

export type { CompareWinner };

interface CompareMetricRowProps {
  label: string;
  left: string;
  right: string;
  winner?: CompareWinner;
  sublabel?: string;
}

function cellClass(side: "left" | "right", winner: CompareWinner) {
  if (winner === "none" || winner === "tie") {
    return "text-slate-800";
  }
  if (winner === side) {
    return "font-semibold text-teal-800";
  }
  return "text-slate-500";
}

export function CompareMetricRow({
  label,
  left,
  right,
  winner = "none",
  sublabel,
}: CompareMetricRowProps) {
  return (
    <div className="grid grid-cols-[1fr_minmax(0,1.1fr)_minmax(0,1.1fr)] items-center gap-2 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0 pr-2">
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        {sublabel && (
          <p className="mt-0.5 text-[10px] text-slate-400">{sublabel}</p>
        )}
      </div>
      <p
        className={cn(
          "text-center text-sm tabular-nums",
          cellClass("left", winner)
        )}
      >
        {left}
      </p>
      <p
        className={cn(
          "text-center text-sm tabular-nums",
          cellClass("right", winner)
        )}
      >
        {right}
      </p>
    </div>
  );
}

export { winnerHigher } from "@/lib/compare/winners";
