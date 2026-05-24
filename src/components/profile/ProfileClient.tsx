"use client";

import { useState } from "react";
import { Award, User } from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import { BodyMetricsPanel } from "@/components/profile/BodyMetricsPanel";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppCard } from "@/components/ui/AppCard";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { APP_SHORT } from "@/lib/brand";
import type { SessionCounts } from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface ProfileClientProps {
  profile: Profile;
  sessionCounts: SessionCounts;
}

export function ProfileClient({ profile: initial, sessionCounts }: ProfileClientProps) {
  const [profile, setProfile] = useState(initial);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader
        eyebrow="Account"
        title={profile.username}
        subtitle={profile.title || "Your profile, metrics, and badges"}
      />
      <AppCard className="p-5">
      <AvatarUpload
        profile={profile}
        onUpdated={(avatarUrl) =>
          setProfile((p) => ({ ...p, avatar_url: avatarUrl }))
        }
      />
      {profile.home_crag && (
        <p className="mt-3 text-center text-sm text-slate-500">
          🏔 Home crag: <span className="font-semibold text-slate-800">{profile.home_crag}</span>
        </p>
      )}
      </AppCard>
      <CollapsibleSection
        title="Body & strength"
        subtitle="Height, weight, hang, pull-up — with charts"
        icon={User}
        defaultOpen
      >
        <BodyMetricsPanel
          profile={profile}
          onHeightSaved={(height_cm) => setProfile((p) => ({ ...p, height_cm }))}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="CC badges"
        subtitle="Earned milestones per session type"
        icon={Award}
        defaultOpen={false}
      >
        <BadgeShowcase counts={sessionCounts} max={8} size="md" />
        <div className="mt-4">
          <BadgeGallery counts={sessionCounts} hideHeader />
        </div>
      </CollapsibleSection>

      <AppCard className="p-5">
        <ProfileForm profile={profile} />
      </AppCard>
      <AppCard className="p-4 text-sm text-slate-600">
        <p>
          <strong className="text-slate-800">Lifetime {APP_SHORT} score:</strong>{" "}
          {profile.current_pump_score.toLocaleString()} pts
        </p>
        <p className="mt-1">
          Badges unlock at 10–1000 logs per track. Compare yourself on Home and Analytics.
        </p>
      </AppCard>
      <DeleteAccountSection />
    </div>
  );
}
