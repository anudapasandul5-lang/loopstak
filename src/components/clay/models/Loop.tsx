import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { clayMaterial } from "../clayMaterial";

export type ModelProps = { progress: number; reduced: boolean };

const BEADS = 8;

/** Lemniscate (infinity) path; the two crossings sit at different depths so the tube never self-intersects. */
function loopCurve() {
  const pts: Vector3[] = [];
  const n = 96;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    pts.push(new Vector3((2.5 * Math.cos(t)) / d, (2.5 * Math.sin(t) * Math.cos(t)) / d, 0.5 * Math.sin(t)));
  }
  return new CatmullRomCurve3(pts, true, "centripetal");
}

/**
 * PLACEHOLDER for public/models/loop.glb. A smooth rounded tube along an infinity loop, warm grey,
 * with mint beads (the "yours" part). Static geometry: the scene animates the group around it.
 */
export function Loop({ progress, reduced }: ModelProps) {
  void progress;
  void reduced;
  const { curve, tube, bead, beadPoints } = useMemo(() => {
    const curve = loopCurve();
    return {
      curve,
      tube: clayMaterial("warmGrey"),
      bead: clayMaterial("mint"),
      beadPoints: Array.from({ length: BEADS }, (_, i) => curve.getPointAt((i + 0.5) / BEADS)),
    };
  }, []);

  return (
    <group>
      <mesh material={tube}>
        <tubeGeometry args={[curve, 220, 0.26, 36, true]} />
      </mesh>
      {beadPoints.map((p, i) => (
        <mesh key={i} position={p} material={bead}>
          <sphereGeometry args={[0.33, 36, 24]} />
        </mesh>
      ))}
    </group>
  );
}
