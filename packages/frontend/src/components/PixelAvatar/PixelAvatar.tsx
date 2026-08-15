import styles from "./PixelAvatar.module.css";

export type AvatarTier = "novice" | "adept" | "veteran" | "legend";

const TIER_LABELS: Record<AvatarTier, string> = {
  novice: "見習い",
  adept: "冒険者",
  veteran: "熟練者",
  legend: "伝説の勇者",
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

export function PixelAvatar({ level }: PixelAvatarProps) {
  const tier = getAvatarTier(level);
  return (
    <div
      className={`${styles.avatar} ${styles[tier]}`}
      role="img"
      aria-label={`${TIER_LABELS[tier]}（Lv. ${level}）`}
      data-tier={tier}
    />
  );
}
