"use client";

import { Clock, Flame, Target, Trophy } from "lucide-react";
import type { LeaderboardEntry, Profile, WorkoutLog } from "@/types/app";
import type { SessionCounts } from "@/lib/data/sessionBadges";

interface StatsOverviewProps {
  profile: Profile;
  sessionCounts: SessionCounts;
  weeklyEntries: LeaderboardEntry[];
  recentLogs: WorkoutLog[];
}

export function StatsOverview({
  profile,
  sessionCounts,
  weeklyEntries,
  recentLogs,
}: StatsOverviewProps) {
  const me = weeklyEntries.find((e) => e.id === profile.id);
  const weeklyRank = me?.rank ?? "—";
  const points7d = me?.points_7d ?? 0;
  const sessions7d = me?.sessions_7d ?? 0;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const minutes7d = recentLogs
    .filter((l) => new Date(l.created_at).getTime() >= weekAgo)
    .reduce((sum, l) => sum + l.duration_minutes, 0);
  const hours7d = Math.round((minutes7d / 60) * 10) / 10;

  const cards = [
    {
      label: "7-day rank",
      value: weeklyRank === "—" ? "—" : `#${weeklyRank}`,
      sub: me?.rank_title ?? "Log to rank",
      icon: Trophy,
      accent: "text-amber-400",
    },
    {
      label: "7-day pts",
      value: points7d.toLocaleString(),
      sub: `${sessions7d} session${sessions7d === 1 ? "" : "s"}`,
      icon: Flame,
      accent: "text-orange-400",
    },
    {
      label: "Lifetime pump",
      value: profile.current_pump_score.toLocaleString(),
      sub: "All-time score",
      icon: Target,
      accent: "text-orange-300",
    },
    {
      label: "Hours (7d)",
      value: `${hours7d}h`,
      sub: `${sessionCounts.total} total logs`,
      icon: Clock,
      accent: "text-sky-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border/60 bg-card/80 p-3 lg:p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:text-xs">
              {c.label}
            </p>
            <c.icon className={`size-4 shrink-0 ${c.accent}`} />
          </div>
          <p className="mt-1 text-xl font-black lg:text-2xl">{c.value}</p>
          <p className="text-[10px] text-muted-foreground lg:text-xs">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
