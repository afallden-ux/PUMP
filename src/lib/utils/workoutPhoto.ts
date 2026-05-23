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

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const looksLikeImage =
    file.type.startsWith("image/") || ALLOWED_EXT.includes(ext);

  if (!looksLikeImage) {
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

/** Phones often send empty type or image/jpg — bucket only allows specific MIMEs. */
function normalizedContentType(file: File): string {
  const type = (file.type || "").toLowerCase().trim();
  if (type === "image/jpg" || type === "image/pjpeg") return "image/jpeg";
  if (type.startsWith("image/")) return type;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

function mapStorageError(message: string, statusCode?: string): string {
  const lower = message.toLowerCase();

  if (message.includes("Invalid Compact JWS") || message.includes("Compact JWS")) {
    return (
      "Wrong Supabase API key on the server. In Vercel, set SUPABASE_SERVICE_ROLE_KEY to the " +
      "service_role key (starts with eyJ) or Secret key (sb_secret_…) from Supabase → Settings → API. " +
      "Do not use the anon key. Redeploy after saving."
    );
  }

  if (
    lower.includes("row-level security") ||
    lower.includes("policy") ||
    statusCode === "403"
  ) {
    return (
      "Storage permission denied. In Supabase SQL Editor, run supabase/RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql " +
      "(upload policies). Make sure you are logged in on the same project as the bucket."
    );
  }

  if (
    lower.includes("mime") ||
    lower.includes("not supported") ||
    statusCode === "415"
  ) {
    return (
      "Image type not allowed on the bucket. In Supabase SQL Editor, run " +
      "supabase/RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql (adds image/jpeg, png, webp, gif, jpg)."
    );
  }

  if (message.includes("invalid or incompatible") || lower.includes("schema")) {
    return (
      "Supabase Storage database is out of date (not a missing bucket). " +
      "In Supabase → Table Editor → schema storage → table objects: check that a level column exists. " +
      "If it is missing, open a Supabase support ticket or run Storage migrations. " +
      "Also run RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql and confirm Vercel NEXT_PUBLIC_SUPABASE_URL matches this project."
    );
  }

  if (message.includes("Bucket not found")) {
    return 'Storage bucket "workout-photos" is missing in this Supabase project — create it under Storage.';
  }

  return message;
}

function formatUploadError(
  err: { message: string; statusCode?: string | number }
): string {
  const status =
    err.statusCode != null ? String(err.statusCode) : undefined;
  const mapped = mapStorageError(err.message, status);
  if (mapped !== err.message) return mapped;
  return status ? `${err.message} (${status})` : err.message;
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
  const contentType = normalizedContentType(file);
  const { error: uploadError } = await supabase.storage
    .from("workout-photos")
    .upload(path, file, {
      upsert: true,
      contentType,
    });

  if (uploadError) {
    return {
      url: null,
      error: formatUploadError({
        message: uploadError.message,
        statusCode: (uploadError as { statusCode?: string }).statusCode,
      }),
    };
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
    return { url: null, error: body.error ?? `Photo upload failed (${res.status})` };
  }

  if (!body.url) {
    return { url: null, error: "Photo upload failed — no URL returned" };
  }

  return { url: body.url, error: null };
}

function pickBestError(clientError: string, serverError: string): string {
  if (
    clientError.includes("out of date") ||
    clientError.includes("schema storage")
  ) {
    return clientError;
  }
  if (
    serverError.includes("not configured") ||
    serverError.includes("service_role") ||
    serverError.includes("Wrong Supabase")
  ) {
    return serverError;
  }
  if (clientError === serverError) return clientError;
  return `${clientError} (Server fallback: ${serverError})`;
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

  return {
    url: null,
    error: pickBestError(clientResult.error, serverResult.error),
  };
}
