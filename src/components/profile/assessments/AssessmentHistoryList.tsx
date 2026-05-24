"use client";

import { MoreHorizontal } from "lucide-react";
import { ASSESSMENT_META, type AssessmentType } from "@/lib/constants/assessments";
import {
  formatDateLong,
  formatDuration,
  formatResistance,
  pctBodyWeight,
  pctHeight,
} from "@/lib/assessments/format";
import type { AssessmentLog } from "@/lib/assessments/types";

interface AssessmentHistoryListProps {
  type: AssessmentType;
  logs: AssessmentLog[];
  heightCm: number | null;
  onDelete?: (id: string) => void;
}

export function AssessmentHistoryList({
  type,
  logs,
  heightCm,
  onDelete,
}: AssessmentHistoryListProps) {
  const meta = ASSESSMENT_META[type];

  if (logs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
        No test history yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Test History</h3>
      {logs.map((log) => (
        <article
          key={log.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-800">{formatDateLong(log.recorded_at)}</p>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(log.id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Delete entry"
              >
                <MoreHorizontal className="size-4" />
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:text-left">
            {(type === "finger_strength" || type === "weighted_pullup") && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.metric1Label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-teal-700">
                    {formatResistance(log.resistance_kg)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Body Weight
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {log.body_weight_kg != null ? `${log.body_weight_kg} kg` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.metric2Label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {pctBodyWeight(log.body_weight_kg, log.resistance_kg) != null
                      ? `${pctBodyWeight(log.body_weight_kg, log.resistance_kg)} %`
                      : "—"}
                  </p>
                </div>
              </>
            )}

            {type === "power_endurance" && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.metric1Label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDuration(log.time_under_tension_s)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.metric2Label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDuration(log.total_duration_s)}
                  </p>
                </div>
                <div />
              </>
            )}

            {type === "hip_flexibility" && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.metric1Label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {log.distance_cm != null ? `${log.distance_cm} cm` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.metric2Label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {pctHeight(log.distance_cm, heightCm) != null
                      ? `${pctHeight(log.distance_cm, heightCm)} %`
                      : "—"}
                  </p>
                </div>
                <div />
              </>
            )}
          </div>

          {(log.sets != null || log.reps != null) && (
            <p className="mt-2 text-xs text-slate-500">
              {log.sets ?? 0} sets × {log.reps ?? 0} reps
            </p>
          )}

          {log.notes?.trim() && (
            <div className="mt-3 border-t border-slate-100 pt-2">
              <p className="text-[10px] font-medium uppercase text-slate-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{log.notes}</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
