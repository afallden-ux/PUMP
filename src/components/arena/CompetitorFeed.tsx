"use client";

import { LayoutGroup, motion } from "framer-motion";
import { CompetitorCard } from "@/components/arena/CompetitorCard";
import type { ArenaMetric, RankedAthlete } from "@/lib/arena/types";

interface CompetitorFeedProps {
  ranked: RankedAthlete[];
  metric: ArenaMetric;
}

export function CompetitorFeed({ ranked, metric }: CompetitorFeedProps) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-base font-semibold text-slate-800">Crew rankings</h2>
        <p className="text-xs text-slate-500">
          Ego-boost board — cards reorder when you change metric or period
        </p>
      </div>

      <LayoutGroup>
        <motion.div layout className="flex flex-col gap-2">
          {ranked.map((r) => (
            <CompetitorCard key={r.athlete.id} ranked={r} metricKind={metric} />
          ))}
        </motion.div>
      </LayoutGroup>
    </section>
  );
}
