"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFit } from "../glb";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { SvcTable } from "../models/SvcTable";
import type { StoryProps } from "./WebsiteBuild";

/**
 * AI teaching scene (table.glb). A clay table and a board with one mint line; faceless figures rise one by one, seat by seat. A pure function of progress, so scrolling back empties the table. Reduced motion: all seated.
 */
export function TeachingTable({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const scale = useFit(2.1, 1.4);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(0.5 + Math.sin(t * 0.3) * 0.02, -0.5 + p.current * 0.4 + Math.sin(t * 0.22) * 0.06, 0);
  });

  return (
    <group ref={root} position={[0, -0.9, 0]} scale={scale} rotation={[0.5, -0.5, 0]}>
      {/* the board sits off to one side: shift the model so table plus board is centred */}
      <group position={[-0.4, 0, 0]}>
        <Suspense fallback={null}>
          <SvcTable progress={0} progressRef={p} reduced={reduced} />
        </Suspense>
      </group>
    </group>
  );
}
