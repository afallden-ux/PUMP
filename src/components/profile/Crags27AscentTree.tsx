"use client";

import { sortTreeRowsDesc } from "@/lib/crags27/ascentTree";
import type { Crags27TreeRow } from "@/lib/crags27/types";
import { cn } from "@/lib/utils";

interface Crags27AscentTreeProps {
  rows: Crags27TreeRow[];
  className?: string;
}

export function Crags27AscentTree({ rows, className }: Crags27AscentTreeProps) {
  const sorted = sortTreeRowsDesc(rows);
  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No ascent tree data yet — sync from 27crags.
      </p>
    );
  }

  const maxTotal = Math.max(...sorted.map((r) => r.total), 1);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-slate-200", className)}>
      <div className="grid grid-cols-[3.5rem_2.5rem_2.5rem_2.5rem_1fr] gap-x-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span>Grade</span>
        <span className="text-right">Tot</span>
        <span className="text-right text-amber-700">Fl</span>
        <span className="text-right text-red-700">RP</span>
        <span>Diagram</span>
      </div>
      <ul className="max-h-[min(32rem,60vh)] divide-y divide-slate-50 overflow-y-auto">
        {sorted.map((row) => {
          const inactive = row.total === 0;
          const flashPct = (row.flash / maxTotal) * 50;
          const redPct = (row.redpoint / maxTotal) * 50;
          return (
            <li
              key={row.grade}
              className={cn(
                "grid grid-cols-[3.5rem_2.5rem_2.5rem_2.5rem_1fr] items-center gap-x-2 px-3 py-1.5 text-sm",
                inactive && "opacity-40"
              )}
            >
              <span className="font-bold tabular-nums text-slate-800">{row.grade}</span>
              <span className="text-right font-semibold tabular-nums text-slate-700">
                {row.total}
              </span>
              <span className="text-right tabular-nums text-amber-800">{row.flash}</span>
              <span className="text-right tabular-nums text-red-700">{row.redpoint}</span>
              <div className="flex h-5 items-center justify-center">
                <div className="relative h-3 w-full max-w-[160px]">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200" />
                  {row.flash > 0 && (
                    <div
                      className="absolute inset-y-0 rounded-l-sm bg-amber-400"
                      style={{
                        right: "50%",
                        width: `${flashPct}%`,
                      }}
                    />
                  )}
                  {row.redpoint > 0 && (
                    <div
                      className="absolute inset-y-0 rounded-r-sm bg-red-500"
                      style={{
                        left: "50%",
                        width: `${redPct}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
