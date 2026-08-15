/**
 * RetroPalette design token.
 *
 * A deliberately small, NES-era-inspired palette (a handful of hues, each
 * with one dark/base/light step) so every component reads as one visual
 * system instead of drifting toward arbitrary hex values. See
 * docs/decisions/0004-retro-design-tokens.md for the reasoning.
 */
export const RetroPalette = {
  background: "#0f0f1b",
  windowBackground: "#1a1a2e",
  border: "#e8e8e8",
  borderShadow: "#4a4a6a",
  text: "#f4f4f4",
  textMuted: "#9a9ab0",
  hp: "#e94560",
  hpDark: "#7a1f2e",
  mp: "#3fa7d6",
  mpDark: "#1f4e66",
  gold: "#f5c451",
  green: "#5ec96b",
  greenDark: "#2c5c33",
  purple: "#a06cd5",
} as const;

export type RetroPaletteKey = keyof typeof RetroPalette;

/** Emits the palette as CSS custom properties, e.g. `--rp-hp: #e94560;` */
export function retroPaletteCssVars(): string {
  return Object.entries(RetroPalette)
    .map(([key, value]) => `--rp-${kebabCase(key)}: ${value};`)
    .join("\n");
}

function kebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
