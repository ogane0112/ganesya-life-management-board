import {
  COIN_GRID,
  GAVEL_GRID,
  HEART_GRID,
  NOTE_GRID,
  SHIELD_GRID,
  SPARKLE_GRID,
  type PixelGrid,
} from "./pixelGrids.js";
import styles from "./CategoryIcon.module.css";

export type StatCategory =
  | "hp"
  | "int"
  | "finance"
  | "equipment"
  | "judgement"
  | "bond";

interface CategoryMeta {
  grid: PixelGrid;
  colorVar: string;
  label: string;
}

const CATEGORY_META: Record<StatCategory, CategoryMeta> = {
  hp: { grid: HEART_GRID, colorVar: "--rp-hp", label: "HP" },
  int: { grid: SPARKLE_GRID, colorVar: "--rp-mp", label: "INT" },
  finance: { grid: COIN_GRID, colorVar: "--rp-gold", label: "財力" },
  equipment: { grid: SHIELD_GRID, colorVar: "--rp-text-muted", label: "装備" },
  judgement: { grid: GAVEL_GRID, colorVar: "--rp-purple", label: "判断力" },
  bond: { grid: NOTE_GRID, colorVar: "--rp-green", label: "絆" },
};

export interface CategoryIconProps {
  category: StatCategory;
}

/** Renders an 8x8 dot-art icon as inline SVG rects — no font glyph or image
 * asset dependency, so it always renders identically everywhere. */
export function CategoryIcon({ category }: CategoryIconProps) {
  const meta = CATEGORY_META[category];
  const size = meta.grid.length;

  return (
    <span className={styles.icon} role="img" aria-label={meta.label}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="16"
        height="16"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {meta.grid.flatMap((row, y) =>
          [...row].map((cell, x) =>
            cell === "1" ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={`var(${meta.colorVar})`}
              />
            ) : null,
          ),
        )}
      </svg>
    </span>
  );
}
