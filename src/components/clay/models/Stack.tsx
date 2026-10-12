"use client";

import { useCallback, useMemo } from "react";
import { clamp01, easeOut, restOf, useClayGlb, usePose, type ModelProps } from "../glb";

const SLABS = 6;
const START = 0.15; // each slab starts this much later in progress than the one below
const SPAN = 0.25; // and takes this much progress to land (the last one ends at exactly 1)
const FALL = 2.6; // how far above its resting place a slab starts

/** Pose of slab `i` (0-based) for a given progress. Pure: same progress, same pose, scrubbing either way. */
export function slabPose(i: number, progress: number) {
  const t = clamp01((progress - i * START) / SPAN);
  const fall = easeOut(Math.min(1, t / 0.8)); // drops over the first 80%, then settles
  const land = clamp01((t - 0.72) / 0.28);
  const squash = t < 1 ? 0.05 * Math.sin(Math.PI * land) : 0; // tiny and brief
  return { visible: t > 0, drop: (1 - fall) * FALL, sy: 1 - squash, sxz: 1 + squash * 0.6 };
}

/**
 * public/models/stack.glb: six clay slabs (Slab_1 bottom to Slab_6 top, the top one mint) that drop in one by
 * one as `progress` goes 0..1. Rest pose of the GLB = finished stack. Reduced motion: finished stack.
 */
export function Stack({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("stack");
  const slabs = useMemo(
    () => Array.from({ length: SLABS }, (_, i) => ({ o: node(`Slab_${i + 1}`), rest: restOf(node(`Slab_${i + 1}`)) })),
    [node],
  );
  const apply = useCallback(
    (p0: number) => {
      const p = reduced ? 1 : p0;
      slabs.forEach(({ o, rest }, i) => {
        const s = slabPose(i, p);
        o.visible = s.visible;
        o.position.set(rest.pos.x, rest.pos.y + s.drop, rest.pos.z);
        o.scale.set(s.sxz, s.sy, s.sxz);
      });
    },
    [slabs, reduced],
  );
  usePose(apply, progress, progressRef);
  return <primitive object={root} />;
}
