import { NextResponse } from "next/server";
import { importMoonboardLogbook } from "@/lib/moonboard/importLogbook";
import type { MoonboardLogbookRow } from "@/lib/moonboard/logbook";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    rows?: MoonboardLogbookRow[];
    totalEntries?: number | null;
    totalProblems?: number | null;
    screenshotUrl?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rows = body.rows;
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "rows array is required" }, { status: 400 });
  }

  try {
    const result = await importMoonboardLogbook(supabase, user.id, {
      rows,
      totalEntries: body.totalEntries ?? null,
      totalProblems: body.totalProblems ?? null,
      screenshotUrl: body.screenshotUrl ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
