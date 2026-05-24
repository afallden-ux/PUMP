"use client";

import { motion } from "framer-motion";
import { LEADERBOARD_CATEGORY_META } from "@/lib/leaderboards/categoryMeta";
import type { LeaderboardCategory } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardCategoryRailProps {
  active: LeaderboardCategory;
  onChange: (category: LeaderboardCategory) => void;
  counts?: Partial<Record<LeaderboardCategory, number>>;
}

export function LeaderboardCategoryRail({
  active,
  onChange,
  counts,
}: LeaderboardCategoryRailProps) {
  return (
    <div className="relative -mx-1">
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {LEADERBOARD_CATEGORY_META.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          const count = counts?.[cat.id];

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                "group relative flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all",
                isActive
                  ? "border-teal-500/40 bg-white shadow-md shadow-teal-500/10"
                  : "border-slate-200/80 bg-white/60 hover:border-slate-300 hover:bg-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="lb-cat-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/10 via-white to-amber-500/5"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                  cat.accent,
                  !isActive && "opacity-80 group-hover:opacity-100"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="relative min-w-0">
                <span
                  className={cn(
                    "block text-xs font-bold",
                    isActive ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  {cat.shortLabel}
                </span>
                {count != null && count > 0 && (
                  <span className="text-[10px] text-slate-500">{count} boards</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
