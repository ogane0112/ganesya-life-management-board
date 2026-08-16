import { STATUS_WEIGHTS, type CharacterStatus } from "@ganesya/stats-engine";
import type { StatCategory } from "../CategoryIcon/CategoryIcon.js";

export interface StatExplanation {
  /** One sentence answering "what does this number even mean?", shown
   * first so the popover leads with meaning rather than mechanics. */
  summary: string;
  /** Repo path(s) the score is derived from. */
  source: string;
  /** How the number is produced, in plain Japanese. */
  formula: string[];
  /** Live breakdown built from the status payload's `details`, so the
   * panel shows *why* this particular score came out as it did. */
  breakdown: { label: string; value: string }[];
}

const pct = (ratio: number) => `${Math.round(ratio * 100)}%`;

/** Shared note: every count-based score uses the same saturating curve, so
 * explaining "half point" once per stat keeps it concrete. */
const halfPointNote = (halfPoint: number) =>
  `${halfPoint}件でちょうど50点。件数が増えるほど伸びは緩やかになり、100点には近づくが到達しない`;

function statDetails(stat: CharacterStatus["hp"]): Record<string, number> {
  return stat.details ?? {};
}

export function buildStatExplanation(
  category: StatCategory,
  stat: CharacterStatus["hp"],
): StatExplanation {
  const d = statDetails(stat);

  switch (category) {
    case "hp": {
      const w = STATUS_WEIGHTS.hp;
      return {
        summary:
          "毎日の記録をどれだけ続けられているかを表す。書き続けるほど上がり、間があくと下がる。",
        source: "logs/",
        formula: [
          `連続記録日数（重み${pct(w.streakWeight)}）と、直近${w.recentWindowDays}日の記録件数（重み${pct(w.recentWeight)}）の加重平均`,
          `連続日数は${w.streakHalfPoint}日、直近件数は${w.recentHalfPoint}件でそれぞれ50点`,
          "記録が途切れず、かつ頻度が高いほど伸びる",
        ],
        breakdown: [
          { label: "連続記録日数", value: `${d.streakDays ?? 0} 日` },
          {
            label: `直近${w.recentWindowDays}日の記録`,
            value: `${d.recentCount ?? 0} 件`,
          },
        ],
      };
    }

    case "int": {
      const w = STATUS_WEIGHTS.int;
      return {
        summary:
          "取得済みの資格がどれだけ充実しているかを表す。資格が多く、かつ失効していないほど高い。",
        source: "profile/qualifications.md（取得済み資格・免許）",
        formula: [
          `資格の数（重み${pct(w.countWeight)}）と、有効期限内の資格の割合（重み${pct(w.validRatioWeight)}）の加重平均`,
          `資格数は${halfPointNote(w.countHalfPoint)}`,
          "有効期限が「無期限」「-」「空欄」の資格は失効しない扱い",
        ],
        breakdown: [
          { label: "取得済み資格", value: `${d.total ?? 0} 件` },
          { label: "うち有効", value: `${d.validCount ?? 0} 件` },
        ],
      };
    }

    case "finance": {
      const w = STATUS_WEIGHTS.finance;
      return {
        summary:
          "お金まわりの記録がどれだけ充実し、新しく保たれているかを表す。",
        source: "finance/",
        formula: [
          `記録ファイル数（重み${pct(w.countWeight)}）と、直近${w.freshnessWindowDays}日以内に更新された割合（重み${pct(w.freshnessWeight)}）の加重平均`,
          `ファイル数は${halfPointNote(w.countHalfPoint)}`,
          "更新日は各ファイルの frontmatter の last_updated を参照",
        ],
        breakdown: [
          { label: "記録ファイル", value: `${d.total ?? 0} 件` },
          {
            label: `直近${w.freshnessWindowDays}日に更新`,
            value: `${d.freshCount ?? 0} 件`,
          },
        ],
      };
    }

    case "equipment": {
      const w = STATUS_WEIGHTS.equipment;
      return {
        summary:
          "家電・住まいなど生活の基盤をどれだけ記録できているかを表す。",
        source: "home/",
        formula: [
          "家電・家具など生活基盤の記録ファイル数から算出",
          halfPointNote(w.countHalfPoint),
        ],
        breakdown: [{ label: "記録ファイル", value: `${d.total ?? 0} 件` }],
      };
    }

    case "judgement": {
      const w = STATUS_WEIGHTS.judgement;
      return {
        summary:
          "「なぜそう決めたか」の記録がどれだけ溜まっているかを表す。",
        source: "decisions/",
        formula: [
          "意思決定ログの蓄積数から算出",
          halfPointNote(w.countHalfPoint),
        ],
        breakdown: [{ label: "意思決定ログ", value: `${d.total ?? 0} 件` }],
      };
    }

    case "bond": {
      const w = STATUS_WEIGHTS.bond;
      return {
        summary: "AIとの対話ログがどれだけ溜まっているかを表す。",
        source: "chat-summaries/",
        formula: [
          "AIとの対話ログの蓄積数から算出",
          halfPointNote(w.countHalfPoint),
        ],
        breakdown: [{ label: "対話ログ", value: `${d.total ?? 0} 件` }],
      };
    }
  }
}

/** LV is not one of the six bars, so it gets its own explanation for the
 * header area. */
export function buildLevelExplanation(status: CharacterStatus): StatExplanation {
  const w = STATUS_WEIGHTS.level;
  return {
    summary:
      "キャリアの積み重ねから決まる総合レベル。career.md に書いた職歴が長く、イベントが多いほど上がる。",
    source: "profile/career.md（現職の入社日・職歴の期間）",
    formula: [
      `キャリアイベント1件につき ${w.xpPerCareerEvent} XP、経験年数1年につき ${w.xpPerYearOfExperience} XP`,
      "LV = floor(sqrt(XP / 50)) + 1（1〜99）。序盤は上がりやすく、後半ほど必要XPが増える",
      "career.md の日付欄が未記入だと XP は 0 のまま（Lv. 1）",
    ],
    breakdown: [{ label: "累計XP", value: `${status.xp}` }],
  };
}
