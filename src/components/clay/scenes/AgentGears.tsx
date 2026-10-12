"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  MathUtils,
  Path,
  Shape,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { getProgress } from "@/lib/scroll-store";
import { CLAY, clayMaterial } from "../clayMaterial";
import type { StoryProps } from "./WebsiteBuild";

// Six equal gears on an open ring (seven slots, the gap faces left). Pitch radius 1, so centres sit 2 apart.
const TEETH = 10;
const PITCH = (Math.PI * 2) / TEETH;
const SLOTS = 7;
const COUNT = 6;
const RING_R = 1 / Math.sin(Math.PI / SLOTS); // chord between neighbours = 2
const TIP = 1.08;
const ROOT = 0.9;
const BEVEL = 0.05;
const DEPTH = 0.3;
const TURN = 2.6; // radians the first gear turns across the whole scroll
const TOKEN_Z = 0.4;

// Gear i sits at this angle (radians, counter-clockwise from +x). Start at the upper left, go clockwise over the top.
const ANGLE0 = Math.PI - Math.PI / SLOTS;
const centres = Array.from({ length: COUNT }, (_, i) => {
  const a = ANGLE0 - (i * Math.PI * 2) / SLOTS;
  return new Vector3(Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0);
});

// Tooth phase so neighbours mesh: counter-rotating equal gears keep u_A + u_B = pitch / 2.
const phase0 = (() => {
  const out = [0];
  for (let i = 0; i < COUNT - 1; i++) {
    const psi = Math.atan2(centres[i + 1].y - centres[i].y, centres[i + 1].x - centres[i].x);
    const uA = out[i] - psi;
    out.push(psi + Math.PI + PITCH / 2 - uA);
  }
  return out;
})();

const smooth = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** One soft gear: rounded teeth, a hub hole, beveled edges. Matte and thick. */
function gearGeometry() {
  const shape = new Shape();
  const n = TEETH * 24;
  for (let k = 0; k < n; k++) {
    const th = (k / n) * Math.PI * 2;
    const t = ((th / PITCH) % 1) + 0.5;
    const d = Math.abs((t % 1) - 0.5) * 2; // 0 at tooth centre
    const h = 1 - smooth(0.3, 0.7, d);
    const r = ROOT + (TIP - ROOT) * h - BEVEL;
    const x = Math.cos(th) * r;
    const y = Math.sin(th) * r;
    if (k === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new Path();
  hole.absarc(0, 0, 0.34 + BEVEL, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelSize: BEVEL,
    bevelThickness: 0.07,
    bevelSegments: 5,
    curveSegments: 1,
  });
  geo.translate(0, 0, -DEPTH / 2);
  return geo;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const cream = new Color(CLAY.cream);
const mint = new Color(CLAY.mint);

/**
 * AI agents scene. A cream message token enters at the upper left, rides over a ring of clay gears (they turn as
 * it passes) and leaves at the lower left as the answer, turned mint because it is yours. Pure function of
 * progress, so scrolling back un-answers it. Reduced motion: finished, motionless, mint token at the exit.
 */
export function AgentGears({ reduced, progressId = "service-story", fixed }: StoryProps) {
  const root = useRef<Group>(null);
  const gears = useRef<Array<Mesh | null>>([]);
  const token = useRef<Group>(null);
  const p = useRef(fixed ?? (reduced ? 1 : 0));
  const geo = useMemo(() => gearGeometry(), []);
  const mats = useMemo(() => centres.map((_, i) => clayMaterial(i % 2 ? "stone" : "warmGrey")), []);
  const tokenMat = useMemo(() => clayMaterial("cream"), []);
  const base = useMemo(() => centres.map((_, i) => new Color(i % 2 ? CLAY.stone : CLAY.warmGrey)), []);
  const path = useMemo(() => {
    const first = centres[0];
    const last = centres[COUNT - 1];
    const pts = [
      new Vector3(first.x - 1.7, first.y + 0.5, TOKEN_Z),
      ...centres.map((c) => new Vector3(c.x, c.y, TOKEN_Z)),
      new Vector3(last.x - 1.7, last.y - 0.5, TOKEN_Z),
    ];
    return new CatmullRomCurve3(pts, false, "centripetal");
  }, []);
  const tmp = useMemo(() => new Color(), []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const target = reduced ? 1 : (fixed ?? getProgress(progressId));
    p.current = reduced || fixed !== undefined ? target : MathUtils.damp(p.current, target, 6, dt);
    const prog = p.current;

    // Token journey 0.06..0.88 along the path; mint 0.84..0.96; rests there until the end.
    const u = easeInOut(MathUtils.clamp((prog - 0.06) / 0.82, 0, 1));
    const tk = token.current;
    if (tk) {
      const pos = path.getPointAt(u);
      tk.position.copy(pos);
      const ahead = path.getPointAt(Math.min(1, u + 0.01));
      const slope = u < 1 ? Math.atan2(ahead.y - pos.y, ahead.x - pos.x) : 0;
      tk.rotation.z = MathUtils.clamp(Math.sin(slope) * 0.25, -0.3, 0.3);
      tk.scale.setScalar(0.7 + 0.3 * easeOut(MathUtils.clamp(prog / 0.06, 0, 1)));
      tk.visible = prog > 0;
    }
    tokenMat.color.lerpColors(cream, mint, easeOut(MathUtils.clamp((prog - 0.84) / 0.12, 0, 1)));

    // Gears turn together (neighbours counter-rotate) and warm slightly when the token is over them.
    const theta = easeInOut(prog) * TURN;
    const idx = u * (COUNT + 1) - 0.5; // roughly the gear the token is over
    centres.forEach((_, i) => {
      const gm = gears.current[i];
      if (!gm) return;
      gm.rotation.z = phase0[i] + (i % 2 ? -1 : 1) * theta;
      const near = 1 - MathUtils.clamp(Math.abs(idx - i) / 0.9, 0, 1);
      tmp.copy(base[i]).lerp(cream, near * 0.45 * (prog < 0.97 ? 1 : 0));
      (mats[i] as MeshStandardMaterial).color.copy(tmp);
    });

    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.set(-0.14 + Math.sin(t * 0.3) * 0.03, 0.12 + Math.sin(t * 0.22) * 0.07 - prog * 0.1, 0);
  });

  return (
    <group ref={root} position={[0.1, 0, 0]} scale={0.6}>
      {centres.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            gears.current[i] = el;
          }}
          geometry={geo}
          material={mats[i]}
          position={c}
          rotation={[0, 0, phase0[i]]}
        />
      ))}
      <group ref={token} position={[centres[0].x - 1.7, centres[0].y + 0.5, TOKEN_Z]}>
        <RoundedBox args={[1.8, 1.0, 0.34]} radius={0.28} smoothness={6} material={tokenMat} />
        {/* the little tail of the speech bubble */}
        <RoundedBox args={[0.34, 0.34, 0.3]} radius={0.1} smoothness={4} material={tokenMat} position={[-0.46, -0.6, 0]} rotation={[0, 0, Math.PI / 4]} />
      </group>
    </group>
  );
}
