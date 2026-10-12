"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { Loop } from "../models/Loop";

const REST = { x: 0.12, y: -0.28, z: 0 };

/**
 * Hero scene: the clay loop idles slowly, then tilts back and pushes away as the hero scrolls
 * out (hero progress from the scroll store). Reduced motion: rest pose, no idle, no scrub.
 */
export function HeroLoop({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const p = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("hero"), 4, dt);
    const t = state.clock.elapsedTime;
    const idleY = Math.sin(t * 0.32) * 0.3;
    const idleZ = Math.sin(t * 0.21) * 0.04;
    g.rotation.set(REST.x - p.current * 0.95, REST.y + idleY + p.current * 0.4, REST.z + idleZ);
    g.position.set(0, p.current * 0.5, -p.current * 3.2);
  });

  return (
    <group ref={group} rotation={[REST.x, REST.y, REST.z]}>
      <Loop progress={0} reduced={reduced} />
    </group>
  );
}
