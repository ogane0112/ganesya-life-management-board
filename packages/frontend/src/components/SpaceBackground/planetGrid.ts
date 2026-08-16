/**
 * Pixel-art planet geometry.
 *
 * The globe is drawn as a clipped circle (computed, so it stays a clean
 * circle at any size) with a *tileable* band of continents sliding behind
 * the clip — translating the band by exactly its own width loops
 * seamlessly, which reads as the planet rotating.
 */
export const PLANET_SIZE = 24;

/** Continent cells laid out across one full band width. Because the band
 * is rendered twice side by side and scrolled by exactly PLANET_SIZE, any
 * cell here reappears seamlessly on the next pass. */
const CONTINENT_CELLS: ReadonlyArray<readonly [number, number]> = [
  // "americas"-ish vertical mass
  [3, 7], [4, 7], [3, 8], [4, 8], [5, 8], [4, 9], [5, 9], [4, 10], [5, 10],
  [5, 11], [6, 11], [5, 12], [6, 12], [6, 13],
  // mid landmass
  [10, 5], [11, 5], [12, 5], [11, 6], [12, 6], [13, 6], [10, 6],
  [11, 7], [12, 7], [13, 7], [14, 7], [12, 8], [13, 8],
  // eastern islands
  [17, 9], [18, 9], [17, 10], [18, 10], [19, 10], [18, 11],
  [16, 13], [17, 13], [17, 14],
  // southern mass
  [8, 15], [9, 15], [10, 15], [9, 16], [10, 16], [9, 17],
  [20, 15], [21, 15], [21, 16],
];

const CENTER = PLANET_SIZE / 2;
export const PLANET_RADIUS = PLANET_SIZE / 2 - 1;

export interface PlanetCell {
  x: number;
  y: number;
}

/** Continent cells clipped to the globe's vertical extent so the band
 * doesn't paint stray pixels above/below the sphere as it scrolls. */
export function buildContinentCells(): PlanetCell[] {
  return CONTINENT_CELLS.filter(([, y]) => {
    const dy = y + 0.5 - CENTER;
    return Math.abs(dy) <= PLANET_RADIUS;
  }).map(([x, y]) => ({ x, y }));
}
