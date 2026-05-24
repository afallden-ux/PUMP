import { NextResponse } from "next/server";
import { getCrags27Summary } from "@/lib/crags27/sync";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getCrags27Summary(supabase, user.id);
  return NextResponse.json(summary);
}
