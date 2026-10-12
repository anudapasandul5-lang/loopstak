import { ExtrudeGeometry, LatheGeometry, Path, Shape, Vector2, type BufferGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** Soft-edged box. three's own example geometry (not drei), so edges read as pressed clay. */
export function softBox(w: number, h: number, d: number, r = 0.08): BufferGeometry {
  return new RoundedBoxGeometry(w, h, d, 5, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
}

/** A disc with a rounded rim (lathe), thickness `h`, centred on y = 0. */
export function softDisc(radius: number, h: number, r = 0.08): BufferGeometry {
  const pts: Vector2[] = [new Vector2(0, -h / 2)];
  const k = Math.min(r, h / 2, radius);
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new Vector2(radius - k + Math.sin(a) * k, -h / 2 + k - Math.cos(a) * k));
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new Vector2(radius - k + Math.cos(a) * k, h / 2 - k + Math.sin(a) * k));
  }
  pts.push(new Vector2(0, h / 2));
  return new LatheGeometry(pts, 64);
}

/** A flat gear with blunt, bevelled teeth, extruded along z and centred. */
export function softGear(teeth: number, root: number, tip: number, thick: number, hole: number): BufferGeometry {
  const s = new Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [root, a - step * 0.28],
      [tip, a - step * 0.14],
      [tip, a + step * 0.14],
      [root, a + step * 0.28],
    ];
    pts.forEach(([rad, ang], j) => {
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0 && j === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const h = new Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  const bevel = thick * 0.28;
  const g = new ExtrudeGeometry(s, {
    depth: thick - bevel * 2,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  });
  g.translate(0, 0, -(thick - bevel * 2) / 2);
  return g;
}
