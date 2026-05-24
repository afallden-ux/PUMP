"use client";

import { motion } from "framer-motion";
import type { CompareSnapshot } from "@/lib/compare/types";
import {
  COMPARE_METRICS,
  type CompareCategory,
  metricWinner,
} from "@/lib/compare/metricDefs";
import { cn } from "@/lib/utils";

interface CompareBarRaceProps {
  left: CompareSnapshot;
  right: CompareSnapshot;
  category: CompareCategory;
  leftLabel: string;
  rightLabel: string;
}

export function CompareBarRace({
  left,
  right,
  category,
  leftLabel,
  rightLabel,
}: CompareBarRaceProps) {
  const metrics =
    category === "all"
      ? COMPARE_METRICS
      : COMPARE_METRICS.filter((m) => m.category === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-teal-700">
          <span className="size-2.5 rounded-full bg-teal-600" />
          {leftLabel}
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="size-2.5 rounded-full bg-slate-400" />
          {rightLabel}
        </span>
      </div>

      {metrics.map((def) => {
        const lv = def.getValue(left);
        const rv = def.getValue(right);
        const max =
          lv != null && rv != null
            ? Math.max(lv, rv, 1)
            : lv != null
              ? lv
              : rv != null
                ? rv
                : 1;
        const leftPct = lv != null ? (lv / max) * 100 : 0;
        const rightPct = rv != null ? (rv / max) * 100 : 0;
        const winner = metricWinner(def, left, right);

        return (
          <div key={def.id} className="group">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-700">{def.label}</p>
                {def.sublabel && (
                  <p className="text-[10px] text-slate-400">{def.sublabel}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3 text-xs tabular-nums">
                <span
                  className={cn(
                    "font-semibold",
                    winner === "left" ? "text-teal-700" : "text-slate-500"
                  )}
                >
                  {def.display(left)}
                </span>
                <span className="text-slate-300">|</span>
                <span
                  className={cn(
                    "font-semibold",
                    winner === "right" ? "text-teal-700" : "text-slate-500"
                  )}
                >
                  {def.display(right)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${leftPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${rightPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
