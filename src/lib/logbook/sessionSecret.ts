/** Shared AES secret for encrypted third-party session cookies (MoonBoard, 27crags, 8a.nu). */
export function getLogbookSessionSecret(): string | null {
  const s = (
    process.env.LOGBOOK_SESSION_SECRET ?? process.env.MOONBOARD_SESSION_SECRET
  )?.trim();
  return s && s.length >= 16 ? s : null;
}
