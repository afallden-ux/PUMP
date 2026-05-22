"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { SESSION_TYPE_META } from "@/lib/constants/sessionTypes";
import { formatDuration, formatRelativeTime } from "@/lib/utils/dates";
import { createClient } from "@/lib/supabase/client";
import type { IntensityLevel, WorkoutLog } from "@/types/app";

interface SessionHistoryListProps {
  logs: WorkoutLog[];
  userId: string;
  loading?: boolean;
  onDeleted?: () => void;
}

export function SessionHistoryList({
  logs,
  userId,
  loading,
  onDeleted,
}: SessionHistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(log: WorkoutLog) {
    if (
      !confirm(
        `Delete this ${SESSION_TYPE_META[log.session_type]?.label ?? "session"}? Your pump score will be adjusted.`
      )
    ) {
      return;
    }
    setDeletingId(log.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("workout_logs")
      .delete()
      .eq("id", log.id)
      .eq("user_id", userId);

    setDeletingId(null);
    if (error) {
      toast.error("Could not delete session", { description: error.message });
      return;
    }
    toast.success("Session deleted");
    onDeleted?.();
  }

  if (loading) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Loading sessions...
      </p>
    );
  }

  if (logs.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Your sessions
        </h3>
        <p className="text-xs text-muted-foreground">
          Swipe mistakes off the record — tap delete to remove a log.
        </p>
      </div>
      <ul className="space-y-2">
        {logs.slice(0, 12).map((log) => {
          const meta = SESSION_TYPE_META[log.session_type];
          return (
            <li
              key={log.id}
              className="flex gap-3 rounded-xl border border-border/60 bg-card/50 p-2"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {log.photo_url ? (
                  <Image
                    src={log.photo_url}
                    alt="Session"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-6 opacity-40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${meta.badgeClass}`}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                  <p
                    className={`text-sm font-bold ${log.total_points >= 0 ? "text-orange-400" : "text-zinc-400"}`}
                  >
                    {log.total_points >= 0 ? "+" : ""}
                    {log.total_points} pts
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDuration(log.duration_minutes)} · L{log.intensity_level}{" "}
                  {INTENSITY_SHORT[log.intensity_level as IntensityLevel]}
                  {log.hardest_grade ? ` · ${log.hardest_grade}` : ""}
                  {log.is_moonboard ? " · Board" : ""}
                  {log.is_outdoors ? " · Outdoors" : ""} ·{" "}
                  {formatRelativeTime(log.created_at)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-destructive hover:bg-destructive/10"
                disabled={deletingId === log.id}
                onClick={() => handleDelete(log)}
                aria-label="Delete session"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
