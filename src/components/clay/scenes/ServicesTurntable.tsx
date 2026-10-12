"use client";

import { useMemo, useRef, type ComponentType } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { getProgress } from "@/lib/scroll-store";
import { clayMaterial } from "../clayMaterial";
import { softDisc } from "../models/shapes";
import { SvcSite } from "../models/SvcSite";
import { SvcGears } from "../models/SvcGears";
import { SvcPlug } from "../models/SvcPlug";
import { SvcTable } from "../models/SvcTable";
import type { ModelProps } from "../models/Loop";

/** Per model: scale that fits the 4:3 stage, and its y offset above the plinth. */
const ITEMS: { Model: ComponentType<ModelProps>; scale: number; y: number }[] = [
  { Model: SvcSite, scale: 0.82, y: -0.62 },
  { Model: SvcGears, scale: 0.5, y: 0.1 },
  { Model: SvcPlug, scale: 0.58, y: -0.74 },
  { Model: SvcTable, scale: 0.7, y: -0.94 },
];

export const SERVICE_COUNT = ITEMS.length;

/** Which item is active for a 0..1 progress through the pinned range. */
export const activeIndex = (p: number) => Math.min(SERVICE_COUNT - 1, Math.max(0, Math.floor(p * SERVICE_COUNT)));

/**
 * Services scene: a clay plinth turns slowly with the scroll; the four objects stand on it and
 * take turns, each one turning into view as the number changes (the outgoing one turns away and
 * shrinks). Reads the "services" progress. Reduced motion: item one at rest, no movement.
 */
export function ServicesTurntable({ reduced }: { reduced: boolean }) {
  const plinth = useRef<Group>(null);
  const items = useRef<(Group | null)[]>([]);
  const w = useRef<number[]>(ITEMS.map((_, i) => (i === 0 ? 1 : 0)));
  const p = useRef(0);
  const disc = useMemo(() => softDisc(2.2, 0.28, 0.12), []);
  const mat = useMemo(() => clayMaterial("stone"), []);
  const dot = useMemo(() => clayMaterial("warmGrey"), []);

  useFrame((state, dt) => {
    if (reduced) return;
    p.current = MathUtils.damp(p.current, getProgress("services"), 4, dt);
    const active = activeIndex(getProgress("services"));
    const t = state.clock.elapsedTime;
    if (plinth.current) plinth.current.rotation.y = p.current * Math.PI * 2 * 1.5 + t * 0.12;
    items.current.forEach((g, i) => {
      if (!g) return;
      w.current[i] = MathUtils.damp(w.current[i], i === active ? 1 : 0, 6, dt);
      const k = w.current[i];
      const { scale, y } = ITEMS[i];
      g.visible = k > 0.01;
      g.scale.setScalar(Math.max(0.0001, scale * (0.5 + 0.5 * k)));
      // enters from one side, leaves to the other; i < active has already turned away
      g.rotation.y = (1 - k) * (i < active ? 1.6 : -1.6) + Math.sin(t * 0.3) * 0.08 - 0.25;
      g.position.y = y - (1 - k) * 0.4;
    });
  });

  return (
    <group rotation={[0.2, 0, 0]} position={[0, 0.35, 0]} scale={0.95}>
      <group ref={plinth} position={[0, -1.5, 0]}>
        <mesh geometry={disc} material={mat} />
        {/* one notch so the plinth's turn reads even when nothing sits on it */}
        <mesh position={[1.85, 0.17, 0]} material={dot}>
          <sphereGeometry args={[0.16, 24, 16]} />
        </mesh>
      </group>
      {ITEMS.map(({ Model, scale, y }, i) => (
        <group
          key={i}
          ref={(g) => {
            items.current[i] = g;
          }}
          scale={i === 0 ? scale : 0.0001}
          position={[0, y, 0]}
          visible={i === 0}
        >
          <Model progress={0} reduced={reduced} />
        </group>
      ))}
    </group>
  );
}

/** One object at rest on a small plinth, for the phone / reduced-motion list. */
export function ServiceRest({ index }: { index: number }) {
  const mat = useMemo(() => clayMaterial("stone"), []);
  const disc = useMemo(() => softDisc(2.2, 0.28, 0.12), []);
  const { Model, scale, y } = ITEMS[index];
  return (
    <group rotation={[0.2, 0, 0]} position={[0, 0.35, 0]} scale={0.95}>
      <mesh geometry={disc} material={mat} position={[0, -1.5, 0]} />
      <group scale={scale} position={[0, y, 0]} rotation={[0, -0.25, 0]}>
        <Model progress={0} reduced />
      </group>
    </group>
  );
}
