/** Shared by the Services section and its scene. Kept free of three.js so the section's first-load bundle stays light. */
export const SERVICE_COUNT = 4;

/** Which item is active for a 0..1 progress through the pinned range. */
export const activeIndex = (p: number) => Math.min(SERVICE_COUNT - 1, Math.max(0, Math.floor(p * SERVICE_COUNT)));
