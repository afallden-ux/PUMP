"use client";

import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import type { CompareSnapshot } from "@/lib/compare/types";
import { cn } from "@/lib/utils";

interface CompareProfileHeaderProps {
  snapshot: CompareSnapshot;
  side: "left" | "right";
  isYou?: boolean;
}

export function CompareProfileHeader({
  snapshot,
  side,
  isYou,
}: CompareProfileHeaderProps) {
  const { profile } = snapshot;
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm",
        side === "left" && "ring-2 ring-teal-500/30"
      )}
    >
      <AvatarFrame
        username={profile.username}
        avatarUrl={profile.avatar_url}
        lifetimeScore={profile.current_pump_score}
        size="md"
        plain
      />
      <p className="mt-2 text-base font-semibold text-slate-800">
        {profile.username}
        {isYou && (
          <span className="ml-1.5 text-xs font-medium text-teal-600">(you)</span>
        )}
      </p>
      <p className="text-xs text-slate-500">{profile.title}</p>
      {profile.home_crag && (
        <p className="mt-1 text-[11px] text-slate-400">🏔 {profile.home_crag}</p>
      )}
    </div>
  );
}
