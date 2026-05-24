"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitCompare, Loader2, Search } from "lucide-react";
import { CompareMetricRow, winnerHigher } from "@/components/compare/CompareMetricRow";
import { CompareProfileHeader } from "@/components/compare/CompareProfileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard } from "@/components/ui/AppCard";
import { Input } from "@/components/ui/input";
import { PRODUCT_NORTH_STAR } from "@/lib/productVision";
import {
  formatDuration,
  formatResistance,
} from "@/lib/assessments/format";
import { useComparePair } from "@/lib/hooks/useComparePair";
import { gradeCompareWinner } from "@/lib/utils/gradeCompare";
import { isMockCompareAthleteId } from "@/lib/compare/mockAthletes";
import type { Profile } from "@/types/app";
import { cn } from "@/lib/utils";

interface CompareClientProps {
  currentUserId: string;
  climbers: Profile[];
}

function fmtCm(v: number | null): string {
  return v != null ? `${v} cm` : "—";
}

function fmtKg(v: number | null): string {
  return v != null ? `${v} kg` : "—";
}

function fmtPct(v: number | null): string {
  return v != null ? `${v} %` : "—";
}

export function CompareClient({ currentUserId, climbers }: CompareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWith = searchParams.get("with");

  const [opponentId, setOpponentId] = useState<string | null>(
    initialWith && initialWith !== currentUserId ? initialWith : null
  );
  const [query, setQuery] = useState("");

  const { left, right, loading, error } = useComparePair(
    currentUserId,
    opponentId
  );

  const others = useMemo(
    () => climbers.filter((c) => c.id !== currentUserId),
    [climbers, currentUserId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return others;
    return others.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        (c.home_crag?.toLowerCase().includes(q) ?? false)
    );
  }, [others, query]);

  function selectOpponent(id: string) {
    setOpponentId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("with", id);
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  }

  function clearOpponent() {
    setOpponentId(null);
    router.replace("/compare", { scroll: false });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 pb-8">
      <PageHeader
        eyebrow="Core feature"
        title="Compare climbers"
        subtitle={PRODUCT_NORTH_STAR}
      />

      <AppCard className="p-4">
        <p className="mb-3 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <strong className="font-semibold">Demo climbers</strong> (Paul, Carl, Maya, Adam) use
          sample metrics so you can preview compare without extra accounts.
        </p>
        <label className="text-xs font-semibold text-slate-600">
          Compare with
        </label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by username or home crag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No climbers match.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectOpponent(c.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  opponentId === c.id
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                )}
              >
                {c.username}
                {isMockCompareAthleteId(c.id) && (
                  <span className="ml-1 text-[10px] font-normal text-amber-700">· demo</span>
                )}
              </button>
            ))
          )}
        </div>
        {opponentId && (
          <button
            type="button"
            onClick={clearOpponent}
            className="mt-3 text-xs font-medium text-slate-500 underline hover:text-slate-800"
          >
            Clear selection
          </button>
        )}
      </AppCard>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="size-8 animate-spin text-teal-600" />
          <p className="text-sm text-slate-500">Loading compare data…</p>
        </div>
      )}

      {!loading && error && (
        <AppCard className="p-6 text-center text-sm text-red-600">{error}</AppCard>
      )}

      {!loading && left && opponentId && right && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <CompareProfileHeader snapshot={left} side="left" isYou />
            <CompareProfileHeader snapshot={right} side="right" />
          </div>

          <AppCard className="overflow-hidden p-0">
            <div className="grid grid-cols-[1fr_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Metric
              </span>
              <span className="text-center text-[10px] font-bold uppercase tracking-wider text-teal-800">
                {left.profile.username}
              </span>
              <span className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {right.profile.username}
              </span>
            </div>
            <div className="px-4 pb-2">
              <p className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Body & sends
              </p>
              <CompareMetricRow
                label="Height"
                left={fmtCm(left.heightCm)}
                right={fmtCm(right.heightCm)}
                winner={winnerHigher(left.heightCm, right.heightCm)}
              />
              <CompareMetricRow
                label="Body weight"
                sublabel="Latest logged"
                left={fmtKg(left.bodyWeightKg)}
                right={fmtKg(right.bodyWeightKg)}
              />
              <CompareMetricRow
                label="Hardest grade sent"
                left={left.hardestGrade ?? "—"}
                right={right.hardestGrade ?? "—"}
                winner={gradeCompareWinner(left.hardestGrade, right.hardestGrade)}
              />

              <p className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Strength assessments
              </p>
              <CompareMetricRow
                label="Finger strength (max hang)"
                sublabel="Added load"
                left={formatResistance(left.fingerStrengthKg)}
                right={formatResistance(right.fingerStrengthKg)}
                winner={winnerHigher(left.fingerStrengthKg, right.fingerStrengthKg)}
              />
              <CompareMetricRow
                label="Finger strength"
                sublabel="% body weight"
                left={fmtPct(left.fingerStrengthPctBw)}
                right={fmtPct(right.fingerStrengthPctBw)}
                winner={winnerHigher(
                  left.fingerStrengthPctBw,
                  right.fingerStrengthPctBw
                )}
              />
              <CompareMetricRow
                label="Weighted pull-up"
                sublabel="Added load"
                left={formatResistance(left.weightedPullupKg)}
                right={formatResistance(right.weightedPullupKg)}
                winner={winnerHigher(left.weightedPullupKg, right.weightedPullupKg)}
              />
              <CompareMetricRow
                label="Weighted pull-up"
                sublabel="% body weight"
                left={fmtPct(left.weightedPullupPctBw)}
                right={fmtPct(right.weightedPullupPctBw)}
                winner={winnerHigher(
                  left.weightedPullupPctBw,
                  right.weightedPullupPctBw
                )}
              />

              <p className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Other assessments
              </p>
              <CompareMetricRow
                label="Power endurance"
                sublabel="Time under tension"
                left={formatDuration(left.powerEnduranceTutS)}
                right={formatDuration(right.powerEnduranceTutS)}
                winner={winnerHigher(left.powerEnduranceTutS, right.powerEnduranceTutS)}
              />
              <CompareMetricRow
                label="Hip flexibility"
                sublabel="Reach distance"
                left={left.hipFlexibilityCm != null ? `${left.hipFlexibilityCm} cm` : "—"}
                right={
                  right.hipFlexibilityCm != null ? `${right.hipFlexibilityCm} cm` : "—"
                }
                winner={winnerHigher(left.hipFlexibilityCm, right.hipFlexibilityCm)}
              />
              <CompareMetricRow
                label="Hip flexibility"
                sublabel="% of height"
                left={fmtPct(left.hipFlexibilityPctHeight)}
                right={fmtPct(right.hipFlexibilityPctHeight)}
                winner={winnerHigher(
                  left.hipFlexibilityPctHeight,
                  right.hipFlexibilityPctHeight
                )}
              />

              <p className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Activity
              </p>
              <CompareMetricRow
                label="Lifetime CC score"
                left={left.lifetimeScore.toLocaleString()}
                right={right.lifetimeScore.toLocaleString()}
                winner={winnerHigher(left.lifetimeScore, right.lifetimeScore)}
              />
              <CompareMetricRow
                label="Points this week"
                left={String(left.weeklyPoints)}
                right={String(right.weeklyPoints)}
                winner={winnerHigher(left.weeklyPoints, right.weeklyPoints)}
              />
              <CompareMetricRow
                label="Total session logs"
                left={String(left.totalLogs)}
                right={String(right.totalLogs)}
                winner={winnerHigher(left.totalLogs, right.totalLogs)}
              />
            </div>
          </AppCard>

          <p className="text-center text-xs text-slate-500">
            <GitCompare className="mr-1 inline size-3.5" />
            Teal highlight = higher value on that row. Log assessments on Profile to
            fill gaps.
          </p>
        </>
      )}

      {!loading && left && !opponentId && (
        <AppCard className="flex flex-col items-center gap-3 p-10 text-center">
          <GitCompare className="size-10 text-teal-600/60" />
          <p className="text-sm text-slate-600">
            Pick a climber above — or tap someone in the feed and choose{" "}
            <strong className="text-slate-800">Compare</strong>.
          </p>
        </AppCard>
      )}
    </div>
  );
}
