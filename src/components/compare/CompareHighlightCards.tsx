"use client";

import { Dumbbell, Hand, Mountain, Trophy } from "lucide-react";
import type { CompareSnapshot } from "@/lib/compare/types";
import { COMPARE_METRICS, metricWinner } from "@/lib/compare/metricDefs";
import { cn } from "@/lib/utils";

interface CompareHighlightCardsProps {
  left: CompareSnapshot;
  right: CompareSnapshot;
}

const HIGHLIGHTS = [
  {
    id: "finger_pct",
    label: "Max hang",
    icon: Hand,
    accent: "text-red-600 bg-red-50",
  },
  {
    id: "pull_pct",
    label: "Pull-up",
    icon: Dumbbell,
    accent: "text-amber-700 bg-amber-50",
  },
  {
    id: "grade",
    label: "Hardest send",
    icon: Mountain,
    accent: "text-emerald-700 bg-emerald-50",
  },
  {
    id: "weekly",
    label: "This week",
    icon: Trophy,
    accent: "text-teal-700 bg-teal-50",
  },
] as const;

export function CompareHighlightCards({ left, right }: CompareHighlightCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {HIGHLIGHTS.map(({ id, label, icon: Icon, accent }) => {
        const def = metricById(id);
        if (!def) return null;
        const winner = metricWinner(def, left, right);
        const leftVal = def.display(left);
        const rightVal = def.display(right);

        return (
          <div
            key={id}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={cn("mb-2 inline-flex rounded-md p-1.5", accent)}>
              <Icon className="size-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div
                className={cn(
                  "rounded-md px-1 py-1.5",
                  winner === "left" && "bg-teal-50 ring-1 ring-teal-500/40"
                )}
              >
                <p className="text-[9px] text-slate-400 truncate">{left.profile.username}</p>
                <p
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    winner === "left" ? "text-teal-800" : "text-slate-700"
                  )}
                >
                  {leftVal}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-md px-1 py-1.5",
                  winner === "right" && "bg-teal-50 ring-1 ring-teal-500/40"
                )}
              >
                <p className="text-[9px] text-slate-400 truncate">{right.profile.username}</p>
                <p
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    winner === "right" ? "text-teal-800" : "text-slate-700"
                  )}
                >
                  {rightVal}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function metricById(id: string) {
  return COMPARE_METRICS.find((m) => m.id === id);
}
