import type { CharacterStatus } from "@ganesya/stats-engine";
import { CategoryIcon, type StatCategory } from "../CategoryIcon/CategoryIcon.js";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip.js";
import { ParameterBar } from "../ParameterBar/ParameterBar.js";
import { PixelAvatar } from "../PixelAvatar/PixelAvatar.js";
import { PixelWindow } from "../PixelWindow/PixelWindow.js";
import { StatExplanationContent } from "./StatExplanationContent.js";
import { buildLevelExplanation, buildStatExplanation } from "./statExplanations.js";
import styles from "./StatusPanel.module.css";

export interface StatusPanelProps {
  status: CharacterStatus;
  characterName?: string;
}

const STAT_ROWS: { key: keyof CharacterStatus & string; category: StatCategory; label: string; colorVar: string }[] = [
  { key: "hp", category: "hp", label: "HP", colorVar: "--rp-hp" },
  { key: "int", category: "int", label: "INT", colorVar: "--rp-mp" },
  { key: "finance", category: "finance", label: "財力", colorVar: "--rp-gold" },
  { key: "equipment", category: "equipment", label: "装備", colorVar: "--rp-text-muted" },
  { key: "judgement", category: "judgement", label: "判断力", colorVar: "--rp-purple" },
  { key: "bond", category: "bond", label: "絆", colorVar: "--rp-green" },
];

/** Full character status card: avatar, level, and every stat bar. Each row
 * carries an info popover explaining how that number is derived, since the
 * scores are otherwise opaque. */
export function StatusPanel({ status, characterName = "life-management" }: StatusPanelProps) {
  return (
    <PixelWindow title="ステータス">
      <div className={styles.header}>
        <PixelAvatar level={status.level} />
        <div>
          <div className={styles.name}>{characterName}</div>
          <div className={styles.levelRow}>
            <span className={styles.level}>Lv. {status.level}</span>
            <InfoTooltip label="LV の説明">
              <StatExplanationContent
                title="LV（レベル）"
                explanation={buildLevelExplanation(status)}
              />
            </InfoTooltip>
          </div>
        </div>
      </div>
      {STAT_ROWS.map(({ key, category, label, colorVar }) => {
        const stat = status[key] as CharacterStatus["hp"];
        return (
          <div className={styles.statRow} key={key}>
            <CategoryIcon category={category} />
            <div className={styles.barWrap}>
              <ParameterBar label={label} value={stat.score} max={stat.max} colorVar={colorVar} />
            </div>
            <InfoTooltip label={`${label} の説明`}>
              <StatExplanationContent
                title={label}
                explanation={buildStatExplanation(category, stat)}
              />
            </InfoTooltip>
          </div>
        );
      })}
    </PixelWindow>
  );
}
