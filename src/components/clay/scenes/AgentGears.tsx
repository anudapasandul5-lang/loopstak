"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFit } from "../glb";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { SvcGears } from "../models/SvcGears";
import type { StoryProps } from "./WebsiteBuild";

/**
 * AI agents scene (gears.glb). The cream message slides in from the left and shrinks into the ring of clay gears, which turn while it passes; the mint reply grows out of the ring and slides to the right. A pure function of progress, so scrolling back un-answers it. Reduced motion: finished, only the mint reply.
 */
export function AgentGears({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const scale = useFit(3.3, 1.0);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(0.5 + Math.sin(t * 0.3) * 0.02, 0.12 + p.current * -0.1 + Math.sin(t * 0.22) * 0.06, 0);
  });

  return (
    <group ref={root} position={[0, -0.2, 0]} scale={scale} rotation={[0.5, 0.12, 0]}>
      <Suspense fallback={null}>
        <SvcGears progress={0} progressRef={p} reduced={reduced} />
      </Suspense>
    </group>
  );
}
