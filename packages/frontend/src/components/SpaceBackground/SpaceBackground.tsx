import { useId, useMemo } from "react";
import {
  buildContinentCells,
  PLANET_RADIUS,
  PLANET_SIZE,
} from "./planetGrid.js";
import styles from "./SpaceBackground.module.css";

/** Builds a CSS box-shadow list standing in for a starfield: one 1x1
 * element with many box-shadows paints hundreds of "stars" in a single
 * layer, which is far cheaper than one DOM node per star. */
function randomStarShadows(
  count: number,
  spreadX: number,
  spreadY: number,
  glowPx: number,
): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * spreadX);
    const y = Math.round(Math.random() * spreadY);
    // The blur radius is what makes each star read as glowing rather than
    // as a flat dot.
    shadows.push(`${x}px ${y}px ${glowPx}px #f4f4f4`);
  }
  return shadows.join(",");
}

interface PlanetProps {
  className: string;
  oceanColor: string;
  landColor: string;
  /** Seconds per full rotation. Larger planets should turn slower so both
   * read as the same physical speed at different apparent distances. */
  spinDurationSec: number;
}

/** Pixel globe: a clipped circle with a tileable continent band scrolling
 * behind it (drawn twice, translated by exactly one band width) so the
 * loop is seamless and reads as rotation. */
function Planet({ className, oceanColor, landColor, spinDurationSec }: PlanetProps) {
  const clipId = useId();
  const cells = useMemo(() => buildContinentCells(), []);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${PLANET_SIZE} ${PLANET_SIZE}`}
      shapeRendering="crispEdges"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={PLANET_SIZE / 2} cy={PLANET_SIZE / 2} r={PLANET_RADIUS} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={PLANET_SIZE} height={PLANET_SIZE} fill={oceanColor} />
        <g
          className={styles.spinBand}
          style={{ animationDuration: `${spinDurationSec}s` }}
        >
          {[0, PLANET_SIZE].map((offset) =>
            cells.map(({ x, y }) => (
              <rect
                key={`${offset}-${x}-${y}`}
                x={x + offset}
                y={y}
                width={1}
                height={1}
                fill={landColor}
              />
            )),
          )}
        </g>
        {/* Terminator: a soft shadow on one limb gives the flat disc some
         * spherical read without breaking the pixel aesthetic. */}
        <rect
          width={PLANET_SIZE}
          height={PLANET_SIZE}
          fill="url(#planet-shade)"
          className={styles.planetShade}
        />
      </g>
    </svg>
  );
}

/**
 * Decorative, purely-visual space scene behind the app content.
 *
 * Composition follows a few deliberate rules rather than scattering
 * elements: the two planets sit on opposite corners of a diagonal so
 * their visual weights counterbalance (asymmetric balance) instead of
 * loading one side; the large planet is offset from the corner rather
 * than centered or flush; a vignette darkens the edges so the centered
 * status card keeps the strongest contrast and stays the focal point;
 * and element scale doubles as depth cueing (big/bright = near,
 * small/dim = far).
 *
 * Built with plain CSS animation + inline SVG rather than a graphics
 * library — this scale of effect doesn't justify a runtime dependency.
 * `aria-hidden` since it carries no information; `prefers-reduced-motion`
 * is respected in the stylesheet.
 */
export function SpaceBackground() {
  const starsSmall = useMemo(() => randomStarShadows(130, 2400, 1600, 1), []);
  const starsMedium = useMemo(() => randomStarShadows(65, 2400, 1600, 3), []);
  const starsLarge = useMemo(() => randomStarShadows(30, 2400, 1600, 6), []);

  return (
    <div className={styles.space} aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="planet-shade" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </linearGradient>
        </defs>
      </svg>

      <div className={styles.nebula} />

      <div className={styles.starsSmall} style={{ boxShadow: starsSmall }} />
      <div className={styles.starsMedium} style={{ boxShadow: starsMedium }} />
      <div className={styles.starsLarge} style={{ boxShadow: starsLarge }} />

      {/* Five staggered streaks with overlapping visible phases, so at any
       * given moment at least one is mid-flight rather than the screen
       * sitting empty between passes. */}
      <div className={`${styles.shootingStar} ${styles.shootingStar1}`} />
      <div className={`${styles.shootingStar} ${styles.shootingStar2}`} />
      <div className={`${styles.shootingStar} ${styles.shootingStar3}`} />
      <div className={`${styles.shootingStar} ${styles.shootingStar4}`} />
      <div className={`${styles.shootingStar} ${styles.shootingStar5}`} />

      <Planet
        className={styles.earth}
        oceanColor="#3fa7d6"
        landColor="#5ec96b"
        spinDurationSec={26}
      />
      <Planet
        className={styles.moon}
        oceanColor="#6a6a8a"
        landColor="#9a9ab0"
        spinDurationSec={34}
      />

      <div className={styles.vignette} />
    </div>
  );
}
