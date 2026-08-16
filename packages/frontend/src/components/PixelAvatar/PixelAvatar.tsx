import { CAT_GRID } from "./catGrid.js";
import styles from "./PixelAvatar.module.css";

export type AvatarTier = "novice" | "adept" | "veteran" | "legend";

const TIER_LABELS: Record<AvatarTier, string> = {
  novice: "見習い",
  adept: "冒険者",
  veteran: "熟練者",
  legend: "伝説の勇者",
};

/** RetroPalette CSS variable per tier, reusing the same colors as the
 * ParameterBar/CategoryIcon palette so the avatar's tier reads as an
 * upgrade rather than an unrelated color. */
const TIER_COLOR_VAR: Record<AvatarTier, string> = {
  novice: "--rp-text-muted",
  adept: "--rp-green",
  veteran: "--rp-mp",
  legend: "--rp-gold",
};

/**
 * Maps a character level to a visual tier. Thresholds are a first-pass
 * guess (see docs/decisions/0005-placeholder-pixel-art.md) meant to be
 * revisited once real pixel-art sprites exist per tier.
 */
export function getAvatarTier(level: number): AvatarTier {
  if (level >= 60) return "legend";
  if (level >= 30) return "veteran";
  if (level >= 10) return "adept";
  return "novice";
}

export interface PixelAvatarProps {
  level: number;
}

/** Chibi pixel-cat avatar (inline SVG, font/image-independent) that
 * recolors per level tier. */
export function PixelAvatar({ level }: PixelAvatarProps) {
  const tier = getAvatarTier(level);
  const colorVar = TIER_COLOR_VAR[tier];
  const size = CAT_GRID.length;

  return (
    <span
      className={styles.avatar}
      role="img"
      aria-label={`${TIER_LABELS[tier]}（Lv. ${level}）`}
      data-tier={tier}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="64"
        height="64"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {CAT_GRID.flatMap((row, y) =>
          [...row].map((cell, x) =>
            cell === "1" ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={`var(${colorVar})`}
              />
            ) : null,
          ),
        )}
      </svg>
    </span>
  );
}
