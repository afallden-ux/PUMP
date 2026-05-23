export interface WeeklyPodiumTally {
  gold: number;
  silver: number;
  bronze: number;
}

export interface PodiumLogRow {
  user_id: string;
  created_at: string;
  total_points: number;
}

/** ISO calendar week key (Mon–Sun), e.g. "2026-W20". */
export function getIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Count gold / silver / bronze finishes per calendar week (points sum).
 * Current week is excluded (still in progress).
 */
export function computeWeeklyPodiumTally(
  rows: PodiumLogRow[],
  userId: string
): WeeklyPodiumTally {
  const currentWeek = getIsoWeekKey(new Date());
  const byWeek = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const week = getIsoWeekKey(new Date(row.created_at));
    if (week === currentWeek) continue;

    let users = byWeek.get(week);
    if (!users) {
      users = new Map();
      byWeek.set(week, users);
    }
    users.set(row.user_id, (users.get(row.user_id) ?? 0) + row.total_points);
  }

  let gold = 0;
  let silver = 0;
  let bronze = 0;

  for (const users of byWeek.values()) {
    const ranked = [...users.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    const idx = ranked.findIndex(([id]) => id === userId);
    if (idx === 0) gold += 1;
    else if (idx === 1) silver += 1;
    else if (idx === 2) bronze += 1;
  }

  return { gold, silver, bronze };
}
