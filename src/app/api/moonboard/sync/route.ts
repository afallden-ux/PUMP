import { NextResponse } from "next/server";
import { syncMoonboardLogbook } from "@/lib/moonboard/sync";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncMoonboardLogbook(supabase, user.id);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
