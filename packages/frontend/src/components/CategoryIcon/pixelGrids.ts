/** 8x8 boolean pixel-art grids, one row per string ("1" = filled). Verified
 * visually via a Playwright screenshot render before landing (see
 * docs/decisions/0008-svg-pixel-icons.md) — Unicode glyphs (♥☆⛨⚖♪) were
 * dropped because "Press Start 2P" and common fallback fonts don't reliably
 * include them, so the icons rendered as blank boxes on some systems.
 */
export type PixelGrid = readonly string[];

export const HEART_GRID: PixelGrid = [
  "01100110",
  "11111111",
  "11111111",
  "11111111",
  "01111110",
  "00111100",
  "00011000",
  "00000000",
];

export const SPARKLE_GRID: PixelGrid = [
  "00011000",
  "00011000",
  "10011001",
  "01111110",
  "10011001",
  "00011000",
  "00011000",
  "00000000",
];

export const COIN_GRID: PixelGrid = [
  "00111100",
  "01111110",
  "11111111",
  "11111111",
  "11111111",
  "11111111",
  "01111110",
  "00111100",
];

export const SHIELD_GRID: PixelGrid = [
  "11111111",
  "11111111",
  "11111111",
  "01111110",
  "01111110",
  "00111100",
  "00011000",
  "00000000",
];

export const GAVEL_GRID: PixelGrid = [
  "00000000",
  "00111000",
  "01111100",
  "11111110",
  "00011000",
  "00011000",
  "01111110",
  "00000000",
];

export const NOTE_GRID: PixelGrid = [
  "00000100",
  "00000110",
  "00000100",
  "00000100",
  "00000100",
  "00011100",
  "00011100",
  "00000000",
];
