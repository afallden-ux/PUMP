"use client";

import { useState } from "react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { SessionCounts } from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface ProfileClientProps {
  profile: Profile;
  sessionCounts: SessionCounts;
}

export function ProfileClient({ profile: initial, sessionCounts }: ProfileClientProps) {
  const [profile, setProfile] = useState(initial);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 px-4 py-6 lg:max-w-2xl lg:px-8">
      <AvatarUpload
        profile={profile}
        onUpdated={(avatarUrl) =>
          setProfile((p) => ({ ...p, avatar_url: avatarUrl }))
        }
      />
      {profile.home_crag && (
        <p className="text-center text-sm text-muted-foreground">
          🏔 Home crag: <span className="font-semibold text-foreground">{profile.home_crag}</span>
        </p>
      )}
      <BadgeShowcase counts={sessionCounts} max={8} size="md" />
      <BadgeGallery counts={sessionCounts} />
      <ProfileForm profile={profile} />
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Lifetime pump:</strong>{" "}
          {profile.current_pump_score.toLocaleString()} pts
        </p>
        <p className="mt-1">
          Badges unlock at 10–1000 logs per track. Compare yourself to everyone on the
          board from Home.
        </p>
      </div>
    </div>
  );
}
