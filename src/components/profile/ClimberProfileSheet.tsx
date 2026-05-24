"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Crown,
  Loader2,
  Medal,
  Mountain,
  Target,
  Trophy,
} from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchClimberProfileStats } from "@/lib/data/climberProfile";
import type { ClimberProfileStats } from "@/lib/data/climberProfile";
import { formatRelativeTime } from "@/lib/utils/dates";

interface ClimberProfileSheetProps {
  userId: string | null;
  onClose: () => void;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Trophy;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`size-4 shrink-0 ${accent ?? "text-orange-400"}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1 text-lg font-black tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function ClimberProfileSheet({ userId, onClose }: ClimberProfileSheetProps) {
  const [stats, setStats] = useState<ClimberProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchClimberProfileStats(userId).then((data) => {
      if (cancelled) return;
      if (!data) {
        setError("Could not load climber profile.");
        setStats(null);
      } else {
        setStats(data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const open = userId !== null;
  const profile = stats?.profile;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-hidden border-orange-500/30 p-0 sm:max-w-lg">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="size-8 animate-spin text-orange-500" />
            <p className="text-sm text-muted-foreground">Loading climber card…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-center text-sm text-destructive">{error}</div>
        )}

        {!loading && stats && profile && (
          <div className="flex max-h-[90vh] flex-col">
            <div className="shrink-0 border-b border-border/50 bg-gradient-to-b from-orange-500/10 to-transparent px-5 pb-4 pt-5">
              <DialogHeader className="space-y-3 text-left">
                <div className="flex items-start gap-4">
                  <AvatarFrame
                    username={profile.username}
                    avatarUrl={profile.avatar_url}
                    lifetimeScore={profile.current_pump_score}
                    size="md"
                    plain
                  />
                  <div className="min-w-0 flex-1 pt-1">
                    <DialogTitle className="text-xl font-black">
                      {profile.username}
                    </DialogTitle>
                    <DialogDescription className="text-orange-400/90 font-semibold">
                      {profile.title}
                    </DialogDescription>
                    {stats.weeklyTitle && stats.weeklyRank !== null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        This week: #{stats.weeklyRank} · {stats.weeklyTitle}
                      </p>
                    )}
                    {profile.home_crag && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        🏔 {profile.home_crag}
                      </p>
                    )}
                    {profile.last_logged_at && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Last log {formatRelativeTime(profile.last_logged_at)}
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-3">
                <BadgeShowcase counts={stats.sessionCounts} max={8} size="md" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatCard
                  icon={Target}
                  label="Hardest send"
                  value={stats.hardestGrade ?? "—"}
                  sub="Best logged grade"
                />
                <StatCard
                  icon={Award}
                  label="Total logs"
                  value={String(stats.totalLogs)}
                  sub="All session types"
                />
                <StatCard
                  icon={Trophy}
                  label="Lifetime CC"
                  value={profile.current_pump_score.toLocaleString()}
                  sub="pts"
                />
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                  Winner of the week — past podiums
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Calendar weeks (Mon–Sun), last 52 weeks. Live board uses rolling 7 days.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center rounded-lg border border-amber-500/40 bg-amber-500/10 py-2">
                    <Crown className="size-5 text-amber-400" />
                    <span className="text-xl font-black tabular-nums">
                      {stats.podium.gold}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300/90">Gold</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg border border-zinc-400/30 bg-zinc-500/10 py-2">
                    <Medal className="size-5 text-zinc-300" />
                    <span className="text-xl font-black tabular-nums">
                      {stats.podium.silver}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300/90">Silver</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg border border-orange-700/40 bg-orange-900/20 py-2">
                    <Medal className="size-5 text-orange-600" />
                    <span className="text-xl font-black tabular-nums">
                      {stats.podium.bronze}
                    </span>
                    <span className="text-[10px] font-bold text-orange-500/90">Bronze</span>
                  </div>
                </div>
                {stats.weeklyRank !== null && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Right now (7-day board): #{stats.weeklyRank} with{" "}
                    <span className="font-semibold text-orange-400">
                      {stats.weeklyPoints} pts
                    </span>{" "}
                    · {stats.weeklySessions} sessions
                  </p>
                )}
              </div>

              {stats.hardestGrade && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm">
                  <Mountain className="size-4 text-emerald-400 shrink-0" />
                  <span>
                    Hardest ascent logged:{" "}
                    <strong className="text-emerald-300">{stats.hardestGrade}</strong>
                  </span>
                </div>
              )}

              <BadgeGallery counts={stats.sessionCounts} hideHeader />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
