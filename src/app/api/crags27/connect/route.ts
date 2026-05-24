import { NextResponse } from "next/server";
import { connectCrags27 } from "@/lib/crags27/sync";
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

  let body: { username?: string; password?: string; profileSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password;
  const profileSlug = body.profileSlug?.trim();
  if (!username || !password || !profileSlug) {
    return NextResponse.json(
      { error: "27crags login, password, and profile slug are required" },
      { status: 400 }
    );
  }

  try {
    await connectCrags27(supabase, user.id, username, password, profileSlug);
    return NextResponse.json({ ok: true, profileSlug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Connection failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
