/** A 20x20 pixel-art Earth: the ocean circle is computed (not hand-drawn,
 * so it stays a clean circle at any size), continents are a small
 * hand-placed set of "land" cells layered on top. */
export const EARTH_SIZE = 20;
const CENTER = EARTH_SIZE / 2 - 0.5;
const RADIUS = EARTH_SIZE / 2 - 1;

const LAND_CELLS: ReadonlyArray<readonly [number, number]> = [
  [5, 6], [6, 6], [7, 6], [6, 7], [5, 7],
  [12, 4], [13, 4], [12, 5], [13, 5], [14, 5],
  [8, 12], [9, 12], [10, 12], [9, 13],
  [14, 9], [15, 9], [14, 10],
  [4, 11], [5, 11],
];

function isInCircle(x: number, y: number): boolean {
  const dx = x + 0.5 - CENTER;
  const dy = y + 0.5 - CENTER;
  return dx * dx + dy * dy <= RADIUS * RADIUS;
}

export interface EarthCell {
  x: number;
  y: number;
  isLand: boolean;
}

export function buildEarthCells(): EarthCell[] {
  const landSet = new Set(LAND_CELLS.map(([x, y]) => `${x}-${y}`));
  const cells: EarthCell[] = [];
  for (let y = 0; y < EARTH_SIZE; y++) {
    for (let x = 0; x < EARTH_SIZE; x++) {
      if (isInCircle(x, y)) {
        cells.push({ x, y, isLand: landSet.has(`${x}-${y}`) });
      }
    }
  }
  return cells;
}
