import { useMemo } from "react";
import { clayMaterial } from "../clayMaterial";
import { softGear } from "./shapes";
import type { ModelProps } from "./Loop";

const N = 6;
const TEETH = 10;
const RING = 1.9; // gears sit on a ring; neighbours are RING apart (hexagon)

/**
 * PLACEHOLDER for public/models/svc-gears.glb (AI agents and automation). A ring of six soft
 * rounded gears, warm grey, with one small mint bead at the centre (the part that is yours).
 */
export function SvcGears({ progress, reduced }: ModelProps) {
  void progress;
  void reduced;
  const m = useMemo(
    () => ({
      gear: softGear(TEETH, 0.8, 1.0, 0.42, 0.28),
      grey: clayMaterial("warmGrey"),
      stone: clayMaterial("stone"),
      mint: clayMaterial("mint"),
    }),
    [],
  );
  const tooth = (Math.PI * 2) / TEETH;
  return (
    <group rotation={[0.2, 0, 0]}>
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2 + Math.PI / 6;
        return (
          <mesh
            key={i}
            geometry={m.gear}
            material={i % 2 ? m.stone : m.grey}
            position={[Math.cos(a) * RING, Math.sin(a) * RING, 0]}
            rotation={[0, 0, (i % 2 ? tooth / 2 : 0) + a]}
          />
        );
      })}
      <mesh material={m.mint}>
        <sphereGeometry args={[0.42, 40, 28]} />
      </mesh>
    </group>
  );
}
