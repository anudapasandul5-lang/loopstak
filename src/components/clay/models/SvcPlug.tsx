"use client";

import { useCallback, useMemo } from "react";
import type { Object3D } from "three";
import { easeInOut, easeOut, lerp, restOf, useClayGlb, usePose, win, type ModelProps } from "../glb";

const LIFT = 1.0; // how high the plug hovers while it travels
const FROM_X = -1.8; // and how far to the left it starts

function findParts(node: (n: string) => Object3D) {
  const names = ["Block_A", "Block_B", "Block_A_Lit", "Block_B_Lit", "Plug"] as const;
  const [a, b, la, lb, plug] = names.map((n) => node(n));
  return { a, b, la, lb, plug, plugRest: restOf(plug) };
}

type Parts = ReturnType<typeof findParts>;

function pose(parts: Parts, reduced: boolean, p0: number) {
  const { a, b, la, lb, plug, plugRest } = parts;
  const p = reduced ? 1 : p0;
  const travel = easeInOut(win(p, 0.06, 0.58));
  const drop = easeInOut(win(p, 0.62, 0.84));
  plug.position.set(
    plugRest.pos.x + FROM_X * (1 - travel),
    plugRest.pos.y + LIFT * (1 - drop),
    plugRest.pos.z,
  );
  plug.rotation.z = Math.sin(Math.PI * travel) * 0.12 * (1 - drop);
  // lit swap
  const lit = win(p, 0.86, 1);
  const on = lit > 0;
  a.visible = b.visible = !on;
  la.visible = lb.visible = on;
  const s = lerp(0.94, 1, easeOut(lit));
  la.scale.setScalar(s);
  lb.scale.setScalar(s);
}

/**
 * public/models/plug.glb (Claude integration): two clay tool blocks and a plug. The plug starts high on the left,
 * travels across over the gap, then drops in (0.62..0.84). Then the blocks swap to their mint copies (the _Lit
 * nodes sit in the same place) with a small settle. Finished (and reduced motion): connected, both blocks lit.
 */
export function SvcPlug({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("plug");
  const parts = useMemo(() => findParts(node), [node]);
  const apply = useCallback((p0: number) => pose(parts, reduced, p0), [parts, reduced]);
  usePose(apply, progress, progressRef);
  return <primitive object={root} />;
}
