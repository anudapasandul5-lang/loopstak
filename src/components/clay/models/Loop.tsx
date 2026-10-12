"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useClayGlb, usePose, type ModelProps } from "../glb";

export type { ModelProps };

const BEADS = ["Bead_0", "Bead_1", "Bead_2"];
const SPEED = 0.16; // radians of path per second: the beads drift round the loop
const TURN = 2.2; // radians the beads travel across a full 0..1 progress

/** Bead position on the loop (glTF axes), t in [0, 2pi). Same curve the tube was built on. */
function onPath(t: number, out: { x: number; y: number; z: number }) {
  const s = Math.sin(t);
  const d = 1 + s * s;
  out.x = (1.6 * Math.cos(t)) / d;
  out.y = 0.3 * s;
  out.z = (-1.6 * s * Math.cos(t)) / d;
}

/**
 * public/models/loop.glb: a stone tube on an infinity path with three mint beads. It lies flat (XZ); scenes tilt
 * the group toward the camera. The beads ride the path: they drift on their own when motion is allowed and
 * also advance with `progress`. Reduced motion: beads rest where the model has them.
 */
export function Loop({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("loop");
  const beads = useMemo(
    () => BEADS.map((n) => ({ o: node(n), t0: (node(n).userData.path_t as number) ?? 0 })),
    [node],
  );
  const clock = useRef(0);
  const pos = useRef({ x: 0, y: 0, z: 0 });

  const apply = useCallback(
    (p: number) => {
      if (reduced) return;
      for (const b of beads) {
        onPath(b.t0 + p * TURN + clock.current * SPEED, pos.current);
        b.o.position.set(pos.current.x, pos.current.y, pos.current.z);
      }
    },
    [beads, reduced],
  );
  usePose(apply, progress, progressRef);
  useFrame((_, dt) => {
    if (reduced) return;
    clock.current += dt;
    if (!progressRef) apply(progress);
  });

  return <primitive object={root} />;
}
