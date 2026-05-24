"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AssessmentHistoryList } from "@/components/profile/assessments/AssessmentHistoryList";
import { AssessmentProgressChart } from "@/components/profile/assessments/AssessmentProgressChart";
import { LogAssessmentModal } from "@/components/profile/assessments/LogAssessmentModal";
import { AppCard } from "@/components/ui/AppCard";
import { ASSESSMENT_META, type AssessmentType } from "@/lib/constants/assessments";
import { useAssessments } from "@/lib/hooks/useAssessments";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";
import { cn } from "@/lib/utils";

interface AssessmentDetailClientProps {
  profile: Profile;
  type: AssessmentType;
}

export function AssessmentDetailClient({ profile, type }: AssessmentDetailClientProps) {
  const meta = ASSESSMENT_META[type];
  const { logs, loading, schemaMissing, refresh } = useAssessments(profile.id, type);
  const Icon = meta.icon;

  async function handleDelete(id: string) {
    if (!confirm("Delete this assessment entry?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("assessment_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", profile.id);
    if (error) {
      toast.error("Could not delete", { description: error.message });
      return;
    }
    toast.success("Entry removed");
    refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/assessments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to assessments
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              meta.iconClass
            )}
          >
            <Icon className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{meta.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-teal-600 hover:underline"
            >
              {meta.testLinkLabel}
            </button>
          </div>
        </div>
        <LogAssessmentModal userId={profile.id} type={type} onLogged={refresh} />
      </div>

      {schemaMissing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Run <code className="rounded bg-white px-1">supabase/RUN_ASSESSMENTS.sql</code> in
          Supabase SQL Editor.
        </div>
      )}

      <AppCard className="p-5">
        {loading ? (
          <p className="text-sm text-slate-500">Loading chart…</p>
        ) : (
          <AssessmentProgressChart type={type} logs={logs} />
        )}
      </AppCard>

      {loading ? (
        <p className="text-sm text-slate-500">Loading history…</p>
      ) : (
        <AssessmentHistoryList
          type={type}
          logs={logs}
          heightCm={profile.height_cm ?? null}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
