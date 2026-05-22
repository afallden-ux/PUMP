"use client";

import { Users } from "lucide-react";
import { MemberBadgeRow } from "@/components/profile/MemberBadgeRow";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  combineSessionCounts,
  type SessionCountsMap,
} from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface CrewBadgesBoardProps {
  members: Profile[];
  countsMap: SessionCountsMap;
  currentUserId: string;
}

export function CrewBadgesBoard({
  members,
  countsMap,
  currentUserId,
}: CrewBadgesBoardProps) {
  const combined = combineSessionCounts(
    members.map(
      (m) =>
        countsMap[m.id] ?? {
          hangboard: 0,
          climbing: 0,
          board: 0,
          outdoors: 0,
          gym: 0,
          stretching: 0,
          total: 0,
        }
    )
  );

  const sorted = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-orange-500/35 bg-gradient-to-b from-orange-500/15 to-transparent p-4 space-y-3">
        <SectionHeader
          icon={Users}
          title="Crew combined badges"
          subtitle="All squad logs added together — same milestones, collective grind."
        />
        <BadgeShowcase counts={combined} max={8} size="md" />
        <BadgeGallery counts={combined} hideHeader />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Each climber
        </h3>
        <p className="text-xs text-muted-foreground">
          Tap a member to expand their full badge wall.
        </p>
        <ul className="space-y-2">
          {sorted.map((member) => (
            <li key={member.id}>
              <MemberBadgeRow
                member={member}
                counts={countsMap[member.id]!}
                isYou={member.id === currentUserId}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
