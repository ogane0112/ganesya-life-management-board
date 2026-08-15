import type {
  CareerEventRecord,
  CharacterStatus,
  QualificationRecord,
  RepoSnapshot,
  StatScore,
} from "./types.js";
import {
  clamp,
  computeStreakDays,
  countWithinWindow,
  round,
  saturatingScore,
  xpToLevel,
} from "./math.js";

/** Tunable weights/thresholds for the status formulas. See
 * docs/design/status-calculation.md for the rationale behind each number.
 * Centralized here so the whole formula surface can be reviewed/tuned in
 * one place without hunting through the calculation functions.
 */
export const STATUS_WEIGHTS = {
  hp: {
    streakHalfPoint: 7,
    recentHalfPoint: 15,
    recentWindowDays: 30,
    streakWeight: 0.6,
    recentWeight: 0.4,
  },
  int: {
    countHalfPoint: 5,
    countWeight: 0.5,
    validRatioWeight: 0.5,
  },
  finance: {
    countHalfPoint: 10,
    freshnessWindowDays: 90,
    countWeight: 0.5,
    freshnessWeight: 0.5,
  },
  equipment: {
    countHalfPoint: 8,
  },
  judgement: {
    countHalfPoint: 10,
  },
  bond: {
    countHalfPoint: 20,
  },
  level: {
    xpPerCareerEvent: 50,
    xpPerYearOfExperience: 100,
  },
} as const;

function isQualificationValid(q: QualificationRecord, now: string): boolean {
  if (!q.expiryDate) return true;
  return q.expiryDate >= now.slice(0, 10);
}

export function computeHp(
  logs: RepoSnapshot["logs"],
  now: string,
): StatScore {
  const w = STATUS_WEIGHTS.hp;
  const dates = logs.map((f) => f.lastModified);
  const streakDays = computeStreakDays(dates, now);
  const recentCount = countWithinWindow(dates, now, w.recentWindowDays);

  const streakScore = saturatingScore(streakDays, w.streakHalfPoint);
  const recentScore = saturatingScore(recentCount, w.recentHalfPoint);
  const score = clamp(
    round(streakScore * w.streakWeight + recentScore * w.recentWeight),
    0,
    100,
  );

  return {
    score,
    max: 100,
    details: { streakDays, recentCount, streakScore, recentScore },
  };
}

export function computeInt(
  qualifications: QualificationRecord[],
  now: string,
): StatScore {
  const w = STATUS_WEIGHTS.int;
  const total = qualifications.length;
  const validCount = qualifications.filter((q) =>
    isQualificationValid(q, now),
  ).length;
  const validRatio = total === 0 ? 0 : validCount / total;

  const countScore = saturatingScore(total, w.countHalfPoint);
  const score = clamp(
    round(countScore * w.countWeight + validRatio * 100 * w.validRatioWeight),
    0,
    100,
  );

  return {
    score,
    max: 100,
    details: { total, validCount, validRatio, countScore },
  };
}

export function computeFinance(
  finance: RepoSnapshot["finance"],
  now: string,
): StatScore {
  const w = STATUS_WEIGHTS.finance;
  const total = finance.length;
  const dates = finance.map((f) => f.lastModified);
  const freshCount = countWithinWindow(dates, now, w.freshnessWindowDays);
  const freshnessRatio = total === 0 ? 0 : freshCount / total;

  const countScore = saturatingScore(total, w.countHalfPoint);
  const score = clamp(
    round(
      countScore * w.countWeight + freshnessRatio * 100 * w.freshnessWeight,
    ),
    0,
    100,
  );

  return {
    score,
    max: 100,
    details: { total, freshCount, freshnessRatio, countScore },
  };
}

export function computeEquipment(home: RepoSnapshot["home"]): StatScore {
  const w = STATUS_WEIGHTS.equipment;
  const total = home.length;
  const score = clamp(round(saturatingScore(total, w.countHalfPoint)), 0, 100);
  return { score, max: 100, details: { total } };
}

export function computeJudgement(
  decisions: RepoSnapshot["decisions"],
): StatScore {
  const w = STATUS_WEIGHTS.judgement;
  const total = decisions.length;
  const score = clamp(round(saturatingScore(total, w.countHalfPoint)), 0, 100);
  return { score, max: 100, details: { total } };
}

export function computeBond(
  chatSummaries: RepoSnapshot["chatSummaries"],
): StatScore {
  const w = STATUS_WEIGHTS.bond;
  const total = chatSummaries.length;
  const score = clamp(round(saturatingScore(total, w.countHalfPoint)), 0, 100);
  return { score, max: 100, details: { total } };
}

function yearsOfExperience(
  careerEvents: CareerEventRecord[],
  now: string,
): number {
  if (careerEvents.length === 0) return 0;
  const earliest = careerEvents.reduce((min, e) => (e.date < min ? e.date : min), careerEvents[0].date);
  const earliestMs = Date.parse(earliest.slice(0, 10));
  const nowMs = Date.parse(now.slice(0, 10));
  const years = (nowMs - earliestMs) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, years);
}

export function computeLevel(
  careerEvents: CareerEventRecord[],
  now: string,
): { level: number; xp: number } {
  const w = STATUS_WEIGHTS.level;
  const years = yearsOfExperience(careerEvents, now);
  const xp = round(
    careerEvents.length * w.xpPerCareerEvent + years * w.xpPerYearOfExperience,
  );
  return { level: xpToLevel(xp), xp };
}

export function computeStatus(snapshot: RepoSnapshot): CharacterStatus {
  const { level, xp } = computeLevel(snapshot.careerEvents, snapshot.now);
  return {
    level,
    xp,
    hp: computeHp(snapshot.logs, snapshot.now),
    int: computeInt(snapshot.qualifications, snapshot.now),
    finance: computeFinance(snapshot.finance, snapshot.now),
    equipment: computeEquipment(snapshot.home),
    judgement: computeJudgement(snapshot.decisions),
    bond: computeBond(snapshot.chatSummaries),
  };
}
