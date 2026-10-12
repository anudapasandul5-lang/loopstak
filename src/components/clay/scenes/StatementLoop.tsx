"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFit } from "../glb";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { Loop } from "../models/Loop";

const REST = { x: 0.5, y: 0.2, z: -0.1 };

/**
 * Statement scene: the loop starts face-on and, as the statement scrolls past, swings edge-on
 * while stretching out along x, as if uncoiling. Scrubbed from the "statement" progress.
 * Reduced motion: still, face-on pose.
 */
export function StatementLoop({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const p = useRef(0);
  const base = useFit(2.4, 1.05);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("statement"), 5, dt);
    const t = state.clock.elapsedTime;
    const e = p.current;
    g.rotation.set(REST.x + Math.sin(t * 0.25) * 0.05, REST.y + e * 1.4, REST.z + e * 0.25);
    g.scale.set(base * (1 + e * 0.3), base * (1 - e * 0.18), base);
    g.position.set(-e * 0.6, (e - 0.5) * 0.5, 0);
  });

  return (
    <group ref={group} rotation={[REST.x, REST.y, REST.z]} scale={base}>
      <Loop progress={0} reduced={reduced} />
    </group>
  );
}
