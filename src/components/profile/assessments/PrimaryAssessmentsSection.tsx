"use client";

import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AssessmentCard, AssessmentsSectionHeader } from "@/components/profile/assessments/AssessmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSESSMENT_TYPES, type AssessmentType } from "@/lib/constants/assessments";
import { summarizeForCard } from "@/lib/assessments/format";
import type { AssessmentLog } from "@/lib/assessments/types";
import { useAssessments } from "@/lib/hooks/useAssessments";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";
import { useState } from "react";

interface PrimaryAssessmentsSectionProps {
  profile: Profile;
  onHeightSaved?: (heightCm: number | null) => void;
}

function latestByType(logs: AssessmentLog[]): Record<AssessmentType, AssessmentLog | null> {
  const map = Object.fromEntries(
    ASSESSMENT_TYPES.map((t) => [t, null])
  ) as Record<AssessmentType, AssessmentLog | null>;

  for (const log of logs) {
    if (!map[log.assessment_type]) {
      map[log.assessment_type] = log;
    }
  }
  return map;
}

export function PrimaryAssessmentsSection({
  profile,
  onHeightSaved,
}: PrimaryAssessmentsSectionProps) {
  const { logs, loading, schemaMissing } = useAssessments(profile.id);
  const [heightCm, setHeightCm] = useState(
    profile.height_cm != null ? String(profile.height_cm) : ""
  );
  const [savingHeight, setSavingHeight] = useState(false);

  const latest = useMemo(() => latestByType(logs), [logs]);

  async function saveHeight() {
    const trimmed = heightCm.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 100 || parsed > 250)) {
      toast.error("Height must be between 100 and 250 cm");
      return;
    }
    setSavingHeight(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ height_cm: parsed })
      .eq("id", profile.id);
    setSavingHeight(false);
    if (error) {
      toast.error("Could not save height", { description: error.message });
      return;
    }
    toast.success("Height saved");
    onHeightSaved?.(parsed);
  }

  return (
    <section>
      <AssessmentsSectionHeader />

      {schemaMissing && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Run <code className="rounded bg-white px-1">supabase/RUN_ASSESSMENTS.sql</code> in
          Supabase SQL Editor to enable assessments.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="min-w-[120px] flex-1">
          <Label htmlFor="profile-height" className="text-xs text-slate-500">
            Height (cm) — for flexibility %
          </Label>
          <Input
            id="profile-height"
            type="number"
            min={100}
            max={250}
            placeholder="172"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="mt-1 h-9 border-slate-200"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={saveHeight}
          disabled={savingHeight}
        >
          {savingHeight ? "…" : "Save height"}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading assessments…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ASSESSMENT_TYPES.map((type) => (
            <AssessmentCard
              key={type}
              type={type}
              summary={summarizeForCard(type, latest[type], profile.height_cm ?? null)}
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        Tap a test to view progress, log a session, and see history.{" "}
        <Link href="/assessments/weighted_pullup" className="text-teal-600 underline">
          Example: pull-up test
        </Link>
      </p>
    </section>
  );
}
