import { useMemo } from "react";
import { clayMaterial } from "../clayMaterial";
import { softBox } from "./shapes";
import type { ModelProps } from "./Loop";

const PRONG_Y = [0.38, -0.38];

/**
 * PLACEHOLDER for public/models/svc-plug.glb (Claude integration). A rounded plug with two prongs
 * between two soft clay blocks: the left block takes the prongs, the right one is where the lead
 * goes. The plug is mint: the connection is yours.
 */
export function SvcPlug({ progress, reduced }: ModelProps) {
  void progress;
  void reduced;
  const m = useMemo(
    () => ({
      block: softBox(1.5, 2.1, 1.7, 0.2),
      body: softBox(1.2, 1.3, 1.1, 0.26),
      grey: clayMaterial("warmGrey"),
      stone: clayMaterial("stone"),
      cream: clayMaterial("cream"),
      mint: clayMaterial("mint"),
    }),
    [],
  );
  return (
    <group rotation={[0.12, -0.35, 0]}>
      <mesh geometry={m.block} material={m.grey} position={[-2.65, 0, 0]} />
      {/* two socket slots pressed into the left block */}
      {PRONG_Y.map((y) => (
        <mesh key={y} position={[-1.9, y, 0]} material={m.stone} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.15, 0.2, 8, 16]} />
        </mesh>
      ))}
      {/* plug: body, two prongs reaching the socket, a stub of lead toward the right block */}
      <mesh geometry={m.body} material={m.mint} position={[0, 0, 0]} />
      {PRONG_Y.map((y) => (
        <mesh key={y} position={[-1.0, y, 0]} material={m.cream} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.13, 0.7, 8, 20]} />
        </mesh>
      ))}
      <mesh position={[1.1, 0, 0]} material={m.mint} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.24, 0.7, 8, 24]} />
      </mesh>
      <mesh geometry={m.block} material={m.stone} position={[2.65, 0, 0]} />
    </group>
  );
}
