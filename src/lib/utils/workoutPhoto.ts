import { createClient } from "@/lib/supabase/client";

export async function uploadWorkoutPhoto(
  userId: string,
  workoutId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Please choose an image file" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: "Max 5MB per flex pic" };
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${userId}/${workoutId}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from("workout-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("workout-photos").getPublicUrl(path);

  return { url: `${publicUrl}?t=${Date.now()}`, error: null };
}
