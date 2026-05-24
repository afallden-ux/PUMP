"use client";

import { ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ArenaMetric, ArenaTimeframe } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

export type ArenaPeriodTab = "1mo" | "3mo" | "custom";

const METRIC_OPTIONS: { id: ArenaMetric; label: string }[] = [
  { id: "workouts", label: "Workouts logged" },
  { id: "volume", label: "Volume (hours)" },
  { id: "vpoints", label: "V-Points" },
];

interface ArenaFilterBarProps {
  metric: ArenaMetric;
  periodTab: ArenaPeriodTab;
  timeframe: ArenaTimeframe;
  dateFrom: string;
  dateTo: string;
  onMetricChange: (m: ArenaMetric) => void;
  onPeriodTabChange: (tab: ArenaPeriodTab) => void;
  onTimeframeChange: (tf: ArenaTimeframe) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onApply: () => void;
}

export function ArenaFilterBar({
  metric,
  periodTab,
  dateFrom,
  dateTo,
  onMetricChange,
  onPeriodTabChange,
  onDateFromChange,
  onDateToChange,
  onApply,
}: ArenaFilterBarProps) {
  const tabs: { id: ArenaPeriodTab; label: string }[] = [
    { id: "1mo", label: "1 Mo." },
    { id: "3mo", label: "3 Mo." },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Analytics</h1>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600"
          aria-label="About analytics"
        >
          <Info className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
        <div className="relative min-w-[200px]">
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Metric</label>
          <div className="relative">
            <select
              value={metric}
              onChange={(e) => onMetricChange(e.target.value as ArenaMetric)}
              className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 shadow-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
            >
              {METRIC_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Period</label>
          <div className="flex gap-6 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onPeriodTabChange(tab.id)}
                className={cn(
                  "relative pb-2 text-sm font-medium transition-colors",
                  periodTab === tab.id
                    ? "text-[#2563eb] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#2563eb] after:content-['']"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {periodTab === "custom" && (
          <>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-[11px] font-medium text-slate-500">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-10 border-slate-200 bg-white text-sm shadow-sm"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-[11px] font-medium text-slate-500">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-10 border-slate-200 bg-white text-sm shadow-sm"
              />
            </div>
          </>
        )}

        <Button
          type="button"
          onClick={onApply}
          className="h-10 bg-[#2563eb] px-6 font-semibold text-white shadow-sm hover:bg-[#1d4ed8]"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
