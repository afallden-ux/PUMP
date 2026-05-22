"use client";

import { getShowcaseBadges, type SessionCounts } from "@/lib/data/sessionBadges";

interface BadgeShowcaseProps {
  counts: SessionCounts;
  max?: number;
  size?: "sm" | "md";
}

export function BadgeShowcase({ counts, max = 5, size = "sm" }: BadgeShowcaseProps) {
  const badges = getShowcaseBadges(counts, max);
  if (badges.length === 0) return null;

  const emojiSize = size === "md" ? "text-xl" : "text-base";

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {badges.map(({ track, tier }) => (
        <span
          key={tier.id}
          title={`${track.label}: ${tier.name} (${tier.threshold}+) — ${tier.tagline}`}
          className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1"
        >
          <span className={emojiSize}>{tier.emoji}</span>
        </span>
      ))}
    </div>
  );
}
