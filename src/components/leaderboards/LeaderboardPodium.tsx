"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Medal, Sparkles } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import type { RankedLeaderboardRow } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

const PODIUM_ORDER = [1, 0, 2] as const;

const PLACE_STYLES = {
  1: {
    block: "h-[7.5rem] sm:h-[9.5rem] bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300",
    glow: "shadow-[0_0_40px_-8px_rgba(245,158,11,0.55)]",
    badge: "bg-amber-500 text-black",
    ring: "ring-amber-400/50",
  },
  2: {
    block: "h-[5.5rem] sm:h-[7rem] bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200",
    glow: "",
    badge: "bg-slate-300 text-slate-900",
    ring: "ring-slate-300/50",
  },
  3: {
    block: "h-[4.5rem] sm:h-[5.5rem] bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700",
    glow: "",
    badge: "bg-amber-900 text-amber-50",
    ring: "ring-amber-800/40",
  },
} as const;

interface LeaderboardPodiumProps {
  rows: RankedLeaderboardRow[];
  metricKey: string;
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
}

export function LeaderboardPodium({
  rows,
  metricKey,
  highlightedId,
  onHighlight,
}: LeaderboardPodiumProps) {
  const { openProfile } = useClimberProfile();
  const top3 = rows.slice(0, 3);
  if (top3.length === 0) return null;

  const ordered = PODIUM_ORDER.map((i) => top3[i]).filter(Boolean);

  return (
    <div className="relative px-2 pb-2 pt-2 sm:px-4">
      <div
        className="pointer-events-none absolute inset-x-8 top-8 h-32 rounded-full bg-amber-400/20 blur-3xl"
        aria-hidden
      />
      <AnimatePresence mode="popLayout">
        <motion.div
          key={metricKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-3 items-end gap-2 sm:gap-4"
        >
          {ordered.map((row, visualIndex) => {
            const place = row.rank as 1 | 2 | 3;
            const style = PLACE_STYLES[place];
            const isFirst = place === 1;
            const isHighlighted =
              highlightedId === row.athlete.id ||
              (highlightedId == null && row.isCurrentUser);

            return (
              <motion.button
                key={row.athlete.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: visualIndex * 0.07,
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                }}
                onMouseEnter={() => onHighlight(row.athlete.id)}
                onMouseLeave={() => onHighlight(null)}
                onClick={() => openProfile(row.athlete.id)}
                className={cn(
                  "group relative flex flex-col items-center rounded-2xl border border-white/60 bg-white/90 p-2 backdrop-blur-sm transition-all sm:p-3",
                  "hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
                  isFirst && style.glow,
                  row.isCurrentUser && "ring-2 ring-teal-500/40",
                  isHighlighted && !row.isCurrentUser && "ring-2 ring-teal-400/30"
                )}
              >
                {isFirst && (
                  <Sparkles
                    className="absolute -top-1 right-2 size-4 text-amber-500 opacity-80"
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    "mb-2 flex w-full flex-col items-center justify-end rounded-t-xl px-2 pt-3",
                    style.block
                  )}
                >
                  <span
                    className={cn(
                      "mb-2 flex size-8 items-center justify-center rounded-full shadow-md sm:size-9",
                      style.badge
                    )}
                  >
                    {isFirst ? (
                      <Crown className="size-4 sm:size-5" />
                    ) : (
                      <Medal className="size-3.5 sm:size-4" />
                    )}
                  </span>
                  <div className={cn("rounded-full ring-4 ring-white/90", style.ring)}>
                    <AvatarFrame
                      username={row.athlete.username}
                      avatarUrl={row.athlete.avatar_url}
                      lifetimeScore={row.athlete.current_pump_score}
                      size={isFirst ? "lg" : "md"}
                      plain
                    />
                  </div>
                </div>
                <p className="max-w-full truncate text-sm font-bold text-slate-900">
                  {row.athlete.username}
                </p>
                <motion.p
                  key={`${metricKey}-${row.displayValue}`}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-0.5 text-xl font-black tabular-nums tracking-tight text-teal-700 sm:text-2xl"
                >
                  {row.displayValue}
                </motion.p>
                {row.isCurrentUser && (
                  <span className="mt-1 rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold uppercase text-teal-800">
                    You
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
