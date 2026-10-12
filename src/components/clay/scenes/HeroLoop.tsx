"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { preloadClayGlb, useFit } from "../glb";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { Loop } from "../models/Loop";

// The hero loop is the first thing on the page: start fetching it as soon as the script runs.
if (typeof window !== "undefined") preloadClayGlb("loop");

const REST = { x: 0.5, y: -0.28, z: 0 }; // the model lies flat; tilted toward the camera like the Blender still

/**
 * Hero scene: the clay loop idles slowly, then tilts back and pushes away as the hero scrolls
 * out (hero progress from the scroll store). Reduced motion: rest pose, no idle, no scrub.
 */
export function HeroLoop({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const p = useRef(0);
  const scale = useFit(1.95, 1.6);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("hero"), 4, dt);
    const t = state.clock.elapsedTime;
    const idleY = Math.sin(t * 0.32) * 0.3;
    const idleZ = Math.sin(t * 0.21) * 0.04;
    g.rotation.set(REST.x - p.current * 0.7, REST.y + idleY + p.current * 0.4, REST.z + idleZ);
    g.position.set(0, p.current * 0.5, -p.current * 3.2);
  });

  return (
    <group ref={group} rotation={[REST.x, REST.y, REST.z]} scale={scale}>
      <Loop progress={0} reduced={reduced} />
    </group>
  );
}
