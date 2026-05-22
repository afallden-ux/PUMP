"use client";

import { Users } from "lucide-react";
import { CrewBadgeGallery } from "@/components/crew/CrewBadgeGallery";
import { MemberBadgeRow } from "@/components/profile/MemberBadgeRow";
import {
  combineSessionCounts,
  type SessionCountsMap,
} from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface CrewBadgesBoardProps {
  members: Profile[];
  countsMap: SessionCountsMap;
  crewName: string;
  currentUserId: string;
}

const EMPTY = {
  hangboard: 0,
  climbing: 0,
  board: 0,
  outdoors: 0,
  gym: 0,
  stretching: 0,
  total: 0,
};

export function CrewBadgesBoard({
  members,
  countsMap,
  crewName,
  currentUserId,
}: CrewBadgesBoardProps) {
  const combined = combineSessionCounts(
    members.map((m) => countsMap[m.id] ?? EMPTY)
  );

  const sorted = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <section className="space-y-6">
      <CrewBadgeGallery combinedCounts={combined} crewName={crewName} />

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Users className="size-4" />
          Individual badges
        </h3>
        <p className="text-xs text-muted-foreground">
          Tap a member to see their personal badge wall.
        </p>
        <ul className="space-y-2">
          {sorted.map((member) => (
            <li key={member.id}>
              <MemberBadgeRow
                member={member}
                counts={countsMap[member.id] ?? EMPTY}
                isYou={member.id === currentUserId}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
