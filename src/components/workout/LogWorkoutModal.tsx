"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Timer } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { INTENSITY_LABELS } from "@/lib/constants/intensityLabels";
import { calcPumpPoints } from "@/lib/utils/pumpPoints";
import { formatDuration } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/client";
import type { IntensityLevel } from "@/types/app";

const DURATION_STEPS = [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240] as const;

interface LogWorkoutModalProps {
  userId: string;
  onLogged?: () => void;
  trigger?: React.ReactNode;
}

export function LogWorkoutModal({ userId, onLogged, trigger }: LogWorkoutModalProps) {
  const [open, setOpen] = useState(false);
  const [durationIndex, setDurationIndex] = useState(2);
  const [intensity, setIntensity] = useState<IntensityLevel>(3);
  const [saving, setSaving] = useState(false);

  const durationMinutes = DURATION_STEPS[durationIndex] ?? 60;
  const previewPoints = calcPumpPoints(durationMinutes, intensity);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const total_points = calcPumpPoints(durationMinutes, intensity);

    const { error } = await supabase.from("workout_logs").insert({
      user_id: userId,
      duration_minutes: durationMinutes,
      intensity_level: intensity,
      total_points,
    });

    setSaving(false);

    if (error) {
      toast.error("Pump failed", { description: error.message });
      return;
    }

    toast.success("Forearms upgraded!", {
      description: `+${total_points} pump points · ${formatDuration(durationMinutes)}`,
    });
    setOpen(false);
    onLogged?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger ?? (
          <Button
            size="lg"
            className="h-14 w-full bg-gradient-to-r from-orange-600 to-amber-500 text-base font-black text-black hover:from-orange-500 hover:to-amber-400"
          >
            <Flame className="size-5" />
            LOG SESSION (3 SEC)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-orange-500/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Quick Pump Log</DialogTitle>
          <DialogDescription>
            Two sliders. Zero excuses. Your friends are watching.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 font-semibold">
                <Timer className="size-4 text-orange-400" />
                Duration
              </Label>
              <span className="font-mono text-sm font-bold text-orange-400">
                {formatDuration(durationMinutes)}
              </span>
            </div>
            <Slider
              min={0}
              max={DURATION_STEPS.length - 1}
              step={1}
              value={[durationIndex]}
              onValueChange={(v) => {
                const idx = Array.isArray(v) ? v[0] : v;
                setDurationIndex(idx ?? 0);
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2 font-semibold">
                <Flame className="size-4 text-orange-400" />
                Pump / Intensity
              </Label>
              <span className="text-right text-xs font-bold text-orange-400">
                Level {intensity}
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[intensity]}
              onValueChange={(v) => {
                const level = Array.isArray(v) ? v[0] : v;
                setIntensity((level ?? 3) as IntensityLevel);
              }}
            />
            <motion.p
              key={intensity}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[2.5rem] text-center text-xs italic text-muted-foreground"
            >
              {INTENSITY_LABELS[intensity]}
            </motion.p>
          </div>

          <p className="rounded-lg bg-orange-500/10 py-2 text-center text-sm font-bold text-orange-400">
            +{previewPoints} pump points
          </p>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-orange-600 font-black hover:bg-orange-500"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Pumping..." : "SAVE & FLEX"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
