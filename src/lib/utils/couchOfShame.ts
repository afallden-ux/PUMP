import { SHAME_IDLE_MS } from "@/lib/constants/pumpTiers";
import type { Profile } from "@/types/app";

export function isOnCouchOfShame(profile: Pick<Profile, "last_logged_at">): boolean {
  if (!profile.last_logged_at) return true;
  const last = new Date(profile.last_logged_at).getTime();
  return Date.now() - last >= SHAME_IDLE_MS;
}

export function hoursSinceLastLog(lastLoggedAt: string | null): number | null {
  if (!lastLoggedAt) return null;
  const diff = Date.now() - new Date(lastLoggedAt).getTime();
  return Math.floor(diff / (60 * 60 * 1000));
}
