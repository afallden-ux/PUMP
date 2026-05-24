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
    <section className="space-y-3 rounded-lg border border-slate-300 bg-slate-100/90 p-4">
      <div className="flex items-center gap-2 text-slate-600">
        <Sofa className="size-5" />
        <h3 className="text-lg font-semibold text-slate-800">Couch of Shame</h3>
        <Cookie className="size-4 text-amber-600" />
      </div>
      <p className="text-xs text-slate-500">
        No session in 96+ hours. Time to log something — your crew is watching.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {slackers.map((profile) => {
          const hours = hoursSinceLastLog(profile.last_logged_at);
          return (
            <motion.li
              key={profile.id}
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="rounded-lg border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() => openProfile(profile.id)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
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
                  <p className="font-semibold text-slate-800">{profile.username}</p>
                  <p className="text-xs text-slate-500">
                    {hours === null
                      ? "Never logged. Tragic."
                      : `${hours}h on the couch`}
                  </p>
                  <p className="mt-1 text-[10px] italic text-slate-400">
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
