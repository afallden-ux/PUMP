"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles, Trophy, Users } from "lucide-react";
import { LeaderboardBarRace } from "@/components/leaderboards/LeaderboardBarRace";
import { LeaderboardCategoryRail } from "@/components/leaderboards/LeaderboardCategoryRail";
import { LeaderboardMetricChips } from "@/components/leaderboards/LeaderboardMetricChips";
import { LeaderboardRankList } from "@/components/leaderboards/LeaderboardRankList";
import { Input } from "@/components/ui/input";
import { getCategoryMeta } from "@/lib/leaderboards/categoryMeta";
import {
  LEADERBOARD_METRICS,
  metricsForCategory,
} from "@/lib/leaderboards/metrics";
import { rankAthletesForMetric, rankPercentile } from "@/lib/leaderboards/rank";
import type {
  LeaderboardAthlete,
  LeaderboardCategory,
} from "@/lib/leaderboards/types";
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
  const [highlightedId, setHighlight] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const categoryMetrics = useMemo(
    () => metricsForCategory(category),
    [category]
  );

  const activeMetric =
    categoryMetrics.find((m) => m.id === metricId) ??
    categoryMetrics[0] ??
    LEADERBOARD_METRICS[0];

  const categoryMeta = getCategoryMeta(category);

  const ranked = useMemo(() => {
    const rows = rankAthletesForMetric(athletes, activeMetric.id, currentUserId);
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.athlete.username.toLowerCase().includes(q));
  }, [athletes, activeMetric.id, currentUserId, search]);

  const myRow = ranked.find((r) => r.isCurrentUser);
  const leader = ranked[0];
  const percentile = myRow
    ? rankPercentile(myRow.rank, ranked.length)
    : null;

  const scrollToMe = useCallback(() => {
    const el = listRef.current?.querySelector("[data-current-user='true']");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (myRow) setHighlight(myRow.athlete.id);
  }, [myRow]);

  function selectCategory(next: LeaderboardCategory) {
    setCategory(next);
    const first = metricsForCategory(next)[0];
    if (first) setMetricId(first.id);
    setHighlight(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white shadow-xl shadow-teal-900/20">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-teal-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 size-48 rounded-full bg-amber-500/15 blur-3xl"
          aria-hidden
        />
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300/90">
                <Sparkles className="size-3.5" />
                Live rankings
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Leaderboards
              </h1>
              <p className="mt-2 max-w-lg text-sm text-slate-300">
                Assessments, outdoor sends, MoonBoard, 27crags & 8a.nu — switch
                metrics and watch the board animate.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-teal-300">
                  <Users className="size-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Climbers
                  </span>
                </div>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {athletes.length}
                </p>
              </div>
              {myRow && (
                <motion.div
                  key={activeMetric.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-teal-500/10 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/90">
                    Your rank
                  </p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-300">
                      #{myRow.rank}
                    </span>
                    {percentile != null && (
                      <span className="text-xs text-slate-300">
                        top {percentile}%
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                    {myRow.displayValue}
                  </p>
                </motion.div>
              )}
              {leader && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Leader
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-white">
                    {leader.athlete.username}
                  </p>
                  <p className="text-lg font-black tabular-nums text-teal-300">
                    {leader.displayValue}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="space-y-4">
        <LeaderboardCategoryRail active={category} onChange={selectCategory} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Metric
            </p>
            <LeaderboardMetricChips
              metrics={categoryMetrics}
              activeId={metricId}
              onChange={(id) => {
                setMetricId(id);
                setHighlight(null);
              }}
            />
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Find climber…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-slate-200 bg-white pl-9"
            />
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        ref={listRef}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50"
      >
        <div
          className={cn(
            "border-b border-slate-100 bg-gradient-to-r px-4 py-4 sm:px-6 sm:py-5",
            "from-slate-50 via-white to-teal-50/30"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                    categoryMeta.accent
                  )}
                >
                  <categoryMeta.icon className="size-4" />
                </span>
                <div>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={activeMetric.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xl font-black text-slate-900 sm:text-2xl"
                    >
                      {activeMetric.label}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="text-sm text-slate-500">{activeMetric.description}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                <strong className="text-slate-700">{ranked.length}</strong> ranked
                {ranked.length !== athletes.length && (
                  <span> · filtered from {athletes.length}</span>
                )}
              </p>
            </div>

            {myRow && myRow.rank > 12 && (
              <button
                type="button"
                onClick={scrollToMe}
                className="shrink-0 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100"
              >
                Jump to me
              </button>
            )}
          </div>

          {myRow && percentile != null && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Your percentile</span>
                <span className="text-teal-700">Top {percentile}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  key={`${activeMetric.id}-${percentile}`}
                  className="h-full rounded-full bg-gradient-to-r from-teal-600 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentile}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          )}
        </div>

        {ranked.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <Trophy className="size-10 text-slate-300" />
            <p className="max-w-sm text-sm text-slate-500">
              No one has data for this board yet. Log assessments or sync
              MoonBoard / 27crags / 8a.nu to climb the ranks.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeMetric.id}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-slate-100"
            >
              <section className="px-4 py-4 sm:px-6 sm:py-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Bar race
                </p>
                <LeaderboardBarRace
                  rows={ranked}
                  higherIsBetter={activeMetric.higherIsBetter}
                  metricKey={activeMetric.id}
                  highlightedId={highlightedId}
                  onHighlight={setHighlight}
                  limit={15}
                />
              </section>

              <section className="p-4 sm:p-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Full standings
                </p>
                <LeaderboardRankList
                  rows={ranked}
                  higherIsBetter={activeMetric.higherIsBetter}
                  metricKey={activeMetric.id}
                  highlightedId={highlightedId}
                  onHighlight={setHighlight}
                  startRank={1}
                />
              </section>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Rankings use latest CC assessments and synced logbooks. Hover rows to
        highlight · click to open profiles.
      </p>
    </div>
  );
}
