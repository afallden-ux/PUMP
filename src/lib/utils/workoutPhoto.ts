import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

function validatePhotoFile(file: File): string | null {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (isHeic) {
    return "HEIC photos need converting first — use JPEG/PNG or take a screenshot.";
  }
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file (JPEG, PNG, or WebP)";
  }
  if (file.size > MAX_BYTES) {
    return "Max 5MB per photo";
  }
  return null;
}

function storagePath(userId: string, workoutId: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : "jpg";
  return `${userId}/${workoutId}.${safeExt}`;
}

function mapStorageError(message: string): string {
  if (message.includes("Invalid Compact JWS") || message.includes("Compact JWS")) {
    return (
      "Wrong Supabase API key on the server. In Vercel, set SUPABASE_SERVICE_ROLE_KEY to the " +
      "service_role key (starts with eyJ) or a Secret key (sb_secret_…) from Supabase → Settings → API. " +
      "Do not use the anon or publishable key. No quotes, then redeploy."
    );
  }
  if (message.includes("invalid or incompatible")) {
    return (
      'Create bucket "workout-photos" (public) in Supabase → Storage, then run RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql.'
    );
  }
  if (message.includes("Bucket not found")) {
    return 'Storage bucket "workout-photos" is missing — create it in Supabase → Storage.';
  }
  return message;
}

/** Upload while logged in (uses your session — no service role key needed). */
async function uploadViaClient(
  userId: string,
  workoutId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { url: null, error: "You must be logged in to upload a photo." };
  }

  const path = storagePath(userId, workoutId, file);
  const { error: uploadError } = await supabase.storage
    .from("workout-photos")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    return { url: null, error: mapStorageError(uploadError.message) };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("workout-photos").getPublicUrl(path);

  return { url: `${publicUrl}?t=${Date.now()}`, error: null };
}

/** Server upload fallback (needs SUPABASE_SERVICE_ROLE_KEY on Vercel). */
async function uploadViaServer(
  workoutId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workoutId", workoutId);

  const res = await fetch("/api/workout-photo", {
    method: "POST",
    body: formData,
  });

  const body = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!res.ok) {
    return { url: null, error: body.error ?? "Photo upload failed" };
  }

  if (!body.url) {
    return { url: null, error: "Photo upload failed — no URL returned" };
  }

  return { url: body.url, error: null };
}

export async function uploadWorkoutPhoto(
  userId: string,
  workoutId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validatePhotoFile(file);
  if (validationError) {
    return { url: null, error: validationError };
  }

  const clientResult = await uploadViaClient(userId, workoutId, file);
  if (!clientResult.error) {
    return clientResult;
  }

  const serverResult = await uploadViaServer(workoutId, file);
  if (!serverResult.error) {
    return serverResult;
  }

  return { url: null, error: clientResult.error };
}
