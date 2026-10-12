"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type Material } from "three";
import { getProgress } from "@/lib/scroll-store";
import { clayMaterial, type ClayTone } from "../clayMaterial";
import { softBox, softDisc } from "../models/shapes";
import type { StoryProps } from "./WebsiteBuild";

const SEATS = 7;
const RING = 2.15; // seat distance from the table centre
const TONES: ClayTone[] = ["stone", "cream", "warmGrey", "cream", "stone", "warmGrey", "cream"];
const BODY = [0.5, 0.42, 0.56, 0.46, 0.52, 0.4, 0.5]; // capsule lengths, so no two read alike
const SEAT_Y = -0.3; // top of the seat pad
const START = 0.04;
const STEP = 0.115; // one figure after another
const WINDOW = 0.17;
const MINT_FROM = 0.9;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function angle(i: number) {
  return Math.PI * 0.5 + (i / SEATS) * Math.PI * 2;
}

/**
 * AI teaching scene. A round clay table with empty seats. As you scroll, faceless figures (a rounded
 * body and a round head, nothing else) slide in and sit down one by one. At the end a small mint
 * slab rises in the middle of the table: the skill that is now yours. The pose is a pure function of
 * progress, so scrolling back empties the table again. Reduced motion: all seated, mint slab present.
 */
export function TeachingTable({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const figs = useRef<Array<Group | null>>([]);
  const slab = useRef<Group>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));

  const m = useMemo(
    () => ({
      top: softDisc(1.55, 0.16, 0.08),
      foot: softDisc(0.9, 0.14, 0.06),
      pad: softDisc(0.42, 0.1, 0.05),
      slab: softBox(0.8, 0.1, 0.52, 0.04),
      grey: clayMaterial("warmGrey"),
      stone: clayMaterial("stone"),
      mint: clayMaterial("mint"),
      figure: TONES.map((t) => clayMaterial(t)),
    }),
    [],
  );

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const prog = p.current;

    for (let i = 0; i < SEATS; i++) {
      const f = figs.current[i];
      if (!f) continue;
      const t = MathUtils.clamp((prog - (START + i * STEP)) / WINDOW, 0, 1);
      const e = easeOut(t);
      const a = angle(i);
      const r = RING + 1.3 * (1 - e); // slides in from outside the ring
      f.visible = t > 0;
      f.position.set(Math.cos(a) * r, -1.0 * (1 - e), Math.sin(a) * r); // and rises from below
      f.scale.setScalar(0.9 + 0.1 * e);
    }

    const s = slab.current;
    if (s) {
      const t = easeOut(MathUtils.clamp((prog - MINT_FROM) / (1 - MINT_FROM), 0, 1));
      s.visible = t > 0;
      s.position.y = 0.34 + 0.5 * (1 - t);
      s.scale.setScalar(0.6 + 0.4 * t);
    }

    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(0.5 + Math.sin(t * 0.3) * 0.02, -0.5 + prog * 0.5 + Math.sin(t * 0.22) * 0.06, 0);
  });

  return (
    <group ref={root} position={[0, -0.15, 0]} scale={0.88} rotation={[0.5, -0.5, 0]}>
      <mesh geometry={m.foot} material={m.grey} position={[0, -0.9, 0]} />
      <mesh material={m.grey} position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.24, 0.32, 1.0, 32]} />
      </mesh>
      <mesh geometry={m.top} material={m.stone} position={[0, 0.2, 0]} />
      <group ref={slab} position={[0, 0.34, 0]} rotation={[0, 0.4, 0]}>
        <mesh geometry={m.slab} material={m.mint} />
      </group>
      {Array.from({ length: SEATS }, (_, i) => {
        const a = angle(i);
        const body = BODY[i];
        return (
          <group key={i}>
            <mesh geometry={m.pad} material={m.grey} position={[Math.cos(a) * RING, SEAT_Y - 0.05, Math.sin(a) * RING]} />
            <group
              ref={(el) => {
                figs.current[i] = el;
              }}
              position={[Math.cos(a) * RING, 0, Math.sin(a) * RING]}
            >
              <mesh material={m.figure[i] as Material} position={[0, SEAT_Y + 0.3 + body / 2, 0]}>
                <capsuleGeometry args={[0.3, body, 10, 24]} />
              </mesh>
              <mesh material={m.figure[i] as Material} position={[0, SEAT_Y + 0.6 + body + 0.2, 0]}>
                <sphereGeometry args={[0.24, 32, 22]} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
