import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

function friendlyStorageError(message: string): string {
  if (message.includes("Invalid Compact JWS") || message.includes("Compact JWS")) {
    return (
      "Wrong Supabase key in Vercel. SUPABASE_SERVICE_ROLE_KEY must be the " +
      "service_role key (eyJ…) or Secret key (sb_secret_…) from Supabase → Settings → API — " +
      "not the anon or publishable key. Remove quotes/spaces and redeploy."
    );
  }
  if (message.includes("invalid or incompatible")) {
    return (
      "Supabase Storage is not set up correctly. In Supabase: Storage → New bucket → name workout-photos (public). " +
      "Then run supabase/RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql in the SQL Editor."
    );
  }
  if (message.includes("Bucket not found") || message.includes("not found")) {
    return 'Storage bucket "workout-photos" is missing — create it in Supabase → Storage.';
  }
  return message;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "Photo upload is not configured on the server. Add SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const workoutId = formData.get("workoutId");

  if (!(file instanceof File) || typeof workoutId !== "string" || !workoutId) {
    return NextResponse.json({ error: "Missing file or workout id" }, { status: 400 });
  }

  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (isHeic) {
    return NextResponse.json(
      {
        error:
          "HEIC photos need converting first — use JPEG/PNG or take a screenshot.",
      },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Please choose an image file (JPEG, PNG, or WebP)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max 5MB per photo" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : "jpg";
  const path = `${user.id}/${workoutId}.${safeExt}`;

  const { error: uploadError } = await admin.storage
    .from("workout-photos")
    .upload(path, await file.arrayBuffer(), {
      upsert: true,
      contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: friendlyStorageError(uploadError.message) },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("workout-photos").getPublicUrl(path);

  return NextResponse.json({ url: `${publicUrl}?t=${Date.now()}` });
}
