import { useMemo } from "react";
import { buildEarthCells, EARTH_SIZE } from "./earthGrid.js";
import styles from "./SpaceBackground.module.css";

/** Builds a CSS box-shadow list standing in for a starfield: one 1x1
 * element with many box-shadows paints hundreds of "stars" in a single
 * layer, which is far cheaper than one DOM node per star. */
function randomStarShadows(count: number, spreadX: number, spreadY: number): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * spreadX);
    const y = Math.round(Math.random() * spreadY);
    shadows.push(`${x}px ${y}px #f4f4f4`);
  }
  return shadows.join(",");
}

function EarthPlanet() {
  const cells = useMemo(() => buildEarthCells(), []);
  return (
    <svg
      className={styles.earth}
      viewBox={`0 0 ${EARTH_SIZE} ${EARTH_SIZE}`}
      width="120"
      height="120"
      shapeRendering="crispEdges"
    >
      {cells.map(({ x, y, isLand }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={isLand ? "#5ec96b" : "#3fa7d6"}
        />
      ))}
    </svg>
  );
}

/**
 * Decorative, purely-visual space scene behind the app content: a
 * twinkling starfield (three desynced layers), a few looping shooting
 * stars, and a pixel-art Earth. Built with plain CSS animations + inline
 * SVG rather than a graphics library — this is simple enough that a
 * runtime dependency would add bundle weight without buying anything.
 * `aria-hidden` since it carries no information; `prefers-reduced-motion`
 * is respected in the stylesheet.
 */
export function SpaceBackground() {
  const starsSmall = useMemo(() => randomStarShadows(90, 2200, 1400), []);
  const starsMedium = useMemo(() => randomStarShadows(50, 2200, 1400), []);
  const starsLarge = useMemo(() => randomStarShadows(25, 2200, 1400), []);

  return (
    <div className={styles.space} aria-hidden="true">
      <div className={styles.starsSmall} style={{ boxShadow: starsSmall }} />
      <div className={styles.starsMedium} style={{ boxShadow: starsMedium }} />
      <div className={styles.starsLarge} style={{ boxShadow: starsLarge }} />
      <div className={`${styles.shootingStar} ${styles.shootingStar1}`} />
      <div className={`${styles.shootingStar} ${styles.shootingStar2}`} />
      <div className={`${styles.shootingStar} ${styles.shootingStar3}`} />
      <EarthPlanet />
    </div>
  );
}
