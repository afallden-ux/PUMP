"use client";

import { motion } from "framer-motion";
import { Crown, Swords } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import type { CompareSnapshot } from "@/lib/compare/types";
import { countWins } from "@/lib/compare/metricDefs";
import { cn } from "@/lib/utils";

interface CompareDuelBannerProps {
  left: CompareSnapshot;
  right: CompareSnapshot;
}

export function CompareDuelBanner({ left, right }: CompareDuelBannerProps) {
  const wins = countWins(left, right);
  const leftName = left.profile.username;
  const rightName = right.profile.username;
  const leader =
    wins.left > wins.right ? "left" : wins.right > wins.left ? "right" : "tie";

  return (
    <div className="overflow-hidden rounded-xl border border-teal-500/25 bg-gradient-to-br from-white via-teal-50/40 to-slate-50 shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-teal-500/15 bg-teal-600/5 px-4 py-2">
        <Swords className="size-4 text-teal-700" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-800">
          Head to head
        </p>
        <Swords className="size-4 scale-x-[-1] text-teal-700" />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 sm:gap-6 sm:p-6">
        <div className="relative flex flex-col items-center text-center">
          {leader === "left" && (
            <Crown className="absolute -top-1 right-1/4 size-5 text-amber-500" aria-hidden />
          )}
          <AvatarFrame
            username={leftName}
            avatarUrl={left.profile.avatar_url}
            lifetimeScore={left.lifetimeScore}
            size="md"
            plain
          />
          <p className="mt-2 font-semibold text-slate-800">{leftName}</p>
          <span className="text-[10px] font-medium text-teal-600">You</span>
          <motion.p
            key={wins.left}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "mt-2 text-3xl font-bold tabular-nums",
              leader === "left" ? "text-teal-700" : "text-slate-600"
            )}
          >
            {wins.left}
          </motion.p>
          <p className="text-[10px] text-slate-500">metrics ahead</p>
        </div>

        <div className="flex flex-col items-center px-2">
          <span className="text-xs font-bold text-slate-400">VS</span>
          {wins.ties > 0 && (
            <span className="mt-1 text-[10px] text-slate-400">{wins.ties} tied</span>
          )}
        </div>

        <div className="relative flex flex-col items-center text-center">
          {leader === "right" && (
            <Crown className="absolute -top-1 left-1/4 size-5 text-amber-500" aria-hidden />
          )}
          <AvatarFrame
            username={rightName}
            avatarUrl={right.profile.avatar_url}
            lifetimeScore={right.lifetimeScore}
            size="md"
            plain
          />
          <p className="mt-2 font-semibold text-slate-800">{rightName}</p>
          <p className="text-[10px] text-slate-500 line-clamp-1">{right.profile.title}</p>
          <motion.p
            key={wins.right}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "mt-2 text-3xl font-bold tabular-nums",
              leader === "right" ? "text-teal-700" : "text-slate-600"
            )}
          >
            {wins.right}
          </motion.p>
          <p className="text-[10px] text-slate-500">metrics ahead</p>
        </div>
      </div>
    </div>
  );
}
