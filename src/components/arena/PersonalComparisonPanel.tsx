"use client";

import { LatticeDonutChart } from "@/components/arena/charts/LatticeDonutChart";
import { LatticeStackedBarChart } from "@/components/arena/charts/LatticeStackedBarChart";
import { ARENA_CATEGORY_META, ARENA_CATEGORY_ORDER } from "@/lib/arena/categories";
import { avgWorkoutsPerWeek } from "@/lib/arena/selectors";
import type { RankedAthlete } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

interface PersonalComparisonPanelProps {
  ranked: RankedAthlete;
  className?: string;
  compact?: boolean;
}

export function PersonalComparisonPanel({
  ranked,
  className,
  compact = false,
}: PersonalComparisonPanelProps) {
  const { athlete, breakdown, dominantCategory, dominantPct, weeklyStacks } = ranked;
  const avgWeek = avgWorkoutsPerWeek(weeklyStacks);
  const totalBreakdown = breakdown.reduce((s, b) => s + b.count, 0);

  return (
    <aside
      className={cn(
        "rounded-lg border border-[#2563eb]/25 bg-white p-4 shadow-sm ring-1 ring-[#2563eb]/10",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2563eb]">
        Your comparison
      </p>
      <h2 className="text-base font-semibold text-slate-800">{athlete.username}</h2>
      <p className="text-xs text-slate-500">{athlete.climbingAvatarTitle}</p>

      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-slate-500">
          H <strong className="text-slate-800">{athlete.heightCm}</strong> cm
        </span>
        <span className="text-slate-500">
          W <strong className="text-slate-800">{athlete.weightKg}</strong> kg
        </span>
      </div>

      <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-center ring-1 ring-slate-100">
        <p className="text-xl font-bold tabular-nums text-slate-800">{ranked.metricLabel}</p>
        <p className="text-[10px] text-slate-500">Rank #{ranked.rank} in crew</p>
      </div>

      {!compact && (
        <>
          <p className="mb-2 mt-4 text-xs font-medium text-slate-600">Activity mix</p>
          <LatticeDonutChart
            breakdown={breakdown}
            dominantCategory={dominantCategory}
            dominantPct={dominantPct}
            size="md"
          />
          <ul className="mt-2 space-y-1">
            {ARENA_CATEGORY_ORDER.map((cat) => {
              const slice = breakdown.find((b) => b.category === cat);
              const count = slice?.count ?? 0;
              const pct = totalBreakdown ? Math.round((count / totalBreakdown) * 100) : 0;
              return (
                <li key={cat} className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: ARENA_CATEGORY_META[cat].color }}
                    />
                    {ARENA_CATEGORY_META[cat].label}
                  </span>
                  <span className="font-medium text-slate-700">{pct}%</span>
                </li>
              );
            })}
          </ul>
          <p className="mb-1 mt-4 text-sm font-semibold text-slate-800">
            {avgWeek} workouts / week
          </p>
          <LatticeStackedBarChart data={weeklyStacks} height={120} />
        </>
      )}

      {compact && <LatticeStackedBarChart data={weeklyStacks} height={72} highlightLast />}
    </aside>
  );
}
