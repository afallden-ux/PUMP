"use client";

import { motion } from "framer-motion";
import { Cookie, Sofa } from "lucide-react";
import { AvatarFrame } from "@/components/avatar/AvatarFrame";
import { useClimberProfile } from "@/components/profile/ClimberProfileContext";
import { hoursSinceLastLog } from "@/lib/utils/couchOfShame";
import type { Profile } from "@/types/app";

interface CouchOfShameProps {
  slackers: Profile[];
}

export function CouchOfShame({ slackers }: CouchOfShameProps) {
  const { openProfile } = useClimberProfile();
  if (slackers.length === 0) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <Sofa className="size-5" />
        <h3 className="text-lg font-black text-zinc-300">Couch of Shame</h3>
        <Cookie className="size-4 text-amber-600" />
      </div>
      <p className="text-xs text-muted-foreground">
        No session in 96+ hours. The plastic is judging you.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {slackers.map((profile) => {
          const hours = hoursSinceLastLog(profile.last_logged_at);
          return (
            <motion.li
              key={profile.id}
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="rounded-xl border border-zinc-700 bg-zinc-950/60"
            >
              <button
                type="button"
                onClick={() => openProfile(profile.id)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                aria-label={`View ${profile.username}'s profile`}
              >
                <AvatarFrame
                  username={profile.username}
                  avatarUrl={profile.avatar_url}
                  lifetimeScore={profile.current_pump_score}
                  size="md"
                  shameMode
                  plain
                />
                <div>
                  <p className="font-bold text-zinc-300">{profile.username}</p>
                  <p className="text-xs text-zinc-500">
                    {hours === null
                      ? "Never logged. Tragic."
                      : `${hours}h on the couch`}
                  </p>
                  <p className="mt-1 text-[10px] italic text-amber-700/80">
                    *munching imaginary chips*
                  </p>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
