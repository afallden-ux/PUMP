"use client";

import { ARENA_CATEGORY_ORDER } from "@/lib/arena/categories";
import type { CategorySlice } from "@/lib/arena/types";
interface ArenaSummaryTableProps {
  breakdown: CategorySlice[];
  dateRangeLabel: string;
}

export function ArenaSummaryTable({ breakdown, dateRangeLabel }: ArenaSummaryTableProps) {
  const rows = ARENA_CATEGORY_ORDER.map((cat) => {
    const slice = breakdown.find((b) => b.category === cat);
    const workouts = slice?.count ?? 0;
    const durationM = slice ? Math.round(slice.hours * 60) : 0;
    const tut = Math.round(durationM * 0.65);
    const workload = slice?.vPoints ?? workouts * 8;
    return {
      category: cat,
      label: slice?.label ?? cat,
      workouts,
      durationM,
      tut,
      workload,
    };
  }).filter((r) => r.workouts > 0);

  const total = rows.reduce(
    (acc, r) => ({
      workouts: acc.workouts + r.workouts,
      durationM: acc.durationM + r.durationM,
      tut: acc.tut + r.tut,
      workload: acc.workload + r.workload,
    }),
    { workouts: 0, durationM: 0, tut: 0, workload: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 px-5 pt-5">
        <h2 className="text-base font-semibold text-slate-800">Summary</h2>
        <p className="text-xs text-slate-500">{dateRangeLabel}</p>
      </div>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/80">
            {["WORKOUT TYPE", "WORKOUTS", "DURATION (M)", "TUT (M)", "WORKLOAD"].map(
              (h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-[10px] font-semibold tracking-wide text-slate-400"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                No workouts in this period
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.category} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-700">{row.label}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{row.workouts}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{row.durationM}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{row.tut}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{row.workload}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50/60 font-semibold">
            <td className="px-5 py-3 text-slate-800">TOTAL</td>
            <td className="px-5 py-3 tabular-nums text-slate-800">{total.workouts}</td>
            <td className="px-5 py-3 tabular-nums text-slate-800">{total.durationM}</td>
            <td className="px-5 py-3 tabular-nums text-slate-800">{total.tut}</td>
            <td className="px-5 py-3 tabular-nums text-slate-800">{total.workload}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
