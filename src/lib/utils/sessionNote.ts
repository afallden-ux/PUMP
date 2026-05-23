import type { CrewFeedSession } from "@/types/app";

/** Note from `notes` column or first author comment (log-time fallback). */
export function getSessionDisplayNote(session: CrewFeedSession): string | null {
  const fromColumn = session.notes?.trim();
  if (fromColumn) return fromColumn;

  const authorComments = (session.session_comments ?? [])
    .filter((c) => c.user_id === session.user_id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return authorComments[0]?.body?.trim() ?? null;
}

/** Comments for the thread, excluding the log note duplicate. */
export function getThreadComments(session: CrewFeedSession) {
  const note = getSessionDisplayNote(session);
  return (session.session_comments ?? []).filter((c) => {
    if (!note) return true;
    if (c.user_id === session.user_id && c.body.trim() === note) return false;
    return true;
  });
}
