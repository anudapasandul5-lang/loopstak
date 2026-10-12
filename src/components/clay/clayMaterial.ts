import { MeshStandardMaterial } from "three";

/** Clay palette. Mint is only for parts that are "yours" (beads, key, finished site, lit blocks). */
export const CLAY = {
  warmGrey: "#8f8a84",
  stone: "#b9b2a6",
  cream: "#e8e2d0",
  mint: "#02c39a",
} as const;

export type ClayTone = keyof typeof CLAY;

/** Shared matte clay material: never shiny, no metal. One factory so every model matches. */
export function clayMaterial(tone: ClayTone = "warmGrey") {
  return new MeshStandardMaterial({
    color: CLAY[tone],
    roughness: 0.9,
    metalness: 0,
  });
}
