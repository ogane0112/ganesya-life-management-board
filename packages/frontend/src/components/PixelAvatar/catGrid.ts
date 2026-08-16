/** 16x16 chibi cat face pixel grid ("1" = filled), same inline-SVG-rect
 * technique as CategoryIcon's pixelGrids.ts. Verified visually via a
 * Playwright screenshot render before landing (see
 * docs/decisions/0009-pixel-cat-avatar-and-space-background.md). Every
 * level tier reuses this grid, differing only in fill color. */
export const CAT_GRID: readonly string[] = [
  "0001100000110000",
  "0011110001111000",
  "0011111011111000",
  "0001111111110000",
  "0111111111111100",
  "1111111111111110",
  "1111011111011111",
  "1111011111011111",
  "1111111111111111",
  "1111111111111111",
  "1111101001011111",
  "0111111111111100",
  "0011111111111000",
  "0001111111110000",
  "0000111111100000",
  "0000011111000000",
];
