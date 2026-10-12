"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { Loop } from "../models/Loop";

const REST = { x: 0.1, y: -0.2, z: 0 };

/**
 * Contact scene: the small loop rolls in from the side and settles as the section enters
 * ("contact" progress, scrubbed). It rolls about z while sliding, rocks a hair on arrival, then
 * rests. Reduced motion: at rest.
 */
export function ContactLoop({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const p = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("contact"), 6, dt);
    const e = p.current;
    const slide = 1 - Math.pow(1 - e, 3); // 0 to 1, eased out
    const left = 1 - slide;
    const rock = Math.sin(e * Math.PI) * 0.05 * (1 - e);
    g.position.set(left * 3.4, 0, 0);
    g.rotation.set(
      REST.x + rock,
      REST.y + left * 0.8 + Math.sin(state.clock.elapsedTime * 0.3) * 0.04 * slide,
      REST.z - left * Math.PI * 1.6,
    );
  });

  return (
    <group ref={group} rotation={[REST.x, REST.y, REST.z]} scale={0.7}>
      <Loop progress={0} reduced={reduced} />
    </group>
  );
}
