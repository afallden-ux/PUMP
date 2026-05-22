"use client";

import { useState } from "react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { Profile } from "@/types/app";

interface ProfileClientProps {
  profile: Profile;
}

export function ProfileClient({ profile: initial }: ProfileClientProps) {
  const [profile, setProfile] = useState(initial);

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-6">
      <AvatarUpload
        profile={profile}
        onUpdated={(avatarUrl) =>
          setProfile((p) => ({ ...p, avatar_url: avatarUrl }))
        }
      />
      <ProfileForm profile={profile} />
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Lifetime pump:</strong>{" "}
          {profile.current_pump_score.toLocaleString()} pts
        </p>
        <p className="mt-1">
          Your avatar frame grows with lifetime score. Weekly rank is separate on
          the dashboard.
        </p>
      </div>
    </div>
  );
}
