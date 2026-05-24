import { NextResponse } from "next/server";
import { connectMoonboard } from "@/lib/moonboard/sync";
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

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password;
  if (!username || !password) {
    return NextResponse.json(
      { error: "MoonBoard username and password are required" },
      { status: 400 }
    );
  }

  try {
    await connectMoonboard(supabase, user.id, username, password);
    return NextResponse.json({ ok: true, username });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Connection failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
