"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { KeyDoor } from "../models/KeyDoor";

/**
 * Keys scene: the "keys" progress (scrubbed, both ways) drives the stateless KeyDoor: the key
 * turns, then the door opens. Progress is eased toward the scroll value so jumps stay soft.
 * Reduced motion: key turned, door open, no sway.
 */
export function KeysDoor({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const cur = useRef(0);
  const [p, setP] = useState(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    cur.current = MathUtils.damp(cur.current, getProgress("keys"), 8, dt);
    const next = Math.round(cur.current * 1000) / 1000;
    if (next !== p) setP(next);
    g.rotation.y = -0.38 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
  });

  return (
    <group ref={group} position={[0.4, 0, 0]} rotation={[0.04, -0.38, 0]} scale={0.72}>
      <KeyDoor progress={p} reduced={reduced} />
    </group>
  );
}
