"use client";

import { motion } from "framer-motion";
import { ChevronRight, Crown, Medal } from "lucide-react";
import { LatticeDonutChart } from "@/components/arena/charts/LatticeDonutChart";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { ARENA_CATEGORY_META } from "@/lib/arena/categories";
import type { RankedAthlete } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

interface CompetitorCardProps {
  ranked: RankedAthlete;
  metricKind: "volume" | "workouts" | "vpoints";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
        <Crown className="size-4" />
      </span>
    );
  }
  if (rank <= 3) {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200">
        <Medal className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-slate-50 text-sm font-bold tabular-nums text-slate-500 ring-1 ring-slate-200">
      #{rank}
    </span>
  );
}

export function CompetitorCard({ ranked, metricKind }: CompetitorCardProps) {
  const { athlete, rank, metricLabel, breakdown, dominantCategory, dominantPct } =
    ranked;
  const isMe = athlete.isMe;

  const badgeClass =
    metricKind === "vpoints"
      ? "bg-violet-50 text-violet-700 ring-violet-100"
      : metricKind === "volume"
        ? "bg-sky-50 text-sky-700 ring-sky-100"
        : "bg-emerald-50 text-emerald-700 ring-emerald-100";

  return (
    <motion.article
      layout
      layoutId={`competitor-${athlete.id}`}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border bg-white p-3 shadow-sm sm:gap-4 sm:p-4",
        isMe ? "border-teal-500/40 ring-1 ring-teal-500/15" : "border-slate-200/90"
      )}
    >
      <RankBadge rank={rank} />

      <div className="flex min-w-0 items-center gap-3">
        <AvatarFrame
          username={athlete.username}
          avatarUrl={athlete.avatarUrl}
          lifetimeScore={athlete.lifetimePumpScore}
          size="sm"
          plain
        />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-800">
            {athlete.username}
            {isMe && (
              <span className="ml-1.5 text-[10px] font-bold uppercase text-teal-700">
                You
              </span>
            )}
          </h3>
          <p className="truncate text-xs text-slate-500">{athlete.climbingAvatarTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden w-[72px] sm:block">
          <LatticeDonutChart
            breakdown={breakdown}
            dominantCategory={dominantCategory}
            dominantPct={dominantPct}
            size="sm"
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-sm font-bold tabular-nums ring-1",
              badgeClass
            )}
          >
            {metricLabel}
          </span>
          <span className="text-[10px] text-slate-400">
            {ARENA_CATEGORY_META[dominantCategory].label}
          </span>
        </div>
        <ChevronRight className="hidden size-4 shrink-0 text-slate-300 sm:block" />
      </div>
    </motion.article>
  );
}
