import { useMemo } from "react";
import { clayMaterial } from "../clayMaterial";
import { softBox } from "./shapes";
import type { ModelProps } from "./Loop";

/**
 * PLACEHOLDER for public/models/svc-site.glb (Website design). A rounded clay slab with raised
 * blocks like a page layout; the slab on top is mint, because the site is "yours".
 */
export function SvcSite({ progress, reduced }: ModelProps) {
  void progress;
  void reduced;
  const m = useMemo(() => {
    // x, z, w, d on the base slab
    const blocks: [number, number, number, number][] = [
      [-0.9, -0.85, 1.8, 0.6], // header
      [-1.1, 0.35, 1.4, 1.3], // main column
      [0.9, 0.0, 1.1, 0.7], // side card
      [0.9, 0.95, 1.1, 0.6], // side card
    ];
    return {
      base: softBox(4.2, 0.4, 3.0, 0.14),
      top: softBox(3.5, 0.26, 2.3, 0.1),
      head: softBox(1.5, 0.14, 0.4, 0.05),
      panel: softBox(1.0, 0.14, 0.9, 0.05),
      blocks: blocks.map(([x, z, w, d]) => ({ x, z, g: softBox(w, 0.22, d, 0.07) })),
      grey: clayMaterial("warmGrey"),
      stone: clayMaterial("stone"),
      cream: clayMaterial("cream"),
      mint: clayMaterial("mint"),
    };
  }, []);

  return (
    <group rotation={[0.1, 0, 0]}>
      <mesh geometry={m.base} material={m.grey} position={[0, -0.7, 0]} />
      {m.blocks.map((b, i) => (
        <mesh key={i} geometry={b.g} material={i % 2 ? m.cream : m.stone} position={[b.x, -0.4, b.z]} />
      ))}
      {/* the mint slab floats above: the finished site, yours */}
      <group position={[0, 0.5, 0]}>
        <mesh geometry={m.top} material={m.mint} />
        <mesh geometry={m.head} material={m.cream} position={[-0.7, 0.2, -0.7]} />
        <mesh geometry={m.panel} material={m.cream} position={[0.9, 0.2, 0.3]} />
      </group>
    </group>
  );
}
