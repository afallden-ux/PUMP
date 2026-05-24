import { NextResponse } from "next/server";
import { importEightaCsv } from "@/lib/eighta/sync";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { profileSlug?: string; csv?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const profileSlug = body.profileSlug?.trim();
  const csv = body.csv;
  if (!profileSlug || !csv) {
    return NextResponse.json(
      { error: "Profile slug and CSV content are required" },
      { status: 400 }
    );
  }

  try {
    const result = await importEightaCsv(supabase, user.id, profileSlug, csv);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
