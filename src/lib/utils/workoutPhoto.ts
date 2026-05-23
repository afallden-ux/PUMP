export async function uploadWorkoutPhoto(
  userId: string,
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
