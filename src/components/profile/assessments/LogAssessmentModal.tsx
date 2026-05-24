"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSESSMENT_META, type AssessmentType } from "@/lib/constants/assessments";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type AssessmentLogInsert = Database["public"]["Tables"]["assessment_logs"]["Insert"];

interface LogAssessmentModalProps {
  userId: string;
  type: AssessmentType;
  onLogged?: () => void;
  trigger?: React.ReactNode;
}

function todayInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function LogAssessmentModal({
  userId,
  type,
  onLogged,
  trigger,
}: LogAssessmentModalProps) {
  const meta = ASSESSMENT_META[type];
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordedAt, setRecordedAt] = useState(todayInputValue());
  const [bodyWeight, setBodyWeight] = useState("");
  const [resistance, setResistance] = useState("");
  const [tut, setTut] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [sets, setSets] = useState("8");
  const [reps, setReps] = useState("2");
  const [notes, setNotes] = useState("");

  function reset() {
    setRecordedAt(todayInputValue());
    setBodyWeight("");
    setResistance("");
    setTut("");
    setTotalDuration("");
    setDistance("");
    setSets("8");
    setReps("2");
    setNotes("");
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const row: AssessmentLogInsert = {
      user_id: userId,
      assessment_type: type,
      recorded_at: new Date(recordedAt).toISOString(),
      notes: notes.trim() || null,
    };

    if (type === "finger_strength" || type === "weighted_pullup") {
      const bw = Number(bodyWeight);
      const res = Number(resistance);
      if (!bodyWeight || Number.isNaN(bw) || bw <= 0) {
        setSaving(false);
        toast.error("Enter your body weight (kg)");
        return;
      }
      if (resistance === "" || Number.isNaN(res)) {
        setSaving(false);
        toast.error("Enter added resistance (kg)");
        return;
      }
      row.body_weight_kg = bw;
      row.resistance_kg = res;
      if (type === "weighted_pullup") {
        row.sets = Number(sets) || null;
        row.reps = Number(reps) || null;
      }
    }

    if (type === "power_endurance") {
      row.time_under_tension_s = Number(tut) || 0;
      row.total_duration_s = Number(totalDuration) || 0;
    }

    if (type === "hip_flexibility") {
      const dist = Number(distance);
      if (Number.isNaN(dist) || dist < 0) {
        setSaving(false);
        toast.error("Enter distance (cm)");
        return;
      }
      row.distance_cm = dist;
    }

    const { error } = await supabase.from("assessment_logs").insert(row);
    setSaving(false);

    if (error) {
      if (error.message.includes("assessment_logs")) {
        toast.error("Assessments not set up", {
          description: "Run supabase/RUN_ASSESSMENTS.sql in Supabase.",
          duration: 8000,
        });
      } else {
        toast.error("Could not save", { description: error.message });
      }
      return;
    }

    toast.success("Assessment logged");
    setOpen(false);
    reset();
    onLogged?.();
  }

  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger>
        {trigger ?? (
          <Button className="bg-teal-600 font-semibold hover:bg-teal-700">Log assessment</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-slate-100 px-4 py-4">
          <DialogTitle className="text-center text-lg font-semibold text-slate-800">
            Log assessment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Assessment date</span>
            <Input
              type="date"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="h-9 w-auto border-0 bg-transparent text-right shadow-none focus-visible:ring-0"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Exercise details
            </p>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    meta.iconClass
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{meta.exerciseLabel}</p>
                  {type === "weighted_pullup" && (
                    <p className="text-xs text-slate-500">
                      {sets} sets × {reps} reps
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {(type === "finger_strength" || type === "weighted_pullup") && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Body weight (kg)</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={bodyWeight}
                        onChange={(e) => setBodyWeight(e.target.value)}
                        placeholder="70"
                        className="border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Added resistance (kg)</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={resistance}
                        onChange={(e) => setResistance(e.target.value)}
                        placeholder="50"
                        className="border-slate-200"
                      />
                    </div>
                    {type === "weighted_pullup" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">Sets</Label>
                          <Input
                            type="number"
                            value={sets}
                            onChange={(e) => setSets(e.target.value)}
                            className="border-slate-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">Reps</Label>
                          <Input
                            type="number"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            className="border-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {type === "power_endurance" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Time under tension (s)</Label>
                      <Input
                        type="number"
                        value={tut}
                        onChange={(e) => setTut(e.target.value)}
                        className="border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Total duration (s)</Label>
                      <Input
                        type="number"
                        value={totalDuration}
                        onChange={(e) => setTotalDuration(e.target.value)}
                        className="border-slate-200"
                      />
                    </div>
                  </>
                )}
                {type === "hip_flexibility" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Distance (cm)</Label>
                    <Input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Additional notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional session notes…"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-4">
          <Button
            className="h-11 w-full bg-teal-600 text-base font-semibold hover:bg-teal-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
