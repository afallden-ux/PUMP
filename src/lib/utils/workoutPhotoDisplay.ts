import { createClient } from "@/lib/supabase/client";

const BUCKET = "workout-photos";

/** Extract storage object path from a public URL or raw path. */
export function workoutPhotoStoragePath(
  photoUrl: string,
  userId?: string,
  workoutLogId?: string
): string | null {
  const trimmed = photoUrl.trim();
  if (!trimmed) return null;

  if (!trimmed.includes("://")) {
    return trimmed.replace(new RegExp(`^${BUCKET}/`), "");
  }

  try {
    const u = new URL(trimmed);
    const marker = `/object/public/${BUCKET}/`;
    const publicIdx = u.pathname.indexOf(marker);
    if (publicIdx >= 0) {
      return decodeURIComponent(u.pathname.slice(publicIdx + marker.length));
    }
    const signMarker = `/object/sign/${BUCKET}/`;
    const signIdx = u.pathname.indexOf(signMarker);
    if (signIdx >= 0) {
      return decodeURIComponent(u.pathname.slice(signIdx + signMarker.length));
    }
  } catch {
    /* fall through */
  }

  if (userId && workoutLogId) {
    return `${userId}/${workoutLogId}.jpg`;
  }

  return null;
}

export function publicWorkoutPhotoUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function resolveWorkoutPhotoSrc(
  photoUrl: string | null | undefined,
  userId?: string,
  workoutLogId?: string
): Promise<string | null> {
  if (!photoUrl?.trim()) return null;

  const path = workoutPhotoStoragePath(photoUrl, userId, workoutLogId);
  const supabase = createClient();

  if (path) {
    const { data: signed, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return publicWorkoutPhotoUrl(path);
  }

  return photoUrl.trim();
}
