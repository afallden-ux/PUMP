"use client";

import { useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { CompareBarRace } from "@/components/compare/CompareBarRace";
import { CompareDuelBanner } from "@/components/compare/CompareDuelBanner";
import { CompareHighlightCards } from "@/components/compare/CompareHighlightCards";
import { CompareMetricRow } from "@/components/compare/CompareMetricRow";
import { CompareRadarDuel } from "@/components/compare/CompareRadarDuel";
import { AppCard } from "@/components/ui/AppCard";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import type { CompareSnapshot } from "@/lib/compare/types";
import {
  COMPARE_METRICS,
  type CompareCategory,
  metricWinner,
} from "@/lib/compare/metricDefs";
import { cn } from "@/lib/utils";

const TABS: { id: CompareCategory; label: string }[] = [
  { id: "all", label: "All metrics" },
  { id: "body", label: "Body & sends" },
  { id: "strength", label: "Strength" },
  { id: "flex", label: "Endurance & flex" },
  { id: "activity", label: "Activity" },
];

interface CompareVisualPanelProps {
  left: CompareSnapshot;
  right: CompareSnapshot;
}

export function CompareVisualPanel({ left, right }: CompareVisualPanelProps) {
  const [tab, setTab] = useState<CompareCategory>("all");
  const leftName = left.profile.username;
  const rightName = right.profile.username;

  const filtered =
    tab === "all" ? COMPARE_METRICS : COMPARE_METRICS.filter((m) => m.category === tab);

  return (
    <div className="space-y-5">
      <CompareDuelBanner left={left} right={right} />
      <CompareHighlightCards left={left} right={right} />

      <div className="grid gap-5 lg:grid-cols-5">
        <AppCard className="p-4 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <LayoutGrid className="size-4 text-teal-600" />
              Metric duel
            </h2>
            <div className="flex flex-wrap gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    tab === t.id
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <CompareBarRace
            left={left}
            right={right}
            category={tab}
            leftLabel={leftName}
            rightLabel={rightName}
          />
        </AppCard>

        <AppCard className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Strength profile</h2>
          <CompareRadarDuel left={left} right={right} />
        </AppCard>
      </div>

      <CollapsibleSection
        title="Full data table"
        subtitle="All numbers side by side"
        icon={Table2}
        defaultOpen={false}
      >
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1fr_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Metric</span>
            <span className="text-center text-[10px] font-bold uppercase text-teal-800">
              {leftName}
            </span>
            <span className="text-center text-[10px] font-bold uppercase text-slate-600">
              {rightName}
            </span>
          </div>
          <div className="px-4">
            {filtered.map((def) => (
              <CompareMetricRow
                key={def.id}
                label={def.label}
                sublabel={def.sublabel}
                left={def.display(left)}
                right={def.display(right)}
                winner={metricWinner(def, left, right)}
              />
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
