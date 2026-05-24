"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dumbbell, Ruler } from "lucide-react";
import { BodyMetricChart } from "@/components/profile/BodyMetricChart";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BODY_METRIC_META,
  BODY_METRIC_TYPES,
  type BodyMetricType,
} from "@/lib/constants/bodyMetrics";
import { useBodyMetrics } from "@/lib/hooks/useBodyMetrics";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";

interface BodyMetricsPanelProps {
  profile: Profile;
  onHeightSaved?: (heightCm: number | null) => void;
}

export function BodyMetricsPanel({ profile, onHeightSaved }: BodyMetricsPanelProps) {
  const { logs, loading, refresh } = useBodyMetrics(profile.id);
  const [heightCm, setHeightCm] = useState(
    profile.height_cm != null ? String(profile.height_cm) : ""
  );
  const [savingHeight, setSavingHeight] = useState(false);
  const [activeMetric, setActiveMetric] = useState<BodyMetricType>("weight");
  const [valueKg, setValueKg] = useState("");
  const [logging, setLogging] = useState(false);

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
      if (error.message.includes("height_cm")) {
        toast.error("Run body metrics SQL in Supabase", {
          description: "Open supabase/RUN_BODY_METRICS.sql and run it in SQL Editor.",
          duration: 8000,
        });
      } else {
        toast.error("Could not save height", { description: error.message });
      }
      return;
    }

    toast.success("Height saved");
    onHeightSaved?.(parsed);
  }

  async function logMetric() {
    const value = Number(valueKg);
    const meta = BODY_METRIC_META[activeMetric];
    if (Number.isNaN(value) || value <= 0 || value > meta.max) {
      toast.error(`Enter a valid ${meta.shortLabel.toLowerCase()} (0–${meta.max} kg)`);
      return;
    }

    setLogging(true);
    const supabase = createClient();
    const { error } = await supabase.from("body_metric_logs").insert({
      user_id: profile.id,
      metric_type: activeMetric,
      value_kg: value,
    });
    setLogging(false);

    if (error) {
      if (error.message.includes("body_metric_logs")) {
        toast.error("Body metrics not set up yet", {
          description: "Run supabase/RUN_BODY_METRICS.sql in Supabase SQL Editor.",
          duration: 8000,
        });
      } else {
        toast.error("Could not log", { description: error.message });
      }
      return;
    }

    toast.success(`${meta.label} logged`);
    setValueKg("");
    refresh();
  }

  const latestByType = Object.fromEntries(
    BODY_METRIC_TYPES.map((t) => {
      const typeLogs = logs.filter((l) => l.metric_type === t);
      const latest = typeLogs[typeLogs.length - 1];
      return [t, latest?.value_kg ?? null] as const;
    })
  ) as Record<BodyMetricType, number | null>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
        <Ruler className="mt-0.5 size-5 shrink-0 text-teal-600" />
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="height-cm" className="font-semibold">
            Height (cm)
          </Label>
          <div className="flex gap-2">
            <Input
              id="height-cm"
              type="number"
              inputMode="decimal"
              min={100}
              max={250}
              placeholder="e.g. 178"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={saveHeight}
              disabled={savingHeight}
            >
              {savingHeight ? "…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-teal-500/30 bg-teal-500/5 p-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-4 text-teal-600" />
          <p className="text-sm font-bold">Log a measurement</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {BODY_METRIC_TYPES.map((type) => {
            const meta = BODY_METRIC_META[type];
            return (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={activeMetric === type ? "default" : "outline"}
                className={cnMetricBtn(activeMetric === type)}
                onClick={() => setActiveMetric(type)}
              >
                <span className="text-base">{meta.emoji}</span>
                <span className="text-[10px] font-bold leading-tight">{meta.shortLabel}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step={BODY_METRIC_META[activeMetric].step}
            min={0}
            max={BODY_METRIC_META[activeMetric].max}
            placeholder={`${BODY_METRIC_META[activeMetric].label} (kg)`}
            value={valueKg}
            onChange={(e) => setValueKg(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            className="shrink-0 bg-teal-600 font-bold hover:bg-teal-700"
            onClick={logMetric}
            disabled={logging || loading}
          >
            {logging ? "…" : "Log"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {BODY_METRIC_TYPES.map((t) => {
            const v = latestByType[t];
            return (
              <span key={t}>
                {BODY_METRIC_META[t].emoji} Latest {BODY_METRIC_META[t].shortLabel}:{" "}
                <strong className="text-foreground">
                  {v != null ? `${v} kg` : "—"}
                </strong>
              </span>
            );
          })}
        </div>
      </div>

      {BODY_METRIC_TYPES.map((type) => {
        const meta = BODY_METRIC_META[type];
        const count = logs.filter((l) => l.metric_type === type).length;
        return (
          <CollapsibleSection
            key={type}
            title={`${meta.emoji} ${meta.label} chart`}
            subtitle={
              count > 0 ? `${count} entries` : "No data yet"
            }
            defaultOpen={type === "weight" && count > 0}
          >
            <BodyMetricChart metricType={type} logs={logs} />
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

function cnMetricBtn(active: boolean) {
  return active
    ? "h-auto flex-col gap-0.5 bg-teal-600 py-2"
    : "h-auto flex-col gap-0.5 py-2";
}
