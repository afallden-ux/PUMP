"use client";

import { useMemo, useState } from "react";
import { ArenaExportCard } from "@/components/arena/ArenaExportCard";
import {
  ArenaFilterBar,
  type ArenaPeriodTab,
} from "@/components/arena/ArenaFilterBar";
import { ArenaSummaryTable } from "@/components/arena/ArenaSummaryTable";
import { BaselineProgressPanel } from "@/components/arena/BaselineProgressPanel";
import { CompetitorFeed } from "@/components/arena/CompetitorFeed";
import { PersonalComparisonPanel } from "@/components/arena/PersonalComparisonPanel";
import { LatticeDonutChart } from "@/components/arena/charts/LatticeDonutChart";
import { LatticeStackedBarChart } from "@/components/arena/charts/LatticeStackedBarChart";
import { AppCard } from "@/components/ui/AppCard";
import { timeframeDateRangeLabel } from "@/lib/arena/dateRange";
import { MOCK_ATHLETES } from "@/lib/arena/mockData";
import { avgWorkoutsPerWeek, rankAthletes } from "@/lib/arena/selectors";
import type { ArenaMetric, ArenaTimeframe } from "@/lib/arena/types";

function periodToTimeframe(tab: ArenaPeriodTab): ArenaTimeframe {
  if (tab === "1mo") return "4w";
  if (tab === "3mo") return "12w";
  return "12w";
}

export function ArenaDashboard() {
  const [periodTab, setPeriodTab] = useState<ArenaPeriodTab>("3mo");
  const [timeframe, setTimeframe] = useState<ArenaTimeframe>("12w");
  const [metric, setMetric] = useState<ArenaMetric>("workouts");
  const [dateFrom, setDateFrom] = useState("2026-02-24");
  const [dateTo, setDateTo] = useState("2026-05-24");
  const [appliedKey, setAppliedKey] = useState(0);

  const ranked = useMemo(
    () => rankAthletes(MOCK_ATHLETES, metric, timeframe),
    [metric, timeframe, appliedKey]
  );

  const me = useMemo(
    () => ranked.find((r) => r.athlete.isMe) ?? ranked[0]!,
    [ranked]
  );

  const dateLabel = timeframeDateRangeLabel(timeframe);

  function handlePeriodTab(tab: ArenaPeriodTab) {
    setPeriodTab(tab);
    setTimeframe(periodToTimeframe(tab));
  }

  function handleApply() {
    if (periodTab === "custom") setTimeframe("ytd");
    setAppliedKey((k) => k + 1);
  }

  return (
    <>
      <ArenaFilterBar
        metric={metric}
        periodTab={periodTab}
        timeframe={timeframe}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onMetricChange={setMetric}
        onPeriodTabChange={handlePeriodTab}
        onTimeframeChange={setTimeframe}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApply={handleApply}
      />

      <div className="mb-4 lg:hidden">
        <PersonalComparisonPanel ranked={me} compact />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <AppCard className="p-5">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Workouts logged by type
                </h2>
                <LatticeDonutChart
                  breakdown={me.breakdown}
                  dominantCategory={me.dominantCategory}
                  dominantPct={me.dominantPct}
                  size="lg"
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Workouts logged by week
                </h2>
                <LatticeStackedBarChart data={me.weeklyStacks} height={200} />
              </div>
            </div>
          </AppCard>

          <AppCard>
            <ArenaSummaryTable breakdown={me.breakdown} dateRangeLabel={dateLabel} />
          </AppCard>

          <CompetitorFeed ranked={ranked} metric={metric} />

          <BaselineProgressPanel athlete={me.athlete} />

          <AppCard>
            <ArenaExportCard />
          </AppCard>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-6">
            <PersonalComparisonPanel ranked={me} />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] text-slate-400">
        Mock crew data · connect to Supabase workout_logs next
      </p>
    </>
  );
}
