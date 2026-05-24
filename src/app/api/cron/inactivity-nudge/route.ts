import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildInactivityEmail,
  type InactivityCandidate,
  type PlatformActivityRow,
} from "@/lib/email/inactivityNudge";
import { APP_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/siteUrl";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? `${APP_NAME} <onboarding@resend.dev>`;

  if (!resendKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "RESEND_API_KEY not configured",
        hint: "Add RESEND_API_KEY and EMAIL_FROM in Vercel env",
      },
      { status: 503 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "SUPABASE_SERVICE_ROLE_KEY not configured",
      },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const loginUrl = `${getSiteUrl()}/login`;

  const [{ data: candidatesRaw, error: candError }, { data: activityRaw }] =
    await Promise.all([
      supabase.rpc("get_inactivity_nudge_candidates"),
      supabase.rpc("get_platform_activity_summary", { p_hours: 72 }),
    ]);

  if (candError) {
    return NextResponse.json(
      { ok: false, error: candError.message },
      { status: 500 }
    );
  }

  const candidates = (candidatesRaw ?? []) as unknown as InactivityCandidate[];
  const activity = (activityRaw ?? []) as unknown as PlatformActivityRow[];

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      message: "No climbers due for a 72h nudge",
    });
  }

  const resend = new Resend(resendKey);
  let sent = 0;
  const errors: string[] = [];

  for (const c of candidates) {
    if (!c.email) continue;

    const { subject, html, text } = buildInactivityEmail({
      username: c.username,
      hoursSince: c.hours_since,
      activity,
      loginUrl,
    });

    const { error: sendError } = await resend.emails.send({
      from,
      to: c.email,
      subject,
      html,
      text,
    });

    if (sendError) {
      errors.push(`${c.email}: ${sendError.message}`);
      continue;
    }

    const { error: markError } = await supabase.rpc(
      "mark_inactivity_email_sent_system",
      { p_user_id: c.user_id }
    );

    if (markError) {
      errors.push(`mark ${c.user_id}: ${markError.message}`);
    } else {
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    candidates: candidates.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}

/** Vercel Cron uses GET; allow POST for manual triggers with same auth. */
export async function POST(request: Request) {
  return GET(request);
}
