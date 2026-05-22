"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { cn } from "@/lib/utils";
import type { SessionCounts } from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface MemberBadgeRowProps {
  member: Profile;
  counts: SessionCounts;
  isYou?: boolean;
  defaultOpen?: boolean;
}

export function MemberBadgeRow({
  member,
  counts,
  isYou,
  defaultOpen = false,
}: MemberBadgeRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 overflow-hidden",
        isYou ? "border-orange-500/40" : "border-border/60"
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <AvatarFrame
          username={member.username}
          avatarUrl={member.avatar_url}
          lifetimeScore={member.current_pump_score}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {member.username}
            {isYou && (
              <span className="ml-1.5 text-[10px] font-semibold text-orange-400">
                (you)
              </span>
            )}
          </p>
          {member.home_crag && (
            <p className="text-[10px] text-muted-foreground">🏔 {member.home_crag}</p>
          )}
          <div className="mt-1">
            <BadgeShowcase counts={counts} max={6} size="sm" />
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border/50 px-3 pb-3">
          <BadgeGallery counts={counts} hideHeader />
        </div>
      )}
    </div>
  );
}
