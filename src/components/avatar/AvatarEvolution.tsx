"use client";

import { motion } from "framer-motion";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { BadgeShowcase } from "@/components/profile/BadgeShowcase";
import type { SessionCounts } from "@/lib/data/sessionBadges";
import type { Profile } from "@/types/app";

interface AvatarEvolutionProps {
  profile: Profile;
  sessionCounts?: SessionCounts;
}

export function AvatarEvolution({ profile, sessionCounts }: AvatarEvolutionProps) {
  return (
    <motion.section
      className="flex flex-col items-center gap-3 rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
        Lifetime CC
      </p>
      <AvatarFrame
        username={profile.username}
        avatarUrl={profile.avatar_url}
        lifetimeScore={profile.current_pump_score}
        size="lg"
      />
      <div className="mt-4 text-center">
        <h2 className="text-xl font-black text-foreground">{profile.username}</h2>
        <p className="text-sm text-muted-foreground">{profile.title}</p>
        <motion.p
          key={profile.current_pump_score}
          initial={{ scale: 1.3, color: "#fb923c" }}
          animate={{ scale: 1, color: "inherit" }}
          className="mt-2 text-3xl font-black tabular-nums text-orange-400"
        >
          {profile.current_pump_score.toLocaleString()}
          <span className="ml-1 text-sm font-semibold text-muted-foreground">
            pts
          </span>
        </motion.p>
        {sessionCounts && (
          <div className="mt-3 w-full">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Badges
            </p>
            <BadgeShowcase counts={sessionCounts} max={5} />
          </div>
        )}
      </div>
    </motion.section>
  );
}
