"use client";

import { motion } from "framer-motion";
import type { LeaderboardMetricDef } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardMetricChipsProps {
  metrics: LeaderboardMetricDef[];
  activeId: string;
  onChange: (id: string) => void;
  rankedCounts?: Record<string, number>;
}

export function LeaderboardMetricChips({
  metrics,
  activeId,
  onChange,
  rankedCounts,
}: LeaderboardMetricChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((m) => {
        const isActive = m.id === activeId;
        const count = rankedCounts?.[m.id];

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              "relative overflow-hidden rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
              isActive
                ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/25"
                : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-800"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="lb-metric-chip"
                className="absolute inset-0 bg-teal-600"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {m.label}
              {count != null && count > 0 && !isActive && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
