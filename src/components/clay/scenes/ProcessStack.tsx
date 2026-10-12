"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { Stack } from "../models/Stack";

/**
 * Process scene: the six slabs drop in as the "process" progress rises. Progress is eased
 * toward the scroll value (so jumps stay soft) and handed to the stateless Stack, which is
 * re-posed only while the value is actually moving. Reduced motion: finished stack.
 */
export function ProcessStack({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const cur = useRef(0);
  const [p, setP] = useState(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    cur.current = MathUtils.damp(cur.current, getProgress("process"), 9, dt);
    const next = Math.round(cur.current * 1000) / 1000;
    if (next !== p) setP(next);
    g.rotation.y = -0.55 + Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
  });

  return (
    <group ref={group} position={[0, -0.05, 0]} rotation={[0.28, -0.55, 0]} scale={0.95}>
      <Stack progress={p} reduced={reduced} />
    </group>
  );
}
