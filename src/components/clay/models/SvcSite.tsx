"use client";

import { useCallback, useMemo } from "react";
import type { Object3D } from "three";
import { easeOut, lerp, restOf, useClayGlb, usePose, win, type ModelProps } from "../glb";

/** Parts in the order they arrive, each with its progress window and where it arrives from (relative offset). */
const PARTS: { name: string; from: number; to: number; away: [number, number, number] }[] = [
  { name: "Base", from: 0, to: 0.2, away: [0, -1.6, 0] },
  { name: "Bar", from: 0.2, to: 0.32, away: [0, 1.4, 0] },
  { name: "Title", from: 0.3, to: 0.42, away: [-1.4, 1.0, 0] },
  { name: "Subtitle", from: 0.4, to: 0.5, away: [-1.4, 1.0, 0] },
  { name: "Picture", from: 0.48, to: 0.62, away: [1.4, 1.2, 0] },
  { name: "Card_1", from: 0.6, to: 0.7, away: [0, 1.4, 0.6] },
  { name: "Card_2", from: 0.66, to: 0.76, away: [0, 1.4, 0.6] },
  { name: "Card_3", from: 0.72, to: 0.82, away: [0, 1.4, 0.6] },
  { name: "Button", from: 0.84, to: 1, away: [0, 1.8, 0] }, // the mint button lands last
];

function findParts(node: (n: string) => Object3D) {
  return PARTS.map((p) => ({ ...p, o: node(p.name), rest: restOf(node(p.name)) }));
}

type Parts = ReturnType<typeof findParts>;

function pose(parts: Parts, reduced: boolean, p0: number) {
  const p = reduced ? 1 : p0;
  for (const { o, rest, from, to, away } of parts) {
    const t = win(p, from, to);
    const e = easeOut(t);
    o.visible = t > 0;
    o.position.set(rest.pos.x + away[0] * (1 - e), rest.pos.y + away[1] * (1 - e), rest.pos.z + away[2] * (1 - e));
    o.scale.setScalar(lerp(0.92, 1, e));
  }
}

/**
 * public/models/site.glb: a clay web page. Base first, then the browser bar, title, subtitle, picture and the
 * three cards drop in; the mint button lands last. Rest pose of the GLB = finished page. Reduced motion: finished.
 */
export function SvcSite({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("site");
  const parts = useMemo(() => findParts(node), [node]);
  const apply = useCallback((p0: number) => pose(parts, reduced, p0), [parts, reduced]);
  usePose(apply, progress, progressRef);
  return <primitive object={root} />;
}
