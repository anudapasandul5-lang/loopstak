"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFit } from "../glb";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { SvcSite } from "../models/SvcSite";

export type StoryProps = {
  reduced: boolean;
  /** Scroll-store id to follow. Ignored when `fixed` is set. */
  progressId?: string;
  /** Hold a fixed progress (0..1), for example 1 for the finished scene in the hero. */
  fixed?: number;
};

/**
 * Website design scene (site.glb). The clay page assembles part by part: base, browser bar, title, subtitle,
 * picture, cards, and the mint button last. A pure function of progress, so scrolling back takes it apart.
 * Reduced motion: finished, motionless.
 */
export function WebsiteBuild({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const scale = useFit(1.7, 1.9);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(0.5 + Math.sin(t * 0.3) * 0.02, -0.42 + p.current * 0.25 + Math.sin(t * 0.22) * 0.06, 0);
  });

  return (
    <group ref={root} position={[0, -0.15, 0]} scale={scale} rotation={[0.5, -0.42, 0]}>
      <Suspense fallback={null}>
        <SvcSite progress={0} progressRef={p} reduced={reduced} />
      </Suspense>
    </group>
  );
}
