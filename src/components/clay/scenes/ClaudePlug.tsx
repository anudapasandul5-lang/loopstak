"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFit } from "../glb";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { SvcPlug } from "../models/SvcPlug";
import type { StoryProps } from "./WebsiteBuild";

/**
 * Claude integration scene (plug.glb). The clay plug travels in over two tool blocks and drops into the gap; then the blocks swap to their mint copies. A pure function of progress, so it reverses cleanly. Reduced motion: connected, both blocks mint, motionless.
 */
export function ClaudePlug({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const scale = useFit(2.0, 1.55);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(0.4 + Math.sin(t * 0.3) * 0.02, -0.3 + p.current * 0.12 + Math.sin(t * 0.22) * 0.06, 0);
  });

  return (
    <group ref={root} position={[0, -0.55, 0]} scale={scale} rotation={[0.4, -0.3, 0]}>
      <Suspense fallback={null}>
        <SvcPlug progress={0} progressRef={p} reduced={reduced} />
      </Suspense>
    </group>
  );
}
