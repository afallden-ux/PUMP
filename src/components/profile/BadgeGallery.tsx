"use client";

import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getAllTrackProgress,
  type SessionCounts,
} from "@/lib/data/sessionBadges";
import { cn } from "@/lib/utils";

interface BadgeGalleryProps {
  counts: SessionCounts;
  hideHeader?: boolean;
}

export function BadgeGallery({ counts, hideHeader }: BadgeGalleryProps) {
  const tracks = getAllTrackProgress(counts);
  const totalEarned = tracks.reduce((n, t) => n + t.earned.length, 0);

  return (
    <section className="space-y-4">
      {!hideHeader && (
        <SectionHeader
          icon={Award}
          title="CC badges"
          subtitle={`${totalEarned} earned. Stretching badges get more shameful; outdoors goes Jug-Hugger → 9A Downgrader. Milestones: 10 · 25 · 50 · 100 · 500 · 1000.`}
        />
      )}

      <div className="space-y-4">
        {tracks.map((progress) => (
          <Card key={progress.track.id} className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base font-black">
                  <span className="text-xl">{progress.track.emoji}</span>
                  {progress.track.label}
                </CardTitle>
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {progress.count} logs
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{progress.track.description}</p>
              {progress.next && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>
                      Next: {progress.next.emoji} {progress.next.name} @ {progress.next.threshold}
                    </span>
                    <span>{Math.round(progress.progressToNext * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all"
                      style={{ width: `${progress.progressToNext * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {!progress.next && progress.highest && (
                <p className="text-[10px] font-bold text-teal-600 pt-1">
                  Max rank: {progress.highest.tier.emoji} {progress.highest.tier.name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {progress.track.tiers.map((tier) => {
                  const unlocked = progress.count >= tier.threshold;
                  return (
                    <li
                      key={tier.id}
                      className={cn(
                        "rounded-xl border p-2.5 text-center transition-colors",
                        unlocked
                          ? "border-teal-500/40 bg-teal-500/10 shadow-sm"
                          : "border-border/50 bg-muted/20 opacity-55"
                      )}
                    >
                      <span className="text-2xl">{tier.emoji}</span>
                      <p
                        className={cn(
                          "mt-1 text-xs font-black leading-tight",
                          unlocked ? "text-teal-600" : "text-muted-foreground"
                        )}
                      >
                        {tier.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{tier.threshold}+</p>
                      {unlocked && (
                        <p className="mt-0.5 text-[9px] italic text-muted-foreground/80 line-clamp-2">
                          {tier.tagline}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
