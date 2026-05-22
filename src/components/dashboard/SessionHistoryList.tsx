"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { INTENSITY_SHORT } from "@/lib/constants/intensityLabels";
import { SESSION_TYPE_META } from "@/lib/constants/sessionTypes";
import { formatDuration, formatRelativeTime } from "@/lib/utils/dates";
import type { IntensityLevel, WorkoutLog } from "@/types/app";

interface SessionHistoryListProps {
  logs: WorkoutLog[];
  loading?: boolean;
}

export function SessionHistoryList({ logs, loading }: SessionHistoryListProps) {
  if (loading) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        Loading sessions...
      </p>
    );
  }

  if (logs.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Recent flex logs
      </h3>
      <ul className="space-y-2">
        {logs.slice(0, 8).map((log) => (
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
              <p
                className={`text-sm font-bold ${log.total_points >= 0 ? "text-orange-400" : "text-zinc-400"}`}
              >
                {log.total_points >= 0 ? "+" : ""}
                {log.total_points} pts · {formatDuration(log.duration_minutes)}
              </p>
              <p className="text-xs text-muted-foreground">
                {SESSION_TYPE_META[log.session_type]?.label ?? log.session_type} · L
                {log.intensity_level}{" "}
                {INTENSITY_SHORT[log.intensity_level as IntensityLevel]}
                {log.hardest_grade ? ` · ${log.hardest_grade}` : ""}
                {log.is_moonboard ? " · Board" : ""}
                {log.is_outdoors ? " · Outdoors" : ""} ·{" "}
                {formatRelativeTime(log.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
