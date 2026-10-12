/**
 * Tiny shared scroll store (ADR 0001). Plain object, no React state: ScrollTriggers write,
 * R3F scenes read inside useFrame. Progress is 0..1 per section id.
 */
const progress: Record<string, number> = {};

export const setProgress = (id: string, value: number) => {
  progress[id] = Math.min(1, Math.max(0, value));
};

export const getProgress = (id: string) => progress[id] ?? 0;
