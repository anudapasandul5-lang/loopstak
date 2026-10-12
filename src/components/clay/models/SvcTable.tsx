import { useMemo } from "react";
import { clayMaterial } from "../clayMaterial";
import { softBox, softDisc } from "./shapes";
import type { ModelProps } from "./Loop";

const SEATS = 4;
const HEIGHTS = [0.78, 0.64, 0.86, 0.7];

/**
 * PLACEHOLDER for public/models/svc-table.glb (AI teaching). A round table with four faceless
 * figures: a capsule body and a sphere head each. No faces, no limbs: abstract, not cute.
 * The small mint block on the table is the part that is yours.
 */
export function SvcTable({ progress, reduced }: ModelProps) {
  void progress;
  void reduced;
  const m = useMemo(
    () => ({
      top: softDisc(1.7, 0.2, 0.09),
      foot: softDisc(0.95, 0.16, 0.07),
      note: softBox(0.62, 0.1, 0.46, 0.04),
      grey: clayMaterial("warmGrey"),
      stone: clayMaterial("stone"),
      cream: clayMaterial("cream"),
      mint: clayMaterial("mint"),
    }),
    [],
  );
  return (
    <group rotation={[0.2, 0, 0]} position={[0, -0.5, 0]}>
      <mesh geometry={m.foot} material={m.grey} position={[0, -0.55, 0]} />
      <mesh material={m.grey}>
        <cylinderGeometry args={[0.22, 0.3, 1.0, 32]} />
      </mesh>
      <mesh geometry={m.top} material={m.stone} position={[0, 0.5, 0]} />
      <mesh geometry={m.note} material={m.mint} position={[0.1, 0.65, 0.1]} rotation={[0, 0.4, 0]} />
      {Array.from({ length: SEATS }, (_, i) => {
        const a = (i / SEATS) * Math.PI * 2 + Math.PI / 4;
        const h = HEIGHTS[i];
        const tone = i % 2 ? m.cream : m.stone;
        return (
          <group key={i} position={[Math.cos(a) * 2.35, -0.1, Math.sin(a) * 2.35]}>
            <mesh material={tone} position={[0, h / 2 + 0.36, 0]}>
              <capsuleGeometry args={[0.36, h, 10, 24]} />
            </mesh>
            <mesh material={tone} position={[0, h + 0.36 * 2 + 0.2, 0]}>
              <sphereGeometry args={[0.3, 32, 22]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
