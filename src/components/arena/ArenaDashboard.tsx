"use client";

import { useMemo, useState } from "react";
import { ArenaCard } from "@/components/arena/ArenaCard";
import { ArenaExportCard } from "@/components/arena/ArenaExportCard";
import {
  ArenaFilterBar,
  type ArenaPeriodTab,
} from "@/components/arena/ArenaFilterBar";
import { ArenaSidebar } from "@/components/arena/ArenaSidebar";
import { ArenaSummaryTable } from "@/components/arena/ArenaSummaryTable";
import { ArenaThemeToggle } from "@/components/arena/ArenaThemeToggle";
import { BaselineProgressPanel } from "@/components/arena/BaselineProgressPanel";
import { CompetitorFeed } from "@/components/arena/CompetitorFeed";
import { PersonalComparisonPanel } from "@/components/arena/PersonalComparisonPanel";
import { LatticeDonutChart } from "@/components/arena/charts/LatticeDonutChart";
import { LatticeStackedBarChart } from "@/components/arena/charts/LatticeStackedBarChart";
import { timeframeDateRangeLabel } from "@/lib/arena/dateRange";
import { MOCK_ATHLETES } from "@/lib/arena/mockData";
import { rankAthletes } from "@/lib/arena/selectors";
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
    <div className="arena-fullbleed light flex min-h-[100dvh] bg-[#f4f6f9] text-slate-800">
      <ArenaSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-2 border-b border-slate-200/80 bg-white px-4 py-2 lg:hidden">
          <ArenaThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 hidden justify-end lg:flex">
            <ArenaThemeToggle />
          </div>

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
              <ArenaCard className="p-5">
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
                    <LatticeStackedBarChart
                      data={me.weeklyStacks}
                      height={200}
                    />
                  </div>
                </div>
              </ArenaCard>

              <ArenaCard>
                <ArenaSummaryTable
                  breakdown={me.breakdown}
                  dateRangeLabel={dateLabel}
                />
              </ArenaCard>

              <CompetitorFeed ranked={ranked} metric={metric} />

              <BaselineProgressPanel athlete={me.athlete} />

              <ArenaCard>
                <ArenaExportCard />
              </ArenaCard>
            </div>

            <div className="hidden xl:block">
              <div className="sticky top-6">
                <PersonalComparisonPanel ranked={me} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
