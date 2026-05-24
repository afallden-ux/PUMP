"use client";

import { useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";
import { LeaderboardBarRace } from "@/components/leaderboards/LeaderboardBarRace";
import { LeaderboardPodium } from "@/components/leaderboards/LeaderboardPodium";
import { LeaderboardRankList } from "@/components/leaderboards/LeaderboardRankList";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard } from "@/components/ui/AppCard";
import { Input } from "@/components/ui/input";
import {
  LEADERBOARD_CATEGORIES,
  LEADERBOARD_METRICS,
  getMetricById,
  metricsForCategory,
} from "@/lib/leaderboards/metrics";
import { rankAthletesForMetric } from "@/lib/leaderboards/rank";
import type { LeaderboardAthlete, LeaderboardCategory } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils";

interface LeaderboardsClientProps {
  athletes: LeaderboardAthlete[];
  currentUserId: string;
}

export function LeaderboardsClient({
  athletes,
  currentUserId,
}: LeaderboardsClientProps) {
  const [category, setCategory] = useState<LeaderboardCategory>("all");
  const [metricId, setMetricId] = useState(LEADERBOARD_METRICS[0].id);
  const [search, setSearch] = useState("");

  const categoryMetrics = useMemo(
    () => metricsForCategory(category),
    [category]
  );

  const activeMetric =
    categoryMetrics.find((m) => m.id === metricId) ??
    categoryMetrics[0] ??
    LEADERBOARD_METRICS[0];

  const ranked = useMemo(() => {
    const rows = rankAthletesForMetric(athletes, activeMetric.id, currentUserId);
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.athlete.username.toLowerCase().includes(q));
  }, [athletes, activeMetric.id, currentUserId, search]);

  const myRow = ranked.find((r) => r.isCurrentUser);
  const participants = ranked.length;

  function selectCategory(next: LeaderboardCategory) {
    setCategory(next);
    const first = metricsForCategory(next)[0];
    if (first) setMetricId(first.id);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8">
      <PageHeader
        eyebrow="Rankings"
        title="Leaderboards"
        subtitle={`${athletes.length} climbers · assessments, outdoor sends, MoonBoard, 27crags & 8a.nu`}
        actions={
          <div className="hidden items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800 sm:flex">
            <Trophy className="size-4 shrink-0" />
            {participants > 0 ? (
              <span>
                <strong>{participants}</strong> ranked on this board
              </span>
            ) : (
              <span>Log assessments or sync logbooks to appear</span>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <AppCard className="p-3">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Category
            </p>
            <div className="flex flex-wrap gap-1.5 lg:flex-col">
              {LEADERBOARD_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategory(c.id)}
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                    category === c.id
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </AppCard>

          <AppCard className="mt-3 hidden max-h-[min(420px,50vh)] overflow-y-auto p-2 lg:block">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Metric
            </p>
            <div className="space-y-0.5">
              {categoryMetrics.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetricId(m.id)}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left text-xs transition-colors",
                    metricId === m.id
                      ? "bg-teal-50 font-semibold text-teal-800"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </AppCard>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="lg:hidden">
              <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                Metric
              </label>
              <select
                value={metricId}
                onChange={(e) => setMetricId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {categoryMetrics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search climber…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <AppCard className="overflow-hidden p-0">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/40 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-bold text-slate-900">{activeMetric.label}</h2>
              <p className="mt-1 text-sm text-slate-500">{activeMetric.description}</p>
              {myRow && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow-sm">
                  <span className="text-slate-500">Your rank</span>
                  <span className="font-bold text-teal-700">#{myRow.rank}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-semibold tabular-nums text-slate-800">
                    {myRow.displayValue}
                  </span>
                </p>
              )}
            </div>

            {ranked.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No one has data for this board yet. Log assessments on your profile or sync
                MoonBoard / 27crags / 8a.nu.
              </div>
            ) : (
              <>
                <LeaderboardPodium rows={ranked} />
                <div className="space-y-4 border-t border-slate-100 px-4 py-4 sm:px-6">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Top performers
                    </p>
                    <LeaderboardBarRace
                      rows={ranked}
                      higherIsBetter={activeMetric.higherIsBetter}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Full standings
                    </p>
                    <LeaderboardRankList rows={ranked} />
                  </div>
                </div>
              </>
            )}
          </AppCard>

          <p className="text-center text-[11px] text-slate-400">
            Rankings use latest CC assessments and synced logbooks. Demo climbers included for
            preview.
          </p>
        </div>
      </div>
    </div>
  );
}
