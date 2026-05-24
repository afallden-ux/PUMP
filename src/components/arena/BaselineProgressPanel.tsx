"use client";

import { Activity, Dumbbell, Wind } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { ArenaCard } from "@/components/arena/ArenaCard";
import type { ArenaAthlete } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

interface BaselineProgressPanelProps {
  athlete: ArenaAthlete;
  className?: string;
}

function StatBar({
  label,
  value,
  unit,
  delta,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  delta: number;
  color: string;
}) {
  const pct = Math.min(100, Math.max(8, 50 + delta));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-semibold tabular-nums text-slate-800">
          {value}
          {unit}
          {delta > 0 && <span className="ml-1 text-emerald-600">+{delta}%</span>}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function BaselineProgressPanel({ athlete, className }: BaselineProgressPanelProps) {
  const init = athlete.initialBaseline;
  const cur = athlete.currentBaseline;

  const fingerDelta = Math.round(
    ((cur.fingerStrengthPctBw - init.fingerStrengthPctBw) / init.fingerStrengthPctBw) * 100
  );
  const flexDelta = Math.round(
    ((cur.flexibilityScore - init.flexibilityScore) / init.flexibilityScore) * 100
  );
  const endDelta = Math.round(
    ((cur.enduranceMinutes - init.enduranceMinutes) / init.enduranceMinutes) * 100
  );

  return (
    <ArenaCard className={cn("p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Initial baseline test
          </p>
          <h2 className="text-base font-semibold text-slate-800">Avatar progression</h2>
          <p className="mt-1 text-xs text-slate-500">
            Hang, flex, and endurance improvements level up your climbing avatar.
          </p>
        </div>
        <AvatarFrame
          username={athlete.username}
          avatarUrl={athlete.avatarUrl}
          lifetimeScore={athlete.lifetimePumpScore}
          size="sm"
          plain
        />
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-slate-100">
        <div className="text-center">
          <p className="text-[10px] uppercase text-slate-400">Level</p>
          <p className="text-2xl font-bold text-[#2563eb]">{athlete.climbingAvatarLevel}</p>
        </div>
        <div className="flex-1 border-l border-slate-200 pl-3">
          <p className="text-sm font-semibold text-slate-800">{athlete.climbingAvatarTitle}</p>
          <p className="text-xs text-emerald-600">+{cur.improvementPct}% vs baseline</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Dumbbell className="size-3.5 text-teal-500" />
          Finger strength
        </div>
        <StatBar
          label="Max hang"
          value={cur.fingerStrengthPctBw}
          unit="% BW"
          delta={fingerDelta}
          color="#2dd4bf"
        />
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Activity className="size-3.5 text-amber-500" />
          Flexibility
        </div>
        <StatBar
          label="Score"
          value={cur.flexibilityScore}
          unit=""
          delta={flexDelta}
          color="#fbbf24"
        />
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Wind className="size-3.5 text-violet-500" />
          Endurance
        </div>
        <StatBar
          label="Block"
          value={cur.enduranceMinutes}
          unit=" min"
          delta={endDelta}
          color="#a855f7"
        />
      </div>
    </ArenaCard>
  );
}
