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
          "Screenshot upload is not configured (SUPABASE_SERVICE_ROLE_KEY missing). You can still enter counts manually.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Please choose an image file (JPEG, PNG, or WebP)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max 5MB per image" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : "jpg";
  const path = `${user.id}/moonboard-logbook.${safeExt}`;

  const { error: uploadError } = await admin.storage
    .from("workout-photos")
    .upload(path, await file.arrayBuffer(), {
      upsert: true,
      contentType: normalizedContentType(file),
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("workout-photos").getPublicUrl(path);

  return NextResponse.json({ url: `${publicUrl}?t=${Date.now()}` });
}
