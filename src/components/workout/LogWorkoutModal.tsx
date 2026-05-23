"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, MessageSquare, Timer } from "lucide-react";
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
import { SessionPhotoPicker } from "@/components/workout/SessionPhotoPicker";
import { INTENSITY_LABELS } from "@/lib/constants/intensityLabels";
import { FONT_GRADES, type FontGrade } from "@/lib/constants/fontGrades";
import {
  CLIMB_BONUS_META,
  SESSION_TYPE_META,
  SESSION_TYPES,
  type ClimbBonus,
  type SessionType,
} from "@/lib/constants/sessionTypes";
import { calcPumpPoints, climbBonusToFlags } from "@/lib/utils/pumpPoints";
import { formatDuration } from "@/lib/utils/dates";
import { uploadWorkoutPhoto } from "@/lib/utils/workoutPhoto";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { IntensityLevel } from "@/types/app";

const DURATION_STEPS = [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240] as const;

interface LogWorkoutModalProps {
  userId: string;
  onLogged?: () => void;
  trigger?: React.ReactNode;
}

export function LogWorkoutModal({ userId, onLogged, trigger }: LogWorkoutModalProps) {
  const [open, setOpen] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("climbing");
  const [durationIndex, setDurationIndex] = useState(2);
  const [intensity, setIntensity] = useState<IntensityLevel>(3);
  const [climbBonus, setClimbBonus] = useState<ClimbBonus>("none");
  const [hardestGrade, setHardestGrade] = useState<FontGrade | "">("");
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const durationMinutes = DURATION_STEPS[durationIndex] ?? 60;
  const previewPoints = calcPumpPoints({
    durationMinutes,
    intensityLevel: intensity,
    sessionType,
    climbBonus: sessionType === "climbing" ? climbBonus : "none",
    hardestGrade: sessionType === "climbing" ? hardestGrade || null : null,
  });

  function resetForm() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSessionType("climbing");
    setDurationIndex(2);
    setIntensity(3);
    setClimbBonus("none");
    setHardestGrade("");
    setNotes("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const total_points = previewPoints;
    const workoutId = crypto.randomUUID();
    const flags = climbBonusToFlags(
      sessionType === "climbing" ? climbBonus : "none"
    );

    const trimmedNote = notes.trim();
    let photoUrl: string | null = null;

    if (photoFile) {
      const { url, error: photoError } = await uploadWorkoutPhoto(
        userId,
        workoutId,
        photoFile
      );
      if (photoError) {
        setSaving(false);
        toast.error("Photo upload failed", { description: photoError });
        return;
      }
      photoUrl = url;
    }

    const baseRow = {
      id: workoutId,
      user_id: userId,
      session_type: sessionType,
      duration_minutes: durationMinutes,
      intensity_level: intensity,
      total_points,
      photo_url: photoUrl,
      is_moonboard: flags.is_moonboard,
      is_outdoors: flags.is_outdoors,
      hardest_grade: sessionType === "climbing" ? hardestGrade || null : null,
    };

    let { error } = await supabase.from("workout_logs").insert({
      ...baseRow,
      ...(trimmedNote ? { notes: trimmedNote } : {}),
    });

    if (
      error &&
      (error.message.includes("notes") || error.message.includes("photo_url"))
    ) {
      const retry = await supabase.from("workout_logs").insert(baseRow);
      error = retry.error;
    }

    if (error) {
      setSaving(false);
      toast.error("Pump failed", { description: error.message });
      return;
    }

    if (photoUrl) {
      const { error: photoUpdateError } = await supabase
        .from("workout_logs")
        .update({ photo_url: photoUrl })
        .eq("id", workoutId)
        .eq("user_id", userId);

      if (photoUpdateError) {
        toast.error("Session saved — photo won't show on feed yet", {
          description:
            "Run supabase/RUN_WORKOUT_PHOTO_AND_NOTES_FIX.sql in Supabase SQL Editor, then log again with a photo.",
          duration: 8000,
        });
      }
    }

    if (trimmedNote) {
      const { error: notesUpdateError } = await supabase
        .from("workout_logs")
        .update({ notes: trimmedNote })
        .eq("id", workoutId)
        .eq("user_id", userId);

      if (notesUpdateError) {
        const { error: commentError } = await supabase
          .from("session_comments")
          .insert({
            workout_log_id: workoutId,
            user_id: userId,
            body: trimmedNote,
          });
        if (commentError) {
          toast.error("Note could not be saved", {
            description: commentError.message,
          });
        }
      }
    }

    setSaving(false);
    const sign = previewPoints >= 0 ? "+" : "";
    toast.success(
      previewPoints >= 0 ? "Forearms upgraded!" : "Shame tax applied",
      { description: `${sign}${previewPoints} pts · ${formatDuration(durationMinutes)}` }
    );
    handleOpenChange(false);
    onLogged?.();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {trigger ?? (
          <Button
            size="lg"
            className="h-14 w-full bg-gradient-to-r from-orange-600 to-amber-500 text-base font-black text-black hover:from-orange-500 hover:to-amber-400"
          >
            <Flame className="size-5" />
            LOG SESSION
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "z-[60] flex max-h-[min(90dvh,100%)] w-full max-w-none flex-col gap-0 overflow-hidden border-orange-500/30 p-0",
          "inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none",
          "sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
        )}
      >
        <DialogHeader className="shrink-0 border-b border-orange-500/20 bg-orange-500/5 px-4 pb-3 pt-4">
          <DialogTitle className="text-xl font-black">Log session</DialogTitle>
          <DialogDescription>
            Add a note and photo for the feed — then pick type and intensity.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="space-y-2 rounded-xl border-2 border-orange-500/40 bg-orange-500/10 p-3">
            <Label
              htmlFor="session-note"
              className="flex items-center gap-2 text-base font-black text-orange-300"
            >
              <MessageSquare className="size-5" />
              Session note
              <span className="text-sm font-normal text-muted-foreground">
                (shows on Feed)
              </span>
            </Label>
            <textarea
              id="session-note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you crush? Project, board, outdoor send…"
              maxLength={280}
              rows={4}
              className="flex w-full resize-none rounded-lg border border-orange-500/40 bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-orange-500/50"
            />
            <p className="text-[10px] text-muted-foreground">
              {notes.length}/280 · visible on your feed post
            </p>
          </div>

          <SessionPhotoPicker
            file={photoFile}
            previewUrl={photoPreview}
            onFileChange={(file, preview) => {
              setPhotoFile(file);
              setPhotoPreview(preview);
            }}
          />

          <div className="space-y-2">
            <Label className="font-semibold">Session type</Label>
            <div className="grid grid-cols-2 gap-2">
              {SESSION_TYPES.map((type) => {
                const meta = SESSION_TYPE_META[type];
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={sessionType === type ? "default" : "outline"}
                    className={cn(
                      "h-auto flex-col gap-0.5 py-2.5 text-left",
                      sessionType === type && type === "stretching" && "bg-zinc-600",
                      sessionType === type && type !== "stretching" && "bg-orange-600"
                    )}
                    onClick={() => setSessionType(type)}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    <span className="text-xs font-bold">{meta.label}</span>
                  </Button>
                );
              })}
            </div>
            <p className="text-center text-[10px] italic text-muted-foreground">
              {SESSION_TYPE_META[sessionType].description}
            </p>
          </div>

          {sessionType === "climbing" && (
            <>
              <div className="space-y-2">
                <Label className="font-semibold">Climbing bonus</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(CLIMB_BONUS_META) as ClimbBonus[]).map((bonus) => (
                    <Button
                      key={bonus}
                      type="button"
                      size="sm"
                      variant={climbBonus === bonus ? "default" : "outline"}
                      className={cn(
                        "text-[10px] font-bold",
                        climbBonus === bonus && bonus === "board" && "bg-indigo-600",
                        climbBonus === bonus && bonus === "outdoors" && "bg-emerald-600",
                        climbBonus === bonus && bonus === "none" && "bg-orange-600"
                      )}
                      onClick={() => setClimbBonus(bonus)}
                    >
                      {CLIMB_BONUS_META[bonus].label}
                      {bonus !== "none" && (
                        <span className="block opacity-80">
                          +{CLIMB_BONUS_META[bonus].points}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade" className="font-semibold">
                  Hardest send (Font)
                </Label>
                <select
                  id="grade"
                  value={hardestGrade}
                  onChange={(e) => setHardestGrade(e.target.value as FontGrade | "")}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">No send logged</option>
                  {FONT_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

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
                {sessionType === "stretching" ? "Laziness level" : "Pump / Intensity"}
              </Label>
              <span className="text-xs font-bold text-orange-400">Level {intensity}</span>
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
              key={`${sessionType}-${intensity}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[2rem] text-center text-xs italic text-muted-foreground"
            >
              {INTENSITY_LABELS[intensity]}
            </motion.p>
          </div>

          <p
            className={cn(
              "rounded-lg py-2 text-center text-sm font-bold",
              previewPoints >= 0
                ? "bg-orange-500/10 text-orange-400"
                : "bg-zinc-500/20 text-zinc-400"
            )}
          >
            {previewPoints >= 0 ? "+" : ""}
            {previewPoints} pump points total
          </p>
        </div>

        <DialogFooter className="!-mx-0 !-mb-0 shrink-0 rounded-none border-t border-orange-500/20 bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-xl">
          <Button
            className="h-12 w-full bg-orange-600 text-base font-black hover:bg-orange-500"
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
