"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Color, MathUtils, TubeGeometry, Vector3, type Group, type Mesh } from "three";
import { getProgress } from "@/lib/scroll-store";
import { CLAY, clayMaterial } from "../clayMaterial";
import { softBox } from "../models/shapes";
import type { StoryProps } from "./WebsiteBuild";

const BLOCK_X = 2.95;
const BLOCK_W = 1.6;
const PRONG_Y = [0.34, -0.34];
const PLUG_START = -1.15; // plug body x at rest, beside the left block
const PLUG_END = 1.18; // plug body x when seated; prongs reach into the right block
const PLUG_HALF = 0.5;
const CABLE_R = 0.17;
const CABLE_LEN = 3.1; // fixed cable length: slack hangs as a loop, then pulls taut

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, v: number) => MathUtils.clamp((v - a) / (b - a), 0, 1);
const stone = new Color(CLAY.stone);
const grey = new Color(CLAY.warmGrey);
const mint = new Color(CLAY.mint);

/**
 * Claude integration scene. Two soft clay blocks stand apart ("Claude" and "your tools"). A clay plug on a
 * soft cable leaves the left block, travels across and seats into the right one; then both blocks turn
 * mint with a very faint emissive, still matte clay. Pure function of progress, so it reverses cleanly.
 * Reduced motion: connected, both mint, motionless.
 */
export function ClaudePlug({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const plug = useRef<Group>(null);
  const cable = useRef<Mesh>(null);
  const cableGeo = useRef<TubeGeometry | null>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const m = useMemo(
    () => ({
      block: softBox(BLOCK_W, 2.1, 1.7, 0.24),
      body: softBox(1, 1.2, 1, 0.26),
      left: clayMaterial("stone"),
      right: clayMaterial("warmGrey"),
      plug: clayMaterial("cream"),
      cable: clayMaterial("warmGrey"),
      slot: clayMaterial("warmGrey"),
    }),
    [],
  );
  useEffect(() => () => cableGeo.current?.dispose(), []);

  useFrame((state, dt) => {
    const g = root.current;
    const pl = plug.current;
    if (!g || !pl) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const prog = p.current;

    // Travel (lifted in the middle), then a straight push into the sockets.
    const run = smooth(0.08, 0.72, prog);
    const push = easeInOut(smooth(0.72, 0.82, prog));
    const x = PLUG_START + (PLUG_END - 0.22 - PLUG_START) * easeInOut(run) + 0.22 * push;
    const lift = Math.sin(run * Math.PI) * 0.55 * (1 - push);
    pl.position.set(x, lift, 0);
    pl.rotation.z = Math.sin(run * Math.PI) * 0.12;

    // Cable: from the left block's face to the back of the plug; slack sags, then pulls taut.
    const a = new Vector3(-BLOCK_X + BLOCK_W / 2 - 0.05, 0, 0);
    const b = new Vector3(x - PLUG_HALF + 0.05, lift, 0);
    const sag = Math.max(0, CABLE_LEN - a.distanceTo(b)) * 0.5;
    const pts = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const v = a.clone().lerp(b, t);
      v.y -= Math.sin(t * Math.PI) * sag;
      v.z += Math.sin(t * Math.PI) * sag * 0.25;
      return v;
    });
    const geo = new TubeGeometry(new CatmullRomCurve3(pts), 40, CABLE_R, 12, false);
    cableGeo.current?.dispose();
    cableGeo.current = geo;
    if (cable.current) cable.current.geometry = geo;

    // Both blocks go mint once connected: matte colour shift plus a very soft emissive.
    const lit = easeInOut(smooth(0.82, 1, prog));
    m.left.color.lerpColors(stone, mint, lit);
    m.right.color.lerpColors(grey, mint, lit);
    for (const mat of [m.left, m.right]) {
      mat.emissive.set(CLAY.mint);
      mat.emissiveIntensity = 0.16 * lit;
    }

    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(-0.14 + Math.sin(t * 0.3) * 0.03, -0.3 + prog * 0.12 + Math.sin(t * 0.22) * 0.06, 0);
  });

  return (
    <group ref={root} position={[0, -0.1, 0]} scale={0.62} rotation={[-0.14, -0.3, 0]}>
      <mesh geometry={m.block} material={m.left} position={[-BLOCK_X, 0, 0]} />
      <mesh geometry={m.block} material={m.right} position={[BLOCK_X, 0, 0]} />
      {/* sockets pressed into the right block */}
      {PRONG_Y.map((y) => (
        <mesh key={y} position={[BLOCK_X - BLOCK_W / 2 + 0.02, y, 0]} material={m.slot} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.17, 0.05, 8, 16]} />
        </mesh>
      ))}
      <mesh ref={cable} material={m.cable} />
      <group ref={plug}>
        <mesh geometry={m.body} material={m.plug} />
        {PRONG_Y.map((y) => (
          <mesh key={y} position={[PLUG_HALF + 0.3, y, 0]} material={m.plug} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.12, 0.45, 8, 20]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
