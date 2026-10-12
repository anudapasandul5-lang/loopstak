"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, MathUtils, type Group, type Material, type MeshStandardMaterial } from "three";
import { getProgress } from "@/lib/scroll-store";
import { CLAY, clayMaterial, type ClayTone } from "../clayMaterial";

export type StoryProps = {
  reduced: boolean;
  /** Scroll-store id to follow. Ignored when `fixed` is set. */
  progressId?: string;
  /** Hold a fixed progress (0..1), for example 1 for the finished site in the hero. */
  fixed?: number;
};

type Part = {
  size: [number, number, number];
  pos: [number, number, number];
  tone: ClayTone;
  /** Progress window in which the slab arrives. */
  from: number;
  to: number;
  /** Where it arrives from, relative to its place. */
  away: [number, number, number];
  radius: number;
};

// A browser-like site made of clay slabs. Front face of the base sits at z = 0.14.
const PARTS: Part[] = [
  { size: [4.4, 3.0, 0.28], pos: [0, 0, 0], tone: "stone", from: 0, to: 0.2, away: [0, -2.2, 0], radius: 0.14 }, // base
  { size: [4.0, 0.4, 0.16], pos: [0, 1.05, 0.21], tone: "warmGrey", from: 0.2, to: 0.34, away: [0, 2.2, 0.6], radius: 0.08 }, // header bar
  { size: [1.9, 1.3, 0.16], pos: [-1.0, 0.1, 0.21], tone: "cream", from: 0.34, to: 0.48, away: [-2.4, 0, 0.8], radius: 0.08 }, // image block
  { size: [1.7, 0.22, 0.12], pos: [1.05, 0.55, 0.19], tone: "warmGrey", from: 0.48, to: 0.58, away: [2.4, 0, 0.6], radius: 0.06 }, // text blocks
  { size: [1.5, 0.22, 0.12], pos: [0.95, 0.17, 0.19], tone: "warmGrey", from: 0.56, to: 0.66, away: [2.4, 0, 0.6], radius: 0.06 },
  { size: [1.2, 0.22, 0.12], pos: [0.8, -0.21, 0.19], tone: "warmGrey", from: 0.64, to: 0.74, away: [2.4, 0, 0.6], radius: 0.06 },
  { size: [1.4, 0.42, 0.16], pos: [-1.0, -0.95, 0.21], tone: "warmGrey", from: 0.72, to: 0.84, away: [0, -2.2, 0.8], radius: 0.08 }, // button
  { size: [3.2, 0.3, 0.2], pos: [0, 1.82, 0.04], tone: "stone", from: 0.82, to: 0.92, away: [0, 2.4, 0], radius: 0.1 }, // top slab: your web address
];
const TOP = PARTS.length - 1;
const MINT_FROM = 0.92;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const stone = new Color(CLAY.stone);
const mint = new Color(CLAY.mint);

/**
 * Website design scene. A clay site assembles slab by slab: base, header bar, image block, text blocks,
 * button, then the top slab (the web address) turns mint, because it is yours. The pose is a pure
 * function of progress, so scrolling back takes it apart again. Reduced motion: finished, motionless.
 */
export function WebsiteBuild({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const slabs = useRef<Array<Group | null>>([]);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const materials = useMemo(() => PARTS.map((part) => clayMaterial(part.tone)), []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const prog = p.current;

    PARTS.forEach((part, i) => {
      const slab = slabs.current[i];
      if (!slab) return;
      const t = MathUtils.clamp((prog - part.from) / (part.to - part.from), 0, 1);
      const e = easeOut(t);
      slab.visible = t > 0;
      slab.position.set(part.pos[0] + part.away[0] * (1 - e), part.pos[1] + part.away[1] * (1 - e), part.pos[2] + part.away[2] * (1 - e));
      slab.scale.setScalar(0.92 + 0.08 * e);
    });
    const m = easeOut(MathUtils.clamp((prog - MINT_FROM) / (1 - MINT_FROM), 0, 1));
    (materials[TOP] as MeshStandardMaterial).color.lerpColors(stone, mint, m);

    // Gentle turn: a little more face-on as it finishes. Idle sway only when motion is allowed.
    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(-0.16 + Math.sin(t * 0.3) * 0.03, -0.42 + prog * 0.2 + Math.sin(t * 0.22) * 0.08, 0);
  });

  return (
    <group ref={root} position={[0, -0.18, 0]} scale={0.82} rotation={[-0.16, -0.22, 0]}>
      {PARTS.map((part, i) => (
        <group
          key={i}
          ref={(el) => {
            slabs.current[i] = el;
          }}
          position={part.pos}
        >
          <RoundedBox args={part.size} radius={part.radius} smoothness={5} material={materials[i] as Material} />
        </group>
      ))}
    </group>
  );
}
