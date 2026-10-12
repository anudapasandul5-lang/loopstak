import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { clayMaterial, type ClayTone } from "../clayMaterial";
import type { ModelProps } from "./Loop";

/** Slabs bottom to top. The top one is mint: it is "yours". Widths differ a little on purpose. */
const SLABS: { w: number; tone: ClayTone; dx: number; ry: number }[] = [
  { w: 3.5, tone: "warmGrey", dx: 0.0, ry: 0.0 },
  { w: 3.1, tone: "stone", dx: 0.1, ry: 0.05 },
  { w: 3.4, tone: "cream", dx: -0.08, ry: -0.04 },
  { w: 2.9, tone: "warmGrey", dx: 0.06, ry: 0.06 },
  { w: 3.2, tone: "stone", dx: -0.1, ry: -0.05 },
  { w: 2.8, tone: "mint", dx: 0.04, ry: 0.03 },
];
const DEPTH = 2.3;
const THICK = 0.36; // body thickness; the bevel adds a bit on top and bottom
const BEVEL = 0.09;
const PITCH = 0.5; // slab-to-slab spacing in the finished stack
const START = 0.15; // each slab starts this much later in progress than the one below
const SPAN = 0.25; // and takes this much progress to land (the last one ends at exactly 1)
const FALL = 5.5; // how far above its resting place a slab starts

function slabGeometry(w: number) {
  const r = 0.55;
  const hw = w / 2;
  const hd = DEPTH / 2;
  const s = new Shape();
  s.moveTo(-hw + r, -hd);
  s.lineTo(hw - r, -hd);
  s.absarc(hw - r, -hd + r, r, -Math.PI / 2, 0, false);
  s.lineTo(hw, hd - r);
  s.absarc(hw - r, hd - r, r, 0, Math.PI / 2, false);
  s.lineTo(-hw + r, hd);
  s.absarc(-hw + r, hd - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-hw, -hd + r);
  s.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5, false);
  const g = new ExtrudeGeometry(s, {
    depth: THICK,
    bevelEnabled: true,
    bevelSize: BEVEL,
    bevelThickness: BEVEL,
    bevelSegments: 6,
    curveSegments: 28,
  });
  g.rotateX(-Math.PI / 2); // shape plane becomes the floor, thickness points up
  g.center();
  return g;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Pose of slab `i` for a given progress. Pure: same progress, same pose, scrubbing either way. */
export function slabPose(i: number, progress: number) {
  const t = clamp01((progress - i * START) / SPAN);
  const fall = easeOut(Math.min(1, t / 0.8)); // drops over the first 80%, then settles
  const land = clamp01((t - 0.72) / 0.28);
  const squash = t < 1 ? 0.05 * Math.sin(Math.PI * land) : 0; // tiny and brief
  const rest = (i - (SLABS.length - 1) / 2) * PITCH;
  const s = SLABS[i];
  return {
    visible: t > 0,
    y: rest + (1 - fall) * FALL,
    x: s.dx * fall,
    ry: s.ry * fall + (1 - fall) * 0.25,
    sy: 1 - squash,
    sxz: 1 + squash * 0.6,
  };
}

/**
 * PLACEHOLDER for public/models/stack.glb. Six soft rounded clay slabs that drop in one by one as
 * `progress` goes 0..1; the top slab is mint. Reduced motion: all six at rest. No internal state.
 */
export function Stack({ progress, reduced }: ModelProps) {
  const parts = useMemo(
    () => SLABS.map((s) => ({ geo: slabGeometry(s.w), mat: clayMaterial(s.tone) })),
    [],
  );
  const p = reduced ? 1 : progress;
  return (
    <group>
      {parts.map((part, i) => {
        const o = slabPose(i, p);
        return (
          <mesh
            key={i}
            geometry={part.geo}
            material={part.mat}
            visible={o.visible}
            position={[o.x, o.y, 0]}
            rotation={[0, o.ry, 0]}
            scale={[o.sxz, o.sy, o.sxz]}
          />
        );
      })}
    </group>
  );
}
