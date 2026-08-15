import styles from "./CategoryIcon.module.css";

export type StatCategory =
  | "hp"
  | "int"
  | "finance"
  | "equipment"
  | "judgement"
  | "bond";

interface CategoryMeta {
  symbol: string;
  colorVar: string;
  label: string;
}

/**
 * Placeholder dot-art icon set: an 8x8-feeling glyph rendered from a single
 * character rather than a sprite sheet, so the icon set exists and is
 * swappable without blocking on real pixel-art assets. See
 * docs/decisions/0005-placeholder-pixel-art.md.
 */
const CATEGORY_META: Record<StatCategory, CategoryMeta> = {
  hp: { symbol: "♥", colorVar: "--rp-hp", label: "HP" },
  int: { symbol: "☆", colorVar: "--rp-mp", label: "INT" },
  finance: { symbol: "$", colorVar: "--rp-gold", label: "財力" },
  equipment: { symbol: "⛨", colorVar: "--rp-text-muted", label: "装備" },
  judgement: { symbol: "⚖", colorVar: "--rp-purple", label: "判断力" },
  bond: { symbol: "♪", colorVar: "--rp-green", label: "絆" },
};

export interface CategoryIconProps {
  category: StatCategory;
}

export function CategoryIcon({ category }: CategoryIconProps) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={styles.icon}
      style={{ color: `var(${meta.colorVar})` }}
      role="img"
      aria-label={meta.label}
    >
      {meta.symbol}
    </span>
  );
}
