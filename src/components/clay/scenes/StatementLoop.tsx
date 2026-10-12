"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { Loop } from "../models/Loop";

const REST = { x: 0.1, y: 0, z: -0.25 };
const BASE = 0.72; // keeps the stretched loop inside the canvas

/**
 * Statement scene: the loop starts face-on and, as the statement scrolls past, swings edge-on
 * while stretching out along x, as if uncoiling. Scrubbed from the "statement" progress.
 * Reduced motion: still, face-on pose.
 */
export function StatementLoop({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const p = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("statement"), 5, dt);
    const t = state.clock.elapsedTime;
    const e = p.current;
    g.rotation.set(REST.x + Math.sin(t * 0.25) * 0.05, REST.y + e * 1.4, REST.z + e * 0.5);
    g.scale.set(BASE * (1 + e * 0.3), BASE * (1 - e * 0.18), BASE);
    g.position.set(-e * 0.6, (e - 0.5) * 0.5, 0);
  });

  return (
    <group ref={group} rotation={[REST.x, REST.y, REST.z]} scale={BASE}>
      <Loop progress={0} reduced={reduced} />
    </group>
  );
}
