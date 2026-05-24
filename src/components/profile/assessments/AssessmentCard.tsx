"use client";

import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { ASSESSMENT_META, type AssessmentType } from "@/lib/constants/assessments";
import type { AssessmentCardSummary } from "@/lib/assessments/format";
import { formatDateShort } from "@/lib/assessments/format";
import { cn } from "@/lib/utils";

interface AssessmentCardProps {
  type: AssessmentType;
  summary: AssessmentCardSummary;
}

export function AssessmentCard({ type, summary }: AssessmentCardProps) {
  const meta = ASSESSMENT_META[type];
  const Icon = meta.icon;

  return (
    <Link
      href={`/profile/assessments/${type}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            meta.iconClass
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800">{meta.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {summary.hasLogs && summary.lastCompleted
              ? `Last completed on ${formatDateShort(summary.lastCompleted)}`
              : "No assessments logged"}
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-teal-600 opacity-70 group-hover:opacity-100" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-[11px] text-slate-500">{meta.metric1Label}</p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold tabular-nums",
              summary.metric1Muted ? "text-slate-400" : "text-slate-800"
            )}
          >
            {!summary.metric1Muted && summary.metric1.startsWith("+") ? (
              <>
                <span className="text-teal-600">+</span>
                {summary.metric1.slice(1)}
              </>
            ) : (
              summary.metric1
            )}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">{meta.metric2Label}</p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold tabular-nums",
              summary.metric2Muted ? "text-slate-400" : "text-slate-800"
            )}
          >
            {summary.metric2}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function AssessmentsSectionHeader() {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-base font-semibold text-slate-800">Primary Assessments</h2>
      <button
        type="button"
        className="text-slate-400 hover:text-slate-600"
        aria-label="About assessments"
        title="Log baseline tests to track strength, endurance, and flexibility."
      >
        <Info className="size-4" />
      </button>
    </div>
  );
}
