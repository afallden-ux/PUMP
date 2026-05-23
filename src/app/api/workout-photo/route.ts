import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

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

function friendlyStorageError(message: string): string {
  const lower = message.toLowerCase();
  if (message.includes("Invalid Compact JWS") || message.includes("Compact JWS")) {
    return (
      "Wrong Supabase key in Vercel. SUPABASE_SERVICE_ROLE_KEY must be the " +
      "service_role key (eyJ…) or Secret key (sb_secret_…) from Supabase → Settings → API — " +
      "not the anon or publishable key. Remove quotes/spaces and redeploy."
    );
  }
  if (lower.includes("row-level security") || lower.includes("policy")) {
    return (
      "Storage permission denied — run supabase/RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql in the SQL Editor."
    );
  }
  if (lower.includes("mime") || lower.includes("not supported")) {
    return (
      "Image type not allowed — run RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql to refresh bucket MIME types."
    );
  }
  if (message.includes("invalid or incompatible") || lower.includes("schema")) {
    return (
      "Supabase Storage DB schema is out of date (your bucket can still exist). " +
      "Check storage.objects has a level column in Table Editor, run RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql, " +
      "and ensure Vercel env URLs match this Supabase project."
    );
  }
  if (message.includes("Bucket not found")) {
    return 'Storage bucket "workout-photos" is missing in this Supabase project.';
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
      contentType: normalizedContentType(file),
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
