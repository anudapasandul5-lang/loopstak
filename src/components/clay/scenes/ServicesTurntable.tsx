"use client";

import { Suspense, useRef, useState, type ComponentType } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { REST, SvcGears } from "../models/SvcGears";
import { SvcPlug } from "../models/SvcPlug";
import { SvcSite } from "../models/SvcSite";
import { SvcTable } from "../models/SvcTable";
import type { ModelProps } from "../glb";
import { SERVICE_COUNT, activeIndex } from "../turntable-index";

/** Per model: its GLB shown at rest (finished), the scale that fits the 4:3 stage and its y offset. */
const ITEMS: { Model: ComponentType<ModelProps>; progress: number; scale: number; y: number; half: number }[] = [
  { Model: SvcSite, progress: 1, scale: 1.8, y: -0.3, half: 1.5 },
  { Model: SvcGears, progress: REST, scale: 0.95, y: -0.2, half: 3.3 },
  { Model: SvcPlug, progress: 1, scale: 1.5, y: -0.6, half: 2.0 },
  { Model: SvcTable, progress: 1, scale: 1.45, y: -0.8, half: 2.4 },
];


/**
 * Services scene: the four Blender objects take turns. Each one turns into view as the number changes (the
 * outgoing one turns away and shrinks) and keeps a slow turn with the scroll. Reads the "services" progress.
 * Reduced motion: item one at rest, no movement. Items load one by one as they are first needed.
 */
export function ServicesTurntable({ reduced }: { reduced: boolean }) {
  const items = useRef<(Group | null)[]>([]);
  const w = useRef<number[]>(ITEMS.map((_, i) => (i === 0 ? 1 : 0)));
  const p = useRef(0);
  const width = useThree((st) => st.viewport.width);
  const [seen, setSeen] = useState(1); // bit i set once item i has been (nearly) active: only then is its GLB fetched

  useFrame((state, dt) => {
    if (reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("services"), 4, dt);
    const active = activeIndex(getProgress("services"));
    const want = seen | (1 << active) | (1 << Math.min(SERVICE_COUNT - 1, active + 1));
    if (want !== seen) setSeen(want);
    const t = state.clock.elapsedTime;
    items.current.forEach((g, i) => {
      if (!g) return;
      w.current[i] = MathUtils.damp(w.current[i], i === active ? 1 : 0, 6, dt);
      const k = w.current[i];
      const { scale: s0, y, half } = ITEMS[i];
      const scale = Math.min(s0, (width * 0.46) / half);
      g.visible = k > 0.01;
      g.scale.setScalar(Math.max(0.0001, scale * (0.5 + 0.5 * k)));
      // enters from one side, leaves to the other; i < active has already turned away
      g.rotation.y = (1 - k) * (i < active ? 1.6 : -1.6) + Math.sin(t * 0.3) * 0.08 - 0.25 + p.current * 0.6;
      g.position.y = y - (1 - k) * 0.4;
    });
  });

  return (
    <group rotation={[0.45, 0, 0]} position={[0, 0.1, 0]}>
      {ITEMS.map(({ Model, progress, scale, y }, i) => (
        <group
          key={i}
          ref={(g) => {
            items.current[i] = g;
          }}
          scale={i === 0 ? scale : 0.0001}
          position={[0, y, 0]}
          visible={i === 0}
        >
          {(seen & (1 << i)) !== 0 && (
            <Suspense fallback={null}>
              <Model progress={progress} reduced />
            </Suspense>
          )}
        </group>
      ))}
    </group>
  );
}

/** One object at rest, for the phone / reduced-motion list. */
export function ServiceRest({ index }: { index: number }) {
  const { Model, progress, scale: s0, y, half } = ITEMS[index];
  const scale = Math.min(s0, (useThree((st) => st.viewport.width) * 0.46) / half);
  return (
    <group rotation={[0.45, 0, 0]} position={[0, 0.1, 0]}>
      <group scale={scale} position={[0, y, 0]} rotation={[0, -0.25, 0]}>
        <Suspense fallback={null}>
          <Model progress={progress} reduced />
        </Suspense>
      </group>
    </group>
  );
}
