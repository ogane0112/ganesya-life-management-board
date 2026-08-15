const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Saturating (diminishing-returns) score in [0, 100].
 * At `count === halfPoint` the score is exactly 50; it approaches (but
 * never reaches) 100 as count grows. Monotonically increasing, defined for
 * count >= 0. Chosen over a hard-capped linear score so that a single
 * category can't be "maxed out" by a handful of entries, matching the
 * intent that these are living, ever-growing logs (see
 * docs/decisions/0002-status-calculation-approach.md).
 */
export function saturatingScore(count: number, halfPoint: number): number {
  if (halfPoint <= 0) {
    throw new Error("halfPoint must be > 0");
  }
  if (count <= 0) return 0;
  return (100 * count) / (count + halfPoint);
}

export function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(toDateOnly(fromIso));
  const to = Date.parse(toDateOnly(toIso));
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Counts entries whose lastModified falls within the last `windowDays`
 * days up to and including `now` (inclusive on both ends).
 */
export function countWithinWindow(
  dates: string[],
  now: string,
  windowDays: number,
): number {
  return dates.filter((d) => {
    const diff = daysBetween(d, now);
    return diff >= 0 && diff <= windowDays;
  }).length;
}

/**
 * Longest run of consecutive calendar days (up to and including `now`,
 * with a 1-day grace period for "haven't logged today yet") that contain
 * at least one entry in `dates`.
 */
export function computeStreakDays(dates: string[], now: string): number {
  const daySet = new Set(dates.map(toDateOnly));
  const nowDay = toDateOnly(now);

  let cursor: Date;
  if (daySet.has(nowDay)) {
    cursor = new Date(`${nowDay}T00:00:00Z`);
  } else {
    const yesterday = new Date(`${nowDay}T00:00:00Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    if (!daySet.has(yesterdayKey)) {
      return 0;
    }
    cursor = yesterday;
  }

  let streak = 0;
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daySet.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/**
 * Classic RPG-style XP curve: the XP required to reach level N grows with
 * N^2, so early levels come quickly and later levels take progressively
 * longer. Level is 1-indexed and capped at 99 (see decision log).
 */
export function xpToLevel(xp: number): number {
  if (xp <= 0) return 1;
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  return clamp(level, 1, 99);
}

export function round(value: number): number {
  return Math.round(value);
}
