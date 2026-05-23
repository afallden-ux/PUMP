export interface InactivityCandidate {
  user_id: string;
  email: string;
  username: string;
  last_logged_at: string;
  hours_since: number;
}

export interface PlatformActivityRow {
  username: string;
  sessions: number;
  points: number;
  last_note: string | null;
}

export function buildInactivityEmail(params: {
  username: string;
  hoursSince: number;
  activity: PlatformActivityRow[];
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const { username, hoursSince, activity, loginUrl } = params;
  const days = Math.floor(hoursSince / 24);
  const timeLabel =
    days >= 2 ? `${days} days` : `${hoursSince} hours`;

  const activityHtml =
    activity.length === 0
      ? `<p style="color:#a3a3a3;margin:0;">The board is quiet — be the first to break the silence.</p>`
      : `<ul style="margin:0;padding-left:20px;color:#e5e5e5;">
${activity
  .map(
    (a) =>
      `<li style="margin-bottom:8px;"><strong style="color:#fb923c;">${escapeHtml(a.username)}</strong> — ${a.sessions} session${a.sessions === 1 ? "" : "s"}, <span style="color:#fbbf24;">+${a.points} pts</span>${a.last_note ? `<br/><span style="color:#a3a3a3;font-size:13px;">"${escapeHtml(truncate(a.last_note, 80))}"</span>` : ""}</li>`
  )
  .join("\n")}
</ul>`;

  const activityText =
    activity.length === 0
      ? "Nobody else logged either (yet)."
      : activity
          .map(
            (a) =>
              `- ${a.username}: ${a.sessions} session(s), +${a.points} pts${a.last_note ? ` — "${truncate(a.last_note, 80)}"` : ""}`
          )
          .join("\n");

  const subject = `Still a climber, ${username}? It's been ${timeLabel}…`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#fafafa;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.1em;color:#fb923c;">PUMP</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#fafafa;">Are you still a climber?</h1>
    <p style="margin:0 0 20px;line-height:1.5;color:#d4d4d4;">
      Hey <strong style="color:#fb923c;">${escapeHtml(username)}</strong> — your last session on PUMP was
      <strong>${timeLabel} ago</strong>. The forearms don't grow on the couch (unfortunately).
    </p>
    <div style="margin:0 0 24px;padding:16px;border-radius:12px;border:1px solid #ea580c33;background:#ea580c14;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#fb923c;">While you were away — real climbers logged:</p>
      ${activityHtml}
    </div>
    <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;border-radius:10px;background:linear-gradient(90deg,#ea580c,#f59e0b);color:#0a0a0a;font-weight:800;text-decoration:none;font-size:15px;">Log in &amp; send a session</a>
    <p style="margin:24px 0 0;font-size:12px;color:#737373;">One tap. Three seconds. Your squad is watching the feed.</p>
  </div>
</body>
</html>`;

  const text = `Still a climber, ${username}?

It's been ${timeLabel} since your last PUMP session.

While you were away, real climbers logged:
${activityText}

Log in and send a session: ${loginUrl}

— PUMP`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
